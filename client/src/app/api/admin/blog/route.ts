import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBackoffice, requireSessionAuth } from "@/lib/serverAuth";
import { runWithDbRetry } from "@/lib/db";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(3).max(200),
  title: z.string().min(2).max(300),
  excerpt: z.string().max(600).optional().default(""),
  content: z.string().max(200_000).optional().default(""),
  cover_image_url: z.string().max(2_000).optional().default(""),
  category: z.string().max(80).optional().default("general"),
  author_name: z.string().max(120).optional().default("DocuGest Ivoire"),
  published: z.boolean().optional().default(false),
  published_at: z.string().nullable().optional(),
  meta_title: z.string().max(300).optional().default(""),
  meta_description: z.string().max(600).optional().default(""),
  reading_time_min: z.number().int().min(1).max(60).optional().default(3),
});

export async function GET(req: Request) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  try {
    const posts = await runWithDbRetry(() => store.listBlogPosts(), 4);
    return NextResponse.json({ posts });
  } catch (e) {
    console.error("[api/admin/blog] GET", e);
    return NextResponse.json({ posts: [], degraded: true });
  }
}

export async function POST(req: Request) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const post = await runWithDbRetry(() => store.upsertBlogPost(parsed.data), 4);
    return NextResponse.json({ post });
  } catch (e) {
    console.error("[api/admin/blog] POST", e);
    return NextResponse.json({ message: "Erreur sauvegarde article" }, { status: 500 });
  }
}
