/**
 * Détection du mode backend.
 *
 * Si les variables Supabase sont présentes (en local via `.env.local`, en
 * production via les variables Vercel), l'application bascule en **mode réel**
 * (authentification + base de données). Sinon, elle reste en **mode démo**
 * (données en mémoire locale du navigateur) — comportement par défaut.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
