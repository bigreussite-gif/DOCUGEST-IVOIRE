/** Évite `https://host/` + `/api/...` → `//api/...` (Express ne matche pas les routes). */
function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * En production (build Vite), base vide = fetch vers la même origine que le site (Vercel `/api/*`).
 * En dev, API Express sur le port 4000 sauf si VITE_API_BASE_URL est défini.
 */
function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return normalizeOrigin(fromEnv);
  }
  if (import.meta.env.PROD) {
    return "";
  }
  return "http://localhost:4000";
}

function resolveAppUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return normalizeOrigin(fromEnv);
  }
  if (import.meta.env.PROD) {
    return "";
  }
  return "http://localhost:5173";
}

export const config = {
  apiBaseUrl: resolveApiBase(),
  appUrl: resolveAppUrl()
};
