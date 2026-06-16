"use client";

import * as React from "react";
import {
  ClipboardCheck,
  Search,
  Save,
  Send,
  ThumbsUp,
  Eye,
  HeartPulse,
  MessageSquare,
  Users,
  Sparkles,
  AlertTriangle,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterSelect } from "@/components/layout/filter-bar";
import { ExportMenu } from "@/components/layout/export-menu";
import { AttendanceHeatmap } from "@/components/dashboard/visuals";
import { useStore, type AttendanceRow } from "@/components/app-shell/data-store";
import { ELEVES, ATTENDANCE_HEATMAP } from "@/lib/mock-data";
import { etabExportMeta, type EtabExportMeta } from "@/lib/etab-config";
import { toNomCase, toPrenomCase } from "@/lib/format-name";
import { cn } from "@/lib/utils";

type Status = "P" | "A" | "R";
type ActionKind = "enc" | "obs" | "inf";
type Eleve = (typeof ELEVES)[number];
interface SmsTarget {
  key: string;
  label: string;
  ids: string[];
}

const SEUIL_SMS = 3;
const STATUS: { key: Status; cls: string }[] = [
  { key: "P", cls: "bg-ew-green-600 text-white border-ew-green-600" },
  { key: "A", cls: "bg-red-500 text-white border-red-500" },
  { key: "R", cls: "bg-ew-gold-500 text-white border-ew-gold-500" },
];

const DISCIPLINES = ["Mathématiques", "Français", "Anglais", "Physique-Chimie", "SVT", "Histoire-Géographie", "EPS", "Philosophie"];
const SEANCES = ["07h30 - 08h30", "08h30 - 09h30", "09h45 - 10h45", "10h45 - 11h45", "14h00 - 15h00", "15h00 - 16h00"];
const CLASS_OPTIONS = [...new Set(ELEVES.map((e) => e.className))];

const ACTION_META: Record<ActionKind, { label: string; sub: string; Icon: React.ElementType; circle: string; btn: string }> = {
  enc: { label: "Encouragement", sub: "Pour participation active en classe", Icon: ThumbsUp, circle: "bg-ew-green-100 text-ew-green-700", btn: "bg-ew-green-600 hover:bg-ew-green-700 text-white" },
  obs: { label: "Observation", sub: "Pour perturbation ou comportement inadapté", Icon: Eye, circle: "bg-orange-100 text-orange-600", btn: "bg-orange-500 hover:bg-orange-600 text-white" },
  inf: { label: "Infirmerie", sub: "Admission à l'infirmerie", Icon: HeartPulse, circle: "bg-pink-100 text-pink-600", btn: "bg-pink-600 hover:bg-pink-700 text-white" },
};

/* --------- données historiques déterministes (stables par élève) --------- */
const seedOf = (id: string) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
const cumulAbs = (id: string) => {
  const s = seedOf(id);
  return s % 5 === 0 ? 4 : s % 7 === 3 ? 3 : s % 3 === 0 ? 1 : 0;
};
const cumulRet = (id: string) => {
  const s = seedOf(id);
  return s % 4 === 1 ? 2 : s % 6 === 2 ? 1 : 0;
};
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const HIST_DISC = ["Physique-Chimie", "EDHC", "Français", "Mathématiques", "Anglais", "SVT"];
const HIST_SLOTS = ["13h00 - 14h00", "14h00 - 15h00", "15h00 - 16h00", "08h00 - 09h00", "09h00 - 10h00"];
function historyOf(id: string) {
  const cA = cumulAbs(id);
  const cR = cumulRet(id);
  const entries: { date: string; heure: string; discipline: string; type: "Absence" | "Retard"; motif: string; justifiee: boolean }[] = [];
  for (let k = 0; k < cA; k++)
    entries.push({ date: `2026-04-${String(10 + k).padStart(2, "0")}`, heure: HIST_SLOTS[k % HIST_SLOTS.length], discipline: HIST_DISC[k % HIST_DISC.length], type: "Absence", motif: k === 0 ? "Maladie" : "Non justifiée", justifiee: k === 0 });
  for (let k = 0; k < cR; k++)
    entries.push({ date: `2026-04-${String(16 + k).padStart(2, "0")}`, heure: HIST_SLOTS[(k + 3) % HIST_SLOTS.length], discipline: HIST_DISC[(k + 2) % HIST_DISC.length], type: "Retard", motif: "Retard prolongé", justifiee: false });
  return entries;
}

