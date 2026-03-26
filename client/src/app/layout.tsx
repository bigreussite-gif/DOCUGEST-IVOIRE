import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocuGest Ivoire",
  description: "Factures, devis et bulletins — entrepreneurs africains."
};

/**
 * Layout racine Next.js : enveloppe l’ancienne SPA (React Router) + pages App Router (/register).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-bg text-text antialiased">
        <div id="root" className="min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
