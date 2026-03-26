import type { Metadata } from "next";

/** Espace authentifié : pas d’indexation (contenu personnel / documents). */
export const metadata: Metadata = {
  title: "Espace documents",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
