/* ============================================================================
   Référentiel des établissements secondaires de Côte d'Ivoire (2921).

   Source : compilation des fichiers officiels du Ministère de l'Éducation
   nationale (2021-2022). Données chargées à la demande depuis
   `/data/ci-etablissements.json` (hors bundle JS), puis mises en cache.

   Deux identifiants par établissement :
   - `dspsCode`   : Code DSPS officiel (issu du fichier source) ;
   - `eduwebCode` : identifiant unique EduWeb (modèle « CI-##### »).
   ========================================================================== */

export interface CiEtablissement {
  /** Identifiant unique EduWeb (ex. « CI-00001 »). */
  eduwebCode: string;
  /** Code DSPS officiel. */
  dspsCode: string | null;
  name: string;
  drena: string | null;
  commune: string | null;
  region: string | null;
  /** « Privé » / « Public ». */
  statut: string | null;
  /** « Urbain » / « Rural ». */
  milieu: string | null;
}

interface RawRow {
  e: string;
  c?: string | null;
  n: string;
  d?: string | null;
  g?: string | null;
  r?: string | null;
  s?: string | null;
  m?: string | null;
}

let cache: Promise<CiEtablissement[]> | null = null;

/** Charge (une seule fois) le référentiel CI depuis /public. */
export function loadCiEtablissements(): Promise<CiEtablissement[]> {
  if (!cache) {
    cache = fetch("/data/ci-etablissements.json")
      .then((r) => (r.ok ? (r.json() as Promise<RawRow[]>) : []))
      .then((raw) =>
        raw.map((x) => ({
          eduwebCode: x.e,
          dspsCode: x.c ?? null,
          name: x.n,
          drena: x.d ?? null,
          commune: x.g ?? null,
          region: x.r ?? null,
          statut: x.s ?? null,
          milieu: x.m ?? null,
        })),
      )
      .catch(() => [] as CiEtablissement[]);
  }
  return cache;
}

/** Normalise (minuscule + sans accents) pour une recherche tolérante. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Recherche multi-mots sur nom / code DSPS / code EduWeb / commune / DRENA /
 * région. Tous les mots saisis doivent être présents. Limité à `limit` résultats.
 */
export function searchCiEtablissements(
  list: CiEtablissement[],
  query: string,
  limit = 50,
): CiEtablissement[] {
  const q = norm(query.trim());
  if (!q) return list.slice(0, limit);
  const tokens = q.split(/\s+/);
  const out: CiEtablissement[] = [];
  for (const e of list) {
    const hay = norm(
      `${e.name} ${e.dspsCode ?? ""} ${e.eduwebCode} ${e.commune ?? ""} ${e.drena ?? ""} ${e.region ?? ""}`,
    );
    if (tokens.every((t) => hay.includes(t))) {
      out.push(e);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** Retrouve un établissement par son code EduWeb. */
export function findByEduwebCode(
  list: CiEtablissement[],
  code: string | null,
): CiEtablissement | null {
  if (!code) return null;
  return list.find((e) => e.eduwebCode === code) ?? null;
}
