import type { VercelRequest, VercelResponse, VercelRequestQuery } from "@vercel/node";

/**
 * Proxy Vercel → API Express déployée ailleurs.
 * BACKEND_URL = https://ton-api.onrender.com (sans slash final, sans /api)
 *
 * Vercel `api/[...path].ts` : `req.url` peut être `/auth/login` ou vide ;
 * les segments sont souvent dans `req.query.path` (tableau).
 * Sans reconstruction → Express renvoie « Cannot POST /api/auth/login ».
 */
function normalizeProxyPath(pathOnly: string): string {
  const raw = pathOnly || "/";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const u = new URL(raw);
      return u.pathname + u.search;
    } catch {
      /* continue */
    }
  }
  const q = raw.indexOf("?");
  const pathname = q >= 0 ? raw.slice(0, q) : raw;
  const search = q >= 0 ? raw.slice(q) : "";
  let p = pathname || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  if (!p.startsWith("/api")) {
    p = `/api${p}`;
  }
  return p + search;
}

/** Construit le chemin à partir de la catch-all Vercel ou de req.url. */
function resolveProxyPath(req: VercelRequest): string {
  const rawUrl = req.url;

  if (rawUrl && rawUrl.length > 1 && rawUrl.startsWith("/api/")) {
    return normalizeProxyPath(rawUrl);
  }

  const q = req.query as VercelRequestQuery;
  const pathParam = q.path;
  if (pathParam !== undefined && pathParam !== null && String(pathParam).length > 0) {
    const parts = Array.isArray(pathParam) ? pathParam : [pathParam];
    const joined = parts
      .filter((p) => p !== undefined && p !== "")
      .map((p) => decodeURIComponent(String(p)))
      .join("/");
    if (joined) {
      return normalizeProxyPath(`/${joined}`);
    }
  }

  return normalizeProxyPath(rawUrl ?? "/");
}

function jsonBody(body: unknown): string | undefined {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return body;
  if (Buffer.isBuffer(body)) return body.toString("utf8");
  return JSON.stringify(body);
}

/** En-têtes utiles pour CORS + auth (le backend Express vérifie Origin via CLIENT_ORIGIN). */
function buildForwardHeaders(req: VercelRequest): Record<string, string> {
  const h = req.headers;
  const out: Record<string, string> = {};
  const keys = [
    "content-type",
    "authorization",
    "cookie",
    "origin",
    "referer",
    "access-control-request-method",
    "access-control-request-headers",
    "x-requested-with",
    "accept",
    "accept-language",
    "user-agent"
  ];
  for (const key of keys) {
    const v = h[key];
    if (v === undefined) continue;
    out[key] = Array.isArray(v) ? v.join(",") : v;
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backend = process.env.BACKEND_URL?.replace(/\/+$/, "").replace(/\/api$/i, "");
  if (!backend) {
    res.status(503).setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        message:
          "API backend non configurée. Dans Vercel → Settings → Environment Variables, ajoutez BACKEND_URL avec l’URL de votre serveur Express (ex. https://xxx.onrender.com)."
      })
    );
    return;
  }

  const path = resolveProxyPath(req);
  const target = `${backend}${path}`;

  const headers = buildForwardHeaders(req);

  const init: RequestInit = {
    method: req.method,
    headers
  };

  if (req.method && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const bodyStr = jsonBody(req.body);
    if (bodyStr !== undefined) {
      init.body = bodyStr;
      if (!headers["content-type"] && bodyStr.trim().startsWith("{")) {
        headers["content-type"] = "application/json";
      }
    }
  }

  try {
    const r = await fetch(target, init);
    const text = await r.text();
    res.status(r.status);
    r.headers.forEach((value, key) => {
      const lk = key.toLowerCase();
      if (lk === "content-type") res.setHeader("Content-Type", value);
      if (lk.startsWith("access-control-")) res.setHeader(key, value);
    });
    res.end(text);
  } catch (e) {
    res.status(502).setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        message: "Impossible de joindre le backend. Vérifiez BACKEND_URL et que l’API est en ligne.",
        detail: e instanceof Error ? e.message : String(e)
      })
    );
  }
}
