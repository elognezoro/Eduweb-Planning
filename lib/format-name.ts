/**
 * Normalisation de la casse des noms de personnes, partagée par tous les
 * formulaires de l'application (inscription, comptes utilisateurs, profil…).
 *
 *  - NOM     → tout en MAJUSCULES         (« zoro »            → « ZORO »)
 *  - Prénoms → 1re lettre de chaque       (« elogne guessan »  → « Elogne Guessan »)
 *              composante en majuscule    (« marie-hélène n'g… »→ « Marie-Hélène N'G… »)
 *
 * Les composantes sont délimitées par une espace, un trait d'union ou une
 * apostrophe ; les accents sont préservés.
 */

/** NOM : tout en majuscules. */
export const toNomCase = (v: string): string => v.toUpperCase();

/** Prénoms : 1re lettre de chaque composante en majuscule, le reste en minuscules. */
export const toPrenomCase = (v: string): string =>
  v.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (_m, sep: string, ch: string) => sep + ch.toUpperCase());

/**
 * Champ combiné « Nom et prénoms » (convention officielle NOM en tête) :
 * le 1er mot passe en MAJUSCULES (le NOM), les suivants en title-case (les prénoms).
 * Ex. « kouassi affoué marie » → « KOUASSI Affoué Marie ».
 */
export const toFullNameCase = (v: string): string => {
  let first = true;
  return v.replace(/\S+/g, (word) => {
    const out = first ? toNomCase(word) : toPrenomCase(word);
    first = false;
    return out;
  });
};

/**
 * Déduit le type de champ « nom » à partir d'un en-tête de colonne (CSV ou formulaire) :
 *  - "nom"     → NOM seul (à mettre en MAJUSCULES)
 *  - "prenom"  → Prénoms seuls (à mettre en title-case)
 *  - "complet" → champ combiné « Nom et prénoms » (NOM en tête + prénoms title-case)
 *  - null      → ce n'est pas un champ de nom de personne (laisser tel quel)
 */
export function nameFieldKind(header: string): "nom" | "prenom" | "complet" | null {
  const h = header.trim().toLowerCase().replace(/[_]+/g, " ").replace(/\s+/g, " ");
  if (/(noms?\s*(et|&|\/|\+)\s*pr[ée]noms?|nom\s*complet|nom\s*&\s*pr[ée]noms?|full\s*name)/.test(h)) return "complet";
  if (/^(nom|nom de famille|last\s*name|lastname|surname|family\s*name)$/.test(h)) return "nom";
  if (/^(pr[ée]noms?|first\s*name|firstname|given\s*names?)$/.test(h)) return "prenom";
  return null;
}

/** Harmonise une valeur d'après l'en-tête de sa colonne (NOM majuscules, Prénoms title-case). */
export function harmonizeNameByHeader(header: string, value: string): string {
  switch (nameFieldKind(header)) {
    case "nom":
      return toNomCase(value);
    case "prenom":
      return toPrenomCase(value);
    case "complet":
      return toFullNameCase(value);
    default:
      return value;
  }
}
