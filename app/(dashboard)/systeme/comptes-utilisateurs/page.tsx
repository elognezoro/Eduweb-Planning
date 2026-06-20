"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Pencil,
  Ban,
  RotateCcw,
  Archive,
  UploadCloud,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ModulePage } from "@/components/modules/module-page";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/app-shell/role-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import { ImportCsvDialog } from "@/components/forms/import-csv-dialog";
import { PhoneInput } from "@/components/forms/phone-input";
import { CountrySearchSelect } from "@/components/forms/country-select";
import { SearchSelect } from "@/components/forms/search-select";
import { CountryFlag } from "@/components/app-shell/switchers";
import { getUnCountry } from "@/config/un-countries";
import { loadEtabConfig } from "@/lib/etab-config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DirectoryUsersProvider, useDirectoryUsers } from "@/components/app-shell/use-directory-users";
import { useApp } from "@/components/app-shell/app-context";
import { isSuperAdminEmail } from "@/lib/super-admins";
import type { DirectoryUser } from "@/lib/mock-data";
import { ETABLISSEMENTS } from "@/lib/mock-data";
import { ROLE_LIST, ROLE_FAMILY_LABELS } from "@/lib/roles";
import type { UserRole, RoleFamily } from "@/lib/roles";
import { toNomCase, toPrenomCase, toFullNameCase } from "@/lib/format-name";
import { cn, initials } from "@/lib/utils";

const ROLE_FAMILY_ORDER: RoleFamily[] = ["administration", "supervision", "etablissement", "communaute"];

/** Tous les rôles de la plateforme, regroupés par famille pour le menu déroulant. */
function RoleSelectItems() {
  return (
    <>
      {ROLE_FAMILY_ORDER.map((fam) => {
        const roles = ROLE_LIST.filter((r) => r.family === fam);
        if (roles.length === 0) return null;
        return (
          <SelectGroup key={fam}>
            <SelectLabel>{ROLE_FAMILY_LABELS[fam]}</SelectLabel>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.label}
              </SelectItem>
            ))}
          </SelectGroup>
        );
      })}
    </>
  );
}

