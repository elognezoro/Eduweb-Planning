import type { SupabaseClient } from "@supabase/supabase-js";

/* ============================================================================
   Persistance serveur de la configuration d'établissement (table
   public.etablissement_config, 1 ligne JSONB par établissement). Le blob est
   opaque ici (la forme `EtabConfig` vit côté page) : on stocke/retourne le JSON
   complet pour ne perdre aucun champ. RLS = autorité (helper côté client public
   uniquement ; jamais la service-role).
   ========================================================================== */

/** Charge la config d'un établissement. `null` si absente ou erreur. */
export async function fetchEtabConfig(
  sb: SupabaseClient,
  etablissementId: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await sb
    .from("etablissement_config")
    .select("config_data")
    .eq("etablissement_id", etablissementId)
    .maybeSingle();
  if (error || !data?.config_data) return null;
  return data.config_data as Record<string, unknown>;
}

/** Enregistre (upsert) la config d'un établissement. */
export async function saveEtabConfig(
  sb: SupabaseClient,
  etablissementId: string,
  config: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb.from("etablissement_config").upsert(
    {
      etablissement_id: etablissementId,
      config_data: config as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "etablissement_id" },
  );
  return { ok: !error, error: error?.message };
}
