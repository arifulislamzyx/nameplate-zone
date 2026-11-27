"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, Sparkles } from "lucide-react";
import { useCart } from "@/store/cart";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home", labelBn: "হোম" },
  { href: "/products", label: "Products", labelBn: "প্রোডাক্ট" },
  { href: "/customize", label: "Design Studio", labelBn: "ডিজাইন স্টুডিও" },
  { href: "/track-order", label: "Track Order", labelBn: "অর্ডার ট্র্যাক" },
  { href: "/contact", label: "Contact", labelBn: "যোগাযোগ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-cream-200 bg-white/95 shadow-[0_1px_12px_rgba(150,86,20,0.06)] backdrop-blur supports-[backdrop-filter]:bg-white/85">
      {/* thin gold accent line */}
      <div className="h-0.5 bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-gold-100 text-gold-800"
                    : "text-ink-700 hover:bg-cream-100 hover:text-gold-700"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/customize"
            className="hidden items-center gap-1.5 rounded-lg bg-gradient-to-b from-gold-400 to-gold-600 px-4 py-2 text-sm font-semibold text-ink-950 shadow shadow-gold-500/30 transition hover:from-gold-300 hover:to-gold-500 sm:inline-flex"
          >
            <Sparkles className="h-4 w-4" />
            Design Now
          </Link>

          <Link
            href="/cart"
            className="relative rounded-lg p-2.5 text-ink-700 transition hover:bg-cream-100 hover:text-gold-700"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2.5 text-ink-700 hover:bg-cream-100 lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-cream-200 bg-white px-4 py-3 shadow-lg lg:hidden">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active ? "bg-gold-100 text-gold-800" : "text-ink-700 hover:bg-cream-100"
                }`}
              >
                {l.label} <span className="font-bengali text-ink-400">· {l.labelBn}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
