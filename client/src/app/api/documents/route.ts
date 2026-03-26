/**
 * GET /api/documents — liste
 * POST /api/documents — création
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

const postSchema = z.object({
  type: z.enum(["invoice", "proforma", "devis", "payslip"]),
  doc_number: z.string().min(1),
  client_name: z.string().min(1),
  total_amount: z.number().finite(),
  currency: z.string().min(1).default("FCFA"),
  status: z.enum(["draft", "sent", "paid", "cancelled"]).optional().default("draft"),
  doc_data: z.any()
});

export async function GET(req: Request) {
  console.log("[api/documents] GET");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 20)));
  const type = url.searchParams.get("type") ? String(url.searchParams.get("type")) : null;

  const list = await store.listDocuments({ userId: auth.sub, type, page, limit });
  return NextResponse.json({ items: list.items ?? [], page, limit, total: list.total });
}

export async function POST(req: Request) {
  console.log("[api/documents] POST");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON invalide" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Champs invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const created = await store.createDocument({
      user_id: auth.sub,
      type: parsed.data.type,
      doc_number: parsed.data.doc_number,
      client_name: parsed.data.client_name,
      total_amount: parsed.data.total_amount,
      currency: parsed.data.currency,
      status: parsed.data.status ?? "draft",
      doc_data: parsed.data.doc_data as Record<string, unknown>
    });
    return NextResponse.json(created);
  } catch (e) {
    console.error("[api/documents] create", e);
    return NextResponse.json({ message: "Erreur sauvegarde", details: (e as Error)?.message }, { status: 500 });
  }
}
