import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { InlineAdStrip } from "../../components/promo/InlineAdStrip";
import { nextDocNumber, peekDocNumber, todayISO } from "../../utils/documentNumber";
import { useAutoSave, readDraft, writeDraftNow, clearDraft } from "../../hooks/useAutoSave";
import { DocumentEditorActionButtons } from "../../components/document/DocumentEditorActionButtons";
import { captureElementToPdfFile, PDF_OFFSCREEN_CAPTURE_STYLE } from "../../lib/html2canvasPdf";
import { useDocumentBranding } from "../../hooks/useDocumentBranding";
import BrandingPanel from "../../components/document/BrandingPanel";
import { generateContratObligations } from "../../utils/aiGenerate";
import ContratPrestationPreview from "./ContratPrestationPreview";

const DEFAULT_OBLIGATIONS_PRESTATAIRE = `Le Prestataire s'engage à :
- Exécuter la prestation avec professionnalisme et diligence
- Respecter les délais convenus
- Informer le Client de toute difficulté susceptible d'affecter l'exécution
- Remettre les livrables conformes aux spécifications convenues
- Maintenir la confidentialité des informations du Client`;

const DEFAULT_OBLIGATIONS_CLIENT = `Le Client s'engage à :
- Fournir au Prestataire toutes les informations nécessaires
- Régler les paiements aux échéances convenues
- Valider les livrables dans un délai de 7 jours ouvrés
- Désigner un interlocuteur unique pour le suivi`;

const DEFAULT_CONDITIONS_RESILIATION = `En cas de résiliation anticipée par le Client sans faute du Prestataire, le Client devra régler les prestations déjà réalisées ainsi qu'une indemnité de 20% du montant restant.`;

const schema = z.object({
  cpsNumber: z.string().min(1),
  signatureDate: z.string().min(1),
  signaturePlace: z.string().default("Abidjan"),
  exemplaires: z.number().default(2),
  prestataireNom: z.string().min(1, "Nom prestataire requis"),
  prestataireForme: z.string().default(""),
  prestataireRccm: z.string().default(""),
  prestataireNcc: z.string().default(""),
  prestataireAdresse: z.string().min(1, "Adresse requise"),
  prestataireTel: z.string().min(1, "Téléphone requis"),
  prestataireEmail: z.string().default(""),
  prestataireRepresentant: z.string().default(""),
  prestataireQualite: z.string().default(""),
  clientNom: z.string().min(1, "Nom client requis"),
  clientForme: z.string().default(""),
  clientRccm: z.string().default(""),
  clientAdresse: z.string().min(1, "Adresse client requise"),
  clientTel: z.string().min(1, "Téléphone client requis"),
  clientEmail: z.string().default(""),
  clientRepresentant: z.string().default(""),
  clientQualite: z.string().default(""),
  titrePrestation: z.string().min(1, "Titre de la prestation requis"),
  descriptionPrestation: z.string().min(10, "Description trop courte"),
  lieuExecution: z.string().default("Abidjan"),
  dateDebut: z.string().min(1),
  dateFin: z.string().min(1),
  renouvellement: z.string().default("Non"),
  montantHT: z.number().min(0),
  vatPct: z.number().default(18),
  modalitesPaiement: z.string().default("50% + 50%"),
  modePaiement: z.string().default("Virement"),
  penalites: z.string().default("1% par semaine"),
  obligationsPrestataire: z.string().default(DEFAULT_OBLIGATIONS_PRESTATAIRE),
  obligationsClient: z.string().default(DEFAULT_OBLIGATIONS_CLIENT),
  confidentialite: z.boolean().default(true),
  dureeConfidentialite: z.string().default("2 ans"),
  preavisResiliation: z.string().default("30 jours"),
  conditionsResiliation: z.string().default(DEFAULT_CONDITIONS_RESILIATION),
  tribunal: z.string().default("Tribunal de Commerce d'Abidjan"),
});

type Values = z.infer<typeof schema>;
const DRAFT_KEY = "contrat_prestation_draft";

const FORMES = ["Auto-entrepreneur", "Entreprise individuelle", "SARL", "SAS", "SA", "Association", "Particulier", "Autre"];

