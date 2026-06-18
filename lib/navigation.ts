import type { LucideIcon } from "lucide-react";
import {
  Home,
  LayoutDashboard,
  Gauge,
  BadgeCheck,
  UserCog,
  ShieldCheck,
  KeyRound,
  Users,
  UserCheck,
  Building2,
  GraduationCap,
  Network,
  FileSpreadsheet,
  History,
  CreditCard,
  Palette,
  Wrench,
  Settings,
  Settings2,
  CalendarDays,
  ClipboardCheck,
  NotebookText,
  MessagesSquare,
  ClipboardList,
  BookMarked,
  CalendarClock,
  Crown,
  BellRing,
  SearchCheck,
  ListChecks,
  Files,
  FileCheck2,
  Building,
  Activity,
  FolderTree,
  BarChart3,
  Map,
  LineChart,
  Award,
  Target,
  ListTodo,
  BookOpen,
} from "lucide-react";
import type { Permission } from "./permissions";

export interface NavItem {
  href: string;
  /** Clé i18n (ex. "nav.items.accueil"). Le composant Sidebar la résout via useTranslations(). */
  label: string;
  icon: LucideIcon;
  permission: Permission;
  description?: string;
}

export interface NavGroup {
  id: string;
  /** Clé i18n (ex. "nav.groups.systeme"). */
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  /** Lien direct (non repliable) : la section est rendue comme un simple lien. */
  direct?: boolean;
}

/**
 * Navigation latérale complète, groupée par section.
 * Chaque entrée est gardée par une permission ; la sidebar filtre selon le rôle actif.
 * Les `href` sont relatifs à la locale (le composant Link de next-intl ajoute /fr ou /en).
 */
