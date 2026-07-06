"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Inbox, type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Auth helpers                                                        */
/* ------------------------------------------------------------------ */

export function isAuthError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.message === "Authentication required" ||
      err.message === "Invalid or expired token")
  );
}

export function clearAdminSession() {
  localStorage.removeItem("nz_admin_token");
  localStorage.removeItem("nz_admin");
}

/**
 * Returns a stable error handler: auth errors clear the session and bounce
 * to the login page, everything else surfaces as an error toast.
 */
export function useApiError() {
  const router = useRouter();
  return useCallback(
    (err: unknown, fallback = "Something went wrong") => {
      if (isAuthError(err)) {
        clearAdminSession();
        toast.error("Session expired — please log in again.");
        router.replace("/admin/login");
        return;
      }
      toast.error(err instanceof Error ? err.message : fallback);
    },
    [router],
  );
}

/* ------------------------------------------------------------------ */
/* Loading / empty states                                              */
/* ------------------------------------------------------------------ */

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-gold-500 border-t-transparent ${className}`}
    />
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-ink-400">{label}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-14 rounded-lg bg-ink-100" />
          <div className="h-3 flex-1 rounded bg-ink-100" />
          <div className="hidden h-3 w-24 rounded bg-ink-100 sm:block" />
          <div className="hidden h-3 w-16 rounded bg-ink-100 md:block" />
          <div className="h-7 w-20 rounded-full bg-ink-100" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  subtitle,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
        <Icon className="h-7 w-7" />
      </div>
      <p className="font-semibold text-ink-800">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-ink-400">{subtitle}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

export function Badge({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {children}
    </span>
  );
}
