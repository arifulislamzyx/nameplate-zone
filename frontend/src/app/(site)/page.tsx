import Link from "next/link";
import {
  Sparkles,
  Palette,
  Truck,
  ShieldCheck,
  ArrowRight,
  Star,
  Banknote,
  Eye,
  MousePointerClick,
  PhoneCall,
  Hammer,
  PackageCheck,
  BadgeCheck,
  Languages,
  Ruler,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Category, Product, Pagination } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import HeroShowcase from "@/components/HeroShowcase";

type ProductList = { products: Product[]; pagination: Pagination };

async function getData() {
  try {
    const [latest, categories] = await Promise.all([
      apiFetch<ProductList>("/api/products?sort=newest&limit=8"),
      apiFetch<Category[]>("/api/categories"),
    ]);
    // A real photo for every category card
    const covers = await Promise.all(
      categories.map((c) =>
        apiFetch<ProductList>(`/api/products?category=${c.slug}&sort=newest&limit=1`)
          .then((r) => r.products[0]?.images[0] ?? null)
          .catch(() => null),
      ),
    );
    return {
      latest: latest.products,
      total: latest.pagination.total,
      categories: categories.map((c, i) => ({ ...c, cover: covers[i] || c.image })),
    };
  } catch {
    return { latest: [], total: 0, categories: [] as (Category & { cover?: string | null })[] };
  }
}

const isPhoto = (src: string) => !/\.svg(\?|$)/i.test(src);

const TRUST = [
  { icon: Banknote, title: "ক্যাশ অন ডেলিভারি", desc: "পণ্য হাতে পেয়ে টাকা দিন" },
  { icon: Truck, title: "সারা দেশে ডেলিভারি", desc: "ঢাকায় ৳৮০, ঢাকার বাইরে ৳১৫০" },
  { icon: Eye, title: "অর্ডারের আগে প্রিভিউ", desc: "ডিজাইন দেখে নিশ্চিত হয়ে তবেই তৈরি" },
  { icon: ShieldCheck, title: "ওয়াটারপ্রুফ ও টেকসই", desc: "রোদ-বৃষ্টিতে রং নষ্ট হয় না" },
];

const SIZES = [
  { size: "18 × 12", price: "২,৫০০", note: "ফ্ল্যাট ও ছোট দরজা" },
  { size: "24 × 12", price: "৩,০০০", note: "সবচেয়ে জনপ্রিয়", hot: true },
  { size: "24 × 18", price: "৩,৯০০", note: "বড় নাম ও ঠিকানা" },
  { size: "36 × 18", price: "৪,৯০০", note: "বাড়ির মূল গেট" },
];

const STEPS = [
  { icon: MousePointerClick, title: "ডিজাইন বেছে নিন", desc: "পছন্দের ডিজাইন ও সাইজ সিলেক্ট করে \"এখনই কিনুন\" চাপুন।" },
  { icon: PhoneCall, title: "নাম-ঠিকানা দিন", desc: "নাম, মোবাইল আর ঠিকানা দিন। আমরা ফোন করে লেখাগুলো নিশ্চিত করব।" },
  { icon: Hammer, title: "আমরা তৈরি করি", desc: "লেজার কাটিং মেশিনে যত্ন নিয়ে আপনার নেমপ্লেট তৈরি হয়।" },
  { icon: PackageCheck, title: "ডেলিভারি ও পেমেন্ট", desc: "নিরাপদ প্যাকিংয়ে বাসায় পৌঁছে যায়। হাতে পেয়ে টাকা দিন।" },
];

