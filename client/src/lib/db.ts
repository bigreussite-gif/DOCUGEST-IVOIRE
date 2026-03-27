/**
 * Connexion PostgreSQL (Insforge / DATABASE_URL) optimisée pour Vercel serverless.
 * Une seule Pool réutilisée entre invocations via globalThis (évite les reconnexions inutiles).
 */
import { Pool, type PoolConfig } from "pg";

const globalForPool = globalThis as unknown as { __docugestPgPool?: Pool };

/**
 * Chaîne Postgres : ordre aligné sur Vercel (Postgres / Neon / intégrations).
 * Beaucoup de projets n’exposent que POSTGRES_PRISMA_URL ou DATABASE_URL_UNPOOLED.
 */
export function resolvePostgresConnectionString(): string {
  const env = process.env;
  return (
    env.DATABASE_URL ||
    env.INSFORGE_DATABASE_URL ||
    env.POSTGRES_URL ||
    env.POSTGRES_PRISMA_URL ||
    env.POSTGRES_URL_NON_POOLING ||
    env.DATABASE_URL_UNPOOLED ||
    ""
  );
}

/** Erreurs fréquentes en serverless (Neon, Vercel) — un retry + reset du pool aide souvent. */
export function isTransientPgError(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e ?? "");
  const code = (e as { code?: string }).code;
  if (code && ["57P01", "08006", "08003", "08001", "08000", "40001", "40P01"].includes(code)) return true;
  if (m.includes("Connection terminated unexpectedly")) return true;
  if (m.includes("Connection ended unexpectedly")) return true;
  if (m.includes("server closed the connection")) return true;
  if (m.includes("ECONNRESET") || m.includes("EPIPE")) return true;
  if (/idle.{0,40}timeout/i.test(m) && m.toLowerCase().includes("connection")) return true;
  return false;
}

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
  const connectionString = resolvePostgresConnectionString();

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (ou POSTGRES_URL / POSTGRES_PRISMA_URL) manquant : configurez la chaîne Postgres sur Vercel."
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

/** Réinitialise explicitement le pool (utile après rupture réseau côté DB). */
export function resetPool(): void {
  const p = globalForPool.__docugestPgPool;
  globalForPool.__docugestPgPool = undefined;
  if (p) {
    void p.end().catch(() => {
      /* noop */
    });
  }
}
