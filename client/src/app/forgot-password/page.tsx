"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SorobossFooter } from "@/components/promo/SorobossFooter";
import { AdSlotsBootstrap } from "@/components/promo/AdSlotsBootstrap";
import { InlineAdStrip } from "@/components/promo/InlineAdStrip";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/auth/password-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok || res.status === 204) {
        setStatus("sent");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrMsg(typeof data.message === "string" ? data.message : "Une erreur est survenue.");
        setStatus("error");
      }
    } catch {
      setErrMsg("Erreur réseau. Vérifiez votre connexion.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/90 via-bg to-slate-50/85 px-4 py-6 sm:py-10"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
      <AdSlotsBootstrap />
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

        <div className="mx-auto w-full max-w-md rounded-3xl bg-gradient-to-br from-white to-surface p-6 shadow-soft ring-1 ring-border/70 sm:p-8">

          {status === "sent" ? (
            /* ── Succès ── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-text">Email envoyé !</h1>
              <p className="text-sm leading-relaxed text-slate-600">
                Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec un lien de réinitialisation (valable 1 heure).
              </p>
              <p className="text-xs text-slate-500">
                Vérifiez aussi vos spams.
              </p>
              <Link
                href="/login"
                className="mt-2 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-105"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            /* ── Formulaire ── */
            <>
              <div className="mb-6 text-center">
                <p className="inline-block rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Mot de passe oublié
                </p>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-text sm:text-[1.75rem]">
                  Réinitialisation
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Entrez votre email et nous vous enverrons un lien pour créer un nouveau mot de passe.
                </p>
                <p className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950">
                  <strong>Important :</strong> la réinitialisation se fait uniquement par <strong>e-mail</strong>, pas par numéro de téléphone / WhatsApp. Utilisez l’adresse e-mail associée à votre compte.
                </p>
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-[48px] w-full rounded-2xl border border-border bg-bg px-4 py-3 text-base text-text outline-none ring-primary/25 transition focus:ring-2 sm:text-sm"
                  />
                </div>

                {status === "error" && errMsg && (
                  <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm leading-snug text-error" role="alert">
                    {errMsg}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={status === "loading"}
                  className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
                >
                  {status === "loading" ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Vous vous souvenez ?{" "}
                <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>

        <div className="mx-auto mt-6 w-full max-w-md">
          <InlineAdStrip variant="compact" adSlot="forgot-password-inline" />
        </div>
        <div className="mx-auto mt-6 w-full max-w-md border-t border-slate-200/70 pt-5">
          <SorobossFooter />
        </div>
      </div>
    </div>
  );
}
