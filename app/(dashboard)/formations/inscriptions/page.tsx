"use client";

import * as React from "react";
import { GraduationCap, Plus, Printer, Search, Trash2, UserPlus } from "lucide-react";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import {
  DirectoryUsersProvider,
  useDirectoryUsers,
} from "@/components/app-shell/use-directory-users";
import { getCourse, sortedCourses } from "@/lib/formations/catalog";
import { enrollmentSourceLabel, getEnrollmentVerdict } from "@/lib/formations/enrollment";
import { DEFAULT_FORMATION_ROLE, FORMATION_ROLE_META } from "@/lib/formations/formation-roles";
import type { CourseEnrollment } from "@/lib/formations/types";
import { etabExportMeta, type EtabExportMeta } from "@/lib/etab-config";
import {
  EnrollListPrintDocument,
  type EnrollListSection,
} from "@/components/formations/enroll-list-document";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import {
  deleteCourseEnrollment,
  insertCourseEnrollments,
} from "@/lib/formations/enrollments-server";

/**
 * Page « Inscriptions aux cours » — accessible à l'admin ET à l'enseignant
 * (permission `formations:enroll`). Surface CIBLÉE : uniquement inscrire /
 * désinscrire un utilisateur à un cours. La gestion complète (cohortes,
 * conditions d'accès, tarification, paiement, liens, réussite) reste réservée
 * à l'admin sur /systeme/formations (`system:manage_permissions`).
 *
 * Réutilise les primitives existantes : store (enrollUser/removeEnrollment),
 * useDirectoryUsers (vrais comptes), catalogue, et la persistance Supabase
 * (insertCourseEnrollments/deleteCourseEnrollment — RLS étendue à l'enseignant
 * par la migration 029). En mode démo, tout reste en mémoire.
 */
export default function InscriptionsCoursPage() {
  return (
    <DirectoryUsersProvider>
      <InscriptionsCours />
    </DirectoryUsersProvider>
  );
}

