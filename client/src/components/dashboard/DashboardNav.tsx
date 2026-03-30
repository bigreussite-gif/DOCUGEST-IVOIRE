import { NavLink, useLocation } from "react-router-dom";

type Props = {
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
  className?: string;
};

const inactive =
  "text-slate-600 hover:bg-surface hover:text-text ring-1 ring-transparent hover:ring-border/70";
const active =
  "bg-gradient-to-r from-primary/15 to-secondary/10 text-text font-semibold ring-2 ring-primary/35 shadow-sm";

export function DashboardNav({ orientation = "horizontal", onNavigate, className = "" }: Props) {
  const { pathname, search, hash } = useLocation();
  const q = new URLSearchParams(search);

  const isDocumentsSection =
    (pathname === "/dashboard" || pathname === "/dashboard/") && hash === "#documents";
  const isTableauOnly = (pathname === "/dashboard" || pathname === "/dashboard/") && hash !== "#documents";

  const isExpressEcommerce = pathname.startsWith("/dashboard/invoice/express");
  const isFacture =
    pathname.startsWith("/dashboard/invoice") &&
    !isExpressEcommerce &&
    q.get("type") !== "proforma" &&
    q.get("type") !== "devis";
  const isProforma =
    pathname.startsWith("/dashboard/invoice") && (q.get("type") === "proforma" || q.get("type") === "devis");
  const isPayslip = pathname.startsWith("/dashboard/payslip");
  const isCV = pathname.startsWith("/dashboard/cv");
  const isLettre = pathname.startsWith("/dashboard/lettre-motivation");
  const isContratTravail = pathname.startsWith("/dashboard/contrat-travail");
  const isBonCommande = pathname.startsWith("/dashboard/bon-commande");
  const isBonLivraison = pathname.startsWith("/dashboard/bon-livraison");
  const isRecu = pathname.startsWith("/dashboard/recu-paiement");
  const isContratPrestation = pathname.startsWith("/dashboard/contrat-prestation");
  const isProfile = pathname.startsWith("/dashboard/profile");

  const wrap =
    orientation === "horizontal"
      ? "flex flex-nowrap items-center gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 xl:justify-center [&::-webkit-scrollbar]:hidden"
      : "flex flex-col gap-1";

  const itemClass = (on: boolean) =>
    [
      "rounded-2xl px-4 py-3 text-sm transition-all duration-200 ease-out",
      orientation === "vertical" ? "min-h-[48px] w-full text-left" : "min-h-[48px] whitespace-nowrap",
      on ? active : inactive
    ].join(" ");

  if (orientation === "vertical") {
    return (
      <nav className={`${wrap} ${className}`} aria-label="Navigation principale">
        <NavLink to="/dashboard" end className={() => itemClass(isTableauOnly)} onClick={onNavigate}>
          🏠 Tableau de bord
        </NavLink>
        <p className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Commercial</p>
        <NavLink to="/dashboard/invoice/new?type=invoice" className={() => itemClass(isFacture)} onClick={onNavigate}>
          📄 Facture
        </NavLink>
        <NavLink to="/dashboard/invoice/new?type=proforma" className={() => itemClass(isProforma)} onClick={onNavigate}>
          📋 Proforma / Devis
        </NavLink>
        <NavLink to="/dashboard/bon-commande/new" className={() => itemClass(isBonCommande)} onClick={onNavigate}>
          📝 Bon de commande
        </NavLink>
        <NavLink to="/dashboard/bon-livraison/new" className={() => itemClass(isBonLivraison)} onClick={onNavigate}>
          🚚 Bon de livraison
        </NavLink>
        <NavLink to="/dashboard/recu-paiement/new" className={() => itemClass(isRecu)} onClick={onNavigate}>
          🧾 Reçu de paiement
        </NavLink>
        <NavLink to="/dashboard/invoice/express" className={() => itemClass(isExpressEcommerce)} onClick={onNavigate}>
          🛒 E-commerce
        </NavLink>
        <p className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Emploi & RH</p>
        <NavLink to="/dashboard/payslip/new" className={() => itemClass(isPayslip)} onClick={onNavigate}>
          💼 Bulletin de salaire
        </NavLink>
        <NavLink to="/dashboard/contrat-travail/new" className={() => itemClass(isContratTravail)} onClick={onNavigate}>
          🤝 Contrat de travail
        </NavLink>
        <NavLink to="/dashboard/cv/new" className={() => itemClass(isCV)} onClick={onNavigate}>
          👤 CV Professionnel
        </NavLink>
        <NavLink to="/dashboard/lettre-motivation/new" className={() => itemClass(isLettre)} onClick={onNavigate}>
          ✉️ Lettre de motivation
        </NavLink>
        <p className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Juridique</p>
        <NavLink to="/dashboard/contrat-prestation/new" className={() => itemClass(isContratPrestation)} onClick={onNavigate}>
          📜 Contrat de prestation
        </NavLink>
        <p className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Compte</p>
        <NavLink to="/dashboard#documents" className={() => itemClass(isDocumentsSection)} onClick={onNavigate}>
          📂 Mes documents
        </NavLink>
        <NavLink to="/dashboard/profile" className={() => itemClass(isProfile)} onClick={onNavigate}>
          ⚙️ Profil
        </NavLink>
      </nav>
    );
  }

  return (
    <nav className={`${wrap} ${className}`} aria-label="Navigation principale">
      <NavLink to="/dashboard" end className={() => itemClass(isTableauOnly)} onClick={onNavigate}>
        Accueil
      </NavLink>
      <NavLink to="/dashboard/invoice/new?type=invoice" className={() => itemClass(isFacture)} onClick={onNavigate}>
        Facture
      </NavLink>
      <NavLink to="/dashboard/payslip/new" className={() => itemClass(isPayslip)} onClick={onNavigate}>
        Bulletin
      </NavLink>
      <NavLink to="/dashboard/bon-commande/new" className={() => itemClass(isBonCommande)} onClick={onNavigate}>
        Bon de commande
      </NavLink>
      <NavLink to="/dashboard/bon-livraison/new" className={() => itemClass(isBonLivraison)} onClick={onNavigate}>
        Bon de livraison
      </NavLink>
      <NavLink to="/dashboard/recu-paiement/new" className={() => itemClass(isRecu)} onClick={onNavigate}>
        Reçu
      </NavLink>
      <NavLink to="/dashboard/cv/new" className={() => itemClass(isCV)} onClick={onNavigate}>
        CV
      </NavLink>
      <NavLink to="/dashboard/lettre-motivation/new" className={() => itemClass(isLettre)} onClick={onNavigate}>
        Lettre de motivation
      </NavLink>
      <NavLink to="/dashboard/contrat-travail/new" className={() => itemClass(isContratTravail)} onClick={onNavigate}>
        Contrat travail
      </NavLink>
      <NavLink to="/dashboard/contrat-prestation/new" className={() => itemClass(isContratPrestation)} onClick={onNavigate}>
        Prestation
      </NavLink>
      <NavLink to="/dashboard#documents" className={() => itemClass(isDocumentsSection)} onClick={onNavigate}>
        Mes documents
      </NavLink>
      <NavLink to="/dashboard/profile" className={() => itemClass(isProfile)} onClick={onNavigate}>
        Profil
      </NavLink>
    </nav>
  );
}
