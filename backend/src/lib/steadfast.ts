// Steadfast Courier merchant API client.
// Docs: https://portal.packzy.com/api/v1 (Api-Key / Secret-Key headers).
// Set STEADFAST_API_KEY and STEADFAST_SECRET_KEY in .env to enable.

type OrderStatus = "PENDING" | "CONFIRMED" | "IN_PRODUCTION" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const baseUrl = () =>
  (process.env.STEADFAST_BASE_URL || "https://portal.packzy.com/api/v1").replace(/\/+$/, "");

export const isSteadfastConfigured = () =>
  Boolean(process.env.STEADFAST_API_KEY?.trim() && process.env.STEADFAST_SECRET_KEY?.trim());

export class SteadfastError extends Error {
  constructor(message: string, public httpStatus = 502) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isSteadfastConfigured()) {
    throw new SteadfastError(
      "Steadfast API key সেট করা নেই। backend .env-এ STEADFAST_API_KEY ও STEADFAST_SECRET_KEY দিন।",
      400,
    );
  }
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        "Api-Key": process.env.STEADFAST_API_KEY!.trim(),
        "Secret-Key": process.env.STEADFAST_SECRET_KEY!.trim(),
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    throw new SteadfastError(`Steadfast-এ সংযোগ হয়নি: ${err instanceof Error ? err.message : err}`);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON body */
  }
  const body = (data ?? {}) as Record<string, unknown>;
  const bodyStatus = typeof body.status === "number" ? body.status : res.status;

  if (!res.ok || bodyStatus >= 400) {
    const errors = body.errors ? ` ${JSON.stringify(body.errors)}` : "";
    const msg = (typeof body.message === "string" && body.message) || text.slice(0, 200) || res.statusText;
    throw new SteadfastError(
      res.status === 401 || res.status === 403
        ? "Steadfast API key/secret ভুল (unauthorized)।"
        : `Steadfast error: ${msg}${errors}`,
    );
  }
  return body as T;
}

/** 01XXXXXXXXX — strip spaces, dashes and +88 / 88 prefix. */
export const normalizePhone = (phone: string) => {
  let p = phone.replace(/[^\d]/g, "");
  if (p.startsWith("880")) p = p.slice(2);
  else if (p.startsWith("88") && p.length === 13) p = p.slice(2);
  return p;
};

export interface ConsignmentInput {
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string | null;
  itemDescription?: string | null;
}

export interface Consignment {
  consignment_id: number | string;
  invoice: string;
  tracking_code: string;
  status: string;
}

export async function createConsignment(input: ConsignmentInput): Promise<Consignment> {
  const phone = normalizePhone(input.recipientPhone);
  if (!/^01\d{9}$/.test(phone)) {
    throw new SteadfastError(`ফোন নম্বর ১১ ডিজিটের হতে হবে (01XXXXXXXXX)। পাওয়া গেছে: ${input.recipientPhone}`, 400);
  }
  const res = await call<{ consignment?: Consignment }>("/create_order", {
    method: "POST",
    body: JSON.stringify({
      invoice: input.invoice,
      recipient_name: input.recipientName.slice(0, 100),
      recipient_phone: phone,
      recipient_address: input.recipientAddress.slice(0, 250),
      cod_amount: Math.max(0, Math.round(input.codAmount)),
      ...(input.note ? { note: input.note.slice(0, 250) } : {}),
      ...(input.itemDescription ? { item_description: input.itemDescription.slice(0, 250) } : {}),
    }),
  });
  if (!res.consignment?.consignment_id) {
    throw new SteadfastError("Steadfast consignment তৈরি হয়নি (অপ্রত্যাশিত উত্তর)।");
  }
  return res.consignment;
}

export async function getStatusByConsignmentId(consignmentId: string): Promise<string> {
  const res = await call<{ delivery_status?: string }>(
    `/status_by_cid/${encodeURIComponent(consignmentId)}`,
  );
  if (!res.delivery_status) throw new SteadfastError("Steadfast থেকে স্ট্যাটাস পাওয়া যায়নি।");
  return res.delivery_status;
}

export async function getBalance(): Promise<number | null> {
  const res = await call<{ current_balance?: number }>("/get_balance");
  return typeof res.current_balance === "number" ? res.current_balance : null;
}

/**
 * Map a Steadfast delivery_status to our order status.
 * Returns null when it should not change our status (still in transit).
 */
export function mapCourierStatus(courierStatus: string): OrderStatus | null {
  switch (courierStatus) {
    case "delivered":
    case "partial_delivered":
      return "DELIVERED";
    case "cancelled":
      return "CANCELLED";
    default:
      // pending, in_review, hold, unknown, *_approval_pending → still with courier
      return null;
  }
}
