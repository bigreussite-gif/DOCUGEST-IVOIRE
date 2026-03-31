import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getEffectiveAuthUser, useAuthStore } from "../../store/authStore";
import { apiFetch, type ApiError } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { computeInvoiceTotals } from "../../utils/calculations";
import { clampMoney, formatFCFA } from "../../utils/formatters";
import { DEFAULT_VAT_RATE_PCT } from "../../constants/taxes";
import {
  inferCountryPolicy,
  buildAdministrativeClause,
  buildFiscalPaymentTerms
} from "../../lib/francophonePolicy";
import { useAutoSave, readDraft } from "../../hooks/useAutoSave";

const QUICK_INVOICE_DRAFT_KEY = "quick_invoice_draft_v1";

type QuickInvoiceDraftPayload = {
  clientName: string;
  lines: LineDraft[];
  deliveryLabel: string;
  deliveryAmountTtc: string;
  senderCompanyName: string;
  senderPhone: string;
  senderAddress: string;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseMoney(raw: string): number {
  const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

type LineDraft = {
  id: string;
  description: string;
  qty: string;
  amountTtc: string;
};

function newLine(): LineDraft {
  return { id: crypto.randomUUID(), description: "", qty: "1", amountTtc: "" };
}

/** À partir d’un montant TTC de ligne, calcule le prix unitaire HT pour computeInvoiceTotals. */
function lineToDocLine(
  description: string,
  qtyRaw: string,
  amountTtcRaw: string,
  fiscalRegime: "informal" | "formal",
  vatRatePct: number
) {
  const q = Math.max(1, Math.floor(Number(qtyRaw) || 1));
  const ttc = parseMoney(amountTtcRaw);
  if (!description.trim() || ttc <= 0) return null;

  let unitPriceHT = 0;
  if (fiscalRegime === "informal") {
    unitPriceHT = ttc / q;
  } else {
    const baseHT = ttc / (1 + vatRatePct / 100);
    unitPriceHT = baseHT / q;
  }

  return {
    description: description.trim(),
    quantity: q,
    unit: "Pièce",
    unitPriceHT: Math.round(unitPriceHT * 100) / 100,
    discountPct: 0
  };
}

const LINE_PRESETS: { label: string; description: string }[] = [
  { label: "Article", description: "Article" },
  { label: "Service", description: "Prestation" },
  { label: "Pack", description: "Pack / lot" },
  { label: "Abonnement", description: "Abonnement" }
];

/**
 * Facture e-commerce express : plusieurs produits/services, frais de livraison optionnels,
 * puis création + ouverture pour export PDF rapide (?action=print).
 */
export default function QuickInvoiceEditor() {
  const navigate = useNavigate();
  const auth = useAuthStore();
  const [saving, setSaving] = useState(false);
  const quickDraft = useMemo(() => readDraft<QuickInvoiceDraftPayload>(QUICK_INVOICE_DRAFT_KEY), []);
  const [clientName, setClientName] = useState(() => quickDraft?.clientName ?? "");
  const [lines, setLines] = useState<LineDraft[]>(() =>
    quickDraft?.lines?.length ? quickDraft.lines : [newLine()]
  );
  const [deliveryLabel, setDeliveryLabel] = useState(() => quickDraft?.deliveryLabel ?? "Frais de livraison");
  const [deliveryAmountTtc, setDeliveryAmountTtc] = useState(() => quickDraft?.deliveryAmountTtc ?? "");
  const [senderCompanyName, setSenderCompanyName] = useState(() => quickDraft?.senderCompanyName ?? "");
  const [senderPhone, setSenderPhone] = useState(() => quickDraft?.senderPhone ?? "");
  const [senderAddress, setSenderAddress] = useState(() => quickDraft?.senderAddress ?? "");
  const clientRef = useRef<HTMLInputElement>(null);

  const quickDraftPayload = useMemo(
    () =>
      ({
        clientName,
        lines,
        deliveryLabel,
        deliveryAmountTtc,
        senderCompanyName,
        senderPhone,
        senderAddress
      }) satisfies QuickInvoiceDraftPayload,
    [clientName, lines, deliveryLabel, deliveryAmountTtc, senderCompanyName, senderPhone, senderAddress]
  );
  useAutoSave(QUICK_INVOICE_DRAFT_KEY, quickDraftPayload);

  useEffect(() => {
    const u = getEffectiveAuthUser();
    if (!u) return;
    setSenderCompanyName((s) => s || u.company_name || "");
    setSenderPhone((s) => s || u.phone || "");
    setSenderAddress((s) => s || u.company_address || "");
  }, [auth.user]);

  const countryPolicy = useMemo(() => inferCountryPolicy(auth.user?.user_typology), [auth.user?.user_typology]);
  const fiscalRegime = countryPolicy.defaultFiscalRegime;
  const vatRatePct = fiscalRegime === "formal" ? countryPolicy.vatRatePct : 0;

  const docLinesPreview = useMemo(() => {
    const out: ReturnType<typeof lineToDocLine>[] = [];
    for (const row of lines) {
      const l = lineToDocLine(row.description, row.qty, row.amountTtc, fiscalRegime, vatRatePct);
      if (l) out.push(l);
    }
    const del = parseMoney(deliveryAmountTtc);
    if (del > 0 && deliveryLabel.trim()) {
      const l = lineToDocLine(deliveryLabel.trim(), "1", deliveryAmountTtc, fiscalRegime, vatRatePct);
      if (l) out.push(l);
    }
    return out.filter(Boolean) as NonNullable<ReturnType<typeof lineToDocLine>>[];
  }, [lines, deliveryAmountTtc, deliveryLabel, fiscalRegime, vatRatePct]);

  const totalsPreview = useMemo(() => {
    if (docLinesPreview.length === 0) {
      return { totalTTC: 0, vatAmount: 0 };
    }
    return computeInvoiceTotals({
      lines: docLinesPreview,
      fiscalRegime,
      globalDiscountPct: 0,
      vatRatePct: fiscalRegime === "formal" ? vatRatePct : DEFAULT_VAT_RATE_PCT
    });
  }, [docLinesPreview, fiscalRegime, vatRatePct]);

  useEffect(() => {
    const t = window.setTimeout(() => clientRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, []);

  function updateLine(id: string, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addLine(preset?: { description: string }) {
    setLines((prev) => [...prev, { ...newLine(), description: preset?.description ?? "" }]);
  }

  function removeLine(id: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  async function runCreate(mode: "draft" | "export") {
    const sessionUser = getEffectiveAuthUser();
    if (!sessionUser) {
      alert("Session indisponible. Rechargez la page ou reconnectez-vous.");
      return;
    }
    if (!clientName.trim()) {
      alert("Indiquez le nom du client.");
      return;
    }
    if (!senderCompanyName.trim() && !sessionUser.company_name) {
      alert("Indiquez le nom de votre entreprise (affiché sur la facture).");
      return;
    }
    if (!senderPhone.trim() && !sessionUser.phone) {
      alert("Indiquez le numéro de téléphone de votre entreprise (ou complétez votre profil).");
      return;
    }
    if (!senderAddress.trim() && !sessionUser.company_address) {
      alert("Indiquez l’adresse de votre entreprise (ou complétez votre profil).");
      return;
    }
    if (docLinesPreview.length === 0) {
      alert("Ajoutez au moins une ligne avec libellé et montant TTC (> 0).");
      return;
    }

    const totals = computeInvoiceTotals({
      lines: docLinesPreview,
      fiscalRegime,
      globalDiscountPct: 0,
      vatRatePct: fiscalRegime === "formal" ? vatRatePct : DEFAULT_VAT_RATE_PCT
    });
    const totalTtc = clampMoney(totals.totalTTC);
    if (!Number.isFinite(totalTtc) || totalTtc <= 0) {
      alert("Le total de la facture est invalide. Vérifiez les montants.");
      return;
    }

    const year = new Date().getFullYear();
    const docNumber = `FAC-${year}-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const companyName = senderCompanyName.trim() || sessionUser.company_name || "";
    const companyPhone = senderPhone.trim() || sessionUser.phone || "";
    const companyAddress = senderAddress.trim() || sessionUser.company_address || "";

    const doc_data = {
      sender: {
        companyName,
        address: companyAddress,
        phone: companyPhone,
        email: sessionUser.email ?? "",
        headOffice: companyAddress,
        legalForm: countryPolicy.defaultLegalForm,
        rib: "",
        ncc: sessionUser.company_ncc ?? "",
        rccm: sessionUser.company_rccm ?? "",
        dfe: sessionUser.company_dfe ?? "",
        website: "",
        whatsapp: sessionUser.whatsapp ?? ""
      },
      client: {
        name: clientName.trim(),
        address: "",
        phone: "",
        email: ""
      },
      docNumber,
      emissionDate: todayISO(),
      dueDateText: "Net 30",
      dueDateMode: "net30" as const,
      dueDateManual: "",
      fiscalRegime,
      lines: docLinesPreview,
      globalDiscountPct: 0,
      vatRatePct,
      conditions: buildFiscalPaymentTerms(countryPolicy, vatRatePct),
      footerNote: buildAdministrativeClause(countryPolicy, "invoice", {
        legalForm: countryPolicy.defaultLegalForm,
        hasRccm: Boolean(sessionUser.company_rccm),
        hasNcc: Boolean(sessionUser.company_ncc),
        hasRib: false
      })
    };

    const payload = {
      type: "invoice" as const,
      doc_number: docNumber,
      client_name: clientName.trim(),
      total_amount: totalTtc,
      currency: "FCFA",
      status: "draft" as const,
      doc_data
    };

    setSaving(true);
    try {
      const created = await apiFetch<{ id?: string }>("/api/documents", {
        method: "POST",
        json: payload
      });
      const id = created?.id;
      if (!id || typeof id !== "string") {
        alert("Réponse serveur inattendue : identifiant du document manquant.");
        return;
      }
      const next =
        mode === "export"
          ? `/dashboard/invoice/${id}?action=print`
          : `/dashboard/invoice/${id}`;
      navigate(next, { replace: true });
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as ApiError).message)
          : "Erreur réseau ou serveur.";
      alert(`Impossible d’enregistrer la facture express : ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Facture express</p>
          <h1 className="text-2xl font-bold text-slate-900">E-commerce — panier & livraison</h1>
          <p className="mt-1 text-sm text-slate-600">
            Plusieurs lignes en TTC, frais de livraison optionnels, puis PDF ou impression.
          </p>
          <p className="mt-1 text-xs text-slate-500">Sauvegarde locale automatique dans ce navigateur.</p>
        </div>
        <Link
          to="/dashboard/invoice/new?type=invoice"
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Mode avancé
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runCreate("export");
        }}
        className="space-y-5 rounded-2xl border border-teal-200/60 bg-white p-5 shadow-lg shadow-teal-900/5 ring-1 ring-slate-100 sm:p-6"
      >
        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 ring-1 ring-teal-100/80">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-900">Votre entreprise (sur la facture)</p>
          <p className="mt-1 text-xs text-slate-600">
            Ces informations figurent en en-tête. Elles sont préremplies depuis votre profil si disponible.
          </p>
          <div className="mt-4 space-y-3">
            <Input
              label="Nom de l’entreprise"
              autoComplete="organization"
              value={senderCompanyName}
              onChange={(e) => setSenderCompanyName(e.target.value)}
              placeholder="Ex. SARL Mon Commerce"
            />
            <Input
              label="Téléphone / WhatsApp pro"
              autoComplete="tel"
              inputMode="tel"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="Ex. +225 07 00 00 00 00"
            />
            <Textarea
              label="Adresse complète"
              rows={3}
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              placeholder="Quartier, ville, pays…"
            />
          </div>
        </div>

        <Input
          ref={clientRef}
          label="Nom du client"
          autoComplete="name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Ex. Boutique Alpha"
        />

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-text">Produits & services (montants TTC)</span>
            <div className="flex flex-wrap gap-1.5">
              {LINE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="rounded-lg border border-teal-200 bg-teal-50/80 px-2 py-1 text-[11px] font-medium text-teal-900 transition hover:bg-teal-100"
                  onClick={() => addLine({ description: p.description })}
                >
                  + {p.label}
                </button>
              ))}
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => addLine()}
              >
                + Ligne vide
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {lines.map((row, idx) => (
              <div
                key={row.id}
                className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 ring-1 ring-slate-100/80"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ligne {idx + 1}</span>
                  {lines.length > 1 ? (
                    <button
                      type="button"
                      className="text-xs text-rose-600 underline"
                      onClick={() => removeLine(row.id)}
                    >
                      Retirer
                    </button>
                  ) : null}
                </div>
                <Input
                  label="Libellé"
                  value={row.description}
                  onChange={(e) => updateLine(row.id, { description: e.target.value })}
                  placeholder="Ex. Sneakers — ref. 2044"
                />
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Input
                    label="Qté"
                    inputMode="numeric"
                    value={row.qty}
                    onChange={(e) => updateLine(row.id, { qty: e.target.value })}
                    placeholder="1"
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Montant TTC (FCFA)"
                      inputMode="decimal"
                      value={row.amountTtc}
                      onChange={(e) => updateLine(row.id, { amountTtc: e.target.value })}
                      placeholder="15000"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-amber-200/90 bg-amber-50/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/90">Frais de livraison (optionnel)</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input
              label="Libellé"
              value={deliveryLabel}
              onChange={(e) => setDeliveryLabel(e.target.value)}
              placeholder="Frais de livraison"
            />
            <Input
              label="Montant TTC (FCFA)"
              inputMode="decimal"
              value={deliveryAmountTtc}
              onChange={(e) => setDeliveryAmountTtc(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium">Total estimé (TTC)</span>
          <span className="text-xl font-bold tabular-nums">{formatFCFA(totalsPreview.totalTTC)}</span>
        </div>
        {fiscalRegime === "formal" ? (
          <p className="text-xs text-slate-500">
            TVA {vatRatePct}% incluse dans les montants TTC saisis — pays {countryPolicy.label}.
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            Régime {fiscalRegime} — montants TTC saisis tels quels ({countryPolicy.label}).
          </p>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
          <Link
            to="/dashboard"
            className="inline-flex h-11 min-h-[44px] w-full items-center justify-center rounded-lg border border-border/70 px-4 text-sm font-semibold text-text transition hover:bg-surface sm:w-auto sm:min-w-[8rem]"
          >
            Annuler
          </Link>
          <Button
            type="button"
            variant="secondary"
            className="h-11 min-h-[44px] w-full sm:w-auto sm:min-w-[12rem]"
            disabled={saving}
            onClick={() => void runCreate("draft")}
          >
            {saving ? "Enregistrement…" : "Enregistrer (brouillon)"}
          </Button>
          <Button type="submit" variant="primary" className="h-11 min-h-[44px] w-full sm:w-auto sm:min-w-[14rem]" disabled={saving}>
            {saving ? "Création…" : "Créer & ouvrir le PDF"}
          </Button>
        </div>
        <p className="text-center text-[11px] text-slate-500">
          Après création : télécharger, imprimer ou sauvegarder depuis l’écran d’édition.
        </p>
      </form>
    </div>
  );
}
