import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportPayload } from "./types";
import { fetchImageData } from "./image";
import { toAscii as A } from "./text";

const GREEN: [number, number, number] = [23, 107, 69];
const GOLD: [number, number, number] = [217, 154, 30];
const TEXT: [number, number, number] = [23, 35, 29];

/**
 * Génère un PDF institutionnel EduWeb Planner (en-tête, pied de page, sections,
 * tableaux) et déclenche le téléchargement. Conçu pour s'exécuter côté client.
 */
export async function downloadReportPdf(
  payload: ReportPayload,
  filename = "rapport.pdf",
  opts: { fontBump?: number } = {},
) {
  const emblem = await fetchImageData(payload.emblem);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  // Décalage de police optionnel (ex. +2 pt pour les supports de formation).
  const fb = opts.fontBump ?? 0;

  // En-tête
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18 + fb);
  doc.text("EduWeb Planner", margin, 32);
  doc.setFontSize(10 + fb);
  doc.setFont("helvetica", "normal");
  doc.text("Plateforme de pilotage scolaire", margin, 50);
  doc.setFillColor(...GOLD);
  doc.rect(0, 70, pageWidth, 4, "F");

  let y = 96;

  // Bandeau institutionnel officiel (renseigné dans la Configuration).
  // Colonne droite empilée : Officiel → Emblème national → Devise → Année.
  if (payload.ministry || payload.official) {
    const rightX = pageWidth - margin;
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5 + fb);
    if (payload.ministry) {
      doc.text(doc.splitTextToSize(A(payload.ministry), pageWidth / 2 - margin - 6), margin, y);
    }
    if (payload.official) {
      doc.text(A(payload.official), rightX, y, { align: "right" });
    }
    let cursor = y + 4;
    if (emblem) {
      const ih = 22;
      const iw = Math.min(64, (ih * emblem.w) / emblem.h);
      doc.addImage(emblem.dataUrl, emblem.format, rightX - iw, cursor, iw, ih, undefined, "FAST");
      cursor += ih + 2;
    }
    if (payload.slogan) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8 + fb);
      doc.setTextColor(110, 110, 110);
      doc.text(A(payload.slogan), rightX, cursor + 7, { align: "right" });
      cursor += 11;
    }
    if (payload.schoolYear) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8 + fb);
      doc.setTextColor(...TEXT);
      doc.text(A(`Année Scolaire ${payload.schoolYear}`), rightX, cursor + 7, { align: "right" });
      cursor += 11;
    }
    const bandBottom = Math.max(cursor, y + 22);
    doc.setDrawColor(...GOLD);
    doc.line(margin, bandBottom + 4, pageWidth - margin, bandBottom + 4);
    y = bandBottom + 22;
  }

  // Bloc titre
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16 + fb);
  doc.text(A(payload.title), margin, y);
  y += 18;
  if (payload.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11 + fb);
    doc.setTextColor(110, 110, 110);
    doc.text(A(payload.subtitle), margin, y);
    y += 16;
  }

  // Métadonnées
  doc.setFontSize(9 + fb);
  doc.setTextColor(90, 90, 90);
  const meta = [
    `Pays : ${payload.country}`,
    payload.institution ? `Structure : ${payload.institution}` : null,
    payload.period ? `Période : ${payload.period}` : null,
    `Auteur : ${payload.author}`,
    `Généré le : ${payload.generatedAt}`,
  ].filter(Boolean) as string[];
  meta.forEach((line) => {
    doc.text(A(line), margin, y);
    y += 13;
  });
  y += 8;

  // Sections — pagination MANUELLE (jsPDF ne pagine jamais doc.text()).
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottom = pageHeight - 56; // réserve l'espace du pied de page
  const lineH = (10 + fb) * 1.35; // interligne indexé sur la police (suit fontBump)

  payload.sections.forEach((section) => {
    // Saut de page si le titre + au moins 2 lignes ne tiennent pas (anti-titre orphelin).
    if (y + lineH * 3 > bottom) {
      doc.addPage();
      y = 60;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12 + fb);
    doc.setTextColor(...GREEN);
    doc.text(A(section.heading), margin, y);
    y += lineH + 2;

    if (section.paragraphs?.length) {
      section.paragraphs.forEach((p) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10 + fb);
        doc.setTextColor(...TEXT);
        const lines = doc.splitTextToSize(A(p), pageWidth - margin * 2);
        // Saut de page AVANT de tracer si le bloc déborde (sinon chevauchement du pied).
        if (y + lines.length * lineH > bottom) {
          doc.addPage();
          y = 60;
        }
        doc.text(lines, margin, y);
        y += lines.length * lineH + 4;
      });
    }

    if (section.table) {
      autoTable(doc, {
        startY: y,
        head: [section.table.columns.map(A)],
        body: section.table.rows.map((r) => r.map((c) => A(String(c)))),
        margin: { left: margin, right: margin },
        styles: { fontSize: 9 + fb, cellPadding: 5 },
        headStyles: { fillColor: GREEN, textColor: 255 },
        alternateRowStyles: { fillColor: [240, 251, 245] },
      });
      // @ts-expect-error lastAutoTable est ajouté par le plugin
      y = (doc.lastAutoTable?.finalY ?? y) + 16;
    } else {
      y += 6;
    }
  });

  // Pied de page sur toutes les pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...GOLD);
    doc.line(margin, h - 40, pageWidth - margin, h - 40);
    doc.setFontSize(8 + fb);
    doc.setTextColor(120, 120, 120);
    doc.text("EduWeb Planner — Document généré automatiquement", margin, h - 26);
    doc.text(`Page ${i} / ${pageCount}`, pageWidth - margin - 60, h - 26);
    doc.text("Signature : ______________________", pageWidth - margin - 180, h - 14);
  }

  doc.save(filename);
}
