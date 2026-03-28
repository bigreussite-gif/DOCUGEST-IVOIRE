import { AdPlaceholder } from "./AdPlaceholder";

type InlineAdStripProps = {
  variant?: "default" | "compact";
  /** Identifiant côté admin (`/admin` → Annonces) ; défaut : `dashboard-inline`. */
  adSlot?: string;
  hint?: string;
};

/** Bandeau discret dans l’app (dashboard / éditeur) — uniquement l’emplacement pub, sans texte de modèle économique. */
export function InlineAdStrip({
  variant = "default",
  adSlot = "dashboard-inline",
  hint = "Emplacement non intrusif"
}: InlineAdStripProps) {
  const h = variant === "compact" ? "min-h-[56px]" : "min-h-[72px]";
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 ring-1 ring-slate-200/40">
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
