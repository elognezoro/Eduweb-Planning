/**
 * Numérotation automatique des certificats de fin de formation.
 *
 * Format émis : `{ETAB_CODE}-{ANNÉE}-{NNN}` (ex. « LMC-ABJ-2026-001 »).
 * Si l'établissement n'a pas de code configuré, on retombe sur « EDU ».
 * La séquence est persistée localement par établissement et par année.
 *
 * - `peekNextCertificateNumber` : retourne le prochain numéro SANS l'incrémenter
 *   (utilisé pour pré-afficher la suggestion dans le formulaire).
 * - `consumeNextCertificateNumber` : retourne le prochain numéro ET incrémente
 *   le compteur (utilisé au moment où le certificat est officiellement délivré).
 */

const STORAGE_KEY = "eduweb.cert.sequence.v1";

type SequenceMap = Record<string /* etabCode */, Record<string /* year */, number>>;

function loadMap(): SequenceMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SequenceMap) : {};
  } catch {
    return {};
  }
}

function saveMap(map: SequenceMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota dépassé : silencieux, l'utilisateur peut toujours saisir manuellement. */
  }
}

function normalizeCode(code?: string | null): string {
  const trimmed = (code ?? "").trim().toUpperCase();
  if (!trimmed) return "EDU";
  return trimmed.replace(/[^A-Z0-9-]/g, "").slice(0, 16) || "EDU";
}

function formatNumber(code: string, year: number, seq: number): string {
  return `${code}-${year}-${String(seq).padStart(3, "0")}`;
}

/** Lit la prochaine valeur de séquence sans l'incrémenter. */
export function peekNextCertificateNumber(etabCode: string | undefined | null, year: number): string {
  const code = normalizeCode(etabCode);
  const map = loadMap();
  const current = map[code]?.[year] ?? 0;
  return formatNumber(code, year, current + 1);
}

/**
 * Incrémente la séquence pour l'établissement + l'année donnés puis retourne
 * le numéro formaté. À appeler uniquement quand le certificat est délivré.
 */
export function consumeNextCertificateNumber(etabCode: string | undefined | null, year: number): string {
  const code = normalizeCode(etabCode);
  const map = loadMap();
  const current = map[code]?.[year] ?? 0;
  const next = current + 1;
  map[code] = { ...(map[code] ?? {}), [year]: next };
  saveMap(map);
  return formatNumber(code, year, next);
}

/**
 * Réserve un numéro précis (utile pour ré-enregistrer un certificat délivré
 * antérieurement). Ne fait rien si le numéro n'a pas la bonne forme.
 */
export function reserveCertificateNumber(numberStr: string): void {
  const match = /^([A-Z0-9-]+)-(\d{4})-(\d{1,6})$/.exec(numberStr.trim());
  if (!match) return;
  const [, code, yearStr, seqStr] = match;
  const year = Number(yearStr);
  const seq = Number(seqStr);
  const map = loadMap();
  const current = map[code]?.[year] ?? 0;
  if (seq > current) {
    map[code] = { ...(map[code] ?? {}), [year]: seq };
    saveMap(map);
  }
}
