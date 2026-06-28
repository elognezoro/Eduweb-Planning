import type {
  GuideContent,
  GuideSection,
} from "@/components/guides/guide-layout";
import { sortedCourses } from "@/lib/formations/catalog";
import {
  FORMATION_ROLES,
  FORMATION_ROLE_META,
} from "@/lib/formations/formation-roles";
import {
  SUPPORT_KINDS,
  SUPPORT_KIND_LABEL,
} from "@/lib/formations/support-access";
import { COUNTRIES } from "@/config/countries";

/* ============================================================================
   Faits DÉRIVÉS pour les guides utilisateurs.

   Objectif : garder les guides (et leurs exports DOCX) automatiquement à jour
   quand le SYSTÈME change. Les listes qui évoluent — formations au catalogue,
   rôles de formation, supports — ne sont PAS recopiées en dur : elles sont
   calculées ici, à partir de la source unique, puis injectées au moment du
   rendu via `prepareGuide()`.

   Conséquence : ajouter une formation au catalogue, modifier un rôle ou un
   type de support met instantanément à jour TOUS les guides (web + Word),
   sans intervention manuelle.
   ========================================================================== */

type StoredGuide = Omit<GuideContent, "icon">;

/** Formations de type séminaire actuellement au catalogue. */
export function seminaireFormations(): { title: string; shortTitle: string }[] {
  return sortedCourses()
    .filter((c) => c.type === "seminaire")
    .map((c) => ({ title: c.title, shortTitle: c.shortTitle }));
}

/** Liste « courte » des séminaires, séparés par des virgules. */
export function seminaireFormationsInline(): string {
  return seminaireFormations()
    .map((f) => f.shortTitle)
    .join(", ");
}

/** Rôles de formation et leur description courte. */
export function formationRolesInline(): string {
  return FORMATION_ROLES.map((r) => FORMATION_ROLE_META[r].label).join(" > ");
}

/** Supports téléchargeables gérés. */
export function supportKindsInline(): string {
  return SUPPORT_KINDS.map((k) => SUPPORT_KIND_LABEL[k]).join(", ");
}

/** Pays opérationnels (multi-pays) de la plateforme. */
export function activeCountries(): string[] {
  return COUNTRIES.filter((c) => c.isActive).map((c) => c.nameFr);
}
export function activeCountriesInline(): string {
  return activeCountries().join(", ");
}

/* -------------------------------------------------------------------------- */
/*  Jetons {{...}} résolus dans le texte des guides                            */
/* -------------------------------------------------------------------------- */
const TOKEN_RESOLVERS: Record<string, () => string> = {
  FORMATIONS_COUNT: () => String(seminaireFormations().length),
  FORMATIONS_LIST: () => seminaireFormationsInline(),
  FORMATION_ROLES: () => formationRolesInline(),
  SUPPORTS_LIST: () => supportKindsInline(),
  COUNTRIES_COUNT: () => String(activeCountries().length),
  COUNTRIES_LIST: () => activeCountriesInline(),
};

/** Remplace les jetons {{NOM}} d'une chaîne par leur valeur dérivée. */
export function resolveGuideTokens(text: string): string {
  return text.replace(/\{\{\s*([A-Z_]+)\s*\}\}/g, (m, name: string) => {
    const resolver = TOKEN_RESOLVERS[name];
    return resolver ? resolver() : m;
  });
}

/* -------------------------------------------------------------------------- */
/*  Bloc « catalogue à jour » injecté automatiquement                          */
/* -------------------------------------------------------------------------- */
function buildCatalogueSection(): GuideSection {
  const formations = seminaireFormations();
  const roles = FORMATION_ROLES.map(
    (r) =>
      `• ${FORMATION_ROLE_META[r].label} — ${FORMATION_ROLE_META[r].description}`,
  );
  const body = [
    "Cette section est générée automatiquement à partir du catalogue de la plateforme : elle reflète toujours les formations, les rôles et les supports actuellement disponibles, sans mise à jour manuelle.",
    `Séminaires actuellement disponibles (${formations.length}) :`,
    ...formations.map((f) => `• ${f.title}`),
    "Rôles de formation (du plus au moins étendu) :",
    ...roles,
    `Supports téléchargeables : ${supportKindsInline()}. L'accès à chaque support peut être conditionné par l'administrateur (toujours accessible, après la réussite de la formation, réservé à certains rôles, ou à partir d'une date) depuis Système → Inscriptions aux formations → onglet « Supports téléchargeables ».`,
  ].join("\n\n");

  return {
    title: "Catalogue à jour (généré automatiquement)",
    body,
  };
}

