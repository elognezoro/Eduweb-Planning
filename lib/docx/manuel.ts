import {
  AlignmentType,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  StyleLevel,
  Table,
  TableCell,
  TableLayoutType,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
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
import { GUIDES } from "@/lib/guides";
import {
  TRAINING_ABBREVIATIONS,
  TRAINING_ASSESSMENTS,
  TRAINING_PROGRESSION,
  TRAINING_SYLLABUS,
} from "@/lib/guides/training-manual-data";
import { buildModuleSyllabus, formatMinutes } from "@/lib/guides/syllabus";

/* ============================================================================
   Construit le manuel académique de formation en Word (.docx).
   - Page de garde avec logo
   - Logo + libellé dans l'entête de chaque page (sauf garde)
   - Table des matières automatique (TOC field, se met à jour à l'ouverture)
   - Numérotation de pages
   ========================================================================== */

/** Ordre stratégique des modules — repris du manuel imprimable. */
const MODULE_ORDER = [
  "admin",
  "chef_etablissement",
  "inspecteur",
  "conseiller_pedagogique",
  "enseignant",
  "educateur",
  "parent",
  "eleve",
  "cafop_admin",
  "cafop_directeur",
  "cafop_professeur",
  "apfc_admin",
  "chef_antenne",
  "transport_chauffeur",
] as const;

export async function buildTrainingManualDocx(onlyRole?: string): Promise<Buffer> {
  // Restriction par rôle : un rôle non-admin n'obtient que SON module ; l'admin
  // (ou l'absence de filtre) génère le manuel complet.
  const order: readonly string[] =
    onlyRole && onlyRole !== "admin" ? MODULE_ORDER.filter((r) => r === onlyRole) : MODULE_ORDER;
  const logo = await loadLogoBuffer();
  const id = TRAINING_SYLLABUS.identification;
  const headerCenter = id.intituleAbrege || "EduWeb Planner — Support de formation";
  const headerRight = `Réf. ${id.code}`;

  // -------- COVER PAGE --------
  const coverChildren: Paragraph[] = [
    centeredLine("République de Côte d'Ivoire", { bold: true, size: 22, color: COLOR_GRAY }),
    centeredLine("Union — Discipline — Travail", { italic: true, size: 20, color: COLOR_GRAY }),
    centeredLine("Ministère de l'Éducation Nationale", { bold: true, size: 22, color: COLOR_GRAY }),
    spacer(400),
    centeredImage(logo, 200),
    centeredLine("Document de référence pédagogique", {
      bold: true,
      size: 18,
      color: COLOR_GOLD,
    }),
    centeredLine(`Code : ${id.code}`, { size: 18, color: COLOR_GRAY, italic: true }),
    spacer(300),
    centeredLine(id.intitule.split(" — ")[0], { bold: true, size: 56, color: COLOR_GREEN }),
    ...(id.intitule.includes(" — ")
      ? [centeredLine(id.intitule.split(" — ").slice(1).join(" — "), { italic: true, size: 28, color: COLOR_GREEN })]
      : []),
    spacer(300),
    centeredLine("Manuel académique de formation", { bold: true, size: 26, color: COLOR_GRAY }),
    centeredLine("Support complet du formateur et de l'apprenant", { italic: true, size: 22, color: COLOR_GRAY }),
    spacer(500),
    centeredLine("EduWeb Planner", { bold: true, size: 28, color: COLOR_GREEN }),
    centeredLine("Plateforme de pilotage scolaire — https://planning.eduweb.ci", {
      italic: true,
      size: 20,
      color: COLOR_GRAY,
    }),
    spacer(200),
    centeredLine(`Version ${id.version} · Validité ${id.dateValidite}`, {
      size: 18,
      color: COLOR_GRAY,
      bold: true,
    }),
    centeredLine(`Langue : ${id.langue ?? "Français"}`, { italic: true, size: 18, color: COLOR_GRAY }),
  ];

  // -------- COLOPHON --------
  const colophonChildren = [
    pageBreak(),
    heading1("Mentions légales et copyright"),
    bodyText(`Titre : ${id.intitule}`),
    bodyText(`Code de référence : ${id.code}`),
    bodyText(`Version : ${id.version}`),
    bodyText(`Date de validité : ${id.dateValidite}`),
    bodyText(`Langue : ${id.langue ?? "Français"}`),
    bodyText(`Public visé : ${id.publicVise ?? "—"}`),
    spacer(160),
    heading4("Propriété intellectuelle"),
    bodyText(
      `© ${new Date().getFullYear()} EduWeb Planner. Tous droits réservés. La reproduction de ce document, en tout ou en partie, à des fins commerciales est interdite sans autorisation écrite préalable. Une utilisation à des fins de formation institutionnelle non lucrative est autorisée sous réserve de citer la source.`,
    ),
    heading4("Confidentialité et données personnelles"),
    bodyText(
      "Les exemples et copies d'écran présentés dans ce manuel utilisent des données fictives. Les utilisateurs sont tenus, dans leur pratique professionnelle, de respecter la confidentialité des données scolaires et personnelles conformément aux dispositions légales en vigueur.",
    ),
    heading4("Citation recommandée"),
    bodyText(
      `EduWeb Planner. (${new Date().getFullYear()}). ${id.intitule}. Référence ${id.code}, version ${id.version}.`,
      { italic: true },
    ),
  ];

  // -------- FOREWORD --------
  const forewordChildren = [
    pageBreak(),
    heading1("Avant-propos"),
    ...multiParagraph(TRAINING_SYLLABUS.preambule),
    spacer(120),
    new Paragraph({
      spacing: { before: 80, after: 80 },
      border: { left: { color: COLOR_GOLD, space: 8, style: "single", size: 18 } },
      indent: { left: 300 },
      children: [
        new TextRun({
          text:
            "Ce manuel est conçu comme un outil de référence pour le formateur et un support d'autoformation pour l'apprenant. Les modules peuvent être suivis dans leur intégralité ou sélectionnés en fonction du rôle exercé par l'utilisateur.",
          italics: true,
          size: 20,
        }),
      ],
    }),
  ];

  // -------- TOC (auto-updating field) --------
  const tocChildren = [
    pageBreak(),
    heading1("Table des matières"),
    bodyText(
      "La table ci-dessous est générée automatiquement à partir des titres du document. À l'ouverture du fichier dans Microsoft Word, acceptez la mise à jour des champs ; pour la rafraîchir manuellement, sélectionnez le tableau et appuyez sur F9.",
      { italic: true },
    ),
    spacer(160),
    new TableOfContents("Sommaire", {
      hyperlink: true,
      headingStyleRange: "1-4",
      stylesWithLevels: [
        new StyleLevel("Heading1", 1),
        new StyleLevel("Heading2", 2),
        new StyleLevel("Heading3", 3),
        new StyleLevel("Heading4", 4),
      ],
    }) as unknown as Paragraph,
  ];

  // -------- ABBREVIATIONS --------
  const abbrevChildren = [
    pageBreak(),
    heading1("Abréviations et acronymes"),
    bodyText("Liste des sigles, acronymes et abréviations utilisés dans le présent manuel.", { italic: true }),
    spacer(100),
    ...TRAINING_ABBREVIATIONS.flatMap((a) => [
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: a.code, bold: true, color: COLOR_GREEN, size: 22 }),
          new TextRun({ text: " — " + a.meaning, size: 22 }),
        ],
      }),
    ]),
  ];

  // -------- SYLLABUS --------
  const s = TRAINING_SYLLABUS;
  const syllabusChildren = [
    pageBreak(),
    heading1("Syllabus académique de la formation"),
    bodyText("Plan général et cadre académique de la formation.", { italic: true }),

    heading2("1. Identification du cours"),
    syllabusIdentificationTable(),

    heading2("2. Présentation générale"),
    ...multiParagraph(s.presentationGenerale),

    heading2("3. Public et prérequis"),
    bodyText(s.publicEtPrerequis),

    heading2("4. Objectifs généraux"),
    bodyText("À l'issue de la formation, l'apprenant sera capable de :", { italic: true }),
    ...s.objectifsGeneraux.map((o, i) => numberedItem(o, `${i + 1}.`)),

    heading2("5. Compétences visées (référentiel à 4 dimensions)"),
    ...syllabusCompetencesSection("Savoirs", "Connaissances théoriques", s.competencesVisees.savoirs),
    ...syllabusCompetencesSection("Savoir-faire", "Gestes techniques", s.competencesVisees.savoirFaire),
    ...syllabusCompetencesSection("Savoir-être", "Posture professionnelle", s.competencesVisees.savoirEtre),
    ...syllabusCompetencesSection("Savoir-agir", "Décision et arbitrage", s.competencesVisees.savoirAgir),

    heading2("6. Méthodologie pédagogique"),
    syllabusMethodologyTable(),

    heading2("7. Volume horaire et progression"),
    bodyText(`Durée totale indicative : ${s.volumeHoraire.dureeTotal}`),
    syllabusVolumeTable(),
    bodyText(`Séquencement recommandé : ${s.volumeHoraire.sequencementRecommande}`, { italic: true }),

    heading2("8. Modalités d'évaluation"),
    syllabusEvalParagraph("Diagnostique", s.modalitesEvaluation.diagnostique),
    syllabusEvalParagraph("Formative", s.modalitesEvaluation.formative),
    syllabusEvalParagraph("Certificative", s.modalitesEvaluation.certificative),
    syllabusEvalParagraph("Pondération", s.modalitesEvaluation.ponderation),

    heading2("9. Critères de validation"),
    ...s.criteresValidation.map((c) => bulletItem(c)),

    heading2("10. Ressources et bibliographie"),
    ...s.ressourcesBibliographie.map((r, i) =>
      new Paragraph({
        spacing: { after: 80 },
        indent: { left: 360, hanging: 360 },
        children: [
          new TextRun({ text: `[${i + 1}] `, bold: true, size: 22, color: COLOR_GREEN }),
          new TextRun({ text: r.auteur, bold: true, size: 22 }),
          new TextRun({
            text: `. ${r.titre}${r.editeur ? ", " + r.editeur : ""}${r.annee ? " (" + r.annee + ")" : ""}. `,
            size: 22,
          }),
          new TextRun({ text: r.type, italics: true, size: 22, color: COLOR_GRAY }),
          ...(r.url
            ? [new TextRun({ text: "\n" + r.url, size: 18, color: COLOR_GRAY, italics: true })]
            : []),
        ],
      }),
    ),

    heading2("11. Charte de l'apprenant"),
    ...s.charteApprenant.map((c, i) => numberedItem(c, `${i + 1}.`)),
  ];

  // -------- MODULES --------
  const moduleChildren: Paragraph[] = [];
  order.forEach((roleKey) => {
    const guide = GUIDES[roleKey];
    const ass = TRAINING_ASSESSMENTS[roleKey];
    if (!guide || !ass) return;

    moduleChildren.push(pageBreak());
    moduleChildren.push(
      heading1(`${ass.moduleCode} — ${guide.roleLabel}`),
      bodyText(`Niveau : ${guide.meta.level} · Durée : ${guide.meta.duration}`, { italic: true }),
      bodyText(guide.meta.targetAudience),
      ...(guide.meta.context ? [bodyText(`Contexte d'utilisation — ${guide.meta.context}`, { italic: true })] : []),

      heading3("Objectifs pédagogiques"),
      ...guide.objectives.map((o, i) => numberedItem(o, `${i + 1}.`)),

      heading3("Prérequis"),
      ...guide.prerequisites.map((p) => bulletItem(p)),

      heading3("Plan du module"),
      ...guide.chapters.map((c, i) =>
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `§ ${i + 1}. `, bold: true, color: COLOR_GREEN, size: 22 }),
            new TextRun({ text: c.title.replace(/^\d+\.\s*/, ""), size: 22 }),
          ],
        }),
      ),
    );

    // Syllabus & volume horaire (répartition horaire par chapitre)
    {
      const syl = buildModuleSyllabus(guide.chapters, guide.meta.duration);
      moduleChildren.push(
        heading2(`Syllabus & volume horaire (${ass.moduleCode})`),
        bodyText(
          `Volume horaire indicatif d'étude : ${guide.meta.duration} · Niveau : ${guide.meta.level}. Répartition par chapitre (hors évaluation) :`,
          { italic: true },
        ),
        ...syl.rows.map(
          (r) =>
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({ text: `§ ${r.index}. `, bold: true, color: COLOR_GREEN, size: 22 }),
                new TextRun({ text: `${r.title} — `, size: 22 }),
                new TextRun({ text: formatMinutes(r.minutes), bold: true, size: 22, color: COLOR_GREEN }),
              ],
            }),
        ),
        bodyText(
          `Volume horaire total (étude) : ${syl.totalLabel}. Évaluation (pré-test, QCM, exercice, synthèse formative) en sus.`,
          { italic: true },
        ),
      );
    }

    // Chapitres
    guide.chapters.forEach((c) => {
      moduleChildren.push(heading2(c.title));
      if (c.intro) moduleChildren.push(bodyText(c.intro, { italic: true }));
      c.sections.forEach((sec) => {
        moduleChildren.push(heading3(sec.title));
        moduleChildren.push(...multiParagraph(sec.body));
        if (sec.steps && sec.steps.length > 0) {
          sec.steps.forEach((st, i) => {
            moduleChildren.push(numberedItem(st.instruction, `${i + 1}.`));
            if (st.navigation) {
              moduleChildren.push(
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
            if (st.tip) moduleChildren.push(calloutParagraph("Astuce", st.tip, "tip"));
            if (st.warning) moduleChildren.push(calloutParagraph("Attention", st.warning, "warning"));
          });
        }
        if (sec.bestPractices && sec.bestPractices.length > 0) {
          moduleChildren.push(
            new Paragraph({
              spacing: { before: 100, after: 60 },
              children: [
                new TextRun({ text: "Bonnes pratiques", bold: true, color: COLOR_GREEN, size: 22 }),
              ],
            }),
          );
          sec.bestPractices.forEach((bp) => moduleChildren.push(bulletItem(bp)));
        }
        if (sec.caveat) moduleChildren.push(calloutParagraph("Mise en garde", sec.caveat, "warning"));
      });
    });

    // Auto-évaluation : pré-test
    moduleChildren.push(heading2(`Évaluation diagnostique (${ass.moduleCode})`));
    bodyText("Répondez librement, sans préparation, pour mesurer votre point d'entrée.", { italic: true });
    ass.preTest.forEach((q, i) =>
      moduleChildren.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: `Q${i + 1}. `, bold: true, color: COLOR_GREEN, size: 22 }),
            new TextRun({ text: q.question, size: 22 }),
          ],
        }),
        bodyText("__________________________________________________________________________"),
      ),
    );

    // QCM
    moduleChildren.push(heading2(`QCM d'auto-évaluation (${ass.moduleCode})`));
    bodyText(
      "Pour chaque question, cochez la réponse qui vous paraît correcte. Une seule bonne réponse par question. Le corrigé figure à la suite de chaque question.",
      { italic: true },
    );
    ass.qcm.forEach((q, qi) => {
      moduleChildren.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({ text: `Q${qi + 1}. `, bold: true, color: COLOR_GREEN, size: 22 }),
            new TextRun({ text: q.question, size: 22 }),
          ],
        }),
      );
      q.choix.forEach((c, ci) =>
        moduleChildren.push(
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 480 },
            children: [
              new TextRun({ text: `☐ ${String.fromCharCode(65 + ci)}. `, bold: true, size: 22 }),
              new TextRun({ text: c, size: 22 }),
            ],
          }),
        ),
      );
      moduleChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 120 },
          indent: { left: 300 },
          border: { left: { color: COLOR_GREEN, space: 8, style: "single", size: 18 } },
          children: [
            new TextRun({ text: "Corrigé · ", bold: true, color: COLOR_GREEN, size: 20 }),
            new TextRun({
              text: `Réponse ${String.fromCharCode(65 + q.bonneReponseIndex)}. `,
              bold: true,
              size: 20,
            }),
            new TextRun({ text: q.explication, size: 20, italics: true }),
          ],
        }),
      );
    });

    // Exercice
    moduleChildren.push(heading2(`Exercice pratique : ${ass.exercice.titre}`));
    moduleChildren.push(bodyText(ass.exercice.introduction, { italic: true }));
    ass.exercice.scenarios.forEach((sc, sci) => {
      moduleChildren.push(heading3(`Scénario ${sci + 1} — ${sc.niveau}`));
      moduleChildren.push(bodyText(sc.contexte));
      moduleChildren.push(heading4("Consignes"));
      sc.consignes.forEach((co, i) => moduleChildren.push(numberedItem(co, `${i + 1}.`)));
      moduleChildren.push(heading4("Critères d'évaluation"));
      sc.criteresEvaluation.forEach((cr) => moduleChildren.push(bulletItem(cr)));
    });

    // Synthèse formative
    moduleChildren.push(heading2(`Synthèse formative (${ass.moduleCode})`));
    bodyText(
      "Questions ouvertes de réflexion à compléter en fin de module. Vos réponses seront discutées avec le formateur ou utilisées pour votre journal de bord professionnel.",
      { italic: true },
    );
    ass.syntheseFormative.forEach((q, i) =>
      moduleChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 80 },
          children: [
            new TextRun({ text: `Q${i + 1}. `, bold: true, color: COLOR_GREEN, size: 22 }),
            new TextRun({ text: q.question, size: 22 }),
          ],
        }),
        bodyText("__________________________________________________________________________"),
        bodyText("__________________________________________________________________________"),
      ),
    );
  });

  // -------- PAGE DE SIGNATURES --------
  const signatureChildren = buildSignaturesSection();

  // -------- CERTIFICAT (modèle joint au manuel) --------
  const certificateChildren = buildEmbeddedCertificateSection();

  // -------- ANNEXES --------
  const annexChildren = [
    pageBreak(),
    heading1("Annexe A — Grille de progression"),
    bodyText(
      "Référentiel à six paliers pour situer la maîtrise de l'apprenant et orienter l'accompagnement formatif.",
      { italic: true },
    ),
    spacer(120),
    ...TRAINING_PROGRESSION.grilleProgression.flatMap((g) => [
      new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [
          new TextRun({ text: `Palier ${g.palier} — `, bold: true, color: COLOR_GREEN, size: 24 }),
          new TextRun({ text: g.niveau, bold: true, size: 24 }),
        ],
      }),
      bodyText(g.descripteur),
    ]),

    pageBreak(),
    heading1("Annexe B — Glossaire général"),
    bodyText(
      "Définitions des termes employés dans l'ensemble du manuel, classés par ordre alphabétique.",
      { italic: true },
    ),
    spacer(120),
    ...[...TRAINING_PROGRESSION.indexGeneral]
      .sort((a, b) => a.terme.localeCompare(b.terme, "fr"))
      .map((e) =>
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360, hanging: 360 },
          children: [
            new TextRun({ text: e.terme, bold: true, color: COLOR_GREEN, size: 22 }),
            new TextRun({
              text: ` (${e.references.join(", ")}) — `,
              italics: true,
              size: 20,
              color: COLOR_GRAY,
            }),
            new TextRun({ text: e.definition, size: 22 }),
          ],
        }),
      ),
    pageBreak(),
    heading1("Fin du manuel"),
    centeredLine(id.intitule, { italic: true, size: 22, color: COLOR_GRAY }),
    centeredLine(`Référence ${id.code} · Version ${id.version}`, { size: 18, color: COLOR_GRAY }),
    spacer(400),
    centeredLine(
      "« Toute formation soutenue par un outil numérique reste, avant tout, une rencontre humaine entre enseignants, apprenants et pratiques professionnelles. »",
      { italic: true, size: 20, color: COLOR_GRAY },
    ),
  ];

  // -------- DOCUMENT ASSEMBLY --------
  const doc = new Document({
    creator: "EduWeb Planner",
    title: id.intitule,
    description: `${id.intituleAbrege ?? id.intitule} — ${id.code}`,
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
            watermark: "EduWeb Planner · Document de formation — usage interne",
          }),
        },
        footers: {
          default: buildFooter({ reference: `${id.code} · ${id.version}` }),
        },
        children: [
          ...coverChildren,
          ...colophonChildren,
          ...forewordChildren,
          ...tocChildren,
          ...abbrevChildren,
          ...syllabusChildren,
          ...moduleChildren,
          ...annexChildren,
          ...signatureChildren,
          ...certificateChildren,
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

/* ---------------------------------------------------------------------- */
/*  Helpers locaux (tableaux du syllabus)                                   */
/* ---------------------------------------------------------------------- */

function syllabusIdentificationTable() {
  const id = TRAINING_SYLLABUS.identification;
  const rows = [
    ["Code", id.code],
    ["Intitulé", id.intitule],
    ...(id.intituleAbrege ? [["Intitulé abrégé", id.intituleAbrege]] : []),
    ["Version", id.version],
    ["Date de validité", id.dateValidite],
    ["Langue d'enseignement", id.langue ?? "Français"],
    ["Public visé", id.publicVise ?? "—"],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: rows.map(
      ([k, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: k, bold: true, color: COLOR_GREEN, size: 20 })],
                }),
              ],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: v, size: 20 })] })],
            }),
          ],
        }),
    ),
  });
}

