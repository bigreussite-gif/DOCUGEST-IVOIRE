/**
 * POST /api/auth/login — connexion (Next.js uniquement).
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signSessionToken, toPublicUser } from "@/lib/auth";
import * as store from "@/lib/serverStore";
export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean()
});

export async function POST(req: Request) {
  console.log("[api/auth/login] POST reçu");
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Corps JSON invalide" }, { status: 400 });
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.log("[api/auth/login] validation échouée", parsed.error.flatten());
      return NextResponse.json({ message: "Champs invalides", details: parsed.error.flatten() }, { status: 400 });
    }
    const { email, password, rememberMe } = parsed.data;

    const userRow = await store.getUserByEmail(email);
    if (!userRow) {
      console.log("[api/auth/login] email inconnu");
      return NextResponse.json({ message: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) {
      console.log("[api/auth/login] mot de passe incorrect");
      return NextResponse.json({ message: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    await store.touchLastLogin(userRow.id);
    await store.ensureBootstrapAdmin(userRow.id);
    const me = await store.getMe(userRow.id);
    if (!me) {
      return NextResponse.json({ message: "Erreur profil" }, { status: 500 });
    }
    const token = signSessionToken({
      userId: userRow.id,
      rememberMe,
      role: String(me.role ?? "user")
    });
    console.log("[api/auth/login] succès", userRow.id);
    return NextResponse.json({ token, user: me });
  } catch (e) {
    console.error("[api/auth/login]", e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
