"use client";

import * as React from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Lock,
  PenLine,
  Plus,
  Save,
  Search,
  Stamp,
  Trash2,
  Trophy,
  Upload,
  Users,
  UsersRound,
  BookOpen,
  Calendar,
  CalendarClock,
  GitBranch,
  Unlock,
  Link2,
  Copy,
  Check,
  Ticket,
  Coins,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";
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
import {
  countEnrolledUsers,
  enrollmentSourceLabel,
  getEnrollmentVerdict,
} from "@/lib/formations/enrollment";
import type { CourseCohort, CourseEnrollment } from "@/lib/formations/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import {
  deleteCourseEnrollment,
  insertCourseEnrollments,
  updateEnrollmentRole,
} from "@/lib/formations/enrollments-server";
import { upsertCohort, deleteCohort } from "@/lib/formations/cohorts-server";
import {
  createShortInviteLink,
  shortInviteUrl,
} from "@/lib/formations/invite-links-server";
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
import {
  completionRuleModeLabel,
  getCourseCompletionRule,
  SUMMATIVE_QUIZ_ID,
} from "@/lib/formations/course-completion";
import { ImageDrop } from "@/components/forms/image-drop";
import {
  FORMATION_ROLES,
  FORMATION_ROLE_META,
  DEFAULT_FORMATION_ROLE,
  type FormationRole,
} from "@/lib/formations/formation-roles";
import {
  EnrolledListComposer,
  type ComposerEnrollee,
} from "@/components/formations/enrolled-list-composer";
import {
  SUPPORT_KINDS,
  SUPPORT_KIND_LABEL,
  SUPPORT_MODE_LABEL,
  getSupportCondition,
  describeCondition,
  type SupportKind,
  type SupportAccessCondition,
  type SupportAccessMode,
} from "@/lib/formations/support-access";
import {
  describeSchedule,
  evaluateCourseSchedule,
  formatScheduleMoment,
  getCourseSchedule,
  isScheduleInverted,
} from "@/lib/formations/course-schedule";
import {
  buildInviteUrl,
  encodeInviteToken,
  makeInviteNonce,
  payloadStatus,
  type EnrollmentInviteLink,
} from "@/lib/formations/enrollment-invite";
import {
  coursePriceFcfa,
  formatEurEquivalent,
  formatFcfa,
  getCoursePrice,
  isCoursePaid,
} from "@/lib/formations/pricing";
import {
  CERT_DATE_MODE_LABEL,
  getCertificateConfig,
  type CertificateDateMode,
} from "@/lib/formations/certificate";
import {
  isMobileMoneyOperational,
  MM_OPERATOR_META,
  MOBILE_MONEY_OPERATORS,
  PAYMENT_STATUS_LABEL,
  type CoursePayment,
  type MobileMoneyOperator,
} from "@/lib/formations/payment";
import { ETAB_CONFIG_KEY, loadEtabConfig } from "@/lib/etab-config";
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
      <DirectoryUsersProvider>
        <FormationsContent />
      </DirectoryUsersProvider>
    </ModulePage>
  );
}

