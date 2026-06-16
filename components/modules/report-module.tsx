"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { FilePlus2, Eye } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard, type ModuleKpi } from "./module-page";
import { SimpleTable } from "@/components/data-table/simple-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExportMenu } from "@/components/layout/export-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Permission } from "@/lib/permissions";
import type { ReportPayload } from "@/lib/exports";

export interface ReportItem {
  id: string;
  title: string;
  period: string;
  scope: string;
  status: string;
  author: string;
  date: string;
}

interface ReportModuleProps {
  title: string;
  description: string;
  icon: LucideIcon;
  permission?: Permission;
  kpis?: ModuleKpi[];
  scopeLabel: string;
  scopeOptions: { value: string; label: string }[];
  reports: ReportItem[];
  buildPayload: (report: ReportItem) => ReportPayload;
  children?: React.ReactNode;
}

/** Gabarit réutilisable pour les pages de rapports (génération + liste + export). */
export function ReportModule({
  title,
  description,
  icon,
  permission,
  kpis,
  scopeLabel,
  scopeOptions,
  reports,
  buildPayload,
  children,
}: ReportModuleProps) {
  const [period, setPeriod] = React.useState("t3");
  const [scope, setScope] = React.useState(scopeOptions[0]?.value ?? "");

  return (
    <ModulePage
      title={title}
      description={description}
      icon={icon}
      permission={permission}
      kpis={kpis}
      sections={[
        { id: "generer", label: "Générer un rapport" },
        { id: "liste", label: "Rapports disponibles" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard id="generer" title="Générer un rapport" description="Sélectionnez la période et le périmètre.">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{scopeLabel}</Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Période</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="t1">1ᵉʳ Trimestre</SelectItem>
                  <SelectItem value="t2">2ᵉ Trimestre</SelectItem>
                  <SelectItem value="t3">3ᵉ Trimestre</SelectItem>
                  <SelectItem value="year">Année complète</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => toast.success("Rapport généré", { description: "Disponible dans la liste ci-contre." })}>
              <FilePlus2 className="h-4 w-4" /> Générer le rapport
            </Button>
          </div>
        </SectionCard>

        <SectionCard id="liste" title="Rapports disponibles" className="lg:col-span-2">
          <SimpleTable
            rows={reports}
            getKey={(r) => r.id}
            columns={[
              {
                key: "title",
                header: "Rapport",
                render: (r) => (
                  <div>
                    <p className="font-semibold text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.scope} · {r.period}
                    </p>
                  </div>
                ),
              },
              { key: "author", header: "Auteur" },
              { key: "status", header: "Statut", render: (r) => <StatusBadge status={r.status} /> },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toast.info(`Aperçu : ${r.title}`)}>
                      <Eye className="h-4 w-4" /> Aperçu
                    </Button>
                    <ExportMenu filename={r.id} buildPayload={() => buildPayload(r)} />
                  </div>
                ),
              },
            ]}
          />
        </SectionCard>
      </div>

      {children}
    </ModulePage>
  );
}

/** Construit un payload d'export par défaut à partir d'un rapport. */
export function defaultReportPayload(report: ReportItem, country: string): ReportPayload {
  return {
    title: report.title,
    subtitle: `${report.scope} — ${report.period}`,
    country,
    institution: report.scope,
    period: report.period,
    author: report.author,
    generatedAt: new Date().toLocaleString("fr-FR"),
    sections: [
      {
        heading: "Synthèse",
        paragraphs: [
          "Ce rapport présente une synthèse de la période sélectionnée. Les données sont issues de la plateforme EduWeb Planner.",
        ],
      },
      {
        heading: "Indicateurs",
        table: {
          columns: ["Indicateur", "Valeur"],
          rows: [
            ["Statut", report.status],
            ["Auteur", report.author],
            ["Date", report.date],
          ],
        },
      },
    ],
  };
}
