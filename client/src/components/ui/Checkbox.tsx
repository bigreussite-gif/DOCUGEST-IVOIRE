import { type InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

export const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox(
  { label, error, className, id, ...props },
  ref
) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className="flex items-start gap-2">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className={[
          "mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30",
          error ? "border-error" : "",
          className ?? ""
        ].join(" ")}
        {...props}
      />
      <div>
        {label ? <label htmlFor={inputId} className="text-sm text-text">{label}</label> : null}
        {error ? <div className="mt-1 text-xs text-error">{error}</div> : null}
      </div>
    </div>
  );
});

