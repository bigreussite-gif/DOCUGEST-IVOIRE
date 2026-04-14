/**
 * GET /api/auth/me — profil courant (Bearer JWT).
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

const patchSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  whatsapp: z.string().trim().max(32).nullable().optional(),
  country: z.string().trim().max(80).nullable().optional(),
  photo_url: z
    .union([z.string().trim().url().max(500), z.literal(""), z.null()])
    .optional()
});

export async function GET(req: Request) {
  console.log("[api/auth/me] GET");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  let me = await store.getMe(auth.sub);
  
  // Just-In-Time (JIT) Provisioning : si l'utilisateur est authentifié InsForge mais absent de la DB locale
  if (!me) {
    console.log("[api/auth/me] Utilisateur absent de la DB locale, tentative de JIT Provisioning pour UID:", auth.sub);
    const token = req.headers.get("authorization")?.slice(7);
    if (token) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
        const res = await fetch(`${baseUrl}/api/auth/sessions/current`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const body = await res.json();
          const user = body?.user || body?.data?.user;
          if (user) {
            const userId = user.id;
            const userEmail = user.email;
            const userName = user.name || user.full_name || userEmail.split('@')[0];
            const userPhone = user.phone || '';

            console.log("[api/auth/me] Création record pour:", userEmail);
            const pool = getPool();
            await pool.query(
              `INSERT INTO public.users (id, full_name, email, phone, role) 
               VALUES ($1, $2, $3, $4, 'user')
               ON CONFLICT (id) DO UPDATE SET last_login = NOW()`,
              [userId, userName, userEmail, userPhone]
            );
            me = await store.getMe(auth.sub);
          }
        }
      } catch (err) {
        console.error("[api/auth/me] JIT fail", err);
      }
    }
  }

  if (!me) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json(me);
}

export async function PATCH(req: Request) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Champs invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  const rawPhoto = parsed.data.photo_url;
  const clean = {
    full_name: parsed.data.full_name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    whatsapp: parsed.data.whatsapp?.trim() || null,
    country: parsed.data.country?.trim() || null,
    photo_url: rawPhoto === "" || rawPhoto === null || rawPhoto === undefined ? null : String(rawPhoto).trim()
  };

  const pool = getPool();
  try {
    await pool.query(
      `UPDATE public.users SET
        full_name = $2,
        email = $3,
        whatsapp = $4,
        phone = CASE
          WHEN $4::text IS NOT NULL AND length(trim($4::text)) > 0 THEN trim($4::text)
          ELSE phone
        END,
        user_typology = $5,
        company_logo_url = $6
      WHERE id = $1`,
      [auth.sub, clean.full_name, clean.email, clean.whatsapp, clean.country, clean.photo_url]
    );
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23505") {
      return NextResponse.json({ message: "Email déjà utilisé" }, { status: 409 });
    }
    throw e;
  }

  const me = await store.getMe(auth.sub);
  if (!me) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json(me);
}
