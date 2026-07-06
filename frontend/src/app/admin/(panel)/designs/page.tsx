"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Palette, Phone, Trash2, User } from "lucide-react";
import { adminFetch } from "@/lib/api";
import { formatDate, DESIGN_STATUS_LABELS } from "@/lib/format";
import type { CustomDesign, DesignStatus, Pagination } from "@/lib/types";
import PaginationBar from "@/components/admin/PaginationBar";
import { Modal, ConfirmDialog } from "@/components/admin/Modal";
import { Badge, EmptyState, PageLoader, useApiError } from "@/components/admin/ui";

const STATUSES: DesignStatus[] = ["DRAFT", "SUBMITTED", "REVIEWED", "ORDERED"];

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<CustomDesign[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<CustomDesign | null>(null);
  const [deleting, setDeleting] = useState<CustomDesign | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const onError = useApiError();

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await adminFetch<{ designs: CustomDesign[]; pagination: Pagination }>(
        `/api/designs?${params}`
      );
      setDesigns(res.designs);
      setPagination(res.pagination);
    } catch (err) {
      onError(err, "Failed to load designs");
      setDesigns([]);
    }
  }, [page, statusFilter, onError]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: DesignStatus) {
    try {
      await adminFetch(`/api/designs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Status → ${DESIGN_STATUS_LABELS[status]?.label ?? status}`);
      setDesigns((prev) => prev?.map((d) => (d.id === id ? { ...d, status } : d)) ?? null);
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    } catch (err) {
      onError(err);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusyDelete(true);
    try {
      await adminFetch(`/api/designs/${deleting.id}`, { method: "DELETE" });
      toast.success("Design deleted");
      setDeleting(null);
      setSelected(null);
      load();
    } catch (err) {
      onError(err);
    } finally {
      setBusyDelete(false);
    }
  }

  return (
    <div className="space-y-4">
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
            {DESIGN_STATUS_LABELS[s]?.label ?? s}
          </button>
        ))}
      </div>

      {designs === null ? (
        <PageLoader label="Loading designs…" />
      ) : designs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Palette}
            title="No custom designs yet"
            subtitle="Designs submitted from the Design Studio will show up here."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {designs.map((d) => (
            <div key={d.id} className="card overflow-hidden">
              <button
                onClick={() => setSelected(d)}
                className="block w-full bg-ink-950 p-3 transition hover:opacity-90"
                aria-label={`View ${d.title}`}
              >
                <div className="aspect-[4/3]">
                  {d.previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.previewImage} alt={d.title} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gold-500">
                      <Palette className="h-10 w-10" />
                    </div>
                  )}
                </div>
              </button>
              <div className="space-y-2.5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-800">{d.title}</p>
                    <p className="text-xs text-ink-400">{formatDate(d.createdAt)}</p>
                  </div>
                  <Badge color={DESIGN_STATUS_LABELS[d.status]?.color ?? "bg-gray-100 text-gray-700"}>
                    {DESIGN_STATUS_LABELS[d.status]?.label ?? d.status}
                  </Badge>
                </div>
                {(d.customerName || d.phone) && (
                  <p className="flex items-center gap-2 text-xs text-ink-500">
                    {d.customerName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {d.customerName}
                      </span>
                    )}
                    {d.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {d.phone}
                      </span>
                    )}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <select
                    className="input flex-1 !py-1.5 text-xs"
                    value={d.status}
                    onChange={(e) => updateStatus(d.id, e.target.value as DesignStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {DESIGN_STATUS_LABELS[s]?.label ?? s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setDeleting(d)}
                    aria-label="Delete design"
                    className="rounded-lg p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && designs && designs.length > 0 && (
        <div className="card">
          <PaginationBar pagination={pagination} onPage={setPage} />
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ""}
        size="xl"
      >
        {selected && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl bg-ink-950 p-4">
              {selected.previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.previewImage}
                  alt={selected.title}
                  className="h-full max-h-96 w-full object-contain"
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-gold-500">
                  <Palette className="h-12 w-12" />
                </div>
              )}
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-ink-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-400">Shape</p>
                  <p className="font-semibold capitalize text-ink-800">{selected.config?.shape}</p>
                </div>
                <div className="rounded-lg bg-ink-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-400">Size</p>
                  <p className="font-semibold text-ink-800">{selected.config?.sizeLabel}</p>
                </div>
                <div className="rounded-lg bg-ink-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-400">Plate color</p>
                  <p className="flex items-center gap-2 font-semibold text-ink-800">
                    <span
                      className="h-4 w-4 rounded-full border border-ink-200"
                      style={{ background: selected.config?.bgColor }}
                    />
                    {selected.config?.bgColor}
                  </p>
                </div>
                <div className="rounded-lg bg-ink-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-400">Letter color</p>
                  <p className="flex items-center gap-2 font-semibold text-ink-800">
                    <span
                      className="h-4 w-4 rounded-full border border-ink-200"
                      style={{ background: selected.config?.textColor }}
                    />
                    {selected.config?.textColor}
                  </p>
                </div>
                <div className="rounded-lg bg-ink-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-400">Border</p>
                  <p className="font-semibold capitalize text-ink-800">{selected.config?.border}</p>
                </div>
                <div className="rounded-lg bg-ink-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-400">Icon</p>
                  <p className="font-semibold capitalize text-ink-800">{selected.config?.icon}</p>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">
                  Text lines
                </p>
                <ul className="space-y-1.5">
                  {selected.config?.lines?.filter((l) => l.text.trim()).map((line) => (
                    <li
                      key={line.id}
                      className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2"
                    >
                      <span className="font-bengali font-medium text-ink-800">{line.text}</span>
                      <span className="text-xs text-ink-400">
                        {line.font} · size {line.size}
                        {line.bold ? " · bold" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {(selected.customerName || selected.phone) && (
                <div className="rounded-lg bg-gold-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-gold-700">Customer</p>
                  <p className="font-semibold text-ink-800">
                    {selected.customerName ?? "—"} {selected.phone && `· ${selected.phone}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete design?"
        message={
          <>
            <span className="font-semibold">{deleting?.title}</span> will be permanently removed.
          </>
        }
        busy={busyDelete}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