function syllabusCompetencesSection(title: string, subtitle: string, items: string[]): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({ text: title, bold: true, color: COLOR_GREEN, size: 24 }),
        new TextRun({ text: ` — ${subtitle}`, italics: true, size: 22, color: COLOR_GRAY }),
      ],
    }),
    ...items.map((it) => bulletItem(it)),
  ];
}

function syllabusMethodologyTable() {
  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        cellHeader("Méthode"),
        cellHeader("Description"),
        cellHeader("Proportion"),
      ],
    }),
  ];
  TRAINING_SYLLABUS.methodologiePedagogique.forEach((m) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: m.methode, bold: true, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: m.description, size: 20 })] })],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: m.proportion, bold: true, size: 20 })],
              }),
            ],
          }),
        ],
      }),
    );
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

function syllabusVolumeTable() {
  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [cellHeader("Code"), cellHeader("Module"), cellHeader("Durée")],
    }),
  ];
  TRAINING_SYLLABUS.volumeHoraire.repartitionParModule.forEach((m) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: m.moduleCode, bold: true, color: COLOR_GREEN, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: m.titre, size: 20 })] })],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: m.duree, size: 20 })],
              }),
            ],
          }),
        ],
      }),
    );
  });
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function cellHeader(text: string): TableCell {
  return new TableCell({
    shading: { fill: "EEEEEE", type: "clear", color: "auto" },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20, color: COLOR_GREEN })],
      }),
    ],
  });
}

