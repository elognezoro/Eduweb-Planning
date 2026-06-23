/* ============================================================================
   Modèle de données du livret scolaire CI (13 pages) — EduWeb Planner.

   Deux couches :
   - `LivretComputed` : tout est AUTO-rempli (identité ← config + élève, notes ←
     source de notes partagée, observations/décisions ← génération auto).
   - `LivretOverrides` : uniquement les champs ÉDITÉS par une personne habilitée.
   `resolveLivret(computed, overrides)` fusionne les deux ; le reste reste
   recalculé à la volée → toujours à jour si la config ou les notes changent.

   Pur typage : aucune dépendance React/store. Voir lib/livret/autofill.ts.
   ========================================================================== */

import type { Cycle } from "./subjects";

/** Cellule (moyenne + place) d'une matière pour un trimestre. null = vide. */
export interface LivretCell {
  moy: number | null;
  place: number | null;
}

/** Ligne « matière » du tableau de notes (p.6 / p.8). */
export interface LivretSubjectRow {
  subjectKey: string;
  label: string;
  coef: number;
  inAverage: boolean;
  /** 3 trimestres. */
  terms: LivretCell[];
  moyenneAnnuelle: number | null;
  classementAnnuel: number | null;
}

/** Lignes de synthèse « générale » (moyennes/classements généraux). */
export interface LivretGeneralRow {
  terms: { moy: number; rang: number }[];
  annuel: { moy: number; rang: number };
}

/** Identité nationale + établissement (couverture p.1). */
export interface LivretEtabHeader {
  official: string;
  ministry: string;
  slogan: string;
  schoolYear: string;
  institution: string;
  regionalDirection: string;
  locality: string;
  code: string;
  logo: string | null;
  stamp: string | null;
  signature: string | null;
  nationalEmblem: string | null;
  headFunction: string;
  headName: string;
}

/** Identité de l'élève (p.1 couverture + p.2 détaillée). */
export interface LivretIdentity {
  nom: string;
  prenoms: string;
  sexe: "M" | "F";
  matricule: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  className: string;
  serie: string;
  cycle: Cycle;
}

/** Observation médicale + photo à une étape-jalon (p.4). */
export interface LivretMedicalStage {
  classe: string;
  observationMedecin: string;
  photo: string | null;
}

/** Bloc annuel d'adresse des parents / tuteurs (p.5). */
export interface LivretParentBlock {
  annee: string;
  nom: string;
  adresse: string;
  telBureau: string;
  telDomicile: string;
}

/** Distinctions / sanctions par trimestre (p.7 / p.9). */
export interface LivretDistinctions {
  t1: string;
  t2: string;
  t3: string;
  mentionSpeciale: string;
}

/** Appréciations et décision de fin d'année (p.7 / p.9). */
export interface LivretAppreciation {
  moyenneGeneraleAnnuelle: number | null;
  classementGeneralAnnuel: number | null;
  /** Auto : synthèse des appréciations des professeurs. */
  appreciationProfesseurs: string;
  /** Auto (éditable) : observations du professeur principal. */
  observationProfPrincipal: string;
  dateProfPrincipal: string;
  /** Éditable (chef) : visa et observation du chef d'établissement. */
  visaChef: string;
  dateChef: string;
  /** Auto (éditable) : « Admis(e) en … ». */
  decisionAdmisEn: string;
  distinctions: LivretDistinctions;
}

/** Établissement successif fréquenté (p.10 / p.11). */
export interface LivretEtabSuccessif {
  anneeScolaire: string;
  classe: string;
  moyenneAnnuelle: string;
  nomEtablissement: string;
  observations: string;
}

/** Diplôme obtenu (p.12). */
export interface LivretDiplome {
  etablissement: string;
  anneeScolaire: string;
  appreciationPresidentJury: string;
}

/** Livret entièrement auto-rempli (avant overrides). */
export interface LivretComputed {
  studentId: string;
  schoolYear: string;
  cycle: Cycle;
  effectif: number;
  etab: LivretEtabHeader;
  identity: LivretIdentity;
  notes: { subjects: LivretSubjectRow[]; general: LivretGeneralRow };
  appreciation: LivretAppreciation;
  medicalStages: LivretMedicalStage[];
  parents: LivretParentBlock[];
  etabSuccessifs: LivretEtabSuccessif[];
  diplomes: LivretDiplome[];
  extension: { observationsComplementaires: string };
}

/** Champs édités par une personne habilitée (seuls ceux-ci sont persistés). */
export interface LivretOverrides {
  identity?: Partial<Pick<LivretIdentity, "lieuNaissance" | "nationalite" | "serie">>;
  appreciation?: Partial<
    Pick<
      LivretAppreciation,
      | "appreciationProfesseurs"
      | "observationProfPrincipal"
      | "dateProfPrincipal"
      | "visaChef"
      | "dateChef"
      | "decisionAdmisEn"
    >
  > & { distinctions?: Partial<LivretDistinctions> };
  /** Par index d'étape (cf. MEDICAL_STAGES). */
  medicalStages?: Record<number, Partial<Pick<LivretMedicalStage, "observationMedecin" | "photo">>>;
  parents?: LivretParentBlock[];
  etabSuccessifs?: LivretEtabSuccessif[];
  diplomes?: LivretDiplome[];
  extension?: { observationsComplementaires?: string };
}

/** Enregistrement persisté des overrides d'un élève pour une année. */
export interface LivretRecord {
  id: string;
  studentId: string;
  schoolYear: string;
  overrides: LivretOverrides;
  updatedBy?: string | null;
  updatedAt: string;
}

/** Livret final (calculé + overrides appliqués). Même forme que `LivretComputed`. */
export type LivretResolved = LivretComputed;
