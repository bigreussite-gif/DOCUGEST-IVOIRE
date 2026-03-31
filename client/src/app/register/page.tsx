"use client";

/**
 * Page d’inscription (App Router) — appelle uniquement POST /api/auth/register (Route Handler Next).
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InlineAdStrip } from "@/components/promo/InlineAdStrip";
import { SorobossFooter } from "@/components/promo/SorobossFooter";
import { TrustModelBanner } from "@/components/trust/TrustModelBanner";
import { AdSlotsBootstrap } from "@/components/promo/AdSlotsBootstrap";
import { FRANCOPHONE_AFRICA_COUNTRIES, findCountryByCode } from "@/lib/francophonePolicy";
import { useAuthStore, type AuthUser } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [countryCode, setCountryCode] = useState("CI");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const selectedCountry = findCountryByCode(countryCode) ?? FRANCOPHONE_AFRICA_COUNTRIES[0];
      const localPhone = whatsapp.replace(/\D/g, "").replace(/^0+/, "");
      const whatsappFull = localPhone ? `${selectedCountry.dial}${localPhone}` : "";

      console.log("[register] envoi POST /api/auth/register");
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          whatsapp: whatsappFull,
          country: selectedCountry.label,
          password
        })
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        token?: string;
        user?: AuthUser;
      };

      if (!res.ok) {
        console.log("[register] erreur HTTP", res.status, data);
        setError(typeof data.message === "string" ? data.message : "Inscription impossible");
        return;
      }

      console.log("[register] succès, redirection dashboard");
      setSuccess(true);

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
          <div className="rounded-2xl bg-white px-3 py-2 shadow-soft ring-2 ring-slate-200/80">
            <img src="/logo-docugest-ivoire.png" alt="DocuGestIvoire" className="h-14 w-auto object-contain" />
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
              Inscription
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text sm:text-[1.75rem]">Créer un compte</h1>
            <p className="mt-2 text-sm text-slate-600">Commencez gratuitement en quelques secondes.</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Factures, devis et bulletins prêts plus vite, sans complexité inutile.
            </p>
          </div>

          <div className="mb-5">
            <TrustModelBanner variant="compact" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text">
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-border bg-bg px-4 py-3 text-base text-text outline-none ring-primary/25 transition focus:ring-2 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-border bg-bg px-4 py-3 text-base text-text outline-none ring-primary/25 transition focus:ring-2 sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-medium text-text">
                  Numéro WhatsApp
                </label>
                <div className="flex min-h-[48px] overflow-hidden rounded-2xl border border-border bg-bg ring-primary/25 focus-within:ring-2">
                  <span className="inline-flex shrink-0 items-center border-r border-border px-3 text-sm font-medium text-slate-700">
                    {findCountryByCode(countryCode)?.dial}
                  </span>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    autoComplete="tel"
                    placeholder="0700000000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="min-h-[48px] w-full min-w-0 px-3 py-2 text-base text-text outline-none sm:text-sm"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-text">
                  Pays
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="min-h-[48px] w-full rounded-2xl border border-border bg-bg px-4 py-3 text-base text-text outline-none ring-primary/25 focus:ring-2 sm:text-sm"
                >
                  {FRANCOPHONE_AFRICA_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-border bg-bg px-4 py-3 text-base text-text outline-none ring-primary/25 transition focus:ring-2 sm:text-sm"
              />
              <p className="mt-1.5 text-xs text-slate-500">Au moins 8 caractères.</p>
            </div>

            {success ? (
              <p className="rounded-2xl bg-emerald-500/12 px-4 py-3 text-sm font-medium text-emerald-900" role="status">
                Compte créé. Redirection…
              </p>
            ) : null}

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
              {loading ? "Création…" : "Créer mon compte"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              Me connecter
            </Link>
          </p>
          <p className="mt-3 text-center">
            <Link
              href="/forgot-password"
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Mot de passe oublié ? — réinitialiser par e-mail
            </Link>
          </p>

          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Pourquoi DocuGestIvoire ?</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
              Gagnez du temps, professionnalisez vos documents et inspirez confiance à vos clients.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-6 w-full max-w-md">
          <InlineAdStrip variant="compact" adSlot="register-inline" />
        </div>

        <div className="mx-auto mt-6 w-full max-w-md border-t border-slate-200/70 pt-5">
          <SorobossFooter />
        </div>
      </div>
    </div>
  );
}
