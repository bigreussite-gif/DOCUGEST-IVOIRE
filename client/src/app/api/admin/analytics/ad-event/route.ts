import { NextResponse } from "next/server";
import { z } from "zod";
import { optionalSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

const adEventSchema = z.object({
  event_type: z.enum(["view", "click"]),
  zone: z.string().min(1).max(64),
  session_id: z.string().max(64).optional()
});

export async function POST(req: Request) {
  console.log("[api/admin/analytics/ad-event] POST");
  const auth = optionalSessionAuth(req);

  const parsed = adEventSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
  }
  try {
    await store.insertAdEvent({
      event_type: parsed.data.event_type,
      zone: parsed.data.zone,
      user_id: auth?.sub ?? null,
      session_id: parsed.data.session_id ?? null,
      metadata: {}
    });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Erreur tracking" }, { status: 500 });
  }
}
