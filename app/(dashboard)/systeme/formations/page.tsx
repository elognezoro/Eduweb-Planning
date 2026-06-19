"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Lock,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  Users,
  UsersRound,
  BookOpen,
  Calendar,
  GitBranch,
  Unlock,
} from "lucide-react";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { sortedCourses } from "@/lib/formations/catalog";
import {
  countEnrolledUsers,
  enrollmentSourceLabel,
  getEnrollmentVerdict,
} from "@/lib/formations/enrollment";
import type { CourseCohort, CourseEnrollment } from "@/lib/formations/types";
import {
  COHORT_CSV_TEMPLATE,
  COHORT_CSV_TEMPLATE_FILENAME,
  groupRowsByCohort,
  parseCohortsCsv,
  type CohortDraft,
} from "@/lib/formations/csv-import";
import {
  completionModeLabel,
  getAccessRule,
  getCourseModuleList,
} from "@/lib/formations/module-access";
import { cn } from "@/lib/utils";

/**
 * Page d'administration des inscriptions aux formations.
 *
 * Trois onglets :
 *  - Inscrits par cours : liste, désinscription
 *  - Cohortes : créer, renommer, ajouter/retirer des membres, supprimer
 *  - Inscription rapide : sélectionner un cours et des utilisateurs, inscrire
 *    en lot avec source individuelle ou cohorte
 *
 * Accessible aux utilisateurs disposant de la permission `system:manage_permissions`.
 */
export default function FormationsAdminPage() {
  return (
    <ModulePage
      title="Inscriptions aux formations"
      description="Inscrivez des utilisateurs aux séminaires, manuel académique et bibliothèque de guides. Gérez les inscriptions nominatives ou par cohortes."
      icon={GraduationCap}
      permission="system:manage_permissions"
      showContextBadge={false}
      kpis={[]}
    >
      <FormationsContent />
    </ModulePage>
  );
}

