"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InlineAdStrip } from "@/components/promo/InlineAdStrip";
import { SorobossFooter } from "@/components/promo/SorobossFooter";
import { TrustModelBanner } from "@/components/trust/TrustModelBanner";
import { AdSlotsBootstrap } from "@/components/promo/AdSlotsBootstrap";
import { useAuthStore, commitAuthSession } from "@/store/authStore";
import { insforge } from "@/lib/insforge";

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
      console.log("[login] connect via InsForge SDK");
      const { data, error: sdkError } = await insforge.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (sdkError) {
        console.error("[login] SDK error", sdkError);
        setError(sdkError.message || "Identifiants invalides ou erreur de connexion.");
        return;
      }

      if (!data?.accessToken || !data?.user) {
        setError("Réponse serveur invalide (pas de session).");
        return;
      }

      console.log("[login] succès, redirection dashboard");
      
      // Adaptation au store existant
      commitAuthSession(data.accessToken, data.user as any);
      await useAuthStore.getState().loadMe();

      router.replace("/dashboard");
    } catch (err) {
      console.error("[login] unexpected error", err);
      setError("Erreur réseau ou technique. Réessayez.");
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
        <div className="absolute -right-32 top-10 h-72 w-72 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -left-24 bottom-1/4 h-80 w-80 rounded-full bg-blue-500/5 blur-[120px]" />
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
            href="/register"
            className="text-sm font-bold text-primary hover:underline underline-offset-4"
          >
            Créer un compte
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-modal ring-1 ring-slate-200/50 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-[#111827] sm:text-4xl">Bon retour ! 👋</h1>
            <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed px-4">
              Connectez-vous pour retrouver vos documents et vos brouillons en cours.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-6">
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Mot de Passe
                </label>
                <Link href="/forgot-password" className="text-[11px] font-bold text-slate-500 hover:text-primary transition-colors">
                  Oublié ?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 text-base font-bold text-[#111827] outline-none transition-all focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {error ? (
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
              {loading ? "Connexion en cours..." : "Me connecter"}
            </Button>
          </form>

          <footer className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            Accès sécurisé et protégé par InsForge
          </footer>
        </div>

        <div className="mx-auto mt-10 w-full max-w-md">
           <TrustModelBanner variant="compact" />
        </div>

        <div className="mx-auto mt-10 w-full max-w-md">
          <InlineAdStrip variant="compact" adSlot="login-inline" />
        </div>

        <div className="mx-auto mt-12 w-full max-w-md">
          <SorobossFooter />
        </div>
      </div>
    </div>
  );
}
