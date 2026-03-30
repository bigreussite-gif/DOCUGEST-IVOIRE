import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { InlineAdStrip } from "../../components/promo/InlineAdStrip";
import { useAutoSave, readDraft } from "../../hooks/useAutoSave";
import LettreMotivationPreview from "./LettreMotivationPreview";

const FORMULES = [
  "Dans l'attente de votre retour favorable, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
  "Je reste à votre disposition pour un entretien à votre convenance et vous prie de croire, Madame, Monsieur, à l'assurance de ma considération distinguée.",
  "En espérant que ma candidature retiendra votre attention, veuillez agréer, Madame, Monsieur, mes respectueuses salutations.",
];

const schema = z.object({
  nom: z.string().min(1, "Nom requis"),
  adresse: z.string().min(1, "Adresse requise"),
  telephone: z.string().min(1, "Téléphone requis"),
  email: z.string().min(1, "Email requis"),
  recruteurNom: z.string().default(""),
  recruteurFonction: z.string().default(""),
  entrepriseNom: z.string().min(1, "Entreprise requise"),
  entrepriseAdresse: z.string().min(1, "Adresse entreprise requise"),
  objet: z.string().min(1, "Objet requis"),
  typeCandidat: z.string().default("Réponse à une offre"),
  refOffre: z.string().default(""),
  sourceOffre: z.string().default("Site web entreprise"),
  lieuDate: z.string().default(""),
  accroche: z.string().min(10, "Accroche trop courte"),
  paragrapheVous: z.string().min(10),
  paragrapheMoi: z.string().min(10),
  paragrapheNous: z.string().min(10),
  formule: z.string().min(1, "Formule requise"),
  formulePerso: z.string().default(""),
});

type Values = z.infer<typeof schema>;
const DRAFT_KEY = "lettre_motivation_draft";

