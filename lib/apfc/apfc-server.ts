import type { SupabaseClient } from "@supabase/supabase-js";

/* ============================================================================
   Accès Supabase au module APFC (tables apfc_antennas + apfc_activities).
   Isolation par antenne assurée côté serveur par la RLS (migration 021,
   clé head_profile_id). Ces helpers ne refont AUCUN contrôle d'accès : ils
   s'appuient sur la RLS (un Chef d'Antenne ne voit/écrit que SON antenne).
   ========================================================================== */

/** Antenne APFC (alignée sur le schéma réel, migrations 001/021/022). */
export interface ApfcAntennaRow {
  id: string;
  name: string;
  code: string | null;
  countryId: string | null;
  regionId: string | null;
  headProfileId: string | null;
  /** Champs descriptifs (migration 022). */
  region: string | null;
  locality: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  responsable: string | null;
  responsableContact: string | null;
  subAntennas: number;
  coordinators: number;
}

/** Champs modifiables d'une antenne (création / édition par la gestion globale). */
export interface ApfcAntennaInput {
  name: string;
  code?: string | null;
  countryId?: string | null;
  region?: string | null;
  locality?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  responsable?: string | null;
  responsableContact?: string | null;
  subAntennas?: number;
  coordinators?: number;
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
    region: (r.region as string | null) ?? null,
    locality: (r.locality as string | null) ?? null,
    address: (r.address as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    email: (r.email as string | null) ?? null,
    responsable: (r.responsable as string | null) ?? null,
    responsableContact: (r.responsable_contact as string | null) ?? null,
    subAntennas: Number(r.sub_antennas ?? 0),
    coordinators: Number(r.coordinators ?? 0),
  };
}

/** Construit la ligne SQL (snake_case) à partir d'un input partiel. */
function antennaRow(input: Partial<ApfcAntennaInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.code !== undefined) row.code = input.code;
  if (input.countryId !== undefined) row.country_id = input.countryId;
  if (input.region !== undefined) row.region = input.region;
  if (input.locality !== undefined) row.locality = input.locality;
  if (input.address !== undefined) row.address = input.address;
  if (input.phone !== undefined) row.phone = input.phone;
  if (input.email !== undefined) row.email = input.email;
  if (input.responsable !== undefined) row.responsable = input.responsable;
  if (input.responsableContact !== undefined) row.responsable_contact = input.responsableContact;
  if (input.subAntennas !== undefined) row.sub_antennas = input.subAntennas;
  if (input.coordinators !== undefined) row.coordinators = input.coordinators;
  return row;
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

const ANTENNA_COLS =
  "id,name,code,country_id,academic_region_id,head_profile_id,region,locality,address,phone,email,responsable,responsable_contact,sub_antennas,coordinators";
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
  input: ApfcAntennaInput,
): Promise<{ id?: string; error?: string }> {
  const { data, error } = await sb
    .from("apfc_antennas")
    .insert(antennaRow(input))
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data?.id as string };
}

/** Met à jour les champs descriptifs d'une antenne (RLS : gestion globale). */
export async function updateApfcAntenna(
  sb: SupabaseClient,
  id: string,
  patch: Partial<ApfcAntennaInput>,
): Promise<{ error?: string }> {
  const row = antennaRow(patch);
  if (Object.keys(row).length === 0) return {};
  const { error } = await sb.from("apfc_antennas").update(row).eq("id", id);
  if (error) return { error: error.message };
  return {};
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
