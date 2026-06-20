/* ============================================================================
   Démarrage d'un paiement Wave côté client.

   Appelle l'endpoint serveur d'initiation, puis redirige le navigateur vers la
   page de paiement hébergée Wave. Le montant et la sécurité sont gérés côté
   serveur (le client n'envoie que le courseId).
   ========================================================================== */

export interface StartCheckoutResult {
  ok: boolean;
  error?: string;
}

/** Initie un paiement Wave et redirige vers la page de paiement. */
export async function startWaveCheckout(
  courseId: string,
): Promise<StartCheckoutResult> {
  try {
    const res = await fetch("/api/payments/wave/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      url?: string;
      error?: string;
    };
    if (!res.ok || !data.url) {
      return {
        ok: false,
        error: data.error ?? "Échec de l'initiation du paiement.",
      };
    }
    window.location.href = data.url;
    return { ok: true };
  } catch {
    return { ok: false, error: "Réseau indisponible. Réessayez." };
  }
}
