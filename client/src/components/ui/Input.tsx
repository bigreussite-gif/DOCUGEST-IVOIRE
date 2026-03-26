import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, className, id, ...props },
  ref
) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={[
          "min-h-[48px] w-full rounded-xl border bg-white px-4 py-3 text-base leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400",
          error ? "border-error focus:ring-2 focus:ring-error/30" : "border-border focus:ring-2 focus:ring-primary/30",
          className ?? ""
        ].join(" ")}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-error">{error}</span> : null}
    </label>
  );
});

