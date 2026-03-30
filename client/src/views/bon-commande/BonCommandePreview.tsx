import { formatFCFA } from "../../utils/formatters";
import { formatDateFR } from "../../utils/documentNumber";

export type BonCommandeLine = {
  designation: string;
  reference: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
};

export type BonCommandeData = {
  bcNumber: string;
  bcDate: string;
  refProforma: string;
  deliveryMode: string;
  deliveryDelay: string;
  deliveryAddress: string;
  paymentMode: string;
  paymentConditions: string;
  buyerName: string;
  buyerRccm: string;
  buyerNcc: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerContact: string;
  buyerFunction: string;
  supplierName: string;
  supplierAddress: string;
  supplierPhone: string;
  supplierEmail: string;
  supplierContact: string;
  lines: BonCommandeLine[];
  discountPct: number;
  vatPct: number;
  observations: string;
};

const ACCENT = "#1e40af";

export default function BonCommandePreview({ data }: { data: BonCommandeData }) {
  const totalHT = data.lines.reduce((sum, l) => sum + l.quantity * l.unitPriceHT, 0);
  const discountAmount = totalHT * (data.discountPct / 100);
  const netHT = totalHT - discountAmount;
  const vatAmount = netHT * (data.vatPct / 100);
  const totalTTC = netHT + vatAmount;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "#1a1a2e", background: "#fff", padding: 32, maxWidth: 794 }}>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: ACCENT, letterSpacing: -0.5 }}>BON DE COMMANDE</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginTop: 4 }}>N° {data.bcNumber}</div>
          <div style={{ color: "#6b7280", marginTop: 2 }}>Date : {formatDateFR(data.bcDate)}</div>
          {data.refProforma && <div style={{ color: "#6b7280" }}>Réf. proforma : {data.refProforma}</div>}
        </div>
        <div style={{ textAlign: "right", background: "#eff6ff", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase" }}>Acheteur</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{data.buyerName}</div>
          {data.buyerRccm && <div>RCCM : {data.buyerRccm}</div>}
          {data.buyerNcc && <div>NCC : {data.buyerNcc}</div>}
          <div>{data.buyerAddress}</div>
          <div>{data.buyerPhone}</div>
          {data.buyerEmail && <div>{data.buyerEmail}</div>}
          {data.buyerContact && <div>Signataire : {data.buyerContact}{data.buyerFunction ? ` — ${data.buyerFunction}` : ""}</div>}
        </div>
      </div>

      {/* Fournisseur */}
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", marginBottom: 4 }}>Fournisseur</div>
        <div style={{ display: "flex", gap: 32 }}>
          <div>
            <div style={{ fontWeight: 700 }}>{data.supplierName}</div>
            {data.supplierAddress && <div>{data.supplierAddress}</div>}
          </div>
          <div>
            {data.supplierPhone && <div>Tél : {data.supplierPhone}</div>}
            {data.supplierEmail && <div>Email : {data.supplierEmail}</div>}
            {data.supplierContact && <div>Contact : {data.supplierContact}</div>}
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          ["Mode de livraison", data.deliveryMode],
          ["Délai", data.deliveryDelay],
          ["Mode de paiement", data.paymentMode],
          ["Conditions", data.paymentConditions],
        ].filter(([, v]) => v).map(([label, val]) => (
          <div key={label} style={{ background: "#f3f4f6", borderRadius: 6, padding: "6px 10px", fontSize: 10 }}>
            <div style={{ fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontWeight: 600, color: "#111" }}>{val}</div>
          </div>
        ))}
      </div>
      {data.deliveryAddress && (
        <div style={{ marginBottom: 16, fontSize: 10, color: "#6b7280" }}>
          Adresse de livraison : <strong>{data.deliveryAddress}</strong>
        </div>
      )}

      {/* Tableau articles */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr style={{ background: ACCENT, color: "#fff" }}>
            {["N°", "Désignation", "Réf.", "Qté", "Unité", "Prix unitaire HT", "Montant HT"].map((h) => (
              <th key={h} style={{ padding: "7px 8px", textAlign: h === "N°" ? "center" : h.includes("HT") || h === "Qté" ? "right" : "left", fontWeight: 700, fontSize: 10 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.lines.map((l, i) => {
            const montant = l.quantity * l.unitPriceHT;
            return (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                <td style={{ padding: "6px 8px", textAlign: "center", color: "#6b7280" }}>{i + 1}</td>
                <td style={{ padding: "6px 8px" }}>{l.designation}</td>
                <td style={{ padding: "6px 8px", color: "#6b7280" }}>{l.reference}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{l.quantity}</td>
                <td style={{ padding: "6px 8px" }}>{l.unit}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{formatFCFA(l.unitPriceHT)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{formatFCFA(montant)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totaux */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <table style={{ width: 280, borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "4px 8px", color: "#6b7280" }}>Total HT</td>
              <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: 600 }}>{formatFCFA(totalHT)}</td>
            </tr>
            {data.discountPct > 0 && (
              <>
                <tr>
                  <td style={{ padding: "4px 8px", color: "#6b7280" }}>Remise ({data.discountPct}%)</td>
                  <td style={{ padding: "4px 8px", textAlign: "right", color: "#dc2626" }}>- {formatFCFA(discountAmount)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "4px 8px", color: "#6b7280" }}>Net HT</td>
                  <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: 600 }}>{formatFCFA(netHT)}</td>
                </tr>
              </>
            )}
            <tr>
              <td style={{ padding: "4px 8px", color: "#6b7280" }}>TVA ({data.vatPct}%)</td>
              <td style={{ padding: "4px 8px", textAlign: "right" }}>{formatFCFA(vatAmount)}</td>
            </tr>
            <tr style={{ background: ACCENT, color: "#fff" }}>
              <td style={{ padding: "8px 8px", fontWeight: 800, fontSize: 12 }}>TOTAL TTC</td>
              <td style={{ padding: "8px 8px", textAlign: "right", fontWeight: 800, fontSize: 13 }}>{formatFCFA(totalTTC)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {data.observations && (
        <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#78350f", textTransform: "uppercase", marginBottom: 4 }}>Observations</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{data.observations}</div>
        </div>
      )}

      {/* Signature */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <div style={{ textAlign: "center", minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>Le Responsable des Achats</div>
          <div style={{ color: "#6b7280", fontSize: 10 }}>{data.buyerContact}</div>
          <div style={{ marginTop: 4, color: "#6b7280", fontSize: 10 }}>Date : {formatDateFR(data.bcDate)}</div>
          <div style={{ marginTop: 40, borderTop: "1px solid #374151", paddingTop: 4, fontSize: 10, color: "#6b7280" }}>Signature et cachet</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, borderTop: "1px solid #e5e7eb", paddingTop: 10, textAlign: "center", fontSize: 9, color: "#9ca3af" }}>
        Document généré par DocuGest Ivoire — docugest-ivoire.vercel.app
      </div>
    </div>
  );
}
