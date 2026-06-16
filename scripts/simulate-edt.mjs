/**
 * SIMULATION — Génération d'emploi du temps (EDT) d'un lycée à effectif pléthorique.
 *
 * Hypothèses : 3 500 élèves, 6e→Tle avec effectifs décroissants, 50 salles physiques.
 * Objectif : démontrer qu'un EDT sans conflit (salle / enseignant) est générable,
 * et que la contrainte « 63 classes pédagogiques > 50 salles » impose une DOUBLE
 * VACATION (collège le matin, lycée l'après-midi) partageant le même parc de salles.
 *
 * Sorties : rapport console + fichiers dans /simulation (élèves, enseignants, EDT, résumé).
 *
 * Lancer : node scripts/simulate-edt.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "simulation");
mkdirSync(outDir, { recursive: true });

/* ----------------------------- RNG déterministe ---------------------------- */
let _seed = 20260611;
const rng = () => {
  _seed |= 0;
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const ceil = Math.ceil;

/* ------------------------------- Données base ------------------------------ */
// Niveaux, effectifs DÉCROISSANTS (total = 3500), nombre de classes, vacation.
// Collège (6e–3e) = matin ; Lycée (2nde–Tle) = après-midi (double vacation).
const LEVELS = [
  { id: "6e",   effectif: 700, classes: 12, cycle: "college", flux: "Matin" },
  { id: "5e",   effectif: 620, classes: 11, cycle: "college", flux: "Matin" },
  { id: "4e",   effectif: 560, classes: 10, cycle: "college", flux: "Matin" },
  { id: "3e",   effectif: 520, classes: 9,  cycle: "college", flux: "Matin" },
  { id: "2nde", effectif: 460, classes: 8,  cycle: "lycee",   flux: "Apres-midi" },
  { id: "1ere", effectif: 360, classes: 7,  cycle: "lycee",   flux: "Apres-midi" },
  { id: "Tle",  effectif: 280, classes: 6,  cycle: "lycee",   flux: "Apres-midi" },
];
const NB_SALLES = 50;
const MAX_LOAD = 20; // heures hebdo max par enseignant

// Maquettes horaires (heures/semaine par classe) — 30 h par cycle.
const CURRICULUM = {
  college: {
    "Français": 5, "Mathématiques": 5, "Anglais": 4, "Histoire-Géographie": 3,
    "SVT": 3, "Physique-Chimie": 3, "EPS": 2, "Espagnol (LV2)": 2,
    "EDHC": 1, "Arts plastiques": 1, "Éducation musicale": 1,
  },
  lycee: {
    "Français": 4, "Mathématiques": 5, "Anglais": 3, "Physique-Chimie": 4,
    "SVT": 3, "Histoire-Géographie": 3, "Philosophie": 2, "Espagnol (LV2)": 2,
    "EPS": 2, "EDHC": 1, "Sciences économiques": 1,
  },
};

// Grille de créneaux par flux : 6 créneaux/jour × 6 jours (Lun–Sam) = 36 créneaux.
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const H_MATIN = ["07:30", "08:25", "09:20", "10:30", "11:25", "12:20"];
const H_SOIR = ["13:00", "13:55", "14:50", "16:00", "16:55", "17:50"];
const buildSlots = (heures) => {
  const s = [];
  for (let d = 0; d < JOURS.length; d++)
    for (let p = 0; p < heures.length; p++) s.push({ id: `${JOURS[d]}-${heures[p]}`, jour: JOURS[d], heure: heures[p], d, p });
  return s;
};
const SLOTS = { Matin: buildSlots(H_MATIN), "Apres-midi": buildSlots(H_SOIR) };

/* ------------------------------- Noms fictifs ------------------------------ */
const NOMS = ["KOUASSI","KONÉ","DIABATÉ","TRAORÉ","YAO","KOUAMÉ","BAMBA","OUATTARA","COULIBALY","DOUMBIA","N'GUESSAN","TOURÉ","CISSÉ","BROU","TANOH","AKA","KOFFI","DIALLO","FOFANA","GNAGNE","KASSI","ASSI","ADJÉ","ZADI","GUÉI","SANGARÉ","BAKAYOKO","KONÉ","DJÉ","ABLÉ"];
const PRENOMS_M = ["Koffi","Yao","Adama","Ibrahim","Jean","Serge","Aboubacar","Daniel","Moussa","Paul","Arnaud","Cédric","Franck","Hervé","Marc","Olivier","Roland","Thierry","Yannick","Guy"];
const PRENOMS_F = ["Awa","Aïcha","Marie","Grace","Hélène","Mariam","Fatou","Aya","Affoué","Estelle","Carine","Nadège","Sandrine","Christelle","Mireille","Rachelle","Prisca","Sylvie","Joëlle","Léa"];
const fullName = () => {
  const isF = rng() < 0.5;
  const prenom = isF ? pick(PRENOMS_F) : pick(PRENOMS_M);
  return { nom: pick(NOMS), prenom, genre: isF ? "F" : "M" };
};

/* --------------------------- 1) Classes & élèves --------------------------- */
const classes = [];
let classSeq = 0;
for (const lvl of LEVELS) {
  const base = Math.floor(lvl.effectif / lvl.classes);
  let reste = lvl.effectif - base * lvl.classes;
  for (let i = 1; i <= lvl.classes; i++) {
    const effectif = base + (reste-- > 0 ? 1 : 0);
    classes.push({
      id: `C${String(++classSeq).padStart(3, "0")}`,
      label: `${lvl.id}-${i}`,
      level: lvl.id,
      cycle: lvl.cycle,
      flux: lvl.flux,
      effectif,
      curriculum: CURRICULUM[lvl.cycle],
    });
  }
}

// Élèves (3500) répartis dans les classes
const eleves = [];
let eleveSeq = 0;
for (const c of classes) {
  for (let i = 0; i < c.effectif; i++) {
    const n = fullName();
    eleves.push({
      matricule: `EL${String(++eleveSeq).padStart(4, "0")}`,
      nom: n.nom, prenom: n.prenom, genre: n.genre,
      classe: c.label, niveau: c.level, flux: c.flux,
    });
  }
}

/* ----------------------------- 2) Salles / flux ---------------------------- */
const classesMatin = classes.filter((c) => c.flux === "Matin");
const classesSoir = classes.filter((c) => c.flux === "Apres-midi");
// Salle « base » par classe, propre à chaque flux (les flux ne se chevauchent pas
// dans le temps → une même salle physique sert matin ET après-midi).
classesMatin.forEach((c, i) => (c.salle = `S${String((i % NB_SALLES) + 1).padStart(2, "0")}`));
classesSoir.forEach((c, i) => (c.salle = `S${String((i % NB_SALLES) + 1).padStart(2, "0")}`));

/* --------------------------- 3) Enseignants -------------------------------- */
// Heures totales par matière (toutes classes confondues) → nb d'enseignants.
const hoursBySubject = {};
for (const c of classes)
  for (const [sub, h] of Object.entries(c.curriculum)) hoursBySubject[sub] = (hoursBySubject[sub] || 0) + h;

const teachers = []; // {id, nom, prenom, matiere, charge}
const teachersBySubject = {};
let teacherSeq = 0;
for (const [sub, totalH] of Object.entries(hoursBySubject)) {
  const n = ceil(totalH / MAX_LOAD);
  teachersBySubject[sub] = [];
  for (let i = 0; i < n; i++) {
    const nm = fullName();
    const t = { id: `P${String(++teacherSeq).padStart(3, "0")}`, nom: nm.nom, prenom: nm.prenom, genre: nm.genre, matiere: sub, charge: 0 };
    teachers.push(t);
    teachersBySubject[sub].push(t);
  }
}

// Affecter chaque (classe, matière) à un enseignant de la matière (équilibrage de charge ≤ MAX_LOAD)
const assignment = {}; // classId -> subject -> teacher
for (const c of classes) {
  assignment[c.id] = {};
  for (const [sub, h] of Object.entries(c.curriculum)) {
    const pool = teachersBySubject[sub];
    // enseignant le moins chargé pouvant absorber h
    let chosen = pool.filter((t) => t.charge + h <= MAX_LOAD).sort((a, b) => a.charge - b.charge)[0];
    if (!chosen) chosen = pool.sort((a, b) => a.charge - b.charge)[0]; // sécurité
    chosen.charge += h;
    assignment[c.id][sub] = chosen;
  }
}

/* --------------------- 4) Génération de l'EDT (sans conflit) ---------------- */
// Coloration gloutonne : pour chaque heure de cours, trouver un créneau libre
// pour la CLASSE et pour l'ENSEIGNANT. La salle = salle-base de la classe (jamais
// de conflit de salle car chaque classe occupe sa salle pendant son flux).
function scheduleFlux(fluxName, fluxClasses) {
  const slots = SLOTS[fluxName];
  const classBusy = new Map(fluxClasses.map((c) => [c.id, new Set()]));
  const teacherBusy = new Map(); // teacherId -> Set(slotId)
  const edt = new Map(fluxClasses.map((c) => [c.id, {}])); // classId -> slotId -> lesson
  let placed = 0, unplaced = 0;
  let roomSlotUse = 0;

  // Construire la liste des heures à placer (mélangée pour bien étaler)
  const lessons = [];
  for (const c of shuffle(fluxClasses))
    for (const [sub, h] of Object.entries(c.curriculum))
      for (let k = 0; k < h; k++) lessons.push({ c, sub });

  for (const { c, sub } of lessons) {
    const t = assignment[c.id][sub];
    if (!teacherBusy.has(t.id)) teacherBusy.set(t.id, new Set());
    const tb = teacherBusy.get(t.id);
    const cb = classBusy.get(c.id);
    const slot = shuffle(slots).find((s) => !cb.has(s.id) && !tb.has(s.id));
    if (slot) {
      cb.add(slot.id); tb.add(slot.id);
      edt.get(c.id)[slot.id] = { sub, teacher: `${t.prenom} ${t.nom}`, teacherId: t.id, salle: c.salle };
      placed++; roomSlotUse++;
    } else unplaced++;
  }

  // Vérification de conflits (salle + enseignant) sur l'EDT produit
  const roomAt = {}; // slotId -> Set(salle)
  const teacherAt = {}; // slotId -> Set(teacherId)
  let conflictsSalle = 0, conflictsProf = 0;
  for (const [, grid] of edt) {
    for (const [slotId, l] of Object.entries(grid)) {
      (roomAt[slotId] ??= new Set());
      if (roomAt[slotId].has(l.salle)) conflictsSalle++; else roomAt[slotId].add(l.salle);
      (teacherAt[slotId] ??= new Set());
      if (teacherAt[slotId].has(l.teacherId)) conflictsProf++; else teacherAt[slotId].add(l.teacherId);
    }
  }
  return { edt, placed, unplaced, conflictsSalle, conflictsProf, roomSlotUse, slots };
}

const resMatin = scheduleFlux("Matin", classesMatin);
const resSoir = scheduleFlux("Apres-midi", classesSoir);

/* ------------------------------- 5) Rapport -------------------------------- */
const totalEleves = eleves.length;
const totalClasses = classes.length;
const totalProfs = teachers.length;
const totalHeures = Object.values(hoursBySubject).reduce((a, b) => a + b, 0);
const sallesMatin = new Set(classesMatin.map((c) => c.salle)).size;
const sallesSoir = new Set(classesSoir.map((c) => c.salle)).size;

const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);

