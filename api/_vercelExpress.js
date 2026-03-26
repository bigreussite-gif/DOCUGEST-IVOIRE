const { app } = require("../server/src/app");

/**
 * @param {string} basePrefix ex. "/api/auth", "/api/admin"
 * @param {{ nested?: boolean }} opts nested=true → /api/auth sans sous-chemin → basePrefix seul
 */
function createHandler(basePrefix, opts = {}) {
  const nested = Boolean(opts.nested);

  return function vercelApiHandler(req, res) {
    let url = req.url || "/";

    if (req.query && req.query.path !== undefined) {
      const raw = req.query.path;
      const pathStr = Array.isArray(raw)
        ? raw.map((s) => String(s)).filter(Boolean).join("/")
        : String(raw || "").replace(/^\/+/, "");
      const qs = url.includes("?") ? url.slice(url.indexOf("?")) : "";
      if (nested) {
        url = pathStr ? basePrefix + "/" + pathStr + qs : basePrefix + qs;
      } else if (pathStr) {
        url = basePrefix + "/" + pathStr + qs;
      }
    } else if (req.originalUrl && (url === "/" || url === "")) {
      url = req.originalUrl;
    }

    req.url = url;
    return app(req, res);
  };
}

module.exports = { app, createHandler };
