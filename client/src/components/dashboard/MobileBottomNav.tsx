import { useLocation, Link } from "react-router-dom";

const tabs = [
  {
    to: "/dashboard",
    exact: true,
    label: "Accueil",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    to: "/dashboard/invoice/new?type=invoice",
    matchPrefix: "/dashboard/invoice",
    label: "Facture",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  },
  {
    to: "/dashboard/payslip/new",
    matchPrefix: "/dashboard/payslip",
    label: "Salaire",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    )
  },
  {
    to: "/dashboard#documents",
    matchHash: "#documents",
    label: "Documents",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    to: "/dashboard/profile",
    matchPrefix: "/dashboard/profile",
    label: "Profil",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }
];

export function MobileBottomNav() {
  const { pathname, hash } = useLocation();

  function isActive(tab: typeof tabs[number]) {
    if (tab.matchHash) {
      return pathname.startsWith("/dashboard") && hash === tab.matchHash;
    }
    if (tab.matchPrefix) {
      return pathname.startsWith(tab.matchPrefix);
    }
    if (tab.exact) {
      return (pathname === "/dashboard" || pathname === "/dashboard/") && hash !== "#documents";
    }
    return false;
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200/80 glass bottom-nav-safe lg:hidden"
      aria-label="Navigation principale"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-all duration-150 active:scale-[0.92]",
                active ? "text-primary" : "text-slate-500 hover:text-slate-700"
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={[
                  "flex h-6 w-6 items-center justify-center transition-transform duration-150",
                  active ? "scale-110" : ""
                ].join(" ")}
                aria-hidden
              >
                {tab.icon(active)}
              </span>
              <span className={active ? "font-semibold" : ""}>{tab.label}</span>
              {active ? (
                <span className="absolute -bottom-px h-0.5 w-8 rounded-full bg-primary" aria-hidden />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
