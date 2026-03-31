import { NextResponse } from "next/server";
import { parseAnalyticsRangeFromRequest } from "@/lib/adminAnalyticsQuery";
import { requireBackofficeRequest } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  console.log("[api/admin/analytics/overview] GET");
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;

  const url = new URL(req.url);
  const range = parseAnalyticsRangeFromRequest(req);

  try {
    const snapshot = await store.adminAnalyticsSnapshot(range);
    return NextResponse.json({
      ...snapshot,
      meta: {
        filtered: Boolean(range),
        from: range ? url.searchParams.get("from") : null,
        to: range ? url.searchParams.get("to") : null
      }
    });
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
      degraded: true,
      meta: {
        filtered: Boolean(range),
        from: range ? url.searchParams.get("from") : null,
        to: range ? url.searchParams.get("to") : null
      }
    });
  }
}
