/**
 * POST /api/auth/password-reset
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8)
});

export async function POST(req: Request) {
  console.log("[api/auth/password-reset] POST");
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Champs invalides" }, { status: 400 });
    }
    const { token, newPassword } = parsed.data;
    const secret = process.env.JWT_SECRET;
    if (!secret) return NextResponse.json({ message: "Configuration serveur" }, { status: 503 });

    let payload: jwt.JwtPayload & { sub?: string; purpose?: string };
    try {
      payload = jwt.verify(token, secret) as jwt.JwtPayload & { sub?: string; purpose?: string };
    } catch {
      return NextResponse.json({ message: "Token de réinitialisation invalide ou expiré" }, { status: 400 });
    }

    if (!payload || payload.purpose !== "reset" || !payload.sub) {
      return NextResponse.json({ message: "Token invalide" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    const ok = await store.updatePassword(payload.sub, password_hash);
    if (!ok) return NextResponse.json({ message: "Erreur" }, { status: 500 });

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[api/auth/password-reset]", e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
