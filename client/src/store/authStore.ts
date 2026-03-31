import { create } from "zustand";
import { apiFetch, type ApiError } from "../lib/api";
import { networkFetch, isNetworkFailure, getHttpStatusFromError } from "../lib/apiNetwork";
import { flushSyncQueue } from "../lib/offline/sync";
import { AD_SLOTS_LS_KEY } from "./adSlotsStore";

const USER_CACHE_KEY = "docugest_user_cache";

/**
 * Remplace entièrement la session locale (évite de mélanger deux comptes : cache / store / jeton).
 * À utiliser après login ou inscription réussis.
 */
export function commitAuthSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("docugest_token");
  localStorage.removeItem(USER_CACHE_KEY);
  localStorage.removeItem("docugest_ad_session_id");
  try {
    localStorage.removeItem(AD_SLOTS_LS_KEY);
  } catch {
    /* ignore */
  }
  localStorage.setItem("docugest_token", token);
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  useAuthStore.setState({ user, loading: false, error: null });
}

function readUserCache(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

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
  /** Rôle applicatif (back-office si ≠ user) */
  role?: "super_admin" | "admin" | "manager" | "operator" | "user" | string;
  permission_level?: "read" | "write" | "admin" | string;
  gender?: string | null;
  user_typology?: string | null;
};

type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type PasswordResetRequestPayload = { email: string };
type PasswordResetPayload = { token: string; newPassword: string };

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;

  loadMe: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => void;
  /** Efface token / cache local (localStorage) et renvoie vers /login — utile si session corrompue. */
  clearLocalSessionAndRelogin: () => void;
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
      set({ user: null, loading: false });
      return;
    }
    const cached = readUserCache();
    // Affichage immédiat depuis le cache : pas d’écran bloquant à chaque reconnexion.
    if (cached) {
      set({ user: cached, loading: false, error: null });
    } else {
      set({ loading: true, error: null });
    }
    try {
      const me = await networkFetch<AuthUser>("/api/auth/me", { method: "GET" });
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(me));
      set({ user: me, loading: false, error: null });
    } catch (e) {
      if (isNetworkFailure(e)) {
        if (cached) {
          set({ user: cached, loading: false });
          return;
        }
        set({ loading: false });
        return;
      }
      const status = getHttpStatusFromError(e);
      if (status === 401 || status === 403) {
        localStorage.removeItem("docugest_token");
        localStorage.removeItem(USER_CACHE_KEY);
        set({ user: null, loading: false });
        return;
      }
      if (status === 404) {
        localStorage.removeItem("docugest_token");
        localStorage.removeItem(USER_CACHE_KEY);
        set({ user: null, loading: false });
        return;
      }
      if (status !== undefined && status >= 500) {
        if (cached) {
          set({ user: cached, loading: false, error: null });
        } else {
          set({
            user: null,
            loading: false,
            error: "Serveur temporairement indisponible. Vous pouvez réessayer dans un instant."
          });
        }
        return;
      }
      // Autres erreurs (4xx hors 401–403, ou réponse ambiguë) : ne pas déconnecter l’utilisateur.
      if (cached) {
        set({ user: cached, loading: false, error: null });
      } else {
        set({ loading: false });
      }
    }
  },

  login: async ({ email, password, rememberMe }) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
        method: "POST",
        json: { email, password, rememberMe }
      });
      commitAuthSession(res.token, res.user);
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
    set({ user: null, loading: false, error: null });
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  },

  clearLocalSessionAndRelogin: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("docugest_token");
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem("docugest_ad_session_id");
    try {
      localStorage.removeItem(AD_SLOTS_LS_KEY);
    } catch {
      /* ignore */
    }
    set({ user: null, loading: false, error: null });
    window.location.assign("/login");
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

/** Utilisateur affiché dans le store, sinon cache disque (évite échec silencieux si le store n’est pas encore hydraté). */
export function getEffectiveAuthUser(): AuthUser | null {
  const fromStore = useAuthStore.getState().user;
  if (fromStore) return fromStore;
  return readUserCache();
}

