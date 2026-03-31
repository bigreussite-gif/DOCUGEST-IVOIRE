/**
 * Extraction locale des couleurs dominantes d’une image (canvas).
 * Pas d’appel API — base pour une future couche IA / vision.
 */

function rgbToHex(r: number, g: number, b: number) {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function parseRgb(s: string): [number, number, number] | null {
  const t = s.trim().replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(t)) return null;
  return [parseInt(t.slice(0, 2), 16), parseInt(t.slice(2, 4), 16), parseInt(t.slice(4, 6), 16)];
}

/** Saturation approximative 0–1 */
function saturation(r: number, g: number, b: number) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

/**
 * Lit un fichier image et retourne 2 couleurs (principale + secondaire) pour le thème document.
 */
export async function extractBrandColorsFromFile(file: File): Promise<{ primary: string; secondary: string }> {
  const bmp = await createImageBitmap(file);
  const w = 48;
  const h = 48;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { primary: "#00A86B", secondary: "#FF6B2B" };
  }
  ctx.drawImage(bmp, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const buckets = new Map<string, { count: number; r: number; g: number; b: number; sat: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 32) continue;
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    // Quantification légère pour regrouper les teintes proches
    r = Math.round(r / 24) * 24;
    g = Math.round(g / 24) * 24;
    b = Math.round(b / 24) * 24;
    const key = `${r},${g},${b}`;
    const sat = saturation(r, g, b);
    const prev = buckets.get(key);
    if (prev) {
      prev.count += 1;
      prev.r += r;
      prev.g += g;
      prev.b += b;
    } else {
      buckets.set(key, { count: 1, r, g, b, sat });
    }
  }

  const sorted = [...buckets.values()]
    .filter((b) => {
      const avg = (b.r / b.count + b.g / b.count + b.b / b.count) / 3;
      return avg < 245 && avg > 15;
    })
    .sort((a, b) => b.count * (0.4 + b.sat) - a.count * (0.4 + a.sat));

  if (sorted.length === 0) {
    return { primary: "#00A86B", secondary: "#FF6B2B" };
  }

  const first = sorted[0];
  const pr = Math.round(first.r / first.count);
  const pg = Math.round(first.g / first.count);
  const pb = Math.round(first.b / first.count);
  const primary = rgbToHex(pr, pg, pb);

  const second =
    sorted.find((s) => {
      const sr = Math.round(s.r / s.count);
      const sg = Math.round(s.g / s.count);
      const sb = Math.round(s.b / s.count);
      const d = Math.abs(sr - pr) + Math.abs(sg - pg) + Math.abs(sb - pb);
      return d > 80;
    }) ?? sorted[1];

  if (second) {
    const sr = Math.round(second.r / second.count);
    const sg = Math.round(second.g / second.count);
    const sb = Math.round(second.b / second.count);
    return { primary, secondary: rgbToHex(sr, sg, sb) };
  }

  return { primary, secondary: "#1A1A2E" };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Lecture fichier impossible"));
    r.readAsDataURL(file);
  });
}

/**
 * Recadre une image au format carré 1:1 centré, puis la retourne en JPEG base64.
 * Idéal pour les photos de CV affichées en rond.
 * @param file    Fichier image source
 * @param size    Taille en pixels du carré de sortie (défaut 400 px)
 * @param quality Qualité JPEG 0-1 (défaut 0.92)
 */
export function cropImageToSquare(file: File, size = 400, quality = 0.92): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture fichier impossible"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image invalide"));
      img.onload = () => {
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas non disponible")); return; }
        // Centrage du recadrage carré
        const sx = (img.naturalWidth - side) / 2;
        const sy = (img.naturalHeight - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Retourne true si la couleur hex est suffisamment claire pour nécessiter du texte foncé.
 */
export function isLightColor(hex: string): boolean {
  const p = parseRgb(hex.replace("#", ""));
  if (!p) return false;
  const [r, g, b] = p;
  // Luminosité perçue (formule YIQ)
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

/** Contraste lisible sur fond clair */
export function readableOnWhite(hex: string): string {
  const p = parseRgb(hex.replace("#", ""));
  if (!p) return "#00A86B";
  const [r, g, b] = p;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.85 ? "#00A86B" : hex;
}
