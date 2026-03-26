/**
 * Auth : hash bcrypt, JWT, mapping utilisateur public (sans secrets).
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { PublicUser, UserRow } from "@/models/User";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Même convention que l’API Express historique : { sub, role } */
export function signSessionToken(params: { userId: string; role: string; rememberMe?: boolean }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET manquant dans l’environnement.");
  }
  const exp = params.rememberMe ? "30d" : "1d";
  return jwt.sign({ sub: params.userId, role: params.role ?? "user" }, secret, { expiresIn: exp });
}

/** Retourne l’objet exposé au client (jamais le hash) */
export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    full_name: row.full_name,
    phone: row.phone,
    whatsapp: row.whatsapp ?? null,
    email: row.email,
    company_name: row.company_name ?? null,
    company_logo_url: row.company_logo_url ?? null,
    company_address: row.company_address ?? null,
    company_ncc: row.company_ncc ?? null,
    company_rccm: row.company_rccm ?? null,
    company_dfe: row.company_dfe ?? null,
    company_regime: row.company_regime ?? null,
    role: row.role ?? "user",
    permission_level: row.permission_level ?? "write",
    gender: row.gender ?? null,
    user_typology: row.user_typology ?? null
  };
}
