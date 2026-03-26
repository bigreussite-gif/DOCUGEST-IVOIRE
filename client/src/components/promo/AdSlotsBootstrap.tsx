import { useEffect } from "react";
import { AD_SLOTS_LS_KEY, useAdSlotsStore } from "@/store/adSlotsStore";

/**
 * Charge les pubs une seule fois (cache disque + API), réagit aux changements admin (autre onglet / focus).
 * À monter une fois à la racine de la SPA.
 */
export function AdSlotsBootstrap() {
  const refresh = useAdSlotsStore((s) => s.refresh);
  const rehydrateFromStorage = useAdSlotsStore((s) => s.rehydrateFromStorage);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AD_SLOTS_LS_KEY) rehydrateFromStorage();
    };
    window.addEventListener("storage", onStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("docugest-ads-updated");
      bc.onmessage = () => void useAdSlotsStore.getState().refresh({ force: true });
    } catch {
      /* navigateurs sans BroadcastChannel */
    }

    const onFocus = () => void refresh();
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      bc?.close();
    };
  }, [refresh, rehydrateFromStorage]);

  return null;
}
