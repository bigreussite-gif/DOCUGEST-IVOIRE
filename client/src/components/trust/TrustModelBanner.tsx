/**
 * Rappel confiance + modèle économique (gratuit financé par la publicité).
 * Objectif : transparence, légitimité des encarts, pas de surprise sur la facture.
 */

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  variant?: "default" | "compact";
};

export function TrustModelBanner({ variant = "default" }: Props) {
  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white px-3 py-2.5 text-[11px] leading-relaxed text-slate-700 shadow-sm ring-1 ring-emerald-100/70">
        <span className="font-semibold text-emerald-950">Gratuit et transparent :</span> la publicité finance
        l’hébergement et les évolutions — pas d’abonnement obligatoire. Merci d’accorder un regard aux partenaires
        ci-dessous.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/40 p-4 shadow-soft ring-1 ring-emerald-100/80 sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/[0.12] blur-2xl" aria-hidden />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
          <ShieldIcon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold leading-snug text-text sm:text-base">
            Un modèle honnête : vous travaillez sereinement, la publicité soutient la plateforme
          </h2>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
                ✓
              </span>
              <span>
                <strong className="text-text">Accès sans abonnement</strong> — créez factures, devis et bulletins sans carte
                bancaire ni engagement caché.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
                ✓
              </span>
              <span>
                <strong className="text-text">Rentabilité assumée</strong> — les encarts et partenaires financent
                l’infrastructure, la maintenance et les améliorations produit.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
                ✓
              </span>
              <span>
                <strong className="text-text">Confiance</strong> — vos brouillons sont liés à votre compte ; la génération PDF
                se fait dans votre navigateur, sans envoi de document à des tiers pour l’aperçu.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
