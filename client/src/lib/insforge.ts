
import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";

export const insforge = createClient({
  baseUrl,
  anonKey,
});

/**
 * Helper to check if InsForge is configured.
 */
export const isInsforgeConfigured = !!(baseUrl && anonKey);
