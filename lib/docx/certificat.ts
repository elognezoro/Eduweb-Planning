import {
  AlignmentType,
  Document,
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
   - Champs pré-remplis depuis l'URL (name, role, number, date)
   ========================================================================== */

export interface CertificateData {
  beneficiaryName?: string;
  beneficiaryRole?: string;
  certificateNumber?: string;
  issueDate?: string;
}

export async function buildCertificateDocx(data: CertificateData = {}): Promise<Buffer> {
  const logo = await loadLogoBuffer();
  const id = TRAINING_SYLLABUS.identification;

  const placeholder = (v: string | undefined, fallback: string) => v?.trim() || fallback;

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
          centeredLine("République de Côte d'Ivoire", { bold: true, size: 20, color: COLOR_GRAY }),
          centeredLine("Union — Discipline — Travail", { italic: true, size: 18, color: COLOR_GRAY }),
          centeredLine("Ministère de l'Éducation Nationale", { bold: true, size: 20, color: COLOR_GRAY }),
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
          // Tableau de méta (numéro, date, validité) sous forme de paragraphes alignés
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
          spacer(360),
          // Signatures côte-à-côte (deux paragraphes séparés)
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
          spacer(280),
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
                text: "Nom, signature, date            DRENA / CAFOP / APFC (cachet et signature)",
                italics: true,
                size: 18,
                color: COLOR_GRAY,
              }),
            ],
          }),
          spacer(360),
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
