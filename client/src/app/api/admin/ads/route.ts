import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBackoffice, requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

const schema = z.object({
  slot: z.string().min(2).max(80),
  page: z.string().min(2).max(80),
  category: z.string().min(2).max(80),
  title: z.string().max(120),
  body: z.string().max(300),
  ctaLabel: z.string().max(60),
  ctaUrl: z.string().max(500).optional().default(""),
  /** data:image/webp;base64,... — compressé côté client */
  imageDataUrl: z.string().max(900_000).optional().default(""),
  imageFit: z.enum(["cover", "contain"]).optional().default("cover"),
  imageFrame: z.enum(["banner", "photo", "square"]).optional().default("photo"),
  active: z.boolean()
});

export async function GET(req: Request) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  try {
    const items = await store.listAdSlotsConfig();
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[api/admin/ads] GET", e);
    return NextResponse.json({ items: [], degraded: true });
  }
}

export async function POST(req: Request) {
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    await store.upsertAdSlotConfig({ actorId: auth.sub, ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/admin/ads] POST", e);
    return NextResponse.json({ message: "Echec sauvegarde affichage pub" }, { status: 500 });
  }
}
