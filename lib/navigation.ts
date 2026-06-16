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
} from "lucide-react";
import type { Permission } from "./permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
  description?: string;
}

export interface NavGroup {
  id: string;
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
    label: "Accueil",
    icon: Home,
    direct: true,
    items: [
      {
        href: "/dashboard",
        label: "Accueil",
        icon: Home,
        permission: "dashboard:view",
        description: "Page d'accueil",
      },
    ],
  },
  {
    id: "pilotage",
    label: "Pilotage",
    icon: Gauge,
    items: [
      {
        href: "/pilotage/tableau-de-bord",
        label: "Tableau de bord",
        icon: Gauge,
        permission: "statistics:analytics",
        description: "Indicateurs de pilotage",
      },
    ],
  },
  {
    id: "systeme",
    label: "Système",
    icon: Settings2,
    items: [
      {
        href: "/systeme/vue-ensemble",
        label: "Vue d'ensemble",
        icon: LayoutDashboard,
        permission: "system:view",
      },
      {
        href: "/systeme/mon-identification",
        label: "Mon Identification",
        icon: BadgeCheck,
        permission: "system:manage_profile",
      },
      {
        href: "/systeme/mon-profil",
        label: "Mon profil",
        icon: UserCog,
        permission: "system:manage_profile",
      },
      {
        href: "/systeme/niveaux-acces",
        label: "Niveaux d'accès",
        icon: ShieldCheck,
        permission: "system:manage_roles",
      },
      {
        href: "/systeme/habilitations",
        label: "Habilitations",
        icon: KeyRound,
        permission: "system:manage_permissions",
      },
      {
        href: "/systeme/comptes-utilisateurs",
        label: "Comptes utilisateurs",
        icon: Users,
        permission: "system:manage_users",
      },
      {
        href: "/systeme/approbations-promo",
        label: "Approbations promo",
        icon: UserCheck,
        permission: "system:approve_promotions",
      },
      {
        href: "/systeme/etablissements",
        label: "Établissements",
        icon: Building2,
        permission: "system:manage_institutions",
      },
      {
        href: "/systeme/cafop",
        label: "CAFOP",
        icon: GraduationCap,
        permission: "system:manage_cafop",
      },
      {
        href: "/systeme/convertisseur-csv",
        label: "Convertisseur CSV",
        icon: FileSpreadsheet,
        permission: "system:convert_csv",
      },
      {
        href: "/systeme/journal-activite",
        label: "Journal d'activité",
        icon: History,
        permission: "system:view_audit_log",
      },
      {
        href: "/systeme/facturation",
        label: "Facturation",
        icon: CreditCard,
        permission: "system:manage_billing",
      },
      {
        href: "/systeme/design-theme",
        label: "Design & thème",
        icon: Palette,
        permission: "system:customize_theme",
      },
      {
        href: "/systeme/installation",
        label: "Installation",
        icon: Wrench,
        permission: "system:view_installation",
      },
    ],
  },
  {
    id: "parametrage",
    label: "Paramétrage",
    icon: Settings,
    items: [
      {
        href: "/parametrage/configuration",
        label: "Configuration",
        icon: Settings,
        permission: "settings:manage_configuration",
      },
      {
        href: "/parametrage/emplois-du-temps",
        label: "Emplois du temps",
        icon: CalendarDays,
        permission: "timetable:view",
      },
    ],
  },
  {
    id: "vie-scolaire",
    label: "Vie scolaire",
    icon: GraduationCap,
    items: [
      {
        href: "/vie-scolaire/registre-appel",
        label: "Registre d'appel",
        icon: ClipboardCheck,
        permission: "attendance:view",
      },
      {
        href: "/vie-scolaire/cahier-de-texte",
        label: "Cahier de texte",
        icon: NotebookText,
        permission: "lesson_book:view",
      },
      {
        href: "/vie-scolaire/communication",
        label: "Communication",
        icon: MessagesSquare,
        permission: "communication:view",
      },
      {
        href: "/vie-scolaire/notes-bulletins",
        label: "Notes & bulletins",
        icon: ClipboardList,
        permission: "grades:view",
      },
      {
        href: "/vie-scolaire/livret-scolaire",
        label: "Livret scolaire",
        icon: BookMarked,
        permission: "school_record:view",
      },
      {
        href: "/vie-scolaire/rapport-etablissement",
        label: "Rapport d'établissement",
        icon: Building,
        permission: "institution_report:view",
      },
      {
        href: "/vie-scolaire/rapports-activite",
        label: "Rapports d'activité",
        icon: Activity,
        permission: "activity_reports:view",
      },
      {
        href: "/vie-scolaire/rendez-vous",
        label: "Rendez-vous",
        icon: CalendarClock,
        permission: "appointments:view",
      },
      {
        href: "/vie-scolaire/academie-premium",
        label: "Académie Premium",
        icon: Crown,
        permission: "premium:view",
      },
      {
        href: "/vie-scolaire/alertes-sms",
        label: "Alertes & SMS",
        icon: BellRing,
        permission: "sms:view",
      },
    ],
  },
  {
    id: "inspection-supervision",
    label: "Inspection & Supervision",
    icon: ShieldCheck,
    items: [
      {
        href: "/inspection-supervision/inspection",
        label: "Inspection",
        icon: SearchCheck,
        permission: "inspection:view",
      },
      {
        href: "/inspection-supervision/apfc",
        label: "APFC",
        icon: Network,
        permission: "system:manage_apfc",
      },
      {
        href: "/inspection-supervision/rapports-antennes",
        label: "Rapports d'antennes",
        icon: Files,
        permission: "antenna_reports:view",
      },
      {
        href: "/inspection-supervision/rapport-antennes-pedagogiques",
        label: "Rapport d'Antennes Pédagogiques",
        icon: FolderTree,
        permission: "antenna_reports:view",
      },
      {
        href: "/inspection-supervision/grille-evaluation",
        label: "Grille d'évaluation",
        icon: ListChecks,
        permission: "evaluation_grid:view",
      },
      {
        href: "/inspection-supervision/rapports-inspection",
        label: "Rapports d'inspection",
        icon: FileCheck2,
        permission: "inspection_reports:view",
      },
    ],
  },
  {
    id: "statistiques",
    label: "Statistiques",
    icon: BarChart3,
    items: [
      {
        href: "/statistiques/par-classe",
        label: "Par classe",
        icon: BarChart3,
        permission: "statistics:class",
      },
      {
        href: "/statistiques/etablissement",
        label: "Établissement",
        icon: Building,
        permission: "statistics:institution",
      },
      {
        href: "/statistiques/regionales",
        label: "Régionales",
        icon: Map,
        permission: "statistics:regional",
      },
      {
        href: "/statistiques/analytics",
        label: "Analytics",
        icon: LineChart,
        permission: "statistics:analytics",
      },
      {
        href: "/statistiques/performance-enseignants",
        label: "Performance des enseignants",
        icon: Award,
        permission: "statistics:teacher_performance",
      },
      {
        href: "/statistiques/efficacite-pedagogique",
        label: "Efficacité pédagogique",
        icon: Target,
        permission: "statistics:pedagogical_effectiveness",
      },
      {
        href: "/statistiques/suivi-recommandations",
        label: "Suivi des recommandations",
        icon: ListTodo,
        permission: "recommendations:view",
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
