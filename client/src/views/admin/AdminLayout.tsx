import { NavLink, Outlet } from "react-router-dom";
import type { AdminSession } from "../../lib/adminApi";

const inactive = "text-slate-600 hover:bg-slate-100 hover:text-text";
const active = "bg-primary/10 font-semibold text-primary ring-2 ring-primary/20 shadow-sm";
const navItemBase =
  "flex min-h-[48px] items-center rounded-2xl px-3.5 py-2.5 text-sm transition-colors duration-150";
const mobileNavScroll =
  "flex max-w-full gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function AdminLayout({ session }: { session: AdminSession }) {
  const { user, roleLabel, canManageUsers } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-emerald-50/40 text-text">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur md:flex">
        <div className="border-b border-slate-100 px-4 py-5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">DocuGest Ivoire</div>
          <div className="mt-1 text-lg font-bold text-text">Admin Control Room</div>
          <div className="mt-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            Donnees live pour pilotage
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavLink to="/admin" end className={({ isActive }) => `${navItemBase} ${isActive ? active : inactive}`}>
            Vue investisseur
          </NavLink>
          <NavLink to="/admin/documents" className={({ isActive }) => `${navItemBase} ${isActive ? active : inactive}`}>
            Documents (tableau)
          </NavLink>
          <NavLink to="/admin/ads" className={({ isActive }) => `${navItemBase} ${isActive ? active : inactive}`}>
            Affichages pub
          </NavLink>
          {canManageUsers ? (
            <NavLink to="/admin/users" className={({ isActive }) => `${navItemBase} ${isActive ? active : inactive}`}>
              Utilisateurs & gouvernance
            </NavLink>
          ) : null}
          <NavLink to="/admin/audit" className={({ isActive }) => `${navItemBase} ${isActive ? active : inactive}`}>
            Confiance & traçabilité
          </NavLink>
          <NavLink to="/admin/reports" className={({ isActive }) => `${navItemBase} ${isActive ? active : inactive}`}>
            Rapports & exports
          </NavLink>
          <NavLink to="/admin/growth" className={({ isActive }) => `${navItemBase} ${isActive ? active : inactive}`}>
            Croissance & partenariats
          </NavLink>
          <a href="/dashboard" className={`${navItemBase} mt-3 border border-slate-200/80 bg-white/80 ${inactive}`}>
            ← Application
          </a>
        </nav>
        <div className="border-t border-slate-100 px-4 py-4 text-center text-[11px] text-slate-400">by Soroboss</div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs text-slate-500">Session admin securisee</div>
              <div className="text-lg font-semibold text-text">{user.full_name}</div>
              <div className="mt-0.5 text-sm text-slate-600">
                {user.email}
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {roleLabel}
                </span>
              </div>
            </div>
            <div className={mobileNavScroll}>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium ${isActive ? `${active} text-primary` : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"}`
                }
              >
                Synthèse
              </NavLink>
              <NavLink
                to="/admin/documents"
                className={({ isActive }) =>
                  `shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium ${isActive ? `${active} text-primary` : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"}`
                }
              >
                Documents
              </NavLink>
              <NavLink
                to="/admin/ads"
                className={({ isActive }) =>
                  `shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium ${isActive ? `${active} text-primary` : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"}`
                }
              >
                Pub
              </NavLink>
              {canManageUsers ? (
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium ${isActive ? `${active} text-primary` : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"}`
                  }
                >
                  Utilisateurs
                </NavLink>
              ) : null}
              <NavLink
                to="/admin/audit"
                className={({ isActive }) =>
                  `shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium ${isActive ? `${active} text-primary` : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"}`
                }
              >
                Journal
              </NavLink>
              <NavLink
                to="/admin/reports"
                className={({ isActive }) =>
                  `shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium ${isActive ? `${active} text-primary` : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"}`
                }
              >
                Rapports
              </NavLink>
              <NavLink
                to="/admin/growth"
                className={({ isActive }) =>
                  `shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium ${isActive ? `${active} text-primary` : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"}`
                }
              >
                Croissance
              </NavLink>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-[15px] py-6 md:px-8">
          <Outlet context={{ session }} />
        </main>

        <footer className="border-t border-slate-200/80 px-4 py-4 text-center text-[11px] text-slate-400 md:px-8">
          DocuGest Ivoire · Administration
        </footer>
      </div>
    </div>
  );
}
