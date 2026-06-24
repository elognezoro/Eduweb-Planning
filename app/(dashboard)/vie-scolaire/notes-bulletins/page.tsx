/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, Plus, Trash2, Download, Eye, UploadCloud, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImportCsvDialog } from "@/components/forms/import-csv-dialog";
import { useStudents } from "@/components/app-shell/use-students";
import { useApp } from "@/components/app-shell/app-context";
import type { Student } from "@/lib/students/students-server";
import { etabExportMeta, etabPeriods, type EtabExportMeta, type BulletinPeriod } from "@/lib/etab-config";
import { toNomCase, toPrenomCase } from "@/lib/format-name";
import { useStore } from "@/components/app-shell/data-store";
import { cycleOfClassName } from "@/lib/livret/subjects";
import type { TermIndex } from "@/lib/livret/grades";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { upsertLivretGrade } from "@/lib/livret/livret-server";

type Eleve = Student;
interface NoteEntry {
  id: string;
  studentId: string;
  discipline: string;
  type: string;
  note: number;
  bareme: number;
  coeff: number;
}

const DISCIPLINES = [
  { name: "Mathématiques", coeff: 3, prof: "P. Kouassi" },
  { name: "Français", coeff: 3, prof: "H. Brou" },
  { name: "Anglais", coeff: 2, prof: "A. Cissé" },
  { name: "Histoire-Géographie", coeff: 2, prof: "D. Yao" },
  { name: "Physique-Chimie", coeff: 2, prof: "M. Doumbia" },
  { name: "SVT", coeff: 2, prof: "G. Tanoh" },
  { name: "EDHC", coeff: 1, prof: "J. Aka" },
  { name: "EPS", coeff: 1, prof: "M. Koné" },
];
const COEFF_OF: Record<string, number> = Object.fromEntries(DISCIPLINES.map((d) => [d.name, d.coeff]));
const PROF_OF: Record<string, string> = Object.fromEntries(DISCIPLINES.map((d) => [d.name, d.prof]));

/** Correspondance discipline (saisie) → matière du livret, selon le cycle. */
const LIVRET_SUBJECT_KEY: Record<string, { c1: string; c2: string }> = {
  "Mathématiques": { c1: "mathematiques", c2: "mathematiques" },
  "Français": { c1: "compo-francaise", c2: "dissertation-francaise" },
  "Anglais": { c1: "langue-1", c2: "anglais" },
  "Histoire-Géographie": { c1: "histoire-geo", c2: "histoire-geo" },
  "Physique-Chimie": { c1: "physique-chimie", c2: "physique-chimie" },
  "SVT": { c1: "sciences-naturelles", c2: "sciences-naturelles" },
  "EDHC": { c1: "edhc", c2: "edhc" },
  "EPS": { c1: "eps", c2: "eps" },
};
const TYPES = ["Devoir surveillé", "Interrogation écrite", "Devoir de maison", "Exposé", "Composition"];

const seedOf = (id: string) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);

/** Notes initiales déterministes par classe (chaque élève a des notes sur un sous-ensemble de disciplines). */
function genNotes(students: Eleve[]): NoteEntry[] {
  const out: NoteEntry[] = [];
  for (const s of students) {
    const seed = seedOf(s.id);
    DISCIPLINES.forEach((d, di) => {
      if (di > 2 && (seed + di * 5) % 6 === 0) return; // saute quelques disciplines pour varier
      const note = Math.max(3, Math.min(20, Math.round((7 + ((seed * 3 + di * 7) % 12)) * 2) / 2));
      out.push({ id: `${s.id}-${d.name}`, studentId: s.id, discipline: d.name, type: TYPES[(seed + di) % TYPES.length], note, bareme: 20, coeff: d.coeff });
    });
  }
  return out;
}

const note20 = (n: NoteEntry) => (n.bareme ? (n.note / n.bareme) * 20 : n.note);
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

