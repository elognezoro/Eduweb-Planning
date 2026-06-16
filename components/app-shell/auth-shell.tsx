/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/** Style des champs d'authentification (fond doux, arrondi). */
export const authInputCls =
  "h-12 rounded-xl border-transparent bg-muted/60 px-4 text-[15px] shadow-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:bg-card";

/** Logo EduWeb : image /brand/logo.png si présente, sinon repli sur le mot-symbole. */
function AuthLogo() {
  const [ok, setOk] = React.useState(true);
  return (
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-white p-1.5 shadow-sm">
      {ok ? (
        <img
          src="/brand/logo.png"
          alt="EduWeb Planner"
          className="h-full w-full rounded-xl object-contain"
          onError={() => setOk(false)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-ew-green-700 to-ew-green-900">
          <GraduationCap className="h-9 w-9 text-ew-gold-500" />
        </span>
      )}
    </div>
  );
}

/** Carte d'authentification : logo, titre, onglets Connexion / Créer un compte. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isRegister = pathname.startsWith("/register");
  const isReset = pathname.startsWith("/reset-password");
  const t = useTranslations();

  return (
    <div className="ew-fade-in max-h-[94vh] w-full overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5 sm:p-8">
      <AuthLogo />
      <h1 className="mt-4 text-center font-display text-[28px] font-extrabold leading-tight text-ew-green-900">
        {t("common.appName")}
      </h1>
      <p className="text-center text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>

      {!isReset && (
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border p-1">
          <Tab href="/login" active={!isRegister}>
            {t("auth.loginTitle")}
          </Tab>
          <Tab href="/register" active={isRegister}>
            {t("auth.registerTitle")}
          </Tab>
        </div>
      )}

      <div className="mt-6">{children}</div>
    </div>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg py-2.5 text-center text-sm font-bold transition-colors",
        active ? "bg-ew-green-700 text-white shadow-sm" : "text-foreground hover:bg-muted",
      )}
    >
      {children}
    </Link>
  );
}

/** Étiquette de champ : majuscules, astérisque requis, icône et badge optionnels. */
export function AuthField({
  label,
  required,
  icon: Icon,
  badge,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-foreground">
          {Icon && <Icon className="h-3.5 w-3.5 text-ew-green-700" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
        {badge}
      </div>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
