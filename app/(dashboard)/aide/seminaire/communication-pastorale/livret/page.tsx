"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, FileDown, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommLivret } from "@/components/seminaires/comm-pastorale-livret";
import { COMMUNICATION_PASTORALE } from "@/lib/seminaires/communication-pastorale";
import { CourseGate } from "@/components/formations/course-gate";

/**
 * Livret académique imprimable du séminaire « Communication pastorale ».
 * Format A4 portrait, prêt à imprimer en PDF via Ctrl+P / Cmd+P.
 */
export default function CommPastoraleLivretPage() {
  const s = COMMUNICATION_PASTORALE;
  return (
    <CourseGate courseId="communication-pastorale">
    <div className="space-y-6">
      <div className="no-print sticky top-16 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur sm:-mx-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/aide/seminaire/communication-pastorale">
              <ArrowLeft className="h-4 w-4" /> Retour à l&apos;espace
            </Link>
          </Button>
          <div>
            <p className="font-display text-base font-bold leading-none text-foreground">
              Livret académique — Communication pastorale
            </p>
            <p className="text-xs text-muted-foreground">
              {s.meta.reference} · {s.meta.referenceDate} · {s.slides.length} diapositives ·{" "}
              {s.activities.length} ateliers
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href="/api/docx/seminaire/communication-pastorale">
              <FileDown className="h-4 w-4" /> Télécharger Word
            </a>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimer / PDF
          </Button>
        </div>
      </div>

      <CommLivret seminaire={s} />
    </div>
    </CourseGate>
  );
}
