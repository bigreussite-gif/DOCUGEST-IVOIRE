import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OfflineRuntime } from "@/components/offline/OfflineRuntime";

export const metadata: Metadata = {
  title: "DocuGest Ivoire",
  description: "Factures, devis et bulletins — entrepreneurs africains.",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#0f766e"
};

/**
 * Layout racine Next.js : enveloppe l’ancienne SPA (React Router) + pages App Router (/register).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-bg text-text antialiased">
        <OfflineRuntime />
        <div id="root" className="min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
