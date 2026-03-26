type Props = { className?: string };

export function SorobossFooter({ className = "" }: Props) {
  return (
    <footer className={`text-center ${className}`}>
      <p className="text-sm text-slate-500">
        <span className="font-medium text-slate-600">DocuGest Ivoire</span>
        <span className="mx-2 text-slate-300">·</span>
        <span className="text-slate-700">by Soroboss</span>
      </p>
      <p className="mt-3 flex flex-col items-center gap-2 text-sm text-slate-600 sm:flex-row sm:justify-center sm:gap-4">
        <a href="tel:+2250757228731" className="hover:text-primary hover:underline">
          +225 07 57 22 87 31
        </a>
        <span className="hidden text-slate-300 sm:inline" aria-hidden>
          ·
        </span>
        <a href="mailto:soroboss.bossimpact@gmail.com" className="break-all hover:text-primary hover:underline">
          soroboss.bossimpact@gmail.com
        </a>
      </p>
    </footer>
  );
}
