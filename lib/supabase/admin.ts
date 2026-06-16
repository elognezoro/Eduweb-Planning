import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase « service role » — réservé aux scripts serveur (seed, webhooks).
 * NE JAMAIS importer côté client : la clé service contourne le RLS.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
