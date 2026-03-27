/** Régimes TVA / assujettissement usuels (Côte d’Ivoire) — distincts du calcul des lignes HT/TVA. */
export const CI_VAT_REGIME_VALUES = [
  "activite_informelle",
  "franchise_en_base",
  "reel_simplifie",
  "reel_normal"
] as const;

export type CiVatRegime = (typeof CI_VAT_REGIME_VALUES)[number];

export const CI_VAT_REGIME_LABELS: Record<CiVatRegime, string> = {
  activite_informelle: "Activité non assujettie / informel (pas de TVA sur la facture)",
  franchise_en_base: "Franchise en base (non assujetti à la TVA sous le seuil)",
  reel_simplifie: "Réel simplifié (TVA — déclaration allégée)",
  reel_normal: "Réel normal (TVA — déclaration détaillée)"
};

/** Infère formal/informel pour les totaux document. */
export function ciVatRegimeToFiscalRegime(r: CiVatRegime): "informal" | "formal" {
  if (r === "activite_informelle" || r === "franchise_en_base") return "informal";
  return "formal";
}

export function fiscalRegimeToCiVat(fr: "informal" | "formal"): CiVatRegime {
  return fr === "formal" ? "reel_normal" : "activite_informelle";
}
