import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { OfflineRuntime } from "@/components/offline/OfflineRuntime";
import {
  getMetadataBase,
  getSiteUrl,
  SEO_SHARE_IMAGES,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME
} from "@/lib/seo";

const siteUrl = getSiteUrl();

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: `${SITE_NAME} — Factures, devis & bulletins de paie en ligne`,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: true, email: true, address: true },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: { "fr-FR": "/" }
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: SEO_SHARE_IMAGES.map((img) => ({
      url: img.path,
      width: img.width,
      height: img.height,
      alt: img.alt
    }))
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: SEO_SHARE_IMAGES.map((img) => ({
      url: img.path,
      width: img.width,
      height: img.height,
      alt: img.alt
    }))
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  category: "business",
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {})
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1
};

/**
 * Layout racine Next.js : enveloppe l’ancienne SPA (React Router) + pages App Router.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-bg text-text antialiased">
        <JsonLd />
        <OfflineRuntime />
        <div id="root" className="min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
