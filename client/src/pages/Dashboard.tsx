import { useEffect } from "react";
import { Link, useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";

import InvoiceEditor from "./invoice/InvoiceEditor";

function DashboardHome() {
  const auth = useAuthStore();
  return (
    <div className="p-6">
      <div className="rounded-2xl bg-bg p-5 shadow-soft ring-1 ring-border/70">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-600">Bienvenue</div>
            <div className="text-2xl font-bold text-text">
              {auth.user ? auth.user.full_name.split(" ")[0] : "—"}
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Documents professionnels, prêts à exporter.
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link to="/dashboard/invoice/new" className="block">
          <div className="rounded-2xl bg-primary/10 p-5 ring-1 ring-primary/30 transition hover:bg-primary/15">
            <div className="text-sm font-semibold text-text">Nouvelle Facture</div>
            <div className="mt-2 text-xs text-slate-700">Créer puis télécharger PDF</div>
          </div>
        </Link>
        <Link to="/dashboard/invoice/new" className="block">
          <div className="rounded-2xl bg-secondary/10 p-5 ring-1 ring-secondary/30 transition hover:bg-secondary/15">
            <div className="text-sm font-semibold text-text">Nouveau Proforma/Devis</div>
            <div className="mt-2 text-xs text-slate-700">Même éditeur (V1)</div>
          </div>
        </Link>
        <Link to="/dashboard/invoice/new" className="block">
          <div className="rounded-2xl bg-warning/10 p-5 ring-1 ring-warning/30 transition hover:bg-warning/15">
            <div className="text-sm font-semibold text-text">Nouveau Bulletin de salaire</div>
            <div className="mt-2 text-xs text-slate-700">Bientôt (V2)</div>
          </div>
        </Link>
        <Link to="/dashboard" className="block">
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border/70 transition hover:bg-bg">
            <div className="text-sm font-semibold text-text">Mes documents</div>
            <div className="mt-2 text-xs text-slate-700">Historique (V1.1)</div>
          </div>
        </Link>
      </div>

      <div className="mt-6 rounded-2xl bg-bg p-5 shadow-soft ring-1 ring-border/70">
        <div className="text-sm font-semibold text-text">Mes derniers documents</div>
        <div className="mt-2 text-sm text-slate-600">Aucun document pour l’instant.</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    auth.loadMe().catch(() => {});
  }, []);

  useEffect(() => {
    if (!auth.user && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [auth.user, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="border-b bg-bg md:border-b-0 md:border-r md:min-h-screen">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 ring-1 ring-primary/30" />
              <div>
                <div className="text-sm font-bold text-text">DocuGest Ivoire</div>
                <div className="text-xs text-slate-600">SaaS documentaire</div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-surface p-4 ring-1 ring-border/70">
              <div className="text-sm font-semibold text-text">{auth.user?.full_name ?? "—"}</div>
              <div className="mt-1 text-xs text-slate-600">{auth.user?.company_name ?? "Votre entreprise"}</div>
              <Button variant="ghost" className="mt-3 h-9 w-full" onClick={() => auth.logout()}>
                Se déconnecter
              </Button>
            </div>

            <nav className="mt-6 grid gap-2 text-sm">
              <Link to="/dashboard" className="rounded-xl bg-surface px-3 py-2 font-semibold text-text ring-1 ring-border/70">
                🏠 Tableau de bord
              </Link>
              <Link to="/dashboard/invoice/new" className="rounded-xl px-3 py-2 text-slate-700 hover:bg-bg hover:ring-1 hover:ring-border/70 ring-1 ring-transparent">
                📄 Factures
              </Link>
              <Link to="/dashboard/invoice/new" className="rounded-xl px-3 py-2 text-slate-700 hover:bg-bg hover:ring-1 hover:ring-border/70 ring-1 ring-transparent">
                📋 Proformas / Devis
              </Link>
              <Link to="/dashboard/invoice/new" className="rounded-xl px-3 py-2 text-slate-700 hover:bg-bg hover:ring-1 hover:ring-border/70 ring-1 ring-transparent">
                💰 Bulletins de salaire
              </Link>
              <Link to="/dashboard" className="rounded-xl px-3 py-2 text-slate-700 hover:bg-bg hover:ring-1 hover:ring-border/70 ring-1 ring-transparent">
                ⚙️ Mon profil / Entreprise
              </Link>
              <Link to="/dashboard" className="rounded-xl px-3 py-2 text-slate-700 hover:bg-bg hover:ring-1 hover:ring-border/70 ring-1 ring-transparent">
                ❓ Aide
              </Link>
            </nav>
          </div>
        </aside>

        <main className="md:min-h-screen">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/invoice/new" element={<InvoiceEditor />} />
            <Route path="/invoice/:id" element={<InvoiceEditor />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

