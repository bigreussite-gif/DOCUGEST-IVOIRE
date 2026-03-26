import { Link } from "react-router-dom";
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

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-lg ring-2 ring-slate-200/90">
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
              <div className="text-sm text-slate-600">L’outil pro des entrepreneurs africains</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/login">
              <Button variant="secondary">Me connecter</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Créer mon compte — gratuit</Button>
            </Link>
          </div>
        </header>

        <main className="mt-8 sm:mt-14">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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
              <p className="mt-4 max-w-xl text-base text-slate-600">
                On sait que chaque minute compte. Alors on a fait simple : tu remplis, tu prévisualises, tu exportes. Le reste,
                c’est ta vision business.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register">
                  <Button variant="primary" className="min-h-[48px] px-8 text-base shadow-lg shadow-primary/25">
                    Je commence maintenant
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="min-h-[48px] text-base">
                    J’ai déjà un compte
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-slate-500">
                Gratuit, financé par la publicité — tu gardes le contrôle sur tes données et tes PDF.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-surface to-white p-6 shadow-soft ring-1 ring-border/70 sm:p-8">
              <div className="text-sm font-bold uppercase tracking-wide text-primary">Pourquoi nous faire confiance</div>
              <ul className="mt-6 grid gap-5">
                {benefits.map((b) => (
                  <li key={b.title} className="flex gap-4 rounded-2xl bg-bg/80 p-4 ring-1 ring-border/60">
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
              <div className="mt-8 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center text-sm text-slate-700">
                <strong className="text-text">Prêt à facturer comme un pro ?</strong>
                <br />
                Rejoins les indépendants et PME qui structurent leurs docs sans cabinet comptable.
              </div>
            </div>
          </div>

          <section className="mt-20 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Ton activité mérite des documents à la hauteur</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Pas de jargon inutile : juste des outils qui te font gagner du temps, de la crédibilité et la sérénité pour
              encaisser et payer en toute clarté.
            </p>
            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/60"
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
