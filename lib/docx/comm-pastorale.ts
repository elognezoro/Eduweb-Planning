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
import type {
  CommSeminaire,
  CommSlide,
  CommSlideBlock,
  CommSeminaireActivity,
} from "@/lib/seminaires/communication-pastorale";

/* ============================================================================
   Génère le livret académique du séminaire « Communication pastorale » au
   format Word (.docx).
   ========================================================================== */

export async function buildCommPastoraleDocx(seminaire: CommSeminaire): Promise<Buffer> {
  const logo = await loadLogoBuffer();
  const m = seminaire.meta;
  const watermark = `EduWeb Planner · Séminaire SENEC — usage interne`;
  // Libellé court pour entête/pied, dérivé du séminaire (SENEC numérique vs IA).
  const shortLabel =
    m.slug === "ia-communication" ? "IA & communication" : "Communication pastorale";

  // -------- COUVERTURE --------
  const cover: Paragraph[] = [
    centeredLine("République de Côte d'Ivoire", { bold: true, size: 20, color: COLOR_GRAY }),
    centeredLine("Union — Discipline — Travail", { italic: true, size: 18, color: COLOR_GRAY }),
    centeredLine("Séminaire des communicateurs de l'Éducation Catholique", {
      italic: true,
      size: 18,
      color: COLOR_GRAY,
    }),
    spacer(120),
    centeredImage(logo, 150),
    spacer(120),
    centeredLine("Livret académique", { bold: true, size: 22, color: COLOR_GOLD }),
    spacer(80),
    centeredLine(m.title, { bold: true, size: 40, color: COLOR_GREEN }),
    spacer(80),
    centeredLine(m.subtitle, { italic: true, size: 22, color: COLOR_GRAY }),
    spacer(300),
    centeredLine(`Référence : ${m.reference}`, { bold: true, size: 20 }),
    centeredLine(`Date : ${m.referenceDate}`, { bold: true, size: 20 }),
    centeredLine(`Format : ${m.format}`, { italic: true, size: 18, color: COLOR_GRAY }),
    centeredLine(`Durée : ${m.duration}`, { bold: true, size: 20 }),
    centeredLine(`Niveau : ${m.level}`, { bold: true, size: 20 }),
    centeredLine(`Public : ${m.audience}`, { italic: true, size: 18, color: COLOR_GRAY }),
    centeredLine(`Organisateur : ${m.organiser}`, { bold: true, size: 18, color: COLOR_GREEN }),
    spacer(300),
    centeredLine("EduWeb Planner", { bold: true, size: 22, color: COLOR_GREEN }),
    centeredLine("Plateforme de pilotage scolaire — https://planning.eduweb.ci", {
      italic: true,
      size: 16,
      color: COLOR_GRAY,
    }),
  ];

  // -------- PRÉSENTATION / OBJECTIFS / COMPÉTENCES --------
  const front: Paragraph[] = [
    pageBreak(),
    heading1("Présentation générale"),
    ...m.presentation.flatMap((p) => multiParagraph(p)),

    pageBreak(),
    heading1("Objectifs pédagogiques"),
    bodyText("À l'issue de cette formation, le participant sera capable de :", { italic: true }),
    ...seminaire.objectives.map((o, i) => numberedItem(o, `${i + 1}.`)),

    heading2("Compétences visées"),
    ...seminaire.competences.map((c) => bulletItem(c)),
  ];

  // -------- TOC --------
  const toc: Paragraph[] = [
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

  // -------- SLIDES --------
  const slidesContent: Paragraph[] = [
    pageBreak(),
    heading1(`Présentation contextuelle — ${seminaire.slides.length} diapositives`),
  ];
  seminaire.slides.forEach((s) => {
    slidesContent.push(pageBreak());
    slidesContent.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: `Diapositive ${String(s.num).padStart(2, "0")}`,
            color: COLOR_GOLD,
            bold: true,
            size: 18,
          }),
        ],
      }),
    );
    slidesContent.push(heading2(s.title));
    if (s.subtitle) {
      slidesContent.push(bodyText(s.subtitle, { italic: true }));
    }
    slidesContent.push(...renderSlideBlocks(s));
    if (s.footer) {
      slidesContent.push(calloutParagraph("Repère", s.footer, "tip"));
    }
    if (s.facilitatorNote) {
      slidesContent.push(calloutParagraph("Note formateur", s.facilitatorNote, "warning"));
    }
  });

  // -------- MÉTHODES --------
  // Formation IA : P.A.S.T.O.R.A.L. (prompt) + 5 V (validation).
  // Séminaire numérique : RAPIDE + 4V.
  const methodesContent: Paragraph[] = [pageBreak(), heading1("Méthodes & règles d'or")];
  if (seminaire.promptMethod || seminaire.fiveV) {
    if (seminaire.promptMethod) {
      methodesContent.push(
        heading2("Méthode P.A.S.T.O.R.A.L. — rédiger un bon prompt"),
        ...seminaire.promptMethod.flatMap((p) => [
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `${p.letter} — ${p.label}`, bold: true, color: COLOR_GREEN, size: 22 }),
            ],
          }),
          bodyText(p.detail),
        ]),
      );
    }
    if (seminaire.fiveV) {
      methodesContent.push(
        heading2("Règle des 5 V — avant toute publication assistée par IA"),
        ...seminaire.fiveV.flatMap((v) => [
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `${v.letter} ${v.label}`, bold: true, color: COLOR_GREEN, size: 22 }),
            ],
          }),
          bodyText(v.detail),
        ]),
      );
    }
  } else {
    methodesContent.push(
      heading2("Méthode RAPIDE — grille de relecture en 6 critères"),
      ...(seminaire.rapide ?? []).map(
        (r) =>
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: `${r.letter} — `, bold: true, color: COLOR_GREEN, size: 22 }),
              new TextRun({ text: r.label, size: 22 }),
            ],
          }),
      ),
      heading2("Règle des 4V — avant toute publication assistée par IA"),
      ...(seminaire.fourV ?? []).flatMap((v) => [
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${v.letter} ${v.label}`, bold: true, color: COLOR_GREEN, size: 22 }),
          ],
        }),
        bodyText(v.detail),
      ]),
    );
  }

  // -------- ATELIERS --------
  const activitiesContent: Paragraph[] = [pageBreak(), heading1("Ateliers interactifs")];
  seminaire.activities.forEach((a) => {
    activitiesContent.push(...renderActivity(a));
  });

  // -------- PLAN D'ACTION / PROTOCOLE --------
  // Formation IA : protocole d'usage responsable. Séminaire numérique : plan d'action.
  let planContent: Paragraph[] = [];
  if (seminaire.protocol) {
    planContent = [
      pageBreak(),
      heading1("Protocole d'usage responsable de l'IA"),
      bodyText(
        "Cadre simple à adopter dans votre cellule de communication avant tout usage de l'intelligence artificielle.",
        { italic: true },
      ),
      ...seminaire.protocol.flatMap((p) => [
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({ text: `${p.num}. ${p.title}`, bold: true, color: COLOR_GREEN, size: 22 }),
          ],
        }),
        ...p.items.map((it) => bodyText(`• ${it}`)),
      ]),
    ];
  } else if (seminaire.actionPlanTemplate) {
    const plan = seminaire.actionPlanTemplate;
    planContent = [
      pageBreak(),
      heading1("Modèle de plan d'action"),
      bodyText(plan.intro, { italic: true }),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: plan.columns.join(" | "),
            bold: true,
            color: COLOR_GREEN,
            size: 22,
          }),
        ],
      }),
      ...plan.examples.map(
        (row) =>
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: row.values.join(" | "), size: 22 })],
          }),
      ),
    ];
  }

  // -------- DÉROULÉ --------
  const scheduleContent: Paragraph[] = [
    pageBreak(),
    heading1(`Déroulé proposé — ${m.duration}`),
    ...seminaire.schedule.map(
      (s) =>
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: s.hours + "  ·  ", bold: true, color: COLOR_GREEN, size: 20 }),
            new TextRun({ text: s.activity, size: 20 }),
          ],
        }),
    ),
  ];

  // -------- REPÈRES + GLOSSAIRE --------
  const glossaryContent: Paragraph[] = [
    pageBreak(),
    heading1("Les 10 repères du communicateur catholique"),
    ...seminaire.references10.map((r) => numberedItem(r.text, `${r.num}.`)),

    heading2("Glossaire"),
    ...seminaire.glossary.map(
      (g) =>
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360, hanging: 360 },
          children: [
            new TextRun({ text: g.term, bold: true, color: COLOR_GREEN, size: 22 }),
            new TextRun({ text: " — " + g.definition, size: 22 }),
          ],
        }),
    ),
  ];

  // -------- CLÔTURE --------
  const closing: Paragraph[] = [
    pageBreak(),
    heading1("Message de clôture"),
    ...multiParagraph(seminaire.closingMessage),
    spacer(200),
    centeredLine("Fin du livret académique", { bold: true, size: 24, color: COLOR_GREEN }),
    centeredLine(`EduWeb Planner · Séminaire SENEC · ${m.referenceDate}`, {
      italic: true,
      size: 18,
      color: COLOR_GRAY,
    }),
  ];

  // -------- ASSEMBLAGE --------
  const doc = new Document({
    creator: "EduWeb Planner",
    title: m.title,
    description: `Livret du séminaire ${m.title}`,
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
            centerLabel: shortLabel,
            rightLabel: "SENEC",
            watermark,
          }),
        },
        footers: {
          default: buildFooter({ reference: `Séminaire SENEC — ${shortLabel}` }),
        },
        children: [
          ...cover,
          ...front,
          ...toc,
          ...slidesContent,
          ...methodesContent,
          ...activitiesContent,
          ...planContent,
          ...scheduleContent,
          ...glossaryContent,
          ...closing,
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

/* ============================================================================
   Rendu d'une slide
   ========================================================================== */
function renderSlideBlocks(slide: CommSlide): Paragraph[] {
  const out: Paragraph[] = [];
  slide.blocks.forEach((b) => {
    out.push(...renderBlock(b));
  });
  return out;
}

function renderBlock(b: CommSlideBlock): Paragraph[] {
  switch (b.kind) {
    case "paragraph":
      return [bodyText(b.text, { italic: b.tone === "muted" })];
    case "highlight":
      return [
        calloutParagraph(
          b.tone === "warning"
            ? "Attention"
            : b.tone === "pastoral"
              ? "Repère pastoral"
              : b.tone === "success"
                ? "Méthode"
                : "Repère",
          b.text,
          b.tone === "warning" ? "warning" : "tip",
        ),
      ];
    case "bulletList": {
      const arr: Paragraph[] = [];
      if (b.intro) arr.push(bodyText(b.intro, { italic: true }));
      b.items.forEach((it) => arr.push(bulletItem(it)));
      return arr;
    }
    case "numberedList": {
      const arr: Paragraph[] = [];
      if (b.intro) arr.push(bodyText(b.intro, { italic: true }));
      b.items.forEach((it, i) => arr.push(numberedItem(it, `${i + 1}.`)));
      return arr;
    }
    case "pillars": {
      const arr: Paragraph[] = [];
      b.items.forEach((it) => {
        arr.push(
          new Paragraph({
            spacing: { before: 60, after: 30 },
            children: [
              new TextRun({ text: `${it.label} · `, bold: true, color: COLOR_GOLD, size: 22 }),
              new TextRun({ text: it.title, bold: true, color: COLOR_GREEN, size: 22 }),
            ],
          }),
        );
        arr.push(bodyText(it.description));
      });
      return arr;
    }
    case "principles": {
      const arr: Paragraph[] = [];
      if (b.title) arr.push(heading3(b.title));
      b.items.forEach((it) => {
        arr.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({ text: `${it.letter}  `, bold: true, color: COLOR_GOLD, size: 28 }),
              new TextRun({ text: it.label, bold: true, color: COLOR_GREEN, size: 24 }),
            ],
          }),
        );
        it.points.forEach((p) => arr.push(bulletItem(p)));
      });
      return arr;
    }
    case "flow":
      return [
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: b.items.join("  ›  "),
              bold: true,
              color: COLOR_GREEN,
              size: 22,
            }),
          ],
        }),
      ];
    case "channels": {
      const arr: Paragraph[] = [];
      b.items.forEach((c) => {
        arr.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: c.name + " — ", bold: true, color: COLOR_GREEN, size: 22 }),
              new TextRun({ text: c.purpose, italics: true, size: 22 }),
            ],
          }),
        );
      });
      return arr;
    }
    case "publics": {
      const arr: Paragraph[] = [];
      arr.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: b.headers.join(" | "),
              bold: true,
              color: COLOR_GREEN,
              size: 20,
            }),
          ],
        }),
      );
      b.rows.forEach((r) => {
        arr.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `${r.public}  ·  `, bold: true, size: 20 }),
              new TextRun({ text: r.verbs.join(" / ") + "  ·  ", italics: true, size: 20 }),
              new TextRun({ text: r.columns.join("  |  "), size: 20 }),
            ],
          }),
        );
      });
      return arr;
    }
    case "steps": {
      const arr: Paragraph[] = [];
      b.items.forEach((s) => {
        arr.push(
          new Paragraph({
            spacing: { before: 60, after: 30 },
            children: [
              new TextRun({ text: `Étape ${s.num} · `, bold: true, color: COLOR_GREEN, size: 22 }),
              new TextRun({ text: s.label, bold: true, size: 22 }),
            ],
          }),
        );
        arr.push(bodyText(s.detail));
      });
      return arr;
    }
  }
}

/* -------- Activités -------- */
function renderActivity(a: CommSeminaireActivity): Paragraph[] {
  const out: Paragraph[] = [];
  out.push(heading2(`${a.num} · ${a.title}`));
  if (a.recommendation) {
    out.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: "Modalité : ", bold: true, color: COLOR_GREEN, size: 20 }),
          new TextRun({ text: a.recommendation, italics: true, size: 20 }),
        ],
      }),
    );
  }
  a.instructions.forEach((ins) => out.push(bodyText(ins)));

  if (a.items) {
    a.items.forEach((it) =>
      out.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: "□  ", color: COLOR_GREEN, size: 22 }),
            new TextRun({ text: it.label, bold: true, size: 22 }),
            it.helper ? new TextRun({ text: " — " + it.helper, italics: true, size: 20 }) : new TextRun({ text: "" }),
          ],
        }),
      ),
    );
  }

  if (a.qcm) {
    a.qcm.forEach((q, i) => {
      out.push(
        new Paragraph({
          spacing: { before: 60, after: 30 },
          children: [
            new TextRun({ text: `Q${i + 1}. `, bold: true, color: COLOR_GREEN, size: 22 }),
            new TextRun({ text: q.question, bold: true, size: 22 }),
          ],
        }),
      );
      q.options.forEach((o, j) => {
        out.push(
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 20 },
            children: [
              new TextRun({
                text: `${String.fromCharCode(65 + j)}. ${o}`,
                size: 20,
                bold: j === q.correctIdx,
                color: j === q.correctIdx ? COLOR_GREEN : undefined,
              }),
              j === q.correctIdx
                ? new TextRun({ text: "  ✓", bold: true, color: COLOR_GREEN, size: 20 })
                : new TextRun({ text: "" }),
            ],
          }),
        );
      });
      if (q.rationale) {
        out.push(
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: q.rationale, italics: true, color: COLOR_GRAY, size: 18 }),
            ],
          }),
        );
      }
    });
  }

  if (a.tableHeaders && a.tableRows) {
    out.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: a.tableHeaders.join(" | "),
            bold: true,
            color: COLOR_GREEN,
            size: 20,
          }),
        ],
      }),
    );
    a.tableRows.forEach((row) => {
      out.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: row + "  |  ", bold: true, size: 20 }),
            new TextRun({
              text: "…  |  ".repeat(a.tableHeaders!.length - 1).trim(),
              italics: true,
              color: COLOR_GRAY,
              size: 20,
            }),
          ],
        }),
      );
    });
  }

  if (a.deliverable) {
    out.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: "Livrable : ", bold: true, size: 20 }),
          new TextRun({ text: a.deliverable, italics: true, size: 20 }),
        ],
      }),
    );
  }
  return out;
}
