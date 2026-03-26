/**
 * POST /api/auth/register — inscription (Next.js Route Handler, runtime Node).
 * Remplace l’ancienne route Express pour éviter les conflits de routage Vercel.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPool } from "@/lib/db";
import { hashPassword, signSessionToken, toPublicUser } from "@/lib/auth";
import type { UserRow } from "@/models/User";

export const runtime = "nodejs";

const bodySchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe : min. 8 caractères")
});

/** Téléphone provisoire si le formulaire minimal n’en fournit pas (NOT NULL en base) */
const PLACEHOLDER_PHONE = "+22500000000";

async function ensureBootstrapAdmin(pool: ReturnType<typeof getPool>, userId: string, email: string) {
  const bootstrap = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!bootstrap || email.toLowerCase() !== bootstrap.toLowerCase()) return;
  try {
    await pool.query(`UPDATE public.users SET role = 'super_admin' WHERE id = $1 AND lower(email) = lower($2)`, [
      userId,
      email
    ]);
  } catch {
    /* schéma sans colonne role : ignoré */
  }
}

export async function POST(req: Request) {
  console.log("[api/auth/register] POST — début");
  try {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      console.log("[api/auth/register] corps JSON invalide");
      return NextResponse.json({ message: "Corps JSON invalide" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      console.log("[api/auth/register] validation Zod", parsed.error.flatten());
      return NextResponse.json(
        { message: "Champs invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    console.log("[api/auth/register] email candidat", email);
    const pool = getPool();

    const taken = await pool.query(`SELECT 1 FROM public.users WHERE lower(email) = lower($1) LIMIT 1`, [email]);
    if (taken.rows.length > 0) {
      console.log("[api/auth/register] email déjà pris");
      return NextResponse.json({ message: "Email déjà utilisé" }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const full_name = name.trim();

    let row: UserRow;
    try {
      const ins = await pool.query(
        `INSERT INTO public.users (
          full_name, phone, whatsapp, email, password_hash
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [full_name, PLACEHOLDER_PHONE, null, email, password_hash]
      );
      row = ins.rows[0] as UserRow;
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === "23505") {
        return NextResponse.json({ message: "Email déjà utilisé" }, { status: 409 });
      }
      console.error("[register] insert", e);
      return NextResponse.json({ message: "Erreur lors de la création du compte" }, { status: 500 });
    }

    await ensureBootstrapAdmin(pool, row.id, email);

    const { rows: fresh } = await pool.query(`SELECT * FROM public.users WHERE id = $1 LIMIT 1`, [row.id]);
    const dbUser = fresh[0] ?? row;
    const me = toPublicUser(dbUser);
    const token = signSessionToken({ userId: me.id, role: String(me.role ?? "user"), rememberMe: true });

    console.log("[api/auth/register] succès user id=", me.id);
    return NextResponse.json({ token, user: me }, { status: 200 });
  } catch (e) {
    console.error("[register]", e);
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    if (msg.includes("DATABASE_URL") || msg.includes("JWT_SECRET")) {
      return NextResponse.json({ message: "Configuration serveur incomplète" }, { status: 503 });
    }
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
