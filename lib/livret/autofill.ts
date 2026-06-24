/* ============================================================================
   Moteur d'auto-remplissage du livret scolaire.

   `computeLivret(...)` construit un livret entièrement renseigné :
   - identité  ← configuration établissement (etabExportMeta) + dossier élève ;
   - notes     ← source de notes partagée (lib/livret/grades), repli auto ;
   - observations / décisions ← génération automatique (selon les moyennes).

   `resolveLivret(computed, overrides)` applique par-dessus les champs édités par
   une personne habilitée (enseignant / chef d'établissement / admin).
   ========================================================================== */

import type { EtabExportMeta } from "@/lib/etab-config";
import type { Eleve } from "@/lib/types";
import { toNomCase, toPrenomCase } from "@/lib/format-name";
import { cycleOfClassName, MEDICAL_STAGES, subjectsForCycle } from "./subjects";
import {
  annualClassRank,
  annualGeneralAverage,
  gradeBank,
  subjectClassPlace,
  subjectMoy,
  termClassRank,
  termGeneralAverage,
  TERMS,
  type LivretGradeEntry,
} from "./grades";
import type {
  LivretComputed,
  LivretEtabHeader,
  LivretOverrides,
  LivretResolved,
  LivretSubjectRow,
} from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;

export const livretMention = (m: number): string =>
  m >= 16 ? "Excellent" : m >= 14 ? "Très bien" : m >= 12 ? "Bien" : m >= 10 ? "Assez bien" : m >= 8 ? "Passable" : "Insuffisant";

function apprecProfesseurs(m: number): string {
  if (m >= 16) return "Excellente année. Élève brillant(e) et très impliqué(e). Vives félicitations du conseil de classe.";
  if (m >= 14) return "Bonne année, travail sérieux et régulier. Encouragements à poursuivre dans cette voie.";
  if (m >= 12) return "Année satisfaisante dans l'ensemble. Des efforts restent à fournir dans certaines disciplines.";
  if (m >= 10) return "Résultats justes. Un travail plus soutenu et régulier permettra de progresser nettement.";
  if (m >= 8) return "Année difficile. Une mobilisation et davantage d'assiduité sont attendues.";
  return "Résultats insuffisants. Le conseil de classe attend un net sursaut.";
}

function visaChefAuto(m: number): string {
  if (m >= 14) return "Bon parcours. Le chef d'établissement félicite l'élève et l'encourage à maintenir ce niveau.";
  if (m >= 10) return "Parcours correct. L'élève est invité(e) à consolider ses acquis et à viser plus haut.";
  return "Le chef d'établissement invite l'élève à fournir davantage d'efforts et à suivre un accompagnement renforcé.";
}

/** Découpe « 2nde C » → { head: "2nde", tail: "C" }. */
function classParts(className: string): { head: string; tail: string } {
  const m = (className || "").trim();
  const sp = m.indexOf(" ");
  return sp >= 0 ? { head: m.slice(0, sp), tail: m.slice(sp + 1) } : { head: m, tail: "" };
}

function nextHead(head: string): string | null {
  const h = head.toLowerCase();
  if (h.startsWith("6")) return "5ème";
  if (h.startsWith("5")) return "4ème";
  if (h.startsWith("4")) return "3ème";
  if (h.startsWith("3")) return "2nde";
  if (h.startsWith("2") || h.includes("second")) return "1ère";
  if (h.startsWith("1") || h.includes("prem")) return "Tle";
  return null; // Terminale ou inconnu
}

/** Série/option dérivée du libellé de classe (lettre après l'espace), sinon "". */
function serieFromClassName(className: string): string {
  const { tail } = classParts(className);
  return /^[A-Z]\d?$/i.test(tail.trim()) ? tail.trim().toUpperCase() : "";
}

function etabHeader(meta: EtabExportMeta): LivretEtabHeader {
  return {
    official: meta.official,
    ministry: meta.ministry,
    slogan: meta.slogan,
    schoolYear: meta.schoolYear,
    institution: meta.institution !== "Établissement" ? meta.institution : "",
    regionalDirection: meta.regionalDirection,
    locality: meta.locality,
    code: meta.code,
    logo: meta.logo,
    stamp: meta.stamp,
    signature: meta.signature,
    nationalEmblem: meta.nationalEmblem,
    headFunction: meta.headFunction,
    headName: meta.headName,
  };
}

