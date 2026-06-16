"use client";

import { Award, SearchCheck, NotebookText, CheckCircle2 } from "lucide-react";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExportMenu } from "@/components/layout/export-menu";
import { ChartCard, BarsChart, RadarScore } from "@/components/charts/charts";
import { SimpleTable } from "@/components/data-table/simple-table";
import { ENSEIGNANTS, TEACHER_RADAR } from "@/lib/mock-data";
import type { Enseignant } from "@/lib/types";

export default function PerformanceEnseignantsPage() {
  const avgScore = ENSEIGNANTS.reduce((s, e) => s + e.inspectionScore, 0) / ENSEIGNANTS.length;
  const barData = ENSEIGNANTS.map((e) => ({ nom: `${e.lastName}`, score: e.inspectionScore }));

  return (
    <ModulePage
      title="Performance des enseignants"
      description="Indicateurs professionnels et non stigmatisants : inspections, cahier de texte, assiduité, progression."
      icon={Award}
      permission="statistics:teacher_performance"
      sections={[
        { id: "inspections", label: "Scores d'inspection" },
        { id: "profil", label: "Profil pédagogique" },
        { id: "tableau", label: "Tableau de bord" },
      ]}
      actions={
        <ExportMenu
          filename="performance-enseignants"
          buildPayload={() => ({
            title: "Performance des enseignants",
            country: "Côte d'Ivoire",
            author: "EduWeb Planner",
            generatedAt: new Date().toLocaleString("fr-FR"),
            sections: [
              {
                heading: "Indicateurs",
                table: {
                  columns: ["Enseignant", "Spécialité", "Score inspection", "Cahier de texte", "Assiduité"],
                  rows: ENSEIGNANTS.map((e) => [
                    `${e.firstName} ${e.lastName}`,
                    e.specialty,
                    `${e.inspectionScore}/20`,
                    `${e.lessonBookRate}%`,
                    `${e.attendanceRate}%`,
                  ]),
                },
              },
            ],
          })}
        />
      }
      kpis={[
        { label: "Enseignants suivis", value: ENSEIGNANTS.length, icon: Award, tone: "green" },
        { label: "Score moyen inspection", value: `${avgScore.toFixed(1)}/20`, icon: SearchCheck, tone: "blue" },
        { label: "Régularité cahier de texte", value: "86 %", icon: NotebookText, tone: "gold" },
        { label: "Assiduité moyenne", value: "94 %", icon: CheckCircle2, tone: "purple" },
      ]}
    >
      <TwoColumn>
        <ChartCard id="inspections" title="Scores d'inspection" description="Par enseignant (/20)">
          <BarsChart data={barData} xKey="nom" series={[{ key: "score", label: "Score /20" }]} />
        </ChartCard>
        <ChartCard id="profil" title="Profil pédagogique moyen" description="Domaines d'observation">
          <RadarScore data={TEACHER_RADAR} />
        </ChartCard>
      </TwoColumn>

      <SectionCard id="tableau" title="Tableau de bord des enseignants">
        <SimpleTable<Enseignant>
          rows={ENSEIGNANTS}
          getKey={(r) => r.id}
          columns={[
            {
              key: "name",
              header: "Enseignant",
              render: (r) => (
                <div>
                  <p className="font-semibold text-foreground">{r.firstName} {r.lastName}</p>
                  <p className="text-xs text-muted-foreground">{r.specialty}</p>
                </div>
              ),
            },
            { key: "inspectionScore", header: "Inspection", render: (r) => <Badge tone={r.inspectionScore >= 16 ? "green" : r.inspectionScore >= 13 ? "blue" : "gold"}>{r.inspectionScore}/20</Badge> },
            {
              key: "lessonBookRate",
              header: "Cahier de texte",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <Progress value={r.lessonBookRate} className="w-20" />
                  <span className="text-sm">{r.lessonBookRate}%</span>
                </div>
              ),
            },
            { key: "attendanceRate", header: "Assiduité", render: (r) => `${r.attendanceRate}%` },
            {
              key: "progress",
              header: "Tendance",
              render: (r) => (r.inspectionScore >= 16 ? <Badge tone="green">En progression</Badge> : <Badge tone="slate">Stable</Badge>),
            },
          ]}
        />
      </SectionCard>
    </ModulePage>
  );
}
