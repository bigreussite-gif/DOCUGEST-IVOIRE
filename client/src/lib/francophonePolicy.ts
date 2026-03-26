export type FrancophoneCountry = {
  code: string;
  label: string;
  flag: string;
  dial: string;
  vatRatePct: number;
  defaultFiscalRegime: "formal" | "informal";
  defaultLegalForm: string;
  accountingRef: string;
};

export const FRANCOPHONE_AFRICA_COUNTRIES: FrancophoneCountry[] = [
  { code: "CI", label: "Cote d'Ivoire", flag: "🇨🇮", dial: "+225", vatRatePct: 18, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI CI" },
  { code: "SN", label: "Senegal", flag: "🇸🇳", dial: "+221", vatRatePct: 18, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI SN" },
  { code: "ML", label: "Mali", flag: "🇲🇱", dial: "+223", vatRatePct: 18, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI ML" },
  { code: "BF", label: "Burkina Faso", flag: "🇧🇫", dial: "+226", vatRatePct: 18, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI BF" },
  { code: "NE", label: "Niger", flag: "🇳🇪", dial: "+227", vatRatePct: 19, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI NE" },
  { code: "BJ", label: "Benin", flag: "🇧🇯", dial: "+229", vatRatePct: 18, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI BJ" },
  { code: "TG", label: "Togo", flag: "🇹🇬", dial: "+228", vatRatePct: 18, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI TG" },
  { code: "GN", label: "Guinee", flag: "🇬🇳", dial: "+224", vatRatePct: 18, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI GN" },
  { code: "CM", label: "Cameroun", flag: "🇨🇲", dial: "+237", vatRatePct: 19.25, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI CM" },
  { code: "TD", label: "Tchad", flag: "🇹🇩", dial: "+235", vatRatePct: 18, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI TD" },
  { code: "GA", label: "Gabon", flag: "🇬🇦", dial: "+241", vatRatePct: 18, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI GA" },
  { code: "CG", label: "Congo-Brazzaville", flag: "🇨🇬", dial: "+242", vatRatePct: 18, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI CG" },
  { code: "CD", label: "RD Congo", flag: "🇨🇩", dial: "+243", vatRatePct: 16, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI RDC" },
  { code: "CF", label: "Republique Centrafricaine", flag: "🇨🇫", dial: "+236", vatRatePct: 19, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI RCA" },
  { code: "KM", label: "Comores", flag: "🇰🇲", dial: "+269", vatRatePct: 10, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "OHADA / CGI KM" },
  { code: "DJ", label: "Djibouti", flag: "🇩🇯", dial: "+253", vatRatePct: 10, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "CGI DJ" },
  { code: "MG", label: "Madagascar", flag: "🇲🇬", dial: "+261", vatRatePct: 20, defaultFiscalRegime: "formal", defaultLegalForm: "SARL", accountingRef: "CGI MG" }
];

function normalize(v: string): string {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function findCountryByCode(code: string): FrancophoneCountry | undefined {
  return FRANCOPHONE_AFRICA_COUNTRIES.find((c) => c.code === code);
}

export function inferCountryPolicy(countryLike: string | null | undefined): FrancophoneCountry {
  const fallback = FRANCOPHONE_AFRICA_COUNTRIES[0];
  if (!countryLike) return fallback;
  const n = normalize(countryLike);
  return (
    FRANCOPHONE_AFRICA_COUNTRIES.find((c) => normalize(c.label) === n || normalize(c.code) === n) ??
    FRANCOPHONE_AFRICA_COUNTRIES.find((c) => n.includes(normalize(c.label)) || normalize(c.label).includes(n)) ??
    fallback
  );
}

type LegalHints = {
  legalForm?: string | null;
  hasRccm?: boolean;
  hasNcc?: boolean;
  hasRib?: boolean;
};

type DocKind = "invoice" | "proforma" | "devis" | "payslip";

export function buildAdministrativeClause(country: FrancophoneCountry, docKind: DocKind, hints?: LegalHints): string {
  const legalForm = hints?.legalForm?.trim() || country.defaultLegalForm;
  const idParts = [
    hints?.hasRccm ? "RCCM" : "",
    hints?.hasNcc ? "NCC/IFU" : "",
    hints?.hasRib ? "RIB" : ""
  ].filter(Boolean);
  const ids = idParts.length ? ` Identifiants fournis: ${idParts.join(", ")}.` : "";
  const base = `Cadre administratif de reference: ${country.accountingRef}. Forme juridique suggeree: ${legalForm}.${ids}`;

  if (docKind === "invoice") return `${base} Facture emise selon les obligations commerciales locales applicables.`;
  if (docKind === "proforma") return `${base} Proforma a valeur informative avant emission de facture finale.`;
  if (docKind === "devis") return `${base} Devis avec validite contractuelle soumise a acceptation client.`;
  return `${base} Bulletin de paie prepare selon les usages sociaux et administratifs locaux.`;
}

export function buildFiscalPaymentTerms(country: FrancophoneCountry, vatRatePct: number): string {
  const vat = Number.isFinite(vatRatePct) ? vatRatePct : country.vatRatePct;
  return `Paiement a 30 jours. Regime fiscal ${country.defaultFiscalRegime === "formal" ? "formel" : "informel"}; TVA indicative ${vat}%.`;
}
