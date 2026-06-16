"use client";

import * as React from "react";
import { BarChart3, Users, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import { ChartCard, BarsChart, AreaTrend } from "@/components/charts/charts";
import { SimpleTable } from "@/components/data-table/simple-table";
import { ELEVES, GRADE_DISTRIBUTION, ATTENDANCE_SERIES } from "@/lib/mock-data";
import type { Eleve } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

export default function StatistiquesParClassePage() {
  const [cls, setCls] = React.useState("3eA");
  const students = ELEVES.slice(0, 14);
  const avg = students.reduce((s, e) => s + e.average, 0) / students.length;
  const atRisk = students.filter((s) => s.average < 10 || s.attendanceRate < 88);

  return (
    <ModulePage
      title="Statistiques par classe"
      description="Effectif, moyenne, assiduité, distribution des notes et élèves à risque."
      icon={BarChart3}
      permission="statistics:class"
      sections={[
        { id: "notes", label: "Distribution des notes" },
        { id: "assiduite", label: "Assiduité" },
        { id: "risque", label: "Élèves à risque" },
      ]}
      kpis={[
        { label: "Effectif", value: students.length, icon: Users, tone: "green" },
        { label: "Moyenne de classe", value: avg.toFixed(2), icon: TrendingUp, tone: "blue" },
        { label: "Assiduité", value: "93,4 %", icon: CheckCircle2, tone: "gold" },
        { label: "Élèves à risque", value: atRisk.length, icon: AlertTriangle, tone: "red" },
      ]}
    >
      <FilterBar>
        <FilterSelect
          value={cls}
          onValueChange={setCls}
          options={[
            { value: "3eA", label: "3ᵉ A" },
            { value: "2ndeC", label: "2ⁿᵈᵉ C" },
            { value: "TleA", label: "Tˡᵉ A" },
          ]}
        />
      </FilterBar>

      <TwoColumn>
        <ChartCard id="notes" title="Distribution des notes" description="Répartition par tranche">
          <BarsChart data={GRADE_DISTRIBUTION} xKey="tranche" series={[{ key: "eleves", label: "Élèves" }]} />
        </ChartCard>
        <ChartCard id="assiduite" title="Assiduité de la classe" description="Présence mensuelle (%)">
          <AreaTrend data={ATTENDANCE_SERIES} xKey="mois" series={[{ key: "presence", label: "Présence (%)" }]} />
        </ChartCard>
      </TwoColumn>

      <SectionCard id="risque" title="Élèves à risque" description="Moyenne < 10 ou assiduité < 88 %">
        <SimpleTable<Eleve>
          rows={atRisk}
          getKey={(r) => r.id}
          emptyTitle="Aucun élève à risque dans cette classe"
          columns={[
            { key: "name", header: "Élève", render: (r) => <span className="font-semibold">{r.firstName} {r.lastName}</span> },
            { key: "matricule", header: "Matricule" },
            {
              key: "average",
              header: "Moyenne",
              render: (r) => <Badge tone={r.average < 10 ? "red" : "gold"}>{r.average.toFixed(1)}</Badge>,
            },
            {
              key: "attendanceRate",
              header: "Assiduité",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <Progress value={r.attendanceRate} className="w-24" indicatorClassName={r.attendanceRate < 88 ? "bg-red-500" : undefined} />
                  <span className="text-sm">{formatPercent(r.attendanceRate)}</span>
                </div>
              ),
            },
          ]}
        />
      </SectionCard>
    </ModulePage>
  );
}
