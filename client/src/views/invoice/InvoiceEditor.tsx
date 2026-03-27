import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
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
import { extractBrandColorsFromFile, fileToDataUrl, readableOnWhite } from "../../lib/brandColors";
import { inferCountryPolicy, buildAdministrativeClause, buildFiscalPaymentTerms } from "../../lib/francophonePolicy";
import {
  CI_VAT_REGIME_LABELS,
  CI_VAT_REGIME_VALUES,
  type CiVatRegime,
  ciVatRegimeToFiscalRegime,
  fiscalRegimeToCiVat
} from "../../constants/ciVatRegimes";

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
  /** Régime d’assujettissement TVA (CI) — pilote `fiscalRegime` pour le calcul. */
  ciVatRegime: z.enum(CI_VAT_REGIME_VALUES),
  globalDiscountPct: z.number().min(0).max(100).default(0),
  vatRatePct: z.number().min(0).max(100).default(DEFAULT_VAT_RATE_PCT),
  senderCompanyName: z.string().min(1, "Entreprise requise"),
  senderAddress: z.string().default(""),
  senderPhone: z.string().default(""),
  senderEmail: z.string().default(""),
  senderHeadOffice: z.string().default(""),
  senderLegalForm: z.string().default(""),
  senderRib: z.string().default(""),
  senderNcc: z.string().default(""),
  senderRccm: z.string().default(""),
  senderDfe: z.string().default(""),
  senderWebsite: z.string().default(""),
  senderWhatsapp: z.string().default(""),
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

