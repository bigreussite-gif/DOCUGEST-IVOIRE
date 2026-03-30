"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SorobossFooter } from "@/components/promo/SorobossFooter";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrMsg("Lien invalide ou expiré. Refaites une demande de réinitialisation.");
    }
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg("");

    if (newPassword.length < 8) {
      setErrMsg("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirm) {
      setErrMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (res.ok || res.status === 204) {
        setStatus("success");
        setTimeout(() => router.replace("/login"), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrMsg(typeof data.message === "string" ? data.message : "Erreur lors de la réinitialisation.");
        setStatus("error");
      }
    } catch {
      setErrMsg("Erreur réseau. Vérifiez votre connexion.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl bg-gradient-to-br from-white to-surface p-6 shadow-soft ring-1 ring-border/70 sm:p-8">

      {status === "success" ? (
        /* ── Succès ── */
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text">Mot de passe mis à jour !</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion…
          </p>
          <Link
            href="/login"
            className="mt-2 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-105"
          >
            Se connecter maintenant
          </Link>
        </div>
      ) : (
        /* ── Formulaire ── */
        <>
          <div className="mb-6 text-center">
            <p className="inline-block rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Nouveau mot de passe
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text sm:text-[1.75rem]">
              Choisissez un mot de passe
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Entrez votre nouveau mot de passe (8 caractères minimum).
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-text">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!token || status === "loading"}
                  className="min-h-[48px] w-full rounded-2xl border border-border bg-bg px-4 py-3 pr-12 text-base text-text outline-none ring-primary/25 transition focus:ring-2 disabled:opacity-50 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label={showPwd ? "Masquer" : "Afficher"}
                >
                  {showPwd ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  )}
                </button>
              </div>
              {/* Force indicator */}
              {newPassword.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i === 1 && newPassword.length >= 1 ? "bg-red-400"
                          : i === 2 && newPassword.length >= 6 ? "bg-yellow-400"
                          : i === 3 && newPassword.length >= 10 ? "bg-blue-400"
                          : i === 4 && newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? "bg-green-500"
                          : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    {newPassword.length < 6 ? "Faible" : newPassword.length < 10 ? "Moyen" : newPassword.length < 12 ? "Bon" : "Fort"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-text">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm"
                name="confirm"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Répétez le mot de passe"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={!token || status === "loading"}
                className={`min-h-[48px] w-full rounded-2xl border bg-bg px-4 py-3 text-base text-text outline-none ring-primary/25 transition focus:ring-2 disabled:opacity-50 sm:text-sm ${
                  confirm && confirm !== newPassword ? "border-red-400" : "border-border"
                }`}
              />
              {confirm && confirm !== newPassword && (
                <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {(status === "error" || errMsg) && (
              <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm leading-snug text-error" role="alert">
                {errMsg}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={!token || status === "loading" || newPassword !== confirm}
              className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
            >
              {status === "loading" ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              ← Retour à la connexion
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/90 via-bg to-slate-50/85 px-4 py-6 sm:py-10"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center">

        {/* Header */}
        <div className="mx-auto mb-6 flex w-full max-w-md items-center justify-between gap-3">
          <div className="rounded-2xl bg-white px-3 py-2 shadow-soft ring-2 ring-primary/15">
            <img src="/logo-docugest-ivoire.png" alt="DocuGestIvoire" className="h-14 w-auto object-contain drop-shadow" />
          </div>
          <Link
            href="/login"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-white/90 px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-border/50 transition hover:bg-surface"
          >
            ← Connexion
          </Link>
        </div>

        <Suspense fallback={
          <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-border/70">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <div className="mx-auto mt-6 w-full max-w-md border-t border-slate-200/70 pt-5">
          <SorobossFooter />
        </div>
      </div>
    </div>
  );
}
