import type { MatrixSubmission } from "@/components/app-shell/data-store";

/**
 * Génération heuristique d'une critique objective d'une matrice produite
 * par un participant (ex. « Matrice des publics » du séminaire SENEC).
 *
 * Le formateur peut utiliser ce premier jet comme base, puis l'éditer
 * avant publication. Le calcul est 100% local (aucun appel LLM).
 *
 * Analyse :
 *  - Taux de complétion des cellules
 *  - Densité (longueur moyenne par cellule)
 *  - Diversité (mots distincts)
 *  - Détection de mots-clés-types pour la matrice des publics (canal,
 *    message, preuve) et appréciation par ligne (Parents, Élèves, etc.)
 */

interface AnalyzedRow {
  label: string;
  filled: number;
  total: number;
  averageLength: number;
}

interface MatrixAnalysis {
  totalCells: number;
  filledCells: number;
  fillRate: number; // 0-1
  rows: AnalyzedRow[];
  /** Mots distincts à l'échelle de la matrice entière. */
  distinctWords: number;
  /** Longueur moyenne (caractères) par cellule remplie. */
  meanCellLength: number;
}

function analyze(submission: MatrixSubmission): MatrixAnalysis {
  const cols = Math.max(0, submission.headers.length - 1);
  const rows: AnalyzedRow[] = [];
  let filled = 0;
  let totalChars = 0;
  const words = new Set<string>();
  submission.rowLabels.forEach((label, r) => {
    let rowFilled = 0;
    let rowChars = 0;
    for (let c = 1; c < submission.headers.length; c++) {
      const v = (submission.cells[`${r}-${c}`] || "").trim();
      if (v.length > 0) {
        rowFilled++;
        filled++;
        totalChars += v.length;
        rowChars += v.length;
        v
          .toLowerCase()
          .split(/[^a-zàâäéèêëïîôöùûüç0-9-]+/i)
          .filter((w) => w.length >= 4)
          .forEach((w) => words.add(w));
      }
    }
    rows.push({
      label,
      filled: rowFilled,
      total: cols,
      averageLength: rowFilled > 0 ? Math.round(rowChars / rowFilled) : 0,
    });
  });
  const totalCells = submission.rowLabels.length * cols;
  return {
    totalCells,
    filledCells: filled,
    fillRate: totalCells > 0 ? filled / totalCells : 0,
    rows,
    distinctWords: words.size,
    meanCellLength: filled > 0 ? Math.round(totalChars / filled) : 0,
  };
}

/**
 * Génère un texte de critique objective pour une soumission de matrice.
 * Le texte est structuré pour servir de premier jet au formateur, qui
 * peut l'éditer librement avant publication.
 */
export function generateMatrixCritique(submission: MatrixSubmission): string {
  const a = analyze(submission);
  const lines: string[] = [];

  const fillPct = Math.round(a.fillRate * 100);
  lines.push(`CRITIQUE — Matrice « ${guessMatrixTitle(submission)} »`);
  lines.push("");

  // 1. Bilan général
  lines.push(
    `Bilan général — La matrice est complétée à ${fillPct}% (${a.filledCells}/${a.totalCells} cellules remplies). ` +
      densityComment(a.meanCellLength) +
      ` ` +
      diversityComment(a.distinctWords, a.filledCells),
  );
  lines.push("");

  // 2. Lecture ligne par ligne
  lines.push(`Lecture par public :`);
  a.rows.forEach((row) => {
    const status =
      row.filled === 0
        ? "non renseigné"
        : row.filled === row.total
          ? "complet"
          : `partiel (${row.filled}/${row.total})`;
    const detail =
      row.filled === 0
        ? "À traiter — aucune information n'est encore proposée pour ce public."
        : row.averageLength < 20
          ? "Les réponses sont brèves — elles gagneraient à être précisées (canal nommément cité, message reformulé en une phrase complète, preuve concrète)."
          : row.averageLength > 80
            ? "Les réponses sont riches ; veillez à les rendre actionnables (un seul canal cible, un message en une phrase, une preuve tangible)."
            : "Densité d'information adaptée. Vérifiez la cohérence canal-message-preuve.";
    lines.push(`  • ${row.label} — ${status}. ${detail}`);
  });
  lines.push("");

  // 3. Recommandations
  lines.push(`Recommandations :`);
  const recos = buildRecommendations(a);
  recos.forEach((r) => lines.push(`  - ${r}`));

  return lines.join("\n");
}

function guessMatrixTitle(submission: MatrixSubmission): string {
  if (submission.headers.some((h) => /public/i.test(h))) return "Matrice des publics";
  if (submission.headers.some((h) => /message/i.test(h))) return "Plan de communication";
  if (submission.headers.some((h) => /action/i.test(h))) return "Plan d'action";
  return "Tableau de travail";
}

function densityComment(meanLen: number): string {
  if (meanLen === 0) return "";
  if (meanLen < 15)
    return "Les cellules remplies sont très brèves : un effort de précision est attendu.";
  if (meanLen < 30) return "Le niveau de détail est modeste mais lisible.";
  if (meanLen < 70) return "Le niveau de détail est satisfaisant.";
  return "Le niveau de détail est élevé — veillez à rester actionnable.";
}

function diversityComment(distinct: number, filled: number): string {
  if (filled === 0) return "";
  const ratio = distinct / Math.max(1, filled);
  if (ratio < 2)
    return "Le vocabulaire utilisé est répétitif — diversifiez vos canaux et formulations selon les publics.";
  if (ratio < 5) return "Le vocabulaire utilisé est correct.";
  return "Le vocabulaire utilisé est riche et témoigne d'une bonne adaptation aux publics.";
}

function buildRecommendations(a: MatrixAnalysis): string[] {
  const recos: string[] = [];
  if (a.fillRate < 0.5) {
    recos.push(
      "Compléter en priorité les lignes encore vides : chaque public doit avoir au minimum un canal, un message et une preuve.",
    );
  }
  const emptyRows = a.rows.filter((r) => r.filled === 0);
  if (emptyRows.length > 0 && emptyRows.length <= 2) {
    recos.push(
      `Traiter prioritairement : ${emptyRows.map((r) => r.label).join(", ")}.`,
    );
  }
  const briefRows = a.rows.filter((r) => r.filled > 0 && r.averageLength < 15);
  if (briefRows.length > 0) {
    recos.push(
      `Étoffer les réponses des lignes : ${briefRows.map((r) => r.label).join(", ")} — préciser le canal, formuler le message en une phrase, donner une preuve concrète.`,
    );
  }
  if (a.fillRate >= 0.8 && a.meanCellLength >= 30) {
    recos.push(
      "Matrice solide : passer à l'étape suivante (transformer en plan d'action — un responsable, une échéance, un livrable par ligne).",
    );
  }
  if (recos.length === 0) {
    recos.push(
      "Continuer à affiner : relire à voix haute pour vérifier la cohérence canal-message-preuve par public.",
    );
  }
  recos.push(
    "Appliquer la méthode RAPIDE (Réel, Accessible, Positif, Identifiable, Documenté, Éthique) avant toute diffusion publique.",
  );
  return recos;
}
