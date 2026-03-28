import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "../../lib/adminApi";
import { notifyAdSlotsUpdated } from "../../store/adSlotsStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { compressImageToWebP } from "../../lib/imageCompress";

type AdCfg = {
  slot: string;
  page: string;
  category: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  imageDataUrl: string;
  imageFit: "cover" | "contain";
  imageFrame: "banner" | "photo" | "square";
  active: boolean;
  updated_at: string | null;
};

const PRESET_SLOTS = [
  "top-bar-partners",
  "top-banner",
  "bottom-bar-partners",
  "bottom-bar-adsense",
  "landing-hero",
  "dashboard-inline",
  "invoice-sidebar",
  "invoice-editor-top",
  "invoice-editor-before-preview"
];

const SLOT_LABELS: Record<string, string> = {
  "top-bar-partners": "Barre haut — partenaires",
  "top-banner": "Bandeau haut — pub principale",
  "bottom-bar-partners": "Barre bas — partenaires",
  "bottom-bar-adsense": "Barre bas — Ads",
  "landing-hero": "Landing — héros",
  "dashboard-inline": "Dashboard — inline",
  "invoice-sidebar": "Facture — encart (legacy)",
  "invoice-editor-top": "Facture — après type de document",
  "invoice-editor-before-preview": "Facture — avant aperçu PDF"
};

