import { flushSyncQueue } from "./sync";

let started = false;

/** Écouteurs réseau + tentative périodique de synchro (Afrique / connexion instable). */
export function initOfflineSync(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const run = () => {
    void flushSyncQueue();
  };

  window.addEventListener("online", run);
  window.addEventListener("focus", run);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") run();
  });

  setInterval(() => {
    if (navigator.onLine) run();
  }, 45_000);

  if (navigator.onLine) {
    queueMicrotask(run);
  }
}
