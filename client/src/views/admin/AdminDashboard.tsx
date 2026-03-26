import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetch } from "../../lib/adminApi";

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
  topCountriesByLogin?: { country: string; count: number }[];
};

type Insights = {
  summary: string;
  recommendations: string[];
  generatedAt: string;
  model: string;
};

const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    const load = async () => {
      try {
        const [overviewRes, insightsRes] = await Promise.allSettled([
          adminFetch<Overview>("/analytics/overview"),
          adminFetch<Insights>("/analytics/insights")
        ]);

        if (c) return;

        if (overviewRes.status === "fulfilled") {
          setOverview(overviewRes.value);
        } else {
          const m = overviewRes.reason instanceof Error ? overviewRes.reason.message : "Erreur";
          setErr(m);
          return;
        }

        if (insightsRes.status === "fulfilled") {
          setInsights(insightsRes.value);
        } else {
          setInsights({
            summary: "Le module d'analyse avancée est temporairement indisponible.",
            recommendations: ["Les KPI principaux restent disponibles dans cette vue."],
            generatedAt: new Date().toISOString(),
            model: "client-fallback-v1"
          });
        }
        setLastRefresh(new Date().toISOString());
      } catch (e) {
        if (!c) setErr(e instanceof Error ? e.message : "Erreur");
      }
    };
    void load();
    const t = setInterval(() => void load(), 30_000);
    return () => {
      c = true;
      clearInterval(t);
    };
  }, []);

  if (err) return <div className="rounded-xl bg-rose-50 p-4 text-rose-800">{err}</div>;
  if (!overview) return <div className="text-slate-600">Chargement des indicateurs…</div>;

  const typeEntries = Object.entries(overview.documentsByType);
  const maxType = Math.max(1, ...typeEntries.map(([, n]) => n));

  const hourEntries = Array.from({ length: 24 }, (_, h) => [h, overview.documentsByHour[h] ?? overview.documentsByHour[String(h)] ?? 0] as const);
  const maxHour = Math.max(1, ...hourEntries.map(([, n]) => n));
  const adoptionRate = overview.userCount > 0 ? Math.round((overview.monthlyActiveUsers / overview.userCount) * 1000) / 10 : 0;
  const adRevenueSignal = Math.round((overview.adSummary.clicks || 0) * 120);
  const trustedScore = Math.min(
    100,
    Math.round(
      45 +
        adoptionRate * 0.35 +
        Math.min(25, (overview.documentsTotal / Math.max(1, overview.userCount)) * 5) +
        Math.min(20, (overview.adSummary.ctrPct || 0) * 10)
    )
  );
  const liveText = lastRefresh ? new Date(lastRefresh).toLocaleTimeString("fr-FR") : "—";
  const trend = overview.documentsTrendLast14Days ?? [];
  const maxTrend = Math.max(1, ...trend.map((d) => Number(d.count || 0)));

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-teal-200/70 bg-gradient-to-br from-[#f4fffd] via-white to-[#eef8f7] p-6 shadow-[0_10px_30px_rgba(15,118,110,0.08)] sm:p-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Vue investisseur</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Synthèse exécutive DocuGest</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Indicateurs clés pour le board : base utilisateurs, production documentaire, signal monétisation et qualité
            perçue.
          </p>
          <p className="mt-3 text-xs text-slate-500">Dernière mise à jour · {liveText}</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Utilisateurs" value={String(overview.userCount)} hint="base totale" accent="teal" />
          <KpiCard label="Adoption 30j" value={`${adoptionRate}%`} hint={`${overview.monthlyActiveUsers} actifs`} accent="emerald" />
          <KpiCard label="Documents" value={String(overview.documentsTotal)} hint="volume produit" accent="cyan" />
          <KpiCard label="Revenue signal" value={`${adRevenueSignal.toLocaleString("fr-FR")} FCFA`} hint="proxy pub" accent="amber" />
        </div>
      </section>

      {insights ? (
        <section className="mx-auto max-w-3xl rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm sm:p-6">
          <h2 className="text-center text-sm font-semibold text-slate-800">Lecture stratégique</h2>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-700">{insights.summary}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {insights.recommendations.slice(0, 4).map((r, i) => (
              <li key={i} className="flex gap-2 border-l-2 border-amber-300/80 pl-3">
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-[10px] text-slate-400">
            {new Date(insights.generatedAt).toLocaleString("fr-FR")} · {insights.model}
          </p>
        </section>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-800">Évolution documents (14 jours)</h2>
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">Live</span>
          </div>
          {trend.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Pas assez de données.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <svg viewBox="0 0 560 190" className="h-[190px] w-full min-w-[560px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={i} x1="10" x2="550" y1={25 + i * 28} y2={25 + i * 28} stroke="#e5e7eb" strokeWidth="1" />
                ))}
                <polyline
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="4"
                  points={trend
                    .map((p, i) => {
                      const x = (i / Math.max(1, trend.length - 1)) * 540 + 10;
                      const y = 170 - (Number(p.count || 0) / maxTrend) * 130;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />
                {trend.map((p, i) => {
                  const x = (i / Math.max(1, trend.length - 1)) * 540 + 10;
                  const y = 170 - (Number(p.count || 0) / maxTrend) * 130;
                  return <circle key={p.day} cx={x} cy={y} r="4" fill="#0f766e" />;
                })}
              </svg>
              <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                <span>{trend[0]?.day ?? "—"}</span>
                <span>{trend[trend.length - 1]?.day ?? "—"}</span>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-5">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Activité / qualité</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative h-28 w-28 rounded-full bg-[conic-gradient(#0ea5e9_0_38%,#f59e0b_38%_62%,#e5e7eb_62%_100%)] p-3">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700">
                  {trustedScore}%
                </div>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">Score confiance:</span> {trustedScore}/100
                </p>
                <p>
                  <span className="font-semibold text-slate-800">CTR pub:</span> {overview.adSummary.ctrPct ?? 0}%
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Docs/utilisateur:</span>{" "}
                  {(overview.documentsTotal / Math.max(1, overview.userCount)).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Dernières activités</h2>
            <ul className="mt-3 space-y-2">
              {overview.recentLogins.slice(0, 4).map((u) => (
                <li key={u.id} className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                  <div>
                    <p className="font-semibold text-slate-700">{u.full_name}</p>
                    <p className="text-slate-500">{u.email}</p>
                  </div>
                  <span className="text-slate-400">{u.last_login ? new Date(u.last_login).toLocaleTimeString("fr-FR") : "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-base font-semibold text-slate-800">Mix produit (documents par type)</h2>
          <div className="mt-4 space-y-3">
            {typeEntries.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune donnée.</p>
            ) : (
              typeEntries.map(([type, n]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-slate-700">{labelType(type)}</span>
                    <span className="font-medium">{n}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(n / maxType) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Pays connectés</h2>
          <div className="mt-3 space-y-2 text-sm">
            {(overview.topCountriesByLogin ?? []).length === 0 ? (
              <p className="text-slate-500">Aucune donnée disponible.</p>
            ) : (
              (overview.topCountriesByLogin ?? []).slice(0, 6).map((c) => (
                <div key={c.country} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>{c.country}</span>
                  <span className="font-semibold">{c.count}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Rythme horaire (UTC)</h2>
          <div className="mt-4 flex h-36 items-end gap-0.5">
            {hourEntries.map(([h, n]) => (
              <div key={h} className="flex flex-1 flex-col items-center justify-end">
                <div
                  className="w-full max-w-[10px] rounded-t bg-gradient-to-t from-teal-600 to-cyan-400"
                  style={{ height: `${Math.max(4, (n / maxHour) * 100)}%` }}
                  title={`${h}h : ${n}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0h</span>
            <span>12h</span>
            <span>23h</span>
          </div>
        </section>

        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Saisonnalité hebdomadaire</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {days.map((d, i) => {
              const n = overview.documentsByWeekday[i] ?? overview.documentsByWeekday[String(i)] ?? 0;
              const maxD = Math.max(1, ...Object.values(overview.documentsByWeekday).map(Number));
              return (
                <div key={d} className="flex flex-col items-center">
                  <div
                    className="flex w-10 items-end justify-center rounded-t bg-gradient-to-t from-teal-700 to-emerald-400"
                    style={{ height: `${Math.max(8, (n / maxD) * 80)}px` }}
                  />
                  <span className="mt-1 text-xs text-slate-600">{d}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-teal-50/50 p-5 sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Équipe & gouvernance</h2>
            <p className="mt-1 text-sm text-slate-600">
              Création de comptes, rôles et permissions — centralisé pour éviter d’alourdir cette vue.
            </p>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            Ouvrir Utilisateurs
          </Link>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Audience qualifiée</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="font-medium text-slate-700">Genre</div>
            {Object.keys(overview.demographics.gender).length === 0 ? (
              <p className="text-slate-500">Pas encore de données.</p>
            ) : (
              Object.entries(overview.demographics.gender).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))
            )}
            <div className="mt-3 font-medium text-slate-700">Typologie</div>
            {Object.keys(overview.demographics.user_typology).length === 0 ? (
              <p className="text-slate-500">Non renseigné.</p>
            ) : (
              Object.entries(overview.demographics.user_typology).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Performance pub par zone</h2>
          <div className="mt-3 space-y-2 text-sm">
            {Object.keys(overview.adSummary.byZone || {}).length === 0 ? (
              <p className="text-slate-500">Aucun événement enregistré.</p>
            ) : (
              Object.entries(overview.adSummary.byZone).map(([zone, z]) => (
                <div key={zone} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2">
                  <span className="font-medium">{zone}</span>
                  <span className="text-slate-600">
                    vues {z.views ?? 0} · clics {z.clicks ?? 0} · CTR {z.ctrPct ?? 0}%
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  accent
}: {
  label: string;
  value: string;
  hint: string;
  accent: "teal" | "emerald" | "cyan" | "amber";
}) {
  const accentMap: Record<string, string> = {
    teal: "from-teal-50 to-teal-100 text-teal-800",
    emerald: "from-emerald-50 to-emerald-100 text-emerald-800",
    cyan: "from-cyan-50 to-cyan-100 text-cyan-800",
    amber: "from-amber-50 to-amber-100 text-amber-800"
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-gradient-to-br p-4 shadow-sm ${accentMap[accent]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-slate-600">{hint}</div>
    </div>
  );
}

function labelType(t: string) {
  const m: Record<string, string> = {
    invoice: "Factures",
    proforma: "Proforma",
    devis: "Devis",
    payslip: "Bulletins de salaire"
  };
  return m[t] ?? t;
}
