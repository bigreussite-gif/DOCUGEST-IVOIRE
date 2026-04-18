
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
  baseUrl: baseUrl || "https://bzna2rx5.eu-central.insforge.app",
  anonKey: anonKey || "ik_bde2c73e789f5234a01bd842ad7bb3fa",
});

/**
 * Helper to check if InsForge is configured.
 */
export const isInsforgeConfigured = !!(baseUrl && anonKey);
