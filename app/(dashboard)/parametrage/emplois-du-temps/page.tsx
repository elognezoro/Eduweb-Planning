"use client";

import * as React from "react";
import { CalendarDays, Copy, Printer, Plus, AlertTriangle, CheckCircle2, Clock, Wand2, FlaskConical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import { EdtSimulator } from "@/components/edt/edt-simulator";
import { EdtViewer } from "@/components/edt/edt-viewer";
import { useApp } from "@/components/app-shell/app-context";
import { SCHOOL_TIMETABLE, type ScheduleSlot } from "@/lib/mock-data";
import { etabSchedulePeriods, type SchedulePeriod } from "@/lib/etab-config";
import { loadGeneratedEdt, clearGeneratedEdt, EDT_EVENT, type GeneratedEdt } from "@/lib/edt-store";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

const ALL_TEACHERS = [...new Set(SCHOOL_TIMETABLE.map((s) => s.teacher))].sort((a, b) => a.localeCompare(b, "fr"));
const ALL_CLASSES = [...new Set(SCHOOL_TIMETABLE.map((s) => s.className))];
// Sentinelles non vides (Radix Select interdit une value vide).
const ALL_OPT = "__all";
const NONE_OPT = "__none";
const classesOfTeacher = (teacher: string) =>
  [...new Set(SCHOOL_TIMETABLE.filter((s) => s.teacher === teacher).map((s) => s.className))];
const teachersOfClass = (cls: string) =>
  [...new Set(SCHOOL_TIMETABLE.filter((s) => s.className === cls).map((s) => s.teacher))];

/** Grille hebdomadaire (périodes × jours) pour un ensemble de créneaux donné. */
function WeeklyGrid({
  slots,
  periods,
  secondary,
}: {
  slots: ScheduleSlot[];
  periods: SchedulePeriod[];
  secondary: "teacher" | "class";
}) {
  return (
    <SectionCard contentClassName="p-0 overflow-x-auto">
      <div className="min-w-[820px] p-4">
        <div className="grid grid-cols-[110px_repeat(5,1fr)] gap-2">
          <div />
          {DAYS.map((d) => (
            <div key={d} className="rounded-lg bg-ew-green-900 py-2 text-center text-sm font-bold text-white">
              {d}
            </div>
          ))}
          {periods.map((period) => (
            <React.Fragment key={period.label}>
              <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 py-2 text-center">
                <span className="text-sm font-extrabold text-foreground">{period.start}</span>
                <span className="text-[11px] text-muted-foreground">→ {period.end}</span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-ew-green-700">{period.label}</span>
              </div>
              {DAYS.map((_, dayIdx) => {
                const slot = slots.find(
                  (s) => s.weekday === dayIdx + 1 && s.start >= period.start && s.start < period.end,
                );
                return (
                  <div key={dayIdx} className="min-h-[92px] rounded-lg border border-dashed border-border p-1">
                    {slot && (
                      <div
                        className="flex h-full flex-col justify-between rounded-lg p-2 text-white shadow-sm"
                        style={{ background: slot.color }}
                      >
                        <div>
                          <p className="text-sm font-bold leading-tight">{slot.subject}</p>
                          <p className="text-[11px] opacity-90">{secondary === "teacher" ? slot.teacher : slot.className}</p>
                        </div>
                        <p className="text-[11px] opacity-90">
                          {slot.start}–{slot.end} · {slot.room}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

export default function EmploisDuTempsPage() {
  const { can, user, effectiveRole } = useApp();
  // Seuls le Chef d'établissement / l'Admin Établissement (timetable:manage) accèdent au générateur.
  const canSimulate = can("timetable:manage");
  // Élève / parent : vue figée sur la classe de l'élève (pas de filtres, pas d'autres EDT).
  const isStudentLike = effectiveRole === "eleve" || effectiveRole === "parent";
  // Classe rattachée à l'élève (démo : la 1ʳᵉ disponible — sera lue du profil en Phase 2).
  const studentClass = ALL_CLASSES[0];
  const [tab, setTab] = React.useState("vue");
  const [periods, setPeriods] = React.useState<SchedulePeriod[]>(() => etabSchedulePeriods({}));
  const [gen, setGen] = React.useState<GeneratedEdt | null>(null);

  // Vue hebdomadaire : par enseignant (défaut) ou par classe.
  const [viewBy, setViewBy] = React.useState<"enseignant" | "classe">("enseignant");
  const [teacher, setTeacher] = React.useState<string>(() =>
    ALL_TEACHERS.includes(user.displayName) ? user.displayName : ALL_TEACHERS[0],
  );
  const [klass, setKlass] = React.useState<string>(""); // classe sélectionnée (vide = EDT de l'enseignant)
  const [colleague, setColleague] = React.useState<string>(""); // collègue sur la classe sélectionnée

  React.useEffect(() => {
    setPeriods(etabSchedulePeriods());
    const sync = () => setGen(loadGeneratedEdt());
    sync();
    window.addEventListener(EDT_EVENT, sync);
    return () => window.removeEventListener(EDT_EVENT, sync);
  }, []);

  const clearSim = () => {
    clearGeneratedEdt();
    toast("Simulation effacée", { description: "Retour à la vue de démonstration." });
  };

  // Créneaux affichés selon la sélection.
  let displayedSlots: ScheduleSlot[];
  let secondary: "teacher" | "class";
  let contextLabel: string;
  if (isStudentLike) {
    // Élève / parent : son seul EDT (celui de sa classe), sans aucun filtre.
    displayedSlots = SCHOOL_TIMETABLE.filter((s) => s.className === studentClass);
    secondary = "teacher";
    contextLabel = effectiveRole === "parent" ? `Classe de votre enfant — ${studentClass}` : `Ma classe — ${studentClass}`;
  } else if (viewBy === "classe") {
    const c = klass || ALL_CLASSES[0];
    displayedSlots = SCHOOL_TIMETABLE.filter((s) => s.className === c);
    secondary = "teacher";
    contextLabel = `Classe ${c}`;
  } else if (colleague) {
    displayedSlots = SCHOOL_TIMETABLE.filter((s) => s.teacher === colleague);
    secondary = "class";
    contextLabel = `${colleague} — collègue sur la classe ${klass}`;
  } else if (klass) {
    displayedSlots = SCHOOL_TIMETABLE.filter((s) => s.className === klass);
    secondary = "teacher";
    contextLabel = `Classe ${klass}`;
  } else {
    displayedSlots = SCHOOL_TIMETABLE.filter((s) => s.teacher === teacher);
    secondary = "class";
    contextLabel = `${teacher}${teacher === user.displayName ? " (vous)" : ""}`;
  }

  return (
    <ModulePage
      title="Emplois du temps"
      description="Vue hebdomadaire par enseignant et par classe, et générateur d'EDT pour simuler des scénarios d'effectif et de salles."
      icon={CalendarDays}
      permission="timetable:view"
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="vue">Vue hebdomadaire</TabsTrigger>
          {canSimulate && (
            <TabsTrigger value="generateur">
              <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Générateur (simulation)
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="vue" className="space-y-6">
          {gen ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="purple">
                    <FlaskConical className="mr-1 h-3 w-3" /> EDT de simulation
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {gen.classes.length} classes · {gen.teachers.length} enseignants · généré le{" "}
                    {new Date(gen.generatedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  {canSimulate && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={clearSim}>
                      <Trash2 className="h-3.5 w-3.5" /> Effacer
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Imprimer
                </Button>
              </div>
              {gen.feasible ? (
                <div className="flex items-center gap-2 rounded-lg border border-ew-green-100 bg-ew-green-50 px-3 py-2 text-sm text-ew-green-800">
                  <CheckCircle2 className="h-4 w-4" /> EDT généré sans conflit ({gen.vacationMode === "double" ? "double vacation" : "vacation unique"}). Sélectionnez une classe ou un enseignant.
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4" /> EDT partiel (certaines heures non placées). Ajustez les paramètres dans le générateur.
                </div>
              )}
              <SectionCard contentClassName="overflow-x-auto">
                <EdtViewer data={gen} />
              </SectionCard>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3">
                {isStudentLike ? (
                  <div />
                ) : (
                <FilterBar>
                  <FilterSelect
                    value={viewBy}
                    onValueChange={(v) => {
                      setViewBy(v as "enseignant" | "classe");
                      setKlass("");
                      setColleague("");
                    }}
                    options={[
                      { value: "enseignant", label: "Par enseignant" },
                      { value: "classe", label: "Par classe" },
                    ]}
                  />
                  {viewBy === "enseignant" ? (
                    <>
                      <FilterSelect
                        value={teacher}
                        onValueChange={(v) => {
                          setTeacher(v);
                          setKlass("");
                          setColleague("");
                        }}
                        options={ALL_TEACHERS.map((t) => ({ value: t, label: t === user.displayName ? `${t} (vous)` : t }))}
                      />
                      <FilterSelect
                        value={klass || ALL_OPT}
                        onValueChange={(v) => {
                          setKlass(v === ALL_OPT ? "" : v);
                          setColleague("");
                        }}
                        options={[
                          { value: ALL_OPT, label: "Mes classes (toutes)" },
                          ...classesOfTeacher(teacher).map((c) => ({ value: c, label: c })),
                        ]}
                      />
                      {klass && (
                        <FilterSelect
                          value={colleague || NONE_OPT}
                          onValueChange={(v) => setColleague(v === NONE_OPT ? "" : v)}
                          options={[
                            { value: NONE_OPT, label: "Collègues (même classe)" },
                            ...teachersOfClass(klass)
                              .filter((t) => t !== teacher)
                              .map((t) => ({ value: t, label: t })),
                          ]}
                        />
                      )}
                    </>
                  ) : (
                    <FilterSelect
                      value={klass || ALL_CLASSES[0]}
                      onValueChange={setKlass}
                      options={ALL_CLASSES.map((c) => ({ value: c, label: c }))}
                    />
                  )}
                </FilterBar>
                )}
                <div className="flex gap-2">
                  {canSimulate && (
                    <Button variant="outline" onClick={() => toast.success("Semaine dupliquée vers S+1")}>
                      <Copy className="h-4 w-4" /> Dupliquer
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" /> Imprimer
                  </Button>
                  {canSimulate && (
                    <Button onClick={() => toast.info("Ajouter un créneau")}>
                      <Plus className="h-4 w-4" /> Créneau
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green">{contextLabel}</Badge>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-ew-green-700" /> Horaires : {periods.map((p) => `${p.start}`).join(" · ")} — issus de la Configuration.
                </div>
              </div>

              {displayedSlots.length ? (
                <WeeklyGrid slots={displayedSlots} periods={periods} secondary={secondary} />
              ) : (
                <SectionCard>
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Aucun créneau pour cette sélection.
                  </p>
                </SectionCard>
              )}

              {!isStudentLike && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" /> « Par enseignant » affiche votre emploi du temps ; choisissez une de vos
                  classes, puis un collègue qui prend cette même classe pour consulter son emploi du temps.
                </p>
              )}
            </>
          )}
        </TabsContent>

        {canSimulate && (
          <TabsContent value="generateur" className="mt-4">
            <EdtSimulator onView={() => setTab("vue")} />
          </TabsContent>
        )}
      </Tabs>
    </ModulePage>
  );
}
