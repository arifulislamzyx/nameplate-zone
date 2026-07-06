import Link from "next/link";
import {
  Sparkles,
  Palette,
  Truck,
  ShieldCheck,
  PencilRuler,
  Eye,
  PackageCheck,
  ArrowRight,
  Star,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Category, Product, Pagination } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

async function getData() {
  try {
    const [featured, categories] = await Promise.all([
      apiFetch<{ products: Product[]; pagination: Pagination }>("/api/products?featured=true&limit=4"),
      apiFetch<Category[]>("/api/categories"),
    ]);
    return { featured: featured.products, categories };
  } catch {
    return { featured: [], categories: [] };
  }
}

export default async function HomePage() {
  const { featured, categories } = await getData();

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-gold-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-sm font-medium text-gold-300">
              <Sparkles className="h-4 w-4" /> লেজার-কাট প্রিমিয়াম নেমপ্লেট
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Your Home Deserves a{" "}
              <span className="gold-shimmer">Golden Identity</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-300">
              Design your own premium acrylic nameplate with live preview — golden mirror
              lettering, Bengali & English text, Islamic calligraphy and more. We craft it
              with laser precision and deliver to your door.
            </p>
            <p className="mt-2 max-w-xl font-bengali text-ink-400">
              নিজের নেমপ্লেট নিজেই ডিজাইন করুন, সাথে সাথে প্রিভিউ দেখুন — আমরা বানিয়ে পৌঁছে দেব।
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/customize" className="btn-gold text-base">
                <Palette className="h-5 w-5" /> Design Your Nameplate
              </Link>
              <Link href="/products" className="btn-dark text-base">
                Browse Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-400">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold-500" /> Weather-proof acrylic
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gold-500" /> Nationwide delivery
              </span>
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-gold-500" /> 500+ happy homes
              </span>
            </div>
          </div>

          {/* Hero preview plate */}
          <div className="relative mx-auto w-full max-w-lg animate-float">
            <div className="rounded-2xl border-2 border-gold-500/60 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 p-8 shadow-2xl shadow-gold-500/20">
              <div className="text-center">
                <svg viewBox="0 0 24 24" className="mx-auto h-14 w-14 text-gold-400" fill="currentColor">
                  <path d="M12 3 2 10h3v9h6v-5h2v5h6v-9h3L12 3z" />
                </svg>
                <p className="mt-4 font-bengali text-5xl font-bold gold-gradient-text">শান্তি নিবাস</p>
                <p className="mt-3 font-bengali text-lg text-gold-200/80">মোঃ আব্দুর রহমান</p>
                <div className="mx-auto my-4 h-px w-2/3 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
                <p className="font-bengali text-sm text-gold-200/60">বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা</p>
              </div>
            </div>
            <span className="absolute -right-3 -top-3 rounded-full bg-gold-500 px-3 py-1.5 text-xs font-bold text-ink-950 shadow-lg">
              LIVE PREVIEW ✦
            </span>
          </div>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            Shop by <span className="gold-gradient-text">Category</span>
          </h2>
          <p className="mt-2 font-bengali text-ink-500">আপনার পছন্দের ক্যাটাগরি বেছে নিন</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-ink-950 p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/15"
            >
              <div className="aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image ?? "/products/house-classic.svg"}
                  alt={cat.name}
                  className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-4">
                <h3 className="font-display text-lg font-semibold text-white group-hover:text-gold-300">
                  {cat.name}
                </h3>
                <p className="font-bengali text-sm text-ink-400">{cat.nameBn}</p>
                <p className="mt-1 text-xs text-gold-500">
                  {cat._count?.products ?? 0} designs →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Featured products ---------- */}
      <section className="bg-gradient-to-b from-white to-gold-50/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
                Featured <span className="gold-gradient-text">Nameplates</span>
              </h2>
              <p className="mt-2 font-bengali text-ink-500">আমাদের সেরা ডিজাইনগুলো দেখুন</p>
            </div>
            <Link href="/products" className="btn-dark !py-2.5 text-sm">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {featured.length === 0 && (
            <p className="py-10 text-center text-ink-400">
              Products are loading… make sure the API server is running.
            </p>
          )}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="bg-ink-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              How It <span className="gold-gradient-text">Works</span>
            </h2>
            <p className="mt-2 font-bengali text-ink-400">মাত্র ৪টি ধাপে আপনার নেমপ্লেট</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: PencilRuler,
                title: "Design It",
                titleBn: "ডিজাইন করুন",
                desc: "Pick shape, colors, fonts and write your text in our Design Studio.",
              },
              {
                icon: Eye,
                title: "Preview Live",
                titleBn: "লাইভ প্রিভিউ",
                desc: "See exactly how your nameplate will look — instantly, as you type.",
              },
              {
                icon: PackageCheck,
                title: "We Craft It",
                titleBn: "আমরা তৈরি করি",
                desc: "Laser-cut golden mirror acrylic, hand-finished with care.",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                titleBn: "দ্রুত ডেলিভারি",
                desc: "Securely packed and delivered anywhere in Bangladesh.",
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-gold-500/20 bg-ink-900/60 p-6 transition hover:border-gold-500/50 hover:bg-ink-900"
              >
                <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-gold-400 to-gold-600 font-display text-sm font-bold text-ink-950">
                  {i + 1}
                </span>
                <step.icon className="h-9 w-9 text-gold-400" />
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="font-bengali text-sm text-gold-500/80">{step.titleBn}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/customize" className="btn-gold text-base">
              <Sparkles className="h-5 w-5" /> Start Designing — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Why us ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
              Why <span className="gold-gradient-text">Nameplate Zone?</span>
            </h2>
            <ul className="mt-8 space-y-5">
              {[
                {
                  title: "Premium golden mirror acrylic",
                  desc: "Jet-black weather-proof base with real mirror-finish golden lettering that shines day and night.",
                },
                {
                  title: "Bengali, English & Arabic support",
                  desc: "From বাংলা villa names to Ayatul Kursi calligraphy — we craft every script beautifully.",
                },
                {
                  title: "You design, we deliver",
                  desc: "Our online Design Studio gives you a true live preview before you order — no surprises.",
                },
                {
                  title: "Made to last years",
                  desc: "UV-resistant, waterproof materials with free mounting fittings included.",
                },
              ].map((f) => (
                <li key={f.title} className="flex gap-4">
                  <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-gold-500" />
                  <div>
                    <h3 className="font-semibold text-ink-900">{f.title}</h3>
                    <p className="mt-1 text-sm text-ink-500">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["/products/islamic-ayat.svg", "/products/round-boutique.svg", "/products/mansion-wide.svg", "/products/house-classic.svg"].map(
              (src, i) => (
                <div
                  key={src}
                  className={`overflow-hidden rounded-2xl bg-ink-950 p-3 shadow-lg ${i % 2 ? "mt-6" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Nameplate sample" className="h-full w-full object-contain" />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ---------- CTA strip ---------- */}
      <section className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-ink-950">
            Ready to give your home its golden identity?
          </h2>
          <p className="mt-2 font-bengali text-lg text-ink-900/80">
            আজই আপনার স্বপ্নের নেমপ্লেট ডিজাইন করুন — সম্পূর্ণ ফ্রি প্রিভিউ!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/customize"
              className="inline-flex items-center gap-2 rounded-lg bg-ink-950 px-7 py-3.5 font-semibold text-gold-300 shadow-xl transition hover:bg-ink-900 active:scale-[0.98]"
            >
              <Palette className="h-5 w-5" /> Open Design Studio
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-ink-950 px-7 py-3.5 font-semibold text-ink-950 transition hover:bg-ink-950/10 active:scale-[0.98]"
            >
              Browse Ready Designs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
