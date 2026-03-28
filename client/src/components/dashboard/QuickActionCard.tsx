import { Link } from "react-router-dom";
import clsx from "clsx";

const variants = {
  primary:
    "bg-gradient-to-br from-primary to-primary-dark text-white shadow-primary-glow hover:brightness-105 active:brightness-95",
  secondary:
    "bg-white text-text ring-2 ring-secondary/20 shadow-card hover:ring-secondary/40 hover:shadow-soft",
  accent:
    "bg-gradient-to-br from-emerald-50 to-teal-50/70 text-emerald-950 ring-1 ring-emerald-200/80 shadow-xs hover:from-emerald-100/80 hover:shadow-card",
  warm:
    "bg-gradient-to-br from-orange-50 to-amber-50/60 text-amber-950 ring-2 ring-warning/20 shadow-xs hover:ring-warning/40 hover:shadow-card",
  muted:
    "bg-surface text-text ring-1 ring-border/80 shadow-xs hover:bg-white hover:ring-border hover:shadow-card"
};

type Props = {
  to: string;
  title: string;
  description: string;
  variant?: keyof typeof variants;
  emoji: string;
  className?: string;
};

export function QuickActionCard({ to, title, description, variant = "secondary", emoji, className = "" }: Props) {
  const isPrimary = variant === "primary";
  return (
    <Link
      to={to}
      className={clsx(
        "group flex min-h-[5.5rem] flex-col justify-center rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] sm:min-h-[6rem] sm:p-5",
        variants[variant],
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        <span
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-200 group-hover:scale-110 sm:h-12 sm:w-12 sm:text-2xl",
            isPrimary
              ? "bg-white/20 ring-1 ring-white/40"
              : "bg-white shadow-card ring-1 ring-slate-200/70"
          )}
          aria-hidden
        >
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className={clsx(
            "text-[15px] font-bold leading-tight sm:text-base",
            isPrimary ? "text-white" : "text-text"
          )}>
            {title}
          </div>
          <p className={clsx(
            "mt-1 text-[12px] leading-snug sm:text-[13px]",
            isPrimary ? "text-white/85" : "text-slate-500"
          )}>
            {description}
          </p>
        </div>
        <span
          className={clsx(
            "shrink-0 text-lg opacity-30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-60",
            isPrimary ? "text-white" : "text-slate-400"
          )}
          aria-hidden
        >
          →
        </span>
      </div>
    </Link>
  );
}
