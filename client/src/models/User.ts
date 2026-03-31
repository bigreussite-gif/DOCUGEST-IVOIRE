/**
 * Modèle utilisateur aligné sur la table public.users (Insforge / migrations DocuGestIvoire).
 * Le mot de passe n’est jamais exposé côté client.
 */
export type UserRole = "super_admin" | "admin" | "manager" | "operator" | "user" | string;

/** Représentation publique (API / JWT) — sans password_hash */
export type PublicUser = {
  id: string;
  full_name: string;
  phone: string;
  whatsapp?: string | null;
  email: string;
  company_name?: string | null;
  company_logo_url?: string | null;
  company_address?: string | null;
  company_ncc?: string | null;
  company_rccm?: string | null;
  company_dfe?: string | null;
  company_regime?: string | null;
  role?: UserRole;
  permission_level?: string | null;
  gender?: string | null;
  user_typology?: string | null;
};

/** Ligne SQL brute (interne) */
export type UserRow = {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  password_hash: string;
  company_name: string | null;
  company_logo_url: string | null;
  company_address: string | null;
  company_ncc: string | null;
  company_rccm: string | null;
  company_dfe: string | null;
  company_regime: string | null;
  role: string | null;
  permission_level: string | null;
  gender: string | null;
  user_typology: string | null;
  created_at?: Date;
};
