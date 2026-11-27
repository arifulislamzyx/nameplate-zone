import Link from "next/link";

/**
 * Brand logo (transparent PNG with pale-gold lettering).
 * On light backgrounds (default) a filter deepens the gold for contrast;
 * pass `dark` when placing it on a dark surface.
 * `size="lg"` is used in the footer; default fits the navbar.
 */
export default function Logo({ dark = false, size = "md" }: { dark?: boolean; size?: "md" | "lg" }) {
  return (
    <Link href="/" aria-label="Nameplate Zone — Home" className="group inline-flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-horizontal.png"
        alt="Nameplate Zone — House & Business Nameplate"
        width={932}
        height={160}
        className={`w-auto transition ${
          dark
            ? "group-hover:brightness-110"
            : "[filter:brightness(0.78)_saturate(1.6)_drop-shadow(0_1px_0.5px_rgba(80,50,10,0.25))] group-hover:[filter:brightness(0.72)_saturate(1.7)_drop-shadow(0_1px_0.5px_rgba(80,50,10,0.3))]"
        } ${size === "lg" ? "h-12 sm:h-14" : "h-9 sm:h-11"}`}
      />
    </Link>
  );
}
