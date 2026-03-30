import { NextResponse } from "next/server";
import { runWithDbRetry } from "@/lib/db";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const post = await runWithDbRetry(() => store.getBlogPostBySlug(slug), 4);
    if (!post || !post.published) {
      return NextResponse.json({ message: "Article introuvable" }, { status: 404 });
    }
    return NextResponse.json(
      { post },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=120" } }
    );
  } catch (e) {
    console.error("[api/blog/[slug]] GET", e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
