"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { GuideArticle } from "@/components/guides/guide-layout";
import { GUIDES } from "@/lib/guides";
import { GUIDE_ICONS } from "@/lib/guides/icons";
import { prepareGuide } from "@/lib/guides/dynamic-facts";
import { CourseGate } from "@/components/formations/course-gate";
import { useApp } from "@/components/app-shell/app-context";

interface Props {
  params: Promise<{ role: string }>;
}

export default function GuidePage({ params }: Props) {
  const { role } = React.use(params);
  const { effectiveRole } = useApp();
  const data = GUIDES[role];
  if (!data) notFound();

  // Chaque utilisateur n'accède qu'au guide de SON rôle. L'administrateur (et le
  // super-admin, forcé en « admin ») garde l'accès à tous les guides ; l'aperçu de
  // rôle permet de consulter un autre guide en basculant le rôle effectif.
  const isManager = effectiveRole === "admin";
  if (!isManager && role !== effectiveRole) {
    return <GuideRestricted ownRole={effectiveRole} />;
  }

  const Icon = GUIDE_ICONS[role];
  // Contenu dérivé : injecte les listes système toujours à jour (formations,
  // rôles, supports) au moment du rendu — voir lib/guides/dynamic-facts.
  const guide = { ...prepareGuide(data), icon: Icon };

  return (
    <CourseGate courseId="guides-utilisateurs">
      <div className="mx-auto w-full max-w-4xl">
        <GuideArticle guide={guide} />
      </div>
    </CourseGate>
  );
}

/** Affiché lorsqu'un utilisateur tente d'ouvrir le guide d'un autre rôle que le sien. */
function GuideRestricted({ ownRole }: { ownRole: string }) {
  const hasOwn = Boolean(GUIDES[ownRole]);
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-700">
        <Lock aria-hidden className="h-7 w-7" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-extrabold text-foreground">Guide réservé à un autre rôle</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chaque utilisateur accède au guide correspondant à son propre rôle. Pour consulter le
          guide d&apos;un autre rôle, un administrateur peut utiliser l&apos;aperçu de rôle.
        </p>
      </div>
      <Link
        href={hasOwn ? `/aide/${ownRole}` : "/aide"}
        className="rounded-lg bg-ew-green-700 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
      >
        {hasOwn ? "Ouvrir mon guide" : "Retour à l'espace formation"}
      </Link>
    </div>
  );
}
