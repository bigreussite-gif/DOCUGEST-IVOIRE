import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { useAuthStore } from "../../store/authStore";
import { apiFetch } from "../../lib/api";
import { formatFCFA, clampMoney } from "../../utils/formatters";
import PayslipPreview from "./PayslipPreview";
import { InlineAdStrip } from "../../components/promo/InlineAdStrip";
import { TrustModelBanner } from "../../components/trust/TrustModelBanner";
import { extractBrandColorsFromFile, fileToDataUrl, readableOnWhite } from "../../lib/brandColors";
import { inferCountryPolicy, buildAdministrativeClause } from "../../lib/francophonePolicy";

const schema = z.object({
  employerEmail: z.string().default(""),
  employerWhatsapp: z.string().default(""),
  employerWebsite: z.string().default(""),
  employerHeadOffice: z.string().default(""),
  employerLegalForm: z.string().default(""),
  employerRib: z.string().default(""),
  employerNcc: z.string().default(""),
  employerRccm: z.string().default(""),
  employerDfe: z.string().default(""),
  employeeName: z.string().min(2, "Nom requis"),
  employeeRole: z.string().default(""),
  periodLabel: z.string().min(2, "Période requise (ex. Janvier 2026)"),
  emissionDate: z.string().min(1),
  baseSalary: z.number().min(0),
  bonuses: z.number().min(0).default(0),
  transportAllowance: z.number().min(0).default(0),
  otherAllowances: z.number().min(0).default(0),
  /** Taux cotisation CNPS salarié (%). Si > 0, le montant CNPS est dérivé de la base salaire + primes. */
  cnpsRatePct: z.number().min(0).max(100).default(6.3),
  /** Montant CNPS manuel (FCFA) si taux = 0 — compatibilité anciens bulletins. */
  cnpsManualFcfa: z.number().min(0).default(0),
  igrRetentionFcfa: z.number().min(0).default(0),
  /** Parts pour IGR (affichage / traçabilité, ex. 1, 1,5, 2, 2,5…). */
  familyTaxParts: z.number().min(0.5).max(15).default(1),
  otherDeductions: z.number().min(0).default(0),
  notes: z.string().default("")
});

type Values = z.infer<typeof schema>;

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function cnpsAmountFromForm(v: Values): number {
  const rate = Number(v.cnpsRatePct ?? 0);
  if (rate > 0) {
    const base = Number(v.baseSalary) + Number(v.bonuses);
    return clampMoney(Math.max(0, (base * rate) / 100));
  }
  return clampMoney(Number(v.cnpsManualFcfa ?? 0));
}

function computeNet(v: Values) {
  const gross =
    Number(v.baseSalary) + Number(v.bonuses) + Number(v.transportAllowance) + Number(v.otherAllowances);
  const cnps = cnpsAmountFromForm(v);
  const ded = cnps + Number(v.igrRetentionFcfa) + Number(v.otherDeductions);
  return clampMoney(Math.max(0, gross - ded));
}

