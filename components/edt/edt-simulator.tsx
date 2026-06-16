"use client";

import * as React from "react";
import {
  Play,
  Users,
  LayoutGrid,
  DoorOpen,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Download,
  FlaskConical,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EdtViewer } from "@/components/edt/edt-viewer";
import { generateEdt, type EdtParams, type EdtResult } from "@/lib/edt-generator";
import { saveGeneratedEdt } from "@/lib/edt-store";
import { cn } from "@/lib/utils";

const PRESETS: { label: string; params: EdtParams }[] = [
  { label: "3 500 él. · 50 salles", params: { totalStudents: 3500, rooms: 50, classSize: 56, maxTeacherLoad: 20, labRooms: 8, epsRooms: 4 } },
  { label: "4 500 él. · 60 salles", params: { totalStudents: 4500, rooms: 60, classSize: 56, maxTeacherLoad: 20, labRooms: 10, epsRooms: 5 } },
  { label: "3 500 él. · 40 salles", params: { totalStudents: 3500, rooms: 40, classSize: 56, maxTeacherLoad: 20, labRooms: 8, epsRooms: 4 } },
  { label: "Labos serrés (4)", params: { totalStudents: 3500, rooms: 50, classSize: 56, maxTeacherLoad: 20, labRooms: 4, epsRooms: 3 } },
];

function NumField({ label, value, onChange, min, max, step = 1, icon: Icon }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; icon?: React.ElementType }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
      </Label>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
      />
    </div>
  );
}

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: React.ReactNode; icon: React.ElementType; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", tone)} />
      </div>
      <p className="mt-1 text-2xl font-extrabold text-foreground">{value}</p>
    </div>
  );
}

export function EdtSimulator({ onView }: { onView?: () => void }) {
  const [params, setParams] = React.useState<EdtParams>(PRESETS[0].params);
  const [result, setResult] = React.useState<EdtResult | null>(null);
  const [busy, setBusy] = React.useState(false);

  const set = (k: keyof EdtParams, v: number) => setParams((p) => ({ ...p, [k]: v }));

  const run = React.useCallback((p: EdtParams, persist = false) => {
    setBusy(true);
    setTimeout(() => {
      const res = generateEdt(p);
      setResult(res);
      if (persist) {
        saveGeneratedEdt(res);
        toast.success("EDT publié", { description: "Consultable dans l'onglet « Vue hebdomadaire »." });
      }
      setBusy(false);
    }, 10);
  }, []);

  React.useEffect(() => {
    run(PRESETS[0].params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (p: EdtParams) => {
    setParams(p);
    run(p, true);
  };

  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.edtByClass, null, 1)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edt-genere.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openInWeekly = () => {
    if (!result) return;
    saveGeneratedEdt(result);
    onView?.();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Paramètres de simulation" description="Ajustez l'effectif, les salles et les salles spécialisées, puis générez l'emploi du temps.">
        <div className="mb-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.params)}
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-ew-green-50 hover:text-ew-green-800"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <NumField label="Effectif total" value={params.totalStudents} onChange={(v) => set("totalStudents", v)} min={200} max={8000} step={100} icon={Users} />
          <NumField label="Salles physiques" value={params.rooms} onChange={(v) => set("rooms", v)} min={10} max={120} icon={DoorOpen} />
          <NumField label="Taille de classe" value={params.classSize} onChange={(v) => set("classSize", v)} min={30} max={80} icon={Users} />
          <NumField label="Charge max prof (h)" value={params.maxTeacherLoad} onChange={(v) => set("maxTeacherLoad", v)} min={12} max={24} icon={GraduationCap} />
          <NumField label="Labos" value={params.labRooms} onChange={(v) => set("labRooms", v)} min={0} max={20} icon={FlaskConical} />
          <NumField label="Plateaux EPS" value={params.epsRooms} onChange={(v) => set("epsRooms", v)} min={0} max={12} icon={LayoutGrid} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => run(params, true)} disabled={busy}>
            <Play className="h-4 w-4" /> {busy ? "Génération…" : "Générer l'EDT"}
          </Button>
          {result && (
            <>
              <Button variant="outline" onClick={openInWeekly}>
                <ArrowRight className="h-4 w-4" /> Ouvrir dans la Vue hebdomadaire
              </Button>
              <Button variant="outline" onClick={exportJson}>
                <Download className="h-4 w-4" /> Exporter (JSON)
              </Button>
            </>
          )}
        </div>
      </SectionCard>

      {result && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Kpi label="Élèves" value={result.totalStudents.toLocaleString("fr-FR")} icon={Users} tone="text-ew-green-600" />
            <Kpi label="Classes" value={result.totalClasses} icon={LayoutGrid} tone="text-blue-600" />
            <Kpi label="Taille moy." value={result.avgClassSize} icon={Users} tone="text-amber-600" />
            <Kpi label="Salles" value={result.params.rooms} icon={DoorOpen} tone="text-purple-600" />
            <Kpi label="Enseignants" value={result.totalTeachers} icon={GraduationCap} tone="text-teal-600" />
            <Kpi label="Conflits" value={result.metrics.conflictsSalle + result.metrics.conflictsProf} icon={CheckCircle2} tone="text-ew-green-600" />
          </div>

          {result.feasible ? (
            <div className="flex items-center gap-3 rounded-xl border border-ew-green-100 bg-ew-green-50 px-4 py-3 text-sm text-ew-green-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>
                EDT faisable — {result.metrics.placed.toLocaleString("fr-FR")}/{result.metrics.total.toLocaleString("fr-FR")} heures placées,
                0 conflit (salle &amp; enseignant). Mode : <strong>{result.vacationMode === "double" ? "double vacation" : "vacation unique"}</strong>.
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>
                <strong>Génération partielle / infaisable.</strong> {result.reason}
                {result.metrics.unplaced > 0 && ` — ${result.metrics.unplaced} h non placées.`}
              </span>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="space-y-2">
              {result.warnings.map((w, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {w}
                </div>
              ))}
            </div>
          )}

          {result.vacationMode === "double" && (
            <SectionCard title="Occupation des salles (double vacation)" description="Le parc de salles est réutilisé matin (collège) puis après-midi (lycée).">
              <div className="space-y-3">
                {[
                  { icon: Sun, ...result.fluxSplit.matin },
                  { icon: Moon, ...result.fluxSplit.apresMidi },
                ].map((f, i) => (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <f.icon className="h-4 w-4 text-muted-foreground" /> {f.label}
                      </span>
                      <span className="text-muted-foreground">
                        {f.rooms} / {result.params.rooms} salles · {f.pct}%
                      </span>
                    </div>
                    <div className="h-3.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", i === 0 ? "bg-ew-green-600" : "bg-blue-500")} style={{ width: `${f.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Emploi du temps généré" description="Consultez la grille hebdomadaire par classe ou par enseignant (avec sa charge).">
            <EdtViewer data={result} />
          </SectionCard>
        </>
      )}
    </div>
  );
}
