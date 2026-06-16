"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  ChevronRight,
  Home,
  CircleUser,
  BadgeCheck,
  LogOut,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfilePhoto } from "@/lib/profile-photo";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "./app-context";
import { useLogout } from "./use-logout";
import { getRole } from "@/lib/roles";
import { NAVIGATION, findNavItem } from "@/lib/navigation";
import { CountrySwitcher, AcademicYearSwitcher, LocaleSwitcher } from "./switchers";
import { RolePreviewMenu } from "./role-preview";
import { GlobalSearch } from "./global-search";
import { initials } from "@/lib/utils";

interface TopbarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}

export function Topbar({ collapsed, onToggleCollapse, onOpenMobile }: TopbarProps) {
  const pathname = usePathname();
  const { user, effectiveRole } = useApp();
  const logout = useLogout();
  const profilePhoto = useProfilePhoto();
  const role = getRole(effectiveRole);
  const t = useTranslations();

  const item = findNavItem(pathname) ?? ALL_FALLBACK(pathname);
  const group = NAVIGATION.find((g) => g.items.some((it) => it.href === item?.href));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-card/85 px-3 backdrop-blur sm:px-5">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobile} aria-label={t("topbar.openMenu")}>
        <Menu className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? t("topbar.expandSidebar") : t("topbar.collapseSidebar")}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </Button>

      {/* Fil d'Ariane */}
      <nav className="hidden items-center gap-1.5 text-sm md:flex" aria-label="Breadcrumb">
        <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <Home className="h-4 w-4" />
        </Link>
        {group && group.label !== item?.label && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{t(group.label)}</span>
          </>
        )}
        {item && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">{t(item.label)}</span>
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <GlobalSearch
          trigger={(open) => (
            <Button
              variant="outline"
              onClick={open}
              className="hidden h-9 w-56 justify-start gap-2 text-muted-foreground xl:flex"
            >
              <Search className="h-4 w-4" />
              {t("common.search")}
            </Button>
          )}
        />
        <GlobalSearch
          trigger={(open) => (
            <Button variant="ghost" size="icon" className="xl:hidden" onClick={open} aria-label={t("common.search")}>
              <Search className="h-5 w-5" />
            </Button>
          )}
        />

        <div className="hidden items-center gap-1.5 lg:flex">
          <CountrySwitcher />
          <AcademicYearSwitcher />
          <LocaleSwitcher />
        </div>

        <RolePreviewMenu />

        <NotificationsMenu />

        {/* Profil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted">
              <Avatar className="h-9 w-9">
                {profilePhoto && <AvatarImage src={profilePhoto} alt="Photo de profil" />}
                <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold leading-tight text-foreground">{user.displayName}</span>
                <span className="block text-[11px] leading-tight text-muted-foreground">{role.shortLabel}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="normal-case">
              <div className="font-bold text-foreground">{user.displayName}</div>
              <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
              <div className="mt-1.5">
                <Badge tone={role.tone}>{role.label}</Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/systeme/mon-profil">
                <CircleUser className="h-4 w-4" /> {t("nav.items.monProfil")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/systeme/mon-identification">
                <BadgeCheck className="h-4 w-4" /> {t("nav.items.monIdentification")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="h-4 w-4" /> {t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function ALL_FALLBACK(pathname: string) {
  // Pour /dashboard ou routes non listées, retourne l'item Accueil.
  return NAVIGATION[0]?.items.find((it) => pathname.startsWith(it.href));
}

const NOTIFICATIONS = [
  { id: 1, title: "Nouveau bulletin à valider", detail: "Classe 3ᵉ A — 38 élèves", time: "il y a 10 min", tone: "green" as const },
  { id: 2, title: "Recommandation en retard", detail: "Régularité du cahier de texte", time: "il y a 2 h", tone: "red" as const },
  { id: 3, title: "Inspection programmée", detail: "P. Kouassi — 12 juin", time: "hier", tone: "blue" as const },
  { id: 4, title: "Paiement reçu", detail: "GS La Lumière — 1 900 000 FCFA", time: "hier", tone: "gold" as const },
];

function NotificationsMenu() {
  const t = useTranslations();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("common.notifications")}>
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-ew-gold-500 ring-2 ring-card" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between normal-case">
          <span>{t("common.notifications")}</span>
          <Badge tone="gold">{NOTIFICATIONS.length} nouvelles</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NOTIFICATIONS.map((n) => (
          <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
            <div className="flex w-full items-center gap-2">
              <Badge tone={n.tone}>•</Badge>
              <span className="flex-1 font-semibold text-foreground">{n.title}</span>
            </div>
            <span className="pl-1 text-xs text-muted-foreground">
              {n.detail} · {n.time}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
