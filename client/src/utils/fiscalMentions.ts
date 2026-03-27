/**
 * Mentions RCCM / DFE / NCC sur les PDF.
 * Si le NCC/IFU est renseigné, la DFE n’est pas affichée (évite la redondance une fois l’identification fiscale obtenue).
 * Sinon, la DFE peut apparaître seule.
 */
export function fiscalMentionSegments(rccm?: string | null, dfe?: string | null, ncc?: string | null): string[] {
  const out: string[] = [];
  const r = typeof rccm === "string" ? rccm.trim() : "";
  const d = typeof dfe === "string" ? dfe.trim() : "";
  const n = typeof ncc === "string" ? ncc.trim() : "";

  if (r) out.push(`RCCM: ${r}`);
  if (n) {
    out.push(`NCC/IFU: ${n}`);
  } else if (d) {
    out.push(`DFE: ${d}`);
  }
  return out;
}
