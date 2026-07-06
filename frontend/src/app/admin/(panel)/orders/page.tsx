"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, MapPin, Phone, ShoppingBag, StickyNote, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/api";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";
import type { Order, OrderStatus, Pagination, Product, CustomDesign } from "@/lib/types";
import PaginationBar from "@/components/admin/PaginationBar";
import { Modal, ConfirmDialog } from "@/components/admin/Modal";
import { Badge, EmptyState, TableSkeleton, useApiError } from "@/components/admin/ui";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

interface DetailedOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string | null;
  customization?: unknown;
  product?: Product | null;
  design?: CustomDesign | null;
}

interface DetailedOrder extends Omit<Order, "items"> {
  items: DetailedOrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<DetailedOrder | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const onError = useApiError();

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await adminFetch<{ orders: Order[]; pagination: Pagination }>(
        `/api/orders?${params}`
      );
      setOrders(res.orders);
      setPagination(res.pagination);
    } catch (err) {
      onError(err, "Failed to load orders");
      setOrders([]);
    }
  }, [page, statusFilter, onError]);

  useEffect(() => {
    load();
  }, [load]);

  async function openDetail(order: Order) {
    setLoadingDetail(true);
    try {
      setSelected(await adminFetch<DetailedOrder>(`/api/orders/${order.id}`));
    } catch (err) {
      onError(err);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    try {
      await adminFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Status → ${ORDER_STATUS_LABELS[status]?.label ?? status}`);
      setSelected((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev));
      setOrders((prev) => prev?.map((o) => (o.id === orderId ? { ...o, status } : o)) ?? null);
    } catch (err) {
      onError(err);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusyDelete(true);
    try {
      await adminFetch(`/api/orders/${deleting.id}`, { method: "DELETE" });
      toast.success("Order deleted");
      setDeleting(null);
      load();
    } catch (err) {
      onError(err);
    } finally {
      setBusyDelete(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="thin-scroll flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setStatusFilter("");
            setPage(1);
          }}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
            statusFilter === ""
              ? "bg-ink-950 text-gold-300"
              : "bg-white text-ink-500 shadow-sm hover:text-ink-800"
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
              statusFilter === s
                ? "bg-ink-950 text-gold-300"
                : "bg-white text-ink-500 shadow-sm hover:text-ink-800"
            }`}
          >
            {ORDER_STATUS_LABELS[s]?.label ?? s}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {orders === null ? (
          <TableSkeleton />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            subtitle={statusFilter ? "No orders with this status." : "New orders will appear here."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 text-center font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer transition hover:bg-gold-50/40"
                    onClick={() => openDetail(o)}
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-ink-800">
                      {o.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-800">{o.customerName}</p>
                      <p className="text-xs text-ink-400">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-center text-ink-600">{o.items.length}</td>
                    <td className="px-4 py-3 font-bold text-ink-900">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <Badge color={ORDER_STATUS_LABELS[o.status]?.color ?? "bg-gray-100 text-gray-700"}>
                        {ORDER_STATUS_LABELS[o.status]?.label ?? o.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openDetail(o)}
                          aria-label="View"
                          className="rounded-lg p-2 text-ink-400 transition hover:bg-gold-100 hover:text-gold-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(o)}
                          aria-label="Delete"
                          className="rounded-lg p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination && <PaginationBar pagination={pagination} onPage={setPage} />}
      </div>

      {/* Detail modal */}
      <Modal
        open={selected !== null || loadingDetail}
        onClose={() => setSelected(null)}
        title={
          selected ? (
            <span className="font-mono">{selected.orderNumber}</span>
          ) : (
            "Loading order…"
          )
        }
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            {/* Status control */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink-50 p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Status</p>
                <Badge color={ORDER_STATUS_LABELS[selected.status]?.color ?? ""}>
                  {ORDER_STATUS_LABELS[selected.status]?.label ?? selected.status}
                </Badge>
              </div>
              <select
                className="input w-auto"
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value as OrderStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]?.label ?? s}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-100 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Customer</p>
                <p className="mt-1 font-semibold text-ink-900">{selected.customerName}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                  <Phone className="h-3.5 w-3.5" /> {selected.phone}
                </p>
                {selected.email && <p className="text-sm text-ink-500">{selected.email}</p>}
              </div>
              <div className="rounded-xl border border-ink-100 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Delivery</p>
                <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-700">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {selected.address}, {selected.city}
                </p>
                <p className="mt-1 text-sm text-ink-500">{formatDate(selected.createdAt)}</p>
              </div>
            </div>

            {selected.note && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0" />
                {selected.note}
              </div>
            )}

            {/* Items */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">
                Items ({selected.items.length})
              </p>
              <ul className="divide-y divide-ink-50 rounded-xl border border-ink-100">
                {selected.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 p-3">
                    {(item.design?.previewImage || item.product?.images?.[0]) && (
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-950 p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.design?.previewImage ?? item.product?.images?.[0] ?? ""}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-800">{item.name}</p>
                      <p className="text-xs text-ink-400">
                        {item.size && <>Size: {item.size} · </>}Qty: {item.quantity}
                      </p>
                      {item.customization != null && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs font-medium text-gold-600">
                            Customization details
                          </summary>
                          <pre className="thin-scroll mt-1 max-h-40 overflow-auto rounded-lg bg-ink-950 p-2 text-[11px] text-gold-200">
                            {JSON.stringify(item.customization, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <span className="text-sm font-bold text-ink-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 rounded-xl bg-ink-50 p-4 text-sm">
              <div className="flex justify-between text-ink-600">
                <span>Subtotal</span>
                <span>{formatPrice(selected.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>Delivery</span>
                <span>{formatPrice(selected.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-1.5 font-bold text-ink-900">
                <span>Total</span>
                <span>{formatPrice(selected.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete order?"
        message={
          <>
            Order <span className="font-mono font-semibold">{deleting?.orderNumber}</span> will be
            permanently removed.
          </>
        }
        busy={busyDelete}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
