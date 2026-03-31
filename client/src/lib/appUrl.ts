/**
 * URL publique du front (emails, liens de réinitialisation mot de passe, etc.).
 *
 * Ne pas utiliser `APP_URL` seul ici : en production il pointe souvent vers une API Express
 * ou un autre service → le lien du mail ouvre « Cannot GET /reset-password ».
 * On réutilise la même logique que le SEO : NEXT_PUBLIC_* + domaine Vercel du déploiement Next.js.
 */
import { getSiteUrl } from "./seo";

export function getPublicAppUrl(): string {
  return getSiteUrl();
}
