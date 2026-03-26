import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { apiFetch } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { computeInvoiceTotals } from "../../utils/calculations";
import { clampMoney } from "../../utils/formatters";
import { DEFAULT_VAT_RATE_PCT } from "../../constants/taxes";
import {
  inferCountryPolicy,
  buildAdministrativeClause,
  buildFiscalPaymentTerms
} from "../../lib/francophonePolicy";

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

/**
 * Mode express e-commerce : champs minimaux, création d’une facture indépendante (nouvelle route).
 */
export default function QuickInvoiceEditor() {
  const navigate = useNavigate();
  const auth = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [clientName, setClientName] = useState("");
  const [product, setProduct] = useState("");
  const [amountTtc, setAmountTtc] = useState("");
  const [qty, setQty] = useState("1");
  const clientRef = useRef<HTMLInputElement>(null);

  const countryPolicy = useMemo(() => inferCountryPolicy(auth.user?.user_typology), [auth.user?.user_typology]);

  useEffect(() => {
    const t = window.setTimeout(() => clientRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.user) return;
    const q = Math.max(1, Math.floor(Number(qty) || 1));
    const ttc = parseMoney(amountTtc);
    if (!clientName.trim() || !product.trim() || ttc <= 0) {
      alert("Indiquez le client, le produit et un montant TTC valide.");
      return;
    }

    const fiscalRegime = countryPolicy.defaultFiscalRegime;
    const vatRatePct = fiscalRegime === "formal" ? countryPolicy.vatRatePct : 0;

    let unitPriceHT = 0;
    if (fiscalRegime === "informal") {
      unitPriceHT = ttc / q;
    } else {
      const baseHT = ttc / (1 + vatRatePct / 100);
      unitPriceHT = baseHT / q;
    }

    const lines = [
      {
        description: product.trim(),
        quantity: q,
        unit: "Pièce",
        unitPriceHT: Math.round(unitPriceHT * 100) / 100,
        discountPct: 0
      }
    ];

    const totals = computeInvoiceTotals({
      lines,
      fiscalRegime,
      globalDiscountPct: 0,
      vatRatePct: fiscalRegime === "formal" ? vatRatePct : DEFAULT_VAT_RATE_PCT
    });

    const year = new Date().getFullYear();
    const docNumber = `FAC-${year}-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const doc_data = {
      sender: {
        companyName: auth.user.company_name ?? "",
        address: auth.user.company_address ?? "",
        phone: auth.user.phone ?? "",
        email: auth.user.email ?? "",
        headOffice: auth.user.company_address ?? "",
        legalForm: countryPolicy.defaultLegalForm,
        rib: "",
        ncc: auth.user.company_ncc ?? "",
        rccm: auth.user.company_rccm ?? "",
        dfe: auth.user.company_dfe ?? "",
        website: "",
        whatsapp: auth.user.whatsapp ?? ""
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
      lines,
      globalDiscountPct: 0,
      vatRatePct,
      conditions: buildFiscalPaymentTerms(countryPolicy, vatRatePct),
      footerNote: buildAdministrativeClause(countryPolicy, "invoice", {
        legalForm: countryPolicy.defaultLegalForm,
        hasRccm: Boolean(auth.user.company_rccm),
        hasNcc: Boolean(auth.user.company_ncc),
        hasRib: false
      })
    };

    const payload = {
      type: "invoice" as const,
      doc_number: docNumber,
      client_name: clientName.trim(),
      total_amount: clampMoney(totals.totalTTC),
      currency: "FCFA",
      status: "draft" as const,
      doc_data
    };

    setSaving(true);
    try {
      const created = await apiFetch<{ id: string }>("/api/documents", {
        method: "POST",
        json: payload
      });
      navigate(`/dashboard/invoice/${created.id}`, { replace: true });
    } catch {
      alert("Impossible d’enregistrer la facture express.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Facture express</p>
          <h1 className="text-2xl font-bold text-slate-900">E-commerce — saisie rapide</h1>
          <p className="mt-1 text-sm text-slate-600">Quelques secondes, client devant vous.</p>
        </div>
        <Link
          to="/dashboard/invoice/new?type=invoice"
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Mode avancé
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-teal-200/60 bg-white p-5 shadow-lg shadow-teal-900/5 ring-1 ring-slate-100"
      >
        <Input
          ref={clientRef}
          label="Nom du client"
          autoComplete="name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Ex. Boutique Alpha"
        />
        <Input
          label="Produit ou service"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="Ex. Commande #4521 — livraison"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Montant TTC (FCFA)"
            inputMode="decimal"
            value={amountTtc}
            onChange={(e) => setAmountTtc(e.target.value)}
            placeholder="15000"
          />
          <Input
            label="Quantité"
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="1"
          />
        </div>
        <p className="text-xs text-slate-500">
          TVA appliquée selon votre pays ({countryPolicy.label}) — régime {countryPolicy.defaultFiscalRegime}.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border/70 px-4 text-sm font-semibold text-text transition hover:bg-surface"
          >
            Annuler
          </Link>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Création…" : "Créer la facture"}
          </Button>
        </div>
      </form>
    </div>
  );
}
