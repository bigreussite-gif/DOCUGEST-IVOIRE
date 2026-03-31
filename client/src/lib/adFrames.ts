/**
 * Cadres d’affichage des encarts publicitaires (proportions CSS).
 * Inclut des formats fins / longs (bandes, panoramas, colonnes).
 */

export const AD_FRAME_CLASSES: Record<string, string> = {
  /** Bandeau classique */
  banner: "aspect-[21/9] w-full min-h-[48px] max-h-[140px]",
  /** Plus large que 21:9 */
  panorama: "aspect-[32/9] w-full min-h-[56px] max-h-[180px]",
  /** Bande horizontale fine (type fil / ruban) */
  stripe: "aspect-[36/4] w-full min-h-[28px] max-h-[88px]",
  /** Très fin et très long */
  film: "aspect-[52/5] w-full min-h-[24px] max-h-[72px]",
  photo: "aspect-[4/3] w-full max-h-[min(280px,50vh)]",
  square: "aspect-square w-full max-h-[min(280px,45vh)]",
  portrait: "aspect-[3/4] w-full max-h-[min(320px,55vh)]",
  /** Colonne étroite type « skyscraper » */
  skyscraper: "w-full max-w-[160px] mx-auto aspect-[9/21] max-h-[min(420px,60vh)]",
  /** Colonne très étroite et haute */
  pillar: "w-full max-w-[110px] mx-auto aspect-[5/24] max-h-[min(520px,70vh)]",
  /** Carte large type bannière medium rectangle */
  wideCard: "aspect-[2/1] w-full min-h-[72px] max-h-[200px]",
  /** Bandeau intermédiaire 16:5 */
  billboard: "aspect-[16/5] w-full min-h-[44px] max-h-[160px]",
  /** Ruban extra-fin */
  microStripe: "aspect-[64/3] w-full min-h-[18px] max-h-[52px]",
  /** A4 portrait (aperçu document) */
  a4Preview: "w-full max-w-[210mm] mx-auto aspect-[210/297] max-h-[min(90vh,900px)]",
  /** Bannière mobile 320×100 */
  mobileLeader: "aspect-[320/100] w-full max-h-[120px]"
};

export const AD_FRAME_OPTIONS: { value: string; label: string }[] = [
  { value: "film", label: "Très fin & long (type ticker / bandelette)" },
  { value: "microStripe", label: "Ruban extra-fin (64:3)" },
  { value: "stripe", label: "Bande fine horizontale (ruban)" },
  { value: "panorama", label: "Bandeau panoramique large (32:9)" },
  { value: "banner", label: "Bandeau standard (21:9)" },
  { value: "billboard", label: "Billboard (16:5)" },
  { value: "wideCard", label: "Carte large (2:1)" },
  { value: "photo", label: "Photo / carte (4:3)" },
  { value: "square", label: "Carré (1:1)" },
  { value: "portrait", label: "Portrait (3:4)" },
  { value: "a4Preview", label: "Feuille A4 (aperçu document)" },
  { value: "mobileLeader", label: "Bannière type mobile (320×100)" },
  { value: "skyscraper", label: "Colonne étroite haute (skyscraper)" },
  { value: "pillar", label: "Colonne très étroite & longue" }
];

const VALID_KEYS = new Set(Object.keys(AD_FRAME_CLASSES));

export function normalizeAdFrame(raw: unknown): keyof typeof AD_FRAME_CLASSES {
  const s = String(raw ?? "").trim();
  if (VALID_KEYS.has(s)) return s as keyof typeof AD_FRAME_CLASSES;
  return "photo";
}

export function frameBoxClass(frame: string): string {
  return AD_FRAME_CLASSES[normalizeAdFrame(frame)] ?? AD_FRAME_CLASSES.photo;
}

/** Valeurs autorisées côté API (zod) */
export const AD_FRAME_ZOD_ENUM = [
  "banner",
  "panorama",
  "stripe",
  "film",
  "photo",
  "square",
  "portrait",
  "skyscraper",
  "pillar",
  "wideCard",
  "billboard",
  "microStripe",
  "a4Preview",
  "mobileLeader"
] as const;

export type AdImageFrameId = (typeof AD_FRAME_ZOD_ENUM)[number];
