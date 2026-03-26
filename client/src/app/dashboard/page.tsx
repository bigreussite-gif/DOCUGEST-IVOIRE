"use client";

import dynamic from "next/dynamic";

/**
 * Monte la SPA historique sur /dashboard pour conserver
 * toutes les vues métier (documents, profile, éditeurs...).
 */
const App = dynamic(() => import("@/App"), { ssr: false });

export default function DashboardPage() {
  return <App />;
}
