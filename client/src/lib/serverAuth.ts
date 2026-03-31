/**
 * Authentification des Route Handlers Next.js (JWT Bearer).
 * Remplace le middleware Express requireAuth.
 */
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import type { PublicUser } from "@/models/User";
import * as store from "@/lib/serverStore";

export function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) return null;
  return auth.slice(7).trim();
}

export type SessionAuth = { sub: string; role: string };

function decodeSessionToken(token: string): SessionAuth | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const payload = jwt.verify(token, secret) as jwt.JwtPayload & { sub?: string; role?: string };
    if (!payload.sub) return null;
    return { sub: payload.sub, role: String(payload.role ?? "user") };
  } catch {
    return null;
  }
}

export async function requireSessionAuth(req: Request): Promise<SessionAuth | NextResponse> {
  const token = getBearerToken(req);
  if (!token) {
    console.log("[serverAuth] pas de token Bearer");
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }
  try {
    const auth = decodeSessionToken(token);
    if (!auth) return NextResponse.json({ message: "Token invalide" }, { status: 401 });
    return auth;
  } catch (e) {
    console.log("[serverAuth] JWT invalide", e);
    return NextResponse.json({ message: "Token invalide ou expiré" }, { status: 401 });
  }
}

/** Retourne la session si le token est valide, sinon null (sans erreur 401). */
export function optionalSessionAuth(req: Request): SessionAuth | null {
  const token = getBearerToken(req);
  if (!token) return null;
  return decodeSessionToken(token);
}

export function roleRank(role: string): number {
  const r: Record<string, number> = {
    super_admin: 4,
    admin: 3,
    manager: 2,
    operator: 1,
    user: 0
  };
  return r[role] ?? 0;
}

/** Back-office : operator et au-dessus (rôle issu du JWT — peut être périmé). */
export function requireBackoffice(auth: SessionAuth): NextResponse | null {
  if (roleRank(auth.role) < 1) {
    return NextResponse.json({ message: "Accès réservé à l’équipe DocuGestIvoire." }, { status: 403 });
  }
  return null;
}

export type BackofficeContext = { auth: SessionAuth; me: PublicUser };

/**
 * Vérifie l’accès back-office à partir du rôle **en base** (pas seulement le JWT).
 * Appelle ensureBootstrapAdmin pour débloquer le 1er super admin / email bootstrap.
 */
export async function requireBackofficeRequest(req: Request): Promise<BackofficeContext | NextResponse> {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await store.ensureBootstrapAdmin(auth.sub);
  } catch {
    /* DB / migration */
  }
  const me = await store.getMe(auth.sub);
  if (!me) {
    return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  }
  const dbRole = String(me.role ?? "user");
  if (roleRank(dbRole) < 1) {
    return NextResponse.json({ message: "Accès réservé à l’équipe DocuGestIvoire." }, { status: 403 });
  }
  return { auth: { sub: auth.sub, role: dbRole }, me };
}

export function requireUserManager(auth: SessionAuth): NextResponse | null {
  if (!["super_admin", "admin"].includes(auth.role)) {
    return NextResponse.json({ message: "Droits insuffisants pour gérer les utilisateurs." }, { status: 403 });
  }
  return null;
}

export function clientIp(req: Request): string | null {
  const x = req.headers.get("x-forwarded-for");
  if (x && x.length > 0) return x.split(",")[0].trim();
  return null;
}
