import type { SupabaseClient } from "@supabase/supabase-js";

/* ============================================================================
   Liens d'inscription COURTS (migration 009).

   Associe un code court à un jeton d'invitation auto-porteur. La route publique
   `/i/<code>` redirige vers `/register?invite=<jeton>`. Le lien partagé est donc
   court et du domaine officiel (anti-hameçonnage).
   ========================================================================== */

const CODE_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // sans o/l/0/1 ambigus

/** Code court aléatoire (cryptographiquement sûr), longueur ~8. */
function generateCode(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

/** URL courte complète d'un code. */
export function shortInviteUrl(origin: string, code: string): string {
  return `${origin.replace(/\/$/, "")}/i/${code}`;
}

/**
 * Crée un lien court (code → jeton) en base et renvoie le code, ou null en cas
 * d'échec (RLS : réservé à l'admin). Réessaie en cas de collision de code.
 */
export async function createShortInviteLink(
  supabase: SupabaseClient,
  token: string,
  label?: string,
): Promise<string | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const code = generateCode();
    const { error } = await supabase
      .from("invite_links")
      .insert({ code, token, label: label ?? null });
    if (!error) return code;
    // Collision de clé primaire → on réessaie ; toute autre erreur → abandon.
    if (!/duplicate|unique|conflict|already exists/i.test(error.message ?? "")) {
      return null;
    }
  }
  return null;
}
