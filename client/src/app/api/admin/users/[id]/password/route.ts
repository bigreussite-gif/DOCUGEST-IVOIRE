/**
 * PATCH /api/admin/users/:id/password
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { clientIp, requireBackoffice, requireSessionAuth, requireUserManager } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

const passwordSchema = z.object({ password: z.string().min(8) });

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: Ctx) {
  const { id } = await context.params;
  console.log("[api/admin/users/:id/password] PATCH", id);
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  const needMgr = requireUserManager(auth);
  if (needMgr) return needMgr;

  const parsed = passwordSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Mot de passe invalide" }, { status: 400 });
  }

  const target = await store.getUserById(id);
  if (!target) return NextResponse.json({ message: "Introuvable" }, { status: 404 });
  if (target.role === "super_admin" && auth.role !== "super_admin") {
    return NextResponse.json({ message: "Interdit" }, { status: 403 });
  }

  const password_hash = await bcrypt.hash(parsed.data.password, 12);
  await store.updateUserPasswordAdmin(id, password_hash);

  await store.appendAuditLog({
    actorId: auth.sub,
    action: "user.password_reset",
    targetType: "user",
    targetId: id,
    metadata: {},
    ip: clientIp(req)
  });

  return new NextResponse(null, { status: 204 });
}
