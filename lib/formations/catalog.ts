import type { Course } from "./types";

/**
 * Catalogue officiel des formations EduWeb Planner.
 *
 * Chaque entrée est un cours auquel un utilisateur peut être inscrit
 * indépendamment des autres. Les méthodes d'inscription par défaut
 * combinent inscription nominative, cohortes et auto-inscription par
 * rôle pour les guides utilisateurs.
 */

export const COURSE_CATALOG: Course[] = [
  {
    id: "magnifica-humanitas",
    type: "seminaire",
    title:
      "Magnifica Humanitas : rester humains à l'ère de l'intelligence artificielle",
    shortTitle: "Magnifica Humanitas",
    description:
      "Séminaire des écoles catholiques sur l'encyclique du Saint-Père Léon XIV.",
    longDescription:
      "Formation de 12 heures, déclinable en 1 ou 2 jours, qui propose une lecture pédagogique, éthique, sociale et spirituelle de l'encyclique Magnifica Humanitas (15 mai 2026). 9 modules, 3 quiz auto-corrigés, charte d'usage responsable de l'IA, grille d'évaluation, glossaire et livret académique imprimable.",
    route: "/aide/seminaire/magnifica-humanitas",
    livretRoute: "/aide/seminaire/magnifica-humanitas/livret",
    accent: "purple",
    duration: "12 heures (1 ou 2 jours)",
    audience:
      "Responsables éducatifs, enseignants, formateurs, cadres pastoraux, jeunes leaders, acteurs du numérique, parents, étudiants, décideurs",
    level: "Initiation approfondie",
    enrollmentMethods: ["individual", "cohort"],
    order: 1,
  },
  {
    id: "communication-pastorale",
    type: "seminaire",
    title: "Le numérique au service de la communication éducative et pastorale",
    shortTitle: "Communication pastorale",
    description:
      "Séminaire SENEC des communicateurs de l'Éducation Catholique de Côte d'Ivoire.",
    longDescription:
      "Atelier de 2 heures combinant 20 minutes de présentation contextuelle (14 diapositives à feuilleter style ePub) et 100 minutes d'ateliers interactifs : diagnostic flash, quiz auto-corrigé, matrice des publics, check-list RAPIDE, scénario de gestion de crise, plan d'action 30 jours et engagement personnel.",
    route: "/aide/seminaire/communication-pastorale",
    livretRoute: "/aide/seminaire/communication-pastorale/livret",
    image: "/seminaires/communication-pastorale/header.png",
    accent: "green",
    duration: "2 heures",
    audience:
      "Communicateurs diocésains, responsables de la communication des établissements catholiques, chefs d'établissement, cadres pastoraux, équipes web et réseaux sociaux des écoles catholiques.",
    level: "Initiation professionnelle approfondie",
    enrollmentMethods: ["individual", "cohort"],
    order: 2,
  },
  {
    id: "manuel-formation",
    type: "manuel",
    title: "Manuel académique de formation EduWeb Planner",
    shortTitle: "Manuel académique",
    description:
      "Support complet de formation des utilisateurs aux normes académiques.",
    longDescription:
      "Manuel de 121 pages couvrant le syllabus, 8 modules de formation par rôle, QCM corrigés, exercices, fiche de progression, glossaire, et certificat de fin de formation. Disponible en PDF imprimable, Word téléchargeable et version en ligne consultable.",
    route: "/aide/support-formation",
    accent: "gold",
    duration: "Auto-formation (~15 heures)",
    audience: "Tous les utilisateurs souhaitant maîtriser la plateforme.",
    level: "Auto-formation accompagnée",
    enrollmentMethods: ["individual", "cohort", "role-auto"],
    autoEnrollRoles: ["admin", "etablissements_admin", "chef_etablissement"],
    order: 3,
  },
  {
    id: "guides-utilisateurs",
    type: "guides",
    title: "Bibliothèque des guides utilisateurs par rôle",
    shortTitle: "Guides utilisateurs",
    description:
      "8 guides détaillés, un par rôle, pour démarrer rapidement avec EduWeb Planner.",
    longDescription:
      "Bibliothèque des guides utilisateurs adaptés à chaque rôle (administrateur, chef d'établissement, enseignant, éducateur, inspecteur, conseiller pédagogique, parent, élève). Chaque guide couvre les objectifs, prérequis, parcours pas-à-pas, FAQ et glossaire spécifiques au rôle.",
    route: "/aide",
    accent: "blue",
    duration: "1 à 2 heures par guide",
    audience: "Tous les utilisateurs ; chaque guide est ciblé sur un rôle.",
    level: "Démarrage",
    enrollmentMethods: ["individual", "cohort", "role-auto"],
    autoEnrollRoles: [
      "admin",
      "etablissements_admin",
      "cafop_admin",
      "apfc_admin",
      "drena",
      "inspecteur",
      "conseiller_pedagogique",
      "chef_antenne",
      "chef_etablissement",
      "enseignant",
      "educateur",
    ],
    order: 4,
  },
];

/** Retourne un cours par son identifiant ou `undefined` si introuvable. */
export function getCourse(id: string): Course | undefined {
  return COURSE_CATALOG.find((c) => c.id === id);
}

/** Liste les cours triés par ordre d'affichage. */
export function sortedCourses(): Course[] {
  return [...COURSE_CATALOG].sort((a, b) => a.order - b.order);
}
