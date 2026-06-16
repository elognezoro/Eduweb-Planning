"use client";

import * as React from "react";
import {
  Network,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  ChevronDown,
  UploadCloud,
  Search,
  Trash2,
  Globe,
  Building2,
  Phone,
  UserRound,
  Users,
  Activity,
  Layers,
  Download,
  Save,
  Eye,
  Pencil,
  CalendarDays,
  Lock,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { ForbiddenState } from "@/components/layout/states";
import { SectionCard } from "@/components/modules/module-page";
import { SectionNav, FloatingSectionNav, type SectionItem } from "@/components/layout/section-nav";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CountrySearchSelect } from "@/components/forms/country-select";
import { CountryFlag } from "@/components/app-shell/switchers";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { COUNTRIES } from "@/config/countries";
import { getUnCountry } from "@/config/un-countries";
import type { Apfc, ApfcActivity } from "@/lib/types";
import { APFC_PERIODS, APFC_ACTIVITY_TYPES } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

/* APFC est une structure autonome : aucun couplage avec les CAFOP ni la Vie scolaire. */
const GREEN_BTN = "bg-ew-green-700 text-white hover:bg-ew-green-800";
const CSV_HEADER = "nom;code;pays;region;localite;adresse;telephone;email;responsable;contact_responsable";

const GESTION_SECTIONS: SectionItem[] = [
  { id: "indicateurs", label: "Indicateurs" },
  { id: "antennes", label: "Antennes APFC" },
];

