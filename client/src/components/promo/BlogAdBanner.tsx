"use client";
import { useEffect } from "react";
import { useAdSlotsStore } from "../../store/adSlotsStore";
import { AdPlaceholder } from "./AdPlaceholder";

type Props = {
  adSlot: string;
  label?: string;
  className?: string;
  minHeight?: string;
};

/**
 * Bandeau publicitaire pour les pages blog (Next.js App Router).
 * S'auto-initialise en chargeant les slots depuis l'API.
 */
export function BlogAdBanner({ adSlot, label = "Publicité", className = "", minHeight = "min-h-[80px]" }: Props) {
  const refresh = useAdSlotsStore((s) => s.refresh);
  const raw = useAdSlotsStore((s) => s.bySlot[adSlot]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!raw?.title && !raw?.body && !raw?.imageUrl && !raw?.imageDataUrl && !raw?.htmlEmbed) return null;

  return (
    <div className={`w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm ${className}`}>
      <AdPlaceholder
        label={label}
        adSlot={adSlot}
        minHeight={minHeight}
        className="w-full border-0 bg-transparent"
      />
    </div>
  );
}
