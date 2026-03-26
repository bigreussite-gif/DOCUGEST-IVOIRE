/**
 * URL canonique du site (SEO, Open Graph, JSON-LD, sitemap).
 * Définir NEXT_PUBLIC_APP_URL en prod (ex. https://www.docugest-ivoire.com).
 * Sur Vercel, https://VERCEL_URL est utilisé si la variable publique est absente.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (typeof explicit === "string" && explicit.trim() !== "") {
    return explicit.trim().replace(/\/+$/, "");
  }
  const vercel = process.env.VERCEL_URL;
  if (typeof vercel === "string" && vercel.trim() !== "") {
    return `https://${vercel.trim().replace(/\/+$/, "")}`;
  }
  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl()}/`);
}

export const SITE_NAME = "DocuGest Ivoire";

/** Texte optimisé pour titres / partages (≈155–165 car. utiles pour les SERP). */
export const SITE_DESCRIPTION =
  "DocuGest Ivoire : factures, devis, proforma et bulletins de paie en PDF professionnels. Outil en ligne pour entrepreneurs et PME en Côte d'Ivoire et Afrique francophone — simple, rapide, conforme.";

export const SITE_KEYWORDS = [
  "facture électronique Côte d'Ivoire",
  "facture FCFA",
  "devis proforma Afrique",
  "bulletin de salaire PDF",
  "facturation en ligne Afrique",
  "entrepreneur Afrique francophone",
  "logiciel facturation gratuit",
  "gestion PME Abidjan",
  "DocuGest Ivoire",
  "gestion documentaire PME",
  "PDF facture professionnelle",
  "devis crédible UEMOA"
] as const;

/**
 * Visuels officiels (dossier public/seo) : Open Graph, Twitter, JSON-LD.
 * L’image en tête est la principale pour les aperçus de liens (réseaux, messageries).
 */
export const SEO_SHARE_IMAGES: ReadonlyArray<{
  path: string;
  width: number;
  height: number;
  alt: string;
}> = [
  {
    path: "/seo/docugest-partage-hero-1.png",
    width: 682,
    height: 1024,
    alt: "DocuGest Ivoire — Tes documents pro sans prise de tête : factures, devis et bulletins en FCFA pour l’entrepreneuriat en Afrique francophone."
  },
  {
    path: "/seo/docugest-partage-hero-2.png",
    width: 682,
    height: 1024,
    alt: "DocuGest Ivoire — Gérez factures, devis, proforma et bulletins de salaire : outil pro pour entrepreneurs et PME."
  },
  {
    path: "/seo/docugest-partage-hero-3.png",
    width: 682,
    height: 1024,
    alt: "DocuGest Ivoire — Facturation, devis et paie en FCFA, gratuit et financé par la publicité."
  },
  {
    path: "/seo/docugest-marque-logo.png",
    width: 1024,
    height: 1024,
    alt: "Logo DocuGest Ivoire — dossier, calculatrice et carte de l’Afrique, marque orange et vert."
  }
];
