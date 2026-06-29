"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SidebarContent } from "./sidebar";
import { Topbar } from "./topbar";
import { RolePreviewBanner } from "./role-preview";
import { IdleLogoutWatcher } from "./idle-logout-watcher";
import { SecuritySettingsSync } from "./security-settings-sync";
import { EnrollmentIntentClaimer } from "@/components/formations/enrollment-intent-claimer";
import { CourseEnrollmentsSync } from "@/components/formations/course-enrollments-sync";
import { CohortsSync } from "@/components/formations/cohorts-sync";
import { LivretSync } from "@/components/livret/livret-sync";
import { EtabConfigSync } from "./etab-config-sync";
import { cn } from "@/lib/utils";

const LS_COLLAPSED = "eduweb.sidebar.collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const t = useTranslations();

  React.useEffect(() => {
    setCollapsed(localStorage.getItem(LS_COLLAPSED) === "1");
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(LS_COLLAPSED, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 transition-[width] duration-200 lg:block",
          collapsed ? "w-[84px]" : "w-[280px]",
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ew-green-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] shadow-2xl ew-fade-in">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Colonne principale */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-[1400px]">
            <RolePreviewBanner />
            {children}
          </div>
        </main>
        <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          {t("footer.tagline")} · © {new Date().getFullYear()}
        </footer>
      </div>
      {/* Charge les réglages de sécurité globaux (durée d'inactivité) définis
          par le super-admin, en mode réel, dans le store de chaque utilisateur. */}
      <SecuritySettingsSync />
      {/* Surveillance d'inactivité globale : déconnexion automatique selon
          la durée configurée par l'administrateur. */}
      <IdleLogoutWatcher />
      {/* Matérialise les inscriptions issues d'un lien d'inscription dès que
          l'utilisateur invité se connecte au tableau de bord. */}
      <EnrollmentIntentClaimer />
      {/* Charge les inscriptions persistées (Supabase) dans le store local en
          mode réel — visibilité cross-appareil + côté admin. */}
      <CourseEnrollmentsSync />
      <CohortsSync />
      <LivretSync />
      {/* Hydrate la config d'établissement (Supabase → cache local) pour les
          bulletins/livret/certificats, partagée et visible cross-appareil. */}
      <EtabConfigSync />
    </div>
  );
}
