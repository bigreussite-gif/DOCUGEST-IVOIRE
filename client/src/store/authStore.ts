import { create } from "zustand";
import { apiFetch, type ApiError } from "../lib/api";
import { networkFetch, isNetworkFailure } from "../lib/apiNetwork";
import { flushSyncQueue } from "../lib/offline/sync";

const USER_CACHE_KEY = "docugest_user_cache";

function apiErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as ApiError).message;
    if (typeof m === "string" && m.trim().length > 0) return m;
  }
  if (e instanceof TypeError) {
    if (e.message === "Failed to fetch") {
      return "Pas de connexion ou serveur injoignable. Les documents restent disponibles hors ligne si vous étiez connecté.";
    }
    if (e.message.includes("body stream already read") || e.message.includes("already read")) {
      return "Erreur réseau. Rechargez la page et réessayez.";
    }
  }
  if (e instanceof Error && e.message) return e.message;
  return "Une erreur est survenue. Réessayez.";
}

export type AuthUser = {
  id: string;
  full_name: string;
  phone: string;
  whatsapp?: string | null;
  email: string;
  company_name?: string | null;
  company_logo_url?: string | null;
  company_address?: string | null;
  company_ncc?: string | null;
  company_rccm?: string | null;
  company_dfe?: string | null;
  company_regime?: string | null;
};

type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type RegisterPayload = {
  full_name: string;
  phone: string;
  whatsapp?: string | null;
  email: string;
  password: string;
  company_name?: string | null;
};

type PasswordResetRequestPayload = { email: string };
type PasswordResetPayload = { token: string; newPassword: string };

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;

  loadMe: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (payload: PasswordResetRequestPayload) => Promise<void>;
  resetPassword: (payload: PasswordResetPayload) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  loadMe: async () => {
    const token = localStorage.getItem("docugest_token");
    if (!token) {
      set({ user: null });
      return;
    }
    set({ loading: true, error: null });
    try {
      const me = await networkFetch<AuthUser>("/api/auth/me", { method: "GET" });
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(me));
      set({ user: me, loading: false });
    } catch (e) {
      if (isNetworkFailure(e)) {
        const raw = localStorage.getItem(USER_CACHE_KEY);
        if (raw) {
          try {
            const me = JSON.parse(raw) as AuthUser;
            set({ user: me, loading: false });
            return;
          } catch {
            /* vide */
          }
        }
      }
      localStorage.removeItem("docugest_token");
      localStorage.removeItem(USER_CACHE_KEY);
      set({ user: null, loading: false });
    }
  },

  login: async ({ email, password, rememberMe }) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
        method: "POST",
        json: { email, password, rememberMe }
      });
      localStorage.setItem("docugest_token", res.token);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(res.user));
      set({ user: res.user, loading: false });
      void flushSyncQueue();
      return true;
    } catch (e) {
      set({ loading: false, error: apiErrorMessage(e) });
      return false;
    }
  },

  register: async ({ full_name, phone, whatsapp, email, password }) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/register", {
        method: "POST",
        json: { full_name, phone, whatsapp, email, password }
      });
      localStorage.setItem("docugest_token", res.token);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(res.user));
      set({ user: res.user, loading: false });
      void flushSyncQueue();
      return true;
    } catch (e) {
      set({ loading: false, error: apiErrorMessage(e) });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("docugest_token");
    localStorage.removeItem(USER_CACHE_KEY);
    set({ user: null });
  },

  requestPasswordReset: async ({ email }) => {
    set({ loading: true, error: null });
    try {
      await apiFetch("/api/auth/password-reset-request", {
        method: "POST",
        json: { email }
      });
    } catch (e) {
      set({ error: apiErrorMessage(e) });
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async ({ token, newPassword }) => {
    set({ loading: true, error: null });
    try {
      await apiFetch("/api/auth/password-reset", {
        method: "POST",
        json: { token, newPassword }
      });
    } finally {
      set({ loading: false });
    }
  }
}));

