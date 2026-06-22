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

  // Création d'antenne (gestion globale).
  const [newName, setNewName] = React.useState("");
  const [newCode, setNewCode] = React.useState("");
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
  const onCreate = async () => {
    if (!newName.trim()) {
      toast.error("Renseignez le nom de l'antenne");
      return;
    }
    const sb = createClient();
    const res = await createApfcAntenna(sb, { name: newName.trim(), code: newCode.trim() || null });
    if (res.error) {
      toast.error("Création impossible", { description: res.error });
      return;
    }
    setNewName("");
    setNewCode("");
    toast.success("Antenne créée");
    await reload();
  };

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
            <SectionCard title="Registre des antennes & affectation des chefs">
              <div className="space-y-3">
                {antennas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune antenne enregistrée.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {antennas.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-foreground">{a.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{a.code ?? "—"}</p>
                        </div>
                        <Badge tone={a.headProfileId ? "green" : "slate"}>
                          {a.headProfileId ? "Chef affecté" : "Sans chef"}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          <Input
                            value={headEmail[a.id] ?? ""}
                            onChange={(e) => setHeadEmail((m) => ({ ...m, [a.id]: e.target.value }))}
                            placeholder="e-mail du chef"
                            className="h-9 w-52"
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

                <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Nom de l&apos;antenne</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Antenne APFC d'Abidjan" className="h-9 w-64" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Code</Label>
                    <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="APFC-CI-001" className="h-9 w-40" />
                  </div>
                  <Button className={GREEN_BTN} onClick={onCreate}>
                    <Plus className="h-4 w-4" /> Créer l&apos;antenne
                  </Button>
                </div>
              </div>
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
    </div>
  );
}
