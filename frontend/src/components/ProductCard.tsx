import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-950 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0] ?? "/products/house-classic.svg"}
          alt={product.name}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-ink-950">
            -{Math.round((1 - product.discountPrice! / product.price) * 100)}%
          </span>
        )}
        {product.featured && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-ink-900/80 px-2.5 py-1 text-xs font-semibold text-gold-300 backdrop-blur">
            <Star className="h-3 w-3 fill-gold-400 text-gold-400" /> Featured
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-gold-600">
          {product.category?.name}
        </p>
        <h3 className="mt-1 line-clamp-1 font-display text-lg font-semibold text-ink-900 group-hover:text-gold-700">
          {product.name}
        </h3>
        {product.nameBn && (
          <p className="line-clamp-1 font-bengali text-sm text-ink-500">{product.nameBn}</p>
        )}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-ink-900">{formatPrice(displayPrice)}</span>
          {hasDiscount && (
            <span className="text-sm text-ink-400 line-through">{formatPrice(product.price)}</span>
          )}
          <span className="ml-auto text-xs text-ink-400">from</span>
        </div>
      </div>
    </Link>
  );
}
