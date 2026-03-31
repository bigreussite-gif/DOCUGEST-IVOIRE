import { useEffect, useMemo } from "react";
import { frameBoxClass } from "../../lib/adFrames";
import { trackAdEvent } from "../../lib/adTracking";
import { useAdSlotsStore } from "../../store/adSlotsStore";

type Props = {
  label: string;
  hint?: string;
  adSlot?: string;
  className?: string;
  minHeight?: string;
  /** En mode admin, afficher le placeholder vide. Par défaut, les zones vides sont invisibles. */
  showEmpty?: boolean;
};

type SlotConfig = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string;
  imageDataUrl: string;
  imageFit: "cover" | "contain";
  imageFrame: string;
  htmlEmbed: string;
};

function isValidHttpUrl(normalizedHref: string): boolean {
  const u = normalizedHref.trim();
  if (!u) return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`;
}

export function AdPlaceholder({ label, hint, adSlot, className = "", minHeight = "min-h-[72px]", showEmpty = false }: Props) {
  const raw = useAdSlotsStore((s) => (adSlot ? s.bySlot[adSlot] : undefined));
  const isFetching = useAdSlotsStore((s) => s.isFetching);

  const dynamic = useMemo((): SlotConfig | null => {
    if (!raw) return null;
    return {
      title: String(raw.title ?? ""),
      body: String(raw.body ?? ""),
      ctaLabel: String(raw.ctaLabel ?? ""),
      ctaUrl: String(raw.ctaUrl ?? ""),
      imageUrl: String(raw.imageUrl ?? ""),
      imageDataUrl: String(raw.imageDataUrl ?? ""),
      imageFit: raw.imageFit === "contain" ? "contain" : "cover",
      imageFrame: String(raw.imageFrame ?? "photo"),
      htmlEmbed: String(raw.htmlEmbed ?? ""),
    };
  }, [raw]);

  useEffect(() => {
    if (!adSlot) return;
    trackAdEvent("view", adSlot);
  }, [adSlot]);

  const hasContent = Boolean(
    dynamic?.imageUrl?.trim() ||
      dynamic?.imageDataUrl?.trim() ||
      dynamic?.title?.trim() ||
      dynamic?.body?.trim() ||
      dynamic?.htmlEmbed?.trim()
  );

  // Si aucun contenu et pas en mode showEmpty : ne rien afficher
  // (évite les zones vides visibles par les utilisateurs)
  if (!hasContent && !showEmpty && !isFetching) return null;

  const href = dynamic?.ctaUrl ? normalizeHref(dynamic.ctaUrl) : "";
  const linkOk = Boolean(href) && isValidHttpUrl(href);
  const fit = dynamic?.imageFit ?? "cover";
  const frameClass = frameBoxClass(dynamic?.imageFrame ?? "photo");
  const imgFitClass = fit === "contain" ? "object-contain" : "object-cover";

  function onTrackedClick() {
    if (adSlot) trackAdEvent("click", adSlot);
  }

  const imgSrc = (() => {
    const u = dynamic?.imageUrl?.trim();
    if (u) {
      if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/")) return u;
    }
    return dynamic?.imageDataUrl?.trim() ?? "";
  })();

  const hasImage = Boolean(imgSrc);

  const imageBlock = imgSrc ? (
    <div className={["relative w-full overflow-hidden rounded-xl bg-slate-200/50", frameClass].join(" ")}>
      {/* GIF animé : pas de ring pour ne pas couper les bords */}
      <img
        src={imgSrc}
        alt={dynamic?.title || label || "Publicité"}
        className={`h-full w-full ${imgFitClass} object-center`}
        loading={adSlot === "top-banner" || adSlot === "top-bar-partners" ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  ) : null;

  const imageWithLink =
    imgSrc && linkOk ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        onClick={onTrackedClick}
      >
        {imageBlock}
      </a>
    ) : imageBlock;

  // Zone vide pendant le chargement : on réserve l'espace sans afficher le label
  if (!hasContent && isFetching) {
    return (
      <div
        className={`rounded-xl ${minHeight} ${className} animate-pulse bg-slate-100/70`}
        data-ad-slot={adSlot}
        aria-hidden
      />
    );
  }

  // Zone vide admin (showEmpty=true) : placeholder visible pour les admins
  if (!hasContent && showEmpty) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 bg-gradient-to-br from-slate-50 to-slate-100/90 px-3 py-2 text-center ${minHeight} ${className}`}
        data-ad-slot={adSlot}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        {hint ? <span className="mt-1 text-[10px] text-slate-400">{hint}</span> : null}
        {adSlot ? <span className="mt-0.5 text-[9px] text-slate-300 font-mono">slot: {adSlot}</span> : null}
      </div>
    );
  }

  // Contenu réel — HTML embed (AdSense, script partenaire, etc.)
  // Isolation stricte via iframe srcDoc pour empêcher qu'un code pub
  // injecté (position:fixed, z-index, listeners globaux...) bloque les boutons de l'app.
  if (dynamic?.htmlEmbed?.trim()) {
    return (
      <div className={`w-full overflow-hidden rounded-xl ring-1 ring-slate-200/80 ${minHeight} ${className}`} data-ad-slot={adSlot}>
        <iframe
          title={`ad-slot-${adSlot ?? "inline"}`}
          className="h-full min-h-[56px] w-full border-0 bg-white"
          srcDoc={dynamic.htmlEmbed}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  // Contenu réel — image / texte
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl bg-white px-3 py-2 text-center ring-1 ring-slate-200/80 ${minHeight} ${className}`}
      data-ad-slot={adSlot}
    >
      {imgSrc ? <div className="w-full">{imageWithLink}</div> : null}

      {hasImage ? (
        <>
          {dynamic?.title?.trim() ? (
            <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {dynamic.title}
            </span>
          ) : null}
          {dynamic?.body?.trim() ? (
            <span className="mt-1 text-[11px] text-slate-600">{dynamic.body}</span>
          ) : null}
        </>
      ) : (
        <>
          {dynamic?.title?.trim() ? (
            <span className="mt-1 text-[12px] font-semibold text-slate-700">{dynamic.title}</span>
          ) : null}
          {dynamic?.body?.trim() ? (
            <span className="mt-1 text-[11px] text-slate-600">{dynamic.body}</span>
          ) : null}
        </>
      )}

      {linkOk && !hasImage ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex rounded-xl bg-primary px-3 py-1.5 text-[11px] font-semibold text-white transition hover:brightness-105"
          onClick={onTrackedClick}
        >
          {dynamic?.ctaLabel?.trim() || "En savoir plus"}
        </a>
      ) : null}
      {linkOk && hasImage && dynamic?.ctaLabel?.trim() ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex rounded-xl bg-primary/90 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:brightness-105"
          onClick={onTrackedClick}
        >
          {dynamic.ctaLabel}
        </a>
      ) : null}
    </div>
  );
}
