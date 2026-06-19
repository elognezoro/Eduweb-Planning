"use client";

import * as React from "react";
import { CheckCircle2, GraduationCap, Plus, Search, Trash2, Users, UsersRound, BookOpen, Calendar } from "lucide-react";
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

  type Tab = "enrolled" | "cohorts" | "quick";
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
        </div>

        {tab === "quick" ? (
          <QuickEnrollPanel courseId={selectedCourseId} actor={app.user.displayName} />
        ) : tab === "enrolled" ? (
          <EnrolledPanel courseId={selectedCourseId} />
        ) : (
          <CohortsPanel courseId={selectedCourseId} actor={app.user.displayName} />
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
