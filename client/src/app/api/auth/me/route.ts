/**
 * GET /api/auth/me — profil courant (Bearer JWT).
 */
import { NextResponse } from "next/server";
import { requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  console.log("[api/auth/me] GET");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  const me = await store.getMe(auth.sub);
  if (!me) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json(me);
}
