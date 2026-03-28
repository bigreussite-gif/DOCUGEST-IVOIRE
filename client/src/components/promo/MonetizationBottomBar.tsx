"use client";
import { useAdSlotsStore } from "../../store/adSlotsStore";
import { AdPlaceholder } from "./AdPlaceholder";

/** Barre bas de page — masquée si aucune pub n'est configurée. */
export function MonetizationBottomBar() {
  const bySlot = useAdSlotsStore((s) => s.bySlot);
  const isFetching = useAdSlotsStore((s) => s.isFetching);

  const hasLeft = Boolean(bySlot["bottom-bar-partners"]);
  const hasRight = Boolean(bySlot["bottom-bar-adsense"]);

  if (!isFetching && !hasLeft && !hasRight) return null;

  return (
    <div className="border-t border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-2 px-3 py-1.5 sm:grid-cols-2 sm:items-stretch">
        <div className="flex min-h-[44px] items-center">
          <AdPlaceholder
            label="Partenaires"
            hint="Logos & sponsors"
            adSlot="bottom-bar-partners"
            minHeight="min-h-[44px]"
            className="w-full"
          />
        </div>
        <div className="flex min-h-[44px] items-center">
          <AdPlaceholder
            label="Google AdSense"
            hint="Bannière responsive"
            adSlot="bottom-bar-adsense"
            minHeight="min-h-[44px]"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
