"use client";

import * as React from "react";
import { LineChart, TrendingUp, Users, GraduationCap, CheckCircle2, Eye, UserPlus, Globe } from "lucide-react";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { ChartCard, AreaTrend, BarsChart, DonutChart, LineTrend, RadarScore } from "@/components/charts/charts";
import { ExportMenu } from "@/components/layout/export-menu";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import {
  ATTENDANCE_SERIES,
  REGION_STATS,
  SUBJECT_AVERAGES,
  ENROLLMENT_PIE,
  RECOMMENDATION_COMPLETION,
  TEACHER_RADAR,
} from "@/lib/mock-data";

/* Types d'enseignement (la distinction général/technique concerne le secondaire). */
const TEACHING_TYPES = [
  { value: "all", label: "Tous les enseignements" },
  { value: "primaire", label: "Primaire" },
  { value: "sec_general", label: "Secondaire général" },
  { value: "sec_technique", label: "Secondaire technique" },
];

/* Cycles, conditionnés par le type d'enseignement (du primaire au secondaire). */
const CYCLES_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  all: [
    { value: "all", label: "Tous les cycles" },
    { value: "primaire", label: "Cycle primaire" },
    { value: "g1", label: "Premier cycle — Collège" },
    { value: "g2", label: "Second cycle — Lycée" },
    { value: "t1", label: "Premier cycle technique" },
    { value: "t2", label: "Second cycle technique" },
  ],
  primaire: [
    { value: "all", label: "Tous les cycles" },
    { value: "primaire", label: "Cycle primaire (CP1 – CM2)" },
  ],
  sec_general: [
    { value: "all", label: "Tous les cycles" },
    { value: "g1", label: "Premier cycle — Collège (6ᵉ – 3ᵉ)" },
    { value: "g2", label: "Second cycle — Lycée (2ⁿᵈᵉ – Tˡᵉ)" },
  ],
  sec_technique: [
    { value: "all", label: "Tous les cycles" },
    { value: "t1", label: "Premier cycle technique" },
    { value: "t2", label: "Second cycle technique (BT / Bac Pro)" },
  ],
};

export default function AnalyticsPage() {
  const { academicYear, country } = useApp();
  const [region, setRegion] = React.useState("all");
  const [teachingType, setTeachingType] = React.useState("all");
  const [cycle, setCycle] = React.useState("all");
  const cycleOptions = CYCLES_BY_TYPE[teachingType] ?? CYCLES_BY_TYPE.all;
  const regionOptions = [
    { value: "all", label: "Toutes les régions" },
    ...country.academicRegions.map((r) => ({ value: r.code, label: r.name })),
  ];
  return (
    <ModulePage
      title="Analytics"
      description="Tableaux de bord visuels avancés : tendances, comparaisons et indicateurs croisés."
      icon={LineChart}
      permission="statistics:analytics"
      sections={[
        { id: "temps-reel", label: "Temps réel" },
        { id: "assiduite", label: "Assiduité" },
        { id: "reussite-region", label: "Réussite par région" },
        { id: "recommandations", label: "Recommandations" },
        { id: "disciplines", label: "Disciplines" },
        { id: "effectifs", label: "Effectifs" },
        { id: "profil", label: "Profil pédagogique" },
      ]}
      actions={
        <ExportMenu
          filename="analytics"
          buildPayload={() => ({
            title: "Rapport analytique",
            country: "Côte d'Ivoire",
            period: academicYear.label,
            author: "EduWeb Planner",
            generatedAt: new Date().toLocaleString("fr-FR"),
            sections: [
              {
                heading: "Réussite par région",
                table: { columns: ["Région", "Réussite"], rows: REGION_STATS.map((r) => [r.region, `${r.reussite}%`]) },
              },
            ],
          })}
        />
      }
      kpis={[
        { label: "Effectifs suivis", value: "324 600", icon: Users, tone: "green", delta: 2.1 },
        { label: "Réussite moyenne", value: "72,7 %", icon: TrendingUp, tone: "blue", delta: 1.8 },
        { label: "Enseignants évalués", value: 1280, icon: GraduationCap, tone: "gold" },
        { label: "Assiduité moyenne", value: "93,5 %", icon: CheckCircle2, tone: "purple", delta: 0.9 },
      ]}
    >
      <LiveCounters />

      <FilterBar>
        <FilterSelect value="year" onValueChange={() => {}} options={[{ value: "year", label: academicYear.label }]} />
        <FilterSelect value={region} onValueChange={setRegion} options={regionOptions} />
        <FilterSelect
          value={teachingType}
          onValueChange={(v) => {
            setTeachingType(v);
            setCycle("all");
          }}
          options={TEACHING_TYPES}
        />
        <FilterSelect value={cycle} onValueChange={setCycle} options={cycleOptions} />
      </FilterBar>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard id="assiduite" title="Tendance d'assiduité" description="Présence / absence (%)">
          <AreaTrend
            data={ATTENDANCE_SERIES}
            xKey="mois"
            series={[
              { key: "presence", label: "Présence (%)", color: "#176b45" },
              { key: "absence", label: "Absence (%)", color: "#ea580c" },
            ]}
          />
        </ChartCard>
        <ChartCard id="reussite-region" title="Réussite par région" description="Comparaison régionale">
          <BarsChart data={REGION_STATS} xKey="region" series={[{ key: "reussite", label: "Réussite (%)" }]} />
        </ChartCard>
        <ChartCard id="recommandations" title="Achèvement des recommandations" description="Progression mensuelle">
          <LineTrend data={RECOMMENDATION_COMPLETION} xKey="mois" series={[{ key: "taux", label: "Achèvement (%)" }]} />
        </ChartCard>
        <ChartCard id="disciplines" title="Moyennes par discipline" description="Indicateurs pédagogiques">
          <BarsChart data={SUBJECT_AVERAGES} xKey="matiere" series={[{ key: "moyenne", label: "Moyenne /20", color: "#d99a1e" }]} />
        </ChartCard>
        <ChartCard id="effectifs" title="Répartition des effectifs" description="Par cycle">
          <DonutChart data={ENROLLMENT_PIE} />
        </ChartCard>
        <ChartCard id="profil" title="Profil pédagogique moyen" description="Observation de classe">
          <RadarScore data={TEACHER_RADAR} />
        </ChartCard>
      </div>
    </ModulePage>
  );
}

