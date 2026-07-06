"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { adminFetch, apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Modal, ConfirmDialog } from "@/components/admin/Modal";
import { EmptyState, Spinner, TableSkeleton, useApiError } from "@/components/admin/ui";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", nameBn: "", description: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const onError = useApiError();

  const load = useCallback(async () => {
    try {
      setCategories(await apiFetch<Category[]>("/api/categories"));
    } catch (err) {
      onError(err, "Failed to load categories");
      setCategories([]);
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load]);

  function openForm(category: Category | null) {
    setEditing(category);
    setForm({
      name: category?.name ?? "",
      nameBn: category?.nameBn ?? "",
      description: category?.description ?? "",
      image: category?.image ?? "",
    });
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    const body = {
      name: form.name.trim(),
      nameBn: form.nameBn.trim() || null,
      description: form.description.trim() || null,
      image: form.image.trim() || null,
    };
    setSaving(true);
    try {
      if (editing) {
        await adminFetch(`/api/categories/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        toast.success("Category updated");
      } else {
        await adminFetch("/api/categories", { method: "POST", body: JSON.stringify(body) });
        toast.success("Category created");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusyDelete(true);
    try {
      await adminFetch(`/api/categories/${deleting.id}`, { method: "DELETE" });
      toast.success("Category deleted");
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
      <div className="flex justify-end">
        <button onClick={() => openForm(null)} className="btn-gold !py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="card overflow-hidden">
        {categories === null ? (
          <TableSkeleton rows={4} />
        ) : categories.length === 0 ? (
          <EmptyState icon={FolderTree} title="No categories yet" subtitle="Create a category to organise products." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 text-center font-semibold">Products</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {categories.map((c) => (
                  <tr key={c.id} className="transition hover:bg-gold-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-950 p-1">
                          {c.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.image} alt={c.name} className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gold-500">
                              <FolderTree className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-800">{c.name}</p>
                          {c.nameBn && (
                            <p className="truncate font-bengali text-xs text-ink-400">{c.nameBn}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-500">{c.slug}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
                        {c._count?.products ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openForm(c)}
                          aria-label="Edit"
                          className="rounded-lg p-2 text-ink-400 transition hover:bg-gold-100 hover:text-gold-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(c)}
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
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name (English) *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="House Nameplates"
            />
          </div>
          <div>
            <label className="label">Name (Bengali)</label>
            <input
              className="input font-bengali"
              value={form.nameBn}
              onChange={(e) => setForm((f) => ({ ...f, nameBn: e.target.value }))}
              placeholder="বাড়ির নেমপ্লেট"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[70px]"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Image URL / path</label>
            <input
              className="input"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="/products/house-classic.svg"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={saving}
              className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-gold !py-2 text-sm disabled:opacity-60">
              {saving && <Spinner className="h-4 w-4 border-ink-900" />}
              {editing ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete category?"
        message={
          <>
            <span className="font-semibold">{deleting?.name}</span> and{" "}
            <span className="font-semibold">all its products</span> will be permanently removed.
          </>
        }
        busy={busyDelete}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
