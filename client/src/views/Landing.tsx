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
          <div className="flex items-center gap-6">
            <div className="transition-all duration-300 hover:scale-105">
              <img
                src="/logo-docugest.png"
                alt="DocuGest"
                className="h-24 w-auto object-contain sm:h-28"
                width={500}
                height={120}
                loading="eager"
              />
            </div>
            <div className="hidden lg:block border-l border-slate-200 pl-6">
              <div className="text-xl font-black text-slate-900 tracking-tight">DocuGest</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] leading-none mt-2">L'IA Documentaire Ivoirienne</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <nav className="flex items-center gap-4 mr-2">
              <Link to="/blog" className="px-4 py-2 text-sm font-bold text-slate-900 hover:text-primary transition-colors">
                Blog
              </Link>
            </nav>
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Se connecter
            </Link>
            <Link to="/register">
              <Button variant="primary" className="h-14 rounded-2xl px-8 text-base font-bold shadow-primary-glow">
                Essayer gratuitement
              </Button>
            </Link>
          </div>
        </header>

        {/* ─── Hero Section ─── */}
        <main className="mt-12 sm:mt-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-md mb-6 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                Dites adieu aux erreurs sur Excel et Word
              </div>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-[#111827] sm:text-7xl lg:text-[5.5rem]">
                L'administratif <br/>
                <span className="bg-gradient-to-br from-primary via-[#00cc82] to-emerald-600 bg-clip-text text-transparent">
                  en 2 minutes.
                </span>
              </h1>
              <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-slate-600 sm:text-xl">
                Factures normalisées, contrats de travail, bulletins de paie et CV premium. 
                Gagnez des heures chaque semaine avec un outil <strong className="text-slate-900">100% conforme aux normes de Côte d'Ivoire.</strong>
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/register">
                  <Button variant="primary" className="h-16 rounded-3xl px-10 text-xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]">
                    Créer mon premier document — Gratuit
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-4 text-sm font-bold text-slate-400">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 ring-1 ring-slate-200 overflow-hidden">
                      <img src={`/assets/images/avatars/avatar${i}.png`} alt={`Entrepreneur Ivoirien ${i}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <span>+2 000 entrepreneurs nous font confiance</span>
              </div>

              {/* Stats Bar */}
              <div className="mt-12 grid grid-cols-2 gap-4 rounded-[2rem] border border-white bg-white/40 p-1.5 backdrop-blur-xl shadow-soft sm:flex sm:gap-0 sm:divide-x sm:divide-slate-200/50">
                {STATS.map((s) => (
                  <div key={s.label} className="flex flex-1 flex-col items-center px-4 py-4 sm:py-6">
                    <span className="mb-2 text-2xl" aria-hidden>{s.icon}</span>
                    <div className="text-xl font-black text-[#111827]">{s.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1 text-center">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative isolate lg:ml-10">
              <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-tr from-primary/20 to-emerald-500/20 blur-[100px] animate-pulse" />
              <div className="relative overflow-hidden rounded-[3rem] border border-white/80 bg-white/30 p-2 shadow-2xl backdrop-blur-md ring-1 ring-slate-200/20">
                <img
                  src="/assets/images/hero_illustration_new.png"
                  alt="Interface DocuGest"
                  className="rounded-[2.5rem] shadow-float transition-transform duration-700 hover:scale-[1.02]"
                  width={1000}
                  height={1000}
                />
              </div>
              {/* Floating micro-cards */}
              <div className="absolute -left-12 bottom-1/4 animate-bounce-slow hidden xl:block">
                <div className="glass rounded-2xl border border-white bg-white/90 p-4 shadow-xl ring-1 ring-slate-200/30 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold">✓</div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Conforme CNPS</div>
                      <div className="text-[10px] font-bold text-slate-500">Calcul automatique IGR</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <InlineAdStrip adSlot="landing-hero" />
          </div>

          {/* ─── Steps Section ─── */}
          <section className="mt-32 rounded-[4rem] bg-[#0F172A] px-8 py-20 text-white shadow-2xl overflow-hidden relative border border-white/5">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-black sm:text-6xl tracking-tight text-white mb-6">Comment ça marche ?</h2>
              <p className="text-xl text-slate-300 font-medium">Trois étapes simples pour un administratif irréprochable.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3 relative z-10 max-w-5xl mx-auto">
              {[
                { step: "01", title: "Choisissez un modèle", desc: "Factures, bulletins, contrats... Sélectionnez ce dont vous avez besoin.", icon: "📑" },
                { step: "02", title: "Saisissez les données", desc: "Remplissez les champs. Notre IA s'occupe des calculs compliqués (TVA, CNPS).", icon: "✍️" },
                { step: "03", title: "Téléchargez en PDF", desc: "Obtenez un document pro, prêt à être envoyé ou imprimé en un clic.", icon: "🚀" }
              ].map((s) => (
                <div key={s.step} className="group flex flex-col items-center text-center p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                  <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/20 text-4xl shadow-2xl transition-transform group-hover:scale-110">
                    {s.icon}
                  </div>
                  <span className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Étape {s.step}</span>
                  <h3 className="text-2xl font-black text-white mb-4">{s.title}</h3>
                  <p className="text-base text-slate-400 leading-relaxed font-medium">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── FNE & Partnership Section ─── */}
          <section className="mt-32">
            <div className="relative overflow-hidden rounded-[4rem] bg-white border-2 border-slate-100 p-8 sm:p-16 shadow-soft group hover:shadow-float transition-all duration-700">
              {/* Background accent */}
              <div className="absolute top-0 right-0 h-full w-1/3 bg-emerald-50/50 -skew-x-12 translate-x-1/2 pointer-events-none" />
              
              <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-xs font-black text-orange-600 mb-6">
                    <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                    CONFORMITÉ FISCALE & MODERNISATION
                  </div>
                  <h2 className="text-3xl font-black sm:text-5xl text-[#111827] leading-tight mb-6">
                    Prêt pour la <br/>
                    <span className="text-orange-600">Facture Normalisée Électronique (FNE)</span>
                  </h2>
                  <p className="text-lg font-medium text-slate-600 leading-relaxed mb-8">
                    La <strong>FNE</strong> est le nouveau dispositif de la <strong>Direction Générale des Impôts (DGI)</strong> visant à dématérialiser et sécuriser chaque transaction commerciale en Côte d'Ivoire.
                  </p>
                  
                  <div className="space-y-4 mb-10">
                    {[
                      { icon: "🛡️", title: "Sécurité & Traçabilité", desc: "Authentification immédiate de vos factures via QR Code." },
                      { icon: "📉", title: "Lutte contre la fraude", desc: "Un écosystème sain pour une concurrence loyale." },
                      { icon: "⚡", title: "Déclaration simplifiée", desc: "Pré-remplissage automatique de vos dossiers TVA." }
                    ].map((item) => (
                      <div key={item.title} className="flex gap-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">{item.icon}</div>
                        <div>
                          <h4 className="font-bold text-slate-900">{item.title}</h4>
                          <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <a 
                      href="https://fne.dgi.gouv.ci/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-xl"
                    >
                      Consulter le site officiel
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                    <span className="text-xs font-bold text-slate-400">Source : fne.dgi.gouv.ci</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-orange-100 to-rose-50 flex flex-col items-center justify-center p-12 text-center border border-white shadow-inner">
                    <div className="mb-6 flex items-center justify-center gap-4">
                       <img src="/logo-docugest.png" className="h-14 w-auto object-contain" alt="DocuGest"/>
                       <span className="text-2xl font-black text-slate-300">×</span>
                       <div className="flex flex-col items-center">
                          <img src="/assets/images/logo-dgi.png" className="h-20 w-auto object-contain" alt="DGI CI"/>
                       </div>
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-white/80 backdrop-blur border border-orange-200 shadow-sm text-orange-700 font-bold text-sm mb-6">
                      Partenaire de Modernisation
                    </div>
                    <p className="text-base font-bold text-slate-600 leading-relaxed italic">
                      "DocuGest accompagne les startups et PME vers la mise en conformité avec les nouvelles réformes de l'État Ivoirien."
                    </p>
                    
                    {/* Badge DGI */}
                    <div className="mt-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl ring-4 ring-orange-50 border border-orange-100">
                       <span className="text-xs font-black text-orange-600 text-center">LABEL<br/>CONFORME</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Premium Modules Grid ─── */}
          <section className="mt-32" id="features">
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
                          Créer maintenant <span className="text-lg">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── Final Premium CTA ─── */}
          <section className="mt-40 relative overflow-hidden rounded-[4rem] bg-[#0A0F1C] px-8 py-24 text-center text-white shadow-2xl">
            {/* Background Glows for modern feel */}
            <div className="absolute left-0 top-0 h-96 w-96 bg-primary/20 blur-[120px] transition-all duration-1000" />
            <div className="absolute right-0 bottom-0 h-96 w-96 bg-emerald-500/10 blur-[120px]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-10 flex h-32 w-48 items-center justify-center rounded-[2rem] bg-white p-6 shadow-2xl transition-transform hover:scale-105">
                 <img 
                   src="/logo-docugest.png" 
                   className="h-full w-full object-contain" 
                   alt="Logo DocuGest"
                 />
              </div>
              
              <h2 className="text-5xl font-black sm:text-7xl tracking-tight leading-[1.1] mb-8 text-white">
                Prêt à gagner <br/>
                <span className="text-primary">du temps ?</span>
              </h2>
              
              <p className="mx-auto max-w-2xl text-xl sm:text-2xl text-slate-300 font-medium leading-relaxed mb-12">
                Rejoignez la révolution de l'administratif ivoirien. Simple, élégant et redoutablement efficace.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/register">
                  <Button variant="primary" className="h-20 rounded-[2.5rem] px-12 text-2xl font-black shadow-primary-glow hover:scale-105 active:scale-95 transition-all">
                    Essayer — Gratuit
                  </Button>
                </Link>
                <Link to="/login" className="h-20 flex items-center justify-center rounded-[2.5rem] border border-white/20 bg-white/5 px-12 text-xl font-bold backdrop-blur-md hover:bg-white/10 transition-all">
                  Se connecter
                </Link>
              </div>
              
              <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-slate-400 font-bold uppercase tracking-[0.3em] text-[11px]">
                 <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /> Sans carte bancaire</span>
                 <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /> Export PDF illimité</span>
                 <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /> Support local 🇮🇨</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <div className="mt-32 border-t border-slate-100 bg-[#FDFDFE] px-4 py-16">
        <SorobossFooter />
      </div>

      <BottomAdZone />
      <MonetizationBottomBar />
    </div>
  );
}
