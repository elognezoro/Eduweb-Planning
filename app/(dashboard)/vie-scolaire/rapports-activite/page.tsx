"use client";

import { Activity, FileText, FileCheck2, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReportModule, defaultReportPayload, type ReportItem } from "@/components/modules/report-module";

const REPORTS: ReportItem[] = [
  { id: "ract-1", title: "Sortie pédagogique — Musée des civilisations", period: "2ᵉ Trimestre", scope: "Sortie pédagogique", status: "completed", author: "Mme Brou", date: "2026-03-18" },
  { id: "ract-2", title: "Journée portes ouvertes", period: "2ᵉ Trimestre", scope: "Événement", status: "draft", author: "Direction", date: "2026-04-02" },
  { id: "ract-3", title: "Club scientifique — Bilan annuel", period: "Année complète", scope: "Activité périscolaire", status: "completed", author: "M. Doumbia", date: "2026-05-12" },
  { id: "ract-4", title: "Campagne de vaccination scolaire", period: "1ᵉʳ Trimestre", scope: "Santé scolaire", status: "completed", author: "Infirmerie", date: "2026-01-28" },
];

export default function RapportsActivitePage() {
  const t = useTranslations();
  return (
    <ReportModule title={t("pages.vieScolaireRapportsActivite.title")} description={t("pages.vieScolaireRapportsActivite.description")}
      icon={Activity}
      permission="activity_reports:view"
      scopeLabel="Type d'activité"
      scopeOptions={[
        { value: "sortie", label: "Sortie pédagogique" },
        { value: "event", label: "Événement" },
        { value: "club", label: "Activité périscolaire" },
        { value: "sante", label: "Santé scolaire" },
      ]}
      reports={REPORTS}
      buildPayload={(r) => defaultReportPayload(r, "Côte d'Ivoire")}
      kpis={[
        { label: "Activités", value: REPORTS.length, icon: Activity, tone: "green" },
        { label: "Validées", value: 3, icon: FileCheck2, tone: "blue" },
        { label: "Brouillons", value: 1, icon: Clock, tone: "gold" },
        { label: "Rapports (mois)", value: 7, icon: FileText, tone: "purple" },
      ]}
    />
  );
}
