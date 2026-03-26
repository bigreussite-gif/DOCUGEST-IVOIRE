/**
 * Authentification des Route Handlers Next.js (JWT Bearer).
 * Remplace le middleware Express requireAuth.
 */
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) return null;
  return auth.slice(7).trim();
}

export type SessionAuth = { sub: string; role: string };

export async function requireSessionAuth(req: Request): Promise<SessionAuth | NextResponse> {
  const token = getBearerToken(req);
  if (!token) {
    console.log("[serverAuth] pas de token Bearer");
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET manquant");
    const payload = jwt.verify(token, secret) as jwt.JwtPayload & { sub?: string; role?: string };
    if (!payload.sub) {
      return NextResponse.json({ message: "Token invalide" }, { status: 401 });
    }
    return { sub: payload.sub, role: String(payload.role ?? "user") };
  } catch (e) {
    console.log("[serverAuth] JWT invalide", e);
    return NextResponse.json({ message: "Token invalide ou expiré" }, { status: 401 });
  }
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

/** Back-office : operator et au-dessus */
export function requireBackoffice(auth: SessionAuth): NextResponse | null {
  if (roleRank(auth.role) < 1) {
    return NextResponse.json({ message: "Accès réservé à l’équipe DocuGest." }, { status: 403 });
  }
  return null;
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
