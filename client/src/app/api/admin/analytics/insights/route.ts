import { NextResponse } from "next/server";
import { buildInsights } from "@/lib/buildInsights";
import { requireBackoffice, requireSessionAuth } from "@/lib/serverAuth";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  console.log("[api/admin/analytics/insights] GET");
  const auth = await requireSessionAuth(req);
  if (auth instanceof NextResponse) return auth;
  const denied = requireBackoffice(auth);
  if (denied) return denied;

  try {
    const snapshot = await store.adminAnalyticsSnapshot();
    try {
      const insights = buildInsights(snapshot);
      return NextResponse.json(insights);
    } catch (e) {
      console.error("[api/admin/analytics/insights] buildInsights fallback", e);
      return NextResponse.json({
        summary: "Les données principales sont disponibles. Le module d'analyse avancée est temporairement dégradé.",
        recommendations: [
          "Consultez la vue documents et utilisateurs pour piloter l'activité en attendant la restauration complète des insights."
        ],
        generatedAt: new Date().toISOString(),
        model: "docugest-fallback-v1"
      });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      summary: "Aucune synthèse avancée pour le moment.",
      recommendations: ["Vérifiez la connexion base de données ou réessayez dans quelques instants."],
      generatedAt: new Date().toISOString(),
      model: "docugest-fallback-v1"
    });
  }
}
