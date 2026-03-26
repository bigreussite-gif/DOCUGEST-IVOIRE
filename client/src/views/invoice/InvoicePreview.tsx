import { formatDateCI, formatFCFA, amountToWordsFCFA } from "../../utils/formatters";
import { computeInvoiceTotals } from "../../utils/calculations";

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
  /** Si défini (ex. couleur extraite du logo), remplace la barre de thème */
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

function themeBar(themeColor: InvoicePreviewProps["themeColor"]) {
  const map: Record<InvoicePreviewProps["themeColor"], string> = {
    emerald: "#00A86B",
    navy: "#0F172A",
    orange: "#FF6B2B",
    bordeaux: "#7F1D1D",
    anthracite: "#111827",
    violet: "#6D28D9"
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

  const bar = customAccentHex && customAccentHex.trim() !== "" ? customAccentHex : themeBar(themeColor);

  return (
    <div className="bg-bg p-2">
      <div className="flex h-[297mm] w-[210mm] flex-col rounded-sm bg-white p-6 text-[10.5px] text-black shadow-none">
        <div className="flex gap-4">
          <div className="w-1/2">
            <div className="flex items-start gap-3">
              {data.sender.logoDataUrl ? (
                <img
                  src={data.sender.logoDataUrl}
                  alt="Logo"
                  className="h-14 w-14 rounded"
                />
              ) : (
                <div className="h-14 w-14 rounded bg-slate-100 ring-1 ring-border/70" />
              )}
              <div>
                <div className="text-[13px] font-bold">{data.sender.companyName || "Votre entreprise"}</div>
                <div className="mt-1">{data.sender.address || ""}</div>
                <div className="mt-1">{data.sender.phone || ""}</div>
                <div className="mt-1">{data.sender.email || ""}</div>
              </div>
            </div>
          </div>

          <div className="w-1/2 text-right">
            <div className="text-[18px] font-bold">{docTypeLabel}</div>
            <div className="mt-1">
              N° <span className="font-semibold">{data.docNumber}</span>
            </div>
            <div className="mt-1">Date: {formatDateCI(data.emissionDate)}</div>
            <div className="mt-1">{data.dueDateText}</div>
          </div>
        </div>

        <div className="mt-4 h-3 w-full rounded bg-black/10" />
        <div className="mt-2 h-7 w-full rounded" style={{ backgroundColor: bar }} />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 font-bold">Informations émetteur</div>
            <table className="w-full border-collapse text-[10.2px]">
              <tbody>
                <tr><td className="border-b px-1 py-1.5 text-slate-600">Entreprise</td><td className="border-b px-1 py-1.5 text-right font-semibold">{data.sender.companyName || "—"}</td></tr>
                <tr><td className="border-b px-1 py-1.5 text-slate-600">Téléphone</td><td className="border-b px-1 py-1.5 text-right">{data.sender.phone || "—"}</td></tr>
                <tr><td className="border-b px-1 py-1.5 text-slate-600">Email</td><td className="border-b px-1 py-1.5 text-right">{data.sender.email || "—"}</td></tr>
                <tr><td className="border-b px-1 py-1.5 text-slate-600">Adresse</td><td className="border-b px-1 py-1.5 text-right">{data.sender.address || "—"}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div className="mb-1 font-bold">FACTURER À</div>
            <table className="w-full border-collapse text-[10.2px]">
              <tbody>
                <tr><td className="border-b px-1 py-1.5 text-slate-600">Client</td><td className="border-b px-1 py-1.5 text-right font-semibold">{data.client.name || "—"}</td></tr>
                <tr><td className="border-b px-1 py-1.5 text-slate-600">Téléphone</td><td className="border-b px-1 py-1.5 text-right">{data.client.phone || "—"}</td></tr>
                <tr><td className="border-b px-1 py-1.5 text-slate-600">Email</td><td className="border-b px-1 py-1.5 text-right">{data.client.email || "—"}</td></tr>
                <tr><td className="border-b px-1 py-1.5 text-slate-600">Adresse</td><td className="border-b px-1 py-1.5 text-right">{data.client.address || "—"}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <table className="mt-5 w-full border-collapse text-[10.2px]">
          <thead>
            <tr className="text-left">
              <th className="border-b px-1 py-2">Description</th>
              <th className="border-b px-1 py-2 w-10">Qté</th>
              <th className="border-b px-1 py-2 w-14">Unité</th>
              <th className="border-b px-1 py-2 w-24 text-right">PU HT</th>
              <th className="border-b px-1 py-2 w-16 text-right">Remise</th>
              <th className="border-b px-1 py-2 w-28 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((l, idx) => {
              const total = computeInvoiceTotals({
                lines: [l],
                fiscalRegime: "informal",
                globalDiscountPct: 0,
                vatRatePct: 0
              }).totalHT;
              return (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="border-b px-1 py-2">{l.description}</td>
                  <td className="border-b px-1 py-2">{l.quantity}</td>
                  <td className="border-b px-1 py-2">{l.unit}</td>
                  <td className="border-b px-1 py-2 text-right">{formatFCFA(l.unitPriceHT).replace(" FCFA", "")}</td>
                  <td className="border-b px-1 py-2 text-right">{Number(l.discountPct) || 0}%</td>
                  <td className="border-b px-1 py-2 text-right">{formatFCFA(total).replace(" FCFA", "")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-3 flex justify-end">
          <div className="w-[58%]">
            <table className="w-full border-collapse text-[10.4px]">
              <tbody>
                <tr><td className="border-b px-1 py-1.5">Sous-total HT</td><td className="border-b px-1 py-1.5 text-right font-semibold">{formatFCFA(totals.subtotalHT)}</td></tr>
                {data.fiscalRegime === "formal" ? (
                  <>
                    <tr><td className="border-b px-1 py-1.5">Remise globale ({data.globalDiscountPct || 0}%)</td><td className="border-b px-1 py-1.5 text-right font-semibold">{formatFCFA(Math.max(0, totals.subtotalHT - totals.baseTaxableHT))}</td></tr>
                    <tr><td className="border-b px-1 py-1.5">Base TVA</td><td className="border-b px-1 py-1.5 text-right font-semibold">{formatFCFA(totals.baseTaxableHT)}</td></tr>
                    <tr><td className="border-b px-1 py-1.5">TVA ({data.vatRatePct}%)</td><td className="border-b px-1 py-1.5 text-right font-semibold">{formatFCFA(totals.vatAmount)}</td></tr>
                  </>
                ) : null}
                <tr>
                  <td className="px-1 py-2 font-bold">Total TTC</td>
                  <td className="px-1 py-2 text-right text-[12px] font-bold" style={{ color: bar }}>
                    {formatFCFA(totals.totalTTC)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 text-[10px] text-black/80">
              Montant en lettres : <span className="font-semibold">{amountToWordsFCFA(totals.totalTTC)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="font-bold">Conditions de règlement</div>
          <div className="mt-1 whitespace-pre-wrap">{data.conditions}</div>
        </div>

        <div className="mt-auto pt-4">
          <div className="border-t border-slate-300 pt-2 text-[9.5px] text-black/80">
            <div className="text-center">{data.footerNote}</div>
            <div className="mt-1 text-center">
              {[data.sender.phone, data.sender.whatsapp, data.sender.email, data.sender.website].filter(Boolean).join(" · ")}
            </div>
            <div className="mt-1 text-center">
              {[data.sender.headOffice || data.sender.address, data.sender.legalForm, data.sender.rib].filter(Boolean).join(" · ")}
            </div>
            <div className="mt-1 text-center">
              {[data.sender.ncc ? `NCC: ${data.sender.ncc}` : "", data.sender.rccm ? `RCCM: ${data.sender.rccm}` : "", data.sender.dfe ? `DFE: ${data.sender.dfe}` : ""]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

