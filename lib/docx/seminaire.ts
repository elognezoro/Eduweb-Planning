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
  heading4,
  loadLogoBuffer,
  multiParagraph,
  numberedItem,
  pageBreak,
  spacer,
} from "./utils";
import type {
  Seminaire,
  SeminaireBlock,
  SeminaireModule,
  SeminaireQuiz,
  SeminaireActivity,
} from "@/lib/seminaires/types";

/* ============================================================================
   Génère le livret académique complet d'un séminaire au format Word (.docx).
   - Page de garde dédiée avec logo
   - Entête répétée avec filigrane discret
   - Table des matières automatique
   - 9 modules détaillés + 3 quizzes + charte + grille + glossaire + planning
   ========================================================================== */

export async function buildSeminaireDocx(seminaire: Seminaire): Promise<Buffer> {
  const logo = await loadLogoBuffer();
  const m = seminaire.meta;
  const watermark = `EduWeb Planner · Séminaire ${m.title.split(":")[0].trim()} — usage interne`;

  // -------- COUVERTURE --------
  const cover: Paragraph[] = [
    centeredLine("République de Côte d'Ivoire", { bold: true, size: 20, color: COLOR_GRAY }),
    centeredLine("Union — Discipline — Travail", { italic: true, size: 18, color: COLOR_GRAY }),
    centeredLine("Séminaire des écoles catholiques", { italic: true, size: 18, color: COLOR_GRAY }),
    spacer(120),
    centeredImage(logo, 150),
    spacer(120),
    centeredLine("Livret académique", { bold: true, size: 22, color: COLOR_GOLD }),
    spacer(80),
    centeredLine(m.title, { bold: true, size: 44, color: COLOR_GREEN }),
    spacer(80),
    centeredLine(m.subtitle, { italic: true, size: 22, color: COLOR_GRAY }),
    spacer(300),
    centeredLine(`Référence : ${m.reference}${m.referenceDate ? ` (${m.referenceDate})` : ""}`, {
      bold: true,
      size: 20,
    }),
    centeredLine(`Format : ${m.courseType}`, { italic: true, size: 18, color: COLOR_GRAY }),
    centeredLine(`Durée : ${m.duration}`, { bold: true, size: 20 }),
    centeredLine(`Niveau : ${m.level}`, { bold: true, size: 20 }),
    centeredLine(`Public : ${m.audience}`, { italic: true, size: 18, color: COLOR_GRAY }),
    spacer(300),
    centeredLine("EduWeb Planner", { bold: true, size: 22, color: COLOR_GREEN }),
    centeredLine("Plateforme de pilotage scolaire — https://planning.eduweb.ci", {
      italic: true,
      size: 16,
      color: COLOR_GRAY,
    }),
  ];

  // -------- PRÉSENTATION + OBJECTIFS + COMPÉTENCES --------
  const front: Paragraph[] = [
    pageBreak(),
    heading1("Présentation générale"),
    ...m.presentation.flatMap((p) => multiParagraph(p)),

    pageBreak(),
    heading1("Objectifs pédagogiques"),
    bodyText("À l'issue de cette formation, le participant sera capable de :", { italic: true }),
    ...seminaire.objectives.map((o, i) => numberedItem(o, `${i + 1}.`)),

    heading2("Compétences visées"),
    ...seminaire.competences.flatMap((c) => [
      heading3(c.category),
      ...c.items.map((it) => bulletItem(it)),
    ]),
  ];

  // -------- TABLE DES MATIÈRES --------
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

  // -------- ARCHITECTURE LMS --------
  const architecture: Paragraph[] = [
    pageBreak(),
    heading1("Architecture pédagogique recommandée"),
    bodyText(
      "Le séminaire est structuré pour une intégration dans une plateforme numérique (Moodle, EduWeb, Canvas, Chamilo, WordPress LMS) sous forme d'un parcours modulaire de neuf séquences.",
    ),
    ...seminaire.architecture.flatMap((row) => [
      new Paragraph({
        spacing: { before: 80, after: 20 },
        children: [
          new TextRun({ text: `${row.section} · `, bold: true, color: COLOR_GREEN, size: 22 }),
          new TextRun({ text: row.contentType, size: 22 }),
        ],
      }),
      new Paragraph({
        indent: { left: 360 },
        spacing: { after: 40 },
        children: [
          new TextRun({ text: "Activité : ", bold: true, size: 20 }),
          new TextRun({ text: row.activity, size: 20 }),
          new TextRun({ text: "  ·  Évaluation : ", bold: true, size: 20 }),
          new TextRun({ text: row.evaluation, size: 20 }),
        ],
      }),
    ]),
  ];

  // -------- MODULES --------
  const modulesContent: Paragraph[] = [];
  seminaire.modules.forEach((mod) => {
    modulesContent.push(pageBreak());
    modulesContent.push(heading1(mod.title));
    modulesContent.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: mod.displayTitle, italics: true, size: 22, color: COLOR_GOLD }),
        ],
      }),
    );
    modulesContent.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: "Durée : ", bold: true, size: 20 }),
          new TextRun({ text: mod.duration, size: 20 }),
          new TextRun({ text: "    ·    Objectif : ", bold: true, size: 20 }),
          new TextRun({ text: mod.objective, size: 20 }),
        ],
      }),
    );
    if (mod.welcomeMessage) {
      modulesContent.push(...multiParagraph(mod.welcomeMessage));
    }
    if (mod.resume) {
      modulesContent.push(...multiParagraph(mod.resume));
    }
    if (mod.centralMessage) {
      modulesContent.push(calloutParagraph("Message central", mod.centralMessage, "tip"));
    }
    if (mod.retain && mod.retain.length) {
      modulesContent.push(heading3("À retenir"));
      mod.retain.forEach((r) => modulesContent.push(bulletItem(r)));
    }
    modulesContent.push(...renderBlocks(mod.content));

    modulesContent.push(heading2("Activités du module"));
    mod.activities.forEach((a) => {
      modulesContent.push(...renderActivity(a));
    });

    modulesContent.push(heading3("Critères d'achèvement"));
    mod.achievement.forEach((c) => modulesContent.push(bulletItem(c)));
  });

  // -------- QUIZZES --------
  const quizzesContent: Paragraph[] = [pageBreak(), heading1("Banque de quiz pour intégration LMS")];
  seminaire.quizzes.forEach((q) => {
    quizzesContent.push(...renderQuiz(q));
  });

  // -------- H5P --------
  const h5pContent: Paragraph[] = [pageBreak(), heading1("Activités H5P recommandées")];
  seminaire.h5pActivities.forEach((h) => {
    h5pContent.push(heading2(h.title));
    h5pContent.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: h.displayTitle, bold: true, size: 22 })],
      }),
    );
    if (h.description) h5pContent.push(bodyText(h.description, { italic: true }));
    if (h.slides) {
      h5pContent.push(heading4("Diapositives suggérées"));
      h.slides.forEach((s, i) => h5pContent.push(numberedItem(s, `${i + 1}.`)));
    }
    if (h.outcomes) {
      h5pContent.push(heading4("Résultats attendus"));
      h.outcomes.forEach((o) => h5pContent.push(bulletItem(o)));
    }
    if (h.fillInText) h5pContent.push(bodyText(h.fillInText, { italic: true }));
    if (h.cards) {
      h5pContent.push(heading4("Cartes proposées"));
      h.cards.forEach((c) => h5pContent.push(bulletItem(c)));
    }
  });

  // -------- CHARTE --------
  const charteContent: Paragraph[] = [
    pageBreak(),
    heading1("Charte d'usage responsable de l'intelligence artificielle"),
    heading2("Préambule"),
    bodyText(seminaire.charte.preambule),
    heading2("Engagements"),
    ...seminaire.charte.engagements.flatMap((e) => [
      heading3(`${e.num}. ${e.title}`),
      bodyText(e.description),
    ]),
    heading2("Mise en œuvre"),
    bodyText("La présente charte sera accompagnée :", { italic: true }),
    ...seminaire.charte.implementation.map((i) => bulletItem(i)),
  ];

  // -------- ÉVALUATION + BADGES --------
  const evalContent: Paragraph[] = [
    pageBreak(),
    heading1("Grille d'évaluation du projet final"),
    bodyText(
      "Chaque participant ou groupe doit produire une charte d'usage responsable de l'IA adaptée à son institution.",
      { italic: true },
    ),
    heading2("Barème"),
    ...seminaire.evaluation.criteria.map((c) =>
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: c.criterion + " — ", size: 22 }),
          new TextRun({ text: `${c.points} points`, bold: true, color: COLOR_GREEN, size: 22 }),
        ],
      }),
    ),
    new Paragraph({
      spacing: { before: 80, after: 80 },
      children: [
        new TextRun({ text: "Total : ", bold: true, size: 24 }),
        new TextRun({
          text: `${seminaire.evaluation.totalPoints} points`,
          bold: true,
          color: COLOR_GREEN,
          size: 24,
        }),
      ],
    }),
    heading2("Niveaux de performance"),
    ...seminaire.evaluation.levels.map((lv) =>
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: `${lv.range} : `, bold: true, color: COLOR_GREEN, size: 22 }),
          new TextRun({ text: lv.label, size: 22 }),
        ],
      }),
    ),
    heading2("Badges numériques"),
    ...seminaire.badges.flatMap((b) => [
      heading3(`Badge ${b.num} — ${b.title}`),
      bodyText(b.condition),
    ]),
    heading2("Pondération de l'évaluation globale"),
    ...seminaire.achievement.weights.map((w) =>
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: `${w.element} : `, bold: true, size: 22 }),
          new TextRun({ text: w.weight, bold: true, color: COLOR_GREEN, size: 22 }),
        ],
      }),
    ),
    heading2("Critères d'achèvement automatique"),
    bodyText("L'apprenant obtient l'attestation si :", { italic: true }),
    ...seminaire.achievement.autoCriteria.map((c) => bulletItem(c)),
  ];

  // -------- GUIDE FORMATEUR + PLAN D'ACTION + PLANNINGS --------
  const formateurContent: Paragraph[] = [
    pageBreak(),
    heading1("Consignes pour le formateur"),
    heading2("Avant la formation"),
    ...seminaire.formateur.before.map((b) => bulletItem(b)),
    heading2("Pendant la formation"),
    ...seminaire.formateur.during.map((b) => bulletItem(b)),
    heading2("Après la formation"),
    ...seminaire.formateur.after.map((b) => bulletItem(b)),

    heading2(`Plan d'action à ${seminaire.actionPlan.followUpDays} jours`),
    bodyText(seminaire.actionPlan.forumInstruction, { italic: true }),
    ...seminaire.actionPlan.questions.map((q, i) => numberedItem(q, `${i + 1}.`)),
    new Paragraph({
      spacing: { before: 100, after: 40 },
      children: [
        new TextRun({ text: "Forum de suivi : ", bold: true, size: 22 }),
        new TextRun({ text: seminaire.actionPlan.forumTitle, italics: true, size: 22 }),
      ],
    }),

    heading2(`${seminaire.scheduleShort.label} — ${seminaire.scheduleShort.totalDuration}`),
    ...renderScheduleRows(seminaire.scheduleShort.rows ?? []),

    heading2(`${seminaire.scheduleLong.label} — ${seminaire.scheduleLong.totalDuration}`),
    ...(seminaire.scheduleLong.days ?? []).flatMap((day) => [
      heading3(`Jour ${day.num}`),
      ...renderScheduleRows(day.rows),
    ]),
  ];

  // -------- GLOSSAIRE + REPÈRES --------
  const glossaireContent: Paragraph[] = [
    pageBreak(),
    heading1("Glossaire"),
    bodyText("Termes spécifiques utilisés dans ce séminaire.", { italic: true }),
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
    heading2("Les 10 repères d'un usage responsable de l'IA"),
    ...seminaire.references10.map((r) => numberedItem(r.text, `${r.num}.`)),
  ];

  // -------- INTÉGRATIONS LMS + PROMPTS --------
  const lmsContent: Paragraph[] = [
    pageBreak(),
    heading1("Notes techniques d'intégration LMS"),
    ...seminaire.integrations.flatMap((i) => [
      heading2(`Pour ${i.platform}`),
      ...i.steps.map((s) => bulletItem(s)),
    ]),
    heading2("Ressources à ajouter dans la plateforme"),
    ...seminaire.resources.flatMap((r) => [
      heading3(r.kind === "principale" ? "Ressource principale" : "Ressources pédagogiques"),
      ...r.items.map((it) => bulletItem(it)),
    ]),
    heading2("Prompts pour ressources génératives"),
    ...seminaire.prompts.flatMap((p) => [
      heading3(p.title),
      bodyText(p.description),
    ]),
  ];

  // -------- SYNTHÈSE + CLÔTURE --------
  const closingContent: Paragraph[] = [
    pageBreak(),
    heading1("Synthèse — Cinq verbes pour rester humains"),
    ...seminaire.synthese.flatMap((s) => [
      heading3(`${s.num}. ${s.verb}`),
      bodyText(s.description),
    ]),
    heading2("Message de clôture"),
    ...multiParagraph(seminaire.closingMessage),
    spacer(200),
    centeredLine("Fin du livret académique", { bold: true, size: 24, color: COLOR_GREEN }),
    centeredLine("EduWeb Planner · Séminaire des écoles catholiques", {
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
            centerLabel: m.title.split(":")[0].trim(),
            rightLabel: "Magnifica Humanitas",
            watermark,
          }),
        },
        footers: {
          default: buildFooter({ reference: `Séminaire ${m.title.split(":")[0].trim()}` }),
        },
        children: [
          ...cover,
          ...front,
          ...toc,
          ...architecture,
          ...modulesContent,
          ...quizzesContent,
          ...h5pContent,
          ...charteContent,
          ...evalContent,
          ...formateurContent,
          ...glossaireContent,
          ...lmsContent,
          ...closingContent,
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

/* ============================================================================
   Helpers de rendu
   ========================================================================== */

function renderBlocks(blocks: SeminaireBlock[]): Paragraph[] {
  const out: Paragraph[] = [];
  blocks.forEach((b) => {
    switch (b.kind) {
      case "paragraph":
        out.push(bodyText(b.text));
        break;
      case "subheading":
        if (b.level === 2) out.push(heading2(b.text));
        else if (b.level === 3) out.push(heading3(b.text));
        else out.push(heading4(b.text));
        break;
      case "bulletList":
        if (b.intro) out.push(bodyText(b.intro, { italic: true }));
        b.items.forEach((it) => out.push(bulletItem(it)));
        break;
      case "numberedList":
        if (b.intro) out.push(bodyText(b.intro, { italic: true }));
        b.items.forEach((it, i) => out.push(numberedItem(it, `${i + 1}.`)));
        break;
      case "principle":
        out.push(heading3(`${b.num}. ${b.title}`));
        out.push(bodyText(b.description));
        out.push(
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 300 },
            children: [
              new TextRun({ text: "Application : ", bold: true, color: COLOR_GREEN, size: 20 }),
              new TextRun({ text: b.application, italics: true, size: 20 }),
            ],
          }),
        );
        break;
      case "deviation":
        out.push(heading3(`${b.num}. ${b.title}`));
        out.push(bodyText(b.description));
        out.push(
          new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [new TextRun({ text: "Risques", bold: true, color: COLOR_GOLD, size: 20 })],
          }),
        );
        b.risks.forEach((r) => out.push(bulletItem(r)));
        out.push(
          new Paragraph({
            spacing: { before: 60, after: 80 },
            children: [
              new TextRun({ text: "Solution : ", bold: true, color: COLOR_GREEN, size: 20 }),
              new TextRun({ text: b.solution, italics: true, size: 20 }),
            ],
          }),
        );
        break;
      case "domain":
        out.push(heading3(`${b.num}. ${b.title}`));
        b.items.forEach((it) => out.push(bulletItem(it)));
        break;
      case "table":
        if (b.caption) out.push(bodyText(b.caption, { italic: true }));
        out.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: b.headers.join(" | "), bold: true, color: COLOR_GREEN, size: 20 }),
            ],
          }),
        );
        b.rows.forEach((row) => {
          out.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [new TextRun({ text: row.join(" | "), size: 20 })],
            }),
          );
        });
        break;
      case "callout":
        out.push(
          calloutParagraph(
            b.label,
            b.text,
            b.tone === "warning" ? "warning" : "tip",
          ),
        );
        break;
    }
  });
  return out;
}

