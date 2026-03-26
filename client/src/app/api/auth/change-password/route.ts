/**
 * POST /api/auth/change-password — changement de mot de passe utilisateur connecté.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "Mot de passe : min. 8 caractères"),
    confirmPassword: z.string().min(8)
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas"
  });

export async function POST(req: Request) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Champs invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await store.getUserById(auth.sub);
  if (!user) {
    return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password_hash);
  if (!valid) {
    return NextResponse.json({ message: "Mot de passe actuel incorrect" }, { status: 401 });
  }

  const nextHash = await hashPassword(parsed.data.newPassword);
  await store.updatePassword(auth.sub, nextHash);

  return NextResponse.json({ ok: true });
}
