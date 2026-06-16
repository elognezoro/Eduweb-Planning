"use client";

import { Gauge, Building2, Users, GraduationCap, SearchCheck, ListTodo, CheckCircle2, AlertTriangle } from "lucide-react";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { ChartCard, AreaTrend, BarsChart } from "@/components/charts/charts";
import { SimpleTable } from "@/components/data-table/simple-table";
import { ExportMenu } from "@/components/layout/export-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ETABLISSEMENTS, REGION_STATS, ATTENDANCE_SERIES } from "@/lib/mock-data";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { Etablissement } from "@/lib/types";

const ALERTS = [
  { tone: "red" as const, text: "3 recommandations en retard nécessitent une relance.", icon: AlertTriangle },
  { tone: "gold" as const, text: "2 inspections planifiées cette semaine.", icon: SearchCheck },
  { tone: "green" as const, text: "Taux de présence en hausse de 1,4 % ce mois-ci.", icon: CheckCircle2 },
];

export default function PilotageDashboardPage() {
  const totalStudents = ETABLISSEMENTS.reduce((s, e) => s + e.studentsCount, 0);
  const totalTeachers = ETABLISSEMENTS.reduce((s, e) => s + e.teachersCount, 0);
  const top = [...ETABLISSEMENTS].sort((a, b) => b.successRate - a.successRate);

  return (
    <ModulePage
      title="Tableau de bord de pilotage"
      description="Vue consolidée des indicateurs clés de la région et des établissements."
      icon={Gauge}
      permission="statistics:analytics"
      sections={[
        { id: "presences", label: "Présences" },
        { id: "reussite", label: "Réussite régionale" },
        { id: "top", label: "Top établissements" },
        { id: "alertes", label: "Alertes" },
      ]}
      actions={
        <ExportMenu
          filename="pilotage"
          buildPayload={() => ({
            title: "Tableau de bord de pilotage",
            country: "Côte d'Ivoire",
            author: "EduWeb Planner",
            generatedAt: new Date().toLocaleString("fr-FR"),
            sections: [
              {
                heading: "Indicateurs clés",
                table: {
                  columns: ["Indicateur", "Valeur"],
                  rows: [
                    ["Établissements", ETABLISSEMENTS.length],
                    ["Effectifs", totalStudents],
                    ["Enseignants", totalTeachers],
                  ],
                },
              },
            ],
          })}
        />
      }
      kpis={[
        { label: "Établissements", value: ETABLISSEMENTS.length, icon: Building2, tone: "green" },
        { label: "Effectifs", value: formatNumber(totalStudents), icon: Users, tone: "blue", delta: 2.1 },
        { label: "Enseignants", value: totalTeachers, icon: GraduationCap, tone: "gold" },
        { label: "Inspections", value: 5, icon: SearchCheck, tone: "purple", hint: "ce trimestre" },
        { label: "Recommandations", value: 6, icon: ListTodo, tone: "teal" },
        { label: "Taux de présence", value: "92,9 %", icon: CheckCircle2, tone: "green", delta: 1.4 },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard id="presences" title="Évolution des présences" description="Moyenne régionale par mois">
          <AreaTrend data={ATTENDANCE_SERIES} xKey="mois" series={[{ key: "presence", label: "Présence (%)" }]} />
        </ChartCard>
        <ChartCard id="reussite" title="Réussite par région académique" description="Taux de réussite (%)">
          <BarsChart data={REGION_STATS} xKey="region" series={[{ key: "reussite", label: "Réussite (%)" }]} />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard id="top" title="Top établissements" description="Classés par taux de réussite" className="lg:col-span-2">
          <SimpleTable<Etablissement>
            rows={top}
            getKey={(r) => r.id}
            columns={[
              { key: "name", header: "Établissement", render: (r) => <span className="font-semibold">{r.name}</span> },
              { key: "locality", header: "Localité" },
              { key: "studentsCount", header: "Effectif", align: "right", render: (r) => formatNumber(r.studentsCount) },
              {
                key: "successRate",
                header: "Réussite",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <Progress value={r.successRate} className="w-24" />
                    <span className="text-sm font-semibold">{formatPercent(r.successRate)}</span>
                  </div>
                ),
              },
            ]}
          />
        </SectionCard>

        <SectionCard id="alertes" title="Alertes de pilotage">
          <ul className="space-y-3">
            {ALERTS.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <Badge tone={a.tone}>
                    <Icon className="h-3 w-3" />
                  </Badge>
                  <span className="text-sm text-foreground">{a.text}</span>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>
    </ModulePage>
  );
}
