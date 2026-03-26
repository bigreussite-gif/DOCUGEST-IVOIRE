import { NextResponse } from "next/server";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await store.listAdSlotsConfig();
    const activeItems = items.filter((i) => i.active);
    return NextResponse.json({ items: activeItems });
  } catch (e) {
    console.error("[api/ads/slots] GET", e);
    return NextResponse.json({ items: [] });
  }
}