function cpsEmptyDefaults(): Values {
  const d = todayISO();
  return {
    cpsNumber: peekDocNumber("CPS"),
    signatureDate: d,
    signaturePlace: "Abidjan",
    exemplaires: 2,
    prestataireNom: "",
    prestataireForme: "",
    prestataireRccm: "",
    prestataireNcc: "",
    prestataireAdresse: "",
    prestataireTel: "",
    prestataireEmail: "",
    prestataireRepresentant: "",
    prestataireQualite: "",
    clientNom: "",
    clientForme: "",
    clientRccm: "",
    clientAdresse: "",
    clientTel: "",
    clientEmail: "",
    clientRepresentant: "",
    clientQualite: "",
    titrePrestation: "",
    descriptionPrestation: "Description détaillée de la prestation à compléter par les parties.",
    lieuExecution: "Abidjan",
    dateDebut: d,
    dateFin: d,
    renouvellement: "Non",
    montantHT: 0,
    vatPct: 18,
    modalitesPaiement: "50% + 50%",
    modePaiement: "Virement",
    penalites: "1% par semaine",
    obligationsPrestataire: DEFAULT_OBLIGATIONS_PRESTATAIRE,
    obligationsClient: DEFAULT_OBLIGATIONS_CLIENT,
    confidentialite: true,
    dureeConfidentialite: "2 ans",
    preavisResiliation: "30 jours",
    conditionsResiliation: DEFAULT_CONDITIONS_RESILIATION,
    tribunal: "Tribunal de Commerce d'Abidjan"
  };
}

