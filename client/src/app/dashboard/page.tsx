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
    <main className="min-h-screen bg-surface px-[15px] py-8">
      <section className="mx-auto max-w-6xl rounded-2xl bg-bg p-5 shadow-soft ring-1 ring-border/70 sm:p-6">
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="mt-1 text-xs text-slate-600">Bienvenue sur votre espace DocuGest.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-white/70 p-4">
            <h2 className="text-sm font-semibold text-text">Profil</h2>
            <p className="mt-3 text-xs">
              <span className="font-medium">Nom :</span> {user?.full_name ?? "Utilisateur"}
            </p>
            <p className="mt-1 text-xs">
              <span className="font-medium">Email :</span> {user?.email ?? "Non disponible"}
            </p>
            <p className="mt-1 text-xs">
              <span className="font-medium">Role :</span> {user?.role ?? "user"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white/70 p-4">
            <h2 className="text-sm font-semibold text-text">Actions rapides</h2>
            <p className="mt-2 text-xs text-slate-600">
              Accedez directement aux pages principales pour gagner du temps.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/" className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white">
                Accueil
              </Link>
              <Link href="/dashboard/profile" className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-text">
                Mon profil
              </Link>
              <Link href="/register" className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-text">
                Nouvelle inscription
              </Link>
              <Link href="/login" className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-text">
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
