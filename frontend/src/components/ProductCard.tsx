import Link from "next/link";
import { Star, Zap } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { imgUrl, imgSrcSet } from "@/lib/image";

const isPhoto = (src: string) => !/\.svg(\?|$)/i.test(src);

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const img = product.images[0] ?? "/products/house-classic.svg";
  const photo = isPhoto(img);
  const sizes = product.sizes?.length ?? 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm ring-1 ring-transparent transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/15 hover:ring-gold-300"
    >
      <div className={`relative aspect-[4/3] overflow-hidden ${photo ? "bg-ink-100" : "bg-ink-950 p-4"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgUrl(img, 600)}
          srcSet={imgSrcSet(img, [400, 600, 900])}
          sizes="(min-width: 1024px) 25vw, 50vw"
          alt={product.nameBn || product.name}
          loading="lazy"
          decoding="async"
          className={`h-full w-full transition duration-500 group-hover:scale-105 ${photo ? "object-cover" : "object-contain"}`}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow">
            -{Math.round((1 - product.discountPrice! / product.price) * 100)}%
          </span>
        )}
        {product.featured && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gold-700 shadow backdrop-blur">
            <Star className="h-3 w-3 fill-gold-500 text-gold-500" /> জনপ্রিয়
          </span>
        )}
        {sizes > 1 && (
          <span className="absolute bottom-2.5 left-3 rounded-md bg-black/55 px-2 py-0.5 font-bengali text-[11px] font-medium text-white backdrop-blur">
            {sizes}টি সাইজ
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="font-bengali text-xs font-medium text-gold-700">
          {product.category?.nameBn || product.category?.name}
        </p>
        <h3 className="mt-1 line-clamp-2 font-bengali text-base font-semibold leading-snug text-ink-900 group-hover:text-gold-700">
          {product.nameBn || product.name}
        </h3>
        {product.nameBn && (
          <p className="mt-0.5 line-clamp-1 text-xs text-ink-400">{product.name}</p>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-bengali text-xs text-ink-500">শুরু</span>
          <span className="text-xl font-bold text-ink-950">{formatPrice(displayPrice)}</span>
          {hasDiscount && (
            <span className="text-sm text-ink-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        {product.orderNow !== false && product.inStock ? (
          <span className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 py-2.5 font-bengali text-sm font-bold text-ink-950 shadow-md shadow-gold-500/20 transition group-hover:brightness-110">
            <Zap className="h-4 w-4" /> এখনই কিনুন
          </span>
        ) : (
          <span className="mt-3 flex items-center justify-center rounded-xl border border-ink-200 py-2.5 font-bengali text-sm font-semibold text-ink-600">
            বিস্তারিত দেখুন
          </span>
        )}
      </div>
    </Link>
  );
}
