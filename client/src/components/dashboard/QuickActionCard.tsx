import { Link } from "react-router-dom";
import clsx from "clsx";

const variants = {
  primary:
    "bg-primary text-white ring-2 ring-primary/30 shadow-md hover:brightness-[1.03] active:scale-[0.99]",
  secondary:
    "bg-white text-text ring-2 ring-primary/20 shadow-sm hover:bg-primary/[0.06] hover:ring-primary/35",
  accent:
    "border border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-950 ring-1 ring-emerald-200/80 hover:from-emerald-100/80 hover:to-teal-50",
  warm: "bg-white text-text ring-2 ring-warning/25 shadow-sm hover:bg-warning/[0.08]",
  muted: "bg-surface text-text ring-1 ring-border/80 hover:bg-white hover:ring-border"
};

type Props = {
  to: string;
  title: string;
  description: string;
  variant?: keyof typeof variants;
  emoji: string;
  className?: string;
};

/**
 * Carte d’action principale — mobile-first, zone tactile ≥ 44px, coins arrondis uniformes.
 */
export function QuickActionCard({ to, title, description, variant = "secondary", emoji, className = "" }: Props) {
  return (
    <Link
      to={to}
      className={clsx(
        "group flex min-h-[5.5rem] flex-col justify-center rounded-2xl p-4 transition-all duration-200 sm:min-h-[6rem] sm:p-5",
        variants[variant],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl sm:h-12 sm:w-12 sm:text-2xl",
            variant === "primary"
              ? "bg-white/20 ring-1 ring-white/40"
              : "bg-white/95 shadow-sm ring-1 ring-slate-200/70"
          )}
          aria-hidden
        >
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div
            className={clsx(
              "text-[15px] font-bold leading-tight sm:text-base",
              variant === "primary" ? "text-white" : "text-text"
            )}
          >
            {title}
          </div>
          <p
            className={clsx(
              "mt-1.5 text-[13px] leading-snug sm:text-sm",
              variant === "primary" ? "text-white/90" : "text-slate-600"
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
