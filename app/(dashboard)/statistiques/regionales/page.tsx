"use client";

import { Map, Building2, Users, TrendingUp, SearchCheck } from "lucide-react";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartCard, BarsChart } from "@/components/charts/charts";
import { ExportMenu } from "@/components/layout/export-menu";
import { SimpleTable } from "@/components/data-table/simple-table";
import { REGION_STATS } from "@/lib/mock-data";
import { formatNumber, formatPercent } from "@/lib/utils";

export default function StatistiquesRegionalesPage() {
  const totalEtab = REGION_STATS.reduce((s, r) => s + r.etablissements, 0);
  const totalStudents = REGION_STATS.reduce((s, r) => s + r.eleves, 0);

  return (
    <ModulePage
      title="Statistiques régionales"
      description="Vue par région académique : établissements, effectifs, performances et inspections."
      icon={Map}
      permission="statistics:regional"
      sections={[
        { id: "effectifs", label: "Effectifs par région" },
        { id: "indicateurs", label: "Indicateurs par région" },
        { id: "inspections", label: "Inspections" },
      ]}
      actions={
        <ExportMenu
          filename="stats-regionales"
          buildPayload={() => ({
            title: "Statistiques régionales",
            country: "Côte d'Ivoire",
            author: "EduWeb Planner",
            generatedAt: new Date().toLocaleString("fr-FR"),
            sections: [
              {
                heading: "Indicateurs par région",
                table: {
                  columns: ["Région", "Établissements", "Effectifs", "Réussite"],
                  rows: REGION_STATS.map((r) => [r.region, r.etablissements, r.eleves, `${r.reussite}%`]),
                },
              },
            ],
          })}
        />
      }
      kpis={[
        { label: "Régions", value: REGION_STATS.length, icon: Map, tone: "green" },
        { label: "Établissements", value: formatNumber(totalEtab), icon: Building2, tone: "blue" },
        { label: "Effectifs", value: formatNumber(totalStudents), icon: Users, tone: "gold" },
        { label: "Réussite moyenne", value: "72,7 %", icon: TrendingUp, tone: "purple" },
      ]}
    >
      <ChartCard id="effectifs" title="Effectifs par région académique" description="Nombre d'élèves">
        <BarsChart data={REGION_STATS} xKey="region" series={[{ key: "eleves", label: "Effectifs" }]} />
      </ChartCard>

      <SectionCard id="indicateurs" title="Indicateurs par région">
        <SimpleTable
          rows={REGION_STATS}
          getKey={(r) => r.region}
          columns={[
            { key: "region", header: "Région", render: (r) => <span className="font-semibold">{r.region}</span> },
            { key: "etablissements", header: "Établissements", align: "center" },
            { key: "eleves", header: "Effectifs", render: (r) => formatNumber(r.eleves) },
            {
              key: "reussite",
              header: "Taux de réussite",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <Progress value={r.reussite} className="w-28" />
                  <span className="text-sm font-semibold">{formatPercent(r.reussite)}</span>
                </div>
              ),
            },
            {
              key: "badge",
              header: "",
              align: "right",
              render: (r) => (r.reussite >= 75 ? <Badge tone="green">Performante</Badge> : r.reussite >= 70 ? <Badge tone="gold">Moyenne</Badge> : <Badge tone="red">À soutenir</Badge>),
            },
          ]}
        />
      </SectionCard>

      <SectionCard id="inspections" title="Inspections par région" className="bg-ew-green-50/30">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <SearchCheck className="h-4 w-4 text-ew-green-700" />
          42 inspections planifiées sur l&apos;ensemble des régions ce trimestre, dont 12 réalisées.
        </div>
      </SectionCard>
    </ModulePage>
  );
}
