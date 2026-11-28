"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, X, Zap } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Order, Product } from "@/lib/types";

const DELIVERY_OPTIONS = [
  { value: 80, label: "Inside Dhaka", labelBn: "ঢাকার ভিতরে" },
  { value: 150, label: "Outside Dhaka", labelBn: "ঢাকার বাইরে" },
] as const;

type Errors = Partial<Record<"customerName" | "phone" | "address", string>>;

export default function OrderNowModal({
  open,
  onClose,
  product,
  size,
  unitPrice,
  quantity,
}: {
  open: boolean;
  onClose: () => void;
  product: Product;
  size: string;
  unitPrice: number;
  quantity: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ customerName: "", phone: "", address: "" });
  const [deliveryCharge, setDeliveryCharge] = useState<number>(80);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, submitting]);

  if (!open) return null;

  const subtotal = unitPrice * quantity;
  const total = subtotal + deliveryCharge;

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: Errors = {};
    if (form.customerName.trim().length < 2)
      next.customerName = "আপনার নাম লিখুন";
    const phone = form.phone.replace(/[\s-]/g, "");
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone))
      next.phone = "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)";
    if (form.address.trim().length < 5)
      next.address = "পূর্ণ ঠিকানা লিখুন";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await apiFetch<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          phone: form.phone.replace(/[\s-]/g, ""),
          address: form.address.trim(),
          deliveryCharge,
          note: "Buy Now (quick order)",
          items: [
            {
              productId: product.id,
              name: product.name,
              price: unitPrice,
              quantity,
              size,
            },
          ],
        }),
      });
      toast.success("অর্ডার সফল হয়েছে!");
      router.push(
        `/checkout/success?orderNumber=${encodeURIComponent(order.orderNumber)}&total=${order.total}`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order failed. Please try again.");
      setSubmitting(false);
    }
  };

  const errClass = (k: keyof Errors) =>
    errors[k] ? "border-red-400 focus:border-red-500 focus:ring-red-300/30" : "";

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-now-title"
        className="relative flex max-h-[95vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between bg-ink-950 px-5 py-4">
          <div>
            <h2 id="order-now-title" className="font-display text-lg font-semibold text-gold-300">
              Buy Now <span className="font-bengali text-sm text-ink-300">· এখনই কিনুন</span>
            </h2>
            <p className="line-clamp-1 text-xs text-ink-400">
              {product.name} · {size} × {quantity}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-300 transition hover:bg-ink-800 hover:text-gold-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="thin-scroll space-y-4 overflow-y-auto p-5" noValidate>
          <div>
            <label htmlFor="on-name" className="label">
              Name <span className="text-red-500">*</span>{" "}
              <span className="font-bengali font-normal text-ink-400">নাম</span>
            </label>
            <input
              id="on-name"
              autoFocus
              autoComplete="name"
              className={`input ${errClass("customerName")}`}
              value={form.customerName}
              onChange={(e) => setField("customerName", e.target.value)}
              placeholder="আপনার নাম"
            />
            {errors.customerName && <p className="mt-1 text-xs text-red-600">{errors.customerName}</p>}
          </div>

          <div>
            <label htmlFor="on-phone" className="label">
              Phone <span className="text-red-500">*</span>{" "}
              <span className="font-bengali font-normal text-ink-400">মোবাইল</span>
            </label>
            <input
              id="on-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={`input ${errClass("phone")}`}
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="01XXXXXXXXX"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="on-address" className="label">
              Address <span className="text-red-500">*</span>{" "}
              <span className="font-bengali font-normal text-ink-400">ঠিকানা</span>
            </label>
            <textarea
              id="on-address"
              autoComplete="street-address"
              className={`input min-h-[80px] ${errClass("address")}`}
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="বাসা, রোড, এলাকা, জেলা"
            />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DELIVERY_OPTIONS.map((opt) => {
              const selected = deliveryCharge === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDeliveryCharge(opt.value)}
                  className={`rounded-xl border-2 px-3 py-2 text-left transition ${
                    selected ? "border-gold-500 bg-gold-50" : "border-ink-200 hover:border-gold-300"
                  }`}
                >
                  <span className="block text-sm font-semibold text-ink-800">{opt.label}</span>
                  <span className="block font-bengali text-xs text-ink-500">
                    {opt.labelBn} · {formatPrice(opt.value)}
                  </span>
                </button>
              );
            })}
          </div>

          <dl className="space-y-1 rounded-xl bg-ink-50 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-medium text-ink-800">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Delivery</dt>
              <dd className="font-medium text-ink-800">{formatPrice(deliveryCharge)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-1.5 text-base">
              <dt className="font-semibold text-ink-900">Total</dt>
              <dd className="font-bold text-gold-700">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button type="submit" disabled={submitting} className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
            {submitting ? "Placing order…" : "Confirm Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
