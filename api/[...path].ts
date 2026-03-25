import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Proxy Vercel → API Express déployée ailleurs.
 * Variables Vercel : BACKEND_URL = https://ton-api.onrender.com (sans slash final, sans /api)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backend = process.env.BACKEND_URL?.replace(/\/+$/, "");
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

  const path = req.url || "/";
  const target = `${backend}${path.startsWith("/") ? path : `/${path}`}`;

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
    if (req.body !== undefined && req.body !== null) {
      init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
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
