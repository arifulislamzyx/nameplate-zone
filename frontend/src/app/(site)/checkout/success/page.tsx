"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Copy, PhoneCall, Search, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const totalParam = Number(searchParams.get("total"));
  const total = Number.isFinite(totalParam) && totalParam > 0 ? totalParam : null;
  const [copied, setCopied] = useState(false);

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast.success("Order number copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — please copy manually");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="card p-8 text-center sm:p-12">
        {/* Animated check */}
        <div className="relative mx-auto h-20 w-20">
          <span className="absolute inset-0 animate-ping rounded-full bg-green-400/30" />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-b from-green-400 to-green-600 shadow-lg shadow-green-500/30">
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
          </span>
        </div>

        <h1 className="mt-8 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
          Order Placed Successfully!
        </h1>
        <p className="mt-2 font-bengali text-lg text-ink-500">
          অর্ডার সফল হয়েছে!
        </p>

        {orderNumber ? (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-gold-200 bg-gold-50 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
              Your Order Number
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <p className="font-mono text-2xl font-bold tracking-wide text-ink-950 sm:text-3xl">
                {orderNumber}
              </p>
              <button
                type="button"
                onClick={copyOrderNumber}
                aria-label="Copy order number"
                className="rounded-lg border border-gold-300 bg-white p-2 text-gold-700 transition hover:bg-gold-100"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            {total !== null && (
              <p className="mt-2 text-sm text-ink-600">
                Total payable on delivery:{" "}
                <span className="font-bold text-ink-900">
                  {formatPrice(total)}
                </span>
              </p>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-500">
            Your order has been received.
          </p>
        )}

        <p className="mx-auto mt-6 flex max-w-md items-start justify-center gap-2 text-sm text-ink-500">
          <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
          <span className="font-bengali">
            আমাদের টিম শীঘ্রই কনফার্মেশনের জন্য কল করবে। অর্ডার নম্বরটি
            সংরক্ষণ করুন।
          </span>
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={
              orderNumber
                ? `/track-order?orderNumber=${encodeURIComponent(orderNumber)}`
                : "/track-order"
            }
            className="btn-gold"
          >
            <Search className="h-4 w-4" />
            Track Order
          </Link>
          <Link href="/products" className="btn-dark">
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-ink-50/40">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-4 py-24 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-ink-200 border-t-gold-500" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
