"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Clock,
  GraduationCap as LevelIcon,
  Users,
  Library,
  Filter,
  Download,
  FileText,
  FileDown,
} from "lucide-react";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useApp } from "@/components/app-shell/app-context";
import { GUIDES, GUIDE_KEYS } from "@/lib/guides";
import { GUIDE_ICONS } from "@/lib/guides/icons";
import { cn } from "@/lib/utils";

/* Mapping rôle → famille (pour le filtre et le tri) — repris de roles.ts. */
const ROLE_FAMILY: Record<string, "administration" | "supervision" | "etablissement" | "communaute"> = {
  admin: "administration",
  chef_etablissement: "etablissement",
  enseignant: "etablissement",
  educateur: "etablissement",
  eleve: "communaute",
  parent: "communaute",
  inspecteur: "supervision",
  conseiller_pedagogique: "supervision",
};

const FAMILY_LABEL: Record<string, string> = {
  administration: "Administration",
  supervision: "Inspection & supervision",
  etablissement: "Établissement",
  communaute: "Communauté éducative",
};

const FAMILY_TONE: Record<string, "green" | "blue" | "gold" | "purple"> = {
  administration: "green",
  supervision: "purple",
  etablissement: "blue",
  communaute: "gold",
};

/** Ordre stratégique recommandé par la revue d'harmonisation. */
const ORDER: string[] = [
  "admin",
  "chef_etablissement",
  "inspecteur",
  "conseiller_pedagogique",
  "enseignant",
  "educateur",
  "parent",
  "eleve",
];

const FAMILIES = ["administration", "supervision", "etablissement", "communaute"] as const;

export default function AideIndexPage() {
  const { effectiveRole } = useApp();
  const [query, setQuery] = React.useState("");
  const [family, setFamily] = React.useState<string>("all");

  const myGuideKey = React.useMemo(
    () => (GUIDE_KEYS.find((k) => k === (effectiveRole as string)) ?? null) as string | null,
    [effectiveRole],
  );

  const sortedKeys = React.useMemo(() => {
    return [...GUIDE_KEYS].sort((a, b) => ORDER.indexOf(a as string) - ORDER.indexOf(b as string));
  }, []);

  const filteredKeys = sortedKeys.filter((key) => {
    if (family !== "all" && ROLE_FAMILY[key as string] !== family) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const g = GUIDES[key as string];
    return (
      g.roleLabel.toLowerCase().includes(q) ||
      g.meta.targetAudience.toLowerCase().includes(q) ||
      g.objectives.some((o) => o.toLowerCase().includes(q))
    );
  });

  return (
    <ModulePage
      title="Bibliothèque des guides de formation"
      description="Guides didactiques par rôle pour découvrir, comprendre et maîtriser les modules d'EduWeb Planner."
      icon={BookOpen}
      permission="dashboard:view"
      showContextBadge={false}
      kpis={[
        { label: "Guides disponibles", value: GUIDE_KEYS.length, icon: Library, tone: "green" },
        { label: "Familles de rôles", value: FAMILIES.length, icon: Users, tone: "blue" },
        {
          label: "Chapitres au total",
          value: GUIDE_KEYS.reduce((acc, k) => acc + GUIDES[k as string].chapters.length, 0),
          icon: BookOpen,
          tone: "gold",
        },
        {
          label: "Durée totale",
          value: `${GUIDE_KEYS.reduce((acc, k) => {
            const m = GUIDES[k as string].meta.duration.match(/\d+/);
            return acc + (m ? parseInt(m[0], 10) : 0);
          }, 0)} min`,
          icon: Clock,
          tone: "purple",
        },
      ]}
    >
      {/* Recommandation personnalisée selon le rôle effectif */}
      {myGuideKey && <RecommendedCard guideKey={myGuideKey} />}

      {/* Manuel académique téléchargeable en PDF (livrable « disponible à part ») */}
      <DownloadManualBanner />


      {/* Filtres */}
      <SectionCard contentClassName="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Filter className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par rôle, objectif…"
              className="h-9 pl-8"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FamilyPill label="Tous" active={family === "all"} onClick={() => setFamily("all")} />
            {FAMILIES.map((f) => (
              <FamilyPill
                key={f}
                label={FAMILY_LABEL[f]}
                active={family === f}
                tone={FAMILY_TONE[f]}
                onClick={() => setFamily(f)}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Grille des guides */}
      {filteredKeys.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          Aucun guide ne correspond à votre recherche.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredKeys.map((key) => (
            <GuideCard key={key as string} guideKey={key as string} />
          ))}
        </div>
      )}
    </ModulePage>
  );
}

