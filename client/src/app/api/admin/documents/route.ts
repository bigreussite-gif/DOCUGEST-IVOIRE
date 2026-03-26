/**
 * GET /api/admin/documents
 */
import { NextResponse } from "next/server";
import { requireBackoffice, requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 30)));
  const type = url.searchParams.get("type");
  const q = url.searchParams.get("q");

  try {
    const { items, total } = await store.listDocumentsAdmin({
      page,
      limit,
      type: type && type !== "all" ? type : null,
      q: q?.trim() || null
    });
    return NextResponse.json({ items, total, page, limit });
  } catch (e) {
    console.error("[api/admin/documents] GET", e);
    return NextResponse.json({
      items: [],
      total: 0,
      page,
      limit,
      degraded: true
    });
  }
}
