import type { SupabaseClient } from "@supabase/supabase-js";
import type { EtablissementSelection } from "@/components/etablissements/etablissement-combobox";

/* ============================================================================
   Persistance des établissements dans Supabase (à la demande).

   Le référentiel CI (2921) est chargé côté client pour la liste déroulante ;
   un établissement n'est matérialisé dans la table `etablissements` (avec un
   UUID réel) qu'au moment où il est réellement utilisé (création explicite,
   config transport, rattachement d'un chef…). On évite ainsi de semer 2921
   lignes d'avance.

   La table porte le **code EduWeb** dans `code` (unique par pays) et le **code
   DSPS** dans `dsps_code` (migration 019). Région/localité saisies librement
   sont stockées en texte (migration 041). Écriture réservée à l'admin (RLS).
   ========================================================================== */

/**
 * Code dérivé d'un nom libre. ⚠️ RÈGLE STRICTEMENT IDENTIQUE au trigger signup 020
 * (`'LIBRE-' || upper(regexp_replace(name, '[^A-Za-z0-9]+', '-', 'g'))`) — SANS
 * désaccentuation/trim/troncature. Indispensable pour que l'upsert (country_id,code)
 * d'une création admin tombe EXACTEMENT sur la ligne déjà matérialisée par
 * l'inscription self-service d'un utilisateur (sinon doublon, et le chef rattaché
 * n'est pas relié à la bonne ligne). Toute divergence ici casse l'idempotence.
 */
export function establishmentCodeFromName(name: string): string {
  return `LIBRE-${name.replace(/[^A-Za-z0-9]+/g, "-").toUpperCase()}`;
}

/** Code stocké dans `etablissements.code` (EduWeb, ou dérivé pour une saisie libre). */
export function etablissementCode(sel: EtablissementSelection): string {
  return sel.eduwebCode ?? establishmentCodeFromName(sel.name);
}

export interface UpsertEstablishmentInput {
  /** ISO2 du pays de l'établissement (ex. "CI", "SN"). Défaut "CI". */
  countryCode?: string | null;
  /** Code EduWeb / établissement (sera dérivé du nom si absent). */
  code?: string | null;
  name: string;
  dspsCode?: string | null;
  /** Région académique en texte libre (migration 041). */
  regionName?: string | null;
  /** Localité en texte libre (migration 041). */
  locality?: string | null;
}

/**
 * Matérialise (ou met à jour) un établissement dans Supabase et renvoie son UUID.
 * Générique multi-pays : résout `countries.id` via l'ISO2 fourni (défaut CI).
 * Upsert idempotent par (country_id, code) — réimport = mise à jour, pas de doublon.
 * Réservé aux admins/etablissements_admin (RLS) ; renvoie `{ id: null, error }`
 * en cas d'échec (pays introuvable, droits insuffisants…).
 *
 * NB : la région/localité sont stockées en TEXTE (region_name/locality) ; les
 * colonnes UUID (academic_region_id/locality_id) restent NULL faute de table de
 * résolution texte→UUID par pays — ce qui NE bloque PAS la création.
 */
export async function upsertEstablishment(
  supabase: SupabaseClient,
  input: UpsertEstablishmentInput,
): Promise<{ id: string | null; error?: string }> {
  const iso2 = (input.countryCode ?? "CI").trim().toUpperCase() || "CI";
  const { data: country } = await supabase
    .from("countries")
    .select("id")
    .eq("iso2", iso2)
    .maybeSingle();
  const countryId = (country as { id?: string } | null)?.id;
  if (!countryId) return { id: null, error: `Pays « ${iso2} » introuvable côté serveur.` };

  // Code DÉTERMINISTE : code saisi (normalisé) ou dérivé du nom (règle trigger 020).
  // Jamais d'horodatage/index ici → l'upsert (country_id,code) reste idempotent.
  const code = input.code?.trim()
    ? input.code.trim().toUpperCase()
    : establishmentCodeFromName(input.name);
  const baseRow = {
    country_id: countryId,
    code,
    name: input.name,
    dsps_code: input.dspsCode ?? null,
    status: "active",
  };
  const fullRow = {
    ...baseRow,
    region_name: input.regionName?.trim() || null,
    locality: input.locality?.trim() || null,
  };
  let { data, error } = await supabase
    .from("etablissements")
    .upsert(fullRow, { onConflict: "country_id,code" })
    .select("id")
    .maybeSingle();
  // Repli si la migration 041 (region_name/locality) n'est pas encore appliquée :
  // on réessaie sans ces colonnes pour ne pas casser la création en attendant.
  if (error && isMissingColumnError(error)) {
    ({ data, error } = await supabase
      .from("etablissements")
      .upsert(baseRow, { onConflict: "country_id,code" })
      .select("id")
      .maybeSingle());
  }
  if (error) return { id: null, error: error.message };
  let id = (data as { id?: string } | null)?.id ?? null;
  // L'écriture peut réussir alors que le SELECT post-écriture renvoie 0 ligne
  // (RLS de lecture). On retente une lecture ciblée par (pays, code) avant de
  // conclure — pour un admin (lecture globale) cela récupère l'UUID.
  if (!id) {
    const { data: found } = await supabase
      .from("etablissements")
      .select("id")
      .eq("country_id", countryId)
      .eq("code", code)
      .maybeSingle();
    id = (found as { id?: string } | null)?.id ?? null;
  }
  if (!id) {
    return { id: null, error: "Établissement enregistré mais non relisible (droits de lecture)." };
  }
  return { id };
}

