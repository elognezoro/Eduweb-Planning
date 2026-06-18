import {
  Document,
  PageOrientation,
  Packer,
  Paragraph,
  StyleLevel,
  TableOfContents,
  TextRun,
} from "docx";
import {
  bodyText,
  buildFooter,
  buildHeader,
  bulletItem,
  calloutParagraph,
  centeredImage,
  centeredLine,
  COLOR_GOLD,
  COLOR_GRAY,
  COLOR_GREEN,
  heading1,
  heading2,
  heading3,
  loadLogoBuffer,
  multiParagraph,
  numberedItem,
  pageBreak,
  spacer,
} from "./utils";
import { GUIDES } from "@/lib/guides";

/* ============================================================================
   Construit un guide utilisateur individuel (par rôle) en Word (.docx).
   - Page de garde dédiée avec logo
   - Entête répétée avec logo + titre
   - Table des matières automatique
   - Numérotation de pages
   ========================================================================== */

export async function buildGuideDocx(roleKey: string): Promise<Buffer> {
  const guide = GUIDES[roleKey];
  if (!guide) throw new Error(`Guide introuvable : ${roleKey}`);

  const logo = await loadLogoBuffer();
  const headerCenter = `Guide ${guide.roleLabel}`;
  const headerRight = "EduWeb Planner";

  // -------- COVER --------
  const cover: Paragraph[] = [
    centeredLine("Document de formation", { italic: true, size: 20, color: COLOR_GRAY }),
    spacer(200),
    centeredImage(logo, 160),
    spacer(120),
    centeredLine("Guide utilisateur", { bold: true, size: 22, color: COLOR_GOLD }),
    spacer(120),
    centeredLine(guide.roleLabel, { bold: true, size: 56, color: COLOR_GREEN }),
    spacer(120),
    centeredLine(guide.meta.targetAudience, { italic: true, size: 22, color: COLOR_GRAY }),
    spacer(300),
    centeredLine(`Niveau : ${guide.meta.level}`, { bold: true, size: 22 }),
    centeredLine(`Durée estimée : ${guide.meta.duration}`, { bold: true, size: 22 }),
    ...(guide.meta.context
      ? [centeredLine(`Contexte : ${guide.meta.context}`, { italic: true, size: 20, color: COLOR_GRAY })]
      : []),
    spacer(400),
    centeredLine("EduWeb Planner", { bold: true, size: 24, color: COLOR_GREEN }),
    centeredLine("Plateforme de pilotage scolaire — https://planning.eduweb.ci", {
      italic: true,
      size: 18,
      color: COLOR_GRAY,
    }),
  ];

  // -------- OBJECTIFS + PRÉREQUIS --------
  const front = [
    pageBreak(),
    heading1("Objectifs pédagogiques"),
    bodyText("À l'issue de ce guide, vous serez capable de :", { italic: true }),
    ...guide.objectives.map((o, i) => numberedItem(o, `${i + 1}.`)),
    spacer(160),
    heading1("Prérequis"),
    bodyText("Avant de commencer la formation, vérifiez que :", { italic: true }),
    ...guide.prerequisites.map((p) => bulletItem(p)),
  ];

  // -------- TOC --------
  const toc = [
    pageBreak(),
    heading1("Sommaire"),
    bodyText(
      "Le sommaire ci-dessous est généré automatiquement. À l'ouverture sous Microsoft Word, acceptez la mise à jour des champs (ou pressez F9).",
      { italic: true },
    ),
    spacer(120),
    new TableOfContents("Sommaire", {
      hyperlink: true,
      headingStyleRange: "1-3",
      stylesWithLevels: [
        new StyleLevel("Heading1", 1),
        new StyleLevel("Heading2", 2),
        new StyleLevel("Heading3", 3),
      ],
    }) as unknown as Paragraph,
  ];

  // -------- CHAPITRES --------
  const body: Paragraph[] = [];
  guide.chapters.forEach((c) => {
    body.push(pageBreak());
    body.push(heading1(c.title));
    if (c.intro) body.push(bodyText(c.intro, { italic: true }));
    c.sections.forEach((s) => {
      body.push(heading2(s.title));
      body.push(...multiParagraph(s.body));
      if (s.steps && s.steps.length > 0) {
        s.steps.forEach((st, i) => {
          body.push(numberedItem(st.instruction, `${i + 1}.`));
          if (st.navigation) {
            body.push(
              new Paragraph({
                indent: { left: 720 },
                spacing: { after: 40 },
                children: [
                  new TextRun({ text: "Chemin · ", bold: true, color: COLOR_GREEN, size: 20 }),
                  new TextRun({ text: st.navigation, size: 20, color: COLOR_GRAY }),
                ],
              }),
            );
          }
          if (st.tip) body.push(calloutParagraph("Astuce", st.tip, "tip"));
          if (st.warning) body.push(calloutParagraph("Attention", st.warning, "warning"));
        });
      }
      if (s.bestPractices && s.bestPractices.length > 0) {
        body.push(
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: "Bonnes pratiques", bold: true, color: COLOR_GREEN, size: 22 }),
            ],
          }),
        );
        s.bestPractices.forEach((bp) => body.push(bulletItem(bp)));
      }
      if (s.caveat) body.push(calloutParagraph("Mise en garde", s.caveat, "warning"));
    });
  });

  // -------- FAQ --------
  body.push(pageBreak());
  body.push(heading1("Annexe — Foire aux questions"));
  bodyText("Réponses aux questions fréquemment posées par les utilisateurs ayant ce rôle.", { italic: true });
  guide.faq.forEach((q, i) => {
    body.push(heading3(`Q${i + 1}. ${q.question}`));
    body.push(bodyText(q.answer));
  });

  // -------- GLOSSAIRE --------
  body.push(pageBreak());
  body.push(heading1("Annexe — Glossaire"));
  bodyText("Termes spécifiques au rôle utilisés dans ce guide.", { italic: true });
  guide.glossary.forEach((g) =>
    body.push(
      new Paragraph({
        spacing: { after: 80 },
        indent: { left: 360, hanging: 360 },
        children: [
          new TextRun({ text: g.term, bold: true, color: COLOR_GREEN, size: 22 }),
          new TextRun({ text: " — " + g.definition, size: 22 }),
        ],
      }),
    ),
  );

  // -------- ASSEMBLAGE --------
  const doc = new Document({
    creator: "EduWeb Planner",
    title: `Guide ${guide.roleLabel}`,
    description: `Guide de formation EduWeb Planner — ${guide.roleLabel}`,
    features: { updateFields: true },
    sections: [
      {
        properties: {
          titlePage: true,
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        headers: {
          first: undefined,
          default: buildHeader({
            logoBuffer: logo,
            centerLabel: headerCenter,
            rightLabel: headerRight,
          }),
        },
        footers: {
          default: buildFooter({ reference: `Guide ${guide.roleLabel}` }),
        },
        children: [...cover, ...front, ...toc, ...body],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
