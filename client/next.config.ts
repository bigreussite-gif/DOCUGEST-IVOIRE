import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** pg est natif : garder hors du bundle optimisé */
  serverExternalPackages: ["pg"],
  reactStrictMode: true,
};

export default nextConfig;