function FormationsContent() {
  const store = useStore();
  const app = useApp();
  const courses = React.useMemo(() => sortedCourses(), []);

  type Tab = "enrolled" | "cohorts" | "quick" | "access";
  const [tab, setTab] = React.useState<Tab>("quick");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>(courses[0]?.id ?? "");

  const totalEnrolled = React.useMemo(() => {
    const users = store.users.map((u) => ({ id: u.id, role: u.role }));
    return courses.map((c) => ({
      course: c,
      enrolled: countEnrolledUsers(c.id, users, store.courseEnrollments, store.courseCohorts),
    }));
  }, [courses, store.users, store.courseEnrollments, store.courseCohorts]);

  return (
    <div className="space-y-5">
      {/* KPIs synthétiques */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Cours du catalogue" value={courses.length} icon={<BookOpen className="h-4 w-4" />} />
        <Kpi
          label="Inscriptions actives"
          value={store.courseEnrollments.length}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <Kpi label="Cohortes" value={store.courseCohorts.length} icon={<UsersRound className="h-4 w-4" />} />
        <Kpi label="Utilisateurs" value={store.users.length} icon={<Users className="h-4 w-4" />} />
      </div>

      {/* Synthèse par cours */}
      <SectionCard contentClassName="p-4">
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          Inscriptions par cours
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {totalEnrolled.map(({ course, enrolled }) => (
            <li
              key={course.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {course.type === "seminaire"
                    ? "Séminaire"
                    : course.type === "manuel"
                      ? "Manuel"
                      : "Guides"}
                </p>
                <p className="font-display text-sm font-bold text-foreground">{course.shortTitle}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-extrabold text-ew-green-700">{enrolled}</p>
                <p className="text-[10px] text-muted-foreground">inscrits</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Sélecteur de cours commun + onglets */}
      <SectionCard contentClassName="p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Cours sélectionné
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortTitle} ({c.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-border pb-2">
          <TabButton active={tab === "quick"} onClick={() => setTab("quick")} icon={<Plus className="h-4 w-4" />}>
            Inscription rapide
          </TabButton>
          <TabButton active={tab === "enrolled"} onClick={() => setTab("enrolled")} icon={<CheckCircle2 className="h-4 w-4" />}>
            Inscrits au cours
          </TabButton>
          <TabButton active={tab === "cohorts"} onClick={() => setTab("cohorts")} icon={<UsersRound className="h-4 w-4" />}>
            Cohortes
          </TabButton>
          <TabButton active={tab === "access"} onClick={() => setTab("access")} icon={<GitBranch className="h-4 w-4" />}>
            Conditions d&apos;accès
          </TabButton>
        </div>

        {tab === "quick" ? (
          <QuickEnrollPanel courseId={selectedCourseId} actor={app.user.displayName} />
        ) : tab === "enrolled" ? (
          <EnrolledPanel courseId={selectedCourseId} />
        ) : tab === "cohorts" ? (
          <CohortsPanel courseId={selectedCourseId} actor={app.user.displayName} />
        ) : (
          <AccessRulesPanel courseId={selectedCourseId} />
        )}
      </SectionCard>
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-extrabold text-foreground">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors",
        active
          ? "border border-ew-green-300 bg-ew-green-50 text-ew-green-800"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ============================================================================
   ONGLET 1 — INSCRIPTION RAPIDE
   ========================================================================== */
function QuickEnrollPanel({ courseId, actor }: { courseId: string; actor: string }) {
  const store = useStore();
  const [search, setSearch] = React.useState("");
  const [picked, setPicked] = React.useState<Set<string>>(new Set());
  const [source, setSource] = React.useState<"individual" | "cohort">("individual");
  const [cohortId, setCohortId] = React.useState<string>("");
  const [expiresAt, setExpiresAt] = React.useState<string>("");
  const [notes, setNotes] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);

  const cohortsForCourse = store.courseCohorts.filter((c) => c.courseId === courseId);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return store.users.filter((u) => {
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [store.users, search]);

  function toggle(uid: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  function selectAllFiltered() {
    setPicked(new Set(filtered.map((u) => u.id)));
  }

  function clearSelection() {
    setPicked(new Set());
  }

  function submit() {
    if (picked.size === 0) {
      setToast("Sélectionnez au moins un utilisateur.");
      return;
    }
    const sourceKind = source === "cohort" ? "cohort" : "individual";
    store.enrollUsers(Array.from(picked), {
      courseId,
      enrolledBy: actor,
      source: sourceKind,
      cohortId: source === "cohort" ? cohortId || null : null,
      expiresAt: expiresAt ? new Date(expiresAt + "T23:59:59").toISOString() : null,
      notes: notes.trim() || undefined,
    });
    setToast(`${picked.size} utilisateur(s) inscrit(s).`);
    setPicked(new Set());
    setNotes("");
    window.setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Méthode
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as "individual" | "cohort")}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="individual">Nominative</option>
            <option value="cohort">Par cohorte</option>
          </select>
        </div>
        {source === "cohort" ? (
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Cohorte
            </label>
            <select
              value={cohortId}
              onChange={(e) => setCohortId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">— Sélectionner —</option>
              {cohortsForCourse.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.memberUserIds.length} membres)
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Expire le (facultatif)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className={cn("space-y-1", source === "cohort" ? "sm:col-span-4" : "sm:col-span-2")}>
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Notes (facultatif)
          </label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex. session de juin" className="h-9" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Sélectionner les utilisateurs
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, email, rôle…"
            className="h-9 pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">
            {picked.size}/{filtered.length} sélectionnés ({store.users.length} au total)
          </span>
          <button
            type="button"
            onClick={selectAllFiltered}
            className="rounded-md border border-border bg-card px-2 py-0.5 font-bold hover:bg-muted/40"
          >
            Tout sélectionner
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-md border border-border bg-card px-2 py-0.5 font-bold hover:bg-muted/40"
          >
            Vider
          </button>
        </div>
      </div>

      <div className="max-h-[320px] overflow-y-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-bold w-10"></th>
              <th className="px-3 py-2 text-left font-bold">Nom</th>
              <th className="px-3 py-2 text-left font-bold">Rôle</th>
              <th className="px-3 py-2 text-left font-bold">Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground italic">
                  Aucun utilisateur ne correspond à la recherche.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr
                  key={u.id}
                  className={cn(
                    "border-t border-border hover:bg-muted/20",
                    picked.has(u.id) && "bg-ew-green-50/60",
                  )}
                >
                  <td className="px-3 py-1.5">
                    <input
                      type="checkbox"
                      checked={picked.has(u.id)}
                      onChange={() => toggle(u.id)}
                      className="accent-ew-green-700"
                      aria-label={`Sélectionner ${u.name}`}
                    />
                  </td>
                  <td className="px-3 py-1.5 font-medium text-foreground">{u.name}</td>
                  <td className="px-3 py-1.5">
                    <Badge tone="green">{u.role}</Badge>
                  </td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">{u.email ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {toast ?? "Les inscriptions sont persistées localement (mode démo)."}
        </p>
        <Button
          onClick={submit}
          disabled={picked.size === 0 || (source === "cohort" && !cohortId)}
          size="sm"
        >
          <Plus className="h-4 w-4" /> Inscrire {picked.size > 0 ? `(${picked.size})` : ""}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================================
   ONGLET 2 — INSCRITS AU COURS
   ========================================================================== */
function EnrolledPanel({ courseId }: { courseId: string }) {
  const store = useStore();
  const [search, setSearch] = React.useState("");

  const rows = React.useMemo(() => {
    const allUsers = store.users.map((u) => ({ id: u.id, name: u.name, role: u.role, email: u.email }));
    return allUsers
      .map((u) => {
        const verdict = getEnrollmentVerdict(
          u.id,
          u.role,
          courseId,
          store.courseEnrollments,
          store.courseCohorts,
        );
        return { user: u, verdict };
      })
      .filter(({ verdict }) => verdict.enrolled)
      .filter(({ user }) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          user.name.toLowerCase().includes(q) ||
          (user.email ?? "").toLowerCase().includes(q) ||
          user.role.toLowerCase().includes(q)
        );
      });
  }, [store.users, store.courseEnrollments, store.courseCohorts, courseId, search]);

  function unenroll(enrollment: CourseEnrollment | undefined) {
    if (!enrollment) {
      window.alert(
        "Cette inscription provient d'une cohorte ou d'une auto-inscription par rôle. Retirez l'utilisateur de la cohorte (onglet Cohortes) ou modifiez la matrice des rôles.",
      );
      return;
    }
    if (!window.confirm("Désinscrire cet utilisateur du cours ?")) return;
    store.removeEnrollment(enrollment.id);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, rôle, email…"
          className="h-9 pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-bold">Nom</th>
              <th className="px-3 py-2 text-left font-bold">Rôle</th>
              <th className="px-3 py-2 text-left font-bold">Source</th>
              <th className="px-3 py-2 text-left font-bold">Inscrit le</th>
              <th className="px-3 py-2 text-left font-bold">Expire</th>
              <th className="px-3 py-2 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center italic text-muted-foreground">
                  Aucun utilisateur inscrit à ce cours.
                </td>
              </tr>
            ) : (
              rows.map(({ user, verdict }) => (
                <tr key={user.id} className="border-t border-border align-top">
                  <td className="px-3 py-1.5 font-medium text-foreground">{user.name}</td>
                  <td className="px-3 py-1.5">
                    <Badge tone="green">{user.role}</Badge>
                  </td>
                  <td className="px-3 py-1.5 text-xs">{enrollmentSourceLabel(verdict.source)}</td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">
                    {verdict.enrollment
                      ? new Date(verdict.enrollment.enrolledAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">
                    {verdict.expiresAt
                      ? new Date(verdict.expiresAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {verdict.source !== "role-auto" ? (
                      <button
                        onClick={() => unenroll(verdict.enrollment)}
                        className="inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs text-destructive hover:border-destructive/40 hover:bg-destructive/5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Retirer
                      </button>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">Automatique</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================================
   ONGLET 3 — COHORTES
   ========================================================================== */
function CohortsPanel({ courseId, actor }: { courseId: string; actor: string }) {
  const store = useStore();
  const cohorts = store.courseCohorts.filter((c) => c.courseId === courseId);

  const [newName, setNewName] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  function createCohort() {
    if (!newName.trim()) {
      window.alert("Donnez un nom à la cohorte.");
      return;
    }
    store.createCohort({
      courseId,
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      createdBy: actor,
      memberUserIds: [],
    });
    setNewName("");
    setNewDescription("");
  }

  return (
    <div className="space-y-4">
      {/* Import CSV en lot — pratique pour créer plusieurs cohortes d'un coup. */}
      <CsvImportZone courseId={courseId} actor={actor} />

      <div className="rounded-lg border border-dashed border-border bg-background/60 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
          Créer une nouvelle cohorte
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom (ex. Cohorte juin 2026)"
            className="h-9 sm:col-span-1"
          />
          <Input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (facultatif)"
            className="h-9 sm:col-span-2"
          />
        </div>
        <Button size="sm" className="mt-2" onClick={createCohort}>
          <Plus className="h-4 w-4" /> Créer la cohorte
        </Button>
      </div>

      {cohorts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm italic text-muted-foreground">
          Aucune cohorte créée pour ce cours.
        </p>
      ) : (
        cohorts.map((c) => (
          <CohortCard
            key={c.id}
            cohort={c}
            editing={editingId === c.id}
            onToggleEdit={() => setEditingId(editingId === c.id ? null : c.id)}
          />
        ))
      )}
    </div>
  );
}

function CohortCard({
  cohort,
  editing,
  onToggleEdit,
}: {
  cohort: CourseCohort;
  editing: boolean;
  onToggleEdit: () => void;
}) {
  const store = useStore();
  const [name, setName] = React.useState(cohort.name);
  const [description, setDescription] = React.useState(cohort.description ?? "");
  const [search, setSearch] = React.useState("");

  const members = store.users.filter((u) => cohort.memberUserIds.includes(u.id));
  const others = store.users.filter((u) => !cohort.memberUserIds.includes(u.id));
  const q = search.trim().toLowerCase();
  const candidates = q
    ? others.filter((u) => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q))
    : others.slice(0, 12);

  function save() {
    store.updateCohort(cohort.id, {
      name: name.trim() || cohort.name,
      description: description.trim() || undefined,
    });
    onToggleEdit();
  }

  function remove() {
    if (!window.confirm(`Supprimer la cohorte « ${cohort.name} » ? Les inscriptions individuelles seront conservées.`)) return;
    store.removeCohort(cohort.id);
  }

  function addMember(uid: string) {
    store.updateCohortMembers(cohort.id, [...cohort.memberUserIds, uid]);
  }

  function removeMember(uid: string) {
    store.updateCohortMembers(
      cohort.id,
      cohort.memberUserIds.filter((id) => id !== uid),
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {editing ? (
          <div className="flex-1 space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 font-bold" />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (facultatif)"
              className="h-9 text-sm"
            />
          </div>
        ) : (
          <div>
            <p className="font-display text-base font-bold text-foreground">{cohort.name}</p>
            {cohort.description ? (
              <p className="text-xs italic text-muted-foreground">{cohort.description}</p>
            ) : null}
            <p className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Calendar aria-hidden className="h-3 w-3" />
              Créée le {new Date(cohort.createdAt).toLocaleDateString("fr-FR")} par {cohort.createdBy} ·{" "}
              <strong className="text-ew-green-800">{cohort.memberUserIds.length} membres</strong>
            </p>
          </div>
        )}
        <div className="flex gap-1">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={onToggleEdit}>
                Annuler
              </Button>
              <Button size="sm" onClick={save}>
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onToggleEdit}>
                Modifier
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={remove}
                className="border-destructive/40 text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {/* Membres actuels */}
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
            Membres ({members.length})
          </p>
          {members.length === 0 ? (
            <p className="mt-2 text-xs italic text-muted-foreground">Aucun membre.</p>
          ) : (
            <ul className="mt-2 max-h-[200px] space-y-1 overflow-y-auto">
              {members.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/60 px-2 py-1 text-xs"
                >
                  <span>
                    <strong>{u.name}</strong>{" "}
                    <span className="text-muted-foreground">— {u.role}</span>
                  </span>
                  <button
                    onClick={() => removeMember(u.id)}
                    className="rounded p-1 text-destructive hover:bg-destructive/5"
                    aria-label={`Retirer ${u.name} de la cohorte`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ajouter un membre */}
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">Ajouter un membre</p>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou rôle…"
              className="h-8 pl-9 text-xs"
            />
          </div>
          {candidates.length === 0 ? (
            <p className="mt-2 text-xs italic text-muted-foreground">Aucun utilisateur disponible.</p>
          ) : (
            <ul className="mt-2 max-h-[200px] space-y-1 overflow-y-auto">
              {candidates.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-2 text-xs">
                  <span>
                    <strong>{u.name}</strong>{" "}
                    <span className="text-muted-foreground">— {u.role}</span>
                  </span>
                  <button
                    onClick={() => addMember(u.id)}
                    className="rounded-md border border-border bg-card px-2 py-0.5 font-bold hover:bg-muted/40"
                  >
                    + Ajouter
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

/* ============================================================================
   ONGLET 4 — CONDITIONS D'ACCÈS PAR MODULE
   ========================================================================== */
function AccessRulesPanel({ courseId }: { courseId: string }) {
  const modules = React.useMemo(() => getCourseModuleList(courseId), [courseId]);

  if (modules.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background/60 p-5 text-center text-sm italic text-muted-foreground">
        Ce cours n&apos;est pas structuré en modules indépendants. Les conditions
        d&apos;accès s&apos;appliquent aux cours modulaires (Magnifica Humanitas).
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-ew-green-200 bg-ew-green-50/40 p-3 text-xs">
        <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-ew-green-700">
          <Lock aria-hidden className="h-3.5 w-3.5" /> Comment ça marche ?
        </p>
        <p className="mt-1 text-foreground/90">
          Pour chaque module, vous pouvez exiger qu&apos;un ou plusieurs autres modules
          soient <strong>terminés</strong> avant que les apprenants ne puissent y accéder.
          La complétion peut être <strong>validée manuellement</strong> par l&apos;apprenant,
          <strong> automatique</strong> à la lecture, ou exiger un{" "}
          <strong>score minimum à un quiz</strong>.
        </p>
        <p className="mt-1 text-muted-foreground italic">
          Par défaut, tous les modules sont accessibles librement (aucun prérequis,
          validation manuelle). L&apos;administrateur passe toujours, quel que soit
          l&apos;état d&apos;avancement.
        </p>
      </div>

      <div className="space-y-2">
        {modules.map((m) => (
          <AccessRuleCard key={m.id} courseId={courseId} module={m} modules={modules} />
        ))}
      </div>
    </div>
  );
}

function AccessRuleCard({
  courseId,
  module,
  modules,
}: {
  courseId: string;
  module: { id: string; num: number; title: string; displayTitle?: string };
  modules: { id: string; num: number; title: string; displayTitle?: string }[];
}) {
  const store = useStore();
  const current = getAccessRule(courseId, module.id, store.moduleAccessRules);
  const [prereq, setPrereq] = React.useState<string[]>(current.prerequisiteModuleIds);
  const [mode, setMode] = React.useState<typeof current.completionMode>(current.completionMode);
  const [minScore, setMinScore] = React.useState<number>(current.minQuizScore ?? 70);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    setPrereq(current.prerequisiteModuleIds);
    setMode(current.completionMode);
    setMinScore(current.minQuizScore ?? 70);
  }, [current.prerequisiteModuleIds, current.completionMode, current.minQuizScore]);

  function togglePrereq(id: string) {
    setPrereq((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    store.setModuleAccessRule({
      courseId,
      moduleId: module.id,
      prerequisiteModuleIds: prereq,
      completionMode: mode,
      minQuizScore: mode === "quiz" ? minScore : undefined,
    });
    setSavedAt(Date.now());
  }

  function reset() {
    store.clearModuleAccessRule(courseId, module.id);
  }

  const hasChanges =
    JSON.stringify(prereq.slice().sort()) !==
      JSON.stringify(current.prerequisiteModuleIds.slice().sort()) ||
    mode !== current.completionMode ||
    (mode === "quiz" && (current.minQuizScore ?? 70) !== minScore);

  const eligible = modules.filter((m) => m.id !== module.id);

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ew-green-700">
            Module {module.num}
          </p>
          <p className="font-display text-base font-bold text-foreground">{module.title}</p>
          {module.displayTitle ? (
            <p className="text-xs italic text-muted-foreground">{module.displayTitle}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {prereq.length === 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-ew-green-300 bg-ew-green-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ew-green-800">
              <Unlock aria-hidden className="h-3 w-3" /> Libre
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-ew-gold-200 bg-ew-gold-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ew-gold-700">
              <Lock aria-hidden className="h-3 w-3" />
              {prereq.length} prérequis
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Complétion · {completionModeLabel(mode)}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        {/* Prérequis */}
        <div className="lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
            Prérequis (modules à compléter avant celui-ci)
          </p>
          <div className="mt-2 flex max-h-[180px] flex-wrap gap-1 overflow-y-auto rounded-md border border-border bg-background/60 p-2">
            {eligible.length === 0 ? (
              <p className="text-xs italic text-muted-foreground">
                Aucun autre module dans le cours.
              </p>
            ) : (
              eligible.map((other) => {
                const picked = prereq.includes(other.id);
                return (
                  <label
                    key={other.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]",
                      picked
                        ? "border-ew-green-600 bg-ew-green-100 text-ew-green-900"
                        : "border-border bg-card text-foreground hover:bg-muted/40",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={picked}
                      onChange={() => togglePrereq(other.id)}
                      className="accent-ew-green-700"
                    />
                    <span>
                      M{other.num} —{" "}
                      {other.displayTitle ?? other.title.replace(/^Module \d+ — /, "")}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Critère de complétion */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
            Critère de complétion du module
          </p>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
            className="mt-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="manual">Validation manuelle (par défaut)</option>
            <option value="auto">Automatique à la lecture</option>
            <option value="quiz">Quiz avec score minimum</option>
          </select>
          {mode === "quiz" ? (
            <div className="mt-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Score minimum requis (%)
              </label>
              <input
                type="number"
                value={minScore}
                onChange={(e) =>
                  setMinScore(Math.max(0, Math.min(100, Number(e.target.value))))
                }
                min={0}
                max={100}
                step={5}
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {savedAt && !hasChanges ? (
            <span className="text-ew-green-700">
              ✓ Règle enregistrée à{" "}
              {new Date(savedAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : hasChanges ? (
            <span className="italic">Modifications non enregistrées.</span>
          ) : (
            <span className="italic">Configuration actuelle.</span>
          )}
        </p>
        <div className="flex gap-2">
          {prereq.length > 0 || mode !== "manual" ? (
            <Button variant="outline" size="sm" onClick={reset}>
              Réinitialiser
            </Button>
          ) : null}
          <Button size="sm" onClick={save} disabled={!hasChanges}>
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================================
   IMPORT CSV — création groupée de cohortes par glisser/déposer
   ========================================================================== */
function CsvImportZone({ courseId, actor }: { courseId: string; actor: string }) {
  const store = useStore();
  const [drafts, setDrafts] = React.useState<CohortDraft[] | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parseErrors, setParseErrors] = React.useState<{ lineNumber: number; message: string }[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Pour chaque email du brouillon, on cherche l'utilisateur correspondant dans le store
  // (insensible à la casse). On distingue les correspondances trouvées des emails inconnus.
  const drafted = React.useMemo(() => {
    if (!drafts) return null;
    return drafts.map((draft) => {
      const matchedIds: string[] = [];
      const unknownEmails: string[] = [];
      for (const email of draft.emails) {
        const user = store.users.find(
          (u) => (u.email ?? "").trim().toLowerCase() === email.trim().toLowerCase(),
        );
        if (user) matchedIds.push(user.id);
        else unknownEmails.push(email);
      }
      const existing = store.courseCohorts.find(
        (c) =>
          c.courseId === courseId &&
          c.name.trim().toLowerCase() === draft.name.trim().toLowerCase(),
      );
      return { draft, matchedIds, unknownEmails, existing };
    });
  }, [drafts, store.users, store.courseCohorts, courseId]);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!/\.csv$|text\/csv|application\/vnd\.ms-excel/.test(f.name + f.type)) {
      setToast("Le fichier doit être un .csv.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const result = parseCohortsCsv(text);
      setDrafts(groupRowsByCohort(result.rows));
      setParseErrors(result.errors);
      setFileName(f.name);
      setToast(null);
    };
    reader.onerror = () => setToast("Lecture du fichier impossible.");
    reader.readAsText(f, "utf-8");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function reset() {
    setDrafts(null);
    setFileName(null);
    setParseErrors([]);
    setToast(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function downloadTemplate() {
    const blob = new Blob([COHORT_CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = COHORT_CSV_TEMPLATE_FILENAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importAll() {
    if (!drafted) return;
    let createdCohorts = 0;
    let mergedCohorts = 0;
    let addedMembers = 0;
    for (const item of drafted) {
      if (item.existing) {
        // Cohorte existante : ajouter les nouveaux membres (déduplication).
        const next = Array.from(new Set([...item.existing.memberUserIds, ...item.matchedIds]));
        const delta = next.length - item.existing.memberUserIds.length;
        if (delta > 0) {
          store.updateCohortMembers(item.existing.id, next);
          addedMembers += delta;
          mergedCohorts++;
        }
      } else {
        // Création d'une nouvelle cohorte avec les membres trouvés.
        store.createCohort({
          courseId,
          name: item.draft.name,
          description: item.draft.description || undefined,
          createdBy: actor,
          memberUserIds: item.matchedIds,
        });
        createdCohorts++;
        addedMembers += item.matchedIds.length;
      }
    }
    setToast(
      `Import effectué : ${createdCohorts} cohorte(s) créée(s), ${mergedCohorts} fusionnée(s), ${addedMembers} membre(s) ajouté(s).`,
    );
    setDrafts(null);
    setFileName(null);
    setParseErrors([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Vue idle : juste la dropzone + lien modèle.
  if (!drafts) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-lg border-2 border-dashed p-4 transition-colors",
          isDragging
            ? "border-ew-green-500 bg-ew-green-50"
            : "border-border bg-background/60 hover:border-ew-green-300",
        )}
      >
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ew-green-700 text-white">
            <Upload aria-hidden className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
              Importer plusieurs cohortes (CSV)
            </p>
            <p className="mt-0.5 text-sm">
              Glissez un fichier <strong>.csv</strong> ici, ou{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-bold text-ew-green-700 underline hover:text-ew-green-900"
              >
                parcourez votre ordinateur
              </button>
              . Une ligne = une cohorte × un membre (par email).
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-2 inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-bold hover:bg-muted/40"
            >
              <Download aria-hidden className="h-3.5 w-3.5" /> Télécharger le modèle CSV
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {toast ? <p className="mt-2 text-xs text-destructive">{toast}</p> : null}
      </div>
    );
  }

  // Vue aperçu : récapitule ce qui sera créé / fusionné / ignoré.
  const totalCohorts = drafted?.length ?? 0;
  const totalMatched = drafted?.reduce((acc, d) => acc + d.matchedIds.length, 0) ?? 0;
  const totalUnknown = drafted?.reduce((acc, d) => acc + d.unknownEmails.length, 0) ?? 0;

  return (
    <div className="rounded-lg border border-ew-green-300 bg-ew-green-50/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <FileSpreadsheet aria-hidden className="h-4 w-4" /> Aperçu de l&apos;import
          {fileName ? <span className="font-normal text-muted-foreground">— {fileName}</span> : null}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={reset}>
            Annuler
          </Button>
          <Button size="sm" onClick={importAll}>
            <Plus className="h-4 w-4" /> Importer {totalCohorts} cohorte{totalCohorts > 1 ? "s" : ""}
          </Button>
        </div>
      </div>

      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
        <span className="rounded-md border border-ew-green-200 bg-card px-2 py-1">
          <strong className="text-ew-green-800">{totalCohorts}</strong> cohorte(s) trouvée(s)
        </span>
        <span className="rounded-md border border-ew-green-200 bg-card px-2 py-1">
          <strong className="text-ew-green-800">{totalMatched}</strong> membre(s) reconnu(s)
        </span>
        <span
          className={cn(
            "rounded-md border bg-card px-2 py-1",
            totalUnknown > 0 ? "border-ew-gold-500 text-ew-gold-700" : "border-border",
          )}
        >
          <strong>{totalUnknown}</strong> email(s) non trouvé(s)
        </span>
      </div>

      <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto">
        {drafted?.map((item, i) => (
          <article key={i} className="rounded-md border border-border bg-card p-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-foreground">
                {item.draft.name}
                {item.existing ? (
                  <span className="ml-2 rounded-full bg-ew-gold-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ew-gold-700">
                    Cohorte existante → fusion
                  </span>
                ) : (
                  <span className="ml-2 rounded-full bg-ew-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ew-green-800">
                    Nouvelle cohorte
                  </span>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {item.matchedIds.length} membre(s) reconnu(s)
                {item.unknownEmails.length > 0 ? `, ${item.unknownEmails.length} email(s) inconnu(s)` : null}
              </p>
            </div>
            {item.draft.description ? (
              <p className="mt-0.5 text-xs italic text-muted-foreground">{item.draft.description}</p>
            ) : null}
            {item.unknownEmails.length > 0 ? (
              <div className="mt-1.5 rounded border border-ew-gold-200 bg-ew-gold-50 px-2 py-1 text-[11px]">
                <p className="flex items-center gap-1 font-bold text-ew-gold-700">
                  <AlertTriangle aria-hidden className="h-3 w-3" /> Emails non trouvés dans
                  l&apos;annuaire — ignorés
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {item.unknownEmails.slice(0, 5).join(", ")}
                  {item.unknownEmails.length > 5
                    ? ` et ${item.unknownEmails.length - 5} autre(s)`
                    : null}
                </p>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {parseErrors.length > 0 ? (
        <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-2">
          <p className="flex items-center gap-1 text-xs font-bold text-destructive">
            <AlertTriangle aria-hidden className="h-3.5 w-3.5" /> Lignes ignorées ({parseErrors.length})
          </p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-destructive">
            {parseErrors.slice(0, 6).map((e, i) => (
              <li key={i}>
                Ligne {e.lineNumber} : {e.message}
              </li>
            ))}
            {parseErrors.length > 6 ? (
              <li className="italic">… et {parseErrors.length - 6} autre(s) erreur(s).</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
