"use client";

import * as React from "react";
import {
  Network,
  Plus,
  Trash2,
  RefreshCw,
  UserCheck,
  UserX,
  CalendarDays,
  Database,
  Pencil,
  MapPin,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { ForbiddenState } from "@/components/layout/states";
import { useApp } from "@/components/app-shell/app-context";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "@/components/modules/module-page";
import { APFC_ACTIVITY_TYPES } from "@/lib/mock-data";
import {
  fetchApfcAntennas,
  fetchMyApfcAntennas,
  createApfcAntenna,
  updateApfcAntenna,
  assignApfcHeadByEmail,
  fetchApfcActivities,
  addApfcActivity,
  removeApfcActivity,
  type ApfcAntennaRow,
  type ApfcActivityRow,
} from "@/lib/apfc/apfc-server";

const REAL = isSupabaseConfigured();
const GREEN_BTN = "bg-ew-green-700 text-white hover:bg-ew-green-800";

export default function ApfcSupervisionPage() {
  const { can, effectiveRole } = useApp();
  const allowed = can("antenna_reports:view");
  const isManager = effectiveRole === "admin" || effectiveRole === "apfc_admin";
  const isChef = effectiveRole === "chef_antenne";

  const [antennas, setAntennas] = React.useState<ApfcAntennaRow[]>([]);
  const [selId, setSelId] = React.useState<string | null>(null);
  const [activities, setActivities] = React.useState<ApfcActivityRow[]>([]);
  const [loading, setLoading] = React.useState(REAL);

  // Dialogue création / édition d'antenne (gestion globale).
  const [antennaDialog, setAntennaDialog] = React.useState<ApfcAntennaRow | "new" | null>(null);
  // Affectation du chef (par antenne).
  const [headEmail, setHeadEmail] = React.useState<Record<string, string>>({});
  // Nouvelle activité.
  const [actTitle, setActTitle] = React.useState("");
  const [actType, setActType] = React.useState(APFC_ACTIVITY_TYPES[0]);
  const [actDate, setActDate] = React.useState("");

  const reload = React.useCallback(async () => {
    if (!REAL || !allowed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const sb = createClient();
    const list = isManager ? await fetchApfcAntennas(sb) : await fetchMyApfcAntennas(sb);
    setAntennas(list);
    setSelId((cur) => cur ?? list[0]?.id ?? null);
    setLoading(false);
  }, [allowed, isManager]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const loadActivities = React.useCallback(async (antennaId: string) => {
    if (!REAL) return;
    const sb = createClient();
    setActivities(await fetchApfcActivities(sb, antennaId));
  }, []);

  React.useEffect(() => {
    if (selId) void loadActivities(selId);
    else setActivities([]);
  }, [selId, loadActivities]);

  if (!allowed) return <ForbiddenState />;

  const selected = antennas.find((a) => a.id === selId) ?? null;

  /* ---------------------------- Actions ---------------------------- */
  const onAssign = async (antennaId: string, email: string | null) => {
    const sb = createClient();
    const res = await assignApfcHeadByEmail(sb, antennaId, email);
    if (res.error) {
      toast.error("Affectation impossible", { description: res.error });
      return;
    }
    toast.success(email ? "Chef d'antenne affecté" : "Chef d'antenne retiré");
    setHeadEmail((m) => ({ ...m, [antennaId]: "" }));
    await reload();
  };

  const onAddActivity = async () => {
    if (!selected) return;
    if (!actTitle.trim()) {
      toast.error("Renseignez l'intitulé de l'activité");
      return;
    }
    const sb = createClient();
    const res = await addApfcActivity(sb, {
      antennaId: selected.id,
      title: actTitle.trim(),
      type: actType,
      date: actDate || null,
    });
    if (res.error) {
      toast.error("Ajout impossible", { description: res.error });
      return;
    }
    setActTitle("");
    setActDate("");
    toast.success("Activité ajoutée");
    await loadActivities(selected.id);
  };

  const onRemoveActivity = async (id: string) => {
    const sb = createClient();
    const res = await removeApfcActivity(sb, id);
    if (res.error) {
      toast.error("Suppression impossible", { description: res.error });
      return;
    }
    toast.success("Activité supprimée");
    if (selected) await loadActivities(selected.id);
  };

  /* ---------------------------- Rendu ---------------------------- */
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ew-green-100 text-ew-green-700 shadow-sm">
            <Network className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Supervision APFC (connecté)
            </h1>
            <p className="text-sm text-muted-foreground">
              {isChef
                ? "Votre antenne et ses activités de formation continue."
                : "Registre des antennes, affectation des chefs et suivi des activités — isolé par antenne (RLS)."}
            </p>
          </div>
        </div>
        {REAL && (
          <Button variant="outline" onClick={() => void reload()}>
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
        )}
      </div>

      {!REAL ? (
        <div className="rounded-2xl border border-ew-gold-300 bg-ew-gold-50/50 p-6 text-sm">
          <p className="flex items-center gap-2 font-bold text-foreground">
            <Database className="h-4 w-4 text-ew-gold-600" /> Mode démonstration
          </p>
          <p className="mt-2 text-muted-foreground">
            La supervision connectée (isolation réelle par antenne) nécessite le backend Supabase.
            En mode démonstration, utilisez le module <strong>APFC</strong> (Inspection &amp; supervision)
            pour la gestion d&apos;ensemble, et <strong>Rapports d&apos;antennes</strong> pour le suivi.
          </p>
        </div>
      ) : loading ? (
        <p className="px-1 py-8 text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <>
          {/* Registre + affectation des chefs (gestion globale uniquement) */}
          {isManager && (
            <SectionCard
              title="Registre des antennes & affectation des chefs"
              action={
                <Button size="sm" className={GREEN_BTN} onClick={() => setAntennaDialog("new")}>
                  <Plus className="h-4 w-4" /> Nouvelle antenne
                </Button>
              }
            >
              {antennas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune antenne enregistrée.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {antennas.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-foreground">{a.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[a.code, a.region, a.locality].filter(Boolean).join(" · ") || "—"}
                        </p>
                        {(a.responsable || a.subAntennas > 0 || a.coordinators > 0) && (
                          <p className="truncate text-[11px] text-muted-foreground">
                            {[
                              a.responsable,
                              a.subAntennas ? `${a.subAntennas} sous-antennes` : null,
                              a.coordinators ? `${a.coordinators} coord.` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <Badge tone={a.headProfileId ? "green" : "slate"}>
                        {a.headProfileId ? "Chef affecté" : "Sans chef"}
                      </Badge>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setAntennaDialog(a)}
                          aria-label={`Modifier ${a.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Input
                          value={headEmail[a.id] ?? ""}
                          onChange={(e) => setHeadEmail((m) => ({ ...m, [a.id]: e.target.value }))}
                          placeholder="e-mail du chef"
                          className="h-9 w-48"
                        />
                        <Button
                          size="sm"
                          className={GREEN_BTN}
                          onClick={() => onAssign(a.id, (headEmail[a.id] ?? "").trim() || null)}
                        >
                          <UserCheck className="h-4 w-4" /> Affecter
                        </Button>
                        {a.headProfileId && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => onAssign(a.id, null)}
                            aria-label="Retirer le chef"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          )}

          {/* Sélecteur d'antenne + activités */}
          {antennas.length === 0 && !isManager ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              {isChef
                ? "Aucune antenne ne vous est rattachée. Demandez à votre Admin APFC de vous affecter comme Chef d'Antenne."
                : "Vous n'avez pas d'antenne à superviser."}
            </div>
          ) : (
            <SectionCard
              title="Activités de formation continue"
              action={
                antennas.length > 1 ? (
                  <Select value={selId ?? ""} onValueChange={(v) => setSelId(v)}>
                    <SelectTrigger className="h-9 w-64">
                      <SelectValue placeholder="Choisir une antenne" />
                    </SelectTrigger>
                    <SelectContent>
                      {antennas.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : undefined
              }
            >
              {!selected ? (
                <p className="text-sm text-muted-foreground">Sélectionnez une antenne.</p>
              ) : (
                <div className="space-y-3">
                  {/* Détails de l'antenne sélectionnée */}
                  <div className="rounded-xl border border-border bg-muted/20 p-3">
                    <p className="font-bold text-foreground">{selected.name}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {selected.code && <span>{selected.code}</span>}
                      {(selected.region || selected.locality) && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[selected.region, selected.locality].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {selected.responsable && <span>Responsable&nbsp;: {selected.responsable}</span>}
                      {selected.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selected.phone}
                        </span>
                      )}
                      {selected.email && <span>{selected.email}</span>}
                    </div>
                  </div>

                  {/* Ajout d'activité */}
                  <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-muted/30 p-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Intitulé</Label>
                      <Input value={actTitle} onChange={(e) => setActTitle(e.target.value)} placeholder="Évaluation par compétences" className="h-9 w-64" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Type</Label>
                      <Select value={actType} onValueChange={setActType}>
                        <SelectTrigger className="h-9 w-52">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APFC_ACTIVITY_TYPES.map((tp) => (
                            <SelectItem key={tp} value={tp}>
                              {tp}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Date</Label>
                      <Input type="date" value={actDate} onChange={(e) => setActDate(e.target.value)} className="h-9 w-40" />
                    </div>
                    <Button className={GREEN_BTN} onClick={onAddActivity}>
                      <Plus className="h-4 w-4" /> Ajouter
                    </Button>
                  </div>

                  {/* Liste */}
                  {activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune activité enregistrée pour cette antenne.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {activities.map((act) => (
                        <li key={act.id} className="flex items-center gap-3 py-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ew-green-100 text-ew-green-700">
                            <CalendarDays className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-foreground">{act.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {act.type ?? "—"}
                              {act.date ? ` · ${act.date}` : ""}
                            </p>
                          </div>
                          <button
                            onClick={() => onRemoveActivity(act.id)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                            aria-label="Supprimer l'activité"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </SectionCard>
          )}
        </>
      )}

      {antennaDialog && (
        <AntennaFormDialog
          antenna={antennaDialog}
          onClose={() => setAntennaDialog(null)}
          onSaved={() => {
            setAntennaDialog(null);
            void reload();
          }}
        />
      )}
    </div>
  );
}

/* ----------------------- Dialogue création / édition d'antenne ----------------------- */
function AntennaFormDialog({
  antenna,
  onClose,
  onSaved,
}: {
  antenna: ApfcAntennaRow | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = antenna === "new";
  const a = isNew ? null : antenna;
  const [f, setF] = React.useState({
    name: a?.name ?? "",
    code: a?.code ?? "",
    region: a?.region ?? "",
    locality: a?.locality ?? "",
    address: a?.address ?? "",
    phone: a?.phone ?? "",
    email: a?.email ?? "",
    responsable: a?.responsable ?? "",
    responsableContact: a?.responsableContact ?? "",
    subAntennas: String(a?.subAntennas ?? 0),
    coordinators: String(a?.coordinators ?? 0),
  });
  const [saving, setSaving] = React.useState(false);
  const set =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setF((prev) => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    if (!f.name.trim()) {
      toast.error("Renseignez le nom de l'antenne");
      return;
    }
    setSaving(true);
    const sb = createClient();
    const input = {
      name: f.name.trim(),
      code: f.code.trim() || null,
      region: f.region.trim() || null,
      locality: f.locality.trim() || null,
      address: f.address.trim() || null,
      phone: f.phone.trim() || null,
      email: f.email.trim() || null,
      responsable: f.responsable.trim() || null,
      responsableContact: f.responsableContact.trim() || null,
      subAntennas: Number(f.subAntennas) || 0,
      coordinators: Number(f.coordinators) || 0,
    };
    const res = isNew
      ? await createApfcAntenna(sb, input)
      : await updateApfcAntenna(sb, a!.id, input);
    setSaving(false);
    if (res.error) {
      toast.error(isNew ? "Création impossible" : "Modification impossible", { description: res.error });
      return;
    }
    toast.success(isNew ? "Antenne créée" : "Antenne modifiée");
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-ew-green-700" />
            {isNew ? "Nouvelle antenne APFC" : "Modifier l'antenne"}
          </DialogTitle>
          <DialogDescription>
            Les informations descriptives de l&apos;antenne. Le Chef d&apos;Antenne s&apos;affecte
            séparément, par e-mail, depuis le registre.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto sm:grid-cols-2">
          <div className="sm:col-span-2">
            <AntennaField label="Nom de l'antenne" value={f.name} onChange={set("name")} placeholder="Antenne APFC d'Abidjan" />
          </div>
          <AntennaField label="Code" value={f.code} onChange={set("code")} placeholder="APFC-CI-001" />
          <AntennaField label="Région" value={f.region} onChange={set("region")} placeholder="Abidjan" />
          <AntennaField label="Localité" value={f.locality} onChange={set("locality")} placeholder="Cocody" />
          <AntennaField label="Adresse" value={f.address} onChange={set("address")} placeholder="BP 200" />
          <AntennaField label="Téléphone" value={f.phone} onChange={set("phone")} placeholder="27 00 00 00 00" />
          <AntennaField label="E-mail" value={f.email} onChange={set("email")} placeholder="antenne@formation.org" />
          <AntennaField label="Responsable (nom)" value={f.responsable} onChange={set("responsable")} placeholder="M. KOUASSI Jean" />
          <AntennaField label="Contact du responsable" value={f.responsableContact} onChange={set("responsableContact")} placeholder="07 00 00 00 00" />
          <AntennaField label="Sous-antennes" value={f.subAntennas} onChange={set("subAntennas")} type="number" />
          <AntennaField label="Coordonnateurs" value={f.coordinators} onChange={set("coordinators")} type="number" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button className={GREEN_BTN} onClick={save} disabled={saving}>
            {isNew ? "Créer" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Champ de formulaire d'antenne (composant stable, défini hors render pour préserver le focus). */
function AntennaField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input value={value} onChange={onChange} placeholder={placeholder} type={type} className="h-9" />
    </div>
  );
}