function useColumns(): ColumnDef<DirectoryUser>[] {
  const t = useTranslations("pages.systemeComptesUtilisateurs.table");
  return [
    {
      accessorKey: "name",
      header: t("user"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-ew-green-100 text-xs text-ew-green-800">
              {initials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "role", header: t("role"), cell: ({ row }) => <RoleBadge role={row.original.role} short /> },
    { accessorKey: "etablissement", header: t("institution") },
    {
      accessorKey: "country",
      header: t("country"),
      cell: ({ row }) => {
        const code = row.original.country ?? "CI";
        return (
          <span className="flex items-center gap-2">
            <CountryFlag code={code} />
            <span>{getUnCountry(code)?.name ?? code}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("registeredAt"),
      cell: ({ row }) => {
        const iso = row.original.createdAt;
        if (!iso) return <span className="text-muted-foreground">—</span>;
        const [date, time] = iso.split("T");
        const [y, m, d] = date.split("-");
        return (
          <div>
            <p className="text-foreground">
              {d}/{m}/{y} · {time.slice(0, 5)} UTC
            </p>
            {row.original.cohorte && <p className="text-xs text-muted-foreground">{row.original.cohorte}</p>}
          </div>
        );
      },
    },
    { accessorKey: "status", header: t("status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: () => <span className="block text-right">{t("actions")}</span>,
      enableSorting: false,
      cell: ({ row }) => <RowActions user={row.original} />,
    },
  ];
}

export default function ComptesUtilisateursPage() {
  return (
    <DirectoryUsersProvider>
      <ComptesUtilisateursContent />
    </DirectoryUsersProvider>
  );
}

function ComptesUtilisateursContent() {
  const t = useTranslations();
  const { users, addUser, removeUsers, loading, realMode, refresh } = useDirectoryUsers();
  const [role, setRole] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [country, setCountry] = React.useState("all");
  const [etab, setEtab] = React.useState("all");
  const [cohorte, setCohorte] = React.useState("all");

  const etabs = React.useMemo(() => [...new Set(users.map((u) => u.etablissement).filter(Boolean))], [users]);
  const cohortes = React.useMemo(
    () => [...new Set(users.map((u) => u.cohorte).filter(Boolean))] as string[],
    [users],
  );

  const data = users.filter(
    (u) =>
      (role === "all" || u.role === role) &&
      (status === "all" || u.status === status) &&
      (country === "all" || (u.country ?? "CI") === country) &&
      (etab === "all" || u.etablissement === etab) &&
      (cohorte === "all" || (cohorte === "manual" ? !u.cohorte : u.cohorte === cohorte)),
  );

  const counts = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    pending: users.filter((u) => u.status === "pending").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  };

  return (
    <ModulePage title={t("pages.systemeComptesUtilisateurs.title")} description={t("pages.systemeComptesUtilisateurs.description")}
      icon={Users}
      permission="system:manage_users"
      actions={
        <div className="flex gap-2">
          {realMode && (
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RotateCcw className={cn("h-4 w-4", loading && "animate-spin")} /> {t("pages.systemeComptesUtilisateurs.actions.refresh")}
            </Button>
          )}
          <ImportCsvDialog
            title={t("pages.systemeComptesUtilisateurs.actions.importTitle")}
            description={t("pages.systemeComptesUtilisateurs.actions.importDescription")}
            expectedColumns={["prenom", "nom", "email", "role", "etablissement"]}
            sampleRow={["Koffi", "Kouamé", "kkouame@eduweb.ci", "enseignant", "Lycée Moderne de Cocody"]}
            templateFilename="modele-utilisateurs.csv"
            trigger={(open) => (
              <Button variant="outline" onClick={open}>
                <UploadCloud className="h-4 w-4" /> {t("pages.systemeComptesUtilisateurs.actions.importCsv")}
              </Button>
            )}
          />
          <CreateUserDialog onCreate={addUser} />
        </div>
      }
      kpis={[
        { label: t("pages.systemeComptesUtilisateurs.kpis.total"), value: counts.total, icon: Users, tone: "green" },
        { label: t("pages.systemeComptesUtilisateurs.kpis.active"), value: counts.active, icon: Users, tone: "blue" },
        { label: t("pages.systemeComptesUtilisateurs.kpis.pending"), value: counts.pending, icon: Users, tone: "gold" },
        { label: t("pages.systemeComptesUtilisateurs.kpis.suspended"), value: counts.suspended, icon: Users, tone: "red" },
      ]}
    >
      <FilterBar>
        <SearchSelect
          items={ROLE_FAMILY_ORDER.flatMap((fam) =>
            ROLE_LIST.filter((r) => r.family === fam).map((r) => ({
              value: r.id,
              label: r.label,
              sublabel: ROLE_FAMILY_LABELS[fam],
            })),
          )}
          value={role}
          onChange={setRole}
          allowAll
          allLabel={t("pages.systemeComptesUtilisateurs.filters.allRoles")}
          searchPlaceholder={t("pages.systemeComptesUtilisateurs.filters.rolePlaceholder")}
          emptyText={t("pages.systemeComptesUtilisateurs.filters.noRoleFound")}
          className="w-52"
        />
        <FilterSelect
          value={status}
          onValueChange={setStatus}
          options={[
            { value: "all", label: t("pages.systemeComptesUtilisateurs.filters.allStatuses") },
            { value: "active", label: t("pages.systemeComptesUtilisateurs.filters.statusActive") },
            { value: "pending", label: t("pages.systemeComptesUtilisateurs.filters.statusPending") },
            { value: "suspended", label: t("pages.systemeComptesUtilisateurs.filters.statusSuspended") },
            { value: "archived", label: t("pages.systemeComptesUtilisateurs.filters.statusArchived") },
          ]}
        />
        <CountrySearchSelect value={country} onChange={setCountry} allowAll className="w-52" />
        <SearchSelect
          items={etabs.map((e) => ({ value: e, label: e }))}
          value={etab}
          onChange={setEtab}
          allowAll
          allLabel={t("pages.systemeComptesUtilisateurs.filters.allInstitutions")}
          searchPlaceholder={t("pages.systemeComptesUtilisateurs.filters.institutionPlaceholder")}
          emptyText={t("pages.systemeComptesUtilisateurs.filters.noInstitution")}
          className="w-56"
        />
        <SearchSelect
          items={[{ value: "manual", label: t("pages.systemeComptesUtilisateurs.filters.manualRegistration") }, ...cohortes.map((c) => ({ value: c, label: c }))]}
          value={cohorte}
          onChange={setCohorte}
          allowAll
          allLabel={t("pages.systemeComptesUtilisateurs.filters.allCohorts")}
          searchPlaceholder={t("pages.systemeComptesUtilisateurs.filters.cohortPlaceholder")}
          emptyText={t("pages.systemeComptesUtilisateurs.filters.noCohort")}
          className="w-56"
        />
      </FilterBar>

      {realMode && loading && users.length === 0 && (
        <p className="px-1 py-8 text-center text-sm text-muted-foreground">{t("pages.systemeComptesUtilisateurs.actions.loading")}</p>
      )}

      <DataTable
        columns={useColumns()}
        data={data}
        searchPlaceholder={t("pages.systemeComptesUtilisateurs.filters.searchUser")}
        enableSelection
        getRowId={(u) => u.id}
        bulkActions={(rows, clear) => (
          <BulkDeleteButton
            rows={rows as DirectoryUser[]}
            onConfirm={(ids) => {
              removeUsers(ids);
              toast.success(t("pages.systemeComptesUtilisateurs.toasts.bulkDeleted", { count: ids.length }));
              clear();
            }}
          />
        )}
      />
    </ModulePage>
  );
}

/** Petit bouton-icône compact pour les actions en ligne. */
function IconBtn({
  title,
  onClick,
  disabled,
  tone,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "green" | "red";
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-8 w-8",
        tone === "green" && "text-ew-green-600 hover:bg-ew-green-50 hover:text-ew-green-700",
        tone === "red" && "text-red-600 hover:bg-red-50 hover:text-red-700",
      )}
    >
      {children}
    </Button>
  );
}

function RowActions({ user }: { user: DirectoryUser }) {
  const t = useTranslations();
  const app = useApp();
  const { setUserStatus, updateUser, removeUser, deleteUserPermanently } = useDirectoryUsers();
  const [editOpen, setEditOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [permaOpen, setPermaOpen] = React.useState(false);
  const [roleOpen, setRoleOpen] = React.useState(false);

  // Suppression définitive interdite sur soi-même et sur un super-administrateur
  // (la garde est aussi appliquée côté serveur ; ici c'est l'UX).
  const canPermaDelete = app.user.id !== user.id && !isSuperAdminEmail(user.email);

  return (
    <>
      <div className="flex items-center justify-end gap-0.5">
        {user.status === "pending" && (
          <IconBtn
            title={t("pages.systemeComptesUtilisateurs.actions.validateAccount")}
            tone="green"
            onClick={() => {
              setUserStatus(user.id, "active");
              toast.success(t("pages.systemeComptesUtilisateurs.toasts.userActivated", { name: user.name }), { description: t("pages.systemeComptesUtilisateurs.toasts.userActivatedDesc") });
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
          </IconBtn>
        )}
        <IconBtn title={t("pages.systemeComptesUtilisateurs.actions.changeRoleTitle")} tone="green" onClick={() => setRoleOpen(true)}>
          <ShieldCheck className="h-4 w-4" />
        </IconBtn>

        <IconBtn title={t("pages.systemeComptesUtilisateurs.actions.previewProfile")} onClick={() => setPreviewOpen(true)}>
          <Eye className="h-4 w-4" />
        </IconBtn>

        <IconBtn title={t("pages.systemeComptesUtilisateurs.actions.edit")} onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
        </IconBtn>

        <IconBtn title={t("pages.systemeComptesUtilisateurs.actions.delete")} tone="red" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
        </IconBtn>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t("pages.systemeComptesUtilisateurs.actions.moreActions")}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user.status === "pending" && (
              <DropdownMenuItem
                onClick={() => {
                  setUserStatus(user.id, "active");
                  toast.success(t("pages.systemeComptesUtilisateurs.toasts.userApproved", { name: user.name }), { description: t("pages.systemeComptesUtilisateurs.toasts.userActivatedDesc") });
                }}
              >
                <ShieldCheck className="h-4 w-4" /> {t("pages.systemeComptesUtilisateurs.actions.approveAccount")}
              </DropdownMenuItem>
            )}
            {user.status === "suspended" || user.status === "archived" ? (
              <DropdownMenuItem
                onClick={() => {
                  setUserStatus(user.id, "active");
                  toast.success(t("pages.systemeComptesUtilisateurs.toasts.userReactivated", { name: user.name }));
                }}
              >
                <RotateCcw className="h-4 w-4" /> {t("pages.systemeComptesUtilisateurs.actions.reactivate")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  setUserStatus(user.id, "suspended");
                  toast.warning(t("pages.systemeComptesUtilisateurs.toasts.userSuspended", { name: user.name }));
                }}
              >
                <Ban className="h-4 w-4" /> {t("pages.systemeComptesUtilisateurs.actions.suspend")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                setUserStatus(user.id, "archived");
                toast(t("pages.systemeComptesUtilisateurs.toasts.accountArchived"), { description: t("pages.systemeComptesUtilisateurs.toasts.accountArchivedDesc", { name: user.name }) });
              }}
            >
              <Archive className="h-4 w-4" /> {t("pages.systemeComptesUtilisateurs.actions.archive")}
            </DropdownMenuItem>
            {canPermaDelete && (
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-700"
                onClick={() => setPermaOpen(true)}
              >
                <Trash2 className="h-4 w-4" /> Supprimer définitivement
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChangeRoleDialog
        user={user}
        open={roleOpen}
        onOpenChange={setRoleOpen}
        onSave={(patch) => {
          updateUser(user.id, patch);
          toast.success(t("pages.systemeComptesUtilisateurs.toasts.roleUpdated"));
          setRoleOpen(false);
        }}
      />
      <UserPreviewDialog
        user={user}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onEdit={() => {
          setPreviewOpen(false);
          setEditOpen(true);
        }}
      />
      <EditUserDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(patch) => {
          updateUser(user.id, patch);
          toast.success(t("pages.systemeComptesUtilisateurs.toasts.userEdited"));
        }}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("pages.systemeComptesUtilisateurs.delete.single")}
        description={
          <>
            {t("pages.systemeComptesUtilisateurs.delete.singleDesc1")}<strong>{user.name}</strong>{t("pages.systemeComptesUtilisateurs.delete.singleDesc2")}
          </>
        }
        onConfirm={() => {
          removeUser(user.id);
          toast.success(t("pages.systemeComptesUtilisateurs.toasts.userDeleted"), { description: t("pages.systemeComptesUtilisateurs.toasts.userDeletedDesc", { name: user.name }) });
          setDeleteOpen(false);
        }}
      />
      <ConfirmPermaDeleteDialog
        open={permaOpen}
        onOpenChange={setPermaOpen}
        user={user}
        onConfirm={async () => {
          const ok = await deleteUserPermanently(user.id);
          if (ok) {
            toast.success("Compte supprimé définitivement", {
              description: `${user.name} et ses données associées ont été supprimés.`,
            });
            setPermaOpen(false);
          }
        }}
      />
    </>
  );
}

/**
 * Confirmation FORTE de suppression définitive : l'admin doit saisir « SUPPRIMER »
 * pour armer le bouton. Action irréversible (cascade base).
 */
function ConfirmPermaDeleteDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: DirectoryUser;
  onConfirm: () => void | Promise<void>;
}) {
  const t = useTranslations();
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    if (!open) {
      setText("");
      setBusy(false);
    }
  }, [open]);
  const armed = text.trim().toUpperCase() === "SUPPRIMER";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-700">Supprimer définitivement le compte</DialogTitle>
          <DialogDescription>
            Action <strong>irréversible</strong>. Le compte de{" "}
            <strong>{user.name}</strong> ({user.email}) et toutes ses données
            associées (inscriptions, paiements, certificats…) seront supprimés
            définitivement.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>
            Pour confirmer, saisissez{" "}
            <span className="font-mono font-bold">SUPPRIMER</span>
          </Label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="SUPPRIMER"
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {t("pages.systemeComptesUtilisateurs.actions.cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={!armed || busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              setBusy(false);
            }}
          >
            <Trash2 className="h-4 w-4" /> Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

