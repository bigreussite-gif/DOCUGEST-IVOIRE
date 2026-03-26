/**
 * POST /api/admin/bootstrap-super-admin
 * Permet de débloquer le premier super admin.
 */
import { NextResponse } from "next/server";
import { requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  const me = await store.getUserById(auth.sub);
  if (!me) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  if (me.role === "super_admin") return NextResponse.json({ ok: true, elevated: false, reason: "already_super_admin" });

  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase() || null;
  if (!bootstrapEmail) {
    return NextResponse.json(
      { message: "Activation verrouillée: ADMIN_BOOTSTRAP_EMAIL doit être configuré." },
      { status: 403 }
    );
  }

  const matchesBootstrapEmail = String(me.email).toLowerCase() === bootstrapEmail;
  if (!matchesBootstrapEmail) {
    return NextResponse.json(
      { message: "Ce compte n'est pas autorisé à activer le super administrateur." },
      { status: 403 }
    );
  }

  const superAdminCount = await store.countSuperAdmins();
  if (superAdminCount > 0) {
    return NextResponse.json(
      { message: "Un super administrateur existe déjà. Utilisez le module équipe pour gérer les accès." },
      { status: 403 }
    );
  }

  const ok = await store.promoteToSuperAdmin(auth.sub);
  if (!ok) return NextResponse.json({ message: "Promotion impossible" }, { status: 500 });
  return NextResponse.json({ ok: true, elevated: true });
}
