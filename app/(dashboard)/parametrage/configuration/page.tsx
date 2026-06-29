/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Settings,
  Upload,
  Download,
  RotateCcw,
  ChevronDown,
  Search,
  ImageIcon,
  PenLine,
  Plus,
  Minus,
  Trash2,
  GripVertical,
  Save,
  Users,
  UserPlus,
  Calculator,
  RefreshCw,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImportCsvDialog } from "@/components/forms/import-csv-dialog";
import { buildCsvTemplate } from "@/lib/imports/csv";
import { UN_COUNTRIES, getUnCountry, flagUrl } from "@/config/un-countries";
import { defaultNationalEmblem, REPORT_PLAN_OPTIONS, REPORT_FORMAT_OPTIONS } from "@/lib/etab-config";
import { useApp } from "@/components/app-shell/app-context";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { fetchEtabConfig, saveEtabConfig } from "@/lib/etab-config-server";
import { COUNTRIES } from "@/config/countries";
import { toFullNameCase } from "@/lib/format-name";
import { cn, initials } from "@/lib/utils";

const TYPES = ["Public", "Privé laïc", "Privé confessionnel", "Communautaire"];
const REGIMES = [
  { value: "trimestre", label: "Trimestre (3 trimestres)", short: "Trimestriel" },
  { value: "semestre", label: "Semestre (2 semestres)", short: "Semestriel" },
  { value: "sequence", label: "Séquence (6 séquences)", short: "Séquentiel" },
];
const HEAD_FUNCTIONS = ["Principal", "Proviseur", "Directeur", "Directrice", "Censeur", "Préfet des études"];
const FIELD_TYPES = ["Texte", "Nombre", "Email", "Téléphone", "Date", "Liste déroulante"];

interface TeacherField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  options?: string[];
}

const DEFAULT_TEACHER_FIELDS: TeacherField[] = [
  { id: "f1", label: "DRENAT / DGENA", type: "Texte", placeholder: "", required: true },
  { id: "f2", label: "Matricule", type: "Texte", placeholder: "", required: true },
  { id: "f3", label: "Nom et Prénom(s)", type: "Texte", placeholder: "", required: true },
  { id: "f4", label: "Établissement", type: "Texte", placeholder: "", required: true },
  { id: "f5", label: "Emploi", type: "Texte", placeholder: "", required: true },
  { id: "f6", label: "Discipline enseignée", type: "Liste déroulante", placeholder: "", required: true, options: ["Français", "Mathématiques", "Anglais"] },
  { id: "f7", label: "Volume horaire hebdomadaire", type: "Nombre", placeholder: "", required: false },
  { id: "f8", label: "Classe(s) tenue(s)", type: "Texte", placeholder: "", required: false },
  { id: "f9", label: "Autre responsabilité", type: "Texte", placeholder: "", required: false },
  { id: "f10", label: "Contact", type: "Téléphone", placeholder: "", required: false },
  { id: "f11", label: "E-mail", type: "Email", placeholder: "", required: false },
  { id: "f12", label: "1ère Prise de service", type: "Date", placeholder: "", required: false },
];

const VACATIONS = ["Simple", "Double"];
const ESTAB_ROLES = ["Enseignant", "Éducateur", "Censeur", "Surveillant général", "Secrétaire"];

interface DailySchedule {
  startMorning: string;
  breakStart: string;
  breakEnd: string;
  lunchStart: string;
  afternoonStart: string;
  endDay: string;
}
interface LevelRow {
  id: string;
  name: string;
  effectif: number;
  vacation: string;
}
interface DisciplineVolume {
  coeff: number;
  /** Durées (en minutes) de chaque séance hebdomadaire — peuvent différer entre elles. */
  sessions: number[];
}
interface EstabUser {
  id: string;
  name: string;
  role: string;
}

const DEFAULT_SCHEDULE: DailySchedule = {
  startMorning: "07:30",
  breakStart: "09:25",
  breakEnd: "09:45",
  lunchStart: "12:00",
  afternoonStart: "14:00",
  endDay: "17:00",
};

const DEFAULT_LEVELS: LevelRow[] = [
  "6ème", "5ème", "4ème", "3ème", "2nde A", "2nde C", "1ère A", "1ère C", "1ère D", "Tle A", "Tle C", "Tle D",
].map((name, i) => ({ id: `lv-${i}`, name, effectif: 0, vacation: "Simple" }));

const DISCIPLINES: { code: string; label: string; coeff: number }[] = [
  { code: "maths", label: "Mathématiques", coeff: 4 },
  { code: "fr", label: "Français", coeff: 4 },
  { code: "ang", label: "Anglais", coeff: 3 },
  { code: "hg", label: "Hist-Géo", coeff: 3 },
  { code: "svt", label: "SVT", coeff: 2 },
  { code: "pc", label: "Physique-Chimie", coeff: 3 },
  { code: "philo", label: "Philosophie", coeff: 2 },
  { code: "eps", label: "EPS", coeff: 2 },
  { code: "arts", label: "Arts Plastiques / Musique", coeff: 1 },
  { code: "edhc", label: "EDHC", coeff: 1 },
  { code: "lv2", label: "LV2", coeff: 2 },
  { code: "fhr", label: "Formation Humaine et Religieuse (FHR)", coeff: 2 },
  { code: "entr", label: "Entreprenariat", coeff: 2 },
  { code: "info", label: "Informatique", coeff: 2 },
  { code: "ecodom", label: "Économie domestique", coeff: 1 },
];

function fmtHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

interface EtabConfig {
  countryCode: string;
  slogan: string;
  schoolYear: string;
  ministry: string;
  regionalDirection: string;
  name: string;
  type: string;
  regime: string;
  sequenceCount: number;
  code: string;
  locality: string;
  headFunction: string;
  headName: string;
  logo: string | null;
  stamp: string | null;
  signature: string | null;
  nationalEmblem: string | null;
  teacherFields: TeacherField[];
  defaultClassSize: number;
  availableRooms: number;
  undefinedRooms: boolean;
  slotsPerDay: number;
  schedule: DailySchedule;
  levels: LevelRow[];
  classesByLevel: Record<string, number>;
  volumes: Record<string, Record<string, DisciplineVolume>>;
  establishmentUsers: EstabUser[];
  reportPlan: string;
  reportFormat: string;
}

function defaultConfig(): EtabConfig {
  const c = getUnCountry("CI")!;
  return {
    countryCode: "CI",
    slogan: c.devise,
    schoolYear: "2025-2026",
    ministry: c.ministry,
    regionalDirection: "",
    name: "",
    type: TYPES[0],
    regime: "trimestre",
    sequenceCount: 6,
    code: "",
    locality: "",
    headFunction: HEAD_FUNCTIONS[0],
    headName: "",
    logo: null,
    stamp: null,
    signature: null,
    nationalEmblem: null,
    teacherFields: DEFAULT_TEACHER_FIELDS,
    defaultClassSize: 60,
    availableRooms: 0,
    undefinedRooms: false,
    slotsPerDay: 8,
    schedule: DEFAULT_SCHEDULE,
    levels: DEFAULT_LEVELS,
    classesByLevel: {},
    volumes: {},
    establishmentUsers: [],
    reportPlan: "officiel",
    reportFormat: "accordeon",
  };
}

