"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown } from "lucide-react";
import type { Category } from "@/lib/types";

interface ProductFiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentSearch?: string;
  currentSort?: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function ProductFilters({
  categories,
  currentCategory,
  currentSearch,
  currentSort,
}: ProductFiltersProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState(currentSearch ?? "");

  const navigate = (overrides: {
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    const params = new URLSearchParams();
    const category = overrides.category ?? currentCategory ?? "";
    const search = overrides.search ?? currentSearch ?? "";
    const sort = overrides.sort ?? currentSort ?? "";
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (sort && sort !== "newest") params.set("sort", sort);
    // page intentionally reset on any filter change
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate({ search: searchText.trim() });
  };

  const activeCategory = currentCategory ?? "";

  return (
    <div className="card sticky top-20 z-20 mb-8 p-4 shadow-md sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Category pills */}
        <div className="thin-scroll flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => navigate({ category: "" })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              activeCategory === ""
                ? "bg-ink-950 text-gold-300 shadow"
                : "bg-ink-50 text-ink-600 hover:bg-ink-100"
            }`}
          >
            All
            <span className="ml-1 font-bengali text-xs opacity-70">সব</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigate({ category: cat.slug })}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === cat.slug
                  ? "bg-ink-950 text-gold-300 shadow"
                  : "bg-ink-50 text-ink-600 hover:bg-ink-100"
              }`}
            >
              {cat.name}
              {cat._count != null && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    activeCategory === cat.slug
                      ? "bg-gold-400/20 text-gold-300"
                      : "bg-ink-200/60 text-ink-500"
                  }`}
                >
                  {cat._count.products}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search nameplates… খুঁজুন"
              className="input pl-9 pr-16"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-ink-950 px-3 py-1.5 text-xs font-semibold text-gold-300 transition hover:bg-ink-800"
            >
              Go
            </button>
          </form>

          <div className="relative sm:w-52">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <select
              value={currentSort ?? "newest"}
              onChange={(e) => navigate({ sort: e.target.value })}
              className="input appearance-none pl-9"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
