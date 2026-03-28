import { NextResponse } from "next/server";
import * as store from "@/lib/serverStore";
import { runWithDbRetry } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await runWithDbRetry(() => store.listAdSlotsConfig(), 4);
    const activeItems = items.filter((i) => i.active);
    return NextResponse.json(
      { items: activeItems },
      {
        headers: {
          // Revalidation courte : 60 s CDN, toujours frais au navigateur
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30"
        }
      }
    );
  } catch (e) {
    console.error("[api/ads/slots] GET", e);
    // En cas d'erreur DB, renvoyer un tableau vide sans planter
    return NextResponse.json({ items: [], degraded: true });
  }
}
