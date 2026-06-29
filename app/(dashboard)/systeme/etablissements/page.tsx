"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Plus,
  Users,
  GraduationCap,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  UploadCloud,
  FileSpreadsheet,
  Globe,
  Download,
  Save,
  MapPin,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ModulePage } from "@/components/modules/module-page";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import { ExportMenu } from "@/components/layout/export-menu";
import { CountrySearchSelect } from "@/components/forms/country-select";
import { CountryFlag } from "@/components/app-shell/switchers";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { useAcademicRegions } from "@/components/app-shell/use-academic-regions";
import { InstalledEstablishmentsPanel } from "@/components/etablissements/installed-establishments-panel";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { upsertEstablishment, establishmentCodeFromName } from "@/lib/etablissements/etablissements-server";
import { COUNTRIES, type AcademicRegionSeed } from "@/config/countries";
import { getUnCountry } from "@/config/un-countries";
import type { Etablissement } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/utils";

/** Types d'établissement proposés à l'inscription manuelle (capture « Nouvel établissement »). */
const ETAB_TYPES = [
  "Lycée",
  "Collège",
  "École primaire",
  "École maternelle",
  "École secondaire",
  "Institut",
  "Université",
  "Grande Ecole",
  "Centre de formation",
  "Autre",
];
const REGIMES = ["Public", "Privé", "Confessionnel", "Semi-public"];

const CSV_HEADER = "nom;pays;region;localite;type_etab;code_etab;regime;annee_scolaire";
const CSV_SAMPLE = "Lycée Moderne Abidjan;CI;DRENAET Abidjan 1;Cocody;Lycée;ABJ-001;Public;2025-2026";

const columns: ColumnDef<Etablissement>[] = [
  {
    accessorKey: "name",
    header: "Établissement",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-foreground">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.code} · {row.original.locality}
        </p>
      </div>
    ),
  },
  { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge tone="slate">{row.original.type}</Badge> },
  {
    accessorKey: "countryCode",
    header: "Pays",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <CountryFlag code={row.original.countryCode} />
        <span>{getUnCountry(row.original.countryCode)?.name ?? row.original.countryCode}</span>
      </span>
    ),
  },
  { accessorKey: "studentsCount", header: "Effectif", cell: ({ row }) => formatNumber(row.original.studentsCount) },
  { accessorKey: "teachersCount", header: "Enseignants" },
  { accessorKey: "successRate", header: "Réussite", cell: ({ row }) => formatPercent(row.original.successRate) },
  { accessorKey: "subscriptionPlan", header: "Abonnement", cell: ({ row }) => <Badge tone="gold">{row.original.subscriptionPlan}</Badge> },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => <EtabRowActions etab={row.original} />,
  },
];

