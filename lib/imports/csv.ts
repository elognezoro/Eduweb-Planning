import { z } from "zod";

/** Détecte le séparateur le plus probable d'un CSV. */
export function detectSeparator(sample: string): "," | ";" | "\t" {
  const firstLine = sample.split(/\r?\n/)[0] ?? "";
  const counts: Record<string, number> = {
    ",": (firstLine.match(/,/g) ?? []).length,
    ";": (firstLine.match(/;/g) ?? []).length,
    "\t": (firstLine.match(/\t/g) ?? []).length,
  };
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return (best && best[1] > 0 ? best[0] : ",") as "," | ";" | "\t";
}

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
  separator: string;
}

/** Marque d'ordre des octets UTF-8 (fait afficher correctement les accents dans Excel). */
export const CSV_BOM = String.fromCharCode(0xfeff);

const csvCell = (value: string, sep: string): string =>
  /["\r\n]/.test(value) || value.includes(sep) ? `"${value.replace(/"/g, '""')}"` : value;

/**
 * Construit un modèle CSV « une colonne par champ, une entête par colonne ».
 * Séparateur point-virgule + BOM UTF-8 par défaut : le fichier s'ouvre directement
 * en colonnes distinctes dans Excel/LibreOffice en locale française.
 */
export function buildCsvTemplate(columns: string[], sampleRows: string[][] = [], separator = ";"): string {
  const lines = [columns, ...sampleRows].map((row) => row.map((c) => csvCell(String(c ?? ""), separator)).join(separator));
  return String.fromCharCode(0xfeff) + lines.join("\r\n");
}

/** Parse un CSV (gère les guillemets simples et ignore un éventuel BOM). */
export function parseCsv(content: string, separator?: string): ParsedCsv {
  content = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
  const sep = separator ?? detectSeparator(content);
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === sep && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };
  const [headerLine, ...rest] = lines;
  return {
    headers: headerLine ? parseLine(headerLine) : [],
    rows: rest.map(parseLine),
    separator: sep,
  };
}

/** Colonnes Moodle recommandées (convertisseur CSV). */
export const MOODLE_COLUMNS = [
  "username",
  "firstname",
  "lastname",
  "email",
  "password",
  "city",
  "country",
  "cohort1",
  "course1",
  "group1",
  "role1",
] as const;

export const MOODLE_TEMPLATE =
  MOODLE_COLUMNS.join(",") +
  "\nkkouame,Koffi,Kouamé,kkouame@exemple.ci,Passw0rd!,Abidjan,CI,promo2025,EPP01,groupeA,student";

/** Schéma de validation d'une ligne d'import élève. */
export const eleveImportSchema = z.object({
  matricule: z.string().min(1, "Matricule requis"),
  firstname: z.string().min(1, "Prénom requis"),
  lastname: z.string().min(1, "Nom requis"),
  gender: z.enum(["M", "F"]).optional(),
  classe: z.string().optional(),
});

export interface ValidationResult {
  validCount: number;
  errorCount: number;
  errors: { line: number; column: string; message: string }[];
}

/** Valide les lignes parsées contre un schéma Zod (par index de colonne mappé). */
export function validateRows(
  parsed: ParsedCsv,
  mapping: Record<string, number>,
  schema: z.ZodTypeAny,
): ValidationResult {
  const errors: ValidationResult["errors"] = [];
  let validCount = 0;

  parsed.rows.forEach((row, idx) => {
    const candidate: Record<string, string> = {};
    for (const [field, colIndex] of Object.entries(mapping)) {
      candidate[field] = row[colIndex] ?? "";
    }
    const result = schema.safeParse(candidate);
    if (result.success) {
      validCount++;
    } else {
      result.error.issues.forEach((issue) => {
        errors.push({
          line: idx + 2, // +1 en-tête, +1 base 1
          column: String(issue.path[0] ?? "?"),
          message: issue.message,
        });
      });
    }
  });

  return { validCount, errorCount: errors.length, errors };
}

/** Construit un CSV au format Moodle à partir de lignes mappées. */
export function toMoodleCsv(records: Record<string, string>[]): string {
  const header = MOODLE_COLUMNS.join(",");
  const body = records
    .map((rec) => MOODLE_COLUMNS.map((c) => rec[c] ?? "").join(","))
    .join("\n");
  return `${header}\n${body}`;
}
