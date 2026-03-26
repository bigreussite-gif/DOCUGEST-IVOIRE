"use client";

import dynamic from "next/dynamic";

/**
 * Page d’accueil : SPA historique (React Router).
 * Chargement dynamique sans SSR pour éviter window/document côté serveur.
 */
const App = dynamic(() => import("@/App"), { ssr: false });

export default function HomePage() {
  return <App />;
}
