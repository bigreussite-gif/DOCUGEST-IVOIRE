import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
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
import { extractBrandColorsFromFile, fileToDataUrl, readableOnWhite } from "../../lib/brandColors";

const schema = z.object({
  employeeName: z.string().min(2, "Nom requis"),
  employeeRole: z.string().default(""),
  periodLabel: z.string().min(2, "Période requise (ex. Janvier 2026)"),
  emissionDate: z.string().min(1),
  baseSalary: z.number().min(0),
  bonuses: z.number().min(0).default(0),
  transportAllowance: z.number().min(0).default(0),
  otherAllowances: z.number().min(0).default(0),
  cnpsEmployee: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),
  notes: z.string().default("")
});

type Values = z.infer<typeof schema>;

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeNet(v: Values) {
  const gross =
    Number(v.baseSalary) + Number(v.bonuses) + Number(v.transportAllowance) + Number(v.otherAllowances);
  const ded = Number(v.cnpsEmployee) + Number(v.otherDeductions);
  return clampMoney(Math.max(0, gross - ded));
}

export default function PayslipEditor() {
  const navigate = useNavigate();
  const params = useParams();
  const auth = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [brandPrimaryHex, setBrandPrimaryHex] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const defaultValues: Values = useMemo(
    () => ({
      employeeName: "",
      employeeRole: "",
      periodLabel: "",
      emissionDate: todayISO(),
      baseSalary: 0,
      bonuses: 0,
      transportAllowance: 0,
      otherAllowances: 0,
      cnpsEmployee: 0,
      otherDeductions: 0,
      notes: ""
    }),
    []
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
        const d = doc.doc_data as Partial<Values> & {
          logoDataUrl?: string | null;
          brandPrimaryHex?: string | null;
        };
        setLogoDataUrl(typeof d.logoDataUrl === "string" ? d.logoDataUrl : null);
        setBrandPrimaryHex(typeof d.brandPrimaryHex === "string" ? d.brandPrimaryHex : null);
        form.reset({
          ...defaultValues,
          ...d,
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

  const employerName = auth.user?.company_name || "Votre entreprise";
  const employerAddress = auth.user?.company_address || "";
  const employerPhone = auth.user?.phone || "";

  const accentPreview = brandPrimaryHex ? readableOnWhite(brandPrimaryHex) : null;

  const previewPayload = useMemo(
    () => ({
      employerName,
      employerAddress,
      employerPhone,
      employeeName: watched.employeeName,
      employeeRole: watched.employeeRole,
      periodLabel: watched.periodLabel,
      emissionDate: watched.emissionDate,
      baseSalary: Number(watched.baseSalary),
      transportAllowance: Number(watched.transportAllowance),
      otherAllowances: Number(watched.otherAllowances),
      bonuses: Number(watched.bonuses),
      cnpsEmployee: Number(watched.cnpsEmployee),
      otherDeductions: Number(watched.otherDeductions),
      netPay,
      notes: watched.notes,
      logoDataUrl,
      accentHex: accentPreview
    }),
    [employerName, employerAddress, employerPhone, watched, netPay, logoDataUrl, accentPreview]
  );

  async function downloadPdf() {
    if (!previewRef.current) return;
    setPdfDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
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
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <InlineAdStrip variant="compact" />
      </div>

      <div className="rounded-2xl bg-bg p-4 shadow-soft ring-1 ring-border/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-bold text-text">Bulletin de salaire</div>
            <div className="text-sm text-slate-600">Saisissez les montants — le net est calculé automatiquement.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" type="button" onClick={downloadPdf} disabled={pdfDownloading || saving}>
              {pdfDownloading ? "PDF…" : "Télécharger PDF"}
            </Button>
            <Button type="button" onClick={form.handleSubmit(onSave)} disabled={saving}>
              {saving ? "Sauvegarde…" : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <form className="space-y-6 rounded-2xl bg-bg p-5 text-[13px] shadow-soft ring-1 ring-border/70" onSubmit={(e) => e.preventDefault()}>
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/70">
            <div className="text-sm font-semibold text-text">Identité employeur</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Logo affiché en haut du bulletin — couleurs détectées automatiquement (local).
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
            <div className="text-sm font-semibold text-text">Montants (FCFA)</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Salaire de base" type="number" {...form.register("baseSalary", { valueAsNumber: true })} />
              <Input label="Primes" type="number" {...form.register("bonuses", { valueAsNumber: true })} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Transport" type="number" {...form.register("transportAllowance", { valueAsNumber: true })} />
              <Input label="Autres indemnités" type="number" {...form.register("otherAllowances", { valueAsNumber: true })} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="CNPS / retenues sociales" type="number" {...form.register("cnpsEmployee", { valueAsNumber: true })} />
              <Input label="Autres déductions" type="number" {...form.register("otherDeductions", { valueAsNumber: true })} />
            </div>
            <div className="mt-5 rounded-xl bg-primary/10 px-4 py-4 text-sm ring-1 ring-primary/20">
              <span className="text-slate-700">Net à payer : </span>
              <span className="font-bold text-primary">{formatFCFA(netPay)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/70">
            <Textarea label="Notes internes" rows={4} {...form.register("notes")} />
          </div>
        </form>

        <div className="rounded-2xl bg-bg p-5 shadow-soft ring-1 ring-border/70">
          <div className="sticky top-20 md:top-4">
            <div className="mb-3 text-xs font-semibold text-text">Aperçu en temps réel</div>
            <div ref={previewRef} className="max-h-[78vh] overflow-auto rounded-xl bg-slate-100/80 p-2 ring-1 ring-border/50">
              <PayslipPreview data={previewPayload} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
