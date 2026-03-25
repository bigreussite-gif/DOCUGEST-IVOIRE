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
};

export default function PayslipPreview({ data }: { data: PayslipPreviewData }) {
  return (
    <div className="bg-bg p-2">
      <div className="w-[210mm] min-h-[297mm] rounded-sm bg-white p-8 text-[11px] text-black shadow-none">
        <div className="flex justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="text-[14px] font-bold uppercase tracking-wide text-emerald-700">Bulletin de salaire</div>
            <div className="mt-2 text-[13px] font-semibold">{data.employerName}</div>
            <div className="mt-1 whitespace-pre-line text-slate-700">{data.employerAddress}</div>
            <div className="mt-1">{data.employerPhone}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Période</div>
            <div className="font-semibold">{data.periodLabel}</div>
            <div className="mt-2 text-xs text-slate-500">Émis le</div>
            <div>{formatDateCI(data.emissionDate)}</div>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase text-slate-500">Salarié</div>
          <div className="mt-1 text-[13px] font-semibold">{data.employeeName}</div>
          {data.employeeRole ? <div className="text-slate-600">{data.employeeRole}</div> : null}
        </div>

        <table className="mt-6 w-full border-collapse text-left text-[10.5px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100">
              <th className="py-2 pl-2">Libellé</th>
              <th className="py-2 pr-2 text-right">Montant (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 pl-2">Salaire de base</td>
              <td className="py-2 pr-2 text-right font-medium">{formatFCFA(data.baseSalary)}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pl-2">Primes & gratifications</td>
              <td className="py-2 pr-2 text-right">{formatFCFA(data.bonuses)}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pl-2">Transport / indemnités</td>
              <td className="py-2 pr-2 text-right">{formatFCFA(data.transportAllowance + data.otherAllowances)}</td>
            </tr>
            <tr className="border-b border-slate-200 bg-rose-50/50">
              <td className="py-2 pl-2">Retenues (CNPS, autres)</td>
              <td className="py-2 pr-2 text-right text-rose-800">
                − {formatFCFA(data.cnpsEmployee + data.otherDeductions)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
          <span className="text-sm font-bold uppercase text-emerald-900">Net à payer</span>
          <span className="text-lg font-bold text-emerald-700">{formatFCFA(data.netPay)}</span>
        </div>

        {data.notes ? (
          <div className="mt-6 border-t border-slate-200 pt-4 text-[10px] text-slate-600">
            <div className="font-semibold text-slate-700">Notes</div>
            <div className="mt-1 whitespace-pre-line">{data.notes}</div>
          </div>
        ) : null}

        <div className="mt-10 border-t border-dashed border-slate-200 pt-4 text-center text-[9px] text-slate-400">
          Document généré avec DocuGest Ivoire — à conserver pour vos archives.
        </div>
      </div>
    </div>
  );
}
