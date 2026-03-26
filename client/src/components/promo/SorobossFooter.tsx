type Props = { className?: string };

export function SorobossFooter({ className = "" }: Props) {
  return (
    <footer className={`text-center ${className}`}>
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-slate-500 sm:text-xs">
        <span className="font-medium text-slate-600">DocuGest Ivoire</span>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <span className="text-slate-700">by Soroboss</span>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <a href="tel:+2250757228731" className="hover:text-primary hover:underline">
          +225 07 57 22 87 31
        </a>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <a href="mailto:soroboss.bossimpact@gmail.com" className="hover:text-primary hover:underline">
          soroboss.bossimpact@gmail.com
        </a>
      </p>
    </footer>
  );
}
