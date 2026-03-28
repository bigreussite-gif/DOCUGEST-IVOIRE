import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AdminApiError, adminFetch, type AdminSession } from "../../lib/adminApi";
import { AdminLayout } from "./AdminLayout";
import { AdminDashboard } from "./AdminDashboard";
import { AdminUsers } from "./AdminUsers";
import { AdminAudit } from "./AdminAudit";
import { AdminDocuments } from "./AdminDocuments";
import { AdminAds } from "./AdminAds";
import { AdminComingSoon } from "./AdminComingSoon";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function AdminApp() {
  const location = useLocation();
  const [session, setSession] = useState<AdminSession | null | "forbidden" | "loading">("loading");
  const [bootstrapBusy, setBootstrapBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadSession = async () => {
      const token = localStorage.getItem("docugest_token");
      if (!token) {
        if (!cancelled) setSession(null);
        return;
      }
      try {
        const s = await adminFetch<AdminSession>("/session");
        if (!cancelled) setSession(s);
      } catch (e) {
        if (!cancelled) {
          if (e instanceof AdminApiError && e.status === 403) {
            setSession("forbidden");
          } else {
            if (e instanceof AdminApiError && e.status === 401) {
              localStorage.removeItem("docugest_token");
              localStorage.removeItem("docugest_user_cache");
            }
            setSession(null);
          }
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
        <Route path="session" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="login" element={<Navigate to="/admin" replace />} />
      <Route path="session" element={<Navigate to="/admin" replace />} />
      <Route element={<AdminLayout session={session} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="ads" element={<AdminAds />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route
          path="reports"
          element={
            <AdminComingSoon
              title="Rapports & exports"
              description="Exports PDF/Excel, tableaux de bord partagés et snapshots pour investisseurs — en cours de conception."
              highlights={["Exports planifiés", "Filtres multi-tenant", "Partage sécurisé (lien à durée limitée)"]}
            />
          }
        />
        <Route
          path="growth"
          element={
            <AdminComingSoon
              title="Croissance & partenariats"
              description="Vue pipeline partenaires, campagnes et co-marketing pour accélérer l’acquisition sur les marchés cibles."
              highlights={["Suivi des leads B2B", "Intégrations annonceurs", "Objectifs trimestriels"]}
            />
          }
        />
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
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedIdentity, setCachedIdentity] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    if (!forceFreshLogin) return;
    localStorage.removeItem("docugest_token");
    localStorage.removeItem("docugest_user_cache");
  }, [forceFreshLogin]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("docugest_user_cache");
      if (!raw) {
        setCachedIdentity(null);
        return;
      }
      const u = JSON.parse(raw) as { email?: string; role?: string };
      if (u?.email) {
        setCachedIdentity({ email: String(u.email), role: String(u.role ?? "user") });
      } else {
        setCachedIdentity(null);
      }
    } catch {
      setCachedIdentity(null);
    }
  }, []);

  /** Tente de rafraîchir le token (rôle actuel en base) puis ré-essaie la session admin. */
  async function tryRefreshThenSession(): Promise<AdminSession | null> {
    try {
      const token = localStorage.getItem("docugest_token");
      if (!token) return null;
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null;
      const data = (await res.json().catch(() => ({}))) as { token?: string; user?: unknown };
      if (data?.token) {
        localStorage.setItem("docugest_token", data.token);
      }
      if (data?.user) {
        localStorage.setItem("docugest_user_cache", JSON.stringify(data.user));
      }
      // Re-tente la session avec le nouveau token
      const session = await adminFetch<AdminSession>("/session");
      return session;
    } catch {
      return null;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, rememberMe: true })
      });
      const data = (await res.json().catch(() => ({}))) as { token?: string; user?: unknown; message?: string };
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : "Connexion impossible");
        return;
      }
      if (!data?.token) {
        setError("Connexion réussie mais token absent. Vérifiez la configuration serveur.");
        return;
      }
      localStorage.setItem("docugest_token", data.token);
      if (data?.user) {
        localStorage.setItem("docugest_user_cache", JSON.stringify(data.user));
      }

      let session: AdminSession | null = null;
      try {
        session = await adminFetch<AdminSession>("/session");
      } catch (e) {
        if (e instanceof AdminApiError && e.status === 403) {
          // Token potentiellement stale (rôle promu en base après émission du JWT).
          // On tente un refresh automatique.
          session = await tryRefreshThenSession();
          if (!session) {
            setError("Compte connecté, mais sans droits admin.");
            return;
          }
        } else {
          throw e;
        }
      }

      if (session) {
        onLoggedIn(session);
        navigate("/admin", { replace: true });
      }
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 401) {
        localStorage.removeItem("docugest_token");
        localStorage.removeItem("docugest_user_cache");
        setError("Session invalide. Reconnectez-vous.");
      } else if (e && typeof e === "object" && "message" in e) {
        setError(String((e as { message?: string }).message ?? "Connexion impossible"));
      } else {
        setError("Connexion admin impossible.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function tryActivateSuperAdmin() {
    setActivating(true);
    setError(null);
    try {
      // Tente le bootstrap (peut échouer si déjà super_admin ou config manquante)
      try {
        await adminFetch("/bootstrap-super-admin", { method: "POST" });
      } catch (bootstrapErr) {
        // Si le bootstrap dit "already_super_admin" ou "Un super administrateur existe déjà"
        // on continue quand même avec le refresh du token
        const msg = bootstrapErr instanceof AdminApiError
          ? bootstrapErr.message
          : String((bootstrapErr as { message?: string })?.message ?? "");
        if (!msg.includes("déjà") && !msg.includes("already")) throw bootstrapErr;
      }

      // Rafraîchit le token pour inclure le rôle actuel en base
      const refreshed = await tryRefreshThenSession();
      if (refreshed) {
        onLoggedIn(refreshed);
        navigate("/admin", { replace: true });
        return;
      }

      // Fallback : session directe
      const session = await adminFetch<AdminSession>("/session");
      onLoggedIn(session);
      navigate("/admin", { replace: true });
    } catch (e) {
      if (e && typeof e === "object" && "message" in e) {
        setError(String((e as { message?: string }).message ?? "Activation impossible"));
      } else {
        setError("Activation super admin impossible.");
      }
    } finally {
      setActivating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-emerald-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6">
        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Espace administration securise
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-text sm:text-4xl">
              Pilotez DocuGest avec une
              <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent"> vision claire </span>
              et fiable.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              Connectez-vous pour suivre les indicateurs clés, superviser les documents et garder une gouvernance solide de
              la plateforme.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-border/60">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Confiance</div>
                <div className="mt-1 text-sm font-semibold text-text">Audit & roles</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-border/60">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Performance</div>
                <div className="mt-1 text-sm font-semibold text-text">Metriques live</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-border/60">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Croissance</div>
                <div className="mt-1 text-sm font-semibold text-text">Signal business</div>
              </div>
            </div>
          </div>

          <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-text">Connexion administrateur</h2>
              <p className="mt-1 text-sm text-slate-600">Accès au tableau de bord admin DocuGest.</p>
            </div>
            {cachedIdentity ? (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <div>
                  Session locale détectée: <span className="font-semibold">{cachedIdentity.email}</span> · rôle{" "}
                  <span className="font-semibold">{cachedIdentity.role}</span>
                </div>
                <button
                  type="button"
                  className="mt-1 underline"
                  onClick={() => {
                    localStorage.removeItem("docugest_token");
                    localStorage.removeItem("docugest_user_cache");
                    setCachedIdentity(null);
                  }}
                >
                  Changer de compte
                </button>
              </div>
            ) : null}
            <form onSubmit={onSubmit} className="space-y-3">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error ? <p className="text-sm text-error">{error}</p> : null}
              {error === "Compte connecté, mais sans droits admin." ? (
                <Button type="button" variant="secondary" className="w-full" disabled={activating} onClick={tryActivateSuperAdmin}>
                  {activating ? "Activation..." : "Activer super admin maintenant"}
                </Button>
              ) : null}
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter (admin)"}
              </Button>
            </form>
          </div>
        </div>

        <footer className="mt-8 border-t border-slate-200/80 pt-4 text-center text-xs text-slate-500">
          DocuGest Ivoire · Administration · by Soroboss · +225 07 57 22 87 31 · soroboss.bossimpact@gmail.com
        </footer>
      </div>
    </div>
  );
}
