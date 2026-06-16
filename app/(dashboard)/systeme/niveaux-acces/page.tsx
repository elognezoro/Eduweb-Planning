"use client";

import * as React from "react";
import { ShieldCheck, Check, Minus, Users, Pencil, Search, Clock, Trash2, Plus, ShieldPlus } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/app-shell/role-badge";
import { ExportMenu } from "@/components/layout/export-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/components/app-shell/data-store";
import { useApp } from "@/components/app-shell/app-context";
import { RegionalStructures } from "@/components/admin/regional-structures";
import { GRANT_DURATIONS, computeGrantExpiry, grantDurationLabel } from "@/lib/grants";
import { ROLE_LIST, getRoleLabel, type UserRole } from "@/lib/roles";
import {
  PERMISSION_DOMAINS,
  PERMISSION_LABELS,
  hasPermission,
  type Permission,
} from "@/lib/permissions";
import type { DirectoryUser } from "@/lib/mock-data";
import { initials, formatDate, cn } from "@/lib/utils";

/* ----------------------- Lignes de la matrice (fonctions) ---------------------- */
const MATRIX_ROWS: { label: string; permission: Permission }[] = [
  { label: "Configuration établissement", permission: "settings:manage_configuration" },
  { label: "Emploi du temps", permission: "timetable:manage" },
  { label: "Registre d'appel", permission: "attendance:manage" },
  { label: "Cahier de texte", permission: "lesson_book:manage" },
  { label: "Notes & bulletins", permission: "grades:manage" },
  { label: "Alertes SMS", permission: "sms:send" },
  { label: "Statistiques par classe", permission: "statistics:class" },
  { label: "Statistiques établissement", permission: "statistics:institution" },
  { label: "Statistiques régionales", permission: "statistics:regional" },
  { label: "Mon profil", permission: "system:manage_profile" },
  { label: "Journal d'activité", permission: "system:view_audit_log" },
  { label: "Niveaux d'accès", permission: "system:manage_roles" },
  { label: "Facturation", permission: "system:manage_billing" },
  { label: "Académie Premium", permission: "premium:view" },
  { label: "Design & thème", permission: "system:customize_theme" },
  { label: "Installation", permission: "system:view_installation" },
  { label: "Visites d'inspection", permission: "inspection:view" },
  { label: "Rapport trimestriel", permission: "institution_report:view" },
];

