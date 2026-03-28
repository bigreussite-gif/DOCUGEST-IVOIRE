import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { Link, useLocation, Routes, Route } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { apiFetch } from "../lib/api";
import { formatFCFA } from "../utils/formatters";
import { MonetizationTopBar } from "../components/promo/MonetizationTopBar";
import { MonetizationBottomBar } from "../components/promo/MonetizationBottomBar";
import { InlineAdStrip } from "../components/promo/InlineAdStrip";
import { SorobossFooter } from "../components/promo/SorobossFooter";
import { TrustModelBanner } from "../components/trust/TrustModelBanner";
import { ConnectionBanner } from "../components/ConnectionBanner";
import { AppBrand } from "../components/dashboard/AppBrand";
import { DashboardNav } from "../components/dashboard/DashboardNav";
import { DashboardSection } from "../components/dashboard/DashboardSection";
import { QuickActionCard } from "../components/dashboard/QuickActionCard";
import { useNavLayout } from "../components/dashboard/useNavLayout";
import Profile from "./Profile";
import { isBackofficeRole, roleLabelFr } from "../lib/roles";

const InvoiceEditor = lazy(() => import("./invoice/InvoiceEditor"));
const QuickInvoiceEditor = lazy(() => import("./invoice/QuickInvoiceEditor"));
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
    <div className="min-w-0 px-3 py-4 sm:p-6">
      <div className="rounded-2xl bg-gradient-to-br from-white via-bg to-surface/90 p-4 shadow-soft ring-1 ring-border/70 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Espace professionnel</p>
            <p className="mt-1 text-sm text-slate-600">Bonjour,</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-text sm:text-3xl">{firstName}</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Créez vos documents en quelques gestes — tout est regroupé ci-dessous.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-surface px-4 py-3 text-sm ring-1 ring-border/70 sm:text-right">
            {auth.user?.company_name ? (
              <span className="font-semibold text-text">{auth.user.company_name}</span>
            ) : (
              <Link to="/dashboard/profile" className="font-medium text-primary underline-offset-2 hover:underline">
                Compléter le profil entreprise
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <TrustModelBanner />
      </div>

      <div className="mt-6">
        <InlineAdStrip
          heading="Espace partenaires"
          subheading="En consultant ces offres, vous contribuez à maintenir DocuGest gratuit pour les indépendants et les PME."
        />
      </div>

      <DashboardSection
        title="Créer un document"
        kicker="Actions"
        description="Choisissez le type de document — les options les plus utilisées sont mises en avant."
        className="mt-8"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <QuickActionCard
            to="/dashboard/invoice/new?type=invoice"
            variant="primary"
            emoji="📄"
            title="Nouvelle facture"
            description="TVA, lignes, PDF — le flux standard pour vos clients."
          />
          <QuickActionCard
            to="/dashboard/payslip/new"
            variant="warm"
            emoji="🧾"
            title="Bulletin de salaire"
            description="Salaire, retenues, net à payer — PDF prêt à remettre."
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <QuickActionCard
            to="/dashboard/invoice/new?type=proforma"
            variant="secondary"
            emoji="📋"
            title="Proforma / devis"
            description="Même éditeur, type de document adapté."
          />
          <QuickActionCard
            to="/dashboard/invoice/express"
            variant="accent"
            emoji="🛒"
            title="Facture e-commerce"
            description="Lignes TTC, livraison — idéal vente en ligne."
          />
          <QuickActionCard
            to="/dashboard#documents"
            variant="muted"
            emoji="📂"
            title="Mes documents"
            description="Historique et brouillons — voir la liste ci-dessous."
          />
        </div>
      </DashboardSection>

      <DashboardSection
        id="documents"
        title="Historique"
        kicker="Documents"
        description="Vos derniers fichiers, du plus récent au plus ancien."
        className="mt-10"
      >
        <div className="rounded-2xl bg-bg p-4 shadow-soft ring-1 ring-border/70 sm:p-6">
        {loading ? (
          <div className="mt-2 text-base text-slate-600">Chargement…</div>
        ) : docs.length === 0 ? (
          <div className="mt-2 rounded-2xl border border-dashed border-border/80 bg-surface/80 px-4 py-8 text-center">
            <p className="text-sm font-medium text-text">Aucun document pour l’instant</p>
            <p className="mt-2 text-sm text-slate-600">Créez une facture ou un bulletin pour commencer.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link to="/dashboard/invoice/new?type=invoice">
                <Button variant="primary" className="h-12 w-full min-w-[12rem] rounded-2xl sm:w-auto">
                  Nouvelle facture
                </Button>
              </Link>
              <Link to="/dashboard/payslip/new">
                <Button variant="secondary" className="h-12 w-full min-w-[12rem] rounded-2xl sm:w-auto">
                  Bulletin de salaire
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-border/60">
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
                <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <span className="text-sm font-semibold text-text sm:mr-1">{formatFCFA(Number(d.total_amount))}</span>
                  <div className="flex flex-wrap gap-2">
                    <Link to={openDoc(d)} className="min-w-0">
                      <Button variant="secondary" className="h-10 w-full min-w-[7rem] text-sm sm:w-auto">
                        Modifier
                      </Button>
                    </Link>
                    <Link to={`${openDoc(d)}?action=print`} className="min-w-0">
                      <Button variant="ghost" className="h-10 w-full min-w-[7rem] text-sm sm:w-auto">
                        Imprimer
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      className="h-10 w-full min-w-[7rem] text-sm sm:w-auto"
                      type="button"
                      onClick={() => removeDoc(d.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && docs.length > 0 ? (
          <p className="mt-4 text-center text-sm text-emerald-900/90 sm:text-left">
            Vente en ligne ou livraison ?{" "}
            <Link to="/dashboard/invoice/express" className="font-semibold text-primary underline underline-offset-2">
              Ouvrir le mode e-commerce
            </Link>
          </p>
        ) : null}
        </div>
      </DashboardSection>

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
  const clearLocalSessionAndRelogin = useAuthStore((s) => s.clearLocalSessionAndRelogin);
  return (
    <div
      className={[
        "flex items-center gap-3",
        compact ? "flex-row flex-wrap justify-end gap-x-3 gap-y-2" : "flex-col items-stretch"
      ].join(" ")}
    >
      <div className={compact ? "min-w-0 flex-1 text-left sm:flex-none sm:text-right" : ""}>
        <div className="text-sm font-semibold text-text">{auth.user?.full_name ?? "—"}</div>
        <div className="truncate text-xs text-slate-600">{auth.user?.company_name ?? "Entreprise"}</div>
        {auth.user?.role ? (
          <div className="mt-0.5 text-[11px] font-medium text-primary">{roleLabelFr(auth.user.role)}</div>
        ) : null}
      </div>
      <div className={compact ? "flex shrink-0 flex-wrap items-center justify-end gap-2" : "flex flex-col gap-2"}>
        <Button
          variant="secondary"
          className={compact ? "h-10 shrink-0 rounded-2xl px-4" : "h-11 w-full rounded-2xl"}
          type="button"
          onClick={() => auth.logout()}
        >
          Déconnexion
        </Button>
        <button
          type="button"
          className="text-[11px] font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-700"
          onClick={() => clearLocalSessionAndRelogin()}
        >
          Réinitialiser la session
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const auth = useAuthStore();
  const loadMe = useAuthStore((s) => s.loadMe);
  const clearLocalSessionAndRelogin = useAuthStore((s) => s.clearLocalSessionAndRelogin);
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
    if (!authReady || auth.loading) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("docugest_token") : null;
    // Sans jeton : session réellement absente → page Next.js /login (navigation complète, pas de conflit RR).
    // Avec jeton mais utilisateur encore inconnu (ex. erreur serveur) : on ne force pas la déconnexion.
    if (!auth.user && !token) {
      window.location.assign("/login");
    }
  }, [authReady, auth.loading, auth.user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const closeMobile = () => setMobileOpen(false);

  /** Éditeurs de documents : moins de bandeaux figés + moins de distraction pour la saisie */
  const isDocEditorRoute = /^\/dashboard\/(invoice|payslip)(\/|$)/.test(location.pathname);

  const dashboardRoutes = (
    <Suspense fallback={<EditorFallback />}>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="invoice/express" element={<QuickInvoiceEditor />} />
        <Route path="invoice/new" element={<InvoiceEditor />} />
        <Route path="invoice/:id" element={<InvoiceEditor />} />
        <Route path="payslip/new" element={<PayslipEditor />} />
        <Route path="payslip/:id" element={<PayslipEditor />} />
      </Routes>
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/90 via-surface to-slate-50/80">
      <ConnectionBanner />
      {auth.error ? (
        <div
          role="status"
          className="flex flex-col items-stretch gap-3 border-b border-amber-200/90 bg-gradient-to-b from-amber-50 to-amber-50/70 px-4 py-4 text-sm text-amber-950 sm:items-center sm:px-6"
        >
          <span className="max-w-2xl text-center text-[15px] font-medium leading-snug sm:text-sm">{auth.error}</span>
          <div className="flex w-full max-w-md flex-col gap-2 sm:mx-auto sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
            <button
              type="button"
              disabled={auth.loading}
              onClick={() => void loadMe()}
              className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center rounded-2xl border border-amber-400 bg-white px-4 py-2.5 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[10rem]"
            >
              {auth.loading ? "Vérification…" : "Réessayer"}
            </button>
            <button
              type="button"
              onClick={() => clearLocalSessionAndRelogin()}
              className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 sm:w-auto sm:min-w-[10rem]"
            >
              Réinitialiser la session
            </button>
          </div>
          <p className="w-full text-center text-[11px] leading-relaxed text-amber-900/75">
            En cas de blocage répété, ce bouton efface le jeton et le cache local (comme une déconnexion forcée).
          </p>
        </div>
      ) : null}

      {!isDocEditorRoute ? <MonetizationTopBar /> : null}

      {mode === "top" ? (
        <>
          <header
            className={[
              "z-40 border-b border-border/80 bg-bg/95 shadow-sm backdrop-blur-md",
              isDocEditorRoute ? "relative" : "sticky top-0"
            ].join(" ")}
          >
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

              <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 to-white p-3 ring-1 ring-emerald-100/70">
                <TrustModelBanner variant="compact" />
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
