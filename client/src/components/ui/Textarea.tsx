import { forwardRef, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string | null;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, className, id, ...props },
  ref
) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      ) : null}
      <textarea
        ref={ref}
        id={inputId}
        className={[
          "w-full min-h-[120px] rounded-xl border px-4 py-3 text-base leading-relaxed outline-none transition placeholder:text-slate-400",
          error ? "border-error focus:ring-2 focus:ring-error/30" : "border-border focus:ring-2 focus:ring-primary/30",
          className ?? ""
        ].join(" ")}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-error">{error}</span> : null}
    </label>
  );
});

