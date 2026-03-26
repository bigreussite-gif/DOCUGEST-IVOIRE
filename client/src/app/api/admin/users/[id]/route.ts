/**
 * PATCH /api/admin/users/:id
 * DELETE /api/admin/users/:id
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, requireBackoffice, requireSessionAuth, requireUserManager } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

const updateUserSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  whatsapp: z.string().nullable().optional(),
  role: z.enum(["super_admin", "admin", "manager", "operator", "user"]),
  permission_level: z.enum(["read", "write", "admin"]),
  gender: z.enum(["male", "female", "other", "unknown"]).nullable().optional(),
  user_typology: z.string().max(64).nullable().optional()
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: Ctx) {
  const { id } = await context.params;
  console.log("[api/admin/users/:id] PATCH", id);
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  const needMgr = requireUserManager(auth);
  if (needMgr) return needMgr;

  const parsed = updateUserSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;
  if (body.role === "super_admin" && auth.role !== "super_admin") {
    return NextResponse.json({ message: "Interdit" }, { status: 403 });
  }

  const target = await store.getUserById(id);
  if (!target) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  if (target.role === "super_admin" && auth.role !== "super_admin") {
    return NextResponse.json({ message: "Interdit" }, { status: 403 });
  }

  const updated = await store.updateUserAdmin({
    id,
    full_name: body.full_name,
    phone: body.phone,
    whatsapp: body.whatsapp ?? null,
    email: body.email,
    role: body.role,
    permission_level: body.permission_level,
    gender: body.gender ?? null,
    user_typology: body.user_typology ?? null
  });

  await store.appendAuditLog({
    actorId: auth.sub,
    action: "user.update",
    targetType: "user",
    targetId: id,
    metadata: { email: body.email, role: body.role },
    ip: clientIp(req)
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(req: Request, context: Ctx) {
  const { id } = await context.params;
  console.log("[api/admin/users/:id] DELETE", id);
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  const needMgr = requireUserManager(auth);
  if (needMgr) return needMgr;

  if (id === auth.sub) {
    return NextResponse.json({ message: "Impossible de supprimer votre propre compte ici." }, { status: 400 });
  }

  const target = await store.getUserById(id);
  if (!target) return NextResponse.json({ message: "Introuvable" }, { status: 404 });
  if (target.role === "super_admin" && auth.role !== "super_admin") {
    return NextResponse.json({ message: "Seul le super administrateur peut supprimer un super administrateur." }, { status: 403 });
  }

  const ok = await store.deleteUserAdmin(id);
  if (!ok) return NextResponse.json({ message: "Suppression impossible" }, { status: 500 });

  await store.appendAuditLog({
    actorId: auth.sub,
    action: "user.delete",
    targetType: "user",
    targetId: id,
    metadata: { email: target.email },
    ip: clientIp(req)
  });

  return new NextResponse(null, { status: 204 });
}
