import { useEffect, useState } from "react";
import { trackAdEvent } from "../../lib/adTracking";

type Props = {
  label: string;
  hint?: string;
  /** Rôle sémantique pour intégration future AdSense (data-ad-slot) */
  adSlot?: string;
  className?: string;
  minHeight?: string;
};

type SlotConfig = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  imageDataUrl: string;
  imageFit: "cover" | "contain";
  imageFrame: "banner" | "photo" | "square";
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

const FRAME_BOX: Record<SlotConfig["imageFrame"], string> = {
  /** Bandeau type header */
  banner: "aspect-[21/9] w-full min-h-[48px] max-h-[120px]",
  /** Photo / carte produit */
  photo: "aspect-[4/3] w-full max-h-[min(280px,50vh)]",
  /** Carré type réseaux sociaux */
  square: "aspect-square w-full max-h-[min(280px,45vh)]"
};

/**
 * Emplacement publicitaire — image cliquable vers le lien, cadre & object-fit configurables côté admin.
 */
export function AdPlaceholder({ label, hint, adSlot, className = "", minHeight = "min-h-[72px]" }: Props) {
  const [dynamic, setDynamic] = useState<SlotConfig | null>(null);

  useEffect(() => {
    if (!adSlot) return;
    trackAdEvent("view", adSlot);
  }, [adSlot]);

  useEffect(() => {
    if (!adSlot) return;
    let cancelled = false;
    void fetch("/api/ads/slots")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const item = (data?.items ?? []).find((x: { slot?: string }) => x.slot === adSlot) as
          | {
              title?: string;
              body?: string;
              ctaLabel?: string;
              ctaUrl?: string;
              imageDataUrl?: string;
              imageFit?: string;
              imageFrame?: string;
            }
          | undefined;
        if (!item) return;
        setDynamic({
          title: String(item.title ?? ""),
          body: String(item.body ?? ""),
          ctaLabel: String(item.ctaLabel ?? ""),
          ctaUrl: String(item.ctaUrl ?? ""),
          imageDataUrl: String(item.imageDataUrl ?? ""),
          imageFit: item.imageFit === "contain" ? "contain" : "cover",
          imageFrame:
            item.imageFrame === "banner" || item.imageFrame === "square"
              ? (item.imageFrame as "banner" | "square")
              : "photo"
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [adSlot]);

  const href = dynamic?.ctaUrl ? normalizeHref(dynamic.ctaUrl) : "";
  const linkOk = Boolean(href) && isValidHttpUrl(href);
  const fit = dynamic?.imageFit ?? "cover";
  const frame = dynamic?.imageFrame ?? "photo";
  const imgFitClass = fit === "contain" ? "object-contain" : "object-cover";

  function onTrackedClick() {
    if (adSlot) trackAdEvent("click", adSlot);
  }

  const imageBlock =
    dynamic?.imageDataUrl ? (
      <div
        className={[
          "relative w-full overflow-hidden rounded-lg bg-slate-200/60 ring-1 ring-slate-200/80",
          FRAME_BOX[frame]
        ].join(" ")}
      >
        <img
          src={dynamic.imageDataUrl}
          alt={dynamic.title || label || "Publicité"}
          className={`h-full w-full ${imgFitClass} object-center`}
          loading="lazy"
          decoding="async"
        />
      </div>
    ) : null;

  const imageWithLink =
    dynamic?.imageDataUrl && linkOk ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        onClick={onTrackedClick}
      >
        {imageBlock}
      </a>
    ) : (
      imageBlock
    );

  const hasImage = Boolean(dynamic?.imageDataUrl?.trim());

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 bg-gradient-to-br from-slate-50 to-slate-100/90 px-3 py-2 text-center ${minHeight} ${className}`}
      data-ad-slot={adSlot}
    >
      {dynamic?.imageDataUrl ? (
        <div className="w-full">{imageWithLink}</div>
      ) : null}

      <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {dynamic?.title || label}
      </span>
      {dynamic?.body ? <span className="mt-1 text-[11px] text-slate-500">{dynamic.body}</span> : null}
      {!dynamic?.body && !dynamic?.imageDataUrl && hint ? (
        <span className="mt-1 text-[11px] text-slate-500">{hint}</span>
      ) : null}

      {linkOk && !hasImage ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-white"
          onClick={onTrackedClick}
        >
          {dynamic?.ctaLabel?.trim() || "Voir"}
        </a>
      ) : null}
      {linkOk && hasImage && dynamic?.ctaLabel?.trim() ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex rounded-md bg-primary/90 px-2 py-1 text-[10px] font-semibold text-white"
          onClick={onTrackedClick}
        >
          {dynamic.ctaLabel}
        </a>
      ) : null}
    </div>
  );
}
