/**
 * Comptes super-administrateurs reconnus par l'application (source UNIQUE).
 *
 * Ces emails obtiennent toujours le rôle `admin` à l'authentification,
 * indépendamment de la table `profiles` (l'app aligne ensuite la base en
 * best-effort). La liste est volontairement minuscule et hard-codée : elle
 * garantit qu'un super-administrateur ne peut pas être verrouillé hors de
 * l'application — ni supprimé définitivement — par une manipulation de la base.
 *
 * Partagée par le contexte applicatif (forçage du rôle admin) et les routes
 * serveur sensibles (protection contre la suppression définitive).
 */
export const SUPER_ADMIN_EMAILS: string[] = ["elognezoro@gmail.com"];

/** `true` si l'email (insensible à la casse / espaces) est un super-admin. */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return SUPER_ADMIN_EMAILS.includes((email ?? "").trim().toLowerCase());
}
