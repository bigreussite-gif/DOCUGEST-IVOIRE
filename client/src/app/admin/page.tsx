"use client";

import dynamic from "next/dynamic";

/**
 * Monte la SPA historique sur /admin.
 */
const App = dynamic(() => import("@/App"), { ssr: false });

export default function AdminPage() {
  return <App />;
}
