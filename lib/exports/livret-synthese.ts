import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  VerticalAlign,
  BorderStyle,
  ImageRun,
  PageOrientation,
} from "docx";
import { fetchImageData } from "./image";
import { toAscii as A } from "./text";

/** Une cellule « Moyenne / Rang ». */
export interface SyntheseCell {
  moy: string;
  rang: string;
}

/** Données d'un récapitulatif annuel synthétique (modèle « fiche de synthèse »). */
export interface LivretSyntheseData {
  official: string;
  ministry: string;
  slogan: string;
  schoolYear: string;
  emblem: string | null;
  institution: string;
  proviseurFunction: string;
  proviseur: string;
  student: { nom: string; prenoms: string; className: string; matricule: string };
  effectif: number;
  subjects: { name: string; t1: SyntheseCell; t2: SyntheseCell; t3: SyntheseCell; mga: SyntheseCell }[];
  overall: { t1: SyntheseCell; t2: SyntheseCell; t3: SyntheseCell; mga: SyntheseCell };
  appreciationProf: string;
  decision: string;
  admisEn: string;
  mention: string;
  generatedAt: string;
}

const GREEN: [number, number, number] = [23, 107, 69];
const GOLD: [number, number, number] = [217, 154, 30];
const TEXT: [number, number, number] = [23, 35, 29];
const LINE: [number, number, number] = [120, 120, 140];

/* ----------------------------------- PDF ----------------------------------- */
function drawBox(doc: jsPDF, x: number, y: number, w: number, h: number, title: string): number {
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.6);
  doc.rect(x, y, w, h);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT);
  const lines = doc.splitTextToSize(A(title), w - 10) as string[];
  doc.text(lines, x + w / 2, y + 12, { align: "center" });
  return y + 12 + lines.length * 10;
}
function ruledLines(doc: jsPDF, x: number, y: number, w: number, n: number, gap: number) {
  doc.setDrawColor(190, 190, 200);
  doc.setLineWidth(0.4);
  for (let i = 0; i < n && y + i * gap < 9999; i++) doc.line(x, y + i * gap, x + w, y + i * gap);
}

/**
 * Récapitulatif annuel en PDF A4 paysage, pensé comme une page pliée en deux :
 *  - moitié gauche (page 1) : en-tête + tableau des notes + synthèse générale ;
 *  - moitié droite (page 2, sans en-tête) : appréciations, prof principal, décision, mention.
 */
