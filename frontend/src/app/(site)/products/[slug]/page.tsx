import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Check,
  ChevronRight,
  Layers,
  Shapes,
  Sparkles,
  PackageCheck,
  MousePointerClick,
  PhoneCall,
  Hammer,
  FileText,
  ListChecks,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import AddToCart, { ProductGallery } from "@/components/AddToCart";

export const dynamic = "force-dynamic";

interface ProductResponse {
  product: Product;
  related: Product[];
}

const SHAPE_BN: Record<string, string> = {
  RECTANGLE: "আয়তাকার",
  WIDE: "চওড়া আয়তাকার",
  ROUND: "গোল",
  SQUARE: "বর্গাকার",
};

async function getProduct(slug: string): Promise<ProductResponse | null> {
  try {
    return await apiFetch<ProductResponse>(`/api/products/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProduct(params.slug);
  if (!data) return { title: "Product Not Found | Nameplate Zone" };
  const { product } = data;
  return {
    title: `${product.nameBn || product.name} | Nameplate Zone`,
    description: product.description.slice(0, 160),
  };
}

const STEPS = [
  { icon: MousePointerClick, text: "সাইজ বেছে \"এখনই কিনুন\" চাপুন" },
  { icon: PhoneCall, text: "নাম, মোবাইল ও ঠিকানা দিন" },
  { icon: Hammer, text: "ফোনে লেখা মিলিয়ে আমরা তৈরি করি" },
  { icon: PackageCheck, text: "ডেলিভারি নিয়ে টাকা দিন" },
];

export default async function ProductDetailsPage({ params }: { params: { slug: string } }) {
  const data = await getProduct(params.slug);
  if (!data) notFound();

  const { product, related } = data;
  const title = product.nameBn || product.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1.5 font-bengali text-sm text-ink-500"
        >
          <Link href="/" className="transition hover:text-gold-700">হোম</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="transition hover:text-gold-700">সব ডিজাইন</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/products?category=${product.category.slug}`}
                className="transition hover:text-gold-700"
              >
                {product.category.nameBn || product.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Left: gallery */}
          <div>
            <ProductGallery images={product.images} alt={title} />
          </div>

          {/* Right: buy box */}
          <div>
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 font-bengali text-xs font-semibold text-gold-800 transition hover:bg-gold-200"
              >
                <Sparkles className="h-3 w-3" />
                {product.category.nameBn || product.category.name}
              </Link>
            )}

            <h1 className="mt-3 font-bengali text-3xl font-bold leading-snug text-ink-950 sm:text-4xl">
              {title}
            </h1>
            {product.nameBn && <p className="mt-1 text-base text-ink-500">{product.name}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-bengali text-sm font-medium text-ink-700 ring-1 ring-ink-200">
                <Layers className="h-4 w-4 text-gold-600" /> অ্যাক্রেলিক ক্রিস্টাল
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-bengali text-sm font-medium text-ink-700 ring-1 ring-ink-200">
                <Shapes className="h-4 w-4 text-gold-600" /> {SHAPE_BN[product.shape] ?? product.shape}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bengali text-sm font-semibold ring-1 ${
                  product.inStock
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-red-50 text-red-600 ring-red-200"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-red-500"}`} />
                {product.inStock ? "স্টকে আছে" : "স্টকে নেই"}
              </span>
            </div>

            <AddToCart product={product} />

            {/* How ordering works */}
            <div className="mt-6 rounded-2xl bg-ink-950 p-5">
              <p className="font-bengali text-sm font-semibold text-gold-300">কীভাবে অর্ডার হয়</p>
              <ol className="mt-3 grid grid-cols-2 gap-3">
                {STEPS.map((s, i) => (
                  <li key={s.text} className="flex items-start gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400 font-bengali text-sm font-bold text-ink-950">
                      {["১", "২", "৩", "৪"][i]}
                    </span>
                    <span className="font-bengali text-sm leading-snug text-ink-100">{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Description + features */}
        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-cream-200 sm:p-8 lg:col-span-3">
            <h2 className="flex items-center gap-2 font-bengali text-xl font-bold text-ink-950">
              <FileText className="h-5 w-5 text-gold-600" /> বিবরণ
            </h2>
            <p className="mt-4 whitespace-pre-line font-bengali text-[1.05rem] leading-8 text-ink-700">
              {product.description}
            </p>
            {product.descriptionBn && (
              <p className="mt-3 font-bengali leading-8 text-ink-600">{product.descriptionBn}</p>
            )}
          </section>

          {product.features.length > 0 && (
            <section className="rounded-3xl bg-cream-100 p-6 ring-1 ring-cream-200 sm:p-8 lg:col-span-2">
              <h2 className="flex items-center gap-2 font-bengali text-xl font-bold text-ink-950">
                <ListChecks className="h-5 w-5 text-gold-600" /> বৈশিষ্ট্য
              </h2>
              <ul className="mt-4 space-y-3">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-ink-800">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Custom design callout */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl bg-gradient-to-r from-gold-400 to-gold-500 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="font-bengali text-xl font-bold text-ink-950">নিজের মতো করে ডিজাইন করতে চান?</p>
            <p className="mt-1 font-bengali text-ink-900">
              ডিজাইন স্টুডিওতে নাম, ফন্ট, রং, সাইজ সবকিছু নিজে বেছে নিন, সাথে সাথে প্রিভিউ দেখুন।
            </p>
          </div>
          <Link
            href="/customize"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ink-950 px-6 py-3.5 font-bengali font-semibold text-gold-300 transition hover:bg-ink-900"
          >
            <Sparkles className="h-4 w-4" /> ডিজাইন স্টুডিও খুলুন
          </Link>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="font-bengali text-sm font-semibold text-gold-600">আরও দেখুন</p>
                <h2 className="mt-1 font-bengali text-2xl font-bold text-ink-950 sm:text-3xl">
                  একই ধরনের আরও ডিজাইন
                </h2>
              </div>
              <Link href="/products" className="shrink-0 font-bengali text-sm font-semibold text-gold-700 hover:underline">
                সব দেখুন →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
      {/* room for the mobile sticky buy bar */}
      <div className="h-20 lg:hidden" aria-hidden />
    </div>
  );
}
