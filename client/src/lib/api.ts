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

  if (!res.ok) {
    let payload: ApiError | undefined;
    try {
      payload = await res.json();
    } catch {
      payload = { message: await res.text() };
    }
    throw payload ?? { message: "Erreur API inconnue" };
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

