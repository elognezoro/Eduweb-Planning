import type { UserRole } from "./roles";

/**
 * Identifiant technique des utilisateurs de la plateforme.
 *
 * Format : EWP-<PAYS>-<ANNÉE>-<RÔLE>-<SÉQUENCE>-<CLÉ>
 *   - EWP       : préfixe plateforme (EduWeb Planner) ;
 *   - PAYS      : code ISO 3166-1 alpha-2 du pays de rattachement (ex. CI) ;
 *   - ANNÉE     : année d'inscription (4 chiffres, UTC) ;
 *   - RÔLE      : code à 3 lettres du rôle à la création (table ci-dessous) ;
 *   - SÉQUENCE  : numéro d'ordre sur 6 chiffres (000001…) ;
 *   - CLÉ       : caractère de contrôle (somme pondérée mod 36) garantissant
 *                 l'intégrité — toute faute de frappe invalide l'identifiant.
 *
 * Exemple : EWP-CI-2026-ENS-000123-K
 */
export const ROLE_UID_CODES: Record<UserRole, string> = {
  admin: "ADM",
  etablissements_admin: "AET",
  cafop_admin: "ACF",
  cafop_directeur: "DCF",
  cafop_professeur: "PCF",
  apfc_admin: "AAP",
  drena: "DRE",
  inspecteur: "INS",
  conseiller_pedagogique: "CPE",
  chef_antenne: "CAN",
  chef_etablissement: "CET",
  enseignant: "ENS",
  educateur: "EDU",
  transport_chauffeur: "CHA",
  parent: "PAR",
  eleve: "ELV",
};

const BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Clé de contrôle : somme des codes des caractères alphanumériques, pondérée par la position, modulo 36. */
function checksum(payload: string): string {
  let sum = 0;
  let pos = 0;
  for (const ch of payload) {
    if (ch === "-") continue;
    pos += 1;
    sum += ch.charCodeAt(0) * pos;
  }
  return BASE36[sum % 36];
}

/** Génère l'identifiant technique d'un utilisateur. */
export function generateUserUid(input: {
  country?: string | null;
  role: UserRole;
  createdAt?: string | null;
  seq: number;
}): string {
  const country = (input.country ?? "CI").toUpperCase().slice(0, 2);
  const year = (input.createdAt ?? new Date().toISOString()).slice(0, 4);
  const roleCode = ROLE_UID_CODES[input.role] ?? "USR";
  const seq = String(Math.max(0, Math.floor(input.seq))).padStart(6, "0").slice(-6);
  const payload = `EWP-${country}-${year}-${roleCode}-${seq}`;
  return `${payload}-${checksum(payload)}`;
}

const UID_RE = /^EWP-([A-Z]{2})-(\d{4})-([A-Z]{3})-(\d{6})-([0-9A-Z])$/;

/** Décompose un identifiant technique ; null si le format ou la clé est invalide. */
export function parseUserUid(uid: string): { country: string; year: number; roleCode: string; seq: number } | null {
  const m = UID_RE.exec(uid);
  if (!m) return null;
  const payload = uid.slice(0, -2);
  if (checksum(payload) !== m[5]) return null;
  return { country: m[1], year: Number(m[2]), roleCode: m[3], seq: Number(m[4]) };
}

/** Vérifie qu'un identifiant technique est bien formé et que sa clé de contrôle est exacte. */
export function isValidUserUid(uid: string): boolean {
  return parseUserUid(uid) !== null;
}