const STORAGE_KEY = "eduweb.etab-config.v1";
const REAL_MODE = isSupabaseConfigured();
const genId = () => `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;

export default function ConfigurationPage() {
  const t = useTranslations();
  const app = useApp();
  const etabId = app.user.etablissementId ?? null;
  const [config, setConfig] = React.useState<EtabConfig>(defaultConfig);
  const [hydrated, setHydrated] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const importRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      // 1) Cache localStorage instantané (hors-ligne / mode démo).
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setConfig({ ...defaultConfig(), ...(JSON.parse(raw) as Partial<EtabConfig>) });
      } catch {
        /* ignore */
      }
      // 2) Serveur = AUTORITÉ (mode réel + établissement rattaché) → config
      //    partagée et visible sur n'importe quel poste.
      if (REAL_MODE && etabId) {
        try {
          const remote = await fetchEtabConfig(createClient(), etabId);
          if (active && remote) setConfig({ ...defaultConfig(), ...(remote as Partial<EtabConfig>) });
        } catch {
          /* best effort : on garde le cache local */
        }
      }
      if (active) setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, [etabId]);

  React.useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch {
        /* ignore */
      }
    }
  }, [config, hydrated]);

  const set = <K extends keyof EtabConfig>(key: K, value: EtabConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  // Enregistrement : localStorage (autosave, déjà fait) + PERSISTANCE SERVEUR en
  // mode réel pour un établissement rattaché → partage cross-poste.
  const save = async () => {
    if (!REAL_MODE || !etabId) {
      toast.success(t("pages.parametrageConfiguration.toasts.saved"), {
        description: t("pages.parametrageConfiguration.toasts.savedDescription"),
      });
      return;
    }
    if (app.isReadOnlyPreview) {
      toast.info("Écritures désactivées pendant l'aperçu.");
      return;
    }
    setSaving(true);
    const { ok, error } = await saveEtabConfig(createClient(), etabId, config);
    setSaving(false);
    if (ok) {
      toast.success(t("pages.parametrageConfiguration.toasts.saved"), {
        description: t("pages.parametrageConfiguration.toasts.savedDescription"),
      });
    } else {
      toast.error("Échec de l'enregistrement en ligne." + (error ? ` (${error})` : ""));
    }
  };

  const selectCountry = (code: string) => {
    const c = getUnCountry(code);
    setConfig((cfg) => ({
      ...cfg,
      countryCode: code,
      slogan: c?.devise ?? "",
      ministry: c?.ministry ?? cfg.ministry,
      regionalDirection: "",
    }));
  };

  const country = getUnCountry(config.countryCode);
  const regime = REGIMES.find((r) => r.value === config.regime) ?? REGIMES[0];
  const configured = COUNTRIES.find((c) => c.code === config.countryCode);
  const regions = configured?.academicRegions ?? [];

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "configuration-etablissement.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("pages.parametrageConfiguration.toasts.exported"));
  };

  const importConfig = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      setConfig({ ...defaultConfig(), ...parsed });
      toast.success(t("pages.parametrageConfiguration.toasts.imported"));
    } catch {
      toast.error(t("pages.parametrageConfiguration.toasts.invalidFile"));
    }
  };

  return (
    <ModulePage title={t("pages.parametrageConfiguration.title")} description={t("pages.parametrageConfiguration.description")}
      icon={Settings}
      permission="settings:manage_configuration"
      showContextBadge={false}
      sections={[
        { id: "pays", label: t("pages.parametrageConfiguration.sections.pays") },
        { id: "infos", label: t("pages.parametrageConfiguration.sections.infos") },
        { id: "documents", label: t("pages.parametrageConfiguration.sections.documents") },
        { id: "rapport", label: t("pages.parametrageConfiguration.sections.rapport") },
        { id: "champs-enseignants", label: t("pages.parametrageConfiguration.sections.champsEnseignants") },
        { id: "effectifs", label: t("pages.parametrageConfiguration.sections.effectifs") },
        { id: "volumes", label: t("pages.parametrageConfiguration.sections.volumes") },
        { id: "utilisateurs", label: t("pages.parametrageConfiguration.sections.utilisateurs") },
        { id: "competences", label: t("pages.parametrageConfiguration.sections.competences") },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportConfig}>
            <Upload className="h-4 w-4" /> {t("pages.parametrageConfiguration.actions.export")}
          </Button>
          <Button variant="secondary" onClick={() => importRef.current?.click()}>
            <Download className="h-4 w-4" /> {t("pages.parametrageConfiguration.actions.import")}
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importConfig(e.target.files[0])}
          />
        </div>
      }
    >
      {/* Bloc 1 : Pays, slogan, en-tête bulletin */}
      <SectionCard id="pays" title={t("pages.parametrageConfiguration.blocks.paysTitle")}>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.country")}</Label>
            <CountryCombobox value={config.countryCode} onChange={selectCountry} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.slogan")}</Label>
            <div className="flex items-center gap-2">
              <Input value={config.slogan} onChange={(e) => set("slogan", e.target.value)} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => set("slogan", country?.devise ?? "")}
                className="shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" /> {t("pages.parametrageConfiguration.actions.reset")}
              </Button>
            </div>
            <p className="text-xs italic text-muted-foreground">
              {t("pages.parametrageConfiguration.fields.sloganHint")} : <span className="font-semibold not-italic text-foreground">{config.slogan || "—"}</span>
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.schoolYear")}</Label>
            <Input value={config.schoolYear} onChange={(e) => set("schoolYear", e.target.value)} />
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <Label>{t("pages.parametrageConfiguration.fields.ministry")}</Label>
            <Textarea value={config.ministry} onChange={(e) => set("ministry", e.target.value)} className="min-h-[70px]" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.regionalDirection")}</Label>
            <Select value={config.regionalDirection || "__none__"} onValueChange={(v) => set("regionalDirection", v === "__none__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("pages.parametrageConfiguration.fields.regionalDirectionPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{t("pages.parametrageConfiguration.fields.regionalDirectionPlaceholder")}</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r.code} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <BulletinHeader
          ministry={config.ministry}
          official={country?.official ?? config.countryCode}
          slogan={config.slogan}
          schoolYear={config.schoolYear}
          regimeShort={regime.short}
          className="mt-5"
        />
      </SectionCard>

      {/* Bloc 2 : Aperçu en-tête */}
      <SectionCard title={t("pages.parametrageConfiguration.blocks.previewTitle")} description={t("pages.parametrageConfiguration.blocks.previewDescription")}>
        <BulletinHeader
          ministry={config.ministry}
          official={country?.official ?? config.countryCode}
          slogan={config.slogan}
          schoolYear={config.schoolYear}
          regimeShort={regime.short}
        />
      </SectionCard>

      {/* Bloc 3 : Informations générales */}
      <SectionCard id="infos" title={t("pages.parametrageConfiguration.blocks.infosTitle")}>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.schoolName")}</Label>
            <Input value={config.name} onChange={(e) => set("name", e.target.value)} placeholder={t("pages.parametrageConfiguration.fields.schoolNamePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.schoolType")}</Label>
            <Select value={config.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.regime")}</Label>
            <Select value={config.regime} onValueChange={(v) => set("regime", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIMES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.value === "sequence" ? `Séquence (${config.sequenceCount ?? 6} séquences)` : r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {config.regime === "sequence" && (
              <div className="space-y-1 pt-1">
                <Label className="text-xs text-muted-foreground">{t("pages.parametrageConfiguration.fields.sequenceCount")}</Label>
                <Input
                  type="number"
                  min={2}
                  max={20}
                  value={config.sequenceCount ?? 6}
                  aria-label={t("pages.parametrageConfiguration.fields.sequenceCount")}
                  onChange={(e) => set("sequenceCount", Math.max(2, Math.min(20, Number(e.target.value) || 2)))}
                />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.schoolCode")}</Label>
            <Input value={config.code} onChange={(e) => set("code", e.target.value)} placeholder={t("pages.parametrageConfiguration.fields.schoolCodePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.locality")}</Label>
            <Input value={config.locality} onChange={(e) => set("locality", e.target.value)} placeholder={t("pages.parametrageConfiguration.fields.localityPlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.regionalDirection")}</Label>
            <div className="flex h-10 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm italic text-muted-foreground">
              {config.regionalDirection || t("pages.parametrageConfiguration.fields.regionalDirectionEmpty")}
            </div>
            <p className="text-xs text-muted-foreground">{t("pages.parametrageConfiguration.fields.regionalDirectionHint")}</p>
          </div>
        </div>
      </SectionCard>

      {/* Bloc 4 : Chef d'établissement & documents */}
      <SectionCard id="documents" title={t("pages.parametrageConfiguration.blocks.documentsTitle")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.headFunction")}</Label>
            <Select value={config.headFunction} onValueChange={(v) => set("headFunction", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEAD_FUNCTIONS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.headName")}</Label>
            <Input value={config.headName} onChange={(e) => set("headName", toFullNameCase(e.target.value))} placeholder={t("pages.parametrageConfiguration.fields.headNamePlaceholder")} />
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <ImageDrop label={t("pages.parametrageConfiguration.fields.nationalEmblem")} value={config.nationalEmblem} onChange={(v) => set("nationalEmblem", v)} icon={ImageIcon} />
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <img src={defaultNationalEmblem(config.countryCode)} alt="" className="h-6 w-auto object-contain" />
              {t("pages.parametrageConfiguration.fields.nationalEmblemHint")}
            </p>
          </div>
          <ImageDrop label={t("pages.parametrageConfiguration.fields.logo")} value={config.logo} onChange={(v) => set("logo", v)} icon={ImageIcon} />
          <ImageDrop label={t("pages.parametrageConfiguration.fields.stamp")} value={config.stamp} onChange={(v) => set("stamp", v)} icon={ImageIcon} />
          <ImageDrop label={t("pages.parametrageConfiguration.fields.signature")} value={config.signature} onChange={(v) => set("signature", v)} icon={PenLine} />
        </div>
      </SectionCard>

      {/* Bloc 4 bis : Rapport d'établissement (plan & présentation par défaut) */}
      <SectionCard
        id="rapport"
        title={t("pages.parametrageConfiguration.blocks.rapportTitle")}
        description={t("pages.parametrageConfiguration.blocks.rapportDescription")}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.reportPlan")}</Label>
            <Select value={config.reportPlan} onValueChange={(v) => set("reportPlan", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_PLAN_OPTIONS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.reportFormat")}</Label>
            <Select value={config.reportFormat} onValueChange={(v) => set("reportFormat", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_FORMAT_OPTIONS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      {/* Bloc 5 : Champs requis enseignants */}
      <SectionCard
        id="champs-enseignants"
        title={t("pages.parametrageConfiguration.blocks.champsTitle")}
        description={t("pages.parametrageConfiguration.blocks.champsDescription")}
      >
        <TeacherFieldsEditor fields={config.teacherFields} onChange={(f) => set("teacherFields", f)} />
      </SectionCard>

      {/* Bloc 6 : Effectif d'élèves par niveau */}
      <SectionCard id="effectifs" title={t("pages.parametrageConfiguration.blocks.effectifsTitle")}>
        <EffectifsBlock config={config} setConfig={setConfig} />
      </SectionCard>

      {/* Bloc 7 : Volumes horaires par niveau et par discipline */}
      <SectionCard
        id="volumes"
        title={t("pages.parametrageConfiguration.blocks.volumesTitle")}
        description={t("pages.parametrageConfiguration.blocks.volumesDescription")}
      >
        <VolumesBlock config={config} setConfig={setConfig} />
      </SectionCard>

      {/* Bloc 8 : Gestion des utilisateurs de l'établissement */}
      <SectionCard id="utilisateurs" title={t("pages.parametrageConfiguration.blocks.usersTitle")}>
        <UsersBlock config={config} setConfig={setConfig} />
      </SectionCard>

      {/* Bloc 9 : Synthèse des compétences des enseignants */}
      <SectionCard id="competences" title={t("pages.parametrageConfiguration.blocks.competencesTitle")}>
        <CompetencesBlock config={config} />
      </SectionCard>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
          onClick={() => {
            setConfig(defaultConfig());
            toast.success(t("pages.parametrageConfiguration.toasts.resetDone"));
          }}
        >
          <RotateCcw className="h-4 w-4" /> {t("pages.parametrageConfiguration.actions.resetAll")}
        </Button>
        <Button size="lg" disabled={saving} onClick={() => void save()}>
          <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : t("pages.parametrageConfiguration.actions.save")}
        </Button>
      </div>
    </ModulePage>
  );
}

/* ----------------------------- Sous-composants ---------------------------- */

function Flag({ code, className }: { code: string; className?: string }) {
  return (
    <img
      src={flagUrl(code)}
      alt={code}
      className={cn("h-4 w-6 shrink-0 rounded-sm object-cover ring-1 ring-border", className)}
      loading="lazy"
    />
  );
}

function CountryCombobox({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = getUnCountry(value);
  const filtered = UN_COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-sm shadow-sm transition-colors hover:border-ew-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <Flag code={selected.code} />
              <span className="truncate font-medium text-foreground">{selected.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Rechercher ou saisir un pays</span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un pays…"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Aucun pays trouvé.</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-ew-green-50",
                    c.code === value && "bg-ew-green-50",
                  )}
                >
                  <Flag code={c.code} />
                  <span className="flex-1 truncate text-sm font-medium text-foreground">{c.name}</span>
                  {c.devise && <span className="max-w-[42%] truncate text-xs text-muted-foreground">{c.devise}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BulletinHeader({
  ministry,
  official,
  slogan,
  schoolYear,
  regimeShort,
  className,
}: {
  ministry: string;
  official: string;
  slogan: string;
  schoolYear: string;
  regimeShort: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-dashed border-border bg-muted/30 p-5", className)}>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Aperçu en-tête du bulletin</p>
      <div className="grid items-start gap-4 text-center sm:grid-cols-3">
        <p className="text-xs font-bold uppercase leading-snug text-foreground sm:text-left">{ministry || "—"}</p>
        <div>
          <p className="text-base font-extrabold tracking-tight text-foreground">BULLETIN DE NOTES</p>
          <p className="text-sm font-semibold text-muted-foreground">{regimeShort}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-bold uppercase text-foreground">{official}</p>
          <p className="text-xs italic text-muted-foreground">{slogan || "—"}</p>
          <p className="text-xs font-semibold text-foreground">Année Scolaire {schoolYear}</p>
        </div>
      </div>
    </div>
  );
}

function ImageDrop({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  icon: typeof ImageIcon;
}) {
  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide">{label}</Label>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-3 text-center transition-colors hover:border-ew-green-600 hover:bg-ew-green-50/40"
      >
        {value ? (
          <img src={value} alt={label} className="max-h-24 max-w-full object-contain" />
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-xs text-muted-foreground">Glissez une image ou cliquez pour télécharger</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </label>
      {value && (
        <button type="button" onClick={() => onChange(null)} className="text-xs font-semibold text-red-600 hover:underline">
          Retirer l&apos;image
        </button>
      )}
    </div>
  );
}

function TeacherFieldsEditor({ fields, onChange }: { fields: TeacherField[]; onChange: (f: TeacherField[]) => void }) {
  const t = useTranslations();
  const update = (id: string, patch: Partial<TeacherField>) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const remove = (id: string) => onChange(fields.filter((f) => f.id !== id));
  const add = () =>
    onChange([...fields, { id: genId(), label: t("pages.parametrageConfiguration.fields.newFieldDefault"), type: "Texte", placeholder: "", required: false }]);

  return (
    <div className="space-y-3">
      {fields.map((f) => (
        <div key={f.id} className="rounded-xl border border-border p-3">
          <div className="grid items-end gap-3 sm:grid-cols-[auto_1.4fr_1fr_1fr_auto]">
            <span className="hidden cursor-grab pb-2.5 text-muted-foreground sm:block" title={t("pages.parametrageConfiguration.fields.reorder")}>
              <GripVertical className="h-4 w-4" />
            </span>
            <div className="space-y-1">
              <Label className="text-[11px] uppercase text-muted-foreground">{t("pages.parametrageConfiguration.fields.fieldLabel")}</Label>
              <Input value={f.label} onChange={(e) => update(f.id, { label: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] uppercase text-muted-foreground">{t("pages.parametrageConfiguration.fields.fieldType")}</Label>
              <Select value={f.type} onValueChange={(v) => update(f.id, { type: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((ft) => (
                    <SelectItem key={ft} value={ft}>
                      {ft}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] uppercase text-muted-foreground">{t("pages.parametrageConfiguration.fields.fieldPlaceholder")}</Label>
              <Input value={f.placeholder} onChange={(e) => update(f.id, { placeholder: e.target.value })} className="h-9" />
            </div>
            <button
              type="button"
              onClick={() => remove(f.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
              title={t("pages.parametrageConfiguration.fields.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {f.type === "Liste déroulante" && (
            <div className="mt-2 space-y-1">
              <Label className="text-[11px] uppercase text-muted-foreground">{t("pages.parametrageConfiguration.fields.fieldOptions")}</Label>
              <Input
                value={(f.options ?? []).join(", ")}
                onChange={(e) => update(f.id, { options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) })}
                placeholder={t("pages.parametrageConfiguration.fields.fieldOptionsPlaceholder")}
                className="h-9"
              />
            </div>
          )}

          <label className="mt-2.5 flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={f.required}
              onChange={(e) => update(f.id, { required: e.target.checked })}
              className="h-4 w-4 accent-ew-green-700"
            />
            {t("pages.parametrageConfiguration.fields.fieldRequired")}
          </label>
        </div>
      ))}
      <Button variant="outline" onClick={add} className="w-full border-dashed">
        <Plus className="h-4 w-4" /> {t("pages.parametrageConfiguration.actions.addField")}
      </Button>
    </div>
  );
}

type BlockProps = { config: EtabConfig; setConfig: React.Dispatch<React.SetStateAction<EtabConfig>> };

function Stepper({ value, onChange, min = 0, max = 99 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex h-10 items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-7 text-center font-bold text-foreground">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

const SCHEDULE_FIELDS: { key: keyof DailySchedule; labelKey: string }[] = [
  { key: "startMorning", labelKey: "schedule.startMorning" },
  { key: "breakStart", labelKey: "schedule.breakStart" },
  { key: "breakEnd", labelKey: "schedule.breakEnd" },
  { key: "lunchStart", labelKey: "schedule.lunchStart" },
  { key: "afternoonStart", labelKey: "schedule.afternoonStart" },
  { key: "endDay", labelKey: "schedule.endDay" },
];

function EffectifsBlock({ config, setConfig }: BlockProps) {
  const t = useTranslations();
  const [newLevel, setNewLevel] = React.useState("");
  const total = config.levels.reduce((s, l) => s + (Number(l.effectif) || 0), 0);

  const setField = <K extends keyof EtabConfig>(k: K, v: EtabConfig[K]) => setConfig((c) => ({ ...c, [k]: v }));
  const setSched = (k: keyof DailySchedule, v: string) => setConfig((c) => ({ ...c, schedule: { ...c.schedule, [k]: v } }));
  const updateLevel = (id: string, patch: Partial<LevelRow>) =>
    setConfig((c) => ({ ...c, levels: c.levels.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  const removeLevel = (id: string) => setConfig((c) => ({ ...c, levels: c.levels.filter((l) => l.id !== id) }));
  const addLevel = () => {
    if (!newLevel.trim()) return;
    setConfig((c) => ({ ...c, levels: [...c.levels, { id: genId(), name: newLevel.trim(), effectif: 0, vacation: "Simple" }] }));
    setNewLevel("");
  };
  const compute = () => {
    const m: Record<string, number> = {};
    config.levels.forEach((l) => {
      const e = Number(l.effectif) || 0;
      m[l.id] = e > 0 ? Math.max(1, Math.ceil(e / (config.defaultClassSize || 60))) : 0;
    });
    setConfig((c) => ({ ...c, classesByLevel: m }));
    toast.success(t("pages.parametrageConfiguration.toasts.classesComputed"));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase">{t("pages.parametrageConfiguration.fields.defaultClassSize")}</Label>
          <Input type="number" value={config.defaultClassSize} onChange={(e) => setField("defaultClassSize", Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase">{t("pages.parametrageConfiguration.fields.availableRooms")}</Label>
          <Input type="number" value={config.availableRooms} onChange={(e) => setField("availableRooms", Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase">{t("pages.parametrageConfiguration.fields.slotsPerDay")}</Label>
          <Stepper value={config.slotsPerDay} onChange={(v) => setField("slotsPerDay", v)} min={1} max={12} />
        </div>
      </div>
      <label className="flex w-fit items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={config.undefinedRooms} onChange={(e) => setField("undefinedRooms", e.target.checked)} className="h-4 w-4 accent-ew-green-700" />
        {t("pages.parametrageConfiguration.fields.undefinedRooms")}
      </label>

      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <p className="mb-3 font-bold text-foreground">{t("pages.parametrageConfiguration.fields.dailySchedule")}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCHEDULE_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-xs uppercase">{t(`pages.parametrageConfiguration.${f.labelKey}`)}</Label>
              <Input type="time" value={config.schedule[f.key]} onChange={(e) => setSched(f.key, e.target.value)} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("pages.parametrageConfiguration.fields.scheduleHint")}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2.5 text-left font-bold">{t("pages.parametrageConfiguration.fields.levelName")}</th>
              <th className="px-4 py-2.5 text-left font-bold">{t("pages.parametrageConfiguration.fields.studentCount")}</th>
              <th className="px-4 py-2.5 text-left font-bold">{t("pages.parametrageConfiguration.fields.vacation")}</th>
              <th className="px-4 py-2.5 text-center font-bold">{t("pages.parametrageConfiguration.fields.classes")}</th>
              <th className="px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {config.levels.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-2 font-medium text-foreground">{l.name}</td>
                <td className="px-4 py-2">
                  <Input type="number" value={l.effectif} onChange={(e) => updateLevel(l.id, { effectif: Number(e.target.value) })} className="h-9 w-28" />
                </td>
                <td className="px-4 py-2">
                  <Select value={l.vacation} onValueChange={(v) => updateLevel(l.id, { vacation: v })}>
                    <SelectTrigger className="h-9 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VACATIONS.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2 text-center font-bold text-foreground">{config.classesByLevel[l.id] ? config.classesByLevel[l.id] : "—"}</td>
                <td className="px-2 py-2 text-right">
                  <button type="button" onClick={() => removeLevel(l.id)} className="text-muted-foreground hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input value={newLevel} onChange={(e) => setNewLevel(e.target.value)} placeholder={t("pages.parametrageConfiguration.fields.newLevelPlaceholder")} className="max-w-xs" />
        <Button variant="outline" onClick={addLevel}>
          <Plus className="h-4 w-4" /> {t("pages.parametrageConfiguration.actions.add")}
        </Button>
        <span className="ml-auto text-sm font-semibold text-foreground">{t("pages.parametrageConfiguration.fields.totalStudents")} : {total}</span>
      </div>

      <Button variant="secondary" onClick={compute}>
        <Calculator className="h-4 w-4" /> {t("pages.parametrageConfiguration.actions.compute")}
      </Button>
    </div>
  );
}

function VolumesBlock({ config, setConfig }: BlockProps) {
  const t = useTranslations();
  const [active, setActive] = React.useState(config.levels[0]?.id ?? "");
  React.useEffect(() => {
    if (!config.levels.find((l) => l.id === active)) setActive(config.levels[0]?.id ?? "");
  }, [config.levels, active]);

  const getVol = (code: string, coeff: number): DisciplineVolume => {
    const raw = config.volumes[active]?.[code] as
      | { coeff?: number; sessions?: number[] | number; duration?: number }
      | undefined;
    if (!raw) return { coeff, sessions: [] };
    if (Array.isArray(raw.sessions)) return { coeff: raw.coeff ?? coeff, sessions: raw.sessions };
    // migration de l'ancienne forme { duration, sessions: number } → liste de durées
    const count = typeof raw.sessions === "number" ? raw.sessions : 0;
    return { coeff: raw.coeff ?? coeff, sessions: Array(count).fill(raw.duration ?? 55) };
  };
  const setVol = (code: string, coeff: number, patch: Partial<DisciplineVolume>) =>
    setConfig((c) => ({
      ...c,
      volumes: { ...c.volumes, [active]: { ...(c.volumes[active] ?? {}), [code]: { ...getVol(code, coeff), ...patch } } },
    }));
  const mutateSessions = (code: string, coeff: number, fn: (a: number[]) => number[]) =>
    setVol(code, coeff, { sessions: fn(getVol(code, coeff).sessions) });

  if (!config.levels.length) {
    return <p className="text-sm text-muted-foreground">{t("pages.parametrageConfiguration.fields.noLevels")}</p>;
  }

  const volOf = (s: number[]) => s.reduce((a, b) => a + (b || 0), 0);
  const totalSessions = DISCIPLINES.reduce((s, d) => s + getVol(d.code, d.coeff).sessions.length, 0);
  const totalMin = DISCIPLINES.reduce((s, d) => s + volOf(getVol(d.code, d.coeff).sessions), 0);
  const activeLevel = config.levels.find((l) => l.id === active);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {config.levels.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setActive(l.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
              active === l.id ? "bg-ew-green-700 text-white" : "bg-muted text-muted-foreground hover:bg-ew-green-50",
            )}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[660px] text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2.5 text-left font-bold">{t("pages.parametrageConfiguration.fields.discipline")}</th>
              <th className="px-4 py-2.5 text-center font-bold">{t("pages.parametrageConfiguration.fields.coefficient")}</th>
              <th className="px-4 py-2.5 text-center font-bold">{t("pages.parametrageConfiguration.fields.sessions")}</th>
              <th className="px-4 py-2.5 text-center font-bold">{t("pages.parametrageConfiguration.fields.weeklyVolume")}</th>
              <th className="px-4 py-2.5 text-center font-bold">{t("pages.parametrageConfiguration.fields.status")}</th>
            </tr>
          </thead>
          <tbody>
            {DISCIPLINES.map((d) => {
              const v = getVol(d.code, d.coeff);
              const vol = volOf(v.sessions);
              return (
                <tr key={d.code} className="border-t border-border">
                  <td className="px-4 py-2 font-medium text-foreground">{d.label}</td>
                  <td className="px-4 py-2 text-center">
                    <Input type="number" value={v.coeff} onChange={(e) => setVol(d.code, d.coeff, { coeff: Number(e.target.value) })} className="mx-auto h-9 w-16 text-center" />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {v.sessions.map((dur, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card py-0.5 pl-1.5 pr-1" title={fmtHM(dur)}>
                          <Input
                            type="number"
                            min={5}
                            max={300}
                            step={5}
                            value={dur}
                            aria-label={t("pages.parametrageConfiguration.fields.sessionDurationAria", { n: i + 1 })}
                            onChange={(e) =>
                              mutateSessions(d.code, d.coeff, (a) =>
                                a.map((x, j) => (j === i ? Math.max(5, Math.min(300, Number(e.target.value) || 5)) : x)),
                              )
                            }
                            className="h-7 w-14 border-0 p-0 text-center shadow-none focus-visible:ring-0"
                          />
                          <span className="text-[11px] text-muted-foreground">{t("pages.parametrageConfiguration.fields.minutesShort")}</span>
                          <button
                            type="button"
                            aria-label={t("pages.parametrageConfiguration.fields.removeSessionAria", { n: i + 1 })}
                            onClick={() => mutateSessions(d.code, d.coeff, (a) => a.filter((_, j) => j !== i))}
                            className="ml-0.5 rounded p-0.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => mutateSessions(d.code, d.coeff, (a) => [...a, 60])}
                        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-ew-green-100 px-2 py-1 text-xs font-semibold text-ew-green-700 hover:bg-ew-green-50"
                      >
                        <Plus className="h-3.5 w-3.5" /> {t("pages.parametrageConfiguration.actions.addSession")}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center font-bold text-foreground">{fmtHM(vol)}</td>
                  <td className="px-4 py-2 text-center">
                    {v.sessions.length > 0 ? <Badge tone="green">{t("pages.parametrageConfiguration.fields.statusOk")}</Badge> : <Badge tone="slate">{t("pages.parametrageConfiguration.fields.statusToDefine")}</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-ew-green-50/50">
              <td className="px-4 py-2.5 text-xs font-bold uppercase text-muted-foreground">{t("pages.parametrageConfiguration.fields.totalLine", { level: activeLevel?.name ?? "" })}</td>
              <td />
              <td className="px-4 py-2.5 text-center font-bold text-ew-gold-600">{t("pages.parametrageConfiguration.fields.sessionsLine", { count: totalSessions })}</td>
              <td className="px-4 py-2.5 text-center font-bold text-foreground">{fmtHM(totalMin)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function AddEstabUserDialog({ onAdd }: { onAdd: (u: Omit<EstabUser, "id">) => void }) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState(ESTAB_ROLES[0]);
  const submit = () => {
    if (!name.trim()) {
      toast.error(t("pages.parametrageConfiguration.toasts.nameRequired"));
      return;
    }
    onAdd({ name: name.trim(), role });
    toast.success(t("pages.parametrageConfiguration.toasts.userAdded"));
    setName("");
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" /> {t("pages.parametrageConfiguration.actions.addUser")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pages.parametrageConfiguration.dialog.addUserTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.headName")}</Label>
            <Input value={name} onChange={(e) => setName(toFullNameCase(e.target.value))} placeholder={t("pages.parametrageConfiguration.fields.userNamePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("pages.parametrageConfiguration.fields.userRole")}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTAB_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("pages.parametrageConfiguration.dialog.cancel")}
          </Button>
          <Button onClick={submit}>{t("pages.parametrageConfiguration.dialog.add")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UsersBlock({ config, setConfig }: BlockProps) {
  const t = useTranslations();
  const addUser = (u: Omit<EstabUser, "id">) =>
    setConfig((c) => ({ ...c, establishmentUsers: [{ ...u, id: genId() }, ...c.establishmentUsers] }));
  const removeUser = (id: string) =>
    setConfig((c) => ({ ...c, establishmentUsers: c.establishmentUsers.filter((u) => u.id !== id) }));

  const downloadModel = () => {
    const content = buildCsvTemplate(
      ["prenom", "nom", "role", "email"],
      [["Koffi", "Kouamé", "Enseignant", "kkouame@eduweb.ci"]],
    );
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele-utilisateurs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <AddEstabUserDialog onAdd={addUser} />
        <Button variant="outline" onClick={() => toast.info(t("pages.parametrageConfiguration.toasts.searchDemo"))}>
          <Search className="h-4 w-4" /> {t("pages.parametrageConfiguration.actions.searchBase")}
        </Button>
        <ImportCsvDialog
          title={t("pages.parametrageConfiguration.dialog.importCohortTitle")}
          description={t("pages.parametrageConfiguration.dialog.importCohortDescription")}
          expectedColumns={["prenom", "nom", "role", "email"]}
          sampleRow={["Koffi", "Kouamé", "Enseignant", "kkouame@eduweb.ci"]}
          templateFilename="modele-cohorte.csv"
          trigger={(open) => (
            <Button variant="outline" onClick={open}>
              <FileSpreadsheet className="h-4 w-4" /> {t("pages.parametrageConfiguration.actions.importCohort")}
            </Button>
          )}
        />
        <Button variant="outline" onClick={downloadModel}>
          <Download className="h-4 w-4" /> {t("pages.parametrageConfiguration.actions.downloadTemplate")}
        </Button>
      </div>

      <div className="rounded-xl border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <Users className="h-4 w-4" /> {t("pages.parametrageConfiguration.fields.establishmentUsers")} ({config.establishmentUsers.length})
          </p>
          <button type="button" onClick={() => toast.success(t("pages.parametrageConfiguration.toasts.listRefreshed"))} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <RefreshCw className="h-3.5 w-3.5" /> {t("pages.parametrageConfiguration.actions.refresh")}
          </button>
        </div>
        {config.establishmentUsers.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">{t("pages.parametrageConfiguration.fields.noUsers")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {config.establishmentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ew-green-100 text-xs font-bold text-ew-green-800">{initials(u.name)}</span>
                  <span className="font-medium text-foreground">{u.name}</span>
                  <Badge tone="blue">{u.role}</Badge>
                </span>
                <button type="button" onClick={() => removeUser(u.id)} className="text-muted-foreground hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CompetencesBlock({ config }: { config: EtabConfig }) {
  const t = useTranslations();
  const teachers = config.establishmentUsers.filter((u) => u.role === "Enseignant");
  if (teachers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        {t("pages.parametrageConfiguration.fields.noTeachers")}
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {teachers.map((teacher) => (
        <div key={teacher.id} className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ew-green-100 text-xs font-bold text-ew-green-800">{initials(teacher.name)}</span>
            <p className="font-semibold text-foreground">{teacher.name}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="green">{t("pages.parametrageConfiguration.fields.available")}</Badge>
            <Badge tone="slate">{t("pages.parametrageConfiguration.fields.skillsTodo")}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
