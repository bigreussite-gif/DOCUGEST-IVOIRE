import { useState } from "react";
import { Link } from "react-router-dom";

type Props = {
  /** Logo seul (sans texte) — utile barre compacte ou mobile */
  compact?: boolean;
  className?: string;
};

export function AppBrand({ compact, className = "" }: Props) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link
      to="/dashboard"
      className={`flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-95 ${className}`}
      aria-label="DocuGest Ivoire — Tableau de bord"
    >
      {!imgErr ? (
        <span
          className={
            compact
              ? "inline-flex rounded-xl bg-white px-2 py-1.5 shadow-md ring-1 ring-slate-300/90"
              : "inline-flex rounded-2xl bg-white px-2.5 py-2 shadow-md ring-1 ring-slate-300/90"
          }
        >
          <img
            src="/logo-docugest-ivoire.png"
            alt=""
            width={compact ? 44 : 52}
            height={compact ? 44 : 52}
            className={
              compact
                ? "h-11 w-11 object-contain drop-shadow-sm"
                : "h-12 max-h-12 w-auto min-w-[44px] max-w-[220px] object-contain object-left sm:h-14 sm:max-h-14 sm:max-w-[260px]"
            }
            loading="eager"
            onError={() => setImgErr(true)}
          />
        </span>
      ) : (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white"
          aria-hidden
        >
          DG
        </div>
      )}
      {!compact ? (
        <span className="hidden font-semibold tracking-tight text-text sm:inline sm:max-w-[160px] sm:truncate md:max-w-none">
          DocuGest Ivoire
        </span>
      ) : null}
    </Link>
  );
}
