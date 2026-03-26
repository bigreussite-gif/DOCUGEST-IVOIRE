"use client";

import dynamic from "next/dynamic";

/**
 * Route catch-all pour /admin/* afin d'éviter les 404
 * et conserver les sous-routes admin de la SPA.
 */
const App = dynamic(() => import("@/App"), { ssr: false });

export default function AdminCatchAllPage() {
  return <App />;
}