export default function ContratPrestationEditor() {
  const navigate = useNavigate();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const draft = readDraft<Values>(DRAFT_KEY);

  const { register, watch, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: draft ?? cpsEmptyDefaults(),
  });

  const values = watch();
  useAutoSave(DRAFT_KEY, values);
  const { brand, uploadLogo, removeLogo, updateBrand } = useDocumentBranding();
  const [aiLoading, setAiLoading] = useState(false);

  function handleGenerateObligations() {
    setAiLoading(true);
    setTimeout(() => {
      const { obligationsPrestataire, obligationsClient } = generateContratObligations({
        titrePrestation: values.titrePrestation,
        descriptionPrestation: values.descriptionPrestation,
        lieuExecution: values.lieuExecution,
      });
      setValue("obligationsPrestataire", obligationsPrestataire);
      setValue("obligationsClient", obligationsClient);
      setAiLoading(false);
    }, 600);
  }

  const montantTTC = (Number(values.montantHT) || 0) * (1 + (Number(values.vatPct) || 0) / 100);

  async function downloadPDF() {
    const source = pdfRef.current ?? previewRef.current;
    if (!source) return;
    setPdfLoading(true);
    try {
      await captureElementToPdfFile(source, `${values.cpsNumber || "contrat-prestation"}.pdf`);
      nextDocNumber("CPS");
    } finally {
      setPdfLoading(false);
    }
  }

  const onSubmit = handleSubmit(() => void downloadPDF());

  function handleReset() {
    if (!confirm("Réinitialiser le contrat ? Le brouillon local sera effacé.")) return;
    clearDraft(DRAFT_KEY);
    reset(cpsEmptyDefaults());
  }

  return (
    <div className="min-h-screen bg-surface">
      <title>Contrat de Prestation de Services — DocuGestIvoire</title>

      <div className="sticky top-0 z-30 border-b border-border/60 bg-white/95 backdrop-blur-sm shadow-xs">
        <div className="space-y-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface ring-1 ring-border/70 text-slate-500 hover:bg-white transition active:scale-95">←</button>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text">Contrat de prestation</p>
                <p className="truncate text-xs text-slate-500">{values.cpsNumber}</p>
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
            <InlineAdStrip variant="compact" adSlot="contrat-prestation-editor-inline" />

            {/* Branding */}
            <BrandingPanel
              brand={brand}
              onUploadLogo={uploadLogo}
              onRemoveLogo={removeLogo}
              onColorChange={(hex) => updateBrand({ accentColor: hex })}
            />

            {/* En-tête */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Informations générales</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">N° Contrat</label>
                  <Input {...register("cpsNumber")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Date de signature</label>
                  <Input type="date" {...register("signatureDate")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Lieu de signature</label>
                  <Input {...register("signaturePlace")} placeholder="Abidjan" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Exemplaires</label>
                  <select {...register("exemplaires", { valueAsNumber: true })} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {[2, 3, 4].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Prestataire */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Le Prestataire</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Raison sociale / Nom *</label>
                  <Input {...register("prestataireNom")} />
                  {errors.prestataireNom && <p className="mt-1 text-xs text-red-500">{errors.prestataireNom.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Forme juridique</label>
                    <select {...register("prestataireForme")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      <option value="">—</option>
                      {FORMES.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">RCCM</label>
                    <Input {...register("prestataireRccm")} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse *</label>
                  <Input {...register("prestataireAdresse")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone *</label>
                    <Input {...register("prestataireTel")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                    <Input {...register("prestataireEmail")} type="email" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Représenté par</label>
                    <Input {...register("prestataireRepresentant")} placeholder="Nom du gérant" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Qualité</label>
                    <Input {...register("prestataireQualite")} placeholder="Gérant, DG…" />
                  </div>
                </div>
              </div>
            </div>

            {/* Client */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Le Client</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Raison sociale / Nom *</label>
                  <Input {...register("clientNom")} />
                  {errors.clientNom && <p className="mt-1 text-xs text-red-500">{errors.clientNom.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Forme juridique</label>
                    <select {...register("clientForme")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      <option value="">—</option>
                      {FORMES.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">RCCM</label>
                    <Input {...register("clientRccm")} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse *</label>
                  <Input {...register("clientAdresse")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone *</label>
                    <Input {...register("clientTel")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                    <Input {...register("clientEmail")} type="email" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Représenté par</label>
                    <Input {...register("clientRepresentant")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Qualité</label>
                    <Input {...register("clientQualite")} placeholder="DG, Directeur…" />
                  </div>
                </div>
              </div>
            </div>

            {/* Objet */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Objet du contrat</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Titre de la prestation *</label>
                  <Input {...register("titrePrestation")} placeholder="Développement d'un site web e-commerce" />
                  {errors.titrePrestation && <p className="mt-1 text-xs text-red-500">{errors.titrePrestation.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Description détaillée *</label>
                  <Textarea {...register("descriptionPrestation")} rows={5} placeholder="Décrivez précisément la prestation, les livrables attendus, les modalités d'exécution…" />
                  {errors.descriptionPrestation && <p className="mt-1 text-xs text-red-500">{errors.descriptionPrestation.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Lieu d'exécution</label>
                  <Input {...register("lieuExecution")} placeholder="Abidjan / À distance / Locaux du client" />
                </div>
              </div>
            </div>

            {/* Durée */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Durée</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Date de début *</label>
                  <Input type="date" {...register("dateDebut")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Date de fin *</label>
                  <Input type="date" {...register("dateFin")} />
                </div>
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold text-slate-700">Renouvellement</label>
                <select {...register("renouvellement")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                  {["Non", "Oui, tacite reconduction", "Oui, sur accord écrit"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Finances */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Conditions financières</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Montant HT (FCFA)</label>
                    <Input type="number" min={0} {...register("montantHT", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">TVA (%)</label>
                    <select {...register("vatPct", { valueAsNumber: true })} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      {[0, 9, 18].map((v) => <option key={v} value={v}>{v}%</option>)}
                    </select>
                  </div>
                </div>
                {montantTTC > 0 && (
                  <div className="rounded-xl bg-violet-50 px-3 py-2 text-sm font-bold text-violet-900">
                    Montant TTC : {new Intl.NumberFormat("fr-FR").format(Math.round(montantTTC))} FCFA
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Modalités de paiement</label>
                    <select {...register("modalitesPaiement")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      {["100% à la signature", "100% à la livraison", "50% + 50%", "30% + 40% + 30%", "Mensuel", "Personnalisé"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Mode de paiement</label>
                    <select {...register("modePaiement")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      {["Virement", "Mobile Money", "Espèces", "Chèque"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Pénalités de retard</label>
                  <select {...register("penalites")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Aucune", "1% par semaine", "2% par mois", "Personnalisé"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Obligations */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Obligations des parties</h3>
                <button
                  type="button"
                  onClick={handleGenerateObligations}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-violet-600 hover:to-purple-700 disabled:opacity-60"
                >
                  {aiLoading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <span>✨</span>}
                  {aiLoading ? "Génération…" : "Générer avec l'IA"}
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Obligations du Prestataire</label>
                  <Textarea {...register("obligationsPrestataire")} rows={6} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Obligations du Client</label>
                  <Textarea {...register("obligationsClient")} rows={5} />
                </div>
              </div>
            </div>

            {/* Clauses */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Clauses & Résiliation</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="conf" {...register("confidentialite")} className="h-4 w-4 rounded border-border" />
                  <label htmlFor="conf" className="text-sm font-semibold text-slate-700">Clause de confidentialité</label>
                </div>
                {values.confidentialite && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Durée après fin du contrat</label>
                    <select {...register("dureeConfidentialite")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      {["1 an", "2 ans", "3 ans", "5 ans"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Préavis de résiliation</label>
                  <select {...register("preavisResiliation")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["15 jours", "30 jours", "60 jours"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Conditions de résiliation anticipée</label>
                  <Textarea {...register("conditionsResiliation")} rows={3} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Tribunal compétent</label>
                  <select {...register("tribunal")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Tribunal de Commerce d'Abidjan", "Tribunal de Première Instance d'Abidjan", "Autre"].map((v) => <option key={v}>{v}</option>)}
                  </select>
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
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Aperçu du document</p>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-border/60 bg-white shadow-card">
              <div ref={previewRef} className="bg-white">
                <ContratPrestationPreview
                  data={values as import("./ContratPrestationPreview").ContratPrestationData}
                  logoDataUrl={brand.logoDataUrl}
                  accentColor={brand.accentColor}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref={pdfRef} className="print:hidden" style={PDF_OFFSCREEN_CAPTURE_STYLE} aria-hidden>
        <ContratPrestationPreview
          data={values as import("./ContratPrestationPreview").ContratPrestationData}
          logoDataUrl={brand.logoDataUrl}
          accentColor={brand.accentColor}
        />
      </div>
    </div>
  );
}
