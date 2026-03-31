import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "../../lib/adminApi";
import { notifyAdSlotsUpdated } from "../../store/adSlotsStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { compressImageToWebP } from "../../lib/imageCompress";
import { AD_FRAME_OPTIONS, frameBoxClass, normalizeAdFrame } from "../../lib/adFrames";

type AdCfg = {
  slot: string;
  page: string;
  category: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string;
  imageDataUrl: string;
  imageFit: "cover" | "contain";
  imageFrame: string;
  htmlEmbed: string;
  active: boolean;
  updated_at: string | null;
};

const PRESET_SLOTS_BY_GROUP: Record<string, string[]> = {
  "🌍 Barres globales": [
    "top-bar-partners",
    "top-banner",
    "bottom-bar-partners",
    "bottom-bar-adsense",
  ],
  "🏠 Landing page": [
    "landing-hero",
    "landing-after-modules",
    "landing-cta",
    "landing-bottom",
  ],
  "🔐 Authentification": [
    "login-inline",
    "register-inline",
  ],
  "📊 Application": [
    "dashboard-home-top",
    "dashboard-home-mid",
    "dashboard-home-bottom",
    "dashboard-inline",
    "profile-inline",
    "invoice-editor-top",
    "invoice-editor-before-preview",
    "payslip-editor-inline",
    "cv-editor-inline",
    "contrat-travail-editor-inline",
    "lettre-motivation-editor-inline",
    "contrat-prestation-editor-inline",
    "recu-paiement-editor-inline",
    "bon-commande-editor-inline",
    "bon-livraison-editor-inline",
  ],
  "🔑 Mot de passe": ["forgot-password-inline", "reset-password-inline"],
  "📝 Blog": [
    "blog-list-top",
    "blog-list-mid",
    "blog-list-bottom",
    "blog-sidebar",
    "blog-sidebar-bottom",
    "blog-article-mid",
  ],
};

const PRESET_SLOTS = Object.values(PRESET_SLOTS_BY_GROUP).flat();

/** Page cible (filtrage / suivi côté admin) */
const PAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "global", label: "Global — tout le site" },
  { value: "landing", label: "Landing (accueil public)" },
  { value: "dashboard", label: "Espace connecté / Dashboard" },
  { value: "blog", label: "Blog" },
  { value: "auth", label: "Connexion & inscription" },
  { value: "password", label: "Mot de passe oublié / réinitialisation" },
  { value: "documents", label: "Éditeurs de documents" },
  { value: "monetization", label: "Barres monétisation (haut / bas)" }
];

/** Catégorie commerciale */
const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "general", label: "Général" },
  { value: "partner", label: "Partenaire / sponsor" },
  { value: "promo", label: "Promotion / offre" },
  { value: "adsense", label: "Régies / AdSense / programmatic" },
  { value: "internal", label: "Communication interne DocuGest" },
  { value: "ngo", label: "Association / ONG" },
  { value: "commerce", label: "Commerce / e-commerce" }
];

function slotHasVisualContent(c: AdCfg | undefined): boolean {
  if (!c) return false;
  return Boolean(
    c.imageUrl?.trim() ||
      c.imageDataUrl?.trim() ||
      c.htmlEmbed?.trim() ||
      c.title?.trim() ||
      c.body?.trim()
  );
}

