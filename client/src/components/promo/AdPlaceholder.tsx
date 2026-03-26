import { useEffect } from "react";
import { trackAdEvent } from "../../lib/adTracking";
import { useState } from "react";

type Props = {
  label: string;
  hint?: string;
  /** Rôle sémantique pour intégration future AdSense (data-ad-slot) */
  adSlot?: string;
  className?: string;
  minHeight?: string;
};

/**
 * Emplacement publicitaire — bordure discrète, prêt pour script AdSense (remplacer le contenu par ins.adsbygoogle).
 */
export function AdPlaceholder({ label, hint, adSlot, className = "", minHeight = "min-h-[72px]" }: Props) {
  const [dynamic, setDynamic] = useState<{ title: string; body: string; ctaLabel: string; ctaUrl: string } | null>(null);

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
          | { title?: string; body?: string; ctaLabel?: string; ctaUrl?: string }
          | undefined;
        if (!item) return;
        setDynamic({
          title: String(item.title ?? ""),
          body: String(item.body ?? ""),
          ctaLabel: String(item.ctaLabel ?? ""),
          ctaUrl: String(item.ctaUrl ?? "")
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [adSlot]);

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 bg-gradient-to-br from-slate-50 to-slate-100/90 px-3 py-2 text-center ${minHeight} ${className}`}
      data-ad-slot={adSlot}
      onClick={() => {
        if (!adSlot) return;
        trackAdEvent("click", adSlot);
      }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{dynamic?.title || label}</span>
      {dynamic?.body ? <span className="mt-1 text-[11px] text-slate-500">{dynamic.body}</span> : null}
      {!dynamic?.body && hint ? <span className="mt-1 text-[11px] text-slate-500">{hint}</span> : null}
      {dynamic?.ctaLabel && dynamic?.ctaUrl ? (
        <a
          href={dynamic.ctaUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-white"
        >
          {dynamic.ctaLabel}
        </a>
      ) : null}
    </div>
  );
}
