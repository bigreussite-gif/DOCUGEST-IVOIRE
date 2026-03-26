import { getSiteUrl, SEO_SHARE_IMAGES, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/**
 * Données structurées schema.org (@graph) — images liées à la marque pour l’indexation sémantique.
 */
export function JsonLd() {
  const url = getSiteUrl();
  const logoUrl = `${url}/seo/docugest-marque-logo.png`;

  const imageObjects = SEO_SHARE_IMAGES.map((img) => ({
    "@type": "ImageObject",
    url: `${url}${img.path}`,
    width: img.width,
    height: img.height,
    caption: img.alt
  }));

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: SITE_NAME,
        url,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          width: 1024,
          height: 1024,
          caption: "Logo DocuGest Ivoire"
        },
        image: imageObjects,
        description: SITE_DESCRIPTION,
        areaServed: { "@type": "Place", name: "Afrique francophone" }
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: "fr-FR",
        image: imageObjects
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}/#app`,
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        browserRequirements: "HTML5, JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "XOF",
          description: "Gratuit, financé par la publicité — vous gardez le contrôle sur vos données."
        },
        description: SITE_DESCRIPTION,
        url,
        image: imageObjects,
        screenshot: imageObjects[0] ?? { "@type": "ImageObject", url: logoUrl },
        author: { "@id": `${url}/#organization` }
      }
    ]
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
  );
}