/* ---------------------------------------------------------------------- */
/*  Page de signatures (jointe au manuel)                                   */
/* ---------------------------------------------------------------------- */
function buildSignaturesSection(): Paragraph[] {
  const signatureBlock = (title: string, subtitle: string, fields: string[], withStamp: boolean) => {
    const out: Paragraph[] = [];
    out.push(
      new Paragraph({
        spacing: { before: 240, after: 80 },
        children: [
          new TextRun({ text: title, bold: true, color: COLOR_GREEN, size: 24 }),
          new TextRun({ text: ` — ${subtitle}`, italics: true, size: 20, color: COLOR_GRAY }),
        ],
      }),
    );
    fields.forEach((f) => {
      out.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: f + " : ", bold: true, size: 20 }),
            new TextRun({ text: "______________________________________________________", size: 20 }),
          ],
        }),
      );
    });
    out.push(
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({ text: `Signature${withStamp ? " et cachet" : ""} : `, bold: true, size: 20 }),
          new TextRun({ text: "_______________________________________________", size: 20 }),
        ],
      }),
    );
    return out;
  };

  return [
    pageBreak(),
    heading1("Page de signatures"),
    bodyText(
      "À renseigner par le formateur, l'apprenant et son autorité hiérarchique pour attester de la bonne conduite de la formation.",
      { italic: true },
    ),
    ...signatureBlock(
      "Formateur",
      "Atteste de la conduite intégrale de la formation",
      ["Nom et prénoms", "Fonction / Institution", "Date"],
      true,
    ),
    ...signatureBlock(
      "Apprenant(e)",
      "Confirme avoir suivi le présent support de formation",
      ["Nom et prénoms", "Rôle / Établissement", "Date"],
      false,
    ),
    ...signatureBlock(
      "Visa de la hiérarchie",
      "Direction d'établissement, DRENA, CAFOP ou APFC selon le cas",
      ["Nom et prénoms du visa", "Fonction", "Date"],
      true,
    ),
    bodyText(
      "Ce feuillet est conservé dans le dossier de formation de l'apprenant et, le cas échéant, joint au registre de l'institution organisatrice (DRENA, CAFOP, APFC). Une copie est remise à l'intéressé(e).",
      { italic: true },
    ),
  ];
}

