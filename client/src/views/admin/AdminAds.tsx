import { useEffect, useState } from "react";
import { adminFetch } from "../../lib/adminApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

type AdCfg = {
  slot: string;
  page: string;
  category: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
  updated_at: string | null;
};

const PRESET_SLOTS = [
  "top-banner",
  "bottom-bar-partners",
  "bottom-bar-adsense",
  "landing-hero",
  "dashboard-inline",
  "invoice-sidebar"
];

export function AdminAds() {
  const [items, setItems] = useState<AdCfg[]>([]);
  const [slot, setSlot] = useState("top-banner");
  const [page, setPage] = useState("global");
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await adminFetch<{ items: AdCfg[] }>("/ads");
    setItems(res.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      await adminFetch("/ads", {
        method: "POST",
        json: { slot, page, category, title, body, ctaLabel, ctaUrl, active }
      });
      setMsg("Affichage sauvegardé.");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur sauvegarde");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Gestion des affichages publicitaires</h1>
        <p className="mt-1 text-slate-600">Définissez les visuels par emplacement, page et catégorie depuis l’admin.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-text">Slot</span>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full rounded-xl border border-border px-3 py-2 text-sm"
            >
              {PRESET_SLOTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <Input label="Page (ex: landing, dashboard)" value={page} onChange={(e) => setPage(e.target.value)} />
          <Input label="Catégorie (ex: finance, telecom)" value={category} onChange={(e) => setCategory(e.target.value)} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-text">Actif</span>
            <select
              value={active ? "1" : "0"}
              onChange={(e) => setActive(e.target.value === "1")}
              className="w-full rounded-xl border border-border px-3 py-2 text-sm"
            >
              <option value="1">Oui</option>
              <option value="0">Non</option>
            </select>
          </label>
          <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Texte" value={body} onChange={(e) => setBody(e.target.value)} />
          <Input label="Libellé bouton" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
          <Input label="URL bouton" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button type="button" onClick={() => void save()} disabled={busy}>
            {busy ? "Sauvegarde..." : "Enregistrer affichage"}
          </Button>
          {msg ? <span className="text-sm text-slate-600">{msg}</span> : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Actif</th>
              <th className="px-4 py-3">Mis à jour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((i) => (
              <tr key={i.slot} className="hover:bg-slate-50/80">
                <td className="px-4 py-2 font-medium">{i.slot}</td>
                <td className="px-4 py-2">{i.page}</td>
                <td className="px-4 py-2">{i.category}</td>
                <td className="px-4 py-2">{i.title || "—"}</td>
                <td className="px-4 py-2">{i.active ? "Oui" : "Non"}</td>
                <td className="px-4 py-2 text-slate-600">
                  {i.updated_at ? new Date(i.updated_at).toLocaleString("fr-FR") : "—"}
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={6}>
                  Aucun affichage configuré.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
