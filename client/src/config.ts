/** Évite `https://host/` + `/api/...` → `//api/...` (Express ne matche pas les routes). */
function normalizeOrigin(url: string | undefined, fallback: string): string {
  const raw = (url ?? "").trim() || fallback;
  return raw.replace(/\/+$/, "");
}

export const config = {
  apiBaseUrl: normalizeOrigin(import.meta.env.VITE_API_BASE_URL, "http://localhost:4000"),
  appUrl: normalizeOrigin(import.meta.env.VITE_APP_URL, "http://localhost:5173")
};

