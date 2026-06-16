"use client";

import type { LucideIcon } from "lucide-react";
import { useApp } from "@/components/app-shell/app-context";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, type KpiTone } from "@/components/dashboard/kpi-card";
import { SectionNav, FloatingSectionNav, type SectionItem } from "@/components/layout/section-nav";
import { ForbiddenState } from "@/components/layout/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export interface ModuleKpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: KpiTone;
  delta?: number;
  hint?: string;
}

interface ModulePageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  permission?: Permission;
  actions?: React.ReactNode;
  kpis?: ModuleKpi[];
  /** Sommaire « Aller à » affiché après les KPI ; chaque cible doit porter l'`id`. */
  sections?: SectionItem[];
  children: React.ReactNode;
  showContextBadge?: boolean;
}

/** Gabarit de page module : garde de permission, en-tête, KPI, contenu. */
export function ModulePage({
  title,
  description,
  icon,
  permission,
  actions,
  kpis,
  sections,
  children,
  showContextBadge = true,
}: ModulePageProps) {
  const { can, country, academicYear } = useApp();

  if (permission && !can(permission)) {
    return (
      <div className="space-y-6">
        <PageHeader title={title} description={description} icon={icon} />
        <ForbiddenState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        badge={
          showContextBadge ? (
            <Badge tone="green">
              {country.flag} {country.nameFr} · {academicYear.label}
            </Badge>
          ) : undefined
        }
        actions={actions}
      />

      {kpis && kpis.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>
      )}

      {sections && sections.length > 0 && (
        <>
          <SectionNav sections={sections} />
          <FloatingSectionNav sections={sections} />
        </>
      )}

      {children}
    </div>
  );
}

/** Carte de section générique avec titre + description. */
export function SectionCard({
  id,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card id={id} className={cn("ew-fade-in", id && "scroll-mt-24", className)}>
      {(title || action) && (
        <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn(!title && "pt-5", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

/** Grille responsive 2 colonnes pour blocs de contenu. */
export function TwoColumn({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cn("grid gap-6 lg:grid-cols-2", id && "scroll-mt-24", className)}>
      {children}
    </div>
  );
}
