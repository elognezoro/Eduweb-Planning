"use client";

import * as React from "react";
import { History, ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import { ExportMenu } from "@/components/layout/export-menu";
import { AuditTimeline } from "@/components/dashboard/visuals";
import { AUDIT_ENTRIES } from "@/lib/mock-data";

export default function JournalActivitePage() {
  const [severity, setSeverity] = React.useState("all");
  const entries = AUDIT_ENTRIES.filter((e) => severity === "all" || e.severity === severity);

  return (
    <ModulePage
      title="Journal d'activité"
      description="Traçabilité des actions sensibles : connexions, modifications, imports, paiements."
      icon={History}
      permission="system:view_audit_log"
      actions={
        <ExportMenu
          filename="journal-activite"
          buildPayload={() => ({
            title: "Journal d'activité",
            country: "Côte d'Ivoire",
            author: "EduWeb Planner",
            generatedAt: new Date().toLocaleString("fr-FR"),
            sections: [
              {
                heading: "Événements",
                table: {
                  columns: ["Date", "Acteur", "Action", "Gravité"],
                  rows: AUDIT_ENTRIES.map((e) => [
                    new Date(e.createdAt).toLocaleString("fr-FR"),
                    e.actor,
                    e.action,
                    e.severity,
                  ]),
                },
              },
            ],
          })}
        />
      }
      kpis={[
        { label: "Événements (jour)", value: AUDIT_ENTRIES.length, icon: Info, tone: "blue" },
        { label: "Avertissements", value: AUDIT_ENTRIES.filter((e) => e.severity === "warning").length, icon: AlertTriangle, tone: "gold" },
        { label: "Critiques", value: AUDIT_ENTRIES.filter((e) => e.severity === "critical").length, icon: ShieldAlert, tone: "red" },
        { label: "Acteurs distincts", value: new Set(AUDIT_ENTRIES.map((e) => e.actor)).size, icon: History, tone: "green" },
      ]}
    >
      <FilterBar>
        <FilterSelect
          value={severity}
          onValueChange={setSeverity}
          options={[
            { value: "all", label: "Toutes les gravités" },
            { value: "info", label: "Information" },
            { value: "warning", label: "Avertissement" },
            { value: "critical", label: "Critique" },
          ]}
        />
      </FilterBar>
      <SectionCard title="Chronologie">
        <AuditTimeline entries={entries} />
      </SectionCard>
    </ModulePage>
  );
}
