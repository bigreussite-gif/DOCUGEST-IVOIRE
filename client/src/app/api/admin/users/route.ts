/**
 * GET /api/admin/users
 * POST /api/admin/users
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { clientIp, requireBackoffice, requireSessionAuth, requireUserManager } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

const createUserSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  password: z.string().min(8),
  role: z.enum(["super_admin", "admin", "manager", "operator", "user"]),
  permission_level: z.enum(["read", "write", "admin"]).default("write"),
  gender: z.enum(["male", "female", "other", "unknown"]).optional().nullable(),
  user_typology: z.string().max(64).optional().nullable()
});

export async function GET(req: Request) {
  console.log("[api/admin/users] GET");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  const needMgr = requireUserManager(auth);
  if (needMgr) return needMgr;

  try {
    const items = await store.listUsersAdmin();
    return NextResponse.json({ items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Erreur liste utilisateurs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  console.log("[api/admin/users] POST");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  const needMgr = requireUserManager(auth);
  if (needMgr) return needMgr;

  const parsed = createUserSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;
  if (body.role === "super_admin" && auth.role !== "super_admin") {
    return NextResponse.json({ message: "Seul le super administrateur peut créer un super administrateur." }, { status: 403 });
  }

  const password_hash = await bcrypt.hash(body.password, 12);
  const created = await store.createUserAdmin({
    full_name: body.full_name,
    phone: body.phone,
    whatsapp: null,
    email: body.email,
    password_hash,
    role: body.role,
    permission_level: body.permission_level,
    gender: body.gender ?? null,
    user_typology: body.user_typology ?? null
  });

  if (!created.ok) return NextResponse.json({ message: created.reason }, { status: 409 });

  await store.appendAuditLog({
    actorId: auth.sub,
    action: "user.create",
    targetType: "user",
    targetId: (created.user as { id: string }).id,
    metadata: { email: body.email, role: body.role },
    ip: clientIp(req)
  });

  return NextResponse.json({ id: (created.user as { id: string }).id }, { status: 201 });
}