function UserPreviewDialog({
  user,
  open,
  onOpenChange,
  onEdit,
}: {
  user: DirectoryUser;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit: () => void;
}) {
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pages.systemeComptesUtilisateurs.preview.title")}</DialogTitle>
          <DialogDescription>{t("pages.systemeComptesUtilisateurs.preview.description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-ew-green-100 text-base text-ew-green-800">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-foreground">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <dl className="divide-y divide-border rounded-lg border border-border">
            <PreviewRow label={t("pages.systemeComptesUtilisateurs.preview.role")}>
              <RoleBadge role={user.role} />
            </PreviewRow>
            <PreviewRow label={t("pages.systemeComptesUtilisateurs.preview.status")}>
              <StatusBadge status={user.status} />
            </PreviewRow>
            <PreviewRow label={t("pages.systemeComptesUtilisateurs.preview.institution")}>{user.etablissement}</PreviewRow>
            <PreviewRow label={t("pages.systemeComptesUtilisateurs.preview.region")}>{user.region}</PreviewRow>
            <PreviewRow label={t("pages.systemeComptesUtilisateurs.preview.technicalId")}>
              <span className="font-mono text-xs">{user.id}</span>
            </PreviewRow>
          </dl>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("pages.systemeComptesUtilisateurs.actions.close")}</Button>
          <Button onClick={onEdit}>
            <Pencil className="h-4 w-4" /> {t("pages.systemeComptesUtilisateurs.actions.edit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("pages.systemeComptesUtilisateurs.actions.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="h-4 w-4" /> {confirmLabel ?? t("pages.systemeComptesUtilisateurs.actions.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkDeleteButton({ rows, onConfirm }: { rows: DirectoryUser[]; onConfirm: (ids: string[]) => void }) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" /> {t("pages.systemeComptesUtilisateurs.delete.bulkButton", { count: rows.length })}
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title={t("pages.systemeComptesUtilisateurs.delete.bulk", { count: rows.length, plural: rows.length > 1 ? "s" : "" })}
        description={t("pages.systemeComptesUtilisateurs.delete.bulkDesc")}
        confirmLabel={t("pages.systemeComptesUtilisateurs.delete.bulkButton", { count: rows.length })}
        onConfirm={() => {
          onConfirm(rows.map((r) => r.id));
          setOpen(false);
        }}
      />
    </>
  );
}

function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: {
  user: DirectoryUser;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (patch: Partial<DirectoryUser>) => void;
}) {
  const t = useTranslations();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [role, setRole] = React.useState<UserRole>(user.role);

  React.useEffect(() => {
    if (open) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [open, user]);

  const save = () => {
    if (!name.trim()) {
      toast.error(t("pages.systemeComptesUtilisateurs.toasts.nameRequired"));
      return;
    }
    onSave({ name: name.trim(), email: email.trim(), role });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pages.systemeComptesUtilisateurs.edit.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t("pages.systemeComptesUtilisateurs.edit.fullName")}</Label>
            <Input value={name} onChange={(e) => setName(toFullNameCase(e.target.value))} placeholder={t("pages.systemeComptesUtilisateurs.edit.fullNamePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.systemeComptesUtilisateurs.edit.email")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.systemeComptesUtilisateurs.edit.role")}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <RoleSelectItems />
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("pages.systemeComptesUtilisateurs.actions.cancel")}</Button>
          <Button onClick={save}>{t("pages.systemeComptesUtilisateurs.actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------- Changement de rôle & rattachement ---------------------- */
const SPECIALIZED_ROLES: { id: UserRole; label: string }[] = [
  { id: "cafop_admin", label: "Admin CAFOP" },
  { id: "etablissements_admin", label: "Admin Établissements" },
  { id: "apfc_admin", label: "Admin APFC" },
];
const STANDARD_ROLES: { id: UserRole; label: string }[] = [
  { id: "chef_etablissement", label: "Chef d'établissement" },
  { id: "inspecteur", label: "Inspecteur Pédagogique" },
  { id: "chef_antenne", label: "Chef d'Antenne Pédagogique" },
  { id: "conseiller_pedagogique", label: "Conseiller Pédagogique" },
  { id: "enseignant", label: "Enseignant" },
  { id: "educateur", label: "Éducateur" },
  { id: "parent", label: "Parent d'élève" },
  { id: "eleve", label: "Élève" },
  { id: "drena", label: "DRENAET" },
  { id: "admin", label: "Administrateur" },
];

function RolePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-center text-sm transition-colors",
        active
          ? "border-ew-green-600 bg-ew-green-50 font-semibold text-ew-green-800"
          : "border-border text-foreground hover:border-ew-green-600/40 hover:bg-muted/40",
      )}
    >
      {label}
    </button>
  );
}

function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: {
  user: DirectoryUser;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (patch: Partial<DirectoryUser>) => void;
}) {
  const t = useTranslations();
  const [role, setRole] = React.useState<UserRole>(user.role);
  const [etab, setEtab] = React.useState(user.etablissement);

  React.useEffect(() => {
    if (open) {
      setRole(user.role);
      setEtab(user.etablissement);
    }
  }, [open, user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-muted text-sm text-foreground">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-left">
              <DialogTitle className="truncate">{user.name}</DialogTitle>
              <DialogDescription className="truncate">{user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            {t("pages.systemeComptesUtilisateurs.changeRole.current")} : <RoleBadge role={user.role} />
          </p>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("pages.systemeComptesUtilisateurs.changeRole.new")}</p>
            <p className="text-xs font-semibold text-ew-orange">{t("pages.systemeComptesUtilisateurs.changeRole.specialized")}</p>
            <div className="grid grid-cols-3 gap-2">
              {SPECIALIZED_ROLES.map((r) => (
                <RolePill key={r.id} label={r.label} active={role === r.id} onClick={() => setRole(r.id)} />
              ))}
            </div>
            <p className="pt-1 text-xs font-semibold text-muted-foreground">{t("pages.systemeComptesUtilisateurs.changeRole.standard")}</p>
            <div className="grid grid-cols-2 gap-2">
              {STANDARD_ROLES.map((r) => (
                <RolePill key={r.id} label={r.label} active={role === r.id} onClick={() => setRole(r.id)} />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("pages.systemeComptesUtilisateurs.changeRole.attachInstitution")}</p>
            <SearchSelect
              items={ETABLISSEMENTS.map((e) => ({ value: e.shortName, label: e.name, sublabel: e.locality }))}
              value={etab}
              onChange={setEtab}
              allowAll
              allValue=""
              allLabel={t("pages.systemeComptesUtilisateurs.changeRole.noAttachment")}
              placeholder={t("pages.systemeComptesUtilisateurs.changeRole.choosePlaceholder")}
              searchPlaceholder={t("pages.systemeComptesUtilisateurs.filters.institutionPlaceholder")}
              emptyText={t("pages.systemeComptesUtilisateurs.changeRole.noInstitutionFound")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("pages.systemeComptesUtilisateurs.actions.cancel")}</Button>
          <Button onClick={() => onSave({ role, etablissement: etab })}>
            <ShieldCheck className="h-4 w-4" /> {t("pages.systemeComptesUtilisateurs.changeRole.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateUserDialog({ onCreate }: { onCreate: (u: Omit<DirectoryUser, "id">) => void }) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("enseignant");
  const [phone, setPhone] = React.useState("");
  const [phoneCountry, setPhoneCountry] = React.useState("CI");
  React.useEffect(() => setPhoneCountry(loadEtabConfig().countryCode ?? "CI"), []);

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("enseignant");
    setPhone("");
  };

  const canSubmit = firstName.trim() && lastName.trim() && /.+@.+\..+/.test(email);

  const submit = () => {
    onCreate({
      name: `${lastName.trim()} ${firstName.trim()}`,
      email: email.trim(),
      role,
      status: "pending",
      etablissement: ETABLISSEMENTS[0].shortName,
      region: ETABLISSEMENTS[0].academicRegionCode,
      phone: phone.trim() || undefined,
      country: phoneCountry,
      createdAt: new Date().toISOString(),
    });
    toast.success(t("pages.systemeComptesUtilisateurs.toasts.userCreated"), { description: t("pages.systemeComptesUtilisateurs.toasts.userCreatedDesc") });
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" /> {t("pages.systemeComptesUtilisateurs.actions.createUser")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pages.systemeComptesUtilisateurs.create.title")}</DialogTitle>
          <DialogDescription>{t("pages.systemeComptesUtilisateurs.create.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t("pages.systemeComptesUtilisateurs.create.firstName")}</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(toPrenomCase(e.target.value))}
              placeholder={t("pages.systemeComptesUtilisateurs.create.firstNamePlaceholder")}
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.systemeComptesUtilisateurs.create.lastName")}</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(toNomCase(e.target.value))}
              className="uppercase placeholder:normal-case"
              placeholder={t("pages.systemeComptesUtilisateurs.create.lastNamePlaceholder")}
              autoComplete="family-name"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>{t("pages.systemeComptesUtilisateurs.edit.email")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>{t("pages.systemeComptesUtilisateurs.create.phone")}</Label>
            <PhoneInput variant="field" countryCode={phoneCountry} value={phone} onChange={setPhone} placeholder={t("pages.systemeComptesUtilisateurs.create.phonePlaceholder")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>{t("pages.systemeComptesUtilisateurs.edit.role")}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <RoleSelectItems />
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("pages.systemeComptesUtilisateurs.actions.cancel")}</Button>
          <Button disabled={!canSubmit} onClick={submit}>
            {t("pages.systemeComptesUtilisateurs.actions.createAccount")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
