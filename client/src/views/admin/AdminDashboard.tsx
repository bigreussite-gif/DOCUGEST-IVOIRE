import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetch } from "../../lib/adminApi";
import { rangeForPreset, type DatePreset } from "../../lib/adminAnalyticsQuery";

type Overview = {
  documentsTotal: number;
  documentsByType: Record<string, number>;
  documentsByHour: Record<string, number>;
  documentsByWeekday: Record<string, number>;
  userCount: number;
  monthlyActiveUsers: number;
  recentLogins: { id: string; full_name: string; email: string; last_login: string | null }[];
  demographics: { gender: Record<string, number>; user_typology: Record<string, number> };
  adSummary: { views: number; clicks: number; ctrPct: number; byZone: Record<string, { views?: number; clicks?: number; ctrPct?: number }> };
  documentsTrendLast14Days?: { day: string; count: number }[];
  meta?: { filtered?: boolean; from?: string | null; to?: string | null };
};

export function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [periodMode, setPeriodMode] = useState<DatePreset | "custom" | "all">("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [insights, setInsights] = useState<{ summary: string; recommendations: string[]; generatedAt: string; model: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      if (periodMode !== "all") {
        if (customFrom) qs.set("from", customFrom);
        if (customTo) qs.set("to", customTo);
      }
      const data = await adminFetch<Overview>(`/analytics/overview?${qs.toString()}`);
      setOverview(data);

      const ins = await adminFetch<any>("/analytics/insights");
      setInsights(ins);
    } catch (e: any) {
      setErr(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [periodMode, customFrom, customTo]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!overview && err) return <div className="rounded-xl bg-rose-50 p-4 text-rose-800">{err}</div>;
  if (!overview) return <div className="text-slate-600">Chargement des indicateurs…</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ─── Hero Section Premium ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 shadow-2xl shadow-slate-200/50 min-h-[350px] flex items-center">
        {/* Visual Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/60 to-blue-900/20" />
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full px-8 py-12 md:px-16 md:py-16 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-blue-400 ring-1 ring-blue-500/20 backdrop-blur-sm">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              Intelligence Documentaire & Analytics
            </div>
            
            <h1 className="mt-8 text-4xl font-black leading-[1.05] text-white md:text-5xl lg:text-6xl tracking-tight">
              Pilotez l'excellence avec <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-slate-200 bg-clip-text text-transparent">DocuGest.</span>
            </h1>
            
            <p className="mt-8 max-w-lg text-lg font-medium leading-relaxed text-slate-300/80">
              Transformez vos flux de documents en données actionnables. Suivez l'activité utilisateur et optimisez vos services digitaux.
            </p>
          </div>

          <div className="hidden lg:block relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 p-4">
                 <svg className="w-12 h-12 text-blue-500/20" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
               </div>
               <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Production Documents</div>
               <div className="text-4xl font-black text-white mb-6">{overview.documentsTotal.toLocaleString()} total</div>
               <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                 <div className="h-full bg-blue-500 rounded-full w-4/5 animate-pulse"></div>
               </div>
               <div className="flex justify-between text-[11px] font-bold text-slate-500">
                 <span>VOLUME MENSUEL</span>
                 <span>TENDANCE POSITIVE</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Generic KPIs ─── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Documents Générés"
          value={String(overview.documentsTotal)}
          hint="Total cumulé"
          accent="teal"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <KpiCard
          label="Utilisateurs Actifs"
          value={String(overview.monthlyActiveUsers)}
          hint="Ce mois-ci"
          accent="emerald"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
        />
        <KpiCard
          label="Nouveaux Inscrits"
          value={String(overview.userCount)}
          hint="Base totale"
          accent="cyan"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
        />
      </div>

      {/* ─── Filters & Controls ─── */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Analyse Temporelle</h2>
            <p className="text-sm font-medium text-slate-500">Filtrage dynamique des indicateurs clés</p>
          </div>
          <div className="flex flex-wrap gap-2.5 bg-slate-50 p-1.5 rounded-2xl ring-1 ring-slate-200/50">
            {(
              [
                ["all", "Synthese Globale"],
                ["day", "Aujourd'hui"],
                ["month", "Ce mois"],
                ["year", "Année"]
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPeriodMode(key);
                  if (key !== "all") {
                    const r = rangeForPreset(key);
                    setCustomFrom(r.from);
                    setCustomTo(r.to);
                  }
                }}
                className={[
                  "rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all",
                  periodMode === key
                    ? "bg-slate-900 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white"
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Documents & Traffic Grid ─── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Core Documents Stats */}
        <section className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Archives & Documents</h2>
              <p className="text-sm font-medium text-slate-500">Volume de production DocuGest</p>
            </div>
            <div className="text-3xl font-black text-primary">{overview.documentsTotal}</div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(overview.documentsByType || {}).map(([type, count]) => (
              <div key={type} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{type}</div>
                <div className="text-lg font-black text-slate-800">{count}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Users Stats */}
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-center text-center">
          <div className="mb-2 text-4xl font-black text-slate-900">{overview.userCount}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Utilisateurs inscrits</div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
             <div className="h-full bg-primary rounded-full w-2/3"></div>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Dont <span className="text-emerald-600 font-bold">{overview.monthlyActiveUsers} actifs</span> ce mois-ci.
          </p>
        </section>
      </div>

      {/* ─── local AI Insights ─── */}
      {insights && (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-amber-200/50 bg-gradient-to-br from-amber-50/50 via-white to-white p-8 shadow-xl shadow-amber-900/5">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <svg className="w-24 h-24 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          </div>
          <div className="relative z-10">
            <h2 className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Expert Analysis (Beta)
            </h2>
            <p className="text-xl font-bold leading-relaxed text-slate-900 max-w-2xl mb-8">
              {insights.summary}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {insights.recommendations.slice(0, 4).map((r, i) => (
                <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[10px] font-black text-amber-600">{i+1}</span>
                  <p className="text-sm font-medium leading-relaxed text-slate-700">{r}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-amber-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
               <span>Generated by {insights.model}</span>
               <span>{new Date(insights.generatedAt).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
        </section>
      )}

      {/* ─── Bottom Grid: Users & Logins ─── */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Équipe & Accès</h2>
            <Link to="/admin/users" className="text-xs font-bold text-primary hover:underline">Gérer l'équipe →</Link>
          </div>
          <div className="space-y-4">
            {overview.recentLogins.slice(0, 5).map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-hover hover:border-slate-300">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500">{u.full_name[0]}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{u.full_name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dernière activité</div>
                  <div className="text-[11px] font-medium text-slate-700">{u.last_login ? new Date(u.last_login).toLocaleString() : 'Jamais'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Ressources & Documentation</h2>
              <p className="text-sm font-medium text-slate-500">Accès rapide aux bibliothèques DocuGest</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 group hover:bg-blue-100/50 transition-all cursor-pointer">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">📄</div>
                <div className="text-sm font-black text-blue-900">Archives Docs</div>
                <div className="text-[11px] text-blue-700 mt-1">Gérer les factures et reçus archivés.</div>
              </div>
              <div className="p-6 rounded-3xl bg-teal-50 border border-teal-100 group hover:bg-teal-100/50 transition-all cursor-pointer">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">⚙️</div>
                <div className="text-sm font-black text-teal-900">Config Systéme</div>
                <div className="text-[11px] text-teal-700 mt-1">Paramétrages globaux et sécurité.</div>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint, accent, icon }: { label: string; value: string; hint: string; accent: "emerald" | "amber" | "teal" | "cyan"; icon: React.ReactNode }) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10 shadow-emerald-900/5",
    amber: "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10 shadow-amber-900/5",
    teal: "bg-teal-50 text-teal-700 border-teal-100 ring-teal-500/10 shadow-teal-900/5",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100 ring-cyan-500/10 shadow-cyan-900/5"
  };

  return (
    <div className={`p-6 rounded-[2rem] border bg-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${styles[accent]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-2xl bg-white border border-inherit shadow-sm">
          {icon}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{hint}</div>
      </div>
      <div className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</div>
      <div className="text-2xl font-black tracking-tight leading-none">{value}</div>
    </div>
  );
}
