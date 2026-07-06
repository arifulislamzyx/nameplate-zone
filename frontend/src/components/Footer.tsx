import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const socialIcons = [
  {
    name: "Facebook",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  },
  {
    name: "YouTube",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-gold-500/20 bg-ink-950 text-ink-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-4 text-sm leading-relaxed text-ink-400">
            Premium custom acrylic nameplates with golden mirror lettering — designed by you,
            crafted by us with laser precision.
          </p>
          <p className="mt-2 font-bengali text-sm text-ink-400">
            আপনার স্বপ্নের বাড়ির জন্য প্রিমিয়াম নেমপ্লেট — আপনি ডিজাইন করুন, আমরা তৈরি করি।
          </p>
          <div className="mt-4 flex gap-2">
            {socialIcons.map((icon) => (
              <a
                key={icon.name}
                href="#"
                aria-label={icon.name}
                title={icon.name}
                className="rounded-lg border border-ink-700 p-2 transition hover:border-gold-500 hover:text-gold-400"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d={icon.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-gold-400">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/products" className="transition hover:text-gold-300">All Products</Link></li>
            <li><Link href="/customize" className="transition hover:text-gold-300">Design Studio</Link></li>
            <li><Link href="/track-order" className="transition hover:text-gold-300">Track Your Order</Link></li>
            <li><Link href="/contact" className="transition hover:text-gold-300">Contact Us</Link></li>
            <li><Link href="/admin/login" className="transition hover:text-gold-300">Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-gold-400">
            Categories
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/products?category=house-nameplates" className="transition hover:text-gold-300">House Nameplates</Link></li>
            <li><Link href="/products?category=islamic-calligraphy" className="transition hover:text-gold-300">Islamic Calligraphy</Link></li>
            <li><Link href="/products?category=round-logo-plates" className="transition hover:text-gold-300">Round Logo Plates</Link></li>
            <li><Link href="/products?category=office-shop-signs" className="transition hover:text-gold-300">Office & Shop Signs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-gold-400">
            Contact
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <span>+880 1XXX-XXXXXX</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <span>hello@nameplatezone.com</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <span>Dhaka, Bangladesh — nationwide delivery</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800 py-5 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} Nameplate Zone. All rights reserved. Crafted with laser precision ✦
      </div>
    </footer>
  );
}
