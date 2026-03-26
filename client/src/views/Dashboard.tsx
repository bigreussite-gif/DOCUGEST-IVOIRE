import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { Link, useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { apiFetch } from "../lib/api";
import { formatFCFA } from "../utils/formatters";
import { MonetizationTopBar } from "../components/promo/MonetizationTopBar";
import { MonetizationBottomBar } from "../components/promo/MonetizationBottomBar";
import { InlineAdStrip } from "../components/promo/InlineAdStrip";
import { SorobossFooter } from "../components/promo/SorobossFooter";
import { ConnectionBanner } from "../components/ConnectionBanner";
import { AppBrand } from "../components/dashboard/AppBrand";
import { DashboardNav } from "../components/dashboard/DashboardNav";
import { useNavLayout } from "../components/dashboard/useNavLayout";
import Profile from "./Profile";
import { isBackofficeRole, roleLabelFr } from "../lib/roles";

const InvoiceEditor = lazy(() => import("./invoice/InvoiceEditor"));
const PayslipEditor = lazy(() => import("./payslip/PayslipEditor"));

function EditorFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-6 text-slate-600">
      Chargement de l’éditeur…
    </div>
  );
}

type DocRow = {
  id: string;
  type: string;
  doc_number: string;
  client_name: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  _offlinePending?: boolean;
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
  const location = useLocation();
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

  useEffect(() => {
    if (location.hash === "#documents") {
      const el = document.getElementById("documents");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

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
    <div className="p-4 sm:p-6">
      <div className="rounded-2xl bg-bg p-4 shadow-soft ring-1 ring-border/70 sm:p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-600">Bonjour,</div>
            <div className="text-2xl font-bold text-text">{firstName}</div>
            <div className="mt-1 text-base leading-relaxed text-slate-600">
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
            <div className="mt-2 text-sm leading-relaxed text-slate-700">Numérotation, TVA, PDF en un clic</div>
          </div>
        </Link>
        <Link to="/dashboard/invoice/new?type=proforma" className="block">
          <div className="rounded-2xl bg-secondary/10 p-5 ring-1 ring-secondary/30 transition hover:bg-secondary/15">
            <div className="text-sm font-semibold text-text">Proforma / devis</div>
            <div className="mt-2 text-sm leading-relaxed text-slate-700">Même éditeur, type adapté</div>
          </div>
        </Link>
        <Link to="/dashboard/payslip/new" className="block">
          <div className="rounded-2xl bg-warning/10 p-5 ring-1 ring-warning/30 transition hover:bg-warning/15">
            <div className="text-sm font-semibold text-text">Bulletin de salaire</div>
            <div className="mt-2 text-sm leading-relaxed text-slate-700">Salaire, retenues, net à payer</div>
          </div>
        </Link>
        <Link to="/dashboard#documents" className="block">
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border/70 transition hover:bg-bg">
            <div className="text-sm font-semibold text-text">Mes documents</div>
            <div className="mt-2 text-sm leading-relaxed text-slate-700">Historique ci-dessous</div>
          </div>
        </Link>
      </div>

      <div id="documents" className="mt-8 scroll-mt-28 rounded-2xl bg-bg p-5 shadow-soft ring-1 ring-border/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-text">Mes derniers documents</div>
          <div className="text-xs text-slate-500">Tri du plus récent au plus ancien</div>
        </div>
        {loading ? (
          <div className="mt-4 text-base text-slate-600">Chargement…</div>
        ) : docs.length === 0 ? (
          <div className="mt-4 text-base leading-relaxed text-slate-600">
            Aucun document pour l’instant. Lance une facture ou un bulletin pour remplir ton tableau.
          </div>
        ) : (
          <div className="mt-4">
            <ul className="divide-y divide-border/60">
              {docs.map((d) => (
                <li key={d.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link to={openDoc(d)} className="font-medium text-primary hover:underline">
                      {d.doc_number}
                    </Link>
                    <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs text-slate-600">
                      {typeLabel(d.type)}
                    </span>
                    {d._offlinePending ? (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        Synchro en attente
                      </span>
                    ) : null}
                    <div className="text-base text-slate-700">{d.client_name}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(d.created_at).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-text">{formatFCFA(Number(d.total_amount))}</span>
                    <Link to={openDoc(d)}>
                      <Button variant="secondary" className="h-10 text-sm">
                        Modifier
                      </Button>
                    </Link>
                    <Link to={`${openDoc(d)}?action=print`}>
                      <Button variant="ghost" className="h-10 text-sm">
                        Imprimer
                      </Button>
                    </Link>
                    <Button variant="danger" className="h-10 text-sm" type="button" onClick={() => removeDoc(d.id)}>
                      Supprimer
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-emerald-900">Facture rapide e-commerce</div>
                  <div className="text-xs text-emerald-800">
                    Pour les ventes en ligne: ouvrez un modele simplifie puis editez en 1 minute.
                  </div>
                </div>
                <Link to="/dashboard/invoice/new?type=invoice&quick=1">
                  <Button variant="primary" className="h-10 text-sm">
                    Nouvelle facture rapide
                  </Button>
                </Link>
              </div>
            </div>
          </div>
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

function UserMenu({ compact }: { compact?: boolean }) {
  const auth = useAuthStore();
  return (
    <div
      className={[
        "flex items-center gap-3",
        compact ? "flex-row flex-wrap justify-end" : "flex-col items-stretch"
      ].join(" ")}
    >
      <div className={compact ? "hidden text-right sm:block" : ""}>
        <div className="text-sm font-semibold text-text">{auth.user?.full_name ?? "—"}</div>
        <div className="text-xs text-slate-600">{auth.user?.company_name ?? "Entreprise"}</div>
        {auth.user?.role ? (
          <div className="mt-1 text-[11px] font-medium text-primary">{roleLabelFr(auth.user.role)}</div>
        ) : null}
      </div>
      <Button variant="ghost" className={compact ? "h-10 shrink-0 px-3" : "h-10 w-full"} onClick={() => auth.logout()}>
        Déconnexion
      </Button>
    </div>
  );
}

export default function Dashboard() {
  const auth = useAuthStore();
  const loadMe = useAuthStore((s) => s.loadMe);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, setMode } = useNavLayout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMe()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loadMe]);

  useEffect(() => {
    // Evite la redirection prématurée pendant l'initialisation de session.
    if (!authReady || auth.loading) return;
    if (!auth.user && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [authReady, auth.loading, auth.user, navigate, location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const closeMobile = () => setMobileOpen(false);

  const dashboardRoutes = (
    <Suspense fallback={<EditorFallback />}>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/invoice/new" element={<InvoiceEditor />} />
        <Route path="/invoice/:id" element={<InvoiceEditor />} />
        <Route path="/payslip/new" element={<PayslipEditor />} />
        <Route path="/payslip/:id" element={<PayslipEditor />} />
      </Routes>
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-surface">
      <ConnectionBanner />
      <MonetizationTopBar />

      {mode === "top" ? (
        <>
          <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/95 shadow-sm backdrop-blur-md">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              <div className="flex min-w-0 items-center justify-between gap-3 lg:justify-start">
                <AppBrand compact={false} />
                <button
                  type="button"
                  className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-medium text-text lg:hidden"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-drawer-nav"
                  onClick={() => setMobileOpen((v) => !v)}
                >
                  {mobileOpen ? "Fermer" : "Menu"}
                </button>
              </div>

              <div className="hidden min-w-0 flex-1 lg:block">
                <DashboardNav orientation="horizontal" className="justify-center xl:justify-start" />
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                {isBackofficeRole(auth.user?.role) ? (
                  <Link
                    to="/admin"
                    className="whitespace-nowrap rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
                  >
                    Back-office
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => setMode("sidebar")}
                  className="whitespace-nowrap rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-bg"
                >
                  Menu latéral
                </button>
                <UserMenu compact />
              </div>
            </div>

            {mobileOpen ? (
              <div id="mobile-drawer-nav" className="border-t border-border/60 bg-bg px-3 py-4 lg:hidden">
                <DashboardNav orientation="vertical" onNavigate={closeMobile} />
                <div className="mt-4 border-t border-border/60 pt-4">
                  <UserMenu />
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl border border-dashed border-slate-300 py-2 text-sm text-slate-600"
                  onClick={() => {
                    setMode("sidebar");
                    setMobileOpen(false);
                  }}
                >
                  Passer au menu latéral
                </button>
              </div>
            ) : null}

            {!mobileOpen ? (
              <div className="border-t border-border/40 px-3 pb-3 lg:hidden">
                <UserMenu compact />
              </div>
            ) : null}
          </header>

          <main className="mx-auto min-w-0 max-w-[1600px]">{dashboardRoutes}</main>
        </>
      ) : (
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 md:grid-cols-[minmax(0,280px)_1fr]">
          <aside className="border-b border-border bg-bg md:sticky md:top-0 md:min-h-screen md:border-b-0 md:border-r">
            <div className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <AppBrand />
                <button
                  type="button"
                  onClick={() => setMode("top")}
                  className="shrink-0 rounded-xl border border-border bg-surface px-2 py-1.5 text-xs font-medium text-slate-700"
                >
                  Barre du haut
                </button>
              </div>

              <div className="rounded-xl bg-surface p-4 ring-1 ring-border/70">
                <UserMenu />
              </div>

              {isBackofficeRole(auth.user?.role) ? (
                <Link
                  to="/admin"
                  className="block rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-center text-sm font-semibold text-primary"
                >
                  Back-office
                </Link>
              ) : null}

              <DashboardNav orientation="vertical" />

              <div className="rounded-xl border border-dashed border-slate-200 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Espace publicitaire</p>
                <p className="mt-1 text-[11px] text-slate-500">Emplacement discret — compatible AdSense.</p>
              </div>
            </div>
          </aside>

          <main className="min-w-0">{dashboardRoutes}</main>
        </div>
      )}

      <MonetizationBottomBar />
    </div>
  );
}
