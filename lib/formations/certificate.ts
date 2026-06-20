/* ============================================================================
   Certificat d'achèvement de formation (par cours + par utilisateur).

   - Numéro UNIQUE et déterministe par (utilisateur, cours) : la même personne
     pour le même cours obtient toujours le même numéro (vérifiable, stable
     d'un téléchargement à l'autre).
   - Configuration par cours (formateur, date à imprimer, signataire) fixée
     côté admin. La signature et le cachet proviennent de l'Identité visuelle
     (loadEtabConfig / etabExportMeta).
   ========================================================================== */

/** Mode de date imprimée sur le certificat. */
export type CertificateDateMode = "download" | "end" | "custom";

export const CERT_DATE_MODE_LABEL: Record<CertificateDateMode, string> = {
  download: "Date de téléchargement (aujourd'hui)",
  end: "Date de fin de formation",
  custom: "Date personnalisée",
};

/** Configuration du certificat d'un cours (paramétrée par l'admin). */
export interface CertificateConfig {
  id: string;
  courseId: string;
  /** Prénoms et NOM du formateur (colonne « Formateur »). */
  trainerName?: string;
  /** Quelle date imprimer (« Date et signature »). */
  dateMode?: CertificateDateMode;
  /** Date de fin de formation (si dateMode = "end"), au format JJ/MM/AAAA. */
  endDate?: string;
  /** Date personnalisée (si dateMode = "custom"), au format JJ/MM/AAAA. */
  customDate?: string;
  /** Nom du signataire central (par défaut : responsable de l'établissement). */
  dgName?: string;
  /** Fonction du signataire central (par défaut « Directeur Général »). */
  dgFunction?: string;
}

/** Récupère la config d'un cours, ou une config par défaut. */
export function getCertificateConfig(
  courseId: string,
  configs: CertificateConfig[],
): CertificateConfig {
  const found = configs.find((c) => c.courseId === courseId);
  if (found) return found;
  return {
    id: `default-${courseId}`,
    courseId,
    dateMode: "download",
    dgFunction: "Directeur Général",
  };
}

/* ---- Numéro de certificat déterministe ---------------------------------- */
/** Hachage FNV-1a 32 bits → base36 majuscule. */
function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36).toUpperCase();
}

/** Abréviation d'un courseId : initiales des segments (max 3 lettres). */
function courseAbbr(courseId: string): string {
  const abbr = courseId
    .split(/[-_\s]+/)
    .map((s) => s[0] ?? "")
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return (abbr || "EDU").slice(0, 3);
}

/**
 * Numéro de certificat unique pour (userId, courseId) :
 * `EDU-<ABBR>-<HASH7>`. Déterministe et alphanumérique.
 */
export function certificateNumber(userId: string, courseId: string): string {
  const h = fnv1a(`${userId}|${courseId}`).padStart(7, "0").slice(0, 7);
  return `EDU-${courseAbbr(courseId)}-${h}`;
}

/* ---- Nom du bénéficiaire ------------------------------------------------- */
/** « NOM Prénoms » à partir d'un profil, sinon le nom affiché. */
export function beneficiaryDisplayName(user: {
  firstName?: string;
  lastName?: string;
  displayName?: string;
}): string {
  const last = (user.lastName ?? "").trim();
  const first = (user.firstName ?? "").trim();
  if (last || first) return `${last.toUpperCase()} ${first}`.trim();
  return (user.displayName ?? "").trim();
}

/* ---- Date imprimée ------------------------------------------------------- */
function formatFrLong(d: Date): string {
  try {
    return d.toLocaleDateString("fr-FR", { dateStyle: "long" });
  } catch {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
}

/** Date à imprimer selon le mode configuré. */
export function resolveCertificateDate(
  config: CertificateConfig,
  now: Date = new Date(),
): string {
  if (config.dateMode === "custom" && config.customDate?.trim()) {
    return config.customDate.trim();
  }
  if (config.dateMode === "end" && config.endDate?.trim()) {
    return config.endDate.trim();
  }
  return formatFrLong(now);
}
