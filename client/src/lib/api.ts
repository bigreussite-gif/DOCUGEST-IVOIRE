import { config } from "../config";

export type ApiError = {
  message: string;
  details?: unknown;
};

export async function apiFetch<T>(path: string, init?: RequestInit & { json?: unknown }) {
  const token = localStorage.getItem("docugest_token");

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body
  });

  const raw = await res.text();

  if (!res.ok) {
    let payload: ApiError;
    try {
      const parsed = raw ? (JSON.parse(raw) as unknown) : null;
      if (parsed && typeof parsed === "object" && parsed !== null && "message" in parsed) {
        payload = parsed as ApiError;
      } else {
        payload = { message: raw || `Erreur ${res.status}` };
      }
    } catch {
      payload = { message: raw || `Erreur ${res.status}` };
    }
    throw payload;
  }

  if (res.status === 204 || raw === "") return undefined as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw { message: "Réponse serveur invalide" } satisfies ApiError;
  }
}

