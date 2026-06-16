"use client";

import { FileCheck2, ThumbsUp, AlertTriangle, ListTodo, Check } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import { ExportMenu } from "@/components/layout/export-menu";
import { ChartCard, RadarScore } from "@/components/charts/charts";
import { TEACHER_RADAR } from "@/lib/mock-data";

export default function RapportsInspectionPage() {
  const globalScore = (TEACHER_RADAR.reduce((s, d) => s + d.valeur, 0) / TEACHER_RADAR.length).toFixed(1);

  return (
    <ModulePage
      title="Rapports d'inspection"
      description="Rédigez le rapport d'inspection à partir de la grille : points forts, axes d'amélioration, recommandations."
      icon={FileCheck2}
      permission="inspection_reports:view"
      sections={[
        { id: "points-forts", label: "Points forts" },
        { id: "axes", label: "Axes d'amélioration" },
        { id: "recommandations", label: "Recommandations" },
        { id: "score", label: "Score global" },
      ]}
      actions={
        <div className="flex gap-2">
          <ExportMenu
            filename="rapport-inspection"
            buildPayload={() => ({
              title: "Rapport d'inspection",
              subtitle: "Paul Kouassi — Mathématiques (3ᵉ A)",
              country: "Côte d'Ivoire",
              institution: "Lycée Moderne de Cocody",
              author: "Inspecteur Konan",
              generatedAt: new Date().toLocaleString("fr-FR"),
              sections: [
                { heading: "Score global", paragraphs: [`Note globale : ${globalScore}/20`] },
                {
                  heading: "Évaluation par domaine",
                  table: { columns: ["Domaine", "Score"], rows: TEACHER_RADAR.map((d) => [d.axe, `${d.valeur}/20`]) },
                },
                { heading: "Points forts", paragraphs: ["Maîtrise disciplinaire, supports variés, climat de classe positif."] },
                { heading: "Axes d'amélioration", paragraphs: ["Renforcer la gestion du temps et la différenciation."] },
              ],
            })}
          />
          <Button onClick={() => toast.success("Rapport validé et transmis")}>
            <Check className="h-4 w-4" /> Valider
          </Button>
        </div>
      }
    >
      <FilterBar>
        <FilterSelect value="pk" onValueChange={() => {}} options={[{ value: "pk", label: "Paul Kouassi — Mathématiques" }]} />
      </FilterBar>

      <TwoColumn className="lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <SectionCard id="points-forts" title="Points forts">
            <Label className="mb-1.5 flex items-center gap-2 text-ew-green-700">
              <ThumbsUp className="h-4 w-4" /> Atouts observés
            </Label>
            <Textarea
              defaultValue="Excellente maîtrise disciplinaire. Supports pédagogiques variés et adaptés. Climat de classe serein et participatif."
              className="min-h-[90px]"
            />
          </SectionCard>
          <SectionCard id="axes" title="Axes d'amélioration">
            <Label className="mb-1.5 flex items-center gap-2 text-ew-gold-600">
              <AlertTriangle className="h-4 w-4" /> Points de vigilance
            </Label>
            <Textarea
              defaultValue="Optimiser la gestion du temps lors de la phase d'introduction. Renforcer la différenciation pour les élèves en difficulté."
              className="min-h-[90px]"
            />
          </SectionCard>
          <SectionCard id="recommandations" title="Recommandations">
            <Label className="mb-1.5 flex items-center gap-2 text-ew-green-700">
              <ListTodo className="h-4 w-4" /> Actions à mettre en œuvre
            </Label>
            <Textarea
              defaultValue="1. Mettre en place un minuteur de séance. 2. Proposer des activités par niveau de maîtrise. 3. Participer à l'atelier APFC sur la différenciation."
              className="min-h-[90px]"
            />
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard id="score" className="text-center">
            <p className="text-sm font-semibold text-muted-foreground">Score global</p>
            <p className="mt-1 text-4xl font-extrabold text-ew-green-700">{globalScore}</p>
            <p className="text-sm text-muted-foreground">/ 20</p>
            <Badge tone="green" className="mt-2">
              Satisfaisant
            </Badge>
          </SectionCard>
          <ChartCard title="Profil d'évaluation" description="Par domaine de la grille" height={260}>
            <RadarScore data={TEACHER_RADAR} />
          </ChartCard>
        </div>
      </TwoColumn>
    </ModulePage>
  );
}
