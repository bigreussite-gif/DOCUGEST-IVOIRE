import { AdPlaceholder } from "./AdPlaceholder";

/** Fine barre en bas de page : partenaires (gauche) + AdSense (droite). */
export function MonetizationBottomBar() {
  return (
    <div className="border-t border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-2 px-3 py-2 sm:grid-cols-2 sm:items-stretch">
        <div className="flex min-h-[48px] items-center">
          <AdPlaceholder
            label="Partenaires"
            hint="Logos & sponsors"
            adSlot="bottom-bar-partners"
            minHeight="min-h-[48px]"
            className="w-full border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-white"
          />
        </div>
        <div className="flex min-h-[48px] items-center">
          <AdPlaceholder
            label="Google AdSense"
            hint="Bannière responsive"
            adSlot="bottom-bar-adsense"
            minHeight="min-h-[48px]"
            className="w-full border-emerald-200/50 bg-gradient-to-br from-emerald-50/40 to-white"
          />
        </div>
      </div>
    </div>
  );
}
