import { formatDateFR } from "../../utils/documentNumber";

export type BonLivraisonLine = {
  designation: string;
  reference: string;
  quantityOrdered: number;
  quantityDelivered: number;
  unit: string;
  observations: string;
};

export type BonLivraisonData = {
  blNumber: string;
  blDate: string;
  refBC: string;
  refFacture: string;
  transportMode: string;
  vehicleImmat: string;
  senderName: string;
  senderRccm: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;
  delivererName: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  recipientContact: string;
  lines: BonLivraisonLine[];
  deliveryStatus: string;
  reserves: string;
  receiverName: string;
  receptionDate: string;
};

export default function BonLivraisonPreview({ data, logoDataUrl, accentColor }: { data: BonLivraisonData; logoDataUrl?: string | null; accentColor?: string | null }) {
  const ACCENT = accentColor || "#0f766e";
  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "#1a1a2e", background: "#fff", padding: 32, maxWidth: 794, minHeight: "297mm", display: "flex", flexDirection: "column" }}>
      {/* En-tête */}
      <div style={{ borderBottom: `3px solid ${ACCENT}`, paddingBottom: 16, marginBottom: 20 }}>
        {logoDataUrl && <img src={logoDataUrl} alt="Logo" style={{ height: 56, maxWidth: 160, objectFit: "contain", marginBottom: 8 }} />}
        <div style={{ fontSize: 22, fontWeight: 800, color: ACCENT, letterSpacing: -0.5 }}>BON DE LIVRAISON</div>
        <div style={{ display: "flex", gap: 24, marginTop: 8, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontWeight: 700 }}>N° : </span>{data.blNumber}
          </div>
          <div>
            <span style={{ fontWeight: 700 }}>Date : </span>{formatDateFR(data.blDate)}
          </div>
          {data.refBC && <div><span style={{ fontWeight: 700 }}>Réf. BC : </span>{data.refBC}</div>}
          {data.refFacture && <div><span style={{ fontWeight: 700 }}>Réf. Facture : </span>{data.refFacture}</div>}
          {data.transportMode && <div><span style={{ fontWeight: 700 }}>Transport : </span>{data.transportMode}</div>}
          {data.vehicleImmat && <div><span style={{ fontWeight: 700 }}>Véhicule : </span>{data.vehicleImmat}</div>}
        </div>
      </div>

      {/* Expéditeur / Destinataire */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase", marginBottom: 6 }}>Expéditeur</div>
          <div style={{ fontWeight: 700 }}>{data.senderName}</div>
          {data.senderRccm && <div>RCCM : {data.senderRccm}</div>}
          <div>{data.senderAddress}</div>
          {data.senderPhone && <div>Tél : {data.senderPhone}</div>}
          {data.senderEmail && <div>{data.senderEmail}</div>}
          {data.delivererName && <div style={{ marginTop: 6 }}>Livreur : <strong>{data.delivererName}</strong></div>}
        </div>
        <div style={{ flex: 1, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", marginBottom: 6 }}>Destinataire</div>
          <div style={{ fontWeight: 700 }}>{data.recipientName}</div>
          <div>{data.recipientAddress}</div>
          {data.recipientPhone && <div>Tél : {data.recipientPhone}</div>}
          {data.recipientContact && <div>Contact : {data.recipientContact}</div>}
        </div>
      </div>

      {/* Tableau articles */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr style={{ background: ACCENT, color: "#fff" }}>
            {["N°", "Désignation", "Réf.", "Qté commandée", "Qté livrée", "Unité", "Observations"].map((h) => (
              <th key={h} style={{ padding: "7px 8px", textAlign: h === "N°" ? "center" : h.includes("Qté") ? "right" : "left", fontWeight: 700, fontSize: 10 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.lines.map((l, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
              <td style={{ padding: "6px 8px", textAlign: "center", color: "#6b7280" }}>{i + 1}</td>
              <td style={{ padding: "6px 8px", fontWeight: 600 }}>{l.designation}</td>
              <td style={{ padding: "6px 8px", color: "#6b7280" }}>{l.reference}</td>
              <td style={{ padding: "6px 8px", textAlign: "right", color: "#6b7280" }}>{l.quantityOrdered || "—"}</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: ACCENT }}>{l.quantityDelivered}</td>
              <td style={{ padding: "6px 8px" }}>{l.unit}</td>
              <td style={{ padding: "6px 8px", fontSize: 10, color: "#6b7280" }}>{l.observations}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* État de la livraison */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", marginBottom: 4 }}>État de la livraison</div>
          <div style={{
            fontWeight: 700,
            color: data.deliveryStatus === "Conforme" ? "#16a34a" : data.deliveryStatus === "Non conforme" ? "#dc2626" : "#d97706",
          }}>
            {data.deliveryStatus || "—"}
          </div>
          {data.reserves && (
            <div style={{ marginTop: 6, fontSize: 10, color: "#6b7280" }}>
              <strong>Réserves :</strong> {data.reserves}
            </div>
          )}
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: "flex", gap: 32, marginTop: 24 }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Le Livreur</div>
          {data.delivererName && <div style={{ fontSize: 10, color: "#6b7280" }}>{data.delivererName}</div>}
          <div style={{ marginTop: 48, borderTop: "1px solid #374151", paddingTop: 4, fontSize: 10, color: "#6b7280" }}>Signature</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Le Réceptionnaire</div>
          {data.receiverName && <div style={{ fontSize: 10, color: "#6b7280" }}>{data.receiverName}</div>}
          {data.receptionDate && <div style={{ fontSize: 10, color: "#6b7280" }}>Reçu le : {formatDateFR(data.receptionDate.split("T")[0])}</div>}
          <div style={{ marginTop: 36, borderTop: "1px solid #374151", paddingTop: 4, fontSize: 10, color: "#6b7280" }}>Signature et cachet</div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 10, color: "#6b7280", fontStyle: "italic", textAlign: "center" }}>
        Ce bon de livraison vaut accusé de réception de la marchandise.
      </div>

      <div style={{ marginTop: "auto", borderTop: "1px solid #e5e7eb", paddingTop: 10, textAlign: "center", fontSize: 9, color: "#9ca3af" }}>
        Document généré par DocuGestIvoire — docugest-ivoire.vercel.app
      </div>
    </div>
  );
}
