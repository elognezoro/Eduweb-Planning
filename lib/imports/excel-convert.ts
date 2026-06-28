import * as XLSX from "xlsx";
import { parseCsv, CSV_BOM } from "./csv";

/* ============================================================================
   Convertisseur « Excel/CSV → CSV configurable » (compatible Moodle).

   - Entrée : fichier Excel (.xlsx/.xls) ou CSV. Les NOM/Prénoms peuvent être
     dans UNE colonne (combinés) ou DEUX colonnes (séparées).
   - Sortie : CSV dont les colonnes (nom + source) sont définies par l'utilisateur.
   - Nom d'utilisateur : ≤ 10 caractères, intégrant un indicateur de groupe-classe
     (ou TD), unique sur l'ensemble.
   ========================================================================== */

export interface Tabular {
  headers: string[];
  rows: string[][];
}

/** Lit un fichier Excel (1ʳᵉ feuille) ou CSV en tableau homogène. */
export async function parseTabular(file: File): Promise<Tabular> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type === "text/csv") {
    const p = parseCsv(await file.text());
    return { headers: p.headers, rows: p.rows };
  }
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    blankrows: false,
    defval: "",
  }) as unknown[][];
  const headers = (aoa[0] ?? []).map((c) => String(c ?? "").trim());
  const rows = aoa
    .slice(1)
    .map((r) => headers.map((_, i) => String(r[i] ?? "").trim()))
    .filter((r) => r.some((c) => c.length > 0));
  return { headers, rows };
}

/** Minuscule sans accents, alphanumérique seulement. */
export function slugLower(s: string): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Sépare un libellé combiné « NOM Prénoms » en { lastname, firstname }.
 * Heuristique : les mots EN MAJUSCULES de tête sont le NOM ; le reste, les
 * Prénoms. À défaut de majuscules, le 1ᵉʳ mot = NOM.
 */
export function splitFullName(full: string): { lastname: string; firstname: string } {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { lastname: "", firstname: "" };
  if (parts.length === 1) return { lastname: parts[0], firstname: "" };
  const caps: string[] = [];
  let i = 0;
  while (
    i < parts.length &&
    /[A-ZÀ-Ý]/.test(parts[i]) &&
    parts[i] === parts[i].toLocaleUpperCase("fr")
  ) {
    caps.push(parts[i]);
    i++;
  }
  if (caps.length > 0 && i < parts.length) {
    return { lastname: caps.join(" "), firstname: parts.slice(i).join(" ") };
  }
  return { lastname: parts[0], firstname: parts.slice(1).join(" ") };
}

/**
 * Génère un nom d'utilisateur ≤ `maxLen` caractères : début du NOM/Prénoms suivi
 * d'un INDICATEUR (pays + établissement + groupe-classe), unique sur le lot.
 *
 * - L'indicateur est PRÉSERVÉ en priorité (c'est lui qui permet de déterminer
 *   pays / établissement / groupe) ; le nom est raccourci si nécessaire.
 * - En cas de collision (≥ 2 identiques), un chiffre est ajouté à la fin :
 *   « username1 », « username2 »… (le nom est encore raccourci pour rester ≤ maxLen).
 * - `taken` est muté pour garantir l'unicité.
 */
export function makeUsername(
  namePart: string,
  indicator: string,
  taken: Set<string>,
  maxLen = 10,
): string {
  const ind = slugLower(indicator);
  const nm = slugLower(namePart);
  const compose = (suffix: string): string => {
    const room = Math.max(0, maxLen - ind.length - suffix.length);
    return (nm.slice(0, room) + ind + suffix).slice(0, maxLen) || "user";
  };
  let candidate = compose("");
  let n = 1;
  while (taken.has(candidate)) {
    candidate = compose(String(n));
    n += 1;
  }
  taken.add(candidate);
  return candidate;
}

/** Adresse e-mail dérivée du nom d'utilisateur : « username@eduweb.ci ». */
export function eduwebEmail(username: string, domain = "eduweb.ci"): string {
  const local = slugLower(username) || "user";
  return `${local}@${domain}`;
}

const csvCell = (value: string, sep: string): string =>
  /["\r\n]/.test(value) || value.includes(sep)
    ? `"${value.replace(/"/g, '""')}"`
    : value;

/** Sérialise un tableau en CSV (BOM UTF-8 + séparateur). */
export function toCsv(headers: string[], rows: string[][], sep = ";"): string {
  const lines = [headers, ...rows].map((r) =>
    r.map((c) => csvCell(String(c ?? ""), sep)).join(sep),
  );
  return CSV_BOM + lines.join("\r\n");
}
