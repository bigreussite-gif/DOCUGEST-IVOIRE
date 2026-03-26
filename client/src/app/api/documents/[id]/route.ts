/**
 * GET /api/documents/:id
 * PUT /api/documents/:id
 * DELETE /api/documents/:id
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

const putSchema = z.object({
  type: z.enum(["invoice", "proforma", "devis", "payslip"]),
  doc_number: z.string().min(1),
  client_name: z.string().min(1),
  total_amount: z.number().finite(),
  currency: z.string().min(1).default("FCFA"),
  status: z.enum(["draft", "sent", "paid", "cancelled"]).optional().default("draft"),
  doc_data: z.any()
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: Ctx) {
  const { id } = await context.params;
  console.log("[api/documents/:id] GET", id);
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  const doc = await store.getDocumentById({ userId: auth.sub, id });
  if (!doc) return NextResponse.json({ message: "Document introuvable" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(req: Request, context: Ctx) {
  const { id } = await context.params;
  console.log("[api/documents/:id] PUT", id);
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON invalide" }, { status: 400 });
  }
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Champs invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await store.updateDocument({
      userId: auth.sub,
      id,
      type: parsed.data.type,
      doc_number: parsed.data.doc_number,
      client_name: parsed.data.client_name,
      total_amount: parsed.data.total_amount,
      currency: parsed.data.currency,
      status: parsed.data.status ?? "draft",
      doc_data: parsed.data.doc_data as Record<string, unknown>
    });
    if (!updated) return NextResponse.json({ message: "Document introuvable" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("[api/documents] put", e);
    return NextResponse.json({ message: "Erreur sauvegarde" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: Ctx) {
  const { id } = await context.params;
  console.log("[api/documents/:id] DELETE", id);
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  const ok = await store.deleteDocumentById({ userId: auth.sub, id });
  if (!ok) return NextResponse.json({ message: "Document introuvable" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
