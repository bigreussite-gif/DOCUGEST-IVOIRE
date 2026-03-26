import { formatDateCI, formatFCFA } from "../../utils/formatters";

export type PayslipPreviewData = {
  employerName: string;
  employerAddress: string;
  employerPhone: string;
  employeeName: string;
  employeeRole: string;
  periodLabel: string;
  emissionDate: string;
  baseSalary: number;
  transportAllowance: number;
  otherAllowances: number;
  bonuses: number;
  cnpsEmployee: number;
  otherDeductions: number;
  netPay: number;
  notes: string;
  logoDataUrl?: string | null;
  /** Couleur d’accent (marque), ex. issue du logo */
  accentHex?: string | null;
};

export default function PayslipPreview({ data }: { data: PayslipPreviewData }) {
  const accent = data.accentHex && data.accentHex.trim() !== "" ? data.accentHex : "#059669";

  return (
    <div className="bg-bg p-2">
      <div className="w-[210mm] min-h-[297mm] rounded-sm bg-white p-8 text-[12px] leading-relaxed text-black shadow-none">
        <div className="flex justify-between gap-6 border-b border-slate-200 pb-5">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            {data.logoDataUrl ? (
              <img src={data.logoDataUrl} alt="" className="h-20 w-20 shrink-0 rounded-lg border border-slate-100 object-contain p-1" />
            ) : null}
            <div className="min-w-0">
              <div className="text-[15px] font-bold uppercase tracking-wide" style={{ color: accent }}>
                Bulletin de salaire
              </div>
              <div className="mt-2 text-[14px] font-semibold leading-snug">{data.employerName}</div>
              <div className="mt-2 whitespace-pre-line text-slate-700">{data.employerAddress}</div>
              <div className="mt-1">{data.employerPhone}</div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs font-medium text-slate-500">Période</div>
            <div className="font-semibold text-text">{data.periodLabel}</div>
            <div className="mt-3 text-xs font-medium text-slate-500">Émis le</div>
            <div>{formatDateCI(data.emissionDate)}</div>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Salarié</div>
          <div className="mt-2 text-[14px] font-semibold leading-snug">{data.employeeName}</div>
          {data.employeeRole ? <div className="mt-1 text-slate-600">{data.employeeRole}</div> : null}
        </div>

        <table className="mt-8 w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b-2 text-left" style={{ borderColor: accent }}>
              <th className="py-3 pl-3 font-bold text-slate-800">Libellé</th>
              <th className="py-3 pr-3 text-right font-bold text-slate-800">Montant (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3 pl-3">Salaire de base</td>
              <td className="py-3 pr-3 text-right font-medium">{formatFCFA(data.baseSalary)}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 pl-3">Primes & gratifications</td>
              <td className="py-3 pr-3 text-right">{formatFCFA(data.bonuses)}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 pl-3">Transport / indemnités</td>
              <td className="py-3 pr-3 text-right">{formatFCFA(data.transportAllowance + data.otherAllowances)}</td>
            </tr>
            <tr className="border-b border-slate-200 bg-rose-50/50">
              <td className="py-3 pl-3">Retenues (CNPS, autres)</td>
              <td className="py-3 pr-3 text-right font-medium text-rose-800">
                − {formatFCFA(data.cnpsEmployee + data.otherDeductions)}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          className="mt-8 flex items-center justify-between rounded-xl px-5 py-4 ring-1"
          style={{ backgroundColor: `${accent}14`, borderColor: `${accent}55` }}
        >
          <span className="text-sm font-bold uppercase" style={{ color: accent }}>
            Net à payer
          </span>
          <span className="text-xl font-bold" style={{ color: accent }}>
            {formatFCFA(data.netPay)}
          </span>
        </div>

        {data.notes ? (
          <div className="mt-8 border-t border-slate-200 pt-5 text-[11px] leading-relaxed text-slate-600">
            <div className="font-semibold text-slate-800">Notes</div>
            <div className="mt-2 whitespace-pre-line">{data.notes}</div>
          </div>
        ) : null}

        <div className="mt-12 border-t border-dashed border-slate-200 pt-4 text-center text-[9px] text-slate-400">
          Document généré avec DocuGest Ivoire — à conserver pour vos archives.
        </div>
      </div>
    </div>
  );
}
