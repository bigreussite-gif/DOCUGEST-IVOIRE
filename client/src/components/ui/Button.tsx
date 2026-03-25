import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary: "bg-primary text-white hover:brightness-95",
    secondary: "bg-secondary text-white hover:brightness-95",
    ghost: "bg-transparent text-text hover:bg-surface border border-border/70",
    danger: "bg-error text-white hover:brightness-95"
  };

  const sizes: Record<NonNullable<Props["size"]>, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base"
  };

  return (
    <button
      ref={ref}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

