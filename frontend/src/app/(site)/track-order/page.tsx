"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Clock,
  Factory,
  Loader2,
  PackageCheck,
  PackageSearch,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const TIMELINE: { status: OrderStatus; icon: LucideIcon }[] = [
  { status: "PENDING", icon: Clock },
  { status: "CONFIRMED", icon: CheckCircle },
  { status: "IN_PRODUCTION", icon: Factory },
  { status: "SHIPPED", icon: Truck },
  { status: "DELIVERED", icon: PackageCheck },
];

function StatusTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = TIMELINE.findIndex((s) => s.status === status);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
      {TIMELINE.map((step, i) => {
        const meta = ORDER_STATUS_LABELS[step.status];
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.icon;
        const isLast = i === TIMELINE.length - 1;

        return (
          <li key={step.status} className="relative flex-1 sm:text-center">
            <div className="flex items-center gap-4 sm:flex-col sm:gap-0">
              {/* Node + connector */}
              <div className="relative flex flex-col items-center sm:w-full sm:flex-row sm:justify-center">
                {/* horizontal connector (sm+) */}
                {!isLast && (
                  <span
                    aria-hidden
                    className={`absolute left-1/2 top-1/2 hidden h-0.5 w-full -translate-y-1/2 sm:block ${
                      i < currentIndex ? "bg-gold-500" : "bg-ink-200"
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
                    isCompleted
                      ? "border-gold-500 bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 shadow-lg shadow-gold-500/30"
                      : isCurrent
                        ? "animate-pulse border-gold-500 bg-ink-950 text-gold-400 shadow-lg shadow-gold-500/40 ring-4 ring-gold-400/25"
                        : "border-ink-200 bg-white text-ink-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              {/* Labels */}
              <div className="py-3 sm:mt-3 sm:py-0">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? "text-gold-700"
                      : isCompleted
                        ? "text-ink-800"
                        : "text-ink-400"
                  }`}
                >
                  {meta.label}
                </p>
                <p
                  className={`font-bengali text-xs ${
                    isCompleted || isCurrent ? "text-ink-500" : "text-ink-300"
                  }`}
                >
                  {meta.labelBn}
                </p>
              </div>
            </div>

            {/* vertical connector (mobile) */}
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-6 top-12 h-[calc(100%-3rem)] w-0.5 -translate-x-1/2 sm:hidden ${
                  i < currentIndex ? "bg-gold-500" : "bg-ink-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("orderNumber") ?? ""
  );
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fromQuery = searchParams.get("orderNumber");
    if (fromQuery) setOrderNumber(fromQuery);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    try {
      const result = await apiFetch<Order>(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      setOrder(result);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const statusMeta = order ? ORDER_STATUS_LABELS[order.status] : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search form */}
      <div className="card mx-auto max-w-2xl p-6 sm:p-8">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div>
            <label htmlFor="orderNumber" className="label">
              Order Number{" "}
              <span className="font-bengali text-ink-400">— অর্ডার নম্বর</span>
            </label>
            <input
              id="orderNumber"
              type="text"
              required
              className="input font-mono"
              placeholder="NZ-20260706-XXXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="phone" className="label">
              Phone{" "}
              <span className="font-bengali text-ink-400">— ফোন নম্বর</span>
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              required
              className="input"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Track My Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Not found */}
      {notFound && (
        <div className="card mx-auto mt-8 max-w-2xl border-red-200 bg-red-50 p-8 text-center">
          <PackageSearch className="mx-auto h-10 w-10 text-red-400" />
          <h2 className="mt-3 font-display text-xl font-semibold text-red-800">
            Order not found
          </h2>
          <p className="mt-1 font-bengali text-sm text-red-600">
            অর্ডার খুঁজে পাওয়া যায়নি (নম্বর ও ফোন মিলিয়ে দেখুন)
          </p>
        </div>
      )}

      {/* Result */}
      {order && statusMeta && (
        <div className="mt-8 space-y-6">
          {/* Summary card */}
          <div className="card p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
                  Order
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-ink-950 sm:text-2xl">
                  {order.orderNumber}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  Placed on {formatDate(order.createdAt)} ·{" "}
                  {order.customerName}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.color}`}
                >
                  {statusMeta.label}
                  <span className="ml-1.5 font-bengali font-medium">
                    · {statusMeta.labelBn}
                  </span>
                </span>
                <p className="mt-2 font-display text-2xl font-bold text-ink-950">
                  {formatPrice(order.total)}
                </p>
                <p className="text-xs text-ink-400">
                  incl. {formatPrice(order.deliveryCharge)} delivery
                </p>
              </div>
            </div>
          </div>

          {/* Timeline or cancelled banner */}
          {order.status === "CANCELLED" ? (
            <div className="card flex items-center gap-4 border-red-200 bg-red-50 p-6">
              <XCircle className="h-10 w-10 shrink-0 text-red-500" />
              <div>
                <h3 className="font-display text-lg font-semibold text-red-800">
                  This order has been cancelled
                </h3>
                <p className="font-bengali text-sm text-red-600">
                  এই অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে আমাদের সাথে
                  যোগাযোগ করুন।
                </p>
              </div>
            </div>
          ) : (
            <div className="card p-6 sm:p-8">
              <h3 className="font-display text-lg font-semibold text-ink-900">
                Order Status
              </h3>
              <p className="font-bengali text-sm text-ink-400">
                অর্ডারের বর্তমান অবস্থা
              </p>
              <div className="mt-6">
                <StatusTimeline status={order.status} />
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold text-ink-900">
              Items ({order.items.length})
            </h3>
            <ul className="mt-4 divide-y divide-ink-100">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-ink-400">
                      {item.size ? `${item.size} · ` : ""}
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-ink-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-2 border-t border-ink-100 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-semibold text-ink-900">
                  {formatPrice(order.subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Delivery charge</dt>
                <dd className="font-semibold text-ink-900">
                  {formatPrice(order.deliveryCharge)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-ink-100 pt-2">
                <dt className="font-semibold text-ink-900">Total</dt>
                <dd className="font-display text-lg font-bold text-ink-950">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-ink-50/40">
      {/* Header band */}
      <section className="bg-ink-950 py-14 text-center sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
            Nameplate Zone
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Track Your <span className="gold-gradient-text">Order</span>
          </h1>
          <p className="mt-3 font-bengali text-lg text-ink-300">
            অর্ডার ট্র্যাক করুন
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>
      </section>

      <Suspense
        fallback={
          <div className="py-24 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-ink-200 border-t-gold-500" />
          </div>
        }
      >
        <TrackOrderContent />
      </Suspense>
    </div>
  );
}
