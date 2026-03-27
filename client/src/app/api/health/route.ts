/**
 * GET /api/health — sonde liveness (Vercel / monitoring).
 */
import { NextResponse } from "next/server";
import { resolvePostgresConnectionString } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const hasDb = Boolean(resolvePostgresConnectionString());
  console.log("[api/health] ok database=", hasDb);
  return NextResponse.json({ ok: true, database: hasDb });
}
