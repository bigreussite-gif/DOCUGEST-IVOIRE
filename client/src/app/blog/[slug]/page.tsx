import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { runWithDbRetry } from "@/lib/db";
import * as store from "@/lib/serverStore";
import type { BlogPost } from "@/lib/serverStore";
import { BlogAdBanner } from "@/components/promo/BlogAdBanner";
import { ShareButtons } from "@/components/blog/ShareButtons";

export const runtime = "nodejs";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; grad: string }> = {
  Facturation:           { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",   grad: "from-blue-500 to-cyan-500" },
  "Ressources humaines": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", grad: "from-emerald-500 to-teal-500" },
  Emploi:                { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",  grad: "from-green-500 to-lime-500" },
  Juridique:             { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  grad: "from-amber-500 to-orange-500" },
  Entrepreneuriat:       { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200", grad: "from-violet-500 to-purple-600" },
  general:               { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",  grad: "from-slate-400 to-slate-600" },
};

function catStyle(cat: string) {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.general;
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await runWithDbRetry(() => store.getBlogPostBySlug(slug), 3);
  } catch {
    return null;
  }
}

async function getRelated(category: string, excludeSlug: string): Promise<BlogPost[]> {
  try {
    const all = await runWithDbRetry(() => store.listBlogPosts({ publishedOnly: true }), 3);
    return all.filter((p) => p.category === category && p.slug !== excludeSlug).slice(0, 3);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article introuvable | DocuGestIvoire" };
  return {
    title: post.meta_title || `${post.title} | DocuGestIvoire`,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      authors: [post.author_name],
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || !post.published) notFound();

  const related = await getRelated(post.category, post.slug);
  const s = catStyle(post.category);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-docugest-ivoire.png" alt="DocuGestIvoire" className="h-11 w-auto" />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/blog" className="text-slate-600 hover:text-primary transition">Blog</Link>
            <Link href="/dashboard" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105 transition">
              Créer un document
            </Link>
          </nav>
        </div>
      </header>

      {/* Cover banner */}
      <div className={`h-36 w-full bg-gradient-to-br ${s.grad} sm:h-52`} />

      {/* Article container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">

          {/* Main content */}
          <article className="-mt-10 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md sm:-mt-16 sm:p-10">
            {/* Breadcrumb */}
            <nav className="mb-5 flex items-center gap-2 text-xs text-slate-400">
              <Link href="/" className="hover:text-primary">Accueil</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-primary">Blog</Link>
              <span>/</span>
              <span className="text-slate-600">{post.category}</span>
            </nav>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}>
                {post.category}
              </span>
              <span className="text-xs text-slate-400">{post.reading_time_min} min de lecture</span>
              {post.published_at && (
                <span className="text-xs text-slate-400">{formatDate(post.published_at)}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="mt-4 rounded-xl border-l-4 border-primary bg-primary/5 px-4 py-3 text-slate-700 italic leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author */}
            <div className="mt-5 flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                DG
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{post.author_name}</div>
                <div className="text-xs text-slate-400">DocuGestIvoire · Équipe éditoriale</div>
              </div>
            </div>

            {/* Content */}
            <div
              className="prose prose-slate prose-sm mt-8 max-w-none sm:prose-base
                prose-headings:font-bold prose-headings:text-slate-900
                prose-h2:mt-8 prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2
                prose-h3:mt-5 prose-h3:text-base prose-h3:text-slate-800
                prose-p:text-slate-700 prose-p:leading-relaxed
                prose-ul:space-y-1 prose-li:text-slate-700
                prose-ol:space-y-1
                prose-strong:text-slate-900
                prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              // biome-ignore lint: contenu de confiance — écrit par les admins
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Pub milieu article */}
            <BlogAdBanner adSlot="blog-article-mid" label="Sponsorisé" className="mt-10" minHeight="min-h-[80px]" />

            {/* CTA */}
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-50 p-6 text-center">
              <p className="font-semibold text-slate-800">Prêt à mettre en pratique ?</p>
              <p className="mt-1 text-sm text-slate-600">Créez vos documents professionnels gratuitement sur DocuGestIvoire.</p>
              <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:brightness-105 transition">
                Accéder à la plateforme →
              </Link>
            </div>

            {/* Share */}
            <ShareButtons
              url={`https://docugest-ivoire.vercel.app/blog/${post.slug}`}
              title={post.title}
            />
          </article>

          {/* Sidebar */}
          <aside className="mt-6 space-y-6 lg:mt-0 lg:pt-6">
            {/* Pub sidebar */}
            <BlogAdBanner adSlot="blog-sidebar" label="Publicité" minHeight="min-h-[120px]" />

            {/* About DocuGestIvoire */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="/logo-docugest-ivoire.png" alt="DocuGestIvoire" className="h-12 w-auto" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                La plateforme gratuite de génération de documents professionnels pour les entrepreneurs ivoiriens.
              </p>
              <Link href="/dashboard" className="mt-4 block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white hover:brightness-105 transition">
                Créer un document gratuit
              </Link>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Articles similaires</h3>
                <div className="mt-3 space-y-3">
                  {related.map((r) => {
                    const rs = catStyle(r.category);
                    return (
                      <Link key={r.id} href={`/blog/${r.slug}`} className="group block">
                        <div className={`mb-1 h-1 w-8 rounded-full bg-gradient-to-r ${rs.grad}`} />
                        <p className="text-sm font-medium text-slate-800 group-hover:text-primary transition line-clamp-2">
                          {r.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">{r.reading_time_min} min</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pub bas de sidebar */}
            <BlogAdBanner adSlot="blog-sidebar-bottom" label="Publicité" minHeight="min-h-[100px]" />

            {/* Categories */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Catégories</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(CATEGORY_COLORS).filter((k) => k !== "general").map((cat) => {
                  const cs = catStyle(cat);
                  return (
                    <Link
                      key={cat}
                      href="/blog"
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition hover:opacity-80 ${cs.bg} ${cs.text} ${cs.border}`}
                    >
                      {cat}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/60 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} DocuGestIvoire ·{" "}
        <Link href="/blog" className="hover:text-primary">Blog</Link> ·{" "}
        <Link href="/" className="hover:text-primary">Accueil</Link>
      </footer>
    </div>
  );
}
