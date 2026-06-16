"use client";

import * as React from "react";
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
import { useStore } from "@/components/app-shell/data-store";
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

const columns: ColumnDef<DirectoryUser>[] = [
  {
    accessorKey: "name",
    header: "Utilisateur",
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
  { accessorKey: "role", header: "Rôle", cell: ({ row }) => <RoleBadge role={row.original.role} short /> },
  { accessorKey: "etablissement", header: "Établissement" },
  {
    accessorKey: "country",
    header: "Pays",
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
    header: "Inscrit le (UTC)",
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
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  {
    id: "actions",
    header: () => <span className="block text-right">Actions</span>,
    enableSorting: false,
    cell: ({ row }) => <RowActions user={row.original} />,
  },
];

export default function ComptesUtilisateursPage() {
  const { users, addUser, removeUsers } = useStore();
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
    <ModulePage
      title="Comptes utilisateurs"
      description="Créez, approuvez, modifiez, suspendez, importez et supprimez des comptes. Filtrez par rôle, statut et établissement."
      icon={Users}
      permission="system:manage_users"
      actions={
        <div className="flex gap-2">
          <ImportCsvDialog
            title="Importer des utilisateurs"
            description="Le fichier doit contenir les colonnes attendues. Téléchargez le modèle si besoin."
            expectedColumns={["prenom", "nom", "email", "role", "etablissement"]}
            sampleRow={["Koffi", "Kouamé", "kkouame@eduweb.ci", "enseignant", "Lycée Moderne de Cocody"]}
            templateFilename="modele-utilisateurs.csv"
            trigger={(open) => (
              <Button variant="outline" onClick={open}>
                <UploadCloud className="h-4 w-4" /> Importer CSV
              </Button>
            )}
          />
          <CreateUserDialog onCreate={addUser} />
        </div>
      }
      kpis={[
        { label: "Total comptes", value: counts.total, icon: Users, tone: "green" },
        { label: "Actifs", value: counts.active, icon: Users, tone: "blue" },
        { label: "En attente", value: counts.pending, icon: Users, tone: "gold" },
        { label: "Suspendus", value: counts.suspended, icon: Users, tone: "red" },
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
          allLabel="Tous les rôles"
          searchPlaceholder="Premières lettres du rôle…"
          emptyText="Aucun rôle trouvé"
          className="w-52"
        />
        <FilterSelect
          value={status}
          onValueChange={setStatus}
          options={[
            { value: "all", label: "Tous les statuts" },
            { value: "active", label: "Actif" },
            { value: "pending", label: "En attente" },
            { value: "suspended", label: "Suspendu" },
            { value: "archived", label: "Archivé" },
          ]}
        />
        <CountrySearchSelect value={country} onChange={setCountry} allowAll className="w-52" />
        <SearchSelect
          items={etabs.map((e) => ({ value: e, label: e }))}
          value={etab}
          onChange={setEtab}
          allowAll
          allLabel="Tous les établissements"
          searchPlaceholder="Premières lettres de l'établissement…"
          emptyText="Aucun établissement"
          className="w-56"
        />
        <SearchSelect
          items={[{ value: "manual", label: "Inscription manuelle" }, ...cohortes.map((c) => ({ value: c, label: c }))]}
          value={cohorte}
          onChange={setCohorte}
          allowAll
          allLabel="Toutes les cohortes"
          searchPlaceholder="Premières lettres de la cohorte…"
          emptyText="Aucune cohorte"
          className="w-56"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Rechercher un utilisateur…"
        enableSelection
        getRowId={(u) => u.id}
        bulkActions={(rows, clear) => (
          <BulkDeleteButton
            rows={rows as DirectoryUser[]}
            onConfirm={(ids) => {
              removeUsers(ids);
              toast.success(`${ids.length} utilisateur(s) supprimé(s)`);
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
  const { setUserStatus, updateUser, removeUser } = useStore();
  const [editOpen, setEditOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [roleOpen, setRoleOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-0.5">
        <IconBtn title="Changer le rôle et le rattachement" tone="green" onClick={() => setRoleOpen(true)}>
          <ShieldCheck className="h-4 w-4" />
        </IconBtn>

        <IconBtn title="Aperçu du profil" onClick={() => setPreviewOpen(true)}>
          <Eye className="h-4 w-4" />
        </IconBtn>

        <IconBtn title="Modifier" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
        </IconBtn>

        <IconBtn title="Supprimer" tone="red" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
        </IconBtn>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Plus d'actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user.status === "pending" && (
              <DropdownMenuItem
                onClick={() => {
                  setUserStatus(user.id, "active");
                  toast.success(`${user.name} approuvé`, { description: "Le compte est désormais actif." });
                }}
              >
                <ShieldCheck className="h-4 w-4" /> Approuver le compte
              </DropdownMenuItem>
            )}
            {user.status === "suspended" || user.status === "archived" ? (
              <DropdownMenuItem
                onClick={() => {
                  setUserStatus(user.id, "active");
                  toast.success(`${user.name} réactivé`);
                }}
              >
                <RotateCcw className="h-4 w-4" /> Réactiver
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  setUserStatus(user.id, "suspended");
                  toast.warning(`${user.name} suspendu`);
                }}
              >
                <Ban className="h-4 w-4" /> Suspendre
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                setUserStatus(user.id, "archived");
                toast("Compte archivé", { description: `${user.name} a été archivé (suppression réversible).` });
              }}
            >
              <Archive className="h-4 w-4" /> Archiver
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChangeRoleDialog
        user={user}
        open={roleOpen}
        onOpenChange={setRoleOpen}
        onSave={(patch) => {
          updateUser(user.id, patch);
          toast.success("Rôle mis à jour", {
            description: `${user.name} — ${patch.role ? ROLE_LIST.find((r) => r.id === patch.role)?.label : ""}${patch.etablissement ? ` · ${patch.etablissement}` : ""}.`,
          });
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
          toast.success("Utilisateur modifié");
        }}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cet utilisateur ?"
        description={
          <>
            Le compte <strong>{user.name}</strong> sera définitivement supprimé. Cette action est irréversible.
          </>
        }
        onConfirm={() => {
          removeUser(user.id);
          toast.success("Utilisateur supprimé", { description: `${user.name} a été retiré de la liste.` });
          setDeleteOpen(false);
        }}
      />
    </>
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aperçu du profil</DialogTitle>
          <DialogDescription>Récapitulatif du compte utilisateur.</DialogDescription>
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
            <PreviewRow label="Rôle">
              <RoleBadge role={user.role} />
            </PreviewRow>
            <PreviewRow label="Statut">
              <StatusBadge status={user.status} />
            </PreviewRow>
            <PreviewRow label="Établissement">{user.etablissement}</PreviewRow>
            <PreviewRow label="Région">{user.region}</PreviewRow>
            <PreviewRow label="Identifiant technique">
              <span className="font-mono text-xs">{user.id}</span>
            </PreviewRow>
          </dl>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button onClick={onEdit}>
            <Pencil className="h-4 w-4" /> Modifier
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
  confirmLabel = "Supprimer",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="h-4 w-4" /> {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkDeleteButton({ rows, onConfirm }: { rows: DirectoryUser[]; onConfirm: (ids: string[]) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" /> Supprimer ({rows.length})
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title={`Supprimer ${rows.length} utilisateur${rows.length > 1 ? "s" : ""} ?`}
        description="Les comptes sélectionnés seront définitivement supprimés. Cette action est irréversible."
        confirmLabel={`Supprimer (${rows.length})`}
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
      toast.error("Le nom est requis");
      return;
    }
    onSave({ name: name.trim(), email: email.trim(), role });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nom et prénoms</Label>
            <Input value={name} onChange={(e) => setName(toFullNameCase(e.target.value))} placeholder="KOUASSI Affoué Marie" />
          </div>
          <div className="space-y-1.5">
            <Label>Adresse e-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Rôle</Label>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={save}>Enregistrer</Button>
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
            Rôle actuel : <RoleBadge role={user.role} />
          </p>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nouveau rôle</p>
            <p className="text-xs font-semibold text-ew-orange">Rôles Administrateurs Spécialisés</p>
            <div className="grid grid-cols-3 gap-2">
              {SPECIALIZED_ROLES.map((r) => (
                <RolePill key={r.id} label={r.label} active={role === r.id} onClick={() => setRole(r.id)} />
              ))}
            </div>
            <p className="pt-1 text-xs font-semibold text-muted-foreground">Rôles Standards</p>
            <div className="grid grid-cols-2 gap-2">
              {STANDARD_ROLES.map((r) => (
                <RolePill key={r.id} label={r.label} active={role === r.id} onClick={() => setRole(r.id)} />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Rattacher à un établissement</p>
            <SearchSelect
              items={ETABLISSEMENTS.map((e) => ({ value: e.shortName, label: e.name, sublabel: e.locality }))}
              value={etab}
              onChange={setEtab}
              allowAll
              allValue=""
              allLabel="Aucun rattachement"
              placeholder="Choisir un établissement…"
              searchPlaceholder="Premières lettres de l'établissement…"
              emptyText="Aucun établissement trouvé"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={() => onSave({ role, etablissement: etab })}>
            <ShieldCheck className="h-4 w-4" /> Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateUserDialog({ onCreate }: { onCreate: (u: Omit<DirectoryUser, "id">) => void }) {
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
    toast.success("Utilisateur créé", { description: "Compte ajouté en statut « en attente »." });
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
          <UserPlus className="h-4 w-4" /> Créer un utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un utilisateur</DialogTitle>
          <DialogDescription>Le compte sera créé en statut « en attente » jusqu&apos;à validation.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Prénom</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(toPrenomCase(e.target.value))}
              placeholder="Elogne Guessan"
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(toNomCase(e.target.value))}
              className="uppercase placeholder:normal-case"
              placeholder="ZORO"
              autoComplete="family-name"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Adresse e-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Téléphone</Label>
            <PhoneInput variant="field" countryCode={phoneCountry} value={phone} onChange={setPhone} placeholder="Numéro de téléphone" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Rôle</Label>
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button disabled={!canSubmit} onClick={submit}>
            Créer le compte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
