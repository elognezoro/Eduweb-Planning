"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FolderTree, Sparkles, FileText, Users, Layers } from "lucide-react";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Badge } from "@/components/ui/badge";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import { ExportMenu } from "@/components/layout/export-menu";
import { SimpleTable } from "@/components/data-table/simple-table";
import { useApp } from "@/components/app-shell/app-context";

interface CoordReport {
  id: string;
  coordinator: string;
  discipline: string;
  antenna: string;
  activities: number;
  status: string;
}

const REPORTS: CoordReport[] = [
  { id: "c1", coordinator: "M. Kouassi", discipline: "Mathématiques", antenna: "Abidjan", activities: 6, status: "completed" },
  { id: "c2", coordinator: "Mme Brou", discipline: "Français", antenna: "Abidjan", activities: 5, status: "completed" },
  { id: "c3", coordinator: "M. Doumbia", discipline: "Physique-Chimie", antenna: "Bouaké", activities: 4, status: "draft" },
  { id: "c4", coordinator: "Mme Tanoh", discipline: "SVT", antenna: "Daloa", activities: 7, status: "completed" },
  { id: "c5", coordinator: "M. Yao", discipline: "Histoire-Géo", antenna: "Bouaké", activities: 3, status: "draft" },
];

export default function RapportAntennesPedagogiquesPage() {
  const t = useTranslations();
  const { country } = useApp();
  const [region, setRegion] = React.useState("all");
  const [discipline, setDiscipline] = React.useState("all");

  const data = REPORTS.filter(
    (r) => (region === "all" || r.antenna === region) && (discipline === "all" || r.discipline === discipline),
  );
  const totalActivities = data.reduce((s, r) => s + r.activities, 0);

  return (
    <ModulePage title={t("pages.inspectionRapportAntennesPedagogiques.title")} description={t("pages.inspectionRapportAntennesPedagogiques.description")}
      icon={FolderTree}
      permission="antenna_reports:view"
      sections={[
        { id: "compiles", label: "Rapports compilés" },
        { id: "synthese", label: "Synthèse automatique" },
      ]}
      actions={
        <ExportMenu
          filename="compilation-antennes"
          buildPayload={() => ({
            title: "Compilation des rapports d'antennes pédagogiques",
            country: country.nameFr,
            author: "EduWeb Planner",
            generatedAt: new Date().toLocaleString("fr-FR"),
            sections: [
              {
                heading: "Rapports des coordonnateurs",
                table: {
                  columns: ["Coordonnateur", "Discipline", "Antenne", "Activités"],
                  rows: data.map((r) => [r.coordinator, r.discipline, r.antenna, r.activities]),
                },
              },
            ],
          })}
        />
      }
      kpis={[
        { label: "Coordonnateurs", value: data.length, icon: Users, tone: "green" },
        { label: "Disciplines", value: new Set(data.map((r) => r.discipline)).size, icon: Layers, tone: "blue" },
        { label: "Activités compilées", value: totalActivities, icon: FileText, tone: "gold" },
        { label: "Antennes", value: new Set(data.map((r) => r.antenna)).size, icon: FolderTree, tone: "purple" },
      ]}
    >
      <FilterBar>
        <FilterSelect value={country.code} onValueChange={() => {}} options={[{ value: country.code, label: `${country.flag} ${country.nameFr}` }]} />
        <FilterSelect
          value={region}
          onValueChange={setRegion}
          options={[
            { value: "all", label: "Toutes les antennes" },
            { value: "Abidjan", label: "Antenne Abidjan" },
            { value: "Bouaké", label: "Antenne Bouaké" },
            { value: "Daloa", label: "Antenne Daloa" },
          ]}
        />
        <FilterSelect
          value={discipline}
          onValueChange={setDiscipline}
          options={[
            { value: "all", label: "Toutes les disciplines" },
            ...Array.from(new Set(REPORTS.map((r) => r.discipline))).map((d) => ({ value: d, label: d })),
          ]}
        />
      </FilterBar>

      <TwoColumn className="lg:grid-cols-[2fr_1fr]">
        <SectionCard id="compiles" title="Rapports compilés">
          <SimpleTable<CoordReport>
            rows={data}
            getKey={(r) => r.id}
            columns={[
              { key: "coordinator", header: "Coordonnateur", render: (r) => <span className="font-semibold">{r.coordinator}</span> },
              { key: "discipline", header: "Discipline", render: (r) => <Badge tone="blue">{r.discipline}</Badge> },
              { key: "antenna", header: "Antenne" },
              { key: "activities", header: "Activités", align: "center" },
            ]}
          />
        </SectionCard>

        <SectionCard id="synthese" title="Synthèse automatique" className="bg-ew-green-50/40">
          <div className="flex items-center gap-2 text-ew-green-700">
            <Sparkles className="h-4 w-4" />
            <p className="font-bold">Généré automatiquement</p>
          </div>
          <p className="mt-3 text-sm text-foreground">
            Sur la période, <strong>{data.length} coordonnateurs</strong> ont mené{" "}
            <strong>{totalActivities} activités</strong> réparties sur{" "}
            <strong>{new Set(data.map((r) => r.antenna)).size} antennes</strong>. La dynamique disciplinaire est la
            plus forte en {data[0]?.discipline ?? "—"}. Les rapports en brouillon doivent être finalisés avant
            consolidation régionale.
          </p>
        </SectionCard>
      </TwoColumn>
    </ModulePage>
  );
}
