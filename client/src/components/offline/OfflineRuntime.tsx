"use client";

import { useEffect, useState } from "react";
import { initOfflineSync } from "@/lib/offline/initSync";
import { flushSyncQueue } from "@/lib/offline/sync";

function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV !== "production") return;

  void navigator.serviceWorker.register("/sw.js").catch(() => {
    // Silent fail: app remains usable without SW.
  });
}

export function OfflineRuntime() {
  const [online, setOnline] = useState<boolean>(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    initOfflineSync();
    registerServiceWorker();

    const onOnline = () => {
      setOnline(true);
      setSyncing(true);
      void flushSyncQueue().finally(() => setSyncing(false));
    };
    const onOffline = () => setOnline(false);
    const onSyncComplete = () => setSyncing(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("docugest:sync-complete", onSyncComplete);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("docugest:sync-complete", onSyncComplete);
    };
  }, []);

  if (online && !syncing) return null;

  return (
    <div className="pointer-events-none fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
      <div className="rounded-full bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur">
        {!online ? "Mode hors ligne: vos actions sont sauvegardees localement." : "Connexion retournee: synchronisation en cours..."}
      </div>
    </div>
  );
}
