import { config } from "../config";

/**
 * Les routes `/api/auth/*` sont servies par les Route Handlers Next (JWT signé côté Next).
 * Si `NEXT_PUBLIC_API_BASE_URL` pointe vers un autre hôte (ex. API Express locale), il ne faut
 * pas y envoyer le Bearer : le jeton serait rejeté et la session « coincerait » après login.
 */
function resolveApiUrl(path: string): string {
  const base = config.apiBaseUrl;
  if (path.startsWith("/api/auth/")) {
    return path;
  }
  if (!base) return path;
  return `${base}${path}`;
}

export type ApiError = {
  message: string;
  details?: unknown;
  /** Présent pour les réponses HTTP en erreur (4xx/5xx). */
  status?: number;
};

async function readBodyAsText(res: Response): Promise<string> {
  const buf = await res.arrayBuffer();
  return new TextDecoder("utf-8").decode(buf);
}

/** Fetch API uniquement (sans logique hors-ligne). Utilisé par sync et api. */
export async function networkFetch<T>(path: string, init?: RequestInit & { json?: unknown }) {
  const token = localStorage.getItem("docugest_token");

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(resolveApiUrl(path), {
    ...init,
    headers,
    credentials: "include",
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body
  });

  const raw = await readBodyAsText(res);

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
    throw { ...payload, status: res.status } satisfies ApiError;
  }

  if (res.status === 204 || raw === "") return undefined as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw { message: "Réponse serveur invalide", status: res.status } satisfies ApiError;
  }
}

export function getHttpStatusFromError(e: unknown): number | undefined {
  if (e && typeof e === "object" && "status" in e) {
    const s = (e as { status?: unknown }).status;
    if (typeof s === "number" && Number.isFinite(s)) return s;
  }
  return undefined;
}

export function isNetworkFailure(e: unknown): boolean {
  return e instanceof TypeError && e.message === "Failed to fetch";
}