export function AdminAds() {
  const [items, setItems] = useState<AdCfg[]>([]);
  const [slot, setSlot] = useState("dashboard-inline");
  const [page, setPage] = useState("global");
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageFit, setImageFit] = useState<"cover" | "contain">("cover");
  const [imageFrame, setImageFrame] = useState<"banner" | "photo" | "square">("photo");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await adminFetch<{ items: AdCfg[] }>("/ads");
    setItems(res.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  const occupiedSlots = useMemo(() => new Set(items.filter((i) => i.active).map((i) => i.slot)), [items]);

  const currentSlotConfig = useMemo(() => items.find((i) => i.slot === slot), [items, slot]);

  useEffect(() => {
    const c = currentSlotConfig;
    if (!c) {
      setTitle("");
      setBody("");
      setCtaLabel("");
      setCtaUrl("");
      setImageDataUrl("");
      setImageFit("cover");
      setImageFrame("photo");
      setPage("global");
      setCategory("general");
      setActive(true);
      return;
    }
    setTitle(c.title);
    setBody(c.body);
    setCtaLabel(c.ctaLabel);
    setCtaUrl(c.ctaUrl);
    setImageDataUrl(c.imageDataUrl ?? "");
    setImageFit(c.imageFit === "contain" ? "contain" : "cover");
    setImageFrame(c.imageFrame === "banner" || c.imageFrame === "square" ? c.imageFrame : "photo");
    setPage(c.page);
    setCategory(c.category);
    setActive(c.active);
  }, [currentSlotConfig, slot]);

  async function onPickImage(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setCompressing(true);
    setMsg(null);
    try {
      const dataUrl = await compressImageToWebP(file, 1200, 0.82);
      setImageDataUrl(dataUrl);
      if (file.type === "image/gif" && file.size > 3_000_000) {
        setMsg("GIF accepté — attention : il est volumineux, ce qui peut ralentir l’affichage.");
      }
    } catch {
      setMsg("Impossible de traiter l’image.");
    } finally {
      setCompressing(false);
    }
  }

  async function save() {
    if (!imageDataUrl.trim() && !title.trim() && !body.trim()) {
      setMsg("Ajoutez une image ou un titre / texte.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await adminFetch("/ads", {
        method: "POST",
        json: { slot, page, category, title, body, ctaLabel, ctaUrl, imageDataUrl, imageFit, imageFrame, active }
      });
      setMsg("Publicité enregistrée.");
      await load();
      notifyAdSlotsUpdated();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur sauvegarde");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">Monétisation</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Publicités & emplacements</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Importez un visuel (optimisé WebP automatiquement), prévisualisez puis publiez. Les emplacements libres et
          occupés sont indiqués ci-dessous.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Emplacements</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_SLOTS.map((s) => {
            const occ = occupiedSlots.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={[
                  "flex flex-col rounded-xl border px-3 py-3 text-left text-sm transition",
                  slot === s
                    ? "border-primary bg-primary/5 ring-1 ring-primary/25"
                    : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
                ].join(" ")}
              >
                <span className="font-medium text-slate-800">{SLOT_LABELS[s] ?? s}</span>
                <span className="mt-1 font-mono text-[11px] text-slate-500">{s}</span>
                <span
                  className={[
                    "mt-2 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    occ ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                  ].join(" ")}
                >
                  {occ ? "Occupé" : "Libre"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Ajouter une publicité</h2>
          <p className="mt-1 text-xs text-slate-500">
            Image + lien : le clic sur le visuel ouvre l’URL (https://…). Ajustez le cadre et le remplissage pour un rendu
            net sans bandes vides.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-text">Visuel</span>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
              />
            </label>
            {compressing ? <p className="text-sm text-slate-500 sm:col-span-2">Traitement image…</p> : null}
            <p className="text-[11px] text-slate-400 sm:col-span-2">PNG, JPG, WebP, SVG → optimisé WebP · GIF → conservé tel quel (animation préservée)</p>

            <Input label="Titre (court)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Promo livraison" />
            <Input label="Texte (optionnel)" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Sous-titre" />
            <Input label="Libellé bouton (optionnel)" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
            <Input
              label="Lien de destination (URL)"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://votre-offre.com"
            />
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-text">Forme du cadre sur le site</span>
              <select
                value={imageFrame}
                onChange={(e) => setImageFrame(e.target.value as "banner" | "photo" | "square")}
                className="min-h-[48px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
              >
                <option value="banner">Bandeau large (21:9)</option>
                <option value="photo">Photo / carte (4:3)</option>
                <option value="square">Carré (1:1)</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-text">Remplissage du cadre</span>
              <select
                value={imageFit}
                onChange={(e) => setImageFit(e.target.value as "cover" | "contain")}
                className="min-h-[48px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
              >
                <option value="cover">Couvrir tout l’espace (recadre si besoin, sans vide)</option>
                <option value="contain">Voir toute l’image (bandes possibles)</option>
              </select>
            </label>
            <Input label="Page cible" value={page} onChange={(e) => setPage(e.target.value)} />
            <Input label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)} />
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-text">Visibilité</span>
              <select
                value={active ? "1" : "0"}
                onChange={(e) => setActive(e.target.value === "1")}
                className="min-h-[48px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
              >
                <option value="1">Active</option>
                <option value="0">Masquée</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void save()} disabled={busy || compressing}>
              {busy ? "Enregistrement…" : "Valider et publier"}
            </Button>
            {msg ? <span className="text-sm text-slate-600">{msg}</span> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-teal-300/80 bg-gradient-to-br from-teal-50/50 to-white p-5 shadow-inner">
          <h2 className="text-sm font-semibold text-slate-800">Prévisualisation</h2>
          <p className="mt-1 text-xs text-slate-500">Rendu approximatif sur le site (emplacement {slot}).</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            {imageDataUrl ? (
              <div
                className={[
                  "relative w-full overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80",
                  imageFrame === "banner"
                    ? "aspect-[21/9] min-h-[52px]"
                    : imageFrame === "square"
                      ? "aspect-square max-h-56"
                      : "aspect-[4/3] max-h-56"
                ].join(" ")}
              >
                <img
                  src={imageDataUrl}
                  alt=""
                  className={`h-full w-full object-center ${imageFit === "cover" ? "object-cover" : "object-contain"}`}
                />
              </div>
            ) : (
              <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-400">Aucune image</div>
            )}
            {title ? <p className="mt-3 text-center text-sm font-semibold text-slate-800">{title}</p> : null}
            {body ? <p className="mt-1 text-center text-xs text-slate-600">{body}</p> : null}
            {ctaUrl.trim() ? (
              <p className="mt-2 break-all text-center text-[10px] text-emerald-700">
                Clic sur l’image → {ctaUrl.trim().length > 52 ? `${ctaUrl.trim().slice(0, 52)}…` : ctaUrl.trim()}
              </p>
            ) : null}
            {ctaLabel && ctaUrl ? (
              <div className="mt-3 flex justify-center">
                <span className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">{ctaLabel}</span>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Aperçu</th>
              <th className="px-4 py-3">Actif</th>
              <th className="px-4 py-3">Mis à jour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((i) => (
              <tr key={i.slot} className="hover:bg-slate-50/80">
                <td className="px-4 py-2 font-medium">{i.slot}</td>
                <td className="px-4 py-2">{i.page}</td>
                <td className="px-4 py-2">
                  {i.imageDataUrl ? (
                    <img src={i.imageDataUrl} alt="" className="h-10 w-24 rounded object-cover" />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-2">{i.active ? "Oui" : "Non"}</td>
                <td className="px-4 py-2 text-slate-600">
                  {i.updated_at ? new Date(i.updated_at).toLocaleString("fr-FR") : "—"}
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  Aucune configuration.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
