import type { CSSProperties } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Style pour le clone hors écran utilisé par html2canvas.
 * Ne pas utiliser `visibility: hidden` ni `opacity: 0` : le moteur ne peint pas
 * le contenu → canvas blanc et PDF vides.
 */
export const PDF_OFFSCREEN_CAPTURE_STYLE: CSSProperties = {
  position: "fixed",
  left: "-10000px",
  top: 0,
  width: 794,
  pointerEvents: "none",
  backgroundColor: "#ffffff",
  visibility: "visible",
  opacity: 1
};

function forceVisibleForCapture(clonedElement: HTMLElement) {
  const view = clonedElement.ownerDocument.defaultView;
  if (!view) return;
  const all: HTMLElement[] = [clonedElement, ...Array.from(clonedElement.querySelectorAll<HTMLElement>("*"))];
  for (const el of all) {
    const cs = view.getComputedStyle(el);
    if (cs.visibility === "hidden") el.style.visibility = "visible";
    if (cs.opacity === "0") el.style.opacity = "1";
  }
}

/** Options alignées sur les éditeurs où le PDF n’est pas vide (logos data URL, images externes). */
export const HTML2CANVAS_PDF_OPTIONS: Parameters<typeof html2canvas>[1] = {
  scale: 2,
  useCORS: true,
  backgroundColor: "#ffffff",
  allowTaint: true,
  logging: false,
  onclone: (_clonedDoc, clonedElement) => {
    forceVisibleForCapture(clonedElement);
  }
};

/**
 * Capture un nœud DOM et produit un PDF (une ou plusieurs pages A4).
 * JPEG pour limiter la taille du fichier.
 */
export async function captureElementToPdfFile(element: HTMLElement, fileName: string): Promise<void> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const canvas = await html2canvas(element, HTML2CANVAS_PDF_OPTIONS);

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error("Capture PDF impossible : zone vide (0×0). Vérifiez l’aperçu du document.");
  }

  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const imgH = (canvas.height * pageW) / canvas.width;
  if (imgH <= pageH) {
    pdf.addImage(imgData, "JPEG", 0, 0, pageW, imgH);
  } else {
    let y = 0;
    let remaining = imgH;
    while (remaining > 0) {
      pdf.addImage(imgData, "JPEG", 0, -y, pageW, imgH);
      remaining -= pageH;
      y += pageH;
      if (remaining > 0) pdf.addPage();
    }
  }
  pdf.save(fileName);
}
