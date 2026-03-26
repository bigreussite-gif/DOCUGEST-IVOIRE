import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Créer un compte gratuit",
  description:
    "Inscrivez-vous gratuitement sur DocuGest Ivoire : facturation, devis et fiches de paie en PDF pour entrepreneurs en Afrique francophone.",
  alternates: { canonical: "/register" },
  openGraph: {
    title: `Inscription gratuite | ${SITE_NAME}`,
    description: "Créez votre compte et produisez des documents professionnels en quelques minutes.",
    url: "/register"
  }
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
