import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { InlineAdStrip } from "../../components/promo/InlineAdStrip";
import { useDocumentBranding } from "../../hooks/useDocumentBranding";
import BrandingPanel from "../../components/document/BrandingPanel";
import { todayISO } from "../../utils/documentNumber";
import { useAutoSave, readDraft, writeDraftNow, clearDraft } from "../../hooks/useAutoSave";
import { DocumentEditorActionButtons } from "../../components/document/DocumentEditorActionButtons";
import { captureElementToPdfFile, PDF_OFFSCREEN_CAPTURE_STYLE } from "../../lib/html2canvasPdf";
import ContratTravailPreview from "./ContratTravailPreview";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const schema = z.object({
  typeContrat: z.enum(["CDD", "CDI"]).default("CDI"),
  conventionCollective: z.string().default("Convention Interprofessionnelle de 1977"),
  employeurRaisonSociale: z.string().min(1, "Raison sociale requise"),
  employeurForme: z.string().default(""),
  employeurRccm: z.string().default(""),
  employeurNcc: z.string().default(""),
  employeurCnps: z.string().default(""),
  employeurAdresse: z.string().min(1, "Adresse requise"),
  employeurTel: z.string().min(1, "Téléphone requis"),
  employeurRepresentant: z.string().min(1, "Représentant requis"),
  employeurQualite: z.string().default("Gérant"),
  salariNom: z.string().min(1, "Nom salarié requis"),
  salariDob: z.string().min(1, "Date de naissance requise"),
  salariLieuNaissance: z.string().min(1, "Lieu de naissance requis"),
  salariNationalite: z.string().default("Ivoirienne"),
  salariCni: z.string().min(1, "N° CNI requis"),
  salariAdresse: z.string().min(1, "Adresse salarié requise"),
  salariTel: z.string().min(1, "Téléphone salarié requis"),
  salariCnps: z.string().default(""),
  salariSituation: z.string().default("Célibataire"),
  salariEnfants: z.number().default(0),
  poste: z.string().min(1, "Poste requis"),
  categorie: z.string().default("Ouvrier / Employé"),
  lieuTravail: z.string().min(1, "Lieu de travail requis"),
  tachesDescription: z.string().min(10, "Description requise"),
  dateDebut: z.string().min(1, "Date de début requise"),
  dateFin: z.string().default(""),
  motifCdd: z.string().default(""),
  renouvellement: z.string().default("Non"),
  periodeEssai: z.string().default("1 mois"),
  renouvEssai: z.boolean().default(false),
  salaireBase: z.number().min(0),
  sursalaire: z.number().default(0),
  primeTransport: z.number().default(0),
  primeLogement: z.number().default(0),
  primePanier: z.number().default(0),
  autresPrimes: z.string().default(""),
  modePaiement: z.string().default("Virement bancaire"),
  periodicite: z.string().default("Mensuel"),
  heuresHebdo: z.number().default(40),
  joursTravail: z.array(z.string()).default(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]),
  horaires: z.string().default("08h00 - 12h00 / 14h00 - 18h00"),
  congesAnnuels: z.number().default(26),
  clauseNonConcurrence: z.boolean().default(false),
  dureeNonConc: z.number().default(12),
  zoneNonConc: z.string().default(""),
  indemniteNonConc: z.number().default(0),
  clauseConfidentialite: z.boolean().default(false),
  clauseMobilite: z.boolean().default(false),
  zoneMobilite: z.string().default(""),
  clauseExclusivite: z.boolean().default(false),
  signatureDate: z.string().default(todayISO()),
  signaturePlace: z.string().default("Abidjan"),
});

type Values = z.infer<typeof schema>;
const DRAFT_KEY = "contrat_travail_draft";

const FORMES = ["SARL", "SAS", "SA", "Entreprise individuelle", "Association", "ONG", "Autre"];
const CATEGORIES = ["Manœuvre ordinaire", "Manœuvre spécialisé", "Ouvrier / Employé", "Agent de maîtrise", "Cadre", "Cadre supérieur"];
const PERIODES_ESSAI: Record<string, string> = {
  "Ouvrier / Employé": "1 mois",
  "Agent de maîtrise": "2 mois",
  "Cadre": "3 mois",
  "Cadre supérieur": "4 mois",
};

