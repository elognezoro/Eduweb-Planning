"use client";

import * as React from "react";
import {
  GraduationCap,
  Plus,
  Users,
  Layers,
  UploadCloud,
  RefreshCw,
  FileSpreadsheet,
  ChevronDown,
  Download,
  Globe,
  Building2,
  Phone,
  UserRound,
  Trash2,
  Search,
  Settings2,
  BookOpen,
  Save,
  Stamp,
  PenLine,
  ImageIcon,
  FileText,
  ListChecks,
  Medal,
  ChevronRight,
  GripVertical,
  ChevronUp,
  RotateCcw,
  Check,
  ChevronLeft,
  Sparkles,
  Target,
  ClipboardList,
  KeyRound,
  Pencil,
  ThumbsUp,
  Eye,
  HeartPulse,
  MessageSquare,
  Send,
  History,
  PieChart,
  TrendingUp,
  Activity,
  FileCheck2,
  Clock,
  FilePlus2,
  Trophy,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SectionCard, TwoColumn } from "@/components/modules/module-page";
import { SectionNav, FloatingSectionNav, type SectionItem } from "@/components/layout/section-nav";
import { StatusBadge } from "@/components/ui/status-badge";
import { ForbiddenState } from "@/components/layout/states";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImportCsvDialog } from "@/components/forms/import-csv-dialog";
import { SimpleTable } from "@/components/data-table/simple-table";
import { ChartCard, BarsChart, AreaTrend } from "@/components/charts/charts";
import { ExportMenu } from "@/components/layout/export-menu";
import { defaultReportPayload, type ReportItem } from "@/components/modules/report-module";
import { downloadReportPdf, type ReportPayload } from "@/lib/exports";
import { etabExportMeta } from "@/lib/etab-config";
import { CountrySearchSelect } from "@/components/forms/country-select";
import { ImageDrop } from "@/components/forms/image-drop";
import { CountryFlag } from "@/components/app-shell/switchers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { COUNTRIES } from "@/config/countries";
import { getUnCountry } from "@/config/un-countries";
import type { Cafop } from "@/lib/types";
import { CAFOP_PROMOTIONS } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

const CSV_HEADER = "nom;code;annee_formation;pays;region;localite;adresse;telephone;email;directeur;contact_directeur";
const ORANGE_BTN = "bg-ew-orange text-white hover:bg-ew-orange/90";

/* Sommaires « Aller à » des onglets de la page. */
const GESTION_SECTIONS: SectionItem[] = [
  { id: "indicateurs", label: "Indicateurs" },
  { id: "centres", label: "Centres CAFOP" },
  { id: "promotions", label: "Promotions" },
];
const NOTES_SECTIONS: SectionItem[] = [
  { id: "presentation", label: "Présentation" },
  { id: "selection-cafop", label: "Sélection d'un CAFOP" },
];
const STATS_SECTIONS: SectionItem[] = [
  { id: "stats-indicateurs", label: "Indicateurs clés" },
  { id: "genre", label: "Genre" },
  { id: "classements", label: "Classements" },
  { id: "mentions", label: "Mentions & pays" },
  { id: "repartition", label: "Répartition par CAFOP" },
  { id: "groupes", label: "Groupes-classes" },
  { id: "activite", label: "Activité & graphiques" },
];
const RAPPORTS_SECTIONS: SectionItem[] = [
  { id: "ra-indicateurs", label: "Suivi des rapports" },
  { id: "ra-filtres", label: "Filtres" },
  { id: "ra-liste", label: "Liste des rapports" },
  { id: "generer", label: "Générer un rapport" },
  { id: "disponibles", label: "Rapports disponibles" },
];

/** Référentiel par défaut des modules de formation (modifiable pour toute réforme pédagogique). */
const CAFOP_MODULES_DEFAULT: { name: string; coef: number }[] = [
  { name: "Droits de l'Homme", coef: 1 },
  { name: "Gestion des classes à profil spécifique", coef: 1 },
  { name: "Environnement et vie scolaire", coef: 1 },
  { name: "Éducation à la santé", coef: 1 },
  { name: "Évaluation commune", coef: 1 },
  { name: "Stage pratique", coef: 2 },
];

/* --------------------- Données bulletin (déterministes, démo) --------------------- */
const GROUPES = ["F1", "F2", "F3"];
const EM_NOMS = ["AGUIE", "KOUADIO", "BAMBA", "TRAORÉ", "N'GUESSAN", "KONÉ", "YAO", "OUATTARA", "DIABATÉ", "AKA", "BROU", "TANOH", "CISSÉ"];
const EM_PRENOMS = ["Sopie Rosine", "Koffi Jean", "Aya Clarisse", "Moussa Ibrahim", "Affoué Marie", "Yao Serge", "Aminata Grace", "Konan Eric", "Fatou Bintou", "Adjoua Esther", "Souleymane", "Akissi Laure", "Max-Urbain"];
const EM_PROFS = ["AMANI KOUAKOU MAX-URBAIN", "ASSALE KOUA CASIMIR", "KOUAME BRAGORI SERGE MARES", "N'DRI AHOU CLémentine", "GBANE MAMADOU"];

const seedOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
const ord = (n: number) => `${n}${n === 1 ? "er" : "e"}`;

interface EleveMaitre {
  id: string;
  nom: string;
  prenoms: string;
  naissance: string;
}

/** Promotions (cohortes) ouvertes dans un CAFOP, selon la durée de formation du pays. */
function promotionsFor(cafop: Cafop, years: number): string[] {
  const start = Number(cafop.year.slice(0, 4)) || 2026;
  const count = Math.max(2, years);
  return Array.from({ length: count }, (_, k) => `Promotion ${start - k}–${start - k + years}`);
}

/** 25 élèves-maîtres déterministes par CAFOP, cohorte (promotion) et groupe-classe. */
function elevesMaitres(cafopId: string, promo: string, groupe: string): EleveMaitre[] {
  const base = seedOf(`${cafopId}|${promo}|${groupe}`);
  return Array.from({ length: 25 }, (_, i) => {
    const s = base + i * 17;
    const day = (s % 28) + 1;
    const month = (s % 12) + 1;
    const year = 1986 + (s % 18);
    return {
      id: `${cafopId}-${groupe}-${i + 1}`,
      nom: EM_NOMS[(s + i) % EM_NOMS.length],
      prenoms: EM_PRENOMS[(s + i * 7) % EM_PRENOMS.length],
      naissance: `${String(day).padStart(2, "0")} ${["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"][month - 1]} ${year}`,
    };
  });
}

/** Appréciation par module (barème du bulletin CAFOP). */
const apprecModule = (m: number) =>
  m >= 16 ? "Très bien" : m >= 14 ? "Bien" : m >= 12 ? "Assez bien" : m >= 10 ? "Passable" : m >= 8 ? "Médiocre" : "Insuffisant";

/** Appréciation IA du professeur principal — ajustable ensuite. */
function aiApprecPrincipal(m: number, variant: number): string {
  const bank: string[] =
    m >= 16
      ? ["Excellent semestre — félicitations.", "Élève-maître remarquable, poursuivez ainsi."]
      : m >= 14
        ? ["Bien — ensemble solide et régulier.", "Bon semestre, maintenez vos efforts."]
        : m >= 12
          ? ["Assez bien", "Semestre correct — visez plus de constance dans les modules faibles."]
          : m >= 10
            ? ["Passable — un travail plus soutenu est attendu.", "Résultats justes ; renforcez la préparation du stage."]
            : ["Insuffisant — un net redressement est exigé.", "Semestre difficile ; un accompagnement renforcé s'impose."];
  return bank[variant % bank.length];
}

/**
 * Note de conduite calculée automatiquement à partir du registre d'appel
 * (absences non justifiées, retards) et des observations du professeur.
 */
function conduiteFromRegistre(eleveId: string) {
  const s = seedOf(`${eleveId}|registre`);
  const absJ = s % 4;
  const absNJ = (s >> 2) % 3;
  const retards = (s >> 4) % 4;
  const observations = (s >> 6) % 2;
  const note = Math.max(8, Math.min(20, 20 - absNJ * 1.5 - retards * 0.5 - observations * 2));
  return { absJ, absNJ, retards, observations, note };
}

/** Calcule toutes les données du bulletin d'un élève-maître. */
function bulletinData(cafop: Cafop, modules: ModuleRow[], promo: string, groupe: string, idx: number, semestre: string) {
  const eleves = elevesMaitres(cafop.id, promo, groupe);
  const e = eleves[idx];
  const rows = modules.map((m, mi) => {
    const s = seedOf(`${e.id}|${m.name}|${semestre}`);
    const moy = Math.round((8 + (s % 110) / 10) * 100) / 100; // 8.00 – 18.90
    return {
      ...m,
      moy,
      rang: ord((s % 25) + 1),
      appr: apprecModule(moy),
      prof: EM_PROFS[(s + mi) % EM_PROFS.length],
    };
  });
  const totalCoef = rows.reduce((a, r) => a + r.coef, 0);
  const total = rows.reduce((a, r) => a + r.moy * r.coef, 0);
  const moyenne = totalCoef ? total / totalCoef : 0;
  const sg = seedOf(`${e.id}|synthese|${semestre}`);
  const conduite = conduiteFromRegistre(e.id);
  const stage = Math.round((11 + (sg % 80) / 10) * 100) / 100;
  const moyAnnuelle = Math.round((moyenne + 0.4 + (sg % 10) / 10) * 100) / 100;
  const rang = ord((sg % 25) + 1);
  const rangAnnuel = ord(((sg >> 3) % 25) + 1);
  return { eleves, e, rows, totalCoef, total, moyenne, conduite, stage, moyAnnuelle, rang, rangAnnuel };
}

