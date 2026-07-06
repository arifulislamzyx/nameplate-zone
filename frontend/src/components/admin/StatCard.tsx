"use client";

import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-gold-100 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-400">
            {label}
          </p>
          <p className="mt-1.5 truncate font-display text-2xl font-bold text-ink-900">
            {value}
          </p>
          {hint && <p className="mt-1 truncate text-xs text-ink-400">{hint}</p>}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 shadow-md shadow-gold-500/25">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
