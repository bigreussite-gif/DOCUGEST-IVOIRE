/** Évite `https://host/` + `/api/...` → `//api/...` (Express ne matche pas les routes). */
function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * Next.js : variables publiques préfixées NEXT_PUBLIC_ (voir .env / Vercel).
 * En production, base vide = fetch same-origin vers `/api/*` (Route Handlers + legacy Express).
 */
function resolveApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return normalizeOrigin(fromEnv);
  }
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return "http://localhost:4000";
}

function resolveAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return normalizeOrigin(fromEnv);
  }
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return "http://localhost:5173";
}

export const config = {
  apiBaseUrl: resolveApiBase(),
  appUrl: resolveAppUrl()
};
