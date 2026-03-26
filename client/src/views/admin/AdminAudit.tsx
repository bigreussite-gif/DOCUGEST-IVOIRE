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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text">Confiance & traçabilité</h1>
        <p className="mt-1 text-slate-600">
          Journal des actions sensibles côté serveur. Rafraîchissement automatique toutes les 30 secondes.
        </p>
      </div>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Signal confiance: chaque action admin est horodatée et attribuée, ce qui réduit le risque de fraude interne.
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Acteur</th>
              <th className="px-4 py-3">Cible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                  {new Date(r.created_at).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-2 font-mono text-xs">{r.action}</td>
                <td className="px-4 py-2">{r.actor_name || r.actor_email || "—"}</td>
                <td className="px-4 py-2 text-slate-600">
                  {r.target_type} {r.target_id ? `· ${r.target_id.slice(0, 8)}…` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? <div className="p-6 text-center text-slate-500">Aucune entrée pour l’instant.</div> : null}
      </div>
    </div>
  );
}
