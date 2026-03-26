/**
 * Compression locale d’images pour les encarts publicitaires (WebP, poids réduit, rendu net).
 */
export async function compressImageToWebP(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const ratio = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", quality)
  );
  if (!blob) {
    return canvas.toDataURL("image/jpeg", 0.88);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Lecture fichier"));
    reader.readAsDataURL(blob);
  });
}
