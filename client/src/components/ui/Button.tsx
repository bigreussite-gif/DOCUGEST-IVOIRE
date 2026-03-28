import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, loading, children, disabled, ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-150 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 " +
    "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]";

  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary:
      "bg-gradient-to-b from-primary to-primary-dark text-white shadow-primary-glow/40 hover:brightness-110 active:brightness-95",
    secondary:
      "bg-white text-secondary border-2 border-secondary/30 shadow-xs hover:border-secondary/60 hover:bg-secondary/5",
    ghost:
      "bg-transparent text-text border border-border/80 hover:bg-surface hover:border-border",
    danger:
      "bg-gradient-to-b from-error to-red-600 text-white shadow-sm hover:brightness-110 active:brightness-95"
  };

  const sizes: Record<NonNullable<Props["size"]>, string> = {
    sm: "h-9 px-3.5 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base"
  };

  return (
    <button
      ref={ref}
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
});
