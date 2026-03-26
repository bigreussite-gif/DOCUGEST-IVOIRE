import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** pg est natif : garder hors du bundle optimisé */
  serverExternalPackages: ["pg"],
  reactStrictMode: true,
  /** Monorepo : éviter l’avertissement sur le mauvais workspace root */
  outputFileTracingRoot: path.join(__dirname, ".."),
  /** ESLint Vite legacy retiré — build sans bloquer en attendant config flat Next */
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
