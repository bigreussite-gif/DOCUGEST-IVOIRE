import { useRef, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { InlineAdStrip } from "../../components/promo/InlineAdStrip";
import { useDocumentBranding } from "../../hooks/useDocumentBranding";
import BrandingPanel from "../../components/document/BrandingPanel";
import { nextDocNumber, peekDocNumber, todayISO } from "../../utils/documentNumber";
import { useAutoSave, readDraft, writeDraftNow, clearDraft } from "../../hooks/useAutoSave";
import { DocumentEditorActionButtons } from "../../components/document/DocumentEditorActionButtons";
import { captureElementToPdfFile, PDF_OFFSCREEN_CAPTURE_STYLE } from "../../lib/html2canvasPdf";
import BonCommandePreview from "./BonCommandePreview";

const lineSchema = z.object({
  designation: z.string().min(1, "Désignation requise"),
  reference: z.string().default(""),
  quantity: z.number().min(1, "Quantité ≥ 1"),
  unit: z.string().default("Pièce"),
  unitPriceHT: z.number().min(0, "Prix invalide"),
});

const schema = z.object({
  bcNumber: z.string().min(1),
  bcDate: z.string().min(1),
  refProforma: z.string().default(""),
  deliveryMode: z.string().default("Sur site"),
  deliveryDelay: z.string().default(""),
  deliveryAddress: z.string().default(""),
  paymentMode: z.string().default("Virement bancaire"),
  paymentConditions: z.string().default("Paiement à la commande"),
  buyerName: z.string().min(1, "Nom acheteur requis"),
  buyerRccm: z.string().default(""),
  buyerNcc: z.string().default(""),
  buyerAddress: z.string().min(1, "Adresse requise"),
  buyerPhone: z.string().min(1, "Téléphone requis"),
  buyerEmail: z.string().default(""),
  buyerContact: z.string().default(""),
  buyerFunction: z.string().default(""),
  supplierName: z.string().min(1, "Fournisseur requis"),
  supplierAddress: z.string().default(""),
  supplierPhone: z.string().min(1, "Téléphone fournisseur requis"),
  supplierEmail: z.string().default(""),
  supplierContact: z.string().default(""),
  lines: z.array(lineSchema).min(1, "Au moins une ligne requise"),
  discountPct: z.number().min(0).max(100).default(0),
  vatPct: z.number().default(18),
  observations: z.string().default(""),
});

type Values = z.infer<typeof schema>;

const DRAFT_KEY = "bon_commande_draft";

function bonCommandeEmptyDefaults(): Values {
  return {
    bcNumber: peekDocNumber("BC"),
    bcDate: todayISO(),
    refProforma: "",
    deliveryMode: "Sur site",
    deliveryDelay: "",
    deliveryAddress: "",
    paymentMode: "Virement bancaire",
    paymentConditions: "Paiement à la commande",
    buyerName: "",
    buyerRccm: "",
    buyerNcc: "",
    buyerAddress: "",
    buyerPhone: "",
    buyerEmail: "",
    buyerContact: "",
    buyerFunction: "",
    supplierName: "",
    supplierAddress: "",
    supplierPhone: "",
    supplierEmail: "",
    supplierContact: "",
    lines: [{ designation: "", reference: "", quantity: 1, unit: "Pièce", unitPriceHT: 0 }],
    discountPct: 0,
    vatPct: 18,
    observations: ""
  };
}
const UNITS = ["Pièce", "Kg", "Litre", "Carton", "Lot", "Sac", "Palette", "m²", "m³", "Unité"];

export default function BonCommandeEditor() {
  const navigate = useNavigate();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const draft = readDraft<Values>(DRAFT_KEY);

  const { register, control, watch, handleSubmit, getValues, reset, formState: { errors } } = useForm<Values>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: draft ?? bonCommandeEmptyDefaults(),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const values = watch();
  useAutoSave(DRAFT_KEY, values);
  const { brand, uploadLogo, removeLogo, updateBrand } = useDocumentBranding();

  const totalHT = values.lines?.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPriceHT) || 0), 0) ?? 0;
  const discountAmount = totalHT * ((Number(values.discountPct) || 0) / 100);
  const netHT = totalHT - discountAmount;
  const vatAmount = netHT * ((Number(values.vatPct) || 0) / 100);
  const totalTTC = netHT + vatAmount;

  async function downloadPDF() {
    const source = pdfRef.current ?? previewRef.current;
    if (!source) return;
    setPdfLoading(true);
    try {
      await captureElementToPdfFile(source, `${values.bcNumber || "bon-commande"}.pdf`);
      if (!draft) nextDocNumber("BC");
    } finally {
      setPdfLoading(false);
    }
  }

  const onSubmit = handleSubmit(() => void downloadPDF());

  function handleReset() {
    if (!confirm("Réinitialiser le bon de commande ? Le brouillon local sera effacé.")) return;
    clearDraft(DRAFT_KEY);
    reset(bonCommandeEmptyDefaults());
  }

  return (
    <div className="min-h-screen bg-surface">
      <title>Bon de Commande FCFA — DocuGestIvoire</title>

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-white/95 backdrop-blur-sm shadow-xs">
        <div className="space-y-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface ring-1 ring-border/70 text-slate-500 hover:bg-white hover:text-text transition active:scale-95">
                ←
              </button>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text">Bon de commande</p>
                <p className="truncate text-xs text-slate-500">{values.bcNumber}</p>
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

        {/* ─── Formulaire ─── */}
        <div className={showPreview ? "hidden lg:block" : ""}>
          <form className="space-y-5" onSubmit={onSubmit}>
            <InlineAdStrip variant="compact" adSlot="bon-commande-editor-inline" />
            <BrandingPanel brand={brand} onUploadLogo={uploadLogo} onRemoveLogo={removeLogo} onColorChange={(hex) => updateBrand({ accentColor: hex })} />

            {/* Numéro + Date */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Détails du bon</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">N° BC</label>
                  <Input {...register("bcNumber")} placeholder="BC-2026-0001" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Date</label>
                  <Input type="date" {...register("bcDate")} />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Réf. proforma</label>
                  <Input {...register("refProforma")} placeholder="PRO-2026-..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">TVA (%)</label>
                  <select {...register("vatPct", { valueAsNumber: true })} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {[0, 9, 18].map((v) => <option key={v} value={v}>{v}%</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Acheteur */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Acheteur</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Raison sociale *</label>
                  <Input {...register("buyerName")} placeholder="Ma Société SARL" />
                  {errors.buyerName && <p className="mt-1 text-xs text-red-500">{errors.buyerName.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">RCCM</label>
                    <Input {...register("buyerRccm")} placeholder="CI-ABJ-…" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">NCC</label>
                    <Input {...register("buyerNcc")} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse *</label>
                  <Input {...register("buyerAddress")} placeholder="Plateau, Abidjan" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone *</label>
                    <Input {...register("buyerPhone")} placeholder="+225 07 XX XX XX XX" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                    <Input {...register("buyerEmail")} type="email" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Signataire</label>
                    <Input {...register("buyerContact")} placeholder="Nom du responsable" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Fonction</label>
                    <Input {...register("buyerFunction")} placeholder="Dir. Achats" />
                  </div>
                </div>
              </div>
            </div>

            {/* Fournisseur */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Fournisseur</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Raison sociale *</label>
                  <Input {...register("supplierName")} placeholder="Fournisseur CI" />
                  {errors.supplierName && <p className="mt-1 text-xs text-red-500">{errors.supplierName.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse</label>
                  <Input {...register("supplierAddress")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone *</label>
                    <Input {...register("supplierPhone")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                    <Input {...register("supplierEmail")} type="email" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Contact commercial</label>
                  <Input {...register("supplierContact")} />
                </div>
              </div>
            </div>

            {/* Livraison & Paiement */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Livraison & Paiement</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Mode de livraison</label>
                  <select {...register("deliveryMode")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Sur site", "Retrait magasin", "Transporteur", "À convenir"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Délai souhaité</label>
                  <Input {...register("deliveryDelay")} placeholder="sous 15 jours" />
                </div>
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse de livraison</label>
                <Input {...register("deliveryAddress")} placeholder="Si différente de l'adresse acheteur" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Mode de paiement</label>
                  <select {...register("paymentMode")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Espèces", "Virement bancaire", "Mobile Money", "Chèque", "Crédit fournisseur", "Autre"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Conditions de paiement</label>
                  <select {...register("paymentConditions")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Paiement à la commande", "30 jours fin de mois", "50% acompte + 50% livraison", "À convenir"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Articles commandés</h3>
                <button type="button" onClick={() => append({ designation: "", reference: "", quantity: 1, unit: "Pièce", unitPriceHT: 0 })} className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition">
                  + Ajouter
                </button>
              </div>
              {errors.lines && <p className="mb-2 text-xs text-red-500">Au moins une ligne requise</p>}
              <div className="space-y-3">
                {fields.map((f, i) => {
                  const qty = Number(watch(`lines.${i}.quantity`)) || 0;
                  const pu = Number(watch(`lines.${i}.unitPriceHT`)) || 0;
                  return (
                    <div key={f.id} className="rounded-xl border border-border/60 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Ligne {i + 1}</span>
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input {...register(`lines.${i}.designation`)} placeholder="Désignation *" />
                        {errors.lines?.[i]?.designation && <p className="text-xs text-red-500">{errors.lines[i]!.designation!.message}</p>}
                        <div className="grid grid-cols-2 gap-2">
                          <Input {...register(`lines.${i}.reference`)} placeholder="Référence" />
                          <select {...register(`lines.${i}.unit`)} className="rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                            {UNITS.map((u) => <option key={u}>{u}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-1 block text-xs text-slate-500">Quantité</label>
                            <Input type="number" min={1} {...register(`lines.${i}.quantity`, { valueAsNumber: true })} />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-slate-500">Prix unitaire HT (FCFA)</label>
                            <Input type="number" min={0} {...register(`lines.${i}.unitPriceHT`, { valueAsNumber: true })} />
                          </div>
                        </div>
                        <div className="text-right text-xs font-semibold text-slate-600">
                          Montant HT : {new Intl.NumberFormat("fr-FR").format(qty * pu)} FCFA
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totaux */}
              <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total HT</span>
                  <span className="font-semibold">{new Intl.NumberFormat("fr-FR").format(totalHT)} FCFA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Remise (%)</span>
                  <Input type="number" min={0} max={100} {...register("discountPct", { valueAsNumber: true })} className="w-20 text-center" />
                  {discountAmount > 0 && <span className="text-sm text-red-500">- {new Intl.NumberFormat("fr-FR").format(discountAmount)} FCFA</span>}
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Net HT</span>
                    <span className="font-semibold">{new Intl.NumberFormat("fr-FR").format(netHT)} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-slate-600">
                  <span>TVA ({values.vatPct}%)</span>
                  <span>{new Intl.NumberFormat("fr-FR").format(vatAmount)} FCFA</span>
                </div>
                <div className="flex justify-between rounded-xl bg-primary/10 px-3 py-2 text-base font-bold text-text">
                  <span>TOTAL TTC</span>
                  <span className="text-primary">{new Intl.NumberFormat("fr-FR").format(totalTTC)} FCFA</span>
                </div>
              </div>
            </div>

            {/* Observations */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Observations</h3>
              <Textarea {...register("observations")} rows={3} placeholder="Remarques, conditions particulières…" />
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

        {/* ─── Aperçu ─── */}
        <div className={`${showPreview ? "" : "hidden"} lg:block`}>
          <div className="sticky top-[73px]">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Aperçu du document</p>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-border/60 bg-white shadow-card">
              <div ref={previewRef} className="bg-white">
                <BonCommandePreview data={{
                  bcNumber: values.bcNumber,
                  bcDate: values.bcDate,
                  refProforma: values.refProforma,
                  deliveryMode: values.deliveryMode,
                  deliveryDelay: values.deliveryDelay,
                  deliveryAddress: values.deliveryAddress,
                  paymentMode: values.paymentMode,
                  paymentConditions: values.paymentConditions,
                  buyerName: values.buyerName,
                  buyerRccm: values.buyerRccm,
                  buyerNcc: values.buyerNcc,
                  buyerAddress: values.buyerAddress,
                  buyerPhone: values.buyerPhone,
                  buyerEmail: values.buyerEmail,
                  buyerContact: values.buyerContact,
                  buyerFunction: values.buyerFunction,
                  supplierName: values.supplierName,
                  supplierAddress: values.supplierAddress,
                  supplierPhone: values.supplierPhone,
                  supplierEmail: values.supplierEmail,
                  supplierContact: values.supplierContact,
                  lines: values.lines ?? [],
                  discountPct: Number(values.discountPct) || 0,
                  vatPct: Number(values.vatPct) || 18,
                  observations: values.observations,
                }} logoDataUrl={brand.logoDataUrl} accentColor={brand.accentColor} />
              </div>
            </div>
          </div>
        </div>

      </div>
      <div ref={pdfRef} className="print:hidden" style={PDF_OFFSCREEN_CAPTURE_STYLE} aria-hidden>
        <BonCommandePreview data={{
          bcNumber: values.bcNumber, bcDate: values.bcDate, refProforma: values.refProforma,
          deliveryMode: values.deliveryMode, deliveryDelay: values.deliveryDelay, deliveryAddress: values.deliveryAddress,
          paymentMode: values.paymentMode, paymentConditions: values.paymentConditions,
          buyerName: values.buyerName, buyerRccm: values.buyerRccm, buyerNcc: values.buyerNcc,
          buyerAddress: values.buyerAddress, buyerPhone: values.buyerPhone, buyerEmail: values.buyerEmail,
          buyerContact: values.buyerContact, buyerFunction: values.buyerFunction,
          supplierName: values.supplierName, supplierAddress: values.supplierAddress,
          supplierPhone: values.supplierPhone, supplierEmail: values.supplierEmail, supplierContact: values.supplierContact,
          lines: values.lines ?? [], discountPct: Number(values.discountPct) || 0, vatPct: Number(values.vatPct) || 18,
          observations: values.observations,
        }} logoDataUrl={brand.logoDataUrl} accentColor={brand.accentColor} />
      </div>
    </div>
  );
}
