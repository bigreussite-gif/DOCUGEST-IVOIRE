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
      className={`flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90 ${className}`}
      aria-label="DocuGest Ivoire — Tableau de bord"
    >
      {!imgErr ? (
        <img
          src="/logo-docugest-ivoire.png"
          alt=""
          width={compact ? 40 : 44}
          height={compact ? 40 : 44}
          className={compact ? "h-10 w-10 object-contain" : "h-11 max-h-11 w-auto max-w-[200px] object-contain object-left"}
          loading="eager"
          onError={() => setImgErr(true)}
        />
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