/* ---------------------------------------------------------------------- */
/*  Carte de recommandation pour le rôle effectif de l'utilisateur          */
/* ---------------------------------------------------------------------- */
function RecommendedCard({ guideKey }: { guideKey: string }) {
  const g = GUIDES[guideKey];
  const Icon = GUIDE_ICONS[guideKey];
  if (!g) return null;
  return (
    <div className="ew-mesh relative overflow-hidden rounded-2xl border border-border p-5 text-white sm:p-6">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-ew-gold-500/15 blur-3xl" />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ew-gold-100/80">
        Recommandé pour vous
      </p>
      <div className="mt-1 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
          <Icon className="h-6 w-6 text-ew-gold-500" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-extrabold leading-tight">
            {g.roleLabel} — {g.meta.duration} de formation
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-white/80">{g.meta.targetAudience}</p>
        </div>
      </div>
      <div className="mt-4">
        <Link
          href={`/aide/${guideKey}`}
          className="inline-flex items-center gap-2 rounded-lg bg-ew-gold-500 px-4 py-2 text-sm font-bold text-ew-green-950 shadow transition-transform hover:scale-[1.02]"
        >
          Commencer la formation <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Carte d'un guide dans la grille                                         */
/* ---------------------------------------------------------------------- */
function GuideCard({ guideKey }: { guideKey: string }) {
  const g = GUIDES[guideKey];
  const Icon = GUIDE_ICONS[guideKey] ?? BookOpen;
  const family = ROLE_FAMILY[guideKey] ?? "etablissement";
  return (
    <Link
      href={`/aide/${guideKey}`}
      className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ew-green-600/40 hover:shadow-lg"
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-ew-green-600 to-ew-gold-500 transition-transform duration-300 group-hover:scale-x-100" />
      <div className="flex items-center justify-between gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-ew-green-100 to-ew-green-50 text-ew-green-700 ring-1 ring-inset ring-ew-green-600/10">
          <Icon className="h-5 w-5" />
        </span>
        <Badge tone={FAMILY_TONE[family]}>{FAMILY_LABEL[family]}</Badge>
      </div>
      <div>
        <h3 className="font-display text-lg font-bold leading-tight text-foreground">
          {g.roleLabel}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {g.meta.targetAudience}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground">
          <LevelIcon className="h-3 w-3" /> {g.meta.level}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground">
          <Clock className="h-3 w-3" /> {g.meta.duration}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground">
          <BookOpen className="h-3 w-3" /> {g.chapters.length} chap.
        </span>
      </div>
    </Link>
  );
}

/* ---------------------------------------------------------------------- */
/*  Bandeau « Support de formation académique » (lien vers PDF imprimable) */
/* ---------------------------------------------------------------------- */
function DownloadManualBanner() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ew-gold-500/40 bg-gradient-to-r from-ew-gold-100/60 via-card to-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ew-gold-500/15 text-ew-gold-600 ring-1 ring-inset ring-ew-gold-500/30">
          <FileText className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-ew-gold-600">
            Manuel académique complet
          </p>
          <p className="mt-0.5 font-display text-lg font-bold text-foreground">
            Support de formation officiel
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Syllabus, 8 modules de formation (un par rôle), auto-évaluations, exercices pratiques, grille de
            progression et glossaire général — mise en page A4 conforme aux standards académiques.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/aide/support-formation"
          className="inline-flex items-center gap-2 rounded-lg bg-ew-green-700 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          <BookOpen className="h-4 w-4" /> Consulter & imprimer (PDF)
        </Link>
        <a
          href="/api/docx/training-manual"
          className="inline-flex items-center gap-2 rounded-lg border border-ew-green-700 bg-card px-4 py-2 text-sm font-semibold text-ew-green-700 transition-colors hover:bg-ew-green-50"
        >
          <FileDown className="h-4 w-4" /> Télécharger en Word (.docx)
        </a>
      </div>
      <p className="mt-2 text-xs italic text-muted-foreground">
        Le fichier Word inclut le logo, l&apos;entête et une <strong>table des matières automatique</strong>
        qui se met à jour à l&apos;ouverture (acceptez la mise à jour des champs à l&apos;ouverture, ou pressez F9).
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Pastille de famille (filtre)                                            */
/* ---------------------------------------------------------------------- */
function FamilyPill({
  label,
  active,
  tone,
  onClick,
}: {
  label: string;
  active: boolean;
  tone?: "green" | "blue" | "gold" | "purple";
  onClick: () => void;
}) {
  const toneCls: Record<string, string> = {
    green: "border-ew-green-600 bg-ew-green-600 text-white",
    blue: "border-blue-600 bg-blue-600 text-white",
    gold: "border-ew-gold-500 bg-ew-gold-500 text-ew-green-950",
    purple: "border-purple-600 bg-purple-600 text-white",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? tone
            ? toneCls[tone]
            : "border-ew-green-600 bg-ew-green-600 text-white"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