export default function CafopPage() {
  const { can } = useApp();
  const { cafops, addCafop, addCafops, removeCafop, cafopModules, setCafopModules, cafopFormationYears, setCafopFormationYears } = useStore();
  const modules = cafopModules ?? CAFOP_MODULES_DEFAULT;
  const [tab, setTab] = React.useState<"gestion" | "notes" | "stats" | "rapports">("gestion");
  const [query, setQuery] = React.useState("");
  const [templateOpen, setTemplateOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [newOpen, setNewOpen] = React.useState(false);
  const [modulesOpen, setModulesOpen] = React.useState(false);
  const [selectedCafop, setSelectedCafop] = React.useState<Cafop | null>(null);

  if (!can("system:manage_cafop")) return <ForbiddenState />;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? cafops.filter((c) => `${c.name} ${c.code} ${c.region} ${c.locality} ${c.director}`.toLowerCase().includes(q))
    : cafops;

  return (
    <div className="space-y-6">
      {/* En-tête (capture 1) */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ew-orange text-white shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Gestion des CAFOP</h1>
            <p className="text-sm text-muted-foreground">
              {`${cafops.length} CAFOP enregistrés — Centres d'Animation et de Formation Pédagogique`}
            </p>
          </div>
        </div>
        {/* Bascule Gestion / Notes & Bulletins */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
          {(
            [
              { id: "gestion" as const, label: "Gestion", icon: Settings2 },
              { id: "notes" as const, label: "Enseignements & Evaluation", icon: BookOpen },
              { id: "stats" as const, label: "Statistiques", icon: PieChart },
              { id: "rapports" as const, label: "Rapports", icon: FileText },
            ]
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  tab === t.id ? "bg-background text-ew-orange shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barre d'actions */}
      {(tab === "gestion" || tab === "notes") && (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast.success("Liste actualisée", { description: `${cafops.length} CAFOP chargés.` })}>
          <RefreshCw className="h-4 w-4" /> Actualiser
        </Button>
        <Button variant="outline" onClick={() => setTemplateOpen(true)}>
          <FileSpreadsheet className="h-4 w-4" /> Modèle CSV <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          <UploadCloud className="h-4 w-4" /> Importer CSV
        </Button>
        <Button className={ORANGE_BTN} onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4" /> Nouveau CAFOP
        </Button>
      </div>
      )}

      {tab === "stats" && <CafopStatsTab cafops={cafops} modules={modules} />}
      {tab === "rapports" && <CafopRapportsTab cafops={cafops} />}

      {tab === "gestion" && (
        <>
          <SectionNav sections={GESTION_SECTIONS} />
          <FloatingSectionNav sections={GESTION_SECTIONS} />
          <div id="indicateurs" className="grid scroll-mt-24 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Centres" value={cafops.length} icon={GraduationCap} tone="gold" />
            <KpiCard label="Promotions" value={cafops.reduce((s, c) => s + c.promotions, 0)} icon={Layers} tone="blue" />
            <KpiCard label="Cohortes" value={cafops.reduce((s, c) => s + c.cohortes, 0)} icon={Layers} tone="green" />
            <KpiCard label="Élèves-maîtres" value={cafops.reduce((s, c) => s + c.eleves, 0)} icon={Users} tone="purple" />
          </div>

          <SectionCard
            id="centres"
            title="Centres CAFOP"
            description="Recherche, consultation et suppression des centres enregistrés."
            action={
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un CAFOP…" className="h-9 w-56 pl-8" />
              </div>
            }
            contentClassName="p-0 overflow-x-auto"
          >
            <SimpleTable
              rows={filtered}
              getKey={(c) => c.id}
              columns={[
                {
                  key: "name",
                  header: "CAFOP",
                  render: (c) => (
                    <div>
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.code} · {c.year}</p>
                    </div>
                  ),
                },
                {
                  key: "country",
                  header: "Pays",
                  render: (c) => (
                    <span className="flex items-center gap-2">
                      <CountryFlag code={c.country} />
                      {getUnCountry(c.country)?.name ?? c.country}
                    </span>
                  ),
                },
                { key: "region", header: "Région / DRENA" },
                { key: "locality", header: "Localité" },
                {
                  key: "director",
                  header: "Directeur",
                  render: (c) => (
                    <div>
                      <p className="text-foreground">{c.director}</p>
                      <p className="font-mono text-xs text-muted-foreground">{c.directorContact}</p>
                    </div>
                  ),
                },
                { key: "eleves", header: "Élèves", align: "center" },
                {
                  key: "actions",
                  header: "",
                  render: (c) => (
                    <button
                      onClick={() => {
                        removeCafop(c.id);
                        toast.success("CAFOP supprimé", { description: c.name });
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      aria-label={`Supprimer ${c.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ),
                },
              ]}
            />
          </SectionCard>

          <SectionCard id="promotions" title="Promotions" description="Avancement des promotions par centre">
            <SimpleTable
              rows={CAFOP_PROMOTIONS}
              getKey={(r) => r.id}
              columns={[
                { key: "label", header: "Promotion", render: (r) => <span className="font-semibold">{r.label}</span> },
                { key: "center", header: "Centre" },
                { key: "cohortes", header: "Cohortes", align: "center" },
                { key: "eleves", header: "Effectif", align: "center" },
                {
                  key: "progression",
                  header: "Progression",
                  render: (r) => (
                    <div className="flex items-center gap-2">
                      <Progress value={r.progression} className="w-28" />
                      <span className="text-sm font-semibold">{r.progression}%</span>
                    </div>
                  ),
                },
              ]}
            />
          </SectionCard>
        </>
      )}

      {tab === "notes" && (selectedCafop ? (
        <CafopDetail
          cafop={selectedCafop}
          modules={modules}
          years={cafopFormationYears[selectedCafop.country] ?? 2}
          onYearsChange={(y) => setCafopFormationYears(selectedCafop.country, y)}
          onBack={() => setSelectedCafop(null)}
        />
      ) : (
        /* ---------------- Enseignements & Evaluation — sélection d'un CAFOP ---------------- */
        <>
          <SectionNav sections={NOTES_SECTIONS} />
          <FloatingSectionNav sections={NOTES_SECTIONS} />
          {/* Bannière */}
          <div id="presentation" className="scroll-mt-24 rounded-2xl border border-ew-orange/30 bg-ew-gold-100/30 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-orange text-white">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-foreground">Gestion des Notes &amp; Bulletins CAFOP</h2>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    Sélectionnez un CAFOP pour gérer les notes des élèves-maîtres et générer les bulletins de notes
                    semestriels personnalisés.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" className="border-ew-orange/40 text-ew-orange hover:bg-ew-gold-100/60" onClick={() => setModulesOpen(true)}>
                  <ListChecks className="h-4 w-4" /> Gérer les modules
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ew-orange text-[11px] font-bold text-white">
                    {modules.length}
                  </span>
                </Button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Users, value: cafops.length, label: "CAFOP enregistrés", tone: "text-ew-orange bg-ew-gold-100" },
                { icon: BookOpen, value: modules.length, label: "Modules actifs", tone: "text-ew-gold-600 bg-ew-gold-100" },
                { icon: Medal, value: 2, label: "Semestres", tone: "text-ew-green-700 bg-ew-green-100" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3 rounded-xl border border-ew-orange/20 bg-card p-3">
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", s.tone)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xl font-extrabold leading-tight text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sélection d'un CAFOP */}
          <SectionCard
            id="selection-cafop"
            title="Sélectionner un CAFOP pour gérer les notes et bulletins"
            description="Chaque élève-maître d'un CAFOP reçoit son propre bulletin individuel et nominatif, organisé par groupe-classe."
            contentClassName="p-0"
          >
            <ul className="max-h-[460px] divide-y divide-border overflow-y-auto">
              {cafops.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCafop(c)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-ew-gold-100/30 sm:px-5"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ew-gold-100 text-ew-orange">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-foreground">{c.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {c.region} — {getUnCountry(c.country)?.name ?? c.country}
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-ew-gold-100 px-3 py-1 text-xs font-semibold text-ew-orange">
                        Configurer bulletins
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </SectionCard>
        </>
      ))}

      {modulesOpen && (
        <ModulesDialog
          modules={modules}
          onClose={() => setModulesOpen(false)}
          onSave={(list) => {
            setCafopModules(list);
            setModulesOpen(false);
            toast.success("Référentiel des modules validé", { description: `${list.length} module(s) — appliqué à tous les CAFOP.` });
          }}
        />
      )}

      {templateOpen && <TemplateCsvDialog onClose={() => setTemplateOpen(false)} />}
      {importOpen && (
        <ImportCafopDialog
          onClose={() => setImportOpen(false)}
          onImport={(list, dest) => {
            addCafops(list);
            setImportOpen(false);
            toast.success(`${list.length} CAFOP importé(s)`, { description: `Rattachés à ${getUnCountry(dest)?.name ?? dest}.` });
          }}
        />
      )}
      {newOpen && (
        <NewCafopDialog
          onClose={() => setNewOpen(false)}
          onCreate={(c) => {
            addCafop(c);
            setNewOpen(false);
            toast.success("CAFOP créé", { description: c.name });
          }}
        />
      )}
    </div>
  );
}

/* ------------- Statistiques CAFOP (transférées de la page barre latérale) ------------- */
const PARTICIPATION = [
  { mois: "Jan.", taux: 78 },
  { mois: "Fév.", taux: 82 },
  { mois: "Mars", taux: 85 },
  { mois: "Avr.", taux: 81 },
  { mois: "Mai", taux: 88 },
];

/** Moyenne générale d'un élève-maître (mêmes graines que le bulletin, semestre 1). */
function moyenneEleveCafop(eleveId: string, modules: ModuleRow[]): number {
  const tc = modules.reduce((a, m) => a + m.coef, 0);
  const tot = modules.reduce((a, m) => {
    const s = seedOf(`${eleveId}|${m.name}|1`);
    return a + (Math.round((8 + (s % 110) / 10) * 100) / 100) * m.coef;
  }, 0);
  return tc ? tot / tc : 0;
}

const MENTIONS_LABELS = ["Très Bien", "Bien", "Assez Bien", "Passable", "Insuffisant"];
const MENTIONS_COLORS = ["bg-ew-green-600", "bg-blue-500", "bg-teal-500", "bg-ew-gold-500", "bg-red-500"];

/** Indicateurs académiques et de parité de la cohorte active d'un CAFOP. */
function cohortStats(cafop: Cafop, modules: ModuleRow[]) {
  const promo = promotionsFor(cafop, 2)[0];
  const groupes = GROUPES.map((g) => {
    const eleves = elevesMaitres(cafop.id, promo, g);
    const moys = eleves.map((e) => moyenneEleveCafop(e.id, modules));
    const filles = eleves.filter((e) => seedOf(e.id) % 2 === 0).length;
    return {
      groupe: g,
      effectif: eleves.length,
      filles,
      garcons: eleves.length - filles,
      moyenne: moys.reduce((a, b) => a + b, 0) / Math.max(1, moys.length),
      reussite: (moys.filter((m) => m >= 10).length / Math.max(1, moys.length)) * 100,
      moys,
    };
  });
  const allMoys = groupes.flatMap((g) => g.moys);
  const total = allMoys.length;
  const filles = groupes.reduce((a, g) => a + g.filles, 0);
  const mentions = [
    allMoys.filter((m) => m >= 16).length,
    allMoys.filter((m) => m >= 14 && m < 16).length,
    allMoys.filter((m) => m >= 12 && m < 14).length,
    allMoys.filter((m) => m >= 10 && m < 12).length,
    allMoys.filter((m) => m < 10).length,
  ];
  return {
    promo,
    groupes,
    modelTotal: total,
    pctFilles: total ? filles / total : 0,
    moyenne: total ? allMoys.reduce((a, b) => a + b, 0) / total : 0,
    reussite: total ? (allMoys.filter((m) => m >= 10).length / total) * 100 : 0,
    mentions,
  };
}

function StatKpi({
  icon: Icon,
  iconTone,
  value,
  label,
  badge,
  badgeTone,
}: {
  icon: typeof Users;
  iconTone: string;
  value: string | number;
  label: string;
  badge: string;
  badgeTone: React.ComponentProps<typeof Badge>["tone"];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconTone)}>
          <Icon className="h-4 w-4" />
        </span>
        <Badge tone={badgeTone}>{badge}</Badge>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function CafopStatsTab({ cafops, modules }: { cafops: Cafop[]; modules: ModuleRow[] }) {
  const [pays, setPays] = React.useState("all");
  const [selId, setSelId] = React.useState("");
  const countries = Array.from(new Set(cafops.map((c) => c.country)));
  const list = pays === "all" ? cafops : cafops.filter((c) => c.country === pays);
  const sel = list.find((c) => c.id === selId) ?? list[0];

  const stats = list.map((c) => ({ cafop: c, ...cohortStats(c, modules) }));
  const totalEleves = list.reduce((s, c) => s + c.eleves, 0);
  const filles = stats.reduce((s, x) => s + Math.round(x.cafop.eleves * x.pctFilles), 0);
  const garcons = totalEleves - filles;
  const pctF = totalEleves ? (filles / totalEleves) * 100 : 0;
  const moyG = stats.length ? stats.reduce((s, x) => s + x.moyenne, 0) / stats.length : 0;
  const reussite = stats.length ? stats.reduce((s, x) => s + x.reussite, 0) / stats.length : 0;
  const topMoy = [...stats].sort((a, b) => b.moyenne - a.moyenne).slice(0, 4);
  const topFem = [...stats].sort((a, b) => b.pctFilles - a.pctFilles).slice(0, 4);
  const modelTotal = stats.reduce((s, x) => s + x.modelTotal, 0);
  const mentionShares = [0, 1, 2, 3, 4].map((i) =>
    modelTotal ? stats.reduce((s, x) => s + x.mentions[i], 0) / modelTotal : 0,
  );
  const selStats = sel ? stats.find((x) => x.cafop.id === sel.id) : undefined;
  const moyBadge: { t: string; tone: React.ComponentProps<typeof Badge>["tone"] } =
    moyG >= 14 ? { t: "Bien", tone: "green" } : moyG >= 12 ? { t: "Assez bien", tone: "gold" } : moyG >= 10 ? { t: "Passable", tone: "gold" } : { t: "Faible", tone: "red" };

  const centres = list.map((c) => ({
    name: c.locality || c.name,
    eleves: c.eleves,
    cohortes: c.cohortes,
    promotions: c.promotions,
  }));
  const progressionMoy = Math.round(
    CAFOP_PROMOTIONS.reduce((s, p) => s + p.progression, 0) / Math.max(1, CAFOP_PROMOTIONS.length),
  );
  const participationMoy = Math.round(PARTICIPATION.reduce((s, p) => s + p.taux, 0) / PARTICIPATION.length);
  return (
    <>
      {/* Bandeau d'en-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ew-orange/30 bg-ew-gold-100/30 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-orange text-white">
            <PieChart className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-bold text-foreground">Statistiques CAFOP</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Vue d&apos;ensemble des performances et indicateurs des Centres d&apos;Animation et de Formation Pédagogique.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Select value={pays} onValueChange={setPays}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les pays</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{getUnCountry(c)?.name ?? c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast.success("Statistiques actualisées", { description: `${list.length} CAFOP analysés.` })}>
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
        </div>
      </div>

      <SectionNav sections={STATS_SECTIONS} />
      <FloatingSectionNav sections={STATS_SECTIONS} />

      {/* Indicateurs clés */}
      <div id="stats-indicateurs" className="grid scroll-mt-24 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatKpi icon={GraduationCap} iconTone="bg-ew-gold-100 text-ew-orange" value={list.length} label="Centres CAFOP" badge="Actif" badgeTone="green" />
        <StatKpi icon={Users} iconTone="bg-blue-100 text-blue-600" value={totalEleves.toLocaleString("fr-FR")} label="Élèves-maîtres" badge="Formation" badgeTone="blue" />
        <StatKpi icon={Target} iconTone="bg-ew-green-100 text-ew-green-700" value={moyG.toFixed(2)} label="Moyenne générale /20" badge={moyBadge.t} badgeTone={moyBadge.tone} />
        <StatKpi icon={PieChart} iconTone="bg-purple-100 text-purple-600" value={`${reussite.toFixed(1)} %`} label="Taux de réussite" badge={`${Math.round(reussite)} %`} badgeTone={reussite >= 50 ? "green" : "red"} />
      </div>

      {/* Statistiques par Genre */}
      <SectionCard id="genre" title="Statistiques par Genre" description="Répartition filles / garçons dans l'ensemble des CAFOP">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-border p-4 text-center">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Users className="h-4 w-4" />
            </span>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{totalEleves.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-muted-foreground">Total élèves-maîtres</p>
          </div>
          <div className="rounded-xl border border-pink-200 bg-pink-50/60 p-4 text-center">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-600">
              <UserRound className="h-4 w-4" />
            </span>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{filles.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-muted-foreground">Filles</p>
            <div className="mt-2 h-1.5 rounded-full bg-pink-100">
              <div className="h-1.5 rounded-full bg-pink-500" style={{ width: `${pctF}%` }} />
            </div>
            <p className="mt-1 text-[11px] font-semibold text-pink-600">{pctF.toFixed(1)}%</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-center">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <UserRound className="h-4 w-4" />
            </span>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{garcons.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-muted-foreground">Garçons</p>
            <div className="mt-2 h-1.5 rounded-full bg-blue-100">
              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${100 - pctF}%` }} />
            </div>
            <p className="mt-1 text-[11px] font-semibold text-blue-600">{(100 - pctF).toFixed(1)}%</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="bg-pink-500" style={{ width: `${pctF}%` }} />
            <div className="bg-blue-500" style={{ width: `${100 - pctF}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pink-500" /> Filles</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Garçons</span>
          </div>
        </div>
      </SectionCard>

      {/* Classements */}
      <div id="classements" className="grid scroll-mt-24 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Classement Académique"
          description="Top CAFOP par moyenne générale"
          action={
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ew-gold-100 text-ew-gold-600">
              <Trophy className="h-4 w-4" />
            </span>
          }
        >
          <div className="space-y-2">
            {topMoy.map((x, i) => (
              <div key={x.cafop.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", i === 0 ? "bg-ew-gold-100 text-ew-gold-600" : "bg-muted text-muted-foreground")}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{x.cafop.name}</p>
                    <p className="text-[11px] text-muted-foreground">{x.cafop.locality} · {x.cafop.eleves} élèves</p>
                  </div>
                </div>
                <p className="text-lg font-extrabold text-foreground">
                  {x.moyenne.toFixed(2)}
                  <span className="text-xs font-semibold text-muted-foreground">/20</span>
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Classement Genre Féminin"
          description="Top CAFOP par taux de féminisation"
          action={
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
              <UserRound className="h-4 w-4" />
            </span>
          }
        >
          <div className="space-y-2">
            {topFem.map((x, i) => (
              <div key={x.cafop.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", i === 0 ? "bg-pink-100 text-pink-600" : "bg-muted text-muted-foreground")}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{x.cafop.name}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-pink-500" style={{ width: `${x.pctFilles * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-pink-600">{(x.pctFilles * 100).toFixed(1)}%</p>
                  <p className="text-[11px] text-muted-foreground">{Math.round(x.cafop.eleves * x.pctFilles)} filles</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Mentions & Pays */}
      <div id="mentions" className="grid scroll-mt-24 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Répartition par Mention"
          description="Distribution des notes"
          action={
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ew-gold-100 text-ew-gold-600">
              <Medal className="h-4 w-4" />
            </span>
          }
        >
          <div className="space-y-3">
            {MENTIONS_LABELS.map((lab, i) => {
              const pct = mentionShares[i] * 100;
              const count = Math.round(totalEleves * mentionShares[i]);
              return (
                <div key={lab} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">{lab}</span>
                    <span className="text-xs text-muted-foreground">{count.toLocaleString("fr-FR")} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className={cn("h-1.5 rounded-full", MENTIONS_COLORS[i])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Répartition par Pays"
          description="CAFOP par pays"
          action={
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Globe className="h-4 w-4" />
            </span>
          }
        >
          <div className="space-y-2">
            {countries.map((code) => {
              const cs = cafops.filter((c) => c.country === code);
              return (
                <div key={code} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CountryFlag code={code} /> {getUnCountry(code)?.name ?? code}
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge tone="gold">{cs.length} centres</Badge>
                    <Badge tone="blue">{cs.reduce((s, c) => s + c.eleves, 0).toLocaleString("fr-FR")} élèves-maîtres</Badge>
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Répartition par CAFOP */}
      <SectionCard
        id="repartition"
        title="Répartition par CAFOP"
        description="CAFOP du pays par nombre d'élèves-maîtres"
        action={
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ew-gold-100 text-ew-orange">
            <GraduationCap className="h-4 w-4" />
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {list.map((c) => (
            <div key={c.id} className="rounded-xl border border-border p-3 text-center">
              <p className="truncate text-xs font-bold text-foreground" title={c.name}>{c.name}</p>
              <p className="mt-1 text-2xl font-extrabold text-ew-orange">{c.eleves}</p>
              <p className="text-[11px] text-muted-foreground">élèves-maîtres</p>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">{c.region}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Statistiques par Groupe-Classe */}
      <SectionCard id="groupes" title="Statistiques par Groupe-Classe" description="Performances détaillées par groupe-classe pour un CAFOP">
        <div className="max-w-md space-y-1.5">
          <Label>Sélectionner un CAFOP</Label>
          <Select value={sel?.id ?? ""} onValueChange={setSelId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {list.map((c) => (
                <SelectItem key={c.id} value={c.id}>{`${c.name} (${c.region})`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selStats ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {selStats.groupes.map((g) => (
              <div key={g.groupe} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-foreground">Groupe {g.groupe}</p>
                  <Badge tone={g.reussite >= 50 ? "green" : "red"}>{g.reussite.toFixed(0)} % réussite</Badge>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-foreground">
                  {g.moyenne.toFixed(2)}
                  <span className="text-xs font-semibold text-muted-foreground">/20</span>
                </p>
                <p className="text-[11px] text-muted-foreground">{g.effectif} élèves-maîtres · {selStats.promo}</p>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
                  <div className="bg-pink-500" style={{ width: `${(g.filles / g.effectif) * 100}%` }} />
                  <div className="bg-blue-500" style={{ width: `${(g.garcons / g.effectif) * 100}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>{g.filles} filles</span>
                  <span>{g.garcons} garçons</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Aucun groupe-classe défini pour ce CAFOP.</p>
        )}
      </SectionCard>

      {/* Indicateurs d'activité (existant) */}
      <div id="activite" className="grid scroll-mt-24 gap-4 sm:grid-cols-3">
        <KpiCard label="Progression moyenne" value={`${progressionMoy} %`} icon={TrendingUp} tone="blue" delta={4} />
        <KpiCard label="Taux de participation" value={`${participationMoy} %`} icon={Activity} tone="gold" />
        <KpiCard label="Cohortes actives" value={list.reduce((s, c) => s + c.cohortes, 0)} icon={Layers} tone="purple" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Effectifs par centre" description="Nombre d'élèves-maîtres">
          <BarsChart data={centres} xKey="name" series={[{ key: "eleves", label: "Élèves-maîtres" }]} />
        </ChartCard>
        <ChartCard title="Progression par promotion" description="Avancement (%)">
          <BarsChart data={CAFOP_PROMOTIONS} xKey="label" series={[{ key: "progression", label: "Progression (%)", color: "#d99a1e" }]} />
        </ChartCard>
        <ChartCard title="Taux de participation" description="Activité sur la plateforme" height={280}>
          <AreaTrend data={PARTICIPATION} xKey="mois" series={[{ key: "taux", label: "Participation (%)" }]} />
        </ChartCard>
        <ChartCard title="Effectifs par cohorte" description="Répartition" height={280}>
          <BarsChart
            data={centres}
            xKey="name"
            series={[
              { key: "cohortes", label: "Cohortes", color: "#176b45" },
              { key: "promotions", label: "Promotions", color: "#2563eb" },
            ]}
          />
        </ChartCard>
      </div>
    </>
  );
}

/* -------------- Rapports CAFOP (transférés de la page barre latérale) -------------- */
const CAFOP_REPORTS: ReportItem[] = [
  { id: "rcaf-1", title: "Bilan pédagogique — CAFOP Abidjan", period: "2ᵉ Trimestre", scope: "CAFOP d'Abidjan", status: "completed", author: "Service CAFOP", date: "2026-04-02" },
  { id: "rcaf-2", title: "Suivi des cohortes — CAFOP de Bouaké 1", period: "2ᵉ Trimestre", scope: "CAFOP de Bouaké 1", status: "draft", author: "Service CAFOP", date: "2026-04-05" },
  { id: "rcaf-3", title: "Rapport de progression — CAFOP Korhogo", period: "1ᵉʳ Trimestre", scope: "CAFOP de Korhogo", status: "completed", author: "Service CAFOP", date: "2026-01-15" },
];

/* ------------- Rapports d'Activités CAFOP (suivi, saisie, export) ------------- */
type RapportActivite = {
  id: string;
  cafopId: string;
  cafopName: string;
  type: string;
  periode: string;
  annee: string;
  statut: "brouillon" | "soumis" | "valide" | "rejete";
  date: string;
  auteur: string;
  effectifs: { total: number; ia: number; i: number };
  resultats: { moyenne: number; reussite: number; bulletins: number };
  observations: string;
  difficultes: string;
  recommandations: string;
  perspectives: string;
};

const RA_TYPES = ["Rapport Mensuel", "Rapport Trimestriel", "Rapport Semestriel", "Rapport Annuel"];

const RA_STATUTS: Record<RapportActivite["statut"], { label: string; cls: string; icon: typeof Clock }> = {
  brouillon: { label: "Brouillon", cls: "bg-slate-100 text-slate-600", icon: Clock },
  soumis: { label: "Soumis", cls: "bg-ew-gold-100 text-ew-gold-600", icon: Send },
  valide: { label: "Validé", cls: "bg-ew-green-100 text-ew-green-700", icon: CheckCircle2 },
  rejete: { label: "Rejeté", cls: "bg-red-100 text-red-600", icon: XCircle },
};

function rapportsActivitesSeed(cafops: Cafop[]): RapportActivite[] {
  const entries: [string, RapportActivite["statut"], number, number, number][] = [
    ["Abengourou", "valide", 120, 12.5, 75],
    ["Abidjan", "soumis", 135, 12.8, 77],
    ["Aboisso", "brouillon", 150, 13.1, 79],
    ["Odienné", "brouillon", 165, 13.4, 81],
    ["Bondoukou", "brouillon", 180, 13.7, 83],
  ];
  return entries.map(([loc, statut, total, moyenne, reussite], i) => {
    const c = cafops.find((x) => x.locality === loc);
    return {
      id: `ra-${i + 1}`,
      cafopId: c?.id ?? loc,
      cafopName: c?.name ?? `CAFOP de ${loc}`,
      type: "Rapport Mensuel",
      periode: "Janvier 2026",
      annee: "2026-2027",
      statut,
      date: "2026-01-15",
      auteur: "Directeur CAFOP",
      effectifs: { total, ia: Math.round(total * 0.6), i: total - Math.round(total * 0.6) },
      resultats: { moyenne, reussite, bulletins: total },
      observations: "Activités pédagogiques conformes au calendrier de formation. Assiduité satisfaisante des élèves-maîtres.",
      difficultes: "Insuffisance de manuels de référence pour les modules transversaux.",
      recommandations: "Renforcer la dotation documentaire et poursuivre l'encadrement des stages pratiques.",
      perspectives: "Organisation des évaluations communes et préparation du prochain conseil pédagogique.",
    };
  });
}

function rapportActivitePayload(r: RapportActivite): ReportPayload {
  return {
    title: `Rapport d'activités — ${r.cafopName}`,
    subtitle: `${r.type} — ${r.periode} · Année scolaire ${r.annee}`,
    country: "Côte d'Ivoire",
    institution: r.cafopName,
    period: r.periode,
    author: r.auteur,
    generatedAt: new Date().toLocaleString("fr-FR"),
    sections: [
      {
        heading: "Effectifs",
        table: {
          columns: ["Indicateur", "Valeur"],
          rows: [
            ["Effectif total", String(r.effectifs.total)],
            ["Instituteurs Adjoints (IA)", String(r.effectifs.ia)],
            ["Instituteurs (I)", String(r.effectifs.i)],
          ],
        },
      },
      {
        heading: "Résultats",
        table: {
          columns: ["Indicateur", "Valeur"],
          rows: [
            ["Moyenne générale /20", r.resultats.moyenne.toFixed(2)],
            ["Taux de réussite", `${r.resultats.reussite} %`],
            ["Bulletins générés", String(r.resultats.bulletins)],
            ["Statut du rapport", RA_STATUTS[r.statut].label],
          ],
        },
      },
      { heading: "Observations", paragraphs: [r.observations || "—"] },
      { heading: "Difficultés rencontrées", paragraphs: [r.difficultes || "—"] },
      { heading: "Recommandations", paragraphs: [r.recommandations || "—"] },
      { heading: "Perspectives", paragraphs: [r.perspectives || "—"] },
    ],
  };
}

function RaBadge({ statut }: { statut: RapportActivite["statut"] }) {
  const m = RA_STATUTS[statut];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", m.cls)}>
      <Icon className="h-3 w-3" /> {m.label}
    </span>
  );
}

function NouveauRapportDialog({
  cafops,
  onClose,
  onSave,
}: {
  cafops: Cafop[];
  onClose: () => void;
  onSave: (r: RapportActivite) => void;
}) {
  const [cafopId, setCafopId] = React.useState("");
  const [type, setType] = React.useState(RA_TYPES[0]);
  const [periode, setPeriode] = React.useState("");
  const [annee, setAnnee] = React.useState("2026-2027");
  const [total, setTotal] = React.useState("0");
  const [ia, setIa] = React.useState("0");
  const [inst, setInst] = React.useState("0");
  const [moyenne, setMoyenne] = React.useState("0");
  const [reussite, setReussite] = React.useState("0");
  const [bulletins, setBulletins] = React.useState("0");
  const [observations, setObservations] = React.useState("");
  const [difficultes, setDifficultes] = React.useState("");
  const [recommandations, setRecommandations] = React.useState("");
  const [perspectives, setPerspectives] = React.useState("");

  const save = () => {
    const c = cafops.find((x) => x.id === cafopId);
    if (!c || !periode.trim() || !annee.trim()) {
      toast.error("Champs obligatoires", { description: "Sélectionnez le CAFOP et renseignez la période et l'année scolaire." });
      return;
    }
    onSave({
      id: `ra-${Date.now().toString(36)}`,
      cafopId: c.id,
      cafopName: c.name,
      type,
      periode: periode.trim(),
      annee: annee.trim(),
      statut: "brouillon",
      date: new Date().toISOString().slice(0, 10),
      auteur: "Directeur CAFOP",
      effectifs: { total: Number(total) || 0, ia: Number(ia) || 0, i: Number(inst) || 0 },
      resultats: { moyenne: Number(moyenne) || 0, reussite: Number(reussite) || 0, bulletins: Number(bulletins) || 0 },
      observations: observations.trim(),
      difficultes: difficultes.trim(),
      recommandations: recommandations.trim(),
      perspectives: perspectives.trim(),
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ew-gold-100 text-ew-orange">
              <Plus className="h-5 w-5" />
            </span>
            <DialogTitle>Nouveau Rapport d&apos;Activités</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>CAFOP *</Label>
            <Select value={cafopId} onValueChange={setCafopId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un CAFOP" />
              </SelectTrigger>
              <SelectContent>
                {cafops.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Type de rapport *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RA_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Période *</Label>
              <Input value={periode} onChange={(e) => setPeriode(e.target.value)} placeholder="Ex : Janvier 2026" />
            </div>
            <div className="space-y-1.5">
              <Label>Année scolaire *</Label>
              <Input value={annee} onChange={(e) => setAnnee(e.target.value)} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-foreground">Effectifs</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Total</Label>
                <Input type="number" min={0} value={total} onChange={(e) => setTotal(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>IA</Label>
                <Input type="number" min={0} value={ia} onChange={(e) => setIa(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>I</Label>
                <Input type="number" min={0} value={inst} onChange={(e) => setInst(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-foreground">Résultats</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Moyenne générale /20</Label>
                <Input type="number" min={0} max={20} step={0.01} value={moyenne} onChange={(e) => setMoyenne(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Taux de réussite %</Label>
                <Input type="number" min={0} max={100} value={reussite} onChange={(e) => setReussite(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Bulletins générés</Label>
                <Input type="number" min={0} value={bulletins} onChange={(e) => setBulletins(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observations</Label>
            <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Observations générales sur le déroulement des activités…" rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Difficultés rencontrées</Label>
            <Textarea value={difficultes} onChange={(e) => setDifficultes(e.target.value)} placeholder="Difficultés rencontrées durant la période…" rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Recommandations</Label>
            <Textarea value={recommandations} onChange={(e) => setRecommandations(e.target.value)} placeholder="Recommandations pour amélioration…" rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Perspectives</Label>
            <Textarea value={perspectives} onChange={(e) => setPerspectives(e.target.value)} placeholder="Perspectives et actions prévues…" rows={3} />
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-3">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button className={ORANGE_BTN} onClick={save}>
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VoirRapportDialog({ r, onClose }: { r: RapportActivite; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ew-gold-100 text-ew-orange">
              <FileText className="h-5 w-5" />
            </span>
            <div className="text-left">
              <DialogTitle className="flex flex-wrap items-center gap-2">
                {r.cafopName} <RaBadge statut={r.statut} />
              </DialogTitle>
              <DialogDescription>{r.type} — {r.periode} · Année scolaire {r.annee}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Effectifs</p>
              <ul className="space-y-1">
                <li className="flex justify-between"><span>Total</span><span className="font-bold">{r.effectifs.total}</span></li>
                <li className="flex justify-between"><span>Instituteurs Adjoints (IA)</span><span className="font-bold">{r.effectifs.ia}</span></li>
                <li className="flex justify-between"><span>Instituteurs (I)</span><span className="font-bold">{r.effectifs.i}</span></li>
              </ul>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Résultats</p>
              <ul className="space-y-1">
                <li className="flex justify-between"><span>Moyenne générale</span><span className="font-bold">{r.resultats.moyenne.toFixed(2)}/20</span></li>
                <li className="flex justify-between"><span>Taux de réussite</span><span className="font-bold">{r.resultats.reussite} %</span></li>
                <li className="flex justify-between"><span>Bulletins générés</span><span className="font-bold">{r.resultats.bulletins}</span></li>
              </ul>
            </div>
          </div>

          {[
            ["Observations", r.observations],
            ["Difficultés rencontrées", r.difficultes],
            ["Recommandations", r.recommandations],
            ["Perspectives", r.perspectives],
          ].map(([titre, contenu]) => (
            <div key={titre} className="rounded-xl border border-border p-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{titre}</p>
              <p className="text-foreground">{contenu || "—"}</p>
            </div>
          ))}

          <p className="text-xs text-muted-foreground">
            Rédigé le {formatDate(r.date)} — {r.auteur}
          </p>
        </div>

        <DialogFooter className="border-t border-border pt-3">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <Button
            className={ORANGE_BTN}
            onClick={async () => {
              await downloadReportPdf({ emblem: etabExportMeta().nationalEmblem, ...rapportActivitePayload(r) }, `${r.id}.pdf`);
              toast.success("Le rapport PDF est prêt", { description: "Le téléchargement a démarré." });
            }}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RapportsActivitesBlock({ cafops }: { cafops: Cafop[] }) {
  const [rapports, setRapports] = React.useState<RapportActivite[]>(() => rapportsActivitesSeed(cafops));
  const [fCafop, setFCafop] = React.useState("all");
  const [fType, setFType] = React.useState("all");
  const [fStatut, setFStatut] = React.useState("all");
  const [newOpen, setNewOpen] = React.useState(false);
  const [view, setView] = React.useState<RapportActivite | null>(null);

  const filtered = rapports.filter(
    (r) =>
      (fCafop === "all" || r.cafopId === fCafop) &&
      (fType === "all" || r.type === fType) &&
      (fStatut === "all" || r.statut === fStatut),
  );
  const countOf = (s: RapportActivite["statut"]) => rapports.filter((r) => r.statut === s).length;

  const exportPdf = async (r: RapportActivite) => {
    await downloadReportPdf({ emblem: etabExportMeta().nationalEmblem, ...rapportActivitePayload(r) }, `${r.id}.pdf`);
    toast.success("Le rapport PDF est prêt", { description: "Le téléchargement a démarré." });
  };

  return (
    <>
      {/* Bandeau d'en-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ew-orange/30 bg-ew-gold-100/30 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-orange text-white">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-bold text-foreground">Rapports d&apos;Activités CAFOP</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Suivi des rapports d&apos;activités des Centres d&apos;Animation et de Formation Pédagogique.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Liste actualisée", { description: `${rapports.length} rapport(s) chargé(s).` })}>
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
          <Button size="sm" className={ORANGE_BTN} onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4" /> Nouveau Rapport
          </Button>
        </div>
      </div>

      {/* Indicateurs */}
      <div id="ra-indicateurs" className="grid scroll-mt-24 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total rapports", value: rapports.length, icon: FileText, tone: "bg-blue-100 text-blue-600" },
          { label: "Brouillons", value: countOf("brouillon"), icon: Clock, tone: "bg-slate-100 text-slate-600" },
          { label: "Soumis", value: countOf("soumis"), icon: Send, tone: "bg-ew-gold-100 text-ew-gold-600" },
          { label: "Validés", value: countOf("valide"), icon: CheckCircle2, tone: "bg-ew-green-100 text-ew-green-700" },
          { label: "Rejetés", value: countOf("rejete"), icon: XCircle, tone: "bg-red-100 text-red-600" },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", k.tone)}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xl font-extrabold leading-tight text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtres */}
      <div id="ra-filtres" className="flex scroll-mt-24 flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Filter className="h-4 w-4" /> Filtres :
        </span>
        <Select value={fCafop} onValueChange={setFCafop}>
          <SelectTrigger className="h-9 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les CAFOP</SelectItem>
            {cafops.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fType} onValueChange={setFType}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {RA_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fStatut} onValueChange={setFStatut}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {(Object.keys(RA_STATUTS) as RapportActivite["statut"][]).map((s) => (
              <SelectItem key={s} value={s}>{RA_STATUTS[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Liste des rapports */}
      <SectionCard id="ra-liste" title={`Liste des Rapports (${filtered.length})`} contentClassName="p-0">
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">Aucun rapport ne correspond aux filtres.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ew-gold-100 text-ew-orange">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
                      {r.cafopName} <RaBadge statut={r.statut} />
                    </p>
                    <p className="text-xs text-muted-foreground">{r.type} — {r.periode}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {r.effectifs.total} élèves</span>
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Moy : {r.resultats.moyenne.toFixed(2)}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {r.resultats.reussite}% réussite</span>
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">{formatDate(r.date)}</p>
                    <p className="text-[11px] text-muted-foreground">{r.auteur}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setView(r)}>
                    <Eye className="h-4 w-4" /> Voir
                  </Button>
                  <Button size="sm" className={ORANGE_BTN} onClick={() => exportPdf(r)}>
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {newOpen && (
        <NouveauRapportDialog
          cafops={cafops}
          onClose={() => setNewOpen(false)}
          onSave={(r) => {
            setRapports((list) => [r, ...list]);
            setNewOpen(false);
            toast.success("Rapport d'activités enregistré", { description: `${r.cafopName} — ${r.type} (${r.periode}), statut Brouillon.` });
          }}
        />
      )}
      {view && <VoirRapportDialog r={view} onClose={() => setView(null)} />}
    </>
  );
}

function CafopRapportsTab({ cafops }: { cafops: Cafop[] }) {
  const [period, setPeriod] = React.useState("t3");
  const [scope, setScope] = React.useState(cafops[0]?.id ?? "");
  return (
    <>
      <SectionNav sections={RAPPORTS_SECTIONS} />
      <FloatingSectionNav sections={RAPPORTS_SECTIONS} />

      <RapportsActivitesBlock cafops={cafops} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Rapports" value={CAFOP_REPORTS.length} icon={FileText} tone="green" />
        <KpiCard label="Validés" value={CAFOP_REPORTS.filter((r) => r.status === "completed").length} icon={FileCheck2} tone="blue" />
        <KpiCard label="Brouillons" value={CAFOP_REPORTS.filter((r) => r.status === "draft").length} icon={Clock} tone="gold" />
        <KpiCard label="Générés (mois)" value={5} icon={FilePlus2} tone="purple" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard id="generer" title="Générer un rapport" description="Sélectionnez la période et le périmètre.">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Centre CAFOP</Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cafops.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Période</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="t1">1ᵉʳ Trimestre</SelectItem>
                  <SelectItem value="t2">2ᵉ Trimestre</SelectItem>
                  <SelectItem value="t3">3ᵉ Trimestre</SelectItem>
                  <SelectItem value="year">Année complète</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => toast.success("Rapport généré", { description: "Disponible dans la liste ci-contre." })}>
              <FilePlus2 className="h-4 w-4" /> Générer le rapport
            </Button>
          </div>
        </SectionCard>

        <SectionCard id="disponibles" title="Rapports disponibles" className="lg:col-span-2">
          <SimpleTable
            rows={CAFOP_REPORTS}
            getKey={(r) => r.id}
            columns={[
              {
                key: "title",
                header: "Rapport",
                render: (r) => (
                  <div>
                    <p className="font-semibold text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.scope} · {r.period}
                    </p>
                  </div>
                ),
              },
              { key: "author", header: "Auteur" },
              { key: "status", header: "Statut", render: (r) => <StatusBadge status={r.status} /> },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toast.info(`Aperçu : ${r.title}`)}>
                      <Eye className="h-4 w-4" /> Aperçu
                    </Button>
                    <ExportMenu filename={r.id} buildPayload={() => defaultReportPayload(r, "Côte d'Ivoire")} />
                  </div>
                ),
              },
            ]}
          />
        </SectionCard>
      </div>
    </>
  );
}

/* ------------------------- Modèle CSV (un modèle par pays) ------------------------- */
function buildTemplate(code: string): string {
  const regions = COUNTRIES.find((c) => c.code === code)?.academicRegions;
  const rows = (regions?.length ? regions.slice(0, 3).map((r) => r.name) : ["Région académique 1", "Région académique 2"]).map(
    (regionName, i) =>
      `CAFOP exemple ${i + 1};CAF-${code}-00${i + 1};2026-2027;${code};${regionName};Localité;BP ${100 + i};27 35 91 35 0${i};cafop${i + 1}@exemple.org;M. KOUASSI Jean;07 00 00 00 0${i}`,
  );
  return `${CSV_HEADER}\n${rows.join("\n")}`;
}

function TemplateCsvDialog({ onClose }: { onClose: () => void }) {
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
    a.download = `modele-cafop-${country.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Modèle téléchargé", { description: `Modèle CAFOP — ${getUnCountry(country)?.name ?? country}.` });
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-ew-orange" /> Modèle CSV par pays
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
          <Button className={ORANGE_BTN} onClick={download}>
            <Download className="h-4 w-4" /> Télécharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- Import CSV (cohorte) ------------------------------- */
function ImportCafopDialog({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (list: Omit<Cafop, "id">[], dest: string) => void;
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
    const list: Omit<Cafop, "id">[] = parsed.map((r, i) => {
      const [nom, code, annee, , region, localite, adresse, tel, email, directeur, contact] = r;
      return {
        name: nom || `CAFOP ${i + 1}`,
        code: (code || `CAF-${dest}-${String(i + 1).padStart(3, "0")}`).toUpperCase(),
        year: annee || "2026-2027",
        country: dest,
        region: region || "",
        locality: localite || "—",
        address: adresse || "",
        phone: tel || "",
        email: email || "",
        director: directeur || "",
        directorContact: contact || "",
        promotions: 0,
        cohortes: 0,
        eleves: 0,
      };
    });
    onImport(list, dest);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-ew-orange" /> Importer des CAFOP
          </DialogTitle>
          <DialogDescription>Téléversez un fichier CSV (un même pays par fichier).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
            <p className="flex items-center gap-1.5 text-sm font-bold text-blue-800">
              <Globe className="h-4 w-4" /> Pays de destination
            </p>
            <p className="mb-2 text-xs text-blue-700">Sélectionnez le pays pour tous les CAFOP de ce fichier.</p>
            <CountrySearchSelect value={dest} onChange={setDest} placeholder="Sélectionner un pays…" />
          </div>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 text-center transition-colors hover:border-ew-orange hover:bg-ew-gold-100/30"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UploadCloud className="h-6 w-6" />
            </span>
            {fileName ? (
              <>
                <span className="font-semibold text-ew-orange">{fileName}</span>
                <span className="text-xs text-muted-foreground">{parsed.length} CAFOP détecté(s) — cliquez pour changer</span>
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
          <Button className={ORANGE_BTN} disabled={!dest || parsed.length === 0} onClick={doImport}>
            <UploadCloud className="h-4 w-4" /> Importer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Nouveau CAFOP (capture 3) ----------------------------- */
function SectionTitle({ icon: Icon, children }: { icon: typeof Building2; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 border-b border-border pb-1.5 text-sm font-bold text-foreground">
      <Icon className="h-4 w-4 text-ew-orange" /> {children}
    </p>
  );
}

function NewCafopDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Omit<Cafop, "id">) => void }) {
  const [f, setF] = React.useState({
    name: "",
    code: "",
    year: "2026-2027",
    country: "",
    region: "",
    locality: "",
    address: "",
    phone: "",
    email: "",
    director: "",
    directorContact: "",
  });
  const [logo, setLogo] = React.useState<string | null>(null);
  const [stamp, setStamp] = React.useState<string | null>(null);
  const [signature, setSignature] = React.useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const canSubmit = f.name.trim().length > 1 && f.country.length === 2;

  const submit = () =>
    onCreate({
      ...f,
      name: f.name.trim(),
      code: (f.code.trim() || `CAF-${f.country}-${Date.now().toString(36).slice(-3).toUpperCase()}`).toUpperCase(),
      logo,
      stamp,
      signature,
      promotions: 0,
      cohortes: 0,
      eleves: 0,
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau CAFOP</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Informations générales */}
          <div className="space-y-3">
            <SectionTitle icon={Building2}>Informations générales</SectionTitle>
            <div className="space-y-1.5">
              <Label>Nom du CAFOP <span className="text-red-500">*</span></Label>
              <Input value={f.name} onChange={set("name")} placeholder="Ex: CAFOP Abengourou" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Code CAFOP</Label>
                <Input value={f.code} onChange={set("code")} placeholder="Ex: CAF-ABG-001" />
              </div>
              <div className="space-y-1.5">
                <Label>Année de formation</Label>
                <Input value={f.year} onChange={set("year")} />
              </div>
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
                <Input value={f.region} onChange={set("region")} placeholder="Ex: DRENA Indénié-Djuablin" />
              </div>
              <div className="space-y-1.5">
                <Label>Localité</Label>
                <Input value={f.locality} onChange={set("locality")} placeholder="Ex: Abengourou" />
              </div>
              <div className="space-y-1.5">
                <Label>Adresse</Label>
                <Input value={f.address} onChange={set("address")} placeholder="Ex: BP 121" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <SectionTitle icon={Phone}>Contact</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <Input value={f.phone} onChange={set("phone")} placeholder="Ex: 27 35 91 35 02" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={f.email} onChange={set("email")} placeholder="Ex: cafop.abengourou@gmail.com" />
              </div>
            </div>
          </div>

          {/* Direction */}
          <div className="space-y-3">
            <SectionTitle icon={UserRound}>Direction</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nom du Directeur</Label>
                <Input value={f.director} onChange={set("director")} placeholder="Ex: M. KOUASSI Jean" />
              </div>
              <div className="space-y-1.5">
                <Label>Contact du Directeur</Label>
                <Input value={f.directorContact} onChange={set("directorContact")} placeholder="Ex: 07 00 00 00 00" />
              </div>
            </div>
          </div>

          {/* Identité visuelle */}
          <div className="space-y-3">
            <SectionTitle icon={ImageIcon}>Identité visuelle</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              <ImageDrop label="Logo du CAFOP" value={logo} onChange={setLogo} icon={ImageIcon} />
              <ImageDrop label="Cachet" value={stamp} onChange={setStamp} icon={Stamp} />
              <ImageDrop label="Signature électronique" value={signature} onChange={setSignature} icon={PenLine} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button className={ORANGE_BTN} disabled={!canSubmit} onClick={submit}>
            <Save className="h-4 w-4" /> Créer le CAFOP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Référentiel des Modules --------------------------- */
type ModuleRow = { name: string; coef: number };

function ModulesDialog({
  modules,
  onClose,
  onSave,
}: {
  modules: ModuleRow[];
  onClose: () => void;
  onSave: (list: ModuleRow[]) => void;
}) {
  const [list, setList] = React.useState<ModuleRow[]>(modules.map((m) => ({ ...m })));
  const [newName, setNewName] = React.useState("");
  const [newCoef, setNewCoef] = React.useState("1");

  const move = (i: number, dir: -1 | 1) =>
    setList((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const setCoef = (i: number, v: string) =>
    setList((l) => l.map((m, idx) => (idx === i ? { ...m, coef: Math.max(1, Number(v) || 1) } : m)));

  const remove = (i: number) => setList((l) => l.filter((_, idx) => idx !== i));

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    if (list.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Ce module existe déjà");
      return;
    }
    setList((l) => [...l, { name, coef: Math.max(1, Number(newCoef) || 1) }]);
    setNewName("");
    setNewCoef("1");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ew-gold-100 text-ew-orange">
              <ListChecks className="h-5 w-5" />
            </span>
            <div className="text-left">
              <DialogTitle>Référentiel des Modules</DialogTitle>
              <DialogDescription>{list.length} module(s) — modifiable pour toute réforme pédagogique</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-sm text-blue-800">
          Le référentiel des modules est commun à tous les CAFOP : les réformes pédagogiques peuvent nécessiter
          l&apos;ajout, la suppression ou le reclassement de modules.
        </div>

        {/* Tableau des modules */}
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 text-left">Module</th>
                <th className="px-2 py-2 text-center">Coeff.</th>
                <th className="px-2 py-2 text-center">Ordre</th>
                <th className="px-2 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m, i) => (
                <tr key={m.name} className="border-t border-border/60">
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/60" />
                      <span className="font-medium text-foreground">{m.name}</span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <Input
                      type="number"
                      min={1}
                      value={m.coef}
                      onChange={(e) => setCoef(i, e.target.value)}
                      className="mx-auto h-8 w-16 text-center"
                      aria-label={`Coefficient de ${m.name}`}
                    />
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="flex items-center justify-center">
                      <span className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          aria-label={`Monter ${m.name}`}
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-25"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === list.length - 1}
                          aria-label={`Descendre ${m.name}`}
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-25"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label={`Supprimer ${m.name}`}
                      className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Aucun module — ajoutez-en ci-dessous.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ajouter un nouveau module */}
        <div className="rounded-xl border-2 border-dashed border-ew-orange/50 bg-ew-gold-100/30 p-3">
          <p className="mb-2 text-sm font-bold text-ew-orange">Ajouter un nouveau module</p>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Nom du module (ex: Psychopédagogie)"
              className="min-w-[200px] flex-1"
            />
            <span className="text-xs text-muted-foreground">Coeff.</span>
            <Input
              type="number"
              min={1}
              value={newCoef}
              onChange={(e) => setNewCoef(e.target.value)}
              className="h-10 w-16 text-center"
              aria-label="Coefficient du nouveau module"
            />
            <Button className={ORANGE_BTN} disabled={!newName.trim()} onClick={add}>
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setList(CAFOP_MODULES_DEFAULT.map((m) => ({ ...m })));
              toast("Référentiel réinitialisé", { description: "Modules par défaut restaurés (non validés)." });
            }}
          >
            <RotateCcw className="h-4 w-4" /> Réinitialiser par défaut
          </Button>
          <Button className={ORANGE_BTN} disabled={list.length === 0} onClick={() => onSave(list)}>
            <Check className="h-4 w-4" /> Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------ Vue détail d'un CAFOP : onglets pédagogiques ------------------ */
function CafopDetail({
  cafop,
  modules,
  years,
  onYearsChange,
  onBack,
}: {
  cafop: Cafop;
  modules: ModuleRow[];
  years: number;
  onYearsChange: (y: number) => void;
  onBack: () => void;
}) {
  const [sub, setSub] = React.useState<"cahier" | "registre" | "notes">("notes");
  const promos = promotionsFor(cafop, years);
  const [promo, setPromo] = React.useState(promos[0]);
  React.useEffect(() => {
    if (!promos.includes(promo)) setPromo(promos[0]);
  }, [promos, promo]);
  const [groupe, setGroupe] = React.useState(GROUPES[1]);
  const [semestre, setSemestre] = React.useState("2");
  const [eleveIdx, setEleveIdx] = React.useState(0);
  const [showBulletin, setShowBulletin] = React.useState(false);
  const [autoPrint, setAutoPrint] = React.useState(false);
  const eleves = elevesMaitres(cafop.id, promo, groupe);

  // Notes du groupe : base déterministe (mêmes graines que le bulletin) + saisies/suppressions locales.
  const groupKey = `${cafop.id}|${promo}|${groupe}|${semestre}`;
  const baseNotes = React.useMemo<CafopNote[]>(
    () =>
      elevesMaitres(cafop.id, promo, groupe).flatMap((e) =>
        modules.map((m) => {
          const s = seedOf(`${e.id}|${m.name}|${semestre}`);
          return {
            id: `${cafop.id}|${promo}|${groupe}|${semestre}|${e.id}|${m.name}`,
            key: `${cafop.id}|${promo}|${groupe}|${semestre}`,
            eleveId: e.id,
            module: m.name,
            type: TYPES_EVAL[s % TYPES_EVAL.length],
            note: Math.round((8 + (s % 110) / 10) * 100) / 100,
            bareme: 20,
            coef: m.coef,
          };
        }),
      ),
    [cafop.id, promo, groupe, semestre, modules],
  );
  const [addedNotes, setAddedNotes] = React.useState<CafopNote[]>([]);
  const [removedNotes, setRemovedNotes] = React.useState<Set<string>>(new Set());
  const classNotes = [...baseNotes, ...addedNotes].filter((n) => n.key === groupKey && !removedNotes.has(n.id));

  const notesOf = (eid: string) => classNotes.filter((n) => n.eleveId === eid);
  const moyenneOf = (eid: string) => {
    const ns = notesOf(eid);
    const tc = ns.reduce((a, n) => a + n.coef, 0);
    return tc ? ns.reduce((a, n) => a + (n.note / n.bareme) * 20 * n.coef, 0) / tc : 0;
  };
  const ranked = [...eleves].sort((a, b) => moyenneOf(b.id) - moyenneOf(a.id));

  const SUBS = [
    { id: "cahier" as const, label: "Cahier de texte", icon: BookOpen },
    { id: "registre" as const, label: "Registre d'appel", icon: ListChecks },
    { id: "notes" as const, label: "Notes et bulletins", icon: FileText },
  ];

  return (
    <div className="space-y-4">
      {/* En-tête du CAFOP + onglets */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" /> Retour
          </Button>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ew-gold-100 text-ew-orange">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-foreground">{cafop.name}</p>
            <p className="text-xs text-muted-foreground">
              {cafop.region} — {getUnCountry(cafop.country)?.name ?? cafop.country} · {promos.length} promotion(s) ·{" "}
              {GROUPES.length} groupes-classes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
          {SUBS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSub(s.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  sub === s.id ? "bg-background text-ew-orange shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <FloatingSectionNav
        sections={
          sub === "cahier"
            ? [
                { id: "cahier-indicateurs", label: "Indicateurs" },
                { id: "cahier-contenu", label: "Séances & demandes" },
              ]
            : sub === "registre"
              ? [
                  { id: "reg-filtres", label: "Filtres" },
                  { id: "bilan", label: "Bilan de l'appel" },
                  { id: "liste-eleves", label: "Liste des élèves-maîtres" },
                  { id: "heatmap", label: "Heatmap de présence" },
                ]
              : [
                  { id: "selection", label: "Sélection" },
                  { id: "saisie", label: "Ajouter une note" },
                  { id: "notes-classe", label: "Notes de la classe" },
                  { id: "bulletins", label: "Bulletins" },
                ]
        }
      />
      {sub === "cahier" && <CahierReadOnly modules={modules} />}
      {sub === "registre" && <RegistreReadOnly cafop={cafop} modules={modules} promo={promo} groupe={groupe} />}

      {sub === "notes" && (
        <>
        <SectionCard
          id="selection"
          title="Notes et bulletins"
          description="Les élèves-maîtres s'affichent par cohorte (promotion) et groupe-classe. Bulletin auto-renseigné : appréciations IA ajustables, conduite calculée depuis le registre d'appel."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Semestre</Label>
              <Select value={semestre} onValueChange={setSemestre}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Premier semestre</SelectItem>
                  <SelectItem value="2">Deuxième semestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Durée de formation — {getUnCountry(cafop.country)?.name ?? cafop.country}</Label>
              <Select value={String(years)} onValueChange={(v) => onYearsChange(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y} an{y > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cohorte (promotion)</Label>
              <Select value={promo} onValueChange={(v) => { setPromo(v); setEleveIdx(0); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {promos.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Groupe-classe</Label>
              <Select value={groupe} onValueChange={(v) => { setGroupe(v); setEleveIdx(0); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUPES.map((g) => (
                    <SelectItem key={g} value={g}>Groupe {g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Élève-maître — {promo} · Groupe {groupe} (25)</Label>
              <Select value={String(eleveIdx)} onValueChange={(v) => setEleveIdx(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eleves.map((e, i) => (
                    <SelectItem key={e.id} value={String(i)}>
                      {e.nom} {e.prenoms}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Modules évalués (référentiel configuré)</p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {modules.map((m) => (
                <li key={m.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{m.name}</span>
                  <Badge tone="gold">coef {m.coef}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex justify-end">
            <Button className={ORANGE_BTN} onClick={() => { setAutoPrint(false); setShowBulletin(true); }}>
              <FileText className="h-4 w-4" /> Voir le bulletin
            </Button>
          </div>
        </SectionCard>
        <NoteCafopForm
          modules={modules}
          promo={promo}
          groupe={groupe}
          eleves={eleves}
          onAdd={(n) =>
            setAddedNotes((a) => [...a, { ...n, id: `${groupKey}|add|${Date.now().toString(36)}`, key: groupKey }])
          }
        />

        <SectionCard id="notes-classe" title={`Notes de la classe (Groupe ${groupe} — Semestre ${semestre})`} contentClassName="p-0 overflow-x-auto">
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="sticky top-0 border-b border-border bg-muted/60">
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 text-left">Élève</th>
                  <th className="px-4 py-2.5 text-left">Module</th>
                  <th className="px-4 py-2.5 text-left">Type</th>
                  <th className="px-4 py-2.5 text-center">Note</th>
                  <th className="px-4 py-2.5 text-center">Barème</th>
                  <th className="px-4 py-2.5 text-center">Coef.</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {classNotes.map((n) => {
                  const e = eleves.find((x) => x.id === n.eleveId);
                  return (
                    <tr key={n.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-2 font-medium text-foreground">{e ? `${e.nom} ${e.prenoms}` : "—"}</td>
                      <td className="px-4 py-2">{n.module}</td>
                      <td className="px-4 py-2">
                        <Badge tone={n.type === "Exposé" ? "teal" : n.type === "Interrogation écrite" ? "gold" : "blue"}>{n.type}</Badge>
                      </td>
                      <td className="px-4 py-2 text-center font-bold text-foreground">{n.note}</td>
                      <td className="px-4 py-2 text-center text-muted-foreground">/{n.bareme}</td>
                      <td className="px-4 py-2 text-center">{n.coef}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => setRemovedNotes((prev) => new Set(prev).add(n.id))}
                          className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard id="bulletins" title={`Bulletins (Groupe ${groupe} — Semestre ${semestre})`}>
          <div className="space-y-2">
            {ranked.map((s, ri) => {
              const moy = moyenneOf(s.id);
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ew-green-100 text-sm font-bold text-ew-green-800">{ri + 1}</span>
                    <div>
                      <p className="font-bold text-foreground">{s.nom} {s.prenoms}</p>
                      <p className="text-xs text-muted-foreground">Semestre {semestre}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-center">
                      <p className="text-[11px] uppercase text-muted-foreground">Notes</p>
                      <p className="font-bold text-foreground">{notesOf(s.id).length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] uppercase text-muted-foreground">Moyenne</p>
                      <p className="font-extrabold text-ew-green-700">{moy.toFixed(2)}<span className="text-xs font-bold text-muted-foreground">/20</span></p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEleveIdx(eleves.findIndex((x) => x.id === s.id));
                        setAutoPrint(false);
                        setShowBulletin(true);
                      }}
                    >
                      <Eye className="h-4 w-4" /> Voir détails
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEleveIdx(eleves.findIndex((x) => x.id === s.id));
                        setAutoPrint(true);
                        setShowBulletin(true);
                      }}
                    >
                      <Download className="h-4 w-4" /> Télécharger PDF
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
        </>
      )}

      {showBulletin && (
        <BulletinCafopModal
          cafop={cafop}
          modules={modules}
          semestre={semestre}
          promo={promo}
          groupe={groupe}
          index={eleveIdx}
          autoPrint={autoPrint}
          onNav={(d) => setEleveIdx((i) => Math.min(eleves.length - 1, Math.max(0, i + d)))}
          onClose={() => setShowBulletin(false)}
        />
      )}
    </div>
  );
}

/* ------------- Cahier de texte (copie exacte du module établissements) ------------- */
function CahierReadOnly({ modules }: { modules: ModuleRow[] }) {
  const readOnly = () =>
    toast.info("Lecture seule", { description: "Copie du module des établissements scolaires — consultation uniquement." });

  const mod = (i: number, fallback: string) => modules[i]?.name ?? fallback;
  const seances = [
    { id: "cs-1", module: mod(0, "Droits de l'Homme"), groupe: "F2", title: "Les droits fondamentaux de l'enfant", status: "published", prof: EM_PROFS[1], date: "2026-06-09" },
    { id: "cs-2", module: mod(1, "Gestion des classes à profil spécifique"), groupe: "F1", title: "Gérer une classe multigrade", status: "published", prof: EM_PROFS[0], date: "2026-06-09" },
    { id: "cs-3", module: mod(3, "Éducation à la santé"), groupe: "F3", title: "Hygiène et santé en milieu scolaire", status: "draft", prof: EM_PROFS[3], date: "2026-06-08" },
    { id: "cs-4", module: mod(modules.length - 1, "Stage pratique"), groupe: "F2", title: "Préparation de la leçon d'essai", status: "draft", prof: EM_PROFS[2], date: "2026-06-07" },
  ];
  const demandes = [
    { id: "cd-1", requester: "Élève-maître — KOUADIO Koffi Jean", entry: `${seances[0].module} (F2)` },
    { id: "cd-2", requester: "Encadreur de stage", entry: `${seances[3].module} (F2)` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={readOnly}>
          <Plus className="h-4 w-4" /> Nouvelle séance
        </Button>
      </div>

      <div id="cahier-indicateurs" className="grid scroll-mt-24 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Séances saisies" value={seances.length} icon={BookOpen} tone="green" />
        <KpiCard label="Publiées" value={seances.filter((s) => s.status === "published").length} icon={Check} tone="blue" />
        <KpiCard label="Brouillons" value={seances.filter((s) => s.status === "draft").length} icon={ClipboardList} tone="gold" />
        <KpiCard label="Demandes d'accès" value={demandes.length} icon={KeyRound} tone="purple" />
      </div>

      <TwoColumn id="cahier-contenu" className="lg:grid-cols-[2fr_1fr]">
        <SectionCard title="Séances">
          <div className="space-y-3">
            {seances.map((e) => (
              <div key={e.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone="green">{e.module}</Badge>
                    <Badge tone="slate">{e.groupe}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={e.status} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Modifier la séance" onClick={readOnly}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="mt-2 font-bold text-foreground">{e.title}</h3>
                <div className="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                  <span className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" /> Objectifs définis
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5" /> Devoirs assignés
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {e.prof} · {formatDate(e.date)}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Demandes d'accès" description="À valider">
          <ul className="space-y-3">
            {demandes.map((r) => (
              <li key={r.id} className="rounded-lg border border-border p-3">
                <p className="font-semibold text-foreground">{r.requester}</p>
                <p className="text-xs text-muted-foreground">{r.entry}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={readOnly}>
                    Accorder
                  </Button>
                  <Button size="sm" variant="outline" onClick={readOnly}>
                    Refuser
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </TwoColumn>
    </div>
  );
}

/* ------- Registre d'appel (structure identique au module établissements, inerte) ------- */
function RoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function RoStat({ label, value, icon: Icon, color }: { label: string; value: number; icon?: typeof Users; color: string }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </p>
      <p className={cn("text-2xl font-extrabold", color)}>{value}</p>
    </div>
  );
}

function RegistreReadOnly({ cafop, modules, promo, groupe }: { cafop: Cafop; modules: ModuleRow[]; promo: string; groupe: string }) {
  const readOnly = () =>
    toast.info("Lecture seule", { description: "Copie du module des établissements scolaires — consultation uniquement." });
  const eleves = elevesMaitres(cafop.id, promo, groupe);
  const country = getUnCountry(cafop.country);

  const statusOf = (id: string): "P" | "A" | "R" => {
    const s = seedOf(`${id}|appel`) % 10;
    return s < 7 ? "P" : s < 9 ? "R" : "A";
  };
  const rows = eleves.map((e, i) => {
    const c = conduiteFromRegistre(e.id);
    const st = statusOf(e.id);
    return {
      ...e,
      n: i + 1,
      sexe: seedOf(e.id) % 2 === 0 ? "F" : "M",
      st,
      motif: st === "A" ? "Maladie" : st === "R" ? "Transport" : "",
      cA: c.absJ + c.absNJ,
      cR: c.retards,
      obs: c.observations,
      enc: seedOf(`${e.id}|enc`) % 4 === 0,
      cond: c.note,
    };
  });
  const bilan = {
    total: rows.length,
    present: rows.filter((r) => r.st === "P").length,
    absent: rows.filter((r) => r.st === "A").length,
    retard: rows.filter((r) => r.st === "R").length,
    enc: rows.filter((r) => r.enc).length,
    obs: rows.reduce((a, r) => a + r.obs, 0),
    inf: rows.filter((r) => seedOf(`${r.id}|inf`) % 12 === 0).length,
    sms: rows.filter((r) => r.cA >= 3).length,
  };
  const stCls: Record<string, string> = {
    P: "border-ew-green-600 bg-ew-green-100 text-ew-green-800",
    A: "border-red-500 bg-red-100 text-red-700",
    R: "border-ew-gold-500 bg-ew-gold-100 text-ew-gold-600",
  };
  const fakeSelect = (value: string) => (
    <button
      type="button"
      onClick={readOnly}
      className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-sm shadow-sm"
    >
      <span className="truncate">{value}</span>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
    </button>
  );

  const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
  const creneaux = ["07h30", "09h45", "12h00", "14h00", "15h30"];

  return (
    <div className="space-y-4">
      {/* Bandeau officiel */}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3 text-center">
        <div className="mx-auto">
          <p className="text-sm font-bold uppercase tracking-wide text-foreground">{country?.official ?? ""}</p>
          {country?.devise && <p className="text-xs italic text-muted-foreground">{country.devise}</p>}
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{country?.ministry ?? ""}</p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          Année scolaire : <span className="font-semibold text-foreground">{cafop.year}</span>
        </p>
      </div>

      {/* Filtres */}
      <div id="reg-filtres" className="grid scroll-mt-24 gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-5">
        <RoField label="Groupe-classe">{fakeSelect(`Groupe ${groupe}`)}</RoField>
        <RoField label="Module (matière)">{fakeSelect(modules[0]?.name ?? "Droits de l'Homme")}</RoField>
        <RoField label="Heure de la séance">{fakeSelect("07h30 - 08h30")}</RoField>
        <RoField label="Date">
          <Input value="01/06/2026" readOnly onClick={readOnly} className="h-9" />
        </RoField>
        <RoField label="Rechercher">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Nom ou prénom…" readOnly onClick={readOnly} className="h-9 pl-8" />
          </div>
        </RoField>
      </div>

      {/* Bilan de l'appel */}
      <SectionCard id="bilan" title="Bilan de l'appel" contentClassName="pt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          <RoStat label="Effectif total" value={bilan.total} icon={Users} color="text-foreground" />
          <RoStat label="Présents (P)" value={bilan.present} color="text-ew-green-700" />
          <RoStat label="Absents (A)" value={bilan.absent} color="text-red-600" />
          <RoStat label="Retards (R)" value={bilan.retard} color="text-ew-gold-600" />
          <RoStat label="Encouragements" value={bilan.enc} icon={ThumbsUp} color="text-ew-green-700" />
          <RoStat label="Observations" value={bilan.obs} icon={Eye} color="text-red-600" />
          <RoStat label="Infirmerie" value={bilan.inf} icon={HeartPulse} color="text-blue-600" />
          <RoStat label="Alertes SMS" value={bilan.sms} icon={MessageSquare} color="text-ew-gold-600" />
        </div>
      </SectionCard>

      {/* Liste des élèves-maîtres */}
      <SectionCard
        id="liste-eleves"
        title={`Liste des élèves-maîtres — Groupe ${groupe}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={readOnly}>Tout P</Button>
            <Button variant="outline" size="sm" onClick={readOnly}>Tout A</Button>
          </div>
        }
        contentClassName="p-0 overflow-x-auto"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-sm">
          <span className="font-medium text-foreground">0 sélectionné(s)</span>
          <span className="text-xs text-muted-foreground">· Sélection rapide :</span>
          <Button variant="outline" size="sm" onClick={readOnly}>Absents</Button>
          <Button variant="outline" size="sm" onClick={readOnly}>Retards</Button>
          <Button variant="outline" size="sm" onClick={readOnly}>Alerte SMS (≥ 3)</Button>
          <Button size="sm" className="ml-auto" onClick={readOnly}>
            <Send className="h-4 w-4" /> SMS aux parents
          </Button>
        </div>
        <table className="w-full min-w-[980px] text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr className="text-xs uppercase tracking-wide text-muted-foreground">
              <th className="w-9 px-3 py-2.5">
                <input type="checkbox" aria-label="Tout sélectionner" className="h-4 w-4 align-middle accent-ew-green-700" checked={false} onChange={readOnly} />
              </th>
              <th className="px-3 py-2.5 text-left">N°</th>
              <th className="px-3 py-2.5 text-left">Nom et Prénom</th>
              <th className="px-3 py-2.5 text-center">Sexe</th>
              <th className="px-3 py-2.5 text-center">Statut</th>
              <th className="px-3 py-2.5 text-left">Motif</th>
              <th className="px-3 py-2.5 text-center">Cumul</th>
              <th className="px-3 py-2.5 text-center">Actions</th>
              <th className="px-3 py-2.5 text-center">Conduite</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-3 py-2">
                  <input type="checkbox" aria-label={`Sélectionner ${r.prenoms} ${r.nom}`} className="h-4 w-4 align-middle accent-ew-green-700" checked={false} onChange={readOnly} />
                </td>
                <td className="px-3 py-2 text-muted-foreground">{r.n}</td>
                <td className="px-3 py-2">
                  <div>
                    <span className="font-bold text-foreground">{r.nom}</span>{" "}
                    <span className="text-foreground">{r.prenoms}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">né(e) le {r.naissance}</p>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold", r.sexe === "F" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700")}>{r.sexe}</span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-center gap-1">
                    {(["P", "A", "R"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={readOnly}
                        aria-label={`Statut ${st}`}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold",
                          r.st === st ? stCls[st] : "border-border text-muted-foreground",
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {r.motif ? <span className="text-xs text-foreground">{r.motif}</span> : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1">
                    {r.cA > 0 && <Badge tone="red">{r.cA}A</Badge>}
                    {r.cR > 0 && <Badge tone="gold">{r.cR}R</Badge>}
                    {r.cA === 0 && r.cR === 0 && <span className="text-xs text-muted-foreground">0</span>}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <button onClick={readOnly} title="Encouragement" className={cn("rounded p-1", r.enc ? "bg-ew-green-100 text-ew-green-700" : "text-muted-foreground")}><ThumbsUp className="h-3.5 w-3.5" /></button>
                    <button onClick={readOnly} title="Observation" className={cn("rounded p-1", r.obs > 0 ? "bg-orange-100 text-orange-600" : "text-muted-foreground")}><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={readOnly} title="Infirmerie" className="rounded p-1 text-muted-foreground"><HeartPulse className="h-3.5 w-3.5" /></button>
                    <button onClick={readOnly} title="Envoyer un SMS" className="rounded p-1 text-muted-foreground"><MessageSquare className="h-3.5 w-3.5" /></button>
                    {r.cA > 0 && (
                      <button onClick={readOnly} className="ml-1 flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white">
                        <History className="h-3 w-3" /> Justifier ({r.cA})
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={cn(
                      "inline-flex min-w-[3.2rem] justify-center rounded-md px-2 py-1 text-sm font-bold",
                      r.cond >= 14 ? "bg-ew-green-100 text-ew-green-700" : r.cond >= 10 ? "bg-blue-100 text-blue-700" : r.cond >= 8 ? "bg-ew-gold-100 text-ew-gold-600" : "bg-red-100 text-red-600",
                    )}
                    title="Note de conduite calculée automatiquement — reprise sur le bulletin"
                  >
                    {r.cond.toFixed(1)}/20
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Barre SMS / Enregistrer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-lg bg-ew-gold-100 px-3 py-1.5 text-xs font-semibold text-ew-gold-600">
            <MessageSquare className="h-3.5 w-3.5" /> Seuil d&apos;alerte SMS : 3 absences
          </span>
          <Button variant="outline" onClick={readOnly}>
            <Send className="h-4 w-4" /> SMS groupé
          </Button>
        </div>
        <Button onClick={readOnly}>
          <Save className="h-4 w-4" /> Enregistrer
        </Button>
      </div>

      {/* Heatmap de présence */}
      <SectionCard id="heatmap" title="Heatmap de présence" description="Taux de présence par jour et créneau">
        <div className="overflow-x-auto">
          <div className="inline-grid grid-cols-[56px_repeat(5,minmax(56px,1fr))] gap-1.5">
            <span />
            {jours.map((j) => (
              <span key={j} className="text-center text-[11px] font-semibold text-muted-foreground">{j}</span>
            ))}
            {creneaux.map((c) => (
              <React.Fragment key={c}>
                <span className="self-center text-[11px] text-muted-foreground">{c}</span>
                {jours.map((j) => {
                  const v = 0.55 + ((seedOf(`${cafop.id}|${groupe}|${c}|${j}`) % 45) / 100);
                  return (
                    <span
                      key={j}
                      title={`${Math.round(v * 100)} % de présence`}
                      className="flex h-8 items-center justify-center rounded-md text-[10px] font-semibold text-white"
                      style={{ backgroundColor: `rgba(23,107,69,${(0.25 + (v - 0.55)) * 1.6 + 0.2})` }}
                    >
                      {Math.round(v * 100)}%
                    </span>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Copie du module des établissements scolaires — lecture seule, données propres au CAFOP.</p>
      </SectionCard>
    </div>
  );
}

/* --------- Ajouter une note : saisie individuelle ou dépôt CSV par cohorte --------- */
const TYPES_EVAL = ["Devoir surveillé", "Interrogation écrite", "Devoir de maison", "Exposé", "Composition"];

/** Note d'un élève-maître ; `key` identifie la cohorte (CAFOP, promotion, groupe, semestre). */
type CafopNote = {
  id: string;
  key: string;
  eleveId: string;
  module: string;
  type: string;
  note: number;
  bareme: number;
  coef: number;
};

function NoteCafopForm({
  modules,
  promo,
  groupe,
  eleves,
  onAdd,
}: {
  modules: ModuleRow[];
  promo: string;
  groupe: string;
  eleves: EleveMaitre[];
  onAdd: (n: { eleveId: string; module: string; type: string; note: number; bareme: number; coef: number }) => void;
}) {
  const [eleveId, setEleveId] = React.useState("");
  const [moduleName, setModuleName] = React.useState(modules[0]?.name ?? "");
  const [type, setType] = React.useState(TYPES_EVAL[0]);
  const [note, setNote] = React.useState("");
  const [bareme, setBareme] = React.useState("20");
  const [coeff, setCoeff] = React.useState(String(modules[0]?.coef ?? 1));

  const save = () => {
    if (!eleveId || note === "") {
      toast.error("Sélectionnez l'élève-maître et saisissez la note");
      return;
    }
    const e = eleves.find((x) => x.id === eleveId);
    onAdd({ eleveId, module: moduleName, type, note: Number(note), bareme: Number(bareme) || 20, coef: Number(coeff) || 1 });
    toast.success("Note enregistrée", {
      description: `${e?.nom} ${e?.prenoms} — ${moduleName} (${type}) : ${note}/${bareme || "20"}, coef ${coeff || "1"} · ${promo} · Groupe ${groupe}.`,
    });
    setNote("");
  };

  return (
    <SectionCard
      id="saisie"
      title="Ajouter une note"
      action={
        <ImportCsvDialog
          title="Importer des notes"
          description={`Dépôt par cohorte — ${promo} · Groupe ${groupe}. Une ligne par note : Nom Prénom ; Module ; Type ; Note ; Barème ; Coefficient.`}
          expectedColumns={["eleve", "module", "type", "note", "bareme", "coefficient"]}
          sampleRow={["Kouadio Aya", modules[0]?.name ?? "Droits de l'Homme", "Devoir surveillé", "14", "20", String(modules[0]?.coef ?? 1)]}
          templateFilename="modele-notes-cafop.csv"
          trigger={(open) => (
            <Button variant="outline" size="sm" onClick={open}>
              <UploadCloud className="h-4 w-4" /> Importer un CSV
            </Button>
          )}
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RoField label="Élève">
          <Select value={eleveId} onValueChange={setEleveId}>
            <SelectTrigger><SelectValue placeholder="Tapez un nom ou prénom…" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Élèves-maîtres — {promo} · Groupe {groupe}</SelectLabel>
                {eleves.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nom} {e.prenoms}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </RoField>
        <RoField label="Module (matière)">
          <Select value={moduleName} onValueChange={(v) => { setModuleName(v); setCoeff(String(modules.find((m) => m.name === v)?.coef ?? 1)); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {modules.map((m) => (
                <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </RoField>
        <RoField label="Type d'évaluation">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES_EVAL.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </RoField>
        <RoField label="Note">
          <Input type="number" min={0} max={Number(bareme) || 20} step={0.25} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex : 14" />
        </RoField>
        <RoField label="Barème (total points)">
          <Input type="number" min={1} value={bareme} onChange={(e) => setBareme(e.target.value)} />
        </RoField>
        <RoField label="Coefficient">
          <Input type="number" min={1} value={coeff} onChange={(e) => setCoeff(e.target.value)} />
        </RoField>
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
        <p className="font-bold uppercase tracking-wide">Format CSV attendu</p>
        <p className="font-mono">Nom Prénom ; Module ; Type ; Note ; Barème ; Coefficient</p>
        <p className="font-mono">{`Kouadio Aya ; ${modules[0]?.name ?? "Droits de l'Homme"} ; Devoir surveillé ; 14 ; 20 ; ${modules[0]?.coef ?? 1}`}</p>
      </div>
      <div className="mt-3 flex justify-end">
        <Button onClick={save}>
          <Plus className="h-4 w-4" /> Enregistrer la note
        </Button>
      </div>
    </SectionCard>
  );
}

/* ------------------- Bulletin de notes CAFOP (modèle officiel) ------------------- */
function BulletinCafopModal({
  cafop,
  modules,
  semestre,
  promo,
  groupe,
  index,
  autoPrint = false,
  onNav,
  onClose,
}: {
  cafop: Cafop;
  modules: ModuleRow[];
  semestre: string;
  promo: string;
  groupe: string;
  index: number;
  autoPrint?: boolean;
  onNav: (d: -1 | 1) => void;
  onClose: () => void;
}) {
  const d = bulletinData(cafop, modules, promo, groupe, index, semestre);
  const [variant, setVariant] = React.useState(0);

  React.useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);
  const [apprec, setApprec] = React.useState(() => aiApprecPrincipal(d.moyenne, 0));
  React.useEffect(() => {
    setApprec(aiApprecPrincipal(d.moyenne, 0));
    setVariant(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, groupe, semestre]);

  const tableauHonneur = d.moyenne >= 12;
  const encouragements = d.moyenne >= 10 && d.moyenne < 12;
  const felicitations = d.moyenne >= 16;
  const avertissement = d.conduite.note < 10;
  const cell = "border border-black px-2 py-1.5";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[94vh] max-w-3xl overflow-y-auto p-0" aria-describedby={undefined}>
        <div className="no-print flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            Bulletin — {d.e.nom} {d.e.prenoms}
            <span className="text-xs font-normal text-muted-foreground">({index + 1}/25 · Groupe {groupe} · {promo})</span>
          </DialogTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={index === 0} onClick={() => onNav(-1)} aria-label="Élève précédent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" disabled={index === 24} onClick={() => onNav(1)} aria-label="Élève suivant">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" className={ORANGE_BTN} onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Télécharger PDF
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>

        <div id="bulletin-print" className="bg-white p-5 text-[11px] text-black" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
          <div className="border-2 border-black">
            {/* En-tête */}
            <div className="grid grid-cols-[1fr_1.4fr] border-b-2 border-black">
              <div className="border-r-2 border-black p-2 text-center leading-tight">
                <p className="font-bold uppercase">République de Côte d&apos;Ivoire</p>
                <p className="text-[10px]">Union-Discipline-Travail</p>
                <p className="mt-1 font-bold">M.E.N.A.</p>
                <p className="text-[10px] uppercase">D.R.E.N.A {cafop.region.replace(/^DRENA\s*/i, "")}</p>
                <p className="mt-1 text-[14px] font-extrabold uppercase tracking-wide">CAFOP</p>
                <p className="font-bold uppercase">{cafop.locality}</p>
                <p className="mt-1 text-[9px]">BP : {cafop.address.replace(/^BP\s*/i, "")} – TEL : {cafop.phone.replace(/^\+225\s*/, "")}</p>
                <p className="text-[9px]">E-mail : {cafop.email}</p>
                <div className="mx-auto mt-1 flex h-12 w-24 items-center justify-center">
                  {cafop.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cafop.logo} alt="Logo" className="max-h-12 object-contain" />
                  ) : (
                    <span className="rounded border border-black/40 px-2 py-1 text-[8px] uppercase text-black/50">Logo CAFOP</span>
                  )}
                </div>
              </div>
              <div className="p-2">
                <p className="text-right text-[10px]">
                  <span className="font-bold uppercase">Année scolaire :</span> {cafop.year}
                </p>
                <p className="text-center text-[18px] font-extrabold uppercase tracking-wide">Bulletin de Notes</p>
                <p className="text-center text-[12px] font-bold uppercase">{semestre === "1" ? "Premier" : "Deuxième"} semestre</p>
                <div className="mt-2 space-y-0.5 border-t border-black pt-1.5">
                  {[
                    ["NOM", d.e.nom],
                    ["PRÉNOMS", d.e.prenoms],
                    ["DATE NAISSANCE", d.e.naissance],
                    ["GROUPE-CLASSE", groupe],
                    ["EFFECTIF", "25"],
                    ["PROF. PRINCIPAL", EM_PROFS[seedOf(`${cafop.id}|${groupe}`) % EM_PROFS.length]],
                  ].map(([k, v]) => (
                    <p key={k} className="flex gap-2">
                      <span className="w-32 shrink-0 font-bold underline">{k}</span>
                      <span>: {v}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Tableau des modules (référentiel configuré) */}
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className={`${cell} text-left uppercase`}>Modules</th>
                  <th className={`${cell} uppercase`}>Moy/20</th>
                  <th className={`${cell} uppercase`}>Coef</th>
                  <th className={`${cell} uppercase`}>Rang</th>
                  <th className={`${cell} uppercase`}>Appréciation</th>
                  <th className={`${cell} uppercase`}>Nom et émargement des professeurs</th>
                </tr>
              </thead>
              <tbody>
                {d.rows.map((r) => (
                  <tr key={r.name}>
                    <td className={`${cell} font-bold uppercase`}>{r.name}</td>
                    <td className={`${cell} text-center font-bold`}>{r.moy.toFixed(2)}</td>
                    <td className={`${cell} text-center`}>{r.coef}</td>
                    <td className={`${cell} text-center`}>{r.rang}</td>
                    <td className={`${cell} text-center`}>{r.appr}</td>
                    <td className={`${cell} text-left italic`}>{r.prof}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Conduite / Stage / Totaux */}
            <div className="grid grid-cols-5 border-t-2 border-black text-center text-[10px]">
              <div className="border-r border-black p-1.5">
                <p className="font-bold uppercase underline">Conduite</p>
                <p className="text-[12px] font-bold">{d.conduite.note.toFixed(2)} / 20</p>
                <p className="no-print text-[8px] italic text-gray-500">
                  Auto : registre d&apos;appel ({d.conduite.absNJ} abs. non just., {d.conduite.retards} retard{d.conduite.retards > 1 ? "s" : ""}) + {d.conduite.observations} observation(s)
                </p>
              </div>
              <div className="border-r border-black p-1.5">
                <p className="font-bold uppercase underline">Note de stage</p>
                <p className="text-[12px] font-bold">{d.stage.toFixed(2)} / 20</p>
              </div>
              <div className="border-r border-black p-1.5">
                <p className="font-bold uppercase underline">Total général</p>
                <p className="text-[12px] font-bold">{d.total.toFixed(2)} / {d.totalCoef * 20}</p>
              </div>
              <div className="border-r border-black p-1.5">
                <p className="font-bold uppercase underline">Moyenne</p>
                <p className="text-[12px] font-bold">{d.moyenne.toFixed(2)} / 20</p>
              </div>
              <div className="p-1.5">
                <p className="font-bold uppercase underline">Rang</p>
                <p className="text-[12px] font-bold">{d.rang} / 25</p>
              </div>
            </div>

            {/* Absences / Moyenne annuelle / Appréciation principal */}
            <div className="grid grid-cols-[1fr_1fr_1fr_1.4fr] border-t-2 border-black text-[10px]">
              <div className="border-r border-black p-1.5">
                <p className="font-bold uppercase underline">Absences</p>
                <p>Justifiées : {d.conduite.absJ} h</p>
                <p>Non justifiées : {d.conduite.absNJ} h</p>
              </div>
              <div className="border-r border-black p-1.5 text-center">
                <p className="font-bold uppercase underline">Moyenne annuelle</p>
                <p className="text-[12px] font-bold">{d.moyAnnuelle.toFixed(2)} / 20</p>
              </div>
              <div className="border-r border-black p-1.5 text-center">
                <p className="font-bold uppercase underline">Rang annuel</p>
                <p className="text-[12px] font-bold">{d.rangAnnuel} / 25</p>
              </div>
              <div className="p-1.5 text-center">
                <p className="font-bold uppercase underline">Appréciation du Professeur Principal</p>
                <p className="hidden whitespace-pre-line font-semibold print:block">{apprec}</p>
                <div className="no-print mt-1 space-y-1">
                  <Textarea value={apprec} onChange={(e) => setApprec(e.target.value)} rows={2} className="bg-white text-center text-[11px] text-black" />
                  <button
                    onClick={() => { const v = variant + 1; setVariant(v); setApprec(aiApprecPrincipal(d.moyenne, v)); }}
                    className="mx-auto flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 hover:bg-purple-200"
                  >
                    <Sparkles className="h-3 w-3" /> Suggestion IA
                  </button>
                </div>
              </div>
            </div>

            {/* Distinctions / Décision */}
            <div className="grid grid-cols-[1fr_1.4fr] border-t-2 border-black text-[10px]">
              <div className="flex items-start gap-3 border-r border-black p-1.5">
                <p className="w-24 shrink-0 pt-1 font-bold uppercase underline">Distinctions</p>
                <div className="space-y-0.5">
                  {[
                    ["Tableau d'honneur", tableauHonneur],
                    ["Encouragements", encouragements],
                    ["Félicitations", felicitations],
                  ].map(([label, on]) => (
                    <p key={String(label)} className="flex items-center gap-2">
                      <span>{label as string}</span>
                      <span className="flex h-4 w-6 items-center justify-center border border-black text-[10px] font-bold">{on ? "X" : ""}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-1.5 text-center">
                <p className="font-bold uppercase underline">Décision du Conseil de Classe</p>
                <p className="mt-2 font-semibold">{semestre === "2" ? "Se référer à la décision de la DECO" : "Admis(e) à poursuivre la formation"}</p>
              </div>
            </div>

            {/* Sanctions / Directeur */}
            <div className="grid grid-cols-[1fr_1.4fr] border-t-2 border-black text-[10px]">
              <div className="flex items-start gap-3 border-r border-black p-1.5">
                <p className="w-24 shrink-0 pt-1 font-bold uppercase underline">Sanctions</p>
                <div className="space-y-0.5">
                  {[
                    ["Avertissement", avertissement],
                    ["Blâme", false],
                  ].map(([label, on]) => (
                    <p key={String(label)} className="flex items-center gap-2">
                      <span>{label as string}</span>
                      <span className="flex h-4 w-6 items-center justify-center border border-black text-[10px] font-bold">{on ? "X" : ""}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="relative p-1.5 pb-10 text-center">
                <p className="font-bold uppercase underline">Le Directeur</p>
                {cafop.signature && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cafop.signature} alt="Signature" className="mx-auto mt-1 h-9 object-contain" />
                )}
                <p className="mt-1 text-[9px] font-semibold">{cafop.director}</p>
                {cafop.stamp && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cafop.stamp} alt="Cachet" className="pointer-events-none absolute bottom-1 right-5 h-14 w-14 object-contain opacity-80" />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