export default function EtablissementsPage() {
  const t = useTranslations();
  const { country: appCountry } = useApp();
  const { etablissements, addEtablissement, addEtablissements, removeEtablissements } = useStore();
  const [type, setType] = React.useState("all");
  const [country, setCountry] = React.useState("all");
  const types = Array.from(new Set(etablissements.map((e) => e.type)));

  const data = etablissements.filter(
    (e) => (type === "all" || e.type === type) && (country === "all" || e.countryCode === country),
  );
  const totalStudents = etablissements.reduce((s, e) => s + e.studentsCount, 0);
  const countryLabel = country === "all" ? "tous les pays" : getUnCountry(country)?.name ?? country;

  return (
    <ModulePage title={t("pages.systemeEtablissements.title")} description={t("pages.systemeEtablissements.description")}
      icon={Building2}
      permission="system:manage_institutions"
      actions={
        <div className="flex gap-2">
          <ExportMenu
            filename="etablissements"
            buildPayload={() => ({
              title: "Liste des établissements",
              country: appCountry.nameFr,
              author: "EduWeb Planner",
              generatedAt: new Date().toLocaleString("fr-FR"),
              sections: [
                {
                  heading: "Établissements",
                  table: {
                    columns: ["Nom", "Pays", "Type", "Effectif", "Réussite"],
                    rows: data.map((e) => [e.name, e.countryCode, e.type, e.studentsCount, `${e.successRate}%`]),
                  },
                },
              ],
            })}
          />
          <ImportEtabDialog
            onImport={async (list, dest) => {
              // Mode démo : ajout local uniquement.
              if (!isSupabaseConfigured()) {
                addEtablissements(list);
                toast.success(`${list.length} établissement(s) importé(s)`, {
                  description: `Cohorte rattachée à ${getUnCountry(dest)?.name ?? dest}.`,
                });
                return;
              }
              // Mode réel : matérialise chaque ligne en base (UUID référençable),
              // upsert idempotent par (pays, code) → réimport = mise à jour.
              const sb = createClient();
              const withIds: (Omit<Etablissement, "id"> & { id?: string })[] = [];
              let failed = 0;
              for (const e of list) {
                const res = await upsertEstablishment(sb, {
                  countryCode: e.countryCode,
                  code: e.code,
                  name: e.name,
                  regionName: e.academicRegionCode,
                  locality: e.locality,
                  type: e.type,
                  regime: e.regime,
                  schoolYear: e.schoolYear,
                });
                if (res.id) withIds.push({ ...e, id: res.id });
                else failed++;
              }
              if (withIds.length) addEtablissements(withIds);
              if (failed === 0) {
                toast.success(`${withIds.length} établissement(s) importé(s) en ligne`, {
                  description: `Visibles sur tous les postes (${getUnCountry(dest)?.name ?? dest}).`,
                });
              } else {
                toast.warning(`${withIds.length} importé(s), ${failed} échec(s)`, {
                  description: "Vérifiez vos droits (admin) et le format du fichier.",
                });
              }
            }}
          />
          <ManageRegionsDialog />
          <CreateEtablissementDialog
            onCreate={async (e) => {
              // Mode démo : ajout local uniquement.
              if (!isSupabaseConfigured()) {
                addEtablissement(e);
                toast.success("Établissement créé", { description: `${e.name} a été ajouté.` });
                return true;
              }
              // Mode réel : crée une VRAIE ligne Supabase (UUID référençable par
              // profiles.etablissement_id) et porte cet UUID dans le répertoire local.
              const res = await upsertEstablishment(createClient(), {
                countryCode: e.countryCode,
                code: e.code,
                name: e.name,
                regionName: e.academicRegionCode,
                locality: e.locality,
                type: e.type,
                regime: e.regime,
                schoolYear: e.schoolYear,
              });
              if (!res.id) {
                toast.error("Création en ligne impossible", {
                  description: res.error ?? "Droits insuffisants ou problème réseau.",
                });
                return false;
              }
              addEtablissement({ ...e, id: res.id });
              toast.success("Établissement créé", {
                description: `${e.name} — enregistré en ligne (visible sur tous les postes).`,
              });
              return true;
            }}
          />
        </div>
      }
      kpis={[
        { label: "Établissements", value: etablissements.length, icon: Building2, tone: "green" },
        { label: "Effectifs totaux", value: formatNumber(totalStudents), icon: Users, tone: "blue" },
        { label: "Enseignants", value: etablissements.reduce((s, e) => s + e.teachersCount, 0), icon: GraduationCap, tone: "gold" },
        { label: "Réussite moyenne", value: "76,9 %", icon: TrendingUp, tone: "purple", delta: 1.8 },
      ]}
    >
      <div className="mb-4">
        <InstalledEstablishmentsPanel />
      </div>

      <FilterBar>
        <CountrySearchSelect value={country} onChange={setCountry} allowAll className="w-56" />
        <FilterSelect
          value={type}
          onValueChange={setType}
          options={[{ value: "all", label: "Tous les types" }, ...types.map((t) => ({ value: t, label: t }))]}
        />
        <span className="ml-auto text-xs text-muted-foreground">
          {data.length} établissement(s) — {countryLabel}
        </span>
      </FilterBar>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Rechercher un établissement…"
        enableSelection
        getRowId={(e) => e.id}
        bulkActions={(rows, clear) => (
          <BulkDeleteEtabs
            rows={rows as Etablissement[]}
            onConfirm={(ids) => {
              removeEtablissements(ids);
              toast.success(`${ids.length} établissement(s) supprimé(s)`);
              clear();
            }}
          />
        )}
      />
    </ModulePage>
  );
}

/* ------------------------------ Actions par ligne ------------------------------ */
function EtabRowActions({ etab }: { etab: Etablissement }) {
  const { updateEtablissement, removeEtablissement } = useStore();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => toast.info(`Fiche : ${etab.name}`)}>
            <Eye className="h-4 w-4" /> Consulter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditEtabDialog
        etab={etab}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(patch) => {
          updateEtablissement(etab.id, patch);
          toast.success("Établissement modifié");
        }}
      />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet établissement ?</DialogTitle>
            <DialogDescription>
              <strong>{etab.name}</strong> sera définitivement retiré de la liste. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                removeEtablissement(etab.id);
                toast.success("Établissement supprimé", { description: etab.name });
                setDeleteOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4" /> Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------------------------- Suppression collective ---------------------------- */
