import { useEffect } from "react";

/**
 * Force un rechargement complet vers une page App Router Next.js
 * (évite que React Router capture /forgot-password, /reset-password, etc.)
 */
export default function NextFullPageRedirect({ path }: { path: string }) {
  useEffect(() => {
    const qs = typeof window !== "undefined" ? window.location.search : "";
    window.location.replace(`${path}${qs}`);
  }, [path]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 p-8 text-center text-sm text-slate-600">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      <p>Chargement de la page…</p>
    </div>
  );
}
