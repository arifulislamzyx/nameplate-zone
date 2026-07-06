import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, PackageSearch, ServerOff } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Category, Pagination, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Nameplates | Nameplate Zone",
  description:
    "Browse premium custom acrylic nameplates — black plates with golden mirror lettering. House, office and Islamic nameplates delivered across Bangladesh.",
};

interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
  page?: string;
}

function buildQuery(params: SearchParams, page?: number): string {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.search) qs.set("search", params.search);
  if (params.sort) qs.set("sort", params.sort);
  if (page && page > 1) qs.set("page", String(page));
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);

  let categories: Category[] = [];
  let products: Product[] = [];
  let pagination: Pagination = { total: 0, page: 1, limit: 12, totalPages: 1 };
  let apiDown = false;

  try {
    const apiQs = new URLSearchParams();
    if (searchParams.category) apiQs.set("category", searchParams.category);
    if (searchParams.search) apiQs.set("search", searchParams.search);
    if (searchParams.sort) apiQs.set("sort", searchParams.sort);
    apiQs.set("page", String(page));
    apiQs.set("limit", "12");

    const [cats, data] = await Promise.all([
      apiFetch<Category[]>("/api/categories"),
      apiFetch<ProductsResponse>(`/api/products?${apiQs.toString()}`),
    ]);
    categories = cats;
    products = data.products;
    pagination = data.pagination;
  } catch {
    apiDown = true;
  }

  return (
    <div className="min-h-screen bg-ink-50/40">
      {/* Header band */}
      <section className="bg-ink-950 py-14 text-center sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
            Nameplate Zone
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Our <span className="gold-gradient-text">Nameplates</span>
          </h1>
          <p className="mt-3 font-bengali text-lg text-ink-300">
            আমাদের নেমপ্লেট কালেকশন
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {apiDown ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <ServerOff className="mx-auto h-12 w-12 text-ink-300" />
            <h2 className="mt-4 font-display text-2xl font-semibold text-ink-900">
              API server is not running
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              We couldn&apos;t reach the product catalogue. Please start the
              backend server and refresh this page.
            </p>
            <p className="mt-1 font-bengali text-sm text-ink-400">
              সার্ভারের সাথে সংযোগ করা যাচ্ছে না — একটু পরে আবার চেষ্টা করুন।
            </p>
            <Link href="/products" className="btn-dark mt-6">
              Try Again
            </Link>
          </div>
        ) : (
          <>
            <ProductFilters
              categories={categories}
              currentCategory={searchParams.category}
              currentSearch={searchParams.search}
              currentSort={searchParams.sort}
            />

            {products.length === 0 ? (
              <div className="card mx-auto max-w-lg p-10 text-center">
                <PackageSearch className="mx-auto h-12 w-12 text-ink-300" />
                <h2 className="mt-4 font-display text-2xl font-semibold text-ink-900">
                  No nameplates found
                </h2>
                <p className="mt-2 text-sm text-ink-500">
                  Nothing matches your current filters. Try a different
                  category or search term.
                </p>
                <p className="mt-1 font-bengali text-sm text-ink-400">
                  কোনো পণ্য পাওয়া যায়নি — অন্যভাবে খুঁজে দেখুন।
                </p>
                <Link href="/products" className="btn-dark mt-6">
                  Clear Filters
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-baseline justify-between">
                  <p className="text-sm text-ink-500">
                    Showing{" "}
                    <span className="font-semibold text-ink-800">
                      {products.length}
                    </span>{" "}
                    of {pagination.total} nameplates
                  </p>
                  {pagination.totalPages > 1 && (
                    <p className="text-sm text-ink-400">
                      Page {pagination.page} of {pagination.totalPages}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="mt-12 flex items-center justify-center gap-2"
                  >
                    {pagination.page > 1 ? (
                      <Link
                        href={`/products${buildQuery(searchParams, pagination.page - 1)}`}
                        className="inline-flex h-10 items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 transition hover:border-gold-400 hover:text-gold-700"
                      >
                        <ChevronLeft className="h-4 w-4" /> Prev
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 cursor-not-allowed items-center gap-1 rounded-lg border border-ink-100 bg-ink-50 px-3 text-sm font-medium text-ink-300">
                        <ChevronLeft className="h-4 w-4" /> Prev
                      </span>
                    )}

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((p) =>
                      p === pagination.page ? (
                        <span
                          key={p}
                          aria-current="page"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-ink-950 text-sm font-semibold text-gold-300 shadow"
                        >
                          {p}
                        </span>
                      ) : (
                        <Link
                          key={p}
                          href={`/products${buildQuery(searchParams, p)}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-sm font-medium text-ink-700 transition hover:border-gold-400 hover:text-gold-700"
                        >
                          {p}
                        </Link>
                      )
                    )}

                    {pagination.page < pagination.totalPages ? (
                      <Link
                        href={`/products${buildQuery(searchParams, pagination.page + 1)}`}
                        className="inline-flex h-10 items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 transition hover:border-gold-400 hover:text-gold-700"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 cursor-not-allowed items-center gap-1 rounded-lg border border-ink-100 bg-ink-50 px-3 text-sm font-medium text-ink-300">
                        Next <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
