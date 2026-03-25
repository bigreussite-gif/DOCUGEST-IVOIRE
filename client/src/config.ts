function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

/** En prod sans VITE_API_BASE_URL, même origine → routes /api/* (proxy Vercel si BACKEND_URL est défini). */
function defaultApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env && String(env).trim() !== "") return trimTrailingSlash(String(env));
  if (import.meta.env.DEV) return "http://localhost:4000";
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export const config = {
  /** API Express (`/api/auth`, `/api/documents`). */
  apiBaseUrl: defaultApiBaseUrl(),
  appUrl: trimTrailingSlash(import.meta.env.VITE_APP_URL || "http://localhost:5173"),
  /** Backend InsForge (PostgREST + SDK). Ex. https://xxxx.insforge.app — pour intégration @insforge/sdk. */
  insforgeUrl: import.meta.env.VITE_INSFORGE_URL
    ? trimTrailingSlash(import.meta.env.VITE_INSFORGE_URL)
    : undefined
};

