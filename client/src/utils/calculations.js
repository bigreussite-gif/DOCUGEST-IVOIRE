/**
 * Fonctions pures pour calculs financiers.
 * Elles ne doivent pas dépendre de l'état React ni d'effets.
 */

export function computeInvoiceLineTotalHT(line) {
  const qty = Number(line.quantity ?? 0);
  const unitPrice = Number(line.unitPriceHT ?? 0);
  const discountPct = Number(line.discountPct ?? 0);
  const base = qty * unitPrice;
  const discount = base * (discountPct / 100);
  return Math.max(0, base - discount);
}

export function computeInvoiceTotals({
  lines,
  fiscalRegime,
  globalDiscountPct = 0,
  vatRatePct = 18
}) {
  const subtotalHT = (lines ?? []).reduce((acc, l) => acc + computeInvoiceLineTotalHT(l), 0);
  const remiseGlobale = subtotalHT * (Number(globalDiscountPct) / 100);
  const baseTaxableHT = Math.max(0, subtotalHT - remiseGlobale);

  if (fiscalRegime === "informal") {
    return {
      subtotalHT,
      baseTaxableHT,
      vatAmount: 0,
      totalTTC: baseTaxableHT,
      totalHT: baseTaxableHT
    };
  }

  const vatAmount = baseTaxableHT * (Number(vatRatePct) / 100);
  const totalTTC = baseTaxableHT + vatAmount;

  return {
    subtotalHT,
    baseTaxableHT,
    vatAmount,
    totalTTC,
    totalHT: baseTaxableHT
  };
}