function FormationsContent() {
  const store = useStore();
  const app = useApp();
  // Année scolaire courante (« AAAA-AAAA »), pour rattacher les inscriptions
  // héritées et dédoublonner.
  const currentYear = React.useMemo(
    () => app.academicYear.label.match(/\d{4}/g)?.join("-") ?? "",
    [app.academicYear.label],
  );
  // Nettoyage une fois au montage : rattache les inscriptions « sans année » à
  // l'année courante et supprime les doublons (même utilisateur + même cours +
  // même année), en gardant l'inscription la plus ancienne. Corrige les cas
  // hérités (ex. plusieurs lignes identiques pour un même cours).
  const dedupedRef = React.useRef(false);
  React.useEffect(() => {
    if (dedupedRef.current) return;
    dedupedRef.current = true;
    store.normalizeAndDedupeEnrollments(currentYear);
  }, [store, currentYear]);
  // Annuaire des utilisateurs : vrais comptes Supabase en production, comptes
  // de démonstration sinon. Source unique pour tous les panneaux (inscription,
  // inscrits, cohortes, import CSV).
  const {
    users: dirUsers,
    loading: usersLoading,
    realMode,
  } = useDirectoryUsers();
  const courses = React.useMemo(() => sortedCourses(), []);

  type Tab =
    | "enrolled"
    | "cohorts"
    | "quick"
    | "access"
    | "completion"
    | "schedule"
    | "pricing"
    | "payment"
    | "supports"
    | "links"
    | "identity";
  const [tab, setTab] = React.useState<Tab>("quick");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>(
    courses[0]?.id ?? "",
  );

  const totalEnrolled = React.useMemo(() => {
    const users = dirUsers.map((u) => ({ id: u.id, role: u.role }));
    return courses.map((c) => ({
      course: c,
      enrolled: countEnrolledUsers(
        c.id,
        users,
        store.courseEnrollments,
        store.courseCohorts,
      ),
    }));
  }, [courses, dirUsers, store.courseEnrollments, store.courseCohorts]);

  return (
    <div className="space-y-5">
      {/* KPIs synthétiques */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Cours du catalogue"
          value={courses.length}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <Kpi
          label="Inscriptions actives"
          value={store.courseEnrollments.length}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <Kpi
          label="Cohortes"
          value={store.courseCohorts.length}
          icon={<UsersRound className="h-4 w-4" />}
        />
        <Kpi
          label={realMode ? "Comptes inscrits" : "Utilisateurs"}
          value={usersLoading ? "…" : dirUsers.length}
          icon={<Users className="h-4 w-4" />}
        />
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
                <p className="font-display text-sm font-bold text-foreground">
                  {course.shortTitle}
                </p>
                <p className="mt-0.5 text-[10px] font-bold">
                  {isCoursePaid(course.id, store.coursePrices) ? (
                    <span className="text-ew-gold-700">
                      {formatFcfa(
                        coursePriceFcfa(course.id, store.coursePrices),
                      )}
                    </span>
                  ) : (
                    <span className="uppercase text-muted-foreground">
                      Gratuit
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-extrabold text-ew-green-700">
                  {enrolled}
                </p>
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
          <TabButton
            active={tab === "quick"}
            onClick={() => setTab("quick")}
            icon={<Plus className="h-4 w-4" />}
          >
            Inscription rapide
          </TabButton>
          <TabButton
            active={tab === "enrolled"}
            onClick={() => setTab("enrolled")}
            icon={<CheckCircle2 className="h-4 w-4" />}
          >
            Inscrits au cours
          </TabButton>
          <TabButton
            active={tab === "cohorts"}
            onClick={() => setTab("cohorts")}
            icon={<UsersRound className="h-4 w-4" />}
          >
            Cohortes
          </TabButton>
          <TabButton
            active={tab === "access"}
            onClick={() => setTab("access")}
            icon={<GitBranch className="h-4 w-4" />}
          >
            Conditions d&apos;accès
          </TabButton>
          <TabButton
            active={tab === "completion"}
            onClick={() => setTab("completion")}
            icon={<Trophy className="h-4 w-4" />}
          >
            Réussite du cours
          </TabButton>
          <TabButton
            active={tab === "schedule"}
            onClick={() => setTab("schedule")}
            icon={<CalendarClock className="h-4 w-4" />}
          >
            Ouverture / Fermeture
          </TabButton>
          <TabButton
            active={tab === "pricing"}
            onClick={() => setTab("pricing")}
            icon={<Coins className="h-4 w-4" />}
          >
            Tarification
          </TabButton>
          <TabButton
            active={tab === "payment"}
            onClick={() => setTab("payment")}
            icon={<Wallet className="h-4 w-4" />}
          >
            Paiement
          </TabButton>
          <TabButton
            active={tab === "supports"}
            onClick={() => setTab("supports")}
            icon={<Download className="h-4 w-4" />}
          >
            Supports téléchargeables
          </TabButton>
          <TabButton
            active={tab === "links"}
            onClick={() => setTab("links")}
            icon={<Ticket className="h-4 w-4" />}
          >
            Liens d&apos;inscription
          </TabButton>
          <TabButton
            active={tab === "identity"}
            onClick={() => setTab("identity")}
            icon={<Stamp className="h-4 w-4" />}
          >
            Identité visuelle
          </TabButton>
        </div>

        {tab === "quick" ? (
          <QuickEnrollPanel
            courseId={selectedCourseId}
            actor={app.user.displayName}
          />
        ) : tab === "enrolled" ? (
          <EnrolledPanel courseId={selectedCourseId} />
        ) : tab === "cohorts" ? (
          <CohortsPanel
            courseId={selectedCourseId}
            actor={app.user.displayName}
          />
        ) : tab === "access" ? (
          <AccessRulesPanel courseId={selectedCourseId} />
        ) : tab === "completion" ? (
          <CompletionRulePanel courseId={selectedCourseId} />
        ) : tab === "schedule" ? (
          <CourseSchedulePanel courseId={selectedCourseId} />
        ) : tab === "pricing" ? (
          <CoursePricePanel courseId={selectedCourseId} />
        ) : tab === "payment" ? (
          <PaymentPanel
            courseId={selectedCourseId}
            actor={app.user.displayName}
          />
        ) : tab === "supports" ? (
          <SupportAccessPanel courseId={selectedCourseId} />
        ) : tab === "links" ? (
          <EnrollmentLinksPanel actor={app.user.displayName} />
        ) : (
          <IdentityPanel />
        )}
      </SectionCard>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-extrabold text-foreground">
        {value}
      </p>
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
function QuickEnrollPanel({
  courseId,
  actor,
}: {
  courseId: string;
  actor: string;
}) {
  const store = useStore();
  const app = useApp();
  // Année scolaire courante au format canonique « AAAA-AAAA » (ex. 2025-2026),
  // alignée sur le DEFAULT serveur current_school_year(). Une réinscription est
  // permise sur une NOUVELLE année (dédoublonnage par user+cours+année).
  const schoolYear = React.useMemo(
    () => app.academicYear.label.match(/\d{4}/g)?.join("-") ?? null,
    [app.academicYear.label],
  );
  const { users: dirUsers, loading: usersLoading } = useDirectoryUsers();
  const [search, setSearch] = React.useState("");
  const [picked, setPicked] = React.useState<Set<string>>(new Set());
  const [source, setSource] = React.useState<"individual" | "cohort">(
    "individual",
  );
  const [cohortId, setCohortId] = React.useState<string>("");
  const [expiresAt, setExpiresAt] = React.useState<string>("");
  const [notes, setNotes] = React.useState("");
  const [formationRole, setFormationRole] = React.useState<FormationRole>(
    DEFAULT_FORMATION_ROLE,
  );
  const [toast, setToast] = React.useState<string | null>(null);

  // Multi-sélection de formations : on peut inscrire les utilisateurs choisis à
  // PLUSIEURS formations en une fois. La formation sélectionnée en haut est cible par défaut.
  const courses = React.useMemo(() => sortedCourses(), []);
  const [coursesPicked, setCoursesPicked] = React.useState<Set<string>>(
    () => new Set([courseId]),
  );
  React.useEffect(() => {
    setCoursesPicked((prev) => (prev.has(courseId) ? prev : new Set(prev).add(courseId)));
  }, [courseId]);

  const cohortsForCourse = store.courseCohorts.filter(
    (c) => c.courseId === courseId,
  );

  // Inscriptions par utilisateur (pour la colonne « Formations » de la liste).
  const enrollByUser = React.useMemo(() => {
    const m = new Map<string, CourseEnrollment[]>();
    for (const e of store.courseEnrollments) {
      const arr = m.get(e.userId);
      if (arr) arr.push(e);
      else m.set(e.userId, [e]);
    }
    return m;
  }, [store.courseEnrollments]);
  const courseShort = (id: string) =>
    courses.find((c) => c.id === id)?.shortTitle ?? id;
  /** Inscription automatique par lien d'invitation (cf. trigger handle_new_user). */
  const isInviteAuto = (e: CourseEnrollment) => e.enrolledBy === "Lien d'inscription";

  /**
   * Désinscrit (en un clic, depuis la pastille de cours) un utilisateur d'un cours.
   * Les inscriptions automatiques PAR RÔLE (source "role") ne sont pas retirables
   * ici (elles découlent du rôle — passer par la matrice des rôles). Suppression
   * non scopée sur l'année (retire le cours quelle que soit l'année stockée).
   */
  async function removeFromCourse(userName: string, e: CourseEnrollment) {
    if (e.source === "role") {
      window.alert(
        "Inscription automatique par rôle : modifiez la matrice des rôles de formation pour la retirer.",
      );
      return;
    }
    if (!window.confirm(`Désinscrire ${userName} de « ${courseShort(e.courseId)} » ?`)) return;
    store.removeEnrollment(e.id);
    if (isSupabaseConfigured()) {
      const res = await deleteCourseEnrollment(createClient(), {
        userId: e.userId,
        courseId: e.courseId,
        schoolYear: null,
      });
      if (!res.ok) window.alert(`Échec de la désinscription en ligne : ${res.error ?? ""}`);
    }
  }

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return dirUsers.filter((u) => {
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [dirUsers, search]);

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
    const targetCourses = Array.from(coursesPicked);
    if (targetCourses.length === 0) {
      setToast("Sélectionnez au moins une formation.");
      return;
    }
    const sourceKind = source === "cohort" ? "cohort" : "individual";
    const userIds = Array.from(picked);
    const expIso = expiresAt ? new Date(expiresAt + "T23:59:59").toISOString() : null;

    for (const cId of targetCourses) {
      store.enrollUsers(userIds, {
        courseId: cId,
        enrolledBy: actor,
        source: sourceKind,
        // La cohorte n'a de sens que pour la formation du haut (les cohortes sont par cours).
        cohortId: source === "cohort" && cId === courseId ? cohortId || null : null,
        expiresAt: expIso,
        notes: notes.trim() || undefined,
        formationRole,
        schoolYear,
      });
    }

    const count = userIds.length;
    const nC = targetCourses.length;
    const roleLabel = FORMATION_ROLE_META[formationRole].label.toLowerCase();
    const scope = `${count} utilisateur(s) × ${nC} formation(s)`;

    // Persistance EN LIGNE (mode réel) : l'admin a le droit d'insérer (RLS ce_insert).
    // La synchro descendante (CourseEnrollmentsSync) dédoublonne par user+cours.
    if (isSupabaseConfigured()) {
      const rows = targetCourses.flatMap((cId) =>
        userIds.map((uid) => ({
          userId: uid,
          courseId: cId,
          formationRole,
          source: sourceKind,
          enrolledBy: actor,
          expiresAt: expIso,
          schoolYear,
        })),
      );
      void insertCourseEnrollments(createClient(), rows).then((res) => {
        setToast(
          res.ok
            ? `${scope} inscrit(s) en ligne comme ${roleLabel}.`
            : `Inscrits localement, mais échec de l'enregistrement en ligne : ${res.error}`,
        );
        window.setTimeout(() => setToast(null), 5000);
      });
    } else {
      setToast(`${scope} inscrit(s) comme ${roleLabel}.`);
      window.setTimeout(() => setToast(null), 4000);
    }

    setPicked(new Set());
    setNotes("");
  }

  const allChecked = filtered.length > 0 && filtered.every((u) => picked.has(u.id));
  const someChecked = filtered.some((u) => picked.has(u.id));

  return (
    <div className="space-y-4">
      {/* Multi-sélection de formations : inscrire les utilisateurs à plusieurs formations à la fois. */}
      <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3">
        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Formations ciblées ({coursesPicked.size})
        </label>
        <div className="flex flex-wrap gap-1.5">
          {courses.map((c) => {
            const on = coursesPicked.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setCoursesPicked((prev) => {
                    const next = new Set(prev);
                    if (next.has(c.id)) next.delete(c.id);
                    else next.add(c.id);
                    return next;
                  })
                }
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  on
                    ? "border-ew-green-600 bg-ew-green-50 text-ew-green-800"
                    : "border-border text-muted-foreground hover:bg-muted/40",
                )}
              >
                {c.shortTitle ?? c.title}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Les utilisateurs sélectionnés seront inscrits à <strong>toutes</strong> les formations cochées.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Méthode
          </label>
          <select
            value={source}
            onChange={(e) =>
              setSource(e.target.value as "individual" | "cohort")
            }
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="individual">Nominative</option>
            <option value="cohort">Par cohorte</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Rôle dans la formation
          </label>
          <select
            value={formationRole}
            onChange={(e) => setFormationRole(e.target.value as FormationRole)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            title={FORMATION_ROLE_META[formationRole].description}
          >
            {FORMATION_ROLES.map((r) => (
              <option key={r} value={r}>
                {FORMATION_ROLE_META[r].label}
              </option>
            ))}
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
        <div
          className={cn(
            "space-y-1",
            source === "cohort" ? "sm:col-span-4" : "sm:col-span-2",
          )}
        >
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Notes (facultatif)
          </label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex. session de juin"
            className="h-9"
          />
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
            {picked.size}/{filtered.length} sélectionnés (
            {usersLoading ? "chargement…" : `${dirUsers.length} au total`})
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
              <th className="px-3 py-2 text-left font-bold w-10">
                <input
                  type="checkbox"
                  aria-label="Tout sélectionner"
                  title="Tout sélectionner / désélectionner"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = !allChecked && someChecked;
                  }}
                  onChange={() => (allChecked ? clearSelection() : selectAllFiltered())}
                  className="accent-ew-green-700"
                />
              </th>
              <th className="px-3 py-2 text-left font-bold">Nom</th>
              <th className="px-3 py-2 text-left font-bold">Rôle</th>
              <th className="px-3 py-2 text-left font-bold">Formations</th>
              <th className="px-3 py-2 text-left font-bold">Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-muted-foreground italic"
                >
                  {usersLoading
                    ? "Chargement des comptes…"
                    : "Aucun utilisateur ne correspond à la recherche."}
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
                  <td className="px-3 py-1.5 font-medium text-foreground">
                    {u.name}
                  </td>
                  <td className="px-3 py-1.5">
                    <Badge tone="green">{u.role}</Badge>
                  </td>
                  <td className="px-3 py-1.5">
                    {(() => {
                      // Une chip PAR COURS (pas par ligne d'inscription) : si un
                      // même cours a plusieurs inscriptions (années, héritage),
                      // on n'affiche qu'une chip — la plus représentative.
                      const byCourse = new Map<string, CourseEnrollment>();
                      for (const e of enrollByUser.get(u.id) ?? []) {
                        if (!byCourse.has(e.courseId)) byCourse.set(e.courseId, e);
                      }
                      const list = [...byCourse.values()];
                      if (list.length === 0)
                        return <span className="text-[10px] text-muted-foreground">—</span>;
                      return (
                        <div className="flex flex-wrap gap-1">
                          {list.map((e) => {
                            const auto = isInviteAuto(e);
                            const roleAuto = e.source === "role";
                            return (
                              <span
                                key={e.courseId}
                                title={`${courseShort(e.courseId)} · ${
                                  auto
                                    ? "automatique (lien d'invitation)"
                                    : roleAuto
                                      ? "automatique (par rôle)"
                                      : e.source === "cohort"
                                        ? "inscription manuelle (par cohorte)"
                                        : "inscription manuelle"
                                }`}
                                className={cn(
                                  "inline-flex max-w-[140px] items-center gap-1 truncate rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                                  auto
                                    ? "border-ew-gold-400 bg-ew-gold-50 text-ew-gold-700"
                                    : roleAuto
                                      ? "border-blue-300 bg-blue-50 text-blue-700"
                                      : "border-ew-green-300 bg-ew-green-50 text-ew-green-800",
                                )}
                              >
                                {auto && <Link2 aria-hidden className="h-2.5 w-2.5 shrink-0" />}
                                <span className="truncate">{courseShort(e.courseId)}</span>
                                {!roleAuto && (
                                  <button
                                    type="button"
                                    onClick={() => removeFromCourse(u.name, e)}
                                    title={`Désinscrire de ${courseShort(e.courseId)}`}
                                    aria-label={`Désinscrire ${u.name} de ${courseShort(e.courseId)}`}
                                    className="-mr-0.5 shrink-0 rounded-full p-0.5 transition-colors hover:bg-destructive/15 hover:text-destructive"
                                  >
                                    <X aria-hidden className="h-2.5 w-2.5" />
                                  </button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">
                    {u.email ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="font-semibold">Colonne « Formations » :</span>
        <span className="inline-flex items-center gap-1">
          <Link2 className="h-2.5 w-2.5 text-ew-gold-700" /> auto (lien d&apos;invitation)
        </span>
        <span className="text-blue-700">● auto (par rôle)</span>
        <span className="text-ew-green-800">● inscription manuelle</span>
        <span className="italic">— cliquez le ✕ d&apos;une pastille pour désinscrire de ce cours.</span>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {toast ??
            (isSupabaseConfigured()
              ? "Les inscriptions sont enregistrées en ligne (Supabase) et visibles sur tous les appareils."
              : "Les inscriptions sont persistées localement (mode démo).")}
        </p>
        <Button
          onClick={submit}
          disabled={picked.size === 0 || (source === "cohort" && !cohortId)}
          size="sm"
        >
          <Plus className="h-4 w-4" /> Inscrire{" "}
          {picked.size > 0 ? `(${picked.size})` : ""}
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
  const { users: dirUsers } = useDirectoryUsers();
  const [search, setSearch] = React.useState("");

  const rows = React.useMemo(() => {
    const allUsers = dirUsers.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      email: u.email,
    }));
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
  }, [
    dirUsers,
    store.courseEnrollments,
    store.courseCohorts,
    courseId,
    search,
  ]);

  async function unenroll(enrollment: CourseEnrollment | undefined) {
    if (!enrollment) {
      window.alert(
        "Cette inscription provient d'une cohorte ou d'une auto-inscription par rôle. Retirez l'utilisateur de la cohorte (onglet Cohortes) ou modifiez la matrice des rôles.",
      );
      return;
    }
    if (!window.confirm("Désinscrire cet utilisateur du cours ?")) return;
    store.removeEnrollment(enrollment.id);
    // Mode réel : supprime aussi côté serveur, sinon la synchronisation
    // descendante (CourseEnrollmentsSync) la ré-ajouterait au rechargement.
    // On NE scope PAS par année (schoolYear: null) : « désinscrire du cours »
    // retire l'inscription quelle que soit l'année stockée côté serveur (qui
    // peut différer de celle du verdict — DEFAULT/dérive calendaire).
    if (isSupabaseConfigured()) {
      const res = await deleteCourseEnrollment(createClient(), {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        schoolYear: null,
      });
      if (!res.ok) {
        window.alert(`Échec de la désinscription en ligne : ${res.error ?? ""}`);
      } else if (res.deleted === 0) {
        window.alert("Inscription introuvable côté serveur (peut-être déjà retirée).");
      }
    }
  }

  // ---- Édition / téléchargement de la liste des inscrits (composer) ----
  const composerEnrollees = React.useMemo<ComposerEnrollee[]>(
    () =>
      dirUsers
        .map((u) => ({
          u,
          v: getEnrollmentVerdict(u.id, u.role, courseId, store.courseEnrollments, store.courseCohorts),
        }))
        .filter(({ v }) => v.enrolled)
        .map(({ u, v }) => ({
          id: u.id,
          name: u.name,
          email: u.email ?? "",
          globalRole: u.role,
          formationRole: v.enrollment?.formationRole ?? DEFAULT_FORMATION_ROLE,
          source: enrollmentSourceLabel(v.source),
          enrolledAt: v.enrollment
            ? new Date(v.enrollment.enrolledAt).toLocaleDateString("fr-FR")
            : "—",
          expiresAt: v.expiresAt ? new Date(v.expiresAt).toLocaleDateString("fr-FR") : "—",
        })),
    [dirUsers, store.courseEnrollments, store.courseCohorts, courseId],
  );
  const composerApp = useApp();
  const composerCourseTitle = getCourse(courseId)?.title ?? "Cours";
  const composerSchoolYear =
    composerApp.academicYear.label.match(/\d{4}/g)?.join("-") ?? "";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, rôle, email…"
            className="h-9 pl-9"
          />
        </div>
        <EnrolledListComposer
          courseTitle={composerCourseTitle}
          schoolYear={composerSchoolYear}
          enrollees={composerEnrollees}
          triggerLabel="Télécharger / éditer"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-bold">Nom</th>
              <th className="px-3 py-2 text-left font-bold">Rôle global</th>
              <th className="px-3 py-2 text-left font-bold">Rôle formation</th>
              <th className="px-3 py-2 text-left font-bold">Source</th>
              <th className="px-3 py-2 text-left font-bold">Année</th>
              <th className="px-3 py-2 text-left font-bold">Inscrit le</th>
              <th className="px-3 py-2 text-left font-bold">Expire</th>
              <th className="px-3 py-2 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center italic text-muted-foreground"
                >
                  Aucun utilisateur inscrit à ce cours.
                </td>
              </tr>
            ) : (
              rows.map(({ user, verdict }) => (
                <tr key={user.id} className="border-t border-border align-top">
                  <td className="px-3 py-1.5 font-medium text-foreground">
                    {user.name}
                  </td>
                  <td className="px-3 py-1.5">
                    <Badge tone="green">{user.role}</Badge>
                  </td>
                  <td className="px-3 py-1.5">
                    {verdict.enrollment ? (
                      <select
                        value={
                          verdict.enrollment.formationRole ??
                          DEFAULT_FORMATION_ROLE
                        }
                        onChange={(e) => {
                          const enr = verdict.enrollment!;
                          const role = e.target.value as FormationRole;
                          store.setEnrollmentFormationRole(enr.id, role);
                          // Persistance en ligne (mode réel) — RLS ce_update = admin.
                          if (isSupabaseConfigured()) {
                            void updateEnrollmentRole(createClient(), {
                              userId: enr.userId,
                              courseId: enr.courseId,
                              formationRole: role,
                              schoolYear: enr.schoolYear,
                            });
                          }
                        }}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        title="Modifier le rôle de ce participant dans la formation"
                      >
                        {FORMATION_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {FORMATION_ROLE_META[r].label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="text-xs italic text-muted-foreground"
                        title="Inscription par cohorte ou automatique : rôle « étudiant » par défaut. Pour attribuer un autre rôle, créez une inscription nominative."
                      >
                        {FORMATION_ROLE_META[DEFAULT_FORMATION_ROLE].label}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-xs">
                    {enrollmentSourceLabel(verdict.source)}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">
                    {verdict.enrollment?.schoolYear ?? "—"}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">
                    {verdict.enrollment
                      ? new Date(
                          verdict.enrollment.enrolledAt,
                        ).toLocaleDateString("fr-FR")
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
                      <span className="text-xs italic text-muted-foreground">
                        Automatique
                      </span>
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
function CohortsPanel({
  courseId,
  actor,
}: {
  courseId: string;
  actor: string;
}) {
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
    const newCohort: CourseCohort = {
      id: crypto.randomUUID(),
      courseId,
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      createdBy: actor,
      memberUserIds: [],
      createdAt: new Date().toISOString(),
    };
    store.createCohort(newCohort);
    if (isSupabaseConfigured()) void upsertCohort(createClient(), newCohort);
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
  const { users: dirUsers } = useDirectoryUsers();
  const [name, setName] = React.useState(cohort.name);
  const [description, setDescription] = React.useState(
    cohort.description ?? "",
  );
  const [search, setSearch] = React.useState("");

  const members = dirUsers.filter((u) => cohort.memberUserIds.includes(u.id));
  const others = dirUsers.filter((u) => !cohort.memberUserIds.includes(u.id));
  const q = search.trim().toLowerCase();
  const candidates = q
    ? others.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q),
      )
    : others.slice(0, 12);

  // Mirroring en ligne (mode réel) — RLS cc_all = admin. L'id local == id serveur.
  function mirror(updated: CourseCohort) {
    if (isSupabaseConfigured()) void upsertCohort(createClient(), updated);
  }

  function save() {
    const next: CourseCohort = {
      ...cohort,
      name: name.trim() || cohort.name,
      description: description.trim() || undefined,
    };
    store.updateCohort(cohort.id, { name: next.name, description: next.description });
    mirror(next);
    onToggleEdit();
  }

  function remove() {
    if (
      !window.confirm(
        `Supprimer la cohorte « ${cohort.name} » ? Les inscriptions individuelles seront conservées.`,
      )
    )
      return;
    store.removeCohort(cohort.id);
    if (isSupabaseConfigured()) void deleteCohort(createClient(), cohort.id);
  }

  function addMember(uid: string) {
    const next: CourseCohort = { ...cohort, memberUserIds: [...cohort.memberUserIds, uid] };
    store.updateCohortMembers(cohort.id, next.memberUserIds);
    mirror(next);
  }

  function removeMember(uid: string) {
    const next: CourseCohort = {
      ...cohort,
      memberUserIds: cohort.memberUserIds.filter((id) => id !== uid),
    };
    store.updateCohortMembers(cohort.id, next.memberUserIds);
    mirror(next);
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {editing ? (
          <div className="flex-1 space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 font-bold"
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (facultatif)"
              className="h-9 text-sm"
            />
          </div>
        ) : (
          <div>
            <p className="font-display text-base font-bold text-foreground">
              {cohort.name}
            </p>
            {cohort.description ? (
              <p className="text-xs italic text-muted-foreground">
                {cohort.description}
              </p>
            ) : null}
            <p className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Calendar aria-hidden className="h-3 w-3" />
              Créée le {new Date(cohort.createdAt).toLocaleDateString(
                "fr-FR",
              )}{" "}
              par {cohort.createdBy} ·{" "}
              <strong className="text-ew-green-800">
                {cohort.memberUserIds.length} membres
              </strong>
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
            <p className="mt-2 text-xs italic text-muted-foreground">
              Aucun membre.
            </p>
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
          <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
            Ajouter un membre
          </p>
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
            <p className="mt-2 text-xs italic text-muted-foreground">
              Aucun utilisateur disponible.
            </p>
          ) : (
            <ul className="mt-2 max-h-[200px] space-y-1 overflow-y-auto">
              {candidates.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
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
  const modules = React.useMemo(
    () => getCourseModuleList(courseId),
    [courseId],
  );

  if (modules.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background/60 p-5 text-center text-sm italic text-muted-foreground">
        Ce cours n&apos;est pas structuré en modules indépendants. Les
        conditions d&apos;accès s&apos;appliquent aux cours modulaires
        (Magnifica Humanitas).
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
          Pour chaque module, vous pouvez exiger qu&apos;un ou plusieurs autres
          modules soient <strong>terminés</strong> avant que les apprenants ne
          puissent y accéder. La complétion peut être{" "}
          <strong>validée manuellement</strong> par l&apos;apprenant,
          <strong> automatique</strong> à la lecture, ou exiger un{" "}
          <strong>score minimum à un quiz</strong>.
        </p>
        <p className="mt-1 text-muted-foreground italic">
          Par défaut, tous les modules sont accessibles librement (aucun
          prérequis, validation manuelle). L&apos;administrateur passe toujours,
          quel que soit l&apos;état d&apos;avancement.
        </p>
      </div>

      <div className="space-y-2">
        {modules.map((m) => (
          <AccessRuleCard
            key={m.id}
            courseId={courseId}
            module={m}
            modules={modules}
          />
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
  const [prereq, setPrereq] = React.useState<string[]>(
    current.prerequisiteModuleIds,
  );
  const [mode, setMode] = React.useState<typeof current.completionMode>(
    current.completionMode,
  );
  const [minScore, setMinScore] = React.useState<number>(
    current.minQuizScore ?? 70,
  );
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  // Resynchronise les champs locaux avec la règle ENREGISTRÉE uniquement
  // quand son CONTENU change (ou au changement de module). `getAccessRule`
  // renvoie un objet par défaut recréé à chaque rendu (nouveau tableau vide) :
  // dépendre de la référence du tableau relançait l'effet à chaque rendu et
  // écrasait la saisie en cours (les cases « ne réagissaient pas »). On dépend
  // donc d'une clé stable (contenu sérialisé).
  const savedPrereqKey = current.prerequisiteModuleIds.join(",");
  React.useEffect(() => {
    setPrereq(current.prerequisiteModuleIds);
    setMode(current.completionMode);
    setMinScore(current.minQuizScore ?? 70);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    courseId,
    module.id,
    savedPrereqKey,
    current.completionMode,
    current.minQuizScore,
  ]);

  function togglePrereq(id: string) {
    setPrereq((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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
          <p className="font-display text-base font-bold text-foreground">
            {module.title}
          </p>
          {module.displayTitle ? (
            <p className="text-xs italic text-muted-foreground">
              {module.displayTitle}
            </p>
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
                      {other.displayTitle ??
                        other.title.replace(/^Module \d+ — /, "")}
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
                  setMinScore(
                    Math.max(0, Math.min(100, Number(e.target.value))),
                  )
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
function CsvImportZone({
  courseId,
  actor,
}: {
  courseId: string;
  actor: string;
}) {
  const store = useStore();
  const { users: dirUsers } = useDirectoryUsers();
  const [drafts, setDrafts] = React.useState<CohortDraft[] | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parseErrors, setParseErrors] = React.useState<
    { lineNumber: number; message: string }[]
  >([]);
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
        const user = dirUsers.find(
          (u) =>
            (u.email ?? "").trim().toLowerCase() === email.trim().toLowerCase(),
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
  }, [drafts, dirUsers, store.courseCohorts, courseId]);

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
    const blob = new Blob([COHORT_CSV_TEMPLATE], {
      type: "text/csv;charset=utf-8",
    });
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
    const sb = isSupabaseConfigured() ? createClient() : null;
    let createdCohorts = 0;
    let mergedCohorts = 0;
    let addedMembers = 0;
    for (const item of drafted) {
      if (item.existing) {
        // Cohorte existante : ajouter les nouveaux membres (déduplication).
        const next = Array.from(
          new Set([...item.existing.memberUserIds, ...item.matchedIds]),
        );
        const delta = next.length - item.existing.memberUserIds.length;
        if (delta > 0) {
          store.updateCohortMembers(item.existing.id, next);
          if (sb) void upsertCohort(sb, { ...item.existing, memberUserIds: next });
          addedMembers += delta;
          mergedCohorts++;
        }
      } else {
        // Création d'une nouvelle cohorte avec les membres trouvés.
        const newCohort: CourseCohort = {
          id: crypto.randomUUID(),
          courseId,
          name: item.draft.name,
          description: item.draft.description || undefined,
          createdBy: actor,
          memberUserIds: item.matchedIds,
          createdAt: new Date().toISOString(),
        };
        store.createCohort(newCohort);
        if (sb) void upsertCohort(sb, newCohort);
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
              <Download aria-hidden className="h-3.5 w-3.5" /> Télécharger le
              modèle CSV
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
        {toast ? (
          <p className="mt-2 text-xs text-destructive">{toast}</p>
        ) : null}
      </div>
    );
  }

  // Vue aperçu : récapitule ce qui sera créé / fusionné / ignoré.
  const totalCohorts = drafted?.length ?? 0;
  const totalMatched =
    drafted?.reduce((acc, d) => acc + d.matchedIds.length, 0) ?? 0;
  const totalUnknown =
    drafted?.reduce((acc, d) => acc + d.unknownEmails.length, 0) ?? 0;

  return (
    <div className="rounded-lg border border-ew-green-300 bg-ew-green-50/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <FileSpreadsheet aria-hidden className="h-4 w-4" /> Aperçu de
          l&apos;import
          {fileName ? (
            <span className="font-normal text-muted-foreground">
              — {fileName}
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={reset}>
            Annuler
          </Button>
          <Button size="sm" onClick={importAll}>
            <Plus className="h-4 w-4" /> Importer {totalCohorts} cohorte
            {totalCohorts > 1 ? "s" : ""}
          </Button>
        </div>
      </div>

      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
        <span className="rounded-md border border-ew-green-200 bg-card px-2 py-1">
          <strong className="text-ew-green-800">{totalCohorts}</strong>{" "}
          cohorte(s) trouvée(s)
        </span>
        <span className="rounded-md border border-ew-green-200 bg-card px-2 py-1">
          <strong className="text-ew-green-800">{totalMatched}</strong>{" "}
          membre(s) reconnu(s)
        </span>
        <span
          className={cn(
            "rounded-md border bg-card px-2 py-1",
            totalUnknown > 0
              ? "border-ew-gold-500 text-ew-gold-700"
              : "border-border",
          )}
        >
          <strong>{totalUnknown}</strong> email(s) non trouvé(s)
        </span>
      </div>

      <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto">
        {drafted?.map((item, i) => (
          <article
            key={i}
            className="rounded-md border border-border bg-card p-2.5"
          >
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
                {item.unknownEmails.length > 0
                  ? `, ${item.unknownEmails.length} email(s) inconnu(s)`
                  : null}
              </p>
            </div>
            {item.draft.description ? (
              <p className="mt-0.5 text-xs italic text-muted-foreground">
                {item.draft.description}
              </p>
            ) : null}
            {item.unknownEmails.length > 0 ? (
              <div className="mt-1.5 rounded border border-ew-gold-200 bg-ew-gold-50 px-2 py-1 text-[11px]">
                <p className="flex items-center gap-1 font-bold text-ew-gold-700">
                  <AlertTriangle aria-hidden className="h-3 w-3" /> Emails non
                  trouvés dans l&apos;annuaire — ignorés
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
            <AlertTriangle aria-hidden className="h-3.5 w-3.5" /> Lignes
            ignorées ({parseErrors.length})
          </p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-destructive">
            {parseErrors.slice(0, 6).map((e, i) => (
              <li key={i}>
                Ligne {e.lineNumber} : {e.message}
              </li>
            ))}
            {parseErrors.length > 6 ? (
              <li className="italic">
                … et {parseErrors.length - 6} autre(s) erreur(s).
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================================
   ONGLET 5 — RÈGLE DE RÉUSSITE DU COURS
   ========================================================================== */
function CompletionRulePanel({ courseId }: { courseId: string }) {
  const store = useStore();
  const modules = React.useMemo(
    () => getCourseModuleList(courseId),
    [courseId],
  );
  const current = getCourseCompletionRule(
    courseId,
    store.courseCompletionRules,
  );

  const [mode, setMode] = React.useState<typeof current.mode>(current.mode);
  const [minScore, setMinScore] = React.useState<number>(
    current.minQuizScore ?? 70,
  );
  const [quizModuleId, setQuizModuleId] = React.useState<string>(
    current.quizModuleId ?? SUMMATIVE_QUIZ_ID,
  );
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    setMode(current.mode);
    setMinScore(current.minQuizScore ?? 70);
    setQuizModuleId(current.quizModuleId ?? SUMMATIVE_QUIZ_ID);
  }, [current.mode, current.minQuizScore, current.quizModuleId]);

  if (modules.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background/60 p-5 text-center text-sm italic text-muted-foreground">
        Ce cours n&apos;est pas structuré en modules. Pour l&apos;instant, la
        configuration de la réussite s&apos;applique aux cours modulaires
        (Magnifica Humanitas).
      </div>
    );
  }

  function save() {
    const usesQuiz = mode === "quiz-score" || mode === "all-modules-and-quiz";
    store.setCourseCompletionRule({
      courseId,
      mode,
      minQuizScore: usesQuiz ? minScore : undefined,
      quizModuleId: usesQuiz ? quizModuleId : undefined,
    });
    setSavedAt(Date.now());
  }

  function reset() {
    store.clearCourseCompletionRule(courseId);
  }

  const usesQuiz = mode === "quiz-score" || mode === "all-modules-and-quiz";
  const hasChanges =
    mode !== current.mode ||
    (usesQuiz && (current.minQuizScore ?? 70) !== minScore) ||
    (usesQuiz && (current.quizModuleId ?? SUMMATIVE_QUIZ_ID) !== quizModuleId);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-ew-green-200 bg-ew-green-50/40 p-3 text-xs">
        <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-ew-green-700">
          <Trophy aria-hidden className="h-3.5 w-3.5" /> Réussite de la
          formation
        </p>
        <p className="mt-1 text-foreground/90">
          La règle ci-dessous détermine à quel moment un participant a{" "}
          <strong>achevé la formation avec succès</strong>. Tant que le critère
          n&apos;est pas rempli :
          <span className="ml-1 inline-flex items-center gap-1 rounded-md bg-card px-1.5 py-0.5 font-bold text-ew-gold-700 border border-ew-gold-200">
            Livret PDF
          </span>{" "}
          et{" "}
          <span className="inline-flex items-center gap-1 rounded-md bg-card px-1.5 py-0.5 font-bold text-ew-gold-700 border border-ew-gold-200">
            Délivrance du certificat
          </span>{" "}
          restent verrouillés pour le participant.
        </p>
        <p className="mt-1 text-muted-foreground italic">
          Par défaut : tous les modules complétés. L&apos;administrateur garde
          toujours un accès complet, quel que soit l&apos;état
          d&apos;avancement.
        </p>
      </div>

      <article className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ew-green-700">
              Cours sélectionné
            </p>
            <p className="font-display text-base font-bold text-foreground">
              Règle de réussite
            </p>
            <p className="text-xs italic text-muted-foreground">
              {completionRuleModeLabel(mode)}
              {usesQuiz ? ` · Score minimum ${minScore}%` : null}
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
              Critère de réussite
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
              className="mt-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all-modules">
                Tous les modules complétés (par défaut)
              </option>
              <option value="quiz-score">Quiz avec score minimum</option>
              <option value="all-modules-and-quiz">
                Tous les modules + quiz
              </option>
              <option value="manual-admin">
                Validation manuelle de l&apos;administrateur
              </option>
            </select>
          </div>
          {usesQuiz ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Quiz comptant pour la réussite
                </label>
                <select
                  value={quizModuleId}
                  onChange={(e) => setQuizModuleId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value={SUMMATIVE_QUIZ_ID}>
                    Quiz sommatif global du séminaire
                  </option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      Quiz du module {m.num} — {m.displayTitle ?? m.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Score minimum (%)
                </label>
                <input
                  type="number"
                  value={minScore}
                  onChange={(e) =>
                    setMinScore(
                      Math.max(0, Math.min(100, Number(e.target.value))),
                    )
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          ) : null}
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
            {mode !== "all-modules" ? (
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

      <CertificateConfigCard courseId={courseId} />
    </div>
  );
}

/* ---- Configuration du CERTIFICAT (formateur, date, signataire) ---- */
function CertificateConfigCard({ courseId }: { courseId: string }) {
  const store = useStore();
  const current = getCertificateConfig(courseId, store.certificateConfigs);

  const [trainerName, setTrainerName] = React.useState(
    current.trainerName ?? "",
  );
  const [dateMode, setDateMode] = React.useState<CertificateDateMode>(
    current.dateMode ?? "download",
  );
  const [endDate, setEndDate] = React.useState(current.endDate ?? "");
  const [customDate, setCustomDate] = React.useState(current.customDate ?? "");
  const [dgName, setDgName] = React.useState(current.dgName ?? "");
  const [dgFunction, setDgFunction] = React.useState(
    current.dgFunction ?? "Directeur Général",
  );
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  // Resync sur le contenu enregistré (clé stable), pas sur l'objet par défaut.
  const savedKey = `${current.trainerName ?? ""}|${current.dateMode ?? ""}|${current.endDate ?? ""}|${current.customDate ?? ""}|${current.dgName ?? ""}|${current.dgFunction ?? ""}`;
  React.useEffect(() => {
    setTrainerName(current.trainerName ?? "");
    setDateMode(current.dateMode ?? "download");
    setEndDate(current.endDate ?? "");
    setCustomDate(current.customDate ?? "");
    setDgName(current.dgName ?? "");
    setDgFunction(current.dgFunction ?? "Directeur Général");
    setSavedAt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, savedKey]);

  function save() {
    store.setCertificateConfig({
      courseId,
      trainerName: trainerName.trim() || undefined,
      dateMode,
      endDate: dateMode === "end" ? endDate.trim() || undefined : undefined,
      customDate:
        dateMode === "custom" ? customDate.trim() || undefined : undefined,
      dgName: dgName.trim() || undefined,
      dgFunction: dgFunction.trim() || undefined,
      updatedAt: Date.now(),
    });
    setSavedAt(Date.now());
  }

  // Détection « modifié depuis le dernier enregistrement » : tant que le
  // formulaire correspond à la config enregistrée, le bouton est désactivé.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const dirty =
    trainerName.trim() !== (current.trainerName ?? "") ||
    dateMode !== (current.dateMode ?? "download") ||
    (dateMode === "end" ? endDate.trim() : "") !==
      (current.dateMode === "end" ? current.endDate ?? "" : "") ||
    (dateMode === "custom" ? customDate.trim() : "") !==
      (current.dateMode === "custom" ? current.customDate ?? "" : "") ||
    dgName.trim() !== (current.dgName ?? "") ||
    dgFunction.trim() !== (current.dgFunction ?? "Directeur Général");
  const lastSaved = savedAt ?? current.updatedAt ?? null;

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ew-green-700">
        <Award aria-hidden className="h-3.5 w-3.5" /> Certificat
        d&apos;achèvement
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Formateur et date imprimés sur le certificat de ce cours. La signature
        et le cachet proviennent de l&apos;onglet « Identité visuelle ». Le
        numéro est généré automatiquement, unique par participant.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Formateur (Prénoms NOM)
          </label>
          <Input
            value={trainerName}
            onChange={(e) => setTrainerName(e.target.value)}
            placeholder="Ex. Jean KOUASSI"
            className="mt-1 h-9"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Date imprimée
          </label>
          <select
            value={dateMode}
            onChange={(e) => setDateMode(e.target.value as CertificateDateMode)}
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
          >
            {(["download", "end", "custom"] as CertificateDateMode[]).map(
              (m) => (
                <option key={m} value={m}>
                  {CERT_DATE_MODE_LABEL[m]}
                </option>
              ),
            )}
          </select>
        </div>
        {dateMode === "end" ? (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Date de fin (JJ/MM/AAAA)
            </label>
            <Input
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="30/06/2026"
              className="mt-1 h-9"
            />
          </div>
        ) : dateMode === "custom" ? (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Date personnalisée
            </label>
            <Input
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              placeholder="20 juin 2026"
              className="mt-1 h-9"
            />
          </div>
        ) : (
          <div />
        )}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Signataire central
          </label>
          <Input
            value={dgName}
            onChange={(e) => setDgName(e.target.value)}
            placeholder="Ex. Elogne ZORO"
            className="mt-1 h-9"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Fonction du signataire
          </label>
          <Input
            value={dgFunction}
            onChange={(e) => setDgFunction(e.target.value)}
            placeholder="Directeur Général"
            className="mt-1 h-9"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        {dirty ? (
          <span className="text-xs italic text-muted-foreground">
            Modifications non enregistrées
          </span>
        ) : mounted && lastSaved ? (
          <span className="text-xs text-ew-green-700">
            ✓ Enregistré le {new Date(lastSaved).toLocaleDateString("fr-FR")} à{" "}
            {new Date(lastSaved).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ) : null}
        <Button size="sm" onClick={save} disabled={!dirty}>
          <Save className="h-4 w-4" /> Enregistrer le certificat
        </Button>
      </div>
    </article>
  );
}

/* ============================================================================
   ONGLET — SUPPORTS TÉLÉCHARGEABLES (accès conditionné par support)
   ========================================================================== */
function SupportAccessPanel({ courseId }: { courseId: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-ew-green-200 bg-ew-green-50/40 p-3 text-xs">
        <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-ew-green-700">
          <Download aria-hidden className="h-3.5 w-3.5" /> Accès aux supports
          téléchargeables
        </p>
        <p className="mt-1 text-foreground/90">
          Définissez, pour chaque support de ce cours, la condition
          d&apos;accès. Tant qu&apos;elle n&apos;est pas remplie, le bouton de
          téléchargement est <strong>désactivé</strong> côté apprenant (avec
          l&apos;explication). L&apos;administrateur garde toujours
          l&apos;accès.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {SUPPORT_KINDS.map((support) => (
          <SupportRuleEditor
            key={support}
            courseId={courseId}
            support={support}
          />
        ))}
      </div>
    </div>
  );
}

function SupportRuleEditor({
  courseId,
  support,
}: {
  courseId: string;
  support: SupportKind;
}) {
  const store = useStore();
  const current = getSupportCondition(
    courseId,
    support,
    store.supportAccessRules,
  );

  const [mode, setMode] = React.useState<SupportAccessMode>(current.mode);
  const [roles, setRoles] = React.useState<FormationRole[]>(
    current.mode === "roles" ? current.roles : ["enseignant", "tuteur"],
  );
  const [date, setDate] = React.useState<string>(
    current.mode === "after-date" ? current.date : "",
  );
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    setMode(current.mode);
    if (current.mode === "roles") setRoles(current.roles);
    if (current.mode === "after-date") setDate(current.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, support]);

  function buildCondition(): SupportAccessCondition | null {
    switch (mode) {
      case "open":
        return { mode: "open" };
      case "on-completion":
        return { mode: "on-completion" };
      case "roles":
        return roles.length > 0 ? { mode: "roles", roles } : null;
      case "after-date":
        return date ? { mode: "after-date", date } : null;
    }
  }

  function save() {
    const condition = buildCondition();
    if (!condition) return;
    store.setSupportAccessRule({ courseId, support, condition });
    setSavedAt(Date.now());
    window.setTimeout(() => setSavedAt(null), 2500);
  }

  function reset() {
    store.clearSupportAccessRule(courseId, support);
    setMode("open");
  }

  const invalid =
    (mode === "roles" && roles.length === 0) ||
    (mode === "after-date" && !date);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-display text-sm font-bold text-ew-green-800">
        {SUPPORT_KIND_LABEL[support]}
      </p>
      <p className="mt-0.5 text-[11px] italic text-muted-foreground">
        Actuel : {describeCondition(current)}
      </p>

      <label className="mt-3 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        Condition d&apos;accès
      </label>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as SupportAccessMode)}
        className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
      >
        {(Object.keys(SUPPORT_MODE_LABEL) as SupportAccessMode[]).map((m) => (
          <option key={m} value={m}>
            {SUPPORT_MODE_LABEL[m]}
          </option>
        ))}
      </select>

      {mode === "roles" ? (
        <div className="mt-2 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Rôles autorisés
          </p>
          {FORMATION_ROLES.map((r) => (
            <label key={r} className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={roles.includes(r)}
                onChange={() =>
                  setRoles((prev) =>
                    prev.includes(r)
                      ? prev.filter((x) => x !== r)
                      : [...prev, r],
                  )
                }
                className="h-3.5 w-3.5 accent-ew-green-700"
              />
              {FORMATION_ROLE_META[r].label}
            </label>
          ))}
        </div>
      ) : null}

      {mode === "after-date" ? (
        <div className="mt-2">
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Disponible à partir du
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          />
        </div>
      ) : null}

      {mode === "on-completion" ? (
        <p className="mt-2 rounded-md border border-ew-gold-200 bg-ew-gold-50 px-2 py-1 text-[11px] text-ew-gold-700">
          La réussite est déterminée par l&apos;onglet « Réussite du cours ».
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" onClick={save} disabled={invalid}>
          Enregistrer
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          Réinitialiser
        </Button>
        {savedAt ? (
          <span className="text-[11px] font-bold text-ew-green-700">
            ✓ Enregistré
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ============================================================================
   ONGLET 6 — IDENTITÉ VISUELLE (cachet & signature pour les attestations)
   ========================================================================== */
function IdentityPanel() {
  const [stamp, setStamp] = React.useState<string | null>(null);
  const [signature, setSignature] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [initialStamp, setInitialStamp] = React.useState<string | null>(null);
  const [initialSignature, setInitialSignature] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    const cfg = loadEtabConfig();
    setStamp(cfg.stamp ?? null);
    setSignature(cfg.signature ?? null);
    setInitialStamp(cfg.stamp ?? null);
    setInitialSignature(cfg.signature ?? null);
  }, []);

  function save() {
    if (typeof window === "undefined") return;
    try {
      const existing = loadEtabConfig();
      const next = { ...existing, stamp, signature };
      localStorage.setItem(ETAB_CONFIG_KEY, JSON.stringify(next));
      setInitialStamp(stamp);
      setInitialSignature(signature);
      setSavedAt(Date.now());
    } catch {
      /* ignore quota errors */
    }
  }

  const hasChanges = stamp !== initialStamp || signature !== initialSignature;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-ew-green-200 bg-ew-green-50/40 p-3 text-xs">
        <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-ew-green-700">
          <Stamp aria-hidden className="h-3.5 w-3.5" /> Cachet et signature
        </p>
        <p className="mt-1 text-foreground/90">
          Téléversez l&apos;empreinte du cachet officiel et la signature
          numérisée du responsable. Ces éléments sont automatiquement intégrés
          aux <strong>certificats de fin de formation</strong> et aux exports
          Word de l&apos;administrateur.
        </p>
        <p className="mt-1 text-muted-foreground italic">
          Le logo est déjà géré au niveau de la plateforme. Les autres réglages
          institutionnels (chef d&apos;établissement, ministère, armoiries)
          restent dans{" "}
          <a
            href="/parametrage/configuration#documents"
            className="font-bold text-ew-green-700 underline"
          >
            Paramétrage &gt; Configuration
          </a>
          .
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageDrop
            label="Cachet"
            value={stamp}
            onChange={setStamp}
            icon={Stamp}
          />
          <ImageDrop
            label="Signature"
            value={signature}
            onChange={setSignature}
            icon={PenLine}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {savedAt && !hasChanges ? (
              <span className="text-ew-green-700">
                ✓ Cachet et signature enregistrés à{" "}
                {new Date(savedAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : hasChanges ? (
              <span className="italic">Modifications non enregistrées.</span>
            ) : (
              <span className="italic">
                Glissez les images aux emplacements ci-dessus, ou cliquez pour
                ouvrir le sélecteur de fichier.
              </span>
            )}
          </p>
          <Button size="sm" onClick={save} disabled={!hasChanges}>
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ONGLET 7 — OUVERTURE / FERMETURE DU COURS (fenêtre date + heure + minutes)
   ========================================================================== */
function CourseSchedulePanel({ courseId }: { courseId: string }) {
  const store = useStore();
  const course = getCourse(courseId);
  const current = getCourseSchedule(courseId, store.courseScheduleRules);

  const [opensAt, setOpensAt] = React.useState<string>("");
  const [closesAt, setClosesAt] = React.useState<string>("");
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  // Réinitialise le retour visuel « enregistré » au changement de cours.
  React.useEffect(() => {
    setSavedAt(null);
  }, [courseId]);
  // Resynchronise les champs avec la règle enregistrée (changement de cours ou
  // mise à jour ailleurs), sans écraser une saisie locale en cours puisque la
  // dépendance porte sur les valeurs primitives du store.
  const savedOpensAt = current?.opensAt ?? "";
  const savedClosesAt = current?.closesAt ?? "";
  React.useEffect(() => {
    setOpensAt(savedOpensAt);
    setClosesAt(savedClosesAt);
  }, [courseId, savedOpensAt, savedClosesAt]);

  const dirty =
    (current?.opensAt ?? "") !== opensAt ||
    (current?.closesAt ?? "") !== closesAt;
  const hasAny = opensAt !== "" || closesAt !== "";

  // Aperçu de l'état au moment présent, à partir des valeurs saisies.
  const previewRule = hasAny
    ? {
        id: "preview",
        courseId,
        opensAt: opensAt || null,
        closesAt: closesAt || null,
      }
    : null;
  const verdict = evaluateCourseSchedule(previewRule);
  const inverted = isScheduleInverted(previewRule);

  function save() {
    if (!hasAny) {
      store.clearCourseScheduleRule(courseId);
    } else {
      store.setCourseScheduleRule({
        courseId,
        opensAt: opensAt || null,
        closesAt: closesAt || null,
      });
    }
    setSavedAt(Date.now());
  }

  function clearAll() {
    setOpensAt("");
    setClosesAt("");
    store.clearCourseScheduleRule(courseId);
    setSavedAt(Date.now());
  }

  const stateLabel: Record<string, string> = {
    unscheduled: "Accessible en permanence",
    before: "Pas encore ouvert",
    open: "Ouvert actuellement",
    after: "Clôturé",
  };
  const stateTone: Record<string, string> = {
    unscheduled: "text-muted-foreground",
    before: "text-ew-green-700",
    open: "text-ew-green-700",
    after: "text-ew-gold-700",
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-ew-green-200 bg-ew-green-50/40 p-3 text-xs">
        <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-ew-green-700">
          <CalendarClock aria-hidden className="h-3.5 w-3.5" /> Fenêtre
          d&apos;accès au cours
        </p>
        <p className="mt-1 text-foreground/90">
          Définissez la date et l&apos;heure (à la minute près) d&apos;
          <strong>ouverture</strong> et de <strong>fermeture</strong> du cours{" "}
          <strong>« {course?.shortTitle ?? courseId} »</strong>. En dehors de la
          fenêtre, même les participants inscrits voient un écran « cours non
          encore ouvert » ou « cours clôturé ». Laissez un champ vide pour ne
          pas fixer cette borne. Les administrateurs gardent toujours
          l&apos;accès.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Ouverture (date, heure et minutes)
            </label>
            <input
              type="datetime-local"
              value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)}
              className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
            />
            {opensAt ? (
              <button
                type="button"
                onClick={() => setOpensAt("")}
                className="mt-1 text-[11px] text-muted-foreground underline hover:text-foreground"
              >
                Effacer l&apos;ouverture
              </button>
            ) : null}
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Fermeture (date, heure et minutes)
            </label>
            <input
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
            />
            {closesAt ? (
              <button
                type="button"
                onClick={() => setClosesAt("")}
                className="mt-1 text-[11px] text-muted-foreground underline hover:text-foreground"
              >
                Effacer la fermeture
              </button>
            ) : null}
          </div>
        </div>

        {inverted ? (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-ew-gold-200 bg-ew-gold-50/60 px-3 py-2 text-xs text-ew-gold-700">
            <AlertTriangle aria-hidden className="h-4 w-4" /> La date de
            fermeture précède (ou égale) la date d&apos;ouverture : le cours ne
            sera jamais accessible.
          </p>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-border bg-background/60 px-3 py-2 text-xs">
            <p>
              <span className="font-bold uppercase tracking-wide text-muted-foreground">
                État actuel :{" "}
              </span>
              <span className={cn("font-bold", stateTone[verdict.state])}>
                {stateLabel[verdict.state]}
              </span>
            </p>
            <p className="mt-0.5 text-muted-foreground">
              {describeSchedule(previewRule)}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {savedAt && !dirty ? (
              <span className="text-ew-green-700">
                ✓ Fenêtre enregistrée à{" "}
                {new Date(savedAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : dirty ? (
              <span className="italic">Modifications non enregistrées.</span>
            ) : (
              <span className="italic">
                Aucune restriction tant qu&apos;aucune borne n&apos;est fixée.
              </span>
            )}
          </p>
          <div className="flex gap-2">
            {current ? (
              <Button size="sm" variant="outline" onClick={clearAll}>
                <Trash2 className="h-4 w-4" /> Retirer la fenêtre
              </Button>
            ) : null}
            <Button
              size="sm"
              onClick={save}
              disabled={!dirty || inverted}
              title={
                inverted
                  ? "Corrigez la fenêtre : la fermeture doit suivre l'ouverture."
                  : undefined
              }
            >
              <Save className="h-4 w-4" /> Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ONGLET 8 — LIENS D'INSCRIPTION (création de compte → inscription auto)
   ========================================================================== */
function EnrollmentLinksPanel({ actor }: { actor: string }) {
  const store = useStore();
  const courses = React.useMemo(() => sortedCourses(), []);

  const [picked, setPicked] = React.useState<Set<string>>(new Set());
  const [role, setRole] = React.useState<FormationRole>(DEFAULT_FORMATION_ROLE);
  const [label, setLabel] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");
  // Lien « payant » : l'invité règle les cours payants à l'accès. Sinon
  // « offert » : inscription gratuite même pour un cours tarifé.
  const [paid, setPaid] = React.useState(false);

  const [origin, setOrigin] = React.useState("");
  React.useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  // Au moins un cours sélectionné est-il tarifé ? (le mode payant n'a de sens
  // que dans ce cas).
  const anyPaidPicked = courses.some(
    (c) => picked.has(c.id) && isCoursePaid(c.id, store.coursePrices),
  );

  function toggle(courseId: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  }

  function create() {
    const courseIds = courses.map((c) => c.id).filter((id) => picked.has(id));
    if (courseIds.length === 0) return;
    const makePaid = paid && anyPaidPicked;
    const token = encodeInviteToken({
      v: 1,
      c: courseIds,
      r: role !== DEFAULT_FORMATION_ROLE ? role : undefined,
      e: expiresAt ? new Date(expiresAt).toISOString() : null,
      p: makePaid ? 1 : undefined,
      n: makeInviteNonce(),
    });
    store.createEnrollmentInvite({
      token,
      courseIds,
      formationRole: role,
      label: label.trim() || undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      paid: makePaid,
      createdBy: actor,
    });
    setPicked(new Set());
    setLabel("");
    setExpiresAt("");
    setRole(DEFAULT_FORMATION_ROLE);
    setPaid(false);
  }

  const links = store.enrollmentInviteLinks;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-ew-green-200 bg-ew-green-50/40 p-3 text-xs">
        <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-ew-green-700">
          <Ticket aria-hidden className="h-3.5 w-3.5" /> Lien d&apos;inscription
          par création de compte
        </p>
        <p className="mt-1 text-foreground/90">
          Générez un lien à diffuser : toute personne qui{" "}
          <strong>crée son compte</strong> via ce lien est automatiquement
          inscrite aux cours choisis, avec le rôle indiqué. L&apos;inscription
          est appliquée dès sa première connexion.
        </p>
        <p className="mt-1 text-muted-foreground italic">
          Le lien est auto-porteur (il fonctionne sur n&apos;importe quel
          navigateur). Le seul contrôle opposable est la{" "}
          <strong>date d&apos;expiration</strong> ; « Supprimer » retire le lien
          de cette liste mais n&apos;invalide pas un lien déjà diffusé.
        </p>
      </div>

      {/* Générateur */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Cours inclus dans le lien
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {courses.map((c) => (
              <label
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors",
                  picked.has(c.id)
                    ? "border-ew-green-300 bg-ew-green-50/50"
                    : "border-border bg-background hover:bg-muted/40",
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-ew-green-700"
                  checked={picked.has(c.id)}
                  onChange={() => toggle(c.id)}
                />
                <span className="font-medium text-foreground">
                  {c.shortTitle}
                </span>
                {isCoursePaid(c.id, store.coursePrices) ? (
                  <span className="ml-auto rounded-full bg-ew-gold-100 px-2 py-0.5 text-[10px] font-bold text-ew-gold-700">
                    {formatFcfa(coursePriceFcfa(c.id, store.coursePrices))}
                  </span>
                ) : (
                  <span className="ml-auto text-[10px] uppercase text-muted-foreground">
                    gratuit
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Mode offert / payant (utile seulement si un cours tarifé est choisi) */}
        <div
          className={cn(
            "rounded-xl border p-3",
            anyPaidPicked
              ? "border-ew-gold-200 bg-ew-gold-50/40"
              : "border-border bg-muted/20",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Mode d&apos;inscription
              </p>
              <p className="text-xs text-foreground/90">
                {anyPaidPicked
                  ? paid
                    ? "Payant : l'invité réglera les cours tarifés à l'accès."
                    : "Offert : inscription gratuite, même pour les cours tarifés (prise en charge)."
                  : "Aucun cours tarifé sélectionné : l'inscription est offerte."}
              </p>
            </div>
            <label
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 text-sm font-semibold",
                !anyPaidPicked && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                type="checkbox"
                className={cn(
                  "h-4 w-4",
                  anyPaidPicked ? "accent-ew-gold-600" : "opacity-50 grayscale",
                )}
                checked={paid && anyPaidPicked}
                disabled={!anyPaidPicked}
                onChange={(e) => setPaid(e.target.checked)}
              />
              Lien payant
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Rôle de formation
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as FormationRole)}
              className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
            >
              {FORMATION_ROLES.map((r) => (
                <option key={r} value={r}>
                  {FORMATION_ROLE_META[r].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Expiration (facultative)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Libellé interne (facultatif)
            </label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Cohorte CAFOP — sept. 2026"
              className="mt-1 h-9"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button size="sm" onClick={create} disabled={picked.size === 0}>
            <Link2 className="h-4 w-4" /> Générer le lien
          </Button>
        </div>
      </div>

      {/* Liste des liens existants */}
      <div className="space-y-2">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          Liens générés ({links.length})
        </p>
        {links.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-background/60 p-4 text-center text-sm text-muted-foreground">
            Aucun lien pour le moment. Sélectionnez des cours puis « Générer le
            lien ».
          </p>
        ) : (
          <ul className="space-y-2">
            {links.map((link) => (
              <InviteLinkRow
                key={link.id}
                link={link}
                origin={origin}
                onRemove={() => store.removeEnrollmentInvite(link.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function InviteLinkRow({
  link,
  origin,
  onRemove,
}: {
  link: EnrollmentInviteLink;
  origin: string;
  onRemove: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const [shortUrl, setShortUrl] = React.useState<string | null>(null);
  const [shortBusy, setShortBusy] = React.useState(false);
  const [shortCopied, setShortCopied] = React.useState(false);
  const canShorten = isSupabaseConfigured();
  const url = origin ? buildInviteUrl(origin, link.token) : "";
  const status = payloadStatus({
    v: 1,
    c: link.courseIds,
    r: link.formationRole,
    e: link.expiresAt ?? null,
    n: "",
  });
  const courseTitles = link.courseIds
    .map((id) => getCourse(id)?.shortTitle ?? id)
    .join(", ");

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponible */
    }
  }

  // Crée (au 1er clic) puis copie un lien COURT de premier domaine
  // (planning.eduweb.ci/i/<code>) — anti-hameçonnage. Réservé au mode réel.
  async function copyShort() {
    if (!origin) return;
    setShortBusy(true);
    try {
      let su = shortUrl;
      if (!su) {
        const code = await createShortInviteLink(
          createClient(),
          link.token,
          link.label,
        );
        if (!code) {
          window.alert(
            "Lien court indisponible : appliquez la migration 009 et réessayez (action réservée à l'administrateur).",
          );
          return;
        }
        su = shortInviteUrl(origin, code);
        setShortUrl(su);
      }
      await navigator.clipboard.writeText(su);
      setShortCopied(true);
      window.setTimeout(() => setShortCopied(false), 1800);
    } catch {
      /* clipboard indisponible */
    } finally {
      setShortBusy(false);
    }
  }

  return (
    <li className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-sm font-bold text-foreground">
            {link.label || courseTitles}
          </p>
          <p className="text-xs text-muted-foreground">{courseTitles}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span>
              Rôle :{" "}
              <strong className="text-foreground">
                {
                  FORMATION_ROLE_META[
                    link.formationRole ?? DEFAULT_FORMATION_ROLE
                  ].label
                }
              </strong>
            </span>
            <span>
              {link.expiresAt
                ? `Expire le ${formatScheduleMoment(link.expiresAt)}`
                : "Sans expiration"}
            </span>
            <Badge tone={link.paid ? "gold" : "green"}>
              {link.paid ? "Payant" : "Offert"}
            </Badge>
            {status === "expired" ? <Badge tone="gold">Expiré</Badge> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canShorten ? (
            <Button
              size="sm"
              onClick={copyShort}
              disabled={shortBusy || !origin}
              title="Crée et copie un lien court du domaine officiel (anti-hameçonnage)."
            >
              {shortCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              {shortBusy
                ? "…"
                : shortCopied
                  ? "Lien court copié"
                  : "Lien court"}
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={copy} disabled={!url}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copié" : "Lien complet"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRemove}
            title="Retire ce lien de la liste. Les comptes déjà créés via ce lien conservent leur accès ; seule l'expiration empêche de nouvelles inscriptions."
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" /> Retirer
          </Button>
        </div>
      </div>
      {shortUrl ? (
        <p className="mt-2 truncate rounded-md border border-ew-green-300 bg-ew-green-50/60 px-2 py-1 font-mono text-[11px] font-semibold text-ew-green-800">
          {shortUrl}
        </p>
      ) : null}
      <p className="mt-1 truncate rounded-md border border-dashed border-border bg-background/60 px-2 py-1 font-mono text-[11px] text-muted-foreground">
        {url || "…"}
      </p>
    </li>
  );
}

/* ============================================================================
   ONGLET 9 — TARIFICATION (prix du cours en FCFA + équivalent EUR)
   ========================================================================== */
function CoursePricePanel({ courseId }: { courseId: string }) {
  const store = useStore();
  const course = getCourse(courseId);
  const current = getCoursePrice(courseId, store.coursePrices);

  const [amount, setAmount] = React.useState<string>("");
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  // Réinitialise le retour visuel « enregistré » au changement de cours.
  React.useEffect(() => {
    setSavedAt(null);
  }, [courseId]);
  // Resynchronise le champ avec la valeur enregistrée (changement de cours ou
  // mise à jour du tarif ailleurs). Dépend de la valeur primitive du store,
  // pas du saisi local : la frappe en cours n'est donc pas écrasée.
  const savedAmount = current?.amountFcfa ?? 0;
  React.useEffect(() => {
    setAmount(savedAmount > 0 ? String(savedAmount) : "");
  }, [courseId, savedAmount]);

  const amountNum = Math.max(0, Math.round(Number(amount) || 0));
  const dirty = (current?.amountFcfa ?? 0) !== amountNum;
  const mmReady = isMobileMoneyOperational(store.paymentSettings);

  function save() {
    if (amountNum <= 0) store.clearCoursePrice(courseId);
    else store.setCoursePrice({ courseId, amountFcfa: amountNum });
    setSavedAt(Date.now());
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-ew-green-200 bg-ew-green-50/40 p-3 text-xs">
        <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-ew-green-700">
          <Coins aria-hidden className="h-3.5 w-3.5" /> Tarif du cours
        </p>
        <p className="mt-1 text-foreground/90">
          Fixez le prix d&apos;accès au cours{" "}
          <strong>« {course?.shortTitle ?? courseId} »</strong> en FCFA.
          L&apos;équivalent en euros est calculé à la parité légale fixe
          (1&nbsp;€ = 655,957&nbsp;FCFA). Laissez vide ou 0 pour un cours{" "}
          <strong>gratuit</strong> (inscription gérée par
          l&apos;administrateur).
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Prix du cours (FCFA)
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={0}
            step={500}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="h-10 w-44 rounded-md border border-input bg-background px-3 text-lg font-bold focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
          />
          <div className="text-sm">
            {amountNum > 0 ? (
              <>
                <span className="font-display text-xl font-extrabold text-foreground">
                  {formatFcfa(amountNum)}
                </span>{" "}
                <span className="text-muted-foreground">
                  {formatEurEquivalent(amountNum)}
                </span>
              </>
            ) : (
              <span className="font-bold text-ew-green-700">Gratuit</span>
            )}
          </div>
        </div>

        {amountNum > 0 && !mmReady ? (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-ew-gold-200 bg-ew-gold-50/60 px-3 py-2 text-xs text-ew-gold-700">
            <AlertTriangle aria-hidden className="h-4 w-4" /> Le paiement Mobile
            Money n&apos;est pas encore opérationnel : configurez-le dans
            l&apos;onglet <strong>Paiement</strong> pour permettre
            l&apos;auto-inscription payante.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {savedAt && !dirty ? (
              <span className="text-ew-green-700">
                ✓ Tarif enregistré à{" "}
                {new Date(savedAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : dirty ? (
              <span className="italic">Modifications non enregistrées.</span>
            ) : (
              <span className="italic">
                Cours gratuit tant qu&apos;aucun prix n&apos;est fixé.
              </span>
            )}
          </p>
          <Button size="sm" onClick={save} disabled={!dirty}>
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ONGLET 10 — PAIEMENT MOBILE MONEY (config opérateurs + validation)
   ========================================================================== */
function PaymentPanel({
  courseId,
  actor,
}: {
  courseId: string;
  actor: string;
}) {
  const store = useStore();
  const settings = store.paymentSettings;

  // Brouillon local de la configuration (sauvegarde explicite).
  const [enabled, setEnabled] = React.useState(settings.mobileMoneyEnabled);
  const [autoValidate, setAutoValidate] = React.useState(settings.autoValidate);
  const [instructions, setInstructions] = React.useState(settings.instructions);
  const [operators, setOperators] = React.useState(() =>
    MOBILE_MONEY_OPERATORS.map((key) => {
      const o = settings.operators.find((x) => x.key === key);
      return {
        key,
        enabled: o?.enabled ?? false,
        merchantNumber: o?.merchantNumber ?? "",
        merchantName: o?.merchantName ?? "",
      };
    }),
  );
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  function patchOperator(
    key: MobileMoneyOperator,
    patch: Partial<{
      enabled: boolean;
      merchantNumber: string;
      merchantName: string;
    }>,
  ) {
    setOperators((prev) =>
      prev.map((o) => (o.key === key ? { ...o, ...patch } : o)),
    );
    setSavedAt(null);
  }

  function save() {
    store.setPaymentSettings({
      mobileMoneyEnabled: enabled,
      autoValidate,
      instructions,
      operators,
    });
    setSavedAt(Date.now());
  }

  // Paiements en attente (tous cours) + historique du cours sélectionné.
  const pending = store.coursePayments.filter((p) => p.status === "pending");
  const courseHistory = store.coursePayments.filter(
    (p) => p.courseId === courseId && p.status !== "pending",
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-ew-green-200 bg-ew-green-50/40 p-3 text-xs">
        <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-ew-green-700">
          <Wallet aria-hidden className="h-3.5 w-3.5" /> Paiement Mobile Money
        </p>
        <p className="mt-1 text-foreground/90">
          Publiez, par opérateur, le <strong>numéro marchand</strong> où les
          utilisateurs paient. Ils saisissent ensuite la référence de leur
          transaction. Le paiement est confirmé automatiquement, ou mis en
          attente de votre validation.
        </p>
      </div>

      {/* Réglages globaux */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              className="h-4 w-4 accent-ew-green-700"
              checked={enabled}
              onChange={(e) => {
                setEnabled(e.target.checked);
                setSavedAt(null);
              }}
            />
            Activer le paiement Mobile Money
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              className="h-4 w-4 accent-ew-green-700"
              checked={autoValidate}
              onChange={(e) => {
                setAutoValidate(e.target.checked);
                setSavedAt(null);
              }}
            />
            Validation automatique (sans contrôle manuel)
          </label>
        </div>

        {autoValidate ? (
          <p className="flex items-start gap-1.5 rounded-lg border border-ew-gold-200 bg-ew-gold-50/60 px-3 py-2 text-xs text-ew-gold-700">
            <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Attention :</strong> en validation automatique, toute
              référence saisie inscrit immédiatement l&apos;utilisateur, sans
              vérifier la transaction. N&apos;activez ce mode que si vous
              acceptez ce risque. Sinon, laissez décoché : chaque paiement
              restera « en attente » jusqu&apos;à votre confirmation manuelle.
            </span>
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {operators.map((o) => (
            <div
              key={o.key}
              className={cn(
                "rounded-xl border p-3",
                o.enabled
                  ? "border-ew-green-300 bg-ew-green-50/40"
                  : "border-border bg-background",
              )}
            >
              <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-ew-green-700"
                  checked={o.enabled}
                  onChange={(e) =>
                    patchOperator(o.key, { enabled: e.target.checked })
                  }
                />
                <Smartphone aria-hidden className="h-4 w-4 text-ew-green-700" />
                {MM_OPERATOR_META[o.key].label}
              </label>
              <div className="mt-2 grid gap-2">
                <Input
                  value={o.merchantNumber}
                  onChange={(e) =>
                    patchOperator(o.key, { merchantNumber: e.target.value })
                  }
                  placeholder="Numéro marchand (ex. 0700000000)"
                  className="h-9"
                  disabled={!o.enabled}
                />
                <Input
                  value={o.merchantName}
                  onChange={(e) =>
                    patchOperator(o.key, { merchantName: e.target.value })
                  }
                  placeholder="Nom du bénéficiaire (facultatif)"
                  className="h-9"
                  disabled={!o.enabled}
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Instructions affichées à l&apos;utilisateur
          </label>
          <textarea
            value={instructions}
            onChange={(e) => {
              setInstructions(e.target.value);
              setSavedAt(null);
            }}
            rows={2}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {savedAt ? (
              <span className="text-ew-green-700">✓ Réglages enregistrés.</span>
            ) : (
              <span className="italic">Modifications non enregistrées.</span>
            )}
          </p>
          <Button size="sm" onClick={save}>
            <Save className="h-4 w-4" /> Enregistrer la configuration
          </Button>
        </div>
      </div>

      {/* Paiements en attente (tous cours) */}
      <div>
        <p className="mb-2 font-display text-xs font-bold uppercase tracking-wide text-ew-gold-700">
          Paiements en attente de validation ({pending.length})
        </p>
        {pending.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-background/60 p-3 text-center text-sm text-muted-foreground">
            Aucun paiement en attente.
          </p>
        ) : (
          <ul className="space-y-2">
            {pending.map((p) => (
              <PaymentRow
                key={p.id}
                payment={p}
                onConfirm={() => store.confirmCoursePayment(p.id, actor)}
                onReject={(reason) =>
                  store.rejectCoursePayment(p.id, actor, reason)
                }
              />
            ))}
          </ul>
        )}
      </div>

      {/* Historique du cours sélectionné */}
      {courseHistory.length > 0 ? (
        <div>
          <p className="mb-2 font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Historique — {getCourse(courseId)?.shortTitle ?? courseId} (
            {courseHistory.length})
          </p>
          <ul className="space-y-2">
            {courseHistory.map((p) => (
              <PaymentRow
                key={p.id}
                payment={p}
                onRevert={() => store.revertCoursePayment(p.id, actor)}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function PaymentRow({
  payment,
  onConfirm,
  onReject,
  onRevert,
}: {
  payment: CoursePayment;
  onConfirm?: () => void;
  onReject?: (reason: string) => void;
  onRevert?: () => void;
}) {
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const course = getCourse(payment.courseId);
  const actionable = payment.status === "pending" && onConfirm && onReject;
  const revertable = payment.status === "confirmed" && onRevert;

  const tone =
    payment.status === "confirmed"
      ? "green"
      : payment.status === "rejected"
        ? "red"
        : "gold";

  return (
    <li className="rounded-xl border border-border bg-card p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display font-bold text-foreground">
            {payment.userName}{" "}
            <span className="font-normal text-muted-foreground">
              — {course?.shortTitle ?? payment.courseId}
            </span>
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span className="font-bold text-foreground">
              {formatFcfa(payment.amountFcfa)}
            </span>
            <span>{MM_OPERATOR_META[payment.operator].label}</span>
            <span>
              Réf.{" "}
              <strong className="text-foreground">{payment.reference}</strong>
            </span>
            {payment.payerNumber ? <span>{payment.payerNumber}</span> : null}
            <Badge tone={tone}>{PAYMENT_STATUS_LABEL[payment.status]}</Badge>
          </div>
          {payment.note ? (
            <p className="mt-1 text-[11px] italic text-muted-foreground">
              {payment.note}
            </p>
          ) : null}
        </div>
        {actionable && !rejecting ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" onClick={onConfirm}>
              <Check className="h-4 w-4" /> Confirmer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRejecting(true)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" /> Refuser
            </Button>
          </div>
        ) : revertable ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onRevert}
            title="Annule l'inscription créée par ce paiement."
            className="shrink-0 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" /> Annuler l&apos;inscription
          </Button>
        ) : null}
      </div>
      {actionable && rejecting ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif du refus"
            className="h-8 flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => {
              onReject?.(reason.trim() || "Paiement non vérifié.");
              setRejecting(false);
              setReason("");
            }}
          >
            Confirmer le refus
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>
            Annuler
          </Button>
        </div>
      ) : null}
    </li>
  );
}
