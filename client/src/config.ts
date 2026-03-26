/** Évite `https://host/` + `/api/...` → `//api/...` (Express ne matche pas les routes). */
function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function isLocalOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

/**
 * Next.js : variables publiques préfixées NEXT_PUBLIC_ (voir .env / Vercel).
 * Par défaut : même origine que le front → `/api/*` servi par les Route Handlers Next (Vercel + dev).
 * Pour pointer vers l’ancien serveur Express local : NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
 */
function resolveApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    const normalized = normalizeOrigin(fromEnv);
    const allowExternal = process.env.NEXT_PUBLIC_ALLOW_EXTERNAL_API_BASE === "1";
    if (process.env.NODE_ENV === "production" && !allowExternal && !isLocalOrigin(normalized)) {
      // Garde-fou: évite les 404 sur des domaines externes qui n'exposent pas /api/auth/register.
      return "";
    }
    return normalized;
  }
  return "";
}

function resolveAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return normalizeOrigin(fromEnv);
  }
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return "http://localhost:3000";
}

export const config = {
  apiBaseUrl: resolveApiBase(),
  appUrl: resolveAppUrl()
};
