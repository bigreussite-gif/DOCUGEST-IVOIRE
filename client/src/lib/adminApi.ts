import { config } from "../config";

function getToken() {
  return localStorage.getItem("docugest_token");
}

function setToken(token: string) {
  localStorage.setItem("docugest_token", token);
}

export class AdminApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const ADMIN_FETCH_TIMEOUT_MS = 20_000;

async function refreshAdminToken(currentToken: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 12_000);
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { Authorization: `Bearer ${currentToken}` },
      signal: ctrl.signal
    });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json().catch(() => ({}))) as { token?: string; user?: unknown };
    if (typeof data.token === "string" && data.token.trim()) {
      setToken(data.token);
      if (data.user) localStorage.setItem("docugest_user_cache", JSON.stringify(data.user));
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

async function doAdminRequest(path: string, rest: RequestInit, json: unknown, token: string | null): Promise<Response> {
  const headers: HeadersInit = {
    ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(rest.headers as Record<string, string>)
  };
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  const url = `${config.apiBaseUrl}/api/admin${path.startsWith("/") ? path : `/${path}`}`;
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), ADMIN_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...rest,
      headers,
      signal: ctrl.signal,
      body: json !== undefined ? JSON.stringify(json) : rest.body
    });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function adminFetch<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  let token = getToken();
  let res: Response;
  const safeRequest = async (tk: string | null): Promise<Response> => {
    try {
      return await doAdminRequest(path, rest, json, tk);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        throw new AdminApiError("Délai dépassé (API admin). Vérifiez la connexion et réessayez.", 408, null);
      }
      throw new AdminApiError("Erreur réseau API admin", 0, null);
    }
  };
  res = await safeRequest(token);
  if (res.status === 401 && token) {
    const refreshed = await refreshAdminToken(token);
    if (refreshed) {
      token = refreshed;
      res = await safeRequest(token);
    }
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: string }).message)
        : res.statusText;
    throw new AdminApiError(msg || "Erreur API admin", res.status, data);
  }
  return data as T;
}

export type AdminSession = {
  user: {
    id: string;
    full_name: string;
    email: string;
    role?: string;
    permission_level?: string;
  };
  roleLabel: string;
  canManageUsers: boolean;
};
