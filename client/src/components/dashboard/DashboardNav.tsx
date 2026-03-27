import { NavLink, useLocation } from "react-router-dom";

type Props = {
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
  className?: string;
};

const inactive =
  "text-slate-600 hover:bg-surface hover:text-text ring-1 ring-transparent hover:ring-border/70";
const active =
  "bg-gradient-to-r from-primary/15 to-secondary/10 text-text font-semibold ring-2 ring-primary/40 shadow-sm";

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
  const isProfile = pathname.startsWith("/dashboard/profile");

  const wrap =
    orientation === "horizontal"
      ? "flex flex-wrap items-center gap-1 sm:gap-2 xl:justify-center"
      : "flex flex-col gap-1";

  const itemClass = (on: boolean) =>
    [
      "rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ease-out",
      orientation === "vertical" ? "min-h-[44px] w-full text-left" : "min-h-[40px] whitespace-nowrap",
      on ? active : inactive
    ].join(" ");

  return (
    <nav className={`${wrap} ${className}`} aria-label="Navigation principale">
      <NavLink to="/dashboard" end className={() => itemClass(isTableauOnly)} onClick={onNavigate}>
        Tableau de bord
      </NavLink>
      <NavLink
        to="/dashboard/invoice/new?type=invoice"
        className={() => itemClass(isFacture)}
        onClick={onNavigate}
      >
        Facture
      </NavLink>
      <NavLink
        to="/dashboard/invoice/express"
        className={() => itemClass(isExpressEcommerce)}
        onClick={onNavigate}
      >
        E-commerce rapide
      </NavLink>
      <NavLink
        to="/dashboard/invoice/new?type=proforma"
        className={() => itemClass(isProforma)}
        onClick={onNavigate}
      >
        Proforma / Devis
      </NavLink>
      <NavLink to="/dashboard/payslip/new" className={() => itemClass(isPayslip)} onClick={onNavigate}>
        Bulletin de salaire
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
