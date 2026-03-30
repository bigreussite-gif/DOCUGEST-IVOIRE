import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

async function getBlogSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const base = getSiteUrl();
    const res = await fetch(`${base}/api/blog`, { cache: "no-store" });
    const data = (await res.json()) as { posts?: { slug: string; updated_at: string }[] };
    return data.posts ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const blogPosts = await getBlogSlugs();

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    ...blogPosts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
