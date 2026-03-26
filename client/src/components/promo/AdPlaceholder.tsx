type Props = {
  label: string;
  hint?: string;
  /** Rôle sémantique pour intégration future AdSense (data-ad-slot) */
  adSlot?: string;
  className?: string;
  minHeight?: string;
};

/**
 * Emplacement publicitaire — bordure discrète, prêt pour script AdSense (remplacer le contenu par ins.adsbygoogle).
 */
export function AdPlaceholder({ label, hint, adSlot, className = "", minHeight = "min-h-[72px]" }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 bg-gradient-to-br from-slate-50 to-slate-100/90 px-3 py-2 text-center ${minHeight} ${className}`}
      data-ad-slot={adSlot}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {hint ? <span className="mt-1 text-[11px] text-slate-500">{hint}</span> : null}
    </div>
  );
}
