"use client";

import { Building, Users, GraduationCap, TrendingUp, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModulePage } from "@/components/modules/module-page";
import { ChartCard, BarsChart, AreaTrend, DonutChart } from "@/components/charts/charts";
import { ExportMenu } from "@/components/layout/export-menu";
import { ENROLLMENT_BY_LEVEL, SUBJECT_AVERAGES, ATTENDANCE_SERIES, ENROLLMENT_PIE } from "@/lib/mock-data";

export default function StatistiquesEtablissementPage() {
  const t = useTranslations();
  return (
    <ModulePage title={t("pages.statistiquesEtablissement.title")} description={t("pages.statistiquesEtablissement.description")}
      icon={Building}
      permission="statistics:institution"
      sections={[
        { id: "effectifs", label: "Effectifs par niveau" },
        { id: "cycles", label: "Répartition par cycle" },
        { id: "matieres", label: "Moyennes par matière" },
        { id: "assiduite", label: "Assiduité" },
      ]}
      actions={
        <ExportMenu
          filename="stats-etablissement"
          buildPayload={() => ({
            title: "Statistiques d'établissement",
            country: "Côte d'Ivoire",
            institution: "Lycée Moderne de Cocody",
            author: "EduWeb Planner",
            generatedAt: new Date().toLocaleString("fr-FR"),
            sections: [
              {
                heading: "Effectifs par niveau",
                table: {
                  columns: ["Niveau", "Filles", "Garçons"],
                  rows: ENROLLMENT_BY_LEVEL.map((e) => [e.niveau, e.filles, e.garcons]),
                },
              },
            ],
          })}
        />
      }
      kpis={[
        { label: "Effectif total", value: "1 840", icon: Users, tone: "green" },
        { label: "Enseignants", value: 92, icon: GraduationCap, tone: "blue" },
        { label: "Taux de réussite", value: "78,5 %", icon: TrendingUp, tone: "gold", delta: 2.3 },
        { label: "Assiduité", value: "94,2 %", icon: CheckCircle2, tone: "purple" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard id="effectifs" title="Effectifs par niveau" description="Filles / Garçons">
          <BarsChart
            data={ENROLLMENT_BY_LEVEL}
            xKey="niveau"
            series={[
              { key: "filles", label: "Filles", color: "#d99a1e" },
              { key: "garcons", label: "Garçons", color: "#176b45" },
            ]}
            stacked
          />
        </ChartCard>
        <ChartCard id="cycles" title="Répartition par cycle" description="Effectifs">
          <DonutChart data={ENROLLMENT_PIE} />
        </ChartCard>
        <ChartCard id="matieres" title="Moyennes par matière" description="Comparaison des disciplines">
          <BarsChart data={SUBJECT_AVERAGES} xKey="matiere" series={[{ key: "moyenne", label: "Moyenne /20" }]} />
        </ChartCard>
        <ChartCard id="assiduite" title="Évolution de l'assiduité" description="Présence mensuelle (%)">
          <AreaTrend
            data={ATTENDANCE_SERIES}
            xKey="mois"
            series={[
              { key: "presence", label: "Présence (%)", color: "#176b45" },
              { key: "absence", label: "Absence (%)", color: "#dc2626" },
            ]}
          />
        </ChartCard>
      </div>
    </ModulePage>
  );
}
