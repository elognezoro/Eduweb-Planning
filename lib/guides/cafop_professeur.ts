import type { GuideContent } from "@/components/guides/guide-layout";

/**
 * Guide du Professeur de CAFOP.
 *
 * Périmètre volontairement restreint (moindre privilège) : enseignement et évaluation
 * des élèves-maîtres — saisie des notes et lecture de ses statistiques. PAS de gestion
 * des centres/promotions (réservée au Directeur / Admin CAFOP).
 * Style « détaillé » : théorie + exemple concret + pas-à-pas.
 */
export const guideCafopProfesseur: Omit<GuideContent, "icon"> = {
  roleKey: "cafop_professeur",
  roleLabel: "Professeur de CAFOP",
  meta: {
    level: "Débutant",
    duration: "35 min",
    targetAudience:
      "Professeur d'un CAFOP, chargé d'enseigner aux élèves-maîtres et de saisir leurs évaluations dans son ou ses modules.",
    context:
      "À utiliser à chaque session d'évaluation pour saisir les notes correctement et suivre la progression de vos groupes-classes.",
  },
  objectives: [
    "Comprendre votre rôle d'enseignant-évaluateur au CAFOP et les limites de votre accès.",
    "Accéder au module CAFOP et à l'espace Enseignements & Évaluation.",
    "Saisir les évaluations par module, groupe-classe et semestre.",
    "Suivre la progression de vos élèves-maîtres dans les statistiques.",
    "Retrouver la documentation et les formations dans le Centre de formation.",
  ],
  prerequisites: [
    "Disposer d'un compte au rôle « Professeur de CAFOP » activé.",
    "Connaître votre (vos) module(s) et vos groupes-classes.",
    "Disposer de vos barèmes et coefficients d'évaluation.",
    "Respecter la confidentialité des notes des élèves-maîtres.",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Votre rôle au CAFOP",
      intro:
        "Le professeur de CAFOP forme les futurs instituteurs : la justesse de ses évaluations façonne la qualité de la relève. Votre espace est volontairement ciblé sur l'enseignement et l'évaluation, pour vous concentrer sur votre cœur de métier.",
      sections: [
        {
          title: "Ce que vous voyez (et pourquoi)",
          body:
            "À l'ouverture du module CAFOP, vous accédez aux onglets Enseignements & Évaluation (votre espace de saisie) et Statistiques (le suivi de vos groupes). La gestion des centres et des promotions ne vous est pas présentée : elle relève de la direction du CAFOP. Cette séparation protège l'intégrité des données et clarifie votre périmètre.",
          example:
            "Mme Brou, professeure de « Didactique du français », ouvre le module : elle arrive directement sur Enseignements & Évaluation, prête à saisir, sans être encombrée par la gestion des centres.",
          steps: [
            {
              instruction: "Ouvrez le module CAFOP.",
              navigation: "Système → CAFOP",
            },
            {
              instruction:
                "Vous arrivez sur « Enseignements & Évaluation » ; l'onglet « Statistiques » est également disponible.",
              tip: "Si un onglet de gestion ne s'affiche pas, c'est normal : il est réservé à la direction.",
            },
          ],
        },
      ],
    },
    {
      id: "saisie-evaluations",
      title: "2. Saisir les évaluations",
      intro:
        "L'évaluation n'a de valeur que si elle est complète et exacte. Une saisie régulière et soignée évite les erreurs de moyenne et l'engorgement de fin de semestre.",
      sections: [
        {
          title: "Saisir les notes par module et groupe-classe",
          body:
            "Vous sélectionnez votre module, le groupe-classe et le semestre, puis vous saisissez les évaluations. Le système calcule les moyennes et fait apparaître les mentions : votre exactitude conditionne donc la justesse des résultats officiels.",
          example:
            "Pour le groupe « 2ⁿᵈᵉ année A » en « Didactique du français », vous saisissez la note de la composition du semestre. La moyenne et la mention du groupe se mettent à jour automatiquement.",
          steps: [
            {
              instruction:
                "Ouvrez Enseignements & Évaluation et choisissez module, groupe-classe et semestre.",
              navigation: "CAFOP → Enseignements & Évaluation",
            },
            {
              instruction:
                "Saisissez les évaluations, puis vérifiez les moyennes obtenues.",
              tip: "Saisissez au fil de l'eau : une note saisie le jour même est une note qui ne sera pas oubliée.",
            },
          ],
          bestPractices: [
            "Vérifiez deux fois les notes limites (autour de la moyenne) avant de quitter l'écran.",
            "Signalez à la direction tout module ou groupe-classe manquant dans votre espace.",
          ],
          caveat:
            "Vous ne pouvez pas créer ni modifier les centres et les promotions : pour toute correction de structure, adressez-vous à la direction du CAFOP.",
        },
      ],
    },
    {
      id: "suivi-statistiques",
      title: "3. Suivre la progression",
      intro:
        "Évaluer, c'est aussi observer pour ajuster son enseignement. Les statistiques transforment vos saisies en lecture de la progression de vos groupes.",
      sections: [
        {
          title: "Lire les statistiques de vos groupes",
          body:
            "L'onglet Statistiques agrège vos évaluations en indicateurs (moyennes, mentions, répartition). Lus à période égale, ils signalent où votre enseignement porte et où renforcer.",
          example:
            "Les statistiques montrent une majorité de mentions « Passable » sur une compétence précise. Vous décidez d'y consacrer une séance de remédiation au prochain cours.",
          steps: [
            {
              instruction: "Ouvrez l'onglet Statistiques.",
              navigation: "CAFOP → Statistiques",
            },
            {
              instruction:
                "Repérez les points faibles récurrents pour ajuster votre progression.",
              tip: "Comparez toujours le même semestre d'une année à l'autre.",
            },
          ],
        },
      ],
    },
    {
      id: "centre-formation",
      title: "4. Centre de formation",
      intro:
        "Le Centre de formation réunit les séminaires interactifs, le manuel académique et les guides par rôle — dont le présent guide.",
      sections: [
        {
          title: "Accéder au Centre de formation et à votre guide",
          body:
            "Depuis l'Aide, vous accédez aux ressources qui vous concernent : le guide Professeur de CAFOP (celui-ci), le manuel académique et, selon vos inscriptions, les séminaires. Le guide et le manuel s'ouvrent automatiquement selon votre rôle.",
          steps: [
            {
              instruction: "Ouvrez le Centre de formation.",
              navigation: "Accueil → Aide",
            },
            {
              instruction:
                "Repérez la section des guides utilisateurs et ouvrez le guide Professeur de CAFOP.",
              tip: "Gardez-le en favori : c'est votre référence pour la saisie des évaluations.",
            },
          ],
          caveat:
            "L'accès à un séminaire requiert une inscription, attribuée par un administrateur ou un gestionnaire.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Pourquoi je ne vois pas l'onglet Gestion ni Rapports ?",
      answer:
        "Par conception. Votre rôle est l'enseignement et l'évaluation : vous accédez à Enseignements & Évaluation et à Statistiques. La gestion des centres/promotions et la production des rapports relèvent de la direction du CAFOP.",
    },
    {
      question: "J'ai fait une erreur de note. Que faire ?",
      answer:
        "Retournez dans Enseignements & Évaluation, sélectionnez le bon module/groupe/semestre et corrigez la note : la moyenne se recalcule. Si une structure (groupe-classe, module) est absente, signalez-le à la direction.",
    },
    {
      question: "Mes statistiques semblent fausses.",
      answer:
        "Vérifiez d'abord la complétude de vos saisies : une statistique fausse vient presque toujours d'une note manquante. Assurez-vous aussi de comparer la même période.",
    },
  ],
  glossary: [
    {
      term: "Élève-maître",
      definition:
        "Personne en formation au CAFOP pour devenir instituteur ; l'« élève » du professeur de CAFOP.",
    },
    {
      term: "Groupe-classe",
      definition:
        "Sous-ensemble d'une promotion regroupant les élèves-maîtres pour les enseignements et les évaluations.",
    },
    {
      term: "Module",
      definition:
        "Enseignement que vous dispensez et évaluez (ex. Didactique du français).",
    },
    {
      term: "Mention",
      definition:
        "Distinction associée à une moyenne (Passable à Très bien), calculée à partir de vos évaluations.",
    },
    {
      term: "Remédiation",
      definition:
        "Séance de renforcement décidée à partir des points faibles repérés dans les statistiques.",
    },
  ],
};
