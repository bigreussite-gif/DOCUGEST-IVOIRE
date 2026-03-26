/**
 * Connexion PostgreSQL (Insforge / DATABASE_URL) optimisée pour Vercel serverless.
 * Une seule Pool réutilisée entre invocations via globalThis (évite les reconnexions inutiles).
 */
import { Pool, type PoolConfig } from "pg";

const globalForPool = globalThis as unknown as { __docugestPgPool?: Pool };

function sslFromConnectionString(conn: string): PoolConfig["ssl"] | undefined {
  if (!conn) return undefined;
  if (process.env.PGSSL === "0") return false;
  if (/localhost|127\.0\.0\.1/i.test(conn)) return undefined;
  if (/sslmode=require|ssl=true/i.test(conn) || process.env.PGSSL === "1") {
    return { rejectUnauthorized: false };
  }
  // En prod (Insforge/Vercel), on force SSL par défaut pour éviter les erreurs de handshake.
  return { rejectUnauthorized: false };
}

function createPool(): Pool {
  const connectionString =
    process.env.DATABASE_URL || process.env.INSFORGE_DATABASE_URL || process.env.POSTGRES_URL || "";

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (ou INSFORGE_DATABASE_URL) manquant : configurez la chaîne Postgres Insforge sur Vercel."
    );
  }

  return new Pool({
    connectionString,
    ssl: sslFromConnectionString(connectionString),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000
  });
}

/** Pool singleton — ne pas fermer manuellement entre requêtes serverless */
export function getPool(): Pool {
  if (!globalForPool.__docugestPgPool) {
    globalForPool.__docugestPgPool = createPool();
  }
  return globalForPool.__docugestPgPool;
}
