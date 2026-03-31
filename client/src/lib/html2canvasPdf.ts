import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/** Options alignées sur les éditeurs où le PDF n’est pas vide (logos data URL, images externes). */
export const HTML2CANVAS_PDF_OPTIONS: Parameters<typeof html2canvas>[1] = {
  scale: 2,
  useCORS: true,
  backgroundColor: "#ffffff",
  allowTaint: true,
  logging: false
};

/**
 * Capture un nœud DOM et produit un PDF (une ou plusieurs pages A4).
 * JPEG pour limiter la taille du fichier.
 */
export async function captureElementToPdfFile(element: HTMLElement, fileName: string): Promise<void> {
  const canvas = await html2canvas(element, HTML2CANVAS_PDF_OPTIONS);
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
