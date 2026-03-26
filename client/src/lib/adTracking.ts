import { config } from "../config";

/**
 * Enregistre une vue ou un clic publicitaire (authentifié).
 * Silencieux en cas d’échec pour ne pas casser l’UI.
 */
export function trackAdEvent(event_type: "view" | "click", zone: string, sessionId?: string) {
  const token = localStorage.getItem("docugest_token");
  if (!token) return;

  void fetch(`${config.apiBaseUrl}/api/admin/analytics/ad-event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ event_type, zone, session_id: sessionId })
  }).catch(() => {});
}