let R = "";
const line = (s = "") => (R += s + "\n");

line("═".repeat(78));
line("  SIMULATION — GÉNÉRATION D'EDT · LYCÉE À EFFECTIF PLÉTHORIQUE");
line("═".repeat(78));
line(`  Élèves : ${totalEleves}   ·   Salles physiques : ${NB_SALLES}   ·   Classes pédagogiques : ${totalClasses}`);
line(`  Taille moyenne d'une classe : ${(totalEleves / totalClasses).toFixed(1)} élèves (norme ~40)`);
line("");
line("─ 1) RÉPARTITION DES EFFECTIFS (décroissante 6e → Tle) ".padEnd(78, "─"));
line(`  ${pad("Niveau", 7)}${padL("Effectif", 9)}${padL("Classes", 9)}${padL("Moy./classe", 13)}  Flux`);
for (const lvl of LEVELS) {
  const moy = (lvl.effectif / lvl.classes).toFixed(1);
  line(`  ${pad(lvl.id, 7)}${padL(lvl.effectif, 9)}${padL(lvl.classes, 9)}${padL(moy, 13)}  ${lvl.flux}`);
}
line(`  ${pad("TOTAL", 7)}${padL(totalEleves, 9)}${padL(totalClasses, 9)}`);
line("");
line("─ 2) CONTRAINTE SALLES → DOUBLE VACATION ".padEnd(78, "─"));
line(`  Classes pédagogiques nécessaires : ${totalClasses}`);
line(`  Salles physiques disponibles     : ${NB_SALLES}`);
line(`  Déficit en vacation unique       : ${totalClasses - NB_SALLES} salles (infaisable à 1 flux)`);
line(`  → SOLUTION : double vacation (le parc de 50 salles est réutilisé)`);
line(`     • Matin     (Collège 6e–3e) : ${classesMatin.length} classes → ${sallesMatin} salles utilisées (${((sallesMatin / NB_SALLES) * 100).toFixed(0)} %)`);
line(`     • Après-midi (Lycée 2nde–Tle): ${classesSoir.length} classes → ${sallesSoir} salles utilisées (${((sallesSoir / NB_SALLES) * 100).toFixed(0)} %)`);
line("");
line("─ 3) CORPS ENSEIGNANT GÉNÉRÉ ".padEnd(78, "─"));
line(`  Heures de cours à dispenser / semaine : ${totalHeures} h`);
line(`  Enseignants nécessaires (≤ ${MAX_LOAD} h/sem) : ${totalProfs}`);
line(`  ${pad("Matière", 24)}${padL("Heures", 8)}${padL("Profs", 7)}${padL("Charge moy.", 13)}`);
for (const [sub, h] of Object.entries(hoursBySubject).sort((a, b) => b[1] - a[1])) {
  const np = teachersBySubject[sub].length;
  const moy = (teachersBySubject[sub].reduce((a, t) => a + t.charge, 0) / np).toFixed(1);
  line(`  ${pad(sub, 24)}${padL(h, 8)}${padL(np, 7)}${padL(moy + " h", 13)}`);
}
line("");
line("─ 4) EDT GÉNÉRÉ — VÉRIFICATION DES CONFLITS ".padEnd(78, "─"));
const tot = (r) => r.placed + r.unplaced;
line(`  ${pad("Flux", 12)}${padL("Heures placées", 16)}${padL("Non placées", 13)}${padL("Conflits salle", 16)}${padL("Conflits prof", 15)}`);
for (const [name, r] of [["Matin", resMatin], ["Après-midi", resSoir]]) {
  line(`  ${pad(name, 12)}${padL(`${r.placed}/${tot(r)}`, 16)}${padL(r.unplaced, 13)}${padL(r.conflictsSalle, 16)}${padL(r.conflictsProf, 15)}`);
}
const okGlobal = resMatin.unplaced + resSoir.unplaced + resMatin.conflictsSalle + resSoir.conflictsSalle + resMatin.conflictsProf + resSoir.conflictsProf === 0;
line("");
line(`  VERDICT : ${okGlobal ? "✅ EDT FAISABLE — 100 % des heures placées, 0 conflit (salle & enseignant)" : "⚠️ Conflits/heures non placées détectés"}`);
line("");