export default async function HomePage() {
  const { latest, total, categories } = await getData();
  const gallery = latest.filter((p) => p.images[0] && isPhoto(p.images[0])).slice(0, 4);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-white to-cream-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-gold-300/25 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-gold-200/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(234,178,40,0.12),transparent_55%)]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-300 bg-white px-4 py-1.5 font-bengali text-sm font-medium text-gold-800 shadow-sm">
              <Sparkles className="h-4 w-4" /> নিজস্ব কারখানায় তৈরি · লেজার কাটিং
            </span>
            <h1 className="mt-6 font-bengali text-4xl font-bold leading-[1.25] text-ink-950 sm:text-5xl lg:text-[3.4rem]">
              আপনার বাড়ির পরিচয় হোক{" "}
              <span className="bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 bg-clip-text text-transparent">সোনালি অক্ষরে</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl font-bengali text-lg leading-relaxed text-ink-600 lg:mx-0">
              প্রিমিয়াম অ্যাক্রেলিক ক্রিস্টাল নেমপ্লেট। বাংলা, ইংরেজি ও আরবি ক্যালিগ্রাফিতে আপনার
              পছন্দমতো নাম-ঠিকানা লিখে বানিয়ে দেই, সারা বাংলাদেশে পৌঁছে দেই।
            </p>

            <p className="mt-6 font-bengali text-ink-600">
              দাম শুরু মাত্র{" "}
              <span className="text-3xl font-bold text-gold-700">৳২,৫০০</span>{" "}
              থেকে
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/products" className="btn-gold px-8 py-4 font-bengali text-lg">
                ডিজাইন দেখুন ও অর্ডার করুন <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/customize" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-ink-900 bg-white px-7 py-4 font-bengali text-lg font-semibold text-ink-900 transition hover:bg-ink-900 hover:text-gold-300 active:scale-[0.98]">
                <Palette className="h-5 w-5" /> নিজে ডিজাইন করুন
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 font-bengali text-sm text-ink-700 lg:justify-start">
              <span className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-emerald-600" /> ক্যাশ অন ডেলিভারি
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gold-600" /> সারা দেশে ডেলিভারি
              </span>
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-gold-500 text-gold-500" /> ৫০০+ সন্তুষ্ট পরিবার
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 p-5 shadow-2xl shadow-gold-900/25 ring-1 ring-gold-500/30 sm:p-7"><HeroShowcase /></div>
        </div>
      </section>

      {/* ---------- Trust strip ---------- */}
      <section className="border-b border-cream-200 bg-cream-100">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-gold-600 shadow-sm ring-1 ring-cream-200">
                <t.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-bengali text-sm font-semibold text-ink-900">{t.title}</p>
                <p className="font-bengali text-xs text-ink-500">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="font-bengali text-sm font-semibold text-gold-600">ক্যাটাগরি</p>
          <h2 className="mt-1 font-bengali text-3xl font-bold text-ink-950 sm:text-4xl">
            কোন ধরনের নেমপ্লেট খুঁজছেন?
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {categories.map((cat) => {
            const cover = cat.cover ?? "/products/house-classic.svg";
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-950 shadow-md transition hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/20 sm:aspect-[4/3]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover}
                  alt={cat.nameBn || cat.name}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full transition duration-700 group-hover:scale-110 ${isPhoto(cover) ? "object-cover" : "object-contain p-6"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-bengali text-lg font-bold text-white sm:text-xl">
                    {cat.nameBn || cat.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 font-bengali text-sm text-gold-300">
                    {cat._count?.products ?? 0}টি ডিজাইন
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- Latest designs ---------- */}
      <section className="bg-gradient-to-b from-cream-50 to-cream-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-bengali text-sm font-semibold text-gold-600">নতুন কালেকশন</p>
              <h2 className="mt-1 font-bengali text-3xl font-bold text-ink-950 sm:text-4xl">
                আমাদের তৈরি নতুন ডিজাইন
              </h2>
              <p className="mt-2 font-bengali text-ink-500">
                সব ছবি আমাদের কারখানায় তৈরি আসল নেমপ্লেটের। আপনার নাম দিয়ে ঠিক এমনটাই বানিয়ে দেব।
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-ink-900 px-5 py-2.5 font-bengali text-sm font-semibold text-ink-900 transition hover:bg-ink-900 hover:text-gold-300"
            >
              সব {total > 0 ? `${total}টি ` : ""}ডিজাইন দেখুন <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {latest.length === 0 && (
            <p className="py-10 text-center font-bengali text-ink-400">ডিজাইন লোড হচ্ছে…</p>
          )}
        </div>
      </section>

      {/* ---------- Sizes & prices ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="font-bengali text-sm font-semibold text-gold-600">সাইজ ও দাম</p>
          <h2 className="mt-1 font-bengali text-3xl font-bold text-ink-950 sm:text-4xl">
            আপনার দরজার মাপে বেছে নিন
          </h2>
          <p className="mt-2 font-bengali text-ink-500">সব দামে ডিজাইন, লেখা আর লাগানোর স্ক্রু অন্তর্ভুক্ত</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {SIZES.map((s) => (
            <div
              key={s.size}
              className={`relative rounded-2xl border-2 p-5 text-center transition hover:-translate-y-1 ${
                s.hot
                  ? "border-gold-400 bg-gradient-to-b from-gold-50 to-white shadow-lg shadow-gold-500/15"
                  : "border-cream-200 bg-white hover:border-gold-300"
              }`}
            >
              {s.hot && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-3 py-0.5 font-bengali text-xs font-bold text-ink-950">
                  জনপ্রিয়
                </span>
              )}
              <Ruler className="mx-auto h-6 w-6 text-gold-600" />
              <p className="mt-2 text-lg font-bold text-ink-900">{s.size} <span className="text-sm font-medium text-ink-500">inch</span></p>
              <p className="mt-1 font-bengali text-3xl font-bold text-gold-700">৳{s.price}</p>
              <p className="mt-1 font-bengali text-sm text-ink-500">{s.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center font-bengali text-sm text-ink-500">
          অন্য মাপ লাগবে? <Link href="/contact" className="font-semibold text-gold-700 underline-offset-4 hover:underline">যোগাযোগ করুন</Link>, কাস্টম সাইজেও বানিয়ে দেই।
        </p>
      </section>

      {/* ---------- How to order ---------- */}
      <section className="bg-ink-950 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="font-bengali text-sm font-semibold text-gold-400">খুব সহজ</p>
            <h2 className="mt-1 font-bengali text-3xl font-bold text-white sm:text-4xl">
              কীভাবে অর্ডার করবেন?
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-gold-500/25 bg-ink-900 p-6 transition hover:border-gold-400/60"
              >
                <span className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-gold-300 to-gold-500 font-bengali text-base font-bold text-ink-950 shadow-lg shadow-gold-500/30">
                  {["১", "২", "৩", "৪"][i]}
                </span>
                <step.icon className="mt-2 h-9 w-9 text-gold-400" />
                <h3 className="mt-4 font-bengali text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 font-bengali leading-relaxed text-ink-200">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/products" className="btn-gold px-8 py-4 font-bengali text-lg">
              <Sparkles className="h-5 w-5" /> এখনই ডিজাইন বেছে নিন
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Why us ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="font-bengali text-sm font-semibold text-gold-600">কেন আমরা</p>
            <h2 className="mt-1 font-bengali text-3xl font-bold text-ink-950 sm:text-4xl">
              কেন Nameplate Zone বেছে নেবেন?
            </h2>
            <ul className="mt-8 space-y-5">
              {[
                { icon: BadgeCheck, title: "আসল গোল্ডেন মিরর অ্যাক্রেলিক", desc: "চকচকে কালো বেসের উপর আয়নার মতো ঝকঝকে সোনালি অক্ষর। দিনে-রাতে সমান উজ্জ্বল।" },
                { icon: Languages, title: "বাংলা, ইংরেজি ও আরবি", desc: "বাড়ির নাম থেকে আয়াতুল কুরসি ক্যালিগ্রাফি, সব লেখাই নিখুঁতভাবে কাটা হয়।" },
                { icon: Eye, title: "আগে দেখুন, পরে বানাই", desc: "তৈরির আগে আপনার লেখাসহ ডিজাইন দেখিয়ে নিশ্চিত হয়ে নিই। কোনো ভুলের ঝুঁকি নেই।" },
                { icon: ShieldCheck, title: "বছরের পর বছর টেকসই", desc: "ওয়াটারপ্রুফ ও UV প্রুফ। মরিচা ধরে না, রং জ্বলে না। লাগানোর স্ক্রু ফ্রি।" },
              ].map((f) => (
                <li key={f.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-600 ring-1 ring-gold-200">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bengali text-lg font-semibold text-ink-900">{f.title}</h3>
                    <p className="mt-1 font-bengali text-ink-600">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {gallery.map((p, i) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className={`group overflow-hidden rounded-2xl shadow-lg ring-1 ring-cream-200 ${i % 2 ? "mt-8" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.images[0]}
                  alt={p.nameBn || p.name}
                  loading="lazy"
                  className="aspect-[4/3] h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA strip ---------- */}
      <section className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-bengali text-3xl font-bold text-ink-950 sm:text-4xl">
            আজই আপনার বাড়িকে দিন সোনালি পরিচয়
          </h2>
          <p className="mt-3 font-bengali text-lg text-ink-900">
            পছন্দের ডিজাইন বেছে নিন, লেখাগুলো আমরা ফোনে মিলিয়ে নেব। পণ্য হাতে পেয়ে টাকা দিন।
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink-950 px-8 py-4 font-bengali text-lg font-semibold text-gold-300 shadow-xl transition hover:bg-ink-900 active:scale-[0.98]"
            >
              ডিজাইন দেখুন <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/customize"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-950 px-8 py-4 font-bengali text-lg font-semibold text-ink-950 transition hover:bg-ink-950/10 active:scale-[0.98]"
            >
              <Palette className="h-5 w-5" /> নিজে ডিজাইন করুন
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
