/**
 * GET /api/health — sonde liveness (Vercel / monitoring).
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const hasDb = Boolean(
    process.env.DATABASE_URL || process.env.INSFORGE_DATABASE_URL || process.env.POSTGRES_URL
  );
  console.log("[api/health] ok database=", hasDb);
  return NextResponse.json({ ok: true, database: hasDb });
}