// Échantillon : EDT hebdomadaire d'une classe (6e-1)
const sampleClass = classes.find((c) => c.label === "6e-1");
const sampleRes = sampleClass.flux === "Matin" ? resMatin : resSoir;
const sampleHeures = sampleClass.flux === "Matin" ? H_MATIN : H_SOIR;
line(`─ 5) ÉCHANTILLON — EDT HEBDOMADAIRE DE LA CLASSE ${sampleClass.label} (salle ${sampleClass.salle}) `.padEnd(78, "─"));
line(`  ${pad("Heure", 8)}${JOURS.map((j) => pad(j, 11)).join("")}`);
for (const h of sampleHeures) {
  let row = `  ${pad(h, 8)}`;
  for (const j of JOURS) {
    const l = sampleRes.edt.get(sampleClass.id)[`${j}-${h}`];
    row += pad(l ? l.sub.slice(0, 10) : "—", 11);
  }
  line(row);
}
line("");
line("═".repeat(78));
line(`  Fichiers générés dans /simulation : eleves.csv (${totalEleves}), enseignants.csv (${totalProfs}),`);
line(`  edt-complet.json, resume.json`);
line("═".repeat(78));

console.log(R);

/* ------------------------------- 6) Fichiers ------------------------------- */
const toCsv = (rows, headers) =>
  [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");

writeFileSync(path.join(outDir, "eleves.csv"), toCsv(eleves, ["matricule", "nom", "prenom", "genre", "classe", "niveau", "flux"]), "utf8");
writeFileSync(
  path.join(outDir, "enseignants.csv"),
  toCsv(teachers.map((t) => ({ ...t })), ["id", "nom", "prenom", "genre", "matiere", "charge"]),
  "utf8",
);

const edtExport = {};
for (const r of [resMatin, resSoir])
  for (const [cid, grid] of r.edt) {
    const c = classes.find((x) => x.id === cid);
    edtExport[c.label] = { salle: c.salle, flux: c.flux, creneaux: grid };
  }
writeFileSync(path.join(outDir, "edt-complet.json"), JSON.stringify(edtExport, null, 1), "utf8");

const resume = {
  eleves: totalEleves, salles: NB_SALLES, classes: totalClasses,
  tailleMoyenne: +(totalEleves / totalClasses).toFixed(1),
  niveaux: LEVELS.map((l) => ({ niveau: l.id, effectif: l.effectif, classes: l.classes, flux: l.flux })),
  doubleVacation: { matin: classesMatin.length, apresMidi: classesSoir.length, sallesMatin, sallesSoir },
  enseignants: totalProfs, heuresHebdo: totalHeures,
  parMatiere: Object.fromEntries(Object.entries(hoursBySubject).map(([s, h]) => [s, { heures: h, profs: teachersBySubject[s].length }])),
  edt: {
    matin: { placed: resMatin.placed, unplaced: resMatin.unplaced, conflitsSalle: resMatin.conflictsSalle, conflitsProf: resMatin.conflictsProf },
    apresMidi: { placed: resSoir.placed, unplaced: resSoir.unplaced, conflitsSalle: resSoir.conflictsSalle, conflitsProf: resSoir.conflictsProf },
    faisable: okGlobal,
  },
};
writeFileSync(path.join(outDir, "resume.json"), JSON.stringify(resume, null, 2), "utf8");
