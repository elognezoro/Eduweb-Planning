import {
  AlignmentType,
  Document,
  ImageRun,
  PageOrientation,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import {
  centeredImage,
  centeredLine,
  COLOR_GOLD,
  COLOR_GRAY,
  COLOR_GREEN,
  loadLogoBuffer,
  spacer,
} from "./utils";
import { TRAINING_SYLLABUS } from "@/lib/guides/training-manual-data";

/* ============================================================================
   Génère le « Certificat de fin de formation » en Word (.docx).
   - Format A4, marges réduites pour aérer la page
   - Logo officiel centré
   - Cadre décoratif via bordures de paragraphes
   - Signature scannée + cachet de l'établissement (si configurés)
   - Champs pré-remplis (name, role, number, date, identité de l'établissement)
   ========================================================================== */

export interface CertificateData {
  beneficiaryName?: string;
  beneficiaryRole?: string;
  certificateNumber?: string;
  issueDate?: string;
  /** Nom officiel de l'établissement délivrant le certificat. */
  institution?: string;
  /** Nom du chef d'établissement / formateur signataire. */
  headName?: string;
  /** Fonction du signataire (Chef d'établissement, Directeur, etc.). */
  headFunction?: string;
  /** Pays d'émission, pour la mention officielle de garde. */
  officialCountry?: string;
  /** Slogan ou devise du pays (ex. « Union — Discipline — Travail »). */
  officialSlogan?: string;
  /** Ministère de tutelle. */
  ministry?: string;
  /** Image data URL (PNG/JPEG) de la signature scannée du signataire. */
  signatureDataUrl?: string;
  /** Image data URL (PNG/JPEG) du cachet de l'établissement. */
  stampDataUrl?: string;
}

/**
 * Décode un data URL (`data:image/png;base64,…`) en Buffer + type d'image.
 * Renvoie `null` si le format n'est pas reconnu.
 */
function decodeDataUrl(dataUrl: string | undefined): { buffer: Buffer; type: "png" | "jpg" } | null {
  if (!dataUrl) return null;
  const match = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) return null;
  const ext = match[1].toLowerCase();
  const type: "png" | "jpg" = ext === "png" ? "png" : "jpg";
  try {
    return { buffer: Buffer.from(match[2], "base64"), type };
  } catch {
    return null;
  }
}

/** Paragraphe centré contenant une image (signature ou cachet). */
function imageRow(image: { buffer: Buffer; type: "png" | "jpg" }, sizePx: number): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [
      new ImageRun({
        type: image.type,
        data: image.buffer,
        transformation: { width: sizePx, height: sizePx },
      }),
    ],
  });
}

