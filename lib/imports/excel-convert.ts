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
 * Génère un nom d'utilisateur ≤ 10 caractères : début du nom + prénom + indicateur
 * de groupe, unique. `taken` est muté pour garantir l'unicité sur le lot.
 */
export function makeUsername(
  lastname: string,
  firstname: string,
  group: string,
  taken: Set<string>,
  maxLen = 10,
): string {
  const g = slugLower(group).slice(0, 4); // indicateur groupe/TD
  const nm = slugLower(lastname) + slugLower(firstname);
  const avail = Math.max(1, maxLen - g.length);
  const base = (nm.slice(0, avail) + g).slice(0, maxLen) || "user";

  let candidate = base;
  let n = 1;
  while (taken.has(candidate)) {
    const suffix = String(n);
    candidate = (base.slice(0, maxLen - suffix.length) + suffix).slice(0, maxLen);
    n++;
  }
  taken.add(candidate);
  return candidate;
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
