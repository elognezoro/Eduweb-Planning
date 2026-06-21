import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BusPosition,
  PaymentStatus,
  SlotDirection,
  SubscriptionPeriod,
  TransportBus,
  TransportDriver,
  TransportPayment,
  TransportSettings,
  TransportSlot,
  TransportSubscription,
} from "./transport";
import { trimTime } from "./transport";

/* ============================================================================
   Accès Supabase au module Transport (migration 010, périmètre global v1).
   ========================================================================== */

/** Clé de périmètre des réglages : uuid de l'établissement, ou 'global'. */
export function settingsScopeKey(etablissementId: string | null): string {
  return etablissementId ?? "global";
}

/* ---- Mappers ------------------------------------------------------------- */
function mapSettings(r: Record<string, unknown>): TransportSettings {
  // Reprise : si les colonnes par formule sont absentes (avant migration 016),
  // on retombe sur l'ancien tarif unique `price_fcfa` pour le mensuel.
  const legacy = Number(r.price_fcfa ?? 0);
  return {
    priceMonthFcfa: Number(r.price_month_fcfa ?? legacy),
    priceYearFcfa: Number(r.price_year_fcfa ?? 0),
    beepIntervalMin: Number(r.beep_interval_min ?? 5),
    centerLat: (r.center_lat as number | null) ?? null,
    centerLng: (r.center_lng as number | null) ?? null,
  };
}

function mapSlot(r: Record<string, unknown>): TransportSlot {
  return {
    id: r.id as string,
    etablissementId: (r.etablissement_id as string | null) ?? null,
    label: (r.label as string) ?? undefined,
    direction: ((r.direction as SlotDirection) ?? "aller") as SlotDirection,
    days: Array.isArray(r.days) ? (r.days as number[]) : [],
    startTime: trimTime(r.start_time as string),
    endTime: trimTime(r.end_time as string),
    active: Boolean(r.active),
  };
}

function mapPosition(r: Record<string, unknown>): BusPosition {
  return {
    busId: r.bus_id as string,
    driverId: (r.driver_id as string | null) ?? null,
    lat: Number(r.lat),
    lng: Number(r.lng),
    heading: (r.heading as number | null) ?? null,
    speed: (r.speed as number | null) ?? null,
    direction: (r.direction as string | null) ?? null,
    updatedAt: (r.updated_at as string) ?? "",
  };
}

function mapBus(r: Record<string, unknown>): TransportBus {
  return {
    id: r.id as string,
    etablissementId: (r.etablissement_id as string | null) ?? null,
    matricule: (r.matricule as string) ?? "",
    label: (r.label as string) ?? undefined,
    active: Boolean(r.active),
  };
}

/** Liste des établissements (pour le sélecteur du super-admin). */
export async function fetchEstablishments(
  supabase: SupabaseClient,
): Promise<{ id: string; name: string }[]> {
  const { data } = await supabase
    .from("etablissements")
    .select("id, name")
    .order("name", { ascending: true });
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return { id: row.id as string, name: (row.name as string) ?? "Établissement" };
  });
}

/* ---- Réglages & créneaux ------------------------------------------------- */
export async function fetchTransportSettings(
  supabase: SupabaseClient,
  scopeKey: string,
): Promise<TransportSettings | null> {
  const { data } = await supabase
    .from("transport_settings")
    .select("*")
    .eq("id", scopeKey)
    .maybeSingle();
  return data ? mapSettings(data as Record<string, unknown>) : null;
}

