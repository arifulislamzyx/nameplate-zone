/**
 * Returns a size-optimised URL for an image.
 *
 * Cloudinary URLs get an on-the-fly transformation: resized to `width`
 * (never upscaled), served as WebP/AVIF where the browser supports it,
 * with automatic quality. A 1600px JPEG of ~400KB typically becomes a
 * ~30–60KB file at card size. Any other URL (local SVG/WebP) is returned
 * unchanged.
 */
export function imgUrl(src: string | null | undefined, width: number): string {
  if (!src) return "";
  const marker = "/image/upload/";
  const i = src.indexOf(marker);
  if (!src.includes("res.cloudinary.com") || i === -1) return src;
  const rest = src.slice(i + marker.length);
  // Already transformed (e.g. "f_auto,..." or "w_..." segment) — leave as is.
  if (/^(?:[a-z]{1,3}_[^/]+,?)+\//.test(rest) && !/^v\d+\//.test(rest)) return src;
  return `${src.slice(0, i + marker.length)}f_auto,q_auto,c_limit,w_${width}/${rest}`;
}

/** Builds a srcSet for responsive images (1x / 2x widths). */
export function imgSrcSet(src: string | null | undefined, widths: number[]): string | undefined {
  if (!src || !src.includes("res.cloudinary.com")) return undefined;
  return widths.map((w) => `${imgUrl(src, w)} ${w}w`).join(", ");
}
