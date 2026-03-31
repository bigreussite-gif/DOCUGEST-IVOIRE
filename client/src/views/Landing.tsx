import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { MonetizationTopBar } from "../components/promo/MonetizationTopBar";
import { MonetizationBottomBar } from "../components/promo/MonetizationBottomBar";
import { InlineAdStrip } from "../components/promo/InlineAdStrip";
import { BottomAdZone } from "../components/promo/BottomAdZone";
import { SorobossFooter } from "../components/promo/SorobossFooter";

/* ─── Données modules ─────────────────────────────────── */

const CATEGORIES = [
  {
    id: "commercial",
    label: "Documents Commerciaux",
    icon: "🛍️",
    color: "blue",
    bg: "bg-blue-50",
    ring: "ring-blue-200/80",
    iconBg: "bg-blue-100 text-blue-700",
    titleColor: "text-blue-800",
    modules: [
      { icon: "📄", title: "Facture normalisée", desc: "TVA, lignes, aperçu PDF pro.", to: "/register" },
      { icon: "📋", title: "Proforma / Devis", desc: "Montrez votre sérieux avant commande.", to: "/register" },
      { icon: "📝", title: "Bon de commande", desc: "Formalisez vos achats en FCFA.", to: "/register", isNew: true },
      { icon: "🚚", title: "Bon de livraison", desc: "BL avec état de conformité.", to: "/register", isNew: true },
      { icon: "🧾", title: "Reçu de paiement", desc: "Montant en lettres, tous modes.", to: "/register", isNew: true },
      { icon: "🛒", title: "Facture e-commerce", desc: "Rapide, lignes TTC, livraison.", to: "/register" },
    ],
  },
  {
    id: "rh",
    label: "Emploi & Ressources Humaines",
    icon: "👥",
    color: "emerald",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200/80",
    iconBg: "bg-emerald-100 text-emerald-700",
    titleColor: "text-emerald-800",
    modules: [
      { icon: "💼", title: "Bulletin de salaire", desc: "CNPS/IGR, net à payer, officiel.", to: "/register" },
      { icon: "🤝", title: "Contrat de travail", desc: "CDD/CDI — Code du travail CI 2015.", to: "/register", isNew: true },
      { icon: "👤", title: "CV Professionnel", desc: "3 templates, photo, barres niveau.", to: "/register", isNew: true },
      { icon: "✉️", title: "Lettre de motivation", desc: "Structure guidée, 4 paragraphes.", to: "/register", isNew: true },
    ],
  },
  {
    id: "juridique",
    label: "Documents Juridiques",
    icon: "⚖️",
    color: "amber",
    bg: "bg-amber-50",
    ring: "ring-amber-200/80",
    iconBg: "bg-amber-100 text-amber-700",
    titleColor: "text-amber-800",
    modules: [
      { icon: "📜", title: "Contrat de prestation", desc: "Clauses complètes, double signature.", to: "/register", isNew: true },
    ],
  },
];

