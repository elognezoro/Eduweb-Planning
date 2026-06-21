/* ============================================================================
   Module « Transport d'élèves » — types & logique de créneaux.

   Géolocalisation temps réel du car (Leaflet/OpenStreetMap). Le conducteur émet
   sa position pendant les créneaux paramétrés ; les abonnés la voient sur la
   carte. Tarification FCFA + équivalent EUR (réutilise lib/formations/pricing).
   ========================================================================== */

export type SlotDirection = "aller" | "retour";

export interface TransportSettings {
  priceFcfa: number;
  /** Périodicité du bip de rappel, en minutes (défaut 5). */
  beepIntervalMin: number;
  centerLat: number | null;
  centerLng: number | null;
}

export interface TransportSlot {
  id: string;
  label?: string;
  direction: SlotDirection;
  /** Jours d'émission : 1 = lundi … 7 = dimanche. */
  days: number[];
  /** "HH:MM" (heure locale). */
  startTime: string;
  endTime: string;
  active: boolean;
}

/** Un car de transport (un terminal émetteur) identifié par son matricule. */
export interface TransportBus {
  id: string;
  matricule: string;
  label?: string;
  active: boolean;
}

export interface BusPosition {
  busId: string;
  driverId?: string | null;
  lat: number;
  lng: number;
  heading?: number | null;
  speed?: number | null;
  direction?: string | null;
  updatedAt: string;
}

export const WEEKDAYS: { value: number; label: string; short: string }[] = [
  { value: 1, label: "Lundi", short: "Lun" },
  { value: 2, label: "Mardi", short: "Mar" },
  { value: 3, label: "Mercredi", short: "Mer" },
  { value: 4, label: "Jeudi", short: "Jeu" },
  { value: 5, label: "Vendredi", short: "Ven" },
  { value: 6, label: "Samedi", short: "Sam" },
  { value: 7, label: "Dimanche", short: "Dim" },
];

export const DIRECTION_LABEL: Record<SlotDirection, string> = {
  aller: "Aller (vers l'établissement)",
  retour: "Retour (depuis l'établissement)",
};

/** Jour ISO (1 = lundi … 7 = dimanche) d'une date locale. */
export function isoWeekday(d: Date): number {
  return ((d.getDay() + 6) % 7) + 1;
}

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((x) => Number(x) || 0);
  return h * 60 + m;
}

/** Heure « HH:MM » → minutes depuis minuit (heure locale courante). */
export function nowMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

/** Un créneau est-il actif maintenant (jour + fenêtre horaire) ? */
export function isWithinSlot(slot: TransportSlot, now: Date): boolean {
  if (!slot.active) return false;
  if (!slot.days.includes(isoWeekday(now))) return false;
  const cur = nowMinutes(now);
  return cur >= hhmmToMinutes(slot.startTime) && cur <= hhmmToMinutes(slot.endTime);
}

/** Premier créneau actif à l'instant donné, ou null. */
export function activeSlot(slots: TransportSlot[], now: Date): TransportSlot | null {
  return slots.find((s) => isWithinSlot(s, now)) ?? null;
}

/** Normalise une heure Postgres ("HH:MM:SS") en "HH:MM". */
export function trimTime(t: string): string {
  return (t ?? "").slice(0, 5);
}

/** Libellé court d'un créneau (ex. « Aller · Lun-Ven · 06:30–07:30 »). */
export function slotSummary(slot: TransportSlot): string {
  const dir = slot.direction === "aller" ? "Aller" : "Retour";
  const days = slot.days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => WEEKDAYS.find((w) => w.value === d)?.short ?? d)
    .join(", ");
  return `${dir} · ${days} · ${trimTime(slot.startTime)}–${trimTime(slot.endTime)}`;
}
