"use client";

import * as React from "react";
import { isWavePaymentEnabled } from "@/lib/payments/config";
import { createClient } from "@/lib/supabase/client";

/**
 * Inscription DURABLE côté serveur (table course_enrollments) pour le cours et
 * l'utilisateur courant. Permet à un paiement confirmé (webhook Wave) de donner
 * accès au cours sur n'importe quel appareil — indépendamment du store local.
 *
 * N'effectue de requête qu'en mode réel + paiement Wave activé
 * (NEXT_PUBLIC_WAVE_ENABLED=1) ; sinon no-op immédiat (aucun appel réseau).
 * La lecture passe par le client navigateur (clé publique + session) : le RLS
 * restreint la ligne au propriétaire.
 */
export function useServerEnrollment(courseId: string): {
  enrolled: boolean;
  loading: boolean;
} {
  const enabled = isWavePaymentEnabled();
  const [state, setState] = React.useState<{
    enrolled: boolean;
    loading: boolean;
  }>({ enrolled: false, loading: enabled });

  React.useEffect(() => {
    if (!enabled) {
      setState({ enrolled: false, loading: false });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const db = createClient();
        const {
          data: { user },
        } = await db.auth.getUser();
        if (!user) {
          if (!cancelled) setState({ enrolled: false, loading: false });
          return;
        }
        const { data } = await db
          .from("course_enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .maybeSingle();
        if (!cancelled) setState({ enrolled: Boolean(data), loading: false });
      } catch {
        if (!cancelled) setState({ enrolled: false, loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, courseId]);

  return state;
}
