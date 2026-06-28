"use client";

import * as React from "react";
import { LayoutGrid, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EdtLesson, Flux } from "@/lib/edt-generator";
import { cn } from "@/lib/utils";

export const SUBJECT_COLOR: Record<string, string> = {
  "Français": "bg-sky-100 text-sky-800",
  "Mathématiques": "bg-emerald-100 text-emerald-800",
  "Anglais": "bg-violet-100 text-violet-800",
  "Histoire-Géographie": "bg-amber-100 text-amber-800",
  "SVT": "bg-lime-100 text-lime-800",
  "Physique-Chimie": "bg-cyan-100 text-cyan-800",
  "EPS": "bg-orange-100 text-orange-800",
  "Espagnol (LV2)": "bg-pink-100 text-pink-800",
  "EDHC": "bg-slate-100 text-slate-700",
  "Arts plastiques": "bg-fuchsia-100 text-fuchsia-800",
  "Éducation musicale": "bg-rose-100 text-rose-800",
  "Philosophie": "bg-indigo-100 text-indigo-800",
  "Sciences économiques": "bg-teal-100 text-teal-800",
};

const LEVEL_ORDER = ["6e", "5e", "4e", "3e", "2nde", "1ere", "Tle"];

export interface EdtViewData {
  jours: string[];
  heuresByFlux: Record<Flux, string[]>;
  classes: { id: string; label: string; level: string; flux: Flux; salle: string }[];
  teachers: { id: string; name: string; matiere: string; charge: number }[];
  edtByClass: Record<string, { label: string; level: string; flux: Flux; salle: string; grid: Record<string, EdtLesson> }>;
}

interface Cell {
  primary: string;
  secondary: string;
  subject: string;
}

