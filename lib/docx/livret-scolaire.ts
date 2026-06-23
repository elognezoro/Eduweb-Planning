import {
  Document,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { CYCLE1_SUBJECTS, CYCLE2_SUBJECTS, type LivretSubject } from "@/lib/livret/subjects";
import type { LivretResolved } from "@/lib/livret/types";

/* Helpers docx inlinés (le module lib/docx/utils.ts dépend de node:fs et ne peut
   pas être importé dans ce module exécuté côté client). */
const COLOR_GREEN = "176B45";
const COLOR_GRAY = "555555";
const heading1 = (text: string) =>
  new Paragraph({ spacing: { before: 160, after: 80 }, children: [new TextRun({ text, bold: true, color: COLOR_GREEN, size: 32 })] });
const heading2 = (text: string) =>
  new Paragraph({ spacing: { before: 100, after: 60 }, children: [new TextRun({ text, bold: true, color: COLOR_GREEN, size: 24 })] });
const spacer = (after: number) => new Paragraph({ spacing: { after }, children: [] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

/* ============================================================================
   Export Word (.docx) du livret scolaire CI (13 sections), conforme au modèle.
   Texte structuré (sans images : le PDF imprimable porte logo/cachet/signature).
   Généré côté client (Packer.toBlob).
   ========================================================================== */

const WHITE = "FFFFFF";
const f2 = (n: number | null | undefined) => (n == null ? "" : n.toFixed(2));
const ord = (n: number | null | undefined) => (n == null ? "" : n === 1 ? "1er" : `${n}e`);
const fmtDate = (iso?: string) => {
  if (!iso || !iso.includes("-")) return "……/……/………";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

function txtCell(s: string, opts: { bold?: boolean; color?: string; align?: "left" | "center" } = {}) {
  return new TableCell({
    children: [
      new Paragraph({
        alignment: opts.align === "center" ? "center" : "left",
        children: [new TextRun({ text: s ?? "", size: 16, bold: opts.bold, color: opts.color })],
      }),
    ],
  });
}
function headCell(s: string) {
  return new TableCell({
    shading: { fill: COLOR_GREEN, type: "clear", color: "auto" },
    children: [new Paragraph({ children: [new TextRun({ text: s, bold: true, color: WHITE, size: 16 })] })],
  });
}
function table(headers: string[], rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map(headCell) }),
      ...rows.map((r) => new TableRow({ children: r.map((c) => txtCell(c)) })),
    ],
  });
}
function kvRows(pairs: [string, string][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: pairs.map(
      ([k, v]) =>
        new TableRow({
          children: [txtCell(k, { color: COLOR_GRAY }), txtCell(v, { bold: true })],
        }),
    ),
  });
}

function notesTable(subjects: LivretSubject[], data: LivretResolved, filled: boolean) {
  const byKey = new Map(data.notes.subjects.map((r) => [r.subjectKey, r]));
  const headers = ["Matières", "T1 moy", "T1 pl.", "T2 moy", "T2 pl.", "T3 moy", "T3 pl.", "Moy. ann.", "Class."];
  const rows = subjects.map((subj) => {
    const r = filled ? byKey.get(subj.key) : undefined;
    return [
      subj.label,
      r ? f2(r.terms[0]?.moy) : "",
      r ? ord(r.terms[0]?.place) : "",
      r ? f2(r.terms[1]?.moy) : "",
      r ? ord(r.terms[1]?.place) : "",
      r ? f2(r.terms[2]?.moy) : "",
      r ? ord(r.terms[2]?.place) : "",
      r ? f2(r.moyenneAnnuelle) : "",
      r ? ord(r.classementAnnuel) : "",
    ];
  });
  const g = data.notes.general;
  rows.push([
    "MOYENNE GÉNÉRALE",
    filled ? f2(g.terms[0]?.moy) : "",
    filled ? ord(g.terms[0]?.rang) : "",
    filled ? f2(g.terms[1]?.moy) : "",
    filled ? ord(g.terms[1]?.rang) : "",
    filled ? f2(g.terms[2]?.moy) : "",
    filled ? ord(g.terms[2]?.rang) : "",
    filled ? f2(g.annuel.moy) : "",
    filled ? ord(g.annuel.rang) : "",
  ]);
  return table(headers, rows);
}

function appreciationBlocks(data: LivretResolved, filled: boolean): (Paragraph | Table)[] {
  const a = data.appreciation;
  const line = (label: string, value: string) =>
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `${label} : `, bold: true, color: COLOR_GREEN, size: 18 }),
        new TextRun({ text: filled ? value : "", size: 18 }),
      ],
    });
  return [
    kvRows([
      ["Moyenne générale annuelle", filled ? `${f2(a.moyenneGeneraleAnnuelle)} /20` : ""],
      ["Classement général annuel", filled ? ord(a.classementGeneralAnnuel) : ""],
    ]),
    spacer(80),
    line("Appréciations des professeurs", a.appreciationProfesseurs),
    line("Observations du professeur principal", a.observationProfPrincipal),
    line("Date (prof. principal)", a.dateProfPrincipal),
    line("Visa et observation du chef d'établissement", a.visaChef),
    line("Date (chef d'établissement)", a.dateChef),
    line("Décision de fin d'année — Admis(e) en", a.decisionAdmisEn),
    new Paragraph({ spacing: { before: 60, after: 40 }, children: [new TextRun({ text: "Distinctions / sanctions", bold: true, color: COLOR_GREEN, size: 18 })] }),
    kvRows([
      ["1er Trimestre", a.distinctions.t1],
      ["2e Trimestre", a.distinctions.t2],
      ["3e Trimestre", a.distinctions.t3],
      ["Mention spéciale", a.distinctions.mentionSpeciale],
    ]),
  ];
}

