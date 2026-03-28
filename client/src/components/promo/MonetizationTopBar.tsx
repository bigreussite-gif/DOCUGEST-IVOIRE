import { AdPlaceholder } from "./AdPlaceholder";

/** Fine barre au-dessus du header : partenaires (gauche) + zone type AdSense (droite). */
export function MonetizationTopBar() {
  return (
    <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 px-3 py-2 sm:items-stretch">
        <div className="flex min-h-[44px] items-center">
          <AdPlaceholder
            label="Partenaires & sponsors"
            hint="Espace réservé — logos partenaires"
            adSlot="top-bar-partners"
            minHeight="min-h-[44px]"
            className="w-full border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-white"
          />
        </div>
        <div className="flex min-h-[44px] items-center">
          <AdPlaceholder
            label="Publicité"
            hint="Emplacement compatible Google AdSense (728×90 ou responsive)"
            adSlot="top-banner"
            minHeight="min-h-[44px]"
            className="w-full border-emerald-200/50 bg-gradient-to-br from-emerald-50/40 to-white"
          />
        </div>
      </div>
    </div>
  );
}
