import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { apiFetch } from "../lib/api";
import { formatFCFA } from "../utils/formatters";
import { MonetizationTopBar } from "../components/promo/MonetizationTopBar";
import { InlineAdStrip } from "../components/promo/InlineAdStrip";
import { SorobossFooter } from "../components/promo/SorobossFooter";

import InvoiceEditor from "./invoice/InvoiceEditor";
import PayslipEditor from "./payslip/PayslipEditor";

type DocRow = {
  id: string;
  type: string;
  doc_number: string;
  client_name: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
};

function typeLabel(t: string) {
  if (t === "invoice") return "Facture";
  if (t === "proforma") return "Proforma";
  if (t === "devis") return "Devis";
  if (t === "payslip") return "Bulletin de salaire";
  return t;
}

function DashboardHome() {
  const auth = useAuthStore();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ items: DocRow[] }>("/api/documents?page=1&limit=50");
      setDocs(res.items ?? []);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function removeDoc(id: string) {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await apiFetch(`/api/documents/${id}`, { method: "DELETE" });
      await load();
    } catch {
      alert("Suppression impossible.");
    }
  }

  function openDoc(d: DocRow) {
    if (d.type === "payslip") return `/dashboard/payslip/${d.id}`;
    return `/dashboard/invoice/${d.id}`;
  }

  const firstName = auth.user?.full_name?.split(" ")[0] ?? "—";

  return (
    <div className="p-6">
      <div className="rounded-2xl bg-bg p-5 shadow-soft ring-1 ring-border/70">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-600">Bonjour,</div>
            <div className="text-2xl font-bold text-text">{firstName}</div>
            <div className="mt-1 text-sm text-slate-600">
              Ici, tu pilotes tes factures, devis et fiches de paie — sans friction.
            </div>
          </div>
          <div className="text-right text-sm text-slate-600">
            {auth.user?.company_name ? (
              <span className="font-medium text-text">{auth.user.company_name}</span>
            ) : (
              <span>Ajoute ton entreprise dans ton profil</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <InlineAdStrip />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link to="/dashboard/invoice/new?type=invoice" className="block">
          <div className="rounded-2xl bg-primary/10 p-5 ring-1 ring-primary/30 transition hover:bg-primary/15">
            <div className="text-sm font-semibold text-text">Nouvelle facture</div>
            <div className="mt-2 text-xs text-slate-700">Numérotation, TVA, PDF en un clic</div>
          </div>
        </Link>
        <Link to="/dashboard/invoice/new?type=proforma" className="block">
          <div className="rounded-2xl bg-secondary/10 p-5 ring-1 ring-secondary/30 transition hover:bg-secondary/15">
            <div className="text-sm font-semibold text-text">Proforma / devis</div>
            <div className="mt-2 text-xs text-slate-700">Même éditeur, type adapté</div>
          </div>
        </Link>
        <Link to="/dashboard/payslip/new" className="block">
          <div className="rounded-2xl bg-warning/10 p-5 ring-1 ring-warning/30 transition hover:bg-warning/15">
            <div className="text-sm font-semibold text-text">Bulletin de salaire</div>
            <div className="mt-2 text-xs text-slate-700">Salaire, retenues, net à payer</div>
          </div>
        </Link>
        <Link to="/dashboard" className="block">
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border/70 transition hover:bg-bg">
            <div className="text-sm font-semibold text-text">Mes documents</div>
            <div className="mt-2 text-xs text-slate-700">Historique ci-dessous</div>
          </div>
        </Link>
      </div>

      <div className="mt-8 rounded-2xl bg-bg p-5 shadow-soft ring-1 ring-border/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-text">Mes derniers documents</div>
          <div className="text-xs text-slate-500">Tri du plus récent au plus ancien</div>
        </div>
        {loading ? (
          <div className="mt-4 text-sm text-slate-600">Chargement…</div>
        ) : docs.length === 0 ? (
          <div className="mt-4 text-sm text-slate-600">
            Aucun document pour l’instant. Lance une facture ou un bulletin pour remplir ton tableau.
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {docs.map((d) => (
              <li key={d.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link to={openDoc(d)} className="font-medium text-primary hover:underline">
                    {d.doc_number}
                  </Link>
                  <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs text-slate-600">
                    {typeLabel(d.type)}
                  </span>
                  <div className="text-sm text-slate-700">{d.client_name}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(d.created_at).toLocaleString("fr-FR")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-text">{formatFCFA(Number(d.total_amount))}</span>
                  <Link to={openDoc(d)}>
                    <Button variant="secondary" className="h-9 text-xs">
                      Ouvrir
                    </Button>
                  </Link>
                  <Button variant="danger" className="h-9 text-xs" type="button" onClick={() => removeDoc(d.id)}>
                    Supprimer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <InlineAdStrip variant="compact" />
      </div>

      <div className="mt-6">
        <SorobossFooter />
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
      <MonetizationTopBar />
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="border-b bg-bg md:border-b-0 md:border-r md:min-h-screen">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg ring-1 ring-primary/30">
                📄
              </div>
              <div>
                <div className="text-sm font-bold text-text">DocuGest Ivoire</div>
                <div className="text-xs text-slate-600">Ton cockpit documents</div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-surface p-4 ring-1 ring-border/70">
              <div className="text-sm font-semibold text-text">{auth.user?.full_name ?? "—"}</div>
              <div className="mt-1 text-xs text-slate-600">{auth.user?.company_name ?? "Entreprise"}</div>
              <Button variant="ghost" className="mt-3 h-9 w-full" onClick={() => auth.logout()}>
                Se déconnecter
              </Button>
            </div>

            <nav className="mt-5 grid gap-1 text-sm">
              <Link
                to="/dashboard"
                className="rounded-xl bg-surface px-3 py-2 font-semibold text-text ring-1 ring-border/70"
              >
                Tableau de bord
              </Link>
              <Link
                to="/dashboard/invoice/new?type=invoice"
                className="rounded-xl px-3 py-2 text-slate-700 hover:bg-bg hover:ring-1 hover:ring-border/70"
              >
                Factures
              </Link>
              <Link
                to="/dashboard/invoice/new?type=proforma"
                className="rounded-xl px-3 py-2 text-slate-700 hover:bg-bg hover:ring-1 hover:ring-border/70"
              >
                Proformas / Devis
              </Link>
              <Link
                to="/dashboard/payslip/new"
                className="rounded-xl px-3 py-2 text-slate-700 hover:bg-bg hover:ring-1 hover:ring-border/70"
              >
                Bulletins de salaire
              </Link>
              <Link to="/dashboard" className="rounded-xl px-3 py-2 text-slate-700 hover:bg-bg hover:ring-1 hover:ring-border/70">
                Mes documents
              </Link>
            </nav>

            <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Espace publicitaire</p>
              <p className="mt-1 text-[11px] text-slate-500">Emplacement discret — compatible AdSense.</p>
            </div>
          </div>
        </aside>

        <main className="md:min-h-screen">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/invoice/new" element={<InvoiceEditor />} />
            <Route path="/invoice/:id" element={<InvoiceEditor />} />
            <Route path="/payslip/new" element={<PayslipEditor />} />
            <Route path="/payslip/:id" element={<PayslipEditor />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
