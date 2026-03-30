import { NextResponse } from "next/server";
import { runWithDbRetry } from "@/lib/db";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const posts = await runWithDbRetry(() => store.listBlogPosts({ publishedOnly: true }), 4);
    return NextResponse.json(
      { posts },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" } }
    );
  } catch (e) {
    console.error("[api/blog] GET", e);
    return NextResponse.json({ posts: [], degraded: true });
  }
}
