import { formatDateCI, formatFCFA } from "../../utils/formatters";
import { fiscalMentionSegments } from "../../utils/fiscalMentions";

export type PayslipPreviewData = {
  employerName: string;
  employerAddress: string;
  employerPhone: string;
  employerEmail?: string;
  employerWhatsapp?: string;
  employerWebsite?: string;
  employerHeadOffice?: string;
  employerLegalForm?: string;
  employerRib?: string;
  employerNcc?: string;
  employerRccm?: string;
  employerDfe?: string;
  employeeName: string;
  employeeRole: string;
  periodLabel: string;
  emissionDate: string;
  baseSalary: number;
  transportAllowance: number;
  otherAllowances: number;
  bonuses: number;
  /** Montant CNPS salarié (calculé ou manuel). */
  cnpsEmployee: number;
  cnpsRatePct?: number;
  igrRetentionFcfa?: number;
  familyTaxParts?: number;
  otherDeductions: number;
  netPay: number;
  notes: string;
  logoDataUrl?: string | null;
  accentHex?: string | null;
};

const BLUE_LIGHT = "#2563eb";

export default function PayslipPreview({ data }: { data: PayslipPreviewData }) {
  const accent = data.accentHex && data.accentHex.trim() !== "" ? data.accentHex : BLUE_LIGHT;
  const gross =
    data.baseSalary + data.transportAllowance + data.otherAllowances + data.bonuses;
  const igr = Number(data.igrRetentionFcfa ?? 0);
  const totalDed = data.cnpsEmployee + igr + data.otherDeductions;
  const fiscalLine = fiscalMentionSegments(data.employerRccm, data.employerDfe, data.employerNcc);

  return (
    <div className="bg-slate-100/80 p-2 print:bg-white print:p-0">
      <div
        className="mx-auto flex min-h-[297mm] w-[210mm] flex-col bg-white p-6 text-[10px] leading-snug text-slate-800 shadow-sm ring-1 ring-slate-200/80 print:shadow-none print:ring-0"
        style={{ fontFamily: "ui-sans-serif, system-ui, 'Segoe UI', Roboto, sans-serif" }}
      >
        <p className="text-center text-[9px] font-medium" style={{ color: accent }}>
          (Document généré — bulletin personnalisable)
        </p>

        <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {data.logoDataUrl ? (
              <img
                src={data.logoDataUrl}
                alt=""
                className="h-20 w-20 shrink-0 rounded-lg border border-slate-100 object-contain p-1"
              />
            ) : (
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                LOGO
              </div>
            )}
            <div className="min-w-0">
              <div className="text-[11px] font-semibold" style={{ color: accent }}>
                {data.employerName}
              </div>
              <div className="mt-1 max-w-[14rem] whitespace-pre-line text-[9px] text-slate-600">{data.employerAddress}</div>
              <div className="mt-1 text-[9px] text-slate-600">{data.employerPhone}</div>
              {data.employerEmail ? <div className="text-[9px] text-slate-600">{data.employerEmail}</div> : null}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] font-medium text-slate-500">Émis le</div>
            <div className="font-semibold text-slate-900">{formatDateCI(data.emissionDate)}</div>
          </div>
        </header>

        <div className="mt-5 flex justify-center">
          <div
            className="border-2 px-10 py-2 text-center rounded"
            style={{ backgroundColor: accent, borderColor: accent }}
          >
            <h1 className="text-[15px] font-bold tracking-wide text-white">BULLETIN DE PAIE</h1>
          </div>
        </div>

        <div className="mt-3 space-y-1 text-center text-[9px] leading-snug text-slate-600">
          {data.employerLegalForm ? <div>Société · {data.employerLegalForm}</div> : null}
          {fiscalLine.length > 0 ? <div className="font-medium text-slate-700">{fiscalLine.join(" · ")}</div> : null}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="overflow-hidden rounded-md ring-1 ring-slate-200" style={{ borderColor: accent }}>
            <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: accent }}>
              Salarié
            </div>
            <div className="space-y-2 bg-slate-50/50 p-3">
              <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-slate-500">Nom</span>
                <span className="font-semibold text-slate-900">{data.employeeName || "—"}</span>
              </div>
              <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-slate-500">Emploi</span>
                <span className="text-right text-slate-800">{data.employeeRole || "—"}</span>
              </div>
              <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-slate-500">Période</span>
                <span className="font-medium text-slate-800">{data.periodLabel || "—"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Parts (IGR)</span>
                <span className="font-medium text-slate-800">
                  {typeof data.familyTaxParts === "number" ? String(data.familyTaxParts).replace(".", ",") : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md ring-1 ring-slate-200" style={{ borderColor: accent }}>
            <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: accent }}>
              Période & paiement
            </div>
            <div className="space-y-2 bg-white p-3">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Période de paie</span>
                <span className="font-medium">{data.periodLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Émission</span>
                <span>{formatDateCI(data.emissionDate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-t-md border border-slate-200" style={{ borderColor: accent }}>
          <table className="w-full border-collapse text-[9.5px]">
            <thead>
              <tr className="text-white" style={{ backgroundColor: accent }}>
                <th className="px-2 py-2 text-left font-semibold">Libellé</th>
                <th className="w-28 px-2 py-2 text-right font-semibold">Montant (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="border-b border-slate-100 px-2 py-2">Salaire de base</td>
                <td className="border-b border-slate-100 px-2 py-2 text-right font-medium tabular-nums">{formatFCFA(data.baseSalary)}</td>
              </tr>
              <tr className="bg-slate-50/80">
                <td className="border-b border-slate-100 px-2 py-2">Primes & gratifications</td>
                <td className="border-b border-slate-100 px-2 py-2 text-right tabular-nums">{formatFCFA(data.bonuses)}</td>
              </tr>
              <tr className="bg-white">
                <td className="border-b border-slate-100 px-2 py-2">Indemnités & transport</td>
                <td className="border-b border-slate-100 px-2 py-2 text-right tabular-nums">
                  {formatFCFA(data.transportAllowance + data.otherAllowances)}
                </td>
              </tr>
              <tr className="bg-rose-50/60">
                <td className="border-b border-slate-200 px-2 py-2 text-rose-900">
                  <div className="font-medium">CNPS salarié</div>
                  {typeof data.cnpsRatePct === "number" && data.cnpsRatePct > 0 ? (
                    <div className="text-[8.5px] font-normal text-rose-800/90">
                      Taux {String(data.cnpsRatePct).replace(".", ",")} % (base indicative salaire + primes)
                    </div>
                  ) : (
                    <div className="text-[8.5px] font-normal text-rose-800/90">Montant saisi manuellement</div>
                  )}
                </td>
                <td className="border-b border-slate-200 px-2 py-2 text-right font-semibold tabular-nums text-rose-800">
                  − {formatFCFA(data.cnpsEmployee)}
                </td>
              </tr>
              {igr > 0 ? (
                <tr className="bg-rose-50/40">
                  <td className="border-b border-slate-200 px-2 py-2 font-medium text-rose-900">IGR / impôt sur le revenu</td>
                  <td className="border-b border-slate-200 px-2 py-2 text-right font-semibold tabular-nums text-rose-800">
                    − {formatFCFA(igr)}
                  </td>
                </tr>
              ) : null}
              {data.otherDeductions > 0 ? (
                <tr className="bg-rose-50/40">
                  <td className="border-b border-slate-200 px-2 py-2 font-medium text-rose-900">Autres retenues</td>
                  <td className="border-b border-slate-200 px-2 py-2 text-right font-semibold tabular-nums text-rose-800">
                    − {formatFCFA(data.otherDeductions)}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Synthèse */}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <table className="w-full border-collapse text-[9.5px]">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Total gains</td>
                <td className="py-2 text-right font-semibold tabular-nums">{formatFCFA(gross)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Total retenues</td>
                <td className="py-2 text-right font-semibold tabular-nums text-rose-700">{formatFCFA(totalDed)}</td>
              </tr>
            </tbody>
          </table>

          <div
            className="flex flex-col justify-center rounded-lg px-4 py-3 text-white shadow-md"
            style={{ backgroundColor: accent }}
          >
            <div className="text-[9px] font-bold uppercase tracking-widest opacity-90">Net à payer</div>
            <div className="mt-1 text-right text-[20px] font-bold tabular-nums tracking-tight">{formatFCFA(data.netPay)}</div>
          </div>
        </div>

        {data.notes ? (
          <div className="mt-6 rounded-md border border-dashed border-slate-200 bg-slate-50/50 p-3">
            <div className="text-[9px] font-bold uppercase text-slate-500">Notes</div>
            <p className="mt-1 whitespace-pre-line text-[9px] leading-relaxed text-slate-700">{data.notes}</p>
          </div>
        ) : null}

        <footer className="mt-auto border-t border-slate-200 pt-4 text-center text-[8px] leading-relaxed text-slate-500">
          <p className="text-slate-600">
            Conservez ce document pour vos archives et pour faire valoir vos droits.
          </p>
          <div className="mt-2 font-medium text-slate-600">
            {[data.employerPhone, data.employerWhatsapp, data.employerEmail, data.employerWebsite].filter(Boolean).join(" · ")}
          </div>
          <div className="mt-1">
            {[data.employerHeadOffice || data.employerAddress, data.employerRib].filter(Boolean).join(" · ")}
          </div>
          {fiscalLine.length > 0 ? <div className="mt-1">{fiscalLine.join(" · ")}</div> : null}
          <div className="mt-3 text-slate-400">Document généré avec DocuGestIvoire</div>
        </footer>
      </div>
    </div>
  );
}