function contratTravailEmptyDefaults(): Values {
  return {
    typeContrat: "CDI",
    conventionCollective: "Convention Interprofessionnelle de 1977",
    employeurRaisonSociale: "",
    employeurForme: "",
    employeurRccm: "",
    employeurNcc: "",
    employeurCnps: "",
    employeurAdresse: "",
    employeurTel: "",
    employeurRepresentant: "",
    employeurQualite: "Gérant",
    salariNom: "",
    salariDob: "",
    salariLieuNaissance: "",
    salariNationalite: "Ivoirienne",
    salariCni: "",
    salariAdresse: "",
    salariTel: "",
    salariCnps: "",
    salariSituation: "Célibataire",
    salariEnfants: 0,
    poste: "",
    categorie: "Ouvrier / Employé",
    lieuTravail: "",
    tachesDescription: "Description des missions et tâches à compléter.",
    dateDebut: todayISO(),
    dateFin: "",
    motifCdd: "",
    renouvellement: "Non",
    periodeEssai: "1 mois",
    renouvEssai: false,
    salaireBase: 0,
    sursalaire: 0,
    primeTransport: 0,
    primeLogement: 0,
    primePanier: 0,
    autresPrimes: "",
    modePaiement: "Virement bancaire",
    periodicite: "Mensuel",
    heuresHebdo: 40,
    joursTravail: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
    horaires: "08h00 - 12h00 / 14h00 - 18h00",
    congesAnnuels: 26,
    clauseNonConcurrence: false,
    dureeNonConc: 12,
    zoneNonConc: "",
    indemniteNonConc: 0,
    clauseConfidentialite: false,
    clauseMobilite: false,
    zoneMobilite: "",
    clauseExclusivite: false,
    signatureDate: todayISO(),
    signaturePlace: "Abidjan"
  };
}

