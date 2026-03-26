import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Proxy Vercel → API Express déployée ailleurs.
 * Variables Vercel : BACKEND_URL = https://ton-api.onrender.com (sans slash final, sans /api)
 *
 * Note : avec `api/[...path].ts`, Vercel peut passer `req.url` comme `/auth/register`
 * au lieu de `/api/auth/register`. Sans correction, Express renvoie « Cannot POST … ».
 */
function normalizeProxyPath(reqUrl: string | undefined): string {
  const raw = reqUrl || "/";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const u = new URL(raw);
      return u.pathname + u.search;
    } catch {
      /* fall through */
    }
  }
  const q = raw.indexOf("?");
  const pathname = q >= 0 ? raw.slice(0, q) : raw;
  const search = q >= 0 ? raw.slice(q) : "";
  let p = pathname || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  // Réinjecter le préfixe /api manquant (comportement catch-all Vercel)
  if (!p.startsWith("/api")) {
    p = `/api${p}`;
  }
  return p + search;
}

function jsonBody(body: unknown): string | undefined {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return body;
  if (Buffer.isBuffer(body)) return body.toString("utf8");
  return JSON.stringify(body);
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

  const path = normalizeProxyPath(req.url);
  const target = `${backend}${path}`;

  const headers: Record<string, string> = {};
  const h = req.headers;
  if (h["content-type"]) headers["Content-Type"] = h["content-type"] as string;
  if (h["authorization"]) headers["Authorization"] = h["authorization"] as string;
  if (h["cookie"]) headers["Cookie"] = h["cookie"] as string;

  const init: RequestInit = {
    method: req.method,
    headers
  };

  if (req.method && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const bodyStr = jsonBody(req.body);
    if (bodyStr !== undefined) {
      init.body = bodyStr;
      if (!headers["Content-Type"] && bodyStr.trim().startsWith("{")) {
        headers["Content-Type"] = "application/json";
      }
    }
  }

  try {
    const r = await fetch(target, init);
    const text = await r.text();
    res.status(r.status);
    const ct = r.headers.get("content-type");
    if (ct) res.setHeader("Content-Type", ct);
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