/** Évite de charger `/api/documents/new` quand la route dynamique capture `new` ou un segment invalide. */
function isPersistedDocumentId(id: string | undefined): id is string {
  if (!id) return false;
  if (id === "new" || id === "express") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export default function InvoiceEditor() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const auth = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [themeColor] = useState<"emerald">("emerald");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [brandPrimaryHex, setBrandPrimaryHex] = useState<string | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const printWrapRef = useRef<HTMLDivElement | null>(null);
  const autoPrintDoneRef = useRef(false);
  const pendingPrintAfterLoadRef = useRef(false);

  const countryPolicy = useMemo(() => inferCountryPolicy(auth.user?.user_typology), [auth.user?.user_typology]);

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
      fiscalRegime: countryPolicy.defaultFiscalRegime,
      ciVatRegime: fiscalRegimeToCiVat(countryPolicy.defaultFiscalRegime),
      globalDiscountPct: 0,
      vatRatePct: countryPolicy.defaultFiscalRegime === "formal" ? countryPolicy.vatRatePct : DEFAULT_VAT_RATE_PCT,
      senderCompanyName: auth.user?.company_name ?? "",
      senderAddress: auth.user?.company_address ?? "",
      senderPhone: auth.user?.phone ?? "",
      senderEmail: auth.user?.email ?? "",
      senderHeadOffice: auth.user?.company_address ?? "",
      senderLegalForm: countryPolicy.defaultLegalForm,
      senderRib: "",
      senderNcc: auth.user?.company_ncc ?? "",
      senderRccm: auth.user?.company_rccm ?? "",
      senderDfe: auth.user?.company_dfe ?? "",
      senderWebsite: "",
      senderWhatsapp: auth.user?.whatsapp ?? "",
      lines: [
        { description: "", quantity: 1, unit: "Forfait", unitPriceHT: 0, discountPct: 0 }
      ],
      conditions: buildFiscalPaymentTerms(
        countryPolicy,
        countryPolicy.defaultFiscalRegime === "formal" ? countryPolicy.vatRatePct : DEFAULT_VAT_RATE_PCT
      ),
      footerNote: buildAdministrativeClause(countryPolicy, docType, { legalForm: countryPolicy.defaultLegalForm })
    };
  }, [auth.user, searchParams, countryPolicy]);

  const form = useForm<EditorValues>({
    resolver: zodResolver(editorSchema) as Resolver<EditorValues>,
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
    autoPrintDoneRef.current = false;
    pendingPrintAfterLoadRef.current = searchParams.get("action") === "print";
  }, [params.id, searchParams]);

  useEffect(() => {
    const onIdSynced = (e: Event) => {
      const d = (e as CustomEvent<{ oldId: string; newId: string }>).detail;
      if (d && params.id === d.oldId) {
        navigate(`/dashboard/invoice/${d.newId}`, { replace: true });
      }
    };
    window.addEventListener("docugest:doc-id-synced", onIdSynced);
    return () => window.removeEventListener("docugest:doc-id-synced", onIdSynced);
  }, [params.id, navigate]);

  useEffect(() => {
    if (!auth.user || isPersistedDocumentId(params.id)) return;
    const v = form.getValues();
    if (!v.senderCompanyName) form.setValue("senderCompanyName", auth.user.company_name || "");
    if (!v.senderAddress) form.setValue("senderAddress", auth.user.company_address || "");
    if (!v.senderPhone) form.setValue("senderPhone", auth.user.phone || "");
    if (!v.senderEmail) form.setValue("senderEmail", auth.user.email || "");
    if (!v.senderHeadOffice) form.setValue("senderHeadOffice", auth.user.company_address || "");
    if (!v.senderNcc) form.setValue("senderNcc", auth.user.company_ncc || "");
    if (!v.senderRccm) form.setValue("senderRccm", auth.user.company_rccm || "");
    if (!v.senderDfe) form.setValue("senderDfe", auth.user.company_dfe || "");
    if (!v.senderWhatsapp) form.setValue("senderWhatsapp", auth.user.whatsapp || "");
    if (!v.senderLegalForm) form.setValue("senderLegalForm", countryPolicy.defaultLegalForm);
    if (!v.conditions || /Regime fiscal|Paiement a 30 jours|Paiement à 30 jours/i.test(v.conditions)) {
      form.setValue("conditions", buildFiscalPaymentTerms(countryPolicy, Number(v.vatRatePct || countryPolicy.vatRatePct)));
    }
    if (!v.footerNote || /Cadre administratif|Merci pour votre confiance/i.test(v.footerNote)) {
      form.setValue(
        "footerNote",
        buildAdministrativeClause(countryPolicy, v.docType, {
          legalForm: v.senderLegalForm,
          hasRccm: Boolean(v.senderRccm),
          hasNcc: Boolean(v.senderNcc),
          hasRib: Boolean(v.senderRib)
        })
      );
    }
    if (v.fiscalRegime === "informal" && countryPolicy.defaultFiscalRegime === "formal") {
      form.setValue("fiscalRegime", "formal");
    }
    if (Number(v.vatRatePct || 0) <= 0 || Number(v.vatRatePct) === DEFAULT_VAT_RATE_PCT) {
      form.setValue("vatRatePct", countryPolicy.vatRatePct);
    }
  }, [auth.user, params.id, form, countryPolicy]);

  useEffect(() => {
    if (isPersistedDocumentId(params.id)) return;
    const v = form.getValues();
    if (!v.footerNote || /Cadre administratif|Merci pour votre confiance/i.test(v.footerNote)) {
      form.setValue(
        "footerNote",
        buildAdministrativeClause(countryPolicy, v.docType, {
          legalForm: v.senderLegalForm,
          hasRccm: Boolean(v.senderRccm),
          hasNcc: Boolean(v.senderNcc),
          hasRib: Boolean(v.senderRib)
        })
      );
    }
  }, [
    watched.docType,
    watched.senderLegalForm,
    watched.senderRccm,
    watched.senderNcc,
    watched.senderRib,
    params.id,
    form,
    countryPolicy
  ]);

  useEffect(() => {
    if (!isPersistedDocumentId(params.id)) return;
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
          sender?: {
            companyName?: string;
            address?: string;
            phone?: string;
            email?: string;
            headOffice?: string;
            legalForm?: string;
            rib?: string;
            ncc?: string;
            rccm?: string;
            dfe?: string;
            website?: string;
            whatsapp?: string;
            logoDataUrl?: string | null;
          };
          brandPrimaryHex?: string | null;
          client?: { name?: string; address?: string; phone?: string; email?: string };
          docNumber?: string;
          emissionDate?: string;
          dueDateMode?: EditorValues["dueDateMode"];
          dueDateManual?: string;
          fiscalRegime?: EditorValues["fiscalRegime"];
          ciVatRegime?: EditorValues["ciVatRegime"];
          lines?: EditorValues["lines"];
          globalDiscountPct?: number;
          vatRatePct?: number;
          conditions?: string;
          footerNote?: string;
        };
        setLogoDataUrl(typeof d.sender?.logoDataUrl === "string" ? d.sender.logoDataUrl : null);
        setBrandPrimaryHex(typeof d.brandPrimaryHex === "string" ? d.brandPrimaryHex : null);
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
          senderHeadOffice: d.sender?.headOffice ?? "",
          senderLegalForm: d.sender?.legalForm ?? "",
          senderRib: d.sender?.rib ?? "",
          senderNcc: d.sender?.ncc ?? "",
          senderRccm: d.sender?.rccm ?? "",
          senderDfe: d.sender?.dfe ?? "",
          senderWebsite: d.sender?.website ?? "",
          senderWhatsapp: d.sender?.whatsapp ?? "",
          clientName: d.client?.name ?? "",
          clientAddress: d.client?.address ?? "",
          clientPhone: d.client?.phone ?? "",
          clientEmail: d.client?.email ?? "",
          emissionDate: d.emissionDate || todayISO(),
          dueDateMode: d.dueDateMode ?? "net30",
          dueDateManual: d.dueDateManual ?? "",
          fiscalRegime: d.fiscalRegime ?? "informal",
          ciVatRegime: d.ciVatRegime ?? fiscalRegimeToCiVat((d.fiscalRegime ?? "informal") as "informal" | "formal"),
          lines:
            Array.isArray(d.lines) && d.lines.length > 0
              ? (d.lines as EditorValues["lines"])
              : [{ description: "", quantity: 1, unit: "Forfait", unitPriceHT: 0, discountPct: 0 }],
          globalDiscountPct: Number(d.globalDiscountPct ?? 0),
          vatRatePct: Number(d.vatRatePct ?? DEFAULT_VAT_RATE_PCT),
          conditions: d.conditions ?? "Paiement à 30 jours",
          footerNote: d.footerNote ?? "Merci pour votre confiance."
        });
        setPreviewValues(form.getValues());
        if (pendingPrintAfterLoadRef.current && !autoPrintDoneRef.current) {
          autoPrintDoneRef.current = true;
          pendingPrintAfterLoadRef.current = false;
          window.setTimeout(() => {
            void downloadPdf();
          }, 550);
        }
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
    setLogoDataUrl(null);
    setBrandPrimaryHex(null);
  };

  const accentForPreview = brandPrimaryHex ? readableOnWhite(brandPrimaryHex) : null;

  async function downloadPdf() {
    /** L’aperçu visible rend correctement ; l’élément hors écran peut produire un PDF vide avec html2canvas. */
    const source = previewWrapRef.current ?? printWrapRef.current;
    if (!source) {
      alert("Aperçu indisponible. Patientez un instant puis réessayez.");
      return;
    }
    setPdfDownloading(true);
    try {
      const canvas = await html2canvas(source, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${form.getValues().docNumber || previewValues.docNumber || "facture"}.pdf`);
    } catch (e) {
      console.error(e);
      alert(
        "Impossible de générer le PDF automatiquement. Utilisez « Imprimer » puis « Enregistrer au format PDF » dans la boîte de dialogue."
      );
    } finally {
      setPdfDownloading(false);
    }
  }

  function printPreview() {
    window.print();
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
          email: values.senderEmail,
          headOffice: values.senderHeadOffice,
          legalForm: values.senderLegalForm,
          rib: values.senderRib,
          ncc: values.senderNcc,
          rccm: values.senderRccm,
          dfe: values.senderDfe,
          website: values.senderWebsite,
          whatsapp: values.senderWhatsapp,
          logoDataUrl: logoDataUrl || undefined
        },
        brandPrimaryHex: brandPrimaryHex || undefined,
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
        ciVatRegime: values.ciVatRegime,
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

      if (isPersistedDocumentId(params.id)) {
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
    <div className="min-w-0 px-3 py-4 print:p-2 sm:p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 print:block">
        <div className="rounded-2xl bg-bg p-4 shadow-soft ring-1 ring-border/70 sm:p-6 print:hidden">
          <form className="text-[13px] sm:text-[14px]" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-6">
              <div className="rounded-2xl border-2 border-primary/25 bg-gradient-to-br from-white to-primary/[0.04] p-5 shadow-sm ring-1 ring-primary/10 sm:p-6">
                <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary sm:text-left">
                  1 — Choisissez le document, puis renseignez les champs
                </p>
                <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div
                    className="flex flex-wrap justify-center gap-2 sm:justify-start"
                    role="tablist"
                    aria-label="Type de document"
                  >
                    {(["invoice", "proforma", "devis"] as DocType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="tab"
                        aria-selected={watched.docType === t}
                        onClick={() => form.setValue("docType", t, { shouldDirty: true })}
                        className={[
                          "min-h-[48px] min-w-[7.5rem] rounded-2xl px-4 py-3 text-sm font-bold ring-2 transition sm:text-base",
                          watched.docType === t
                            ? "bg-primary text-white ring-primary shadow-md"
                            : "bg-surface text-text ring-border/60 hover:bg-bg hover:ring-primary/30"
                        ].join(" ")}
                      >
                        {docTypeLabel(t)}
                      </button>
                    ))}
                  </div>
                  <Button
                    className="min-h-[48px] w-full shrink-0 px-6 text-base font-semibold lg:w-auto lg:min-w-[11rem]"
                    onClick={form.handleSubmit(onSave)}
                    disabled={saving}
                  >
                    {saving ? "Sauvegarde…" : "Sauvegarder"}
                  </Button>
                </div>
                <p className="mt-4 text-center text-sm leading-relaxed text-slate-700 sm:text-left">
                  Le formulaire commence ici : remplissez les sections suivantes. L’aperçu PDF est plus bas, après la saisie. Le
                  téléchargement se fait en bas de page (pas en haut).
                </p>
              </div>

              <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] to-bg p-3 ring-1 ring-border/60 print:hidden sm:p-4">
                <InlineAdStrip
                  variant="compact"
                  adSlot="invoice-editor-top"
                  hint="Encart sous le choix du document"
                  heading="Gratuit grâce aux partenaires"
                  subheading="Pas d’abonnement caché : ces visibilités financent les serveurs et le produit. Merci pour votre attention."
                />
              </div>

              <div className="rounded-xl bg-surface p-5 ring-1 ring-border/70">
                <div className="text-sm font-semibold text-text">Identité visuelle</div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Importez le logo : les couleurs dominantes sont détectées automatiquement (traitement local,
                  sans envoi serveur). Sans logo, ou pour affiner, choisissez la couleur principale ci-dessous.
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-4">
                  <label className="block min-w-[200px]">
                    <span className="mb-2 block text-sm font-medium text-text">Logo entreprise</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="w-full max-w-xs text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-text"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await fileToDataUrl(file);
                          setLogoDataUrl(url);
                          const { primary } = await extractBrandColorsFromFile(file);
                          setBrandPrimaryHex(primary);
                        } catch {
                          alert("Impossible de lire l’image.");
                        }
                      }}
                    />
                  </label>
                  {logoDataUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={logoDataUrl} alt="" className="h-16 w-16 rounded-lg border border-border object-contain p-1" />
                      {brandPrimaryHex ? (
                        <div className="flex flex-col gap-1 text-xs text-slate-600">
                          <span>Couleur principale</span>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-9 w-9 rounded-lg ring-2 ring-border"
                              style={{ backgroundColor: brandPrimaryHex }}
                              title={brandPrimaryHex}
                            />
                            <span className="font-mono text-[11px]">{brandPrimaryHex}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {logoDataUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setLogoDataUrl(null);
                        setBrandPrimaryHex(null);
                      }}
                    >
                      Retirer le logo
                    </Button>
                  ) : null}
                </div>
                <div className="mt-4 max-w-xs">
                  <span className="mb-2 block text-sm font-medium text-text">Couleur principale du document</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandPrimaryHex ?? "#00A86B"}
                      onChange={(e) => setBrandPrimaryHex(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border border-border bg-white p-1"
                      aria-label="Choisir une couleur principale"
                    />
                    <input
                      type="text"
                      value={brandPrimaryHex ?? "#00A86B"}
                      onChange={(e) => setBrandPrimaryHex(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-surface p-5 ring-1 ring-border/70">
                <div className="text-sm font-semibold text-text">En-tête émetteur</div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input label="Nom entreprise" {...form.register("senderCompanyName")} error={form.formState.errors.senderCompanyName?.message} />
                  <Input label="Téléphone" {...form.register("senderPhone")} error={undefined} />
                </div>
                <div className="mt-4">
                  <Textarea label="Adresse complète" rows={4} {...form.register("senderAddress")} />
                </div>
                <div className="mt-3">
                  <Input label="Email" type="email" {...form.register("senderEmail")} />
                </div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input label="WhatsApp entreprise" {...form.register("senderWhatsapp")} />
                  <Input label="Site web" {...form.register("senderWebsite")} />
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
                <div className="text-sm font-semibold text-text">Mentions légales & bancaires</div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input label="Siège social" {...form.register("senderHeadOffice")} />
                  <Input label="Forme juridique" {...form.register("senderLegalForm")} />
                </div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input label="RIB / Compte bancaire" {...form.register("senderRib")} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  Saisissez le <strong>RCCM</strong>, puis la <strong>DFE</strong> et/ou le <strong>NCC / IFU</strong> selon
                  votre situation. <strong>Sur le PDF</strong> : si le NCC/IFU est renseigné, la DFE n’apparaît pas (évite la
                  redondance) ; sinon seule la DFE peut s’afficher.
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input label="RCCM" {...form.register("senderRccm")} />
                  <Input label="DFE" {...form.register("senderDfe")} />
                </div>
                <div className="mt-3">
                  <Input label="NCC / IFU (n° fiscal)" {...form.register("senderNcc")} />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Une fois le NCC/IFU renseigné, la DFE ne sera plus imprimée sur le document.
                  </p>
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
                <div className="text-sm font-semibold text-text">Régime TVA / assujettissement (DGI)</div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Choisissez la <strong>catégorie fiscale</strong> (réel, franchise, etc.) — ce n’est pas une « formule » : cela
                  indique si la TVA s’applique sur le document. Les taux ci-dessous servent au calcul des lignes.
                </p>
                <div className="mt-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-text">Régime</span>
                    <select
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      value={watched.ciVatRegime}
                      onChange={(e) => {
                        const v = e.target.value as CiVatRegime;
                        form.setValue("ciVatRegime", v, { shouldDirty: true });
                        form.setValue("fiscalRegime", ciVatRegimeToFiscalRegime(v), { shouldDirty: true });
                      }}
                    >
                      {CI_VAT_REGIME_VALUES.map((k) => (
                        <option key={k} value={k}>
                          {CI_VAT_REGIME_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {watched.fiscalRegime === "informal" ? (
                  <div className="mt-3 rounded-xl bg-primary/10 p-3 text-sm text-text ring-1 ring-primary/30">
                    Aucune TVA calculée sur ce document (montants hors TVA = montants TTC affichés).
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Input
                      label="Remise globale (%)"
                      type="number"
                      {...form.register("globalDiscountPct", { valueAsNumber: true })}
                    />
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-text">Taux de TVA (%)</span>
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

              <div className="rounded-xl border-2 border-primary/25 bg-gradient-to-br from-primary/[0.06] to-white p-5 ring-1 ring-primary/15">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Étape 2 — Export</p>
                <p className="mt-1 text-sm text-slate-700">
                  Lorsque le formulaire est à jour, téléchargez le PDF ou imprimez. Vous pouvez aussi réinitialiser le brouillon.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button
                    variant="secondary"
                    className="min-h-11 w-full sm:w-auto"
                    type="button"
                    onClick={() => printPreview()}
                    disabled={pdfDownloading || saving}
                  >
                    Imprimer
                  </Button>
                  <Button
                    variant="primary"
                    className="min-h-11 w-full sm:w-auto"
                    type="button"
                    onClick={() => void downloadPdf()}
                    disabled={pdfDownloading || saving}
                  >
                    {pdfDownloading ? "Téléchargement…" : "Télécharger PDF"}
                  </Button>
                  <Button variant="ghost" className="min-h-11 w-full sm:w-auto" type="button" onClick={onReset} disabled={saving}>
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="print:hidden">
          <InlineAdStrip
            variant="compact"
            adSlot="invoice-editor-before-preview"
            hint="Encart entre le formulaire et l’aperçu"
            heading="Encart partenaires"
            subheading="Un clic ici aide à garder la création de documents accessible à tous."
          />
        </div>

        <div className="relative rounded-2xl bg-bg p-4 shadow-soft ring-1 ring-border/70 sm:p-6 print:shadow-none print:ring-0">
            <div className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div>
                <div className="text-base font-bold text-text">Aperçu du document</div>
                <div className="text-sm font-semibold text-primary">{docTypeLabel(previewValues.docType)}</div>
                <div className="mt-1 text-xs text-slate-600">Mise à jour en direct (format A4) — complétez d’abord le formulaire ci-dessus.</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-600">Total</div>
                <div
                  className="text-lg font-bold"
                  style={{ color: accentForPreview ?? "#00A86B" }}
                >
                  {formatFCFA(computedTotals.totalTTC)}
                </div>
              </div>
            </div>

            <div
              ref={previewWrapRef}
              className="mt-4 max-h-[min(85vh,1200px)] overflow-x-auto overflow-y-auto rounded-xl bg-slate-100/80 p-2 ring-1 ring-border/50 sm:p-3"
            >
              <InvoicePreview
                themeColor={themeColor}
                customAccentHex={accentForPreview}
                docTypeLabel={docTypeLabel(previewValues.docType)}
                data={{
                  sender: {
                    companyName: previewValues.senderCompanyName,
                    address: previewValues.senderAddress,
                    phone: previewValues.senderPhone,
                    email: previewValues.senderEmail,
                    headOffice: previewValues.senderHeadOffice,
                    legalForm: previewValues.senderLegalForm,
                    rib: previewValues.senderRib,
                    ncc: previewValues.senderNcc,
                    rccm: previewValues.senderRccm,
                    dfe: previewValues.senderDfe,
                    website: previewValues.senderWebsite,
                    whatsapp: previewValues.senderWhatsapp,
                    logoDataUrl: logoDataUrl || undefined
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
            <div className="pointer-events-none absolute -left-[99999px] top-0 opacity-0">
              <div ref={printWrapRef}>
                <InvoicePreview
                  themeColor={themeColor}
                  customAccentHex={accentForPreview}
                  docTypeLabel={docTypeLabel(previewValues.docType)}
                  data={{
                    sender: {
                      companyName: previewValues.senderCompanyName,
                      address: previewValues.senderAddress,
                      phone: previewValues.senderPhone,
                      email: previewValues.senderEmail,
                      headOffice: previewValues.senderHeadOffice,
                      legalForm: previewValues.senderLegalForm,
                      rib: previewValues.senderRib,
                      ncc: previewValues.senderNcc,
                      rccm: previewValues.senderRccm,
                      dfe: previewValues.senderDfe,
                      website: previewValues.senderWebsite,
                      whatsapp: previewValues.senderWhatsapp,
                      logoDataUrl: logoDataUrl || undefined
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