function today() {
  return `Abidjan, le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
}

export default function LettreMotivationEditor() {
  const navigate = useNavigate();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formuleMode, setFormuleMode] = useState<"preset" | "perso">("preset");
  const previewRef = useRef<HTMLDivElement>(null);
  const draft = readDraft<Values>(DRAFT_KEY);

  const { register, watch, handleSubmit, setValue, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: draft ?? {
      lieuDate: today(),
      typeCandidat: "Réponse à une offre",
      formule: FORMULES[0],
    },
  });

  const values = watch();
  useAutoSave(DRAFT_KEY, values);

  async function downloadPDF() {
    if (!previewRef.current) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const imgH = (canvas.height * pageW) / canvas.width;
      if (imgH <= 297) {
        pdf.addImage(imgData, "JPEG", 0, 0, pageW, imgH);
      } else {
        let y = 0;
        let remaining = imgH;
        while (remaining > 0) {
          pdf.addImage(imgData, "JPEG", 0, -y, pageW, imgH);
          remaining -= 297;
          y += 297;
          if (remaining > 0) pdf.addPage();
        }
      }
      pdf.save(`Lettre-motivation-${values.nom.replace(/\s+/g, "-") || "lettre"}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  const onSubmit = handleSubmit(() => downloadPDF());

  const HELP_TEXTS = {
    accroche: "💡 Montrez votre enthousiasme. Ex: «Ce qui m'attire chez [Entreprise], c'est votre engagement dans...»",
    paragrapheVous: "💡 Montrez que vous connaissez l'entreprise. Ex: «Votre réputation dans le secteur [domaine]...»",
    paragrapheMoi: "💡 Mettez en avant 2-3 compétences clés. Ex: «Fort de 3 ans d'expérience en...»",
    paragrapheNous: "💡 Projetez-vous dans le poste. Ex: «Je souhaite mettre mes compétences au service de...»",
  };

  return (
    <div className="min-h-screen bg-surface">
      <title>Lettre de Motivation Gratuite — DocuGest Ivoire</title>

      <div className="sticky top-0 z-30 border-b border-border/60 bg-white/95 px-4 py-3 backdrop-blur-sm shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-border/70 text-slate-500 hover:bg-white transition active:scale-95">←</button>
            <div>
              <p className="text-sm font-bold text-text">Lettre de motivation</p>
              <p className="text-xs text-slate-500">{values.objet || "Nouvelle lettre"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowPreview(!showPreview)} className="rounded-xl border border-border/70 bg-surface px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white transition lg:hidden">
              {showPreview ? "Formulaire" : "Aperçu"}
            </button>
            <Button variant="primary" loading={pdfLoading} onClick={onSubmit} className="h-9 px-4 text-sm">
              Télécharger PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:py-6">
        <div className={showPreview ? "hidden lg:block" : ""}>
          <form className="space-y-5" onSubmit={onSubmit}>
            <InlineAdStrip variant="compact" />

            {/* Vos coordonnées */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Vos coordonnées</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nom complet *</label>
                  <Input {...register("nom")} placeholder="KOUASSI Jean-Baptiste" />
                  {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse *</label>
                  <Input {...register("adresse")} placeholder="Cocody, Abidjan, Côte d'Ivoire" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone *</label>
                    <Input {...register("telephone")} placeholder="+225 07 XX XX XX XX" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Email *</label>
                    <Input {...register("email")} type="email" />
                  </div>
                </div>
              </div>
            </div>

            {/* Destinataire */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Destinataire</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Nom du recruteur</label>
                    <Input {...register("recruteurNom")} placeholder="M. KOUAME Yao" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Fonction</label>
                    <Input {...register("recruteurFonction")} placeholder="Directeur RH" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nom de l'entreprise *</label>
                  <Input {...register("entrepriseNom")} />
                  {errors.entrepriseNom && <p className="mt-1 text-xs text-red-500">{errors.entrepriseNom.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse de l'entreprise *</label>
                  <Input {...register("entrepriseAdresse")} />
                </div>
              </div>
            </div>

            {/* Contexte */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Contexte</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Objet *</label>
                  <Input {...register("objet")} placeholder="Candidature au poste de Chargé de Communication" />
                  {errors.objet && <p className="mt-1 text-xs text-red-500">{errors.objet.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Type de candidature</label>
                    <select {...register("typeCandidat")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      {["Réponse à une offre", "Candidature spontanée", "Recommandation", "Suite à un stage"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Réf. de l'offre</label>
                    <Input {...register("refOffre")} placeholder="RH-2026-045" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Lieu et date</label>
                  <Input {...register("lieuDate")} />
                </div>
              </div>
            </div>

            {/* Corps de la lettre */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Corps de la lettre</h3>
              <div className="space-y-4">
                {(["accroche", "paragrapheVous", "paragrapheMoi", "paragrapheNous"] as const).map((field) => {
                  const labels: Record<string, string> = {
                    accroche: "Accroche (pourquoi cette entreprise ?)",
                    paragrapheVous: "Paragraphe « Vous » (ce que vous savez d'eux)",
                    paragrapheMoi: "Paragraphe « Moi » (vos compétences)",
                    paragrapheNous: "Paragraphe « Nous » (ce que vous apportez ensemble)",
                  };
                  return (
                    <div key={field}>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">{labels[field]} *</label>
                      <p className="mb-1.5 text-[10px] text-slate-400 italic">{HELP_TEXTS[field]}</p>
                      <Textarea {...register(field)} rows={4} />
                      {errors[field] && <p className="mt-1 text-xs text-red-500">Paragraphe trop court.</p>}
                    </div>
                  );
                })}

                {/* Formule */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">Formule de politesse *</label>
                  <div className="mb-2 flex gap-2">
                    <button type="button" onClick={() => setFormuleMode("preset")} className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${formuleMode === "preset" ? "bg-primary text-white" : "border border-border/70 bg-surface text-slate-600 hover:bg-white"}`}>Choisir</button>
                    <button type="button" onClick={() => setFormuleMode("perso")} className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${formuleMode === "perso" ? "bg-primary text-white" : "border border-border/70 bg-surface text-slate-600 hover:bg-white"}`}>Personnalisé</button>
                  </div>
                  {formuleMode === "preset" ? (
                    <div className="space-y-2">
                      {FORMULES.map((f, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setValue("formule", f)}
                          className={`w-full rounded-xl border-2 p-3 text-left text-xs transition ${values.formule === f ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Textarea {...register("formule")} rows={3} placeholder="Votre formule personnalisée…" />
                  )}
                  {errors.formule && <p className="mt-1 text-xs text-red-500">{errors.formule.message}</p>}
                </div>
              </div>
            </div>

            <Button variant="primary" loading={pdfLoading} type="submit" className="h-12 w-full text-base font-semibold">
              Télécharger la lettre en PDF
            </Button>
          </form>
        </div>

        <div className={`${showPreview ? "" : "hidden"} lg:block`}>
          <div className="sticky top-[73px]">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Aperçu de la lettre</p>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-border/60 bg-white shadow-card">
              <div ref={previewRef} className="bg-white">
                <LettreMotivationPreview data={values as import("./LettreMotivationPreview").LettreMotivationData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