/* ---------------------------------------------------------------------- */
/*  Modèle de certificat joint au manuel (page non remplissable)            */
/* ---------------------------------------------------------------------- */
function buildEmbeddedCertificateSection(): Paragraph[] {
  const id = TRAINING_SYLLABUS.identification;
  return [
    pageBreak(),
    heading1("Modèle de certificat de fin de formation"),
    bodyText(
      "Le présent modèle peut être détaché ou reproduit pour délivrance officielle. Une version personnalisable (.docx) est également disponible depuis le menu Aide & Formation → Certificat.",
      { italic: true },
    ),
    spacer(160),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [new TextRun({ text: "République de Côte d'Ivoire", bold: true, size: 22, color: COLOR_GRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Union — Discipline — Travail", italics: true, size: 20, color: COLOR_GRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: "Ministère de l'Éducation Nationale", bold: true, size: 22, color: COLOR_GRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "CERTIFICAT DE FIN DE FORMATION",
          bold: true,
          size: 36,
          color: COLOR_GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Il est certifié que", italics: true, size: 22, color: COLOR_GRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      border: { bottom: { color: COLOR_GREEN, space: 12, style: "single", size: 18 } },
      children: [
        new TextRun({
          text: "…………………………………………………………………",
          bold: true,
          size: 44,
          color: COLOR_GREEN,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "Rôle / fonction de l'apprenant(e)", italics: true, size: 20, color: COLOR_GRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 240 },
      indent: { left: 600, right: 600 },
      children: [
        new TextRun({
          text: "a suivi avec succès le support de formation académique ",
          size: 22,
        }),
        new TextRun({ text: `« ${id.intitule} »`, bold: true, size: 22 }),
        new TextRun({
          text: ` (référence ${id.code}, version ${id.version}) d'une durée totale indicative de ${TRAINING_SYLLABUS.volumeHoraire.dureeTotal}, mobilisant les huit modules de formation aux rôles utilisateurs de la plateforme EduWeb Planner, et a satisfait aux modalités d'évaluation requises pour la délivrance du présent certificat.`,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({ text: "N° du certificat : _______________      Délivré le : ____ / ____ / _______      Validité : ", size: 20, bold: true, color: COLOR_GREEN }),
        new TextRun({ text: id.dateValidite, size: 20, bold: true, color: COLOR_GREEN }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Le formateur", italics: true, size: 20, color: COLOR_GRAY }),
        new TextRun({ text: "                                                  ", size: 20 }),
        new TextRun({ text: "L'autorité hiérarchique", italics: true, size: 20, color: COLOR_GRAY }),
      ],
    }),
    spacer(280),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "_________________________            _________________________", size: 20 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "Nom, signature, date            DRENA / CAFOP / APFC (cachet et signature)",
          italics: true,
          size: 18,
          color: COLOR_GRAY,
        }),
      ],
    }),
    spacer(240),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Document à conserver — toute reproduction frauduleuse est sanctionnée par la loi.",
          italics: true,
          size: 16,
          color: COLOR_GRAY,
        }),
      ],
    }),
  ];
}

function syllabusEvalParagraph(label: string, text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 100, after: 80 },
    indent: { left: 240 },
    border: { left: { color: COLOR_GREEN, space: 8, style: "single", size: 18 } },
    children: [
      new TextRun({ text: `${label} · `, bold: true, color: COLOR_GREEN, size: 22 }),
      new TextRun({ text, size: 22 }),
    ],
  });
}
