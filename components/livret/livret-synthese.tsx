/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Download, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toNomCase, toPrenomCase } from "@/lib/format-name";
import type { EtabExportMeta } from "@/lib/etab-config";
import type { Eleve } from "@/lib/types";
import type { LivretSyntheseData } from "@/lib/exports/livret-synthese";

/* ----------------------------- Données générées ----------------------------- */
const LIVRET_DISCIPLINES: { name: string; coef: number }[] = [
  { name: "Français", coef: 4 },
  { name: "Mathématiques", coef: 4 },
  { name: "Anglais", coef: 3 },
  { name: "Histoire-Géographie", coef: 2 },
  { name: "SVT", coef: 2 },
  { name: "Physique-Chimie", coef: 2 },
  { name: "EDHC", coef: 1 },
  { name: "EPS", coef: 1 },
  { name: "Informatique / TICE", coef: 1 },
];

const CITIES = ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa", "Korhogo", "San-Pédro", "Man", "Gagnoa", "Divo", "Abengourou"];
const PROFESSIONS = ["Commerçant(e)", "Enseignant(e)", "Fonctionnaire", "Cultivateur(trice)", "Infirmier(ère)", "Artisan(e)", "Ingénieur", "Comptable"];
const COMPETENCES_LIST = [
  "Assiduité", "Ponctualité", "Discipline", "Participation en classe", "Travail personnel",
  "Esprit d'équipe", "Respect des enseignants", "Respect du règlement intérieur", "Autonomie", "Leadership",
];
const RATINGS = ["Très satisfaisant", "Satisfaisant", "Moyen", "Insuffisant"];
const ACTIVITIES_LIST = ["Club scientifique", "Club littéraire", "Sport scolaire", "Activités culturelles", "Concours / Olympiades", "Autres"];
const BLOOD = ["O+", "A+", "B+", "O-", "AB+", "A-", "B-", "AB-"];
const DECISIONS = [
  "Admis en classe supérieure", "Redouble", "Exclu", "Réorientation proposée",
  "Autorisé à reprendre", "Présenté à l'examen", "Non présenté à l'examen",
];
const CONDUITE_OPTS = ["Très bonne", "Bonne", "Passable", "Insuffisante"];

const seedOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
const ord = (n: number) => (n === 1 ? "1er" : `${n}e`);
const fmtDate = (iso?: string) => {
  if (!iso || !iso.includes("-")) return "……/……/………";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const apprecDisc = (m: number) =>
  m >= 16 ? "Très Bien" : m >= 14 ? "Bien" : m >= 12 ? "Assez Bien" : m >= 10 ? "Passable" : m >= 8 ? "Médiocre" : "Insuffisant";

function apprecProf(m: number): string {
  if (m >= 16) return "Excellent trimestre. Élève brillant(e) et très impliqué(e). Vives félicitations du conseil de classe.";
  if (m >= 14) return "Bon trimestre, travail sérieux et régulier. Encouragements à poursuivre dans cette voie.";
  if (m >= 12) return "Trimestre satisfaisant dans l'ensemble. Des efforts restent à fournir dans certaines disciplines.";
  if (m >= 10) return "Résultats justes. Un travail plus soutenu et régulier permettra de progresser nettement.";
  if (m >= 8) return "Trimestre difficile. Une mobilisation et davantage d'assiduité sont attendues.";
  return "Résultats insuffisants. Le conseil de classe attend un net sursaut au prochain trimestre.";
}
function obsChef(m: number): string {
  if (m >= 14) return "Bon parcours. Le chef d'établissement félicite l'élève et l'encourage à maintenir ce niveau.";
  if (m >= 10) return "Parcours correct. L'élève est invité(e) à consolider ses acquis et à viser plus haut.";
  return "Le chef d'établissement invite l'élève à fournir davantage d'efforts et à suivre un accompagnement renforcé.";
}
/** Avis du conseil de classe, case par case — « Tableau d'honneur » se coche dès que la moyenne ≥ 12/20. */
const avisChecked = (label: string, m: number): boolean => {
  switch (label) {
    case "Félicitations":
      return m >= 16;
    case "Tableau d'honneur":
      return m >= 12;
    case "Encouragements":
      return m >= 10 && m < 12;
    case "Avertissement travail":
      return m >= 8 && m < 10;
    case "Blâme":
      return m < 8;
    default:
      return false;
  }
};

export interface TermData {
  rows: { name: string; coef: number; moy: number; moyCoef: number; rang: number; appr: string }[];
  totalCoef: number;
  totalPoints: number;
  moyGen: number;
  rangEleve: number;
  moyClasse: number;
  plusForte: number;
  plusFaible: number;
  absJust: number;
  absNon: number;
  retards: number;
  conduite: string;
}

function genTerm(sid: string, t: number, effectif: number): TermData {
  const rows = LIVRET_DISCIPLINES.map((d) => {
    const sd = seedOf(`${sid}|${d.name}|${t}`);
    const moy = Math.min(19.5, Math.max(6, Math.round((8 + (sd % 23) * 0.5) * 100) / 100));
    const rang = (sd % effectif) + 1;
    return { name: d.name, coef: d.coef, moy, moyCoef: Math.round(moy * d.coef * 100) / 100, rang, appr: apprecDisc(moy) };
  });
  const totalCoef = rows.reduce((a, r) => a + r.coef, 0);
  const totalPoints = Math.round(rows.reduce((a, r) => a + r.moyCoef, 0) * 100) / 100;
  const moyGen = Math.round((totalPoints / totalCoef) * 100) / 100;
  const sg = seedOf(`${sid}|synth|${t}`);
  const rangEleve = (sg % effectif) + 1;
  const moyClasse = Math.max(8, Math.round((moyGen - 1.2 + (sg % 9) * 0.1) * 100) / 100);
  const plusForte = Math.min(19.8, Math.round((moyGen + 2 + (sg % 5) * 0.3) * 100) / 100);
  const plusFaible = Math.max(2.5, Math.round((moyClasse - 4 - (sg % 4) * 0.4) * 100) / 100);
  return {
    rows,
    totalCoef,
    totalPoints,
    moyGen,
    rangEleve,
    moyClasse,
    plusForte,
    plusFaible,
    absJust: sg % 6,
    absNon: (sg >> 1) % 4,
    retards: sg % 3,
    conduite: moyGen >= 14 ? "Très bonne" : moyGen >= 11 ? "Bonne" : moyGen >= 8 ? "Passable" : "Insuffisante",
  };
}

/** Les 3 trimestres générés pour un élève (réutilisé par la page pour rester cohérent avec le PDF). */
export function livretTerms(studentId: string, effectif: number): TermData[] {
  return [0, 1, 2].map((t) => genTerm(studentId, t, effectif));
}
export const livretMention = (m: number) =>
  m >= 16 ? "Excellent" : m >= 14 ? "Très bien" : m >= 12 ? "Bien" : m >= 10 ? "Assez bien" : m >= 8 ? "Passable" : "Insuffisant";
export const livretOrd = ord;

/** Construit les données du récapitulatif annuel synthétique (modèle « fiche de synthèse »). */
export function buildLivretSynthese(student: Eleve, meta: EtabExportMeta, effectif: number): LivretSyntheseData {
  const terms = [0, 1, 2].map((t) => genTerm(student.id, t, effectif));
  const subjects = LIVRET_DISCIPLINES.map((disc, i) => {
    const r1 = terms[0].rows[i], r2 = terms[1].rows[i], r3 = terms[2].rows[i];
    const mgaMoy = (r1.moy + r2.moy + r3.moy) / 3;
    const mgaRang = (seedOf(`${student.id}|${disc.name}|mga`) % effectif) + 1;
    return {
      name: disc.name,
      t1: { moy: r1.moy.toFixed(2), rang: ord(r1.rang) },
      t2: { moy: r2.moy.toFixed(2), rang: ord(r2.rang) },
      t3: { moy: r3.moy.toFixed(2), rang: ord(r3.rang) },
      mga: { moy: mgaMoy.toFixed(2), rang: ord(mgaRang) },
    };
  });
  const annualNum = terms.reduce((a, t) => a + t.moyGen, 0) / terms.length;
  const rangAnnuel = Math.round(terms.reduce((a, t) => a + t.rangEleve, 0) / terms.length);
  const admis = annualNum >= 10;
  const grade = student.className.split(" ")[0];
  const nextGrade = ({ "6ᵉ": "5ᵉ", "5ᵉ": "4ᵉ", "4ᵉ": "3ᵉ", "3ᵉ": "2ⁿᵈᵉ", "2ⁿᵈᵉ": "1ʳᵉ", "1ʳᵉ": "Tˡᵉ" } as Record<string, string>)[grade];
  const isTerminale = student.className.startsWith("T");
  const admisEn = !admis ? "—" : nextGrade ? student.className.replace(grade, nextGrade) : "Présentation à l'examen";
  const decision = isTerminale ? (admis ? "Présenté à l'examen" : "Non présenté à l'examen") : admis ? "Admis(e) en classe supérieure" : "Redouble (maintien)";
  return {
    official: meta.official,
    ministry: meta.ministry,
    slogan: meta.slogan,
    schoolYear: meta.schoolYear,
    emblem: meta.nationalEmblem,
    institution: meta.institution !== "Établissement" ? meta.institution : "",
    proviseurFunction: meta.headFunction || "Le Proviseur",
    proviseur: meta.headName || "",
    student: { nom: toNomCase(student.lastName), prenoms: toPrenomCase(student.firstName), className: student.className, matricule: student.matricule },
    effectif,
    subjects,
    overall: {
      t1: { moy: terms[0].moyGen.toFixed(2), rang: ord(terms[0].rangEleve) },
      t2: { moy: terms[1].moyGen.toFixed(2), rang: ord(terms[1].rangEleve) },
      t3: { moy: terms[2].moyGen.toFixed(2), rang: ord(terms[2].rangEleve) },
      mga: { moy: annualNum.toFixed(2), rang: ord(rangAnnuel) },
    },
    appreciationProf: apprecProf(annualNum),
    decision,
    admisEn,
    mention: livretMention(annualNum),
    generatedAt: new Date().toLocaleDateString("fr-FR"),
  };
}

/* --------------------------------- UI atomes -------------------------------- */
const GREEN = "#176b45";
const GOLD = "#eba52a";
const Check = ({ on, children }: { on: boolean; children: React.ReactNode }) => (
  <span className="whitespace-nowrap">{on ? "☑" : "☐"} {children}</span>
);
const Dots = ({ value }: { value?: string | number }) =>
  value !== undefined && value !== "" ? <span className="font-medium">{value}</span> : <span className="tracking-tight text-gray-400">………………………………</span>;

/* ------------------------------ Page « résultats » -------------------------- */
function TermPage({ label, term, meta, effectif }: { label: string; term: TermData; meta: EtabExportMeta; effectif: number }) {
  const conduiteOpts = ["Très bonne", "Bonne", "Passable", "Insuffisante"];
  const avisOpts = ["Félicitations", "Encouragements", "Tableau d'honneur", "Avertissement travail", "Avertissement conduite", "Blâme"];
  return (
    <section className="livret-page">
      <h2 className="mb-3 text-[15px] font-extrabold" style={{ color: GREEN }}>Résultats scolaires — {label}</h2>
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr style={{ background: GREEN, color: "#fff" }}>
            <th className="border border-gray-400 px-2 py-1 text-left">Discipline</th>
            <th className="border border-gray-400 px-1 py-1 text-center">Coef.</th>
            <th className="border border-gray-400 px-1 py-1 text-center">Moyenne /20</th>
            <th className="border border-gray-400 px-1 py-1 text-center">Moy. coeff.</th>
            <th className="border border-gray-400 px-1 py-1 text-center">Rang</th>
            <th className="border border-gray-400 px-2 py-1 text-left">Appréciation du professeur</th>
          </tr>
        </thead>
        <tbody>
          {term.rows.map((r) => (
            <tr key={r.name}>
              <td className="border border-gray-400 px-2 py-1">{r.name}</td>
              <td className="border border-gray-400 px-1 py-1 text-center">{r.coef}</td>
              <td className="border border-gray-400 px-1 py-1 text-center font-bold">{r.moy.toFixed(2)}</td>
              <td className="border border-gray-400 px-1 py-1 text-center">{r.moyCoef.toFixed(2)}</td>
              <td className="border border-gray-400 px-1 py-1 text-center">{ord(r.rang)}</td>
              <td className="border border-gray-400 px-2 py-1 italic">{r.appr}</td>
            </tr>
          ))}
          <tr className="text-gray-400">
            <td className="border border-gray-400 px-2 py-1">Autre discipline</td>
            <td className="border border-gray-400 px-1 py-1" />
            <td className="border border-gray-400 px-1 py-1" />
            <td className="border border-gray-400 px-1 py-1" />
            <td className="border border-gray-400 px-1 py-1" />
            <td className="border border-gray-400 px-2 py-1" />
          </tr>
        </tbody>
      </table>

      <h3 className="mb-1 mt-4 text-[12px] font-bold text-gray-800">Synthèse du {label.toLowerCase()}</h3>
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr style={{ background: GREEN, color: "#fff" }}>
            <th className="border border-gray-400 px-2 py-1 text-left">Éléments</th>
            <th className="border border-gray-400 px-2 py-1 text-left">Données</th>
            <th className="border border-gray-400 px-2 py-1 text-left">Éléments</th>
            <th className="border border-gray-400 px-2 py-1 text-left">Données</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 px-2 py-1">Total des coefficients</td>
            <td className="border border-gray-400 px-2 py-1">{term.totalCoef}</td>
            <td className="border border-gray-400 px-2 py-1">Total des points</td>
            <td className="border border-gray-400 px-2 py-1">{term.totalPoints.toFixed(2)}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 px-2 py-1">Moyenne générale</td>
            <td className="border border-gray-400 px-2 py-1 font-bold">{term.moyGen.toFixed(2)} /20</td>
            <td className="border border-gray-400 px-2 py-1">Rang de l'élève</td>
            <td className="border border-gray-400 px-2 py-1 font-bold">{ord(term.rangEleve)} / {effectif}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 px-2 py-1">Effectif de la classe</td>
            <td className="border border-gray-400 px-2 py-1">{effectif}</td>
            <td className="border border-gray-400 px-2 py-1">Moyenne de la classe</td>
            <td className="border border-gray-400 px-2 py-1">{term.moyClasse.toFixed(2)} /20</td>
          </tr>
          <tr>
            <td className="border border-gray-400 px-2 py-1">Plus forte moyenne</td>
            <td className="border border-gray-400 px-2 py-1">{term.plusForte.toFixed(2)} /20</td>
            <td className="border border-gray-400 px-2 py-1">Plus faible moyenne</td>
            <td className="border border-gray-400 px-2 py-1">{term.plusFaible.toFixed(2)} /20</td>
          </tr>
          <tr>
            <td className="border border-gray-400 px-2 py-1">Absences justifiées</td>
            <td className="border border-gray-400 px-2 py-1">{term.absJust} heures</td>
            <td className="border border-gray-400 px-2 py-1">Absences non justifiées</td>
            <td className="border border-gray-400 px-2 py-1">{term.absNon} heures</td>
          </tr>
          <tr>
            <td className="border border-gray-400 px-2 py-1">Retards</td>
            <td className="border border-gray-400 px-2 py-1">{term.retards}</td>
            <td className="border border-gray-400 px-2 py-1">Conduite</td>
            <td className="border border-gray-400 px-2 py-1">
              {conduiteOpts.map((c) => (
                <span key={c} className="mr-2">{c === term.conduite ? "☑" : "☐"} {c}</span>
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-3 text-[10px] font-bold">Appréciation du professeur principal :</p>
      <div className="mt-1 min-h-[34px] rounded border border-gray-300 p-2 text-[10px] italic">{apprecProf(term.moyGen)}</div>

      <p className="mt-2 text-[10px] font-bold">Avis du conseil de classe :</p>
      <p className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
        {avisOpts.map((a) => (
          <Check key={a} on={avisChecked(a, term.moyGen)}>{a}</Check>
        ))}
      </p>

      <p className="mt-2 text-[10px] font-bold">Observations du chef d'établissement :</p>
      <div className="mt-1 min-h-[34px] rounded border border-gray-300 p-2 text-[10px] italic">{obsChef(term.moyGen)}</div>

      <table className="mt-3 w-full border-collapse text-[10px]">
        <thead>
          <tr className="text-left">
            <th className="border border-gray-300 px-2 py-1 font-semibold">Professeur principal</th>
            <th className="border border-gray-300 px-2 py-1 font-semibold">Chef d'établissement</th>
            <th className="border border-gray-300 px-2 py-1 font-semibold">Cachet de l'établissement</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-2 py-1 align-bottom h-16" />
            <td className="relative border border-gray-300 px-2 py-1 align-bottom h-16">
              {meta.signature && <img src={meta.signature} alt="" className="absolute left-2 top-1 h-9 object-contain" />}
              {meta.headName && <span className="text-[9px]">{meta.headName}</span>}
            </td>
            <td className="relative border border-gray-300 px-2 py-1 h-16">
              {meta.stamp && <img src={meta.stamp} alt="" className="absolute inset-0 m-auto h-14 w-14 object-contain opacity-80" />}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

/* ------------------------------- Document complet --------------------------- */
function LivretDocument({ student, meta, effectif }: { student: Eleve; meta: EtabExportMeta; effectif: number }) {
  const sd = seedOf(student.id);
  const ville = CITIES[sd % CITIES.length];
  const nom = toNomCase(student.lastName);
  const prenoms = toPrenomCase(student.firstName);
  const isTerminale = student.className.startsWith("T");
  const isLycee = isTerminale || student.className.includes("2") || student.className.includes("1ʳ");
  const serie = isTerminale ? (sd % 2 ? "D" : "A") : isLycee ? (sd % 2 ? "C" : "A") : "—";
  const statutAffecte = sd % 3 !== 0;
  const regime = ["Externe", "Demi-pensionnaire", "Interne"][sd % 3];
  const redoublant = sd % 7 === 0;
  const terms = [0, 1, 2].map((t) => genTerm(student.id, t, effectif));
  const annualNum = terms.reduce((a, t) => a + t.moyGen, 0) / terms.length;
  const rangAnnuel = Math.round(terms.reduce((a, t) => a + t.rangEleve, 0) / terms.length);
  const totalAbs = terms.reduce((a, t) => a + t.absJust + t.absNon, 0);
  const totalRetards = terms.reduce((a, t) => a + t.retards, 0);
  const conduiteAnnuelle = annualNum >= 14 ? "Très bonne" : annualNum >= 11 ? "Bonne" : annualNum >= 8 ? "Passable" : "Insuffisante";
  const admis = annualNum >= 10;
  const grade = student.className.split(" ")[0];
  const nextGrade = ({ "6ᵉ": "5ᵉ", "5ᵉ": "4ᵉ", "4ᵉ": "3ᵉ", "3ᵉ": "2ⁿᵈᵉ", "2ⁿᵈᵉ": "1ʳᵉ", "1ʳᵉ": "Tˡᵉ" } as Record<string, string>)[grade];
  const classeProposee = !admis ? student.className : nextGrade ? student.className.replace(grade, nextGrade) : "Présentation à l'examen";
  const decision = isTerminale ? (admis ? "Présenté à l'examen" : "Non présenté à l'examen") : admis ? "Admis en classe supérieure" : "Redouble";
  const groupeSanguin = BLOOD[sd % BLOOD.length];
  const today = new Date().toLocaleDateString("fr-FR");
  const compRating = (label: string) => { const k = seedOf(student.id + label) % 10; return k < 4 ? 0 : k < 8 ? 1 : k < 9 ? 2 : 3; };

  const pere = `${student.lastName.toUpperCase()} ${["Koffi", "Yao", "Konan", "Ibrahim", "Serge"][sd % 5]}`;
  const mere = `${["Kouamé", "Traoré", "Diallo", "Bamba", "Koné"][(sd + 3) % 5].toUpperCase()} ${["Aya", "Mariam", "Fatou", "Adjoua", "Aminata"][(sd + 1) % 5]}`;
  const phone = (k: number) => `+225 0${(7 + (k % 2))} ${String(10 + (k % 89)).padStart(2, "0")} ${String((k * 7) % 100).padStart(2, "0")} ${String((k * 13) % 100).padStart(2, "0")} ${String((k * 17) % 100).padStart(2, "0")}`;

  return (
    <div id="livret-print" className="text-black" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/* ---------------------------- PAGE 1 — Couverture --------------------------- */}
      <section className="livret-page">
        <div className="relative text-center">
          {/* Logo de l'établissement (haut droite) */}
          <div className="absolute right-0 top-0 flex w-20 flex-col items-center text-center">
            {meta.logo ? (
              <img src={meta.logo} alt="Logo établissement" className="h-12 w-auto max-w-full object-contain" />
            ) : (
              <GraduationCap className="h-10 w-10" style={{ color: GREEN }} />
            )}
            <span className="mt-1 text-[8px] leading-tight text-gray-500">{meta.institution !== "Établissement" ? meta.institution : "Établissement"}</span>
          </div>
          {/* Identité nationale : officiel → emblème → devise */}
          <p className="text-[12px] font-semibold uppercase tracking-wide">{meta.official}</p>
          {meta.nationalEmblem && <img src={meta.nationalEmblem} alt="Emblème national" className="mx-auto my-1 h-16 w-auto object-contain" />}
          <p className="text-[11px] italic text-gray-600">{meta.slogan || "Union – Discipline – Travail"}</p>
          <h1 className="mt-3 text-[24px] font-extrabold tracking-tight" style={{ color: GREEN }}>MODÈLE DE LIVRET SCOLAIRE</h1>
          <p className="text-[13px] font-semibold text-gray-700">Primaire · Collège · Lycée</p>
          <p className="mt-2 text-[12px] text-gray-700">{meta.ministry}</p>
        </div>

        <table className="mx-auto mt-8 w-full border-collapse text-[10.5px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className="w-[42%] border border-gray-400 px-3 py-1.5 text-left">Informations institutionnelles</th>
              <th className="border border-gray-400 px-3 py-1.5 text-center">Renseignements</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Direction Régionale / Départementale", meta.regionalDirection],
              ["Établissement", meta.institution !== "Établissement" ? meta.institution : ""],
              ["Adresse", meta.locality],
              ["E-mail", ""],
              ["Année scolaire", meta.schoolYear],
            ].map(([k, v], i) => (
              <tr key={k} className={i % 2 ? "bg-gray-50" : ""}>
                <td className="border border-gray-400 px-3 py-1.5 text-gray-600">{k}</td>
                <td className="border border-gray-400 px-3 py-1.5"><Dots value={v || undefined} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-5 text-[10.5px] leading-relaxed text-gray-700">
          Ce livret scolaire est un support de suivi pédagogique, administratif, comportemental et social de l'élève.
          Il peut être adapté selon l'ordre d'enseignement, le type d'établissement, la série, l'option et les
          exigences internes de l'école.
        </p>

        <table className="mt-8 w-full border-collapse text-[10px]">
          <thead>
            <tr className="text-left">
              <th className="w-1/3 border border-gray-300 px-3 py-1.5 font-semibold">Chef d'établissement</th>
              <th className="w-1/3 border border-gray-300 px-3 py-1.5 font-semibold">Professeur principal / Maître</th>
              <th className="border border-gray-300 px-3 py-1.5 font-semibold">Cachet</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-1.5 align-bottom h-24 text-[9px]">{meta.headName}</td>
              <td className="border border-gray-300 px-3 py-1.5 h-24" />
              <td className="relative border border-gray-300 px-3 py-1.5 h-24">
                {meta.stamp && <img src={meta.stamp} alt="" className="absolute inset-0 m-auto h-16 w-16 object-contain opacity-80" />}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ------------------------ PAGE 2 — Identification & parents ----------------- */}
      <section className="livret-page">
        <h2 className="mb-2 text-[15px] font-extrabold" style={{ color: GREEN }}>Identification de l'élève</h2>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className="border border-gray-400 px-2 py-1 text-left">Informations</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Renseignements</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Informations</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Renseignements</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Nom</td>
              <td className="border border-gray-400 px-2 py-1 font-semibold">{nom}</td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Prénoms</td>
              <td className="border border-gray-400 px-2 py-1 font-semibold">{prenoms}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Sexe</td>
              <td className="border border-gray-400 px-2 py-1"><Check on={student.gender === "M"}>Masculin</Check> &nbsp; <Check on={student.gender === "F"}>Féminin</Check></td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Date et lieu de naissance</td>
              <td className="border border-gray-400 px-2 py-1">{fmtDate(student.birthDate)} à {ville}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Nationalité</td>
              <td className="border border-gray-400 px-2 py-1">Ivoirienne</td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Matricule / Identifiant</td>
              <td className="border border-gray-400 px-2 py-1">{student.matricule}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Classe</td>
              <td className="border border-gray-400 px-2 py-1">{student.className}</td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Série / Option</td>
              <td className="border border-gray-400 px-2 py-1">{serie}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Statut</td>
              <td className="border border-gray-400 px-2 py-1"><Check on={statutAffecte}>Affecté</Check> &nbsp; <Check on={!statutAffecte}>Non affecté</Check></td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Régime</td>
              <td className="border border-gray-400 px-2 py-1 text-[9px]">
                <Check on={regime === "Externe"}>Externe</Check> <Check on={regime === "Demi-pensionnaire"}>Demi-pens.</Check> <Check on={regime === "Interne"}>Interne</Check>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Redoublant</td>
              <td className="border border-gray-400 px-2 py-1"><Check on={redoublant}>Oui</Check> &nbsp; <Check on={!redoublant}>Non</Check></td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Photo de l'élève</td>
              <td className="border border-gray-400 px-2 py-1 text-gray-400">À coller ici</td>
            </tr>
          </tbody>
        </table>

        <h2 className="mb-2 mt-5 text-[15px] font-extrabold" style={{ color: GREEN }}>Parents, tuteurs et urgence</h2>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className="w-1/4 border border-gray-400 px-2 py-1 text-left">Informations</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Père / Tuteur</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Mère / Tutrice</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Nom et prénoms", pere, mere],
              ["Profession", PROFESSIONS[sd % PROFESSIONS.length], PROFESSIONS[(sd + 4) % PROFESSIONS.length]],
              ["Téléphone", phone(sd), phone(sd + 11)],
              ["Adresse", `${ville}, Quartier ${1 + (sd % 9)}`, `${ville}, Quartier ${1 + (sd % 9)}`],
              ["E-mail", "", ""],
            ].map(([k, p, m]) => (
              <tr key={k}>
                <td className="border border-gray-400 px-2 py-1 text-gray-600">{k}</td>
                <td className="border border-gray-400 px-2 py-1"><Dots value={p || undefined} /></td>
                <td className="border border-gray-400 px-2 py-1"><Dots value={m || undefined} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="mt-3 w-full border-collapse text-[10px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className="w-1/3 border border-gray-400 px-2 py-1 text-left">Personne à contacter en cas d'urgence</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Renseignements</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-400 px-2 py-1 text-gray-600">Nom et prénoms</td><td className="border border-gray-400 px-2 py-1">{pere}</td></tr>
            <tr><td className="border border-gray-400 px-2 py-1 text-gray-600">Lien avec l'élève</td><td className="border border-gray-400 px-2 py-1">Parent</td></tr>
            <tr><td className="border border-gray-400 px-2 py-1 text-gray-600">Téléphone</td><td className="border border-gray-400 px-2 py-1">{phone(sd)}</td></tr>
          </tbody>
        </table>

        <h2 className="mb-2 mt-5 text-[15px] font-extrabold" style={{ color: GREEN }}>Parcours scolaire antérieur</h2>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className="border border-gray-400 px-2 py-1 text-left">Année scolaire</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Établissement fréquenté</th>
              <th className="border border-gray-400 px-2 py-1 text-center">Classe</th>
              <th className="border border-gray-400 px-2 py-1 text-center">Moyenne annuelle</th>
              <th className="border border-gray-400 px-2 py-1 text-center">Décision</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((k) => {
              const baseYear = Number((meta.schoolYear || "2025-2026").slice(0, 4)) - (3 - k);
              const moy = (10 + ((sd + k * 5) % 60) / 10).toFixed(2);
              return (
                <tr key={k}>
                  <td className="border border-gray-400 px-2 py-1">{baseYear} / {baseYear + 1}</td>
                  <td className="border border-gray-400 px-2 py-1">{meta.institution !== "Établissement" ? meta.institution : "Établissement précédent"}</td>
                  <td className="border border-gray-400 px-2 py-1 text-center text-gray-400">………</td>
                  <td className="border border-gray-400 px-2 py-1 text-center">{moy} /20</td>
                  <td className="border border-gray-400 px-2 py-1 text-center">Admis(e)</td>
                </tr>
              );
            })}
            {[3, 4].map((k) => (
              <tr key={k}>
                <td className="border border-gray-400 px-2 py-1 text-gray-400">…… / ……</td>
                <td className="border border-gray-400 px-2 py-1 text-gray-400">……………………</td>
                <td className="border border-gray-400 px-2 py-1" />
                <td className="border border-gray-400 px-2 py-1 text-center text-gray-400">……… /20</td>
                <td className="border border-gray-400 px-2 py-1" />
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ------------------------ PAGES 3-5 — Résultats trimestres ------------------ */}
      <TermPage label="Premier trimestre" term={terms[0]} meta={meta} effectif={effectif} />
      <TermPage label="Deuxième trimestre" term={terms[1]} meta={meta} effectif={effectif} />
      <TermPage label="Troisième trimestre" term={terms[2]} meta={meta} effectif={effectif} />

      {/* ------------------------ PAGE 6 — Bilan annuel & compétences --------------- */}
      <section className="livret-page">
        <h2 className="mb-2 text-[15px] font-extrabold" style={{ color: GREEN }}>Bilan annuel</h2>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className="border border-gray-400 px-2 py-1 text-left">Éléments</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Résultats</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Éléments</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Résultats</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Moyenne du 1er trimestre</td>
              <td className="border border-gray-400 px-2 py-1">{terms[0].moyGen.toFixed(2)} /20</td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Moyenne du 2e trimestre</td>
              <td className="border border-gray-400 px-2 py-1">{terms[1].moyGen.toFixed(2)} /20</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Moyenne du 3e trimestre</td>
              <td className="border border-gray-400 px-2 py-1">{terms[2].moyGen.toFixed(2)} /20</td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Moyenne annuelle</td>
              <td className="border border-gray-400 px-2 py-1 font-bold">{annualNum.toFixed(2)} /20</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Rang annuel</td>
              <td className="border border-gray-400 px-2 py-1">{ord(rangAnnuel)} / {effectif}</td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Effectif de la classe</td>
              <td className="border border-gray-400 px-2 py-1">{effectif}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Nombre total d'absences</td>
              <td className="border border-gray-400 px-2 py-1">{totalAbs} heures</td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Nombre total de retards</td>
              <td className="border border-gray-400 px-2 py-1">{totalRetards}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Conduite annuelle</td>
              <td className="border border-gray-400 px-2 py-1 text-[9px]">
                {CONDUITE_OPTS.map((c) => (
                  <span key={c} className="mr-1.5 whitespace-nowrap">{c === conduiteAnnuelle ? "☑" : "☐"} {c}</span>
                ))}
              </td>
              <td className="border border-gray-400 px-2 py-1 text-gray-600">Classe proposée</td>
              <td className="border border-gray-400 px-2 py-1 font-semibold">{classeProposee}</td>
            </tr>
          </tbody>
        </table>

        <h3 className="mb-1 mt-4 text-[13px] font-bold text-gray-800">Décision du conseil de classe</h3>
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
          {DECISIONS.map((d) => (
            <Check key={d} on={d === decision}>{d}</Check>
          ))}
        </p>
        <p className="mt-2 text-[10px] font-bold">Observation générale du conseil de classe :</p>
        <div className="mt-1 min-h-[48px] rounded border border-gray-300 p-2 text-[10px] italic">{obsChef(annualNum)}</div>

        <h2 className="mb-2 mt-5 text-[15px] font-extrabold" style={{ color: GREEN }}>Compétences transversales</h2>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className="border border-gray-400 px-2 py-1 text-left">Compétence</th>
              {RATINGS.map((r) => (
                <th key={r} className="border border-gray-400 px-1 py-1 text-center">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPETENCES_LIST.map((c) => {
              const r = compRating(c);
              return (
                <tr key={c}>
                  <td className="border border-gray-400 px-2 py-1">{c}</td>
                  {RATINGS.map((_, i) => (
                    <td key={i} className="border border-gray-400 px-1 py-1 text-center">{i === r ? "☑" : "☐"}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ------------- PAGE 7 — Activités, suivi médical, signatures finales -------- */}
      <section className="livret-page">
        <h2 className="mb-2 text-[15px] font-extrabold" style={{ color: GREEN }}>Activités extrascolaires</h2>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className="w-1/3 border border-gray-400 px-2 py-1 text-left">Activité</th>
              <th className="border border-gray-400 px-2 py-1 text-center">Participation</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Appréciation</th>
            </tr>
          </thead>
          <tbody>
            {ACTIVITIES_LIST.map((a) => {
              const oui = seedOf(student.id + a) % 2 === 0;
              return (
                <tr key={a}>
                  <td className="border border-gray-400 px-2 py-1">{a}</td>
                  <td className="border border-gray-400 px-2 py-1 text-center"><Check on={oui}>Oui</Check> <Check on={!oui}>Non</Check></td>
                  <td className="border border-gray-400 px-2 py-1 italic">{oui ? "Participation régulière et impliquée." : <Dots />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2 className="mb-2 mt-5 text-[15px] font-extrabold" style={{ color: GREEN }}>Suivi médical et social</h2>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className="w-1/3 border border-gray-400 px-2 py-1 text-left">Éléments</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Informations</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-400 px-2 py-1 text-gray-600">Groupe sanguin</td><td className="border border-gray-400 px-2 py-1">{groupeSanguin}</td></tr>
            <tr><td className="border border-gray-400 px-2 py-1 text-gray-600">Allergies connues</td><td className="border border-gray-400 px-2 py-1">Néant</td></tr>
            <tr><td className="border border-gray-400 px-2 py-1 text-gray-600">Maladies signalées</td><td className="border border-gray-400 px-2 py-1">Néant</td></tr>
            <tr><td className="border border-gray-400 px-2 py-1 text-gray-600">Handicap ou besoin spécifique</td><td className="border border-gray-400 px-2 py-1">Néant</td></tr>
            <tr><td className="border border-gray-400 px-2 py-1 align-top text-gray-600 h-14">Observations du service médico-social</td><td className="border border-gray-400 px-2 py-1" /></tr>
          </tbody>
        </table>

        <h2 className="mb-2 mt-5 inline-block text-[15px] font-extrabold" style={{ color: GREEN, borderBottom: `2px solid ${GOLD}`, paddingBottom: "2px" }}>Signatures finales</h2>
        <p className="text-[10px]">Fait à {meta.locality || "…………………………"}, le {today}</p>
        <table className="mt-2 w-full border-collapse text-[10px]">
          <thead>
            <tr className="text-left">
              <th className="w-1/3 border border-gray-300 px-2 py-1 font-semibold">Professeur principal / Maître</th>
              <th className="w-1/3 border border-gray-300 px-2 py-1 font-semibold">Chef d'établissement</th>
              <th className="border border-gray-300 px-2 py-1 font-semibold">Parent / Tuteur légal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-2 py-1 align-bottom h-20" />
              <td className="relative border border-gray-300 px-2 py-1 align-bottom h-20 text-[9px]">
                {meta.signature && <img src={meta.signature} alt="" className="absolute left-2 top-1 h-10 object-contain" />}
                {meta.stamp && <img src={meta.stamp} alt="" className="absolute right-2 top-1 h-14 w-14 object-contain opacity-80" />}
                {meta.headName}
              </td>
              <td className="border border-gray-300 px-2 py-1 h-20" />
            </tr>
          </tbody>
        </table>

        <p className="mt-4 text-[9.5px] italic text-gray-600">
          Ce modèle peut être personnalisé pour un établissement primaire, un collège, un lycée général, un lycée technique ou
          un établissement privé.
        </p>
        <p className="mt-2 text-center text-[9px] italic text-gray-400">S'instruire pour mieux espérer · EduWeb Planner © {new Date().getFullYear()}</p>
      </section>
    </div>
  );
}

/* ------------------------------- Overlay + portail -------------------------- */
export function LivretSynthese({
  open,
  student,
  meta,
  effectif,
  onClose,
}: {
  open: boolean;
  student: Eleve;
  meta: EtabExportMeta;
  effectif: number;
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="livret-overlay fixed inset-0 z-[70] overflow-y-auto bg-slate-900/50 p-4 sm:p-8">
      <div className="mx-auto max-w-[840px]">
        <div className="no-print mb-3 flex items-center justify-between gap-2 rounded-xl bg-white px-4 py-2 shadow">
          <span className="text-sm font-semibold text-foreground">Synthèse — Livret scolaire</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => window.print()}><Download className="h-4 w-4" /> Télécharger la synthèse PDF</Button>
            <Button size="sm" variant="outline" onClick={onClose}><X className="h-4 w-4" /> Fermer</Button>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg sm:p-10">
          <LivretDocument student={student} meta={meta} effectif={effectif} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
