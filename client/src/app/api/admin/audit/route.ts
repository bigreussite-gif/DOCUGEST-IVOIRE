import { NextResponse } from "next/server";
import { requireBackoffice, requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  console.log("[api/admin/audit] GET");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;

  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit")) || 100));

  try {
    const items = await store.listAuditLogs({ limit });
    return NextResponse.json({ items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Erreur journal" }, { status: 500 });
  }
}