export default function ApfcPage() {
  const { can } = useApp();
  const { apfcs, apfcActivities, addApfc, addApfcs, updateApfc, removeApfc, removeApfcs, addApfcActivity, removeApfcActivity } = useStore();
  const [query, setQuery] = React.useState("");
  const [country, setCountry] = React.useState("all");
  const [period, setPeriod] = React.useState("all");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [templateOpen, setTemplateOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [newOpen, setNewOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Apfc | null>(null);
  const [consulting, setConsulting] = React.useState<Apfc | null>(null);

  if (!can("system:manage_apfc")) return <ForbiddenState />;

  // Compteur d'activités calculé à partir des enregistrements, filtré par période.
  const countActivities = (apfcId: string) =>
    apfcActivities.filter((a) => a.apfcId === apfcId && (period === "all" || a.schoolYear === period)).length;

  const q = query.trim().toLowerCase();
  const filtered = apfcs.filter(
    (a) =>
      (country === "all" || a.country === country) &&
      (!q || `${a.name} ${a.code} ${a.region} ${a.locality} ${a.responsable} ${getUnCountry(a.country)?.name ?? ""}`.toLowerCase().includes(q)),
  );
  const countryLabel = country === "all" ? "tous les pays" : getUnCountry(country)?.name ?? country;
  const allChecked = filtered.length > 0 && filtered.every((a) => selected.has(a.id));
  const someChecked = filtered.some((a) => selected.has(a.id));

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) filtered.forEach((a) => next.delete(a.id));
      else filtered.forEach((a) => next.add(a.id));
      return next;
    });
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedInView = filtered.filter((a) => selected.has(a.id));
  const bulkDelete = () => {
    const ids = selectedInView.map((a) => a.id);
    removeApfcs(ids);
    setSelected(new Set());
    toast.success(`${ids.length} APFC supprimée(s)`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête « Gestion des APFC » */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ew-green-100 text-ew-green-700 shadow-sm">
            <Network className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Gestion des APFC</h1>
            <p className="text-sm text-muted-foreground">
              {`${apfcs.length} APFC enregistrées — Antennes de la Pédagogie et de la Formation Continue`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast.success("Liste actualisée", { description: `${apfcs.length} APFC chargées.` })}>
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
          <Button variant="outline" onClick={() => setTemplateOpen(true)}>
            <FileSpreadsheet className="h-4 w-4" /> Modèle CSV <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <UploadCloud className="h-4 w-4" /> Importer CSV
          </Button>
          <Button className={GREEN_BTN} onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4" /> Nouvelle APFC
          </Button>
        </div>
      </div>

      <SectionNav sections={GESTION_SECTIONS} />
      <FloatingSectionNav sections={GESTION_SECTIONS} />

      {/* Indicateurs */}
      <div id="indicateurs" className="grid scroll-mt-24 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Antennes APFC" value={filtered.length} icon={Network} tone="green" />
        <KpiCard label="Sous-antennes" value={filtered.reduce((s, a) => s + a.antennes, 0)} icon={Layers} tone="blue" />
        <KpiCard label="Coordonnateurs" value={filtered.reduce((s, a) => s + a.coordonnateurs, 0)} icon={Users} tone="gold" />
        <KpiCard label="Activités" value={filtered.reduce((s, a) => s + countActivities(a.id), 0)} icon={Activity} tone="purple" />
      </div>

      {/* Barre « Tout sélectionner » + filtre pays */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = !allChecked && someChecked;
            }}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-border accent-ew-green-700"
          />
          Tout sélectionner ({filtered.length} APFC — {countryLabel})
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {selectedInView.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={bulkDelete}
            >
              <Trash2 className="h-4 w-4" /> Supprimer ({selectedInView.length})
            </Button>
          )}
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-48">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les périodes</SelectItem>
              {APFC_PERIODS.map((p) => (
                <SelectItem key={p} value={p}>Année {p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CountrySearchSelect value={country} onChange={setCountry} allowAll className="w-56" />
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom, pays, région, localité…"
          className="h-12 rounded-xl pl-12 text-base"
        />
      </div>

      {/* Liste des APFC */}
      <SectionCard id="antennes" title={`Antennes APFC (${filtered.length})`} contentClassName="p-0">
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Aucune APFC ne correspond à votre recherche.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((a) => (
              <li
                key={a.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 px-4 py-3 transition-colors sm:px-5",
                  selected.has(a.id) ? "bg-ew-green-50/40" : "hover:bg-muted/30",
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(a.id)}
                  onChange={() => toggleOne(a.id)}
                  className="h-4 w-4 shrink-0 rounded border-border accent-ew-green-700"
                  aria-label={`Sélectionner ${a.name}`}
                />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ew-green-100 text-ew-green-700">
                  <Network className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.code} · {a.region} · {a.locality}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{a.responsable}</p>
                </div>
                <span className="hidden shrink-0 items-center gap-2 sm:flex">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CountryFlag code={a.country} /> {getUnCountry(a.country)?.name ?? a.country}
                  </span>
                  <Badge tone="blue">{a.antennes} antennes</Badge>
                  <Badge tone="gold">{a.coordonnateurs} coord.</Badge>
                  <Badge tone="green">{countActivities(a.id)} activités</Badge>
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setConsulting(a)} aria-label={`Consulter ${a.name}`}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditing(a)} aria-label={`Modifier ${a.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => {
                      removeApfc(a.id);
                      setSelected((prev) => {
                        const next = new Set(prev);
                        next.delete(a.id);
                        return next;
                      });
                      toast.success("APFC supprimée", { description: a.name });
                    }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    aria-label={`Supprimer ${a.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {templateOpen && <TemplateApfcDialog onClose={() => setTemplateOpen(false)} />}
      {importOpen && (
        <ImportApfcDialog
          onClose={() => setImportOpen(false)}
          onImport={(list, dest) => {
            addApfcs(list);
            setImportOpen(false);
            toast.success(`${list.length} APFC importée(s)`, { description: `Rattachées à ${getUnCountry(dest)?.name ?? dest}.` });
          }}
        />
      )}
      {newOpen && (
        <NewApfcDialog
          onClose={() => setNewOpen(false)}
          onCreate={(a) => {
            addApfc(a);
            setNewOpen(false);
            toast.success("APFC créée", { description: a.name });
          }}
        />
      )}
      {editing && (
        <EditApfcDialog
          apfc={editing}
          activitesCount={countActivities(editing.id)}
          period={period}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateApfc(editing.id, patch);
            setEditing(null);
            toast.success("APFC modifiée", { description: patch.name ?? editing.name });
          }}
        />
      )}
      {consulting && (
        <ApfcActivitiesDialog
          apfc={consulting}
          activities={apfcActivities.filter((a) => a.apfcId === consulting.id)}
          onAdd={(act) => addApfcActivity({ ...act, apfcId: consulting.id })}
          onRemove={removeApfcActivity}
          onClose={() => setConsulting(null)}
        />
      )}
    </div>
  );
}

/* ------------------------- Modèle CSV (un modèle par pays) ------------------------- */
function buildTemplate(code: string): string {
  const regions = COUNTRIES.find((c) => c.code === code)?.academicRegions;
  const rows = (regions?.length ? regions.slice(0, 3).map((r) => r.name) : ["Région académique 1", "Région académique 2"]).map(
    (regionName, i) =>
      `APFC exemple ${i + 1};APFC-${code}-00${i + 1};${code};${regionName};Localité;BP ${200 + i};27 35 91 35 0${i};apfc${i + 1}@formation.org;M. KOUASSI Jean;07 00 00 00 0${i}`,
  );
  return `${CSV_HEADER}\n${rows.join("\n")}`;
}

function TemplateApfcDialog({ onClose }: { onClose: () => void }) {
  const [country, setCountry] = React.useState("");
  const download = () => {
    if (!country) {
      toast.error("Sélectionnez un pays");
      return;
    }
    const blob = new Blob([String.fromCharCode(0xfeff) + buildTemplate(country)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `modele-apfc-${country.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Modèle téléchargé", { description: `Modèle APFC — ${getUnCountry(country)?.name ?? country}.` });
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-ew-green-700" /> Modèle CSV par pays
          </DialogTitle>
          <DialogDescription>
            Chaque pays dispose de son modèle, pré-rempli avec ses régions académiques lorsque disponibles.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Pays (193 États membres de l&apos;ONU)</Label>
            <CountrySearchSelect value={country} onChange={setCountry} placeholder="Rechercher un pays…" />
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-bold text-foreground">Colonnes du modèle :</p>
            <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{CSV_HEADER}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button className={GREEN_BTN} onClick={download}>
            <Download className="h-4 w-4" /> Télécharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- Import CSV (par pays) ------------------------------- */
function ImportApfcDialog({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (list: Omit<Apfc, "id">[], dest: string) => void;
}) {
  const [dest, setDest] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parsed, setParsed] = React.useState<string[][]>([]);

  const onFile = async (file: File) => {
    const text = await file.text();
    const rows = text
      .replace(/^﻿/, "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !l.toLowerCase().startsWith("nom;"))
      .map((l) => l.split(";").map((c) => c.trim()));
    if (!rows.length) {
      toast.error("Fichier vide ou illisible");
      return;
    }
    setFileName(file.name);
    setParsed(rows);
  };

  const doImport = () => {
    if (!dest) return toast.error("Sélectionnez le pays de destination");
    if (!parsed.length) return toast.error("Déposez d'abord un fichier CSV");
    const list: Omit<Apfc, "id">[] = parsed.map((r, i) => {
      const [nom, code, , region, localite, adresse, tel, email, responsable, contact] = r;
      return {
        name: nom || `APFC ${i + 1}`,
        code: (code || `APFC-${dest}-${String(i + 1).padStart(3, "0")}`).toUpperCase(),
        country: dest,
        region: region || "",
        locality: localite || "—",
        address: adresse || "",
        phone: tel || "",
        email: email || "",
        responsable: responsable || "",
        responsableContact: contact || "",
        antennes: 0,
        coordonnateurs: 0,
      };
    });
    onImport(list, dest);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-ew-green-700" /> Importer des APFC
          </DialogTitle>
          <DialogDescription>Téléversez un fichier CSV (un même pays par fichier).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
            <p className="flex items-center gap-1.5 text-sm font-bold text-blue-800">
              <Globe className="h-4 w-4" /> Pays de destination
            </p>
            <p className="mb-2 text-xs text-blue-700">Sélectionnez le pays pour toutes les APFC de ce fichier.</p>
            <CountrySearchSelect value={dest} onChange={setDest} placeholder="Sélectionner un pays…" />
          </div>
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
                <span className="text-xs text-muted-foreground">{parsed.length} APFC détectée(s) — cliquez pour changer</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">Glissez-déposez votre fichier CSV ici</span>
                <span className="text-xs text-muted-foreground">ou cliquez pour sélectionner un fichier</span>
              </>
            )}
            <input
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
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-bold text-foreground">Format attendu :</p>
            <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{CSV_HEADER}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button className={GREEN_BTN} disabled={!dest || parsed.length === 0} onClick={doImport}>
            <UploadCloud className="h-4 w-4" /> Importer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Nouvelle APFC ----------------------------- */
function SectionTitle({ icon: Icon, children }: { icon: typeof Building2; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 border-b border-border pb-1.5 text-sm font-bold text-foreground">
      <Icon className="h-4 w-4 text-ew-green-700" /> {children}
    </p>
  );
}

function NewApfcDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Omit<Apfc, "id">) => void }) {
  const [f, setF] = React.useState({
    name: "",
    code: "",
    country: "",
    region: "",
    locality: "",
    address: "",
    phone: "",
    email: "",
    responsable: "",
    responsableContact: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const canSubmit = f.name.trim().length > 1 && f.country.length === 2;

  const submit = () =>
    onCreate({
      ...f,
      name: f.name.trim(),
      code: (f.code.trim() || `APFC-${f.country}-${Date.now().toString(36).slice(-3).toUpperCase()}`).toUpperCase(),
      antennes: 0,
      coordonnateurs: 0,
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle APFC</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Informations générales */}
          <div className="space-y-3">
            <SectionTitle icon={Building2}>Informations générales</SectionTitle>
            <div className="space-y-1.5">
              <Label>Nom de l&apos;APFC <span className="text-red-500">*</span></Label>
              <Input value={f.name} onChange={set("name")} placeholder="Ex : APFC d'Abidjan 1" />
            </div>
            <div className="space-y-1.5">
              <Label>Code APFC</Label>
              <Input value={f.code} onChange={set("code")} placeholder="Ex : APFC-ABJ-001" />
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-3">
            <SectionTitle icon={Globe}>Localisation</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Pays <span className="text-red-500">*</span></Label>
                <CountrySearchSelect value={f.country} onChange={(v) => setF((p) => ({ ...p, country: v }))} placeholder="Sélectionner un pays" />
              </div>
              <div className="space-y-1.5">
                <Label>Région / DRENA</Label>
                <Input value={f.region} onChange={set("region")} placeholder="Ex : DRENA Abidjan 1" />
              </div>
              <div className="space-y-1.5">
                <Label>Localité</Label>
                <Input value={f.locality} onChange={set("locality")} placeholder="Ex : Cocody" />
              </div>
              <div className="space-y-1.5">
                <Label>Adresse</Label>
                <Input value={f.address} onChange={set("address")} placeholder="Ex : BP 221" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <SectionTitle icon={Phone}>Contact</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <Input value={f.phone} onChange={set("phone")} placeholder="Ex : 27 35 91 35 02" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={f.email} onChange={set("email")} placeholder="Ex : apfc.abidjan@formation.ci" />
              </div>
            </div>
          </div>

          {/* Responsable */}
          <div className="space-y-3">
            <SectionTitle icon={UserRound}>Responsable d&apos;antenne</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nom du responsable</Label>
                <Input value={f.responsable} onChange={set("responsable")} placeholder="Ex : M. BAMBA Issouf" />
              </div>
              <div className="space-y-1.5">
                <Label>Contact du responsable</Label>
                <Input value={f.responsableContact} onChange={set("responsableContact")} placeholder="Ex : 07 00 00 00 00" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button className={GREEN_BTN} disabled={!canSubmit} onClick={submit}>
            <Save className="h-4 w-4" /> Créer l&apos;APFC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Modifier une APFC ----------------------------- */
function EditApfcDialog({
  apfc,
  activitesCount,
  period,
  onClose,
  onSave,
}: {
  apfc: Apfc;
  activitesCount: number;
  period: string;
  onClose: () => void;
  onSave: (patch: Partial<Apfc>) => void;
}) {
  const [f, setF] = React.useState({
    name: apfc.name,
    code: apfc.code,
    country: apfc.country,
    region: apfc.region,
    locality: apfc.locality,
    address: apfc.address,
    phone: apfc.phone,
    email: apfc.email,
    responsable: apfc.responsable,
    responsableContact: apfc.responsableContact,
    antennes: String(apfc.antennes),
    coordonnateurs: String(apfc.coordonnateurs),
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const canSubmit = f.name.trim().length > 1 && f.country.length === 2;

  const submit = () =>
    onSave({
      name: f.name.trim(),
      code: (f.code.trim() || apfc.code).toUpperCase(),
      country: f.country,
      region: f.region.trim(),
      locality: f.locality.trim() || "—",
      address: f.address.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      responsable: f.responsable.trim(),
      responsableContact: f.responsableContact.trim(),
      antennes: Math.max(0, Number(f.antennes) || 0),
      coordonnateurs: Math.max(0, Number(f.coordonnateurs) || 0),
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;APFC</DialogTitle>
          <DialogDescription>{apfc.code}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Informations générales */}
          <div className="space-y-3">
            <SectionTitle icon={Building2}>Informations générales</SectionTitle>
            <div className="space-y-1.5">
              <Label>Nom de l&apos;APFC <span className="text-red-500">*</span></Label>
              <Input value={f.name} onChange={set("name")} placeholder="Ex : APFC d'Abidjan 1" />
            </div>
            <div className="space-y-1.5">
              <Label>Code APFC</Label>
              <Input value={f.code} onChange={set("code")} placeholder="Ex : APFC-ABJ-001" />
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-3">
            <SectionTitle icon={Globe}>Localisation</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Pays <span className="text-red-500">*</span></Label>
                <CountrySearchSelect value={f.country} onChange={(v) => setF((p) => ({ ...p, country: v }))} placeholder="Sélectionner un pays" />
              </div>
              <div className="space-y-1.5">
                <Label>Région / DRENA</Label>
                <Input value={f.region} onChange={set("region")} placeholder="Ex : DRENA Abidjan 1" />
              </div>
              <div className="space-y-1.5">
                <Label>Localité</Label>
                <Input value={f.locality} onChange={set("locality")} placeholder="Ex : Cocody" />
              </div>
              <div className="space-y-1.5">
                <Label>Adresse</Label>
                <Input value={f.address} onChange={set("address")} placeholder="Ex : BP 221" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <SectionTitle icon={Phone}>Contact</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <Input value={f.phone} onChange={set("phone")} placeholder="Ex : 27 35 91 35 02" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={f.email} onChange={set("email")} placeholder="Ex : apfc.abidjan@formation.ci" />
              </div>
            </div>
          </div>

          {/* Responsable */}
          <div className="space-y-3">
            <SectionTitle icon={UserRound}>Responsable d&apos;antenne</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nom du responsable</Label>
                <Input value={f.responsable} onChange={set("responsable")} placeholder="Ex : M. BAMBA Issouf" />
              </div>
              <div className="space-y-1.5">
                <Label>Contact du responsable</Label>
                <Input value={f.responsableContact} onChange={set("responsableContact")} placeholder="Ex : 07 00 00 00 00" />
              </div>
            </div>
          </div>

          {/* Indicateurs */}
          <div className="space-y-3">
            <SectionTitle icon={Activity}>Indicateurs</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Sous-antennes</Label>
                <Input type="number" min={0} value={f.antennes} onChange={set("antennes")} />
              </div>
              <div className="space-y-1.5">
                <Label>Coordonnateurs</Label>
                <Input type="number" min={0} value={f.coordonnateurs} onChange={set("coordonnateurs")} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-muted-foreground" /> Activités
                </Label>
                <div className="flex h-10 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm font-semibold text-foreground">
                  {activitesCount}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Le nombre d&apos;activités est calculé automatiquement à partir des enregistrements de l&apos;antenne
              {period === "all" ? " (toutes périodes)" : ` (année ${period})`}. Gérez-les via l&apos;icône «&nbsp;Consulter&nbsp;» de la liste.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button className={GREEN_BTN} disabled={!canSubmit} onClick={submit}>
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------- Activités de l'antenne (sous-module : le compteur en dérive) --------- */
function schoolYearOf(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1; // 1…12
  return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function ApfcActivitiesDialog({
  apfc,
  activities,
  onAdd,
  onRemove,
  onClose,
}: {
  apfc: Apfc;
  activities: ApfcActivity[];
  onAdd: (a: Omit<ApfcActivity, "id" | "apfcId">) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const [period, setPeriod] = React.useState("all");
  const [date, setDate] = React.useState("");
  const [type, setType] = React.useState(APFC_ACTIVITY_TYPES[0]);
  const [title, setTitle] = React.useState("");

  const visible = activities
    .filter((a) => period === "all" || a.schoolYear === period)
    .sort((a, b) => b.date.localeCompare(a.date));

  const add = () => {
    if (!date || !title.trim()) {
      toast.error("Renseignez la date et l'intitulé");
      return;
    }
    onAdd({ date, schoolYear: schoolYearOf(date), type, title: title.trim() });
    toast.success("Activité ajoutée", { description: `${type} — ${title.trim()}` });
    setTitle("");
    setDate("");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div className="text-left">
              <DialogTitle>Activités — {apfc.name}</DialogTitle>
              <DialogDescription>{apfc.code} · {apfc.region}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Filtre période + total calculé */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-48">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les périodes</SelectItem>
              {APFC_PERIODS.map((p) => (
                <SelectItem key={p} value={p}>Année {p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge tone="green">{visible.length} activité(s)</Badge>
        </div>

        {/* Liste des activités */}
        <div className="rounded-xl border border-border">
          {visible.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Aucune activité enregistrée pour cette période.
            </p>
          ) : (
            <ul className="max-h-64 divide-y divide-border overflow-y-auto">
              {visible.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.date)} · Année {a.schoolYear}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone="blue">{a.type}</Badge>
                    <button
                      onClick={() => onRemove(a.id)}
                      aria-label="Supprimer l'activité"
                      className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ajouter une activité */}
        <div className="space-y-3 rounded-xl border border-dashed border-ew-green-600/40 bg-ew-green-50/30 p-3">
          <p className="text-sm font-bold text-foreground">Ajouter une activité</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APFC_ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Intitulé</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Évaluation par compétences" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button className={GREEN_BTN} onClick={add}>
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
