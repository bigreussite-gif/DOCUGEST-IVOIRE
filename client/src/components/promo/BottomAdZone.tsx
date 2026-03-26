import { AdPlaceholder } from "./AdPlaceholder";

/** Grande zone bas de page : partenaires + AdSense (plus visible que la top bar). */
export function BottomAdZone() {
  return (
    <section className="border-t border-slate-200 bg-slate-50/80 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
          Soutiens & partenaires
        </p>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <AdPlaceholder
            label="Partenaires & annonceurs"
            hint="Bloc large — bandeaux, campagnes locales, marques"
            adSlot="bottom-bar-partners"
            minHeight="min-h-[140px]"
            className="border-slate-300/70 bg-white shadow-sm"
          />
          <AdPlaceholder
            label="Google AdSense"
            hint="Bloc large — format 300×250 / responsive"
            adSlot="bottom-bar-adsense"
            minHeight="min-h-[140px]"
            className="border-emerald-200/60 bg-white shadow-sm"
          />
        </div>
      </div>
    </section>
  );
}
