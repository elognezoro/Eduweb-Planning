"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  Map,
  LayoutGrid,
  CheckCircle2,
  SearchCheck,
  CalendarDays,
  ClipboardCheck,
  NotebookText,
  ClipboardList,
  FileText,
  BarChart3,
  MessagesSquare,
  ArrowRight,
  Sparkles,
  UserPlus,
  FilePlus2,
  Send,
  Eye,
  Globe,
  Building,
  Network,
  Lightbulb,
  FolderTree,
  Pencil,
  Heart,
  User,
  Settings,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { ManagePartnersDialog } from "@/components/dashboard/manage-partners-dialog";
import { getRole, USER_ROLES, type UserRole } from "@/lib/roles";
import { hasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ModuleCard, ActionCard } from "@/components/dashboard/module-card";
import { SectionCard } from "@/components/modules/module-page";
import { SectionNav, FloatingSectionNav } from "@/components/layout/section-nav";
import { AuditTimeline } from "@/components/dashboard/visuals";
import { ChartCard, AreaTrend, DonutChart, LineTrend, RadarScore } from "@/components/charts/charts";
import {
  ATTENDANCE_SERIES,
  ENROLLMENT_PIE,
  RECOMMENDATION_COMPLETION,
  TEACHER_RADAR,
  AUDIT_ENTRIES,
  INSPECTIONS,
} from "@/lib/mock-data";
import { ALL_NAV_ITEMS } from "@/lib/navigation";
import { TransportDashboardCard } from "@/components/transport/transport-dashboard-card";

const MODULES = [
  { href: "/parametrage/emplois-du-temps", title: "Emplois du temps", description: "Planifier et détecter les conflits", icon: CalendarDays, tone: "green" as const },
  { href: "/vie-scolaire/registre-appel", title: "Registre d'appel", description: "Présences, retards, alertes", icon: ClipboardCheck, tone: "blue" as const },
  { href: "/vie-scolaire/cahier-de-texte", title: "Cahier de texte", description: "Séances, objectifs, devoirs", icon: NotebookText, tone: "gold" as const },
  { href: "/vie-scolaire/notes-bulletins", title: "Notes & bulletins", description: "Saisie, moyennes, bulletins", icon: ClipboardList, tone: "purple" as const },
  { href: "/inspection-supervision/inspection", title: "Inspection", description: "Grilles, scores, recommandations", icon: SearchCheck, tone: "teal" as const },
  { href: "/vie-scolaire/rapport-etablissement", title: "Rapports", description: "Établissement, activités, antennes", icon: FileText, tone: "red" as const },
  { href: "/statistiques/analytics", title: "Statistiques", description: "Analytics et indicateurs", icon: BarChart3, tone: "green" as const },
  { href: "/vie-scolaire/communication", title: "Communication", description: "Messages, annonces, notifications", icon: MessagesSquare, tone: "blue" as const },
];

const TONE_PASTILLE: Record<string, string> = {
  green: "bg-ew-green-100 text-ew-green-700",
  gold: "bg-ew-gold-100 text-ew-gold-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  red: "bg-red-50 text-red-600",
  teal: "bg-cyan-50 text-cyan-600",
  slate: "bg-slate-100 text-slate-600",
};

// Un espace dédié pour chaque rôle utilisateur
const ROLE_SPACES: { id: UserRole; icon: LucideIcon; description: string }[] = [
  { id: "drena", icon: Globe, description: "Lecture régionale — rapports comparatifs inter-établissements, statistiques régionales." },
  { id: "cafop_admin", icon: GraduationCap, description: "Administration des CAFOP, gestion des élèves-maîtres, saisie des notes, génération des bulletins." },
  { id: "cafop_directeur", icon: GraduationCap, description: "Direction de CAFOP : pilotage des promotions, des enseignements, des statistiques et des rapports." },
  { id: "etablissements_admin", icon: Building, description: "Administration des établissements scolaires, gestion des données, import / export." },
  { id: "apfc_admin", icon: Network, description: "Administration des APFC, gestion du personnel pédagogique, antennes et circonscriptions." },
  { id: "inspecteur", icon: ClipboardCheck, description: "Visites d'inspection, suivi des enseignants, rapports pédagogiques." },
  { id: "conseiller_pedagogique", icon: Lightbulb, description: "Accompagnement pédagogique des enseignants, suivi disciplinaire, rapports formatifs." },
  { id: "chef_antenne", icon: FolderTree, description: "Coordination pédagogique multi-établissements. Formules d'abonnement dédiées disponibles prochainement." },
  { id: "chef_etablissement", icon: Building, description: "Pilotage complet : configuration, emplois du temps, notes, bulletins, premium, facturation, audit." },
  { id: "enseignant", icon: Pencil, description: "Cahier de texte, saisie des notes, registre d'appel pour ses classes assignées." },
  { id: "cafop_professeur", icon: Pencil, description: "Enseignement et évaluation des élèves-maîtres : saisie des notes au CAFOP." },
  { id: "educateur", icon: ClipboardList, description: "Registre d'appel toutes classes + alertes parents en cas d'absence ou retard." },
  { id: "transport_chauffeur", icon: Map, description: "Espace conducteur : suivi du trajet du car et émission de la position en temps réel." },
  { id: "parent", icon: Heart, description: "Suivi des notes, bulletins PDF, présences de l'enfant. Catalogue d'abonnements optionnels." },
  { id: "eleve", icon: User, description: "Accès personnalisé : emploi du temps, notes, cahier de texte, présences, bulletins." },
  { id: "admin", icon: Settings, description: "Gestion des utilisateurs, permissions, journal d'activité, sauvegardes." },
];

