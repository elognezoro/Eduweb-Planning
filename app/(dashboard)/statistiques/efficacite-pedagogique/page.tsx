"use client";

import { Target, TrendingUp, BookOpen, ClipboardList, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartCard, LineTrend, BarsChart } from "@/components/charts/charts";
import { SUBJECT_AVERAGES } from "@/lib/mock-data";

const PROGRESS_SERIES = [
  { periode: "T1", moyenne: 11.2, presence: 92 },
  { periode: "T2", moyenne: 11.9, presence: 93 },
  { periode: "T3", moyenne: 12.6, presence: 94 },
];

const INDICATORS = [
  { label: "Couverture du programme", value: 82, icon: BookOpen },
  { label: "Fréquence des évaluations", value: 75, icon: ClipboardList },
  { label: "Mise en œuvre des recommandations", value: 68, icon: Lightbulb },
];

export default function EfficacitePedagogiquePage() {
  const t = useTranslations();
  return (
    <ModulePage title={t("pages.statistiquesEfficacitePedagogique.title")} description={t("pages.statistiquesEfficacitePedagogique.description")}
      icon={Target}
      permission="statistics:pedagogical_effectiveness"
      sections={[
        { id: "progression", label: "Progression" },
        { id: "matieres", label: "Indicateurs par matière" },
        { id: "indicateurs", label: "Indicateurs d'efficacité" },
      ]}
      kpis={[
        { label: "Progression moyenne", value: "+1,4 pt", icon: TrendingUp, tone: "green" },
        { label: "Couverture programme", value: "82 %", icon: BookOpen, tone: "blue" },
        { label: "Corrélation présence/résultats", value: "0,71", icon: Target, tone: "gold" },
        { label: "Recommandations appliquées", value: "68 %", icon: Lightbulb, tone: "purple" },
      ]}
    >
      <TwoColumn>
        <ChartCard id="progression" title="Progression par période" description="Moyenne et présence croisées">
          <LineTrend
            data={PROGRESS_SERIES}
            xKey="periode"
            series={[
              { key: "moyenne", label: "Moyenne /20", color: "#176b45" },
              { key: "presence", label: "Présence (%)", color: "#2563eb" },
            ]}
          />
        </ChartCard>
        <ChartCard id="matieres" title="Indicateurs par matière" description="Moyennes disciplinaires">
          <BarsChart data={SUBJECT_AVERAGES} xKey="matiere" series={[{ key: "moyenne", label: "Moyenne /20" }]} />
        </ChartCard>
      </TwoColumn>

      <SectionCard id="indicateurs" title="Indicateurs d'efficacité" description="Aider à la décision, pas sanctionner">
        <div className="grid gap-4 sm:grid-cols-3">
          {INDICATORS.map((ind) => {
            const Icon = ind.icon;
            return (
              <div key={ind.label} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ew-green-100 text-ew-green-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge tone={ind.value >= 80 ? "green" : ind.value >= 70 ? "gold" : "red"}>{ind.value}%</Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{ind.label}</p>
                <Progress value={ind.value} className="mt-2" />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </ModulePage>
  );
}
