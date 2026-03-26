"use client";

import dynamic from "next/dynamic";

/**
 * Route catch-all pour /dashboard/* afin d'éviter les 404
 * et restaurer l'ensemble des écrans utilisateur historiques.
 */
const App = dynamic(() => import("@/App"), { ssr: false });

export default function DashboardCatchAllPage() {
  return <App />;
}