/** Date d'inscription déterministe (démo). */
const regDate = (id: string) => {
  const seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const day = (seed % 28) + 1;
  const month = (seed % 6) + 1;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/2026`;
};

export default function NiveauxAccesPage() {
  const { users, roleOverrides, userGrants, toggleRolePermission } = useStore();

  const isGranted = (role: UserRole, perm: Permission) => {
    const key = `${role}|${perm}`;
    return key in roleOverrides ? roleOverrides[key] : hasPermission(role, perm);
  };
  const toggle = (role: UserRole, perm: Permission, label: string) => {
    toggleRolePermission(role, perm);
    toast.success(`« ${label} » ${isGranted(role, perm) ? "retiré" : "accordé"} — ${getRoleLabel(role)}`);
  };

  // Filtres gestion des utilisateurs
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [etabFilter, setEtabFilter] = React.useState("all");
  const etablissements = React.useMemo(() => [...new Set(users.map((u) => u.etablissement))], [users]);
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (etabFilter !== "all" && u.etablissement !== etabFilter) return false;
    const q = query.trim().toLowerCase();
    return !q || `${u.name} ${u.phone ?? ""} ${u.email}`.toLowerCase().includes(q);
  });

  const now = Date.now();
  const activeGrantCount = (userId: string) =>
    userGrants.filter((g) => g.userId === userId && (g.expiresAt === null || new Date(g.expiresAt).getTime() > now)).length;

  return (
    <ModulePage
      title="Niveaux d'accès"
      description="Matrice des droits par rôle et attribution de permissions spécifiques et temporaires."
      icon={ShieldCheck}
      permission="system:manage_roles"
      sections={[
        { id: "matrice", label: "Matrice des droits" },
        { id: "utilisateurs", label: "Gestion des utilisateurs" },
        { id: "structures", label: "Structures régionales" },
      ]}
      actions={
        <ExportMenu
          filename="matrice-permissions"
          buildPayload={() => ({
            title: "Matrice des permissions",
            country: "Côte d'Ivoire",
            author: "EduWeb Planner",
            generatedAt: new Date().toLocaleString("fr-FR"),
            sections: PERMISSION_DOMAINS.map((d) => ({
              heading: d.label,
              table: {
                columns: ["Permission", ...ROLE_LIST.map((r) => r.shortLabel)],
                rows: d.permissions.map((p) => [PERMISSION_LABELS[p], ...ROLE_LIST.map((r) => (isGranted(r.id, p) ? "✓" : "—"))]),
              },
            })),
          })}
        />
      }
      kpis={[
        { label: "Rôles", value: ROLE_LIST.length, icon: Users, tone: "green" },
        { label: "Droits matricés", value: MATRIX_ROWS.length, icon: ShieldCheck, tone: "blue" },
        { label: "Utilisateurs", value: users.length, icon: Users, tone: "gold" },
        {
          label: "Permissions temporaires",
          value: userGrants.filter((g) => g.expiresAt === null || new Date(g.expiresAt).getTime() > now).length,
          icon: Clock,
          tone: "purple",
        },
      ]}
    >
      {/* Matrice des droits */}
      <SectionCard
        id="matrice"
        title="Matrice des droits"
        description="Cliquez sur une cellule pour activer ou désactiver une permission."
        contentClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Permission
                </th>
                {ROLE_LIST.map((r) => (
                  <th key={r.id} className="px-2 py-3 text-center align-bottom">
                    <span className="block min-w-[70px] text-[11px] font-bold text-foreground" title={r.label}>
                      {r.shortLabel}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX_ROWS.map((row, i) => (
                <tr key={row.permission} className={cn("border-b border-border/60", i % 2 === 1 && "bg-muted/30")}>
                  <td className="sticky left-0 z-10 bg-card px-4 py-2 font-medium text-foreground">{row.label}</td>
                  {ROLE_LIST.map((r) => {
                    const ok = isGranted(r.id, row.permission);
                    return (
                      <td key={r.id} className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggle(r.id, row.permission, row.label)}
                          aria-label={`${row.label} — ${r.label} : ${ok ? "accordé" : "non accordé"}`}
                          className={cn(
                            "mx-auto flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                            ok
                              ? "bg-ew-green-600 text-white hover:bg-ew-green-700"
                              : "bg-muted text-slate-400 hover:bg-slate-200 hover:text-slate-600",
                          )}
                        >
                          {ok ? <Check className="h-3.5 w-3.5" /> : <Minus className="h-3 w-3" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Gestion des utilisateurs */}
      <SectionCard id="utilisateurs" contentClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <Users className="h-4 w-4 text-ew-green-700" /> Gestion des utilisateurs
              <span className="rounded-full bg-ew-green-100 px-2 py-0.5 text-xs font-bold text-ew-green-700">
                {users.length} utilisateur(s)
              </span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Filtrez et attribuez des <strong>permissions spécifiques et temporaires</strong> (à durée limitable).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border p-4 sm:p-5">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par nom ou téléphone…" className="h-9 pl-8" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[150px]"><SelectValue placeholder="Tous les rôles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {ROLE_LIST.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={etabFilter} onValueChange={setEtabFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[170px]"><SelectValue placeholder="Tous les établissements" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les établissements</SelectItem>
              {etablissements.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 text-left">Utilisateur</th>
                <th className="px-4 py-2.5 text-left">Contact</th>
                <th className="px-4 py-2.5 text-left">Rôle actuel</th>
                <th className="px-4 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const grants = activeGrantCount(u.id);
                return (
                  <tr key={u.id} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback className="text-xs">{initials(u.name)}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">Inscrit le {regDate(u.id)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ew-green-700">{u.phone ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      {u.status === "pending" ? <Badge tone="gold">pending</Badge> : <RoleBadge role={u.role} />}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        {grants > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-ew-purple/10 px-2 py-0.5 text-[11px] font-semibold text-ew-purple">
                            <Clock className="h-3 w-3" /> {grants}
                          </span>
                        )}
                        <UserPermissionsDialog user={u} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">Aucun utilisateur trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Gestion des structures régionales */}
      <div id="structures" className="scroll-mt-24">
        <RegionalStructures />
      </div>
    </ModulePage>
  );
}

/* ------------------ Dialogue : permissions temporaires par utilisateur ----------------- */
function UserPermissionsDialog({ user }: { user: DirectoryUser }) {
  const { userGrants, grantPermissions, revokeUserGrant } = useStore();
  const { user: me } = useApp();
  const [open, setOpen] = React.useState(false);
  const [perm, setPerm] = React.useState<string>("");
  const [duration, setDuration] = React.useState("30d");

  const grants = userGrants.filter((g) => g.userId === user.id);
  const now = Date.now();

  const grant = () => {
    if (!perm) {
      toast.error("Sélectionnez une permission");
      return;
    }
    const expiresAt = computeGrantExpiry(duration);
    grantPermissions({
      userIds: [user.id],
      userNames: [user.name],
      permissions: [perm as Permission],
      expiresAt,
      durationLabel: grantDurationLabel(duration),
      activity: null,
      actor: me.displayName,
      justification: "Attribution depuis Niveaux d'accès.",
    });
    toast.success("Permission accordée", {
      description: `${PERMISSION_LABELS[perm as Permission]} — ${expiresAt ? `jusqu'au ${formatDate(expiresAt)}` : "sans limite"}.`,
    });
    setPerm("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-3.5 w-3.5" /> Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldPlus className="h-4 w-4 text-ew-green-700" /> Accès de {user.name}
          </DialogTitle>
          <DialogDescription>
            Rôle actuel : <strong>{getRoleLabel(user.role)}</strong>. Accordez des permissions supplémentaires, limitées dans le temps.
          </DialogDescription>
        </DialogHeader>

        {/* Attributions actives */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Permissions spécifiques accordées</Label>
          {grants.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground">
              Aucune permission spécifique — seules celles du rôle s&apos;appliquent.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {grants.map((g) => {
                const expired = g.expiresAt !== null && new Date(g.expiresAt).getTime() <= now;
                return (
                  <li key={g.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{PERMISSION_LABELS[g.permission]}</p>
                      <p className={cn("text-[11px]", expired ? "text-red-600" : "text-muted-foreground")}>
                        {g.expiresAt === null ? "Sans limite de durée" : expired ? `Expirée le ${formatDate(g.expiresAt)}` : `Expire le ${formatDate(g.expiresAt)}`}
                      </p>
                    </div>
                    <button onClick={() => revokeUserGrant(g.id, me.displayName)} className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600" aria-label="Retirer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Ajout */}
        <div className="space-y-3 rounded-lg border border-border p-3">
          <div className="space-y-1.5">
            <Label>Permission à accorder</Label>
            <Select value={perm} onValueChange={setPerm}>
              <SelectTrigger><SelectValue placeholder="Choisir une permission…" /></SelectTrigger>
              <SelectContent>
                {PERMISSION_DOMAINS.map((d) => (
                  <SelectGroup key={d.id}>
                    <SelectLabel>{d.label}</SelectLabel>
                    {d.permissions.map((p) => (
                      <SelectItem key={p} value={p}>{PERMISSION_LABELS[p]}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Durée</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GRANT_DURATIONS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={grant}>
            <Plus className="h-4 w-4" /> Accorder la permission
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
