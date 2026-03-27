import Link from "next/link";
import { Button } from "../components/ui/Button";
import { MonetizationTopBar } from "../components/promo/MonetizationTopBar";
import { BottomAdZone } from "../components/promo/BottomAdZone";
import { SorobossFooter } from "../components/promo/SorobossFooter";

const benefits = [
  {
    title: "Factures en un clin d’œil",
    desc: "Du premier clic au PDF propre : numérotation, totaux, aperçu avant envoi. Comme au bureau, mais plus rapide.",
    icon: "⚡"
  },
  {
    title: "Devis & proforma qui rassurent",
    desc: "Présentez-vous comme une structure sérieuse. Vos clients voient clair sur les montants et les délais.",
    icon: "📋"
  },
  {
    title: "Bulletins de salaire maîtrisés",
    desc: "Simplifiez la paie de votre équipe : une base claire pour les fiches de paie et l’historique.",
    icon: "💼"
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      <MonetizationTopBar />

      <div className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-6 pt-4 sm:pt-5">
        <div className="pointer-events-none absolute -left-20 top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-28 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white px-4 py-2.5 shadow-lg ring-2 ring-primary/20 transition-transform duration-200 hover:scale-[1.01]">
              <img
                src="/logo-docugest-ivoire.png"
                alt="DocuGest Ivoire"
                className="h-16 w-auto max-w-[min(100%,320px)] object-contain object-left drop-shadow sm:h-20 sm:max-w-[360px]"
                width={360}
                height={80}
                loading="eager"
              />
            </div>
            <div className="hidden min-[420px]:block sm:block">
              <div className="text-sm font-medium text-slate-700">L’outil pro des entrepreneurs africains</div>
              <div className="text-xs text-slate-500">Simple, rapide, local.</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button variant="secondary">Me connecter</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Créer mon compte — gratuit</Button>
            </Link>
          </div>
        </header>

        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm sm:grid-cols-3 sm:items-center">
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-center ring-1 ring-border/60">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Temps moyen</div>
            <div className="text-sm font-semibold text-text">Document en moins de 3 min</div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-center ring-1 ring-border/60">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Confiance</div>
            <div className="text-sm font-semibold text-text">Format pro + export PDF propre</div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-center ring-1 ring-border/60">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Support local</div>
            <div className="text-sm font-semibold text-text">Equipe DocuGest en Afrique francophone</div>
          </div>
        </div>

        <main className="mt-6 sm:mt-8">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-10">
            <div>
              <p className="inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                100 % pensé pour l’entrepreneuriat en Afrique francophone
              </p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-text sm:text-5xl">
                Tes documents pro,{" "}
                <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  sans prise de tête
                </span>
                .
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-700">
                Que tu gères une boutique à Abidjan, un service en ligne ou une petite équipe, DocuGest Ivoire te donne les
                mêmes armes que les grandes structures : factures nettes, devis crédibles, fiches de paie claires — tout en
                FCFA, tout en local.
              </p>
              <p className="mt-3 max-w-xl text-base text-slate-600">
                On sait que chaque minute compte. Alors on a fait simple : tu remplis, tu prévisualises, tu exportes. Le reste,
                c’est ta vision business.
              </p>

              <div className="mt-5 grid max-w-xl grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/80 p-3 text-center ring-1 ring-border/60">
                  <div className="text-lg font-bold text-primary">24/7</div>
                  <div className="text-[11px] text-slate-600">Disponible</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center ring-1 ring-border/60">
                  <div className="text-lg font-bold text-primary">FCFA</div>
                  <div className="text-[11px] text-slate-600">Natif local</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center ring-1 ring-border/60">
                  <div className="text-lg font-bold text-primary">PDF</div>
                  <div className="text-[11px] text-slate-600">Prêt en 1 clic</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/register">
                  <Button variant="primary" className="min-h-[48px] px-8 text-base shadow-lg shadow-primary/25">
                    Je commence maintenant
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="min-h-[48px] text-base">
                    J’ai déjà un compte
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Gratuit, financé par la publicité — tu gardes le contrôle sur tes données et tes PDF.
              </p>
            </div>

            <div className="relative rounded-3xl bg-gradient-to-br from-surface to-white p-6 shadow-soft ring-1 ring-border/70 sm:p-8">
              <div className="absolute right-4 top-4 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <div className="text-sm font-bold uppercase tracking-wide text-primary">Pourquoi nous faire confiance</div>
              <ul className="mt-5 grid gap-4">
                {benefits.map((b) => (
                  <li
                    key={b.title}
                    className="flex gap-4 rounded-2xl bg-bg/80 p-4 ring-1 ring-border/60 transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span className="text-2xl" aria-hidden>
                      {b.icon}
                    </span>
                    <div>
                      <div className="font-semibold text-text">{b.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-slate-600">{b.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center text-sm text-slate-700">
                <strong className="text-text">Prêt à facturer comme un pro ?</strong>
                <br />
                Rejoins les indépendants et PME qui structurent leurs docs sans cabinet comptable.
              </div>
            </div>
          </div>

          <section
            className="mt-10 scroll-mt-6 rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 p-6 shadow-sm sm:p-8"
            aria-labelledby="fne-heading"
          >
            <h2 id="fne-heading" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Complémentaire à la FNE — pas un concurrent
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              La facturation électronique normalisée (FNE) et les dispositifs officiels de l’État ont leur rôle : conformité,
              déclarations, interconnexion. <strong>DocuGest Ivoire ne les remplace pas.</strong> Nous vous aidons à produire au
              quotidien des documents commerciaux clairs — devis, factures PDF, bulletins — pour gagner du temps et rassurer
              vos clients. Pensez à notre outil comme un <strong>partenaire de mise en forme et d’efficacité</strong>, aligné
              avec votre démarche administrative.
            </p>
          </section>

          <section className="mt-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 px-6 py-10 text-center sm:px-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Ton activité mérite des documents à la hauteur</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-200">
              Pas de jargon inutile : juste des outils qui te font gagner du temps, de la crédibilité et la sérénité pour
              encaisser et payer en toute clarté.
            </p>
            <div className="mt-6">
              <Link
                href="/register"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:scale-[1.01] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                Créer mon compte gratuit
              </Link>
            </div>
          </section>
        </main>
      </div>

      <BottomAdZone />

      <div className="border-t border-slate-100 bg-bg px-4 py-8">
        <SorobossFooter />
      </div>
    </div>
  );
}
