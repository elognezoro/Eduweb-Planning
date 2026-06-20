import { isSupabaseConfigured } from "@/lib/supabase/config";

/* ============================================================================
   Détection côté CLIENT du mode de paiement.

   La clé d'API Wave est secrète (serveur uniquement). Le client ne peut donc
   pas la « voir ». Pour basculer le checkout en mode serveur (redirection
   Wave) plutôt qu'en mode manuel (saisie d'une référence), on s'appuie sur un
   drapeau PUBLIC explicite, à activer une fois Wave configuré côté serveur :

       NEXT_PUBLIC_WAVE_ENABLED=1

   Sans ce drapeau (ou hors mode réel Supabase), le checkout reste en mode
   manuel / démo — comportement par défaut.
   ========================================================================== */

/** Le paiement serveur Wave est-il activé pour le client ? */
export function isWavePaymentEnabled(): boolean {
  return isSupabaseConfigured() && process.env.NEXT_PUBLIC_WAVE_ENABLED === "1";
}
