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
        E-commerce
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