function BulkDeleteEtabs({ rows, onConfirm }: { rows: Etablissement[]; onConfirm: (ids: string[]) => void }) {
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer {rows.length} établissement(s) ?</DialogTitle>
            <DialogDescription>
              Les établissements sélectionnés seront définitivement supprimés. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm(rows.map((r) => r.id));
                setOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4" /> Supprimer ({rows.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------- Import par cohorte (CSV) ------------------------- */
function buildTemplate(code: string): string {
  const regions = COUNTRIES.find((c) => c.code === code)?.academicRegions;
  const rows = regions?.length
    ? regions
        .slice(0, 5)
        .map(
          (r, i) =>
            `Établissement exemple ${i + 1};${code};${r.name};Localité;Lycée;${r.code}-00${i + 1};Public;2025-2026`,
        )
    : [
        `Établissement exemple 1;${code};Région académique 1;Localité;Lycée;${code}-001;Public;2025-2026`,
        `Établissement exemple 2;${code};Région académique 2;Localité;Collège;${code}-002;Public;2025-2026`,
      ];
  return `${CSV_HEADER}\n${rows.join("\n")}`;
}

function ImportEtabDialog({
  onImport,
}: {
  onImport: (list: Omit<Etablissement, "id">[], destCountry: string) => void | Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [dest, setDest] = React.useState("");
  const [templateCountry, setTemplateCountry] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parsed, setParsed] = React.useState<string[][]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setDest("");
    setTemplateCountry("");
    setFileName(null);
    setParsed([]);
  };

  const downloadTemplate = () => {
    if (!templateCountry) {
      toast.error("Sélectionnez un pays pour le modèle");
      return;
    }
    const csv = String.fromCharCode(0xfeff) + buildTemplate(templateCountry);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `modele-etablissements-${templateCountry.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Modèle téléchargé", { description: `Pré-rempli avec les régions de ${getUnCountry(templateCountry)?.name ?? templateCountry}.` });
  };

  const onFile = async (file: File) => {
    const text = await file.text();
    const lines = text
      .replace(/^﻿/, "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const rows = lines
      .filter((l) => !l.toLowerCase().startsWith("nom;"))
      .map((l) => l.split(";").map((c) => c.trim()));
    if (rows.length === 0) {
      toast.error("Fichier vide ou illisible");
      return;
    }
    setFileName(file.name);
    setParsed(rows);
  };

  const doImport = () => {
    if (!dest) {
      toast.error("Sélectionnez le pays de destination");
      return;
    }
    if (parsed.length === 0) {
      toast.error("Déposez d'abord un fichier CSV");
      return;
    }
    const list: Omit<Etablissement, "id">[] = parsed.map((r, i) => {
      const [nom, , region, localite, typeEtab, codeEtab, regime, annee] = r;
      const fallbackName = nom || `Établissement ${i + 1}`;
      return {
        // Code DÉTERMINISTE (saisi ou dérivé du nom) → réimport = mise à jour, pas de doublon.
        code: codeEtab ? codeEtab.toUpperCase() : establishmentCodeFromName(fallbackName),
        name: fallbackName,
        shortName: (nom || `Étab. ${i + 1}`).split(/\s+/).slice(0, 2).join(" "),
        type: typeEtab || "Autre",
        countryCode: dest,
        academicRegionCode: region || "",
        locality: localite || "—",
        status: "active" as const,
        studentsCount: 0,
        teachersCount: 0,
        classesCount: 0,
        attendanceRate: 0,
        successRate: 0,
        subscriptionPlan: "Standard",
        regime: regime || undefined,
        schoolYear: annee || undefined,
      };
    });
    onImport(list, dest);
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
        <Button variant="outline">
          <UploadCloud className="h-4 w-4" /> Importer CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ew-green-100 text-ew-green-700">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div className="text-left">
              <DialogTitle>Importer des établissements</DialogTitle>
              <DialogDescription>Téléversez un fichier CSV</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pays de destination */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
            <p className="flex items-center gap-1.5 text-sm font-bold text-blue-800">
              <Globe className="h-4 w-4" /> Pays de destination
            </p>
            <p className="mb-2 text-xs text-blue-700">Sélectionnez le pays pour tous les établissements de ce fichier.</p>
            <CountrySearchSelect value={dest} onChange={setDest} placeholder="Sélectionner un pays…" />
          </div>

          {/* Modèle CSV */}
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <FileSpreadsheet className="h-4 w-4 text-ew-green-700" /> Modèle CSV
            </p>
            <p className="mb-2 text-xs text-muted-foreground">
              Sélectionnez un pays pour obtenir un modèle pré-rempli avec ses régions académiques.
            </p>
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Pays (193 États membres de l&apos;ONU)</Label>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <CountrySearchSelect value={templateCountry} onChange={setTemplateCountry} placeholder="Rechercher un pays…" className="min-w-[220px] flex-1" />
              <Button variant="secondary" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4" /> Télécharger
              </Button>
            </div>
          </div>

          {/* Zone de dépôt */}
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 text-center transition-colors hover:border-ew-green-600 hover:bg-ew-green-50/40"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UploadCloud className="h-6 w-6" />
            </span>
            {fileName ? (
              <>
                <span className="font-semibold text-ew-green-700">{fileName}</span>
                <span className="text-xs text-muted-foreground">{parsed.length} établissement(s) détecté(s) — cliquez pour changer de fichier</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">Glissez-déposez votre fichier CSV ici</span>
                <span className="text-xs text-muted-foreground">ou cliquez pour sélectionner un fichier</span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
          </label>

          {/* Format attendu */}
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-bold text-foreground">Format attendu :</p>
            <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{CSV_HEADER}</p>
            <p className="break-all font-mono text-[11px] text-muted-foreground">{CSV_SAMPLE}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button disabled={!dest || parsed.length === 0} onClick={doImport}>
            <UploadCloud className="h-4 w-4" /> Importer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------- Inscription manuelle (Nouvel établissement) ----------------------- */
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
      {children} {required && <span className="text-red-500">*</span>}
    </Label>
  );
}

function CreateEtablissementDialog({
  onCreate,
}: {
  onCreate: (e: Omit<Etablissement, "id">) => boolean | void | Promise<boolean | void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [locality, setLocality] = React.useState("");
  const [type, setType] = React.useState("École maternelle");
  const [regime, setRegime] = React.useState("");
  const [code, setCode] = React.useState("");
  const [schoolYear, setSchoolYear] = React.useState("2026-2027");

  const reset = () => {
    setName("");
    setCountryCode("");
    setRegion("");
    setLocality("");
    setType("École maternelle");
    setRegime("");
    setCode("");
    setSchoolYear("2026-2027");
  };

  const canSubmit = name.trim().length > 1 && countryCode.length === 2;

  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    setSaving(true);
    const ok = await onCreate({
      // Code DÉTERMINISTE : saisi (normalisé) ou dérivé du nom (règle trigger 020) —
      // jamais d'horodatage, pour que l'upsert (pays,code) fusionne au lieu de doublonner.
      code: code.trim() ? code.trim().toUpperCase() : establishmentCodeFromName(name.trim()),
      name: name.trim(),
      shortName: name.trim().split(/\s+/).slice(0, 2).join(" "),
      type,
      countryCode,
      academicRegionCode: region.trim(),
      locality: locality.trim() || "—",
      status: "active",
      studentsCount: 0,
      teachersCount: 0,
      classesCount: 0,
      attendanceRate: 0,
      successRate: 0,
      subscriptionPlan: "Standard",
      regime: regime || undefined,
      schoolYear,
    });
    setSaving(false);
    // Échec serveur (ok === false) → on garde le formulaire ouvert pour réessayer.
    if (ok === false) return;
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
          <Plus className="h-4 w-4" /> Nouvel établissement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ew-green-100 text-ew-green-700">
              <Building2 className="h-5 w-5" />
            </span>
            <DialogTitle>Nouvel établissement</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <FieldLabel required>Nom de l&apos;établissement</FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Lycée Moderne d'Abidjan" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel required>Pays</FieldLabel>
            <CountrySearchSelect value={countryCode} onChange={setCountryCode} placeholder="Sélectionner un pays…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FieldLabel>Région académique</FieldLabel>
              <RegionPicker countryCode={countryCode} value={region} onChange={setRegion} placeholder="Région / wilaya…" />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Localité</FieldLabel>
              <Input value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="Ex : Cocody" />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Type d&apos;établissement</FieldLabel>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ETAB_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Régime</FieldLabel>
              <Select value={regime} onValueChange={setRegime}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Sélectionner --" />
                </SelectTrigger>
                <SelectContent>
                  {REGIMES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Code établissement</FieldLabel>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex : ABJ-0042" />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Année scolaire</FieldLabel>
              <Input value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button disabled={!canSubmit || saving} onClick={() => void submit()}>
            <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : "Créer l'établissement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- Modifier --------------------------------- */
function EditEtabDialog({
  etab,
  open,
  onOpenChange,
  onSave,
}: {
  etab: Etablissement;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (patch: Partial<Etablissement>) => void;
}) {
  const [name, setName] = React.useState(etab.name);
  const [type, setType] = React.useState(etab.type);
  const [locality, setLocality] = React.useState(etab.locality);
  const [region, setRegion] = React.useState(etab.academicRegionCode);
  const [status, setStatus] = React.useState(etab.status);

  React.useEffect(() => {
    if (open) {
      setName(etab.name);
      setType(etab.type);
      setLocality(etab.locality);
      setRegion(etab.academicRegionCode);
      setStatus(etab.status);
    }
  }, [open, etab]);

  const save = () => {
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    onSave({
      name: name.trim(),
      type,
      locality: locality.trim(),
      academicRegionCode: region.trim(),
      status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l&apos;établissement</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...new Set([etab.type, ...ETAB_TYPES])].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Etablissement["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Localité</Label>
            <Input value={locality} onChange={(e) => setLocality(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Région académique (réaffectation)</Label>
            <RegionPicker
              countryCode={etab.countryCode}
              value={region}
              onChange={setRegion}
              placeholder="Région / wilaya…"
            />
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

/* ----------------------- Sélecteur de région (wilaya / DREN / DRENA) ----------------------- */
function RegionPicker({
  countryCode,
  value,
  onChange,
  placeholder = "Région…",
}: {
  countryCode: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const regions = useAcademicRegions(countryCode || "");
  const names = regions.map((r) => r.name);
  const [freeMode, setFreeMode] = React.useState(false);

  if (!countryCode) {
    return <Input value={value} disabled placeholder="Choisissez d'abord un pays" />;
  }
  if (regions.length === 0 || freeMode) {
    return (
      <div className="flex items-center gap-1.5">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        {regions.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setFreeMode(false)}>
            Liste
          </Button>
        )}
      </div>
    );
  }
  return (
    <Select
      value={names.includes(value) ? value : ""}
      onValueChange={(v) => {
        if (v === "__free__") {
          setFreeMode(true);
          onChange("");
        } else onChange(v);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {regions.map((r) => (
          <SelectItem key={r.code} value={r.name}>
            {r.name}
          </SelectItem>
        ))}
        <SelectItem value="__free__">✎ Saisie libre…</SelectItem>
      </SelectContent>
    </Select>
  );
}

/* ----------------------- Gérer les régions (wilayas / DREN) ----------------------- */
function slugRegionCode(name: string): string {
  return (
    (name || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4) || "REG"
  );
}

function ManageRegionsDialog() {
  const { country } = useApp();
  const regions = useAcademicRegions(country.code);
  const { setCountryRegions } = useStore();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AcademicRegionSeed[]>(regions);

  React.useEffect(() => {
    if (open) setDraft(regions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const rename = (i: number, name: string) =>
    setDraft((d) => d.map((r, idx) => (idx === i ? { ...r, name } : r)));
  const remove = (i: number) => setDraft((d) => d.filter((_, idx) => idx !== i));
  const add = () => setDraft((d) => [...d, { code: "", name: "" }]);

  const save = () => {
    const seen = new Set<string>();
    const final = draft
      .map((r) => ({ name: r.name.trim(), code: (r.code || slugRegionCode(r.name)).toUpperCase() }))
      .filter((r) => r.name.length > 0)
      .map((r) => {
        let code = r.code || slugRegionCode(r.name);
        while (seen.has(code)) code = `${code}1`;
        seen.add(code);
        return { code, name: r.name };
      });
    setCountryRegions(country.code, final);
    toast.success("Régions enregistrées", {
      description: `${final.length} région(s) pour ${country.nameFr}.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MapPin className="h-4 w-4" /> Gérer les régions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Régions académiques — {country.nameFr}</DialogTitle>
          <DialogDescription>
            Ajoutez, renommez ou supprimez les régions ({country.academicRegionLabel}). Elles
            alimentent le sélecteur de région et l&apos;affectation des établissements.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {draft.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={r.name}
                onChange={(e) => rename(i, e.target.value)}
                placeholder="Nom de la région"
              />
              <button
                type="button"
                aria-label="Supprimer la région"
                onClick={() => remove(i)}
                className="shrink-0 rounded p-1.5 text-red-500 transition-colors hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {draft.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune région — ajoutez-en une.</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="mt-2 w-fit" onClick={add}>
          <Plus className="h-4 w-4" /> Ajouter une région
        </Button>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={save}>
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
