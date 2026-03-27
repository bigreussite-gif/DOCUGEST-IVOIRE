import { AdPlaceholder } from "./AdPlaceholder";

type InlineAdStripProps = {
  variant?: "default" | "compact";
  /** Identifiant côté admin (`/admin` → Annonces) ; défaut : `dashboard-inline`. */
  adSlot?: string;
  hint?: string;
  /** Titre au-dessus de l’encart (modèle économique, légitimité). */
  heading?: string;
  subheading?: string;
};

/** Bandeau discret dans l’app (dashboard / éditeur). */
export function InlineAdStrip({
  variant = "default",
  adSlot = "dashboard-inline",
  hint = "Emplacement non intrusif",
  heading,
  subheading
}: InlineAdStripProps) {
  const h = variant === "compact" ? "min-h-[56px]" : "min-h-[72px]";
  return (
    <div className="flex flex-col gap-2">
      {heading || subheading ? (
        <div className="rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/40 px-3 py-2 ring-1 ring-amber-100/60">
          {heading ? (
            <p className="text-xs font-semibold tracking-wide text-amber-950">{heading}</p>
          ) : null}
          {subheading ? <p className="mt-0.5 text-[11px] leading-snug text-amber-900/85">{subheading}</p> : null}
        </div>
      ) : null}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 ring-1 ring-slate-200/40">
        <AdPlaceholder
          label="Sponsorisé"
          hint={hint}
          adSlot={adSlot}
          minHeight={h}
          className="w-full border-0 bg-transparent"
        />
      </div>
    </div>
  );
}
