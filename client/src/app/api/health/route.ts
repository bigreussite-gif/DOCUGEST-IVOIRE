/**
 * GET /api/health — sonde liveness + test connexion DB (Vercel / monitoring).
 */
import { NextResponse } from "next/server";
import { resolvePostgresConnectionString, getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const hasDbUrl = Boolean(resolvePostgresConnectionString());
  let dbOk = false;
  let dbError: string | null = null;

  if (hasDbUrl) {
    try {
      const pool = getPool();
      await (pool as { query: (sql: string) => Promise<unknown> }).query("SELECT 1");
      dbOk = true;
    } catch (e) {
      dbError = e instanceof Error ? e.message.slice(0, 200) : String(e);
    }
  }

  console.log("[api/health] database=", dbOk, dbError ?? "");
  return NextResponse.json(
    { ok: dbOk, database: dbOk, dbError },
    { status: dbOk ? 200 : 503 }
  );
}
