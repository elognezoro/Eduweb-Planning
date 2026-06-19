"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Lock, MessageSquare } from "lucide-react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { getCourse } from "@/lib/formations/catalog";
import { getEnrollmentVerdict, enrollmentSourceLabel } from "@/lib/formations/enrollment";

/**
 * Garde d'accès à un cours spécifique.
 *
 * Affiche le contenu seulement si l'utilisateur est inscrit (inscription
 * nominative, par cohorte, ou automatique par rôle). Sinon, montre un
 * écran d'accès refusé propre au cours, avec ses caractéristiques et la
 * démarche d'inscription.
 *
 * Les administrateurs (rôle `admin`) accèdent toujours à tous les cours.
 */
export function CourseGate({
  courseId,
  children,
}: {
  courseId: string;
  children: React.ReactNode;
}) {
  const app = useApp();
  const store = useStore();
  const course = getCourse(courseId);

  // L'administrateur garde un accès complet, par cohérence avec la matrice
  // des permissions (le système ne peut pas le verrouiller).
  if (app.effectiveRole === "admin") {
    return <>{children}</>;
  }

  if (!course) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm">
        Cours introuvable. Vérifiez l&apos;URL ou contactez l&apos;administrateur.
      </div>
    );
  }

  const verdict = getEnrollmentVerdict(
    app.user.id,
    app.effectiveRole,
    courseId,
    store.courseEnrollments,
    store.courseCohorts,
  );

  if (verdict.enrolled) {
    return (
      <div className="space-y-3">
        <EnrollmentBadge sourceLabel={enrollmentSourceLabel(verdict.source)} expiresAt={verdict.expiresAt} />
        {children}
      </div>
    );
  }

  return <CourseAccessDenied courseId={courseId} />;
}

function EnrollmentBadge({
  sourceLabel,
  expiresAt,
}: {
  sourceLabel: string;
  expiresAt?: string | null;
}) {
  const expires = expiresAt
    ? new Date(expiresAt).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : null;
  return (
    <div className="no-print flex flex-wrap items-center gap-2 rounded-xl border border-ew-green-200 bg-ew-green-50/50 px-3 py-2 text-xs">
      <GraduationCap aria-hidden className="h-4 w-4 text-ew-green-700" />
      <span className="font-bold text-ew-green-800">Vous êtes inscrit à ce cours.</span>
      <span className="text-muted-foreground">{sourceLabel}</span>
      {expires ? (
        <span className="ml-auto text-muted-foreground">
          Valable jusqu&apos;au <strong>{expires}</strong>
        </span>
      ) : null}
    </div>
  );
}

function CourseAccessDenied({ courseId }: { courseId: string }) {
  const app = useApp();
  const course = getCourse(courseId);
  if (!course) return null;
  // Le lien vers /systeme/formations n'est rendu cliquable que pour les
  // utilisateurs habilités à gérer les inscriptions ; sinon il est affiché
  // comme une simple mention textuelle (le module n'est pas accessible).
  const canManage = app.can("system:manage_permissions");

  const methodLabels: Record<string, string> = {
    individual: "inscription nominative",
    cohort: "inscription par cohorte",
    "role-auto": "inscription automatique par rôle",
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-700">
        <Lock aria-hidden className="h-7 w-7" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Inscription requise
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette formation est ouverte uniquement aux participants inscrits.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-border bg-card p-5 text-left">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ew-green-700">
          {course.shortTitle}
        </p>
        <p className="mt-1 font-display text-base font-bold text-foreground">{course.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{course.longDescription}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Fact label="Durée" value={course.duration} />
          <Fact label="Niveau" value={course.level} />
          <Fact label="Public" value={course.audience} />
          <Fact
            label="Méthodes d'inscription"
            value={course.enrollmentMethods.map((m) => methodLabels[m]).join(" · ")}
          />
        </div>
      </div>

      <div className="w-full rounded-2xl border border-border bg-card p-5 text-left">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <MessageSquare aria-hidden className="h-4 w-4" /> Comment m&apos;inscrire ?
        </p>
        <ol className="mt-2 space-y-1.5 text-sm">
          <li className="flex gap-2">
            <span aria-hidden className="font-bold text-ew-green-700">1.</span>
            <span>
              Contactez l&apos;administrateur de votre établissement ou de votre structure
              régionale.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="font-bold text-ew-green-700">2.</span>
            <span>
              Précisez le cours visé :{" "}
              <strong className="text-ew-green-800">« {course.shortTitle} »</strong>.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="font-bold text-ew-green-700">3.</span>
            <span>
              L&apos;administrateur procédera à votre inscription (nominative ou par
              cohorte) via le module{" "}
              {canManage ? (
                <Link href="/systeme/formations" className="underline">
                  Inscriptions aux formations
                </Link>
              ) : (
                <strong className="text-ew-green-800">« Inscriptions aux formations »</strong>
              )}
              .
            </span>
          </li>
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Link
          href="/aide"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à la bibliothèque
        </Link>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-foreground">{value}</p>
    </div>
  );
}
