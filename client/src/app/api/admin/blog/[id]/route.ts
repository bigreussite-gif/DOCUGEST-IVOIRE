import { NextResponse } from "next/server";
import { requireBackoffice, requireSessionAuth } from "@/lib/serverAuth";
import { runWithDbRetry } from "@/lib/db";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  const { id } = await params;
  try {
    await runWithDbRetry(() => store.deleteBlogPost(id), 4);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/admin/blog/[id]] DELETE", e);
    return NextResponse.json({ message: "Erreur suppression" }, { status: 500 });
  }
}
