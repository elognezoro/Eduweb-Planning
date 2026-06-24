import type { ReportPayload, ReportSection } from "@/lib/exports/types";
import type { EtabExportMeta } from "@/lib/etab-config";
import { EDUWEB_LIST_BRANDING } from "@/lib/formations/enroll-list";
import type {
  CommSeminaire,
  CommSeminaireActivity,
  CommSlide,
  CommSlideBlock,
} from "@/lib/seminaires/communication-pastorale";

/* ============================================================================
   Export PDF du CONTENU d'une formation CommSeminaire (Communication pastorale,
   IA & communication) : textes narratifs (slides), méthodes, et activités/
   évaluations en mode ÉNONCÉ — SANS AUCUN CORRIGÉ.

   Sécurité « zéro fuite » : ce mapper est construit par LISTE BLANCHE. Il ne
   référence JAMAIS les champs de corrigé (qcm.correctIdx / qcm.rationale /
   aiChallenge.problems / aiChallenge.correctedMessage / aiChallenge.whyBetter)
   ni les notes formateur (slide.facilitatorNote). Un champ de corrigé ajouté
   plus tard ne pourra donc pas apparaître par accident.

   Produit un ReportPayload consommé par downloadReportPdf (jsPDF). Le bump de
   police (+2 pt) est appliqué à l'appel via l'option fontBump.
   ========================================================================== */

/** Rend un bloc de slide en lignes de texte (narratif pur, aucun corrigé). */
function renderBlock(b: CommSlideBlock): string[] {
  switch (b.kind) {
    case "paragraph":
      return [b.text];
    case "highlight":
      return [`» ${b.text}`];
    case "bulletList":
      return [...(b.intro ? [b.intro] : []), ...b.items.map((i) => `•  ${i}`)];
    case "numberedList":
      return [...(b.intro ? [b.intro] : []), ...b.items.map((i, k) => `${k + 1}.  ${i}`)];
    case "pillars":
      return b.items.map((p) => `•  ${p.label} — ${p.title} : ${p.description}`);
    case "principles":
      return [
        ...(b.title ? [b.title] : []),
        ...b.items.map((p) => `•  ${p.letter} · ${p.label} : ${p.points.join(" ; ")}`),
      ];
    case "flow":
      return [b.items.join("   →   ")];
    case "channels":
      return b.items.map((c) => `•  ${c.name} : ${c.purpose}`);
    case "publics":
      return b.rows.map((r) => `•  ${r.public} — ${r.verbs.join(", ")} | ${r.columns.join(" · ")}`);
    case "steps":
      return b.items.map((s) => `${s.num}.  ${s.label} — ${s.detail}`);
    default:
      return [];
  }
}

/** Slide → section (titre + sous-titre + blocs). facilitatorNote EXCLU. */
function slideSection(s: CommSlide): ReportSection {
  const paragraphs: string[] = [];
  if (s.subtitle) paragraphs.push(s.subtitle);
  for (const b of s.blocks) paragraphs.push(...renderBlock(b));
  if (s.footer) paragraphs.push(s.footer);
  return { heading: `Diapositive ${s.num} — ${s.title}`, paragraphs };
}

/** Activité → section ÉNONCÉ uniquement. correctIdx/rationale et le corrigé du
 *  défi IA (problems/correctedMessage/whyBetter) ne sont PAS rendus. */
function activitySection(a: CommSeminaireActivity): ReportSection {
  const paragraphs: string[] = [];
  if (a.recommendation) paragraphs.push(`Modalité : ${a.recommendation}`);
  paragraphs.push(...a.instructions);
  if (a.items?.length) {
    paragraphs.push(
      ...a.items.map((it) => `•  ${it.label}${it.helper ? ` — ${it.helper}` : ""}`),
    );
  }
  if (a.tableHeaders?.length) paragraphs.push(`Grille à compléter : ${a.tableHeaders.join("  |  ")}`);
  if (a.tableRows?.length) paragraphs.push(...a.tableRows.map((r) => `—  ${r}`));
  if (a.qcm?.length) {
    a.qcm.forEach((q, qi) => {
      paragraphs.push(`${qi + 1}.  ${q.question}`);
      q.options.forEach((opt, oi) =>
        paragraphs.push(`     ${String.fromCharCode(97 + oi)})  ${opt}`),
      );
      // correctIdx + rationale VOLONTAIREMENT non rendus (document sans corrigé).
    });
  }
  if (a.aiChallenge) {
    paragraphs.push(`${a.aiChallenge.sourceLabel ?? "Message à améliorer"} :`);
    paragraphs.push(a.aiChallenge.rawMessage);
    // problems / correctedMessage / whyBetter VOLONTAIREMENT non rendus (corrigé).
  }
  if (a.deliverable) paragraphs.push(`Livrable attendu : ${a.deliverable}`);
  return { heading: `Activité ${a.num} — ${a.title}`, paragraphs };
}

