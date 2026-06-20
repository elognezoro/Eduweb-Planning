"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { GuideArticle } from "@/components/guides/guide-layout";
import { GUIDES } from "@/lib/guides";
import { GUIDE_ICONS } from "@/lib/guides/icons";
import { prepareGuide } from "@/lib/guides/dynamic-facts";
import { CourseGate } from "@/components/formations/course-gate";

interface Props {
  params: Promise<{ role: string }>;
}

export default function GuidePage({ params }: Props) {
  const { role } = React.use(params);
  const data = GUIDES[role];
  if (!data) notFound();

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
