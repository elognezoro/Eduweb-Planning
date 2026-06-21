import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BusPosition,
  PaymentStatus,
  SlotDirection,
  TransportBus,
  TransportPayment,
  TransportSettings,
  TransportSlot,
} from "./transport";
import { trimTime } from "./transport";

/* ============================================================================
   Accès Supabase au module Transport (migration 010, périmètre global v1).
   ========================================================================== */

const SCOPE = "global";

/* ---- Mappers ------------------------------------------------------------- */
function mapSettings(r: Record<string, unknown>): TransportSettings {
  return {
    priceFcfa: Number(r.price_fcfa ?? 0),
    beepIntervalMin: Number(r.beep_interval_min ?? 5),
    centerLat: (r.center_lat as number | null) ?? null,
    centerLng: (r.center_lng as number | null) ?? null,
  };
}

function mapSlot(r: Record<string, unknown>): TransportSlot {
  return {
    id: r.id as string,
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
    matricule: (r.matricule as string) ?? "",
    label: (r.label as string) ?? undefined,
    active: Boolean(r.active),
  };
}

/* ---- Réglages & créneaux ------------------------------------------------- */
export async function fetchTransportSettings(
  supabase: SupabaseClient,
): Promise<TransportSettings | null> {
  const { data } = await supabase
    .from("transport_settings")
    .select("*")
    .eq("id", SCOPE)
    .maybeSingle();
  return data ? mapSettings(data as Record<string, unknown>) : null;
}

export async function saveTransportSettings(
  supabase: SupabaseClient,
  s: TransportSettings,
): Promise<boolean> {
  const { error } = await supabase.from("transport_settings").upsert(
    {
      id: SCOPE,
      price_fcfa: s.priceFcfa,
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
): Promise<TransportSlot[]> {
  const { data } = await supabase
    .from("transport_slots")
    .select("*")
    .order("start_time", { ascending: true });
  return (data ?? []).map((r) => mapSlot(r as Record<string, unknown>));
}

export async function addTransportSlot(
  supabase: SupabaseClient,
  slot: Omit<TransportSlot, "id">,
): Promise<boolean> {
  const { error } = await supabase.from("transport_slots").insert({
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
): Promise<TransportBus[]> {
  const { data } = await supabase
    .from("transport_buses")
    .select("*")
    .order("matricule", { ascending: true });
  return (data ?? []).map((r) => mapBus(r as Record<string, unknown>));
}

export async function addBus(
  supabase: SupabaseClient,
  bus: { matricule: string; label?: string },
): Promise<boolean> {
  const { error } = await supabase
    .from("transport_buses")
    .insert({ matricule: bus.matricule, label: bus.label ?? null });
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

/* ---- Abonnement par utilisateur ------------------------------------------ */
export async function isTransportSubscribed(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("transport_subscriptions")
    .select("active")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean((data as { active?: boolean } | null)?.active);
}

export async function setTransportSubscription(
  supabase: SupabaseClient,
  userId: string,
  active: boolean,
): Promise<boolean> {
  const { error } = await supabase.from("transport_subscriptions").upsert(
    { user_id: userId, active },
    { onConflict: "user_id" },
  );
  return !error;
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
    createdAt: (r.created_at as string) ?? "",
  };
}

/** Soumet un paiement (en attente de validation admin). */
export async function submitTransportPayment(
  supabase: SupabaseClient,
  p: {
    userId: string;
    payerEmail?: string | null;
    amountFcfa: number;
    method?: string;
    reference?: string | null;
  },
): Promise<boolean> {
  const { error } = await supabase.from("transport_payments").insert({
    user_id: p.userId,
    payer_email: p.payerEmail ?? null,
    amount_fcfa: p.amountFcfa,
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

/** Confirme un paiement ET active l'abonnement du payeur (admin). */
export async function confirmTransportPayment(
  supabase: SupabaseClient,
  p: { paymentId: string; userId: string; adminId: string },
): Promise<boolean> {
  const { error } = await supabase
    .from("transport_payments")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      confirmed_by: p.adminId,
    })
    .eq("id", p.paymentId);
  if (error) return false;
  return setTransportSubscription(supabase, p.userId, true);
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
