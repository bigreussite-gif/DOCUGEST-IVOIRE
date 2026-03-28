"use client";
import { useEffect } from "react";
import { AD_SLOTS_LS_KEY, useAdSlotsStore } from "../../store/adSlotsStore";

/**
 * Charge les pubs dès que le composant est monté.
 * - Premier chargement immédiat (pas de throttle)
 * - Refresh sur focus fenêtre / changement de visibilité (retour d'onglet)
 * - Synchronisation entre onglets via StorageEvent + BroadcastChannel
 *
 * À monter une fois dans chaque page/layout qui affiche des pubs.
 */
export function AdSlotsBootstrap() {
  const refresh = useAdSlotsStore((s) => s.refresh);
  const rehydrateFromStorage = useAdSlotsStore((s) => s.rehydrateFromStorage);

  // Chargement immédiat au montage (force=true pour ignorer le throttle 45s)
  useEffect(() => {
    void refresh({ force: true });
  }, [refresh]);

  // Sync multi-onglets + refresh au retour
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AD_SLOTS_LS_KEY) rehydrateFromStorage();
    };

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("docugest-ads-updated");
      bc.onmessage = () => void useAdSlotsStore.getState().refresh({ force: true });
    } catch {
      /* navigateurs sans BroadcastChannel */
    }

    // Refresh quand l'utilisateur revient sur l'onglet
    const onFocus = () => void refresh({ force: false });
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh({ force: false });
    };

    window.addEventListener("storage", onStorage);
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
