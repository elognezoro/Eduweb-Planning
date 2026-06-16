/**
 * Persistance de l'EDT généré par le simulateur, afin que la « Vue hebdomadaire »
 * de la page Emplois du temps puisse l'afficher. Stocké en localStorage ;
 * un évènement permet aux deux onglets de rester synchronisés.
 */
import type { EdtResult, EdtLesson, Flux, EdtParams } from "./edt-generator";

const KEY = "eduweb.edt.generated.v1";
export const EDT_EVENT = "eduweb:edt-updated";

export interface GeneratedEdt {
  generatedAt: string;
  feasible: boolean;
  vacationMode: "unique" | "double";
  params: EdtParams;
  jours: string[];
  heuresByFlux: Record<Flux, string[]>;
  classes: { id: string; label: string; level: string; flux: Flux; salle: string }[];
  teachers: { id: string; name: string; matiere: string; charge: number }[];
  edtByClass: Record<string, { label: string; level: string; flux: Flux; salle: string; grid: Record<string, EdtLesson> }>;
}

export function saveGeneratedEdt(r: EdtResult): void {
  if (typeof window === "undefined") return;
  const payload: GeneratedEdt = {
    generatedAt: new Date().toISOString(),
    feasible: r.feasible,
    vacationMode: r.vacationMode,
    params: r.params,
    jours: r.jours,
    heuresByFlux: r.heuresByFlux,
    classes: r.classes.map((c) => ({ id: c.id, label: c.label, level: c.level, flux: c.flux, salle: c.salle })),
    teachers: r.teachers.map((t) => ({ id: t.id, name: t.name, matiere: t.matiere, charge: t.charge })),
    edtByClass: r.edtByClass,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(EDT_EVENT));
  } catch {
    /* quota dépassé — ignoré */
  }
}

export function loadGeneratedEdt(): GeneratedEdt | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GeneratedEdt) : null;
  } catch {
    return null;
  }
}

export function clearGeneratedEdt(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EDT_EVENT));
}
