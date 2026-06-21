import type { SupabaseClient } from "@supabase/supabase-js";
import type { SecuritySettings } from "@/components/app-shell/data-store";

/* ============================================================================
   Accès Supabase aux réglages de sécurité globaux (migration 015).

   Singleton `security_settings` (id = 'global'). Lecture par tout utilisateur
   authentifié (RLS) ; écriture via la RPC `save_security_settings` qui valide
   l'appelant admin / super-admin côté serveur (fail-closed).
   ========================================================================== */

const GLOBAL_ID = "global";

function mapSettings(r: Record<string, unknown>): SecuritySettings {
  return {
    idleLogoutEnabled: Boolean(r.idle_logout_enabled),
    idleLogoutMinutes: Math.max(1, Math.min(240, Number(r.idle_logout_minutes ?? 20))),
    idleWarningSeconds: Math.max(10, Math.min(120, Number(r.idle_warning_seconds ?? 30))),
  };
}

/** Lit les réglages de sécurité globaux, ou null si absents / inaccessibles. */
export async function fetchSecuritySettings(
  supabase: SupabaseClient,
): Promise<SecuritySettings | null> {
  const { data } = await supabase
    .from("security_settings")
    .select("*")
    .eq("id", GLOBAL_ID)
    .maybeSingle();
  return data ? mapSettings(data as Record<string, unknown>) : null;
}

/**
 * Enregistre les réglages de sécurité globaux (admin / super-admin uniquement).
 * Passe par la RPC SECURITY DEFINER : l'autorisation est vérifiée en base.
 */
export async function saveSecuritySettings(
  supabase: SupabaseClient,
  s: SecuritySettings,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc("save_security_settings", {
    p_enabled: s.idleLogoutEnabled,
    p_minutes: s.idleLogoutMinutes,
    p_warning: s.idleWarningSeconds,
  });
  return { ok: !error, error: error?.message };
}
