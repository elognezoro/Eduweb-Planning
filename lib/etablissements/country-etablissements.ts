/* ============================================================================
   Référentiels d'établissements par PAYS (hors Côte d'Ivoire).

   Chargés à la demande depuis les fichiers CSV publics `public/data/<pays>-…csv`
   (générés à partir des répertoires officiels), puis mis en cache. Réutilise le
   format `CiEtablissement` du combobox pour un affichage homogène. La Côte
   d'Ivoire garde son référentiel dédié (`ci-etablissements.ts`, 2921, JSON).
   ========================================================================== */

import { parseCsv } from "@/lib/imports/csv";
import type { CiEtablissement } from "./ci-etablissements";

/** Code ISO2 → fichier CSV public (format d'import établissements). */
const FILES: Record<string, string> = {
  SN: "/data/senegal-etablissements-extraits.csv",
  CM: "/data/cameroun-etablissements.csv",
  CD: "/data/rdc-etablissements.csv",
  HT: "/data/haiti-etablissements.csv",
  BJ: "/data/benin-etablissements.csv",
  BF: "/data/burkina-etablissements.csv",
  NE: "/data/niger-etablissements.csv",
  ML: "/data/mali-etablissements.csv",
};

const cache: Record<string, CiEtablissement[]> = {};

/** Vrai si un référentiel embarqué existe pour ce pays. */
export function hasCountryEtablissements(code: string): boolean {
  return (code || "").toUpperCase() in FILES;
}

/**
 * Charge (une fois, puis cache) les établissements du pays depuis son CSV public.
 * Retourne [] si le pays n'a pas de référentiel embarqué ou en cas d'échec.
 */
export async function loadCountryEtablissements(code: string): Promise<CiEtablissement[]> {
  const cc = (code || "").toUpperCase();
  const url = FILES[cc];
  if (!url) return [];
  if (cache[cc]) return cache[cc];
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return [];
    const parsed = parseCsv(await res.text()); // séparateur « ; » auto-détecté
    const col = (name: string) => parsed.headers.indexOf(name);
    const iNom = col("nom");
    const iRegion = col("region");
    const iLoc = col("localite");
    const iType = col("type_etab");
    const iCode = col("code_etab");
    const iRegime = col("regime");
    const list = parsed.rows
      .map((r) => {
        const name = (r[iNom] ?? "").trim();
        const region = (r[iRegion] ?? "").trim();
        return {
          eduwebCode: (r[iCode] ?? "").trim() || name,
          dspsCode: null,
          name,
          drena: region || null,
          commune: (r[iLoc] ?? "").trim() || null,
          region: region || null,
          statut: (r[iRegime] ?? "").trim() || (r[iType] ?? "").trim() || null,
          milieu: null,
        } satisfies CiEtablissement;
      })
      .filter((e) => e.name.length > 0);
    cache[cc] = list;
    return list;
  } catch {
    return [];
  }
}
