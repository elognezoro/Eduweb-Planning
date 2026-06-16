"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { KeyRound, History, Save, Users, X, Trash2, Target, Clock, CheckCircle2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCombobox } from "@/components/forms/user-combobox";
import { CountrySearchSelect } from "@/components/forms/country-select";
import { SearchSelect } from "@/components/forms/search-select";
import { useStore } from "@/components/app-shell/data-store";
import { useApp } from "@/components/app-shell/app-context";
import { GRANT_DURATIONS, computeGrantExpiry, grantDurationLabel } from "@/lib/grants";
import { PERMISSION_DOMAINS, PERMISSION_LABELS, type Permission } from "@/lib/permissions";
import { ROLE_LIST, getRoleLabel, type UserRole } from "@/lib/roles";
import { formatDate, cn } from "@/lib/utils";

/** Structures de rattachement, déduites du rôle. */
const STRUCTURES: { id: string; label: string; roles: UserRole[] }[] = [
  { id: "drena", label: "DRENA / DRENAET", roles: ["drena", "inspecteur", "conseiller_pedagogique"] },
  { id: "cafop", label: "CAFOP", roles: ["cafop_admin"] },
  { id: "apfc", label: "APFC", roles: ["apfc_admin", "chef_antenne"] },
  { id: "etablissement", label: "Établissement", roles: ["chef_etablissement", "enseignant", "educateur", "parent", "eleve"] },
  { id: "administration", label: "Administration", roles: ["admin", "etablissements_admin"] },
];
const structureOf = (role: UserRole) => STRUCTURES.find((s) => s.roles.includes(role))?.id ?? "administration";

