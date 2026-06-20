"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Hourglass,
  Lock,
  MessageSquare,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCourse } from "@/lib/formations/catalog";
import {
  getEnrollmentVerdict,
  enrollmentSourceLabel,
} from "@/lib/formations/enrollment";
import {
  evaluateCourseSchedule,
  formatScheduleMoment,
  getCourseSchedule,
  type CourseScheduleVerdict,
} from "@/lib/formations/course-schedule";
import {
  coursePriceFcfa,
  formatEurEquivalent,
  formatFcfa,
  isCoursePaid,
} from "@/lib/formations/pricing";
import {
  enabledOperators,
  isMobileMoneyOperational,
  MM_OPERATOR_META,
  pendingPaymentFor,
  type MobileMoneyOperator,
} from "@/lib/formations/payment";
import type { Course } from "@/lib/formations/types";
import { cn } from "@/lib/utils";

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
        Cours introuvable. Vérifiez l&apos;URL ou contactez
        l&apos;administrateur.
      </div>
    );
  }

  const schedule = evaluateCourseSchedule(
    getCourseSchedule(courseId, store.courseScheduleRules),
  );

  // Cours CLÔTURÉ : accès bloqué pour tous — inscription et paiement inutiles.
  if (schedule.state === "after") {
    return <CourseScheduleClosed course={course} verdict={schedule} />;
  }

  const verdict = getEnrollmentVerdict(
    app.user.id,
    app.effectiveRole,
    courseId,
    store.courseEnrollments,
    store.courseCohorts,
  );

  if (verdict.enrolled) {
    // Déjà inscrit, mais le cours n'est pas encore ouvert : écran d'attente
    // (le contenu reste verrouillé jusqu'à la date d'ouverture).
    if (schedule.state === "before") {
      return (
        <CourseScheduleClosed course={course} verdict={schedule} enrolled />
      );
    }
    return (
      <div className="space-y-3">
        <EnrollmentBadge
          sourceLabel={enrollmentSourceLabel(verdict.source)}
          expiresAt={verdict.expiresAt}
          closesAt={schedule.closesAt}
        />
        {children}
      </div>
    );
  }

  // Non inscrit. Un cours PAYANT (avec Mobile Money opérationnel) ouvre
  // l'auto-inscription par paiement — possible dès maintenant, même AVANT
  // l'ouverture du cours (pré-inscription). Un cours gratuit reste géré par
  // l'administrateur (écran « inscription requise »).
  const paid =
    isCoursePaid(courseId, store.coursePrices) &&
    isMobileMoneyOperational(store.paymentSettings);
  if (paid) {
    return <CoursePaymentGate course={course} schedule={schedule} />;
  }
  return <CourseAccessDenied courseId={courseId} schedule={schedule} />;
}

function EnrollmentBadge({
  sourceLabel,
  expiresAt,
  closesAt,
}: {
  sourceLabel: string;
  expiresAt?: string | null;
  closesAt?: string | null;
}) {
  const expires = expiresAt
    ? new Date(expiresAt).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : null;
  const closes = closesAt ? formatScheduleMoment(closesAt) : null;
  return (
    <div className="no-print flex flex-wrap items-center gap-2 rounded-xl border border-ew-green-200 bg-ew-green-50/50 px-3 py-2 text-xs">
      <GraduationCap aria-hidden className="h-4 w-4 text-ew-green-700" />
      <span className="font-bold text-ew-green-800">
        Vous êtes inscrit à ce cours.
      </span>
      <span className="text-muted-foreground">{sourceLabel}</span>
      <span className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-0.5 text-muted-foreground">
        {closes ? (
          <span className="inline-flex items-center gap-1">
            <CalendarClock aria-hidden className="h-3.5 w-3.5" /> Ouvert
            jusqu&apos;au <strong>{closes}</strong>
          </span>
        ) : null}
        {expires ? (
          <span>
            Inscription valable jusqu&apos;au <strong>{expires}</strong>
          </span>
        ) : null}
      </span>
    </div>
  );
}

/**
 * Écran affiché lorsque le cours est hors de sa fenêtre d'ouverture :
 * soit pas encore ouvert, soit déjà clôturé. Distinct de l'écran
 * « inscription requise » : ici l'accès est bloqué pour une raison de
 * calendrier, indépendamment de l'inscription.
 */
