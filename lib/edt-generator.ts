/**
 * Moteur de génération d'emploi du temps (simulation).
 * Porté du script scripts/simulate-edt.mjs, paramétrable :
 *  - effectif total, salles physiques, taille de classe, charge max enseignant,
 *  - salles spécialisées (labos pour Physique-Chimie/SVT, plateaux EPS).
 *
 * Stratégie : répartition décroissante 6e→Tle, classes = effectif / taille cible,
 * double vacation si le nombre de classes dépasse le parc de salles, et placement
 * glouton des heures sans conflit (classe / enseignant / salle / salle spécialisée).
 * Déterministe (graine) → résultats reproductibles.
 */

export type Flux = "Matin" | "Apres-midi" | "Journee";

export interface EdtParams {
  totalStudents: number;
  rooms: number;
  classSize: number;
  maxTeacherLoad: number;
  labRooms: number;
  epsRooms: number;
  seed?: number;
}

export interface EdtClass {
  id: string;
  label: string;
  level: string;
  cycle: "college" | "lycee";
  flux: Flux;
  effectif: number;
  salle: string;
}

export interface EdtLesson {
  subject: string;
  teacher: string;
  teacherId: string;
  salle: string;
  special?: "labo" | "eps";
}

export interface EdtTeacher {
  id: string;
  name: string;
  matiere: string;
  charge: number;
}

export interface EdtResult {
  params: EdtParams;
  totalStudents: number;
  totalClasses: number;
  avgClassSize: number;
  totalTeachers: number;
  totalHours: number;
  levels: { id: string; effectif: number; classes: number; avg: number; flux: Flux }[];
  vacationMode: "unique" | "double";
  feasible: boolean;
  reason: string | null;
  fluxSplit: {
    matin: { label: string; classes: number; rooms: number; pct: number };
    apresMidi: { label: string; classes: number; rooms: number; pct: number };
  };
  metrics: {
    placed: number;
    total: number;
    unplaced: number;
    conflictsSalle: number;
    conflictsProf: number;
    labUnplaced: number;
    epsUnplaced: number;
  };
  warnings: string[];
  hoursBySubject: { subject: string; heures: number; profs: number }[];
  classes: EdtClass[];
  teachers: EdtTeacher[];
  edtByClass: Record<string, { label: string; level: string; flux: Flux; salle: string; grid: Record<string, EdtLesson> }>;
  jours: string[];
  heuresByFlux: Record<Flux, string[]>;
}

/* --------------------------------- données --------------------------------- */
const LEVELS = [
  { id: "6e", weight: 0.2, cycle: "college" as const },
  { id: "5e", weight: 0.177, cycle: "college" as const },
  { id: "4e", weight: 0.16, cycle: "college" as const },
  { id: "3e", weight: 0.149, cycle: "college" as const },
  { id: "2nde", weight: 0.131, cycle: "lycee" as const },
  { id: "1ere", weight: 0.103, cycle: "lycee" as const },
  { id: "Tle", weight: 0.08, cycle: "lycee" as const },
];

const CURRICULUM: Record<"college" | "lycee", Record<string, number>> = {
  college: {
    Français: 5, Mathématiques: 5, Anglais: 4, "Histoire-Géographie": 3,
    SVT: 3, "Physique-Chimie": 3, EPS: 2, "Espagnol (LV2)": 2,
    EDHC: 1, "Arts plastiques": 1, "Éducation musicale": 1,
  },
  lycee: {
    Français: 4, Mathématiques: 5, Anglais: 3, "Physique-Chimie": 4,
    SVT: 3, "Histoire-Géographie": 3, Philosophie: 2, "Espagnol (LV2)": 2,
    EPS: 2, EDHC: 1, "Sciences économiques": 1,
  },
};

const SPECIAL: Record<string, "labo" | "eps"> = {
  "Physique-Chimie": "labo",
  SVT: "labo",
  EPS: "eps",
};

export const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const H_MATIN = ["07:30", "08:25", "09:20", "10:30", "11:25", "12:20"];
const H_SOIR = ["13:00", "13:55", "14:50", "16:00", "16:55", "17:50"];
const H_JOURNEE = ["07:30", "08:25", "09:20", "10:30", "11:25", "14:00", "14:55", "15:50"];

