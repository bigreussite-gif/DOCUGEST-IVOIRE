/**
 * GET /api/admin/session
 */
import { NextResponse } from "next/server";
import { requireBackoffice, requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

function roleLabelFr(role: string) {
  const m: Record<string, string> = {
    super_admin: "Administrateur général",
    admin: "Administrateur",
    manager: "Manager",
    operator: "Opérateur",
    user: "Utilisateur"
  };
  return m[role] ?? role;
}

export async function GET(req: Request) {
  console.log("[api/admin/session] GET");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;

  const me = await store.getMe(auth.sub);
  if (!me) return NextResponse.json({ message: "Introuvable" }, { status: 404 });
  return NextResponse.json({
    user: me,
    roleLabel: roleLabelFr(String(me.role)),
    canManageUsers: ["super_admin", "admin"].includes(String(me.role))
  });
}
