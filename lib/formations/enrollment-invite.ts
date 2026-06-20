import {
  FORMATION_ROLES,
  type FormationRole,
} from "@/lib/formations/formation-roles";

/* ============================================================================
   Liens d'inscription par lien de création de compte.

   L'administrateur génère un lien `/register?invite=<jeton>`. Toute personne
   qui crée son compte via ce lien est automatiquement inscrite aux cours
   désignés, avec le rôle de formation choisi.

   Contrainte d'architecture : le magasin de données est local au navigateur
   (localStorage ; la couche serveur partagée n'est pas encore en place). Le
   jeton est donc AUTO-PORTEUR : il encode directement la liste des cours, le
   rôle et l'expiration. Ainsi le lien fonctionne sur n'importe quel
   navigateur, sans dépendre du magasin de l'administrateur.

   - L'enregistrement `EnrollmentInviteLink` (stocké côté admin) sert
     uniquement à LISTER / RE-COPIER / SUPPRIMER les liens créés.
   - Le seul contrôle réellement opposable sans serveur est l'EXPIRATION,
     encodée dans le jeton, vérifiée au signup ET au moment de la
     matérialisation de l'inscription (claim).

   MODÈLE DE SÉCURITÉ (assumé, faute de couche serveur partagée) :
   - Le jeton n'est PAS signé : il pourrait être forgé. La validation se
     limite donc à la STRUCTURE et aux VALEURS connues (cours existants au
     catalogue, rôle de formation valide, expiration ISO). Conséquence d'une
     forge : au pire, s'auto-inscrire à une FORMATION existante — exactement
     ce que le lien permet déjà. Le RBAC global (effectiveRole) et l'accès
     aux données sensibles ne sont jamais affectés (le rôle de formation ne
     confère que des capacités INTRA-formation).
   - Le lien est MULTI-USAGE par conception (inviter une cohorte avec un seul
     lien). L'usage unique nécessiterait un suivi serveur (Phase 2).
   ========================================================================== */

/** Enregistrement d'un lien d'inscription (gestion côté administrateur). */
export interface EnrollmentInviteLink {
  id: string;
  /** Jeton auto-porteur inséré dans l'URL `/register?invite=<token>`. */
  token: string;
  /** Cours auxquels le titulaire du lien sera inscrit. */
  courseIds: string[];
  /** Rôle de formation attribué à l'inscription (défaut : étudiant). */
  formationRole?: FormationRole;
  /** Libellé interne (ex. « Cohorte CAFOP septembre »). */
  label?: string;
  /** ISO datetime d'expiration du lien (null = sans limite). */
  expiresAt?: string | null;
  /** ISO timestamp de création. */
  createdAt: string;
  /** Nom de l'administrateur créateur. */
  createdBy: string;
}

/** Charge utile encodée dans le jeton (compacte, auto-portée). */
export interface InvitePayload {
  /** Version du format. */
  v: 1;
  /** courseIds. */
  c: string[];
  /** formationRole. */
  r?: FormationRole;
  /** expiresAt (ISO) ou null. */
  e?: string | null;
  /** nonce d'unicité. */
  n: string;
}

