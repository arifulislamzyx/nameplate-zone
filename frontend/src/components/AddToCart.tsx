"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  Ban,
  Zap,
  Check,
  Banknote,
  Truck,
  Expand,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";
import OrderNowModal from "./OrderNowModal";

const isPhoto = (src: string) => !/\.svg(\?|$)/i.test(src);

/* ------------------------------------------------------------------ */
/* Gallery used on the product details page                            */
/* ------------------------------------------------------------------ */

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const safeImages = images.length > 0 ? images : ["/products/house-classic.svg"];
  const [active, setActive] = useState(0);
  const current = safeImages[active];
  const photo = isPhoto(current);

  return (
    <div className="lg:sticky lg:top-24">
      <a
        href={current}
        target="_blank"
        rel="noreferrer"
        className={`group relative block overflow-hidden rounded-3xl shadow-xl ring-1 ring-cream-200 ${
          photo ? "bg-ink-100" : "bg-ink-950 p-8"
        }`}
        aria-label="বড় করে দেখুন"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={alt}
          className="aspect-[4/3] w-full object-contain transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 font-bengali text-xs font-medium text-white backdrop-blur transition group-hover:bg-black/75">
          <Expand className="h-3.5 w-3.5" /> বড় করে দেখুন
        </span>
      </a>
      {safeImages.length > 1 && (
        <div className="thin-scroll mt-4 flex gap-3 overflow-x-auto pb-1">
          {safeImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`ছবি ${i + 1}`}
              className={`shrink-0 overflow-hidden rounded-xl border-2 bg-ink-100 transition ${
                i === active
                  ? "border-gold-500 shadow-md shadow-gold-500/25"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-16 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Size selector + quantity + Buy Now / Add to cart                    */
/* ------------------------------------------------------------------ */

export default function AddToCart({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);

  const hasSizes = product.sizes.length > 0;
  const basePrice = product.discountPrice ?? product.price;
  const canBuyNow = product.orderNow !== false && product.inStock;

  const [selectedSize, setSelectedSize] = useState<string>(
    hasSizes ? product.sizes[0].label : "Standard",
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  const unitPrice = useMemo(() => {
    if (!hasSizes) return basePrice;
    const size = product.sizes.find((s) => s.label === selectedSize);
    return size ? size.price : basePrice;
  }, [hasSizes, basePrice, product.sizes, selectedSize]);

  const total = unitPrice * quantity;

  const handleAdd = () => {
    if (!product.inStock) return;
    addItem(
      {
        key: `${product.id}::${selectedSize}`,
        productId: product.id,
        name: product.name,
        nameBn: product.nameBn ?? null,
        image: product.images[0] ?? null,
        price: unitPrice,
        size: selectedSize,
        isCustom: false,
      },
      quantity,
    );
    setJustAdded(true);
    toast.success("কার্টে যোগ হয়েছে");
  };

  return (
    <div className="mt-6 space-y-5">
      {/* Live price */}
      <div className="flex flex-wrap items-end gap-3">
        <span className="text-4xl font-bold text-ink-950">{formatPrice(unitPrice)}</span>
        {product.discountPrice != null && product.discountPrice < product.price && !hasSizes && (
          <span className="pb-1 text-lg text-ink-400 line-through">{formatPrice(product.price)}</span>
        )}
        {hasSizes && (
          <span className="pb-1.5 font-bengali text-sm text-ink-500">{selectedSize} সাইজের দাম</span>
        )}
      </div>

      {/* Size selector */}
      {hasSizes && (
        <div>
          <p className="mb-2 font-bengali text-sm font-semibold text-ink-800">সাইজ বেছে নিন</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {product.sizes.map((size) => {
              const isActive = size.label === selectedSize;
              return (
                <button
                  key={size.label}
                  type="button"
                  onClick={() => setSelectedSize(size.label)}
                  aria-pressed={isActive}
                  className={`relative rounded-2xl border-2 px-4 py-3 text-left transition ${
                    isActive
                      ? "border-gold-500 bg-gold-50 shadow-md shadow-gold-500/15"
                      : "border-ink-200 bg-white hover:border-gold-300"
                  }`}
                >
                  {isActive && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                  <span className="block text-base font-bold text-ink-900">{size.label}</span>
                  <span className={`block text-sm font-semibold ${isActive ? "text-gold-700" : "text-ink-500"}`}>
                    {formatPrice(size.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <p className="font-bengali text-sm font-semibold text-ink-800">পরিমাণ</p>
        <div className="inline-flex items-center rounded-xl border border-ink-200 bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="কমান"
            className="flex h-11 w-11 items-center justify-center rounded-l-xl text-ink-600 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:text-ink-300"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-base font-semibold text-ink-900">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="বাড়ান"
            className="flex h-11 w-11 items-center justify-center rounded-r-xl text-ink-600 transition hover:bg-ink-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {quantity > 1 && (
          <p className="font-bengali text-sm text-ink-600">
            মোট: <span className="font-bold text-ink-950">{formatPrice(total)}</span>
          </p>
        )}
      </div>

      {/* CTAs */}
      {product.inStock ? (
        <div className="space-y-3">
          {canBuyNow && (
            <button
              type="button"
              onClick={() => setOrderOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 py-4 font-bengali text-lg font-bold text-ink-950 shadow-lg shadow-gold-500/30 transition hover:brightness-110 active:scale-[0.99]"
            >
              <Zap className="h-5 w-5" /> এখনই কিনুন · {formatPrice(total)}
            </button>
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink-900 bg-white py-3.5 font-bengali text-base font-semibold text-ink-900 transition hover:bg-ink-900 hover:text-gold-300"
          >
            <ShoppingCart className="h-5 w-5" /> কার্টে যোগ করুন
          </button>
          {justAdded && (
            <Link
              href="/cart"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 font-bengali text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
            >
              <Check className="h-4 w-4" /> কার্টে যোগ হয়েছে · কার্ট দেখুন <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-200">
          <p className="flex items-center gap-2 font-bengali font-semibold text-red-700">
            <Ban className="h-5 w-5" /> এই পণ্যটি এখন স্টকে নেই
          </p>
          <p className="mt-1 font-bengali text-sm text-red-600">কাস্টম ডিজাইন অর্ডার করতে পারেন।</p>
        </div>
      )}

      {/* Mini trust */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-100">
          <Banknote className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="font-bengali text-xs leading-snug text-emerald-900">
            <span className="block font-semibold">ক্যাশ অন ডেলিভারি</span>
            হাতে পেয়ে টাকা দিন
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-cream-100 px-3 py-2.5 ring-1 ring-cream-200">
          <Truck className="h-5 w-5 shrink-0 text-gold-700" />
          <p className="font-bengali text-xs leading-snug text-ink-800">
            <span className="block font-semibold">সারা দেশে ডেলিভারি</span>
            ঢাকা ৳৮০ · বাইরে ৳১৫০
          </p>
        </div>
      </div>

      {/* Mobile sticky buy bar */}
      {canBuyNow && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-xl items-center gap-3">
              <div className="min-w-0">
                <p className="font-bengali text-[11px] text-ink-500">{hasSizes ? selectedSize : "মোট"}</p>
                <p className="text-xl font-bold leading-tight text-ink-950">{formatPrice(total)}</p>
              </div>
              <button
                type="button"
                onClick={() => setOrderOpen(true)}
                className="ml-auto flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 py-3.5 font-bengali text-base font-bold text-ink-950 shadow-md shadow-gold-500/30 active:scale-[0.99]"
              >
                <Zap className="h-5 w-5" /> এখনই কিনুন
              </button>
            </div>
          </div>
        </>
      )}

      {product.orderNow !== false && (
        <OrderNowModal
          open={orderOpen}
          onClose={() => setOrderOpen(false)}
          product={product}
          size={selectedSize}
          unitPrice={unitPrice}
          quantity={quantity}
        />
      )}
    </div>
  );
}