/** Construit un livret entièrement auto-rempli. */
export function computeLivret(args: {
  student: Eleve;
  meta: EtabExportMeta;
  grades: LivretGradeEntry[];
  classmates: { id: string }[];
  schoolYear: string;
}): LivretComputed {
  const { student, meta, grades, classmates, schoolYear } = args;
  const cycle = cycleOfClassName(student.className);
  const bank = gradeBank(grades);
  const effectif = Math.max(classmates.length, 1);

  const subjects: LivretSubjectRow[] = subjectsForCycle(cycle).map((subj) => {
    const terms = TERMS.map((p) => {
      const moy = subjectMoy(bank, student.id, schoolYear, subj.key, p);
      const place = subj.inAverage
        ? subjectClassPlace(bank, classmates, student.id, schoolYear, subj.key, p)
        : null;
      return { moy: round2(moy), place };
    });
    const annualMoy = round2(terms.reduce((a, c) => a + (c.moy ?? 0), 0) / terms.length);
    const places = terms.map((c) => c.place).filter((p): p is number => p != null);
    const annualPlace = places.length ? Math.round(places.reduce((a, b) => a + b, 0) / places.length) : null;
    return {
      subjectKey: subj.key,
      label: subj.label,
      coef: subj.coef,
      inAverage: subj.inAverage,
      terms,
      moyenneAnnuelle: annualMoy,
      classementAnnuel: subj.inAverage ? annualPlace : null,
    };
  });

  const general = {
    terms: TERMS.map((p) => ({
      moy: termGeneralAverage(bank, student.id, schoolYear, cycle, p),
      rang: termClassRank(bank, classmates, student.id, schoolYear, cycle, p),
    })),
    annuel: {
      moy: annualGeneralAverage(bank, student.id, schoolYear, cycle),
      rang: annualClassRank(bank, classmates, student.id, schoolYear, cycle),
    },
  };

  const mga = general.annuel.moy;
  const admis = mga >= 10;
  const { head, tail } = classParts(student.className);
  const isTerminale = head.toLowerCase().startsWith("t");
  let admisEn: string;
  if (!admis) admisEn = "—";
  else if (isTerminale) admisEn = "Présentation à l'examen";
  else {
    const nh = nextHead(head);
    admisEn = nh ? (tail ? `${nh} ${tail}` : nh) : "Présentation à l'examen";
  }

  return {
    studentId: student.id,
    schoolYear,
    cycle,
    effectif,
    etab: etabHeader(meta),
    identity: {
      nom: toNomCase(student.lastName),
      prenoms: toPrenomCase(student.firstName),
      sexe: student.gender,
      matricule: student.matricule,
      dateNaissance: student.birthDate,
      lieuNaissance: "",
      nationalite: "Ivoirienne",
      className: student.className,
      serie: serieFromClassName(student.className),
      cycle,
    },
    notes: { subjects, general },
    appreciation: {
      moyenneGeneraleAnnuelle: mga,
      classementGeneralAnnuel: general.annuel.rang,
      appreciationProfesseurs: apprecProfesseurs(mga),
      observationProfPrincipal: apprecProfesseurs(mga),
      dateProfPrincipal: "",
      visaChef: visaChefAuto(mga),
      dateChef: "",
      decisionAdmisEn: admisEn,
      distinctions: { t1: "", t2: "", t3: "", mentionSpeciale: "" },
    },
    medicalStages: MEDICAL_STAGES.map((classe) => ({ classe, observationMedecin: "", photo: null })),
    parents: [{ annee: schoolYear, nom: "", adresse: "", telBureau: "", telDomicile: "" }],
    etabSuccessifs: [],
    diplomes: [],
    extension: { observationsComplementaires: "" },
  };
}

/** Applique les champs édités (overrides) par-dessus le livret auto-rempli. */
export function resolveLivret(computed: LivretComputed, overrides?: LivretOverrides): LivretResolved {
  if (!overrides) return computed;
  const out: LivretComputed = {
    ...computed,
    identity: { ...computed.identity },
    appreciation: { ...computed.appreciation, distinctions: { ...computed.appreciation.distinctions } },
    medicalStages: computed.medicalStages.map((m) => ({ ...m })),
    extension: { ...computed.extension },
  };

  if (overrides.identity) {
    const o = overrides.identity;
    if (o.lieuNaissance != null) out.identity.lieuNaissance = o.lieuNaissance;
    if (o.nationalite != null) out.identity.nationalite = o.nationalite;
    if (o.serie != null) out.identity.serie = o.serie;
  }

  if (overrides.appreciation) {
    const o = overrides.appreciation;
    const a = out.appreciation;
    if (o.appreciationProfesseurs != null) a.appreciationProfesseurs = o.appreciationProfesseurs;
    if (o.observationProfPrincipal != null) a.observationProfPrincipal = o.observationProfPrincipal;
    if (o.dateProfPrincipal != null) a.dateProfPrincipal = o.dateProfPrincipal;
    if (o.visaChef != null) a.visaChef = o.visaChef;
    if (o.dateChef != null) a.dateChef = o.dateChef;
    if (o.decisionAdmisEn != null) a.decisionAdmisEn = o.decisionAdmisEn;
    if (o.distinctions) a.distinctions = { ...a.distinctions, ...o.distinctions };
  }

  if (overrides.medicalStages) {
    for (const [idxStr, patch] of Object.entries(overrides.medicalStages)) {
      const i = Number(idxStr);
      if (out.medicalStages[i]) out.medicalStages[i] = { ...out.medicalStages[i], ...patch };
    }
  }

  // Array.isArray (et non simple truthiness) : une ligne livret_records
  // corrompue/legacy pourrait fournir un objet au lieu d'un tableau — .map
  // planterait alors en plein rendu (page blanche). On ignore proprement.
  if (Array.isArray(overrides.parents)) out.parents = overrides.parents.map((p) => ({ ...p }));
  if (Array.isArray(overrides.etabSuccessifs)) out.etabSuccessifs = overrides.etabSuccessifs.map((e) => ({ ...e }));
  if (Array.isArray(overrides.diplomes)) out.diplomes = overrides.diplomes.map((d) => ({ ...d }));
  if (overrides.extension?.observationsComplementaires != null) {
    out.extension.observationsComplementaires = overrides.extension.observationsComplementaires;
  }

  return out;
}
