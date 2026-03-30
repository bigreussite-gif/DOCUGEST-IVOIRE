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
import { useDocumentBranding } from "../../hooks/useDocumentBranding";
import BrandingPanel from "../../components/document/BrandingPanel";
import { nextDocNumber, peekDocNumber, todayISO } from "../../utils/documentNumber";
import { useAutoSave, readDraft } from "../../hooks/useAutoSave";
import { amountToWordsFCFA } from "../../utils/formatters";
import RecuPaiementPreview from "./RecuPaiementPreview";

const schema = z.object({
  recuNumber: z.string().min(1),
  paymentDate: z.string().min(1),
  motif: z.string().min(1, "Motif requis"),
  amount: z.number().min(1, "Montant requis"),
  paymentMode: z.string().default("Espèces"),
  transactionRef: z.string().default(""),
  chequeRef: z.string().default(""),
  refFacture: z.string().default(""),
  refBC: z.string().default(""),
  paymentType: z.string().default("Paiement intégral"),
  totalDue: z.number().default(0),
  emitterName: z.string().min(1, "Émetteur requis"),
  emitterActivity: z.string().default(""),
  emitterAddress: z.string().default(""),
  emitterPhone: z.string().min(1, "Téléphone requis"),
  emitterRccm: z.string().default(""),
  payerName: z.string().min(1, "Nom payeur requis"),
  payerCompany: z.string().default(""),
  payerPhone: z.string().default(""),
  payerAddress: z.string().default(""),
  notes: z.string().default(""),
});

type Values = z.infer<typeof schema>;
const DRAFT_KEY = "recu_paiement_draft";
const MOBILE_MONEY_MODES = ["Orange Money", "MTN MoMo", "Moov Money", "Wave"];
const CHEQUE_MODES = ["Chèque", "Virement bancaire"];

export default function RecuPaiementEditor() {
  const navigate = useNavigate();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const draft = readDraft<Values>(DRAFT_KEY);

  const { register, watch, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: draft ?? {
      recuNumber: peekDocNumber("REC"),
      paymentDate: todayISO(),
      amount: 0,
      totalDue: 0,
      paymentMode: "Espèces",
      paymentType: "Paiement intégral",
    },
  });

  const values = watch();
  useAutoSave(DRAFT_KEY, values);
  const { brand, uploadLogo, removeLogo, updateBrand } = useDocumentBranding();

  const isMobileMoney = MOBILE_MONEY_MODES.includes(values.paymentMode);
  const isCheque = CHEQUE_MODES.includes(values.paymentMode);
  const isPartial = values.paymentType !== "Paiement intégral";
  const remaining = (Number(values.totalDue) || 0) - (Number(values.amount) || 0);

  async function downloadPDF() {
    if (!previewRef.current) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const imgH = (canvas.height * pageW) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pageW, imgH);
      pdf.save(`${values.recuNumber || "recu-paiement"}.pdf`);
      nextDocNumber("REC");
    } finally {
      setPdfLoading(false);
    }
  }

  const onSubmit = handleSubmit(() => downloadPDF());

  return (
    <div className="min-h-screen bg-surface">
      <title>Reçu de Paiement — DocuGest Ivoire</title>

      <div className="sticky top-0 z-30 border-b border-border/60 bg-white/95 px-4 py-3 backdrop-blur-sm shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-border/70 text-slate-500 hover:bg-white transition active:scale-95">←</button>
            <div>
              <p className="text-sm font-bold text-text">Reçu de paiement</p>
              <p className="text-xs text-slate-500">{values.recuNumber}</p>
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
            <BrandingPanel brand={brand} onUploadLogo={uploadLogo} onRemoveLogo={removeLogo} onColorChange={(hex) => updateBrand({ accentColor: hex })} />

            {/* En-tête */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Numéro & date</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">N° Reçu</label>
                  <Input {...register("recuNumber")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Date du paiement</label>
                  <Input type="date" {...register("paymentDate")} />
                </div>
              </div>
            </div>

            {/* Émetteur */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Émetteur (qui reçoit le paiement)</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Raison sociale / Nom *</label>
                  <Input {...register("emitterName")} placeholder="Mon Entreprise SARL" />
                  {errors.emitterName && <p className="mt-1 text-xs text-red-500">{errors.emitterName.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Activité / Secteur</label>
                    <Input {...register("emitterActivity")} placeholder="Commerce général" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">RCCM</label>
                    <Input {...register("emitterRccm")} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse</label>
                  <Input {...register("emitterAddress")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone *</label>
                  <Input {...register("emitterPhone")} placeholder="+225 07 XX XX XX XX" />
                  {errors.emitterPhone && <p className="mt-1 text-xs text-red-500">{errors.emitterPhone.message}</p>}
                </div>
              </div>
            </div>

            {/* Payeur */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Payeur</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nom complet *</label>
                  <Input {...register("payerName")} />
                  {errors.payerName && <p className="mt-1 text-xs text-red-500">{errors.payerName.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Entreprise</label>
                    <Input {...register("payerCompany")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone</label>
                    <Input {...register("payerPhone")} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse</label>
                  <Input {...register("payerAddress")} />
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Détails du paiement</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Motif du paiement *</label>
                  <Input {...register("motif")} placeholder="Achat de 50 sacs de ciment Portland" />
                  {errors.motif && <p className="mt-1 text-xs text-red-500">{errors.motif.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Montant payé (FCFA) *</label>
                  <Input type="number" min={0} {...register("amount", { valueAsNumber: true })} placeholder="150000" />
                  {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
                  {(Number(values.amount) || 0) > 0 && (
                    <p className="mt-1 text-xs text-slate-500 italic">
                      En lettres : {amountToWordsFCFA(values.amount)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Mode de paiement</label>
                  <select {...register("paymentMode")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Espèces", "Orange Money", "MTN MoMo", "Moov Money", "Wave", "Virement bancaire", "Chèque", "Autre"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                {isMobileMoney && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Référence de transaction</label>
                    <Input {...register("transactionRef")} placeholder="Ex: CI2026042512345" />
                  </div>
                )}
                {isCheque && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">N° Chèque + Banque</label>
                    <Input {...register("chequeRef")} placeholder="Ex: 0001234 — SGBCI" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Réf. Facture</label>
                    <Input {...register("refFacture")} placeholder="FAC-2026-..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Réf. Bon de commande</label>
                    <Input {...register("refBC")} placeholder="BC-2026-..." />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Type de paiement</label>
                  <select {...register("paymentType")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Paiement intégral", "Acompte", "Solde", "Paiement partiel"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                {isPartial && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Montant total dû (FCFA)</label>
                    <Input type="number" min={0} {...register("totalDue", { valueAsNumber: true })} />
                    {remaining > 0 && (
                      <p className="mt-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        Reste à payer : {new Intl.NumberFormat("fr-FR").format(remaining)} FCFA
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Notes</h3>
              <Textarea {...register("notes")} rows={2} placeholder="Remarques complémentaires…" />
            </div>

            <Button variant="primary" loading={pdfLoading} type="submit" className="h-12 w-full text-base font-semibold">
              Télécharger le PDF
            </Button>
          </form>
        </div>

        <div className={`${showPreview ? "" : "hidden"} lg:block`}>
          <div className="sticky top-[73px]">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Aperçu du document</p>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-border/60 bg-white shadow-card">
              <div ref={previewRef} className="bg-white">
                <RecuPaiementPreview data={values as import("./RecuPaiementPreview").RecuPaiementData} logoDataUrl={brand.logoDataUrl} accentColor={brand.accentColor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
