import { useEffect, useState } from "react";
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
        const [o, i] = await Promise.all([
          adminFetch<Overview>("/analytics/overview"),
          adminFetch<Insights>("/analytics/insights")
        ]);
        if (!c) {
          setOverview(o);
          setInsights(i);
          setLastRefresh(new Date().toISOString());
        }
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-white to-primary/5 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text">Vue stratégique partenaires & investisseurs</h1>
            <p className="mt-1 text-sm text-slate-600">
              Signaux temps réel sur la traction produit, la confiance opérationnelle et le potentiel monétisation.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Live refresh: toutes les 30s · Derniere synchro {liveText}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Utilisateurs inscrits" value={String(overview.userCount)} hint="Base totale de comptes" />
        <KpiCard label="Adoption active (30 j.)" value={`${adoptionRate}%`} hint={`${overview.monthlyActiveUsers} utilisateurs actifs`} />
        <KpiCard label="Documents totaux" value={String(overview.documentsTotal)} hint="Volume métier produit" />
        <KpiCard
          label="CTR pub global"
          value={`${overview.adSummary.ctrPct ?? 0} %`}
          hint={`${overview.adSummary.views} vues / ${overview.adSummary.clicks} clics`}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Score confiance plateforme" value={`${trustedScore}/100`} hint="Disponibilité + usage + cohérence" />
        <KpiCard label="Signal revenu pub (est.)" value={`${adRevenueSignal.toLocaleString("fr-FR")} FCFA`} hint="Proxy basé sur clics" />
        <KpiCard
          label="Documents / utilisateur"
          value={`${(overview.documentsTotal / Math.max(1, overview.userCount)).toFixed(1)}`}
          hint="Intensité d’usage produit"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Mix produit (documents par type)</h2>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Rythme d’activité horaire (UTC)</h2>
          <p className="text-xs text-slate-500">Permet d’aligner support, campagnes et slots publicitaires premium.</p>
          <div className="mt-4 flex h-36 items-end gap-0.5">
            {hourEntries.map(([h, n]) => (
              <div key={h} className="flex flex-1 flex-col items-center justify-end">
                <div
                  className="w-full max-w-[10px] rounded-t bg-secondary/80"
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
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Saisonnalité hebdomadaire</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {days.map((d, i) => {
            const n = overview.documentsByWeekday[i] ?? overview.documentsByWeekday[String(i)] ?? 0;
            const maxD = Math.max(1, ...Object.values(overview.documentsByWeekday).map(Number));
            return (
              <div key={d} className="flex flex-col items-center">
                <div
                  className="flex w-10 items-end justify-center rounded-t bg-primary/70"
                  style={{ height: `${Math.max(8, (n / maxD) * 80)}px` }}
                />
                <span className="mt-1 text-xs text-slate-600">{d}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Audience qualifiée</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="font-medium text-slate-700">Genre</div>
            {Object.keys(overview.demographics.gender).length === 0 ? (
              <p className="text-slate-500">Pas encore de données — champ optionnel côté utilisateur.</p>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Performance pub par zone</h2>
          <div className="mt-3 space-y-2 text-sm">
            {Object.keys(overview.adSummary.byZone || {}).length === 0 ? (
              <p className="text-slate-500">Aucun événement enregistré — intégrez le tracking dans les emplacements promo.</p>
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

      <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Assistant décisionnel</h2>
        <p className="text-xs text-slate-500">Synthèses heuristiques — remplaçable par un modèle LLM connecté.</p>
        {insights ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-relaxed text-slate-800">{insights.summary}</p>
            <ul className="list-inside list-disc space-y-2 text-sm text-slate-700">
              {insights.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <div className="text-[10px] text-slate-400">
              Généré {new Date(insights.generatedAt).toLocaleString("fr-FR")} · {insights.model}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-slate-600">Chargement…</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Traçabilité récente des sessions</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {overview.recentLogins.slice(0, 12).map((u) => (
            <li key={u.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
              <span className="font-medium">{u.full_name}</span>
              <span className="text-slate-500">{u.email}</span>
              <span className="text-xs text-slate-400">
                {u.last_login ? new Date(u.last_login).toLocaleString("fr-FR") : "—"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-text">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
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
