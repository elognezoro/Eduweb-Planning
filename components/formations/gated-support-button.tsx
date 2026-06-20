"use client";

import * as React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SupportAccessVerdict } from "@/lib/formations/support-access";

/**
 * Bouton de téléchargement d'un support, conditionné par une règle d'accès.
 * - Accès autorisé : bouton actif (lien interne `internal` ou ancre/fichier).
 * - Accès refusé : bouton désactivé avec cadenas + info-bulle expliquant la
 *   condition à remplir.
 */
export function GatedSupportButton({
  access,
  href,
  label,
  icon,
  download,
  internal,
  primary,
}: {
  access: SupportAccessVerdict;
  href: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Force l'attribut `download` (fichiers statiques). */
  download?: boolean;
  /** Navigation interne via next/link (sinon ancre classique). */
  internal?: boolean;
  /** Style principal (sinon « outline »). */
  primary?: boolean;
}) {
  const variant = primary ? "default" : "outline";

  if (!access.allowed) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        aria-disabled
        title={access.reason ?? "Accès restreint."}
        className="opacity-70"
      >
        <Lock aria-hidden className="h-4 w-4" /> {label}
      </Button>
    );
  }

  if (internal) {
    return (
      <Button size="sm" variant={variant} asChild>
        <Link href={href}>
          {icon}
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <Button size="sm" variant={variant} asChild>
      <a href={href} {...(download ? { download: true } : {})}>
        {icon}
        {label}
      </a>
    </Button>
  );
}

/**
 * Variante « lien stylé » : conserve les classes Tailwind passées (utilisé
 * dans les bannières de la bibliothèque, dont les boutons ne sont pas des
 * composants Button mais des ancres stylées).
 */
export function GatedSupportLink({
  access,
  href,
  className,
  icon,
  label,
  download,
  internal,
}: {
  access: SupportAccessVerdict;
  href: string;
  className: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  download?: boolean;
  internal?: boolean;
}) {
  if (!access.allowed) {
    return (
      <span
        className={cn(className, "cursor-not-allowed opacity-60")}
        title={access.reason ?? "Accès restreint."}
        aria-disabled
      >
        <Lock aria-hidden className="h-4 w-4" /> {label}
      </span>
    );
  }
  const inner = (
    <>
      {icon}
      {label}
    </>
  );
  return internal ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={className} {...(download ? { download: true } : {})}>
      {inner}
    </a>
  );
}
