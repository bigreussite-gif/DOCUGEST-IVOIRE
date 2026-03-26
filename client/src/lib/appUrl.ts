/**
 * URL publique du front (emails, liens de reset) — aligné sur server/lib/runtimeEnv.
 */
function toHttpsOrigin(hostOrUrl: string): string | null {
  const s = String(hostOrUrl).trim().replace(/\/+$/, "");
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

export function getPublicAppUrl(): string {
  const u = process.env.APP_URL;
  if (u && String(u).trim()) {
    return toHttpsOrigin(u) ?? "http://localhost:3000";
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const o = toHttpsOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
    if (o) return o;
  }
  if (process.env.VERCEL_URL) {
    return `https://${String(process.env.VERCEL_URL).replace(/\/+$/, "")}`;
  }
  return "http://localhost:3000";
}
