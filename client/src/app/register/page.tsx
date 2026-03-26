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
import { FRANCOPHONE_AFRICA_COUNTRIES, findCountryByCode } from "@/lib/francophonePolicy";

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

      const data = (await res.json().catch(() => ({}))) as { message?: string; token?: string; user?: unknown };

      if (!res.ok) {
        console.log("[register] erreur HTTP", res.status, data);
        setError(typeof data.message === "string" ? data.message : "Inscription impossible");
        return;
      }

      console.log("[register] succès, redirection dashboard");
      setSuccess(true);

      if (data.token && typeof window !== "undefined") {
        localStorage.setItem("docugest_token", data.token);
        localStorage.setItem("docugest_user_cache", JSON.stringify(data.user ?? {}));
      }

      router.push("/dashboard");
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
        <div className="rounded-2xl bg-white px-3 py-2 shadow-lg ring-2 ring-slate-200/90">
          <img src="/logo-docugest-ivoire.png" alt="DocuGest Ivoire" className="h-10 w-auto object-contain" />
        </div>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Retour accueil
        </Link>
      </div>

      <div className="mx-auto max-w-md rounded-3xl bg-gradient-to-br from-white to-surface p-8 shadow-soft ring-1 ring-border/70">
        <div className="mb-6 text-center">
          <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Inscription
          </p>
          <h1 className="mt-3 text-2xl font-bold text-text">Créer un compte</h1>
          <p className="mt-1 text-sm text-slate-600">Commencez gratuitement en quelques secondes.</p>
          <p className="mt-2 text-xs text-slate-500">
            Factures, devis et bulletins prets plus vite, sans complexite.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-text">
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
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-text">
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
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium text-text">
                Numero WhatsApp
              </label>
              <div className="flex overflow-hidden rounded-xl border border-border bg-bg ring-primary/30 focus-within:ring-2">
                <span className="inline-flex items-center gap-1 border-r border-border px-3 text-sm text-slate-700">
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
                  className="w-full px-3 py-2 text-text outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="country" className="mb-1 block text-sm font-medium text-text">
                Pays
              </label>
              <select
                id="country"
                name="country"
                required
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
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
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-text">
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
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500">Au moins 8 caractères.</p>
          </div>

          {success ? (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200" role="status">
              Compte créé. Redirection…
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="primary" disabled={loading} className="shadow-lg shadow-primary/20">
            {loading ? "Création…" : "Créer mon compte"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Me connecter
          </Link>
        </p>

        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Pourquoi DocuGest ?</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">
            Gagnez du temps, professionnalisez vos documents et inspirez confiance a vos clients.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-4 w-full max-w-md">
        <InlineAdStrip variant="compact" />
      </div>

      <div className="mx-auto mt-4 w-full max-w-md border-t border-slate-200/70 pt-4">
        <SorobossFooter />
      </div>
      </div>
    </div>
  );
}
