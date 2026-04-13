
import { createClient } from "@insforge/sdk";

const baseUrl = (process.env.NEXT_PUBLIC_INSFORGE_URL || "").trim();
const anonKey = (process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "").trim();

if (!baseUrl || !anonKey) {
  if (typeof window !== "undefined") {
    console.error(
      "❌ InsForge SDK non configuré : NEXT_PUBLIC_INSFORGE_URL ou NEXT_PUBLIC_INSFORGE_ANON_KEY manquant."
    );
  }
}

export const insforge = createClient({
  baseUrl: baseUrl || "https://zx2bx4r6.eu-central.insforge.app", // Fallback sur l'URL de prod si vide ? Non, vaut mieux forcer l'env.
  anonKey: anonKey || "ik_103b0ea9ee5971ba5ad3fd789e7cfb74", // Fallback pour tester
});

/**
 * Helper to check if InsForge is configured.
 */
export const isInsforgeConfigured = !!(baseUrl && anonKey);
