import { useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { InlineAdStrip } from "../../components/promo/InlineAdStrip";
import { useAutoSave, readDraft } from "../../hooks/useAutoSave";
import { captureElementToPdfFile } from "../../lib/html2canvasPdf";
import { cropImageToSquare } from "../../lib/brandColors";
import { useDocumentBranding } from "../../hooks/useDocumentBranding";
import BrandingPanel from "../../components/document/BrandingPanel";
import { generateCVProfile } from "../../utils/aiGenerate";
import CVPreview from "./CVPreview";

const expSchema = z.object({
  poste: z.string().default(""),
  entreprise: z.string().default(""),
  localisation: z.string().default(""),
  dateDebut: z.string().default(""),
  dateFin: z.string().default(""),
  actuel: z.boolean().default(false),
  missions: z.string().default(""),
});

const formationSchema = z.object({
  diplome: z.string().default(""),
  etablissement: z.string().default(""),
  localisation: z.string().default(""),
  annee: z.string().default(""),
  mention: z.string().default("Aucune"),
});

const schema = z.object({
  template: z.enum(["classique", "moderne", "compact"]).default("classique"),
  nom: z.string().min(1, "Nom requis"),
  titre: z.string().min(1, "Titre requis"),
  dateNaissance: z.string().default(""),
  lieuResidence: z.string().default(""),
  telephone: z.string().default(""),
  email: z.string().default(""),
  linkedin: z.string().default(""),
  permis: z.string().default("Aucun"),
  situation: z.string().default(""),
  nationalite: z.string().default("Ivoirienne"),
  profil: z.string().default(""),
  experiences: z.array(expSchema).default([]),
  formations: z.array(formationSchema).default([]),
  competences: z.array(z.object({ nom: z.string().default(""), niveau: z.string().default("Intermédiaire") })).default([]),
  langues: z.array(z.object({ langue: z.string().default(""), niveau: z.string().default("Courant") })).default([]),
  interets: z.string().default(""),
  referencesDisponibles: z.boolean().default(false),
  photoDataUrl: z.string().default(""),
});

type Values = z.infer<typeof schema>;
const DRAFT_KEY = "cv_draft";

const TEMPLATES = [
  { id: "classique", label: "Classique", desc: "Bandeau haut, marge gauche colorée" },
  { id: "moderne", label: "Moderne", desc: "Colonne gauche couleur" },
  { id: "compact", label: "Compact", desc: "Colonne droite couleur" },
] as const;

const NIVEAUX_COMP = ["Débutant", "Intermédiaire", "Avancé", "Expert"];
const NIVEAUX_LANG = ["Notions", "Intermédiaire", "Courant", "Bilingue", "Langue maternelle"];

export default function CVEditor() {
  const navigate = useNavigate();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  // Conteneur off-screen toujours rendu — utilisé pour la génération PDF
  // (le preview visible peut être caché sur mobile via display:none)
  const pdfRef = useRef<HTMLDivElement>(null);
  const draft = readDraft<Values>(DRAFT_KEY);
  const { brand, uploadLogo, removeLogo, updateBrand } = useDocumentBranding();

  const { register, control, watch, handleSubmit, setValue, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: draft ?? {
      template: "classique",
      nationalite: "Ivoirienne",
      permis: "Aucun",
      experiences: [{ poste: "", entreprise: "", localisation: "", dateDebut: "", dateFin: "", actuel: false, missions: "" }],
      formations: [{ diplome: "", etablissement: "", localisation: "", annee: "", mention: "Aucune" }],
      competences: [{ nom: "", niveau: "Intermédiaire" }],
      langues: [{ langue: "Français", niveau: "Langue maternelle" }],
    },
  });

  const expFields = useFieldArray({ control, name: "experiences" });
  const formFields = useFieldArray({ control, name: "formations" });
  const compFields = useFieldArray({ control, name: "competences" });
  const langFields = useFieldArray({ control, name: "langues" });
  const values = watch();
  useAutoSave(DRAFT_KEY, values);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Recadrage automatique 1:1 centré pour un rendu optimal en cercle
      const dataUrl = await cropImageToSquare(file, 400, 0.92);
      setValue("photoDataUrl", dataUrl);
    } catch { /* ignore */ }
  }

  async function downloadPDF() {
    const source = pdfRef.current ?? previewRef.current;
    if (!source) return;
    setPdfLoading(true);
    try {
      await captureElementToPdfFile(source, `CV-${values.nom.replace(/\s+/g, "-") || "cv"}.pdf`);
    } catch (e) {
      console.error("[CV PDF]", e);
      alert("Impossible de générer le PDF. Essayez 'Aperçu' puis Imprimer → Enregistrer en PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  function handleGenerateProfil() {
    setAiLoading(true);
    setTimeout(() => {
      const profil = generateCVProfile({
        nom: values.nom,
        titre: values.titre,
        lieuResidence: values.lieuResidence,
        nationalite: values.nationalite,
        experiences: values.experiences,
        formations: values.formations,
        competences: values.competences,
      });
      setValue("profil", profil);
      setAiLoading(false);
    }, 600);
  }

  const onSubmit = handleSubmit(() => downloadPDF());

  const selectClass = "w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="min-h-screen bg-surface">
      <title>CV Professionnel Gratuit — DocuGestIvoire</title>

      <div className="sticky top-0 z-30 border-b border-border/60 bg-white/95 px-4 py-3 backdrop-blur-sm shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-border/70 text-slate-500 hover:bg-white transition active:scale-95">←</button>
            <div>
              <p className="text-sm font-bold text-text">CV Professionnel</p>
              <p className="text-xs text-slate-500">{values.nom || "Nouveau CV"}</p>
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

            {/* Branding */}
            <BrandingPanel
              brand={brand}
              onUploadLogo={uploadLogo}
              onRemoveLogo={removeLogo}
              onColorChange={(hex) => updateBrand({ accentColor: hex })}
            />

            {/* Template */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Choisir un modèle</h3>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setValue("template", t.id)}
                    className={`rounded-xl border-2 p-3 text-center transition ${values.template === t.id ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-primary/40"}`}
                  >
                    {/* Mini-aperçu distinct par template */}
                    <div className="mx-auto mb-2 h-10 w-14 overflow-hidden rounded-lg border border-slate-200">
                      {t.id === "classique" && (
                        <div className="flex h-full bg-white">
                          <div className="w-0.5 shrink-0" style={{ background: brand.accentColor || "#1a6b4a" }} />
                          <div className="flex flex-1 flex-col p-1">
                            <div className="mb-1 h-3 w-full rounded-sm" style={{ background: `${brand.accentColor || "#1a6b4a"}22` }}>
                              <div className="h-full w-1/3 rounded-full" style={{ background: brand.accentColor || "#1a6b4a", opacity: 0.7 }} />
                            </div>
                            <div className="mb-0.5 h-1 rounded-full" style={{ background: brand.accentColor || "#1a6b4a", width: "80%" }} />
                            {[70, 90, 60].map((w, i) => (
                              <div key={i} className="mb-0.5 rounded-full bg-slate-200" style={{ height: 1.5, width: `${w}%` }} />
                            ))}
                          </div>
                        </div>
                      )}
                      {t.id === "moderne" && (
                        <div className="flex h-full">
                          <div className="flex w-5 flex-col items-center gap-0.5 py-1" style={{ background: brand.accentColor || "#1a6b4a" }}>
                            <div className="h-3 w-3 rounded-full bg-white/40" />
                            {[70, 90, 60].map((_, i) => (
                              <div key={i} className="h-0.5 rounded-full bg-white/30" style={{ width: "70%" }} />
                            ))}
                          </div>
                          {/* Contenu blanc */}
                          <div className="flex flex-1 flex-col justify-center gap-0.5 p-1">
                            <div className="h-1 rounded-full" style={{ background: brand.accentColor || "#1a6b4a", width: "80%" }} />
                            {[90, 70].map((w, i) => (
                              <div key={i} className="h-0.5 rounded-full bg-slate-200" style={{ width: `${w}%` }} />
                            ))}
                          </div>
                        </div>
                      )}
                      {t.id === "compact" && (
                        <div className="flex h-full bg-white">
                          <div className="flex flex-1 flex-col justify-center gap-0.5 p-1">
                            <div className="h-1 rounded-full bg-slate-800" style={{ width: "75%" }} />
                            <div className="h-0.5 rounded-full" style={{ background: brand.accentColor || "#1a6b4a", width: "55%" }} />
                            {[85, 70, 60].map((w, i) => (
                              <div key={i} className="rounded-full bg-slate-200" style={{ height: 1.5, width: `${w}%` }} />
                            ))}
                          </div>
                          <div className="flex w-4 shrink-0 flex-col items-center gap-0.5 py-1" style={{ background: brand.accentColor || "#1a6b4a" }}>
                            <div className="h-2 w-2 rounded-full bg-white/45" />
                            {[65, 55, 70].map((_, i) => (
                              <div key={i} className="h-0.5 rounded-full bg-white/35" style={{ width: "72%" }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-bold text-text">{t.label}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Infos personnelles */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Informations personnelles</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nom complet *</label>
                  <Input {...register("nom")} placeholder="KOUASSI Jean-Baptiste" />
                  {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Titre professionnel / Poste recherché *</label>
                  <Input {...register("titre")} placeholder="Développeur Web Full-Stack" />
                  {errors.titre && <p className="mt-1 text-xs text-red-500">{errors.titre.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Photo (optionnel)</label>
                  <p className="mb-2 text-[11px] text-slate-400">Recadrage automatique en carré 1:1 — centré sur votre visage</p>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer rounded-xl border border-border/70 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-surface transition">
                      {values.photoDataUrl ? "Changer la photo" : "Choisir une photo"}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {values.photoDataUrl && (
                      <button
                        type="button"
                        onClick={() => setValue("photoDataUrl", "")}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  {values.photoDataUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={values.photoDataUrl}
                        alt="Aperçu"
                        className="h-24 w-24 rounded-full object-cover shadow-md"
                        style={{ border: `3px solid ${brand.accentColor || "#1a6b4a"}` }}
                      />
                      <div className="text-xs text-slate-500">
                        <p className="font-medium text-slate-700">✓ Photo recadrée 1:1</p>
                        <p className="mt-0.5">La couleur de la bordure correspond à votre couleur choisie</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Lieu de résidence</label>
                    <Input {...register("lieuResidence")} placeholder="Cocody, Abidjan" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Date de naissance</label>
                    <Input type="date" {...register("dateNaissance")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone</label>
                    <Input {...register("telephone")} placeholder="+225 07 XX XX XX XX" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                    <Input {...register("email")} type="email" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">LinkedIn</label>
                    <Input {...register("linkedin")} placeholder="linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Nationalité</label>
                    <Input {...register("nationalite")} defaultValue="Ivoirienne" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Permis de conduire</label>
                    <select {...register("permis")} className={selectClass}>
                      {["Aucun", "Permis A", "Permis B", "Permis C", "Permis D"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Situation matrimoniale</label>
                    <select {...register("situation")} className={selectClass}>
                      <option value="">—</option>
                      {["Célibataire", "Marié(e)", "Autre"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Profil */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Profil / Résumé</h3>
                <button
                  type="button"
                  onClick={handleGenerateProfil}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-violet-600 hover:to-purple-700 disabled:opacity-60"
                >
                  {aiLoading ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <span>✨</span>
                  )}
                  {aiLoading ? "Génération…" : "Générer avec l'IA"}
                </button>
              </div>
              <Textarea {...register("profil")} rows={4} placeholder="Cliquez « Générer avec l'IA » pour créer votre profil automatiquement après avoir rempli vos infos personnelles et expériences." />
              {!values.nom && (
                <p className="mt-1.5 text-[10px] text-amber-600">💡 Remplissez d'abord votre nom et titre pour que l'IA génère un profil personnalisé.</p>
              )}
            </div>

            {/* Expériences */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Expériences</h3>
                <button type="button" onClick={() => expFields.append({ poste: "", entreprise: "", localisation: "", dateDebut: "", dateFin: "", actuel: false, missions: "" })} className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition">+ Ajouter</button>
              </div>
              {expFields.fields.map((f, i) => (
                <div key={f.id} className="mb-3 rounded-xl border border-border/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Expérience {i + 1}</span>
                    {expFields.fields.length > 1 && <button type="button" onClick={() => expFields.remove(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>}
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Poste</label>
                        <Input {...register(`experiences.${i}.poste`)} placeholder="Développeur Full-Stack" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Entreprise</label>
                        <Input {...register(`experiences.${i}.entreprise`)} placeholder="SOGECI" />
                      </div>
                    </div>
                    <Input {...register(`experiences.${i}.localisation`)} placeholder="Abidjan, CI" />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Début (AAAA-MM)</label>
                        <Input type="month" {...register(`experiences.${i}.dateDebut`)} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Fin</label>
                        <Input type="month" {...register(`experiences.${i}.dateFin`)} disabled={watch(`experiences.${i}.actuel`)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id={`actuel-${i}`} {...register(`experiences.${i}.actuel`)} className="h-4 w-4 rounded border-border" />
                      <label htmlFor={`actuel-${i}`} className="text-xs text-slate-600">Poste actuel</label>
                    </div>
                    <Textarea {...register(`experiences.${i}.missions`)} rows={3} placeholder="• Mission 1&#10;• Mission 2&#10;• Mission 3" />
                  </div>
                </div>
              ))}
            </div>

            {/* Formations */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Formations</h3>
                <button type="button" onClick={() => formFields.append({ diplome: "", etablissement: "", localisation: "", annee: "", mention: "Aucune" })} className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition">+ Ajouter</button>
              </div>
              {formFields.fields.map((f, i) => (
                <div key={f.id} className="mb-3 rounded-xl border border-border/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Formation {i + 1}</span>
                    {formFields.fields.length > 1 && <button type="button" onClick={() => formFields.remove(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>}
                  </div>
                  <div className="space-y-2">
                    <Input {...register(`formations.${i}.diplome`)} placeholder="Licence en Gestion" />
                    <Input {...register(`formations.${i}.etablissement`)} placeholder="UVCI Abidjan" />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Localisation</label>
                        <Input {...register(`formations.${i}.localisation`)} placeholder="Abidjan" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Année</label>
                        <Input {...register(`formations.${i}.annee`)} placeholder="2022" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">Mention</label>
                      <select {...register(`formations.${i}.mention`)} className={selectClass}>
                        {["Aucune", "Passable", "Assez Bien", "Bien", "Très Bien"].map((v) => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compétences */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Compétences</h3>
                <button type="button" onClick={() => compFields.append({ nom: "", niveau: "Intermédiaire" })} className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition">+ Ajouter</button>
              </div>
              {compFields.fields.map((f, i) => (
                <div key={f.id} className="mb-2 flex items-center gap-2">
                  <Input {...register(`competences.${i}.nom`)} placeholder="React, Comptabilité…" className="flex-1" />
                  <select {...register(`competences.${i}.niveau`)} className="w-36 rounded-xl border border-border/70 bg-white px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {NIVEAUX_COMP.map((v) => <option key={v}>{v}</option>)}
                  </select>
                  {compFields.fields.length > 1 && <button type="button" onClick={() => compFields.remove(i)} className="text-xs text-red-400">✕</button>}
                </div>
              ))}
            </div>

            {/* Langues */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Langues</h3>
                <button type="button" onClick={() => langFields.append({ langue: "", niveau: "Courant" })} className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition">+ Ajouter</button>
              </div>
              {langFields.fields.map((f, i) => (
                <div key={f.id} className="mb-2 flex items-center gap-2">
                  <Input {...register(`langues.${i}.langue`)} placeholder="Dioula, Anglais…" className="flex-1" />
                  <select {...register(`langues.${i}.niveau`)} className="w-44 rounded-xl border border-border/70 bg-white px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {NIVEAUX_LANG.map((v) => <option key={v}>{v}</option>)}
                  </select>
                  {langFields.fields.length > 1 && <button type="button" onClick={() => langFields.remove(i)} className="text-xs text-red-400">✕</button>}
                </div>
              ))}
            </div>

            {/* Intérêts */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Centres d'intérêt (optionnel)</h3>
              <Textarea {...register("interets")} rows={2} placeholder="Football, Lecture, Voyage, Musique gospel" />
              <div className="mt-3 flex items-center gap-2">
                <input type="checkbox" id="refs" {...register("referencesDisponibles")} className="h-4 w-4 rounded border-border" />
                <label htmlFor="refs" className="text-sm text-slate-700">Références disponibles sur demande</label>
              </div>
            </div>

            <Button variant="primary" loading={pdfLoading} type="submit" className="h-12 w-full text-base font-semibold">
              Télécharger le CV en PDF
            </Button>
          </form>
        </div>

        <div className={`${showPreview ? "" : "hidden"} lg:block`}>
          <div className="sticky top-[73px]">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Aperçu du CV</p>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-border/60 bg-white shadow-card">
              <div ref={previewRef} className="bg-white">
                <CVPreview
                  data={values as import("./CVPreview").CVData}
                  accentColor={brand.accentColor}
                  logoDataUrl={brand.logoDataUrl}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteneur off-screen pour la génération PDF — jamais caché, toujours rendu */}
      <div
        ref={pdfRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: 794,
          pointerEvents: "none",
          visibility: "hidden",
        }}
      >
        <CVPreview
          data={values as import("./CVPreview").CVData}
          accentColor={brand.accentColor}
          logoDataUrl={brand.logoDataUrl}
        />
      </div>
    </div>
  );
}
