import { useEffect, useState } from "react";

/** Bandeau discret : mode hors ligne + stockage local (IndexedDB). */
export function ConnectionBanner() {
  const [online, setOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-[100] bg-amber-500 px-3 py-2.5 text-center text-sm font-medium text-white"
      style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
    >
      Hors ligne — vos documents sont enregistrés sur cet appareil. La mise à jour vers le serveur se fera
      automatiquement dès que la connexion revient.
    </div>
  );
}