/** Détecte une erreur « colonne absente » (PostgREST schema cache) — repli pré-migration. */
function isMissingColumnError(error: { code?: string; message?: string }): boolean {
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    msg.includes("region_name") ||
    msg.includes("locality") ||
    (msg.includes("column") && msg.includes("does not exist"))
  );
}

/**
 * Garantit l'existence d'un établissement du référentiel sélectionné (CI) et
 * renvoie son UUID. Conservé pour les appelants existants (panneau « Installer »,
 * rattachement d'un chef dans Comptes utilisateurs) — délègue à upsertEstablishment.
 */
export async function ensureEstablishment(
  supabase: SupabaseClient,
  sel: EtablissementSelection,
): Promise<{ id: string | null; error?: string }> {
  return upsertEstablishment(supabase, {
    countryCode: "CI",
    code: etablissementCode(sel),
    name: sel.name,
    dspsCode: sel.dspsCode ?? null,
  });
}

export interface InstalledEstablishment {
  id: string;
  name: string;
  code: string | null;
  dspsCode: string | null;
  /** ISO2 du pays (résolu via la jointure countries). */
  countryCode: string | null;
  /** Région en texte (migration 041), null si non renseignée. */
  regionName: string | null;
  locality: string | null;
}

/** Extrait l'iso2 d'un embed Supabase `countries(iso2)` (objet ou tableau). */
function readIso2(value: unknown): string | null {
  if (!value) return null;
  const row = Array.isArray(value) ? value[0] : value;
  const iso2 = (row as { iso2?: string } | null)?.iso2;
  return iso2 ? iso2.toUpperCase() : null;
}

/** Établissements déjà matérialisés (UUID + nom + codes + pays/région) — listes admin. */
export async function fetchInstalledEstablishments(
  supabase: SupabaseClient,
): Promise<InstalledEstablishment[]> {
  const full = await supabase
    .from("etablissements")
    .select("id, name, code, dsps_code, region_name, locality, countries(iso2)")
    .order("name", { ascending: true });
  let rows = (full.data ?? []) as unknown as Record<string, unknown>[];
  // Repli pré-migration 041 : sans region_name/locality.
  if (full.error && isMissingColumnError(full.error)) {
    const fb = await supabase
      .from("etablissements")
      .select("id, name, code, dsps_code, countries(iso2)")
      .order("name", { ascending: true });
    rows = (fb.data ?? []) as unknown as Record<string, unknown>[];
  }
  return rows.map((row) => {
    return {
      id: row.id as string,
      name: (row.name as string) ?? "",
      code: (row.code as string | null) ?? null,
      dspsCode: (row.dsps_code as string | null) ?? null,
      countryCode: readIso2(row.countries),
      regionName: (row.region_name as string | null) ?? null,
      locality: (row.locality as string | null) ?? null,
    };
  });
}

/** Retire un établissement installé (admin). Bloqué par la base s'il est référencé. */
export async function deleteInstalledEstablishment(
  supabase: SupabaseClient,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  // .select() pour distinguer un DELETE réellement effectué d'un DELETE filtré
  // silencieusement par la RLS (clause USING → 0 ligne, sans erreur).
  const { data, error } = await supabase
    .from("etablissements")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: "Suppression refusée (droits insuffisants)." };
  }
  return { ok: true };
}
