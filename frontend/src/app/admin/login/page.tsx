"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Spinner } from "@/components/admin/ui";
import Logo from "@/components/Logo";

interface LoginResponse {
  token: string;
  admin: { id: string; name: string; email: string };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("nz_admin_token")) router.replace("/admin/dashboard");
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email and password are required");
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      localStorage.setItem("nz_admin_token", res.token);
      localStorage.setItem("nz_admin", JSON.stringify(res.admin));
      toast.success(`Welcome back, ${res.admin.name}!`);
      router.replace("/admin/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-gold-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo dark />
        </div>

        <div className="rounded-2xl border border-gold-500/20 bg-ink-900/80 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h1 className="font-display text-xl font-bold text-white">Admin Panel</h1>
            <p className="mt-1 text-sm text-ink-400">Sign in to manage Nameplate Zone</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-300">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nameplatezone.com"
                  className="w-full rounded-lg border border-ink-700 bg-ink-950 px-4 py-2.5 pl-10 text-sm text-white outline-none transition placeholder:text-ink-600 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-300">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-ink-700 bg-ink-950 px-4 py-2.5 pl-10 text-sm text-white outline-none transition placeholder:text-ink-600 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
            </div>

            <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
              {busy ? <Spinner className="h-4 w-4 border-ink-900" /> : <Lock className="h-4 w-4" />}
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-gold-500/20 bg-gold-500/5 p-3 text-center text-xs text-ink-400">
            Default credentials — <span className="text-gold-400">admin@nameplatezone.com</span> /{" "}
            <span className="text-gold-400">admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
