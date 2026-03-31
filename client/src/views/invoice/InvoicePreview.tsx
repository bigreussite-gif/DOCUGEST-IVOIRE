import { formatDateCI, formatFCFA, amountToWordsFCFA } from "../../utils/formatters";
import { computeInvoiceTotals } from "../../utils/calculations";
import { fiscalMentionSegments } from "../../utils/fiscalMentions";

type Line = {
  description: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPct: number;
};

export type InvoicePreviewProps = {
  docTypeLabel: string;
  themeColor: "emerald" | "navy" | "orange" | "bordeaux" | "anthracite" | "violet";
  customAccentHex?: string | null;
  data: {
    sender: {
      companyName: string;
      address: string;
      phone: string;
      email: string;
      headOffice?: string;
      rib?: string;
      legalForm?: string;
      ncc?: string;
      rccm?: string;
      dfe?: string;
      logoDataUrl?: string | null;
      website?: string;
      whatsapp?: string;
    };
    client: {
      name: string;
      address: string;
      phone: string;
      email: string;
      ncc?: string;
    };
    docNumber: string;
    emissionDate: string;
    dueDateText: string;
    fiscalRegime: "informal" | "formal";
    lines: Line[];
    globalDiscountPct: number;
    vatRatePct: number;
    conditions: string;
    footerNote: string;
  };
};

const NAVY = "#1a2b48";
const TEAL_DEFAULT = "#3d9c86";

function themeBar(themeColor: InvoicePreviewProps["themeColor"]) {
  const map: Record<InvoicePreviewProps["themeColor"], string> = {
    emerald: TEAL_DEFAULT,
    navy: NAVY,
    orange: "#c2410c",
    bordeaux: "#7F1D1D",
    anthracite: "#111827",
    violet: "#5b21b6"
  };
  return map[themeColor];
}