const SLOT_LABELS: Record<string, string> = {
  "top-bar-partners": "Barre haut — partenaires",
  "top-banner": "Bandeau haut — pub principale",
  "bottom-bar-partners": "Barre bas — partenaires",
  "bottom-bar-adsense": "Barre bas — Ads / partenaires",
  "login-inline": "Page connexion — bandeau pub",
  "register-inline": "Page inscription — bandeau pub",
  "dashboard-inline": "Dashboard — inline (principal)",
  "invoice-editor-top": "Facture — après type de document",
  "invoice-editor-before-preview": "Facture — avant aperçu PDF",
  "payslip-editor-inline": "Bulletin de salaire — inline",
  "landing-hero": "Landing — section héros",
  "landing-after-modules": "Landing — après les modules",
  "landing-cta": "Landing — section CTA / appel à l'action",
  "landing-bottom": "Landing — pied de page",
  "blog-list-top": "Blog liste — haut (sous le héros)",
  "blog-list-mid": "Blog liste — milieu (entre articles)",
  "blog-list-bottom": "Blog liste — bas de page",
  "blog-sidebar": "Blog article — sidebar haut",
  "blog-sidebar-bottom": "Blog article — sidebar bas",
  "blog-article-mid": "Blog article — milieu du contenu",
  "dashboard-home-top": "Dashboard accueil — sous bannière confiance",
  "dashboard-home-mid": "Dashboard accueil — entre blocs",
  "dashboard-home-bottom": "Dashboard accueil — avant pied de page",
  "profile-inline": "Page profil — bandeau",
  "cv-editor-inline": "Éditeur CV — bandeau",
  "contrat-travail-editor-inline": "Éditeur contrat travail — bandeau",
  "lettre-motivation-editor-inline": "Éditeur lettre motivation — bandeau",
  "contrat-prestation-editor-inline": "Éditeur contrat prestation — bandeau",
  "recu-paiement-editor-inline": "Éditeur reçu paiement — bandeau",
  "bon-commande-editor-inline": "Éditeur bon de commande — bandeau",
  "bon-livraison-editor-inline": "Éditeur bon de livraison — bandeau",
  "forgot-password-inline": "Mot de passe oublié — bandeau",
  "reset-password-inline": "Réinitialisation MDP — bandeau",
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
  const [imageUrl, setImageUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageFit, setImageFit] = useState<"cover" | "contain">("cover");
  const [imageFrame, setImageFrame] = useState<string>("photo");
  const [htmlEmbed, setHtmlEmbed] = useState("");
  const [adMode, setAdMode] = useState<"image" | "html">("image");
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

  const currentSlotConfig = useMemo(() => items.find((i) => i.slot === slot), [items, slot]);

  useEffect(() => {
    const c = currentSlotConfig;
    if (!c) {
      setTitle("");
      setBody("");
      setCtaLabel("");
      setCtaUrl("");
      setImageUrl("");
      setImageDataUrl("");
      setImageFit("cover");
      setImageFrame("photo");
      setHtmlEmbed("");
      setAdMode("image");
      setPage("global");
      setCategory("general");
      setActive(true);
      return;
    }
    setTitle(c.title);
    setBody(c.body);
    setCtaLabel(c.ctaLabel);
    setCtaUrl(c.ctaUrl);
    setImageUrl(c.imageUrl ?? "");
    setImageDataUrl(c.imageDataUrl ?? "");
    setImageFit(c.imageFit === "contain" ? "contain" : "cover");
    setImageFrame(normalizeAdFrame(c.imageFrame));
    setHtmlEmbed(c.htmlEmbed ?? "");
    setAdMode(c.htmlEmbed?.trim() ? "html" : "image");
    setPage(PAGE_OPTIONS.some((o) => o.value === c.page) ? c.page : "global");
    setCategory(CATEGORY_OPTIONS.some((o) => o.value === c.category) ? c.category : "general");
    setActive(c.active);
  }, [currentSlotConfig, slot]);

  async function onPickImage(file: File | null) {
    if (!file) return;
    const allowed =
      /^(image\/(jpeg|png|gif|webp))$/i.test(file.type) ||
      /\.(jpe?g|png|gif|webp)$/i.test(file.name);
    if (!allowed) {
      setMsg("Formats acceptés : JPEG, JPG, PNG, GIF, WebP.");
      return;
    }
    setCompressing(true);
    setMsg(null);
    try {
      const dataUrl = await compressImageToWebP(file, 1200, 0.82);
      setImageDataUrl(dataUrl);
      setImageUrl("");
      if (file.type === "image/gif" && file.size > 1_500_000) {
        setMsg(
          "GIF volumineux : l’enregistrement peut échouer (limite serveur). Préférez déposer le fichier dans public/ (ex. /banners/hero.gif) et indiquez l’URL ci‑dessous."
        );
      }
    } catch {
      setMsg("Impossible de traiter l’image.");
    } finally {
      setCompressing(false);
    }
  }

  async function save(opts?: { forcePublish?: boolean }) {
    const hasVisual =
      Boolean(imageUrl.trim()) || Boolean(imageDataUrl.trim()) || Boolean(title.trim()) || Boolean(body.trim());
    if (!hasVisual && !(adMode === "html" && htmlEmbed.trim())) {
      setMsg("Ajoutez une image (fichier ou URL), un code HTML ou un titre / texte.");
      return;
    }
    const effectiveActive = opts?.forcePublish === true ? true : active;
    setBusy(true);
    setMsg(null);
    try {
      await adminFetch("/ads", {
        method: "POST",
        json: {
          slot,
          page,
          category,
          title,
          body,
          ctaLabel,
          ctaUrl,
          imageUrl: imageUrl.trim(),
          imageDataUrl,
          imageFit,
          imageFrame: normalizeAdFrame(imageFrame),
          htmlEmbed: adMode === "html" ? htmlEmbed : "",
          active: effectiveActive
        }
      });
      if (opts?.forcePublish) setActive(true);
      setMsg(
        effectiveActive
          ? "Publicité enregistrée et publiée — visible sur le site sous ~1 min (cache)."
          : "Configuration enregistrée (masquée sur le site)."
      );
      await load();
      notifyAdSlotsUpdated();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur sauvegarde");
    } finally {
      setBusy(false);
    }
  }

  async function removeSlotConfig() {
    if (!window.confirm("Supprimer cette publicité de l'emplacement sélectionné ?")) return;
    setBusy(true);
    setMsg(null);
    try {
      await adminFetch(`/ads?slot=${encodeURIComponent(slot)}`, { method: "DELETE" });
      setTitle("");
      setBody("");
      setCtaLabel("");
      setCtaUrl("");
      setImageUrl("");
      setImageDataUrl("");
      setImageFit("cover");
      setImageFrame("photo");
      setHtmlEmbed("");
      setAdMode("image");
      setPage("global");
      setCategory("general");
      setActive(false);
      setMsg("Publicité supprimée. Le slot repassera en Libre après rafraîchissement.");
      await load();
      notifyAdSlotsUpdated();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur suppression");
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
        <h2 className="text-sm font-semibold text-slate-800">Emplacements publicitaires</h2>
        <p className="mt-1 text-xs text-slate-500">
          <strong>Libre</strong> = aucun contenu enregistré · <strong>Occupé</strong> = visuel ou texte · <strong>En ligne</strong> = visible sur le site.
        </p>
        <div className="mt-4 space-y-4">
          {Object.entries(PRESET_SLOTS_BY_GROUP).map(([groupLabel, slots]) => (
            <div key={groupLabel}>
              <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{groupLabel}</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {slots.map((s) => {
                  const cfg = items.find((i) => i.slot === s);
                  const filled = slotHasVisualContent(cfg);
                  const online = filled && cfg?.active;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={[
                        "flex flex-col rounded-xl border px-3 py-3 text-left text-sm transition",
                        slot === s
                          ? "border-primary bg-primary/5 ring-1 ring-primary/25"
                          : online
                            ? "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300"
                            : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
                      ].join(" ")}
                    >
                      <span className="font-medium text-slate-800 text-xs leading-tight">{SLOT_LABELS[s] ?? s}</span>
                      <span className="mt-1 font-mono text-[10px] text-slate-400">{s}</span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span
                          className={[
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                            filled ? "bg-amber-100 text-amber-900" : "bg-slate-200 text-slate-600"
                          ].join(" ")}
                        >
                          {filled ? "Occupé" : "Libre"}
                        </span>
                        {filled ? (
                          <span
                            className={[
                              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                              online ? "bg-emerald-100 text-emerald-800" : "bg-slate-300 text-slate-700"
                            ].join(" ")}
                          >
                            {online ? "En ligne" : "Masqué"}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">
            Configurer : <span className="text-primary">{SLOT_LABELS[slot] ?? slot}</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Emplacement : <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px]">{slot}</code>
          </p>

          {/* Mode */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setAdMode("image")}
              className={["rounded-xl px-4 py-2 text-sm font-medium transition", adMode === "image" ? "bg-primary text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"].join(" ")}
            >
              Image / bannière
            </button>
            <button
              type="button"
              onClick={() => setAdMode("html")}
              className={["rounded-xl px-4 py-2 text-sm font-medium transition", adMode === "html" ? "bg-primary text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"].join(" ")}
            >
              Code HTML (AdSense…)
            </button>
          </div>

          {adMode === "html" ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <strong>Code HTML brut</strong> — collez ici votre balise AdSense, un iframe partenaire ou tout code HTML de bannière. Il sera injecté tel quel sur le site.
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-text">Code HTML / AdSense</span>
                <textarea
                  value={htmlEmbed}
                  onChange={(e) => setHtmlEmbed(e.target.value)}
                  rows={9}
                  className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="<ins class=&quot;adsbygoogle&quot; ...></ins>"
                />
              </label>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-text">Visuel</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                  onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
                />
              </label>
              {compressing ? <p className="text-sm text-slate-500 sm:col-span-2">Traitement image…</p> : null}
              <p className="text-[11px] text-slate-400 sm:col-span-2">
                Formats acceptés : <strong>JPEG, JPG, PNG, GIF, WebP</strong>. PNG/JPG/WebP → optimisés en WebP · GIF → conservé
                (animation). GIF lourd : préférez l’URL ci‑dessous.
              </p>

              <div className="sm:col-span-2">
                <Input
                  label="URL du visuel (recommandé pour GIF lourds)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Ex. /banners/jachete.gif ou https://…"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Déposez le fichier dans <code className="rounded bg-slate-100 px-1">client/public/…</code> puis saisissez le chemin web (ex.{" "}
                  <code className="rounded bg-slate-100 px-1">/jachete.gif</code>). Évite la limite de taille des images intégrées.
                </p>
              </div>

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
                  onChange={(e) => setImageFrame(e.target.value)}
                  className="min-h-[48px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
                >
                  {AD_FRAME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-text">Remplissage du cadre</span>
                <select
                  value={imageFit}
                  onChange={(e) => setImageFit(e.target.value as "cover" | "contain")}
                  className="min-h-[48px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
                >
                  <option value="cover">Couvrir tout l'espace (recadre si besoin, sans vide)</option>
                  <option value="contain">Voir toute l'image (bandes possibles)</option>
                </select>
              </label>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ciblage & visibilité</p>
            <label className="block sm:col-span-1">
              <span className="mb-1 block text-sm font-medium text-text">Page cible</span>
              <select
                value={PAGE_OPTIONS.some((o) => o.value === page) ? page : "global"}
                onChange={(e) => setPage(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
              >
                {PAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-1">
              <span className="mb-1 block text-sm font-medium text-text">Catégorie</span>
              <select
                value={CATEGORY_OPTIONS.some((o) => o.value === category) ? category : "general"}
                onChange={(e) => setCategory(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-text">Visibilité sur le site</span>
              <select
                value={active ? "1" : "0"}
                onChange={(e) => setActive(e.target.value === "1")}
                className="min-h-[48px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
              >
                <option value="1">Publiée — visible pour les visiteurs (après enregistrement)</option>
                <option value="0">Masquée — brouillon (non affichée)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Les encarts actifs sont diffusés via l’API publique (cache ~1 min). Utilisez « Valider et publier » pour forcer la publication.
              </p>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => void save({ forcePublish: true })}
              disabled={busy || compressing}
            >
              {busy ? "Enregistrement…" : "Valider et publier"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => void save()} disabled={busy || compressing}>
              Enregistrer (visibilité ci-dessus)
            </Button>
            <Button type="button" variant="ghost" onClick={() => void removeSlotConfig()} disabled={busy || compressing}>
              Supprimer la pub
            </Button>
            {msg ? <span className="text-sm text-slate-600">{msg}</span> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-teal-300/80 bg-gradient-to-br from-teal-50/50 to-white p-5 shadow-inner">
          <h2 className="text-sm font-semibold text-slate-800">Prévisualisation</h2>
          <p className="mt-1 text-xs text-slate-500">Rendu approximatif sur le site (emplacement {slot}).</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            {adMode === "html" && htmlEmbed.trim() ? (
              <div className="min-h-[120px] rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                <p className="mb-2 font-semibold text-slate-700">Aperçu code HTML (extrait)</p>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-slate-500">
                  {htmlEmbed.trim().slice(0, 800)}
                  {htmlEmbed.trim().length > 800 ? "…" : ""}
                </pre>
              </div>
            ) : imageUrl.trim() || imageDataUrl ? (
              <div
                className={[
                  "relative w-full overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80",
                  frameBoxClass(imageFrame)
                ].join(" ")}
              >
                <img
                  src={imageUrl.trim() || imageDataUrl}
                  alt=""
                  className={`h-full w-full object-center ${imageFit === "cover" ? "object-cover" : "object-contain"}`}
                />
              </div>
            ) : (
              <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-400">
                {adMode === "html" ? "Collez du code HTML à gauche" : "Aucune image"}
              </div>
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
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Aperçu</th>
              <th className="px-4 py-3">En ligne</th>
              <th className="px-4 py-3">Mis à jour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((i) => {
              const filled = slotHasVisualContent(i);
              return (
                <tr key={i.slot} className="hover:bg-slate-50/80">
                  <td className="px-4 py-2 font-medium">{i.slot}</td>
                  <td className="px-4 py-2">{i.page}</td>
                  <td className="px-4 py-2">
                    <span className={filled ? "text-amber-800" : "text-slate-500"}>{filled ? "Occupé" : "Libre"}</span>
                  </td>
                  <td className="px-4 py-2">
                    {i.imageUrl?.trim() || i.imageDataUrl ? (
                      <img src={i.imageUrl?.trim() || i.imageDataUrl} alt="" className="h-10 w-24 rounded object-cover" />
                    ) : i.htmlEmbed?.trim() ? (
                      <span className="text-[10px] text-slate-500">HTML</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{i.active ? "Oui" : "Non"}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {i.updated_at ? new Date(i.updated_at).toLocaleString("fr-FR") : "—"}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={6}>
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
