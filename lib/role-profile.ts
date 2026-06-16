import type { UserRole } from "./roles";

/**
 * Informations spécifiques au rôle affichées sur « Mon Identification ».
 * La page rend la section correspondant au rôle effectif (réel ou prévisualisé),
 * de sorte que chaque rôle voie l'ensemble de ses informations sur la plateforme.
 */
export interface ProfileField {
  label: string;
  value: string;
}
export interface ProfileSection {
  title: string;
  fields: ProfileField[];
}

interface ProfileCtx {
  /** Établissement de rattachement (ex. « Lycée Moderne de Cocody »). */
  etablissement: string;
  /** Direction régionale / structure (ex. « DRENA Abidjan 1 »). */
  region: string;
}

export function roleProfileSection(role: UserRole, ctx: ProfileCtx): ProfileSection {
  const E = ctx.etablissement;
  const R = ctx.region || "Direction nationale";

  switch (role) {
    case "enseignant":
      return {
        title: "Affectation pédagogique",
        fields: [
          { label: "Établissement", value: E },
          { label: "Discipline(s) enseignée(s)", value: "Mathématiques · Physique-Chimie" },
          { label: "Volume horaire hebdomadaire", value: "18 h / semaine" },
          { label: "Classes tenues", value: "3ᵉ A · 2ⁿᵈᵉ C · Tˡᵉ D" },
          { label: "Autres responsabilités", value: "Professeur principal (3ᵉ A) · Conseil d'enseignement" },
          { label: "Première prise de service", value: "01 octobre 2018" },
        ],
      };
    case "chef_etablissement":
      return {
        title: "Direction d'établissement",
        fields: [
          { label: "Établissement dirigé", value: E },
          { label: "Type d'établissement", value: "Lycée public" },
          { label: "Effectif élèves", value: "1 240" },
          { label: "Nombre de classes", value: "32" },
          { label: "Fonction", value: "Proviseur" },
          { label: "Première prise de service", value: "01 septembre 2020" },
        ],
      };
    case "educateur":
      return {
        title: "Vie scolaire",
        fields: [
          { label: "Établissement", value: E },
          { label: "Niveaux suivis", value: "6ᵉ · 5ᵉ · 4ᵉ" },
          { label: "Effectif suivi", value: "480 élèves" },
          { label: "Responsabilités", value: "Suivi des absences, retards et discipline" },
          { label: "Première prise de service", value: "01 septembre 2021" },
        ],
      };
    case "drena":
      return {
        title: "Pilotage régional",
        fields: [
          { label: "Direction régionale", value: R },
          { label: "Zone de compétence", value: "Région d'Abidjan 1" },
          { label: "Établissements supervisés", value: "48" },
          { label: "Circonscriptions rattachées", value: "6" },
          { label: "Première prise de service", value: "15 janvier 2021" },
        ],
      };
    case "inspecteur":
      return {
        title: "Inspection pédagogique",
        fields: [
          { label: "Spécialité d'inspection", value: "Mathématiques" },
          { label: "Zone de compétence", value: R },
          { label: "Établissements suivis", value: "22" },
          { label: "Enseignants inspectés (2025-2026)", value: "37" },
          { label: "Première prise de service", value: "01 octobre 2017" },
        ],
      };
    case "conseiller_pedagogique":
      return {
        title: "Accompagnement pédagogique",
        fields: [
          { label: "Disciplines accompagnées", value: "Mathématiques · SVT" },
          { label: "Structure de rattachement", value: R },
          { label: "Établissements suivis", value: "14" },
          { label: "Recommandations en cours", value: "9" },
          { label: "Première prise de service", value: "01 octobre 2019" },
        ],
      };
    case "chef_antenne":
      return {
        title: "Antenne de formation",
        fields: [
          { label: "Antenne APFC", value: "Antenne APFC Abidjan" },
          { label: "Zone de compétence", value: R },
          { label: "Activités encadrées", value: "14" },
          { label: "Coordonnateurs", value: "9" },
          { label: "Première prise de service", value: "01 octobre 2020" },
        ],
      };
    case "parent":
      return {
        title: "Suivi parental",
        fields: [
          { label: "Enfant(s) scolarisé(s)", value: "KOUAMÉ Awa (3ᵉ A) · KOUAMÉ Koffi (6ᵉ B)" },
          { label: "Établissement", value: E },
          { label: "Lien avec l'élève", value: "Père / Tuteur" },
          { label: "Canal de notification", value: "SMS · Email" },
        ],
      };
    case "eleve":
      return {
        title: "Scolarité",
        fields: [
          { label: "Établissement", value: E },
          { label: "Classe", value: "3ᵉ A" },
          { label: "Matricule", value: "CI-2025001" },
          { label: "Régime", value: "Externe" },
          { label: "Année d'inscription", value: "2024-2025" },
        ],
      };
    case "etablissements_admin":
      return {
        title: "Administration des établissements",
        fields: [
          { label: "Périmètre", value: "Établissements rattachés" },
          { label: "Établissements gérés", value: "12" },
          { label: "Région", value: R },
          { label: "Première prise de service", value: "01 mars 2022" },
        ],
      };
    case "cafop_admin":
      return {
        title: "Administration CAFOP",
        fields: [
          { label: "CAFOP rattaché", value: "CAFOP d'Abidjan" },
          { label: "Promotions", value: "3" },
          { label: "Cohortes", value: "9" },
          { label: "Élèves-maîtres", value: "540" },
        ],
      };
    case "apfc_admin":
      return {
        title: "Administration APFC",
        fields: [
          { label: "Antennes APFC", value: "3" },
          { label: "Activités de formation", value: "30" },
          { label: "Coordonnateurs", value: "20" },
          { label: "Région", value: R },
        ],
      };
    case "admin":
    default:
      return {
        title: "Administration de la plateforme",
        fields: [
          { label: "Périmètre", value: "National — tous établissements" },
          { label: "Modules administrés", value: "Comptes · Rôles · Établissements · Configuration" },
          { label: "Niveau d'accès", value: "Accès complet" },
          { label: "Établissements gérés", value: "Tous" },
        ],
      };
  }
}
