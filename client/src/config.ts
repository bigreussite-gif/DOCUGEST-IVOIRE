/** Évite `https://host/` + `/api/...` → `//api/...` (Express ne matche pas les routes). */
function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * Next.js : variables publiques préfixées NEXT_PUBLIC_ (voir .env / Vercel).
 * Par défaut : même origine que le front → `/api/*` servi par les Route Handlers Next (Vercel + dev).
 * Pour pointer vers l’ancien serveur Express local : NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
 */
function resolveApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return normalizeOrigin(fromEnv);
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