function InscriptionsCours() {
  const app = useApp();
  const store = useStore();
  const { users: dirUsers, loading } = useDirectoryUsers();

  const courses = React.useMemo(() => sortedCourses(), []);
  const [courseId, setCourseId] = React.useState(courses[0]?.id ?? "");
  const course = getCourse(courseId);

  const [search, setSearch] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);

  // Année scolaire courante au format canonique « AAAA-AAAA » (aligné serveur).
  const schoolYear = React.useMemo(
    () => app.academicYear.label.match(/\d{4}/g)?.join("-") ?? null,
    [app.academicYear.label],
  );

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 4500);
  }

  // ---- Édition PDF de la liste des inscrits (une ou plusieurs formations) ----
  const [meta, setMeta] = React.useState<EtabExportMeta>(() => etabExportMeta({}));
  const [editedAt, setEditedAt] = React.useState("");
  React.useEffect(() => {
    setMeta(etabExportMeta());
    setEditedAt(new Date().toLocaleDateString("fr-FR"));
  }, []);
  const [printSet, setPrintSet] = React.useState<Set<string>>(() =>
    courses[0] ? new Set([courses[0].id]) : new Set(),
  );

  function togglePrint(id: string) {
    setPrintSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const printSections = React.useMemo<EnrollListSection[]>(
    () =>
      courses
        .filter((c) => printSet.has(c.id))
        .map((c) => {
          const rows = dirUsers
            .map((u) => ({
              u,
              v: getEnrollmentVerdict(
                u.id,
                u.role,
                c.id,
                store.courseEnrollments,
                store.courseCohorts,
              ),
            }))
            .filter(({ v }) => v.enrolled)
            .sort((a, b) => a.u.name.localeCompare(b.u.name, "fr"))
            .map(({ u, v }) => ({
              name: u.name,
              role: u.role,
              formationRole:
                FORMATION_ROLE_META[v.enrollment?.formationRole ?? DEFAULT_FORMATION_ROLE].label,
              source: enrollmentSourceLabel(v.source),
              enrolledAt: v.enrollment
                ? new Date(v.enrollment.enrolledAt).toLocaleDateString("fr-FR")
                : "—",
              expiresAt: v.expiresAt ? new Date(v.expiresAt).toLocaleDateString("fr-FR") : null,
            }));
          return { courseTitle: c.title, courseType: c.type, rows };
        }),
    [courses, printSet, dirUsers, store.courseEnrollments, store.courseCohorts],
  );

  function printList() {
    if (printSet.size === 0) {
      flash("Sélectionnez au moins un cours à inclure dans la liste.");
      return;
    }
    window.print();
  }

  // Verdict d'inscription par utilisateur pour le cours sélectionné.
  const withVerdict = React.useMemo(
    () =>
      dirUsers.map((u) => ({
        user: u,
        verdict: getEnrollmentVerdict(
          u.id,
          u.role,
          courseId,
          store.courseEnrollments,
          store.courseCohorts,
        ),
      })),
    [dirUsers, courseId, store.courseEnrollments, store.courseCohorts],
  );

  const q = search.trim().toLowerCase();
  const matchesSearch = (name: string, email: string, role: string) =>
    !q ||
    name.toLowerCase().includes(q) ||
    email.toLowerCase().includes(q) ||
    role.toLowerCase().includes(q);

  const enrolled = withVerdict.filter(({ verdict }) => verdict.enrolled);
  const enrolledRows = enrolled.filter(({ user }) =>
    matchesSearch(user.name, user.email, user.role),
  );
  const candidates = withVerdict
    .filter(({ verdict }) => !verdict.enrolled)
    .filter(({ user }) => matchesSearch(user.name, user.email, user.role))
    .sort((a, b) => a.user.name.localeCompare(b.user.name, "fr"));

  function enroll(userId: string, userName: string) {
    if (!course) return;
    const enrolledBy = app.user.displayName;
    // enrollUsers (et non enrollUser) : réutilise l'anti-doublon par (cours, année)
    // — un double-clic n'ajoute pas de ligne en double.
    store.enrollUsers([userId], {
      courseId,
      enrolledBy,
      source: "individual",
      cohortId: null,
      expiresAt: null,
      formationRole: DEFAULT_FORMATION_ROLE,
      schoolYear,
    });
    if (isSupabaseConfigured()) {
      void insertCourseEnrollments(createClient(), [
        {
          userId,
          courseId,
          formationRole: DEFAULT_FORMATION_ROLE,
          source: "individual",
          enrolledBy,
          expiresAt: null,
          schoolYear,
        },
      ]).then((res) => {
        flash(
          res.ok
            ? `${userName} inscrit·e à « ${course.title} ».`
            : `Inscrit·e localement, mais échec de l'enregistrement en ligne : ${res.error}`,
        );
      });
    } else {
      flash(`${userName} inscrit·e à « ${course.title} ».`);
    }
  }

  function unenroll(enrollment: CourseEnrollment | undefined, userName: string) {
    if (!enrollment) {
      window.alert(
        "Cette inscription provient d'une cohorte ou d'une auto-inscription par rôle : elle ne peut pas être retirée individuellement ici.",
      );
      return;
    }
    if (!window.confirm(`Désinscrire ${userName} du cours ?`)) return;
    store.removeEnrollment(enrollment.id);
    // Mode réel : suppression côté serveur, sinon la synchro descendante
    // (CourseEnrollmentsSync) la ré-ajouterait au rechargement. On NE scope PAS
    // par année : « désinscrire du cours » retire l'inscription quelle que soit
    // l'année stockée (évite un DELETE sans effet si l'année locale du verdict
    // diffère de celle de la ligne serveur).
    if (isSupabaseConfigured()) {
      void deleteCourseEnrollment(createClient(), {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        schoolYear: null,
      });
    }
    flash(`${userName} désinscrit·e.`);
  }

  return (
    <ModulePage
      title="Inscriptions aux cours"
      description="Inscrivez ou désinscrivez un utilisateur d'un cours de formation. Réservé aux personnes habilitées (admin, enseignant)."
      icon={UserPlus}
      permission="formations:enroll"
    >
      {toast && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-foreground">
          {toast}
        </div>
      )}

      <SectionCard title="Cours">
        <div className="grid gap-3 sm:max-w-lg">
          <label className="text-xs font-medium text-muted-foreground">Cours sélectionné</label>
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setSearch("");
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.type})
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            <GraduationCap className="mr-1 inline h-3.5 w-3.5" />
            {enrolled.length} inscrit·e·s à ce cours
            {schoolYear ? ` · année ${schoolYear}` : ""}.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Rechercher un utilisateur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, e-mail ou rôle…"
            className="h-9 pl-9"
          />
        </div>
      </SectionCard>

      <SectionCard title="Inscrire un utilisateur">
        {loading ? (
          <p className="py-6 text-center text-sm italic text-muted-foreground">
            Chargement des utilisateurs…
          </p>
        ) : candidates.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-muted-foreground">
            {q
              ? "Aucun utilisateur disponible pour cette recherche."
              : "Tous les utilisateurs trouvés sont déjà inscrits à ce cours."}
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {candidates.slice(0, 60).map(({ user }) => (
              <li key={user.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email || "—"} · <Badge tone="green">{user.role}</Badge>
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => enroll(user.id, user.name)}>
                  <Plus className="h-4 w-4" /> Inscrire
                </Button>
              </li>
            ))}
            {candidates.length > 60 && (
              <li className="px-3 py-2 text-center text-xs italic text-muted-foreground">
                {candidates.length - 60} autre·s utilisateur·s — affinez la recherche.
              </li>
            )}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Inscrits au cours">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-bold">Nom</th>
                <th className="px-3 py-2 text-left font-bold">Rôle</th>
                <th className="px-3 py-2 text-left font-bold">Source</th>
                <th className="px-3 py-2 text-left font-bold">Inscrit·e le</th>
                <th className="px-3 py-2 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {enrolledRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center italic text-muted-foreground">
                    Aucun utilisateur inscrit à ce cours.
                  </td>
                </tr>
              ) : (
                enrolledRows.map(({ user, verdict }) => (
                  <tr key={user.id} className="border-t border-border">
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
                    <td className="px-3 py-1.5 text-right">
                      {verdict.source !== "role-auto" && verdict.enrollment ? (
                        <button
                          onClick={() => unenroll(verdict.enrollment, user.name)}
                          className="inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs text-destructive hover:border-destructive/40 hover:bg-destructive/5"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Désinscrire
                        </button>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">
                          {verdict.source === "role-auto" ? "Automatique" : "Via cohorte"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Imprimer la liste des inscrits (PDF)">
        <p className="mb-3 text-sm text-muted-foreground">
          Sélectionnez une ou plusieurs formations, puis lancez l'impression : le document
          (en-tête institutionnel, tableau nominatif trié, récapitulatif d'effectif et zone
          cachet/signature) s'ouvre dans la boîte d'impression du navigateur — choisissez «&nbsp;Enregistrer
          au format PDF&nbsp;». Une page par formation.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {courses.map((c) => {
            const n = dirUsers.filter(
              (u) =>
                getEnrollmentVerdict(u.id, u.role, c.id, store.courseEnrollments, store.courseCohorts)
                  .enrolled,
            ).length;
            return (
              <label
                key={c.id}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={printSet.has(c.id)}
                  onChange={() => togglePrint(c.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="min-w-0 flex-1 truncate" title={c.title}>
                  {c.title}
                </span>
                <Badge tone="blue">{n}</Badge>
              </label>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={printList} disabled={printSet.size === 0}>
            <Printer className="h-4 w-4" /> Aperçu &amp; impression PDF ({printSet.size})
          </Button>
          <span className="text-xs text-muted-foreground">
            {printSections.reduce((a, s) => a + s.rows.length, 0)} inscrit·e·s au total dans la sélection.
          </span>
        </div>
      </SectionCard>

      <EnrollListPrintDocument
        sections={printSections}
        meta={meta}
        editedBy={app.user.displayName}
        editedAt={editedAt}
      />
    </ModulePage>
  );
}
