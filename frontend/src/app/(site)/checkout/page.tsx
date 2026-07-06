"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Banknote,
  Loader2,
  PhoneCall,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useCart, cartTotal } from "@/store/cart";

const DELIVERY_OPTIONS = [
  {
    value: 80,
    label: "Inside Dhaka",
    labelBn: "ঢাকার ভিতরে",
  },
  {
    value: 150,
    label: "Outside Dhaka",
    labelBn: "ঢাকার বাইরে",
  },
] as const;

interface FormState {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  note: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deliveryCharge, setDeliveryCharge] = useState<number>(80);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = cartTotal(items);
  const total = subtotal + deliveryCharge;

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.customerName.trim()) {
      next.customerName = "Please enter your full name — নাম লিখুন";
    }
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!form.phone.trim()) {
      next.phone = "Please enter your phone number — ফোন নম্বর লিখুন";
    } else if (phoneDigits.length < 10) {
      next.phone = "Phone number must be at least 10 digits — সঠিক নম্বর দিন";
    }
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Please enter a valid email address";
    }
    if (!form.address.trim()) {
      next.address = "Please enter your full address — ঠিকানা লিখুন";
    }
    if (!form.city.trim()) {
      next.city = "Please enter your city or district — জেলা লিখুন";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSubmitting(true);
    try {
      const order = await apiFetch<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          address: form.address.trim(),
          city: form.city.trim(),
          note: form.note.trim() || undefined,
          deliveryCharge,
          items: items.map((item) => ({
            productId: item.productId,
            designId: item.designId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            customization: item.customization,
          })),
        }),
      });
      clear();
      router.push(
        `/checkout/success?orderNumber=${encodeURIComponent(order.orderNumber)}&total=${order.total}`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to place order. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50/40">
      {/* Header band */}
      <section className="bg-ink-950 py-14 text-center sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
            Nameplate Zone
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            <span className="gold-gradient-text">Checkout</span>
          </h1>
          <p className="mt-3 font-bengali text-lg text-ink-300">
            অর্ডার সম্পন্ন করুন
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {!mounted ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-ink-200 border-t-gold-500" />
            <p className="mt-4 text-sm text-ink-500">Preparing checkout…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-100">
              <ShoppingBag className="h-8 w-8 text-ink-400" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-ink-900">
              Nothing to checkout
            </h2>
            <p className="mt-1 font-bengali text-base text-ink-400">
              আপনার কার্ট খালি
            </p>
            <p className="mt-3 text-sm text-ink-500">
              Add a nameplate to your cart before checking out.
            </p>
            <Link href="/products" className="btn-gold mt-6">
              Browse Nameplates
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid grid-cols-1 gap-8 lg:grid-cols-5"
          >
            {/* Left: details */}
            <div className="space-y-6 lg:col-span-3">
              {/* Delivery details */}
              <div className="card p-6">
                <h2 className="font-display text-xl font-semibold text-ink-900">
                  Delivery Details
                </h2>
                <p className="font-bengali text-sm text-ink-400">
                  ডেলিভারির তথ্য
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="customerName" className="label">
                      Full Name <span className="text-red-500">*</span>{" "}
                      <span className="font-bengali text-ink-400">
                        — পুরো নাম
                      </span>
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      className={`input ${errors.customerName ? "border-red-400 focus:border-red-500 focus:ring-red-300/30" : ""}`}
                      placeholder="e.g. Rahim Uddin"
                      value={form.customerName}
                      onChange={(e) => setField("customerName", e.target.value)}
                    />
                    {errors.customerName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.customerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="label">
                      Phone <span className="text-red-500">*</span>{" "}
                      <span className="font-bengali text-ink-400">— ফোন</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      className={`input ${errors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-300/30" : ""}`}
                      placeholder="01XXXXXXXXX"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="label">
                      Email{" "}
                      <span className="text-ink-400">(optional)</span>{" "}
                      <span className="font-bengali text-ink-400">— ইমেইল</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`input ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-300/30" : ""}`}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="label">
                      Full Address <span className="text-red-500">*</span>{" "}
                      <span className="font-bengali text-ink-400">
                        — সম্পূর্ণ ঠিকানা
                      </span>
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      className={`input resize-none ${errors.address ? "border-red-400 focus:border-red-500 focus:ring-red-300/30" : ""}`}
                      placeholder="House, road, area…"
                      value={form.address}
                      onChange={(e) => setField("address", e.target.value)}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="city" className="label">
                      City / District <span className="text-red-500">*</span>{" "}
                      <span className="font-bengali text-ink-400">— জেলা</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      className={`input ${errors.city ? "border-red-400 focus:border-red-500 focus:ring-red-300/30" : ""}`}
                      placeholder="e.g. Dhaka"
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="note" className="label">
                      Order Note{" "}
                      <span className="text-ink-400">(optional)</span>{" "}
                      <span className="font-bengali text-ink-400">— নোট</span>
                    </label>
                    <textarea
                      id="note"
                      rows={1}
                      className="input resize-none"
                      placeholder="Anything we should know?"
                      value={form.note}
                      onChange={(e) => setField("note", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery option */}
              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
                  <Truck className="h-5 w-5 text-gold-600" />
                  Delivery Option
                </h2>
                <p className="font-bengali text-sm text-ink-400">
                  ডেলিভারি এলাকা বাছাই করুন
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {DELIVERY_OPTIONS.map((opt) => {
                    const selected = deliveryCharge === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 transition ${
                          selected
                            ? "border-gold-500 bg-gold-50"
                            : "border-ink-200 bg-white hover:border-gold-300"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="delivery"
                            className="h-4 w-4 accent-gold-500"
                            checked={selected}
                            onChange={() => setDeliveryCharge(opt.value)}
                          />
                          <span>
                            <span className="block text-sm font-semibold text-ink-900">
                              {opt.label}
                            </span>
                            <span className="block font-bengali text-xs text-ink-500">
                              {opt.labelBn}
                            </span>
                          </span>
                        </span>
                        <span className="text-sm font-bold text-ink-900">
                          {formatPrice(opt.value)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Payment */}
              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
                  <Banknote className="h-5 w-5 text-gold-600" />
                  Payment Method
                </h2>
                <div className="mt-4 rounded-xl border-2 border-gold-500 bg-gold-50 px-4 py-3.5">
                  <p className="text-sm font-semibold text-ink-900">
                    Cash on Delivery{" "}
                    <span className="font-bengali font-medium text-ink-600">
                      — ক্যাশ অন ডেলিভারি
                    </span>
                  </p>
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-500">
                    <PhoneCall className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
                    <span>
                      Pay when your nameplate arrives. Our team will call you to
                      confirm the order.{" "}
                      <span className="font-bengali">
                        আমাদের টিম কনফার্মেশনের জন্য কল করবে।
                      </span>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: summary */}
            <div className="lg:col-span-2">
              <div className="card sticky top-24 p-6">
                <h2 className="font-display text-xl font-semibold text-ink-900">
                  Order Summary
                </h2>
                <p className="font-bengali text-sm text-ink-400">
                  অর্ডার সারাংশ
                </p>

                <ul className="mt-5 space-y-3 border-t border-ink-100 pt-5">
                  {items.map((item) => (
                    <li key={item.key} className="flex items-center gap-3">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-16 shrink-0 rounded-md bg-ink-950 object-contain p-0.5"
                        />
                      ) : (
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-ink-950">
                          <ShoppingBag className="h-5 w-5 text-gold-500/60" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-800">
                          {item.name}
                        </p>
                        <p className="text-xs text-ink-400">
                          {item.size ? `${item.size} · ` : ""}Qty{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-ink-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <dl className="mt-5 space-y-2.5 border-t border-ink-100 pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Subtotal</dt>
                    <dd className="font-semibold text-ink-900">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Delivery charge</dt>
                    <dd className="font-semibold text-ink-900">
                      {formatPrice(deliveryCharge)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
                  <span className="font-semibold text-ink-900">Total</span>
                  <span className="font-display text-2xl font-bold text-ink-950">
                    {formatPrice(total)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>Place Order — {formatPrice(total)}</>
                  )}
                </button>
                <p className="mt-3 text-center font-bengali text-xs text-ink-400">
                  অর্ডার করলেই আমাদের টিম আপনাকে কল করবে
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