export default function PayslipEditor() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const auth = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [brandPrimaryHex, setBrandPrimaryHex] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);
  const autoPrintDoneRef = useRef(false);

  const countryPolicy = useMemo(() => inferCountryPolicy(auth.user?.user_typology), [auth.user?.user_typology]);

  const defaultValues: Values = useMemo(
    () => ({
      employerEmail: "",
      employerWhatsapp: "",
      employerWebsite: "",
      employerHeadOffice: "",
      employerLegalForm: countryPolicy.defaultLegalForm,
      employerRib: "",
      employerNcc: "",
      employerRccm: "",
      employerDfe: "",
      employeeName: "",
      employeeRole: "",
      periodLabel: "",
      emissionDate: todayISO(),
      baseSalary: 0,
      bonuses: 0,
      transportAllowance: 0,
      otherAllowances: 0,
      cnpsRatePct: 6.3,
      cnpsManualFcfa: 0,
      igrRetentionFcfa: 0,
      familyTaxParts: 1,
      otherDeductions: 0,
      notes: buildAdministrativeClause(countryPolicy, "payslip", { legalForm: countryPolicy.defaultLegalForm })
    }),
    [countryPolicy]
  );

  const form = useForm<Values>({
    resolver: zodResolver(schema) as Resolver<Values>,
    defaultValues,
    mode: "onChange"
  });

  const watched = form.watch();
  const netPay = useMemo(() => computeNet(watched), [watched]);

  useEffect(() => {
    const onIdSynced = (e: Event) => {
      const d = (e as CustomEvent<{ oldId: string; newId: string }>).detail;
      if (d && params.id === d.oldId) {
        navigate(`/dashboard/payslip/${d.newId}`, { replace: true });
      }
    };
    window.addEventListener("docugest:doc-id-synced", onIdSynced);
    return () => window.removeEventListener("docugest:doc-id-synced", onIdSynced);
  }, [params.id, navigate]);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;
    (async () => {
      try {
        const doc = await apiFetch<{
          doc_data: Record<string, unknown>;
          doc_number: string;
        }>(`/api/documents/${params.id}`);
        if (cancelled || !doc?.doc_data) return;
        const raw = doc.doc_data as Partial<Values> & { cnpsEmployee?: number; logoDataUrl?: string | null; brandPrimaryHex?: string | null };
        setLogoDataUrl(typeof raw.logoDataUrl === "string" ? raw.logoDataUrl : null);
        setBrandPrimaryHex(typeof raw.brandPrimaryHex === "string" ? raw.brandPrimaryHex : null);
        const { cnpsEmployee: legacyCnpsAmount, logoDataUrl: _ld, brandPrimaryHex: _bh, ...d } = raw;

        const legacy = typeof legacyCnpsAmount === "number" ? legacyCnpsAmount : 0;
        const hasNewCnps =
          typeof d.cnpsRatePct === "number" ||
          typeof d.cnpsManualFcfa === "number";
        const cnpsRatePct = hasNewCnps
          ? typeof d.cnpsRatePct === "number"
            ? d.cnpsRatePct
            : 6.3
          : legacy > 0
            ? 0
            : 6.3;
        const cnpsManualFcfa = hasNewCnps
          ? typeof d.cnpsManualFcfa === "number"
            ? d.cnpsManualFcfa
            : 0
          : legacy > 0
            ? legacy
            : 0;

        form.reset({
          ...defaultValues,
          ...d,
          cnpsRatePct,
          cnpsManualFcfa,
          igrRetentionFcfa: typeof d.igrRetentionFcfa === "number" ? d.igrRetentionFcfa : 0,
          familyTaxParts: typeof d.familyTaxParts === "number" ? d.familyTaxParts : 1,
          emissionDate: typeof d.emissionDate === "string" ? d.emissionDate : defaultValues.emissionDate
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, defaultValues, form]);

  useEffect(() => {
    if (!auth.user || params.id) return;
    const v = form.getValues();
    if (!v.employerEmail) form.setValue("employerEmail", auth.user.email || "");
    if (!v.employerWhatsapp) form.setValue("employerWhatsapp", auth.user.whatsapp || "");
    if (!v.employerHeadOffice) form.setValue("employerHeadOffice", auth.user.company_address || "");
    if (!v.employerNcc) form.setValue("employerNcc", auth.user.company_ncc || "");
    if (!v.employerRccm) form.setValue("employerRccm", auth.user.company_rccm || "");
    if (!v.employerDfe) form.setValue("employerDfe", auth.user.company_dfe || "");
    if (!v.employerLegalForm) form.setValue("employerLegalForm", countryPolicy.defaultLegalForm);
    if (!v.notes || /Cadre administratif|Conforme aux pratiques administratives/i.test(v.notes)) {
      form.setValue(
        "notes",
        buildAdministrativeClause(countryPolicy, "payslip", {
          legalForm: v.employerLegalForm,
          hasRccm: Boolean(v.employerRccm),
          hasNcc: Boolean(v.employerNcc),
          hasRib: Boolean(v.employerRib)
        })
      );
    }
  }, [auth.user, params.id, form, countryPolicy]);

  useEffect(() => {
    if (params.id) return;
    const v = form.getValues();
    if (!v.notes || /Cadre administratif|Conforme aux pratiques administratives/i.test(v.notes)) {
      form.setValue(
        "notes",
        buildAdministrativeClause(countryPolicy, "payslip", {
          legalForm: v.employerLegalForm,
          hasRccm: Boolean(v.employerRccm),
          hasNcc: Boolean(v.employerNcc),
          hasRib: Boolean(v.employerRib)
        })
      );
    }
  }, [watched.employerLegalForm, watched.employerRccm, watched.employerNcc, watched.employerRib, params.id, form, countryPolicy]);

  const employerName = auth.user?.company_name || "Votre entreprise";
  const employerAddress = auth.user?.company_address || "";
  const employerPhone = auth.user?.phone || "";

  const accentPreview = brandPrimaryHex ? readableOnWhite(brandPrimaryHex) : null;

  const previewPayload = useMemo(
    () => ({
      employerName,
      employerAddress,
      employerPhone,
      employerEmail: watched.employerEmail || auth.user?.email || "",
      employerWhatsapp: watched.employerWhatsapp || auth.user?.whatsapp || "",
      employerWebsite: watched.employerWebsite || "",
      employerHeadOffice: watched.employerHeadOffice || employerAddress,
      employerLegalForm: watched.employerLegalForm || "",
      employerRib: watched.employerRib || "",
      employerNcc: watched.employerNcc || auth.user?.company_ncc || "",
      employerRccm: watched.employerRccm || auth.user?.company_rccm || "",
      employerDfe: watched.employerDfe || auth.user?.company_dfe || "",
      employeeName: watched.employeeName,
      employeeRole: watched.employeeRole,
      periodLabel: watched.periodLabel,
      emissionDate: watched.emissionDate,
      baseSalary: Number(watched.baseSalary),
      transportAllowance: Number(watched.transportAllowance),
      otherAllowances: Number(watched.otherAllowances),
      bonuses: Number(watched.bonuses),
      cnpsRatePct: Number(watched.cnpsRatePct),
      cnpsEmployee: cnpsAmountFromForm(watched),
      igrRetentionFcfa: Number(watched.igrRetentionFcfa),
      familyTaxParts: Number(watched.familyTaxParts),
      otherDeductions: Number(watched.otherDeductions),
      netPay,
      notes: watched.notes,
      logoDataUrl,
      accentHex: accentPreview
    }),
    [employerName, employerAddress, employerPhone, watched, netPay, logoDataUrl, accentPreview, auth.user]
  );

  async function downloadPdf() {
    const source = previewRef.current ?? printRef.current;
    if (!source) return;
    setPdfDownloading(true);
    try {
      const canvas = await html2canvas(source, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`bulletin-${watched.employeeName || "salarie"}.pdf`);
    } finally {
      setPdfDownloading(false);
    }
  }

  useEffect(() => {
    if (autoPrintDoneRef.current) return;
    if (searchParams.get("action") !== "print") return;
    autoPrintDoneRef.current = true;
    const t = setTimeout(() => {
      void downloadPdf();
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, params.id]);

  async function onSave(values: Values) {
    setSaving(true);
    try {
      const net = computeNet(values);
      const doc_data = {
        ...values,
        netPay: net,
        employerSnapshot: { employerName, employerAddress, employerPhone },
        logoDataUrl: logoDataUrl || undefined,
        brandPrimaryHex: brandPrimaryHex || undefined
      };

      if (params.id) {
        const existing = await apiFetch<{ doc_number: string }>(`/api/documents/${params.id}`);
        await apiFetch(`/api/documents/${params.id}`, {
          method: "PUT",
          json: {
            type: "payslip",
            doc_number: existing.doc_number,
            client_name: values.employeeName,
            total_amount: clampMoney(net),
            currency: "FCFA",
            status: "draft",
            doc_data
          }
        });
        navigate(`/dashboard/payslip/${params.id}`);
      } else {
        const doc_number = `BP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
        const created = await apiFetch<{ id: string }>("/api/documents", {
          method: "POST",
          json: {
            type: "payslip",
            doc_number,
            client_name: values.employeeName,
            total_amount: clampMoney(net),
            currency: "FCFA",
            status: "draft",
            doc_data
          }
        });
        navigate(`/dashboard/payslip/${created.id}`);
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-0 px-3 py-4 sm:p-6">
      <div className="mb-4 space-y-3">
        <TrustModelBanner variant="compact" />
        <InlineAdStrip variant="compact" />
      </div>

      <div className="rounded-2xl bg-bg p-4 shadow-soft ring-1 ring-border/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-lg font-bold text-text">Bulletin de salaire</div>
            <div className="text-sm text-slate-600">
              Remplissez le formulaire — le net se met à jour automatiquement selon vos retenues.
            </div>
            <p className="mt-2 text-xs text-slate-500">PDF disponible en bas après vérification des montants.</p>
          </div>
          <Button type="button" className="min-h-11 w-full shrink-0 sm:w-auto" onClick={form.handleSubmit(onSave)} disabled={saving}>
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <form
          className="order-1 min-w-0 space-y-6 rounded-2xl bg-bg p-4 text-[13px] shadow-soft ring-1 ring-border/70 sm:p-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="rounded-xl border border-teal-200/80 bg-teal-50/60 px-4 py-3 ring-1 ring-teal-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-900">Étape 1 — Formulaire</p>
            <p className="mt-1 text-sm text-slate-700">
              Saisissez les informations employeur et salarié ; l’aperçu se met à jour en dessous (mobile) ou à droite (grand
              écran).
            </p>
          </div>
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/70">
            <div className="text-sm font-semibold text-text">Identité employeur</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Logo en haut du bulletin : teintes dominantes détectées automatiquement (local). Sans logo ou pour
              affiner, définissez la couleur principale ci-dessous.
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
                    <span className="font-mono text-[11px] text-slate-600">{brandPrimaryHex}</span>
                  ) : null}
                  <Button type="button" variant="ghost" onClick={() => { setLogoDataUrl(null); setBrandPrimaryHex(null); }}>
                    Retirer
                  </Button>
                </div>
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
            <div className="text-sm font-semibold text-text">Salarié & période</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Nom & prénom" {...form.register("employeeName")} error={form.formState.errors.employeeName?.message} />
              <Input label="Poste / fonction" {...form.register("employeeRole")} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Période (ex. Janvier 2026)" {...form.register("periodLabel")} error={form.formState.errors.periodLabel?.message} />
              <Input label="Date d’émission" type="date" {...form.register("emissionDate")} />
            </div>
          </div>

          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/70">
            <div className="text-sm font-semibold text-text">Mentions entreprise</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Email entreprise" {...form.register("employerEmail")} />
              <Input label="WhatsApp entreprise" {...form.register("employerWhatsapp")} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Site web" {...form.register("employerWebsite")} />
              <Input label="Siège social" {...form.register("employerHeadOffice")} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Forme juridique" {...form.register("employerLegalForm")} />
              <Input label="RIB" {...form.register("employerRib")} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Même logique que sur la facture : sur le <strong>PDF</strong>, si le <strong>NCC / IFU</strong> est renseigné, la{" "}
              <strong>DFE</strong> n’est pas affichée (évite la redondance).
            </p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Input label="RCCM" {...form.register("employerRccm")} />
              <Input label="DFE" {...form.register("employerDfe")} />
            </div>
            <div className="mt-3">
              <Input label="NCC / IFU (n° fiscal)" {...form.register("employerNcc")} />
            </div>
          </div>

          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/70">
            <div className="text-sm font-semibold text-text">Montants & retenues (FCFA)</div>
            <p className="mt-1 text-xs text-slate-600">
              Gains : salaire, primes, transport et indemnités. Retenues : la CNPS salarié est un <strong>taux</strong> appliqué
              sur une base (ici : salaire + primes) ; saisissez aussi l’IGR et autres retenues si elles s’appliquent.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Salaire de base" type="number" {...form.register("baseSalary", { valueAsNumber: true })} />
              <Input label="Primes" type="number" {...form.register("bonuses", { valueAsNumber: true })} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Transport" type="number" {...form.register("transportAllowance", { valueAsNumber: true })} />
              <Input label="Autres indemnités" type="number" {...form.register("otherAllowances", { valueAsNumber: true })} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                label="Taux CNPS salarié (%)"
                type="number"
                step="0.1"
                {...form.register("cnpsRatePct", { valueAsNumber: true })}
              />
              <Input
                label="Montant CNPS manuel (si taux = 0)"
                type="number"
                {...form.register("cnpsManualFcfa", { valueAsNumber: true })}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Base indicative CNPS : salaire + primes. Taux courant secteur privé souvent autour de 6,3 % — à ajuster selon votre
              convention.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="IGR / impôt sur revenu retenu" type="number" {...form.register("igrRetentionFcfa", { valueAsNumber: true })} />
              <Input
                label="Parts (IGR / situation familiale)"
                type="number"
                step="0.5"
                {...form.register("familyTaxParts", { valueAsNumber: true })}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Indiquez le nombre de parts (1 ; 1,5 ; 2 ; 2,5 ; 3…) pour la traçabilité — le calcul détaillé de l’IGR reste à saisir
              en montant.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Autres retenues (cotisations, avances…)" type="number" {...form.register("otherDeductions", { valueAsNumber: true })} />
            </div>
            <div className="mt-5 rounded-xl bg-primary/10 px-4 py-4 text-sm ring-1 ring-primary/20">
              <span className="text-slate-700">Net à payer : </span>
              <span className="font-bold text-primary">{formatFCFA(netPay)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/70">
            <Textarea label="Notes internes" rows={4} {...form.register("notes")} />
          </div>

          <div className="rounded-xl border-2 border-primary/25 bg-gradient-to-br from-primary/[0.06] to-white p-5 ring-1 ring-primary/15">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Étape 2 — Export PDF</p>
            <p className="mt-1 text-sm text-slate-700">Après vérification des montants, générez le fichier PDF.</p>
            <div className="mt-4">
              <Button variant="primary" type="button" onClick={() => void downloadPdf()} disabled={pdfDownloading || saving}>
                {pdfDownloading ? "PDF…" : "Télécharger PDF"}
              </Button>
            </div>
          </div>
        </form>

        <div className="relative order-2 min-w-0 rounded-2xl bg-bg p-4 shadow-soft ring-1 ring-border/70 sm:p-5">
          <div className="xl:sticky xl:top-4">
            <div className="mb-3 text-xs font-semibold text-text">Aperçu en temps réel</div>
            <div
              ref={previewRef}
              className="max-h-[min(70vh,900px)] overflow-x-auto overflow-y-auto rounded-xl bg-slate-100/80 p-2 ring-1 ring-border/50 xl:max-h-[78vh]"
            >
              <PayslipPreview data={previewPayload} />
            </div>
            <div className="pointer-events-none absolute -left-[99999px] top-0 opacity-0">
              <div ref={printRef}>
                <PayslipPreview data={previewPayload} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
