"use client";

import * as React from "react";
import { toast } from "sonner";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { claimEnrollIntents } from "@/lib/formations/enrollment-invite";
import { getEnrollmentVerdict } from "@/lib/formations/enrollment";
import { getCourse } from "@/lib/formations/catalog";
import { FORMATION_ROLES } from "@/lib/formations/formation-roles";

/**
 * Matérialise les inscriptions issues d'un lien d'inscription.
 *
 * La page /register (segment (auth)) n'a pas accès au magasin de données ;
 * elle y dépose une INTENTION dans localStorage (clé e-mail). Ce composant,
 * monté dans le tableau de bord (sous DataStoreProvider + AppProvider),
 * réclame les intentions correspondant à l'utilisateur connecté dès que son
 * profil est résolu, et crée les inscriptions manquantes.
 *
 * Idempotent : les intentions réclamées sont retirées de localStorage, et un
 * verrou (`claimedRef`) empêche un double traitement au sein d'une session.
 */
export function EnrollmentIntentClaimer() {
  const app = useApp();
  const store = useStore();
  const claimedRef = React.useRef(false);

  React.useEffect(() => {
    if (claimedRef.current) return;
    const email = app.user.email;
    const userId = app.user.id;
    // Attendre que le profil réel soit résolu (e-mail non vide).
    if (!email || !userId) return;

    const intents = claimEnrollIntents(email);
    if (intents.length === 0) return;
    claimedRef.current = true;

    const now = Date.now();
    const enrolledTitles: string[] = [];
    // Dé-duplication au sein de la réclamation : un cours déjà traité dans
    // cette passe n'est pas réinscrit (les vérifications de verdict reposent
    // sur le snapshot du store et ne « voient » pas les enrollUser de la passe).
    const handled = new Set<string>();
    intents.forEach((intent) => {
      // Revérification de l'expiration au moment du claim (le jeton a pu
      // expirer entre la création du compte et la première connexion).
      if (intent.expiresAt && new Date(intent.expiresAt).getTime() < now)
        return;
      // Rôle de formation : on n'applique que des valeurs connues.
      const role =
        intent.formationRole &&
        (FORMATION_ROLES as readonly string[]).includes(intent.formationRole)
          ? intent.formationRole
          : undefined;
      intent.courseIds.forEach((courseId) => {
        if (handled.has(courseId)) return;
        handled.add(courseId);
        const course = getCourse(courseId);
        if (!course) return; // cours inconnu (jeton forgé / catalogue modifié)
        const verdict = getEnrollmentVerdict(
          userId,
          app.effectiveRole,
          courseId,
          store.courseEnrollments,
          store.courseCohorts,
        );
        if (verdict.enrolled) return; // déjà inscrit : on n'ajoute pas de doublon
        store.enrollUser({
          userId,
          courseId,
          enrolledBy: intent.source || "Lien d'inscription",
          source: "admin",
          formationRole: role,
        });
        enrolledTitles.push(course.shortTitle);
      });
    });

    if (enrolledTitles.length > 0) {
      toast.success("Inscription confirmée", {
        description: `Vous avez désormais accès à : ${enrolledTitles.join(", ")}.`,
      });
    }
  }, [app.user.email, app.user.id, app.effectiveRole, store]);

  return null;
}
