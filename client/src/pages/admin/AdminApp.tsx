import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminApiError, adminFetch, type AdminSession } from "../../lib/adminApi";
import { AdminLayout } from "./AdminLayout";
import { AdminDashboard } from "./AdminDashboard";
import { AdminUsers } from "./AdminUsers";
import { AdminAudit } from "./AdminAudit";

export default function AdminApp() {
  const [session, setSession] = useState<AdminSession | null | "forbidden" | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await adminFetch<AdminSession>("/session");
        if (!cancelled) setSession(s);
      } catch (e) {
        if (!cancelled) {
          if (e instanceof AdminApiError && e.status === 403) setSession("forbidden");
          else setSession(null);
        }
      }
    })();
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
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-xl font-bold text-text">Accès réservé</h1>
        <p className="mt-3 text-slate-600">
          Votre compte n’a pas les droits pour accéder à l’administration DocuGest. Contactez un administrateur
          général.
        </p>
        <a href="/dashboard" className="mt-6 inline-block text-primary underline">
          Retour à l’app
        </a>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout session={session} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit" element={<AdminAudit />} />
      </Route>
    </Routes>
  );
}
