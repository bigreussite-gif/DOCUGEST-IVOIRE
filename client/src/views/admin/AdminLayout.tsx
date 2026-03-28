import { NavLink, Outlet } from "react-router-dom";
import type { AdminSession } from "../../lib/adminApi";

type NavItem = {
  to: string;
  end?: boolean;
  label: string;
  labelShort: string;
  icon: JSX.Element;
  restricted?: boolean;
};

function SvgIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function AdminLayout({ session }: { session: AdminSession }) {
  const { user, roleLabel, canManageUsers } = session;

  const navItems: NavItem[] = [
    {
      to: "/admin", end: true, label: "Vue d'ensemble", labelShort: "Synthèse",
      icon: (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      to: "/admin/documents", label: "Documents", labelShort: "Docs",
      icon: (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    },
    {
      to: "/admin/ads", label: "Publicités", labelShort: "Pub",
      icon: (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      )
    },
    {
      to: "/admin/users", label: "Utilisateurs", labelShort: "Users", restricted: !canManageUsers,
      icon: (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      to: "/admin/audit", label: "Traçabilité", labelShort: "Journal",
      icon: (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    },
    {
      to: "/admin/reports", label: "Rapports & exports", labelShort: "Rapports",
      icon: (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    },
    {
      to: "/admin/growth", label: "Croissance & partenariats", labelShort: "Croissance",
      icon: (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      )
    }
  ];

  const visibleItems = navItems.filter((i) => !i.restricted);

  const sidebarLinkClass = (isActive: boolean) =>
    [
      "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm transition-all duration-150 active:scale-[0.98]",
      isActive
        ? "bg-primary/10 font-semibold text-primary ring-1 ring-primary/20 shadow-xs"
        : "text-slate-600 hover:bg-slate-50 hover:text-text"
    ].join(" ");

  const pillClass = (isActive: boolean) =>
    [
      "shrink-0 flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150 whitespace-nowrap",
      isActive
        ? "bg-primary/10 text-primary ring-1 ring-primary/20 shadow-xs font-semibold"
        : "bg-white/80 text-slate-700 ring-1 ring-slate-200/80 hover:bg-white hover:text-text"
    ].join(" ");

  return (
    <div className="min-h-screen bg-surface text-text">

      {/* ─── Sidebar Desktop ─── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/70 bg-white shadow-xs md:flex">
        {/* Brand */}
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-primary-glow/40">
              DG
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">DocuGest</div>
              <div className="text-sm font-bold text-text leading-tight">Back-office</div>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Live · Données réelles
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {visibleItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => sidebarLinkClass(isActive)}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          <div className="my-2 border-t border-slate-100" />
          <a
            href="/dashboard"
            className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-600 transition hover:bg-white hover:text-text"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Retour à l'application
          </a>
        </nav>

        {/* Footer sidebar */}
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="text-xs text-slate-400">Session admin sécurisée</div>
          <div className="mt-0.5 text-sm font-medium text-text truncate">{user.full_name}</div>
          <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{roleLabel}</span>
        </div>
      </aside>

      {/* ─── Contenu principal (avec offset sidebar) ─── */}
      <div className="md:pl-64 flex flex-col min-h-screen">

        {/* Header sticky */}
        <header className="sticky top-0 z-20 border-b border-slate-200/70 glass shadow-xs px-4 py-3 md:px-8 md:py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Identité mobile */}
            <div className="flex items-center gap-3 md:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white font-bold text-xs shadow-xs">DG</div>
              <div>
                <div className="text-sm font-semibold text-text">{user.full_name}</div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                  <span className="text-[11px] text-slate-500">Admin · {roleLabel}</span>
                </div>
              </div>
            </div>
            {/* Identité desktop */}
            <div className="hidden md:block">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Administration</div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-base font-semibold text-text">{user.full_name}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{roleLabel}</span>
              </div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>

            {/* Nav mobile scroll horizontal */}
            <div className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5">
              {visibleItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => pillClass(isActive)}>
                  {item.icon}
                  <span>{item.labelShort}</span>
                </NavLink>
              ))}
              <a
                href="/dashboard"
                className="shrink-0 flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-200/60 transition hover:text-text whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                App
              </a>
            </div>
          </div>
        </header>

        {/* Contenu page */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">
          <Outlet context={{ session }} />
        </main>

        <footer className="border-t border-slate-200/60 px-4 py-3.5 text-center text-[11px] text-slate-400 md:px-8">
          DocuGest Ivoire · Administration · by Soroboss
        </footer>
      </div>
    </div>
  );
}
