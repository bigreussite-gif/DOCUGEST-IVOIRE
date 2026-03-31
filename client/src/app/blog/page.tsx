import type { Metadata } from "next";
import Link from "next/link";
import { runWithDbRetry } from "@/lib/db";
import * as store from "@/lib/serverStore";
import type { BlogPost } from "@/lib/serverStore";
import { BlogAdBanner } from "@/components/promo/BlogAdBanner";

export const metadata: Metadata = {
  title: "Blog — Conseils Documents & Gestion | DocuGestIvoire",
  description:
    "Guides pratiques pour entrepreneurs, salariés et demandeurs d'emploi en Côte d'Ivoire. Factures, contrats, CV, bulletins de paie — nos experts vous expliquent tout.",
  openGraph: {
    title: "Blog DocuGestIvoire — Conseils Documents & Gestion",
    description:
      "Guides pratiques pour entrepreneurs ivoiriens : créer une facture, rédiger un CV, comprendre le contrat de travail…",
  },
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; grad: string }> = {
  Facturation:         { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",   grad: "from-blue-500 to-cyan-500" },
  "Ressources humaines": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", grad: "from-emerald-500 to-teal-500" },
  Emploi:              { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",  grad: "from-green-500 to-lime-500" },
  Juridique:           { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  grad: "from-amber-500 to-orange-500" },
  Entrepreneuriat:     { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200", grad: "from-violet-500 to-purple-600" },
  general:             { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",  grad: "from-slate-400 to-slate-600" },
};

function catStyle(cat: string) {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.general;
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    return await runWithDbRetry(() => store.listBlogPosts({ publishedOnly: true }), 3);
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-docugest-ivoire.png" alt="DocuGestIvoire" className="h-11 w-auto" />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-slate-600 hover:text-primary transition">Accueil</Link>
            <Link href="/dashboard" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105 transition">
              Créer un document
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200/60 bg-gradient-to-br from-primary/5 via-white to-emerald-50/40 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            Blog & Ressources
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Guides pratiques pour les{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              entrepreneurs ivoiriens
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Factures, contrats, CV, bulletins de paie — tout ce qu'il faut savoir pour gérer vos documents
            professionnels en Côte d'Ivoire.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const s = catStyle(cat);
              return (
                <span key={cat} className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${s.bg} ${s.text} ${s.border}`}>
                  {cat}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pub top de liste */}
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <BlogAdBanner adSlot="blog-list-top" label="Sponsorisé" minHeight="min-h-[80px]" />
      </div>

      {/* Articles */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {posts.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <p className="text-lg font-medium">Aucun article publié pour le moment.</p>
            <p className="mt-2 text-sm">Revenez bientôt — du contenu est en préparation.</p>
          </div>
        ) : (
          <>
            {/* Featured — premier article */}
            {posts[0] && (
              <Link href={`/blog/${posts[0].slug}`} className="group mb-10 block">
                <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                  <div className={`h-48 w-full bg-gradient-to-br ${catStyle(posts[0].category).grad} sm:h-64`} />
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${catStyle(posts[0].category).bg} ${catStyle(posts[0].category).text} ${catStyle(posts[0].category).border}`}>
                        {posts[0].category}
                      </span>
                      <span className="text-xs text-slate-400">{posts[0].reading_time_min} min de lecture</span>
                      {posts[0].published_at && (
                        <span className="text-xs text-slate-400">{formatDate(posts[0].published_at)}</span>
                      )}
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-slate-900 group-hover:text-primary transition sm:text-2xl">
                      {posts[0].title}
                    </h2>
                    <p className="mt-2 text-slate-600 line-clamp-3">{posts[0].excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Lire l'article
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </article>
              </Link>
            )}

            {/* Pub entre article featured et la grille */}
            <BlogAdBanner adSlot="blog-list-mid" label="Sponsorisé" className="mb-8" minHeight="min-h-[72px]" />

            {/* Grid */}
            {posts.length > 1 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.slice(1).map((post) => {
                  const s = catStyle(post.category);
                  return (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                        <div className={`h-32 w-full bg-gradient-to-br ${s.grad}`} />
                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${s.bg} ${s.text} ${s.border}`}>
                              {post.category}
                            </span>
                            <span className="text-[11px] text-slate-400">{post.reading_time_min} min</span>
                          </div>
                          <h2 className="mt-2.5 flex-1 text-base font-bold leading-snug text-slate-900 group-hover:text-primary transition line-clamp-3">
                            {post.title}
                          </h2>
                          <p className="mt-2 text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-slate-400">{formatDate(post.published_at)}</span>
                            <span className="text-xs font-semibold text-primary group-hover:underline">Lire →</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Pub bas de page liste */}
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <BlogAdBanner adSlot="blog-list-bottom" label="Sponsorisé" minHeight="min-h-[80px]" />
      </div>

      {/* CTA */}
      <section className="border-t border-slate-200/60 bg-gradient-to-br from-primary/5 to-emerald-50/40 py-14">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Prêt à créer vos documents professionnels ?</h2>
          <p className="mt-3 text-slate-600">Factures, CV, contrats, bulletins de paie — gratuitement, en FCFA, sans inscription.</p>
          <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-md hover:brightness-105 transition">
            Accéder à DocuGestIvoire
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200/60 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} DocuGestIvoire — Tous droits réservés ·{" "}
        <Link href="/" className="hover:text-primary">Retour à l'accueil</Link>
      </footer>
    </div>
  );
}
