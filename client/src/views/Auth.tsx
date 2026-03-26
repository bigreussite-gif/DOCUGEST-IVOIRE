import { useState } from "react";
import Link from "next/link";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/Button";
import { SorobossFooter } from "../components/promo/SorobossFooter";
import { MonetizationBottomBar } from "../components/promo/MonetizationBottomBar";
import { Input } from "../components/ui/Input";
import { Checkbox } from "../components/ui/Checkbox";
import { useAuthStore } from "../store/authStore";

type Props = {
  initialTab?: "login";
};

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  rememberMe: z.boolean()
});

const resetSchema = z.object({
  email: z.string().email("Email invalide")
});

/**
 * Connexion / reset mot de passe. L’inscription est sur la page Next.js /register (App Router).
 */
export default function Auth(_props: Props) {
  const navigate = useNavigate();
  const auth = useAuthStore();
  const [resetSent, setResetSent] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true
    }
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" }
  });

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white px-3 py-2.5 shadow-lg ring-2 ring-slate-200/90">
              <img
                src="/logo-docugest-ivoire.png"
                alt="DocuGest Ivoire"
                className="h-14 w-auto max-w-[min(100%,300px)] object-contain object-left drop-shadow sm:h-16"
                width={300}
                height={64}
                loading="eager"
              />
            </div>
            <div className="hidden min-[380px]:block">
              <div className="text-sm text-slate-600">Gratuit et simple</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Retour
            </Button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-bg p-6 shadow-soft ring-1 ring-border/70">
          <div className="flex gap-3">
            <Link
              href="/register"
              className="flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white ring-1 ring-primary/30 transition hover:opacity-95"
            >
              Inscription
            </Link>
            <button
              type="button"
              className="flex-1 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white ring-1 ring-secondary/30"
            >
              Connexion
            </button>
          </div>

          {resetMode ? (
            <div className="mt-6 rounded-xl bg-surface p-4">
              <div className="text-sm font-semibold text-text">Mot de passe oublié</div>
              <div className="mt-2 text-sm text-slate-700">
                Saisissez votre email : un lien de réinitialisation sera envoyé.
              </div>
              <form
                className="mt-4 grid gap-3"
                onSubmit={resetForm.handleSubmit(async (rvalues) => {
                  await auth.requestPasswordReset(rvalues);
                  setResetSent(true);
                })}
              >
                <Input label="Email" type="email" {...resetForm.register("email")} error={resetForm.formState.errors.email?.message} />
                <Button type="submit" disabled={auth.loading}>
                  {auth.loading ? "Envoi..." : "Envoyer le lien"}
                </Button>
                {resetSent ? (
                  <div className="text-sm text-success">Email envoyé. Vérifiez votre boîte de réception.</div>
                ) : null}
              </form>
              <div className="mt-3">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setResetSent(false);
                  }}
                >
                  Retour à la connexion
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="mt-6 grid gap-4"
              onSubmit={loginForm.handleSubmit(async (values) => {
                const ok = await auth.login(values);
                if (ok) navigate("/dashboard");
              })}
            >
              {auth.error ? <div className="rounded-xl bg-error/10 px-4 py-2 text-sm text-error">{auth.error}</div> : null}

              <Input label="Adresse email" type="email" {...loginForm.register("email")} error={loginForm.formState.errors.email?.message} />
              <Input label="Mot de passe" type="password" {...loginForm.register("password")} error={loginForm.formState.errors.password?.message} />

              <div className="flex items-start justify-between gap-4">
                <Checkbox label="Se souvenir de moi" {...loginForm.register("rememberMe")} />
                <button
                  type="button"
                  className="text-sm font-semibold text-primary hover:underline"
                  onClick={() => setResetMode(true)}
                >
                  Mot de passe oublié
                </button>
              </div>

              <Button type="submit" disabled={auth.loading}>
                {auth.loading ? "Connexion..." : "Se connecter"}
              </Button>

              <div className="text-xs text-slate-600">
                Si vous ne parvenez pas à vous connecter, utilisez “Mot de passe oublié”.
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-slate-600">
          Application gratuite financée par la publicité — pensée pour les entrepreneurs d’Afrique francophone.
        </div>
        <div className="mt-8 border-t border-border/60 pt-6">
          <SorobossFooter />
        </div>
      </div>

      <MonetizationBottomBar />
    </div>
  );
}
