/**
 * Connexion PostgreSQL optimisée pour Vercel serverless.
 *
 * Sur Vercel (INSFORGE_PROXY_URL défini) : utilise un proxy HTTP Insforge
 * qui contourne les limites de connexion TCP des fonctions serverless.
 *
 * En dev local : utilise pg directement via TCP.
 */
import { Pool as PgPool, type PoolConfig } from "pg";
import { Pool as NeonPool } from "@neondatabase/serverless";

// ─── Types ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryResult<R = any> = {
  rows: R[];
  rowCount: number;
  fields?: { name: string; dataTypeID?: number }[];
};

export type PgCompatiblePool = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query<R = any>(sql: string, params?: unknown[]): Promise<QueryResult<R>>;
  end(): Promise<void>;
};

// ─── HTTP Proxy Pool (Insforge edge function) ─────────────────────────────────

const PROXY_SECRET = "docugest_sql_proxy_2026_x7k9p2m4";

class InsforgeHttpPool implements PgCompatiblePool {
  private readonly proxyUrl: string;

  constructor(proxyUrl: string) {
    this.proxyUrl = proxyUrl;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query<R = any>(sql: string, params?: unknown[]): Promise<QueryResult<R>> {
    const resp = await fetch(this.proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Proxy-Secret": PROXY_SECRET,
      },
      body: JSON.stringify({ query: sql, params: params ?? [] }),
    });

    if (!resp.ok) {
      let errMsg = `HTTP ${resp.status}`;
      try {
        const body = await resp.json() as { error?: string; message?: string };
        errMsg = body.error ?? body.message ?? errMsg;
      } catch { /* ignore parse error */ }
      throw new Error(`SQL proxy error: ${errMsg}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await resp.json() as any;

    if (result.error || (result.message && !result.rows)) {
      throw new Error(`SQL proxy error: ${result.error ?? result.message ?? "Unknown DB error"}`);
    }

    return {
      rows: (result.rows ?? []) as R[],
      rowCount: result.rowCount ?? (result.rows?.length ?? 0),
      fields: result.fields,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async end(): Promise<void> {
    // No connection to close in HTTP mode
  }
}

// ─── Globals ─────────────────────────────────────────────────────────────────

const globalForPool = globalThis as unknown as {
  __docugestPgPool?: PgCompatiblePool;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function resolvePostgresConnectionString(): string {
  const env = process.env;
  const serverless = Boolean(env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME);

  const raw = serverless
    ? env.POSTGRES_PRISMA_URL ||
      env.POSTGRES_URL ||
      env.DATABASE_URL ||
      env.INSFORGE_DATABASE_URL ||
      env.DATABASE_URL_UNPOOLED ||
      env.POSTGRES_URL_NON_POOLING ||
      ""
    : env.DATABASE_URL ||
      env.INSFORGE_DATABASE_URL ||
      env.POSTGRES_URL ||
      env.POSTGRES_PRISMA_URL ||
      env.POSTGRES_URL_NON_POOLING ||
      env.DATABASE_URL_UNPOOLED ||
      "";

  return serverless ? preferNeonPoolerHost(raw) : raw;
}

function preferNeonPoolerHost(url: string): string {
  if (!url || !/neon\.tech/i.test(url) || /-pooler\./i.test(url)) return url;
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (!host.includes("neon.tech")) return url;
    const newHost = host.replace(/^ep-([^.]+)\./, "ep-$1-pooler.");
    if (newHost === host) return url;
    u.hostname = newHost;
    return u.toString();
  } catch {
    return url;
  }
}

function stripSslParams(url: string): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    const SSL_PARAMS = ["sslmode", "ssl", "uselibpqcompat", "sslrootcert", "sslcert", "sslkey", "sslinline"];
    let changed = false;
    for (const p of SSL_PARAMS) {
      if (u.searchParams.has(p)) {
        u.searchParams.delete(p);
        changed = true;
      }
    }
    return changed ? u.toString() : url;
  } catch {
    return url.replace(/[?&]sslmode=[^&]*/gi, "").replace(/[?&]ssl=[^&]*/gi, "");
  }
}

function useNeonServerlessPool(connectionString: string): boolean {
  if (process.env.PG_USE_NODE_PG === "1") return false;
  if (!connectionString) return false;
  const h = connectionString.toLowerCase();
  if (h.includes("neon.tech")) return true;
  if (h.includes("vercel-storage.com") || h.includes("vercel-storage.io")) return true;
  return process.env.PG_USE_NEON_SERVERLESS === "1";
}

function sslFromConnectionString(conn: string): PoolConfig["ssl"] | undefined {
  if (!conn) return undefined;
  if (process.env.PGSSL === "0") return false;
  if (/localhost|127\.0\.0\.1/i.test(conn)) return undefined;
  return { rejectUnauthorized: false };
}

// ─── Error helpers ────────────────────────────────────────────────────────────

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

export function isRetryableConnectionError(e: unknown): boolean {
  if (isTransientPgError(e)) return true;
  const code = (e as { code?: string }).code;
  if (code && ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "ECONNRESET", "EAI_AGAIN", "EPIPE"].includes(code)) return true;
  const m = e instanceof Error ? e.message : String(e ?? "");
  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|getaddrinfo|connect ETIMEDOUT|connect ECONNREFUSED/i.test(m)) return true;
  return false;
}

export async function runWithDbRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt < maxAttempts - 1 && isRetryableConnectionError(e)) {
        resetPool();
        await new Promise((r) => setTimeout(r, 80 * (attempt + 1) * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

// ─── Pool factory ─────────────────────────────────────────────────────────────

function createPool(): PgCompatiblePool {
  // ── HTTP proxy (Vercel / serverless avec Insforge) ───────────────────────
  const proxyUrl = process.env.INSFORGE_PROXY_URL;
  if (proxyUrl) {
    console.log("[db] Using Insforge HTTP proxy:", proxyUrl);
    return new InsforgeHttpPool(proxyUrl);
  }

  // ── TCP direct (dev local ou autre hébergeur) ────────────────────────────
  const raw = resolvePostgresConnectionString();

  if (!raw) {
    throw new Error(
      "DATABASE_URL (ou POSTGRES_URL / INSFORGE_PROXY_URL) manquant : configurez la chaîne Postgres ou le proxy Insforge."
    );
  }

  const connectionString = stripSslParams(raw);
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (useNeonServerlessPool(connectionString)) {
    return new NeonPool({
      connectionString,
      max: isServerless ? 1 : 6,
      idleTimeoutMillis: isServerless ? 10_000 : 30_000,
      connectionTimeoutMillis: isServerless ? 20_000 : 12_000,
      allowExitOnIdle: isServerless,
    }) as unknown as PgCompatiblePool;
  }

  return new PgPool({
    connectionString,
    ssl: sslFromConnectionString(raw),
    max: isServerless ? 1 : 6,
    idleTimeoutMillis: isServerless ? 10_000 : 30_000,
    connectionTimeoutMillis: isServerless ? 20_000 : 12_000,
    allowExitOnIdle: isServerless,
  }) as unknown as PgCompatiblePool;
}

// ─── Exported singletons ──────────────────────────────────────────────────────

export function getPool(): PgCompatiblePool {
  if (!globalForPool.__docugestPgPool) {
    globalForPool.__docugestPgPool = createPool();
  }
  return globalForPool.__docugestPgPool;
}

export function resetPool(): void {
  const p = globalForPool.__docugestPgPool;
  globalForPool.__docugestPgPool = undefined;
  if (p) {
    void p.end().catch(() => { /* noop */ });
  }
}
