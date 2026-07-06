"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  ImagePlus,
  Link2,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { API_URL, adminFetch } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { Spinner, isAuthError } from "./ui";

const SHAPES = ["RECTANGLE", "WIDE", "ROUND", "SQUARE"] as const;

interface SizeRow {
  label: string;
  price: string;
}

export default function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
  onAuthError,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
  onAuthError: (err: unknown) => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    nameBn: product?.nameBn ?? "",
    description: product?.description ?? "",
    descriptionBn: product?.descriptionBn ?? "",
    price: product ? String(product.price) : "",
    discountPrice:
      product?.discountPrice != null ? String(product.discountPrice) : "",
    material: product?.material ?? "Premium Acrylic",
    shape: product?.shape ?? "RECTANGLE",
    categoryId: product?.categoryId ?? "",
    featured: product?.featured ?? false,
    inStock: product?.inStock ?? true,
  });
  const [sizes, setSizes] = useState<SizeRow[]>(
    product?.sizes?.length
      ? product.sizes.map((s) => ({ label: s.label, price: String(s.price) }))
      : [{ label: "", price: "" }],
  );
  const [features, setFeatures] = useState<string[]>(
    product?.features?.length ? [...product.features] : [""],
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /* ---------------- images ---------------- */

  async function handleUpload(files: FileList | null) {
    const list = Array.from(files ?? []).slice(0, 6);
    if (!list.length) return;
    const fd = new FormData();
    list.forEach((f) => fd.append("images", f));
    setUploading(true);
    try {
      const token = localStorage.getItem("nz_admin_token");
      const res = await fetch(`${API_URL}/api/uploads`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
        images?: { url: string }[];
      };
      if (!res.ok) {
        throw new Error(body.message ?? `Upload failed (${res.status})`);
      }
      const urls = (body.images ?? []).map((i) => i.url);
      if (!urls.length) throw new Error("No images returned by server");
      setImages((prev) => [...prev, ...urls]);
      toast.success(
        urls.length === 1 ? "Image uploaded" : `${urls.length} images uploaded`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Upload failed — you can still add image URLs manually below.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (images.includes(url)) {
      toast.error("That image is already in the list");
      return;
    }
    setImages((prev) => [...prev, url]);
    setUrlInput("");
  }

  /* ---------------- submit ---------------- */

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const price = Number(form.price);
    const discount = form.discountPrice.trim()
      ? Number(form.discountPrice)
      : null;

    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!Number.isFinite(price) || price <= 0)
      return toast.error("Enter a valid price");
    if (discount != null && (!Number.isFinite(discount) || discount <= 0))
      return toast.error("Discount price must be a valid number");
    if (discount != null && discount >= price)
      return toast.error("Discount price must be lower than the price");
    if (!form.categoryId) return toast.error("Select a category");

    const body = {
      name: form.name.trim(),
      nameBn: form.nameBn.trim() || null,
      description: form.description.trim(),
      descriptionBn: form.descriptionBn.trim() || null,
      price,
      discountPrice: discount,
      images,
      material: form.material.trim() || "Acrylic",
      shape: form.shape,
      sizes: sizes
        .filter((s) => s.label.trim())
        .map((s) => ({ label: s.label.trim(), price: Number(s.price) || 0 })),
      features: features.map((f) => f.trim()).filter(Boolean),
      featured: form.featured,
      inStock: form.inStock,
      categoryId: form.categoryId,
    };

    setSaving(true);
    try {
      if (product) {
        await adminFetch(`/api/products/${product.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        toast.success("Product updated");
      } else {
        await adminFetch("/api/products", {
          method: "POST",
          body: JSON.stringify(body),
        });
        toast.success("Product created");
      }
      onSaved();
    } catch (err) {
      if (isAuthError(err)) {
        onAuthError(err);
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to save product");
      }
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- render ---------------- */

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 bg-ink-950 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-gold-300">
              {product ? "Edit Product" : "Add Product"}
            </h2>
            {product && (
              <p className="text-xs text-ink-400">{product.name}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-300 transition hover:bg-ink-800 hover:text-gold-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="thin-scroll flex-1 space-y-6 overflow-y-auto p-6"
        >
          {/* Basic info */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name (English) *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Classic House Nameplate"
              />
            </div>
            <div>
              <label className="label">Name (Bengali)</label>
              <input
                className="input font-bengali"
                value={form.nameBn}
                onChange={(e) => set("nameBn", e.target.value)}
                placeholder="ক্লাসিক নেমপ্লেট"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description (English) *</label>
              <textarea
                className="input min-h-[80px]"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the product…"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description (Bengali)</label>
              <textarea
                className="input min-h-[64px] font-bengali"
                value={form.descriptionBn}
                onChange={(e) => set("descriptionBn", e.target.value)}
              />
            </div>
          </section>

          {/* Pricing & classification */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Price (৳) *</label>
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="1500"
              />
            </div>
            <div>
              <label className="label">Discount Price (৳)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                value={form.discountPrice}
                onChange={(e) => set("discountPrice", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="label">Category *</label>
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Shape</label>
              <select
                className="input"
                value={form.shape}
                onChange={(e) => set("shape", e.target.value)}
              >
                {SHAPES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Material</label>
              <input
                className="input"
                value={form.material}
                onChange={(e) => set("material", e.target.value)}
                placeholder="Premium Acrylic"
              />
            </div>
          </section>

          {/* Images */}
          <section>
            <label className="label">Images</label>
            {images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {images.map((img) => (
                  <div
                    key={img}
                    className="group relative h-20 w-24 overflow-hidden rounded-lg bg-ink-950 p-1.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt="Product"
                      className="h-full w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((i) => i !== img))
                      }
                      aria-label="Remove image"
                      className="absolute right-1 top-1 rounded-full bg-red-600 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 px-4 py-3 text-sm font-medium text-ink-500 transition hover:border-gold-400 hover:text-gold-600 disabled:opacity-60"
              >
                {uploading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                {uploading ? "Uploading…" : "Upload images (max 6)"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleUpload(e.target.files)}
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
                  <input
                    className="input pl-9"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addUrl();
                      }
                    }}
                    placeholder="/products/house-classic.svg"
                  />
                </div>
                <button
                  type="button"
                  onClick={addUrl}
                  className="rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-600 transition hover:border-gold-400 hover:text-gold-600"
                  aria-label="Add image URL"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-ink-400">
              Upload files or paste an image URL / public path and press add.
            </p>
          </section>

          {/* Sizes */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">Sizes</label>
              <button
                type="button"
                onClick={() =>
                  setSizes((prev) => [...prev, { label: "", price: "" }])
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-gold-600 hover:text-gold-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add size
              </button>
            </div>
            <div className="space-y-2">
              {sizes.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input flex-1"
                    value={row.label}
                    onChange={(e) =>
                      setSizes((prev) =>
                        prev.map((r, j) =>
                          j === i ? { ...r, label: e.target.value } : r,
                        ),
                      )
                    }
                    placeholder={'12" x 8"'}
                  />
                  <input
                    className="input w-32"
                    type="number"
                    min="0"
                    value={row.price}
                    onChange={(e) =>
                      setSizes((prev) =>
                        prev.map((r, j) =>
                          j === i ? { ...r, price: e.target.value } : r,
                        ),
                      )
                    }
                    placeholder="Price ৳"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSizes((prev) => prev.filter((_, j) => j !== i))
                    }
                    aria-label="Remove size"
                    className="rounded-lg p-2 text-ink-300 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">Features</label>
              <button
                type="button"
                onClick={() => setFeatures((prev) => [...prev, ""])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gold-600 hover:text-gold-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add feature
              </button>
            </div>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input flex-1"
                    value={f}
                    onChange={(e) =>
                      setFeatures((prev) =>
                        prev.map((v, j) => (j === i ? e.target.value : v)),
                      )
                    }
                    placeholder="Weatherproof UV print"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFeatures((prev) => prev.filter((_, j) => j !== i))
                    }
                    aria-label="Remove feature"
                    className="rounded-lg p-2 text-ink-300 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Flags */}
          <section className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 accent-gold-500"
              />
              Featured product
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-700">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => set("inStock", e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 accent-gold-500"
              />
              In stock
            </label>
          </section>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-ink-100 bg-ink-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) =>
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
            }
            disabled={saving || uploading}
            className="btn-gold px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {saving && <Spinner className="h-4 w-4 border-ink-900" />}
            {product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