export default function InvoicePreview({ docTypeLabel, themeColor, customAccentHex, data }: InvoicePreviewProps) {
  const totals = computeInvoiceTotals({
    lines: data.lines,
    fiscalRegime: data.fiscalRegime,
    globalDiscountPct: data.globalDiscountPct,
    vatRatePct: data.vatRatePct
  });
  const fiscalFooter = fiscalMentionSegments(data.sender.rccm, data.sender.dfe, data.sender.ncc);

  const accentTeal = customAccentHex && customAccentHex.trim() !== "" ? customAccentHex : themeBar(themeColor);
  const navyTitle = NAVY;

  return (
    <div className="bg-slate-100/80 p-2 print:bg-white print:p-0">
      <div
        className="mx-auto flex min-h-[297mm] w-[210mm] flex-col bg-white p-8 text-[10px] leading-snug text-slate-800 shadow-sm ring-1 ring-slate-200/80 print:shadow-none print:ring-0"
        style={{ fontFamily: "ui-sans-serif, system-ui, 'Segoe UI', Roboto, sans-serif" }}
      >
        {/* Header — titre type référence + marque */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight" style={{ color: navyTitle }}>
              {docTypeLabel}
            </h1>
            <p className="mt-2 text-[11px] text-slate-500">
              N° <span className="font-semibold text-slate-800">{data.docNumber}</span>
              <span className="mx-2 text-slate-300">|</span>
              {formatDateCI(data.emissionDate)}
              <span className="mx-2 text-slate-300">|</span>
              {data.dueDateText}
            </p>
          </div>
          <div className="flex max-w-[55%] items-start gap-3 text-right sm:max-w-none">
            {data.sender.logoDataUrl ? (
              <img src={data.sender.logoDataUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-contain ring-1 ring-slate-100" />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br from-teal-50 to-slate-100 ring-1 ring-slate-200" />
            )}
            <div className="min-w-0 text-right">
              <div className="text-[12px] font-bold leading-tight" style={{ color: navyTitle }}>
                {data.sender.companyName || "Votre entreprise"}
              </div>
              <div className="mt-1 text-[9.5px] text-slate-600">{data.sender.address}</div>
              <div className="mt-0.5 text-[9.5px] text-slate-600">{data.sender.phone}</div>
              <div className="text-[9.5px] text-slate-600">{data.sender.email}</div>
            </div>
          </div>
        </header>

        {/* Bill to — grille lisible */}
        <section className="mt-6">
          <h2 className="text-[11px] font-bold uppercase tracking-wide" style={{ color: navyTitle }}>
            Facturer à
          </h2>
          <div className="mt-2 h-px w-full bg-slate-200" />
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Client</div>
              <div className="mt-0.5 font-semibold text-slate-900">{data.client.name || "—"}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Coordonnées</div>
              <div className="mt-0.5 text-slate-700">{data.client.phone || "—"}</div>
            </div>
            <div className="sm:col-span-1">
              <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Adresse</div>
              <div className="mt-0.5 text-slate-700">{data.client.address || "—"}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Email</div>
              <div className="mt-0.5 text-slate-700">{data.client.email || "—"}</div>
            </div>
          </div>
        </section>

        {/* Tableau lignes — en-tête marine */}
        <div className="mt-6 overflow-hidden rounded-t-lg border border-slate-200">
          <table className="w-full border-collapse text-[9.5px]">
            <thead>
              <tr style={{ backgroundColor: navyTitle }} className="text-white">
                <th className="px-2 py-2.5 text-left font-semibold">#</th>
                <th className="px-2 py-2.5 text-left font-semibold">Description</th>
                <th className="w-10 px-1 py-2.5 text-center font-semibold">Qté</th>
                <th className="w-12 px-1 py-2.5 text-center font-semibold">Unité</th>
                <th className="w-[4.5rem] px-1 py-2.5 text-right font-semibold">PU HT</th>
                <th className="w-10 px-1 py-2.5 text-right font-semibold">Rem.</th>
                <th className="w-[4.75rem] px-2 py-2.5 text-right font-semibold">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map((l, idx) => {
                const lineTotal = computeInvoiceTotals({
                  lines: [l],
                  fiscalRegime: "informal",
                  globalDiscountPct: 0,
                  vatRatePct: 0
                }).totalHT;
                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/90"}>
                    <td className="border-b border-slate-100 px-2 py-2 text-slate-600">{idx + 1}</td>
                    <td className="border-b border-slate-100 px-2 py-2 font-medium text-slate-900">{l.description}</td>
                    <td className="border-b border-slate-100 px-1 py-2 text-center">{l.quantity}</td>
                    <td className="border-b border-slate-100 px-1 py-2 text-center text-slate-600">{l.unit}</td>
                    <td className="border-b border-slate-100 px-1 py-2 text-right tabular-nums">
                      {formatFCFA(l.unitPriceHT).replace(" FCFA", "")}
                    </td>
                    <td className="border-b border-slate-100 px-1 py-2 text-right text-slate-600">{Number(l.discountPct) || 0}%</td>
                    <td className="border-b border-slate-100 px-2 py-2 text-right font-medium tabular-nums text-slate-900">
                      {formatFCFA(lineTotal).replace(" FCFA", "")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Notes + totaux */}
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-h-[4rem] flex-1 rounded-md border border-dashed border-slate-200 bg-slate-50/50 p-3">
            <div className="text-[9px] font-bold uppercase text-slate-500">Conditions de règlement</div>
            <p className="mt-1 whitespace-pre-wrap text-[9.5px] leading-relaxed text-slate-700">{data.conditions}</p>
          </div>
          <div className="w-full shrink-0 lg:w-[44%]">
            <table className="w-full border-collapse overflow-hidden rounded-md text-[9.5px] ring-1 ring-slate-200">
              <tbody>
                <tr className="text-white" style={{ backgroundColor: accentTeal }}>
                  <td className="px-3 py-2 font-semibold">Sous-total HT</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatFCFA(totals.subtotalHT)}</td>
                </tr>
                {data.fiscalRegime === "formal" ? (
                  <>
                    <tr className="text-white" style={{ backgroundColor: accentTeal }}>
                      <td className="px-3 py-2">Remise ({data.globalDiscountPct || 0}%)</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatFCFA(Math.max(0, totals.subtotalHT - totals.baseTaxableHT))}
                      </td>
                    </tr>
                    <tr className="text-white" style={{ backgroundColor: accentTeal }}>
                      <td className="px-3 py-2">TVA ({data.vatRatePct}%)</td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums">{formatFCFA(totals.vatAmount)}</td>
                    </tr>
                  </>
                ) : null}
                <tr className="text-white" style={{ backgroundColor: navyTitle }}>
                  <td className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide">Total TTC</td>
                  <td className="px-3 py-2.5 text-right text-[12px] font-bold tabular-nums">{formatFCFA(totals.totalTTC)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-[8.5px] leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-700">Arrêté à la somme de :</span> {amountToWordsFCFA(totals.totalTTC)}
            </p>
          </div>
        </div>

        {/* Pied — conditions & signatures */}
        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Conditions & mentions</div>
          <p className="mt-2 whitespace-pre-wrap text-[8.5px] leading-relaxed text-slate-600">{data.footerNote}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {["Signature", "Nom", "Date", "Mode de règlement"].map((lab) => (
            <div key={lab} className="text-center">
              <div className="h-8 border-b border-slate-300" />
              <div className="mt-1 text-[8px] font-medium uppercase tracking-wide text-slate-500">{lab}</div>
            </div>
          ))}
        </div>

        <footer className="mt-auto border-t border-slate-100 pt-4 text-center text-[8px] leading-relaxed text-slate-500">
          <div className="font-medium text-slate-600">
            {[data.sender.phone, data.sender.whatsapp, data.sender.email, data.sender.website].filter(Boolean).join(" · ")}
          </div>
          <div className="mt-1">
            {[data.sender.headOffice || data.sender.address, data.sender.legalForm, data.sender.rib].filter(Boolean).join(" · ")}
          </div>
          {fiscalFooter.length > 0 ? <div className="mt-1">{fiscalFooter.join(" · ")}</div> : null}
          <div className="mt-2 text-slate-400">Document généré avec DocuGestIvoire</div>
        </footer>
      </div>
    </div>
  );
}
