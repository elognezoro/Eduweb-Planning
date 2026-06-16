"use client";

import { Eye, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "./app-context";
import { ROLE_LIST, getRole } from "@/lib/roles";
import { hasPermission } from "@/lib/permissions";

/** Menu permettant à un profil habilité de prévisualiser l'interface d'un autre rôle. */
export function RolePreviewMenu() {
  const { realRole, effectiveRole, setPreviewRole } = useApp();
  // Seuls les profils disposant de role_preview:use (rôle réel) peuvent l'utiliser.
  if (!hasPermission(realRole, "role_preview:use")) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:inline-flex">
          <Eye className="h-4 w-4" />
          Aperçu de rôle
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        <DropdownMenuLabel>Consulter l&apos;interface en tant que…</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLE_LIST.filter((r) => r.id !== realRole).map((r) => (
          <DropdownMenuItem
            key={r.id}
            onClick={() => setPreviewRole(r.id)}
            className={effectiveRole === r.id ? "bg-ew-green-50" : ""}
          >
            {r.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Bandeau visible signalant le mode aperçu. */
export function RolePreviewBanner() {
  const { isPreview, effectiveRole, exitPreview } = useApp();
  if (!isPreview) return null;
  const role = getRole(effectiveRole);
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ew-gold-500/40 bg-ew-gold-100 px-4 py-2.5 text-sm">
      <span className="flex items-center gap-2 font-semibold text-ew-gold-600">
        <Eye className="h-4 w-4" />
        Mode aperçu : vous consultez l&apos;interface en tant que «&nbsp;{role.label}&nbsp;». Les actions sensibles sont
        désactivées.
      </span>
      <Button variant="outline" size="sm" onClick={exitPreview}>
        <X className="h-4 w-4" />
        Quitter l&apos;aperçu
      </Button>
    </div>
  );
}
