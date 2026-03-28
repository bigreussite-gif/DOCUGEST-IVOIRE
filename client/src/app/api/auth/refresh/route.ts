/**
 * POST /api/auth/refresh
 * Réémet un JWT avec le rôle *actuel* de l'utilisateur en base.
 * Utilisé après une promotion de rôle (bootstrap super_admin) pour éviter
 * de garder un token stale avec role:"user" alors que la DB dit "super_admin".
 */
import { NextResponse } from "next/server";
import { requireSessionAuth } from "@/lib/serverAuth";
import { signSessionToken } from "@/lib/auth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    // Tente d'abord le bootstrap (cas où le rôle n'a pas encore été promu)
    try {
      await store.ensureBootstrapAdmin(auth.sub);
    } catch {
      /* non bloquant */
    }

    const me = await store.getMe(auth.sub);
    if (!me) {
      return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
    }

    const token = signSessionToken({
      userId: me.id,
      role: String(me.role ?? "user"),
      rememberMe: true
    });

    return NextResponse.json({ token, user: me });
  } catch (e) {
    console.error("[api/auth/refresh]", e);
    return NextResponse.json({ message: "Impossible de renouveler la session" }, { status: 500 });
  }
}
