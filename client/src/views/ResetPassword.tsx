import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";
import { SorobossFooter } from "../components/promo/SorobossFooter";
import type { ApiError } from "../lib/api";

const schema = z.object({
  newPassword: z.string().min(8, "Min. 8 caractères")
});

type Values = z.infer<typeof schema>;

function useQuery() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}

function errorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as ApiError).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return "Erreur de réinitialisation";
}

function ResetPasswordForm({ token }: { token: string }) {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "" }
  });

  return (
    <form
      className="mt-6 grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        setLocalError(null);
        try {
          await auth.resetPassword({ token, newPassword: values.newPassword });
          navigate("/login");
        } catch (e: unknown) {
          setLocalError(errorMessage(e));
        }
      })}
    >
      {localError ? (
        <div className="rounded-xl bg-error/10 p-3 text-sm text-error">{localError}</div>
      ) : null}

      <Input label="Nouveau mot de passe" type="password" {...form.register("newPassword")} error={form.formState.errors.newPassword?.message} />

      <Button type="submit" disabled={auth.loading} className="mt-2">
        {auth.loading ? "Mise à jour..." : "Mettre à jour"}
      </Button>
    </form>
  );
}

export default function ResetPassword() {
  const query = useQuery();
  const token = query.get("token") ?? "";

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-bg p-6 shadow-soft ring-1 ring-border/70">
          <div className="text-lg font-bold text-text">Réinitialiser le mot de passe</div>
          <div className="mt-2 text-sm text-slate-600">Entrez un nouveau mot de passe pour votre compte.</div>

          {!token ? (
            <div className="mt-6 rounded-xl bg-error/10 p-3 text-sm text-error">
              Token manquant. Vérifiez le lien reçu par email.
            </div>
          ) : (
            <ResetPasswordForm key={token} token={token} />
          )}
        </div>
        <div className="mt-8">
          <SorobossFooter />
        </div>
      </div>
    </div>
  );
}
