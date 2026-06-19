"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, Lock, MessageSquare } from "lucide-react";
import { useApp } from "@/components/app-shell/app-context";

/**
 * Garde d'accès commune à tout l'espace formation (/aide/*).
 *
 * Affiche le contenu seulement si l'utilisateur dispose de la permission
 * `formations:access`. Sinon, présente un message d'accès refusé pédagogique
 * avec :
 *  - l'indication du rôle effectif,
 *  - les démarches pour demander l'accès (administrateur, habilitations,
 *    aperçu de rôle si autorisé).
 *
 * La permission `formations:access` est :
 *  - accordée par défaut à : admin, etablissements_admin, cafop_admin,
 *    apfc_admin, drena, inspecteur, conseiller_pedagogique, chef_antenne,
 *    chef_etablissement, enseignant, educateur ;
 *  - refusée par défaut à : parent, eleve.
 *
 * Un administrateur peut ajuster ces droits via /systeme/habilitations ou
 * la matrice des permissions.
 */
export default function AideLayout({ children }: { children: React.ReactNode }) {
  const { can, effectiveRole, isPreview } = useApp();
  const allowed = can("formations:access");

  if (allowed) {
    return <>{children}</>;
  }

  return <AccessDenied effectiveRole={effectiveRole} isPreview={isPreview} />;
}

function AccessDenied({
  effectiveRole,
  isPreview,
}: {
  effectiveRole: string;
  isPreview: boolean;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-700">
        <Lock aria-hidden className="h-7 w-7" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Espace formation réservé
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          L&apos;accès à la bibliothèque, aux guides, aux séminaires et aux livrets de
          formation est réservé aux utilisateurs autorisés.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-border bg-card p-5 text-left">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <GraduationCap aria-hidden className="h-4 w-4" /> Pourquoi cet accès est-il restreint ?
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          Les contenus de formation (séminaires, manuel académique, livrets imprimables,
          certificats) sont des supports professionnels destinés aux cadres de l&apos;Éducation,
          aux enseignants, aux inspecteurs et aux personnels de l&apos;encadrement pédagogique.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          Votre rôle actuel —{" "}
          <strong className="text-ew-green-800">
            {effectiveRole}
            {isPreview ? " (aperçu)" : ""}
          </strong>{" "}
          — n&apos;est pas habilité par défaut à cet espace. Si vous estimez que vous
          devriez y avoir accès, contactez l&apos;administrateur de la plateforme.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-border bg-card p-5 text-left">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <MessageSquare aria-hidden className="h-4 w-4" /> Comment demander l&apos;accès ?
        </p>
        <ol className="mt-2 space-y-1.5 text-sm">
          <li className="flex gap-2">
            <span aria-hidden className="font-bold text-ew-green-700">
              1.
            </span>
            <span>
              Identifiez la formation dont vous avez besoin (séminaire, guide, manuel,
              certificat).
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="font-bold text-ew-green-700">
              2.
            </span>
            <span>
              Demandez à l&apos;administrateur de votre établissement ou de votre
              structure régionale d&apos;activer la permission «&nbsp;Accéder à l&apos;espace
              formation&nbsp;» sur votre compte.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="font-bold text-ew-green-700">
              3.
            </span>
            <span>
              L&apos;administrateur peut accorder l&apos;accès :
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                <li>· soit ponctuellement via le module Habilitations,</li>
                <li>· soit durablement en ajustant la matrice des rôles.</li>
              </ul>
            </span>
          </li>
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Link
          href="/pilotage/tableau-de-bord"
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
        >
          Retour au tableau de bord
        </Link>
        <Link
          href="/systeme/mon-profil"
          className="rounded-lg bg-ew-green-700 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          Voir mon profil
        </Link>
      </div>
    </div>
  );
}
