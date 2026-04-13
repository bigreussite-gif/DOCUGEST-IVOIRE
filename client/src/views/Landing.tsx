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
    bg: "bg-blue-50/50",
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
    label: "Emploi & RH",
    icon: "👥",
    color: "emerald",
    bg: "bg-emerald-50/50",
    ring: "ring-emerald-200/80",
    iconBg: "bg-emerald-100 text-emerald-700",
    titleColor: "text-emerald-800",
    modules: [
      { icon: "💼", title: "Bulletin de salaire", desc: "CNPS/IGR, net à payer, officiel.", to: "/register" },
      { icon: "🤝", title: "Contrat de travail", desc: "CDD/CDI — Code du travail CI.", to: "/register", isNew: true },
      { icon: "👤", title: "CV Professionnel", desc: "3 templates, photo, barres niveau.", to: "/register", isNew: true },
      { icon: "✉️", title: "Lettre de motivation", desc: "Structure guidée, 4 paragraphes.", to: "/register", isNew: true },
    ],
  },
  {
    id: "juridique",
    label: "Juridique",
    icon: "⚖️",
    color: "amber",
    bg: "bg-amber-50/50",
    ring: "ring-amber-200/80",
    iconBg: "bg-amber-100 text-amber-700",
    titleColor: "text-amber-800",
    modules: [
      { icon: "📜", title: "Contrat de prestation", desc: "Clauses complètes, double signature.", to: "/register", isNew: true },
    ],
  },
];

