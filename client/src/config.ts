function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export const config = {
  /** API Express actuelle (`/api/auth`, `/api/documents`). Pas l’URL InsForge tant que le backend n’est pas migré. */
  apiBaseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"),
  appUrl: trimTrailingSlash(import.meta.env.VITE_APP_URL || "http://localhost:5173"),
  /** Backend InsForge (PostgREST + SDK). Ex. https://xxxx.insforge.app — pour intégration @insforge/sdk. */
  insforgeUrl: import.meta.env.VITE_INSFORGE_URL
    ? trimTrailingSlash(import.meta.env.VITE_INSFORGE_URL)
    : undefined
};