export default function ContratTravailEditor() {
  const navigate = useNavigate();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const draft = readDraft<Values>(DRAFT_KEY);

  const { register, watch, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: draft ?? contratTravailEmptyDefaults(),
  });

  const values = watch();
  useAutoSave(DRAFT_KEY, values);
  const { brand, uploadLogo, removeLogo, updateBrand } = useDocumentBranding();

  const selectClass = "w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
  const totalBrut = (Number(values.salaireBase) || 0) + (Number(values.sursalaire) || 0) + (Number(values.primeTransport) || 0) + (Number(values.primeLogement) || 0) + (Number(values.primePanier) || 0);

  function toggleJour(jour: string) {
    const current = values.joursTravail ?? [];
    if (current.includes(jour)) {
      setValue("joursTravail", current.filter((j) => j !== jour));
    } else {
      setValue("joursTravail", [...current, jour]);
    }
  }

  async function downloadPDF() {
    const source = pdfRef.current ?? previewRef.current;
    if (!source) return;
    setPdfLoading(true);
    try {
      await captureElementToPdfFile(
        source,
        `Contrat-${values.typeContrat}-${values.salariNom.replace(/\s+/g, "-") || "contrat"}.pdf`
      );
    } finally {
      setPdfLoading(false);
    }
  }

  const onSubmit = handleSubmit(() => void downloadPDF());

  function handleReset() {
    if (!confirm("Réinitialiser le contrat ? Le brouillon local sera effacé.")) return;
    clearDraft(DRAFT_KEY);
    reset(contratTravailEmptyDefaults());
  }

  return (
    <div className="min-h-screen bg-surface">
      <title>Contrat de Travail CDD/CDI Gratuit — DocuGestIvoire</title>

      <div className="sticky top-0 z-30 border-b border-border/60 bg-white/95 backdrop-blur-sm shadow-xs">
        <div className="space-y-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface ring-1 ring-border/70 text-slate-500 hover:bg-white transition active:scale-95">←</button>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text">Contrat de travail</p>
                <p className="truncate text-xs text-slate-500">{values.typeContrat} — {values.salariNom || "Nouveau contrat"}</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowPreview(!showPreview)} className="shrink-0 rounded-xl border border-border/70 bg-surface px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white transition lg:hidden">
              {showPreview ? "Formulaire" : "Aperçu"}
            </button>
          </div>
          <DocumentEditorActionButtons
            variant="compact"
            onSave={() => {
              writeDraftNow(DRAFT_KEY, getValues());
            }}
            onDownload={() => void downloadPDF()}
            onPrint={() => window.print()}
            onReset={handleReset}
            downloading={pdfLoading}
            saveLabel="Enregistrer le brouillon"
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:py-6">
        <div className={showPreview ? "hidden lg:block" : ""}>
          <form className="space-y-5" onSubmit={onSubmit}>
            <InlineAdStrip variant="compact" adSlot="contrat-travail-editor-inline" />
            <BrandingPanel brand={brand} onUploadLogo={uploadLogo} onRemoveLogo={removeLogo} onColorChange={(hex) => updateBrand({ accentColor: hex })} />

            {/* Type contrat */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Type de contrat</h3>
              <div className="flex gap-3">
                {(["CDD", "CDI"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue("typeContrat", t)}
                    className={`flex-1 rounded-xl border-2 py-3 text-center font-bold transition ${values.typeContrat === t ? "border-primary bg-primary/5 text-primary" : "border-border/60 text-slate-600 hover:border-primary/40"}`}
                  >
                    {t === "CDD" ? "CDD — Durée Déterminée" : "CDI — Durée Indéterminée"}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold text-slate-700">Convention collective</label>
                <select {...register("conventionCollective")} className={selectClass}>
                  {["Convention Interprofessionnelle de 1977", "Aucune", "Autre"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Employeur */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">L'Employeur</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Raison sociale *</label>
                  <Input {...register("employeurRaisonSociale")} />
                  {errors.employeurRaisonSociale && <p className="mt-1 text-xs text-red-500">{errors.employeurRaisonSociale.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Forme juridique</label>
                    <select {...register("employeurForme")} className={selectClass}>
                      <option value="">—</option>
                      {FORMES.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">RCCM</label>
                    <Input {...register("employeurRccm")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">N° CNPS employeur</label>
                    <Input {...register("employeurCnps")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone *</label>
                    <Input {...register("employeurTel")} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse du siège *</label>
                  <Input {...register("employeurAdresse")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Représenté par *</label>
                    <Input {...register("employeurRepresentant")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Qualité</label>
                    <Input {...register("employeurQualite")} placeholder="Gérant, DG…" />
                  </div>
                </div>
              </div>
            </div>

            {/* Salarié */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Le Salarié</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nom et prénoms *</label>
                  <Input {...register("salariNom")} />
                  {errors.salariNom && <p className="mt-1 text-xs text-red-500">{errors.salariNom.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Date de naissance *</label>
                    <Input type="date" {...register("salariDob")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Lieu de naissance *</label>
                    <Input {...register("salariLieuNaissance")} placeholder="Abidjan" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Nationalité</label>
                    <Input {...register("salariNationalite")} defaultValue="Ivoirienne" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">N° CNI ou Passeport *</label>
                    <Input {...register("salariCni")} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse *</label>
                  <Input {...register("salariAdresse")} placeholder="Yopougon, Abidjan" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone *</label>
                    <Input {...register("salariTel")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">N° CNPS salarié</label>
                    <Input {...register("salariCnps")} placeholder="En cours si nouveau" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Situation matrimoniale</label>
                    <select {...register("salariSituation")} className={selectClass}>
                      {["Célibataire", "Marié(e)", "Veuf(ve)", "Divorcé(e)"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Enfants à charge</label>
                    <Input type="number" min={0} {...register("salariEnfants", { valueAsNumber: true })} />
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions d'emploi */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Conditions d'emploi</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Poste / Fonction *</label>
                    <Input {...register("poste")} placeholder="Commercial terrain" />
                    {errors.poste && <p className="mt-1 text-xs text-red-500">{errors.poste.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Catégorie</label>
                    <select {...register("categorie")} onChange={(e) => {
                      const cat = e.target.value;
                      setValue("categorie", cat);
                      if (PERIODES_ESSAI[cat]) setValue("periodeEssai", PERIODES_ESSAI[cat]);
                    }} className={selectClass}>
                      {CATEGORIES.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Lieu de travail *</label>
                  <Input {...register("lieuTravail")} placeholder="Zone industrielle de Yopougon, Abidjan" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Description des tâches *</label>
                  <Textarea {...register("tachesDescription")} rows={4} placeholder="Décrivez les tâches principales du salarié…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Date de prise de fonction *</label>
                    <Input type="date" {...register("dateDebut")} />
                  </div>
                  {values.typeContrat === "CDD" && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">Date de fin du CDD *</label>
                      <Input type="date" {...register("dateFin")} />
                    </div>
                  )}
                </div>
                {values.typeContrat === "CDD" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">Motif du CDD</label>
                      <select {...register("motifCdd")} className={selectClass}>
                        {["Remplacement salarié absent", "Accroissement d'activité", "Travail saisonnier", "Contrat de projet", "Autre"].map((v) => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">Renouvellement</label>
                      <select {...register("renouvellement")} className={selectClass}>
                        {["Non", "Oui"].map((v) => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Période d'essai */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Période d'essai</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Durée</label>
                  <select {...register("periodeEssai")} className={selectClass}>
                    {["1 mois", "2 mois", "3 mois", "4 mois", "Personnalisé"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="renouvEssai" {...register("renouvEssai")} className="h-4 w-4 rounded border-border" />
                  <label htmlFor="renouvEssai" className="text-sm text-slate-700">Renouvelable</label>
                </div>
              </div>
            </div>

            {/* Rémunération */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Rémunération</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Salaire de base brut (FCFA) *</label>
                  <Input type="number" min={0} {...register("salaireBase", { valueAsNumber: true })} />
                  {errors.salaireBase && <p className="mt-1 text-xs text-red-500">Salaire requis</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Sursalaire (FCFA)", "sursalaire"],
                    ["Prime de transport (FCFA)", "primeTransport"],
                    ["Prime de logement (FCFA)", "primeLogement"],
                    ["Indemnité panier/repas (FCFA)", "primePanier"],
                  ].map(([label, field]) => (
                    <div key={field}>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">{label}</label>
                      <Input type="number" min={0} {...register(field as keyof Values, { valueAsNumber: true })} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Autres primes</label>
                  <Input {...register("autresPrimes")} placeholder="Prime de rendement : 50 000 FCFA/mois" />
                </div>
                {totalBrut > 0 && (
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                    Total brut mensuel : {new Intl.NumberFormat("fr-FR").format(totalBrut)} FCFA
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Mode de paiement</label>
                    <select {...register("modePaiement")} className={selectClass}>
                      {["Virement bancaire", "Mobile Money", "Espèces"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Périodicité</label>
                    <select {...register("periodicite")} className={selectClass}>
                      {["Mensuel", "Bimensuel"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Horaires de travail</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Durée hebdomadaire (heures)</label>
                  <Input type="number" {...register("heuresHebdo", { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">Jours de travail</label>
                  <div className="flex flex-wrap gap-2">
                    {JOURS.map((j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => toggleJour(j)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${(values.joursTravail || []).includes(j) ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-slate-600 hover:border-primary/30"}`}
                      >
                        {j}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Horaires</label>
                  <Input {...register("horaires")} placeholder="08h00 - 12h00 / 14h00 - 18h00" />
                </div>
              </div>
            </div>

            {/* Clauses */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Clauses particulières</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="clauseConf" {...register("clauseConfidentialite")} className="h-4 w-4 rounded border-border" />
                  <label htmlFor="clauseConf" className="text-sm font-medium text-slate-700">Clause de confidentialité</label>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="clauseNC" {...register("clauseNonConcurrence")} className="h-4 w-4 rounded border-border" />
                    <label htmlFor="clauseNC" className="text-sm font-medium text-slate-700">Clause de non-concurrence</label>
                  </div>
                  {values.clauseNonConcurrence && (
                    <div className="mt-2 grid grid-cols-2 gap-2 pl-6">
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Durée (mois)</label>
                        <Input type="number" min={1} {...register("dureeNonConc", { valueAsNumber: true })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Indemnité (FCFA)</label>
                        <Input type="number" min={0} {...register("indemniteNonConc", { valueAsNumber: true })} />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs text-slate-500">Zone géographique</label>
                        <Input {...register("zoneNonConc")} placeholder="Abidjan et environs" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="clauseMob" {...register("clauseMobilite")} className="h-4 w-4 rounded border-border" />
                    <label htmlFor="clauseMob" className="text-sm font-medium text-slate-700">Clause de mobilité</label>
                  </div>
                  {values.clauseMobilite && (
                    <div className="mt-2 pl-6">
                      <Input {...register("zoneMobilite")} placeholder="Toute la Côte d'Ivoire" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="clauseExcl" {...register("clauseExclusivite")} className="h-4 w-4 rounded border-border" />
                  <label htmlFor="clauseExcl" className="text-sm font-medium text-slate-700">Clause d'exclusivité</label>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Signature</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Lieu de signature</label>
                  <Input {...register("signaturePlace")} placeholder="Abidjan" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Date de signature</label>
                  <Input type="date" {...register("signatureDate")} />
                </div>
              </div>
            </div>

            <DocumentEditorActionButtons
              onSave={() => {
                writeDraftNow(DRAFT_KEY, getValues());
              }}
              onDownload={() => void downloadPDF()}
              onPrint={() => window.print()}
              onReset={handleReset}
              downloading={pdfLoading}
              saveLabel="Enregistrer le brouillon"
            />
          </form>
        </div>

        <div className={`${showPreview ? "" : "hidden"} lg:block`}>
          <div className="sticky top-[73px]">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Aperçu du contrat</p>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-border/60 bg-white shadow-card">
              <div ref={previewRef} className="bg-white">
                <ContratTravailPreview data={values as import("./ContratTravailPreview").ContratTravailData} logoDataUrl={brand.logoDataUrl} accentColor={brand.accentColor} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref={pdfRef} className="print:hidden" style={PDF_OFFSCREEN_CAPTURE_STYLE} aria-hidden>
        <ContratTravailPreview data={values as import("./ContratTravailPreview").ContratTravailData} logoDataUrl={brand.logoDataUrl} accentColor={brand.accentColor} />
      </div>
    </div>
  );
}
