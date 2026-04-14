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
  layoutTheme?: "premium" | "classic" | "minimal";
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

function PreviewPremium({ accentColor, NAVY, docTypeLabel, data, fiscalFooter, totals }: any) {
  return (
    <div
      className="mx-auto flex min-h-[285mm] w-[210mm] flex-col bg-white text-[10px] leading-snug text-slate-800 shadow-xl print:shadow-none relative"
      style={{
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact"
      }}
    >
      <div className="h-3 w-full" style={{ backgroundColor: accentColor }} />
      <header className="px-10 py-8 flex flex-row items-center justify-between">
        <div className="flex-1">
          {data.sender.logoDataUrl ? (
            <img src={data.sender.logoDataUrl} alt="Logo" className="max-h-20 max-w-[200px] object-contain" />
          ) : (
            <h2 className="text-xl font-black tracking-tight" style={{ color: accentColor }}>
              {data.sender.companyName || "VOTRE ENTREPRISE"}
            </h2>
          )}
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase" style={{ color: NAVY }}>
            {docTypeLabel}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">N° {data.docNumber}</p>
        </div>
      </header>
      <section className="px-10 flex flex-row justify-between mb-8">
        <div className="w-1/2 pr-6 border-l-2 border-slate-100 pl-4 py-1">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Émetteur</h3>
          <div className="font-bold text-slate-800 text-[12px] mb-1">{data.sender.companyName || "—"}</div>
          {data.sender.address && <div className="text-slate-600">{data.sender.address}</div>}
          {data.sender.phone && <div className="text-slate-600">Tél : {data.sender.phone}</div>}
          {data.sender.email && <div className="text-slate-600">Email : {data.sender.email}</div>}
        </div>
        <div className="w-1/2 pl-6 border-l-2 py-1" style={{ borderLeftColor: accentColor }}>
          <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Facturer à</h3>
          <div className="font-bold text-slate-800 text-[12px] mb-1">{data.client.name || "—"}</div>
          {data.client.address && <div className="text-slate-600">{data.client.address}</div>}
          {data.client.phone && <div className="text-slate-600">Tél : {data.client.phone}</div>}
          {data.client.email && <div className="text-slate-600">Email : {data.client.email}</div>}
          {data.client.ncc && <div className="text-slate-600 mt-1 font-medium">NCC : {data.client.ncc}</div>}
        </div>
      </section>
      <div className="px-10 mb-8">
        <div className="flex bg-slate-50 rounded-lg p-4 divide-x divide-slate-200 ring-1 ring-slate-100">
          <div className="px-6 first:pl-0 flex-1">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Date d'émission</span>
            <span className="block mt-1 text-sm font-semibold text-slate-800">{formatDateCI(data.emissionDate)}</span>
          </div>
          <div className="px-6 flex-1">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Date d'échéance</span>
            <span className="block mt-1 text-sm font-semibold text-slate-800">{data.dueDateText || "À réception"}</span>
          </div>
          {data.sender.rib && (
            <div className="px-6 last:pr-0 flex-[2]">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Paiement / RIB</span>
              <span className="block mt-1 text-xs font-mono font-medium text-slate-800">{data.sender.rib}</span>
            </div>
          )}
        </div>
      </div>
      <div className="px-10 mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2" style={{ borderBottomColor: accentColor }}>
              <th className="py-3 px-2 font-bold text-slate-700 w-10">#</th>
              <th className="py-3 px-2 font-bold text-slate-700">Désignation</th>
              <th className="py-3 px-2 font-bold text-slate-700 text-center w-16">Qté</th>
              <th className="py-3 px-2 font-bold text-slate-700 text-right w-24">Prix Unit.</th>
              <th className="py-3 px-2 font-bold text-slate-700 text-center w-16">Rem.</th>
              <th className="py-3 px-2 font-bold text-slate-700 text-right w-28">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic">Aucune ligne facturée</td>
              </tr>
            ) : (
              data.lines.map((l: Line, idx: number) => {
                const lineTotal = computeInvoiceTotals({
                  lines: [l],
                  fiscalRegime: "informal",
                  globalDiscountPct: 0,
                  vatRatePct: 0
                }).totalHT;
                return (
                  <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-2 font-semibold text-slate-800">{l.description}</td>
                    <td className="py-3 px-2 text-center text-slate-600">
                      {l.quantity} <span className="text-[8px] text-slate-400 block">{l.unit}</span>
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-slate-600">
                      {formatFCFA(l.unitPriceHT).replace(" FCFA", "")}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-600">
                      {Number(l.discountPct) > 0 ? `${Number(l.discountPct)}%` : "—"}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums font-semibold text-slate-900">
                      {formatFCFA(lineTotal).replace(" FCFA", "")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="px-10 flex flex-col sm:flex-row gap-8 mb-8">
        <div className="flex-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Conditions de règlement</h4>
          <p className="text-[10px] leading-relaxed text-slate-600 whitespace-pre-wrap bg-slate-50/50 p-3 rounded border border-slate-100">
            {data.conditions || "Aucune condition particulière."}
          </p>
        </div>
        <div className="w-full sm:w-[50%] lg:w-[40%] bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center py-2 text-slate-600 font-medium text-xs">
            <span>Sous-total HT</span>
            <span className="tabular-nums">{formatFCFA(totals.subtotalHT)}</span>
          </div>
          {data.fiscalRegime === "formal" && (
            <>
              <div className="flex justify-between items-center py-2 text-slate-600 font-medium text-xs border-t border-slate-100">
                <span>Remise Globale ({data.globalDiscountPct || 0}%)</span>
                <span className="tabular-nums text-red-600">
                  -{formatFCFA(Math.max(0, totals.subtotalHT - totals.baseTaxableHT))}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 text-slate-600 font-medium text-xs border-t border-slate-100">
                <span>TVA ({data.vatRatePct}%)</span>
                <span className="tabular-nums">{formatFCFA(totals.vatAmount)}</span>
              </div>
            </>
          )}
          <div className="mt-2 pt-3 border-t-2 flex justify-between items-center" style={{ borderTopColor: accentColor }}>
            <span className="font-bold uppercase tracking-wide text-xs" style={{ color: NAVY }}>Total TTC</span>
            <span className="font-black text-lg tabular-nums" style={{ color: accentColor }}>
              {formatFCFA(totals.totalTTC)}
            </span>
          </div>
        </div>
      </div>
      <div className="px-10 mb-8 text-center flex-1">
        <p className="text-[10px] text-slate-600 bg-slate-50 py-2 px-4 inline-block rounded-full border border-slate-100">
          Arrêté à la somme de : <strong className="font-semibold text-slate-900">{amountToWordsFCFA(totals.totalTTC)}</strong>
        </p>
      </div>
      <div className="px-10 mt-auto mb-6">
        <div className="grid grid-cols-2 gap-20">
          <div className="text-center">
            <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Signature du client</span>
          </div>
          <div className="text-center">
            <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">L'émetteur</span>
          </div>
        </div>
      </div>
      <footer className="py-4 border-t-4 bg-slate-50/80 px-10 text-center" style={{ borderTopColor: accentColor }}>
        <p className="text-[10px] text-slate-500 mb-1 font-medium">
          {[data.sender.companyName, data.sender.legalForm, data.sender.address].filter(Boolean).join(" · ")}
        </p>
        <div className="text-[9px] text-slate-400 space-y-1">
          <p>{[data.sender.phone, data.sender.whatsapp, data.sender.email, data.sender.website].filter(Boolean).join(" · ")}</p>
          {fiscalFooter.length > 0 && <p className="font-mono text-[8.5px]">{fiscalFooter.join(" · ")}</p>}
          {data.sender.rib && <p className="font-mono text-[8.5px]">RIB : {data.sender.rib}</p>}
        </div>
        <p className="mt-2 text-[8px] text-slate-300 uppercase tracking-widest">{data.footerNote || "Facture générée numériquement"}</p>
      </footer>
    </div>
  );
}

function PreviewClassic({ accentColor, NAVY, docTypeLabel, data, fiscalFooter, totals }: any) {
  return (
    <div
      className="mx-auto flex min-h-[285mm] w-[210mm] flex-col bg-white text-[11px] leading-relaxed text-gray-800 border shadow-xl print:shadow-none print:border-none relative"
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact"
      }}
    >
      <header className="px-10 py-8 flex flex-row items-start justify-between border-b" style={{ borderColor: accentColor }}>
        <div className="max-w-[50%]">
          {data.sender.logoDataUrl && (
            <img src={data.sender.logoDataUrl} alt="Logo" className="max-h-20 max-w-[200px] object-contain mb-4" />
          )}
          <h2 className="text-lg font-bold" style={{ color: accentColor }}>{data.sender.companyName || "VOTRE ENTREPRISE"}</h2>
          <div className="text-[10px] text-gray-600 mt-1 whitespace-pre-wrap">{data.sender.address}</div>
          <div className="text-[10px] text-gray-600">{data.sender.phone}</div>
          <div className="text-[10px] text-gray-600">{data.sender.email}</div>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold uppercase tracking-wider" style={{ color: NAVY }}>{docTypeLabel}</h1>
          <div className="mt-2 flex justify-end gap-4 text-[10px]">
            <div className="text-right">
              <span className="block text-gray-400 uppercase tracking-wider text-[8px] font-bold">N° Document</span>
              <span className="font-semibold">{data.docNumber}</span>
            </div>
            <div className="text-right">
              <span className="block text-gray-400 uppercase tracking-wider text-[8px] font-bold">Date</span>
              <span className="font-semibold">{formatDateCI(data.emissionDate)}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="px-10 py-8 flex flex-row items-start justify-between">
         <div className="w-1/2">&nbsp;</div>
         <div className="w-1/2 bg-gray-50 p-4 border rounded shadow-sm">
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-2 border-b pb-1">Facturé à</h3>
            <div className="font-bold text-[12px]">{data.client.name || "—"}</div>
            {data.client.address && <div className="mt-1 text-gray-600">{data.client.address}</div>}
            {data.client.phone && <div className="text-gray-600">Tél : {data.client.phone}</div>}
            {data.client.email && <div className="text-gray-600">Email : {data.client.email}</div>}
            {data.client.ncc && <div className="mt-1 font-mono text-gray-500">NCC : {data.client.ncc}</div>}
         </div>
      </section>

      <div className="px-10 flex-1">
        <table className="w-full text-left border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-2 border font-semibold text-gray-700 w-10 text-center">#</th>
              <th className="py-2 px-2 border font-semibold text-gray-700">Description</th>
              <th className="py-2 px-2 border font-semibold text-gray-700 text-center w-16">Qté</th>
              <th className="py-2 px-2 border font-semibold text-gray-700 text-right w-24">Prix U.</th>
              <th className="py-2 px-2 border font-semibold text-gray-700 text-center w-16">Rem.</th>
              <th className="py-2 px-2 border font-semibold text-gray-700 text-right w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400 italic border">Aucune ligne</td>
              </tr>
            ) : (
              data.lines.map((l: Line, idx: number) => {
                const lineTotal = computeInvoiceTotals({
                  lines: [l],
                  fiscalRegime: "informal",
                  globalDiscountPct: 0,
                  vatRatePct: 0
                }).totalHT;
                return (
                  <tr key={idx}>
                    <td className="py-2 px-2 border text-center text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-2 border text-gray-800">{l.description}</td>
                    <td className="py-2 px-2 border text-center">{l.quantity} {l.unit !== "Forfait" && <span className="text-[9px] text-gray-400">{l.unit}</span>}</td>
                    <td className="py-2 px-2 border text-right tabular-nums">{formatFCFA(l.unitPriceHT).replace(" FCFA", "")}</td>
                    <td className="py-2 px-2 border text-center text-gray-500">{Number(l.discountPct) > 0 ? `${Number(l.discountPct)}%` : "—"}</td>
                    <td className="py-2 px-2 border text-right tabular-nums font-semibold">{formatFCFA(lineTotal).replace(" FCFA", "")}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex flex-row justify-between mt-6">
          <div className="w-[50%] pr-8">
            <h4 className="font-bold text-gray-500 text-[10px] uppercase mb-1">Paiement</h4>
            <div className="text-[10px] text-gray-600 mb-4">{data.conditions}</div>
            {data.sender.rib && (
              <>
                 <h4 className="font-bold text-gray-500 text-[10px] uppercase mb-1">Coordonnées Bancaires</h4>
                 <div className="text-[10px] font-mono text-gray-800 bg-gray-50 p-2 border inline-block rounded">{data.sender.rib}</div>
              </>
            )}
          </div>
          <div className="w-[40%]">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600">Sous-total HT</td>
                  <td className="py-1 text-right tabular-nums">{formatFCFA(totals.subtotalHT)}</td>
                </tr>
                {data.fiscalRegime === "formal" && (
                  <>
                    <tr>
                      <td className="py-1 text-gray-600">Remise ({data.globalDiscountPct || 0}%)</td>
                      <td className="py-1 text-right tabular-nums text-red-600">-{formatFCFA(Math.max(0, totals.subtotalHT - totals.baseTaxableHT))}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-600">TVA ({data.vatRatePct}%)</td>
                      <td className="py-1 text-right tabular-nums">{formatFCFA(totals.vatAmount)}</td>
                    </tr>
                  </>
                )}
                <tr className="border-t-2" style={{ borderTopColor: NAVY }}>
                  <td className="py-2 font-bold text-sm" style={{ color: NAVY }}>Total TTC</td>
                  <td className="py-2 text-right font-bold text-sm tabular-nums" style={{ color: NAVY }}>{formatFCFA(totals.totalTTC)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-700 italic border-l-4 pl-3" style={{ borderLeftColor: accentColor }}>
          Arrêté à la somme de : <strong>{amountToWordsFCFA(totals.totalTTC)}</strong>
        </div>
      </div>

      <div className="px-10 mt-auto mb-6 flex justify-between">
         <div className="text-center w-48">
            <div className="h-16 border-b border-gray-300"></div>
            <div className="mt-2 text-[9px] uppercase text-gray-500">Pour le client</div>
         </div>
         <div className="text-center w-48">
            <div className="h-16 border-b border-gray-300"></div>
            <div className="mt-2 text-[9px] uppercase text-gray-500">L'émetteur</div>
         </div>
      </div>

      <footer className="border-t py-3 text-center px-10">
         <p className="text-[9px] text-gray-600 font-bold">{data.sender.companyName} {data.sender.legalForm ? `- ${data.sender.legalForm}` : ""}</p>
         <p className="text-[8px] text-gray-500 mt-1">{[data.sender.address, data.sender.phone, data.sender.email, data.sender.website].filter(Boolean).join(" · ")}</p>
         {fiscalFooter && fiscalFooter.length > 0 && <p className="text-[8px] text-gray-400 mt-1">{fiscalFooter.join(" · ")}</p>}
      </footer>
    </div>
  );
}

export default function InvoicePreview(props: InvoicePreviewProps) {
  const { docTypeLabel, themeColor, customAccentHex, data, layoutTheme = "premium" } = props;
  const totals = computeInvoiceTotals({
    lines: data.lines,
    fiscalRegime: data.fiscalRegime,
    globalDiscountPct: data.globalDiscountPct,
    vatRatePct: data.vatRatePct
  });
  const fiscalFooter = fiscalMentionSegments(data.sender.rccm, data.sender.dfe, data.sender.ncc);
  const accentColor = customAccentHex && customAccentHex.trim() !== "" ? customAccentHex : themeBar(themeColor);

  return (
    <div className="bg-slate-100/80 p-2 print:bg-white print:p-0">
      {layoutTheme === "classic" ? (
        <PreviewClassic
          NAVY={NAVY}
          accentColor={accentColor}
          docTypeLabel={docTypeLabel}
          data={data}
          totals={totals}
          fiscalFooter={fiscalFooter}
        />
      ) : (
        <PreviewPremium
          NAVY={NAVY}
          accentColor={accentColor}
          docTypeLabel={docTypeLabel}
          data={data}
          totals={totals}
          fiscalFooter={fiscalFooter}
        />
      )}
    </div>
  );
}
