import { getCourse } from "./catalog";
import type { Course, CourseCohort, CourseEnrollment } from "./types";
import type { UserRole } from "@/lib/roles";

/**
 * Fonctions utilitaires d'inscription aux formations.
 * Indépendantes du store : prennent les listes en entrée et renvoient des
 * dérivées (inscrit ?, source, expiration ?). Réutilisables côté UI, côté
 * gardes, et côté tests.
 */

/** Une inscription est-elle expirée ? */
export function isExpired(e: { expiresAt?: string | null }, now = new Date()): boolean {
  if (!e.expiresAt) return false;
  return new Date(e.expiresAt).getTime() < now.getTime();
}

/**
 * Clé de compartiment d'unicité d'une inscription : (utilisateur, cours, année
 * scolaire). Une année scolaire absente/nulle est normalisée en « » — alignée
 * sur la contrainte serveur `unique(user_id, course_id, school_year)` (024).
 * Deux années réelles différentes = deux compartiments → réinscription légitime.
 */
export function enrollmentBucketKey(
  e: Pick<CourseEnrollment, "userId" | "courseId" | "schoolYear">,
): string {
  return `${e.userId}|${e.courseId}|${e.schoolYear ?? ""}`;
}

/** Instant (ms epoch) d'une inscription ; +Infinity si date absente/illisible. */
function enrollmentInstant(e: CourseEnrollment): number {
  const t = Date.parse(e.enrolledAt || "");
  return Number.isNaN(t) ? Infinity : t;
}

/**
 * Vrai si `a` doit l'emporter sur `b` comme inscription la plus ANCIENNE de leur
 * compartiment (règle métier : on privilégie l'inscription effectuée
 * antérieurement, on supprime les plus récentes). Compare `enrolledAt` par
 * INSTANT réel (`Date.parse`), pas par chaîne : le client écrit « …Z » alors
 * que Postgres/PostgREST sérialise « +00:00 » (parfois avec fraction de
 * seconde) — une comparaison lexicographique trierait alors à tort. Une date
 * absente/illisible vaut +Infinity (donc perdante : une ligne sans date ne
 * supplante jamais une ligne datée plus ancienne). Égalité d'instant tranchée
 * par `id`, pour un résultat déterministe et indépendant de l'ordre du tableau.
 */
export function isEarlierEnrollment(a: CourseEnrollment, b: CourseEnrollment): boolean {
  const at = enrollmentInstant(a);
  const bt = enrollmentInstant(b);
  if (at !== bt) return at < bt;
  return (a.id ?? "") < (b.id ?? "");
}

/**
 * Réduit une liste d'inscriptions à UNE par compartiment (utilisateur, cours,
 * année), en conservant la plus ANCIENNE (cf. {@link isEarlierEnrollment}).
 * L'ordre de sortie suit la première apparition de chaque compartiment dans
 * l'entrée, ce qui préserve l'ordre d'affichage existant.
 */
export function keepEarliestPerBucket(rows: CourseEnrollment[]): CourseEnrollment[] {
  const best = new Map<string, CourseEnrollment>();
  const order: string[] = [];
  for (const e of rows) {
    const k = enrollmentBucketKey(e);
    const cur = best.get(k);
    if (!cur) {
      best.set(k, e);
      order.push(k);
    } else if (isEarlierEnrollment(e, cur)) {
      best.set(k, e);
    }
  }
  return order.map((k) => best.get(k)!);
}

/** Décrit l'origine effective de l'accès d'un utilisateur à un cours. */
export interface EnrollmentVerdict {
  enrolled: boolean;
  source?: "individual" | "cohort" | "role-auto";
  cohortId?: string | null;
  enrollment?: CourseEnrollment;
  expiresAt?: string | null;
}

/**
 * Calcule si un utilisateur est inscrit à un cours donné, et par quelle voie.
 * Combine :
 *  - inscription auto par rôle (course.autoEnrollRoles)
 *  - inscription nominative dans `enrollments`
 *  - appartenance à une cohorte inscrite au cours
 */
