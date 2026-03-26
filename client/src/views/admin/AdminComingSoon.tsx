import { Link } from "react-router-dom";

type Props = {
  title: string;
  description: string;
  highlights?: string[];
};

/**
 * Module placeholder — même niveau que les autres entrées admin, pour montrer la roadmap produit.
 */
export function AdminComingSoon({ title, description, highlights = [] }: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-[28px] border border-teal-200/60 bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/30 p-8 shadow-[0_20px_60px_-24px_rgba(15,118,110,0.25)] sm:p-10">
        <div className="inline-flex rounded-full bg-teal-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-800">
          Bientôt disponible
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
        {highlights.length > 0 ? (
          <ul className="mt-6 space-y-2 border-t border-teal-200/50 pt-6 text-sm text-slate-700">
            {highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/admin"
            className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            Retour à la synthèse
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Application
          </Link>
        </div>
      </div>
    </div>
  );
}
