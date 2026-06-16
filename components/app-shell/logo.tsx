/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Logo EduWeb Planner : utilise l'emblème /brand/logo.png s'il est présent,
 * sinon un mot-symbole de repli (toque verte/or).
 */
export function Logo({ collapsed = false, tone = "light", className }: LogoProps) {
  const [imgOk, setImgOk] = React.useState(true);
  const t = useTranslations();
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md">
        {imgOk ? (
          <img
            src="/brand/logo.png"
            alt="EduWeb Planner"
            className="h-full w-full object-contain p-0.5"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="relative flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-ew-green-600 to-ew-green-800">
            <GraduationCap className="h-5 w-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ew-green-950 bg-ew-gold-500" />
          </span>
        )}
      </span>
      {!collapsed && (
        <span className="flex flex-col leading-none">
          <span className={cn("text-[15px] font-extrabold tracking-tight", tone === "light" ? "text-white" : "text-ew-green-900")}>
            EduWeb<span className="text-ew-gold-500"> Planner</span>
          </span>
          <span className={cn("mt-0.5 text-[10px] font-medium", tone === "light" ? "text-white/55" : "text-muted-foreground")}>
            {t("common.tagline")}
          </span>
        </span>
      )}
    </div>
  );
}
