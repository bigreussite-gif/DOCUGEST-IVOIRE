import { useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { InlineAdStrip } from "../../components/promo/InlineAdStrip";
import { nextDocNumber, peekDocNumber, todayISO } from "../../utils/documentNumber";
import { useAutoSave, readDraft } from "../../hooks/useAutoSave";
import BonLivraisonPreview from "./BonLivraisonPreview";

const lineSchema = z.object({
  designation: z.string().min(1, "Désignation requise"),
  reference: z.string().default(""),
  quantityOrdered: z.number().default(0),
  quantityDelivered: z.number().min(1, "Qté livrée requise"),
  unit: z.string().default("Pièce"),
  observations: z.string().default(""),
});

const schema = z.object({
  blNumber: z.string().min(1),
  blDate: z.string().min(1),
  refBC: z.string().default(""),
  refFacture: z.string().default(""),
  transportMode: z.string().default("Véhicule société"),
  vehicleImmat: z.string().default(""),
  senderName: z.string().min(1, "Expéditeur requis"),
  senderRccm: z.string().default(""),
  senderAddress: z.string().min(1, "Adresse requise"),
  senderPhone: z.string().min(1, "Téléphone requis"),
  senderEmail: z.string().default(""),
  delivererName: z.string().default(""),
  recipientName: z.string().min(1, "Destinataire requis"),
  recipientAddress: z.string().min(1, "Adresse de livraison requise"),
  recipientPhone: z.string().min(1, "Téléphone requis"),
  recipientContact: z.string().default(""),
  lines: z.array(lineSchema).min(1),
  deliveryStatus: z.string().default("Conforme"),
  reserves: z.string().default(""),
  receiverName: z.string().min(1, "Nom réceptionnaire requis"),
  receptionDate: z.string().default(""),
});

type Values = z.infer<typeof schema>;
const DRAFT_KEY = "bon_livraison_draft";
const UNITS = ["Pièce", "Kg", "Litre", "Carton", "Lot", "Sac", "Palette", "m²", "m³", "Unité"];

export default function BonLivraisonEditor() {
  const navigate = useNavigate();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const draft = readDraft<Values>(DRAFT_KEY);

  const { register, control, watch, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: draft ?? {
      blNumber: peekDocNumber("BL"),
      blDate: todayISO(),
      lines: [{ designation: "", reference: "", quantityOrdered: 0, quantityDelivered: 1, unit: "Pièce", observations: "" }],
      deliveryStatus: "Conforme",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const values = watch();
  useAutoSave(DRAFT_KEY, values);

  async function downloadPDF() {
    if (!previewRef.current) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const imgH = (canvas.height * pageW) / canvas.width;
      let y = 0;
      const pageH = 297;
      if (imgH <= pageH) {
        pdf.addImage(imgData, "JPEG", 0, 0, pageW, imgH);
      } else {
        let remaining = imgH;
        while (remaining > 0) {
          pdf.addImage(imgData, "JPEG", 0, -y, pageW, imgH);
          remaining -= pageH;
          y += pageH;
          if (remaining > 0) pdf.addPage();
        }
      }
      pdf.save(`${values.blNumber || "bon-livraison"}.pdf`);
      nextDocNumber("BL");
    } finally {
      setPdfLoading(false);
    }
  }

  const onSubmit = handleSubmit(() => downloadPDF());

  return (
    <div className="min-h-screen bg-surface">
      <title>Bon de Livraison — DocuGest Ivoire</title>

      <div className="sticky top-0 z-30 border-b border-border/60 bg-white/95 px-4 py-3 backdrop-blur-sm shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-border/70 text-slate-500 hover:bg-white transition active:scale-95">←</button>
            <div>
              <p className="text-sm font-bold text-text">Bon de livraison</p>
              <p className="text-xs text-slate-500">{values.blNumber}</p>
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

            {/* En-tête */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Détails du bon</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">N° BL</label>
                  <Input {...register("blNumber")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Date</label>
                  <Input type="date" {...register("blDate")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Réf. BC</label>
                  <Input {...register("refBC")} placeholder="BC-2026-..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Réf. Facture</label>
                  <Input {...register("refFacture")} placeholder="FAC-2026-..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Mode de transport</label>
                  <select {...register("transportMode")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Véhicule société", "Transporteur externe", "Retrait client", "Livraison à domicile", "Autre"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Immatriculation</label>
                  <Input {...register("vehicleImmat")} placeholder="Ex: CI-0123-AB" />
                </div>
              </div>
            </div>

            {/* Expéditeur */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Expéditeur</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Raison sociale *</label>
                  <Input {...register("senderName")} placeholder="Ma Société SARL" />
                  {errors.senderName && <p className="mt-1 text-xs text-red-500">{errors.senderName.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">RCCM</label>
                    <Input {...register("senderRccm")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone *</label>
                    <Input {...register("senderPhone")} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse *</label>
                  <Input {...register("senderAddress")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                    <Input {...register("senderEmail")} type="email" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Livreur/Chauffeur</label>
                    <Input {...register("delivererName")} />
                  </div>
                </div>
              </div>
            </div>

            {/* Destinataire */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Destinataire</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Raison sociale / Nom *</label>
                  <Input {...register("recipientName")} />
                  {errors.recipientName && <p className="mt-1 text-xs text-red-500">{errors.recipientName.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse de livraison *</label>
                  <Input {...register("recipientAddress")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone *</label>
                    <Input {...register("recipientPhone")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Contact sur place</label>
                    <Input {...register("recipientContact")} />
                  </div>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Articles livrés</h3>
                <button type="button" onClick={() => append({ designation: "", reference: "", quantityOrdered: 0, quantityDelivered: 1, unit: "Pièce", observations: "" })} className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition">
                  + Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {fields.map((f, i) => (
                  <div key={f.id} className="rounded-xl border border-border/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Article {i + 1}</span>
                      {fields.length > 1 && <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>}
                    </div>
                    <div className="space-y-2">
                      <Input {...register(`lines.${i}.designation`)} placeholder="Désignation *" />
                      {errors.lines?.[i]?.designation && <p className="text-xs text-red-500">{errors.lines[i]!.designation!.message}</p>}
                      <div className="grid grid-cols-2 gap-2">
                        <Input {...register(`lines.${i}.reference`)} placeholder="Référence article" />
                        <select {...register(`lines.${i}.unit`)} className="rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                          {UNITS.map((u) => <option key={u}>{u}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs text-slate-500">Qté commandée</label>
                          <Input type="number" min={0} {...register(`lines.${i}.quantityOrdered`, { valueAsNumber: true })} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-slate-500">Qté livrée *</label>
                          <Input type="number" min={1} {...register(`lines.${i}.quantityDelivered`, { valueAsNumber: true })} />
                        </div>
                      </div>
                      <Input {...register(`lines.${i}.observations`)} placeholder="Observations (ex: 1 carton abîmé)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* État livraison */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">État de la livraison</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">État général</label>
                  <select {...register("deliveryStatus")} className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Conforme", "Partiellement conforme", "Non conforme"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Réserves éventuelles</label>
                  <Textarea {...register("reserves")} rows={2} placeholder="Décrivez les réserves si nécessaire…" />
                </div>
              </div>
            </div>

            {/* Réception */}
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Réception</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nom du réceptionnaire *</label>
                  <Input {...register("receiverName")} />
                  {errors.receiverName && <p className="mt-1 text-xs text-red-500">{errors.receiverName.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Date et heure de réception</label>
                  <Input type="datetime-local" {...register("receptionDate")} />
                </div>
              </div>
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
                <BonLivraisonPreview data={{ ...values, lines: values.lines ?? [] }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
