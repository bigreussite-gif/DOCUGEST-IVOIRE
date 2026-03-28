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
      className="sticky top-0 z-[100] border-b border-amber-600/25 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-center text-[13px] font-medium leading-snug text-white shadow-sm sm:text-sm"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      Hors ligne — vos documents sont enregistrés sur cet appareil. La mise à jour vers le serveur se fera
      automatiquement dès que la connexion revient.
    </div>
  );
}