const STATS = [
  { value: "11+", label: "Modèles d'experts", icon: "📑" },
  { value: "FCFA", label: "Devise locale native", icon: "💰" },
  { value: "PDF", label: "Export pro direct", icon: "⬇️" },
  { value: "100%", label: "Gratuit, à vie", icon: "🎁" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FDFDFE] selection:bg-primary/20 selection:text-primary">
      <MonetizationTopBar />

      {/* ─── Animated Background Decor ─── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/10 blur-[120px] transition-all duration-1000 animate-pulse" />
        <div className="absolute -right-24 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-20 left-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 sm:pt-6">

        {/* ─── Premium Header ─── */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="group flex items-center gap-4">
            <div className="rounded-3xl bg-white p-2.5 shadow-soft ring-1 ring-slate-200/80 transition-all duration-300 group-hover:scale-105 group-hover:shadow-float">
              <img
                src="/logo-docugest-ivoire.png"
                alt="DocuGestIvoire"
                className="h-12 w-auto object-contain sm:h-14"
                width={300}
                height={60}
                loading="eager"
              />
            </div>
            <div className="hidden lg:block border-l border-slate-200 pl-4">
              <div className="text-sm font-bold text-slate-900 tracking-tight">DocuGest Ivoire</div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-widest leading-none mt-1">L'IA Documentaire Ivoirienne</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Se connecter
            </Link>
            <Link to="/register">
              <Button variant="primary" className="h-11 rounded-2xl px-6 text-sm font-bold shadow-primary-glow">
                Créer mon compte — gratuit
              </Button>
            </Link>
          </div>
        </header>

        {/* ─── Hero Section with Modern Image ─── */}
        <main className="mt-12 sm:mt-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-50/80 px-4 py-1.5 text-xs font-bold text-emerald-700 backdrop-blur-md mb-6 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                100% Conforme aux normes de Côte d'Ivoire
              </div>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-[#111827] sm:text-7xl lg:text-[5.5rem]">
                Gérez vos documents pro <br/>
                <span className="bg-gradient-to-br from-primary via-[#00cc82] to-emerald-600 bg-clip-text text-transparent">
                  sans limites.
                </span>
              </h1>
              <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-slate-600 sm:text-xl">
                Factures normalisées, contrats légaux, bulletins CNPS et CV premium.
                Simplifiez votre administratif en <strong className="text-slate-900">FCFA</strong> avec DocuGestIvoire.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/register">
                  <Button variant="primary" className="h-14 rounded-3xl px-10 text-lg font-bold shadow-2xl shadow-primary/30 hover:scale-[1.02]">
                    Commencer gratuitement
                  </Button>
                </Link>
                <div className="flex items-center gap-3 pl-2 grayscale opacity-70">
                   <img src="/assets/images/google-login.svg" alt="" className="h-5" />
                   <span className="text-sm font-semibold text-slate-500">Ou s'inscrire via Google</span>
                </div>
              </div>

              {/* Stats Bar Integrated */}
              <div className="mt-12 grid grid-cols-2 gap-4 rounded-[2rem] border border-white bg-white/40 p-1.5 backdrop-blur-xl shadow-soft sm:flex sm:gap-0 sm:divide-x sm:divide-slate-200/50">
                {STATS.map((s) => (
                  <div key={s.label} className="flex flex-1 flex-col items-center px-4 py-4 sm:py-6">
                    <span className="mb-2 text-2xl" aria-hidden>{s.icon}</span>
                    <div className="text-xl font-black text-[#111827]">{s.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative isolate">
              <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-tr from-primary/10 to-emerald-500/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/30 p-2 shadow-modal backdrop-blur-md ring-1 ring-slate-200/20">
                <img
                  src="/assets/images/hero_illustration.png"
                  alt="Interface DocuGest Ivoire"
                  className="rounded-[2rem] shadow-float transition-transform duration-700 hover:scale-[1.03]"
                  width={800}
                  height={800}
                />
              </div>
              {/* Floating micro-cards for 'WOW' */}
              <div className="absolute -right-8 top-1/4 animate-bounce-slow hidden xl:block">
                <div className="glass rounded-2xl border border-white p-4 shadow-float ring-1 ring-slate-200/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold">PDF</div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Facture Générée</div>
                      <div className="text-[10px] font-bold text-slate-500">12 500 FCFA</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <InlineAdStrip adSlot="landing-hero" />
          </div>

          {/* ─── Premium Modules Grid ─── */}
          <section className="mt-24" id="features">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black tracking-tight text-[#111827] sm:text-5xl">Une suite documentaire complète</h2>
              <p className="mt-4 text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                Tout ce qu'un entrepreneur, freelance ou chercheur d'emploi ivoirien a besoin pour briller.
              </p>
            </div>

            <div className="space-y-12">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className={`rounded-[3rem] ${cat.bg} p-8 ring-1 ${cat.ring} border-2 border-white shadow-soft transition-all duration-500 hover:shadow-float`}>
                  <div className="mb-8 flex items-center gap-4">
                    <div className={`h-12 w-12 flex items-center justify-center rounded-2xl text-2xl border border-white shadow-sm ${cat.iconBg}`}>
                      {cat.icon}
                    </div>
                    <h3 className={`text-xl font-black tracking-tight ${cat.titleColor}`}>{cat.label}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {cat.modules.map((mod) => (
                      <Link
                        key={mod.title}
                        to={mod.to}
                        className="group relative h-full flex flex-col justify-between rounded-3xl bg-white/80 p-6 border-b-4 border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-float active:scale-[0.98]"
                      >
                        {mod.isNew && (
                          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-emerald-glow">
                             Nouveau
                          </span>
                        )}
                        <div>
                          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:rotate-6 ${cat.iconBg}`}>
                            {mod.icon}
                          </div>
                          <p className="text-lg font-black text-[#111827] group-hover:text-primary transition-colors">{mod.title}</p>
                          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{mod.desc}</p>
                        </div>
                        <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-3 transition-all">
                          Découvrir <span className="text-lg">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── Final Premium CTA ─── */}
          <section className="mt-32 relative overflow-hidden rounded-[3.5rem] bg-[#111827] px-8 py-20 text-center text-white shadow-modal">
            <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(0,168,107,0.15),transparent_40%)]" />
            <div className="absolute right-0 bottom-0 h-full w-full bg-[radial-gradient(circle_at_bottom_left,rgba(255,107,43,0.1),transparent_40%)]" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
                 <img src="/logo-docugest-ivoire.png" className="h-10 grayscale brightness-100 invert" alt=""/>
              </div>
              <h2 className="text-4xl font-black sm:text-6xl tracking-tight leading-none">
                Donnez à votre activité <br/> l'image qu'elle mérite.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-400 font-medium leading-relaxed">
                Rejoignez des milliers d'entrepreneurs ivoiriens qui gèrent déjà leur administratif avec élégance et simplicité.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="primary" className="h-16 rounded-[2rem] px-12 text-xl font-black shadow-primary-glow hover:scale-105">
                    Créer mon compte gratuit
                  </Button>
                </Link>
                <Link to="/login" className="h-16 flex items-center justify-center rounded-[2rem] border border-white/20 bg-white/5 px-12 text-lg font-bold backdrop-blur-md hover:bg-white/10 px-8 transition-all">
                  Me connecter
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                 <span>Sans carte bancaire</span>
                 <span className="h-1 w-1 rounded-full bg-slate-700" />
                 <span>Export PDF illimité</span>
                 <span className="h-1 w-1 rounded-full bg-slate-700" />
                 <span>Support local 🇨🇮</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <div className="mt-20 border-t border-slate-100 bg-[#FDFDFE] px-4 py-12">
        <SorobossFooter />
      </div>

      <BottomAdZone />
      <MonetizationBottomBar />
    </div>
  );
}
