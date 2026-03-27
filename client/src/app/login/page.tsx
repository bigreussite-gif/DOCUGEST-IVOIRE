"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InlineAdStrip } from "@/components/promo/InlineAdStrip";
import { SorobossFooter } from "@/components/promo/SorobossFooter";
import { TrustModelBanner } from "@/components/trust/TrustModelBanner";
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
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
      <div className="mx-auto mb-5 flex w-full max-w-md items-center justify-between">
        <div className="rounded-2xl bg-white px-3 py-2 shadow-lg ring-2 ring-primary/20">
          <img src="/logo-docugest-ivoire.png" alt="DocuGest Ivoire" className="h-10 w-auto object-contain drop-shadow" />
        </div>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Retour accueil
        </Link>
      </div>

      <div className="mx-auto max-w-md rounded-3xl bg-gradient-to-br from-white to-surface p-8 shadow-soft ring-1 ring-border/70">
        <div className="mb-6 text-center">
          <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Connexion
          </p>
          <h1 className="mt-3 text-2xl font-bold text-text">Bienvenue</h1>
          <p className="mt-1 text-sm text-slate-600">Accédez à votre espace DocuGest.</p>
          <p className="mt-2 text-xs text-slate-500">
            Espace professionnel pour l’Afrique francophone — factures, devis, bulletins.
          </p>
        </div>

        <div className="mb-5">
          <TrustModelBanner variant="compact" />
        </div>

        <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Productivité</p>
          <p className="mt-1 text-xs text-slate-700">
            Documents prêts à envoyer en quelques minutes, PDF inclus.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-text">
              Email ou numero (tel/WhatsApp)
            </label>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="username"
              required
              placeholder="ex: princekacou.digital@gmail.com ou +225777640050"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-text">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="primary" disabled={loading} className="shadow-lg shadow-primary/20">
            {loading ? "Connexion…" : "Me connecter"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
      <div className="mx-auto mt-4 w-full max-w-md">
        <InlineAdStrip
          variant="compact"
          heading="Partenaires"
          subheading="Votre attention sur ces offres aide à garder l’inscription et l’usage gratuits."
        />
      </div>
      <div className="mx-auto mt-4 w-full max-w-md border-t border-slate-200/70 pt-4">
        <SorobossFooter />
      </div>
      </div>
    </div>
  );
}