const STATS = [
  { value: "11", label: "Documents générables", icon: "📑" },
  { value: "FCFA", label: "Devise locale native", icon: "💰" },
  { value: "PDF", label: "Export en 1 clic", icon: "⬇️" },
  { value: "100%", label: "Gratuit, toujours", icon: "🎁" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      <MonetizationTopBar />

      {/* ─── Décors bg ─── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-48 w-48 rounded-full bg-blue-500/6 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:pt-6">

        {/* ─── Header ─── */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white px-4 py-2.5 shadow-lg ring-2 ring-primary/20 transition-transform duration-200 hover:scale-[1.01]">
              <img
                src="/logo-docugest-ivoire.png"
                alt="DocuGestIvoire"
                className="h-16 w-auto max-w-[min(100%,320px)] object-contain object-left drop-shadow sm:h-20 sm:max-w-[360px]"
                width={360}
                height={80}
                loading="eager"
              />
            </div>
            <div className="hidden min-[420px]:block">
              <div className="text-sm font-semibold text-slate-700">L'outil pro des entrepreneurs africains</div>
              <div className="text-xs text-slate-500">Simple, rapide, 100 % local.</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/blog" className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex">
              📝 Blog
            </a>
            <Link to="/login">
              <Button variant="secondary">Me connecter</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Créer mon compte — gratuit</Button>
            </Link>
            <Link
              to="/forgot-password"
              className="w-full text-center text-xs font-semibold text-primary underline-offset-4 hover:underline min-[420px]:w-auto"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </header>

        {/* ─── Barre de stats ─── */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-xs ring-1 ring-border/50 sm:grid-cols-4 sm:gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-border/60">
              <span className="text-base">{s.icon}</span>
              <div className="mt-1 text-lg font-extrabold leading-none text-primary">{s.value}</div>
              <div className="mt-0.5 text-center text-[10px] font-medium text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ─── Hero principal ─── */}
        <main className="mt-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                100 % pensé pour l'entrepreneuriat en Afrique francophone
              </span>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-text sm:text-5xl">
                Tous tes documents pro,{" "}
                <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  sans prise de tête
                </span>
                .
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-700">
                Factures, contrats, CV, bulletins de salaire, bons de commande…
                DocuGestIvoire centralise <strong>11 types de documents professionnels</strong> en FCFA,
                en français, pour les entrepreneurs et demandeurs d'emploi de Côte d'Ivoire.
              </p>
              <p className="mt-3 max-w-xl text-base text-slate-600">
                Tu remplis, tu prévisualises, tu exportes en PDF. Propre, rapide, gratuit.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                {["Facture", "Devis", "CV", "Contrat CDD/CDI", "Bon de commande", "Bulletin de salaire", "Reçu de paiement"].map((tag) => (
                  <span key={tag} className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1 font-medium text-primary">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button variant="primary" className="min-h-[50px] px-8 text-base shadow-lg shadow-primary/25">
                    Je commence maintenant
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="min-h-[50px] text-base">
                    J'ai déjà un compte
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Gratuit, financé par la publicité — tu gardes le contrôle sur tes données et tes PDF.
              </p>
            </div>

            {/* Carte de confiance */}
            <div className="relative rounded-3xl bg-gradient-to-br from-surface to-white p-6 shadow-soft ring-1 ring-border/70 sm:p-8">
              <div className="absolute right-4 top-4 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <div className="text-sm font-bold uppercase tracking-wide text-primary">Ce que tu obtiens</div>
              <ul className="mt-4 space-y-3">
                {[
                  { icon: "⚡", title: "PDF en moins de 3 min", desc: "Remplis le formulaire, clique sur Télécharger. C'est tout." },
                  { icon: "🇨🇮", title: "100 % local et conforme", desc: "FCFA natif, Code du travail CI, CNPS/IGR calculés." },
                  { icon: "💾", title: "Brouillons sauvegardés", desc: "Tes données restent en mémoire. Reprends où tu t'es arrêté." },
                  { icon: "📱", title: "Mobile-first", desc: "Crée tes documents depuis ton téléphone, sans galère." },
                  { icon: "🔒", title: "Données chez toi", desc: "Tes PDF ne sont jamais partagés. Tu en restes propriétaire." },
                ].map((b) => (
                  <li key={b.title} className="flex gap-3 rounded-2xl bg-bg/70 p-3.5 ring-1 ring-border/60 transition hover:-translate-y-0.5 hover:bg-white">
                    <span className="mt-0.5 text-xl" aria-hidden>{b.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-text">{b.title}</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-slate-600">{b.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ─── Zone publicitaire milieu hero ─── */}
          <div className="mt-8">
            <InlineAdStrip adSlot="landing-hero" />
          </div>

          {/* ─── Section Modules ─── */}
          <section className="mt-12" aria-labelledby="modules-heading">
            <div className="mb-2 text-center">
              <span className="inline-block rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
                11 modules disponibles
              </span>
            </div>
            <h2 id="modules-heading" className="mt-2 text-center text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
              Tout ce dont tu as besoin, au même endroit
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600">
              Du devis au contrat de travail, de la facture au CV — DocuGestIvoire couvre l'ensemble de
              ta vie professionnelle. Gratuit. En FCFA. En français.
            </p>

            <div className="mt-8 space-y-6">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className={`rounded-3xl ${cat.bg} p-5 ring-1 ${cat.ring} sm:p-7`}
                >
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="text-xl">{cat.icon}</span>
                    <h3 className={`text-base font-bold ${cat.titleColor}`}>{cat.label}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.modules.map((mod) => (
                      <Link
                        key={mod.title}
                        to={mod.to}
                        className="group relative flex items-start gap-3 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-white/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.98]"
                      >
                        {mod.isNew && (
                          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                            Nouveau
                          </span>
                        )}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${cat.iconBg}`}>
                          {mod.icon}
                        </div>
                        <div className="min-w-0 flex-1 pr-8">
                          <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors">{mod.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{mod.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── Zone pub après les modules ─── */}
          <div className="mt-8">
            <InlineAdStrip variant="compact" adSlot="landing-after-modules" />
          </div>

          {/* ─── Section Comment ça marche ─── */}
          <section className="mt-12" aria-labelledby="how-heading">
            <h2 id="how-heading" className="text-center text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
              Comment ça marche ?
            </h2>
            <p className="mt-2 text-center text-base text-slate-600">Simple comme bonjour.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  icon: "🖊️",
                  title: "Choisis ton document",
                  desc: "Facture, contrat, CV… sélectionne le module adapté depuis ton tableau de bord."
                },
                {
                  step: "2",
                  icon: "👀",
                  title: "Remplis & prévisualise",
                  desc: "L'aperçu se met à jour en temps réel. Tes données sont sauvegardées automatiquement."
                },
                {
                  step: "3",
                  icon: "⬇️",
                  title: "Télécharge ton PDF",
                  desc: "Un PDF propre, professionnel, prêt à envoyer à tes clients ou partenaires."
                },
              ].map((step) => (
                <div key={step.step} className="relative rounded-2xl bg-white p-5 shadow-card ring-1 ring-border/50">
                  <div className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-black text-white shadow-primary-glow">
                    {step.step}
                  </div>
                  <div className="mt-2 text-3xl">{step.icon}</div>
                  <h3 className="mt-3 text-sm font-bold text-text">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── Zone pub entre sections ─── */}
          <div className="mt-8">
            <InlineAdStrip adSlot="landing-cta" />
          </div>

          {/* ─── Section FNE ─── */}
          <section
            className="mt-4 scroll-mt-6 rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 p-6 shadow-xs sm:p-8"
            aria-labelledby="fne-heading"
          >
            <h2 id="fne-heading" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Complémentaire à la FNE — pas un concurrent
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              La facturation électronique normalisée (FNE) et les dispositifs officiels de l'État ont leur
              rôle : conformité, déclarations, interconnexion.{" "}
              <strong>DocuGestIvoire ne les remplace pas.</strong> Nous vous aidons à produire au quotidien
              des documents commerciaux clairs — devis, factures PDF, bulletins, contrats — pour gagner du
              temps et rassurer vos clients. Pensez à notre outil comme un{" "}
              <strong>partenaire de mise en forme et d'efficacité</strong>, aligné avec votre démarche
              administrative.
            </p>
          </section>

          {/* ─── CTA final ─── */}
          <section className="mt-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 px-6 py-12 text-center sm:px-12">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              11 modules disponibles maintenant
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ton activité mérite des documents à la hauteur
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-300">
              Pas de jargon inutile : des outils qui te font gagner du temps, de la crédibilité et la
              sérénité pour facturer, recruter et contractualiser en toute clarté.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:scale-[1.01] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                Créer mon compte gratuit →
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 text-base font-medium text-white transition hover:bg-white/15"
              >
                Me connecter
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Gratuit · Aucune carte requise · Export PDF illimité
            </p>
          </section>
        </main>
      </div>

      {/* ─── Zones publicitaires bas de page ─── */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <InlineAdStrip variant="compact" adSlot="landing-bottom" />
      </div>

      <BottomAdZone />

      <MonetizationBottomBar />

      <div className="border-t border-slate-100 bg-bg px-4 py-8">
        <SorobossFooter />
      </div>
    </div>
  );
}
