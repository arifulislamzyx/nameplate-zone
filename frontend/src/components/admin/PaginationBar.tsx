"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "@/lib/types";

export default function PaginationBar({
  pagination,
  onPage,
}: {
  pagination: Pagination;
  onPage: (page: number) => void;
}) {
  const { page, totalPages, total } = pagination;
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-ink-100 px-5 py-3">
      <p className="text-xs text-ink-400">
        Page <span className="font-semibold text-ink-700">{page}</span> of{" "}
        {totalPages} · {total} total
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:bg-ink-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:bg-ink-50 disabled:opacity-40"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
