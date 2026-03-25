import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { useAuthStore } from "../../store/authStore";
import { computeInvoiceTotals } from "../../utils/calculations";
import { DEFAULT_VAT_RATE_PCT, VAT_RATE_PRESETS } from "../../constants/taxes";
import { formatDateCI, formatFCFA, clampMoney } from "../../utils/formatters";
import InvoicePreview from "./InvoicePreview";
import { apiFetch } from "../../lib/api";
import { InlineAdStrip } from "../../components/promo/InlineAdStrip";

type DocType = "invoice" | "proforma" | "devis";

const lineSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.number().min(0, "Quantité invalide"),
  unit: z.string().min(1),
  unitPriceHT: z.number().min(0, "Prix invalide"),
  discountPct: z.number().min(0).max(100).optional().default(0)
});

const editorSchema = z.object({
  docType: z.enum(["invoice", "proforma", "devis"]),
  docNumber: z.string().min(1),
  emissionDate: z.string().min(1),
  dueDateMode: z.enum(["net30", "net60", "onOrder", "manual"]),
  dueDateManual: z.string().default(""),
  clientName: z.string().min(1, "Client requis"),
  clientAddress: z.string().default(""),
  clientPhone: z.string().default(""),
  clientEmail: z.string().default(""),
  fiscalRegime: z.enum(["informal", "formal"]),
  globalDiscountPct: z.number().min(0).max(100).default(0),
  vatRatePct: z.number().min(0).max(100).default(DEFAULT_VAT_RATE_PCT),
  senderCompanyName: z.string().min(1, "Entreprise requise"),
  senderAddress: z.string().default(""),
  senderPhone: z.string().default(""),
  senderEmail: z.string().default(""),
  lines: z.array(lineSchema).min(1),
  conditions: z.string().default("Paiement à 30 jours."),
  footerNote: z.string().default("Merci pour votre confiance.")
});

type EditorValues = z.infer<typeof editorSchema>;

const unitOptions = ["Forfait", "Heure", "Jour", "Pièce", "Kg", "Litre", "Mois", "Autre"] as const;

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dueDateText(values: EditorValues) {
  if (values.dueDateMode === "onOrder") return "À la commande";
  if (values.dueDateMode === "net30") return "Net 30";
  if (values.dueDateMode === "net60") return "Net 60";
  if (values.dueDateMode === "manual" && values.dueDateManual) return `Échéance: ${formatDateCI(values.dueDateManual)}`;
  return "";
}

function docTypeLabel(docType: DocType) {
  if (docType === "invoice") return "FACTURE";
  if (docType === "proforma") return "PROFORMA";
  return "DEVIS";
}

function docPrefix(docType: DocType) {
  if (docType === "invoice") return "FAC";
  if (docType === "proforma") return "PRO";
  return "DEV";
}

