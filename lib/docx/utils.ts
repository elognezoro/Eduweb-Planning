import fs from "node:fs/promises";
import path from "node:path";
import {
  AlignmentType,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";

/* ============================================================================
   Briques partagées pour la génération de documents Word (.docx) académiques.
   Le logo EduWeb Planner figure en couverture et dans l'entête de chaque page.
   ========================================================================== */

/** Chemin disque du logo officiel. */
const LOGO_PATH = path.join(process.cwd(), "public", "brand", "logo.png");

/** Charge le logo en mémoire pour l'embarquer dans le DOCX. */
export async function loadLogoBuffer(): Promise<Buffer> {
  return fs.readFile(LOGO_PATH);
}

/** Couleur institutionnelle vert bouteille EduWeb (utilisée pour titres). */
export const COLOR_GREEN = "176B45";
/** Or institutionnel EduWeb (accents). */
export const COLOR_GOLD = "D99A1E";
/** Gris sobre pour textes secondaires. */
export const COLOR_GRAY = "555555";

/**
 * Entête répété sur chaque page (sauf page de garde) : logo à gauche +
 * libellé centré (titre court du document) + référence à droite.
 */
export function buildHeader({
  logoBuffer,
  centerLabel,
  rightLabel,
  watermark,
}: {
  logoBuffer: Buffer;
  centerLabel: string;
  rightLabel: string;
  /** Mention discrète d'institution affichée sous le filet d'entête. */
  watermark?: string;
}): Header {
  const headerChildren = [
    new Paragraph({
      tabStops: [
        { type: "center", position: 4500 },
        { type: "right", position: 9000 },
      ],
      spacing: { after: 80 },
      children: [
        new ImageRun({
          type: "png",
          data: logoBuffer,
          transformation: { width: 32, height: 32 },
        }),
        new TextRun({ text: "\t" + centerLabel, bold: true, size: 16, color: COLOR_GREEN }),
        new TextRun({ text: "\t" + rightLabel, italics: true, size: 14, color: COLOR_GRAY }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 0 },
      border: { bottom: { color: COLOR_GREEN, space: 1, style: "single", size: 12 } },
      children: [new TextRun({ text: "" })],
    }),
  ];

  if (watermark) {
    headerChildren.push(
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: watermark,
            italics: true,
            size: 14,
            color: "BBBBBB",
          }),
        ],
      }),
    );
  }

  return new Header({ children: headerChildren });
}

/** Pied de page : référence à gauche, numéro de page courant à droite. */
export function buildFooter({ reference }: { reference: string }): Footer {
  return new Footer({
    children: [
      new Paragraph({
        tabStops: [{ type: "right", position: 9000 }],
        children: [
          new TextRun({ text: reference, italics: true, size: 14, color: COLOR_GRAY }),
          new TextRun({ text: "\tPage ", size: 14, color: COLOR_GRAY }),
          new TextRun({ children: [PageNumber.CURRENT], size: 14, color: COLOR_GRAY, bold: true }),
          new TextRun({ text: " / ", size: 14, color: COLOR_GRAY }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: COLOR_GRAY }),
        ],
      }),
    ],
  });
}

/** Titre principal d'une section (heading 1 stylé). */
export function heading1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, bold: true, color: COLOR_GREEN, size: 36 })],
  });
}

/** Titre intermédiaire. */
export function heading2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, color: COLOR_GREEN, size: 28 })],
  });
}

/** Titre de section. */
export function heading3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, color: COLOR_GREEN, size: 24 })],
  });
}

/** Sous-section. */
export function heading4(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_4,
    spacing: { before: 160, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22 })],
  });
}

/** Paragraphe simple, justifié. */
export function bodyText(text: string, opts?: { italic?: boolean; bold?: boolean }): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        italics: opts?.italic,
        bold: opts?.bold,
        size: 22,
      }),
    ],
  });
}

/** Convertit un texte multi-paragraphes en une liste de paragraphes. */
export function multiParagraph(text: string): Paragraph[] {
  return text
    .split(/\n\n+/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => bodyText(para));
}

/** Élément de liste à puces. */
export function bulletItem(text: string, level = 0): Paragraph {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 22 })],
  });
}

/** Élément de liste numérotée (ordonnée). */
export function numberedItem(text: string, ref: string, level = 0): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 360 * (level + 1) },
    children: [
      new TextRun({ text: `${ref} `, bold: true, color: COLOR_GREEN, size: 22 }),
      new TextRun({ text, size: 22 }),
    ],
  });
}

/** Encadré « bonne pratique » ou « mise en garde ». */
export function calloutParagraph(label: string, text: string, kind: "tip" | "warning"): Paragraph {
  const color = kind === "tip" ? "1E40AF" : COLOR_GOLD;
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: { left: 300 },
    border: {
      left: { color, space: 8, style: "single", size: 18 },
    },
    children: [
      new TextRun({ text: `${label} · `, bold: true, color, size: 20 }),
      new TextRun({ text, size: 20 }),
    ],
  });
}

/** Espace vertical paramétré. */
export function spacer(size = 200): Paragraph {
  return new Paragraph({ spacing: { before: 0, after: size }, children: [new TextRun({ text: "" })] });
}

/** Saut de page explicite. */
export function pageBreak(): Paragraph {
  return new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true });
}

/** Paragraphe centré avec un texte simple (utilisé pour la couverture). */
export function centeredLine(text: string, opts?: { bold?: boolean; size?: number; color?: string; italic?: boolean }): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        italics: opts?.italic,
        size: opts?.size ?? 22,
        color: opts?.color,
      }),
    ],
  });
}

/** Image (logo) centrée à une taille donnée — utilisée pour la couverture. */
export function centeredImage(buffer: Buffer, sizePx = 170): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [
      new ImageRun({
        type: "png",
        data: buffer,
        transformation: { width: sizePx, height: sizePx },
      }),
    ],
  });
}
