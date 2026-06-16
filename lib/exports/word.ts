import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
} from "docx";
import type { ReportPayload } from "./types";
import { fetchImageData } from "./image";

const GREEN = "176B45";
const GOLD = "D99A1E";

/** Construit un document Word EduWeb Planner et déclenche le téléchargement. */
export async function downloadReportWord(payload: ReportPayload, filename = "rapport.docx") {
  const emblem = await fetchImageData(payload.emblem);
  const children: (Paragraph | Table)[] = [];

  // En-tête
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "EduWeb Planner", bold: true, size: 36, color: GREEN })],
    }),
    new Paragraph({
      children: [new TextRun({ text: "Plateforme de pilotage scolaire", italics: true, size: 18, color: "808080" })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 6 } },
    }),
  );

  // Bandeau institutionnel officiel (renseigné dans la Configuration)
  if (payload.ministry) {
    children.push(new Paragraph({ children: [new TextRun({ text: payload.ministry, bold: true, size: 16, color: "17231D" })] }));
  }
  if (payload.official) {
    children.push(new Paragraph({ children: [new TextRun({ text: payload.official, bold: true, size: 16, color: "17231D" })] }));
  }
  if (emblem) {
    const h = 46;
    const w = Math.round((h * emblem.w) / emblem.h);
    children.push(
      new Paragraph({
        children: [new ImageRun({ data: emblem.bytes, transformation: { width: w, height: h }, type: emblem.format === "JPEG" ? "jpg" : "png" })],
      }),
    );
  }
  if (payload.slogan) {
    children.push(new Paragraph({ children: [new TextRun({ text: payload.slogan, italics: true, size: 15, color: "606060" })] }));
  }
  if (payload.schoolYear) {
    children.push(new Paragraph({ children: [new TextRun({ text: `Année Scolaire ${payload.schoolYear}`, bold: true, size: 15, color: "17231D" })] }));
  }

  children.push(
    new Paragraph({ text: "" }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: payload.title, color: GREEN })] }),
  );

  if (payload.subtitle) {
    children.push(new Paragraph({ children: [new TextRun({ text: payload.subtitle, color: "606060" })] }));
  }

  const meta = [
    `Pays : ${payload.country}`,
    payload.institution ? `Structure : ${payload.institution}` : null,
    payload.period ? `Période : ${payload.period}` : null,
    `Auteur : ${payload.author}`,
    `Généré le : ${payload.generatedAt}`,
  ].filter(Boolean) as string[];
  meta.forEach((line) =>
    children.push(new Paragraph({ children: [new TextRun({ text: line, size: 18, color: "5A5A5A" })] })),
  );
  children.push(new Paragraph({ text: "" }));

  // Sections
  payload.sections.forEach((section) => {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: section.heading, color: GREEN })] }),
    );
    section.paragraphs?.forEach((p) => children.push(new Paragraph({ text: p })));

    if (section.table) {
      const headerRow = new TableRow({
        children: section.table.columns.map(
          (c) =>
            new TableCell({
              shading: { fill: GREEN },
              children: [new Paragraph({ children: [new TextRun({ text: c, bold: true, color: "FFFFFF" })] })],
            }),
        ),
      });
      const bodyRows = section.table.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) => new TableCell({ children: [new Paragraph({ text: String(cell) })] }),
            ),
          }),
      );
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...bodyRows],
        }),
      );
      children.push(new Paragraph({ text: "" }));
    }
  });

  children.push(
    new Paragraph({ text: "" }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "Signature : ______________________", size: 18, color: "5A5A5A" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 6 } },
      children: [new TextRun({ text: "EduWeb Planner — Document généré automatiquement", size: 14, color: "808080" })],
    }),
  );

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
