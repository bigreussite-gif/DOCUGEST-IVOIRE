"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InlineAdStrip } from "@/components/promo/InlineAdStrip";
import { SorobossFooter } from "@/components/promo/SorobossFooter";
import { TrustModelBanner } from "@/components/trust/TrustModelBanner";
import { AdSlotsBootstrap } from "@/components/promo/AdSlotsBootstrap";
import { useAuthStore, type AuthUser } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, rememberMe: true })
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        token?: string;
        user?: AuthUser;
      };
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : "Connexion impossible");
        return;
      }

      if (!data.token) {
        setError("Réponse serveur invalide (pas de session). Réessayez.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("docugest_token", data.token);
        localStorage.setItem("docugest_user_cache", JSON.stringify(data.user ?? {}));
        if (data.user && typeof data.user === "object" && "id" in data.user) {
          useAuthStore.setState({ user: data.user, loading: false, error: null });
        }
      }

      router.replace("/dashboard");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50/90 via-bg to-slate-50/85 px-4 py-6 sm:py-10"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <AdSlotsBootstrap />
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center">
        <div className="mx-auto mb-6 flex w-full max-w-md items-center justify-between gap-3">
          <div className="rounded-2xl bg-white px-3 py-2 shadow-soft ring-2 ring-primary/15">
            <img src="/logo-docugest-ivoire.png" alt="DocuGestIvoire" className="h-14 w-auto object-contain drop-shadow" />
          </div>
          <Link
            href="/"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-white/90 px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-border/50 transition hover:bg-surface"
          >
            Accueil
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl bg-gradient-to-br from-white to-surface p-6 shadow-soft ring-1 ring-border/70 sm:p-8">
          <div className="mb-6 text-center">
            <p className="inline-block rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Connexion
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text sm:text-[1.75rem]">Bienvenue</h1>
            <p className="mt-2 text-sm text-slate-600">Accédez à votre espace DocuGestIvoire.</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Espace professionnel pour l’Afrique francophone — factures, devis, bulletins.
            </p>
          </div>

          <div className="mb-5">
            <TrustModelBanner variant="compact" />
          </div>

          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Productivité</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
              Documents prêts à envoyer en quelques minutes, PDF inclus.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
                Email ou numéro (tél. / WhatsApp)
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                placeholder="ex: vous@email.com ou +225…"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-border bg-bg px-4 py-3 text-base text-text outline-none ring-primary/25 transition focus:ring-2 sm:text-sm"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-text">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-border bg-bg px-4 py-3 text-base text-text outline-none ring-primary/25 transition focus:ring-2 sm:text-sm"
              />
            </div>

            {error ? (
              <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm leading-snug text-error" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
            >
              {loading ? "Connexion…" : "Me connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>

        <div className="mx-auto mt-6 w-full max-w-md">
          <InlineAdStrip variant="compact" adSlot="login-inline" />
        </div>
        <div className="mx-auto mt-6 w-full max-w-md border-t border-slate-200/70 pt-5">
          <SorobossFooter />
        </div>
      </div>
    </div>
  );
}
