"use client";

import * as React from "react";
import { ListTodo, CheckCheck, AlertTriangle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import { RecommendationTracker } from "@/components/dashboard/visuals";
import { ChartCard, LineTrend } from "@/components/charts/charts";
import { RECOMMENDATIONS, RECOMMENDATION_COMPLETION } from "@/lib/mock-data";

export default function SuiviRecommandationsPage() {
  const [status, setStatus] = React.useState("all");
  const items = RECOMMENDATIONS.filter((r) => status === "all" || r.status === status);

  return (
    <ModulePage
      title="Suivi des recommandations"
      description="Pilotez les recommandations : priorité, responsable, échéance, progression et relances."
      icon={ListTodo}
      permission="recommendations:view"
      sections={[
        { id: "achevement", label: "Taux d'achèvement" },
        { id: "recommandations", label: "Recommandations" },
      ]}
      actions={
        <Button variant="outline" onClick={() => toast.success("Relances envoyées aux responsables")}>
          <Send className="h-4 w-4" /> Relancer les retards
        </Button>
      }
      kpis={[
        { label: "Recommandations", value: RECOMMENDATIONS.length, icon: ListTodo, tone: "green" },
        { label: "En cours", value: RECOMMENDATIONS.filter((r) => r.status === "in_progress").length, icon: Loader2, tone: "gold" },
        { label: "Réalisées", value: RECOMMENDATIONS.filter((r) => r.status === "done").length, icon: CheckCheck, tone: "blue" },
        { label: "En retard", value: RECOMMENDATIONS.filter((r) => r.status === "overdue").length, icon: AlertTriangle, tone: "red" },
      ]}
    >
      <ChartCard id="achevement" title="Taux d'achèvement" description="Progression mensuelle des recommandations" height={260}>
        <LineTrend data={RECOMMENDATION_COMPLETION} xKey="mois" series={[{ key: "taux", label: "Achèvement (%)" }]} />
      </ChartCard>

      <FilterBar>
        <FilterSelect
          value={status}
          onValueChange={setStatus}
          options={[
            { value: "all", label: "Tous les statuts" },
            { value: "open", label: "Ouverte" },
            { value: "in_progress", label: "En cours" },
            { value: "done", label: "Réalisée" },
            { value: "overdue", label: "En retard" },
          ]}
        />
      </FilterBar>

      <SectionCard id="recommandations" title="Recommandations">
        <RecommendationTracker items={items} />
      </SectionCard>
    </ModulePage>
  );
}
