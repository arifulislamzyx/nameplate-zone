import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Check,
  ChevronRight,
  Layers,
  Shapes,
  Sparkles,
  Truck,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import AddToCart, { ProductGallery } from "@/components/AddToCart";

export const dynamic = "force-dynamic";

interface ProductResponse {
  product: Product;
  related: Product[];
}

async function getProduct(slug: string): Promise<ProductResponse | null> {
  try {
    return await apiFetch<ProductResponse>(
      `/api/products/${encodeURIComponent(slug)}`
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getProduct(params.slug);
  if (!data) {
    return { title: "Product Not Found | Nameplate Zone" };
  }
  const { product } = data;
  return {
    title: `${product.name} | Nameplate Zone`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getProduct(params.slug);
  if (!data) notFound();

  const { product, related } = data;
  const hasDiscount =
    product.discountPrice != null && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-ink-400"
        >
          <Link href="/" className="transition hover:text-gold-600">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="transition hover:text-gold-600">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/products?category=${product.category.slug}`}
                className="transition hover:text-gold-600"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-ink-700">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left: gallery */}
          <div>
            <ProductGallery images={product.images} alt={product.name} />
          </div>

          {/* Right: details */}
          <div>
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-700 transition hover:bg-gold-100"
              >
                <Sparkles className="h-3 w-3" />
                {product.category.name}
              </Link>
            )}

            <h1 className="mt-3 font-display text-3xl font-bold text-ink-950 sm:text-4xl">
              {product.name}
            </h1>
            {product.nameBn && (
              <p className="mt-1 font-bengali text-lg text-ink-500">
                {product.nameBn}
              </p>
            )}

            {/* Price block */}
            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-ink-950">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-ink-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-ink-950">
                    {Math.round(
                      (1 - product.discountPrice! / product.price) * 100
                    )}
                    % OFF
                  </span>
                </>
              )}
              {product.sizes.length > 0 && (
                <span className="text-sm text-ink-400">starting price</span>
              )}
            </div>

            {/* Info chips */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-sm font-medium text-ink-700">
                <Layers className="h-4 w-4 text-gold-600" />
                {product.material}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-sm font-medium text-ink-700">
                <Shapes className="h-4 w-4 text-gold-600" />
                {product.shape}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                  product.inStock
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                <Truck className="h-4 w-4" />
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            <p className="mt-6 leading-relaxed text-ink-600">
              {product.description}
            </p>
            {product.descriptionBn && (
              <p className="mt-3 font-bengali leading-relaxed text-ink-500">
                {product.descriptionBn}
              </p>
            )}

            {/* Features */}
            {product.features.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-100">
                      <Check className="h-3 w-3 text-gold-700" />
                    </span>
                    <span className="text-sm text-ink-700">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <AddToCart product={product} />

            {/* Custom design callout */}
            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-gold-200 bg-gradient-to-r from-gold-50 to-white p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-lg font-semibold text-ink-900">
                  Want a fully custom design?
                </p>
                <p className="font-bengali text-sm text-ink-500">
                  নিজের মতো করে ডিজাইন করুন — নাম, ফন্ট, সাইজ সবকিছু আপনার পছন্দে।
                </p>
              </div>
              <Link href="/customize" className="btn-dark shrink-0">
                <Sparkles className="h-4 w-4" />
                Customize Now
              </Link>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-20">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-bold text-ink-950">
                You May Also <span className="gold-gradient-text">Like</span>
              </h2>
              <p className="mt-1 font-bengali text-ink-400">
                আরও কিছু নেমপ্লেট দেখুন
              </p>
              <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
