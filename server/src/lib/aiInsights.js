/**
 * Synthèses « IA » locales à partir des agrégats analytics (sans appel LLM externe).
 * Peut être remplacé par un appel API OpenAI / Anthropic si besoin.
 */
function buildInsights(snapshot) {
  const lines = [];
  const recos = [];

  const byType = snapshot.documentsByType || {};
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

  const mau = snapshot.monthlyActiveUsers ?? 0;
  const ucount = snapshot.userCount ?? 0;
  if (ucount > 0) {
    lines.push(`Utilisateurs actifs (30j) : ${mau} sur ${ucount} comptes enregistrés.`);
    if (mau / ucount < 0.2) {
      recos.push(
        "Faible ratio d’activité récente : envisager relance email, tutoriels ou offre d’accompagnement pour réactiver les comptes dormants."
      );
    }
  }

  const ads = snapshot.adSummary || {};
  const ctr = ads.ctrPct ?? 0;
  if ((ads.views || 0) > 0) {
    lines.push(`Publicités : ${ads.views} vues, ${ads.clicks} clics (CTR ≈ ${ctr} %).`);
    if (ctr < 0.5 && ads.views > 100) {
      recos.push("CTR sous 0,5 % : revoir le placement, le libellé ou le visuel des emplacements peu performants.");
    }
  }

  const demo = snapshot.demographics?.gender || {};
  if (Object.keys(demo).length > 0) {
    lines.push("Répartition démographique (genre renseigné) disponible pour cibler des partenariats.");
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

function findPeak(hourMap) {
  if (!hourMap || typeof hourMap !== "object") return null;
  let bestH = null;
  let bestN = -1;
  for (let h = 0; h < 24; h++) {
    const n = Number(hourMap[h] ?? hourMap[String(h)] ?? 0);
    if (n > bestN) {
      bestN = n;
      bestH = h;
    }
  }
  return bestN > 0 ? bestH : null;
}

function findPeakDow(dowMap) {
  if (!dowMap || typeof dowMap !== "object") return null;
  let bestD = null;
  let bestN = -1;
  for (let d = 0; d < 7; d++) {
    const n = Number(dowMap[d] ?? dowMap[String(d)] ?? 0);
    if (n > bestN) {
      bestN = n;
      bestD = d;
    }
  }
  return bestN > 0 ? bestD : null;
}

module.exports = { buildInsights };
