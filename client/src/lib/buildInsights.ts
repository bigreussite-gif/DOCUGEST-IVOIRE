/**
 * Synthèses locales à partir des agrégats analytics (sans LLM externe).
 */
export type AnalyticsSnapshot = Record<string, unknown>;

function findPeak(hourMap: unknown): number | null {
  if (!hourMap || typeof hourMap !== "object") return null;
  const o = hourMap as Record<string, number>;
  let bestH: number | null = null;
  let bestN = -1;
  for (let h = 0; h < 24; h++) {
    const n = Number(o[h] ?? o[String(h)] ?? 0);
    if (n > bestN) {
      bestN = n;
      bestH = h;
    }
  }
  return bestN > 0 ? bestH : null;
}

function findPeakDow(dowMap: unknown): number | null {
  if (!dowMap || typeof dowMap !== "object") return null;
  const o = dowMap as Record<string, number>;
  let bestD: number | null = null;
  let bestN = -1;
  for (let d = 0; d < 7; d++) {
    const n = Number(o[d] ?? o[String(d)] ?? 0);
    if (n > bestN) {
      bestN = n;
      bestD = d;
    }
  }
  return bestN > 0 ? bestD : null;
}

export function buildInsights(snapshot: AnalyticsSnapshot) {
  const lines: string[] = [];
  const recos: string[] = [];

  const byType = (snapshot.documentsByType as Record<string, number>) || {};
  const inv = byType.invoice || 0;
  const prof = (byType.proforma || 0) + (byType.devis || 0);
  const pay = byType.payslip || 0;
  const total = inv + prof + pay || 1;

  lines.push(
    `Volume documents : factures ${Math.round((inv / total) * 100)} %, proformas/devis ${Math.round((prof / total) * 100)} %, bulletins ${Math.round((pay / total) * 100)} %.`
  );

  const peakHour = findPeak(snapshot.documentsByHour);
  if (peakHour != null) {
    lines.push(`Pic d’activité documentaire autour de ${peakHour}h (heure serveur UTC).`);
    recos.push(
      `Les utilisateurs semblent plus actifs vers ${peakHour}h–${peakHour + 2}h : tester des campagnes ou créneaux de communication sur cette plage.`
    );
  }

  const peakDow = findPeakDow(snapshot.documentsByWeekday);
  if (peakDow != null) {
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    lines.push(`Jour le plus chargé : ${days[peakDow]}.`);
  }

  const mau = (snapshot.monthlyActiveUsers as number) ?? 0;
  const ucount = (snapshot.userCount as number) ?? 0;
  const filtered = Boolean((snapshot as { meta?: { filtered?: boolean } }).meta?.filtered);
  if (filtered) {
    if (mau > 0 || ucount > 0) {
      lines.push(
        `Période filtrée : ${mau} utilisateur(s) ayant produit au moins un document, ${ucount} nouveau(x) compte(s) inscrit(s) sur cette plage.`
      );
    }
  } else if (ucount > 0) {
    lines.push(`Utilisateurs actifs (30j) : ${mau} sur ${ucount} comptes enregistrés.`);
    if (mau / ucount < 0.2) {
      recos.push(
        "Faible ratio d’activité récente : envisager relance email, tutoriels ou offre d’accompagnement pour réactiver les comptes dormants."
      );
    }
  }

  const ads = (snapshot.adSummary as { views?: number; clicks?: number; ctrPct?: number }) || {};
  const ctr = ads.ctrPct ?? 0;
  if ((ads.views || 0) > 0) {
    lines.push(`Publicités : ${ads.views} vues, ${ads.clicks} clics (CTR ≈ ${ctr} %).`);
    if (ctr < 0.5 && (ads.views || 0) > 100) {
      recos.push("CTR sous 0,5 % : revoir le placement, le libellé ou le visuel des emplacements peu performants.");
    }
  }

  // --- Hatchery & Business ---
  const hatchery = (snapshot.hatchery as any) || {};
  if (hatchery.revenueService > 0 || hatchery.revenueSales > 0) {
    lines.push(`Business : CA Services ${hatchery.revenueService.toLocaleString()} F, CA Ventes ${hatchery.revenueSales.toLocaleString()} F.`);
  }
  if (hatchery.activeCouvaisons > 0) {
    lines.push(`Écloserie : ${hatchery.activeCouvaisons} lots en cours.`);
    if (hatchery.expectedHatchingToday > 0) {
      recos.push(`${hatchery.expectedHatchingToday} éclosion(s) prévue(s) aujourd'hui : s'assurer que les agents sont prêts pour le tri et le comptage.`);
    }
  }

  const successRate = hatchery.avgHatchingRate ?? 0;
  if (successRate > 0) {
    lines.push(`Taux de réussite moyen : ${Math.round(successRate)}%.`);
    if (successRate < 70) {
       recos.push("Taux de réussite sous 70% : surveiller la température des machines et la qualité des œufs à la réception.");
    }
  }

  if (hatchery.criticalStocks > 0) {
    recos.push(`${hatchery.criticalStocks} produit(s) en rupture ou stock critique : prévoir un réapprovisionnement rapide.`);
  }

  recos.push(
    "Pour la prospection partenaires : mettre en avant le volume de documents générés et le créneau d’activité dominante dans un one-pager PDF."
  );

  return {
    summary: lines.join(" "),
    recommendations: recos,
    generatedAt: new Date().toISOString(),
    model: "docugest-heuristics-v1"
  };
}
