import type { SupabaseClient } from "@supabase/supabase-js";

/* ============================================================================
   Magasin de réglages GLOBAUX admin (table public.app_settings, clé → JSONB).
   Chaque clé = nom d'une slice du store ; la valeur = le blob complet de la
   slice. Lecture pour tous (RLS), écriture admin (RLS). Client public uniquement.
   ========================================================================== */

/**
 * Charge plusieurs réglages par clé → map { key: value }.
 * PROPAGE l'erreur (throw) : l'appelant doit distinguer un « serveur vide »
 * légitime (retour `{}`) d'un ÉCHEC réseau/RLS — pour ne pas activer un
 * write-through qui écraserait le serveur avec un cache local.
 */
export async function fetchAppSettings(
  sb: SupabaseClient,
  keys: string[],
): Promise<Record<string, unknown>> {
  if (keys.length === 0) return {};
  const { data, error } = await sb.from("app_settings").select("key,value").in("key", keys);
  if (error) {
    console.error("[app-settings] lecture échouée :", error.message);
    throw error;
  }
  if (!data) return {};
  const out: Record<string, unknown> = {};
  for (const row of data as { key: string; value: unknown }[]) out[row.key] = row.value;
  return out;
}

/** Enregistre (upsert) un réglage global par clé. */
export async function saveAppSetting(
  sb: SupabaseClient,
  key: string,
  value: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb.from("app_settings").upsert(
    { key, value: value as Record<string, unknown>, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  return { ok: !error, error: error?.message };
}