interface Slot {
  id: string;
  jour: string;
  heure: string;
}
const buildSlots = (heures: string[]): Slot[] => {
  const s: Slot[] = [];
  for (const j of JOURS) for (const h of heures) s.push({ id: `${j}-${h}`, jour: j, heure: h });
  return s;
};

/* --------------------------------- RNG seed -------------------------------- */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOMS = ["KOUASSI","KONÉ","DIABATÉ","TRAORÉ","YAO","KOUAMÉ","BAMBA","OUATTARA","COULIBALY","DOUMBIA","N'GUESSAN","TOURÉ","CISSÉ","BROU","TANOH","AKA","KOFFI","DIALLO","FOFANA","GNAGNE","KASSI","ASSI","ADJÉ","ZADI","GUÉI","SANGARÉ","BAKAYOKO","DJÉ","ABLÉ","SÉKA"];
const PRENOMS = ["Koffi","Yao","Adama","Awa","Aïcha","Marie","Grace","Ibrahim","Serge","Mariam","Fatou","Aya","Daniel","Moussa","Estelle","Arnaud","Carine","Hervé","Olivier","Nadège","Christelle","Franck","Mireille","Thierry"];

/* -------------------------- planification d'un flux ------------------------ */
interface SchedRes {
  edt: Map<string, Record<string, EdtLesson>>;
  placed: number;
  total: number;
  unplaced: number;
  conflictsSalle: number;
  conflictsProf: number;
  labUnplaced: number;
  epsUnplaced: number;
}

function scheduleGroup(
  group: EdtClass[],
  slots: Slot[],
  rooms: number,
  caps: { labo: number; eps: number },
  assignment: Record<string, Record<string, EdtTeacher>>,
  rng: () => number,
): SchedRes {
  group.forEach((c, i) => (c.salle = `S${String((i % rooms) + 1).padStart(2, "0")}`));

  const classBusy = new Map<string, Set<string>>(group.map((c) => [c.id, new Set<string>()]));
  const teacherBusy = new Map<string, Set<string>>();
  const specBusy: Record<"labo" | "eps", Map<string, number>> = { labo: new Map(), eps: new Map() };
  const edt = new Map<string, Record<string, EdtLesson>>(group.map((c) => [c.id, {}]));

  const lessons: { c: EdtClass; sub: string; special?: "labo" | "eps" }[] = [];
  for (const c of group)
    for (const [sub, h] of Object.entries(CURRICULUM[c.cycle]))
      for (let k = 0; k < h; k++) lessons.push({ c, sub, special: SPECIAL[sub] });
  // les cours en salle spécialisée (plus contraints) d'abord
  const shuffled = lessons.sort((a, b) => (a.special ? 0 : 1) - (b.special ? 0 : 1) || rng() - 0.5);

  let placed = 0, unplaced = 0, labUnplaced = 0, epsUnplaced = 0;
  for (const { c, sub, special } of shuffled) {
    const t = assignment[c.id][sub];
    if (!teacherBusy.has(t.id)) teacherBusy.set(t.id, new Set());
    const tb = teacherBusy.get(t.id)!;
    const cb = classBusy.get(c.id)!;
    const order = slots.slice().sort(() => rng() - 0.5);
    const free = order.filter((s) => !cb.has(s.id) && !tb.has(s.id));
    let slot: Slot | undefined;
    if (special) {
      // équilibrage : viser le créneau où la salle spécialisée est la moins sollicitée
      const cands = free.filter((s) => (specBusy[special].get(s.id) ?? 0) < caps[special]);
      cands.sort((a, b) => (specBusy[special].get(a.id) ?? 0) - (specBusy[special].get(b.id) ?? 0));
      slot = cands[0];
    } else {
      slot = free[0];
    }
    if (slot) {
      if (special) specBusy[special].set(slot.id, (specBusy[special].get(slot.id) ?? 0) + 1);
      cb.add(slot.id);
      tb.add(slot.id);
      edt.get(c.id)![slot.id] = { subject: sub, teacher: `${t.name}`, teacherId: t.id, salle: c.salle, special };
      placed++;
    } else {
      unplaced++;
      if (special === "labo") labUnplaced++;
      else if (special === "eps") epsUnplaced++;
    }
  }

  // vérification stricte des conflits sur l'EDT produit
  const roomAt: Record<string, Set<string>> = {};
  const profAt: Record<string, Set<string>> = {};
  let conflictsSalle = 0, conflictsProf = 0;
  for (const grid of edt.values())
    for (const [slotId, l] of Object.entries(grid)) {
      (roomAt[slotId] ??= new Set());
      if (roomAt[slotId].has(l.salle)) conflictsSalle++; else roomAt[slotId].add(l.salle);
      (profAt[slotId] ??= new Set());
      if (profAt[slotId].has(l.teacherId)) conflictsProf++; else profAt[slotId].add(l.teacherId);
    }

  return { edt, placed, total: lessons.length, unplaced, conflictsSalle, conflictsProf, labUnplaced, epsUnplaced };
}