export default function HabilitationsPage() {
  const t = useTranslations();
  const { users, userGrants, grantLog, grantPermissions, revokeUserGrant } = useStore();
  const { user: me } = useApp();

  /* ------------------------------ Bénéficiaires ------------------------------ */
  const [country, setCountry] = React.useState("all");
  const [etab, setEtab] = React.useState("all");
  const [structure, setStructure] = React.useState("all");
  const [role, setRole] = React.useState("all");
  const etabs = React.useMemo(() => [...new Set(users.map((u) => u.etablissement))], [users]);

  const filtered = React.useMemo(
    () =>
      users.filter((u) => {
        if (country !== "all" && (u.country ?? "CI") !== country) return false;
        if (etab !== "all" && u.etablissement !== etab) return false;
        if (structure !== "all" && structureOf(u.role) !== structure) return false;
        if (role !== "all" && u.role !== role) return false;
        return true;
      }),
    [users, country, etab, structure, role],
  );

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const selected = users.filter((u) => selectedIds.includes(u.id));
  const addSelected = (id: string) => setSelectedIds((s) => (s.includes(id) ? s : [...s, id]));
  const removeSelected = (id: string) => setSelectedIds((s) => s.filter((x) => x !== id));
  const selectAllFiltered = () => {
    setSelectedIds((s) => [...new Set([...s, ...filtered.map((u) => u.id)])]);
    toast.success(`${filtered.length} utilisateur(s) ajoutés à la sélection`);
  };

  const comboItems = React.useMemo(
    () =>
      filtered
        .filter((u) => !selectedIds.includes(u.id))
        .map((u) => ({ value: u.id, label: u.name, sublabel: `${getRoleLabel(u.role)} · ${u.etablissement}` })),
    [filtered, selectedIds],
  );

  /* ------------------------------- Attribution ------------------------------- */
  const [perms, setPerms] = React.useState<Permission[]>([]);
  const togglePerm = (p: Permission) => setPerms((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  const [activity, setActivity] = React.useState("");
  const [duration, setDuration] = React.useState("30d");
  const [justification, setJustification] = React.useState("");

  const canApply = selected.length > 0 && perms.length > 0 && justification.trim().length > 0;

  const apply = () => {
    if (!canApply) return;
    grantPermissions({
      userIds: selected.map((u) => u.id),
      userNames: selected.map((u) => u.name),
      permissions: perms,
      expiresAt: computeGrantExpiry(duration),
      durationLabel: grantDurationLabel(duration),
      activity: activity.trim() || null,
      actor: me.displayName,
      justification: justification.trim(),
    });
    toast.success("Habilitations attribuées", {
      description: `${perms.length} permission(s) accordée(s) à ${selected.length} utilisateur(s) — ${grantDurationLabel(duration)}${activity.trim() ? ` · ${activity.trim()}` : ""}.`,
    });
    setPerms([]);
    setActivity("");
    setJustification("");
    setSelectedIds([]);
  };

  /* ----------------------------- Habilitations actives ----------------------- */
  const now = Date.now();
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? id;
  const activeGrants = userGrants.filter((g) => g.expiresAt === null || new Date(g.expiresAt).getTime() > now);

  return (
    <ModulePage title={t("pages.systemeHabilitations.title")} description={t("pages.systemeHabilitations.description")}
      icon={KeyRound}
      permission="system:manage_permissions"
      sections={[
        { id: "beneficiaires", label: "Bénéficiaires" },
        { id: "attribution", label: "Attribution" },
        { id: "actives", label: "Habilitations actives" },
        { id: "historique", label: "Historique" },
      ]}
      kpis={[
        { label: "Habilitations actives", value: activeGrants.length, icon: KeyRound, tone: "green" },
        { label: "Bénéficiaires sélectionnés", value: selected.length, icon: Users, tone: "blue" },
        { label: "Permissions cochées", value: perms.length, icon: CheckCircle2, tone: "gold" },
        { label: "Entrées au journal", value: grantLog.length, icon: History, tone: "purple" },
      ]}
    >
      <TwoColumn className="lg:grid-cols-[1fr_2fr]">
        {/* ------------------------------ Bénéficiaires ------------------------------ */}
        <SectionCard
          id="beneficiaires"
          title="Bénéficiaires"
          description="Filtrez par pays, établissement, structure ou rôle, puis sélectionnez un ou plusieurs utilisateurs."
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Pays</Label>
              <CountrySearchSelect value={country} onChange={setCountry} allowAll />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Établissement</Label>
              <SearchSelect
                items={etabs.map((e) => ({ value: e, label: e }))}
                value={etab}
                onChange={setEtab}
                allowAll
                allLabel="Tous les établissements"
                searchPlaceholder="Tapez les premières lettres de l'établissement…"
                emptyText="Aucun établissement trouvé"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Structure</Label>
                <SearchSelect
                  items={STRUCTURES.map((s) => ({ value: s.id, label: s.label }))}
                  value={structure}
                  onChange={setStructure}
                  allowAll
                  allLabel="Toutes"
                  searchPlaceholder="Tapez les premières lettres…"
                  emptyText="Aucune structure trouvée"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Rôle</Label>
                <SearchSelect
                  items={ROLE_LIST.map((r) => ({ value: r.id, label: r.label }))}
                  value={role}
                  onChange={setRole}
                  allowAll
                  allLabel="Tous les rôles"
                  searchPlaceholder="Tapez les premières lettres du rôle…"
                  emptyText="Aucun rôle trouvé"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center justify-between">
                Ajouter un utilisateur
                <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {filtered.length} résultat(s)
                </span>
              </Label>
              <UserCombobox
                items={comboItems}
                value=""
                onChange={addSelected}
                placeholder="Tapez les premières lettres du nom…"
                searchPlaceholder="Tapez les premières lettres du nom…"
                emptyText="Aucun utilisateur ne correspond"
              />
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={selectAllFiltered} disabled={filtered.length === 0}>
                <UserPlus className="h-4 w-4" /> Sélectionner les {filtered.length} résultat(s) (groupe)
              </Button>
            </div>

            {/* Sélection courante */}
            <div className="space-y-1.5">
              <Label className="flex items-center justify-between">
                Sélection ({selected.length})
                {selected.length > 0 && (
                  <button type="button" onClick={() => setSelectedIds([])} className="text-xs font-normal text-muted-foreground hover:text-red-600 hover:underline">
                    Tout retirer
                  </button>
                )}
              </Label>
              {selected.length === 0 ? (
                <p className="rounded-md border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground">
                  Aucun bénéficiaire sélectionné.
                </p>
              ) : (
                <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
                  {selected.map((u) => (
                    <span
                      key={u.id}
                      title={`${getRoleLabel(u.role)} · ${u.etablissement}`}
                      className="flex items-center gap-1 rounded-full bg-ew-green-100 py-1 pl-2.5 pr-1 text-xs font-semibold text-ew-green-800"
                    >
                      {u.name}
                      <button type="button" onClick={() => removeSelected(u.id)} aria-label={`Retirer ${u.name}`} className="rounded-full p-0.5 hover:bg-ew-green-700 hover:text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ------------------------------- Attribution ------------------------------- */}
        <SectionCard
          id="attribution"
          title="Attribution d'habilitations"
          description="Cochez les permissions à accorder, précisez l'activité visée, la durée et la justification."
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-ew-green-700" /> Activité spécifique (optionnel)
                </Label>
                <Input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Ex : Conseil de classe du 20 juin, saisie des notes T3…" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-ew-green-700" /> Durée
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GRANT_DURATIONS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Permissions à accorder {perms.length > 0 && <Badge tone="green">{perms.length}</Badge>}
              </p>
              {PERMISSION_DOMAINS.map((domain) => (
                <div key={domain.id}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">{domain.label}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {domain.permissions.map((p) => {
                      const on = perms.includes(p);
                      return (
                        <div
                          key={p}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-lg border p-2.5",
                            on ? "border-ew-green-600/50 bg-ew-green-50" : "border-border",
                          )}
                        >
                          <span className="text-sm text-foreground">{PERMISSION_LABELS[p]}</span>
                          <Switch checked={on} onCheckedChange={() => togglePerm(p)} aria-label={PERMISSION_LABELS[p]} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label>Justification <span className="text-red-500">*</span></Label>
              <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Motif de l'attribution (obligatoire — tracé dans le journal)…" />
            </div>

            <Button className="w-full" disabled={!canApply} onClick={apply}>
              <Save className="h-4 w-4" /> Accorder à {selected.length} bénéficiaire(s) {perms.length > 0 ? `· ${perms.length} permission(s)` : ""}
            </Button>
          </div>
        </SectionCard>
      </TwoColumn>

      {/* ----------------------------- Habilitations actives ----------------------- */}
      <SectionCard id="actives" title="Habilitations actives" description="Attributions en cours — révocables à tout moment (révocation journalisée)." contentClassName="p-0">
        {activeGrants.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Aucune habilitation spécifique active.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 text-left">Bénéficiaire</th>
                  <th className="px-4 py-2.5 text-left">Permission</th>
                  <th className="px-4 py-2.5 text-left">Activité</th>
                  <th className="px-4 py-2.5 text-left">Échéance</th>
                  <th className="px-4 py-2.5 text-left">Accordée par</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeGrants.map((g) => (
                  <tr key={g.id} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium text-foreground">{nameOf(g.userId)}</td>
                    <td className="px-4 py-2.5">{PERMISSION_LABELS[g.permission]}</td>
                    <td className="px-4 py-2.5">
                      {g.activity ? <Badge tone="gold">{g.activity}</Badge> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{g.expiresAt ? formatDate(g.expiresAt) : "Sans limite"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{g.grantedBy ?? "—"}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => {
                          revokeUserGrant(g.id, me.displayName);
                          toast("Habilitation révoquée", { description: `${PERMISSION_LABELS[g.permission]} — ${nameOf(g.userId)}.` });
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        aria-label="Révoquer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* --------------------------------- Historique ------------------------------ */}
      <SectionCard id="historique" title="Historique des changements" description="Journal complet : qui a accordé ou révoqué quoi, à qui, quand et pourquoi.">
        <ol className="space-y-3 text-sm">
          {grantLog.map((h) => (
            <li key={h.id} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  h.action === "grant" ? "bg-ew-green-100 text-ew-green-700" : "bg-red-50 text-red-600",
                )}
              >
                {h.action === "grant" ? <KeyRound className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
              </span>
              <div className="min-w-0">
                <p className="text-foreground">
                  <strong>{h.actor}</strong> a {h.action === "grant" ? "accordé" : "révoqué"}{" "}
                  <strong>{h.permissions.join(", ")}</strong> {h.action === "grant" ? "à" : "pour"}{" "}
                  <strong>{h.users.join(", ")}</strong>
                  {h.durationLabel ? ` · ${h.durationLabel}` : ""}
                  {h.activity ? (
                    <>
                      {" "}— activité : <em>{h.activity}</em>
                    </>
                  ) : null}
                </p>
                {h.justification && <p className="text-xs text-muted-foreground">Justification : {h.justification}</p>}
                <time className="text-xs text-muted-foreground">{new Date(h.at).toLocaleString("fr-FR")}</time>
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>
    </ModulePage>
  );
}
