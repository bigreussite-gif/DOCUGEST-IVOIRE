import { format as formatDateFns } from "date-fns";

export function formatFCFA(amount) {
  const n = Number(amount ?? 0);
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(n))} FCFA`;
}

export function formatDateCI(dateLike) {
  if (!dateLike) return "";
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  if (Number.isNaN(d.getTime())) return "";
  return formatDateFns(d, "dd/MM/yyyy");
}

export function clampMoney(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function wordsUnder1000(n) {
  const ones = [
    "zéro",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf"
  ];

  const tens = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante",
    "quatre-vingt",
    "quatre-vingt"
  ];

  if (n < 20) return ones[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (n >= 70 && n < 80) {
      // 70-79 => soixante + (10-19)
      const rest = n - 60;
      if (rest === 10) return "soixante-dix";
      return `soixante-${wordsUnder1000(rest)}`;
    }
    if (n >= 80 && n < 90) {
      // 80-89 => quatre-vingts + (0-9)
      if (u === 0) return "quatre-vingts";
      return `quatre-vingt-${ones[u]}`;
    }
    if (u === 0) return tens[t];
    if (t === 2 && u === 1) return "vingt-et-un";
    if (u === 1) return `${tens[t]}-et-un`;
    return `${tens[t]}-${ones[u]}`;
  }

  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h === 1) {
    if (rest === 0) return "cent";
    return `cent ${wordsUnder1000(rest)}`;
  }
  if (h === 2) {
    if (rest === 0) return "deux cents";
    return `deux-cent-${wordsUnder1000(rest)}`;
  }
  const hundreds = `${ones[h]}-cent`;
  if (rest === 0) return hundreds;
  return `${hundreds}-${wordsUnder1000(rest)}`;
}

/**
 * Conversion (entier) en lettres pour FCFA.
 * Couverture: jusqu'à 999 999 999 (approximation).
 */
export function amountToWordsFCFA(amount) {
  const n = Math.max(0, Math.floor(Number(amount ?? 0)));
  if (n === 0) return "zéro franc CFA";

  const parts = [];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const rest = n % 1_000;

  if (millions > 0) {
    parts.push(`${wordsUnder1000(millions)} million${millions > 1 ? "s" : ""}`);
  }

  if (thousands > 0) {
    parts.push(
      thousands === 1 ? "mille" : `${wordsUnder1000(thousands)} mille`
    );
  }

  if (rest > 0) {
    parts.push(wordsUnder1000(rest));
  }

  const sentence = parts.join(" ");
  return `${sentence} franc${n > 1 ? "s" : ""} CFA`;
}

