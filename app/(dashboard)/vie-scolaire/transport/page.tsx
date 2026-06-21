"use client";

import * as React from "react";
import { Bus, MapPin, Radio, BellRing, BellOff, Save, Plus, Trash2, Lock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ModulePage } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/components/app-shell/app-context";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/formations/pricing";
import { BusMap, type BusMarker } from "@/components/transport/bus-map";
import { unlockAudio, playTripleBeep } from "@/components/transport/transport-beep";
import {
  activeSlot,
  slotSummary,
  trimTime,
  WEEKDAYS,
  DIRECTION_LABEL,
  type BusPosition,
  type SlotDirection,
  type TransportBus,
  type TransportSettings,
  type TransportSlot,
} from "@/lib/transport/transport";
import {
  addBus,
  addTransportSlot,
  deleteBus,
  deleteTransportSlot,
  fetchBuses,
  fetchBusPositions,
  fetchTransportSettings,
  fetchTransportSlots,
  isTransportSubscribed,
  saveTransportSettings,
  setTransportSubscription,
  upsertBusPosition,
} from "@/lib/transport/transport-server";

const REAL = isSupabaseConfigured();

export default function TransportPage() {
  const app = useApp();
  const isAdmin = app.effectiveRole === "admin";
  const userId = app.user.id;

  const [loading, setLoading] = React.useState(REAL);
  const [settings, setSettings] = React.useState<TransportSettings | null>(null);
  const [slots, setSlots] = React.useState<TransportSlot[]>([]);
  const [buses, setBuses] = React.useState<TransportBus[]>([]);
  const [subscribed, setSubscribed] = React.useState(false);
  const [positions, setPositions] = React.useState<BusPosition[]>([]);

  const reload = React.useCallback(async () => {
    if (!REAL) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sb = createClient();
      const [s, sl, bs, sub] = await Promise.all([
        fetchTransportSettings(sb),
        fetchTransportSlots(sb),
        fetchBuses(sb),
        userId ? isTransportSubscribed(sb, userId) : Promise.resolve(false),
      ]);
      setSettings(s);
      setSlots(sl);
      setBuses(bs);
      setSubscribed(sub);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const canView = isAdmin || subscribed;

  // Positions : rafraîchies toutes les 5 s tant qu'on peut voir la carte.
  React.useEffect(() => {
    if (!REAL || !canView) return;
    let stop = false;
    const sb = createClient();
    const tick = async () => {
      const p = await fetchBusPositions(sb);
      if (!stop) setPositions(p);
    };
    void tick();
    const id = window.setInterval(tick, 5000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [canView]);

  return (
    <ModulePage
      title="Transport d'élèves"
      description="Géolocalisation en temps réel des cars de transport (aller / retour)."
      icon={Bus}
      permission="dashboard:view"
      actions={
        REAL ? (
          <Button variant="outline" onClick={() => void reload()} disabled={loading}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Actualiser
          </Button>
        ) : undefined
      }
    >
      {!REAL ? (
        <Notice>
          Ce module nécessite le mode en ligne (Supabase), disponible sur
          https://planning.eduweb.ci.
        </Notice>
      ) : loading ? (
        <p className="px-1 py-8 text-center text-sm text-muted-foreground">Chargement…</p>
      ) : !canView ? (
        <SubscribeGate
          priceFcfa={settings?.priceFcfa ?? 0}
          onSubscribe={async () => {
            if (!userId) return;
            const ok = await setTransportSubscription(createClient(), userId, true);
            if (ok) {
              setSubscribed(true);
              toast.success("Abonnement activé", {
                description: "Vous pouvez maintenant suivre les cars en temps réel.",
              });
            } else {
              toast.error("Abonnement impossible", {
                description: "Appliquez les migrations 010 + 011, puis réessayez.",
              });
            }
          }}
        />
      ) : (
        <TransportLive
          settings={settings}
          slots={slots}
          buses={buses}
          positions={positions}
          isAdmin={isAdmin}
          userId={userId}
          onReload={reload}
          onSettings={setSettings}
          onSlots={setSlots}
          onBuses={setBuses}
        />
      )}
    </ModulePage>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ew-gold-200 bg-ew-gold-50/60 p-4 text-sm text-ew-gold-900">
      {children}
    </div>
  );
}

function SubscribeGate({
  priceFcfa,
  onSubscribe,
}: {
  priceFcfa: number;
  onSubscribe: () => void;
}) {
  const [busy, setBusy] = React.useState(false);
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ew-green-100 text-ew-green-700">
        <Lock className="h-7 w-7" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-foreground">
        Module non activé
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Abonnez-vous au suivi de transport pour localiser les cars en temps réel,
        à l&apos;aller comme au retour.
      </p>
      <p className="mt-3 text-base font-bold text-ew-green-800">
        {formatPrice(priceFcfa)}
      </p>
      <Button
        className="mt-4"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onSubscribe();
          setBusy(false);
        }}
      >
        {busy ? "Activation…" : "S'abonner"}
      </Button>
    </div>
  );
}

function TransportLive({
  settings,
  slots,
  buses,
  positions,
  isAdmin,
  userId,
  onReload,
  onSettings,
  onSlots,
  onBuses,
}: {
  settings: TransportSettings | null;
  slots: TransportSlot[];
  buses: TransportBus[];
  positions: BusPosition[];
  isAdmin: boolean;
  userId: string;
  onReload: () => Promise<void>;
  onSettings: (s: TransportSettings) => void;
  onSlots: (s: TransportSlot[]) => void;
  onBuses: (b: TransportBus[]) => void;
}) {
  const beepInterval = Math.max(1, settings?.beepIntervalMin ?? 5);
  const [alertsOn, setAlertsOn] = React.useState(true);
  const [driverMode, setDriverMode] = React.useState(false);
  const [driverBusId, setDriverBusId] = React.useState("");
  const [now, setNow] = React.useState(() => new Date(0));

  React.useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, []);

  const current = now.getTime() ? activeSlot(slots, now) : null;
  const emitting = Boolean(current);

  // Marqueurs : une position par car, étiquetée avec son matricule.
  const markers: BusMarker[] = positions.map((p) => {
    const bus = buses.find((b) => b.id === p.busId);
    return {
      id: p.busId,
      lat: p.lat,
      lng: p.lng,
      label: bus?.matricule ?? "Car",
    };
  });

  // BIP : au démarrage d'un créneau (bip-bip-bip) puis répété selon la périodicité.
  const beepTimer = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (beepTimer.current) {
      window.clearInterval(beepTimer.current);
      beepTimer.current = null;
    }
    if (!alertsOn || !emitting) return;
    playTripleBeep();
    beepTimer.current = window.setInterval(() => playTripleBeep(), beepInterval * 60000);
    return () => {
      if (beepTimer.current) {
        window.clearInterval(beepTimer.current);
        beepTimer.current = null;
      }
    };
  }, [alertsOn, emitting, beepInterval]);

  // MODE CONDUCTEUR : émet la position GPS du car choisi pendant les créneaux.
  React.useEffect(() => {
    if (!driverMode || !driverBusId) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const sb = createClient();
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const slot = activeSlot(slots, new Date());
        if (!slot) return;
        void upsertBusPosition(sb, {
          busId: driverBusId,
          driverId: userId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading ?? null,
          speed: pos.coords.speed ?? null,
          direction: slot.direction,
        });
      },
      () => {
        toast.error("Position GPS indisponible", {
          description: "Autorisez la localisation pour émettre.",
        });
        setDriverMode(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverMode, driverBusId, slots, userId]);

  return (
    <div className="space-y-4">
      {/* Statut + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={
              emitting
                ? "inline-flex items-center gap-1 rounded-full border border-ew-green-300 bg-ew-green-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ew-green-800"
                : "inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
            }
          >
            <Radio className="h-3 w-3" /> {emitting ? "Émission en cours" : "Hors créneau"}
          </span>
          {current ? <span className="text-muted-foreground">{slotSummary(current)}</span> : null}
          <span className="text-xs text-muted-foreground">
            · {positions.length} car{positions.length > 1 ? "s" : ""} en ligne
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              unlockAudio();
              setAlertsOn((v) => !v);
            }}
            title="Bip-bip-bip à l'heure d'émission, répété selon la périodicité."
          >
            {alertsOn ? <BellRing className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {alertsOn ? "Alertes activées" : "Alertes coupées"}
          </Button>
          <Button
            size="sm"
            variant={driverMode ? "default" : "outline"}
            onClick={() => {
              unlockAudio();
              setDriverMode((v) => !v);
            }}
            title="Partage de la position GPS de votre car (réservé au conducteur)."
          >
            <MapPin className="h-4 w-4" /> {driverMode ? "Conducteur : actif" : "Mode conducteur"}
          </Button>
        </div>
      </div>

      {driverMode ? (
        <div className="space-y-2 rounded-xl border border-ew-green-200 bg-ew-green-50/40 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Label className="shrink-0">Votre car :</Label>
            <select
              value={driverBusId}
              onChange={(e) => setDriverBusId(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">— Choisir le car —</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.matricule}
                  {b.label ? ` (${b.label})` : ""}
                </option>
              ))}
            </select>
          </div>
          {driverBusId ? (
            <p className="text-foreground/90">
              Position émise automatiquement <strong>pendant les créneaux</strong> (
              {emitting ? "créneau en cours" : "aucun créneau actuellement"}). Gardez
              cette page ouverte, écran allumé.
            </p>
          ) : (
            <p className="text-ew-gold-700">
              Sélectionnez le car que vous conduisez pour démarrer l&apos;émission.
            </p>
          )}
        </div>
      ) : null}

      {/* Carte */}
      {markers.length > 0 ? (
        <BusMap
          markers={markers}
          center={
            settings?.centerLat != null && settings?.centerLng != null
              ? { lat: settings.centerLat, lng: settings.centerLng }
              : null
          }
        />
      ) : (
        <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-center text-sm text-muted-foreground">
          Aucun car en ligne pour le moment. Un car apparaît dès que son conducteur
          émet (pendant un créneau).
        </div>
      )}

      {isAdmin ? (
        <AdminConfig
          settings={settings}
          slots={slots}
          buses={buses}
          onSettings={onSettings}
          onSlots={onSlots}
          onBuses={onBuses}
          onReload={onReload}
        />
      ) : null}
    </div>
  );
}

