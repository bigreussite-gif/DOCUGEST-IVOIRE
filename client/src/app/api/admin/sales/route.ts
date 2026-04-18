import { NextResponse } from "next/server";
import { requireBackofficeRequest } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export async function GET(req: Request) {
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;

  const { searchParams } = new URL(req.url);
  const contact_id = searchParams.get("contact_id") || undefined;
  
  try {
    const items = await store.getSales({ contact_id });
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erreur ventes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await req.json();
    const created = await store.recordSale(body);
    
    await store.appendAuditLog({
      actorId: ctx.auth.sub,
      action: "sale.record",
      targetType: "sale",
      targetId: created.id,
      metadata: { total: created.total_amount },
      ip: req.headers.get("x-forwarded-for")
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erreur enregistrement vente" }, { status: 500 });
  }
}