export async function downloadLivretSynthesePdf(d: LivretSyntheseData, filename = "livret-recapitulatif.pdf") {
  const emblem = await fetchImageData(d.emblem);
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const m = 22;
  const mid = W / 2;
  const gutter = 16;
  const leftX0 = m;
  const leftX1 = mid - gutter / 2;
  const leftW = leftX1 - leftX0;
  const leftCx = (leftX0 + leftX1) / 2;
  const rightX0 = mid + gutter / 2;
  const rightW = W - m - rightX0;

  // Repère de pliure central
  doc.setDrawColor(205, 205, 210);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(mid, 16, mid, H - 16);
  doc.setLineDashPattern([], 0);

  /* ------------------ MOITIÉ GAUCHE (page 1) : en-tête + tableaux ----------- */
  let y = 22;
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(A(d.official) || "RÉPUBLIQUE", leftCx, y, { align: "center" });
  y += 4;
  if (emblem) {
    const ih = 24;
    const iw = (ih * emblem.w) / emblem.h;
    doc.addImage(emblem.dataUrl, emblem.format, leftCx - iw / 2, y, iw, ih, undefined, "FAST");
    y += ih;
  }
  if (d.slogan) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text(A(d.slogan), leftCx, y + 8, { align: "center" });
    y += 11;
  }
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  const title = A(`LIVRET SCOLAIRE — RÉCAPITULATIF ANNUEL${d.schoolYear ? ` (${d.schoolYear})` : ""}`);
  const titleLines = doc.splitTextToSize(title, leftW) as string[];
  doc.text(titleLines, leftCx, y + 11, { align: "center" });
  y += 11 + (titleLines.length - 1) * 12;
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(A(`Nom & Prénoms : ${d.student.nom} ${d.student.prenoms}`), leftCx, y + 13, { align: "center" });
  doc.text(A(`Classe : ${d.student.className}   ·   Matricule : ${d.student.matricule}   ·   Effectif : ${d.effectif}`), leftCx, y + 23, { align: "center" });
  y += 29;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(leftX0, y, leftX1, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: leftX0 },
    tableWidth: leftW,
    theme: "grid",
    head: [
      [
        { content: "Matière", rowSpan: 2 },
        { content: "1er Trim.", colSpan: 2 },
        { content: "2e Trim.", colSpan: 2 },
        { content: "3e Trim.", colSpan: 2 },
        { content: "M.G.A", colSpan: 2 },
      ],
      ["Moy", "Rang", "Moy", "Rang", "Moy", "Rang", "Moy", "Rang"],
    ],
    body: d.subjects.map((s) => [A(s.name), s.t1.moy, A(s.t1.rang), s.t2.moy, A(s.t2.rang), s.t3.moy, A(s.t3.rang), s.mga.moy, A(s.mga.rang)]),
    styles: { fontSize: 6.8, cellPadding: 1.8, lineColor: LINE, lineWidth: 0.4, textColor: TEXT, halign: "center", valign: "middle" },
    headStyles: { fillColor: GREEN, textColor: 255, halign: "center", valign: "middle", fontSize: 6.8 },
    columnStyles: { 0: { halign: "left", cellWidth: 86, fontStyle: "bold" } },
  });
  let yy = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GREEN);
  doc.text("Synthèse générale", leftX0, yy);
  yy += 4;
  autoTable(doc, {
    startY: yy,
    margin: { left: leftX0 },
    tableWidth: leftW,
    theme: "grid",
    head: [
      [
        { content: "1er T", colSpan: 2 },
        { content: "2e T", colSpan: 2 },
        { content: "3e T", colSpan: 2 },
        { content: "M.G.A", colSpan: 2 },
      ],
      ["Moy", "Rang", "Moy", "Rang", "Moy", "Rang", "Moy", "Rang"],
    ],
    body: [
      [d.overall.t1.moy, A(d.overall.t1.rang), d.overall.t2.moy, A(d.overall.t2.rang), d.overall.t3.moy, A(d.overall.t3.rang), d.overall.mga.moy, A(d.overall.mga.rang)],
    ],
    styles: { fontSize: 7.5, cellPadding: 2.6, lineColor: LINE, lineWidth: 0.4, textColor: TEXT, halign: "center", valign: "middle" },
    headStyles: { fillColor: GREEN, textColor: 255, halign: "center" },
  });
  yy = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // Pied de page 1 (moitié gauche)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(A(`${d.institution || "Établissement"} — généré le ${d.generatedAt} · EduWeb Planner`), leftCx, H - 14, { align: "center" });

  /* ------------- MOITIÉ DROITE (page 2, sans en-tête) : 4 encadrés ---------- */
  const rTop = 24;
  const rBot = H - 24;
  const gap = 8;
  const usable = rBot - rTop - 3 * gap;
  const h1 = usable * 0.3;
  const h2 = usable * 0.27;
  const h3 = usable * 0.23;
  const h4 = usable * 0.2;

  // Appréciation du Professeur
  let by = rTop;
  drawBox(doc, rightX0, by, rightW, h1, "Appréciation du Professeur — Visa et Signature");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT);
  doc.text(doc.splitTextToSize(A(d.appreciationProf), rightW - 14) as string[], rightX0 + 7, by + 34);
  ruledLines(doc, rightX0 + 7, by + 64, rightW - 14, Math.max(2, Math.floor((h1 - 72) / 14)), 14);

  // Prof Principal
  by += h1 + gap;
  drawBox(doc, rightX0, by, rightW, h2, "Prof Principal");
  let py = by + 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Appréciation", rightX0 + 7, py);
  py += 11;
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(A(d.appreciationProf), rightW - 14) as string[], rightX0 + 7, py);
  py += 30;
  doc.setFont("helvetica", "bold");
  doc.text(A(d.proviseurFunction), rightX0 + 7, py);
  py += 11;
  doc.setFont("helvetica", "normal");
  doc.text(A(d.proviseur) || "____________________", rightX0 + 7, py);
  py += 18;
  doc.setFont("helvetica", "bold");
  doc.text("Signature", rightX0 + 7, py);
  doc.setFont("helvetica", "normal");
  doc.text(`Date : ${A(d.generatedAt)}`, rightX0 + rightW - 7, py, { align: "right" });

  // Décision du Conseil de classe
  by += h2 + gap;
  drawBox(doc, rightX0, by, rightW, h3, "Décision du Conseil de classe");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize(A(d.decision), rightW - 14) as string[], rightX0 + 7, by + 32);
  doc.setFont("helvetica", "bold");
  doc.text(A(`Admis(e) en : ${d.admisEn}`), rightX0 + 7, by + h3 - 12);

  // Mention
  by += h3 + gap;
  drawBox(doc, rightX0, by, rightW, h4, "Mention");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...GREEN);
  doc.text(A(d.mention), rightX0 + rightW / 2, by + h4 / 2 + 10, { align: "center" });

  doc.save(filename);
}