/** Construit le ReportPayload (sans corrigé) d'une formation CommSeminaire. */
export function buildSeminarContentPayload(
  seminaire: CommSeminaire,
  meta: EtabExportMeta,
  author: string,
  generatedAt: string,
): ReportPayload {
  const m = seminaire.meta;
  const sections: ReportSection[] = [];

  sections.push({ heading: "Présentation", paragraphs: m.presentation });
  sections.push({
    heading: "Objectifs pédagogiques",
    paragraphs: seminaire.objectives.map((o, i) => `${i + 1}.  ${o}`),
  });
  sections.push({
    heading: "Compétences visées",
    paragraphs: seminaire.competences.map((c) => `•  ${c}`),
  });

  // Contenu narratif (slides).
  seminaire.slides.forEach((s) => sections.push(slideSection(s)));

  // Méthodes optionnelles (formation IA notamment).
  if (seminaire.promptMethod) {
    sections.push({
      heading: "Méthode P.A.S.T.O.R.A.L.",
      paragraphs: seminaire.promptMethod.map((p) => `${p.letter} · ${p.label} : ${p.detail}`),
    });
  }
  if (seminaire.fiveV) {
    sections.push({
      heading: "Les 5 V de validation",
      paragraphs: seminaire.fiveV.map((p) => `${p.letter} · ${p.label} : ${p.detail}`),
    });
  }
  if (seminaire.fourV) {
    sections.push({
      heading: "La règle des 4 V",
      paragraphs: seminaire.fourV.map((p) => `${p.letter} · ${p.label} : ${p.detail}`),
    });
  }
  if (seminaire.rapide) {
    sections.push({
      heading: "Méthode RAPIDE",
      paragraphs: seminaire.rapide.map((p) => `${p.letter} · ${p.label}`),
    });
  }
  if (seminaire.usageCategories) {
    seminaire.usageCategories.forEach((u) =>
      sections.push({ heading: `Usages utiles — ${u.title}`, paragraphs: u.items.map((i) => `•  ${i}`) }),
    );
  }
  if (seminaire.protocol) {
    sections.push({
      heading: "Protocole d'usage responsable",
      paragraphs: seminaire.protocol.map((p) => `${p.num}.  ${p.title} : ${p.items.join(" ; ")}`),
    });
  }
  if (seminaire.promptExamples) {
    sections.push({
      heading: "Exemple de prompt",
      paragraphs: [
        `À éviter : ${seminaire.promptExamples.bad}`,
        `Recommandé : ${seminaire.promptExamples.good}`,
      ],
    });
  }
  if (seminaire.actionPlanTemplate) {
    const ap = seminaire.actionPlanTemplate;
    sections.push({
      heading: "Plan d'action (gabarit)",
      paragraphs: [
        ap.intro,
        `Colonnes : ${ap.columns.join("  |  ")}`,
        ...ap.examples.map((e, i) => `Exemple ${i + 1} : ${e.values.join("  ·  ")}`),
      ],
    });
  }

  // Activités & évaluations — ÉNONCÉS uniquement.
  sections.push({
    heading: "Activités pratiques & évaluations",
    paragraphs: ["Document destiné aux participants — les corrigés n'y figurent pas."],
  });
  seminaire.activities.forEach((a) => sections.push(activitySection(a)));

  if (seminaire.glossary?.length) {
    sections.push({
      heading: "Glossaire",
      paragraphs: seminaire.glossary.map((g) => `•  ${g.term} : ${g.definition}`),
    });
  }
  if (seminaire.references10?.length) {
    sections.push({
      heading: "Références",
      paragraphs: seminaire.references10.map((r) => `${r.num}.  ${r.text}`),
    });
  }

  // Formation PROPRIÉTÉ d'EdTech EduWeb (espace Aide & Formation) : marque EduWeb,
  // PAS de mentions Ministère / République / Côte d'Ivoire (≠ documents scolaires
  // officiels comme bulletins/livret, qui gardent l'identité de l'établissement).
  return {
    title: m.title,
    subtitle: m.subtitle,
    country: meta.countryName,
    period: m.duration,
    author,
    generatedAt,
    schoolYear: meta.schoolYear,
    ...EDUWEB_LIST_BRANDING,
    sections,
  };
}
