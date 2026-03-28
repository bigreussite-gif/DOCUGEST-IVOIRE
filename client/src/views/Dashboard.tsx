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
import { MobileBottomNav } from "../components/dashboard/MobileBottomNav";
import Profile from "./Profile";
import { isBackofficeRole, roleLabelFr } from "../lib/roles";

const InvoiceEditor = lazy(() => import("./invoice/InvoiceEditor"));
const QuickInvoiceEditor = lazy(() => import("./invoice/QuickInvoiceEditor"));
const PayslipEditor = lazy(() => import("./payslip/PayslipEditor"));

function EditorFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-6 text-slate-500">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="ml-3 text-sm">Chargement…</span>
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
  if (t === "payslip") return "Bulletin";
  return t;
}

function typeBadgeStyle(t: string) {
  if (t === "invoice") return "bg-primary/10 text-primary";
  if (t === "payslip") return "bg-amber-100 text-amber-800";
  if (t === "proforma" || t === "devis") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-600";
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

  useEffect(() => { load(); }, [load]);

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
    <div className="min-w-0 px-3 py-5 sm:p-6">

      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-5 text-white shadow-primary-glow sm:p-7">
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Espace professionnel</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Bonjour, {firstName} 👋
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/80">
              Vos documents prêts en quelques gestes.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-white/15 px-4 py-3 text-sm ring-1 ring-white/20 backdrop-blur sm:text-right">
            {auth.user?.company_name ? (
              <span className="font-semibold text-white">{auth.user.company_name}</span>
            ) : (
              <Link to="/dashboard/profile" className="font-medium text-white/90 underline underline-offset-2 hover:text-white">
                Compléter le profil →
              </Link>
            )}
          </div>
        </div>
        {/* Décorations */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/8" aria-hidden />
        <div className="pointer-events-none absolute -bottom-6 right-12 h-24 w-24 rounded-full bg-white/5" aria-hidden />
      </div>

      {/* ─── Stats rapides ─── */}
      {!loading && docs.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="flex flex-col rounded-2xl bg-white p-3.5 shadow-card ring-1 ring-border/60 sm:p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Documents</span>
            <span className="mt-1.5 text-2xl font-bold text-text">{docs.length}</span>
          </div>
          <div className="flex flex-col rounded-2xl bg-white p-3.5 shadow-card ring-1 ring-border/60 sm:p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Factures</span>
            <span className="mt-1.5 text-2xl font-bold text-text">{docs.filter((d) => d.type === "invoice").length}</span>
          </div>
          <div className="flex flex-col rounded-2xl bg-white p-3.5 shadow-card ring-1 ring-border/60 sm:p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Bulletins</span>
            <span className="mt-1.5 text-2xl font-bold text-text">{docs.filter((d) => d.type === "payslip").length}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <TrustModelBanner />
      </div>

      {/* ─── Actions ─── */}
      <DashboardSection
        title="Créer un document"
        kicker="Actions rapides"
        className="mt-7"
      >
        <div className="animate-cards grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
          <QuickActionCard
            to="/dashboard/invoice/new?type=invoice"
            variant="primary"
            emoji="📄"
            title="Nouvelle facture"
            description="TVA, lignes, PDF — le flux standard."
          />
          <QuickActionCard
            to="/dashboard/payslip/new"
            variant="warm"
            emoji="🧾"
            title="Bulletin de salaire"
            description="Salaire, retenues, net à payer."
          />
          <QuickActionCard
            to="/dashboard/invoice/new?type=proforma"
            variant="secondary"
            emoji="📋"
            title="Proforma / Devis"
            description="Même éditeur, type adapté."
          />
          <QuickActionCard
            to="/dashboard/invoice/express"
            variant="accent"
            emoji="🛒"
            title="Facture e-commerce"
            description="Lignes TTC, livraison en ligne."
          />
        </div>
      </DashboardSection>

      <div className="mt-5">
        <InlineAdStrip />
      </div>

      {/* ─── Historique ─── */}
      <DashboardSection
        id="documents"
        title="Historique"
        kicker="Mes documents"
        className="mt-8"
      >
        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-card ring-1 ring-border/60">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-slate-500">Chargement…</span>
          </div>
        ) : docs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/80 px-4 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">📂</div>
            <p className="text-sm font-semibold text-text">Aucun document pour l'instant</p>
            <p className="mt-1.5 text-sm text-slate-500">Créez votre premier document ci-dessus.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link to="/dashboard/invoice/new?type=invoice">
                <Button variant="primary" className="h-11 w-full min-w-[11rem] sm:w-auto">
                  Nouvelle facture
                </Button>
              </Link>
              <Link to="/dashboard/payslip/new">
                <Button variant="ghost" className="h-11 w-full min-w-[11rem] sm:w-auto">
                  Bulletin de salaire
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {docs.map((d) => (
              <div
                key={d.id}
                className="group rounded-2xl bg-white px-4 py-3.5 shadow-card ring-1 ring-border/50 transition-shadow hover:shadow-soft"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={openDoc(d)} className="font-semibold text-text hover:text-primary transition-colors">
                        {d.doc_number}
                      </Link>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeBadgeStyle(d.type)}`}>
                        {typeLabel(d.type)}
                      </span>
                      {d._offlinePending ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          Synchro en attente
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-700">{d.client_name}</p>
                    <p className="text-xs text-slate-400">{new Date(d.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-base font-bold text-text">{formatFCFA(Number(d.total_amount))}</span>
                    <div className="flex gap-1.5">
                      <Link to={openDoc(d)} title="Modifier">
                        <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-border/70 transition hover:bg-white hover:ring-primary/40 hover:text-primary active:scale-95 text-slate-600">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </Link>
                      <Link to={`${openDoc(d)}?action=print`} title="Imprimer">
                        <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-border/70 transition hover:bg-white hover:ring-primary/40 hover:text-primary active:scale-95 text-slate-600">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                          </svg>
                        </button>
                      </Link>
                      <button
                        title="Supprimer"
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-border/70 transition hover:bg-red-50 hover:ring-error/40 hover:text-error active:scale-95 text-slate-600"
                        onClick={() => removeDoc(d.id)}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && docs.length > 0 ? (
          <p className="mt-4 text-center text-sm text-slate-500">
            Vente en ligne ?{" "}
            <Link to="/dashboard/invoice/express" className="font-semibold text-primary hover:underline">
              Mode e-commerce →
            </Link>
          </p>
        ) : null}
      </DashboardSection>

      <div className="mt-6">
        <InlineAdStrip variant="compact" />
      </div>

      <div className="mt-6 pb-2">
        <SorobossFooter />
      </div>
    </div>
  );
}

function UserMenu({ compact }: { compact?: boolean }) {
  const auth = useAuthStore();
  const clearLocalSessionAndRelogin = useAuthStore((s) => s.clearLocalSessionAndRelogin);
  const name = auth.user?.full_name ?? "—";
  const company = auth.user?.company_name ?? "";

  if (!compact) {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-text">{name}</p>
          {company ? <p className="mt-0.5 truncate text-xs text-slate-500">{company}</p> : null}
          {auth.user?.role ? (
            <p className="mt-1 text-[11px] font-medium text-primary">{roleLabelFr(auth.user.role)}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-0.5 border-t border-border/60 pt-3">
          <Link
            to="/dashboard/profile"
            className="rounded-xl px-2 py-2 text-sm font-medium text-text transition hover:bg-surface hover:text-primary"
          >
            Mon profil
          </Link>
          <button
            type="button"
            className="rounded-xl px-2 py-2 text-left text-sm text-slate-600 transition hover:bg-surface"
            onClick={() => auth.logout()}
          >
            Déconnexion
          </button>
          <button
            type="button"
            className="rounded-xl px-2 py-2 text-left text-[11px] text-slate-400 transition hover:bg-surface hover:text-slate-600"
            onClick={() => clearLocalSessionAndRelogin()}
          >
            Réinitialiser la session
          </button>
        </div>
      </div>
    );
  }

  return (
    <details className="relative shrink-0">
      <summary
        className="flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-border/70 bg-white/90 px-3 py-2 shadow-xs ring-1 ring-border/30 transition hover:bg-surface [&::-webkit-details-marker]:hidden"
        aria-label="Menu compte"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden min-w-0 sm:block">
          <div className="max-w-[9rem] truncate text-sm font-semibold leading-tight text-text">{name}</div>
          {company ? <div className="max-w-[9rem] truncate text-[11px] leading-tight text-slate-500">{company}</div> : null}
        </div>
        <span className="shrink-0 text-[10px] text-slate-400" aria-hidden>▾</span>
      </summary>
      <div className="absolute right-0 z-[60] mt-1.5 w-56 max-w-[calc(100vw-1.5rem)] animate-slide-down rounded-2xl border border-border bg-white py-1.5 shadow-float ring-1 ring-slate-200/60">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="text-sm font-semibold text-text">{name}</p>
          {company ? <p className="text-xs text-slate-500">{company}</p> : null}
          {auth.user?.role ? (
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {roleLabelFr(auth.user.role)}
            </span>
          ) : null}
        </div>
        <div className="p-1.5">
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-text transition hover:bg-surface"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Mon profil
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-surface"
            onClick={() => auth.logout()}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-xl border-t border-border/40 px-3 py-2 text-left text-[11px] text-slate-400 transition hover:bg-surface hover:text-slate-600 mt-0.5 pt-2"
            onClick={() => clearLocalSessionAndRelogin()}
          >
            Réinitialiser la session
          </button>
        </div>
      </div>
    </details>
  );
}

export default function Dashboard() {
  const auth = useAuthStore();
  const loadMe = useAuthStore((s) => s.loadMe);
  const clearLocalSessionAndRelogin = useAuthStore((s) => s.clearLocalSessionAndRelogin);
  const location = useLocation();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMe()
      .catch(() => {})
      .finally(() => { if (!cancelled) setAuthReady(true); });
    return () => { cancelled = true; };
  }, [loadMe]);

  useEffect(() => {
    if (!authReady || auth.loading) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("docugest_token") : null;
    if (!auth.user && !token) {
      window.location.assign("/login");
    }
  }, [authReady, auth.loading, auth.user]);

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
    <div className="min-h-screen bg-surface">
      <ConnectionBanner />

      {/* ─── Bannière d'erreur auth ─── */}
      {auth.error ? (
        <div
          role="status"
          className="flex flex-col items-stretch gap-3 border-b border-amber-200/90 bg-amber-50 px-4 py-4 text-sm text-amber-950 sm:items-center sm:px-6"
        >
          <span className="max-w-2xl text-center text-[15px] font-medium leading-snug sm:text-sm">{auth.error}</span>
          <div className="flex w-full max-w-md flex-col gap-2 sm:mx-auto sm:w-auto sm:flex-row sm:justify-center">
            <button
              type="button"
              disabled={auth.loading}
              onClick={() => void loadMe()}
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-amber-400 bg-white px-4 text-sm font-semibold text-amber-950 shadow-xs transition hover:bg-amber-100 disabled:opacity-50"
            >
              {auth.loading ? "Vérification…" : "Réessayer"}
            </button>
            <button
              type="button"
              onClick={() => clearLocalSessionAndRelogin()}
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-xs transition hover:bg-slate-100"
            >
              Réinitialiser la session
            </button>
          </div>
        </div>
      ) : null}

      {!isDocEditorRoute ? <MonetizationTopBar /> : null}

      {/* ─── Layout Desktop (sidebar) + Mobile (top header) ─── */}
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:min-h-screen">

        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:border-r lg:border-border/70 lg:bg-white lg:shadow-xs">
          <div className="sticky top-0 flex flex-col gap-4 overflow-y-auto p-5" style={{ maxHeight: "100vh" }}>
            <AppBrand />

            <div className="rounded-2xl bg-gradient-to-br from-primary/8 to-primary/4 p-3.5 ring-1 ring-primary/15">
              <p className="text-sm font-semibold text-text">{auth.user?.full_name ?? "—"}</p>
              {auth.user?.company_name ? (
                <p className="mt-0.5 truncate text-xs text-slate-500">{auth.user.company_name}</p>
              ) : null}
              {auth.user?.role ? (
                <span className="mt-1.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {roleLabelFr(auth.user.role)}
                </span>
              ) : null}
              <div className="mt-3 flex gap-2 border-t border-primary/10 pt-3">
                <Link
                  to="/dashboard/profile"
                  className="flex-1 rounded-xl py-1.5 text-center text-xs font-medium text-primary transition hover:bg-white"
                >
                  Profil
                </Link>
                <button
                  type="button"
                  className="flex-1 rounded-xl py-1.5 text-center text-xs text-slate-500 transition hover:bg-white hover:text-slate-700"
                  onClick={() => auth.logout()}
                >
                  Déconnexion
                </button>
              </div>
            </div>

            {isBackofficeRole(auth.user?.role) ? (
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/8 px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/12"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                Back-office admin
              </Link>
            ) : null}

            <DashboardNav orientation="vertical" />

            <div className="mt-auto rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
              <TrustModelBanner variant="compact" />
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <div className="min-w-0 flex flex-col">

          {/* Header Mobile / Top bar */}
          <header className="glass sticky top-0 z-40 border-b border-border/60 shadow-xs lg:hidden">
            <div className="flex items-center justify-between px-3 py-3">
              <AppBrand compact />
              <div className="flex items-center gap-2 overflow-visible">
                {isBackofficeRole(auth.user?.role) ? (
                  <Link
                    to="/admin"
                    className="rounded-xl border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary"
                  >
                    Admin
                  </Link>
                ) : null}
                <div className="overflow-visible">
                  <UserMenu compact />
                </div>
              </div>
            </div>
            {!isDocEditorRoute ? (
              <div className="border-t border-border/40 px-3 pb-2">
                <DashboardNav orientation="horizontal" />
              </div>
            ) : null}
          </header>

          {/* Header Desktop */}
          <header className="hidden lg:flex lg:items-center lg:justify-between lg:border-b lg:border-border/50 lg:bg-white/80 lg:px-6 lg:py-3.5 lg:backdrop-blur">
            {!isDocEditorRoute ? (
              <DashboardNav orientation="horizontal" className="flex-1" />
            ) : (
              <div className="text-sm text-slate-500">Édition de document</div>
            )}
            <div className="flex items-center gap-3 overflow-visible">
              {isBackofficeRole(auth.user?.role) ? (
                <Link
                  to="/admin"
                  className="rounded-xl border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/12"
                >
                  Back-office
                </Link>
              ) : null}
              <div className="overflow-visible">
                <UserMenu compact />
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 pb-24 lg:pb-8">
            {dashboardRoutes}
          </main>
        </div>
      </div>

      {/* Navigation mobile bas d'écran */}
      <MobileBottomNav />

      <MonetizationBottomBar />
    </div>
  );
}