export async function saveTransportSettings(
  supabase: SupabaseClient,
  scopeKey: string,
  s: TransportSettings,
): Promise<boolean> {
  const { error } = await supabase.from("transport_settings").upsert(
    {
      id: scopeKey,
      // `price_fcfa` (legacy, NOT NULL) conservé = tarif mensuel, pour
      // compatibilité avec une base où la migration 016 n'est pas encore passée.
      price_fcfa: s.priceMonthFcfa,
      price_month_fcfa: s.priceMonthFcfa,
      price_year_fcfa: s.priceYearFcfa,
      beep_interval_min: s.beepIntervalMin,
      center_lat: s.centerLat,
      center_lng: s.centerLng,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  return !error;
}

export async function fetchTransportSlots(
  supabase: SupabaseClient,
  etablissementId: string | null,
): Promise<TransportSlot[]> {
  let q = supabase.from("transport_slots").select("*");
  q = etablissementId
    ? q.eq("etablissement_id", etablissementId)
    : q.is("etablissement_id", null);
  const { data } = await q.order("start_time", { ascending: true });
  return (data ?? []).map((r) => mapSlot(r as Record<string, unknown>));
}

export async function addTransportSlot(
  supabase: SupabaseClient,
  slot: Omit<TransportSlot, "id">,
): Promise<boolean> {
  const { error } = await supabase.from("transport_slots").insert({
    etablissement_id: slot.etablissementId ?? null,
    label: slot.label ?? null,
    direction: slot.direction,
    days: slot.days,
    start_time: slot.startTime,
    end_time: slot.endTime,
    active: slot.active,
  });
  return !error;
}

export async function deleteTransportSlot(
  supabase: SupabaseClient,
  id: string,
): Promise<boolean> {
  const { error } = await supabase.from("transport_slots").delete().eq("id", id);
  return !error;
}

/* ---- Cars (un par matricule) -------------------------------------------- */
export async function fetchBuses(
  supabase: SupabaseClient,
  etablissementId: string | null,
): Promise<TransportBus[]> {
  let q = supabase.from("transport_buses").select("*");
  q = etablissementId
    ? q.eq("etablissement_id", etablissementId)
    : q.is("etablissement_id", null);
  const { data } = await q.order("matricule", { ascending: true });
  return (data ?? []).map((r) => mapBus(r as Record<string, unknown>));
}

export async function addBus(
  supabase: SupabaseClient,
  bus: { matricule: string; label?: string; etablissementId?: string | null },
): Promise<boolean> {
  const { error } = await supabase.from("transport_buses").insert({
    matricule: bus.matricule,
    label: bus.label ?? null,
    etablissement_id: bus.etablissementId ?? null,
  });
  return !error;
}

export async function deleteBus(
  supabase: SupabaseClient,
  id: string,
): Promise<boolean> {
  const { error } = await supabase.from("transport_buses").delete().eq("id", id);
  return !error;
}

/* ---- Positions (une PAR car) -------------------------------------------- */
export async function fetchBusPositions(
  supabase: SupabaseClient,
): Promise<BusPosition[]> {
  const { data } = await supabase.from("bus_positions").select("*");
  return (data ?? []).map((r) => mapPosition(r as Record<string, unknown>));
}

export async function upsertBusPosition(
  supabase: SupabaseClient,
  p: {
    busId: string;
    driverId?: string | null;
    lat: number;
    lng: number;
    heading?: number | null;
    speed?: number | null;
    direction?: string | null;
  },
): Promise<boolean> {
  const { error } = await supabase.from("bus_positions").upsert(
    {
      bus_id: p.busId,
      driver_id: p.driverId ?? null,
      lat: p.lat,
      lng: p.lng,
      heading: p.heading ?? null,
      speed: p.speed ?? null,
      direction: p.direction ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "bus_id" },
  );
  return !error;
}

/* ---- Abonnement par utilisateur (avec échéance) -------------------------- */

/** Un abonnement est-il valide à l'instant donné ? */
function isSubscriptionValid(
  row: { active?: boolean; expires_at?: string | null } | null,
): boolean {
  if (!row) return false;
  const exp = row.expires_at ?? null;
  if (exp) return new Date(exp).getTime() > Date.now();
  // Abonnement legacy (avant 016) : sans échéance, on s'appuie sur `active`.
  return Boolean(row.active);
}

/** État détaillé de l'abonnement (échéance + formule). */
export async function fetchTransportSubscription(
  supabase: SupabaseClient,
  userId: string,
): Promise<TransportSubscription> {
  const { data } = await supabase
    .from("transport_subscriptions")
    .select("active, period, expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  const row = data as
    | { active?: boolean; period?: string | null; expires_at?: string | null }
    | null;
  return {
    subscribed: isSubscriptionValid(row),
    period: (row?.period as SubscriptionPeriod | null) ?? null,
    expiresAt: row?.expires_at ?? null,
  };
}

/** Abonné valide ? (booléen — pour la carte du tableau de bord.) */
export async function isTransportSubscribed(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  return (await fetchTransportSubscription(supabase, userId)).subscribed;
}

/* ---- Paiement de l'abonnement (Mobile Money, validation manuelle) -------- */
function mapPayment(r: Record<string, unknown>): TransportPayment {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    payerEmail: (r.payer_email as string | null) ?? null,
    amountFcfa: Number(r.amount_fcfa ?? 0),
    method: (r.method as string) ?? "mobile_money",
    reference: (r.reference as string | null) ?? null,
    status: ((r.status as PaymentStatus) ?? "pending") as PaymentStatus,
    period: ((r.period as SubscriptionPeriod) ?? "month") as SubscriptionPeriod,
    createdAt: (r.created_at as string) ?? "",
  };
}

/** Soumet un paiement (formule + montant), en attente de validation admin. */
export async function submitTransportPayment(
  supabase: SupabaseClient,
  p: {
    userId: string;
    payerEmail?: string | null;
    amountFcfa: number;
    period: SubscriptionPeriod;
    method?: string;
    reference?: string | null;
  },
): Promise<boolean> {
  const { error } = await supabase.from("transport_payments").insert({
    user_id: p.userId,
    payer_email: p.payerEmail ?? null,
    amount_fcfa: p.amountFcfa,
    period: p.period,
    method: p.method ?? "mobile_money",
    reference: p.reference ?? null,
    status: "pending",
  });
  return !error;
}

/** Dernier paiement de l'utilisateur (pour afficher l'état). */
export async function fetchMyLatestTransportPayment(
  supabase: SupabaseClient,
  userId: string,
): Promise<TransportPayment | null> {
  const { data } = await supabase
    .from("transport_payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapPayment(data as Record<string, unknown>) : null;
}

/** Paiements en attente (admin). */
export async function fetchPendingTransportPayments(
  supabase: SupabaseClient,
): Promise<TransportPayment[]> {
  const { data } = await supabase
    .from("transport_payments")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return (data ?? []).map((r) => mapPayment(r as Record<string, unknown>));
}

/**
 * Confirme un paiement ET prolonge l'abonnement du payeur jusqu'à l'échéance
 * (1 mois / 1 an selon la formule), via la RPC `confirm_transport_payment`
 * (SECURITY DEFINER : autorisation admin / super-admin vérifiée en base).
 */
export async function confirmTransportPayment(
  supabase: SupabaseClient,
  p: { paymentId: string },
): Promise<boolean> {
  const { error } = await supabase.rpc("confirm_transport_payment", {
    p_payment_id: p.paymentId,
  });
  return !error;
}

/** Rejette un paiement (admin). */
export async function rejectTransportPayment(
  supabase: SupabaseClient,
  paymentId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("transport_payments")
    .update({ status: "rejected" })
    .eq("id", paymentId);
  return !error;
}

/* ---- Conducteurs désignés ------------------------------------------------ */
export async function isTransportDriver(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("transport_drivers")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

export async function fetchTransportDrivers(
  supabase: SupabaseClient,
): Promise<TransportDriver[]> {
  const { data } = await supabase
    .from("transport_drivers")
    .select("*")
    .order("created_at", { ascending: true });
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      userId: row.user_id as string,
      email: (row.email as string | null) ?? null,
    };
  });
}

/** Désigne un conducteur par e-mail (résolu via la table profiles). */
export async function addTransportDriverByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const target = email.trim();
  if (!target) return { ok: false, error: "E-mail requis." };
  const { data: prof } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", target)
    .maybeSingle();
  const id = (prof as { id?: string } | null)?.id;
  if (!id) return { ok: false, error: "Aucun compte avec cet e-mail." };
  const { error } = await supabase
    .from("transport_drivers")
    .upsert(
      { user_id: id, email: (prof as { email?: string }).email ?? target },
      { onConflict: "user_id" },
    );
  return { ok: !error, error: error?.message };
}

export async function removeTransportDriver(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("transport_drivers")
    .delete()
    .eq("user_id", userId);
  return !error;
}
