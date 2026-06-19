/**
 * Import CSV pour les cohortes de formation.
 *
 * Format attendu :
 *
 *   nom_cohorte;description;email_membre
 *   Cohorte juin 2026;Premier groupe;jean.dupont@ecole.ci
 *   Cohorte juin 2026;Premier groupe;marie.martin@ecole.ci
 *   Cohorte juillet 2026;Second groupe;paul.kouame@ecole.ci
 *
 * - Une ligne par appariement (cohorte × membre).
 * - Le séparateur peut être `;` (compatible Excel FR) ou `,`.
 * - Les guillemets `"…"` permettent d'inclure le séparateur dans une valeur.
 * - Le BOM UTF-8 en tête de fichier est ignoré.
 * - Les lignes vides et celles commençant par `#` sont ignorées.
 *
 * Le parseur regroupe ensuite les lignes par `nom_cohorte` pour produire
 * la liste des cohortes à créer, chacune avec sa description (première
 * occurrence non vide) et l'ensemble des emails déclarés.
 */

export interface CsvRawRow {
  cohortName: string;
  description: string;
  memberEmail: string;
  /** Numéro de ligne (1-based, en-tête comprise) pour les messages d'erreur. */
  lineNumber: number;
}

export interface CsvParseResult {
  rows: CsvRawRow[];
  /** Erreurs de format (lignes inutilisables : nom manquant, email malformé…). */
  errors: { lineNumber: number; message: string }[];
  /** Délimiteur détecté (« ; » ou « , »). */
  delimiter: ";" | ",";
}

export interface CohortDraft {
  name: string;
  description: string;
  emails: string[];
}

/** Modèle CSV téléchargeable, prêt à l'emploi (UTF-8 + BOM, séparateur `;`). */
export const COHORT_CSV_TEMPLATE = `﻿nom_cohorte;description;email_membre
Cohorte juin 2026;Premier groupe de stagiaires;jean.dupont@ecole.ci
Cohorte juin 2026;Premier groupe de stagiaires;marie.martin@ecole.ci
Cohorte juillet 2026;Second groupe;paul.kouame@ecole.ci
Cohorte juillet 2026;Second groupe;aminata.bamba@ecole.ci
`;

/** Nom de fichier proposé au téléchargement du modèle. */
export const COHORT_CSV_TEMPLATE_FILENAME = "modele-cohortes-formation.csv";

/**
 * Parse un texte CSV de cohortes. Tolère ; et , comme séparateurs, et les
 * valeurs entre guillemets pouvant contenir le séparateur lui-même.
 */
export function parseCohortsCsv(text: string): CsvParseResult {
  const errors: { lineNumber: number; message: string }[] = [];
  const rows: CsvRawRow[] = [];

  // Retire le BOM s'il est présent
  const normalized = text.replace(/^﻿/, "");
  const lines = normalized.split(/\r\n|\n|\r/);

  // Détecte le délimiteur sur la première ligne non vide / non commentaire
  const firstContent = lines.find((l) => l.trim().length > 0 && !l.trim().startsWith("#")) ?? "";
  const semicolons = (firstContent.match(/;/g) ?? []).length;
  const commas = (firstContent.match(/,/g) ?? []).length;
  const delimiter: ";" | "," = semicolons >= commas ? ";" : ",";

  let headerSeen = false;
  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const raw = lines[i];
    if (raw === undefined) continue;
    const trimmed = raw.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
    const fields = splitCsvLine(raw, delimiter).map((f) => f.trim());
    // Première ligne non vide = en-tête (ignorée)
    if (!headerSeen) {
      headerSeen = true;
      // Tolère un en-tête manquant : si la première ligne ressemble à des données,
      // on ne la jette pas.
      const looksLikeHeader =
        /nom|cohorte|name|email/i.test(fields[0] ?? "") ||
        /email/i.test(fields[2] ?? "") ||
        /description/i.test(fields[1] ?? "");
      if (looksLikeHeader) continue;
    }
    if (fields.length < 3) {
      errors.push({
        lineNumber,
        message: `Ligne incomplète : 3 colonnes attendues (nom, description, email), ${fields.length} reçue(s).`,
      });
      continue;
    }
    const [cohortName, description, memberEmail] = fields;
    if (!cohortName) {
      errors.push({ lineNumber, message: "Nom de cohorte manquant." });
      continue;
    }
    if (!memberEmail) {
      errors.push({ lineNumber, message: `Email manquant pour la cohorte « ${cohortName} ».` });
      continue;
    }
    if (!isPlausibleEmail(memberEmail)) {
      errors.push({
        lineNumber,
        message: `Email « ${memberEmail} » mal formé pour la cohorte « ${cohortName} ».`,
      });
      continue;
    }
    rows.push({
      cohortName: cohortName.trim(),
      description: (description ?? "").trim(),
      memberEmail: memberEmail.trim().toLowerCase(),
      lineNumber,
    });
  }
  return { rows, errors, delimiter };
}

/**
 * Regroupe les lignes par cohorte. Pour chaque cohorte, la première
 * description non vide est conservée et la liste des emails est
 * dédupliquée (insensible à la casse, déjà en minuscule).
 */
export function groupRowsByCohort(rows: CsvRawRow[]): CohortDraft[] {
  const map = new Map<string, CohortDraft>();
  for (const r of rows) {
    const key = r.cohortName;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        name: r.cohortName,
        description: r.description,
        emails: [r.memberEmail],
      });
    } else {
      if (!existing.description && r.description) {
        existing.description = r.description;
      }
      if (!existing.emails.includes(r.memberEmail)) {
        existing.emails.push(r.memberEmail);
      }
    }
  }
  return Array.from(map.values());
}

/**
 * Découpe une ligne CSV en colonnes. Gère les valeurs entre guillemets
 * (séparateur littéral à l'intérieur, guillemets doublés pour échapper).
 */
function splitCsvLine(line: string, delimiter: ";" | ","): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // Guillemets doublés = guillemet littéral
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"' && cur.length === 0) {
        inQuotes = true;
      } else if (ch === delimiter) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

function isPlausibleEmail(value: string): boolean {
  // Forme simple : x@y.z (au moins un caractère avant @, un domaine avec un point)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
