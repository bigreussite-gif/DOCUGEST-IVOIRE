"use client";

/**
 * Page d’inscription (App Router) — appelle uniquement POST /api/auth/register (Route Handler Next).
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
      });

      const data = (await res.json().catch(() => ({}))) as { message?: string; token?: string; user?: unknown };

      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : "Inscription impossible");
        return;
      }

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
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl bg-bg p-8 shadow-soft ring-1 ring-border/70">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text">Créer un compte</h1>
          <Link href="/" className="text-sm text-primary hover:underline">
            Accueil
          </Link>
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

          {error ? (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Création…" : "Créer mon compte"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà un compte ?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            Me connecter
          </a>
        </p>
      </div>
    </div>
  );
}
