/**
 * Meta (Facebook) Pixel helpers.
 * The pixel only loads when NEXT_PUBLIC_FB_PIXEL_ID is set, so local/dev
 * builds without the variable send nothing.
 */

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "";

type FbqParams = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function fbTrack(event: string, params?: FbqParams, eventId?: string) {
  if (!FB_PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  if (eventId) window.fbq("track", event, params ?? {}, { eventID: eventId });
  else window.fbq("track", event, params ?? {});
}

export function fbPageView() {
  if (!FB_PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", "PageView");
}

export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) {
  fbTrack("AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    contents: [{ id: item.id, quantity: item.quantity, item_price: item.price }],
    value: item.price * item.quantity,
    currency: "BDT",
  });
}

/** Fires Purchase once per order (guards against page refresh / back navigation). */
export function trackPurchase(orderNumber: string, total: number, attempt = 0) {
  if (!FB_PIXEL_ID || !orderNumber || typeof window === "undefined") return;
  // On a direct page load the pixel script may not be ready yet — retry briefly.
  if (!window.fbq) {
    if (attempt < 20) setTimeout(() => trackPurchase(orderNumber, total, attempt + 1), 250);
    return;
  }
  const key = `fb-purchase-${orderNumber}`;
  try {
    if (localStorage.getItem(key)) return;
  } catch {
    /* storage unavailable — still track */
  }
  fbTrack(
    "Purchase",
    { value: total, currency: "BDT", order_id: orderNumber, content_type: "product" },
    `purchase-${orderNumber}`,
  );
  try {
    localStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}
