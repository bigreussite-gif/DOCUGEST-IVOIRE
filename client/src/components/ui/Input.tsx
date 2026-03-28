import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-text">{label}</span>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={[
          "min-h-[48px] w-full rounded-2xl border bg-white px-4 py-3 text-base leading-relaxed text-slate-900",
          "outline-none transition-all duration-150 placeholder:text-slate-400",
          "focus:shadow-card",
          error
            ? "border-error/70 bg-red-50/30 ring-2 ring-error/20 focus:ring-error/30"
            : "border-border hover:border-slate-300 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
          className ?? ""
        ].join(" ")}
        {...props}
      />
      {error ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs text-error">
          <span aria-hidden>⚠</span>
          {error}
        </span>
      ) : null}
      {!error && hint ? (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
});
