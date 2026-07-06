"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Palette,
  Mail,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { clearAdminSession } from "@/components/admin/ui";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/designs", label: "Custom Designs", icon: Palette },
  { href: "/admin/messages", label: "Messages", icon: Mail },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("nz_admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    try {
      const admin = JSON.parse(localStorage.getItem("nz_admin") ?? "{}");
      if (admin?.name) setAdminName(admin.name);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [router]);

  useEffect(() => setSidebarOpen(false), [pathname]);

  function logout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    );
  }

  const currentPage = NAV.find((n) => pathname.startsWith(n.href))?.label ?? "Admin";

  return (
    <div className="flex min-h-screen bg-ink-50/60">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink-950 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-800 px-5 py-5">
          <Link href="/admin/dashboard" className="leading-tight">
            <span className="block font-display text-lg font-bold text-white">
              Nameplate <span className="gold-gradient-text">Zone</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-ink-400">
              Admin Panel
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="thin-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-gold-500/20 to-gold-500/5 text-gold-300"
                    : "text-ink-300 hover:bg-ink-900 hover:text-gold-200"
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 h-[18px] w-[18px] ${active ? "text-gold-400" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink-800 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-ink-300 transition hover:bg-ink-900 hover:text-gold-200"
          >
            <ExternalLink className="h-[18px] w-[18px]" /> View Store
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="h-[18px] w-[18px]" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-ink-900">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-500 sm:block">
              Hello, <span className="font-semibold text-ink-800">{adminName}</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-gold-400 to-gold-600 font-display text-sm font-bold text-ink-950">
              {adminName.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
