/**
 * Détection du mode backend + clés publiques Supabase (source unique).
 *
 * Si les variables Supabase sont présentes (en local via `.env.local`, en
 * production via les variables Vercel), l'application bascule en **mode réel**
 * (authentification + base de données). Sinon, elle reste en **mode démo**
 * (données en mémoire locale du navigateur) — comportement par défaut.
 */

/** URL du projet Supabase (publique). */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Clé publique côté client. Accepte les DEUX conventions de nommage Supabase :
 * - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — ancienne clé « anon » (JWT `eyJ…`)
 * - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — nouvelle clé « publishable » (`sb_publishable_…`)
 * Peu importe le nom utilisé dans Vercel / .env.local, l'app fonctionne.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
