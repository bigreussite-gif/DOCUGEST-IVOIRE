import { useEffect, useState } from "react";
import { adminFetch } from "../../lib/adminApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  author_name: string;
  published: boolean;
  published_at: string | null;
  meta_title: string;
  meta_description: string;
  reading_time_min: number;
  created_at: string;
  updated_at: string;
};

const CATEGORIES = [
  "Facturation",
  "Ressources humaines",
  "Emploi",
  "Juridique",
  "Entrepreneuriat",
  "DocuGest",
  "general",
];

function emptyPost(): Partial<BlogPost> {
  return {
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    category: "general",
    author_name: "DocuGest Ivoire",
    published: false,
    published_at: null,
    meta_title: "",
    meta_description: "",
    reading_time_min: 3,
  };
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 120);
}

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "edit">("list");
  const [form, setForm] = useState<Partial<BlogPost>>(emptyPost());
  const [busy, setBusy] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function load() {
    setLoadError(null);
    try {
      const res = await adminFetch<{ posts: BlogPost[]; degraded?: boolean }>("/blog");
      setPosts(res.posts ?? []);
      if (res.degraded && (!res.posts || res.posts.length === 0)) {
        setLoadError("La base de données est temporairement indisponible. Réessayez dans quelques secondes.");
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Impossible de charger les articles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startNew() {
    setForm(emptyPost());
    setMsg(null);
    setView("edit");
  }

  function startEdit(p: BlogPost) {
    setForm({ ...p });
    setMsg(null);
    setView("edit");
  }

  function set<K extends keyof BlogPost>(k: K, v: BlogPost[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    if (!form.title?.trim()) { setMsg("Le titre est obligatoire."); return; }
    if (!form.slug?.trim()) { setMsg("Le slug est obligatoire."); return; }
    setBusy(true);
    setMsg(null);
    try {
      await adminFetch("/blog", { method: "POST", json: form });
      setMsg("Article enregistré ✓");
      await load();
      setTimeout(() => setView("list"), 800);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur sauvegarde");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(id: string) {
    setBusy(true);
    try {
      await adminFetch(`/blog/${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      await load();
    } catch {
      setMsg("Erreur suppression");
    } finally {
      setBusy(false);
    }
  }

  async function seedArticles() {
    setSeeding(true);
    setMsg(null);
    try {
      const res = await adminFetch<{ seeded: number }>("/blog/seed", { method: "POST" });
      setMsg(`${res.seeded} articles de démarrage insérés avec succès ✓`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur lors de l'insertion des articles");
    } finally {
      setSeeding(false);
      // Toujours recharger la liste après le seed, succès ou échec
      await load();
    }
  }

  /* ── LISTE ── */
  if (view === "list") {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">Contenu</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Articles de blog</h1>
            <p className="mt-1 text-sm text-slate-600">
              Rédigez et publiez des articles SEO pour référencer DocuGest sur Google.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void seedArticles()}
              disabled={seeding || loading}
              title={posts.length > 0 ? "Re-insérer / mettre à jour les 10 articles de démarrage" : undefined}
            >
              {seeding ? "Insertion…" : "✨ Pré-remplir 10 articles de démarrage"}
            </Button>
            <Button type="button" onClick={startNew}>
              + Nouvel article
            </Button>
          </div>
        </header>

        {msg ? (
          <p className={`rounded-xl px-4 py-2 text-sm ${msg.includes("✓") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {msg}
          </p>
        ) : null}

        {loadError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Impossible de charger les articles :</strong> {loadError}
            <button
              type="button"
              onClick={() => void load()}
              className="ml-3 underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-400">
            Chargement des articles…
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <p className="text-slate-500">Aucun article pour l'instant.</p>
            <p className="mt-2 text-sm text-slate-400">
              Cliquez sur <strong>Pré-remplir 10 articles</strong> pour publier immédiatement des guides SEO.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Lu / min</th>
                  <th className="px-4 py-3">Mis à jour</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[260px]">
                      <div className="truncate">{p.title}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-400 truncate">/blog/{p.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{p.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.published ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {p.published ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.reading_time_min} min</td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.updated_at ? new Date(p.updated_at).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition"
                        >
                          Modifier
                        </button>
                        {p.published && (
                          <a
                            href={`/blog/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                          >
                            Voir
                          </a>
                        )}
                        {deleteConfirm === p.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void deletePost(p.id)}
                              disabled={busy}
                              className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition"
                            >
                              Confirmer
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(p.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  /* ── ÉDITEUR ── */
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => { setView("list"); setMsg(null); }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
        >
          ← Retour
        </button>
        <h1 className="text-xl font-bold text-slate-900">{form.id ? "Modifier l'article" : "Nouvel article"}</h1>
      </div>

      {msg ? (
        <p className={`rounded-xl px-4 py-2 text-sm ${msg.includes("✓") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {msg}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Contenu principal */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">Contenu de l'article</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Titre <span className="text-red-500">*</span></label>
              <input
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.title ?? ""}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!form.id) set("slug", slugify(e.target.value));
                }}
                placeholder="Ex. Comment créer une facture professionnelle en Côte d'Ivoire"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Slug (URL) <span className="text-red-500">*</span></label>
              <div className="flex items-center rounded-xl border border-border bg-slate-50 overflow-hidden">
                <span className="px-3 py-3 text-xs text-slate-400 select-none">/blog/</span>
                <input
                  className="flex-1 bg-transparent py-3 pr-4 text-sm font-mono focus:outline-none"
                  value={form.slug ?? ""}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Accroche / Extrait</label>
              <textarea
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                value={form.excerpt ?? ""}
                onChange={(e) => set("excerpt", e.target.value)}
                placeholder="1–2 phrases qui donnent envie de lire l'article (affiché dans la liste)…"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Contenu HTML{" "}
                <span className="text-[11px] font-normal text-slate-400">(balises &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;blockquote&gt;…)</span>
              </label>
              <textarea
                className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={22}
                value={form.content ?? ""}
                onChange={(e) => set("content", e.target.value)}
                placeholder={"<h2>Introduction</h2>\n<p>Votre contenu ici…</p>"}
              />
            </div>
          </div>
        </div>

        {/* Sidebar réglages */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">Publication</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published ?? false}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary"
              />
              <span className="text-sm font-medium text-slate-700">Publié (visible sur le blog)</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Catégorie</span>
              <select
                value={form.category ?? "general"}
                onChange={(e) => set("category", e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-border bg-white px-4 py-2 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <Input
              label="Auteur"
              value={form.author_name ?? "DocuGest Ivoire"}
              onChange={(e) => set("author_name", e.target.value)}
            />
            <Input
              label="Temps de lecture (minutes)"
              type="number"
              value={String(form.reading_time_min ?? 3)}
              onChange={(e) => set("reading_time_min", Number(e.target.value))}
            />
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">SEO</h2>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Meta title (≤ 60 caractères)</span>
              <input
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                value={form.meta_title ?? ""}
                onChange={(e) => set("meta_title", e.target.value)}
                maxLength={300}
              />
              <span className="mt-0.5 block text-[10px] text-slate-400">{(form.meta_title ?? "").length}/60</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Meta description (≤ 160 caractères)</span>
              <textarea
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                rows={3}
                value={form.meta_description ?? ""}
                onChange={(e) => set("meta_description", e.target.value)}
                maxLength={600}
              />
              <span className="mt-0.5 block text-[10px] text-slate-400">{(form.meta_description ?? "").length}/160</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">URL image de couverture (optionnel)</span>
              <input
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                value={form.cover_image_url ?? ""}
                onChange={(e) => set("cover_image_url", e.target.value)}
                placeholder="https://…"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <Button type="button" onClick={() => void save()} disabled={busy} className="w-full">
              {busy ? "Enregistrement…" : form.id ? "Mettre à jour" : "Publier l'article"}
            </Button>
            {form.id && form.published && (
              <a
                href={`/blog/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Voir l'article en ligne →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
