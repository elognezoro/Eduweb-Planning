"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  ChevronRight,
  BellRing,
  Heart,
  Crown,
} from "lucide-react";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { AuditTimeline } from "@/components/dashboard/visuals";
import { useApp } from "@/components/app-shell/app-context";
import {
  ETABLISSEMENTS,
  PAYMENTS,
  SUBSCRIPTION_PLANS,
  SMS_LOGS,
  AUDIT_ENTRIES,
  USER_DIRECTORY,
} from "@/lib/mock-data";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

const TONE_PASTILLE: Record<string, string> = {
  green: "bg-ew-green-100 text-ew-green-700",
  gold: "bg-ew-gold-100 text-ew-gold-600",
  blue: "bg-blue-50 text-blue-600",
};

export default function VueEnsemblePage() {
  const { can } = useApp();
  const totalStudents = ETABLISSEMENTS.reduce((s, e) => s + e.studentsCount, 0);
  const totalTeachers = ETABLISSEMENTS.reduce((s, e) => s + e.teachersCount, 0);
  const totalClasses = ETABLISSEMENTS.reduce((s, e) => s + e.classesCount, 0);

  return (
    <ModulePage
      title="Vue d'ensemble"
      description="Tableau de bord de gestion : facturation, abonnements, vie scolaire et activité récente."
      icon={LayoutDashboard}
      permission="system:view"
      kpis={[
        { label: "Effectif total", value: formatNumber(totalStudents), icon: Users, tone: "green", hint: `${totalClasses} classes` },
        { label: "Enseignants", value: totalTeachers, icon: GraduationCap, tone: "blue", hint: "ressources" },
        { label: "Établissements", value: ETABLISSEMENTS.length, icon: Building2, tone: "gold" },
        { label: "Comptes utilisateurs", value: USER_DIRECTORY.length, icon: Users, tone: "purple" },
      ]}
      sections={[
        { id: "indicateurs", label: "Facturation & vie scolaire" },
        { id: "revenus", label: "Revenus parents" },
        { id: "formules", label: "Formules Premium" },
        { id: "activite", label: "Activité récente" },
      ]}
    >
      {/* Facturation · Vie scolaire · SMS */}
      <div id="indicateurs" className="scroll-mt-24 grid gap-6 lg:grid-cols-3">
        {can("system:manage_billing") && (
          <SectionCard
            title="Facturation"
            description="Abonnement et derniers paiements"
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href="/systeme/facturation">Détails</Link>
              </Button>
            }
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total annuel estimé</p>
            <p className="text-2xl font-extrabold text-ew-green-700">{formatCurrency(1200000)}</p>
            <p className="text-xs text-muted-foreground">Palier «&nbsp;Établissement&nbsp;»</p>
            <Separator className="my-3" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Derniers paiements</p>
            <ul className="mt-2 space-y-1.5">
              {PAYMENTS.filter((p) => p.status === "paid")
                .slice(0, 2)
                .map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-muted-foreground">{p.etablissement}</span>
                    <span className="shrink-0 font-semibold text-foreground">{formatCurrency(p.amount)}</span>
                  </li>
                ))}
            </ul>
          </SectionCard>
        )}

        <SectionCard title="Vie scolaire" description="Accès rapide aux indicateurs">
          <ul className="divide-y divide-border">
            {[
              { label: "Classes pédagogiques", value: totalClasses, href: "/statistiques/par-classe" },
              { label: "Enseignants", value: totalTeachers, href: "/statistiques/performance-enseignants" },
              { label: "Notes saisies", value: "1 248", href: "/vie-scolaire/notes-bulletins" },
            ].map((row) => (
              <li key={row.label}>
                <Link
                  href={row.href}
                  className="flex items-center justify-between py-2.5 text-sm transition-colors hover:text-ew-green-700"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="flex items-center gap-1 font-bold text-foreground">
                    {row.value}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        {can("sms:view") ? (
          <SectionCard
            title="SMS récents"
            description="Derniers envois aux parents"
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href="/vie-scolaire/alertes-sms">Tout voir</Link>
              </Button>
            }
          >
            <ul className="space-y-2.5">
              {SMS_LOGS.slice(0, 4).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <Badge tone="blue">{s.trigger}</Badge>
                    <span className="truncate font-mono text-xs text-muted-foreground">{s.phone}</span>
                  </span>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : (
          <SectionCard title="Activité récente" description="Journal d'activité">
            <AuditTimeline entries={AUDIT_ENTRIES.slice(0, 3)} />
          </SectionCard>
        )}
      </div>

      {/* Revenus abonnements parents */}
      {can("system:manage_billing") && (
        <SectionCard
          id="revenus"
          title="Revenus abonnements parents"
          description="Offres destinées aux familles"
          action={<Badge tone="green">Nouveau</Badge>}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Abonnements actifs", value: 3, hint: "tous plans confondus", tone: "green", icon: Heart },
              { label: "Alertes SMS", value: 3, hint: "parents abonnés", tone: "gold", icon: BellRing },
              { label: "E-School", value: 0, hint: "licences disciplinaires", tone: "blue", icon: GraduationCap },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-border p-4">
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", TONE_PASTILLE[s.tone])}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-2 text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-sm font-semibold text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.hint}</p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Formules Académie Premium */}
      {can("premium:view") && (
        <SectionCard
          id="formules"
          title="Formules Académie Premium"
          description="Bulletins officiels, SMS automatiques, support prioritaire"
          action={
            <div className="flex items-center gap-2">
              <Badge tone="green">
                <Crown className="h-3 w-3" /> Actif
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/vie-scolaire/academie-premium">Voir détails</Link>
              </Button>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan, i) => (
              <div
                key={plan.code}
                className={cn(
                  "rounded-xl border p-4",
                  i === 1 ? "border-ew-green-600 ring-1 ring-ew-green-600/30" : "border-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-foreground">{plan.name}</p>
                  {i === 1 && <Badge tone="green">Populaire</Badge>}
                </div>
                <p className="mt-1 text-xl font-extrabold text-ew-green-700">{formatCurrency(plan.price)}</p>
                <p className="text-xs text-muted-foreground">par {plan.interval}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Activité récente complète */}
      {can("sms:view") && (
        <SectionCard id="activite" title="Activité récente" description="Dernières actions sur la plateforme">
          <AuditTimeline entries={AUDIT_ENTRIES.slice(0, 5)} />
        </SectionCard>
      )}
    </ModulePage>
  );
}
