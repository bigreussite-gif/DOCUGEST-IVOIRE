import { formatFCFA } from "../../utils/formatters";
import { formatDateFR } from "../../utils/documentNumber";

export type ContratTravailData = {
  typeContrat: "CDD" | "CDI";
  conventionCollective: string;
  employeurRaisonSociale: string;
  employeurForme: string;
  employeurRccm: string;
  employeurNcc: string;
  employeurCnps: string;
  employeurAdresse: string;
  employeurTel: string;
  employeurRepresentant: string;
  employeurQualite: string;
  salariNom: string;
  salariDob: string;
  salariLieuNaissance: string;
  salariNationalite: string;
  salariCni: string;
  salariAdresse: string;
  salariTel: string;
  salariCnps: string;
  salariSituation: string;
  salariEnfants: number;
  poste: string;
  categorie: string;
  lieuTravail: string;
  tachesDescription: string;
  dateDebut: string;
  dateFin: string;
  motifCdd: string;
  renouvellement: string;
  periodeEssai: string;
  renouvEssai: boolean;
  salaireBase: number;
  sursalaire: number;
  primeTransport: number;
  primeLogement: number;
  primePanier: number;
  autresPrimes: string;
  modePaiement: string;
  periodicite: string;
  heuresHebdo: number;
  joursTravail: string[];
  horaires: string;
  congesAnnuels: number;
  clauseNonConcurrence: boolean;
  dureeNonConc: number;
  zoneNonConc: string;
  indemniteNonConc: number;
  clauseConfidentialite: boolean;
  clauseMobilite: boolean;
  zoneMobilite: string;
  clauseExclusivite: boolean;
  signatureDate: string;
  signaturePlace: string;
};

