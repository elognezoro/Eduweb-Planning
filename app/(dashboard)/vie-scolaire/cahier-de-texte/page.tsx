"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  NotebookText,
  Plus,
  BookOpen,
  Target,
  ClipboardList,
  KeyRound,
  Check,
  Pencil,
  Lightbulb,
  FlaskConical,
  CalendarDays,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/components/app-shell/data-store";
import { ENSEIGNANTS } from "@/lib/mock-data";
import type { LessonEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const SUBJECTS = ["Mathématiques", "Français", "Physique-Chimie", "SVT", "Histoire-Géographie", "Anglais", "Philosophie", "EPS"];
const CLASSES = ["6ᵉ A", "5ᵉ B", "4ᵉ C", "3ᵉ A", "2ⁿᵈᵉ C", "1ʳᵉ D", "Tˡᵉ A", "Tˡᵉ D"];
const TYPES = ["Cours", "Travaux dirigés", "Travaux pratiques", "Évaluation", "Révision", "Correction", "Synthèse"];
const TEACHERS = ENSEIGNANTS.map((t) => `${t.firstName.charAt(0)}. ${t.lastName}`);

const ACCESS_REQUESTS = [
  { id: "ar-1", requester: "Parent — M. Traoré", entry: "Théorème de Thalès (3ᵉ A)", date: "2026-06-09" },
  { id: "ar-2", requester: "Conseiller pédagogique", entry: "L'argumentation (2ⁿᵈᵉ C)", date: "2026-06-08" },
];

export default function CahierDeTextePage() {
  const t = useTranslations();
  const { lessonBook, addLessonEntry, updateLessonEntry } = useStore();
  const [requests, setRequests] = React.useState(ACCESS_REQUESTS);
  // null = fermé · { entry: null } = création · { entry } = édition
  const [dlg, setDlg] = React.useState<{ entry: LessonEntry | null } | null>(null);

  return (
    <ModulePage title={t("pages.vieScolaireCahierDeTexte.title")} description={t("pages.vieScolaireCahierDeTexte.description")}
      icon={NotebookText}
      permission="lesson_book:view"
      sections={[
        { id: "seances", label: "Séances" },
        { id: "demandes", label: "Demandes d'accès" },
      ]}
      actions={
        <Button onClick={() => setDlg({ entry: null })}>
          <Plus className="h-4 w-4" /> Nouvelle séance
        </Button>
      }
      kpis={[
        { label: "Séances saisies", value: lessonBook.length, icon: BookOpen, tone: "green" },
        { label: "Publiées", value: lessonBook.filter((e) => e.status === "published").length, icon: Check, tone: "blue" },
        { label: "Brouillons", value: lessonBook.filter((e) => e.status === "draft").length, icon: ClipboardList, tone: "gold" },
        { label: "Demandes d'accès", value: requests.length, icon: KeyRound, tone: "purple" },
      ]}
    >
      <TwoColumn className="lg:grid-cols-[2fr_1fr]">
        <SectionCard id="seances" title="Séances">
          <div className="space-y-3">
            {lessonBook.map((e) => (
              <div key={e.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone="green">{e.subject}</Badge>
                    <Badge tone="slate">{e.className}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={e.status} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Modifier la séance" onClick={() => setDlg({ entry: e })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="mt-2 font-bold text-foreground">{e.title}</h3>
                <div className="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                  <span className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" /> {e.learningActivities?.length ? `${e.learningActivities.length} activité(s)` : "Objectifs définis"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5" /> {e.evalActivities?.length ? `${e.evalActivities.length} évaluation(s)` : "Devoirs assignés"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {e.teacher} · {formatDate(e.date)}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard id="demandes" title="Demandes d'accès" description="À valider">
          {requests.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucune demande en attente.</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((r) => (
                <li key={r.id} className="rounded-lg border border-border p-3">
                  <p className="font-semibold text-foreground">{r.requester}</p>
                  <p className="text-xs text-muted-foreground">{r.entry}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={() => { setRequests((rs) => rs.filter((x) => x.id !== r.id)); toast.success("Accès accordé"); }}>
                      Accorder
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setRequests((rs) => rs.filter((x) => x.id !== r.id)); toast.warning("Accès refusé"); }}>
                      Refuser
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </TwoColumn>

      {dlg && (
        <SeanceDialog
          entry={dlg.entry}
          onClose={() => setDlg(null)}
          onSubmit={(data, status) => {
            if (dlg.entry) {
              updateLessonEntry(dlg.entry.id, { ...data, status });
              toast.success("Séance modifiée", { description: status === "published" ? "Publiée." : "Enregistrée." });
            } else {
              addLessonEntry({ ...data, status });
              toast.success(status === "published" ? "Séance publiée" : "Séance créée");
            }
            setDlg(null);
          }}
        />
      )}
    </ModulePage>
  );
}

function RepeatList({ label, icon, items, onChange, placeholder, empty }: { label: string; icon: React.ReactNode; items: string[]; onChange: (v: string[]) => void; placeholder: string; empty: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5">{icon} {label}</Label>
        <button type="button" onClick={() => onChange([...items, ""])} className="flex items-center gap-1 text-xs font-semibold text-ew-green-700 hover:underline">
          <Plus className="h-3.5 w-3.5" /> Ajouter
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={it} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} placeholder={placeholder} />
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-red-600" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Retirer">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SeanceDialog({ entry, onClose, onSubmit }: { entry: LessonEntry | null; onClose: () => void; onSubmit: (data: Omit<LessonEntry, "id" | "status">, status: string) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [teacher, setTeacher] = React.useState(entry?.teacher ?? "");
  const [className, setClassName] = React.useState(entry?.className ?? "");
  const [subject, setSubject] = React.useState(entry?.subject ?? "");
  const [type, setType] = React.useState(entry?.type ?? "");
  const [date, setDate] = React.useState(entry?.date ?? today);
  const [startTime, setStartTime] = React.useState(entry?.startTime ?? "07:30");
  const [duration, setDuration] = React.useState<number>(entry?.duration ?? 55);
  const [title, setTitle] = React.useState(entry?.title ?? "");
  const [situation, setSituation] = React.useState(entry?.situation ?? "");
  const [subtitles, setSubtitles] = React.useState<string[]>(entry?.subtitles ?? []);
  const [summary, setSummary] = React.useState(entry?.summary ?? "");
  const [learning, setLearning] = React.useState<string[]>(entry?.learningActivities ?? []);
  const [evals, setEvals] = React.useState<string[]>(entry?.evalActivities ?? []);
  const [nextDate, setNextDate] = React.useState(entry?.nextDate ?? "");

  const isEdit = !!entry;

  const submit = (status: string) => {
    if (!title.trim()) {
      toast.error("Le titre de la séance est requis");
      return;
    }
    onSubmit(
      {
        teacher: teacher || "Vous",
        className: className || CLASSES[0],
        subject: subject || SUBJECTS[0],
        type,
        date,
        startTime,
        duration: Number(duration) || 55,
        title: title.trim(),
        situation,
        subtitles: subtitles.filter((s) => s.trim()),
        summary,
        learningActivities: learning.filter((s) => s.trim()),
        evalActivities: evals.filter((s) => s.trim()),
        nextDate,
      },
      status,
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la séance" : "Nouvelle séance"}</DialogTitle>
          <p className="text-sm text-muted-foreground">Remplissez les informations de la séance.</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Sel label="Enseignant" value={teacher} onChange={setTeacher} options={TEACHERS} />
            <Sel label="Classe pédagogique" value={className} onChange={setClassName} options={CLASSES} />
            <Sel label="Matière (discipline)" value={subject} onChange={setSubject} options={SUBJECTS} />
            <Sel label="Type d'activité" value={type} onChange={setType} options={TYPES} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Heure de début</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Durée (min)</Label>
              <Input type="number" min={5} max={300} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-ew-green-700" /> Titre de la leçon / séance
            </Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. : Les nombres décimaux" />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-ew-gold-600" /> Situation d&apos;amorce
            </Label>
            <Textarea value={situation} onChange={(e) => setSituation(e.target.value)} rows={3} placeholder="Décrivez la situation d'amorce : contexte, question de départ, problème posé aux élèves pour introduire la leçon…" />
          </div>

          <RepeatList label="Sous-titres" icon={<span className="h-1 w-1" />} items={subtitles} onChange={setSubtitles} placeholder="Sous-titre / partie de la séance…" empty="Aucun sous-titre ajouté." />

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-orange-500" /> Résumé de la séance
            </Label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Résumez le contenu abordé durant cette séance…" />
          </div>

          <RepeatList label="Activités d'apprentissage" icon={<BookOpen className="h-4 w-4 text-ew-green-700" />} items={learning} onChange={setLearning} placeholder="Activité d'apprentissage…" empty="Aucune activité d'apprentissage ajoutée." />
          <RepeatList label="Activités d'évaluation" icon={<FlaskConical className="h-4 w-4 text-ew-gold-600" />} items={evals} onChange={setEvals} placeholder="Activité d'évaluation…" empty="Aucune évaluation planifiée." />

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-blue-600" /> Date de la prochaine séance
            </Label>
            <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button variant="outline" onClick={() => submit("draft")}>Brouillon</Button>
          <Button onClick={() => submit(isEdit ? entry!.status : "draft")}>{isEdit ? "Enregistrer" : "Créer la séance"}</Button>
          <Button className="bg-ew-green-600 hover:bg-ew-green-700 text-white" onClick={() => submit("published")}>Publier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
