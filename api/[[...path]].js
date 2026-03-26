/**
 * Entrée unique Vercel pour `/api` et `/api/**`.
 * En priorité : `req.originalUrl` si déjà un chemin `/api/...` (fiable pour POST).
 * Sinon : segments issus de `req.query.path` (catch-all Vercel).
 */
const { app } = require("../server/src/app");

function segmentsFromQuery(req) {
  const raw = req.query && req.query.path;
  if (raw === undefined || raw === null) return "";
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s)).filter(Boolean).join("/");
  }
  return String(raw).replace(/^\/+/, "");
}

module.exports = function vercelApiHandler(req, res) {
  const rawUrl = typeof req.url === "string" ? req.url : "/";
  const rawPath = rawUrl.split("?")[0];

  const orig = typeof req.originalUrl === "string" ? req.originalUrl : "";
  const origPath = orig.split("?")[0];

  const fromQuery = segmentsFromQuery(req);

  let url;

  if (rawPath.startsWith("/api/") || rawPath === "/api") {
    url = rawUrl;
  } else if (origPath.startsWith("/api/") || origPath === "/api") {
    url = orig;
  } else if (fromQuery) {
    const qs = orig.includes("?") ? orig.slice(orig.indexOf("?")) : rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?")) : "";
    url = "/api/" + fromQuery + qs;
  } else {
    url = rawUrl;
    if (orig && (url === "/" || url === "")) {
      url = orig;
    }
  }

  req.url = url;
  return app(req, res);
};