/** Bloc « plateforme à jour » : capacités transversales (multi-pays, profil…). */
function buildPlatformSection(): GuideSection {
  const countries = activeCountries();
  const body = [
    "Cette section est générée automatiquement : elle reflète les pays et les capacités transversales actuellement disponibles sur la plateforme.",
    `EduWeb Planner est multi-pays (${countries.length}) : ${countries.join(", ")}. Choisissez votre pays via le sélecteur en haut de l'écran — un champ de recherche permet de le retrouver par nom ou par code.`,
    "Votre pays est détecté automatiquement à l'inscription et reste modifiable à tout moment dans Système → Mon profil (l'administrateur peut aussi le corriger depuis Comptes utilisateurs).",
    "Établissements : chaque pays possède son propre référentiel d'établissements et ses régions académiques (DRENA, wilaya, DRE, département…). La liste « Rattacher à un établissement » ne propose que les établissements du pays concerné.",
    "Test de niveau CERTEL : un diagnostic gratuit de maturité numérique est accessible depuis la page d'accueil (bouton « Test de niveau »).",
  ].join("\n\n");
  return {
    title: "Plateforme : multi-pays & profil (à jour)",
    body,
  };
}

/* -------------------------------------------------------------------------- */
/*  Préparation d'un guide avant rendu (web ET Word)                           */
/* -------------------------------------------------------------------------- */

/** Résout récursivement les jetons d'une section. */
function prepareSection(section: GuideSection): GuideSection {
  return {
    ...section,
    title: resolveGuideTokens(section.title),
    body: resolveGuideTokens(section.body),
    steps: section.steps?.map((s) => ({
      ...s,
      instruction: resolveGuideTokens(s.instruction),
      navigation: s.navigation
        ? resolveGuideTokens(s.navigation)
        : s.navigation,
      tip: s.tip ? resolveGuideTokens(s.tip) : s.tip,
      warning: s.warning ? resolveGuideTokens(s.warning) : s.warning,
    })),
    bestPractices: section.bestPractices?.map(resolveGuideTokens),
    caveat: section.caveat
      ? resolveGuideTokens(section.caveat)
      : section.caveat,
  };
}

/**
 * Prépare un guide pour le rendu : résout les jetons {{...}} dans tout le
 * texte ET injecte le bloc « catalogue à jour » à la fin du chapitre
 * « Centre de formation » (id `centre-formation`) s'il existe.
 *
 * Appelé par le rendu web ET par l'export Word, pour que les deux restent
 * automatiquement synchronisés avec le système.
 */
export function prepareGuide(guide: StoredGuide): StoredGuide {
  const dynamicSection = buildCatalogueSection();
  return {
    ...guide,
    objectives: guide.objectives.map(resolveGuideTokens),
    prerequisites: guide.prerequisites.map(resolveGuideTokens),
    chapters: guide.chapters.map((chapter) => {
      const sections = chapter.sections.map(prepareSection);
      if (chapter.id === "centre-formation") {
        sections.push(dynamicSection);
        sections.push(buildPlatformSection());
      }
      return {
        ...chapter,
        intro: chapter.intro
          ? resolveGuideTokens(chapter.intro)
          : chapter.intro,
        sections,
      };
    }),
    faq: guide.faq.map((q) => ({
      question: resolveGuideTokens(q.question),
      answer: resolveGuideTokens(q.answer),
    })),
    glossary: guide.glossary.map((g) => ({
      term: g.term,
      definition: resolveGuideTokens(g.definition),
    })),
  };
}
