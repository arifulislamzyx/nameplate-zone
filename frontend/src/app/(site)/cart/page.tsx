"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCart, cartTotal } from "@/store/cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, setQuantity } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = cartTotal(items);

  return (
    <div className="min-h-screen bg-ink-50/40">
      {/* Header band */}
      <section className="bg-ink-950 py-14 text-center sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
            Nameplate Zone
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Your <span className="gold-gradient-text">Cart</span>
          </h1>
          <p className="mt-3 font-bengali text-lg text-ink-300">আপনার কার্ট</p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!mounted ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-ink-200 border-t-gold-500" />
            <p className="mt-4 text-sm text-ink-500">Loading your cart…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-100">
              <ShoppingCart className="h-8 w-8 text-ink-400" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-ink-900">
              Your cart is empty
            </h2>
            <p className="mt-1 font-bengali text-base text-ink-400">
              কার্ট খালি
            </p>
            <p className="mt-3 text-sm text-ink-500">
              Browse our collection or design your own premium nameplate.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/products" className="btn-gold">
                <ShoppingBag className="h-4 w-4" />
                Browse Nameplates
              </Link>
              <Link href="/customize" className="btn-dark">
                <Sparkles className="h-4 w-4" />
                Design Your Own
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Item list */}
            <div className="lg:col-span-2">
              <div className="card divide-y divide-ink-100">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                  >
                    {/* Thumb */}
                    <div className="shrink-0">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-24 w-32 rounded-lg bg-ink-950 object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-24 w-32 items-center justify-center rounded-lg bg-ink-950 p-1">
                          <ShoppingBag className="h-8 w-8 text-gold-500/60" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-semibold text-ink-900">
                          {item.name}
                        </h3>
                        {item.isCustom && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-gold-800">
                            <Sparkles className="h-3 w-3" />
                            Custom Design
                          </span>
                        )}
                      </div>
                      {item.nameBn && (
                        <p className="font-bengali text-sm text-ink-500">
                          {item.nameBn}
                        </p>
                      )}
                      {item.size && (
                        <p className="mt-1 text-sm text-ink-500">
                          Size:{" "}
                          <span className="font-medium text-ink-700">
                            {item.size}
                          </span>
                        </p>
                      )}
                      <p className="mt-1 text-sm text-ink-500">
                        {formatPrice(item.price)}{" "}
                        <span className="text-ink-400">/ each</span>
                      </p>
                    </div>

                    {/* Quantity + total + remove */}
                    <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                      <div className="inline-flex items-center rounded-lg border border-ink-200 bg-white">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            setQuantity(item.key, item.quantity - 1)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-l-lg text-ink-600 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:text-ink-300"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-ink-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            setQuantity(item.key, item.quantity + 1)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-r-lg text-ink-600 transition hover:bg-ink-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 sm:mt-2">
                        <p className="text-base font-bold text-ink-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => {
                            removeItem(item.key);
                            toast.success("Removed from cart");
                          }}
                          className="rounded-lg p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="card sticky top-24 p-6">
                <h2 className="font-display text-xl font-semibold text-ink-900">
                  Order Summary
                </h2>
                <p className="font-bengali text-sm text-ink-400">
                  অর্ডার সারাংশ
                </p>

                <dl className="mt-5 space-y-3 border-t border-ink-100 pt-5">
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-ink-500">
                      Subtotal ({items.length}{" "}
                      {items.length === 1 ? "item" : "items"})
                    </dt>
                    <dd className="font-semibold text-ink-900">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-ink-500">Delivery</dt>
                    <dd className="font-bengali text-xs text-ink-400">
                      ডেলিভারি চার্জ চেকআউটে যোগ হবে
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
                  <span className="font-semibold text-ink-900">Total</span>
                  <span className="font-display text-2xl font-bold text-ink-950">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <Link href="/checkout" className="btn-gold mt-6 w-full">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products"
                  className="mt-4 block text-center text-sm font-medium text-ink-500 transition hover:text-gold-700"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