/* ------------------------------ suggestion IA ----------------------------- */
function aiSuggest(kind: ActionKind, id: string, status: Status, variant: number): string {
  const cA = cumulAbs(id);
  if (kind === "enc") {
    const opts = ["Comportement exemplaire et entraide envers ses camarades.", "Participation active et régulière en classe.", "Progrès notables et attitude positive ce trimestre."];
    return opts[variant % opts.length];
  }
  if (kind === "obs") {
    const opts =
      cA >= SEUIL_SMS
        ? ["Absences répétées nuisant au suivi des apprentissages.", "Manque d'assiduité à corriger rapidement."]
        : status === "R"
          ? ["Retards fréquents perturbant le début du cours.", "Ponctualité à améliorer."]
          : ["Manque de concentration et travail insuffisant.", "Bavardages perturbant le déroulement du cours."];
    return opts[variant % opts.length];
  }
  const opts = ["Malaise en cours. Envoyé(e) à l'infirmerie pour prise en charge.", "Douleurs signalées. Conduit(e) à l'infirmerie."];
  return opts[variant % opts.length];
}

const DEFAULT_ROW: AttendanceRow = { status: "P", motif: "", enc: [], obs: [], inf: [] };

export default function RegistreAppelPage() {
  const { attendance, setAttendance } = useStore();
  const [meta, setMeta] = React.useState<EtabExportMeta>(() => etabExportMeta({}));
  const [date, setDate] = React.useState("2026-05-01");
  const [cls, setCls] = React.useState(CLASS_OPTIONS[0]);
  const [discipline, setDiscipline] = React.useState(DISCIPLINES[0]);
  const [seance, setSeance] = React.useState(SEANCES[0]);
  const [q, setQ] = React.useState("");
  const [dialog, setDialog] = React.useState<{ kind: ActionKind; student: Eleve } | null>(null);
  const [historyStudent, setHistoryStudent] = React.useState<Eleve | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [smsOpen, setSmsOpen] = React.useState<string | null>(null);

  React.useEffect(() => setMeta(etabExportMeta()), []);
  React.useEffect(() => setSelected(new Set()), [cls]);

  const classStudents = React.useMemo(() => ELEVES.filter((e) => e.className === cls), [cls]);
  const sessionKey = `${cls}|${date}|${seance}`;
  const rowKey = (id: string) => `${sessionKey}|${id}`;
  const getRow = (id: string): AttendanceRow => attendance[rowKey(id)] ?? DEFAULT_ROW;
  const patchRow = (id: string, patch: Partial<AttendanceRow>) => setAttendance(rowKey(id), { ...getRow(id), ...patch });
  const setAll = (status: Status) => classStudents.forEach((s) => patchRow(s.id, { status }));

  // Conduite calculée d'après le profil de l'élève
  const conduiteOf = (id: string) => {
    const r = getRow(id);
    const v = 20 - cumulAbs(id) * 0.5 - cumulRet(id) * 0.25 - r.obs.length - (r.status === "A" ? 1.5 : r.status === "R" ? 0.5 : 0) + r.enc.length * 0.5;
    return Math.max(0, Math.min(20, Math.round(v * 4) / 4));
  };

  const rowsArr = classStudents.map((s) => getRow(s.id));
  const bilan = {
    total: classStudents.length,
    present: rowsArr.filter((r) => r.status === "P").length,
    absent: rowsArr.filter((r) => r.status === "A").length,
    retard: rowsArr.filter((r) => r.status === "R").length,
    enc: rowsArr.filter((r) => r.enc.length > 0).length,
    obs: rowsArr.filter((r) => r.obs.length > 0).length,
    inf: rowsArr.filter((r) => r.inf.length > 0).length,
    sms: classStudents.filter((s) => cumulAbs(s.id) >= SEUIL_SMS).length,
  };

  const visible = classStudents.filter((s) => `${s.lastName} ${s.firstName}`.toLowerCase().includes(q.trim().toLowerCase()));

  // Homonymes (même NOM + Prénom dans la classe) → on affiche la date de naissance
  const homonyms = React.useMemo(() => {
    const c: Record<string, number> = {};
    classStudents.forEach((s) => {
      const k = `${s.lastName} ${s.firstName}`.toLowerCase();
      c[k] = (c[k] ?? 0) + 1;
    });
    return c;
  }, [classStudents]);
  const isHomonym = (s: Eleve) => (homonyms[`${s.lastName} ${s.firstName}`.toLowerCase()] ?? 0) > 1;

  // Sélection multiple pour SMS groupé par catégorie
  const toggleSel = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const selectAll = () => setSelected(new Set(classStudents.map((s) => s.id)));
  const clearSel = () => setSelected(new Set());
  const selectWhere = (pred: (s: Eleve) => boolean) => setSelected(new Set(classStudents.filter(pred).map((s) => s.id)));
  const idsWhere = (pred: (s: Eleve) => boolean) => classStudents.filter(pred).map((s) => s.id);
  const smsTargets: SmsTarget[] = [
    { key: "selection", label: "Sélection", ids: [...selected] },
    { key: "classe", label: "Toute la classe", ids: classStudents.map((s) => s.id) },
    { key: "absents", label: "Absents", ids: idsWhere((s) => getRow(s.id).status === "A") },
    { key: "retards", label: "Retards", ids: idsWhere((s) => getRow(s.id).status === "R") },
    { key: "seuil", label: `Alerte SMS (≥ ${SEUIL_SMS})`, ids: idsWhere((s) => cumulAbs(s.id) >= SEUIL_SMS) },
  ];

  const saveAction = (kind: ActionKind, student: Eleve, text: string, acc: string) => {
    const r = getRow(student.id);
    const at = new Date().toISOString();
    if (kind === "inf") patchRow(student.id, { inf: [...r.inf, { text, acc, at }] });
    else patchRow(student.id, { [kind]: [...r[kind], { text, at }] } as Partial<AttendanceRow>);
    toast.success(`${ACTION_META[kind].label} enregistré(e)`, { description: `${toNomCase(student.lastName)} ${toPrenomCase(student.firstName)} · conduite recalculée.` });
    setDialog(null);
  };

  return (
    <ModulePage
      title="Registre d'appel"
      description="Enregistrement des présences, absences et retards."
      icon={ClipboardCheck}
      permission="attendance:view"
      sections={[
        { id: "bilan", label: "Bilan de l'appel" },
        { id: "liste", label: "Liste des élèves" },
        { id: "heatmap", label: "Heatmap de présence" },
      ]}
      showContextBadge={false}
      actions={
        <ExportMenu
          filename={`registre-appel-${cls.replace(/\s/g, "")}`}
          buildPayload={() => ({
            title: `Registre d'appel — ${cls}`,
            subtitle: `${discipline} · ${seance} · ${date}`,
            country: meta.countryName,
            institution: meta.institution !== "Établissement" ? meta.institution : "Lycée Moderne de Cocody",
            period: meta.schoolYear,
            author: "Vie scolaire",
            generatedAt: new Date().toLocaleString("fr-FR"),
            official: meta.official,
            ministry: meta.ministry,
            slogan: meta.slogan,
            schoolYear: meta.schoolYear,
            sections: [
              {
                heading: `Présences — ${cls}`,
                table: {
                  columns: ["N°", "Nom et Prénom", "Sexe", "Statut", "Motif", "Cumul", "Conduite /20"],
                  rows: classStudents.map((s, i) => {
                    const v = getRow(s.id);
                    return [i + 1, `${toNomCase(s.lastName)} ${toPrenomCase(s.firstName)}`, s.gender, v.status, v.motif || "—", `${cumulAbs(s.id)}A / ${cumulRet(s.id)}R`, `${conduiteOf(s.id)}/20`];
                  }),
                },
              },
            ],
          })}
        />
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3 text-center">
        <div className="mx-auto">
          <p className="text-sm font-bold uppercase tracking-wide text-foreground">{meta.official}</p>
          {meta.slogan && <p className="text-xs italic text-muted-foreground">{meta.slogan}</p>}
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{meta.ministry}</p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          Année scolaire : <span className="font-semibold text-foreground">{meta.schoolYear}</span>
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Classe pédagogique">
          <FilterSelect value={cls} onValueChange={setCls} className="w-full" options={CLASS_OPTIONS.map((c) => ({ value: c, label: c }))} />
        </Field>
        <Field label="Discipline (matière)">
          <FilterSelect value={discipline} onValueChange={setDiscipline} className="w-full" options={DISCIPLINES.map((d) => ({ value: d, label: d }))} />
        </Field>
        <Field label="Heure de la séance">
          <FilterSelect value={seance} onValueChange={setSeance} className="w-full" options={SEANCES.map((s) => ({ value: s, label: s }))} />
        </Field>
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9" />
        </Field>
        <Field label="Rechercher">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom ou prénom…" className="h-9 pl-8" />
          </div>
        </Field>
      </div>

      <SectionCard id="bilan" title="Bilan de l'appel" contentClassName="pt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          <Stat label="Effectif total" value={bilan.total} icon={Users} tone="slate" />
          <Stat label="Présents (P)" value={bilan.present} tone="green" />
          <Stat label="Absents (A)" value={bilan.absent} tone="red" />
          <Stat label="Retards (R)" value={bilan.retard} tone="gold" />
          <Stat label="Encouragements" value={bilan.enc} icon={ThumbsUp} tone="green" />
          <Stat label="Observations" value={bilan.obs} icon={Eye} tone="red" />
          <Stat label="Infirmerie" value={bilan.inf} icon={HeartPulse} tone="blue" />
          <Stat label="Alertes SMS" value={bilan.sms} icon={MessageSquare} tone="gold" />
        </div>
      </SectionCard>

      <SectionCard
        id="liste"
        title={`Liste des élèves — ${cls}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setAll("P")}>Tout P</Button>
            <Button variant="outline" size="sm" onClick={() => setAll("A")}>Tout A</Button>
          </div>
        }
        contentClassName="p-0 overflow-x-auto"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-sm">
          <span className="font-medium text-foreground">{selected.size} sélectionné(s)</span>
          <span className="text-xs text-muted-foreground">· Sélection rapide :</span>
          <Button variant="outline" size="sm" onClick={() => selectWhere((s) => getRow(s.id).status === "A")}>Absents</Button>
          <Button variant="outline" size="sm" onClick={() => selectWhere((s) => getRow(s.id).status === "R")}>Retards</Button>
          <Button variant="outline" size="sm" onClick={() => selectWhere((s) => cumulAbs(s.id) >= SEUIL_SMS)}>Alerte SMS (≥ {SEUIL_SMS})</Button>
          {selected.size > 0 && <Button variant="ghost" size="sm" onClick={clearSel}>Effacer</Button>}
          <Button size="sm" className="ml-auto" onClick={() => setSmsOpen(selected.size > 0 ? "selection" : "classe")}>
            <Send className="h-4 w-4" /> SMS aux parents{selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </div>
        <table className="w-full min-w-[980px] text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr className="text-xs uppercase tracking-wide text-muted-foreground">
              <th className="w-9 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Tout sélectionner"
                  className="h-4 w-4 align-middle accent-ew-green-700"
                  checked={classStudents.length > 0 && selected.size === classStudents.length}
                  ref={(el) => {
                    if (el) el.indeterminate = selected.size > 0 && selected.size < classStudents.length;
                  }}
                  onChange={(e) => (e.target.checked ? selectAll() : clearSel())}
                />
              </th>
              <th className="px-3 py-2.5 text-left">N°</th>
              <th className="px-3 py-2.5 text-left">Nom et Prénom</th>
              <th className="px-3 py-2.5 text-center">Sexe</th>
              <th className="px-3 py-2.5 text-center">Statut</th>
              <th className="px-3 py-2.5 text-left">Motif</th>
              <th className="px-3 py-2.5 text-center">Cumul</th>
              <th className="px-3 py-2.5 text-center">Actions</th>
              <th className="px-3 py-2.5 text-center">Conduite</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s, idx) => {
              const v = getRow(s.id);
              const cA = cumulAbs(s.id);
              const cR = cumulRet(s.id);
              const cond = conduiteOf(s.id);
              return (
                <tr key={s.id} className={cn("border-t border-border hover:bg-muted/30", selected.has(s.id) && "bg-ew-green-50/60")}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Sélectionner ${s.firstName} ${s.lastName}`}
                      className="h-4 w-4 align-middle accent-ew-green-700"
                      checked={selected.has(s.id)}
                      onChange={() => toggleSel(s.id)}
                    />
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <div>
                      <span className="font-bold text-foreground">{toNomCase(s.lastName)}</span>{" "}
                      <span className="text-foreground">{toPrenomCase(s.firstName)}</span>
                    </div>
                    {isHomonym(s) && <p className="text-[11px] text-muted-foreground">né(e) le {fmtDate(s.birthDate)}</p>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold", s.gender === "F" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700")}>{s.gender}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-1">
                      {STATUS.map((st) => (
                        <button
                          key={st.key}
                          onClick={() => patchRow(s.id, { status: st.key })}
                          aria-label={`Statut ${st.key}`}
                          className={cn("flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold transition-all", v.status === st.key ? st.cls : "border-border text-muted-foreground hover:bg-muted")}
                        >
                          {st.key}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {v.status === "P" && !v.motif ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <Input value={v.motif} onChange={(e) => patchRow(s.id, { motif: e.target.value })} placeholder="Motif…" className="h-8 w-32 text-xs" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => setHistoryStudent(s)} className="flex w-full items-center justify-center gap-1" title="Voir l'historique d'absences">
                      {cA > 0 && <Badge tone="red">{cA}A</Badge>}
                      {cR > 0 && <Badge tone="gold">{cR}R</Badge>}
                      {cA === 0 && cR === 0 && <span className="text-xs text-muted-foreground">0</span>}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <ActIcon active={v.enc.length > 0} onClick={() => setDialog({ kind: "enc", student: s })} title="Encouragement" tone="green"><ThumbsUp className="h-3.5 w-3.5" /></ActIcon>
                      <ActIcon active={v.obs.length > 0} onClick={() => setDialog({ kind: "obs", student: s })} title="Observation" tone="orange"><Eye className="h-3.5 w-3.5" /></ActIcon>
                      <ActIcon active={v.inf.length > 0} onClick={() => setDialog({ kind: "inf", student: s })} title="Infirmerie" tone="pink"><HeartPulse className="h-3.5 w-3.5" /></ActIcon>
                      <ActIcon active={false} onClick={() => toast.success(`SMS envoyé au parent de ${s.firstName} ${s.lastName}`)} title="Envoyer un SMS" tone="gold"><MessageSquare className="h-3.5 w-3.5" /></ActIcon>
                      {cA > 0 && (
                        <button onClick={() => setHistoryStudent(s)} className="ml-1 flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700">
                          <History className="h-3 w-3" /> Justifier ({cA})
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={cn("inline-flex min-w-[3.2rem] justify-center rounded-md px-2 py-1 text-sm font-bold", cond >= 14 ? "bg-ew-green-100 text-ew-green-700" : cond >= 10 ? "bg-blue-100 text-blue-700" : cond >= 8 ? "bg-ew-gold-100 text-ew-gold-600" : "bg-red-100 text-red-600")} title="Note calculée d'après le profil (absences, retards, observations, encouragements)">
                      {cond}/20
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-lg bg-ew-gold-100 px-3 py-1.5 text-xs font-semibold text-ew-gold-600">
            <MessageSquare className="h-3.5 w-3.5" /> Seuil d&apos;alerte SMS : {SEUIL_SMS} absences
          </span>
          <Button variant="outline" onClick={() => setSmsOpen("classe")}>
            <Send className="h-4 w-4" /> SMS groupé
          </Button>
        </div>
        <Button onClick={() => toast.success("Appel enregistré", { description: `${bilan.present} présent(s), ${bilan.absent} absent(s), ${bilan.retard} retard(s).` })}>
          <Save className="h-4 w-4" /> Enregistrer
        </Button>
      </div>

      <SectionCard id="heatmap" title="Heatmap de présence" description="Taux de présence par jour et créneau">
        <AttendanceHeatmap data={ATTENDANCE_HEATMAP} />
      </SectionCard>

      {dialog && (
        <ActionDialog
          kind={dialog.kind}
          student={dialog.student}
          classLabel={cls}
          date={date}
          status={getRow(dialog.student.id).status}
          onClose={() => setDialog(null)}
          onSave={(text, acc) => saveAction(dialog.kind, dialog.student, text, acc)}
        />
      )}
      {historyStudent && <HistoryDialog student={historyStudent} classLabel={cls} onClose={() => setHistoryStudent(null)} />}
      {smsOpen && (
        <SmsDialog
          targets={smsTargets}
          defaultTarget={smsOpen}
          classLabel={cls}
          onClose={() => setSmsOpen(null)}
          onSend={(t) => {
            toast.success("SMS envoyé aux parents", { description: `${t.label} · ${t.ids.length} destinataire(s) — message transmis.` });
            setSmsOpen(null);
          }}
        />
      )}
    </ModulePage>
  );
}

function SmsDialog({ targets, defaultTarget, classLabel, onClose, onSend }: { targets: SmsTarget[]; defaultTarget: string; classLabel: string; onClose: () => void; onSend: (t: SmsTarget) => void }) {
  const [targetKey, setTargetKey] = React.useState(defaultTarget);
  const [msg, setMsg] = React.useState("Bonjour, message de la vie scolaire concernant votre enfant. Merci de prendre contact avec l'établissement.");
  const current = targets.find((t) => t.key === targetKey) ?? targets[0];
  const segments = Math.max(1, Math.ceil(msg.length / 160));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Envoyer un SMS aux parents</DialogTitle>
          <p className="text-sm text-muted-foreground">Classe {classLabel} · choisissez les destinataires et rédigez le message.</p>
        </DialogHeader>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Destinataires</label>
          <div className="flex flex-wrap gap-2">
            {targets.map((t) => (
              <button
                key={t.key}
                onClick={() => setTargetKey(t.key)}
                disabled={t.ids.length === 0}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-40",
                  targetKey === t.key ? "border-ew-green-600 bg-ew-green-600 text-white" : "border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {t.label} ({t.ids.length})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Message</label>
          <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} className="resize-y" />
          <p className="text-[11px] text-muted-foreground">
            {msg.length} caractère(s) · {segments} SMS / parent · {current.ids.length} destinataire(s)
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button disabled={current.ids.length === 0 || !msg.trim()} onClick={() => onSend(current)}>
            <Send className="h-4 w-4" /> Envoyer ({current.ids.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

const TONE_BG: Record<string, string> = { green: "text-ew-green-700", red: "text-red-600", gold: "text-ew-gold-600", blue: "text-blue-600", slate: "text-foreground" };
function Stat({ label, value, icon: Icon, tone }: { label: string; value: React.ReactNode; icon?: React.ElementType; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <p className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">{Icon && <Icon className="h-3 w-3" />} {label}</p>
      <p className={cn("mt-1 text-2xl font-extrabold", TONE_BG[tone])}>{value}</p>
    </div>
  );
}

function ActIcon({ active, onClick, title, tone, children }: { active: boolean; onClick: () => void; title: string; tone: string; children: React.ReactNode }) {
  const toneCls: Record<string, string> = {
    green: "bg-ew-green-600 text-white border-ew-green-600",
    orange: "bg-orange-500 text-white border-orange-500",
    pink: "bg-pink-600 text-white border-pink-600",
    gold: "bg-ew-gold-500 text-white border-ew-gold-500",
  };
  return (
    <button onClick={onClick} title={title} aria-label={title} className={cn("flex h-7 w-7 items-center justify-center rounded-md border transition-all", active ? toneCls[tone] : "border-border text-muted-foreground hover:bg-muted")}>
      {children}
    </button>
  );
}

function ActionDialog({ kind, student, classLabel, date, status, onClose, onSave }: { kind: ActionKind; student: Eleve; classLabel: string; date: string; status: Status; onClose: () => void; onSave: (text: string, acc: string) => void }) {
  const m = ACTION_META[kind];
  const [variant, setVariant] = React.useState(0);
  const [text, setText] = React.useState(() => aiSuggest(kind, student.id, status, 0));
  const [acc, setAcc] = React.useState("");

  const regenerate = () => {
    const n = variant + 1;
    setVariant(n);
    setText(aiSuggest(kind, student.id, status, n));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", m.circle)}>
              <m.Icon className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-xl">{m.label}</DialogTitle>
              <p className="text-sm text-muted-foreground">{m.sub}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
          <p className="font-bold text-foreground">
            {toNomCase(student.lastName)} {toPrenomCase(student.firstName)}
          </p>
          <p className="text-xs text-muted-foreground">{classLabel} · {date} · né(e) le {fmtDate(student.birthDate)}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Description</label>
            <button onClick={regenerate} className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-200" title="Régénérer une suggestion">
              <Sparkles className="h-3 w-3" /> Suggestion IA
            </button>
          </div>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="resize-y" />
          <p className="text-[11px] text-muted-foreground">Suggestion générée selon le profil de l&apos;élève — librement modifiable.</p>
        </div>

        {kind === "inf" && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Accompagnateur (optionnel)</label>
            <Input value={acc} onChange={(e) => setAcc(e.target.value)} placeholder="Nom de l'élève accompagnateur…" />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button className={m.btn} onClick={() => onSave(text.trim(), acc.trim())}>
            <m.Icon className="h-4 w-4" /> Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HistoryDialog({ student, classLabel, onClose }: { student: Eleve; classLabel: string; onClose: () => void }) {
  const rows = historyOf(student.id);
  const cA = cumulAbs(student.id);
  const cR = cumulRet(student.id);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Historique d&apos;absences</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {toNomCase(student.lastName)} {toPrenomCase(student.firstName)} · né(e) le {fmtDate(student.birthDate)} — {classLabel}
          </p>
        </DialogHeader>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Heure</th>
                <th className="px-3 py-2 text-left">Discipline</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Motif</th>
                <th className="px-3 py-2 text-left">Justifiée</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">Aucune absence ni retard enregistré.</td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2 text-muted-foreground">{r.date}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.heure}</td>
                    <td className="px-3 py-2">{r.discipline}</td>
                    <td className="px-3 py-2"><Badge tone={r.type === "Absence" ? "red" : "gold"}>{r.type}</Badge></td>
                    <td className="px-3 py-2">{r.motif}</td>
                    <td className="px-3 py-2"><Badge tone={r.justifiee ? "green" : "red"}>{r.justifiee ? "Oui" : "Non"}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            Total : <strong className="text-foreground">{cA}</strong> absence(s), <strong className="text-foreground">{cR}</strong> retard(s)
          </span>
          {cA >= SEUIL_SMS && (
            <span className="flex items-center gap-1.5 rounded-lg bg-ew-gold-100 px-3 py-1.5 text-xs font-semibold text-ew-gold-600">
              <AlertTriangle className="h-3.5 w-3.5" /> Seuil atteint
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
