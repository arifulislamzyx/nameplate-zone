import Link from "next/link";

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-md shadow-gold-500/30 transition group-hover:shadow-gold-400/50">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink-950" fill="currentColor">
          <path d="M12 3 2 10h3v9h6v-5h2v5h6v-9h3L12 3z" />
        </svg>
      </span>
      <span className="leading-tight">
        <span
          className={`block font-display text-lg font-bold tracking-wide ${
            dark ? "text-white" : "text-ink-900"
          }`}
        >
          Nameplate <span className="gold-gradient-text">Zone</span>
        </span>
        <span className={`block text-[10px] uppercase tracking-[0.25em] ${dark ? "text-ink-300" : "text-ink-400"}`}>
          Premium Custom Signs
        </span>
      </span>
    </Link>
  );
}
