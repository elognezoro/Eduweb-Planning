"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Lock, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { sortedCourses } from "@/lib/formations/catalog";
import {
  coursesEnrolledIn,
  courseTypeLabel,
  enrollmentSourceLabel,
  getEnrollmentVerdict,
} from "@/lib/formations/enrollment";

/**
 * Pastille d'état d'inscription, utilisée dans les bandeaux de la
 * bibliothèque pour signaler l'accessibilité d'un cours.
 */
export function EnrollmentStatusChip({
  courseId,
  className,
}: {
  courseId: string;
  className?: string;
}) {
  const app = useApp();
  const store = useStore();
  const isAdmin = app.effectiveRole === "admin";
  const verdict = getEnrollmentVerdict(
    app.user.id,
    app.effectiveRole,
    courseId,
    store.courseEnrollments,
    store.courseCohorts,
  );
  const enrolled = isAdmin || verdict.enrolled;

  if (enrolled) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-ew-green-300 bg-ew-green-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ew-green-800",
          className,
        )}
      >
        <CheckCircle2 aria-hidden className="h-3 w-3" /> Inscrit
        {isAdmin ? <span className="text-[10px] font-normal italic">(admin)</span> : null}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-ew-gold-200 bg-ew-gold-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ew-gold-700",
        className,
      )}
    >
      <Lock aria-hidden className="h-3 w-3" /> Inscription requise
    </span>
  );
}

/**
 * Bandeau « Mes formations » : liste les cours auxquels l'utilisateur est
 * inscrit (incluant l'auto-inscription par rôle). À placer en tête de la
 * bibliothèque /aide.
 */
export function MyEnrollmentsPanel() {
  const app = useApp();
  const store = useStore();
  const isAdmin = app.effectiveRole === "admin";

  const catalog = sortedCourses();
  const mine = React.useMemo(() => {
    if (isAdmin) {
      // L'administrateur a accès à tout par défaut.
      return catalog.map((course) => ({
        course,
        verdict: { enrolled: true, source: "role-auto" as const },
      }));
    }
    return coursesEnrolledIn(
      app.user.id,
      app.effectiveRole,
      catalog,
      store.courseEnrollments,
      store.courseCohorts,
    );
  }, [
    catalog,
    isAdmin,
    app.user.id,
    app.effectiveRole,
    store.courseEnrollments,
    store.courseCohorts,
  ]);

  return (
    <section className="rounded-2xl border border-ew-green-200 bg-gradient-to-br from-ew-green-50 via-card to-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ew-green-700 text-white">
            <GraduationCap aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-ew-green-700">
              Mes formations
            </p>
            <p className="font-display text-lg font-bold text-foreground">
              {mine.length === 0
                ? "Aucune formation active"
                : mine.length === 1
                  ? "1 formation active"
                  : `${mine.length} formations actives`}
            </p>
          </div>
        </div>
        <Link
          href="/aide/mes-formations"
          className="inline-flex items-center gap-1 text-xs font-bold text-ew-green-700 hover:underline"
        >
          Voir tout <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </div>

      {mine.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Vous n&apos;êtes inscrit à aucune formation pour le moment. Contactez
          l&apos;administrateur de votre établissement pour demander une
          inscription.
        </p>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {mine.map(({ course, verdict }) => (
            <Link
              key={course.id}
              href={course.route}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-ew-green-400 hover:bg-ew-green-50/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ew-green-100 text-ew-green-800">
                {course.type === "seminaire" ? (
                  <ScrollText aria-hidden className="h-4 w-4" />
                ) : (
                  <BookOpen aria-hidden className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {courseTypeLabel(course.type)} ·{" "}
                  {isAdmin
                    ? "Accès administrateur"
                    : enrollmentSourceLabel(verdict.source)}
                </p>
                <p className="truncate font-display text-sm font-bold text-foreground group-hover:text-ew-green-800">
                  {course.shortTitle}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {course.description}
                </p>
              </div>
              <ArrowRight
                aria-hidden
                className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-ew-green-700"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
