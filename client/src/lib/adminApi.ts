import { config } from "../config";

function getToken() {
  return localStorage.getItem("docugest_token");
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

export async function adminFetch<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const token = getToken();
  const headers: HeadersInit = {
    ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(rest.headers as Record<string, string>)
  };
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  const url = `${config.apiBaseUrl}/api/admin${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body
  });
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
