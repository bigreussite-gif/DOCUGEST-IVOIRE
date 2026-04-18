import { NextResponse } from "next/server";
import { requireBackofficeRequest } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export async function GET(req: Request) {
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  
  try {
    const items = await store.getContacts(type);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erreur contacts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await req.json();
    const created = await store.createContact(body);
    
    await store.appendAuditLog({
      actorId: ctx.auth.sub,
      action: "contact.create",
      targetType: "contact",
      targetId: created.id,
      metadata: { name: created.full_name, type: created.type },
      ip: req.headers.get("x-forwarded-for")
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erreur creation contact" }, { status: 500 });
  }
}