function CourseScheduleClosed({
  course,
  verdict,
  enrolled = false,
}: {
  course: Course;
  verdict: CourseScheduleVerdict;
  /** L'utilisateur est déjà inscrit et attend l'ouverture. */
  enrolled?: boolean;
}) {
  const isBefore = verdict.state === "before";
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-12 text-center">
      <span
        className={
          "flex h-16 w-16 items-center justify-center rounded-full " +
          (isBefore
            ? "bg-ew-green-100 text-ew-green-700"
            : "bg-ew-gold-100 text-ew-gold-700")
        }
      >
        <CalendarClock aria-hidden className="h-7 w-7" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          {isBefore ? "Cours pas encore ouvert" : "Cours clôturé"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{verdict.reason}</p>
        {enrolled && isBefore ? (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ew-green-50 px-3 py-1 text-xs font-bold text-ew-green-700">
            <CheckCircle2 aria-hidden className="h-4 w-4" /> Votre inscription
            est confirmée — l&apos;accès s&apos;ouvrira à cette date.
          </p>
        ) : null}
      </div>

      <div className="w-full rounded-2xl border border-border bg-card p-5 text-left">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ew-green-700">
          {course.shortTitle}
        </p>
        <p className="mt-1 font-display text-base font-bold text-foreground">
          {course.title}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Fact
            label="Ouverture"
            value={formatScheduleMoment(verdict.opensAt)}
          />
          <Fact
            label="Fermeture"
            value={formatScheduleMoment(verdict.closesAt)}
          />
        </div>
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

/**
 * Écran de paiement Mobile Money pour un cours payant (utilisateur non
 * inscrit). L'utilisateur paie vers le numéro marchand de l'opérateur choisi,
 * puis saisit la référence de transaction. Selon le réglage admin :
 *  - validation automatique → inscription immédiate ;
 *  - sinon → paiement « en attente » jusqu'à validation par l'administrateur.
 *
 * Accessible même AVANT l'ouverture du cours (pré-paiement) ; l'accès au
 * contenu reste repoussé à la date d'ouverture.
 */
function CoursePaymentGate({
  course,
  schedule,
}: {
  course: Course;
  schedule: CourseScheduleVerdict;
}) {
  const app = useApp();
  const store = useStore();
  const amount = coursePriceFcfa(course.id, store.coursePrices);
  const operators = enabledOperators(store.paymentSettings);
  const pending = pendingPaymentFor(
    app.user.id,
    course.id,
    store.coursePayments,
  );

  const [operator, setOperator] = React.useState<MobileMoneyOperator>(
    operators[0]?.key ?? "orange",
  );
  const [reference, setReference] = React.useState("");
  const [payerNumber, setPayerNumber] = React.useState("");

  const selected = operators.find((o) => o.key === operator) ?? operators[0];
  const opensLater = schedule.state === "before";

  // Dernier paiement REFUSÉ pour ce cours (le tableau est préfixé : le premier
  // trouvé est le plus récent) — affiché pour expliquer le motif à l'utilisateur.
  const lastRejected = store.coursePayments.find(
    (p) =>
      p.userId === app.user.id &&
      p.courseId === course.id &&
      p.status === "rejected",
  );

  // Garde anti double-soumission (double-clic avant le re-rendu en « attente »).
  const submittedRef = React.useRef(false);

  function submit() {
    const ref = reference.trim();
    if (!ref || !selected || submittedRef.current) return;
    submittedRef.current = true;
    store.submitCoursePayment({
      userId: app.user.id,
      userName: app.user.displayName,
      courseId: course.id,
      amountFcfa: amount,
      operator: selected.key,
      reference: ref,
      payerNumber: payerNumber.trim() || undefined,
    });
    if (store.paymentSettings.autoValidate) {
      toast.success("Paiement enregistré", {
        description: "Votre inscription est confirmée.",
      });
    } else {
      toast.success("Paiement transmis", {
        description: "En attente de validation par l'administrateur.",
      });
    }
  }

  // Un paiement est déjà en attente : on n'affiche pas le formulaire.
  if (pending) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-12 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-700">
          <Hourglass aria-hidden className="h-7 w-7" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
            Paiement en attente de validation
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Votre paiement pour <strong>« {course.shortTitle} »</strong> a bien
            été transmis. L&apos;accès sera ouvert dès sa validation par
            l&apos;administrateur.
          </p>
        </div>
        <div className="w-full rounded-2xl border border-border bg-card p-5 text-left text-sm">
          <Fact label="Montant" value={formatFcfa(pending.amountFcfa)} />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Fact
              label="Opérateur"
              value={MM_OPERATOR_META[pending.operator].label}
            />
            <Fact label="Référence" value={pending.reference} />
          </div>
        </div>
        <Link
          href="/aide"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à la bibliothèque
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 py-10">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ew-green-100 text-ew-green-700">
          <CreditCard aria-hidden className="h-7 w-7" />
        </span>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Inscription au cours
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{course.title}</p>
      </div>

      {lastRejected ? (
        <p className="rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-center text-xs font-semibold text-red-700">
          Votre précédent paiement a été refusé
          {lastRejected.note ? ` : ${lastRejected.note}` : "."} Vous pouvez
          soumettre un nouveau règlement ci-dessous.
        </p>
      ) : null}

      {opensLater ? (
        <p className="flex items-center justify-center gap-1.5 rounded-xl border border-ew-green-200 bg-ew-green-50/50 px-3 py-2 text-center text-xs font-semibold text-ew-green-800">
          <CalendarClock aria-hidden className="h-4 w-4" /> Ce cours ouvrira le{" "}
          {formatScheduleMoment(schedule.opensAt)}. Vous pouvez régler dès
          maintenant ; l&apos;accès s&apos;ouvrira à cette date.
        </p>
      ) : null}

      {/* Montant */}
      <div className="rounded-2xl border border-ew-green-200 bg-ew-green-50/40 p-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ew-green-700">
          Montant à payer
        </p>
        <p className="mt-1 font-display text-3xl font-extrabold text-foreground">
          {formatFcfa(amount)}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatEurEquivalent(amount)}
        </p>
      </div>

      {/* Choix de l'opérateur */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          1. Choisissez votre opérateur Mobile Money
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {operators.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setOperator(o.key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold transition-colors",
                operator === o.key
                  ? "border-ew-green-400 bg-ew-green-50 text-ew-green-800"
                  : "border-border bg-background hover:bg-muted/40",
              )}
            >
              <Smartphone aria-hidden className="h-4 w-4" />
              {MM_OPERATOR_META[o.key].label}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="mt-4 rounded-xl border border-dashed border-ew-green-300 bg-ew-green-50/40 p-3 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              2. Payez {formatFcfa(amount)} vers ce numéro marchand
            </p>
            <p className="mt-1 font-display text-xl font-extrabold tracking-wide text-foreground">
              {selected.merchantNumber}
            </p>
            {selected.merchantName ? (
              <p className="text-xs text-muted-foreground">
                Bénéficiaire : <strong>{selected.merchantName}</strong>
              </p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {MM_OPERATOR_META[selected.key].hint}
            </p>
            {store.paymentSettings.instructions ? (
              <p className="mt-2 text-xs italic text-muted-foreground">
                {store.paymentSettings.instructions}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Confirmation de paiement */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          3. Confirmez votre paiement
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground">
              Référence de la transaction *
            </label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex. MP260620.1234.A56789"
              className="mt-1 h-9"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground">
              Votre numéro payeur (facultatif)
            </label>
            <Input
              value={payerNumber}
              onChange={(e) => setPayerNumber(e.target.value)}
              placeholder="07 XX XX XX XX"
              className="mt-1 h-9"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {store.paymentSettings.autoValidate
              ? "Votre inscription sera confirmée immédiatement."
              : "Votre paiement sera vérifié par l'administrateur avant l'accès."}
          </p>
          <Button onClick={submit} disabled={!reference.trim() || !selected}>
            <CheckCircle2 className="h-4 w-4" /> Valider mon paiement
          </Button>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/aide"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à la bibliothèque
        </Link>
      </div>
    </div>
  );
}

function CourseAccessDenied({
  courseId,
  schedule,
}: {
  courseId: string;
  schedule?: CourseScheduleVerdict;
}) {
  const app = useApp();
  const course = getCourse(courseId);
  if (!course) return null;
  const opensLater = schedule?.state === "before";
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
        {opensLater ? (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ew-green-50 px-3 py-1 text-xs font-bold text-ew-green-700">
            <CalendarClock aria-hidden className="h-4 w-4" /> Ouverture prévue
            le {formatScheduleMoment(schedule?.opensAt)} — vous pouvez préparer
            votre inscription dès maintenant.
          </p>
        ) : null}
      </div>

      <div className="w-full rounded-2xl border border-border bg-card p-5 text-left">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ew-green-700">
          {course.shortTitle}
        </p>
        <p className="mt-1 font-display text-base font-bold text-foreground">
          {course.title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          {course.longDescription}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Fact label="Durée" value={course.duration} />
          <Fact label="Niveau" value={course.level} />
          <Fact label="Public" value={course.audience} />
          <Fact
            label="Méthodes d'inscription"
            value={course.enrollmentMethods
              .map((m) => methodLabels[m])
              .join(" · ")}
          />
        </div>
      </div>

      <div className="w-full rounded-2xl border border-border bg-card p-5 text-left">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <MessageSquare aria-hidden className="h-4 w-4" /> Comment
          m&apos;inscrire ?
        </p>
        <ol className="mt-2 space-y-1.5 text-sm">
          <li className="flex gap-2">
            <span aria-hidden className="font-bold text-ew-green-700">
              1.
            </span>
            <span>
              Contactez l&apos;administrateur de votre établissement ou de votre
              structure régionale.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="font-bold text-ew-green-700">
              2.
            </span>
            <span>
              Précisez le cours visé :{" "}
              <strong className="text-ew-green-800">
                « {course.shortTitle} »
              </strong>
              .
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="font-bold text-ew-green-700">
              3.
            </span>
            <span>
              L&apos;administrateur procédera à votre inscription (nominative ou
              par cohorte) via le module{" "}
              {canManage ? (
                <Link href="/systeme/formations" className="underline">
                  Inscriptions aux formations
                </Link>
              ) : (
                <strong className="text-ew-green-800">
                  « Inscriptions aux formations »
                </strong>
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
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs text-foreground">{value}</p>
    </div>
  );
}