export async function buildCertificateDocx(data: CertificateData = {}): Promise<Buffer> {
  const logo = await loadLogoBuffer();
  const id = TRAINING_SYLLABUS.identification;

  const country = data.officialCountry?.trim() || "République de Côte d'Ivoire";
  const slogan = data.officialSlogan?.trim() || "Union — Discipline — Travail";
  const ministry = data.ministry?.trim() || "Ministère de l'Éducation Nationale";

  const placeholder = (v: string | undefined, fallback: string) => v?.trim() || fallback;

  const signature = decodeDataUrl(data.signatureDataUrl);
  const stamp = decodeDataUrl(data.stampDataUrl);

  const beneficiaryLine = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 80 },
    border: { bottom: { color: COLOR_GREEN, space: 12, style: "single", size: 18 } },
    children: [
      new TextRun({
        text: placeholder(data.beneficiaryName, "…………………………………………………………"),
        bold: true,
        size: 52,
        color: COLOR_GREEN,
      }),
    ],
  });

  // ---- Bloc « Le formateur / autorité hiérarchique » -----------------------
  const headDisplayName = placeholder(
    data.headName,
    "Nom de l'autorité hiérarchique",
  );
  const headFunction = placeholder(
    data.headFunction,
    "Chef d'établissement",
  );
  const institutionLabel = placeholder(data.institution, "Établissement");

  const signatureBlock: Paragraph[] = [
    // Étiquettes des deux blocs
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "Le formateur                                                    L'autorité hiérarchique",
          italics: true,
          size: 20,
          color: COLOR_GRAY,
        }),
      ],
    }),
  ];

  // Si signature scannée fournie, on la pose à gauche ; sinon un espace.
  if (signature) {
    signatureBlock.push(imageRow(signature, 90));
  } else {
    signatureBlock.push(spacer(280));
  }

  // Cachet à droite si fourni (sur la ligne du formateur côté droit).
  if (stamp) {
    signatureBlock.push(imageRow(stamp, 100));
  }

  signatureBlock.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "_________________________            _________________________",
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: `${headDisplayName}            ${institutionLabel}`,
          bold: true,
          size: 20,
          color: COLOR_GREEN,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: `${headFunction}            DRENA / CAFOP / APFC selon le cas`,
          italics: true,
          size: 18,
          color: COLOR_GRAY,
        }),
      ],
    }),
  );

  const certificate = new Document({
    creator: "EduWeb Planner",
    title: "Certificat de fin de formation",
    description: `Certificat — ${id.intituleAbrege ?? id.intitule}`,
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
            borders: {
              pageBorderTop: { color: COLOR_GREEN, size: 24, style: "double", space: 24 },
              pageBorderRight: { color: COLOR_GREEN, size: 24, style: "double", space: 24 },
              pageBorderBottom: { color: COLOR_GREEN, size: 24, style: "double", space: 24 },
              pageBorderLeft: { color: COLOR_GREEN, size: 24, style: "double", space: 24 },
            },
          },
        },
        children: [
          centeredLine(country, { bold: true, size: 20, color: COLOR_GRAY }),
          centeredLine(slogan, { italic: true, size: 18, color: COLOR_GRAY }),
          centeredLine(ministry, { bold: true, size: 20, color: COLOR_GRAY }),
          centeredImage(logo, 130),
          centeredLine("CERTIFICAT DE FIN DE FORMATION", {
            bold: true,
            size: 32,
            color: COLOR_GOLD,
          }),
          spacer(160),
          centeredLine("Il est certifié que", { italic: true, size: 22, color: COLOR_GRAY }),
          beneficiaryLine,
          centeredLine(
            placeholder(data.beneficiaryRole, "Rôle / fonction de l'apprenant(e)"),
            { italic: true, size: 20, color: COLOR_GRAY },
          ),
          spacer(240),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            indent: { left: 600, right: 600 },
            children: [
              new TextRun({
                text: "a suivi avec succès le support de formation académique ",
                size: 22,
              }),
              new TextRun({ text: `« ${id.intitule} »`, bold: true, size: 22 }),
              new TextRun({ text: " (référence ", size: 22 }),
              new TextRun({ text: id.code, bold: true, size: 22, color: COLOR_GREEN }),
              new TextRun({ text: ", version ", size: 22 }),
              new TextRun({ text: id.version, bold: true, size: 22 }),
              new TextRun({
                text: `) d'une durée totale indicative de `,
                size: 22,
              }),
              new TextRun({
                text: TRAINING_SYLLABUS.volumeHoraire.dureeTotal,
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: ", mobilisant les huit modules de formation aux rôles utilisateurs de la plateforme EduWeb Planner, et a satisfait aux modalités d'évaluation requises pour la délivrance du présent certificat.",
                size: 22,
              }),
            ],
          }),
          spacer(220),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `N° du certificat : ${placeholder(data.certificateNumber, "_______________")}`,
                bold: true,
                size: 20,
                color: COLOR_GREEN,
              }),
              new TextRun({ text: "      ", size: 20 }),
              new TextRun({
                text: `Délivré le : ${placeholder(data.issueDate, "____ / ____ / _______")}`,
                bold: true,
                size: 20,
                color: COLOR_GREEN,
              }),
              new TextRun({ text: "      ", size: 20 }),
              new TextRun({
                text: `Validité : ${id.dateValidite}`,
                bold: true,
                size: 20,
                color: COLOR_GREEN,
              }),
            ],
          }),
          spacer(280),
          ...signatureBlock,
          spacer(240),
          centeredLine(
            "Document à conserver — toute reproduction frauduleuse est sanctionnée par la loi.",
            { italic: true, size: 16, color: COLOR_GRAY },
          ),
        ],
      },
    ],
  });

  return Packer.toBuffer(certificate);
}
