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
  data: {
    sender: {
      companyName: string;
      address: string;
      phone: string;
      email: string;
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

export default function InvoicePreview({ docTypeLabel, themeColor, data }: InvoicePreviewProps) {
  const totals = computeInvoiceTotals({
    lines: data.lines,
    fiscalRegime: data.fiscalRegime,
    globalDiscountPct: data.globalDiscountPct,
    vatRatePct: data.vatRatePct
  });

  const bar = themeBar(themeColor);

  return (
    <div className="bg-bg p-2">
      <div className="w-[210mm] min-h-[297mm] rounded-sm bg-white p-6 text-[10.5px] text-black shadow-none">
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

        <div className="mt-5">
          <div className="font-bold">FACTURER À :</div>
          <div className="mt-1">
            <div className="font-semibold">{data.client.name}</div>
            <div>{data.client.address}</div>
            <div>{data.client.phone}</div>
            <div>{data.client.email}</div>
            {data.client.ncc ? <div>NCC: {data.client.ncc}</div> : null}
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
          <div className="w-[55%]">
            <div className="flex justify-between text-[10.5px]">
              <div>Sous-total HT</div>
              <div className="font-semibold">{formatFCFA(totals.subtotalHT)}</div>
            </div>
            {data.fiscalRegime === "formal" ? (
              <>
                <div className="mt-1 flex justify-between text-[10.5px]">
                  <div>Remise globale ({data.globalDiscountPct || 0}%)</div>
                  <div className="font-semibold">
                    {formatFCFA(Math.max(0, totals.subtotalHT - totals.baseTaxableHT))}
                  </div>
                </div>
                <div className="mt-1 flex justify-between text-[10.5px]">
                  <div>Base TVA</div>
                  <div className="font-semibold">{formatFCFA(totals.baseTaxableHT)}</div>
                </div>
                <div className="mt-1 flex justify-between text-[10.5px]">
                  <div>TVA ({data.vatRatePct}%)</div>
                  <div className="font-semibold">{formatFCFA(totals.vatAmount)}</div>
                </div>
              </>
            ) : null}

            <div className="mt-2 rounded bg-surface p-2 ring-1 ring-border/70">
              <div className="flex justify-between">
                <div className="font-bold">Total TTC</div>
                <div className="text-[12px] font-bold" style={{ color: bar }}>
                  {formatFCFA(totals.totalTTC)}
                </div>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-black/80">
              Montant en lettres : <span className="font-semibold">{amountToWordsFCFA(totals.totalTTC)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="font-bold">Conditions de règlement</div>
          <div className="mt-1 whitespace-pre-wrap">{data.conditions}</div>
        </div>

        <div className="mt-6 text-center text-[10px] text-black/80">
          {data.footerNote}
        </div>
      </div>
    </div>
  );
}