/* ----------------------------------- Word ---------------------------------- */
const G = "176B45";
const NOB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;
const NO_BORDERS = { top: NOB, bottom: NOB, left: NOB, right: NOB, insideHorizontal: NOB, insideVertical: NOB } as const;
const full = { size: 100, type: WidthType.PERCENTAGE } as const;

const tcell = (text: string, opts: { bold?: boolean; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; fill?: string; colSpan?: number; rowSpan?: number } = {}) =>
  new TableCell({
    columnSpan: opts.colSpan,
    rowSpan: opts.rowSpan,
    shading: opts.fill ? { fill: opts.fill } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: opts.align, children: [new TextRun({ text, bold: opts.bold, color: opts.color })] })],
  });

/** Encadré « boîte » (titre vert + contenu) sous forme de tableau 1 cellule bordé. */
function boxTable(title: string, lines: Paragraph[]): Table {
  return new Table({
    width: full,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: title, bold: true, color: G })] }), ...lines],
          }),
        ],
      }),
    ],
  });
}

/** Récapitulatif annuel au format Word (.docx), paysage, deux colonnes (notes | appréciations). */
export async function downloadLivretSyntheseWord(d: LivretSyntheseData, filename = "livret-recapitulatif.docx") {
  const emblem = await fetchImageData(d.emblem);
  const C = AlignmentType.CENTER;

  // En-tête (colonne gauche) : officiel → emblème → devise → titre → identité
  const headerChildren: (Paragraph | Table)[] = [];
  if (d.official) headerChildren.push(new Paragraph({ alignment: C, children: [new TextRun({ text: d.official, bold: true, size: 20 })] }));
  if (emblem) {
    const h = 42;
    const w = Math.round((h * emblem.w) / emblem.h);
    headerChildren.push(new Paragraph({ alignment: C, children: [new ImageRun({ data: emblem.bytes, transformation: { width: w, height: h }, type: emblem.format === "JPEG" ? "jpg" : "png" })] }));
  }
  if (d.slogan) headerChildren.push(new Paragraph({ alignment: C, children: [new TextRun({ text: d.slogan, italics: true, size: 15, color: "606060" })] }));
  headerChildren.push(
    new Paragraph({ alignment: C, children: [new TextRun({ text: `LIVRET SCOLAIRE — RÉCAPITULATIF ANNUEL${d.schoolYear ? ` (${d.schoolYear})` : ""}`, bold: true, size: 22, color: G })] }),
    new Paragraph({
      alignment: C,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D99A1E", space: 3 } },
      children: [new TextRun({ text: `${d.student.nom} ${d.student.prenoms} · ${d.student.className} · ${d.student.matricule} · Effectif ${d.effectif}`, size: 16 })],
    }),
    new Paragraph({ text: "" }),
  );

  // Tableau des notes
  const head1 = new TableRow({
    tableHeader: true,
    children: [
      tcell("Matière", { bold: true, color: "FFFFFF", fill: G, rowSpan: 2 }),
      tcell("1er Trim.", { bold: true, color: "FFFFFF", fill: G, colSpan: 2, align: C }),
      tcell("2e Trim.", { bold: true, color: "FFFFFF", fill: G, colSpan: 2, align: C }),
      tcell("3e Trim.", { bold: true, color: "FFFFFF", fill: G, colSpan: 2, align: C }),
      tcell("M.G.A", { bold: true, color: "FFFFFF", fill: G, colSpan: 2, align: C }),
    ],
  });
  const head2 = new TableRow({
    tableHeader: true,
    children: ["Moy", "Rang", "Moy", "Rang", "Moy", "Rang", "Moy", "Rang"].map((h) => tcell(h, { bold: true, color: "FFFFFF", fill: G, align: C })),
  });
  const recapBody = d.subjects.map(
    (s) =>
      new TableRow({
        children: [tcell(s.name), ...[s.t1.moy, s.t1.rang, s.t2.moy, s.t2.rang, s.t3.moy, s.t3.rang, s.mga.moy, s.mga.rang].map((v) => tcell(v, { align: C }))],
      }),
  );
  const recapTable = new Table({ width: full, rows: [head1, head2, ...recapBody] });

  const sumHead1 = new TableRow({
    tableHeader: true,
    children: [
      tcell("1er T", { bold: true, color: "FFFFFF", fill: G, colSpan: 2, align: C }),
      tcell("2e T", { bold: true, color: "FFFFFF", fill: G, colSpan: 2, align: C }),
      tcell("3e T", { bold: true, color: "FFFFFF", fill: G, colSpan: 2, align: C }),
      tcell("M.G.A", { bold: true, color: "FFFFFF", fill: G, colSpan: 2, align: C }),
    ],
  });
  const sumHead2 = new TableRow({
    tableHeader: true,
    children: ["Moy", "Rang", "Moy", "Rang", "Moy", "Rang", "Moy", "Rang"].map((h) => tcell(h, { bold: true, color: "FFFFFF", fill: G, align: C })),
  });
  const sumBody = new TableRow({
    children: [d.overall.t1.moy, d.overall.t1.rang, d.overall.t2.moy, d.overall.t2.rang, d.overall.t3.moy, d.overall.t3.rang, d.overall.mga.moy, d.overall.mga.rang].map((v) => tcell(v, { align: C })),
  });
  const summaryTable = new Table({ width: full, rows: [sumHead1, sumHead2, sumBody] });

  // Colonne gauche
  const leftChildren: (Paragraph | Table)[] = [
    ...headerChildren,
    recapTable,
    new Paragraph({ text: "" }),
    new Paragraph({ children: [new TextRun({ text: "Synthèse générale", bold: true, color: G })] }),
    summaryTable,
  ];

  // Colonne droite : 4 encadrés
  const rightChildren: (Paragraph | Table)[] = [
    boxTable("Appréciation du Professeur — Visa et Signature", [
      new Paragraph({ children: [new TextRun({ text: d.appreciationProf, italics: true })] }),
      new Paragraph({ text: "" }),
      new Paragraph({ children: [new TextRun({ text: "Signature : ____________________", color: "5A5A5A" })] }),
    ]),
    new Paragraph({ text: "" }),
    boxTable("Prof Principal", [
      new Paragraph({ children: [new TextRun({ text: "Appréciation : ", bold: true }), new TextRun({ text: d.appreciationProf })] }),
      new Paragraph({ children: [new TextRun({ text: `${d.proviseurFunction} : `, bold: true }), new TextRun({ text: d.proviseur || "____________________" })] }),
      new Paragraph({ children: [new TextRun({ text: "Signature : ____________________", color: "5A5A5A" })] }),
      new Paragraph({ children: [new TextRun({ text: `Date : ${d.generatedAt}`, color: "5A5A5A" })] }),
    ]),
    new Paragraph({ text: "" }),
    boxTable("Décision du Conseil de classe", [
      new Paragraph({ children: [new TextRun({ text: d.decision })] }),
      new Paragraph({ children: [new TextRun({ text: `Admis(e) en : ${d.admisEn}`, bold: true })] }),
    ]),
    new Paragraph({ text: "" }),
    boxTable("Mention", [new Paragraph({ children: [new TextRun({ text: d.mention, bold: true, size: 26, color: G })] })]),
  ];

  // Disposition deux colonnes (tableau sans bordure)
  const layout = new Table({
    width: full,
    borders: NO_BORDERS,
    columnWidths: [5400, 5400],
    rows: [
      new TableRow({
        children: [
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: NO_BORDERS, margins: { right: 180 }, children: leftChildren }),
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: NO_BORDERS, margins: { left: 180 }, children: rightChildren }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
        children: [layout],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
