import { formatFCFA } from "../../utils/formatters";
import { formatDateFR } from "../../utils/documentNumber";

export type ContratPrestationData = {
  cpsNumber: string;
  signatureDate: string;
  signaturePlace: string;
  exemplaires: number;
  prestataireNom: string;
  prestataireForme: string;
  prestataireRccm: string;
  prestataireNcc: string;
  prestataireAdresse: string;
  prestataireTel: string;
  prestataireEmail: string;
  prestataireRepresentant: string;
  prestataireQualite: string;
  clientNom: string;
  clientForme: string;
  clientRccm: string;
  clientAdresse: string;
  clientTel: string;
  clientEmail: string;
  clientRepresentant: string;
  clientQualite: string;
  titrePrestation: string;
  descriptionPrestation: string;
  lieuExecution: string;
  dateDebut: string;
  dateFin: string;
  renouvellement: string;
  montantHT: number;
  vatPct: number;
  modalitesPaiement: string;
  modePaiement: string;
  penalites: string;
  obligationsPrestataire: string;
  obligationsClient: string;
  confidentialite: boolean;
  dureeConfidentialite: string;
  preavisResiliation: string;
  conditionsResiliation: string;
  tribunal: string;
};

const ACCENT = "#7c3aed";

export default function ContratPrestationPreview({ data }: { data: ContratPrestationData }) {
  const montantTTC = data.montantHT * (1 + data.vatPct / 100);
  const vatAmount = data.montantHT * (data.vatPct / 100);

  let dureeDays = "";
  if (data.dateDebut && data.dateFin) {
    const ms = new Date(data.dateFin).getTime() - new Date(data.dateDebut).getTime();
    if (!isNaN(ms)) dureeDays = `${Math.ceil(ms / 86400000)} jours`;
  }

  return (
    <div style={{ fontFamily: "Times New Roman, serif", fontSize: 11, color: "#111", background: "#fff", padding: "36px 40px", maxWidth: 794, lineHeight: 1.6 }}>
      {/* Titre */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1, color: ACCENT, textTransform: "uppercase" }}>
          Contrat de Prestation de Services
        </div>
        <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600 }}>N° {data.cpsNumber}</div>
      </div>

      {/* Parties */}
      <p style={{ marginBottom: 16 }}><strong>Entre les soussignés :</strong></p>

      <div style={{ background: "#faf5ff", border: `1px solid ${ACCENT}30`, borderRadius: 6, padding: "12px 16px", marginBottom: 12 }}>
        <strong>LE PRESTATAIRE :</strong>
        <div style={{ marginTop: 6 }}>
          <strong>{data.prestataireNom}</strong>
          {data.prestataireForme ? `, ${data.prestataireForme}` : ""}
          {data.prestataireRccm ? `, RCCM : ${data.prestataireRccm}` : ""}
          {data.prestataireNcc ? `, NCC : ${data.prestataireNcc}` : ""}
          <br />
          Adresse : {data.prestataireAdresse}
          <br />
          Tél : {data.prestataireTel}
          {data.prestataireEmail ? ` — Email : ${data.prestataireEmail}` : ""}
          {data.prestataireRepresentant ? (
            <>
              <br />
              Représenté par <strong>{data.prestataireRepresentant}</strong>
              {data.prestataireQualite ? `, ${data.prestataireQualite}` : ""}
            </>
          ) : null}
        </div>
        <div style={{ marginTop: 6, fontStyle: "italic", fontSize: 10, color: "#6b7280" }}>ci-après dénommé « le Prestataire »</div>
      </div>

      <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6, padding: "12px 16px", marginBottom: 20 }}>
        <strong>LE CLIENT :</strong>
        <div style={{ marginTop: 6 }}>
          <strong>{data.clientNom}</strong>
          {data.clientForme ? `, ${data.clientForme}` : ""}
          {data.clientRccm ? `, RCCM : ${data.clientRccm}` : ""}
          <br />
          Adresse : {data.clientAdresse}
          <br />
          Tél : {data.clientTel}
          {data.clientEmail ? ` — Email : ${data.clientEmail}` : ""}
          {data.clientRepresentant ? (
            <>
              <br />
              Représenté par <strong>{data.clientRepresentant}</strong>
              {data.clientQualite ? `, ${data.clientQualite}` : ""}
            </>
          ) : null}
        </div>
        <div style={{ marginTop: 6, fontStyle: "italic", fontSize: 10, color: "#6b7280" }}>ci-après dénommé « le Client »</div>
      </div>

      <p style={{ marginBottom: 20, fontWeight: 700 }}>IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :</p>

      {/* Articles */}
      {[
        {
          num: 1, title: "Objet",
          content: (
            <>
              <p>Le Prestataire s'engage à réaliser la prestation suivante pour le compte du Client :</p>
              <p style={{ marginTop: 8, fontWeight: 700 }}>{data.titrePrestation}</p>
              <p style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{data.descriptionPrestation}</p>
              {data.lieuExecution && <p style={{ marginTop: 6 }}>Lieu d'exécution : <strong>{data.lieuExecution}</strong></p>}
            </>
          )
        },
        {
          num: 2, title: "Durée",
          content: (
            <>
              <p>Le contrat prend effet le <strong>{formatDateFR(data.dateDebut)}</strong> et se termine le <strong>{formatDateFR(data.dateFin)}</strong>{dureeDays ? ` (soit ${dureeDays})` : ""}.</p>
              {data.renouvellement !== "Non" && <p style={{ marginTop: 6 }}>Renouvellement : {data.renouvellement}</p>}
            </>
          )
        },
        {
          num: 3, title: "Conditions financières",
          content: (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                <tbody>
                  <tr><td style={{ padding: "3px 6px", fontWeight: 700 }}>Montant HT :</td><td style={{ padding: "3px 6px" }}>{formatFCFA(data.montantHT)}</td></tr>
                  <tr style={{ background: "#f9fafb" }}><td style={{ padding: "3px 6px", fontWeight: 700 }}>TVA ({data.vatPct}%) :</td><td style={{ padding: "3px 6px" }}>{formatFCFA(vatAmount)}</td></tr>
                  <tr style={{ background: ACCENT, color: "#fff" }}>
                    <td style={{ padding: "5px 6px", fontWeight: 800 }}>Montant TTC :</td>
                    <td style={{ padding: "5px 6px", fontWeight: 800 }}>{formatFCFA(montantTTC)}</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ marginTop: 8 }}>Modalités de paiement : <strong>{data.modalitesPaiement}</strong></p>
              <p>Mode de paiement : <strong>{data.modePaiement}</strong></p>
              {data.penalites !== "Aucune" && <p>Pénalités de retard : <strong>{data.penalites}</strong></p>}
            </>
          )
        },
        {
          num: 4, title: "Obligations du Prestataire",
          content: <p style={{ whiteSpace: "pre-wrap" }}>{data.obligationsPrestataire}</p>
        },
        {
          num: 5, title: "Obligations du Client",
          content: <p style={{ whiteSpace: "pre-wrap" }}>{data.obligationsClient}</p>
        },
        ...(data.confidentialite ? [{
          num: 6, title: "Confidentialité",
          content: (
            <p>Les Parties s'engagent à maintenir strictement confidentielle toute information échangée dans le cadre du présent contrat, pendant toute sa durée et pendant <strong>{data.dureeConfidentialite}</strong> après son terme.</p>
          )
        }] : []),
        {
          num: data.confidentialite ? 7 : 6, title: "Résiliation",
          content: (
            <>
              <p>Le présent contrat peut être résilié par l'une ou l'autre des Parties avec un préavis de <strong>{data.preavisResiliation}</strong>.</p>
              {data.conditionsResiliation && <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{data.conditionsResiliation}</p>}
            </>
          )
        },
        {
          num: data.confidentialite ? 8 : 7, title: "Litiges",
          content: <p>Tout litige relatif à l'interprétation ou à l'exécution du présent contrat sera soumis à la compétence exclusive de <strong>{data.tribunal}</strong>.</p>
        },
        {
          num: data.confidentialite ? 9 : 8, title: "Dispositions générales",
          content: <p>Le présent contrat constitue l'intégralité de l'accord entre les Parties et annule tout accord verbal ou écrit antérieur portant sur le même objet. Toute modification doit faire l'objet d'un avenant signé par les deux Parties.</p>
        },
      ].map((art) => (
        <div key={art.num} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: ACCENT, marginBottom: 4, textTransform: "uppercase", fontSize: 11 }}>
            Article {art.num} — {art.title}
          </div>
          <div style={{ paddingLeft: 8 }}>{art.content}</div>
        </div>
      ))}

      {/* Signatures */}
      <div style={{ marginTop: 28, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
        <p style={{ marginBottom: 16, textAlign: "center" }}>
          Fait à <strong>{data.signaturePlace || "Abidjan"}</strong>, le <strong>{formatDateFR(data.signatureDate)}</strong>, en <strong>{data.exemplaires}</strong> exemplaires originaux.
        </p>
        <div style={{ display: "flex", gap: 32, justifyContent: "space-around" }}>
          <div style={{ textAlign: "center", minWidth: 200 }}>
            <div style={{ fontWeight: 800, textTransform: "uppercase" }}>Le Prestataire</div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{data.prestataireNom}</div>
            <div style={{ marginTop: 4, fontSize: 10, fontStyle: "italic" }}>Lu et approuvé</div>
            <div style={{ marginTop: 48, borderTop: "1px solid #374151", paddingTop: 4, fontSize: 10, color: "#6b7280" }}>Signature et cachet</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 200 }}>
            <div style={{ fontWeight: 800, textTransform: "uppercase" }}>Le Client</div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{data.clientNom}</div>
            <div style={{ marginTop: 4, fontSize: 10, fontStyle: "italic" }}>Lu et approuvé</div>
            <div style={{ marginTop: 48, borderTop: "1px solid #374151", paddingTop: 4, fontSize: 10, color: "#6b7280" }}>Signature et cachet</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, borderTop: "1px solid #e5e7eb", paddingTop: 10, textAlign: "center", fontSize: 9, color: "#9ca3af" }}>
        Document généré par DocuGest Ivoire — docugest-ivoire.vercel.app
      </div>
    </div>
  );
}
