import type { SupabaseClient } from "@supabase/supabase-js";
import type { CoursePayment } from "@/lib/formations/payment";
import type { ModuleCompletion, CourseCompletion } from "@/lib/formations/types";

/* ============================================================================
   Persistance PAR UTILISATEUR de la progression apprenant (migration 039).
   Lecture/écriture sous RLS (les siennes, ou tout si admin). Client public.
   ========================================================================== */

/* ---------- Paiements de cours ------------------------------------------- */

interface DbPaymentRow {
  id: string;
  user_id: string;
  user_name: string | null;
  course_id: string;
  amount_fcfa: number;
  operator: string | null;
  reference: string | null;
  payer_number: string | null;
  status: string;
  submitted_at: string;
  decided_by: string | null;
  decided_at: string | null;
  note: string | null;
}

function toPayment(r: DbPaymentRow): CoursePayment {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name ?? "",
    courseId: r.course_id,
    amountFcfa: r.amount_fcfa,
    operator: (r.operator ?? "orange") as CoursePayment["operator"],
    reference: r.reference ?? "",
    payerNumber: r.payer_number ?? undefined,
    status: r.status as CoursePayment["status"],
    submittedAt: r.submitted_at,
    decidedBy: r.decided_by ?? undefined,
    decidedAt: r.decided_at ?? undefined,
    note: r.note ?? undefined,
  };
}

export async function fetchCoursePayments(sb: SupabaseClient): Promise<CoursePayment[]> {
  const { data, error } = await sb.from("course_payments").select("*");
  if (error || !data) return [];
  return (data as DbPaymentRow[]).map(toPayment);
}

export async function upsertCoursePayment(
  sb: SupabaseClient,
  p: CoursePayment,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb.from("course_payments").upsert(
    {
      id: p.id,
      user_id: p.userId,
      user_name: p.userName,
      course_id: p.courseId,
      amount_fcfa: p.amountFcfa,
      operator: p.operator,
      reference: p.reference,
      payer_number: p.payerNumber ?? null,
      status: p.status,
      submitted_at: p.submittedAt,
      decided_by: p.decidedBy ?? null,
      decided_at: p.decidedAt ?? null,
      note: p.note ?? null,
    },
    { onConflict: "id" },
  );
  return { ok: !error, error: error?.message };
}

export async function deleteCoursePayment(
  sb: SupabaseClient,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb.from("course_payments").delete().eq("id", id);
  return { ok: !error, error: error?.message };
}

/* ---------- Complétions de module ---------------------------------------- */

interface DbModuleRow {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  completed_at: string;
  source: string;
  score: number | null;
}

function toModule(r: DbModuleRow): ModuleCompletion {
  return {
    id: r.id,
    userId: r.user_id,
    courseId: r.course_id,
    moduleId: r.module_id,
    completedAt: r.completed_at,
    source: r.source as ModuleCompletion["source"],
    score: r.score ?? undefined,
  };
}

export async function fetchModuleCompletions(sb: SupabaseClient): Promise<ModuleCompletion[]> {
  const { data, error } = await sb.from("module_completions").select("*");
  if (error || !data) return [];
  return (data as DbModuleRow[]).map(toModule);
}

export async function upsertModuleCompletion(
  sb: SupabaseClient,
  m: ModuleCompletion,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb.from("module_completions").upsert(
    {
      id: m.id,
      user_id: m.userId,
      course_id: m.courseId,
      module_id: m.moduleId,
      completed_at: m.completedAt,
      source: m.source,
      score: m.score ?? null,
    },
    { onConflict: "user_id,course_id,module_id" },
  );
  return { ok: !error, error: error?.message };
}

export async function deleteModuleCompletion(
  sb: SupabaseClient,
  m: { userId: string; courseId: string; moduleId: string },
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb
    .from("module_completions")
    .delete()
    .eq("user_id", m.userId)
    .eq("course_id", m.courseId)
    .eq("module_id", m.moduleId);
  return { ok: !error, error: error?.message };
}

/* ---------- Réussite globale du cours ------------------------------------ */

interface DbCourseRow {
  id: string;
  user_id: string;
  course_id: string;
  completed_at: string;
  source: string;
  score: number | null;
  certificate_delivered: boolean | null;
}

function toCourse(r: DbCourseRow): CourseCompletion {
  return {
    id: r.id,
    userId: r.user_id,
    courseId: r.course_id,
    completedAt: r.completed_at,
    source: r.source as CourseCompletion["source"],
    score: r.score ?? undefined,
    certificateDelivered: r.certificate_delivered ?? undefined,
  };
}

export async function fetchCourseCompletions(sb: SupabaseClient): Promise<CourseCompletion[]> {
  const { data, error } = await sb.from("course_completions").select("*");
  if (error || !data) return [];
  return (data as DbCourseRow[]).map(toCourse);
}

export async function upsertCourseCompletion(
  sb: SupabaseClient,
  c: CourseCompletion,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb.from("course_completions").upsert(
    {
      id: c.id,
      user_id: c.userId,
      course_id: c.courseId,
      completed_at: c.completedAt,
      source: c.source,
      score: c.score ?? null,
      certificate_delivered: c.certificateDelivered ?? false,
    },
    { onConflict: "user_id,course_id" },
  );
  return { ok: !error, error: error?.message };
}

export async function deleteCourseCompletion(
  sb: SupabaseClient,
  c: { userId: string; courseId: string },
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb
    .from("course_completions")
    .delete()
    .eq("user_id", c.userId)
    .eq("course_id", c.courseId);
  return { ok: !error, error: error?.message };
}
