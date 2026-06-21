import type { SupabaseClient } from "@supabase/supabase-js";
import type { EtablissementSelection } from "@/components/etablissements/etablissement-combobox";

/* ============================================================================
   Persistance des établissements dans Supabase (à la demande).

   Le référentiel CI (2921) est chargé côté client pour la liste déroulante ;
   un établissement n'est matérialisé dans la table `etablissements` (avec un
   UUID réel) qu'au moment où il est réellement utilisé (config transport,
   rattachement d'un chef…). On évite ainsi de semer 2921 lignes d'avance.

   La table porte le **code EduWeb** dans `code` (unique par pays) et le **code
   DSPS** dans `dsps_code` (migration 019). Écriture réservée à l'admin (RLS).
   ========================================================================== */

function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Code stocké dans `etablissements.code` (EduWeb, ou dérivé pour une saisie libre). */
export function etablissementCode(sel: EtablissementSelection): string {
  return sel.eduwebCode ?? `LIBRE-${slug(sel.name)}`;
}

/**
 * Garantit l'existence de l'établissement sélectionné dans Supabase et renvoie
 * son UUID. Upsert par (country_id, code). Réservé aux admins (RLS) ; renvoie
 * `{ id: null, error }` en cas d'échec (ex. droits insuffisants).
 */
export async function ensureEstablishment(
  supabase: SupabaseClient,
  sel: EtablissementSelection,
): Promise<{ id: string | null; error?: string }> {
  const { data: country } = await supabase
    .from("countries")
    .select("id")
    .eq("iso2", "CI")
    .maybeSingle();
  const countryId = (country as { id?: string } | null)?.id;
  if (!countryId) return { id: null, error: "Pays (Côte d'Ivoire) introuvable." };

  const code = etablissementCode(sel);
  const { data, error } = await supabase
    .from("etablissements")
    .upsert(
      {
        country_id: countryId,
        code,
        name: sel.name,
        dsps_code: sel.dspsCode ?? null,
        status: "active",
      },
      { onConflict: "country_id,code" },
    )
    .select("id")
    .maybeSingle();
  if (error) return { id: null, error: error.message };
  return { id: (data as { id?: string } | null)?.id ?? null };
}

/** Établissements déjà matérialisés (UUID + nom + codes) — pour les listes admin. */
export async function fetchInstalledEstablishments(
  supabase: SupabaseClient,
): Promise<{ id: string; name: string; code: string | null; dspsCode: string | null }[]> {
  const { data } = await supabase
    .from("etablissements")
    .select("id, name, code, dsps_code")
    .order("name", { ascending: true });
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: row.id as string,
      name: (row.name as string) ?? "",
      code: (row.code as string | null) ?? null,
      dspsCode: (row.dsps_code as string | null) ?? null,
    };
  });
}
