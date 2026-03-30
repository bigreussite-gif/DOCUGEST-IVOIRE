import { NextResponse } from "next/server";
import { requireBackoffice, requireSessionAuth } from "@/lib/serverAuth";
import { runWithDbRetry } from "@/lib/db";
import * as store from "@/lib/serverStore";
import { BLOG_SEED_ARTICLES } from "@/lib/blogSeedData";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  try {
    const results: string[] = [];
    for (const article of BLOG_SEED_ARTICLES) {
      const post = await runWithDbRetry(() => store.upsertBlogPost(article), 4);
      results.push(post.slug);
    }
    return NextResponse.json({ ok: true, seeded: results.length, slugs: results });
  } catch (e) {
    console.error("[api/admin/blog/seed] POST", e);
    return NextResponse.json({ message: "Erreur seed" }, { status: 500 });
  }
}
