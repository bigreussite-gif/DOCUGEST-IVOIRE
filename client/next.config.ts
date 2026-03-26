import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** pg est natif : garder hors du bundle optimisé */
  serverExternalPackages: ["pg"],
  reactStrictMode: true,
  /**
   * Monorepo local : racine au-dessus de `client/`.
   * Sur Vercel (racine = dossier `client`), utiliser ce dossier pour éviter path0/path0 et ENOENT sur routes-manifest.
   */
  outputFileTracingRoot: process.env.VERCEL ? path.join(__dirname) : path.join(__dirname, ".."),
  /** ESLint Vite legacy retiré — build sans bloquer en attendant config flat Next */
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