/* ----- Compteurs en temps réel : visiteurs en ligne + comptes créés ----- */
function LiveCounters() {
  const { users } = useStore();
  // Visiteurs en ligne + visites cumulées : simulation côté client (pas de backend d'analytics web).
  const [visitors, setVisitors] = React.useState(147);
  const [visits, setVisits] = React.useState({ heure: 168, jour: 2370, semaine: 12640, mois: 41800, annee: 486200 });
  React.useEffect(() => {
    const id = setInterval(() => {
      setVisitors((v) => Math.min(420, Math.max(60, v + (Math.floor(Math.random() * 11) - 4)))); // -4 … +6
      const delta = Math.floor(Math.random() * 6) + 1; // 1 … 6 nouvelles visites
      setVisits((p) => ({
        heure: Math.min(260, Math.max(120, p.heure + (Math.floor(Math.random() * 9) - 3))), // fenêtre glissante (60 min)
        jour: p.jour + delta,
        semaine: p.semaine + delta,
        mois: p.mois + delta,
        annee: p.annee + delta,
      }));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const visitTiles = [
    { label: "Dernière heure", value: visits.heure },
    { label: "Aujourd'hui", value: visits.jour },
    { label: "Cette semaine", value: visits.semaine },
    { label: "Ce mois-ci", value: visits.mois },
    { label: "Cette année", value: visits.annee },
  ];

  return (
    <SectionCard id="temps-reel" title="En temps réel" description="Activité de la plateforme en direct">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Visiteurs en ligne (temps réel) */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ew-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ew-green-600" />
              </span>
              Visiteurs en ligne
            </p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums text-foreground">{visitors.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-muted-foreground">connectés en ce moment</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
            <Eye className="h-5 w-5" />
          </span>
        </div>

        {/* Comptes créés (réel — annuaire de la plateforme) */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Comptes créés</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums text-foreground">{users.length.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-muted-foreground">utilisateurs enregistrés sur la plateforme</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <UserPlus className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Visites du site par période */}
      <div className="mt-5">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Globe className="h-3.5 w-3.5" /> Visites du site
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visitTiles.map((t) => (
            <div key={t.label} className="rounded-xl border border-border p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t.label}</p>
              <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">{t.value.toLocaleString("fr-FR")}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