function Grid({ jours, heures, cells }: { jours: string[]; heures: string[]; cells: Record<string, Cell> }) {
  return (
    <div className="min-w-[760px]">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `64px repeat(${jours.length}, 1fr)` }}>
        <div />
        {jours.map((j) => (
          <div key={j} className="rounded-lg bg-ew-green-900 py-1.5 text-center text-xs font-bold text-white">
            {j}
          </div>
        ))}
        {heures.map((h) => (
          <React.Fragment key={h}>
            <div className="flex items-center justify-center rounded-lg bg-muted/50 text-center text-[11px] font-bold tabular-nums text-foreground">
              {h}
            </div>
            {jours.map((j) => {
              const c = cells[`${j}-${h}`];
              return (
                <div key={j} className="min-h-[52px] rounded-lg border border-dashed border-border p-1">
                  {c && (
                    <div className={cn("flex h-full flex-col justify-center rounded-md px-1.5 py-1", SUBJECT_COLOR[c.subject] ?? "bg-muted text-foreground")}>
                      <span className="text-[11px] font-bold leading-tight">{c.primary}</span>
                      <span className="truncate text-[10px] opacity-80">{c.secondary}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/** Vue MOBILE de l'EDT : empilée par jour (uniquement les créneaux occupés). */
function GridMobile({ jours, heures, cells }: { jours: string[]; heures: string[]; cells: Record<string, Cell> }) {
  return (
    <div className="space-y-3">
      {jours.map((j) => {
        const slots = heures.map((h) => ({ h, c: cells[`${j}-${h}`] })).filter((x) => x.c);
        return (
          <div key={j} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="bg-ew-green-900 px-3 py-1.5 text-sm font-bold text-white">{j}</div>
            {slots.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">Aucun cours.</p>
            ) : (
              <ul className="divide-y divide-border">
                {slots.map(({ h, c }) => (
                  <li key={h} className="flex items-center gap-3 px-3 py-2">
                    <span className="w-16 shrink-0 text-[11px] font-bold tabular-nums text-muted-foreground">{h}</span>
                    <span className={cn("flex-1 rounded-md px-2 py-1", SUBJECT_COLOR[c!.subject] ?? "bg-muted text-foreground")}>
                      <span className="block text-xs font-bold leading-tight">{c!.primary}</span>
                      <span className="block truncate text-[10px] opacity-80">{c!.secondary}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Grille (desktop, défilante) + repli en liste empilée par jour (mobile). */
function ResponsiveGrid(props: { jours: string[]; heures: string[]; cells: Record<string, Cell> }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <Grid {...props} />
      </div>
      <div className="md:hidden">
        <GridMobile {...props} />
      </div>
    </>
  );
}

/** Visualiseur d'EDT généré : bascule « Par classe » / « Par enseignant ». */
export function EdtViewer({ data }: { data: EdtViewData }) {
  const [mode, setMode] = React.useState<"classe" | "prof">("classe");
  const [classId, setClassId] = React.useState(data.classes[0]?.id ?? "");
  const [teacherId, setTeacherId] = React.useState(data.teachers[0]?.id ?? "");

  React.useEffect(() => {
    setClassId((prev) => (data.classes.some((c) => c.id === prev) ? prev : data.classes[0]?.id ?? ""));
    setTeacherId((prev) => (data.teachers.some((t) => t.id === prev) ? prev : data.teachers[0]?.id ?? ""));
  }, [data]);

  // EDT par enseignant reconstruit depuis les grilles de classe
  const byTeacher = React.useMemo(() => {
    const map: Record<string, Record<string, { classe: string; subject: string; salle: string }>> = {};
    for (const c of Object.values(data.edtByClass))
      for (const [slotId, l] of Object.entries(c.grid)) {
        (map[l.teacherId] ??= {})[slotId] = { classe: c.label, subject: l.subject, salle: l.salle };
      }
    return map;
  }, [data.edtByClass]);

  // axe horaire « plein » pour la vue enseignant (réunion des flux présents)
  const teacherHeures = React.useMemo(() => {
    const fluxes = new Set(data.classes.map((c) => c.flux));
    const set = new Set<string>();
    fluxes.forEach((f) => (data.heuresByFlux[f] ?? []).forEach((h) => set.add(h)));
    return [...set].sort();
  }, [data]);

  const teachersByMatiere = React.useMemo(() => {
    const m: Record<string, typeof data.teachers> = {};
    for (const t of data.teachers) (m[t.matiere] ??= []).push(t);
    return m;
  }, [data]);

  const cls = data.edtByClass[classId];
  const teacher = data.teachers.find((t) => t.id === teacherId);
  const teacherGrid = byTeacher[teacherId] ?? {};

  const classCells: Record<string, Cell> = {};
  if (cls) for (const [slotId, l] of Object.entries(cls.grid)) classCells[slotId] = { primary: l.subject, secondary: l.teacher, subject: l.subject };

  const teacherCells: Record<string, Cell> = {};
  for (const [slotId, l] of Object.entries(teacherGrid)) teacherCells[slotId] = { primary: l.classe, secondary: `${l.subject} · ${l.salle}`, subject: l.subject };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <button
            onClick={() => setMode("classe")}
            className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors", mode === "classe" ? "bg-ew-green-700 text-white" : "text-foreground hover:bg-muted")}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Par classe
          </button>
          <button
            onClick={() => setMode("prof")}
            className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors", mode === "prof" ? "bg-ew-green-700 text-white" : "text-foreground hover:bg-muted")}
          >
            <GraduationCap className="h-3.5 w-3.5" /> Par enseignant
          </button>
        </div>

        <div className="w-60">
          {mode === "classe" ? (
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une classe" />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_ORDER.map((lvl) => {
                  const list = data.classes.filter((c) => c.level === lvl);
                  if (!list.length) return null;
                  return (
                    <SelectGroup key={lvl}>
                      <SelectLabel>{lvl}</SelectLabel>
                      {list.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
          ) : (
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un enseignant" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(teachersByMatiere).map((mat) => (
                  <SelectGroup key={mat}>
                    <SelectLabel>{mat}</SelectLabel>
                    {teachersByMatiere[mat].map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} · {t.charge} h
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {mode === "classe" ? (
        cls ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Badge tone="green">{cls.label}</Badge>
              <span className="text-muted-foreground">
                Salle de base {cls.salle} · {cls.flux === "Apres-midi" ? "après-midi" : cls.flux === "Matin" ? "matin" : "journée"}
              </span>
            </div>
            <ResponsiveGrid jours={data.jours} heures={data.heuresByFlux[cls.flux]} cells={classCells} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune classe.</p>
        )
      ) : teacher ? (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge tone="blue">{teacher.name}</Badge>
            <span className="text-muted-foreground">{teacher.matiere}</span>
            <Badge tone={teacher.charge >= 18 ? "gold" : "slate"}>Charge : {teacher.charge} h / semaine</Badge>
            <span className="text-xs text-muted-foreground">{Object.keys(teacherGrid).length} cours placés</span>
          </div>
          <ResponsiveGrid jours={data.jours} heures={teacherHeures} cells={teacherCells} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Aucun enseignant.</p>
      )}
    </div>
  );
}
