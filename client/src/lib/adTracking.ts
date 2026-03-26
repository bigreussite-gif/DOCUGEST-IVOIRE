import { config } from "../config";

/**
 * Enregistre une vue ou un clic publicitaire (authentifié).
 * Silencieux en cas d’échec pour ne pas casser l’UI.
 */
export function trackAdEvent(event_type: "view" | "click", zone: string, sessionId?: string) {
  const token = localStorage.getItem("docugest_token");
  const sid =
    sessionId ||
    (() => {
      const key = "docugest_ad_session_id";
      const existing = localStorage.getItem(key);
      if (existing) return existing;
      const created = crypto.randomUUID();
      localStorage.setItem(key, created);
      return created;
    })();

  void fetch(`${config.apiBaseUrl}/api/admin/analytics/ad-event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ event_type, zone, session_id: sid })
  }).catch(() => {});
}
