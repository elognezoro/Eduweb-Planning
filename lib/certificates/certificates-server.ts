import type { SupabaseClient } from "@supabase/supabase-js";
import type { DeliveredCertificate } from "@/components/app-shell/data-store";

/* ============================================================================
   Accès Supabase au journal des certificats (`certificates_log`, migration 045)
   + numérotation atomique serveur (RPC next_certificate_number).
   Cloisonné par établissement (RLS). Best-effort (pas de throw).
   ========================================================================== */

interface DbCertRow {
  id: string;
  number: string;
  beneficiary_name: string | null;
  beneficiary_role: string | null;
  issue_date: string | null;
  formation_code: string | null;
  formation_version: string | null;
  valid_until: string | null;
  establishment: string | null;
  establishment_code: string | null;
  delivered_by: string | null;
  notes: string | null;
  registered_at: string;
}

function mapRow(r: DbCertRow): DeliveredCertificate {
  return {
    id: r.id,
    number: r.number,
    beneficiaryName: r.beneficiary_name ?? "",
    beneficiaryRole: r.beneficiary_role ?? "",
    issueDate: r.issue_date ?? "",
    formationCode: r.formation_code ?? "",
    formationVersion: r.formation_version ?? "",
    validUntil: r.valid_until ?? "",
    establishment: r.establishment ?? "",
    establishmentCode: r.establishment_code ?? "",
    deliveredBy: r.delivered_by ?? "",
    registeredAt: r.registered_at,
    notes: r.notes ?? undefined,
  };
}

/**
 * Numéro de certificat ATOMIQUE côté serveur (CODE-ANNÉE-NNN) : garantit
 * l'unicité cross-poste. Renvoie null si la RPC échoue (l'appelant retombe sur
 * la séquence locale en mode démo / repli).
 */
export async function nextCertificateNumber(
  supabase: SupabaseClient,
  etabCode: string | null | undefined,
  year: number,
): Promise<string | null> {
  const { data, error } = await supabase.rpc("next_certificate_number", {
    p_etab_code: etabCode ?? "EDU",
    p_year: year,
  });
  if (error || typeof data !== "string") return null;
  return data;
}

/** Charge le journal des certificats de l'établissement (RLS). [] si erreur. */
export async function fetchCertificates(supabase: SupabaseClient): Promise<DeliveredCertificate[]> {
  const { data, error } = await supabase
    .from("certificates_log")
    .select(
      "id, number, beneficiary_name, beneficiary_role, issue_date, formation_code, formation_version, valid_until, establishment, establishment_code, delivered_by, notes, registered_at",
    )
    .order("registered_at", { ascending: false });
  if (error || !data) return [];
  return (data as DbCertRow[]).map(mapRow);
}

/** Insère un certificat délivré (rattaché à l'établissement — RLS). */
export async function insertCertificate(
  supabase: SupabaseClient,
  cert: DeliveredCertificate,
  etablissementId: string | null,
  registeredBy?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("certificates_log").insert({
    id: cert.id,
    etablissement_id: etablissementId,
    number: cert.number,
    beneficiary_name: cert.beneficiaryName,
    beneficiary_role: cert.beneficiaryRole || null,
    issue_date: cert.issueDate || null,
    formation_code: cert.formationCode || null,
    formation_version: cert.formationVersion || null,
    valid_until: cert.validUntil || null,
    establishment: cert.establishment || null,
    establishment_code: cert.establishmentCode || null,
    delivered_by: cert.deliveredBy || null,
    notes: cert.notes || null,
    registered_by: registeredBy ?? null,
  });
  return { ok: !error, error: error?.message };
}

/** Supprime une entrée du journal (par id ; RLS = établissement). */
export async function deleteCertificate(
  supabase: SupabaseClient,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("certificates_log").delete().eq("id", id);
  return { ok: !error, error: error?.message };
}
