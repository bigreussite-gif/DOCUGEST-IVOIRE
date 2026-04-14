import { formatFCFA } from "../../utils/formatters";
import { amountToWordsFCFA } from "../../utils/formatters";
import { formatDateFR } from "../../utils/documentNumber";

export type RecuPaiementData = {
  recuNumber: string;
  paymentDate: string;
  motif: string;
  amount: number;
  paymentMode: string;
  transactionRef: string;
  chequeRef: string;
  refFacture: string;
  refBC: string;
  paymentType: string;
  totalDue: number;
  emitterName: string;
  emitterActivity: string;
  emitterAddress: string;
  emitterPhone: string;
  emitterRccm: string;
  payerName: string;
  payerCompany: string;
  payerPhone: string;
  payerAddress: string;
  notes: string;
};

export default function RecuPaiementPreview({ data, logoDataUrl, accentColor }: { data: RecuPaiementData; logoDataUrl?: string | null; accentColor?: string | null }) {
  const ACCENT = accentColor || "#0f766e";
  const amountInWords = amountToWordsFCFA(data.amount || 0);
  const remaining = (data.totalDue || 0) - (data.amount || 0);
  const showBalance = data.paymentType !== "Paiement intégral" && data.totalDue > 0;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "#1a1a2e", background: "#fff", padding: 32, width: "100%", maxWidth: 794, margin: "0 auto", minHeight: "297mm", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {/* En-tête */}
      <div style={{ border: `3px solid ${ACCENT}`, borderRadius: 8, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {logoDataUrl && <img src={logoDataUrl} alt="Logo" style={{ height: 56, maxWidth: 160, objectFit: "contain", marginBottom: 6 }} />}
            <div style={{ fontSize: 20, fontWeight: 800, color: ACCENT, letterSpacing: -0.3 }}>REÇU DE PAIEMENT</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>{data.emitterName}</div>
            {data.emitterActivity && <div style={{ color: "#6b7280", fontSize: 10 }}>{data.emitterActivity}</div>}
            {data.emitterAddress && <div style={{ fontSize: 10 }}>{data.emitterAddress}</div>}
            <div style={{ fontSize: 10 }}>Tél : {data.emitterPhone}</div>
            {data.emitterRccm && <div style={{ fontSize: 10 }}>RCCM : {data.emitterRccm}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: ACCENT, color: "#fff", borderRadius: 6, padding: "6px 12px", fontWeight: 700 }}>
              N° {data.recuNumber}
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: "#6b7280" }}>Date : {formatDateFR(data.paymentDate)}</div>
          </div>
        </div>
      </div>

      {/* Payeur */}
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", marginBottom: 4 }}>Reçu de</div>
        <div style={{ fontWeight: 700 }}>{data.payerName}</div>
        {data.payerCompany && <div>{data.payerCompany}</div>}
        {data.payerPhone && <div>Tél : {data.payerPhone}</div>}
        {data.payerAddress && <div>{data.payerAddress}</div>}
      </div>

      {/* Montant principal */}
      <div style={{ background: "#f0fdf4", border: `2px solid ${ACCENT}`, borderRadius: 10, padding: "16px 20px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>La somme de</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: ACCENT }}>{formatFCFA(data.amount || 0)}</div>
        <div style={{ marginTop: 8, fontStyle: "italic", color: "#374151", fontSize: 12 }}>
          Soit : <strong>{amountInWords}</strong>
        </div>
      </div>

      {/* Détails paiement */}
      <div style={{ marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "5px 8px", fontWeight: 700, width: "35%", color: "#374151" }}>Motif :</td>
              <td style={{ padding: "5px 8px" }}>{data.motif}</td>
            </tr>
            <tr style={{ background: "#f9fafb" }}>
              <td style={{ padding: "5px 8px", fontWeight: 700, color: "#374151" }}>Mode de paiement :</td>
              <td style={{ padding: "5px 8px" }}>{data.paymentMode}</td>
            </tr>
            {data.transactionRef && (
              <tr>
                <td style={{ padding: "5px 8px", fontWeight: 700, color: "#374151" }}>Référence transaction :</td>
                <td style={{ padding: "5px 8px" }}>{data.transactionRef}</td>
              </tr>
            )}
            {data.chequeRef && (
              <tr style={{ background: "#f9fafb" }}>
                <td style={{ padding: "5px 8px", fontWeight: 700, color: "#374151" }}>N° Chèque / Banque :</td>
                <td style={{ padding: "5px 8px" }}>{data.chequeRef}</td>
              </tr>
            )}
            {data.refFacture && (
              <tr>
                <td style={{ padding: "5px 8px", fontWeight: 700, color: "#374151" }}>Réf. Facture :</td>
                <td style={{ padding: "5px 8px" }}>{data.refFacture}</td>
              </tr>
            )}
            {data.refBC && (
              <tr style={{ background: "#f9fafb" }}>
                <td style={{ padding: "5px 8px", fontWeight: 700, color: "#374151" }}>Réf. Bon de commande :</td>
                <td style={{ padding: "5px 8px" }}>{data.refBC}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: "5px 8px", fontWeight: 700, color: "#374151" }}>Type de paiement :</td>
              <td style={{ padding: "5px 8px" }}>{data.paymentType}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Solde (si acompte/partiel) */}
      {showBalance && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Total dû</div>
              <div style={{ fontWeight: 700 }}>{formatFCFA(data.totalDue)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Payé ce jour</div>
              <div style={{ fontWeight: 700, color: ACCENT }}>{formatFCFA(data.amount)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Reste à payer</div>
              <div style={{ fontWeight: 700, color: remaining > 0 ? "#dc2626" : ACCENT }}>{formatFCFA(Math.max(0, remaining))}</div>
            </div>
          </div>
        </div>
      )}

      {data.notes && (
        <div style={{ marginBottom: 16, padding: "8px 12px", background: "#f9fafb", borderRadius: 6, fontSize: 10, color: "#6b7280" }}>
          <strong>Notes :</strong> {data.notes}
        </div>
      )}

      {/* Signature */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <div style={{ textAlign: "center", minWidth: 200 }}>
          <div style={{ fontWeight: 700 }}>L'Émetteur</div>
          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{data.emitterName}</div>
          <div style={{ marginTop: 40, borderTop: "1px solid #374151", paddingTop: 4, fontSize: 10, color: "#6b7280" }}>Signature et cachet</div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 10, fontStyle: "italic", color: "#6b7280", textAlign: "center" }}>
        Ce reçu atteste du paiement effectif de la somme indiquée.
      </div>

      <div style={{ marginTop: "auto", borderTop: "1px solid #e5e7eb", paddingTop: 10, textAlign: "center", fontSize: 9, color: "#9ca3af" }}>
        Document généré par DocuGestIvoire — docugest-ivoire.vercel.app
      </div>
    </div>
  );
}
