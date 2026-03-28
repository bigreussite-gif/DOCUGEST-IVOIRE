"use client";
import { useAdSlotsStore } from "../../store/adSlotsStore";
import { AdPlaceholder } from "./AdPlaceholder";

/** Barre fine en haut de page — masquée si aucune pub n'est configurée. */
export function MonetizationTopBar() {
  const bySlot = useAdSlotsStore((s) => s.bySlot);
  const isFetching = useAdSlotsStore((s) => s.isFetching);

  const hasLeft = Boolean(bySlot["top-bar-partners"]);
  const hasRight = Boolean(bySlot["top-banner"]);

  // Si le chargement est terminé et qu'aucun slot n'est configuré, on ne rend rien
  if (!isFetching && !hasLeft && !hasRight) return null;

  return (
    <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 px-3 py-1.5 sm:items-stretch">
        <div className="flex min-h-[44px] items-center">
          <AdPlaceholder
            label="Partenaires & sponsors"
            hint="Espace réservé — logos partenaires"
            adSlot="top-bar-partners"
            minHeight="min-h-[44px]"
            className="w-full"
          />
        </div>
        <div className="flex min-h-[44px] items-center">
          <AdPlaceholder
            label="Publicité"
            hint="Emplacement compatible Google AdSense (728×90 ou responsive)"
            adSlot="top-banner"
            minHeight="min-h-[44px]"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
