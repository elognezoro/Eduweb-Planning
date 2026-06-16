"use client";

import { ListChecks, Copy, Plus, FileDown } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportMenu } from "@/components/layout/export-menu";
import { EVALUATION_GRID } from "@/lib/mock-data";

export default function GrilleEvaluationPage() {
  const totalCriteria = EVALUATION_GRID.domains.reduce((s, d) => s + d.criteria.length, 0);
  const totalPoints = EVALUATION_GRID.domains.reduce(
    (s, d) => s + d.criteria.reduce((ss, c) => ss + c.max, 0),
    0,
  );

  return (
    <ModulePage
      title="Grille d'évaluation"
      description="Construisez et pondérez les grilles d'observation de classe utilisées en inspection."
      icon={ListChecks}
      permission="evaluation_grid:view"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Grille dupliquée")}>
            <Copy className="h-4 w-4" /> Dupliquer
          </Button>
          <ExportMenu
            filename="grille-evaluation"
            buildPayload={() => ({
              title: EVALUATION_GRID.title,
              country: "Côte d'Ivoire",
              author: "EduWeb Planner",
              generatedAt: new Date().toLocaleString("fr-FR"),
              sections: EVALUATION_GRID.domains.map((d) => ({
                heading: d.domain,
                table: {
                  columns: ["Critère", "Score max"],
                  rows: d.criteria.map((c) => [c.criterion, c.max]),
                },
              })),
            })}
          />
          <Button onClick={() => toast.info("Nouveau critère")}>
            <Plus className="h-4 w-4" /> Critère
          </Button>
        </div>
      }
      kpis={[
        { label: "Domaines", value: EVALUATION_GRID.domains.length, icon: ListChecks, tone: "green" },
        { label: "Critères", value: totalCriteria, icon: ListChecks, tone: "blue" },
        { label: "Score total", value: `${totalPoints} pts`, icon: FileDown, tone: "gold" },
        { label: "Cible", value: "Enseignant", icon: ListChecks, tone: "purple" },
      ]}
    >
      <SectionCard title={EVALUATION_GRID.title}>
        <div className="space-y-5">
          {EVALUATION_GRID.domains.map((d) => {
            const domainTotal = d.criteria.reduce((s, c) => s + c.max, 0);
            return (
              <div key={d.domain} className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-center justify-between bg-ew-green-50 px-4 py-2.5">
                  <p className="font-bold text-ew-green-800">{d.domain}</p>
                  <Badge tone="green">{domainTotal} pts</Badge>
                </div>
                <ul className="divide-y divide-border">
                  {d.criteria.map((c) => (
                    <li key={c.criterion} className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="text-sm text-foreground">{c.criterion}</span>
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: c.max }).map((_, i) => (
                          <span key={i} className="h-2.5 w-2.5 rounded-full bg-ew-green-100" />
                        ))}
                        <Badge tone="slate">/ {c.max}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </ModulePage>
  );
}
