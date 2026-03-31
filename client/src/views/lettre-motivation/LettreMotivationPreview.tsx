import { formatDateFR } from "../../utils/documentNumber";

export type LettreMotivationData = {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  recruteurNom: string;
  recruteurFonction: string;
  entrepriseNom: string;
  entrepriseAdresse: string;
  objet: string;
  lieuDate: string;
  accroche: string;
  paragrapheVous: string;
  paragrapheMoi: string;
  paragrapheNous: string;
  formule: string;
};

export default function LettreMotivationPreview({ data, logoDataUrl, accentColor }: { data: LettreMotivationData; logoDataUrl?: string | null; accentColor?: string | null }) {
  const accent = accentColor || "#1a6b4a";
  return (
    <div style={{ fontFamily: "Times New Roman, serif", fontSize: 12, color: "#111", background: "#fff", padding: "40px 52px", maxWidth: 794, lineHeight: 1.8 }}>

      {/* Logo si disponible */}
      {logoDataUrl && (
        <div style={{ marginBottom: 20 }}>
          <img src={logoDataUrl} alt="Logo" style={{ height: 44, maxWidth: 160, objectFit: "contain" }} />
        </div>
      )}

      {/* Expéditeur */}
      <div style={{ marginBottom: 28, borderLeft: `3px solid ${accent}`, paddingLeft: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{data.nom || "Votre Nom"}</div>
        {data.adresse && <div>{data.adresse}</div>}
        {data.telephone && <div>{data.telephone}</div>}
        {data.email && <div>{data.email}</div>}
      </div>

      {/* Destinataire */}
      {(data.recruteurNom || data.entrepriseNom) && (
        <div style={{ textAlign: "right", marginBottom: 24 }}>
          {data.recruteurNom && <div style={{ fontWeight: 700 }}>{data.recruteurNom}</div>}
          {data.recruteurFonction && <div>{data.recruteurFonction}</div>}
          {data.entrepriseNom && <div style={{ fontWeight: 600 }}>{data.entrepriseNom}</div>}
          {data.entrepriseAdresse && <div>{data.entrepriseAdresse}</div>}
        </div>
      )}

      {/* Lieu et date */}
      <div style={{ textAlign: "right", marginBottom: 20, fontStyle: "italic", color: "#374151" }}>
        {data.lieuDate || `Abidjan, le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
      </div>

      {/* Objet */}
      {data.objet && (
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontWeight: 700 }}>Objet : </span>
          <span style={{ fontWeight: 700 }}>{data.objet}</span>
        </div>
      )}

      {/* Corps */}
      {(data.recruteurNom || data.recruteurFonction) ? (
        <p style={{ marginBottom: 16 }}>Madame, Monsieur,</p>
      ) : (
        <p style={{ marginBottom: 16 }}>Madame, Monsieur,</p>
      )}

      {data.accroche && (
        <p style={{ marginBottom: 16, textAlign: "justify" }}>{data.accroche}</p>
      )}

      {data.paragrapheVous && (
        <p style={{ marginBottom: 16, textAlign: "justify" }}>{data.paragrapheVous}</p>
      )}

      {data.paragrapheMoi && (
        <p style={{ marginBottom: 16, textAlign: "justify" }}>{data.paragrapheMoi}</p>
      )}

      {data.paragrapheNous && (
        <p style={{ marginBottom: 20, textAlign: "justify" }}>{data.paragrapheNous}</p>
      )}

      {/* Formule de politesse */}
      {data.formule && (
        <p style={{ marginBottom: 32, textAlign: "justify" }}>{data.formule}</p>
      )}

      {/* Signature */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700 }}>{data.nom}</div>
      </div>

      <div style={{ marginTop: 32, borderTop: "1px solid #e5e7eb", paddingTop: 10, textAlign: "center", fontSize: 9, color: "#9ca3af" }}>
        Document généré sur DocuGestIvoire — docugest-ivoire.vercel.app
      </div>
    </div>
  );
}
