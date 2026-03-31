"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type CachedUser = { email?: string; role?: string; full_name?: string };

export default function SetupSuperAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CachedUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setToken(localStorage.getItem("docugest_token"));
    try {
      const raw = localStorage.getItem("docugest_user_cache");
      if (raw) setUser(JSON.parse(raw) as CachedUser);
    } catch {
      setUser(null);
    }
  }, []);

  const runBootstrap = useCallback(async () => {
    setMsg(null);
    setOk(false);
    const t = typeof window !== "undefined" ? localStorage.getItem("docugest_token") : null;
    if (!t) {
      setMsg("Vous devez d’abord vous connecter avec le compte prévu pour l’administration.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bootstrap-super-admin", {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        elevated?: boolean;
        reason?: string;
        message?: string;
      };
      if (res.ok) {
        if (data.reason === "already_super_admin") {
          setOk(true);
          setMsg("Votre compte est déjà super administrateur. Vous pouvez ouvrir le tableau de bord admin.");
          return;
        }
        if (data.elevated) {
          setOk(true);
          setMsg("Super administrateur activé. Rafraîchissement de la session…");
          const refresh = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { Authorization: `Bearer ${t}` },
          });
          const refData = (await refresh.json().catch(() => ({}))) as { token?: string; user?: unknown };
          if (refData.token) localStorage.setItem("docugest_token", refData.token);
          if (refData.user) localStorage.setItem("docugest_user_cache", JSON.stringify(refData.user));
          window.location.href = "/admin";
          return;
        }
        setMsg("Réponse inattendue du serveur.");
        return;
      }
      setMsg(typeof data.message === "string" ? data.message : `Erreur ${res.status}`);
    } catch {
      setMsg("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between gap-3">
          <img src="/logo-docugest-ivoire.png" alt="DocuGestIvoire" className="h-12 w-auto" />
          <Link
            href="/"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Accueil
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Installation</p>
          <h1 className="mt-2 text-2xl font-bold text-text">Activer le super administrateur</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Cette page sert à la <strong>première configuration</strong> : promouvoir en super administrateur le compte
            dont l’e-mail correspond à la variable serveur <code className="rounded bg-slate-100 px-1 text-xs">ADMIN_BOOTSTRAP_EMAIL</code>,{" "}
            <strong>tant qu’aucun</strong> super administrateur n’existe encore en base.
          </p>

          <ul className="mt-4 list-inside list-disc space-y-1.5 text-sm text-slate-700">
            <li>Sur Vercel : vérifiez que <code className="rounded bg-slate-100 px-1 text-xs">ADMIN_BOOTSTRAP_EMAIL</code> est bien l’e-mail du compte à promouvoir.</li>
            <li>Connectez-vous avec <strong>ce même compte</strong> puis cliquez sur le bouton ci-dessous.</li>
            <li>Si un super admin existe déjà, utilisez l’administration → Équipe pour gérer les rôles.</li>
          </ul>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm">
            {token ? (
              <p>
                Session détectée : <span className="font-semibold text-text">{user?.email ?? "—"}</span>
                {user?.role ? (
                  <span className="text-slate-500"> · rôle actuel : {user.role}</span>
                ) : null}
              </p>
            ) : (
              <p className="text-amber-900">Aucune session — connectez-vous d’abord.</p>
            )}
          </div>

          {msg ? (
            <p
              className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-snug ${
                ok ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200" : "bg-red-50 text-red-900 ring-1 ring-red-200"
              }`}
              role="status"
            >
              {msg}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/login"
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-border bg-white px-4 py-3 text-center text-sm font-semibold text-text shadow-sm transition hover:bg-slate-50"
            >
              Connexion
            </Link>
            <button
              type="button"
              disabled={loading || !token}
              onClick={() => void runBootstrap()}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Traitement…" : "Activer le super administrateur"}
            </button>
            <Link
              href="/admin"
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Ouvrir l’admin
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          URL à conserver pour les déploiements : <span className="font-mono text-slate-600">/setup-super-admin</span>
        </p>
      </div>
    </div>
  );
}
