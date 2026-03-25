import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/Button";
import { SorobossFooter } from "../components/promo/SorobossFooter";
import { Input } from "../components/ui/Input";
import { Checkbox } from "../components/ui/Checkbox";
import { useAuthStore } from "../store/authStore";

type Props = {
  initialTab: "login" | "register";
};

const phonePattern = /^(?:\+?225|225)?0\d{8}$|^\+?[1-9]\d{7,14}$/;

const registerSchema = z
  .object({
    prenom: z.string().min(2, "Prénom requis"),
    nom: z.string().min(2, "Nom requis"),
    phone: z
      .string()
      .min(8, "Numéro requis")
      .refine((v) => phonePattern.test(v.replace(/\s+/g, "")), "Format de téléphone invalide"),
    whatsappSame: z.boolean(),
    whatsapp: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v.length === 0 || phonePattern.test(v.replace(/\s+/g, "")),
        "Format WhatsApp invalide"
      ),
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Mot de passe min. 8 caractères"),
    confirmPassword: z.string().min(8, "Confirmation requise"),
    acceptTerms: z.boolean().refine((v) => v === true, "Vous devez accepter les conditions")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"]
  });

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  rememberMe: z.boolean()
});

const resetSchema = z.object({
  email: z.string().email("Email invalide")
});

export default function Auth({ initialTab }: Props) {
  const navigate = useNavigate();
  const auth = useAuthStore();
  const [tab, setTab] = useState<Props["initialTab"]>(initialTab);
  const [resetSent, setResetSent] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      prenom: "",
      nom: "",
      phone: "",
      whatsappSame: true,
      whatsapp: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false
    }
  });

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
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 ring-1 ring-primary/30" />
            <div>
              <div className="text-lg font-bold text-text">DocuGest Ivoire</div>
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
            <button
              className={[
                "flex-1 rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition",
                tab === "register"
                  ? "bg-primary text-white ring-primary/30"
                  : "bg-surface text-text ring-border/70 hover:bg-bg"
              ].join(" ")}
              onClick={() => {
                setResetMode(false);
                setResetSent(false);
                setTab("register");
              }}
              type="button"
            >
              Inscription
            </button>
            <button
              className={[
                "flex-1 rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition",
                tab === "login"
                  ? "bg-secondary text-white ring-secondary/30"
                  : "bg-surface text-text ring-border/70 hover:bg-bg"
              ].join(" ")}
              onClick={() => {
                setResetMode(false);
                setResetSent(false);
                setTab("login");
              }}
              type="button"
            >
              Connexion
            </button>
          </div>

          {tab === "register" ? (
            <form
              className="mt-6 grid gap-4"
              onSubmit={registerForm.handleSubmit(async (values) => {
                const whatsapp = values.whatsappSame ? values.phone : values.whatsapp ?? "";
                const full_name = `${values.prenom} ${values.nom}`.trim();
                const ok = await auth.register({
                  full_name,
                  phone: values.phone,
                  whatsapp: whatsapp || null,
                  email: values.email,
                  password: values.password
                });
                if (ok) navigate("/dashboard");
              })}
            >
              {auth.error ? <div className="rounded-xl bg-error/10 px-4 py-2 text-sm text-error">{auth.error}</div> : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input label="Prénom" {...registerForm.register("prenom")} error={registerForm.formState.errors.prenom?.message} />
                </div>
                <div>
                  <Input label="Nom complet" {...registerForm.register("nom")} error={registerForm.formState.errors.nom?.message} />
                </div>
              </div>

              <Input
                label="Numéro de téléphone"
                placeholder="+225 07xxxxxxxx"
                {...registerForm.register("phone")}
                error={registerForm.formState.errors.phone?.message}
              />

              <div className="flex flex-wrap items-center gap-4">
                <Checkbox
                  label="Même que téléphone"
                  {...registerForm.register("whatsappSame")}
                  defaultChecked
                />
                {!registerForm.watch("whatsappSame") ? (
                  <div className="w-full">
                    <Input label="Numéro WhatsApp" {...registerForm.register("whatsapp")} error={registerForm.formState.errors.whatsapp?.message} />
                  </div>
                ) : null}
              </div>

              <Input
                label="Adresse email"
                type="email"
                {...registerForm.register("email")}
                error={registerForm.formState.errors.email?.message}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Mot de passe"
                  type="password"
                  {...registerForm.register("password")}
                  error={registerForm.formState.errors.password?.message}
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  {...registerForm.register("confirmPassword")}
                  error={registerForm.formState.errors.confirmPassword?.message}
                />
              </div>

              <Checkbox
                label="J'accepte les conditions d'utilisation"
                {...registerForm.register("acceptTerms")}
                error={registerForm.formState.errors.acceptTerms?.message}
              />

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" disabled={auth.loading}>
                  {auth.loading ? "Création..." : "Créer mon compte"}
                </Button>
              </div>

              <div className="text-xs text-slate-600">
                En créant votre compte, vous acceptez les CGU. La vérification email est optionnelle dans cette V1.
              </div>
            </form>
          ) : (
            <form
              className="mt-6 grid gap-4"
              onSubmit={loginForm.handleSubmit(async (values) => {
                const ok = await auth.login(values);
                if (ok) navigate("/dashboard");
              })}
            >
              {auth.error ? <div className="rounded-xl bg-error/10 px-4 py-2 text-sm text-error">{auth.error}</div> : null}

              {resetMode ? (
                <div className="rounded-xl bg-surface p-4">
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
                      <div className="text-sm text-success">
                        Email envoyé. Vérifiez votre boîte de réception.
                      </div>
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
                <>
                  <Input label="Adresse email" type="email" {...loginForm.register("email")} error={loginForm.formState.errors.email?.message} />
                  <Input label="Mot de passe" type="password" {...loginForm.register("password")} error={loginForm.formState.errors.password?.message} />

                  <div className="flex items-start justify-between gap-4">
                    <Checkbox
                      label="Se souvenir de moi"
                      {...loginForm.register("rememberMe")}
                    />
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
                </>
              )}
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
    </div>
  );
}

