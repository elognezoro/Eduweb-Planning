"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SidebarContent } from "./sidebar";
import { Topbar } from "./topbar";
import { RolePreviewBanner } from "./role-preview";
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
          <div className="absolute left-0 top-0 h-full w-[280px] shadow-2xl ew-fade-in">
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
        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          {t("footer.tagline")} · © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
