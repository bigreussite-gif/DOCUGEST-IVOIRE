import { NextResponse } from "next/server";
import { requireBackofficeRequest } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export async function GET(req: Request) {
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const contact_id = searchParams.get("contact_id") || undefined;
  
  try {
    const items = await store.getCouvaisons({ status, contact_id });
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erreur couvaisons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await req.json();
    const created = await store.createCouvaison(body);
    
    await store.appendAuditLog({
      actorId: ctx.auth.sub,
      action: "couvaison.create",
      targetType: "couvaison",
      targetId: created.id,
      metadata: { egg_type: created.egg_type, qty: created.quantity_initial },
      ip: req.headers.get("x-forwarded-for")
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erreur creation couvaison" }, { status: 500 });
  }
}