export async function buildLivretScolaireDocx(data: LivretResolved): Promise<Blob> {
  const e = data.etab;
  const id = data.identity;
  const cycle = data.cycle;

  const children: (Paragraph | Table)[] = [
    // Couverture
    new Paragraph({ alignment: "center", children: [new TextRun({ text: e.official, bold: true, size: 24 })] }),
    new Paragraph({ alignment: "center", children: [new TextRun({ text: "Union — Discipline — Travail", italics: true, size: 18, color: COLOR_GRAY })] }),
    new Paragraph({ alignment: "center", children: [new TextRun({ text: e.ministry, size: 18 })] }),
    spacer(120),
    new Paragraph({ alignment: "center", children: [new TextRun({ text: "LIVRET SCOLAIRE", bold: true, size: 40, color: COLOR_GREEN })] }),
    new Paragraph({ alignment: "center", children: [new TextRun({ text: "Enseignements Classique, Moderne et Technique", italics: true, size: 18, color: COLOR_GRAY })] }),
    spacer(160),
    kvRows([
      ["Établissement", e.institution],
      ["Direction Régionale / Départementale", e.regionalDirection],
      ["Localité", e.locality],
      ["Code établissement", e.code],
      ["Année scolaire", e.schoolYear],
      ["N° Matricule (élève)", id.matricule],
      ["Nom de l'élève", `${id.nom} ${id.prenoms}`],
      ["Date de naissance", fmtDate(id.dateNaissance)],
    ]),

    // Identité
    pageBreak(),
    heading1("Identité de l'élève"),
    kvRows([
      ["Nom", id.nom],
      ["Prénoms", id.prenoms],
      ["Sexe", id.sexe === "M" ? "Masculin" : "Féminin"],
      ["Date de naissance", fmtDate(id.dateNaissance)],
      ["Lieu de naissance", id.lieuNaissance],
      ["Nationalité", id.nationalite],
      ["Matricule", id.matricule],
      ["Classe", id.className],
      ["Série / Option", id.serie],
      ["Cycle", cycle === 1 ? "1er cycle" : "2e cycle"],
    ]),

    // Médical
    pageBreak(),
    heading1("Observations diverses (suivi médical)"),
    ...data.medicalStages.flatMap((m) => [
      heading2(m.classe),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: m.observationMedecin || "—", italics: true, size: 18 })] }),
    ]),

    // Parents
    pageBreak(),
    heading1("Adresse des parents ou tuteurs"),
    table(
      ["Année", "Nom", "Adresse", "Tél. bureau", "Tél. domicile"],
      (data.parents.length ? data.parents : [{ annee: "", nom: "", adresse: "", telBureau: "", telDomicile: "" }]).map((p) => [
        p.annee,
        p.nom,
        p.adresse,
        p.telBureau,
        p.telDomicile,
      ]),
    ),

    // 1er cycle
    pageBreak(),
    heading1("1er Cycle — Notes"),
    notesTable(CYCLE1_SUBJECTS, data, cycle === 1),
    pageBreak(),
    heading1("1er Cycle — Appréciations et décision"),
    ...appreciationBlocks(data, cycle === 1),

    // 2e cycle
    pageBreak(),
    heading1("2e Cycle — Notes"),
    notesTable(CYCLE2_SUBJECTS, data, cycle === 2),
    pageBreak(),
    heading1("2e Cycle — Appréciations et décision"),
    ...appreciationBlocks(data, cycle === 2),

    // Établissements successifs
    pageBreak(),
    heading1("Inscriptions des établissements successifs"),
    table(
      ["Année scol.", "Classe", "Moy. ann.", "Établissement", "Observations"],
      (data.etabSuccessifs.length ? data.etabSuccessifs : [{ anneeScolaire: "", classe: "", moyenneAnnuelle: "", nomEtablissement: "", observations: "" }]).map((r) => [
        r.anneeScolaire,
        r.classe,
        r.moyenneAnnuelle,
        r.nomEtablissement,
        r.observations,
      ]),
    ),

    // Diplômes
    pageBreak(),
    heading1("Diplômes obtenus"),
    table(
      ["Année scol.", "Établissement", "Appréciation du Président du jury"],
      (data.diplomes.length ? data.diplomes : [{ etablissement: "", anneeScolaire: "", appreciationPresidentJury: "" }]).map((d) => [
        d.anneeScolaire,
        d.etablissement,
        d.appreciationPresidentJury,
      ]),
    ),

    // Extension
    pageBreak(),
    heading1("Page d'extension du livret"),
    new Paragraph({ children: [new TextRun({ text: data.extension.observationsComplementaires || "—", italics: true, size: 18 })] }),
    spacer(200),
    new Paragraph({ alignment: "right", children: [new TextRun({ text: `${e.headFunction} — ${e.headName}`, size: 18, color: COLOR_GRAY })] }),
  ];

  const doc = new Document({
    creator: "EduWeb Planner",
    title: `Livret scolaire — ${id.nom} ${id.prenoms}`,
    sections: [
      {
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

/** Génère et déclenche le téléchargement du livret au format Word. */
export async function downloadLivretScolaireWord(data: LivretResolved, filename = "livret-scolaire.docx") {
  const blob = await buildLivretScolaireDocx(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
