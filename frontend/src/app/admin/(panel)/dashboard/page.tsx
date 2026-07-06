"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BanknoteIcon,
  ShoppingBag,
  Clock,
  Package,
  Palette,
  MailWarning,
} from "lucide-react";
import { adminFetch } from "@/lib/api";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, DESIGN_STATUS_LABELS } from "@/lib/format";
import type { Order, CustomDesign } from "@/lib/types";
import StatCard from "@/components/admin/StatCard";
import { Badge, PageLoader, useApiError, EmptyState } from "@/components/admin/ui";

interface Stats {
  totals: {
    products: number;
    categories: number;
    orders: number;
    pendingOrders: number;
    designs: number;
    unreadMessages: number;
    revenue: number;
  };
  daily: { date: string; orders: number; revenue: number }[];
  recentOrders: Order[];
  recentDesigns: CustomDesign[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const onError = useApiError();

  const load = useCallback(async () => {
    try {
      setStats(await adminFetch<Stats>("/api/stats"));
    } catch (err) {
      onError(err, "Failed to load stats");
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load]);

  if (!stats) return <PageLoader label="Loading dashboard…" />;

  const { totals, daily, recentOrders, recentDesigns } = stats;
  const maxOrders = Math.max(1, ...daily.map((d) => d.orders));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Revenue" value={formatPrice(totals.revenue)} icon={BanknoteIcon} hint="Excluding cancelled orders" />
        <StatCard label="Total Orders" value={totals.orders} icon={ShoppingBag} />
        <StatCard label="Pending Orders" value={totals.pendingOrders} icon={Clock} hint="Need confirmation call" />
        <StatCard label="Products" value={totals.products} icon={Package} hint={`${totals.categories} categories`} />
        <StatCard label="Custom Designs" value={totals.designs} icon={Palette} hint="From Design Studio" />
        <StatCard label="Unread Messages" value={totals.unreadMessages} icon={MailWarning} />
      </div>

      {/* 30-day chart */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink-900">
            Orders — last 30 days
          </h2>
          <span className="text-xs text-ink-400">
            {daily.reduce((s, d) => s + d.orders, 0)} orders ·{" "}
            {formatPrice(daily.reduce((s, d) => s + d.revenue, 0))}
          </span>
        </div>
        {daily.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-400">No orders in the last 30 days yet.</p>
        ) : (
          <div className="flex h-40 items-end gap-1.5">
            {daily.map((d) => (
              <div
                key={d.date}
                title={`${d.date} — ${d.orders} orders · ${formatPrice(d.revenue)}`}
                className="group relative flex-1 rounded-t-md bg-gradient-to-t from-gold-600 to-gold-400 transition hover:from-gold-500 hover:to-gold-300"
                style={{ height: `${Math.max(8, (d.orders / maxOrders) * 100)}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-base font-semibold text-ink-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-gold-600 hover:text-gold-700">
              View all →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" subtitle="New orders will appear here." />
          ) : (
            <ul className="divide-y divide-ink-50">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-semibold text-ink-800">{o.orderNumber}</p>
                    <p className="truncate text-xs text-ink-400">
                      {o.customerName} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-ink-900">{formatPrice(o.total)}</span>
                  <Badge color={ORDER_STATUS_LABELS[o.status]?.color ?? "bg-gray-100 text-gray-700"}>
                    {ORDER_STATUS_LABELS[o.status]?.label ?? o.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-base font-semibold text-ink-900">Recent Custom Designs</h2>
            <Link href="/admin/designs" className="text-xs font-semibold text-gold-600 hover:text-gold-700">
              View all →
            </Link>
          </div>
          {recentDesigns.length === 0 ? (
            <EmptyState title="No designs yet" subtitle="Designs from the Design Studio will appear here." />
          ) : (
            <ul className="divide-y divide-ink-50">
              {recentDesigns.map((d) => (
                <li key={d.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-950 p-1">
                    {d.previewImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.previewImage} alt={d.title} className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gold-500">
                        <Palette className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-800">{d.title}</p>
                    <p className="truncate text-xs text-ink-400">
                      {d.customerName ?? "Anonymous"} · {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <Badge color={DESIGN_STATUS_LABELS[d.status]?.color ?? "bg-gray-100 text-gray-700"}>
                    {DESIGN_STATUS_LABELS[d.status]?.label ?? d.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