/* ----------------------------- Config admin ------------------------------- */
function AdminConfig({
  settings,
  slots,
  buses,
  onSettings,
  onSlots,
  onBuses,
  onReload,
}: {
  settings: TransportSettings | null;
  slots: TransportSlot[];
  buses: TransportBus[];
  onSettings: (s: TransportSettings) => void;
  onSlots: (s: TransportSlot[]) => void;
  onBuses: (b: TransportBus[]) => void;
  onReload: () => Promise<void>;
}) {
  const [price, setPrice] = React.useState(String(settings?.priceFcfa ?? 0));
  const [interval, setIntervalMin] = React.useState(String(settings?.beepIntervalMin ?? 5));
  const [centerLat, setCenterLat] = React.useState(settings?.centerLat?.toString() ?? "");
  const [centerLng, setCenterLng] = React.useState(settings?.centerLng?.toString() ?? "");
  const priceNum = Number(price) || 0;

  async function save() {
    const next: TransportSettings = {
      priceFcfa: priceNum,
      beepIntervalMin: Math.max(1, Number(interval) || 5),
      centerLat: centerLat ? Number(centerLat) : null,
      centerLng: centerLng ? Number(centerLng) : null,
    };
    const ok = await saveTransportSettings(createClient(), next);
    if (ok) {
      onSettings(next);
      toast.success("Réglages enregistrés");
    } else {
      toast.error("Enregistrement refusé");
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-ew-green-200 bg-ew-green-50/30 p-5">
      <p className="font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
        Configuration (administrateur)
      </p>

      {/* Cars */}
      <BusesPanel buses={buses} onBuses={onBuses} onReload={onReload} />

      {/* Réglages */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label>Tarif (FCFA)</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
          <p className="text-[11px] text-muted-foreground">{formatPrice(priceNum)}</p>
        </div>
        <div className="space-y-1">
          <Label>Bip toutes les (min)</Label>
          <Input value={interval} onChange={(e) => setIntervalMin(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
        </div>
        <div className="space-y-1">
          <Label>Centre carte — latitude</Label>
          <Input value={centerLat} onChange={(e) => setCenterLat(e.target.value)} placeholder="5.3599" />
        </div>
        <div className="space-y-1">
          <Label>Centre carte — longitude</Label>
          <Input value={centerLng} onChange={(e) => setCenterLng(e.target.value)} placeholder="-4.0083" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={save}>
          <Save className="h-4 w-4" /> Enregistrer les réglages
        </Button>
      </div>

      {/* Créneaux */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Créneaux d&apos;émission ({slots.length})
        </p>
        {slots.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-background/60 p-3 text-center text-sm text-muted-foreground">
            Aucun créneau. Ajoutez-en un (aller / retour) ci-dessous.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {slots.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <span>
                  {s.label ? <strong>{s.label} · </strong> : null}
                  {slotSummary(s)} {s.active ? "" : "(inactif)"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={async () => {
                    const ok = await deleteTransportSlot(createClient(), s.id);
                    if (ok) onSlots(slots.filter((x) => x.id !== s.id));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <SlotForm
          onAdd={async (slot) => {
            const ok = await addTransportSlot(createClient(), slot);
            if (ok) {
              await onReload();
              toast.success("Créneau ajouté");
            } else {
              toast.error("Ajout refusé");
            }
          }}
        />
      </div>
    </div>
  );
}

function BusesPanel({
  buses,
  onBuses,
  onReload,
}: {
  buses: TransportBus[];
  onBuses: (b: TransportBus[]) => void;
  onReload: () => Promise<void>;
}) {
  const [matricule, setMatricule] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Cars / terminaux ({buses.length})
      </p>
      {buses.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-background/60 p-3 text-center text-sm text-muted-foreground">
          Aucun car enregistré. Ajoutez chaque car par son matricule.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {buses.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <span>
                <strong>{b.matricule}</strong>
                {b.label ? <span className="text-muted-foreground"> · {b.label}</span> : null}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={async () => {
                  const ok = await deleteBus(createClient(), b.id);
                  if (ok) onBuses(buses.filter((x) => x.id !== b.id));
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-ew-green-300 bg-background/60 p-3">
        <div className="space-y-1">
          <Label>Matricule du car</Label>
          <Input value={matricule} onChange={(e) => setMatricule(e.target.value)} placeholder="1234 AB 01" className="w-44" />
        </div>
        <div className="space-y-1">
          <Label>Libellé (facultatif)</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Bus n°1 — Cocody" className="w-56" />
        </div>
        <Button
          size="sm"
          disabled={busy || !matricule.trim()}
          onClick={async () => {
            setBusy(true);
            const ok = await addBus(createClient(), {
              matricule: matricule.trim(),
              label: label.trim() || undefined,
            });
            setBusy(false);
            if (ok) {
              setMatricule("");
              setLabel("");
              await onReload();
              toast.success("Car ajouté");
            } else {
              toast.error("Ajout refusé");
            }
          }}
        >
          <Plus className="h-4 w-4" /> Ajouter le car
        </Button>
      </div>
    </div>
  );
}

function SlotForm({
  onAdd,
}: {
  onAdd: (slot: Omit<TransportSlot, "id">) => Promise<void>;
}) {
  const [direction, setDirection] = React.useState<SlotDirection>("aller");
  const [days, setDays] = React.useState<number[]>([1, 2, 3, 4, 5]);
  const [start, setStart] = React.useState("06:30");
  const [end, setEnd] = React.useState("07:30");
  const [label, setLabel] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const toggleDay = (d: number) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-ew-green-300 bg-background/60 p-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label>Sens</Label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as SlotDirection)}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="aller">{DIRECTION_LABEL.aller}</option>
            <option value="retour">{DIRECTION_LABEL.retour}</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Début</Label>
          <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Fin</Label>
          <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Libellé (facultatif)</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Matin" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {WEEKDAYS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => toggleDay(d.value)}
            className={
              days.includes(d.value)
                ? "rounded-md border border-ew-green-600 bg-ew-green-100 px-2 py-1 text-xs font-bold text-ew-green-800"
                : "rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
            }
          >
            {d.short}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={busy || days.length === 0}
          onClick={async () => {
            setBusy(true);
            await onAdd({
              direction,
              days: days.slice().sort((a, b) => a - b),
              startTime: trimTime(start),
              endTime: trimTime(end),
              active: true,
              label: label.trim() || undefined,
            });
            setBusy(false);
            setLabel("");
          }}
        >
          <Plus className="h-4 w-4" /> Ajouter le créneau
        </Button>
      </div>
    </div>
  );
}
