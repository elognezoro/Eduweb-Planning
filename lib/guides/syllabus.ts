import type { GuideContent } from "@/components/guides/guide-layout";

/* ============================================================================
   Syllabus & volume horaire d'un module de formation (dérivé du guide du rôle).
   Utilisé par le manuel web (training-manual.tsx) ET l'export Word (docx/manuel).
   ========================================================================== */

export interface SyllabusRow {
  index: number;
  title: string;
  summary: string;
  minutes: number;
}

export interface ModuleSyllabus {
  totalMinutes: number;
  totalLabel: string;
  rows: SyllabusRow[];
}

type Chapter = GuideContent["chapters"][number];

/** Convertit une durée libre ("55 min", "1 h 30", "2 h", "60 min") en minutes. */
export function parseDurationMinutes(input: string): number {
  const t = (input || "").toLowerCase();
  let m = t.match(/(\d+)\s*h(?:eures?)?\s*(\d+)/); // "1 h 30"
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  m = t.match(/(\d+)\s*h(?:eures?)?\b/); // "2 h"
  if (m) return Number(m[1]) * 60;
  m = t.match(/(\d+)\s*min/); // "55 min"
  if (m) return Number(m[1]);
  m = t.match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

/** Formate des minutes en libellé lisible ("45 min", "1 h 30"). */
export function formatMinutes(min: number): string {
  if (min <= 0) return "—";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} h ${String(r).padStart(2, "0")}` : `${h} h`;
}

/**
 * Construit le syllabus d'un module : répartition (indicative) du volume horaire
 * total sur les chapitres, pondérée par le nombre de sections. Le dernier
 * chapitre absorbe le reliquat pour que la somme reste proche du total.
 */
export function buildModuleSyllabus(chapters: Chapter[], duration: string): ModuleSyllabus {
  const total = parseDurationMinutes(duration);
  const totalLabel = formatMinutes(total);
  const n = chapters.length;
  if (n === 0) return { totalMinutes: total, totalLabel, rows: [] };

  const weights = chapters.map((c) => Math.max(1, c.sections.length));
  const wsum = weights.reduce((a, b) => a + b, 0) || 1;

  const rows: SyllabusRow[] = [];
  let allocated = 0;
  chapters.forEach((c, i) => {
    const minutes =
      i === n - 1
        ? Math.max(5, total - allocated)
        : Math.max(5, Math.round((total * weights[i]) / wsum / 5) * 5);
    if (i < n - 1) allocated += minutes;
    rows.push({
      index: i + 1,
      title: c.title.replace(/^\d+\.\s*/, ""),
      summary: c.intro?.trim() || c.sections[0]?.title || "",
      minutes,
    });
  });

  return { totalMinutes: total, totalLabel, rows };
}
