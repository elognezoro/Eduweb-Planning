import crypto from "node:crypto";

/* ============================================================================
   Adaptateur de paiement WAVE (Checkout API) — Phase 2, côté serveur.

   Flux :
   1. Le serveur crée une session de paiement (createWaveCheckout) et redirige
      l'utilisateur vers `wave_launch_url`.
   2. L'utilisateur paie sur la page hébergée Wave.
   3. Wave appelle notre webhook (event `checkout.session.completed`) signé via
      l'entête `Wave-Signature` ; on vérifie la signature (verifyWaveSignature)
      avant de confirmer le paiement et d'inscrire l'utilisateur.

   Tout est inactif tant que WAVE_API_KEY / WAVE_WEBHOOK_SECRET ne sont pas
   renseignés (variables d'environnement serveur). Voir docs/phase2-paiement-wave.md.

   NB : Wave attend des montants en chaîne, dans l'unité principale de la
   devise. Le XOF (FCFA) n'a pas de sous-unité → "1000" = 1000 FCFA.
   ========================================================================== */

const WAVE_API_BASE = "https://api.wave.com/v1";

/** La clé d'API Wave est-elle configurée (initiation de paiement possible) ? */
export function isWaveConfigured(): boolean {
  return Boolean(process.env.WAVE_API_KEY);
}

/** Le secret de webhook Wave est-il configuré (vérification de signature) ? */
export function isWaveWebhookConfigured(): boolean {
  return Boolean(process.env.WAVE_WEBHOOK_SECRET);
}

export interface WaveCheckoutSession {
  /** Identifiant de session Wave (ex. `cos-...`). */
  id: string;
  /** URL hébergée vers laquelle rediriger l'utilisateur pour payer. */
  launchUrl: string;
}

/**
 * Crée une session de paiement Wave. Lève une erreur si la clé est absente ou
 * si Wave renvoie un statut non 2xx.
 */
export async function createWaveCheckout(params: {
  amountFcfa: number;
  successUrl: string;
  errorUrl: string;
  /** Référence métier renvoyée par le webhook (notre id de paiement). */
  clientReference: string;
}): Promise<WaveCheckoutSession> {
  const key = process.env.WAVE_API_KEY;
  if (!key) throw new Error("WAVE_API_KEY manquant");

  const res = await fetch(`${WAVE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // Idempotence : un même clientReference ne crée qu'une session.
      "idempotency-key": params.clientReference,
    },
    body: JSON.stringify({
      amount: String(Math.max(0, Math.round(params.amountFcfa))),
      currency: "XOF",
      success_url: params.successUrl,
      error_url: params.errorUrl,
      client_reference: params.clientReference,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Wave checkout error ${res.status}: ${text}`);
  }
  const data = (await res.json()) as {
    id: string;
    wave_launch_url: string;
  };
  return { id: data.id, launchUrl: data.wave_launch_url };
}

/**
 * Vérifie la signature d'un webhook Wave.
 *
 * Entête `Wave-Signature` au format `t=<timestamp>,v1=<hmac_hex>`. La signature
 * attendue est `HMAC-SHA256( "<t>.<rawBody>", secret )` en hexadécimal.
 * Comparaison à temps constant.
 */
export function verifyWaveSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(",")) {
    const eq = segment.indexOf("=");
    if (eq === -1) continue;
    parts[segment.slice(0, eq).trim()] = segment.slice(eq + 1).trim();
  }
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${t}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(v1, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Forme minimale d'un événement webhook Wave qui nous intéresse. */
export interface WaveWebhookEvent {
  type: string;
  data: {
    id: string;
    client_reference?: string | null;
    payment_status?: string;
    checkout_status?: string;
  };
}