function renderActivity(a: SeminaireActivity): Paragraph[] {
  const out: Paragraph[] = [];
  out.push(heading3(`${a.num} · ${a.title}`));
  if (a.recommendation) {
    out.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: "Outil recommandé : ", bold: true, color: COLOR_GREEN, size: 20 }),
          new TextRun({ text: a.recommendation, italics: true, size: 20 }),
        ],
      }),
    );
  }
  a.instructions.forEach((ins) => out.push(bodyText(ins)));

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
    });
  }
  if (a.truefalse) {
    a.truefalse.forEach((t, i) => {
      out.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${i + 1}. ${t.statement}`, size: 20 }),
            new TextRun({ text: `  → ${t.answer}`, bold: true, color: COLOR_GREEN, size: 20 }),
            t.explanation
              ? new TextRun({ text: " — " + t.explanation, italics: true, size: 20 })
              : new TextRun({ text: "" }),
          ],
        }),
      );
    });
  }
  if (a.matchings) {
    a.matchings.forEach((mt) => {
      out.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: mt.situation + " → ", size: 20 }),
            new TextRun({ text: mt.principle, bold: true, color: COLOR_GREEN, size: 20 }),
          ],
        }),
      );
    });
  }
  if (a.steps) {
    a.steps.forEach((s) => {
      out.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({ text: `Étape ${s.num}. `, bold: true, color: COLOR_GREEN, size: 20 }),
            new TextRun({ text: s.description, size: 20 }),
          ],
        }),
      );
      s.choices.forEach((c, j) => {
        out.push(
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 20 },
            children: [
              new TextRun({
                text: `${String.fromCharCode(65 + j)}. ${c}`,
                size: 20,
                bold: j === s.bestIdx,
                color: j === s.bestIdx ? COLOR_GREEN : undefined,
              }),
              j === s.bestIdx
                ? new TextRun({
                    text: "  ✓ (meilleur choix)",
                    italics: true,
                    color: COLOR_GREEN,
                    size: 20,
                  })
                : new TextRun({ text: "" }),
            ],
          }),
        );
      });
    });
  }
  if (a.caseStudy) {
    out.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: "Cas : ", bold: true, color: COLOR_GREEN, size: 20 }),
          new TextRun({ text: a.caseStudy.description, size: 20 }),
        ],
      }),
    );
    a.caseStudy.questions.forEach((q, i) => out.push(numberedItem(q, `${i + 1}.`)));
    out.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: "Production attendue : ", bold: true, size: 20 }),
          new TextRun({ text: a.caseStudy.production, italics: true, size: 20 }),
        ],
      }),
    );
  }
  if (a.tableHeaders) {
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
    if (a.example) {
      a.example.forEach((e) => {
        out.push(
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({ text: e.content + " | …", size: 20 }),
            ],
          }),
        );
      });
    } else {
      out.push(bodyText("(Tableau à remplir lors de l'atelier.)", { italic: true }));
    }
  }
  if (a.options) {
    a.options.forEach((o) => out.push(bulletItem(o)));
  }
  if (a.exploitation) {
    out.push(calloutParagraph("Exploitation pédagogique", a.exploitation, "tip"));
  }
  if (a.deliverable) {
    out.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: "Livrable attendu : ", bold: true, size: 20 }),
          new TextRun({ text: a.deliverable, italics: true, size: 20 }),
        ],
      }),
    );
  }
  if (a.presentationCriteria) {
    out.push(heading4("Critères de présentation"));
    a.presentationCriteria.forEach((c) => out.push(bulletItem(c)));
  }
  return out;
}

function renderQuiz(quiz: SeminaireQuiz): Paragraph[] {
  const out: Paragraph[] = [];
  out.push(heading2(quiz.title));
  quiz.questions.forEach((q, i) => {
    out.push(
      new Paragraph({
        spacing: { before: 80, after: 30 },
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
  });
  return out;
}

function renderScheduleRows(rows: { hours: string; activity: string }[]): Paragraph[] {
  return rows.map(
    (r) =>
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: r.hours + "  ·  ", bold: true, color: COLOR_GREEN, size: 20 }),
          new TextRun({ text: r.activity, size: 20 }),
        ],
      }),
  );
}
