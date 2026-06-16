"use client";

import * as React from "react";
import { CalendarClock, Plus, MapPin, Video, Check, Clock, MessageSquare, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCombobox } from "@/components/forms/user-combobox";
import { PhoneInput } from "@/components/forms/phone-input";
import { useStore } from "@/components/app-shell/data-store";
import { useApp } from "@/components/app-shell/app-context";
import { ROLE_LIST, ROLE_FAMILY_LABELS, getRoleLabel, type RoleFamily, type UserRole } from "@/lib/roles";
import { loadEtabConfig } from "@/lib/etab-config";

const ROLE_GROUPS = (Object.keys(ROLE_FAMILY_LABELS) as RoleFamily[]).map((family) => ({
  family,
  label: ROLE_FAMILY_LABELS[family],
  roles: ROLE_LIST.filter((r) => r.family === family),
}));

/** Rôles « usagers » qui peuvent demander un RDV mais pas convoquer. */
const NO_CONVOKE: UserRole[] = ["parent", "eleve", "enseignant"];

type RdvMode = "request" | "convocation";

export default function RendezVousPage() {
  const { appointments, addAppointment, users } = useStore();
  const { effectiveRole } = useApp();
  const canConvoke = !NO_CONVOKE.includes(effectiveRole);
  const [mode, setMode] = React.useState<RdvMode>("request");
  const [motif, setMotif] = React.useState("");
  const [roleId, setRoleId] = React.useState<UserRole>("chef_etablissement");
  const [personId, setPersonId] = React.useState("");
  const [sms, setSms] = React.useState(false);
  const [smsPhone, setSmsPhone] = React.useState("");
  const [phoneCountry, setPhoneCountry] = React.useState("CI");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [message, setMessage] = React.useState("");

  // Utilisateurs de l'annuaire portant le rôle sélectionné (pour le destinataire précis).
  const roleUsers = React.useMemo(() => users.filter((u) => u.role === roleId), [users, roleId]);
  const person = roleUsers.find((u) => u.id === personId);
  const personItems = React.useMemo(
    () => roleUsers.map((u) => ({ value: u.id, label: u.name, sublabel: `${u.email} · ${u.etablissement}` })),
    [roleUsers],
  );

  // Indicatif piloté par le pays de l'établissement ; numéro SMS pré-rempli depuis le destinataire choisi.
  React.useEffect(() => setPhoneCountry(loadEtabConfig().countryCode ?? "CI"), []);
  React.useEffect(() => {
    const p = roleUsers.find((u) => u.id === personId);
    setSmsPhone(p?.phone ?? "");
  }, [personId, roleUsers]);

  const isConvocation = mode === "convocation";

  const book = () => {
    if (!motif.trim() || !date) {
      toast.error(isConvocation ? "Le motif et la date de convocation sont requis" : "Le motif et la date sont requis");
      return;
    }
    if (sms && !smsPhone.trim()) {
      toast.error("Renseignez le numéro pour la notification SMS");
      return;
    }
    const recipient = person ? person.name : getRoleLabel(roleId);
    addAppointment({
      title: motif.trim(),
      // En convocation, l'émetteur est l'autorité (le chef) ; en demande, l'utilisateur courant.
      requester: isConvocation ? getRoleLabel(effectiveRole) : "Vous",
      participant: person ? `${person.name} · ${getRoleLabel(roleId)}` : getRoleLabel(roleId),
      startsAt: new Date(`${date}T${time || "09:00"}:00`).toISOString(),
      status: isConvocation ? "convocation" : "pending",
      location: "À définir",
    });
    toast.success(isConvocation ? "Convocation émise" : "Demande de rendez-vous envoyée", {
      description: sms
        ? `Un SMS de notification sera envoyé au ${smsPhone} (${recipient}).`
        : isConvocation
          ? `${recipient} est convoqué(e) ; pensez à le/la notifier.`
          : "Le rendez-vous a été ajouté à la liste.",
    });
    setMotif("");
    setDate("");
    setTime("");
    setMessage("");
    setPersonId("");
    setSms(false);
    setSmsPhone("");
  };

  return (
    <ModulePage
      title="Rendez-vous"
      description="Planifiez et suivez les rendez-vous : entretiens parents, suivis pédagogiques, réunions."
      icon={CalendarClock}
      permission="appointments:view"
      sections={[
        { id: "prochains", label: "Prochains rendez-vous" },
        { id: "prendre", label: "Prendre rendez-vous" },
      ]}
      kpis={[
        { label: "À venir", value: appointments.length, icon: CalendarClock, tone: "green" },
        { label: "Confirmés", value: appointments.filter((a) => a.status === "confirmed").length, icon: Check, tone: "blue" },
        { label: "En attente", value: appointments.filter((a) => a.status === "pending").length, icon: Clock, tone: "gold" },
        { label: "En visio", value: appointments.filter((a) => a.location.toLowerCase().includes("visio")).length, icon: Video, tone: "purple" },
      ]}
    >
      <TwoColumn className="lg:grid-cols-[2fr_1fr]">
        <SectionCard id="prochains" title="Prochains rendez-vous">
          <ul className="space-y-3">
            {appointments.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-ew-green-100 text-ew-green-800">
                  <span className="text-sm font-extrabold">
                    {new Date(a.startsAt).toLocaleDateString("fr-FR", { day: "2-digit" })}
                  </span>
                  <span className="text-[10px] uppercase">
                    {new Date(a.startsAt).toLocaleDateString("fr-FR", { month: "short" })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-foreground">{a.title}</p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.requester} → {a.participant}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    {a.location.toLowerCase().includes("visio") ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                    {a.location} ·{" "}
                    {new Date(a.startsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard id="prendre" title={isConvocation ? "Convoquer" : "Prendre rendez-vous"}>
          <div className="space-y-3">
            {canConvoke && (
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
                {(
                  [
                    ["request", "Demander un RDV"],
                    ["convocation", "Convoquer"],
                  ] as [RdvMode, string][]
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setMode(v);
                      if (v === "convocation") setSms(true);
                    }}
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                      mode === v ? "bg-background text-ew-green-700 shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {isConvocation && (
              <p className="rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs text-blue-800">
                <Megaphone className="mr-1 inline h-3.5 w-3.5" />
                La convocation est émise par la direction : la personne convoquée est informée de la date et du motif.
              </p>
            )}

            <div className="space-y-1.5">
              <Label>Motif{isConvocation ? " de la convocation" : ""}</Label>
              <Input value={motif} onChange={(e) => setMotif(e.target.value)} placeholder={isConvocation ? "Ex. Convocation pour entretien" : "Ex. Entretien de suivi"} />
            </div>

            <div className="space-y-1.5">
              <Label>{isConvocation ? "Rôle de la personne convoquée" : "Rôle du destinataire"}</Label>
              <Select
                value={roleId}
                onValueChange={(v) => {
                  setRoleId(v as UserRole);
                  setPersonId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_GROUPS.map((g) => (
                    <SelectGroup key={g.family}>
                      <SelectLabel>{g.label}</SelectLabel>
                      {g.roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>
                {isConvocation ? "Personne convoquée" : "Destinataire"}{" "}
                {roleUsers.length > 0 && <span className="font-normal text-muted-foreground">(optionnel — personne précise)</span>}
              </Label>
              {roleUsers.length > 0 ? (
                <>
                  <UserCombobox
                    items={personItems}
                    value={personId}
                    onChange={setPersonId}
                    placeholder={`Tout « ${getRoleLabel(roleId)} » — ou choisir une personne`}
                    searchPlaceholder="Nom, e-mail, établissement…"
                    emptyText="Aucun utilisateur trouvé"
                  />
                  {person && (
                    <button type="button" onClick={() => setPersonId("")} className="text-xs font-medium text-muted-foreground hover:underline">
                      Effacer la sélection
                    </button>
                  )}
                </>
              ) : (
                <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                  Aucun utilisateur avec ce rôle dans l&apos;annuaire — {isConvocation ? "la convocation" : "la demande"} sera adressée au rôle « {getRoleLabel(roleId)} ».
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Heure</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Précisez l'objet du rendez-vous…" />
            </div>

            <div className="space-y-2 rounded-md border border-border px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-700" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Notifier {isConvocation ? "la personne convoquée" : "le destinataire"} par SMS
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {person
                        ? `Un SMS sera envoyé à ${person.name}.`
                        : isConvocation
                          ? "La personne convoquée recevra un SMS."
                          : "Le destinataire recevra un SMS de notification."}
                    </p>
                  </div>
                </div>
                <Switch checked={sms} onCheckedChange={setSms} aria-label="Notifier par SMS" />
              </div>
              {sms && (
                <div className="space-y-1.5 border-t border-border pt-2">
                  <Label className="text-xs">{person ? `Numéro de ${person.name}` : "Numéro à notifier"}</Label>
                  <PhoneInput variant="field" countryCode={phoneCountry} value={smsPhone} onChange={setSmsPhone} placeholder="Numéro du destinataire" />
                  {!person && <p className="text-[11px] text-muted-foreground">Aucune personne précise sélectionnée — saisissez le numéro à notifier.</p>}
                </div>
              )}
            </div>

            <Button className="w-full" onClick={book}>
              {isConvocation ? (
                <>
                  <Megaphone className="h-4 w-4" /> Convoquer
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Demander un rendez-vous
                </>
              )}
            </Button>
          </div>
        </SectionCard>
      </TwoColumn>
    </ModulePage>
  );
}
