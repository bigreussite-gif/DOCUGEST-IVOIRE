"use client";
import { useAdSlotsStore } from "../../store/adSlotsStore";
import { AdPlaceholder } from "./AdPlaceholder";

type InlineAdStripProps = {
  variant?: "default" | "compact";
  adSlot?: string;
  hint?: string;
};

/** Bandeau discret dans l'app — invisible si aucune pub n'est configurée pour ce slot. */
export function InlineAdStrip({
  variant = "default",
  adSlot = "dashboard-inline",
  hint = "Emplacement non intrusif"
}: InlineAdStripProps) {
  const raw = useAdSlotsStore((s) => (adSlot ? s.bySlot[adSlot] : undefined));
  const isFetching = useAdSlotsStore((s) => s.isFetching);
  const h = variant === "compact" ? "min-h-[56px]" : "min-h-[72px]";

  const hasContent = Boolean(
    raw?.imageDataUrl?.trim() || raw?.title?.trim() || raw?.body?.trim()
  );

  // Invisible si pas de pub + chargement terminé
  if (!hasContent && !isFetching) return null;

  // Squelette de chargement
  if (!hasContent && isFetching) {
    return (
      <div className={`animate-pulse rounded-xl bg-slate-100/70 ${h}`} aria-hidden />
    );
  }

  return (
    <div className="rounded-xl bg-white ring-1 ring-slate-200/60 overflow-hidden">
      <AdPlaceholder
        label="Sponsorisé"
        hint={hint}
        adSlot={adSlot}
        minHeight={h}
        className="w-full border-0 bg-transparent"
      />
    </div>
  );
}
