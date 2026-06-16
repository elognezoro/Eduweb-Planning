"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { NAVIGATION, type NavItem } from "@/lib/navigation";
import { useApp } from "./app-context";
import { useLogout } from "./use-logout";
import { getRole } from "@/lib/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfilePhoto } from "@/lib/profile-photo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "./logo";
import { cn, initials } from "@/lib/utils";

interface SidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarContent({ collapsed = false, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const { can, user, effectiveRole } = useApp();
  const logout = useLogout();
  const profilePhoto = useProfilePhoto();
  const role = getRole(effectiveRole);

  const groups = NAVIGATION.map((g) => ({
    ...g,
    items: g.items.filter((it) => can(it.permission)),
  })).filter((g) => g.items.length > 0);

  const directGroups = groups.filter((g) => g.direct);
  const accordionGroups = groups.filter((g) => !g.direct);

  const activeGroupId =
    accordionGroups.find((g) => g.items.some((it) => pathname === it.href || pathname.startsWith(it.href + "/")))?.id ??
    null;

  const [openGroup, setOpenGroup] = React.useState<string | null>(activeGroupId);
  React.useEffect(() => {
    setOpenGroup(activeGroupId);
  }, [activeGroupId]);

  return (
    <div className="relative h-full overflow-hidden bg-gradient-to-b from-ew-green-950 to-ew-green-900 text-white/90">
      {/* Halo doré subtil en haut */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(120%_80%_at_50%_-25%,rgba(235,165,42,0.16),transparent_72%)]" />

      <div className="relative z-10 flex h-full flex-col">
        {/* En-tête / logo */}
        <div className={cn("flex h-16 items-center border-b border-white/10 px-4", collapsed && "justify-center px-0")}>
          <Logo collapsed={collapsed} />
        </div>

        {/* Navigation */}
        <TooltipProvider delayDuration={100}>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {directGroups.map((group) => {
                const item = group.items[0];
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <NavLink key={item.href} item={item} active={active} collapsed={collapsed} onNavigate={onNavigate} />
                );
              })}
            </div>

            {directGroups.length > 0 && accordionGroups.length > 0 && (
              <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            )}

            <div className="space-y-4">
              {accordionGroups.map((group) => (
                <NavGroupBlock
                  key={group.id}
                  group={group}
                  collapsed={collapsed}
                  pathname={pathname}
                  isOpen={openGroup === group.id}
                  onToggle={() => setOpenGroup((prev) => (prev === group.id ? null : group.id))}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </nav>
        </TooltipProvider>

        {/* Pied : profil + déconnexion */}
        <div className="border-t border-white/10 p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl bg-white/[0.06] p-2.5 ring-1 ring-inset ring-white/10",
              collapsed && "justify-center bg-transparent p-1 ring-0",
            )}
          >
            <Avatar className="h-9 w-9 ring-2 ring-ew-gold-500/40">
              {profilePhoto && <AvatarImage src={profilePhoto} alt="Photo de profil" />}
              <AvatarFallback className="bg-ew-gold-500 font-bold text-ew-green-950">{initials(user.displayName)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.displayName}</p>
                <p className="truncate text-xs text-ew-gold-500/90">{role.label}</p>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={logout}
                className="rounded-lg p-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavGroupBlock({
  group,
  collapsed,
  pathname,
  isOpen,
  onToggle,
  onNavigate,
}: {
  group: (typeof NAVIGATION)[number];
  collapsed: boolean;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const hasActive = group.items.some((it) => pathname === it.href || pathname.startsWith(it.href + "/"));

  return (
    <div>
      {!collapsed && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className={cn(
            "mb-1.5 flex w-full items-center justify-between rounded-md px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.13em] transition-colors hover:text-white/75",
            hasActive ? "text-ew-gold-500" : "text-white/40",
          )}
        >
          {group.label}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", !isOpen && "-rotate-90")} />
        </button>
      )}
      {(isOpen || collapsed) && (
        <div className="space-y-0.5">
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href || pathname.startsWith(item.href + "/")}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
      {collapsed && hasActive && <div className="mx-auto mt-1 h-0.5 w-5 rounded-full bg-ew-gold-500/60" />}
    </div>
  );
}

/** Lien de navigation unitaire (barre dorée active, tooltip en mode replié). */
function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all duration-150",
        collapsed && "justify-center px-0",
        active
          ? "bg-white/[0.09] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
          : "font-medium text-white/65 hover:bg-white/[0.06] hover:text-white",
      )}
    >
      {active && !collapsed && (
        <span className="absolute left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-ew-gold-500" />
      )}
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-ew-gold-500" : "text-white/55 group-hover:text-white/90",
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  ) : (
    link
  );
}
