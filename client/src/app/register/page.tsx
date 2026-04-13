"use client";

/**
 * Page d’inscription (App Router) — Utilise désormais l'InsForge SDK directement.
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
import { useAuthStore, commitAuthSession } from "@/store/authStore";
import { insforge } from "@/lib/insforge";

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

      console.log("[register] signup via InsForge SDK");
      const { data, error: sdkError } = await insforge.auth.signUp({
        email: email.trim(),
        password,
        name: name.trim()
      });

      if (sdkError) {
        console.error("[register] SDK error", sdkError);
        setError(sdkError.message || "Inscription impossible");
        return;
      }

      if (!data?.accessToken || !data?.user) {
        // En cas de confirmation par email activée, l'utilisateur n'est pas forcément connecté tout de suite.
        setSuccess(true);
        setError("Veuillez vérifier votre email pour confirmer votre compte.");
        return;
      }

      console.log("[register] succès, redirection dashboard");
      setSuccess(true);

      // Adaptation au store existant
      commitAuthSession(data.accessToken, data.user as any);
      await useAuthStore.getState().loadMe();

      router.replace("/dashboard");
    } catch (err: any) {
      console.error("[register] unexpected error", err);
      setError("Erreur inattendue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#FDFDFE] px-4 py-6 sm:py-10"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <AdSlotsBootstrap />
      
      {/* Decors background lineaires */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center">
        <div className="mx-auto mb-10 flex w-full max-w-md items-center justify-between gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="rounded-2xl bg-white p-2 shadow-soft ring-1 ring-slate-200/80 transition-transform group-hover:scale-105">
              <img src="/logo-docugest-ivoire.png" alt="DocuGestIvoire" className="h-10 w-auto object-contain" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">DocuGest Ivoire</span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-bold text-primary hover:underline underline-offset-4"
          >
            Se connecter
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-modal ring-1 ring-slate-200/50 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-[#111827] sm:text-4xl">C'est parti ! 🚀</h1>
            <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed px-4">
              Créez vos premiers documents professionnels en quelques secondes. C'est gratuit et sécurisé.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">
                Nom Complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Ex: Jean Kouassi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 text-base font-bold text-[#111827] outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">
                Email Professionnel
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jean@domaine.ci"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 text-base font-bold text-[#111827] outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="whatsapp" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">
                  Numéro WhatsApp
                </label>
                <div className="flex h-14 overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50/50 transition-all focus-within:border-primary/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10">
                  <span className="flex items-center border-r border-slate-100 px-3 text-xs font-bold text-slate-500">
                    {findCountryByCode(countryCode)?.dial}
                  </span>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    autoComplete="tel"
                    placeholder="07... 01..."
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 text-base font-bold text-[#111827] outline-none bg-transparent placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="country" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">
                  Localisation
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-primary/30 focus:bg-white"
                >
                  {FRANCOPHONE_AFRICA_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">
                Mot de Passe Sécurisé
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 text-base font-bold text-[#111827] outline-none transition-all focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {success ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 animate-fade-in border border-emerald-100" role="status">
                Compte créé avec succès ! 🎉 {error || "Redirection en cours..."}
              </div>
            ) : null}

            {error && !success ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 animate-fade-in border border-rose-100" role="alert">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="mt-2 h-16 rounded-[2rem] text-lg font-black shadow-primary-glow hover:scale-[1.01] active:scale-[0.98]"
            >
              {loading ? "Création en cours..." : "Créer mon compte — gratuit"}
            </Button>
          </form>

          <footer className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            Données cryptées & sécurisées par InsForge
          </footer>
        </div>

        <div className="mx-auto mt-10 w-full max-w-md">
           <TrustModelBanner variant="compact" />
        </div>

        <div className="mx-auto mt-10 w-full max-w-md">
          <InlineAdStrip variant="compact" adSlot="register-inline" />
        </div>

        <div className="mx-auto mt-12 w-full max-w-md">
          <SorobossFooter />
        </div>
      </div>
    </div>
  );
}
