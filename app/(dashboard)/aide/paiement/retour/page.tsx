"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Hourglass, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourse } from "@/lib/formations/catalog";

/**
 * Page de retour après un paiement Wave. Sonde le statut du paiement
 * (via /api/payments/status) jusqu'à confirmation, échec, ou délai.
 */
export default function PaiementRetourPage() {
  // Lecture APRÈS montage : un initialiseur useState lisant window.location
  // s'exécute au rendu serveur/statique (window indéfini) et renverrait des
  // valeurs erronées. L'effet ne tourne que côté client.
  const [paymentId, setPaymentId] = React.useState<string | null>(null);
  const [declaredFail, setDeclaredFail] = React.useState(false);
  const [paramsRead, setParamsRead] = React.useState(false);
  React.useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setPaymentId(sp.get("p"));
    setDeclaredFail(sp.get("echec") === "1");
    setParamsRead(true);
  }, []);

  const [status, setStatus] = React.useState<
    "pending" | "confirmed" | "failed" | "timeout" | "unknown"
  >("pending");
  const [courseId, setCourseId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!paramsRead) return;
    if (!paymentId) {
      setStatus("unknown");
      return;
    }
    let cancelled = false;
    let tries = 0;
    const maxTries = 20; // ~1 minute (3 s × 20)

    async function poll() {
      tries += 1;
      try {
        const res = await fetch(
          `/api/payments/status?p=${encodeURIComponent(paymentId!)}`,
        );
        const data = (await res.json().catch(() => ({}))) as {
          status?: string | null;
          courseId?: string | null;
        };
        if (cancelled) return;
        if (data.courseId) setCourseId(data.courseId);
        if (data.status === "confirmed") {
          setStatus("confirmed");
          return;
        }
        if (data.status === "failed") {
          setStatus("failed");
          return;
        }
      } catch {
        /* on réessaie */
      }
      if (cancelled) return;
      if (tries >= maxTries) {
        setStatus(declaredFail ? "failed" : "timeout");
        return;
      }
      window.setTimeout(poll, 3000);
    }
    void poll();
    return () => {
      cancelled = true;
    };
  }, [paymentId, declaredFail, paramsRead]);

  const course = courseId ? getCourse(courseId) : undefined;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 py-16 text-center">
      {status === "confirmed" ? (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ew-green-100 text-ew-green-700">
            <CheckCircle2 aria-hidden className="h-8 w-8" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              Paiement confirmé
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre inscription
              {course ? ` à « ${course.shortTitle} »` : ""} est validée. Vous
              pouvez accéder au cours.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {course ? (
              <Button asChild>
                <Link href={course.route}>Accéder au cours</Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link href="/aide">Bibliothèque</Link>
            </Button>
          </div>
        </>
      ) : status === "failed" ? (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700">
            <XCircle aria-hidden className="h-8 w-8" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              Paiement non abouti
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Le paiement n&apos;a pas été finalisé. Aucun montant n&apos;a été
              prélevé si la transaction a échoué. Vous pouvez réessayer depuis
              le cours.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={course?.route ?? "/aide"}>
              <ArrowLeft className="h-4 w-4" /> Retour au cours
            </Link>
          </Button>
        </>
      ) : status === "timeout" ? (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-700">
            <Hourglass aria-hidden className="h-8 w-8" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              Confirmation en cours
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre paiement est en cours de traitement. L&apos;accès
              s&apos;ouvrira automatiquement dès confirmation — réactualisez le
              cours dans un instant.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={course?.route ?? "/aide"}>Retour au cours</Link>
          </Button>
        </>
      ) : status === "unknown" ? (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <XCircle aria-hidden className="h-8 w-8" />
          </span>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
            Paiement introuvable
          </h1>
          <Button variant="outline" asChild>
            <Link href="/aide">Bibliothèque</Link>
          </Button>
        </>
      ) : (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-700">
            <Hourglass aria-hidden className="h-8 w-8 animate-pulse" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              Vérification du paiement…
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Merci de patienter quelques secondes pendant la confirmation par
              Wave.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
