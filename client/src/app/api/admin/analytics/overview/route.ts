import { NextResponse } from "next/server";
import { requireBackoffice, requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  console.log("[api/admin/analytics/overview] GET");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;

  try {
    const snapshot = await store.adminAnalyticsSnapshot();
    return NextResponse.json(snapshot);
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      documentsTotal: 0,
      documentsByType: {},
      documentsByHour: {},
      documentsByWeekday: {},
      userCount: 0,
      monthlyActiveUsers: 0,
      recentLogins: [],
      demographics: { gender: {}, user_typology: {} },
      adSummary: { views: 0, clicks: 0, ctrPct: 0, byZone: {} },
      degraded: true
    });
  }
}
