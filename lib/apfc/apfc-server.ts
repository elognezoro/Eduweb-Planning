import type { SupabaseClient } from "@supabase/supabase-js";

/* ============================================================================
   Accès Supabase au module APFC (tables apfc_antennas + apfc_activities).
   Isolation par antenne assurée côté serveur par la RLS (migration 021,
   clé head_profile_id). Ces helpers ne refont AUCUN contrôle d'accès : ils
   s'appuient sur la RLS (un Chef d'Antenne ne voit/écrit que SON antenne).
   ========================================================================== */

/** Antenne APFC (vue minimale, alignée sur le schéma réel). */
export interface ApfcAntennaRow {
  id: string;
  name: string;
  code: string | null;
  countryId: string | null;
  regionId: string | null;
  headProfileId: string | null;
}

/** Activité de formation continue d'une antenne. */
export interface ApfcActivityRow {
  id: string;
  antennaId: string;
  title: string;
  type: string | null;
  /** Date (ISO « AAAA-MM-JJ ») dérivée de starts_at. */
  date: string | null;
  status: string;
}

function mapAntenna(r: Record<string, unknown>): ApfcAntennaRow {
  return {
    id: r.id as string,
    name: (r.name as string) ?? "",
    code: (r.code as string | null) ?? null,
    countryId: (r.country_id as string | null) ?? null,
    regionId: (r.academic_region_id as string | null) ?? null,
    headProfileId: (r.head_profile_id as string | null) ?? null,
  };
}

function mapActivity(r: Record<string, unknown>): ApfcActivityRow {
  const starts = (r.starts_at as string | null) ?? null;
  return {
    id: r.id as string,
    antennaId: r.antenna_id as string,
    title: (r.title as string) ?? "",
    type: (r.activity_type as string | null) ?? null,
    date: starts ? starts.slice(0, 10) : null,
    status: (r.status as string) ?? "planned",
  };
}

const ANTENNA_COLS = "id,name,code,country_id,academic_region_id,head_profile_id";
const ACTIVITY_COLS = "id,antenna_id,title,activity_type,starts_at,status";

/** Toutes les antennes visibles (RLS : tout pour admin/apfc_admin ; sinon les siennes). */
export async function fetchApfcAntennas(sb: SupabaseClient): Promise<ApfcAntennaRow[]> {
  const { data, error } = await sb
    .from("apfc_antennas")
    .select(ANTENNA_COLS)
    .order("name", { ascending: true });
  if (error) return [];
  return (data ?? []).map(mapAntenna);
}

/** Antennes dont l'utilisateur courant est le Chef (head_profile_id = auth.uid()). */
export async function fetchMyApfcAntennas(sb: SupabaseClient): Promise<ApfcAntennaRow[]> {
  const { data: auth } = await sb.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return [];
  const { data, error } = await sb
    .from("apfc_antennas")
    .select(ANTENNA_COLS)
    .eq("head_profile_id", uid)
    .order("name", { ascending: true });
  if (error) return [];
  return (data ?? []).map(mapAntenna);
}

/** Crée une antenne (RLS : réservé à la gestion globale — admin/apfc_admin). */
export async function createApfcAntenna(
  sb: SupabaseClient,
  input: { name: string; code?: string | null; countryId?: string | null },
): Promise<{ id?: string; error?: string }> {
  const { data, error } = await sb
    .from("apfc_antennas")
    .insert({
      name: input.name,
      code: input.code ?? null,
      country_id: input.countryId ?? null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data?.id as string };
}

/**
 * Affecte (ou retire) le Chef d'une antenne, par e-mail.
 * `email = null` ⇒ retire le chef. RLS : seule la gestion globale peut écrire le registre.
 */
export async function assignApfcHeadByEmail(
  sb: SupabaseClient,
  antennaId: string,
  email: string | null,
): Promise<{ error?: string }> {
  let headId: string | null = null;
  if (email) {
    // `profiles.email` n'a pas de contrainte UNIQUE : on lève le doublon
    // explicitement (limit(2)) plutôt que de laisser maybeSingle() jeter.
    const { data: profs, error: pe } = await sb
      .from("profiles")
      .select("id")
      .ilike("email", email.trim())
      .limit(2);
    if (pe) return { error: pe.message };
    if (!profs || profs.length === 0) return { error: "Aucun compte ne correspond à cet e-mail." };
    if (profs.length > 1) return { error: "Plusieurs comptes portent cet e-mail ; contactez un administrateur." };
    headId = profs[0].id as string;
  }
  const { error } = await sb
    .from("apfc_antennas")
    .update({ head_profile_id: headId })
    .eq("id", antennaId);
  if (error) return { error: error.message };
  return {};
}

/** Activités d'une antenne (RLS : gestion globale ou chef de l'antenne). */
export async function fetchApfcActivities(
  sb: SupabaseClient,
  antennaId: string,
): Promise<ApfcActivityRow[]> {
  const { data, error } = await sb
    .from("apfc_activities")
    .select(ACTIVITY_COLS)
    .eq("antenna_id", antennaId)
    .order("starts_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapActivity);
}

/** Ajoute une activité à une antenne (RLS : gestion globale ou chef de l'antenne). */
export async function addApfcActivity(
  sb: SupabaseClient,
  input: { antennaId: string; title: string; type?: string | null; date?: string | null },
): Promise<{ id?: string; error?: string }> {
  const { data, error } = await sb
    .from("apfc_activities")
    .insert({
      antenna_id: input.antennaId,
      title: input.title,
      activity_type: input.type ?? null,
      starts_at: input.date ? new Date(input.date).toISOString() : null,
      status: "planned",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data?.id as string };
}

/** Met à jour une activité (RLS : gestion globale ou chef de l'antenne porteuse). */
export async function updateApfcActivity(
  sb: SupabaseClient,
  id: string,
  patch: { title?: string; type?: string | null; date?: string | null; status?: string },
): Promise<{ error?: string }> {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.type !== undefined) row.activity_type = patch.type;
  if (patch.date !== undefined) row.starts_at = patch.date ? new Date(patch.date).toISOString() : null;
  if (patch.status !== undefined) row.status = patch.status;
  const { error } = await sb.from("apfc_activities").update(row).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

/** Supprime une activité (RLS : gestion globale ou chef de l'antenne porteuse). */
export async function removeApfcActivity(
  sb: SupabaseClient,
  id: string,
): Promise<{ error?: string }> {
  const { error } = await sb.from("apfc_activities").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
