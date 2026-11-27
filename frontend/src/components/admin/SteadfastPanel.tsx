"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Copy, Loader2, RefreshCw, Send, Truck } from "lucide-react";
import { adminFetch } from "@/lib/api";
import { COURIER_STATUS_LABELS, formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import { Badge, useApiError } from "@/components/admin/ui";

type CourierFields = Pick<
  Order,
  "id" | "status" | "total" | "courier" | "consignmentId" | "trackingCode" | "courierStatus" | "courierSentAt"
>;

interface SteadfastInfo {
  configured: boolean;
  balance: number | null;
  error?: string;
}

// Cache the connection check across modal opens
let infoCache: SteadfastInfo | null = null;

export default function SteadfastPanel({
  order,
  onUpdated,
}: {
  order: CourierFields;
  onUpdated: (updated: Order) => void;
}) {
  const [info, setInfo] = useState<SteadfastInfo | null>(infoCache);
  const [cod, setCod] = useState(String(order.total));
  const [busy, setBusy] = useState<"send" | "refresh" | null>(null);
  const onError = useApiError();

  useEffect(() => {
    setCod(String(order.total));
  }, [order.id, order.total]);

  useEffect(() => {
    if (infoCache) return;
    adminFetch<SteadfastInfo>("/api/orders/courier/steadfast")
      .then((r) => {
        infoCache = r;
        setInfo(r);
      })
      .catch(() => setInfo({ configured: false, balance: null }));
  }, []);

  async function send() {
    const codAmount = Number(cod);
    if (!Number.isFinite(codAmount) || codAmount < 0) return toast.error("সঠিক COD amount দিন");
    setBusy("send");
    try {
      const updated = await adminFetch<Order>(`/api/orders/${order.id}/steadfast`, {
        method: "POST",
        body: JSON.stringify({ codAmount }),
      });
      toast.success("Steadfast-এ পাঠানো হয়েছে");
      onUpdated(updated);
    } catch (err) {
      onError(err, "Steadfast-এ পাঠানো যায়নি");
    } finally {
      setBusy(null);
    }
  }

  async function refresh() {
    setBusy("refresh");
    try {
      const updated = await adminFetch<Order>(`/api/orders/${order.id}/steadfast/refresh`, {
        method: "POST",
      });
      toast.success("Courier status updated");
      onUpdated(updated);
    } catch (err) {
      onError(err, "Status আনা যায়নি");
    } finally {
      setBusy(null);
    }
  }

  const courierMeta = order.courierStatus ? COURIER_STATUS_LABELS[order.courierStatus] : null;

  return (
    <div className="rounded-xl border border-ink-100 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">
          <Truck className="h-3.5 w-3.5" /> Courier · Steadfast
        </p>
        {info?.configured && info.balance != null && (
          <span className="text-xs text-ink-400">Balance: {formatPrice(info.balance)}</span>
        )}
      </div>

      {order.consignmentId ? (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-ink-400">Consignment ID</p>
              <p className="font-mono font-semibold text-ink-800">{order.consignmentId}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Tracking code</p>
              {order.trackingCode ? (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(order.trackingCode ?? "");
                    toast.success("Copied");
                  }}
                  className="inline-flex items-center gap-1 font-mono font-semibold text-ink-800 hover:text-gold-700"
                >
                  {order.trackingCode} <Copy className="h-3 w-3" />
                </button>
              ) : (
                <p className="text-ink-400">—</p>
              )}
            </div>
            <div>
              <p className="text-xs text-ink-400">Courier status</p>
              <Badge color={courierMeta?.color ?? "bg-gray-100 text-gray-700"}>
                {courierMeta?.label ?? order.courierStatus ?? "—"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-ink-400">
              {order.courierSentAt && <>Sent {formatDate(order.courierSentAt)} · </>}
              Delivered / Cancelled হলে অর্ডারের স্ট্যাটাস নিজে থেকেই বদলাবে
            </p>
            <button
              type="button"
              onClick={refresh}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-gold-400 hover:text-gold-700 disabled:opacity-60"
            >
              {busy === "refresh" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Refresh status
            </button>
          </div>
        </div>
      ) : info && !info.configured ? (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Steadfast API key এখনো সেট করা হয়নি। backend-এর <code className="font-mono">.env</code>-এ{" "}
          <code className="font-mono">STEADFAST_API_KEY</code> ও{" "}
          <code className="font-mono">STEADFAST_SECRET_KEY</code> দিলেই এখান থেকে পার্সেল পাঠানো যাবে।
        </p>
      ) : order.status === "CANCELLED" ? (
        <p className="mt-3 text-sm text-ink-400">বাতিল অর্ডার courier-এ পাঠানো যাবে না।</p>
      ) : (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="sf-cod" className="text-xs text-ink-500">
              COD amount (কাস্টমার থেকে নেবে)
            </label>
            <input
              id="sf-cod"
              type="number"
              min={0}
              className="input mt-1 w-36"
              value={cod}
              onChange={(e) => setCod(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={send}
            disabled={busy !== null || !info}
            className="btn-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send to Steadfast
          </button>
          {info?.error && <p className="w-full text-xs text-red-600">{info.error}</p>}
        </div>
      )}
    </div>
  );
}
