import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Accédez à votre espace DocuGest Ivoire : factures, devis, proforma et bulletins de paie. Connexion sécurisée.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: `Connexion | ${SITE_NAME}`,
    description: "Accédez à votre espace pour gérer vos documents professionnels.",
    url: "/login"
  }
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
