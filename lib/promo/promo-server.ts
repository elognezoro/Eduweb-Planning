import type { SupabaseClient } from "@supabase/supabase-js";
import type { PromoRequest } from "@/components/app-shell/data-store";

/* ============================================================================
   Accès Supabase aux demandes de code promo (`promo_requests`, migration 044).
   Per-utilisateur : insertion = la sienne ; décision (update) = admin (RLS).
   Best-effort (pas de throw) pour un mode dual robuste.
   ========================================================================== */

interface DbPromoRow {
  id: string;
  user_id: string | null;
  requester: string | null;
  requester_role: string | null;
  etablissement: string | null;
  type: string | null;
  pct: number | string | null;
  justification: string | null;
  requested_at: string;
  status: string;
  code: string | null;
  decided_by: string | null;
  decided_at: string | null;
  reason: string | null;
}

function mapRow(r: DbPromoRow): PromoRequest {
  return {
    id: r.id,
    userId: r.user_id ?? undefined,
    requester: r.requester ?? "",
    requesterRole: r.requester_role ?? "",
    etablissement: r.etablissement ?? "",
    type: r.type ?? "",
    pct: Number(r.pct ?? 0),
    justification: r.justification ?? "",
    requestedAt: r.requested_at,
    status: (r.status as PromoRequest["status"]) ?? "pending",
    code: r.code ?? undefined,
    decidedBy: r.decided_by ?? undefined,
    decidedAt: r.decided_at ?? undefined,
    reason: r.reason ?? undefined,
  };
}

/** Charge les demandes visibles (les siennes, ou toutes si admin — RLS). [] si erreur. */
export async function fetchPromoRequests(supabase: SupabaseClient): Promise<PromoRequest[]> {
  const { data, error } = await supabase
    .from("promo_requests")
    .select(
      "id, user_id, requester, requester_role, etablissement, type, pct, justification, requested_at, status, code, decided_by, decided_at, reason",
    )
    .order("requested_at", { ascending: false });
  if (error || !data) return [];
  return (data as DbPromoRow[]).map(mapRow);
}

/** Dépose une demande (insertion ; user_id = auth.uid via RLS). */
export async function insertPromoRequest(
  supabase: SupabaseClient,
  r: PromoRequest,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("promo_requests").insert({
    id: r.id,
    user_id: r.userId ?? null,
    requester: r.requester,
    requester_role: r.requesterRole,
    etablissement: r.etablissement,
    type: r.type,
    pct: r.pct,
    justification: r.justification,
    requested_at: r.requestedAt,
    status: r.status,
  });
  return { ok: !error, error: error?.message };
}

/** Trace la DÉCISION admin (statut/code/refus) — n'altère jamais user_id. */
export async function updatePromoDecision(
  supabase: SupabaseClient,
  r: PromoRequest,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("promo_requests")
    .update({
      status: r.status,
      code: r.code ?? null,
      decided_by: r.decidedBy ?? null,
      decided_at: r.decidedAt ?? null,
      reason: r.reason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", r.id);
  return { ok: !error, error: error?.message };
}
