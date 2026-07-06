"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Minus, Plus, ShoppingCart, ArrowRight, Ban } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";

/* ------------------------------------------------------------------ */
/* Small client gallery used on the product details page               */
/* ------------------------------------------------------------------ */

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const safeImages = images.length > 0 ? images : ["/products/house-classic.svg"];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-950 p-6 sm:p-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={safeImages[active]}
          alt={alt}
          className="aspect-[4/3] w-full object-contain"
        />
      </div>
      {safeImages.length > 1 && (
        <div className="thin-scroll mt-4 flex gap-3 overflow-x-auto pb-1">
          {safeImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`shrink-0 overflow-hidden rounded-xl border-2 bg-ink-950 p-2 transition ${
                i === active
                  ? "border-gold-400 shadow-md shadow-gold-500/20"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${alt} thumbnail ${i + 1}`}
                className="h-16 w-20 object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Size selector + quantity + add-to-cart                              */
/* ------------------------------------------------------------------ */

export default function AddToCart({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);

  const hasSizes = product.sizes.length > 0;
  const basePrice = product.discountPrice ?? product.price;

  const [selectedSize, setSelectedSize] = useState<string>(
    hasSizes ? product.sizes[0].label : "Standard"
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const unitPrice = useMemo(() => {
    if (!hasSizes) return basePrice;
    const size = product.sizes.find((s) => s.label === selectedSize);
    return size ? size.price : basePrice;
  }, [hasSizes, basePrice, product.sizes, selectedSize]);

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
      quantity
    );
    setJustAdded(true);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="mt-8 space-y-6 border-t border-ink-100 pt-6">
      {/* Size selector */}
      {hasSizes && (
        <div>
          <p className="label">
            Select Size{" "}
            <span className="font-bengali font-normal text-ink-400">
              সাইজ বেছে নিন
            </span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((size) => {
              const isActive = size.label === selectedSize;
              return (
                <button
                  key={size.label}
                  type="button"
                  onClick={() => setSelectedSize(size.label)}
                  className={`rounded-xl border-2 px-4 py-2.5 text-left transition ${
                    isActive
                      ? "border-gold-500 bg-gold-50 shadow-sm"
                      : "border-ink-200 bg-white hover:border-gold-300"
                  }`}
                >
                  <span
                    className={`block text-sm font-semibold ${
                      isActive ? "text-ink-900" : "text-ink-700"
                    }`}
                  >
                    {size.label}
                  </span>
                  <span
                    className={`block text-xs font-medium ${
                      isActive ? "text-gold-700" : "text-ink-400"
                    }`}
                  >
                    {formatPrice(size.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="label">
          Quantity{" "}
          <span className="font-bengali font-normal text-ink-400">পরিমাণ</span>
        </p>
        <div className="inline-flex items-center rounded-xl border border-ink-200 bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center rounded-l-xl text-ink-600 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:text-ink-300"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-base font-semibold text-ink-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center rounded-r-xl text-ink-600 transition hover:bg-ink-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Total + CTA */}
      <div className="rounded-2xl bg-ink-950 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-400">
              Total <span className="font-bengali">মোট</span>
            </p>
            <p className="mt-0.5 text-2xl font-bold text-gold-400">
              {formatPrice(unitPrice * quantity)}
            </p>
            <p className="text-xs text-ink-500">
              {formatPrice(unitPrice)} × {quantity}
              {hasSizes ? ` · ${selectedSize}` : ""}
            </p>
          </div>
          {product.inStock ? (
            <button type="button" onClick={handleAdd} className="btn-gold">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-ink-800 px-6 py-3 font-semibold text-ink-400">
              <Ban className="h-5 w-5" />
              Out of Stock
            </span>
          )}
        </div>

        {justAdded && (
          <Link
            href="/cart"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-gold-500/30 bg-ink-900 py-2.5 text-sm font-semibold text-gold-300 transition hover:bg-ink-800"
          >
            View Cart <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {!product.inStock && (
        <p className="font-bengali text-sm text-red-500">
          এই পণ্যটি এখন স্টকে নেই — কাস্টম ডিজাইন অর্ডার করতে পারেন।
        </p>
      )}
    </div>
  );
}
