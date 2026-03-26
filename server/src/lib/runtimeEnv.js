/**
 * Valeurs dérivées pour Vercel + Insforge (sans dépendre de localhost en prod).
 */

function toHttpsOrigin(hostOrUrl) {
  const s = String(hostOrUrl).trim().replace(/\/+$/, "");
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

/** URL publique du front (liens dans les emails, etc.) */
function getPublicAppUrl() {
  const u = process.env.APP_URL;
  if (u && String(u).trim()) {
    return toHttpsOrigin(u);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const o = toHttpsOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
    if (o) return o;
  }
  if (process.env.VERCEL_URL) {
    return `https://${String(process.env.VERCEL_URL).replace(/\/+$/, "")}`;
  }
  return "http://localhost:5173";
}

/**
 * Origines CORS : CLIENT_ORIGIN + URLs système Vercel (déploiement + domaine de prod).
 * @see https://vercel.com/docs/projects/environment-variables/system-environment-variables
 */
function getCorsOrigins() {
  const fromEnv =
    process.env.CLIENT_ORIGIN?.split(",").map((s) => s.trim()).filter(Boolean).map((o) => toHttpsOrigin(o)).filter(Boolean) ??
    [];

  const auto = [];
  if (process.env.VERCEL_URL) {
    auto.push(`https://${String(process.env.VERCEL_URL).replace(/\/+$/, "")}`);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const o = toHttpsOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
    if (o) auto.push(o);
  }

  const merged = [...new Set([...fromEnv, ...auto].filter(Boolean))];
  if (merged.length > 0) return merged;
  return ["http://localhost:5173"];
}

module.exports = { getPublicAppUrl, getCorsOrigins };
