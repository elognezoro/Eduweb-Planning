"use client";

import { Files, FileText, FileCheck2, Clock } from "lucide-react";
import { ReportModule, defaultReportPayload, type ReportItem } from "@/components/modules/report-module";
import { APFC_ANTENNAS } from "@/lib/mock-data";

const REPORTS: ReportItem[] = [
  { id: "ra-1", title: "Activités du trimestre — Antenne Abidjan", period: "2ᵉ Trimestre", scope: "Antenne APFC Abidjan", status: "completed", author: "M. Bamba", date: "2026-04-03" },
  { id: "ra-2", title: "Coordination disciplinaire — Antenne Bouaké", period: "2ᵉ Trimestre", scope: "Antenne APFC Bouaké", status: "draft", author: "Mme Touré", date: "2026-04-06" },
  { id: "ra-3", title: "Bilan formations — Antenne Daloa", period: "1ᵉʳ Trimestre", scope: "Antenne APFC Daloa", status: "completed", author: "M. Aka", date: "2026-01-20" },
];

export default function RapportsAntennesPage() {
  return (
    <ReportModule
      title="Rapports d'antennes"
      description="Compilez et consultez les rapports d'activité des antennes pédagogiques."
      icon={Files}
      permission="antenna_reports:view"
      scopeLabel="Antenne"
      scopeOptions={APFC_ANTENNAS.map((a) => ({ value: a.id, label: a.name }))}
      reports={REPORTS}
      buildPayload={(r) => defaultReportPayload(r, "Côte d'Ivoire")}
      kpis={[
        { label: "Rapports", value: REPORTS.length, icon: FileText, tone: "green" },
        { label: "Validés", value: 2, icon: FileCheck2, tone: "blue" },
        { label: "Brouillons", value: 1, icon: Clock, tone: "gold" },
        { label: "Antennes", value: APFC_ANTENNAS.length, icon: Files, tone: "purple" },
      ]}
    />
  );
}