/* -------------------------------- générateur ------------------------------- */
export function generateEdt(params: EdtParams): EdtResult {
  const { totalStudents, rooms, classSize, maxTeacherLoad, labRooms, epsRooms } = params;
  const rng = makeRng(params.seed ?? 20260611);
  const pick = <T,>(a: T[]) => a[Math.floor(rng() * a.length)];

  // 1) effectifs décroissants
  const levelInfo = LEVELS.map((l) => ({ ...l, effectif: Math.round(l.weight * totalStudents) }));
  const diff = totalStudents - levelInfo.reduce((a, l) => a + l.effectif, 0);
  levelInfo[0].effectif += diff; // ajuste l'arrondi sur la 6e

  // 2) classes par niveau
  const classes: EdtClass[] = [];
  let seq = 0;
  for (const lvl of levelInfo) {
    const nb = Math.max(1, Math.ceil(lvl.effectif / classSize));
    const base = Math.floor(lvl.effectif / nb);
    let reste = lvl.effectif - base * nb;
    for (let i = 1; i <= nb; i++) {
      classes.push({
        id: `C${String(++seq).padStart(3, "0")}`,
        label: `${lvl.id}-${i}`,
        level: lvl.id,
        cycle: lvl.cycle,
        flux: "Journee",
        effectif: base + (reste-- > 0 ? 1 : 0),
        salle: "",
      });
    }
  }
  const totalClasses = classes.length;
  const college = classes.filter((c) => c.cycle === "college");
  const lycee = classes.filter((c) => c.cycle === "lycee");

  // 3) enseignants par matière
  const hoursBySubjectMap: Record<string, number> = {};
  for (const c of classes)
    for (const [sub, h] of Object.entries(CURRICULUM[c.cycle])) hoursBySubjectMap[sub] = (hoursBySubjectMap[sub] || 0) + h;
  const totalHours = Object.values(hoursBySubjectMap).reduce((a, b) => a + b, 0);

  const teachers: EdtTeacher[] = [];
  const teachersBySubject: Record<string, EdtTeacher[]> = {};
  let tSeq = 0;
  for (const [sub, totalH] of Object.entries(hoursBySubjectMap)) {
    const n = Math.max(1, Math.ceil(totalH / maxTeacherLoad));
    teachersBySubject[sub] = [];
    for (let i = 0; i < n; i++) {
      const t: EdtTeacher = { id: `P${String(++tSeq).padStart(3, "0")}`, name: `${pick(PRENOMS)} ${pick(NOMS)}`, matiere: sub, charge: 0 };
      teachers.push(t);
      teachersBySubject[sub].push(t);
    }
  }
  const assignment: Record<string, Record<string, EdtTeacher>> = {};
  for (const c of classes) {
    assignment[c.id] = {};
    for (const [sub, h] of Object.entries(CURRICULUM[c.cycle])) {
      const pool = teachersBySubject[sub];
      let chosen = pool.filter((t) => t.charge + h <= maxTeacherLoad).sort((a, b) => a.charge - b.charge)[0];
      if (!chosen) chosen = pool.sort((a, b) => a.charge - b.charge)[0];
      chosen.charge += h;
      assignment[c.id][sub] = chosen;
    }
  }

  // 4) mode de vacation & faisabilité salles
  const vacationMode: "unique" | "double" = totalClasses <= rooms ? "unique" : "double";
  const caps = { labo: labRooms, eps: epsRooms };
  const warnings: string[] = [];

  let feasible = true;
  let reason: string | null = null;
  let results: SchedRes[] = [];
  const edtByClass: EdtResult["edtByClass"] = {};

  if (vacationMode === "unique") {
    classes.forEach((c) => (c.flux = "Journee"));
    const slots = buildSlots(H_JOURNEE);
    if (totalClasses > rooms) {
      feasible = false;
      reason = `Vacation unique impossible : ${totalClasses} classes pour ${rooms} salles.`;
    } else {
      results = [scheduleGroup(classes, slots, rooms, caps, assignment, rng)];
    }
  } else {
    college.forEach((c) => (c.flux = "Matin"));
    lycee.forEach((c) => (c.flux = "Apres-midi"));
    const maxFlux = Math.max(college.length, lycee.length);
    if (maxFlux > rooms) {
      feasible = false;
      reason = `Même en double vacation, le flux le plus chargé (${maxFlux} classes) dépasse les ${rooms} salles. Prévoir ≥ ${maxFlux} salles, réduire l'effectif ou augmenter la taille des classes.`;
    } else {
      results = [
        scheduleGroup(college, buildSlots(H_MATIN), rooms, caps, assignment, rng),
        scheduleGroup(lycee, buildSlots(H_SOIR), rooms, caps, assignment, rng),
      ];
    }
  }

  // agrégation des métriques + EDT par classe
  const metrics = { placed: 0, total: 0, unplaced: 0, conflictsSalle: 0, conflictsProf: 0, labUnplaced: 0, epsUnplaced: 0 };
  for (const r of results) {
    metrics.placed += r.placed;
    metrics.total += r.total;
    metrics.unplaced += r.unplaced;
    metrics.conflictsSalle += r.conflictsSalle;
    metrics.conflictsProf += r.conflictsProf;
    metrics.labUnplaced += r.labUnplaced;
    metrics.epsUnplaced += r.epsUnplaced;
    for (const [cid, grid] of r.edt) {
      const c = classes.find((x) => x.id === cid)!;
      edtByClass[cid] = { label: c.label, level: c.level, flux: c.flux, salle: c.salle, grid };
    }
  }

  if (metrics.unplaced > 0 && feasible) feasible = false;
  if (metrics.labUnplaced > 0)
    warnings.push(`Labos saturés : ${metrics.labUnplaced} h de Physique-Chimie/SVT non placées. Augmentez le nombre de labos.`);
  if (metrics.epsUnplaced > 0)
    warnings.push(`Plateaux EPS saturés : ${metrics.epsUnplaced} h non placées. Augmentez le nombre de plateaux EPS.`);
  if (metrics.conflictsSalle + metrics.conflictsProf > 0)
    warnings.push(`Conflits détectés (salle ${metrics.conflictsSalle} / enseignant ${metrics.conflictsProf}).`);
  if (vacationMode === "unique" && feasible)
    warnings.push(`Le parc de ${rooms} salles suffit en vacation unique (${totalClasses} ≤ ${rooms}).`);

  const matinClasses = vacationMode === "double" ? college.length : totalClasses;
  const soirClasses = vacationMode === "double" ? lycee.length : 0;

  const hoursBySubject = Object.entries(hoursBySubjectMap)
    .map(([subject, heures]) => ({ subject, heures, profs: teachersBySubject[subject].length }))
    .sort((a, b) => b.heures - a.heures);

  return {
    params,
    totalStudents,
    totalClasses,
    avgClassSize: +(totalStudents / totalClasses).toFixed(1),
    totalTeachers: teachers.length,
    totalHours,
    levels: levelInfo.map((l) => {
      const nb = classes.filter((c) => c.level === l.id).length;
      return { id: l.id, effectif: l.effectif, classes: nb, avg: +(l.effectif / nb).toFixed(1), flux: l.cycle === "college" ? (vacationMode === "double" ? "Matin" : "Journee") : vacationMode === "double" ? "Apres-midi" : "Journee" };
    }),
    vacationMode,
    feasible,
    reason,
    fluxSplit: {
      matin: { label: vacationMode === "double" ? "Matin · collège 6e–3e" : "Journée", classes: matinClasses, rooms: Math.min(matinClasses, rooms), pct: Math.round((Math.min(matinClasses, rooms) / rooms) * 100) },
      apresMidi: { label: "Après-midi · lycée 2nde–Tle", classes: soirClasses, rooms: Math.min(soirClasses, rooms), pct: Math.round((Math.min(soirClasses, rooms) / rooms) * 100) },
    },
    metrics,
    warnings,
    hoursBySubject,
    classes,
    teachers,
    edtByClass,
    jours: JOURS,
    heuresByFlux: { Matin: H_MATIN, "Apres-midi": H_SOIR, Journee: H_JOURNEE },
  };
}