export default function NotesBulletinsPage() {
  const t = useTranslations();
  const store = useStore();
  const app = useApp();
  const { students } = useStudents();
  const classOptions = React.useMemo(
    () => [...new Set(students.map((e) => e.className).filter(Boolean))].sort(),
    [students],
  );
  const [cls, setCls] = React.useState("");
  React.useEffect(() => {
    if (!cls && classOptions.length) setCls(classOptions[0]);
  }, [classOptions, cls]);
  const [periods, setPeriods] = React.useState<BulletinPeriod[]>(() => etabPeriods({}));
  const [period, setPeriod] = React.useState("0");
  const [meta, setMeta] = React.useState<EtabExportMeta>(() => etabExportMeta({}));

  React.useEffect(() => {
    setPeriods(etabPeriods());
    setMeta(etabExportMeta());
  }, []);

  const classStudents = React.useMemo(
    () => students.filter((e) => e.className === cls && e.status !== "archived"),
    [students, cls],
  );
  const [notes, setNotes] = React.useState<NoteEntry[]>([]);
  React.useEffect(() => setNotes(genNotes(classStudents)), [classStudents]);

  const [bulletin, setBulletin] = React.useState<{ student: Eleve; autoPrint: boolean } | null>(null);

  const periodLabel = periods[Number(period)]?.label ?? periods[0]?.label ?? t("pages.vieScolaireNotesBulletins.filters.defaultPeriod");

  // moyennes
  const discMoy = (sid: string, disc: string) => {
    const ns = notes.filter((n) => n.studentId === sid && n.discipline === disc);
    return ns.length ? avg(ns.map(note20)) : null;
  };
  const studentDisciplines = (sid: string) => [...new Set(notes.filter((n) => n.studentId === sid).map((n) => n.discipline))];
  const generalAvg = (sid: string) => {
    let num = 0,
      den = 0;
    for (const d of studentDisciplines(sid)) {
      const m = discMoy(sid, d);
      if (m == null) continue;
      num += m * (COEFF_OF[d] ?? 1);
      den += COEFF_OF[d] ?? 1;
    }
    return den ? num / den : 0;
  };
  const ranked = [...classStudents].sort((a, b) => generalAvg(b.id) - generalAvg(a.id));
  const rankOf = (sid: string) => ranked.findIndex((s) => s.id === sid) + 1;
  const notesOf = (sid: string) => notes.filter((n) => n.studentId === sid).length;

  const removeNote = (id: string) => setNotes((ns) => ns.filter((n) => n.id !== id));

  /**
   * Reporte les moyennes par discipline du trimestre courant vers la SOURCE DE
   * NOTES PARTAGÉE du livret scolaire (lib/livret/grades). Le livret lit alors
   * ces moyennes au lieu du repli auto. Le livret a 3 trimestres : on plafonne
   * l'index de période à 2 (T1/T2/T3).
   */
  const pushToLivret = async () => {
    const p = Math.min(Math.max(Number(period), 0), 2) as TermIndex;
    const online = isSupabaseConfigured();
    const client = online ? createClient() : null;
    let count = 0;
    const pending: Promise<{ ok: boolean; error?: string }>[] = [];
    for (const s of classStudents) {
      const cycle = cycleOfClassName(s.className);
      for (const d of DISCIPLINES) {
        const m = discMoy(s.id, d.name);
        if (m == null) continue;
        const map = LIVRET_SUBJECT_KEY[d.name];
        if (!map) continue;
        const entry = {
          studentId: s.id,
          schoolYear: meta.schoolYear,
          subjectKey: cycle === 1 ? map.c1 : map.c2,
          period: p,
          moy: Math.round(m * 100) / 100,
        };
        store.setLivretGrade(entry);
        // Write-through Supabase (mode réel) : partage durable, cloisonné par établissement.
        if (client) pending.push(upsertLivretGrade(client, entry, undefined, app.user.etablissementId ?? null));
        count += 1;
      }
    }
    if (count === 0) {
      toast.success("Aucune moyenne à reporter.");
      return;
    }
    if (!client) {
      toast.success(`${count} moyennes reportées au livret scolaire (${periodLabel}).`);
      return;
    }
    // On vérifie réellement le succès de l'enregistrement en ligne.
    const settled = await Promise.all(pending);
    const failed = settled.filter((r) => !r.ok).length;
    if (failed === 0) {
      toast.success(`${count} moyennes reportées et enregistrées en ligne (${periodLabel}).`);
    } else {
      toast.warning(
        `${count} moyennes reportées localement ; échec de l'enregistrement en ligne de ${failed} (migration 025 non appliquée ou droits insuffisants).`,
      );
    }
  };

  return (
    <ModulePage title={t("pages.vieScolaireNotesBulletins.title")} description={t("pages.vieScolaireNotesBulletins.description")}
      icon={ClipboardList}
      permission="grades:view"
      sections={[
        { id: "saisie", label: t("pages.vieScolaireNotesBulletins.sections.saisie") },
        { id: "notes", label: t("pages.vieScolaireNotesBulletins.sections.notes") },
        { id: "bulletins", label: t("pages.vieScolaireNotesBulletins.sections.bulletins") },
      ]}
    >
      {/* Sélecteurs */}
      <div className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-2">
        <Field label={t("pages.vieScolaireNotesBulletins.filters.class")}>
          <Select value={cls} onValueChange={setCls}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {classOptions.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("pages.vieScolaireNotesBulletins.filters.period")}>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {periods.map((p, i) => (
                <SelectItem key={p.label} value={String(i)}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-end justify-between gap-2 sm:col-span-2">
          <p className="text-xs text-muted-foreground">
            Reporter les moyennes saisies vers le livret scolaire de chaque élève (matière par matière, pour {periodLabel}).
          </p>
          <Button variant="outline" size="sm" onClick={() => void pushToLivret()} className="shrink-0">
            <UploadCloud className="h-4 w-4" /> Reporter au livret
          </Button>
        </div>
      </div>

      <div id="saisie" className="scroll-mt-24">
        <NoteForm classStudents={classStudents} onAdd={(n) => setNotes((ns) => [n, ...ns])} />
      </div>

      <SectionCard id="notes" title={t("pages.vieScolaireNotesBulletins.notesSection.title", { class: cls, period: periodLabel })} contentClassName="p-0 overflow-x-auto">
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="sticky top-0 border-b border-border bg-muted/60">
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 text-left">{t("pages.vieScolaireNotesBulletins.tableHeaders.student")}</th>
                <th className="px-4 py-2.5 text-left">{t("pages.vieScolaireNotesBulletins.tableHeaders.discipline")}</th>
                <th className="px-4 py-2.5 text-left">{t("pages.vieScolaireNotesBulletins.tableHeaders.type")}</th>
                <th className="px-4 py-2.5 text-center">{t("pages.vieScolaireNotesBulletins.tableHeaders.note")}</th>
                <th className="px-4 py-2.5 text-center">{t("pages.vieScolaireNotesBulletins.tableHeaders.scale")}</th>
                <th className="px-4 py-2.5 text-center">{t("pages.vieScolaireNotesBulletins.tableHeaders.coeff")}</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => {
                const s = classStudents.find((x) => x.id === n.studentId);
                return (
                  <tr key={n.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium text-foreground">{s ? `${toNomCase(s.lastName)} ${toPrenomCase(s.firstName)}` : "—"}</td>
                    <td className="px-4 py-2">{n.discipline}</td>
                    <td className="px-4 py-2"><Badge tone={n.type === "Exposé" ? "teal" : n.type === "Interrogation écrite" ? "gold" : "blue"}>{n.type}</Badge></td>
                    <td className="px-4 py-2 text-center font-bold text-foreground">{n.note}</td>
                    <td className="px-4 py-2 text-center text-muted-foreground">/{n.bareme}</td>
                    <td className="px-4 py-2 text-center">{n.coeff}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => removeNote(n.id)} className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600" aria-label={t("pages.vieScolaireNotesBulletins.tableActions.delete")}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard id="bulletins" title={t("pages.vieScolaireNotesBulletins.bulletinsSection.title", { class: cls, period: periodLabel })}>
        <div className="space-y-2">
          {ranked.map((s) => {
            const moy = generalAvg(s.id);
            return (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ew-green-100 text-sm font-bold text-ew-green-800">{rankOf(s.id)}</span>
                  <div>
                    <p className="font-bold text-foreground">{toNomCase(s.lastName)} {toPrenomCase(s.firstName)}</p>
                    <p className="text-xs text-muted-foreground">{periodLabel}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-center">
                    <p className="text-[11px] uppercase text-muted-foreground">{t("pages.vieScolaireNotesBulletins.bulletinsSection.notesCount")}</p>
                    <p className="font-bold text-foreground">{notesOf(s.id)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] uppercase text-muted-foreground">{t("pages.vieScolaireNotesBulletins.bulletinsSection.average")}</p>
                    <p className="font-extrabold text-ew-green-700">{moy.toFixed(2)}<span className="text-xs font-bold text-muted-foreground">/20</span></p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setBulletin({ student: s, autoPrint: false })}>
                    <Eye className="h-4 w-4" /> {t("pages.vieScolaireNotesBulletins.bulletinsSection.details")}
                  </Button>
                  <Button size="sm" onClick={() => setBulletin({ student: s, autoPrint: true })}>
                    <Download className="h-4 w-4" /> {t("pages.vieScolaireNotesBulletins.bulletinsSection.downloadPdf")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {bulletin && (
        <BulletinModal
          student={bulletin.student}
          autoPrint={bulletin.autoPrint}
          meta={meta}
          periodLabel={periodLabel}
          classStudents={classStudents}
          discMoy={discMoy}
          generalAvg={generalAvg}
          rank={rankOf(bulletin.student.id)}
          onClose={() => setBulletin(null)}
        />
      )}
    </ModulePage>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

/* ------------------------------- Ajouter une note ------------------------------- */
function NoteForm({ classStudents, onAdd }: { classStudents: Eleve[]; onAdd: (n: NoteEntry) => void }) {
  const t = useTranslations();
  const [studentId, setStudentId] = React.useState("");
  const [discipline, setDiscipline] = React.useState(DISCIPLINES[0].name);
  const [type, setType] = React.useState(TYPES[0]);
  const [note, setNote] = React.useState("");
  const [bareme, setBareme] = React.useState("20");
  const [coeff, setCoeff] = React.useState(String(DISCIPLINES[0].coeff));

  const save = () => {
    if (!studentId || note === "") {
      toast.error(t("pages.vieScolaireNotesBulletins.toasts.selectStudentAndNote"));
      return;
    }
    onAdd({ id: `${studentId}-${discipline}-${Date.now().toString(36)}`, studentId, discipline, type, note: Number(note), bareme: Number(bareme) || 20, coeff: Number(coeff) || 1 });
    toast.success(t("pages.vieScolaireNotesBulletins.toasts.noteSaved"));
    setNote("");
  };

  return (
    <SectionCard
      title={t("pages.vieScolaireNotesBulletins.noteForm.title")}
      action={
        <ImportCsvDialog
          title={t("pages.vieScolaireNotesBulletins.noteForm.importTitle")}
          description={t("pages.vieScolaireNotesBulletins.noteForm.importDescription")}
          expectedColumns={["eleve", "discipline", "type", "note", "bareme", "coefficient"]}
          sampleRow={["Kouadio Aya", "Mathématiques", "Devoir surveillé", "14", "20", "3"]}
          templateFilename="modele-notes.csv"
          trigger={(open) => (
            <Button variant="outline" size="sm" onClick={open}>
              <UploadCloud className="h-4 w-4" /> {t("pages.vieScolaireNotesBulletins.noteForm.importButton")}
            </Button>
          )}
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={t("pages.vieScolaireNotesBulletins.noteForm.student")}>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger><SelectValue placeholder={t("pages.vieScolaireNotesBulletins.noteForm.studentPlaceholder")} /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t("pages.vieScolaireNotesBulletins.noteForm.studentsGroup")}</SelectLabel>
                {classStudents.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{toNomCase(s.lastName)} {toPrenomCase(s.firstName)}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("pages.vieScolaireNotesBulletins.noteForm.discipline")}>
          <Select value={discipline} onValueChange={(v) => { setDiscipline(v); setCoeff(String(COEFF_OF[v] ?? 1)); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DISCIPLINES.map((d) => (
                <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("pages.vieScolaireNotesBulletins.noteForm.evaluationType")}>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("pages.vieScolaireNotesBulletins.noteForm.note")}>
          <Input type="number" min={0} max={Number(bareme) || 20} step={0.25} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("pages.vieScolaireNotesBulletins.noteForm.notePlaceholder")} />
        </Field>
        <Field label={t("pages.vieScolaireNotesBulletins.noteForm.scale")}>
          <Input type="number" min={1} value={bareme} onChange={(e) => setBareme(e.target.value)} />
        </Field>
        <Field label={t("pages.vieScolaireNotesBulletins.noteForm.coefficient")}>
          <Input type="number" min={1} value={coeff} onChange={(e) => setCoeff(e.target.value)} />
        </Field>
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
        <p className="font-bold uppercase tracking-wide">{t("pages.vieScolaireNotesBulletins.noteForm.csvFormat")}</p>
        <p className="font-mono">{t("pages.vieScolaireNotesBulletins.noteForm.csvHeader")}</p>
        <p className="font-mono">{t("pages.vieScolaireNotesBulletins.noteForm.csvExample")}</p>
      </div>
      <div className="mt-3 flex justify-end">
        <Button onClick={save}>
          <Plus className="h-4 w-4" /> {t("pages.vieScolaireNotesBulletins.noteForm.save")}
        </Button>
      </div>
    </SectionCard>
  );
}

/* --------------------------------- Bulletin --------------------------------- */
/** Regroupement officiel des disciplines par domaine (avec bilans intermédiaires). */
/** Domaines du bulletin — clé i18n pour le nom du domaine, items en français (données). */
const DOMAINS: { key: "lettres" | "sciences" | "autres"; items: string[] }[] = [
  { key: "lettres", items: ["Français", "Histoire-Géographie", "Anglais"] },
  { key: "sciences", items: ["Mathématiques", "Physique-Chimie", "SVT"] },
  { key: "autres", items: ["EDHC", "EPS", "TICE", "Conduite"] },
];

/** Bandes d'appréciation — clés sémantiques traduites via i18n (cf. appreciation.*). */
type AppreciationKey = "excellent" | "veryGood" | "good" | "fairlyGood" | "passable" | "mediocre" | "insufficient";

const apprecDiscKey = (m: number): AppreciationKey =>
  m >= 18 ? "excellent" : m >= 16 ? "veryGood" : m >= 14 ? "good" : m >= 12 ? "fairlyGood" : m >= 10 ? "passable" : m >= 8 ? "mediocre" : "insufficient";

const travailBandKey = (m: number): AppreciationKey =>
  m >= 16 ? "excellent" : m >= 14 ? "good" : m >= 12 ? "fairlyGood" : m >= 10 ? "passable" : m >= 8 ? "mediocre" : "insufficient";

/**
 * Phrases d'appréciation par bande — restent en français pour la version actuelle
 * (l'éditeur du bulletin peut modifier librement avant impression).
 */
const AI_PHRASES: Record<AppreciationKey, string[]> = {
  excellent: ["Travail Excellent", "Excellent trimestre — vives félicitations du conseil de classe.", "Élève brillant(e), continue ainsi !"],
  veryGood: ["Travail Très Bien", "Très bon trimestre — encouragements du conseil de classe.", "Excellents résultats, garde le cap."],
  good: ["Travail Bien", "Bon trimestre — encouragements du conseil de classe.", "Ensemble solide, poursuis tes efforts."],
  fairlyGood: ["Travail Assez Bien", "Des efforts encourageants — continue sur cette voie.", "Trimestre correct ; vise plus haut au prochain."],
  passable: ["Travail Passable", "Résultats justes — une mobilisation est attendue.", "Doit travailler avec plus de régularité."],
  mediocre: ["Travail Médiocre", "Trimestre difficile — un sursaut est nécessaire.", "Travail insuffisant ; ressaisis-toi."],
  insufficient: ["Travail Insuffisant", "Résultats très faibles — réaction urgente attendue.", "Doit redoubler d'efforts dès maintenant."],
};

function aiAppreciation(m: number, variant: number): string {
  const arr = AI_PHRASES[travailBandKey(m)] ?? AI_PHRASES.fairlyGood;
  return arr[variant % arr.length];
}

function BulletinModal({
  student,
  autoPrint,
  meta,
  periodLabel,
  classStudents,
  discMoy,
  generalAvg,
  rank,
  onClose,
}: {
  student: Eleve;
  autoPrint: boolean;
  meta: EtabExportMeta;
  periodLabel: string;
  classStudents: Eleve[];
  discMoy: (sid: string, disc: string) => number | null;
  generalAvg: (sid: string) => number;
  rank: number;
  onClose: () => void;
}) {
  const t = useTranslations("pages.vieScolaireNotesBulletins");
  const moy = generalAvg(student.id);
  const [variant, setVariant] = React.useState(0);
  const [appreciation, setAppreciation] = React.useState(() => aiAppreciation(moy, 0));

  const effectif = classStudents.length;
  const regimeShort = meta.regimeLabel.replace(/\s*\(.*\)/, "");
  // Libellé de la moyenne selon le régime (trimestriel/semestriel/séquentiel) — i18n.
  const moyTitle =
    regimeShort === "Semestriel" ? t("bulletin.moyTitleSemester")
      : regimeShort === "Séquentiel" ? t("bulletin.moyTitleSequence")
      : t("bulletin.moyTitleTerm");

  // Format ordinal (1er/Ne) — locale-aware via i18n.
  const ordinal = (n: number) => (n === 1 ? t("rankOrdinal.first") : t("rankOrdinal.other", { n }));

  // Rang de l'élève dans la classe pour une discipline donnée.
  const discRank = (disc: string) => {
    const arr = classStudents
      .map((s) => ({ id: s.id, m: discMoy(s.id, disc) }))
      .filter((x): x is { id: string; m: number } => x.m != null)
      .sort((a, b) => b.m - a.m);
    const i = arr.findIndex((x) => x.id === student.id);
    if (i < 0) return "";
    return `${ordinal(i + 1)}/${arr.length}`;
  };

  // Disciplines regroupées par domaine, avec bilan par domaine.
  const domainBlocks = DOMAINS.map((dom) => {
    const domainName = t(`bulletin.domains.${dom.key}` as const);
    const rows = dom.items.map((name) => {
      const m = discMoy(student.id, name);
      const coeff = COEFF_OF[name] ?? null;
      const hasNote = m != null && coeff != null;
      return {
        name,
        m,
        coeff,
        moyCoef: hasNote ? (m as number) * (coeff as number) : null,
        rang: hasNote ? discRank(name) : "",
        appr: hasNote ? t(`appreciation.${apprecDiscKey(m as number)}` as const) : "",
        prof: PROF_OF[name] ?? "",
        hasNote,
      };
    });
    const graded = rows.filter((r) => r.hasNote);
    const bCoeff = graded.reduce((a, r) => a + (r.coeff as number), 0);
    const bPoints = graded.reduce((a, r) => a + (r.moyCoef as number), 0);
    return { name: domainName, rows, bCoeff, bPoints, bMoy: bCoeff ? bPoints / bCoeff : 0 };
  });
  const totalCoeff = domainBlocks.reduce((a, d) => a + d.bCoeff, 0);
  const totalPoints = domainBlocks.reduce((a, d) => a + d.bPoints, 0);

  // Statistiques de la classe.
  const classAvgs = classStudents.map((s) => generalAvg(s.id)).filter((x) => x > 0);
  const classMoy = avg(classAvgs);
  const classMin = classAvgs.length ? Math.min(...classAvgs) : 0;
  const classMax = classAvgs.length ? Math.max(...classAvgs) : 0;

  // Assiduité (déterministe par élève).
  const seed = seedOf(student.id);
  const absTotal = seed % 7;
  const absJust = Math.floor(absTotal / 2);
  const absNon = absTotal - absJust;
  const pad2 = (n: number) => String(n).padStart(2, "0");

  // Tableau d'Honneur : coché automatiquement dès que la moyenne générale ≥ 12/20.
  const distinctions = [
    ...(moy >= 12 ? [t("distinctions.honor")] : []),
    ...(moy >= 16 ? [t("distinctions.congrats")] : []),
    ...(moy >= 10 && moy < 12 ? [t("distinctions.encouragement")] : []),
  ];
  const rankLabel = `${ordinal(rank)}/${effectif}`;
  const today = new Date().toLocaleDateString("fr-FR");

  React.useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[94vh] max-w-[860px] overflow-y-auto p-0">
        <div className="no-print flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2">
          <span className="text-sm font-semibold text-foreground">{t("modal.title")}</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => window.print()}><Download className="h-4 w-4" /> {t("modal.downloadPdf")}</Button>
            <Button size="sm" variant="outline" onClick={onClose}>{t("modal.close")}</Button>
          </div>
        </div>

        <div id="bulletin-print" className="bg-white p-6 text-[11px] text-black" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
          {/* En-tête — 3 colonnes */}
          <div className="grid grid-cols-3 items-start gap-3 text-center">
            <div className="text-[9px] leading-tight">
              <p className="font-bold uppercase">{meta.ministry}</p>
              <p className="mt-1 italic">{meta.regionalDirection || t("bulletin.defaultDirection")}</p>
            </div>
            <div>
              <p className="text-[17px] font-extrabold tracking-wide">{t("bulletin.header")}</p>
              <p className="text-[11px] font-bold">{regimeShort}</p>
              <p className="text-[11px]">{periodLabel}</p>
            </div>
            <div className="text-[9px] leading-tight">
              <p className="font-bold uppercase">{meta.official}</p>
              {meta.nationalEmblem && <img src={meta.nationalEmblem} alt={t("bulletin.emblemAlt")} className="mx-auto my-0.5 h-9 w-auto object-contain" />}
              {meta.slogan && <p className="italic">{meta.slogan}</p>}
              <p className="mt-1">{t("bulletin.schoolYear", { year: meta.schoolYear })}</p>
            </div>
          </div>
          <div className="mt-2 border-t-2 border-black" />

          {/* Établissement / Code / Statut */}
          <div className="mt-2 flex items-stretch border border-black">
            <div className="flex-1 p-2">
              <span className="font-bold">{t("bulletin.institution")}</span>{" "}
              <span className="inline-block min-w-[200px] border-b border-black/50">{meta.institution !== "Établissement" ? meta.institution : " "}</span>
            </div>
            <div className="border-l border-black p-2 text-[10px]">
              <p><span className="font-bold">{t("bulletin.code")}</span> <span className="inline-block min-w-[64px] border-b border-black/50">{meta.code || " "}</span></p>
              <p className="mt-1"><span className="font-bold">{t("bulletin.statusLabel")}</span> <span className="inline-block min-w-[64px] border-b border-black/50">{meta.type || " "}</span></p>
            </div>
          </div>

          {/* Identité de l'élève + logo */}
          <div className="mt-2 flex items-start justify-between border border-black p-2">
            <div>
              <p className="text-[13px] font-bold">{toNomCase(student.lastName)} {toPrenomCase(student.firstName)}</p>
              <p className="mt-1"><span className="font-bold">{t("bulletin.class")}</span> {student.className} <span className="ml-5 font-bold">{t("bulletin.regime")}</span> {regimeShort}</p>
              <p><span className="font-bold">{t("bulletin.enrolment")}</span> {effectif}</p>
            </div>
            <div className="flex h-14 w-20 shrink-0 items-center justify-center border border-black/40 text-[9px] text-gray-400">
              {meta.logo ? <img src={meta.logo} alt={t("bulletin.logoFallback")} className="h-full w-full object-contain p-0.5" /> : t("bulletin.logoFallback")}
            </div>
          </div>

          {/* Tableau des disciplines, regroupées par domaines */}
          <table className="mt-2 w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black px-1.5 py-1 text-left">{t("bulletin.tableHeaders.disciplines")}</th>
                <th className="border border-black px-1 py-1 text-center">{t("bulletin.tableHeaders.average")}</th>
                <th className="border border-black px-1 py-1 text-center">{t("bulletin.tableHeaders.coeff")}</th>
                <th className="border border-black px-1 py-1 text-center">{t("bulletin.tableHeaders.weighted")}<br />{t("bulletin.tableHeaders.weighted2")}</th>
                <th className="border border-black px-1 py-1 text-center">{t("bulletin.tableHeaders.rank")}</th>
                <th className="border border-black px-1 py-1 text-center">{t("bulletin.tableHeaders.appreciation")}</th>
                <th className="border border-black px-1 py-1 text-left">{t("bulletin.tableHeaders.teacher")}</th>
              </tr>
            </thead>
            <tbody>
              {domainBlocks.map((dom) => (
                <React.Fragment key={dom.name}>
                  {dom.rows.map((r) => (
                    <tr key={r.name} className={r.hasNote ? "" : "text-gray-400"}>
                      <td className="border border-black px-1.5 py-0.5">{r.name}</td>
                      <td className="border border-black px-1 py-0.5 text-center font-bold">{r.hasNote ? (r.m as number).toFixed(2) : ""}</td>
                      <td className="border border-black px-1 py-0.5 text-center">{r.hasNote ? r.coeff : ""}</td>
                      <td className="border border-black px-1 py-0.5 text-center">{r.hasNote ? (r.moyCoef as number).toFixed(2) : ""}</td>
                      <td className="border border-black px-1 py-0.5 text-center">{r.rang}</td>
                      <td className="border border-black px-1 py-0.5 text-center italic">{r.appr}</td>
                      <td className="border border-black px-1 py-0.5">{r.hasNote ? r.prof : ""}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-black px-1.5 py-0.5">{t("bulletin.balance", { domain: dom.name })}</td>
                    <td className="border border-black px-1 py-0.5 text-center">{dom.bCoeff ? dom.bMoy.toFixed(2) : ""}</td>
                    <td className="border border-black px-1 py-0.5 text-center">{dom.bCoeff || ""}</td>
                    <td className="border border-black px-1 py-0.5 text-center">{dom.bPoints ? dom.bPoints.toFixed(2) : ""}</td>
                    <td className="border border-black px-1 py-0.5" />
                    <td className="border border-black px-1 py-0.5" />
                    <td className="border border-black px-1 py-0.5" />
                  </tr>
                </React.Fragment>
              ))}
              <tr className="bg-gray-200 font-bold">
                <td className="border border-black px-1.5 py-1">{t("bulletin.totals")}</td>
                <td className="border border-black px-1 py-1" />
                <td className="border border-black px-1 py-1 text-center">{totalCoeff}</td>
                <td className="border border-black px-1 py-1 text-center">{totalPoints.toFixed(2)}</td>
                <td className="border border-black px-1 py-1" />
                <td className="border border-black px-1 py-1" />
                <td className="border border-black px-1 py-1" />
              </tr>
            </tbody>
          </table>

          {/* Bandeau : Assiduité | Moyenne | Résultats de la classe */}
          <div className="mt-2 grid grid-cols-3 border border-black text-[10px]">
            <div className="border-r border-black p-2">
              <p className="font-bold underline">{t("bulletin.attendance")}</p>
              <p className="mt-1">{t("bulletin.totalHours", { n: pad2(absTotal) })}</p>
              <p>{t("bulletin.justified", { n: pad2(absJust) })}  {t("bulletin.unjustified", { n: pad2(absNon) })}</p>
              <p className="mt-2 font-bold underline">{t("bulletin.councilMentions")}</p>
              <p className="mt-1 font-bold">{t("bulletin.distinctions")}</p>
              {distinctions.map((d) => (
                <p key={d}>✓ {d}</p>
              ))}
            </div>
            <div className="border-r border-black p-2 text-center">
              <p className="font-bold underline">{moyTitle}</p>
              <p className="mt-1"><span className="text-[15px] font-extrabold">{moy.toFixed(2)}</span> <span className="text-[9px]">/20</span>   <b>{t("bulletin.rankLabel", { n: rankLabel })}</b></p>
              <p className="mt-2 font-bold underline">{t("bulletin.councilAppreciations")}</p>
              <p className="mt-1 hidden whitespace-pre-line italic print:block">{appreciation}</p>
              <div className="no-print mt-1">
                <Textarea value={appreciation} onChange={(e) => setAppreciation(e.target.value)} rows={2} className="border-black/20 bg-white text-center text-[11px] text-black" />
                <button
                  onClick={() => { const v = variant + 1; setVariant(v); setAppreciation(aiAppreciation(moy, v)); }}
                  className="mx-auto mt-1 flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 hover:bg-purple-200"
                >
                  <Sparkles className="h-3 w-3" /> {t("bulletin.aiSuggestion")}
                </button>
              </div>
            </div>
            <div className="p-2">
              <p className="font-bold underline">{t("bulletin.classResults")}</p>
              <p className="mt-1">{t("bulletin.classAverage", { n: classMoy.toFixed(2) })}</p>
              <p>{t("bulletin.lowestAverage", { n: classMin.toFixed(2) })}</p>
              <p>{t("bulletin.highestAverage", { n: classMax.toFixed(2) })}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-6 grid grid-cols-2 gap-8 text-[10px]">
            <div>
              <p className="italic">{t("bulletin.teacherSignature")}</p>
              <div className="mt-10 w-3/4 border-t border-black/60" />
            </div>
            <div className="relative text-right">
              <p className="italic">{t("bulletin.headSignature")}</p>
              <p className="mt-1">{t("bulletin.doneAt", { place: meta.locality || t("bulletin.placeFallback"), date: today })}</p>
              <p className="mt-0.5 font-bold uppercase">{t("bulletin.headTitle")}</p>
              {meta.signature && <img src={meta.signature} alt={t("bulletin.signatureAlt")} className="ml-auto mt-1 h-10 object-contain" />}
              {meta.stamp && <img src={meta.stamp} alt={t("bulletin.stampAlt")} className="pointer-events-none absolute bottom-0 right-2 h-20 w-20 object-contain opacity-80" />}
              {meta.headName && <p className="mt-1 font-semibold">{meta.headName}</p>}
              <div className="ml-auto mt-2 w-3/4 border-t border-black/60" />
            </div>
          </div>

          <p className="mt-5 text-center text-[9px] italic text-gray-500">{t("bulletin.tagline", { year: new Date().getFullYear() })}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