/* ---- Encodage base64url (sans dépendance, navigateur ou Node) ------------ */
function toBase64(s: string): string {
  if (typeof btoa !== "undefined") {
    // btoa attend du Latin1 ; on passe par UTF-8 → escape pour être sûr.
    return btoa(unescape(encodeURIComponent(s)));
  }
  return Buffer.from(s, "utf8").toString("base64");
}
function fromBase64(s: string): string {
  if (typeof atob !== "undefined") {
    return decodeURIComponent(escape(atob(s)));
  }
  return Buffer.from(s, "base64").toString("utf8");
}
function base64UrlEncode(s: string): string {
  return toBase64(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64UrlDecode(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  return fromBase64(padded);
}

/** Encode une charge utile en jeton URL-safe. */
export function encodeInviteToken(payload: InvitePayload): string {
  return base64UrlEncode(JSON.stringify(payload));
}

/**
 * Décode un jeton ; retourne `null` si malformé ou invalide.
 *
 * Validation stricte (le jeton n'étant pas signé) : version, liste de cours
 * non vide de chaînes, rôle de formation appartenant à FORMATION_ROLES, et
 * expiration — si présente — étant une date ISO analysable.
 */
export function decodeInviteToken(token: string): InvitePayload | null {
  try {
    const obj = JSON.parse(base64UrlDecode(token)) as unknown;
    if (
      !obj ||
      typeof obj !== "object" ||
      (obj as InvitePayload).v !== 1 ||
      !Array.isArray((obj as InvitePayload).c) ||
      (obj as InvitePayload).c.some((x) => typeof x !== "string") ||
      (obj as InvitePayload).c.length === 0
    ) {
      return null;
    }
    const p = obj as InvitePayload;
    // Rôle : doit appartenir à l'ensemble connu (sinon jeton rejeté).
    if (
      p.r !== undefined &&
      !(FORMATION_ROLES as readonly string[]).includes(p.r)
    ) {
      return null;
    }
    // Expiration : si présente et non nulle, doit être une date analysable.
    if (p.e !== undefined && p.e !== null) {
      if (typeof p.e !== "string" || Number.isNaN(new Date(p.e).getTime())) {
        return null;
      }
    }
    return p;
  } catch {
    return null;
  }
}

/** Génère un nonce court (unicité du jeton). */
export function makeInviteNonce(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-4);
  return `${time}${rand}`;
}

/** Construit l'URL complète d'inscription pour un jeton donné. */
export function buildInviteUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/register?invite=${encodeURIComponent(token)}`;
}

/** Statut d'une charge utile décodée vis-à-vis de l'instant courant. */
export type InvitePayloadStatus = "valid" | "expired" | "invalid";
export function payloadStatus(
  payload: InvitePayload | null,
  now: Date = new Date(),
): InvitePayloadStatus {
  if (!payload || payload.c.length === 0) return "invalid";
  if (payload.e) {
    const exp = new Date(payload.e);
    if (Number.isNaN(exp.getTime())) return "invalid";
    if (exp.getTime() < now.getTime()) return "expired";
  }
  return "valid";
}

/* ==========================================================================
   File d'INTENTIONS d'inscription (pont localStorage).

   La page /register (segment (auth)) n'est PAS enveloppée par le magasin de
   données (DataStoreProvider, présent uniquement dans (dashboard)). On y
   dépose donc une INTENTION dans localStorage, consommée ensuite par
   <EnrollmentIntentClaimer/> monté dans le tableau de bord, dès que
   l'utilisateur (identifié par e-mail) s'y connecte.
   ========================================================================== */

const INTENT_KEY = "eduweb.enrollIntents.v1";

export interface EnrollIntent {
  /** E-mail saisi lors de l'inscription (clé d'appariement, en minuscules). */
  email: string;
  courseIds: string[];
  formationRole?: FormationRole;
  /**
   * Expiration héritée du jeton (ISO) ou null. Revérifiée au moment du
   * claim : une intention dont l'expiration est dépassée n'inscrit personne.
   */
  expiresAt?: string | null;
  /** Libellé reporté dans `enrolledBy`. */
  source: string;
  /** ISO timestamp. */
  createdAt: string;
}

/** Plafond anti-abus de la file d'intentions (un lien valide suffit). */
const MAX_INTENTS = 20;

function readIntents(): EnrollIntent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INTENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as EnrollIntent[]) : [];
  } catch {
    return [];
  }
}

function writeIntents(list: EnrollIntent[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTENT_KEY, JSON.stringify(list));
  } catch {
    /* quota / privacy mode : best effort */
  }
}

/** Dépose une intention d'inscription (appelé depuis /register). */
export function queueEnrollIntent(intent: EnrollIntent): void {
  const list = readIntents();
  // Borne la file (garde-fou anti-abus en cas d'injection localStorage) :
  // on conserve les plus récentes.
  const trimmed = list.slice(-(MAX_INTENTS - 1));
  trimmed.push({ ...intent, email: intent.email.trim().toLowerCase() });
  writeIntents(trimmed);
}

/**
 * Réclame (et retire) les intentions correspondant à un e-mail donné.
 * Appelé depuis le tableau de bord une fois l'utilisateur identifié.
 */
export function claimEnrollIntents(email: string): EnrollIntent[] {
  const lower = email.trim().toLowerCase();
  if (!lower) return [];
  const all = readIntents();
  const mine = all
    .filter((i) => i.email.trim().toLowerCase() === lower)
    .slice(0, MAX_INTENTS);
  if (mine.length === 0) return [];
  const rest = all.filter((i) => i.email.trim().toLowerCase() !== lower);
  writeIntents(rest);
  return mine;
}
