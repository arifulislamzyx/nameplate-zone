"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Package, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { adminFetch, apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Category, Pagination, Product } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";
import PaginationBar from "@/components/admin/PaginationBar";
import { ConfirmDialog } from "@/components/admin/Modal";
import { EmptyState, TableSkeleton, useApiError } from "@/components/admin/ui";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const onError = useApiError();

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (query) params.set("search", query);
      const res = await apiFetch<{ products: Product[]; pagination: Pagination }>(
        `/api/products?${params}`
      );
      setProducts(res.products);
      setPagination(res.pagination);
    } catch (err) {
      onError(err, "Failed to load products");
      setProducts([]);
    }
  }, [page, query, onError]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    apiFetch<Category[]>("/api/categories").then(setCategories).catch(() => undefined);
  }, []);

  async function toggleFlag(product: Product, flag: "featured" | "inStock") {
    try {
      await adminFetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({ [flag]: !product[flag] }),
      });
      setProducts((prev) =>
        prev?.map((p) => (p.id === product.id ? { ...p, [flag]: !p[flag] } : p)) ?? null
      );
      toast.success(flag === "featured" ? "Featured updated" : "Stock status updated");
    } catch (err) {
      onError(err);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusyDelete(true);
    try {
      await adminFetch(`/api/products/${deleting.id}`, { method: "DELETE" });
      toast.success("Product deleted");
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
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search.trim());
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            className="input w-64 pl-9"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="btn-gold !py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {products === null ? (
          <TableSkeleton />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            subtitle={query ? `Nothing matches "${query}".` : "Add your first product to get started."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 text-center font-semibold">Featured</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {products.map((p) => (
                  <tr key={p.id} className="transition hover:bg-gold-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-950 p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.images[0] ?? "/products/house-classic.svg"}
                            alt={p.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-800">{p.name}</p>
                          {p.nameBn && (
                            <p className="truncate font-bengali text-xs text-ink-400">{p.nameBn}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{p.category?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-ink-900">
                        {formatPrice(p.discountPrice ?? p.price)}
                      </span>
                      {p.discountPrice != null && (
                        <span className="ml-1.5 text-xs text-ink-400 line-through">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFlag(p, "featured")}
                        aria-label="Toggle featured"
                        title="Toggle featured"
                        className="rounded-lg p-1.5 transition hover:bg-gold-100"
                      >
                        <Star
                          className={`h-4.5 w-4.5 h-[18px] w-[18px] ${
                            p.featured ? "fill-gold-400 text-gold-500" : "text-ink-300"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFlag(p, "inStock")}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
                          p.inStock
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {p.inStock ? "In stock" : "Out"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setFormOpen(true);
                          }}
                          aria-label="Edit"
                          className="rounded-lg p-2 text-ink-400 transition hover:bg-gold-100 hover:text-gold-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(p)}
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

      {formOpen && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
          }}
          onAuthError={(err) => onError(err)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete product?"
        message={
          <>
            <span className="font-semibold">{deleting?.name}</span> will be permanently removed.
            This cannot be undone.
          </>
        }
        busy={busyDelete}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
