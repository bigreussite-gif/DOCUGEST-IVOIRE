import { NextResponse } from "next/server";
import { buildInsights } from "@/lib/buildInsights";
import { requireBackoffice, requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  console.log("[api/admin/analytics/insights] GET");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;

  try {
    const snapshot = await store.adminAnalyticsSnapshot();
    const insights = buildInsights(snapshot);
    return NextResponse.json(insights);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Erreur IA locale" }, { status: 500 });
  }
}