export default function InvoiceEditor() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const auth = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [themeColor] = useState<"emerald">("emerald");
  const previewWrapRef = useRef<HTMLDivElement | null>(null);

  const defaultValues: EditorValues = useMemo(() => {
    const year = new Date().getFullYear();
    const t = searchParams.get("type");
    const docType: DocType =
      t === "devis" ? "devis" : t === "proforma" ? "proforma" : t === "invoice" ? "invoice" : "invoice";
    const pref = docPrefix(docType);
    return {
      docType,
      docNumber: `${pref}-${year}-001`,
      emissionDate: todayISO(),
      dueDateMode: "net30",
      dueDateManual: "",
      clientName: "",
      clientAddress: "",
      clientPhone: "",
      clientEmail: "",
      fiscalRegime: "informal",
      globalDiscountPct: 0,
      vatRatePct: DEFAULT_VAT_RATE_PCT,
      senderCompanyName: auth.user?.company_name ?? "",
      senderAddress: auth.user?.company_address ?? "",
      senderPhone: auth.user?.phone ?? "",
      senderEmail: auth.user?.email ?? "",
      lines: [
        { description: "", quantity: 1, unit: "Forfait", unitPriceHT: 0, discountPct: 0 }
      ],
      conditions: "Paiement à 30 jours",
      footerNote: "Merci pour votre confiance."
    };
  }, [auth.user, searchParams]);

  const form = useForm<EditorValues>({
    resolver: zodResolver(editorSchema) as any,
    defaultValues,
    mode: "onChange"
  });

  const { fields, append, remove, move, insert } = useFieldArray({
    control: form.control,
    name: "lines"
  });

  const watched = form.watch();
  const [previewValues, setPreviewValues] = useState<EditorValues>(watched);

  useEffect(() => {
    const t = setTimeout(() => setPreviewValues(watched), 150);
    return () => clearTimeout(t);
  }, [watched]);

  // Reset auto-doc prefix when switching docType
  useEffect(() => {
    const values = form.getValues();
    const year = new Date().getFullYear();
    const pref = docPrefix(values.docType);
    if (!values.docNumber.startsWith(`${pref}-`)) {
      form.setValue("docNumber", `${pref}-${year}-001`, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched.docType]);

  useEffect(() => {
    if (!auth.user || params.id) return;
    const v = form.getValues();
    if (!v.senderCompanyName) form.setValue("senderCompanyName", auth.user.company_name || "");
    if (!v.senderAddress) form.setValue("senderAddress", auth.user.company_address || "");
    if (!v.senderPhone) form.setValue("senderPhone", auth.user.phone || "");
    if (!v.senderEmail) form.setValue("senderEmail", auth.user.email || "");
  }, [auth.user, params.id, form]);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;
    (async () => {
      try {
        const doc = await apiFetch<{
          type: string;
          doc_number: string;
          doc_data: Record<string, unknown>;
        }>(`/api/documents/${params.id}`);
        if (cancelled || !doc?.doc_data) return;
        const d = doc.doc_data as {
          sender?: { companyName?: string; address?: string; phone?: string; email?: string };
          client?: { name?: string; address?: string; phone?: string; email?: string };
          docNumber?: string;
          emissionDate?: string;
          dueDateMode?: EditorValues["dueDateMode"];
          dueDateManual?: string;
          fiscalRegime?: EditorValues["fiscalRegime"];
          lines?: EditorValues["lines"];
          globalDiscountPct?: number;
          vatRatePct?: number;
          conditions?: string;
          footerNote?: string;
        };
        const dt: DocType =
          doc.type === "devis" ? "devis" : doc.type === "proforma" ? "proforma" : "invoice";
        form.reset({
          ...form.getValues(),
          docType: dt,
          docNumber: doc.doc_number || form.getValues("docNumber"),
          senderCompanyName: d.sender?.companyName ?? "",
          senderAddress: d.sender?.address ?? "",
          senderPhone: d.sender?.phone ?? "",
          senderEmail: d.sender?.email ?? "",
          clientName: d.client?.name ?? "",
          clientAddress: d.client?.address ?? "",
          clientPhone: d.client?.phone ?? "",
          clientEmail: d.client?.email ?? "",
          emissionDate: d.emissionDate || todayISO(),
          dueDateMode: d.dueDateMode ?? "net30",
          dueDateManual: d.dueDateManual ?? "",
          fiscalRegime: d.fiscalRegime ?? "informal",
          lines:
            Array.isArray(d.lines) && d.lines.length > 0
              ? (d.lines as EditorValues["lines"])
              : [{ description: "", quantity: 1, unit: "Forfait", unitPriceHT: 0, discountPct: 0 }],
          globalDiscountPct: Number(d.globalDiscountPct ?? 0),
          vatRatePct: Number(d.vatRatePct ?? DEFAULT_VAT_RATE_PCT),
          conditions: d.conditions ?? "Paiement à 30 jours",
          footerNote: d.footerNote ?? "Merci pour votre confiance."
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chargement one-shot à l’ouverture
  }, [params.id]);

  const computedTotals = useMemo(() => {
    return computeInvoiceTotals({
      lines: previewValues.lines,
      fiscalRegime: previewValues.fiscalRegime,
      globalDiscountPct: previewValues.globalDiscountPct,
      vatRatePct: previewValues.vatRatePct
    });
  }, [previewValues]);

  const onReset = () => {
    form.reset(defaultValues);
  };

  async function downloadPdf() {
    if (!previewWrapRef.current) return;
    setPdfDownloading(true);
    try {
      const canvas = await html2canvas(previewWrapRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${previewValues.docNumber}.pdf`);
    } finally {
      setPdfDownloading(false);
    }
  }

  async function onSave() {
    const values = form.getValues();
    setSaving(true);
    try {
      const totals = computeInvoiceTotals({
        lines: values.lines,
        fiscalRegime: values.fiscalRegime,
        globalDiscountPct: values.globalDiscountPct,
        vatRatePct: values.vatRatePct
      });
      const doc_data = {
        sender: {
          companyName: values.senderCompanyName,
          address: values.senderAddress,
          phone: values.senderPhone,
          email: values.senderEmail
        },
        client: {
          name: values.clientName,
          address: values.clientAddress,
          phone: values.clientPhone,
          email: values.clientEmail
        },
        docNumber: values.docNumber,
        emissionDate: values.emissionDate,
        dueDateText: dueDateText(values),
        dueDateMode: values.dueDateMode,
        dueDateManual: values.dueDateManual,
        fiscalRegime: values.fiscalRegime,
        lines: values.lines,
        globalDiscountPct: values.globalDiscountPct,
        vatRatePct: values.vatRatePct,
        conditions: values.conditions,
        footerNote: values.footerNote
      };
      const payload = {
        type: values.docType,
        doc_number: values.docNumber,
        client_name: values.clientName,
        total_amount: clampMoney(totals.totalTTC),
        currency: "FCFA",
        status: "draft" as const,
        doc_data
      };

      if (params.id) {
        await apiFetch(`/api/documents/${params.id}`, {
          method: "PUT",
          json: payload
        });
        navigate(`/dashboard/invoice/${params.id}`);
      } else {
        const created = await apiFetch<{ id: string }>("/api/documents", {
          method: "POST",
          json: payload
        });
        navigate(`/dashboard/invoice/${created.id}`);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  // Drag & drop reorder
  const dragIndexRef = useRef<number | null>(null);
  const onDragStart = (idx: number) => {
    dragIndexRef.current = idx;
  };
  const onDrop = (idx: number) => {
    const from = dragIndexRef.current;
    if (from === null || from === idx) return;
    move(from, idx);
    dragIndexRef.current = null;
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <InlineAdStrip variant="compact" />
      </div>
      <div className="rounded-2xl bg-bg p-4 shadow-soft ring-1 ring-border/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-text">Type de document</div>
            <div className="mt-2 flex gap-2">
              {(["invoice", "proforma", "devis"] as DocType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => form.setValue("docType", t, { shouldDirty: true })}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition",
                    watched.docType === t ? "bg-primary text-white ring-primary/30" : "bg-surface text-text ring-border/70 hover:bg-bg"
                  ].join(" ")}
                >
                  {docTypeLabel(t)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={downloadPdf} disabled={pdfDownloading || saving}>
              {pdfDownloading ? "Téléchargement..." : "Télécharger PDF"}
            </Button>
            <Button variant="ghost" onClick={onReset} disabled={saving}>
              Réinitialiser
            </Button>
            <Button onClick={form.handleSubmit(onSave)} disabled={saving}>
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1.05fr]">
        <div className="rounded-2xl bg-bg p-4 shadow-soft ring-1 ring-border/70">
          <form className="max-h-[78vh] overflow-auto pr-2" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4">
              <div className="rounded-xl bg-surface p-4 ring-1 ring-border/70">
                <div className="text-sm font-semibold text-text">En-tête émetteur</div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input label="Nom entreprise" {...form.register("senderCompanyName")} error={form.formState.errors.senderCompanyName?.message} />
                  <Input label="Téléphone" {...form.register("senderPhone")} error={undefined} />
                </div>
                <div className="mt-3">
                  <Textarea label="Adresse complète" rows={3} {...form.register("senderAddress")} />
                </div>
                <div className="mt-3">
                  <Input label="Email" type="email" {...form.register("senderEmail")} />
                </div>
              </div>

              <div className="rounded-xl bg-surface p-4 ring-1 ring-border/70">
                <div className="text-sm font-semibold text-text">Numérotation & dates</div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input label="Numéro du document" {...form.register("docNumber")} error={form.formState.errors.docNumber?.message} />
                  <Input label="Date d'émission" type="date" {...form.register("emissionDate")} />
                </div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-text">Échéance</span>
                    <select
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      {...form.register("dueDateMode")}
                    >
                      <option value="net30">Net 30</option>
                      <option value="net60">Net 60</option>
                      <option value="onOrder">A la commande</option>
                      <option value="manual">Date manuelle</option>
                    </select>
                  </label>
                  {watched.dueDateMode === "manual" ? (
                    <Input label="Date manuelle" type="date" {...form.register("dueDateManual")} />
                  ) : (
                    <div />
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-surface p-4 ring-1 ring-border/70">
                <div className="text-sm font-semibold text-text">Informations client</div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input label="Nom / Entreprise" {...form.register("clientName")} error={form.formState.errors.clientName?.message} />
                  <Input label="Téléphone" {...form.register("clientPhone")} />
                </div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input label="Email" {...form.register("clientEmail")} />
                  <Input label="Adresse (résumé)" {...form.register("clientAddress")} />
                </div>
              </div>

              <div className="rounded-xl bg-surface p-4 ring-1 ring-border/70">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-text">Prestations / Produits</div>
                    <div className="mt-1 text-xs text-slate-600">Glissez pour réordonner (drag & drop).</div>
                  </div>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() =>
                      append({ description: "", quantity: 1, unit: "Forfait", unitPriceHT: 0, discountPct: 0 })
                    }
                  >
                    + Ajouter une ligne
                  </Button>
                </div>

                <div className="mt-4 grid gap-4">
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="rounded-xl bg-bg p-3 ring-1 ring-border/70"
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(idx)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-text">Ligne {idx + 1}</div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={() => {
                              const current = form.getValues(`lines.${idx}`);
                              insert(idx + 1, { ...current });
                            }}
                          >
                            Dupliquer
                          </Button>
                          <Button variant="danger" type="button" onClick={() => remove(idx)}>
                            Supprimer
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        <Textarea label="Description" rows={2} {...form.register(`lines.${idx}.description` as const)} />

                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            label="Qté"
                            type="number"
                            {...form.register(`lines.${idx}.quantity` as const, { valueAsNumber: true })}
                          />
                          <label className="block">
                            <span className="mb-1 block text-sm font-medium text-text">Unité</span>
                            <select
                              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                              {...form.register(`lines.${idx}.unit` as const)}
                            >
                              {unitOptions.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-4 md:grid-cols-3">
                        <Input
                          label="Prix unitaire HT (FCFA)"
                          type="number"
                          {...form.register(`lines.${idx}.unitPriceHT` as const, { valueAsNumber: true })}
                        />
                        <Input
                          label="Remise %"
                          type="number"
                          {...form.register(`lines.${idx}.discountPct` as const, { valueAsNumber: true })}
                        />
                        <div className="flex items-end justify-between rounded-xl bg-surface p-3 ring-1 ring-border/70">
                          <div className="text-xs text-slate-600">Total HT</div>
                          <div className="text-sm font-bold text-text">
                            {formatFCFA(
                              computeInvoiceTotals({
                                lines: [form.getValues(`lines.${idx}`)],
                                fiscalRegime: "informal",
                                globalDiscountPct: 0,
                                vatRatePct: 0
                              }).totalHT
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-surface p-4 ring-1 ring-border/70">
                <div className="text-sm font-semibold text-text">Régime fiscal</div>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    className={[
                      "flex-1 rounded-xl px-3 py-2 ring-1 transition",
                      watched.fiscalRegime === "informal"
                        ? "bg-primary text-white ring-primary/30"
                        : "bg-bg text-text ring-border/70 hover:bg-surface"
                    ].join(" ")}
                    onClick={() => form.setValue("fiscalRegime", "informal", { shouldDirty: true })}
                  >
                    INFORMEL
                  </button>
                  <button
                    type="button"
                    className={[
                      "flex-1 rounded-xl px-3 py-2 ring-1 transition",
                      watched.fiscalRegime === "formal"
                        ? "bg-secondary text-white ring-secondary/30"
                        : "bg-bg text-text ring-border/70 hover:bg-surface"
                    ].join(" ")}
                    onClick={() => form.setValue("fiscalRegime", "formal", { shouldDirty: true })}
                  >
                    FORMEL
                  </button>
                </div>

                {watched.fiscalRegime === "informal" ? (
                  <div className="mt-3 rounded-xl bg-primary/10 p-3 text-sm text-text ring-1 ring-primary/30">
                    Mode simplifié — aucune TVA calculée.
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Input
                      label="Remise globale (%)"
                      type="number"
                      {...form.register("globalDiscountPct", { valueAsNumber: true })}
                    />
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-text">TVA (%)</span>
                      <select
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        {...form.register("vatRatePct", { valueAsNumber: true })}
                      >
                        {VAT_RATE_PRESETS.map((r) => (
                          <option key={r} value={r}>
                            {r}%
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-surface p-4 ring-1 ring-border/70">
                <div className="text-sm font-semibold text-text">Conditions & pied de page</div>
                <div className="mt-3">
                  <Textarea label="Conditions de règlement" rows={3} {...form.register("conditions")} />
                </div>
                <div className="mt-3">
                  <Textarea label="Texte pied de page" rows={2} {...form.register("footerNote")} />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-bg p-4 shadow-soft ring-1 ring-border/70">
          <div className="sticky top-4">
            <div className="flex items-center justify-between gap-3 pb-3">
              <div>
                <div className="text-sm font-semibold text-text">{docTypeLabel(previewValues.docType)}</div>
                <div className="text-xs text-slate-600">Aperçu live (A4)</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-600">Total</div>
                <div className="text-lg font-bold" style={{ color: "#00A86B" }}>
                  {formatFCFA(computedTotals.totalTTC)}
                </div>
              </div>
            </div>

            <div ref={previewWrapRef}>
              <InvoicePreview
                themeColor={themeColor}
                docTypeLabel={docTypeLabel(previewValues.docType)}
                data={{
                  sender: {
                    companyName: previewValues.senderCompanyName,
                    address: previewValues.senderAddress,
                    phone: previewValues.senderPhone,
                    email: previewValues.senderEmail
                  },
                  client: {
                    name: previewValues.clientName,
                    address: previewValues.clientAddress,
                    phone: previewValues.clientPhone,
                    email: previewValues.clientEmail
                  },
                  docNumber: previewValues.docNumber,
                  emissionDate: previewValues.emissionDate,
                  dueDateText: dueDateText(previewValues),
                  fiscalRegime: previewValues.fiscalRegime,
                  lines: previewValues.lines.map((l) => ({
                    ...l,
                    quantity: Number(l.quantity),
                    unitPriceHT: Number(l.unitPriceHT),
                    discountPct: Number(l.discountPct ?? 0)
                  })),
                  globalDiscountPct: Number(previewValues.globalDiscountPct ?? 0),
                  vatRatePct: Number(previewValues.vatRatePct ?? 18),
                  conditions: previewValues.conditions,
                  footerNote: previewValues.footerNote
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

