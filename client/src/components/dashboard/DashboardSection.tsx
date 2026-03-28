import type { ReactNode } from "react";

type Props = {
  title: string;
  kicker?: string;
  description?: string;
  id?: string;
  children: ReactNode;
  className?: string;
};

/** En-tête de section cohérent (mobile-first). */
export function DashboardSection({ title, kicker, description, id, children, className = "" }: Props) {
  return (
    <section id={id} className={`scroll-mt-28 ${className}`}>
      <div className="mb-4 flex flex-col gap-1 border-b border-border/60 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-text sm:text-xl">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p> : null}
        </div>
        {kicker ? (
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{kicker}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
