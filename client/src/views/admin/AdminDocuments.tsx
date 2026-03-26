import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "../../lib/adminApi";
import { formatFCFA } from "../../utils/formatters";

type DocRow = {
  id: string;
  user_id: string;
  type: string;
  doc_number: string;
  client_name: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string | null;
  owner_name: string | null;
  owner_email: string | null;
};

function typeLabel(t: string) {
  const m: Record<string, string> = {
    invoice: "Facture",
    proforma: "Proforma",
    devis: "Devis",
    payslip: "Bulletin"
  };
  return m[t] ?? t;
}

export function AdminDocuments() {
  const [items, setItems] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 30;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          type
        });
        if (q.trim()) params.set("q", q.trim());
        const res = await adminFetch<{ items: DocRow[]; total: number }>(`/documents?${params.toString()}`);
        if (!cancelled) {
          setItems(res.items ?? []);
          setTotal(Number(res.total ?? 0));
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [page, q, type]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text">Documents plateforme</h1>
        <p className="mt-1 text-slate-600">Tableau lisible des documents clients pour pilotage admin et support.</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_120px]">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Rechercher: numero, client, email, nom utilisateur"
          className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
        <select
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
          className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        >
          <option value="all">Tous les types</option>
          <option value="invoice">Factures</option>
          <option value="proforma">Proformas</option>
          <option value="devis">Devis</option>
          <option value="payslip">Bulletins</option>
        </select>
        <div className="flex items-center justify-end text-xs text-slate-500">{total} document(s)</div>
      </div>

      {err ? <div className="rounded-xl bg-rose-50 p-4 text-rose-800">{err}</div> : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Numero</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Proprietaire</th>
              <th className="px-4 py-3">Cree le</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-4 py-5 text-slate-500" colSpan={8}>
                  Chargement des documents...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-slate-500" colSpan={8}>
                  Aucun document trouve.
                </td>
              </tr>
            ) : (
              items.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2 font-medium text-primary">{d.doc_number}</td>
                  <td className="px-4 py-2">{typeLabel(d.type)}</td>
                  <td className="px-4 py-2">{d.client_name}</td>
                  <td className="px-4 py-2 font-semibold">{formatFCFA(Number(d.total_amount || 0))}</td>
                  <td className="px-4 py-2">{d.status}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{d.owner_name ?? "—"}</div>
                    <div className="text-xs text-slate-500">{d.owner_email ?? "—"}</div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {d.created_at ? new Date(d.created_at).toLocaleString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <a href={`/dashboard/${d.type === "payslip" ? `payslip/${d.id}` : `invoice/${d.id}`}`} className="text-primary underline">
                      Ouvrir
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prec.
        </button>
        <span className="text-sm text-slate-600">
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Suiv.
        </button>
      </div>
    </div>
  );
}
