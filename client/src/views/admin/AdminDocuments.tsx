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

function statusPill(status: string) {
  const s = status.toLowerCase();
  const cls =
    s === "paid"
      ? "bg-emerald-100 text-emerald-900"
      : s === "sent"
        ? "bg-sky-100 text-sky-900"
        : s === "draft"
          ? "bg-slate-100 text-slate-700"
          : s === "cancelled"
            ? "bg-rose-100 text-rose-800"
            : "bg-amber-50 text-amber-900";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${cls}`}>{status}</span>;
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
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-sm ring-1 ring-slate-100 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Pilotage documentaire</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Documents plateforme</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Vue consolidée pour le support et le board : recherche rapide, filtres par type, accès direct au document
              côté utilisateur.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm sm:text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Total</div>
            <div className="text-2xl font-bold tabular-nums text-slate-900">{total}</div>
            <div className="text-xs text-slate-500">documents</div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Rechercher : numéro, client, e-mail, propriétaire…"
          className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
        <select
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
          className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
        >
          <option value="all">Tous les types</option>
          <option value="invoice">Factures</option>
          <option value="proforma">Proformas</option>
          <option value="devis">Devis</option>
          <option value="payslip">Bulletins</option>
        </select>
        <div className="flex items-center justify-end text-xs text-slate-500 md:min-w-[100px]">
          Page {page} / {totalPages}
        </div>
      </div>

      {err ? <div className="rounded-xl bg-rose-50 p-4 text-rose-800">{err}</div> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[min(70vh,720px)] overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 text-xs uppercase tracking-wide text-slate-500 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3">Numéro</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Propriétaire</th>
                <th className="px-4 py-3">Créé le</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                    Chargement…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-500" colSpan={8}>
                    Aucun document ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                items.map((d, i) => (
                  <tr key={d.id} className={i % 2 === 0 ? "bg-white hover:bg-teal-50/40" : "bg-slate-50/40 hover:bg-teal-50/50"}>
                    <td className="px-4 py-2.5 font-semibold text-primary">{d.doc_number}</td>
                    <td className="px-4 py-2.5 text-slate-700">{typeLabel(d.type)}</td>
                    <td className="px-4 py-2.5 text-slate-800">{d.client_name}</td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums text-slate-900">{formatFCFA(Number(d.total_amount || 0))}</td>
                    <td className="px-4 py-2.5">{statusPill(d.status)}</td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-slate-800">{d.owner_name ?? "—"}</div>
                      <div className="text-xs text-slate-500">{d.owner_email ?? ""}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">
                      {d.created_at ? new Date(d.created_at).toLocaleString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <a
                        href={`/dashboard/${d.type === "payslip" ? `payslip/${d.id}` : `invoice/${d.id}`}`}
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        Ouvrir
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Précédent
        </button>
        <span className="text-sm text-slate-600">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
