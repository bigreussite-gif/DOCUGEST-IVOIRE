import type { AdminAnalyticsRange } from "@/lib/serverStore";

/** Parse ?from=YYYY-MM-DD&to=YYYY-MM-DD (fin inclusive, bornes UTC). */
export function parseAnalyticsRangeFromRequest(req: Request): AdminAnalyticsRange | null {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!from || !to) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return null;
  const fromInclusive = new Date(`${from}T00:00:00.000Z`);
  const toLast = new Date(`${to}T00:00:00.000Z`);
  if (Number.isNaN(fromInclusive.getTime()) || Number.isNaN(toLast.getTime())) return null;
  const toExclusive = new Date(toLast);
  toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);
  if (fromInclusive >= toExclusive) return null;
  const maxDays = 800;
  if ((toExclusive.getTime() - fromInclusive.getTime()) / 86400000 > maxDays) return null;
  return { fromInclusive, toExclusive };
}

export type DatePreset = "day" | "month" | "year" | "custom";

function utcYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Périodes prédéfinies (calendrier UTC). */
export function rangeForPreset(
  preset: DatePreset,
  customFrom?: string,
  customTo?: string
): { from: string; to: string } {
  const now = new Date();
  if (preset === "custom" && customFrom && customTo && /^\d{4}-\d{2}-\d{2}$/.test(customFrom) && /^\d{4}-\d{2}-\d{2}$/.test(customTo)) {
    return { from: customFrom, to: customTo };
  }
  if (preset === "day") {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const s = utcYmd(d);
    return { from: s, to: s };
  }
  if (preset === "month") {
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();
    const from = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 0));
    return { from: utcYmd(from), to: utcYmd(end) };
  }
  if (preset === "year") {
    const y = now.getUTCFullYear();
    const from = new Date(Date.UTC(y, 0, 1));
    const to = new Date(Date.UTC(y, 11, 31));
    return { from: utcYmd(from), to: utcYmd(to) };
  }
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const from = new Date(Date.UTC(y, m, 1));
  const end = new Date(Date.UTC(y, m + 1, 0));
  return { from: utcYmd(from), to: utcYmd(end) };
}
