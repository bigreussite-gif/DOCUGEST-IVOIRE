type Props = { className?: string };

export function SorobossFooter({ className = "" }: Props) {
  return (
    <footer className={`text-center ${className}`}>
      <p className="text-sm text-slate-500">
        <span className="font-medium text-slate-600">DocuGest Ivoire</span>
        <span className="mx-2 text-slate-300">·</span>
        <span className="text-slate-700">by Soroboss</span>
      </p>
    </footer>
  );
}