export const NAVIGATION: NavGroup[] = [
  {
    id: "accueil",
    label: "nav.groups.accueil",
    icon: Home,
    direct: true,
    items: [
      {
        href: "/dashboard",
        label: "nav.items.accueil",
        icon: Home,
        permission: "dashboard:view",
        description: "Page d'accueil",
      },
    ],
  },
  {
    id: "pilotage",
    label: "nav.groups.pilotage",
    icon: Gauge,
    items: [
      {
        href: "/pilotage/tableau-de-bord",
        label: "nav.items.tableauDeBord",
        icon: Gauge,
        permission: "statistics:analytics",
        description: "Indicateurs de pilotage",
      },
    ],
  },
  {
    id: "systeme",
    label: "nav.groups.systeme",
    icon: Settings2,
    items: [
      {
        href: "/systeme/vue-ensemble",
        label: "nav.items.vueDEnsemble",
        icon: LayoutDashboard,
        permission: "system:view",
      },
      {
        href: "/systeme/mon-identification",
        label: "nav.items.monIdentification",
        icon: BadgeCheck,
        permission: "system:manage_profile",
      },
      {
        href: "/systeme/mon-profil",
        label: "nav.items.monProfil",
        icon: UserCog,
        permission: "system:manage_profile",
      },
      {
        href: "/systeme/niveaux-acces",
        label: "nav.items.niveauxAcces",
        icon: ShieldCheck,
        permission: "system:manage_roles",
      },
      {
        href: "/systeme/habilitations",
        label: "nav.items.habilitations",
        icon: KeyRound,
        permission: "system:manage_permissions",
      },
      {
        href: "/systeme/comptes-utilisateurs",
        label: "nav.items.comptesUtilisateurs",
        icon: Users,
        permission: "system:manage_users",
      },
      {
        href: "/systeme/approbations-promo",
        label: "nav.items.approbationsPromo",
        icon: UserCheck,
        permission: "system:approve_promotions",
      },
      {
        href: "/systeme/etablissements",
        label: "nav.items.etablissements",
        icon: Building2,
        permission: "system:manage_institutions",
      },
      {
        href: "/systeme/cafop",
        label: "nav.items.cafop",
        icon: GraduationCap,
        permission: "system:manage_cafop",
      },
      {
        href: "/systeme/convertisseur-csv",
        label: "nav.items.convertisseurCsv",
        icon: FileSpreadsheet,
        permission: "system:convert_csv",
      },
      {
        href: "/systeme/journal-activite",
        label: "nav.items.journalActivite",
        icon: History,
        permission: "system:view_audit_log",
      },
      {
        href: "/systeme/facturation",
        label: "nav.items.facturation",
        icon: CreditCard,
        permission: "system:manage_billing",
      },
      {
        href: "/systeme/design-theme",
        label: "nav.items.designTheme",
        icon: Palette,
        permission: "system:customize_theme",
      },
      {
        href: "/systeme/installation",
        label: "nav.items.installation",
        icon: Wrench,
        permission: "system:view_installation",
      },
    ],
  },
  {
    id: "parametrage",
    label: "nav.groups.parametrage",
    icon: Settings,
    items: [
      {
        href: "/parametrage/configuration",
        label: "nav.items.configuration",
        icon: Settings,
        permission: "settings:manage_configuration",
      },
      {
        href: "/parametrage/emplois-du-temps",
        label: "nav.items.emploisDuTemps",
        icon: CalendarDays,
        permission: "timetable:view",
      },
    ],
  },
  {
    id: "vie-scolaire",
    label: "nav.groups.vieScolaire",
    icon: GraduationCap,
    items: [
      {
        href: "/vie-scolaire/registre-appel",
        label: "nav.items.registreAppel",
        icon: ClipboardCheck,
        permission: "attendance:view",
      },
      {
        href: "/vie-scolaire/cahier-de-texte",
        label: "nav.items.cahierDeTexte",
        icon: NotebookText,
        permission: "lesson_book:view",
      },
      {
        href: "/vie-scolaire/communication",
        label: "nav.items.communication",
        icon: MessagesSquare,
        permission: "communication:view",
      },
      {
        href: "/vie-scolaire/notes-bulletins",
        label: "nav.items.notesBulletins",
        icon: ClipboardList,
        permission: "grades:view",
      },
      {
        href: "/vie-scolaire/livret-scolaire",
        label: "nav.items.livretScolaire",
        icon: BookMarked,
        permission: "school_record:view",
      },
      {
        href: "/vie-scolaire/rapport-etablissement",
        label: "nav.items.rapportEtablissement",
        icon: Building,
        permission: "institution_report:view",
      },
      {
        href: "/vie-scolaire/rapports-activite",
        label: "nav.items.rapportsActivite",
        icon: Activity,
        permission: "activity_reports:view",
      },
      {
        href: "/vie-scolaire/rendez-vous",
        label: "nav.items.rendezVous",
        icon: CalendarClock,
        permission: "appointments:view",
      },
      {
        href: "/vie-scolaire/academie-premium",
        label: "nav.items.academiePremium",
        icon: Crown,
        permission: "premium:view",
      },
      {
        href: "/vie-scolaire/alertes-sms",
        label: "nav.items.alertesSms",
        icon: BellRing,
        permission: "sms:view",
      },
    ],
  },
  {
    id: "inspection-supervision",
    label: "nav.groups.inspectionSupervision",
    icon: ShieldCheck,
    items: [
      {
        href: "/inspection-supervision/inspection",
        label: "nav.items.inspection",
        icon: SearchCheck,
        permission: "inspection:view",
      },
      {
        href: "/inspection-supervision/apfc",
        label: "nav.items.apfc",
        icon: Network,
        permission: "system:manage_apfc",
      },
      {
        href: "/inspection-supervision/rapports-antennes",
        label: "nav.items.rapportsAntennes",
        icon: Files,
        permission: "antenna_reports:view",
      },
      {
        href: "/inspection-supervision/rapport-antennes-pedagogiques",
        label: "nav.items.rapportAntennesPedagogiques",
        icon: FolderTree,
        permission: "antenna_reports:view",
      },
      {
        href: "/inspection-supervision/grille-evaluation",
        label: "nav.items.grilleEvaluation",
        icon: ListChecks,
        permission: "evaluation_grid:view",
      },
      {
        href: "/inspection-supervision/rapports-inspection",
        label: "nav.items.rapportsInspection",
        icon: FileCheck2,
        permission: "inspection_reports:view",
      },
    ],
  },
  {
    id: "statistiques",
    label: "nav.groups.statistiques",
    icon: BarChart3,
    items: [
      {
        href: "/statistiques/par-classe",
        label: "nav.items.parClasse",
        icon: BarChart3,
        permission: "statistics:class",
      },
      {
        href: "/statistiques/etablissement",
        label: "nav.items.etablissementStats",
        icon: Building,
        permission: "statistics:institution",
      },
      {
        href: "/statistiques/regionales",
        label: "nav.items.regionales",
        icon: Map,
        permission: "statistics:regional",
      },
      {
        href: "/statistiques/analytics",
        label: "nav.items.analytics",
        icon: LineChart,
        permission: "statistics:analytics",
      },
      {
        href: "/statistiques/performance-enseignants",
        label: "nav.items.performanceEnseignants",
        icon: Award,
        permission: "statistics:teacher_performance",
      },
      {
        href: "/statistiques/efficacite-pedagogique",
        label: "nav.items.efficacitePedagogique",
        icon: Target,
        permission: "statistics:pedagogical_effectiveness",
      },
      {
        href: "/statistiques/suivi-recommandations",
        label: "nav.items.suiviRecommandations",
        icon: ListTodo,
        permission: "recommendations:view",
      },
    ],
  },
  {
    id: "aide",
    label: "nav.groups.aide",
    icon: BookOpen,
    direct: true,
    items: [
      {
        href: "/aide",
        label: "nav.items.aide",
        icon: BookOpen,
        permission: "dashboard:view",
        description: "Bibliothèque de guides de formation",
      },
    ],
  },
];

/** Aplatit la navigation en liste d'items (pour la recherche / breadcrumbs). */
export const ALL_NAV_ITEMS: NavItem[] = NAVIGATION.flatMap((g) => g.items);

/** Retrouve un item de navigation par son href. */
export function findNavItem(href: string): NavItem | undefined {
  return ALL_NAV_ITEMS.find((item) => item.href === href);
}
