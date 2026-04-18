import { NextResponse } from "next/server";
import { requireBackofficeRequest } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export async function GET(req: Request) {
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  
  try {
    const items = await store.getProducts(category);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erreur produits" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ctx = await requireBackofficeRequest(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await req.json();
    const created = await store.createProduct(body);
    
    await store.appendAuditLog({
      actorId: ctx.auth.sub,
      action: "product.create",
      targetType: "product",
      targetId: created.id,
      metadata: { name: created.name, price: created.price },
      ip: req.headers.get("x-forwarded-for")
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erreur creation produit" }, { status: 500 });
  }
}
