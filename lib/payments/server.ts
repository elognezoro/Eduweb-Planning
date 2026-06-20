import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/* ============================================================================
   Opérations serveur de paiement (Phase 2) via le client Supabase service-role.

   Tables (voir docs/phase2-paiement-wave.md) :
   - course_prices       : tarif serveur faisant FOI (course_id, amount_fcfa)
   - course_payments     : paiements (statut pending|confirmed|failed)
   - course_enrollments  : inscriptions durables (unique user_id+course_id)

   Le client service-role contourne le RLS : à n'utiliser QUE côté serveur
   (route handlers, webhooks). Jamais importé côté client (`server-only`).
   ========================================================================== */

export type ServerPaymentStatus = "pending" | "confirmed" | "failed";

/** Tarif serveur d'un cours (0 si non défini = gratuit, paiement refusé). */
export async function getServerCoursePrice(courseId: string): Promise<number> {
  const db = createAdminClient();
  const { data } = await db
    .from("course_prices")
    .select("amount_fcfa")
    .eq("course_id", courseId)
    .maybeSingle();
  return data?.amount_fcfa ?? 0;
}

/** Crée un paiement « pending » et renvoie son id. */
export async function createPendingPayment(input: {
  userId: string;
  courseId: string;
  amountFcfa: number;
}): Promise<string> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("course_payments")
    .insert({
      user_id: input.userId,
      course_id: input.courseId,
      amount_fcfa: input.amountFcfa,
      provider: "wave",
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

/** Associe l'id de session Wave à un paiement. */
export async function attachSessionId(
  paymentId: string,
  sessionId: string,
): Promise<void> {
  const db = createAdminClient();
  await db
    .from("course_payments")
    .update({ session_id: sessionId })
    .eq("id", paymentId);
}

/**
 * Confirme un paiement (par son id métier `client_reference`) et inscrit
 * l'utilisateur au cours, de façon IDEMPOTENTE.
 * Renvoie `true` si une confirmation a eu lieu (ou était déjà faite).
 */
export async function confirmPaymentAndEnroll(
  paymentId: string,
): Promise<boolean> {
  const db = createAdminClient();
  const { data: pay } = await db
    .from("course_payments")
    .select("id, user_id, course_id, status")
    .eq("id", paymentId)
    .maybeSingle();
  if (!pay) return false;

  if (pay.status !== "confirmed") {
    await db
      .from("course_payments")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", pay.id);
  }

  // Inscription durable, idempotente (unique user_id + course_id).
  await db.from("course_enrollments").upsert(
    {
      user_id: pay.user_id,
      course_id: pay.course_id,
      source: "payment",
      enrolled_by: "Paiement Wave",
    },
    { onConflict: "user_id,course_id" },
  );
  return true;
}

/** Marque un paiement comme échoué. */
export async function failPayment(paymentId: string): Promise<void> {
  const db = createAdminClient();
  await db
    .from("course_payments")
    .update({ status: "failed", confirmed_at: new Date().toISOString() })
    .eq("id", paymentId);
}

/** Statut d'un paiement (+ cours), restreint à son propriétaire. */
export async function getPaymentStatusFor(
  paymentId: string,
  userId: string,
): Promise<{ status: ServerPaymentStatus; courseId: string } | null> {
  const db = createAdminClient();
  const { data } = await db
    .from("course_payments")
    .select("status, user_id, course_id")
    .eq("id", paymentId)
    .maybeSingle();
  if (!data || data.user_id !== userId) return null;
  return {
    status: data.status as ServerPaymentStatus,
    courseId: data.course_id as string,
  };
}