export default function ContratTravailPreview({ data, logoDataUrl, accentColor }: { data: ContratTravailData; logoDataUrl?: string | null; accentColor?: string | null }) {
  const ACCENT = accentColor || "#1e3a5f";
  const totalBrut = (data.salaireBase || 0) + (data.sursalaire || 0) + (data.primeTransport || 0) + (data.primeLogement || 0) + (data.primePanier || 0);

  const preavis = () => {
    const cat = data.categorie || "";
    if (data.typeContrat === "CDD") return "Fin du contrat à la date prévue (pas de préavis).";
    if (cat.includes("Ouvrier") || cat.includes("Employé")) return "1 mois";
    if (cat.includes("Maîtrise") || cat.includes("maîtrise")) return "2 mois";
    if (cat.includes("Cadre supérieur")) return "4 mois";
    if (cat.includes("Cadre")) return "3 mois";
    return "Selon la catégorie professionnelle";
  };

  return (
    <div style={{ fontFamily: "Times New Roman, serif", fontSize: 11, color: "#111", background: "#fff", padding: "32px 40px", maxWidth: 794, lineHeight: 1.7 }}>
      {logoDataUrl && (
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
          <img src={logoDataUrl} alt="Logo" style={{ height: 46, maxWidth: 140, objectFit: "contain" }} />
        </div>
      )}
      {/* Titre */}
      <div style={{ textAlign: "center", marginBottom: 28, borderBottom: `3px solid ${ACCENT}`, paddingBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: 1.5 }}>
          Contrat de Travail à Durée {data.typeContrat === "CDD" ? "Déterminée" : "Indéterminée"}
        </div>
        <div style={{ marginTop: 4, fontSize: 11, color: "#6b7280" }}>
          {data.typeContrat} — {data.conventionCollective || "Convention Interprofessionnelle CI"}
        </div>
      </div>

      <p style={{ marginBottom: 16 }}><strong>Entre les soussignés :</strong></p>

      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "12px 16px", marginBottom: 12 }}>
        <strong>L'EMPLOYEUR :</strong>
        <div style={{ marginTop: 6 }}>
          <strong>{data.employeurRaisonSociale}</strong>{data.employeurForme ? ` — ${data.employeurForme}` : ""}
          {data.employeurRccm && <span>, RCCM : {data.employeurRccm}</span>}
          {data.employeurCnps && <span>, N° CNPS : {data.employeurCnps}</span>}
          <br />
          Siège social : {data.employeurAdresse}<br />
          Tél : {data.employeurTel}<br />
          Représenté par <strong>{data.employeurRepresentant}</strong>{data.employeurQualite ? `, en qualité de ${data.employeurQualite}` : ""}
        </div>
        <div style={{ marginTop: 4, fontSize: 10, fontStyle: "italic", color: "#6b7280" }}>ci-après dénommé « l'Employeur »</div>
      </div>

      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "12px 16px", marginBottom: 20 }}>
        <strong>LE SALARIÉ :</strong>
        <div style={{ marginTop: 6 }}>
          <strong>{data.salariNom}</strong>, né(e) le {formatDateFR(data.salariDob)} à {data.salariLieuNaissance}<br />
          Nationalité : {data.salariNationalite || "Ivoirienne"}<br />
          N° CNI/Passeport : {data.salariCni}<br />
          Adresse : {data.salariAdresse} — Tél : {data.salariTel}<br />
          {data.salariCnps && <span>N° CNPS : {data.salariCnps}<br /></span>}
          Situation : {data.salariSituation} — {data.salariEnfants || 0} enfant(s) à charge
        </div>
        <div style={{ marginTop: 4, fontSize: 10, fontStyle: "italic", color: "#6b7280" }}>ci-après dénommé « le Salarié »</div>
      </div>

      <p style={{ marginBottom: 20, fontWeight: 700 }}>IL A ÉTÉ CONVENU CE QUI SUIT :</p>

      {[
        {
          num: 1, title: "Engagement et fonctions",
          body: `L'Employeur engage le Salarié au poste de ${data.poste}${data.categorie ? `, catégorie ${data.categorie}` : ""}. Les principales tâches et responsabilités sont les suivantes :\n${data.tachesDescription}`
        },
        {
          num: 2, title: "Lieu de travail",
          body: `Le lieu habituel de travail est fixé à : ${data.lieuTravail}.`
        },
        {
          num: 3, title: `Durée du contrat`,
          body: data.typeContrat === "CDD"
            ? `Le présent contrat est conclu pour une durée déterminée. Il prend effet le ${formatDateFR(data.dateDebut)} et prend fin le ${formatDateFR(data.dateFin)}.\nMotif : ${data.motifCdd || "—"}\nRenouvellement : ${data.renouvellement || "Non"}`
            : `Le présent contrat est conclu pour une durée indéterminée. Il prend effet le ${formatDateFR(data.dateDebut)}.`
        },
        {
          num: 4, title: "Période d'essai",
          body: `Le contrat est soumis à une période d'essai de ${data.periodeEssai}${data.renouvEssai ? ", renouvelable une fois" : ""}.`
        },
        {
          num: 5, title: "Rémunération",
          body: [
            `Salaire de base mensuel brut : ${formatFCFA(data.salaireBase)}`,
            data.sursalaire > 0 ? `Sursalaire : ${formatFCFA(data.sursalaire)}` : "",
            data.primeTransport > 0 ? `Prime de transport : ${formatFCFA(data.primeTransport)}` : "",
            data.primeLogement > 0 ? `Prime de logement : ${formatFCFA(data.primeLogement)}` : "",
            data.primePanier > 0 ? `Indemnité de panier/repas : ${formatFCFA(data.primePanier)}` : "",
            data.autresPrimes ? `Autres primes : ${data.autresPrimes}` : "",
            `\nTotal brut mensuel : ${formatFCFA(totalBrut)}`,
            `\nMode de paiement : ${data.modePaiement} — ${data.periodicite}`
          ].filter(Boolean).join("\n")
        },
        {
          num: 6, title: "Horaires de travail",
          body: `Durée hebdomadaire : ${data.heuresHebdo || 40} heures.\nJours travaillés : ${(data.joursTravail || []).join(", ") || "Lundi au Vendredi"}.\nHoraires : ${data.horaires || "À définir"}.`
        },
        {
          num: 7, title: "Congés payés",
          body: `Le Salarié bénéficie de ${data.congesAnnuels || 26} jours ouvrables de congés payés par an, conformément à la législation ivoirienne en vigueur.`
        },
        {
          num: 8, title: "Obligations du salarié",
          body: "Le Salarié s'engage à exécuter son travail avec soin et diligence, à respecter les règles internes de l'entreprise, à conserver la confidentialité des informations, et à se conformer aux directives de sa hiérarchie."
        },
        ...(data.clauseNonConcurrence || data.clauseConfidentialite || data.clauseMobilite || data.clauseExclusivite ? [{
          num: 9, title: "Clauses particulières",
          body: [
            data.clauseNonConcurrence ? `Non-concurrence : Le Salarié s'interdit, pendant ${data.dureeNonConc || 12} mois après la rupture, d'exercer une activité concurrente dans la zone géographique suivante : ${data.zoneNonConc}. En contrepartie, une indemnité de ${formatFCFA(data.indemniteNonConc)} sera versée.` : "",
            data.clauseConfidentialite ? "Confidentialité : Le Salarié s'engage à ne divulguer aucune information confidentielle de l'entreprise, pendant et après l'exécution du présent contrat." : "",
            data.clauseMobilite ? `Mobilité : Le Salarié accepte d'exercer ses fonctions dans toute la zone géographique suivante : ${data.zoneMobilite}.` : "",
            data.clauseExclusivite ? "Exclusivité : Le Salarié s'engage à consacrer l'intégralité de son activité professionnelle à l'Employeur pendant l'exécution du présent contrat." : "",
          ].filter(Boolean).join("\n\n")
        }] : []),
        {
          num: data.clauseNonConcurrence || data.clauseConfidentialite || data.clauseMobilite || data.clauseExclusivite ? 10 : 9,
          title: "Rupture du contrat et préavis",
          body: `Préavis applicable : ${preavis()}. Toute rupture du présent contrat sera régie par les dispositions du Code du Travail de la République de Côte d'Ivoire.`
        },
        {
          num: data.clauseNonConcurrence || data.clauseConfidentialite || data.clauseMobilite || data.clauseExclusivite ? 11 : 10,
          title: "Dispositions diverses",
          body: "Le présent contrat est régi par le Code du Travail de la République de Côte d'Ivoire (Loi n°2015-532 du 20 juillet 2015) et la Convention Collective Interprofessionnelle. Toute modification devra faire l'objet d'un avenant signé des deux parties."
        },
      ].map((art) => (
        <div key={art.num} style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: ACCENT, borderBottom: `1px solid ${ACCENT}30`, paddingBottom: 2, marginBottom: 6 }}>
            Article {art.num} — {art.title}
          </div>
          <div style={{ paddingLeft: 8, whiteSpace: "pre-line" }}>{art.body}</div>
        </div>
      ))}

      {/* Signatures */}
      <div style={{ marginTop: 28, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
        <p style={{ textAlign: "center", marginBottom: 16 }}>
          Fait à <strong>{data.signaturePlace || "Abidjan"}</strong>, le <strong>{formatDateFR(data.signatureDate)}</strong>, en deux (2) exemplaires originaux.
        </p>
        <p style={{ textAlign: "center", fontSize: 10, fontStyle: "italic", marginBottom: 20, color: "#6b7280" }}>
          (Faire précéder de la mention « Lu et approuvé, bon pour accord »)
        </p>
        <div style={{ display: "flex", gap: 32, justifyContent: "space-around" }}>
          <div style={{ textAlign: "center", minWidth: 200 }}>
            <div style={{ fontWeight: 800, textTransform: "uppercase" }}>L'Employeur</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>{data.employeurRepresentant}</div>
            <div style={{ marginTop: 4, fontSize: 10, fontStyle: "italic" }}>Lu et approuvé</div>
            <div style={{ marginTop: 48, borderTop: "1px solid #374151", paddingTop: 4, fontSize: 10, color: "#6b7280" }}>Signature et cachet</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 200 }}>
            <div style={{ fontWeight: 800, textTransform: "uppercase" }}>Le Salarié</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>{data.salariNom}</div>
            <div style={{ marginTop: 4, fontSize: 10, fontStyle: "italic" }}>Lu et approuvé</div>
            <div style={{ marginTop: 48, borderTop: "1px solid #374151", paddingTop: 4, fontSize: 10, color: "#6b7280" }}>Signature</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, borderTop: "1px solid #e5e7eb", paddingTop: 10, textAlign: "center", fontSize: 9, color: "#9ca3af" }}>
        Document généré par DocuGestIvoire — docugest-ivoire.vercel.app
      </div>
    </div>
  );
}