export function getEnrollmentVerdict(
  userId: string,
  userRole: UserRole | null | undefined,
  courseId: string,
  enrollments: CourseEnrollment[],
  cohorts: CourseCohort[],
): EnrollmentVerdict {
  const course = getCourse(courseId);
  if (!course) return { enrolled: false };

  // 1) Inscription automatique par rôle
  if (
    userRole &&
    course.enrollmentMethods.includes("role-auto") &&
    course.autoEnrollRoles?.includes(userRole)
  ) {
    return { enrolled: true, source: "role-auto" };
  }

  // 2) Inscription nominative non expirée. En cas de doublons (même cours, p.
  // ex. une ligne locale + une ligne serveur, ou plusieurs années), on retient
  // la PLUS ANCIENNE — cohérent avec la règle de dédoublonnage du store. L'accès
  // n'est PAS restreint par année : toute inscription non expirée donne accès.
  const direct = enrollments
    .filter((e) => e.userId === userId && e.courseId === courseId && !isExpired(e))
    .reduce<CourseEnrollment | undefined>(
      (best, e) => (best && !isEarlierEnrollment(e, best) ? best : e),
      undefined,
    );
  if (direct) {
    return {
      enrolled: true,
      source: direct.cohortId ? "cohort" : "individual",
      cohortId: direct.cohortId ?? null,
      enrollment: direct,
      expiresAt: direct.expiresAt ?? null,
    };
  }

  // 3) Appartenance à une cohorte du cours
  const cohort = cohorts.find(
    (c) => c.courseId === courseId && c.memberUserIds.includes(userId),
  );
  if (cohort) {
    return { enrolled: true, source: "cohort", cohortId: cohort.id };
  }

  return { enrolled: false };
}

/** Raccourci booléen pour les gardes. */
export function isEnrolledIn(
  userId: string,
  userRole: UserRole | null | undefined,
  courseId: string,
  enrollments: CourseEnrollment[],
  cohorts: CourseCohort[],
): boolean {
  return getEnrollmentVerdict(userId, userRole, courseId, enrollments, cohorts)
    .enrolled;
}

/** Liste tous les cours auxquels l'utilisateur est inscrit. */
export function coursesEnrolledIn(
  userId: string,
  userRole: UserRole | null | undefined,
  catalog: Course[],
  enrollments: CourseEnrollment[],
  cohorts: CourseCohort[],
): { course: Course; verdict: EnrollmentVerdict }[] {
  return catalog
    .map((course) => ({
      course,
      verdict: getEnrollmentVerdict(
        userId,
        userRole,
        course.id,
        enrollments,
        cohorts,
      ),
    }))
    .filter((c) => c.verdict.enrolled);
}

/** Compte le nombre d'utilisateurs inscrits à un cours (toutes sources). */
export function countEnrolledUsers(
  courseId: string,
  allUsers: { id: string; role: UserRole }[],
  enrollments: CourseEnrollment[],
  cohorts: CourseCohort[],
): number {
  return allUsers.filter((u) =>
    isEnrolledIn(u.id, u.role, courseId, enrollments, cohorts),
  ).length;
}

/** Libellé FR pour la source d'inscription. */
export function enrollmentSourceLabel(
  source: EnrollmentVerdict["source"],
): string {
  switch (source) {
    case "individual":
      return "Inscription nominative";
    case "cohort":
      return "Inscription par cohorte";
    case "role-auto":
      return "Inscription automatique par rôle";
    default:
      return "—";
  }
}

/** Libellé FR pour le type de cours. */
export function courseTypeLabel(type: Course["type"]): string {
  switch (type) {
    case "seminaire":
      return "Séminaire";
    case "manuel":
      return "Manuel académique";
    case "guides":
      return "Guides utilisateurs";
  }
}