// Les partenaires sont désormais éditables par l'admin et persistés dans le store
// (data-store : slice `partners` + `setPartners`). Cf. ManagePartnersDialog.

export default function DashboardPage() {
  const t = useTranslations();
  const { user, effectiveRole, country, academicYear, regionCode, isReadOnlyPreview } = useApp();
  const store = useStore();
  const [partnersOpen, setPartnersOpen] = React.useState(false);
  const role = getRole(effectiveRole);
  const isAdminLike = hasPermission(effectiveRole, "role_preview:use");
  const plannedInspections = INSPECTIONS.filter((i) => i.status === "planned").length;
  const regionName = country.academicRegions.find((r) => r.code === regionCode)?.name ?? country.academicRegionLabel;

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="ew-hero-gradient ew-mesh relative overflow-hidden rounded-2xl p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <Badge tone="gold" className="mb-3">
            {country.flag} {country.nameFr} · {academicYear.label}
          </Badge>
          <h1 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
            {t("pages.dashboard.welcome", { name: user.firstName })}
          </h1>
          <p className="mt-2 max-w-xl text-white/80">
            {t("pages.dashboard.loggedInAs", { role: role.label })}{" "}
            {t("pages.dashboard.subtitleTeacher")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href="/pilotage/tableau-de-bord">
                {t("pages.dashboard.ctaWorkspace")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/statistiques/analytics">
                <Sparkles className="h-4 w-4" /> {t("pages.dashboard.ctaFeatures")}
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span>{t("pages.dashboard.activeRole")} : <strong className="text-white">{role.label}</strong></span>
            <span>{t("pages.dashboard.region")} : <strong className="text-white">{regionName}</strong></span>
            <span>{t("pages.dashboard.status")} : <strong className="text-white">{t("common.status")}</strong></span>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Rôles supportés" value={USER_ROLES.length} icon={ShieldCheck} tone="green" hint="Habilitations fines" />
        <KpiCard label="Niveaux pédagogiques" value={7} icon={GraduationCap} tone="blue" hint="6ᵉ → Tˡᵉ" />
        <KpiCard label="Régions académiques" value={country.academicRegions.length} icon={Map} tone="gold" hint={country.academicRegionLabel} />
        <KpiCard label="Modules fonctionnels" value={ALL_NAV_ITEMS.length} icon={LayoutGrid} tone="purple" />
        <KpiCard label="Taux de présence" value="94,2 %" icon={CheckCircle2} tone="teal" delta={1.4} />
        <KpiCard label="Inspections planifiées" value={plannedInspections} icon={SearchCheck} tone="red" hint="à venir" />
      </div>

      {/* Carte Transport d'élèves (statut live pour l'abonné / admin) */}
      <TransportDashboardCard />

      {/* Sommaire des blocs */}
      <SectionNav
        sections={[
          { id: "modules", label: "Modules clés" },
          { id: "analyses", label: "Analyses" },
          { id: "actions", label: "Actions & activités" },
          { id: "espaces", label: "Espaces par rôle" },
        ]}
      />
      <FloatingSectionNav
        sections={[
          { id: "modules", label: "Modules clés" },
          { id: "analyses", label: "Analyses" },
          { id: "actions", label: "Actions & activités" },
          { id: "espaces", label: "Espaces par rôle" },
        ]}
      />

      {/* Modules clés */}
      <SectionCard
        id="modules"
        title={t("pages.dashboard.modulesTitle")}
        description={t("pages.dashboard.modulesDescription")}
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/pilotage/tableau-de-bord">Tout voir</Link>
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <ModuleCard key={m.href} {...m} />
          ))}
        </div>
      </SectionCard>

      {/* Analytics */}
      <div id="analyses" className="scroll-mt-24 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Assiduité de l'année" description="Taux de présence et d'absence par mois">
          <AreaTrend
            data={ATTENDANCE_SERIES}
            xKey="mois"
            series={[
              { key: "presence", label: "Présence (%)", color: "#176b45" },
              { key: "absence", label: "Absence (%)", color: "#ea580c" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Répartition des effectifs" description="Par cycle pédagogique">
          <DonutChart data={ENROLLMENT_PIE} />
        </ChartCard>
        <ChartCard title="Progression des recommandations" description="Taux d'achèvement mensuel">
          <LineTrend data={RECOMMENDATION_COMPLETION} xKey="mois" series={[{ key: "taux", label: "Achèvement (%)" }]} />
        </ChartCard>
        <ChartCard title="Performance pédagogique" description="Profil moyen d'observation de classe">
          <RadarScore data={TEACHER_RADAR} />
        </ChartCard>
      </div>

      {/* Actions rapides + activité + aperçu */}
      <div id="actions" className="scroll-mt-24 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Actions rapides" className="lg:col-span-1">
          <div className="space-y-3">
            <ActionCard title="Créer un utilisateur" description="Ajouter un compte" icon={UserPlus} tone="green" href="/systeme/comptes-utilisateurs" />
            <ActionCard title="Générer un rapport" description="Établissement / activité" icon={FilePlus2} tone="blue" href="/vie-scolaire/rapport-etablissement" />
            <ActionCard title="Envoyer une annonce" description="Communication interne" icon={Send} tone="gold" href="/vie-scolaire/communication" />
            <ActionCard title="Planifier une inspection" description="Supervision pédagogique" icon={SearchCheck} tone="purple" href="/inspection-supervision/inspection" />
          </div>
        </SectionCard>

        <SectionCard title="Dernières activités" description="Issues du journal d'activité" className="lg:col-span-2">
          <AuditTimeline entries={AUDIT_ENTRIES.slice(0, 5)} />
        </SectionCard>
      </div>

      {isAdminLike && (
        <SectionCard
          title="Aperçu de rôle"
          description="En tant qu'administrateur, prévisualisez l'interface telle que la voient les autres profils."
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" /> Utilisez le bouton « Aperçu de rôle » dans la barre supérieure.
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["chef_etablissement", "enseignant", "parent", "eleve", "inspecteur"].map((r) => (
                <Badge key={r} tone="slate">
                  {getRole(r as never).label}
                </Badge>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Un espace dédié pour chaque utilisateur */}
      <section id="espaces" className="scroll-mt-24 space-y-5">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            Un espace dédié pour <span className="italic text-ew-green-700">chaque utilisateur</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chaque rôle dispose d&apos;un espace et d&apos;outils adaptés à ses missions.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {ROLE_SPACES.map(({ id, icon: Icon, description }) => {
            const r = getRole(id);
            return (
              <div
                key={id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ew-green-600/40 hover:shadow-md"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    TONE_PASTILLE[r.tone],
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground">{r.label}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Partenariats */}
      <section className="ew-fade-in rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ew-green-100 text-ew-green-700">
              <Star className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-foreground">Partenariats</h2>
          </div>
          {isAdminLike && !isReadOnlyPreview && (
            <Button variant="outline" size="sm" onClick={() => setPartnersOpen(true)}>
              <Pencil className="h-4 w-4" /> Gérer
            </Button>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Survolez le logo d&apos;un partenaire pour en savoir plus.</p>
        <TooltipProvider delayDuration={100}>
          <div className="mt-4 flex flex-wrap gap-5">
            {store.partners.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun partenaire pour le moment.</p>
            )}
            {store.partners.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-28 w-48 cursor-pointer items-center justify-center rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ew-green-600/40 hover:shadow-md">
                      {p.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.logoUrl} alt={p.name} className="max-h-16 max-w-[85%] object-contain" />
                      ) : (
                        <span
                          className="flex h-14 w-full items-center justify-center rounded-lg px-3 text-center text-base font-extrabold tracking-tight text-white"
                          style={{ background: p.accent }}
                        >
                          {p.short}
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-center text-xs font-normal">
                    {p.description}
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm font-semibold text-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </section>

      {/* Appel à l'action */}
      <section className="rounded-2xl border border-ew-gold-500/40 bg-ew-gold-100/40 px-6 py-8 text-center">
        <h2 className="text-xl font-extrabold text-foreground">Prêt à utiliser EduWeb Planner&nbsp;?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Tous les outils sont disponibles depuis le menu latéral. Vous pouvez revenir à cette page d&apos;accueil à
          tout moment via le bouton «&nbsp;Accueil&nbsp;».
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-5">
          <Link href="/pilotage/tableau-de-bord">
            Accéder à mon espace <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {isAdminLike && (
        <ManagePartnersDialog
          open={partnersOpen}
          onOpenChange={setPartnersOpen}
          partners={store.partners}
          onSave={store.setPartners}
        />
      )}
    </div>
  );
}
