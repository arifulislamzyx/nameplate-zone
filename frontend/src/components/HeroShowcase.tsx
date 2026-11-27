"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const PLATES = [
  { src: "/showcase/plate-2.webp", title: "বাবা মায়ের স্বপ্ন ভিলা", tag: "Calligraphy Premium" },
  { src: "/showcase/plate-4.webp", title: "মা-বাবার দোয়া", tag: "House Shape" },
  { src: "/showcase/plate-3.webp", title: "এক্রাম আলী বেপারী বাড়ি", tag: "Ayatul Kursi Design" },
  { src: "/showcase/plate-1.webp", title: "সাব্বির মোল্লা ভিলা", tag: "Classic Gold Frame" },
];

export default function HeroShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((i) => (i + 1) % PLATES.length), 3800);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div
      className="relative mx-auto w-full max-w-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ambient glow behind plates */}
      <div className="pointer-events-none absolute inset-x-6 top-10 h-3/5 rounded-full bg-gold-500/25 blur-3xl animate-glow-pulse" />

      {/* main stage */}
      <div className="relative aspect-[4/3] animate-float">
        {PLATES.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.src}
            src={p.src}
            alt={p.title}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
            className={`plate-glow absolute inset-0 m-auto max-h-full w-full object-contain transition-all duration-700 ease-out ${
              i === active ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
            }`}
          />
        ))}
        <span className="absolute -right-2 -top-2 inline-flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1.5 text-xs font-bold text-ink-950 shadow-lg shadow-gold-500/40">
          <Sparkles className="h-3.5 w-3.5" /> আমাদের তৈরি
        </span>
      </div>

      {/* caption */}
      <div className="mt-4 text-center">
        <p className="font-bengali text-xl font-semibold text-gold-200">{PLATES[active].title}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">{PLATES[active].tag}</p>
      </div>

      {/* thumbnails */}
      <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3">
        {PLATES.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${p.title}`}
            className={`flex aspect-[4/3] items-center justify-center rounded-xl border bg-ink-900/70 p-1.5 transition ${
              i === active
                ? "border-gold-400 shadow-[0_0_18px_rgba(234,179,8,0.45)]"
                : "border-ink-800 opacity-60 hover:border-gold-500/50 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src.replace(".webp", "-thumb.webp")} alt="" loading="lazy" className="max-h-full w-full object-contain" />
          </button>
        ))}
      </div>

      <Link
        href="/products"
        className="mt-4 block text-center text-sm font-medium text-gold-400 transition hover:text-gold-300"
      >
        আরও ডিজাইন দেখুন →
      </Link>
    </div>
  );
}
