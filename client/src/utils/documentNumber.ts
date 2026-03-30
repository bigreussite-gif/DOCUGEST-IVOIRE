/**
 * Génération de numéros de documents auto-incrémentés.
 * Stockés en localStorage pour persistance entre sessions.
 */

const COUNTERS_KEY = "docugest_doc_counters_v1";

function readCounters(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COUNTERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function saveCounters(c: Record<string, number>) {
  try {
    localStorage.setItem(COUNTERS_KEY, JSON.stringify(c));
  } catch { /* ignore */ }
}

/** Génère le prochain numéro pour un préfixe donné. Ex: prefix="BC" → "BC-2026-0001" */
export function nextDocNumber(prefix: string): string {
  const year = new Date().getFullYear();
  const counters = readCounters();
  const key = `${prefix}-${year}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  saveCounters(counters);
  return `${prefix}-${year}-${String(next).padStart(4, "0")}`;
}

/** Retourne un numéro sans l'incrémenter (pour réafficher un numéro existant). */
export function peekDocNumber(prefix: string): string {
  const year = new Date().getFullYear();
  const counters = readCounters();
  const key = `${prefix}-${year}`;
  const current = counters[key] ?? 0;
  return `${prefix}-${year}-${String(current + 1).padStart(4, "0")}`;
}

export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateFR(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
