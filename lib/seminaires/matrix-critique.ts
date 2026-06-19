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
  const title = guessMatrixTitle(submission);
  const isPlan = title === "Plan d'action";
  const lines: string[] = [];

  const fillPct = Math.round(a.fillRate * 100);
  lines.push(`CRITIQUE — ${isPlan ? title : `Matrice « ${title} »`}`);
  lines.push("");

  lines.push(
    `Bilan général — ${isPlan ? "Le plan" : "La matrice"} est complété${isPlan ? "" : "e"} à ${fillPct}% (${a.filledCells}/${a.totalCells} cellules remplies). ` +
      densityComment(a.meanCellLength) +
      ` ` +
      diversityComment(a.distinctWords, a.filledCells),
  );
  lines.push("");

  lines.push(`Lecture ${isPlan ? "par action" : "par public"} :`);
  a.rows.forEach((row) => {
    const status =
      row.filled === 0
        ? "non renseigné"
        : row.filled === row.total
          ? "complet"
          : `partiel (${row.filled}/${row.total})`;
    const detail =
      row.filled === 0
        ? isPlan
          ? "À traiter — cette action n'est pas encore définie."
          : "À traiter — aucune information n'est encore proposée pour ce public."
        : row.averageLength < 20
          ? isPlan
            ? "Les colonnes sont trop laconiques — précisez le message, le public cible, le canal et un indicateur mesurable."
            : "Les réponses sont brèves — elles gagneraient à être précisées (canal nommément cité, message reformulé en une phrase complète, preuve concrète)."
          : row.averageLength > 80
            ? isPlan
              ? "L'action est richement décrite ; resserrez sur l'essentiel : un objectif, un canal, un indicateur SMART."
              : "Les réponses sont riches ; veillez à les rendre actionnables (un seul canal cible, un message en une phrase, une preuve tangible)."
            : isPlan
              ? "Densité adaptée. Vérifiez que l'indicateur est mesurable et qu'une échéance courte (30 jours) est tenable."
              : "Densité d'information adaptée. Vérifiez la cohérence canal-message-preuve.";
    lines.push(`  • ${row.label} — ${status}. ${detail}`);
  });
  lines.push("");

  lines.push(`Recommandations :`);
  const recos = buildRecommendations(a, isPlan);
  recos.forEach((r) => lines.push(`  - ${r}`));

  return lines.join("\n");
}

function guessMatrixTitle(submission: MatrixSubmission): string {
  const headers = submission.headers;
  const rowLabels = submission.rowLabels;
  // Plan d'action : reconnu à la présence d'un Indicateur ou Objectif,
  // OU à des lignes nommées « Action 1/2/… ».
  const hasIndicator = headers.some((h) => /indicateur|objectif|échéance|responsable|livrable/i.test(h));
  const actionRows = rowLabels.some((r) => /^action\b/i.test(r.trim()));
  if (hasIndicator || actionRows) return "Plan d'action";
  if (headers.some((h) => /public/i.test(h))) return "Matrice des publics";
  if (headers.some((h) => /message/i.test(h))) return "Plan de communication";
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

function buildRecommendations(a: MatrixAnalysis, isPlan = false): string[] {
  const recos: string[] = [];
  if (a.fillRate < 0.5) {
    recos.push(
      isPlan
        ? "Compléter chaque action : un message, un public cible, un objectif, un canal et un indicateur mesurable."
        : "Compléter en priorité les lignes encore vides : chaque public doit avoir au minimum un canal, un message et une preuve.",
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
      isPlan
        ? `Étoffer : ${briefRows.map((r) => r.label).join(", ")} — l'indicateur doit être chiffré ou observable (« X publications validées RAPIDE », « Y rencontres tenues »).`
        : `Étoffer les réponses des lignes : ${briefRows.map((r) => r.label).join(", ")} — préciser le canal, formuler le message en une phrase, donner une preuve concrète.`,
    );
  }
  if (a.fillRate >= 0.8 && a.meanCellLength >= 30) {
    recos.push(
      isPlan
        ? "Plan solide : nommer un responsable pour chaque action et fixer une date de revue à 30 jours."
        : "Matrice solide : passer à l'étape suivante (transformer en plan d'action — un responsable, une échéance, un livrable par ligne).",
    );
  }
  if (recos.length === 0) {
    recos.push(
      isPlan
        ? "Continuer à affiner : vérifier que chaque action est SMART (Spécifique, Mesurable, Atteignable, Réaliste, Temporellement définie)."
        : "Continuer à affiner : relire à voix haute pour vérifier la cohérence canal-message-preuve par public.",
    );
  }
  recos.push(
    "Appliquer la méthode RAPIDE (Réel, Accessible, Positif, Identifiable, Documenté, Éthique) avant toute diffusion publique.",
  );
  return recos;
}
