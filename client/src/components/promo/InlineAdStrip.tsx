import { AdPlaceholder } from "./AdPlaceholder";

/** Bandeau discret dans l’app (dashboard / éditeur). */
export function InlineAdStrip({ variant = "default" }: { variant?: "default" | "compact" }) {
  const h = variant === "compact" ? "min-h-[56px]" : "min-h-[72px]";
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2">
      <AdPlaceholder
        label="Sponsorisé"
        hint="Emplacement non intrusif"
        adSlot="dashboard-inline"
        minHeight={h}
        className="w-full border-0 bg-transparent"
      />
    </div>
  );
}
