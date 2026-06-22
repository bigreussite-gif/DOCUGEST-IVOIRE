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

  async function handleGoogleLogin() {
    setError(null);
    try {
      const { error: sdkError } = await insforge.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (sdkError) setError(sdkError.message);
    } catch (err) {
      console.error("[google auth]", err);
      setError("Erreur avec Google Auth.");
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
        <div className="mx-auto mb-10 flex w-full max-w-md flex-col items-center justify-center gap-6">
          <Link href="/" className="flex flex-col items-center gap-4">
            <img src="/logo-docugest-ivoire.png" alt="DocuGestIvoire" className="h-32 w-auto object-contain" />
            <span className="text-xl font-black text-slate-900 tracking-tight">DocuGest Ivoire</span>
          </Link>
          <div className="flex gap-2 text-sm font-bold">
            <span className="text-slate-400">Nouveau sur la plateforme ?</span>
            <Link
              href="/register"
              className="text-primary hover:underline underline-offset-4"
            >
              Créer un compte
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-modal ring-1 ring-slate-200/50 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-[#111827] sm:text-4xl">Bon retour ! 👋</h1>
            <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed px-4">
              Connectez-vous pour retrouver vos documents et vos brouillons en cours.
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-5 text-base font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-200 active:scale-[0.98]"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="mx-4 flex-shrink-0 text-xs font-bold text-slate-400 uppercase tracking-widest">Ou</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>
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
            Accès sécurisé et protégé
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
