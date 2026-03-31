/**
 * GET /api/admin/session
 */
import { NextResponse } from "next/server";
import { requireBackofficeRequest } from "@/lib/serverAuth";

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
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;

  const { me } = ctx;
  return NextResponse.json({
    user: me,
    roleLabel: roleLabelFr(String(me.role)),
    canManageUsers: ["super_admin", "admin"].includes(String(me.role))
  });
}
