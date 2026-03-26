/**
 * Entrée serverless Vercel pour tout `/api/*`.
 * La route dynamique `api/[...path]` met souvent les segments dans `req.query.path`
 * alors que `req.url` vaut `/` ou est incomplet — Express ne matche alors aucune route (Cannot POST /api/...).
 * @see https://vercel.com/docs/functions/runtimes/node-js#dynamic-routes
 */
const { app } = require("../server/src/app");

module.exports = function vercelApiHandler(req, res) {
  let url = req.url || "/";

  if (req.query && req.query.path !== undefined) {
    const raw = req.query.path;
    const pathStr = Array.isArray(raw)
      ? raw.map((s) => String(s)).filter(Boolean).join("/")
      : String(raw || "").replace(/^\/+/, "");
    const qs = url.includes("?") ? url.slice(url.indexOf("?")) : "";
    if (pathStr) {
      url = "/api/" + pathStr + qs;
    }
  } else if (req.originalUrl && (url === "/" || url === "")) {
    url = req.originalUrl;
  }

  req.url = url;
  return app(req, res);
};
