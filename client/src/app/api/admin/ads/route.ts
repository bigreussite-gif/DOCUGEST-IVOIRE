import { NextResponse } from "next/server";
import { z } from "zod";
import { AD_FRAME_ZOD_ENUM } from "@/lib/adFrames";
import { requireBackofficeRequest } from "@/lib/serverAuth";
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
  /** Préféré pour GIF lourds : fichier dans /public/… ou URL HTTPS (évite limite ~4,5 Mo du corps de requête Vercel). */
  imageUrl: z.string().max(2000).optional().default(""),
  /** data:image/...;base64,... — GIF animés peuvent dépasser la limite serveur ; utiliser imageUrl dans ce cas */
  imageDataUrl: z.string().max(10_000_000).optional().default(""),
  imageFit: z.enum(["cover", "contain"]).optional().default("cover"),
  imageFrame: z.enum(AD_FRAME_ZOD_ENUM).optional().default("photo"),
  /** Code HTML brut : balise <script> AdSense, iframe partenaire, bannière HTML… */
  htmlEmbed: z.string().max(20_000).optional().default(""),
  active: z.boolean()
});

export async function GET(req: Request) {
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;
  const { auth } = ctx;
  try {
    const items = await store.listAdSlotsConfig();
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[api/admin/ads] GET", e);
    return NextResponse.json({ items: [], degraded: true });
  }
}

export async function POST(req: Request) {
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;
  const { auth } = ctx;
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
