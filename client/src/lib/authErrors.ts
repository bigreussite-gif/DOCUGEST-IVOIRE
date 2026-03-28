/**
 * Messages HTTP homogènes pour les échecs auth / base (login, register, etc.).
 */

export function isDbOrNetworkError(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e);
  const code = (e as { code?: string }).code;
  if (code && ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "ECONNRESET", "EAI_AGAIN"].includes(code)) return true;
  if (code && ["28P01", "3D000", "53300", "08000", "08003", "08006", "08001", "08004", "57P01", "XX000"].includes(code))
    return true;
  if (m.includes("DATABASE_URL") || m.includes("INSFORGE_DATABASE_URL") || m.includes("manquant")) return true;
  if (m.includes("ECONNREFUSED") || m.includes("connect ETIMEDOUT") || m.includes("getaddrinfo")) return true;
  if (m.includes("timeout") && m.toLowerCase().includes("connection")) return true;
  if (m.includes("SSL") || m.includes("certificate") || m.includes("self signed")) return true;
  if (
    /password authentication failed|authentication failed|no pg_hba\.conf|invalid_authorization_specification|SASL|FATAL:/i.test(
      m
    )
  )
    return true;
  if (m.includes("Connection terminated") || m.includes("Connection ended") || m.includes("server closed")) return true;
  if (m.includes("Neon") && /timeout|connection|closed/i.test(m)) return true;
  return false;
}

export function authRouteFailureResponse(e: unknown): { message: string; status: number } {
  const m = e instanceof Error ? e.message : String(e);
  const code = (e as { code?: string }).code;

  if (m.includes("JWT_SECRET") || m.toLowerCase().includes("jwt")) {
    return { message: "Configuration serveur : JWT_SECRET manquant ou invalide.", status: 503 };
  }
  if (m.includes("DATABASE_URL") || m.includes("INSFORGE_DATABASE_URL") || /manquant|missing/i.test(m)) {
    return {
      message:
        "Base de données non configurée sur le serveur. Vérifiez la chaîne Postgres dans les variables d’environnement de production.",
      status: 503
    };
  }
  if (isDbOrNetworkError(e)) {
    if (code === "57P01") {
      return { message: "Service de base de données en maintenance. Réessayez plus tard.", status: 503 };
    }
    return {
      message: "Impossible de joindre nos serveurs. Réessayez dans quelques instants.",
      status: 503
    };
  }
  console.error("[auth] erreur non classée", { code, message: m.slice(0, 500) });
  return {
    message:
      "Connexion impossible pour le moment. Réessayez dans quelques minutes. Si le problème continue, contactez le support.",
    status: 503
  };
}
