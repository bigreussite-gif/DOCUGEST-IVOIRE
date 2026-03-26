import { useEffect, useState } from "react";
import { adminFetch } from "../../lib/adminApi";

type Row = {
  id: string;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  actor_email?: string | null;
  actor_name?: string | null;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export function AdminAudit() {
  const [items, setItems] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      adminFetch<{ items: Row[] }>("/audit?limit=150")
        .then((r) => {
          if (!cancelled) setItems(r.items);
        })
        .catch((e) => {
          if (!cancelled) setErr(e instanceof Error ? e.message : "Erreur");
        });
    void load();
    const t = setInterval(() => void load(), 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (err) return <div className="rounded-xl bg-rose-50 p-4 text-rose-800">{err}</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200/90 bg-gradient-to-br from-emerald-50/50 p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Confiance</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Traçabilité des actions</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Journal des opérations sensibles côté serveur. Rafraîchissement automatique toutes les 30 secondes. Dès que les
          premières actions seront enregistrées, elles apparaîtront ici.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[min(70vh,640px)] overflow-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 text-xs uppercase tracking-wide text-slate-500 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Acteur</th>
                <th className="px-4 py-3">Cible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                    {new Date(r.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-800">{r.action}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{r.actor_name || r.actor_email || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {r.target_type} {r.target_id ? `· ${r.target_id.slice(0, 8)}…` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 ? (
          <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100/80 text-2xl text-emerald-700">
              ◎
            </div>
            <p className="mt-4 text-base font-semibold text-slate-800">Aucune entrée pour l’instant</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Le journal se remplira automatiquement lors des actions admin (configuration, utilisateurs, publicités,
              etc.). C’est normal en phase de démarrage.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
