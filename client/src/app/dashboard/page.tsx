"use client";

import { useMemo } from "react";
import Link from "next/link";

type CachedUser = {
  full_name?: string;
  email?: string;
  role?: string;
};

export default function DashboardPage() {
  const user = useMemo((): CachedUser | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("docugest_user_cache");
      if (!raw) return null;
      return JSON.parse(raw) as CachedUser;
    } catch {
      return null;
    }
  }, []);

  return (
    <main className="min-h-screen bg-surface px-4 py-10">
      <section className="mx-auto max-w-2xl rounded-2xl bg-bg p-8 shadow-soft ring-1 ring-border/70">
        <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Bienvenue sur votre espace DocuGest.</p>

        <div className="mt-6 rounded-xl border border-border bg-white/60 p-4">
          <p className="text-sm">
            <span className="font-medium">Nom :</span> {user?.full_name ?? "Utilisateur"}
          </p>
          <p className="mt-1 text-sm">
            <span className="font-medium">Email :</span> {user?.email ?? "Non disponible"}
          </p>
          <p className="mt-1 text-sm">
            <span className="font-medium">Rôle :</span> {user?.role ?? "user"}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
            Accueil
          </Link>
          <Link href="/register" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text">
            Nouvelle inscription
          </Link>
        </div>
      </section>
    </main>
  );
}
