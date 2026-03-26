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
          "min-h-[44px] w-full rounded-lg border px-3 py-2 text-base outline-none transition sm:min-h-0 sm:text-sm",
          error ? "border-error focus:ring-2 focus:ring-error/30" : "border-border focus:ring-2 focus:ring-primary/30",
          className ?? ""
        ].join(" ")}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-error">{error}</span> : null}
    </label>
  );
});

