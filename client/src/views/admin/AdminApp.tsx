import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AdminApiError, adminFetch, type AdminSession } from "../../lib/adminApi";
import { AdminLayout } from "./AdminLayout";
import { AdminDashboard } from "./AdminDashboard";
import { AdminUsers } from "./AdminUsers";
import { AdminAudit } from "./AdminAudit";
import { AdminDocuments } from "./AdminDocuments";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { apiFetch } from "../../lib/api";

export default function AdminApp() {
  const location = useLocation();
  const [session, setSession] = useState<AdminSession | null | "forbidden" | "loading">("loading");
  const [bootstrapBusy, setBootstrapBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadSession = async () => {
      try {
        const s = await adminFetch<AdminSession>("/session");
        if (!cancelled) setSession(s);
      } catch (e) {
        if (!cancelled) {
          if (e instanceof AdminApiError && e.status === 403) setSession("forbidden");
          else setSession(null);
        }
      }
    };
    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  if (session === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Chargement du back-office…
      </div>
    );
  }

  if (session === "forbidden") {
    if (location.pathname.startsWith("/admin/login")) {
      return <AdminLogin onLoggedIn={(s) => setSession(s)} forceFreshLogin />;
    }
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-xl font-bold text-text">Accès réservé</h1>
        <p className="mt-3 text-slate-600">
          Votre compte n’a pas les droits pour accéder à l’administration DocuGest. Contactez un administrateur
          général.
        </p>
        <button
          type="button"
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={bootstrapBusy}
          onClick={async () => {
            setBootstrapBusy(true);
            try {
              await adminFetch("/bootstrap-super-admin", { method: "POST" });
              const s = await adminFetch<AdminSession>("/session");
              setSession(s);
            } catch {
              // noop: keep forbidden message
            } finally {
              setBootstrapBusy(false);
            }
          }}
        >
          {bootstrapBusy ? "Activation..." : "Tenter activation super admin"}
        </button>
        <button
          type="button"
          className="mt-3 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => {
            localStorage.removeItem("docugest_token");
            localStorage.removeItem("docugest_user_cache");
            window.location.replace("/admin/login");
          }}
        >
          Se connecter avec un autre compte
        </button>
        <a href="/dashboard" className="mt-6 inline-block text-primary underline">
          Retour à l’app
        </a>
      </div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="login" element={<AdminLogin onLoggedIn={(s) => setSession(s)} />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="login" element={<Navigate to="/admin" replace />} />
      <Route element={<AdminLayout session={session} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit" element={<AdminAudit />} />
      </Route>
    </Routes>
  );
}

function AdminLogin({
  onLoggedIn,
  forceFreshLogin = false
}: {
  onLoggedIn: (s: AdminSession) => void;
  forceFreshLogin?: boolean;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!forceFreshLogin) return;
    localStorage.removeItem("docugest_token");
    localStorage.removeItem("docugest_user_cache");
  }, [forceFreshLogin]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ token?: string; user?: unknown; message?: string }>("/api/auth/login", {
        method: "POST",
        json: { email: email.trim(), password, rememberMe: true }
      });
      if (data?.token) {
        localStorage.setItem("docugest_token", data.token);
      }
      if (data?.user) {
        localStorage.setItem("docugest_user_cache", JSON.stringify(data.user));
      }
      const session = await adminFetch<AdminSession>("/session");
      onLoggedIn(session);
      navigate("/admin", { replace: true });
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 403) {
        setError("Compte connecté, mais sans droits admin.");
      } else if (e && typeof e === "object" && "message" in e) {
        setError(String((e as { message?: string }).message ?? "Connexion impossible"));
      } else {
        setError("Connexion admin impossible.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-text">Connexion administrateur</h1>
        <p className="mt-1 text-sm text-slate-600">Accès au tableau de bord admin DocuGest.</p>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter (admin)"}
          </Button>
        </form>
      </div>
    </div>
  );
}
