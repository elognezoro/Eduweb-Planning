import type { GuideContent } from "@/components/guides/guide-layout";

/**
 * Guide du Directeur de CAFOP.
 *
 * Le directeur dispose des mêmes accès que l'Admin CAFOP, avec un angle « direction » :
 * pilotage des promotions, supervision des enseignements, lecture stratégique des
 * statistiques, validation des rapports. Le CAFOP est une structure AUTONOME.
 * Style « détaillé » : théorie + exemple concret + pas-à-pas.
 */
export const guideCafopDirecteur: Omit<GuideContent, "icon"> = {
  roleKey: "cafop_directeur",
  roleLabel: "Directeur de CAFOP",
  meta: {
    level: "Intermédiaire",
    duration: "55 min",
    targetAudience:
      "Directeur (des études) d'un CAFOP, responsable du pilotage des promotions, de la supervision des enseignements et des évaluations, de l'analyse statistique et de la validation des rapports.",
    context:
      "À utiliser comme tableau de bord de direction : à la rentrée, aux jalons d'évaluation et lors des bilans semestriels et annuels.",
  },
  objectives: [
    "Situer la direction du CAFOP dans la formation initiale des instituteurs.",
    "Piloter les centres et les promotions d'élèves-maîtres.",
    "Superviser les enseignements et la cohérence des évaluations.",
    "Lire les statistiques pour décider des appuis pédagogiques.",
    "Produire, dater et archiver les rapports de direction.",
    "Retrouver la documentation et les formations dans le Centre de formation.",
  ],
  prerequisites: [
    "Disposer d'un compte au rôle « Directeur de CAFOP » activé.",
    "Connaître l'organisation de votre CAFOP (centres, promotions, modules).",
    "Maîtriser la lecture d'indicateurs (moyennes, mentions, classements).",
    "Respecter la confidentialité des données des élèves-maîtres.",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. La direction du CAFOP",
      intro:
        "Diriger un CAFOP, c'est garantir la qualité de la formation initiale des instituteurs. Le module vous donne les leviers correspondants : la gestion des promotions, le suivi pédagogique et le pilotage par les données, réunis dans un espace autonome.",
      sections: [
        {
          title: "Comprendre votre tableau de bord de direction",
          body:
            "Le module CAFOP s'organise en quatre volets qui épousent le cycle de la formation : Gestion (centres, promotions), Enseignements & Évaluation, Statistiques et Rapports. En tant que directeur, vous disposez de l'accès complet : vous arbitrez et validez à chaque étape.",
          example:
            "M. Koffi, directeur des études du CAFOP de Daloa, ouvre le module à la rentrée : il vérifie les promotions entrantes, contrôle l'avancement, puis surveille tout au long de l'année les statistiques pour décider des renforts.",
          steps: [
            {
              instruction: "Ouvrez le module CAFOP.",
              navigation: "Système → CAFOP",
            },
            {
              instruction:
                "Parcourez les quatre onglets : Gestion, Enseignements & Évaluation, Statistiques, Rapports.",
              tip: "Adoptez un rythme : Gestion à la rentrée, Statistiques en continu, Rapports aux échéances.",
            },
          ],
        },
      ],
    },
    {
      id: "promotions",
      title: "2. Piloter centres et promotions",
      intro:
        "La direction commence par une base juste : centres et promotions à jour. Sans cela, ni le suivi ni les comparaisons n'ont de valeur.",
      sections: [
        {
          title: "Tenir les centres et faire avancer les promotions",
          body:
            "Un CAFOP peut regrouper plusieurs centres, chacun portant des promotions (cohortes d'élèves-maîtres). Faire avancer une promotion d'un semestre à l'autre maintient la cohérence des indicateurs et permet les comparaisons inter-centres.",
          example:
            "Le CAFOP de Daloa compte deux centres. À la fin du semestre 2, vous faites passer la promotion 2025 au semestre 3 : les effectifs et l'analyse par genre se recalculent pour la nouvelle période.",
          steps: [
            {
              instruction: "Ouvrez l'onglet Gestion (centres puis promotions).",
              navigation: "CAFOP → Gestion",
            },
            {
              instruction:
                "Vérifiez les centres, puis mettez à jour l'avancement de chaque promotion.",
              tip: "Actualisez l'avancement à chaque changement de semestre.",
            },
          ],
        },
      ],
    },
    {
      id: "enseignements",
      title: "3. Superviser enseignements et évaluations",
      intro:
        "Le directeur ne saisit pas seulement : il veille à la cohérence. La supervision des évaluations garantit l'équité entre groupes-classes et la fiabilité des moyennes.",
      sections: [
        {
          title: "Contrôler la cohérence des évaluations",
          body:
            "Les évaluations des modules alimentent moyennes, mentions et classements. Votre rôle est de vérifier que les saisies sont complètes et homogènes avant toute communication officielle des résultats.",
          example:
            "Avant la publication, vous repérez qu'un groupe-classe n'a pas de note en « Didactique des mathématiques ». Vous le signalez au professeur concerné : la moyenne du groupe sera juste avant diffusion.",
          steps: [
            {
              instruction:
                "Ouvrez l'onglet Enseignements & Évaluation et vérifiez la complétude par module.",
              navigation: "CAFOP → Enseignements & Évaluation",
            },
            {
              instruction:
                "Contrôlez la cohérence des moyennes avant de valider les résultats.",
            },
          ],
          bestPractices: [
            "Exigez une saisie au fil de l'eau pour éviter l'engorgement de fin de semestre.",
            "Ne publiez les résultats qu'après contrôle de complétude et de cohérence.",
          ],
        },
      ],
    },
    {
      id: "statistiques",
      title: "4. Décider à partir des statistiques",
      intro:
        "Diriger, c'est arbitrer sur des faits. Les statistiques révèlent les écarts entre centres et entre groupes : c'est votre instrument de décision pédagogique.",
      sections: [
        {
          title: "Lire les écarts et déclencher des appuis",
          body:
            "Indicateurs clés, analyse par genre, classements, mentions et répartition par CAFOP : ces vues, lues à période égale, vous disent où concentrer l'effort. Une décision d'appui se fonde sur un écart constaté, pas sur une impression.",
          example:
            "Le classement montre que le centre B affiche 12 points de moins de mentions « Bien » que le centre A. Vous décidez un appui ciblé en didactique pour le semestre suivant et le notez dans le rapport.",
          steps: [
            {
              instruction: "Ouvrez l'onglet Statistiques.",
              navigation: "CAFOP → Statistiques",
            },
            {
              instruction:
                "Comparez centres et groupes à période égale, puis décidez les appuis.",
              tip: "Documentez la décision : elle sera évaluée au bilan suivant.",
            },
          ],
        },
      ],
    },
    {
      id: "rapports",
      title: "5. Rapports de direction",
      intro:
        "Le rapport scelle le pilotage : il rend compte des résultats et des décisions. Daté et archivé, il devient la mémoire de votre direction.",
      sections: [
        {
          title: "Générer, dater et archiver les rapports",
          body:
            "Vous générez les rapports d'activité à partir des données du CAFOP, les filtrez et les retrouvez dans les rapports disponibles. Une série de rapports datés permet de mesurer la progression d'un semestre à l'autre.",
          example:
            "En fin de semestre, vous générez le rapport de la promotion 2026, y consignez l'appui décidé au centre B, le datez et l'archivez. Au semestre suivant, vous mesurez l'effet de la décision.",
          steps: [
            {
              instruction: "Ouvrez l'onglet Rapports.",
              navigation: "CAFOP → Rapports",
            },
            {
              instruction:
                "Générez le rapport, appliquez les filtres, datez puis archivez-le.",
            },
          ],
          bestPractices: [
            "Un rapport par échéance : la régularité fait la valeur de suivi.",
            "Consignez les décisions d'appui pour les évaluer ensuite.",
          ],
        },
      ],
    },
    {
      id: "centre-formation",
      title: "6. Centre de formation",
      intro:
        "Le Centre de formation réunit les séminaires interactifs, le manuel académique et les guides par rôle — dont le présent guide.",
      sections: [
        {
          title: "Accéder au Centre de formation et à votre guide",
          body:
            "Depuis l'Aide, vous accédez aux ressources qui vous concernent : le guide Directeur de CAFOP (celui-ci), le manuel académique et, selon vos inscriptions, les séminaires. Le guide et le manuel s'ouvrent automatiquement selon votre rôle.",
          steps: [
            {
              instruction: "Ouvrez le Centre de formation.",
              navigation: "Accueil → Aide",
            },
            {
              instruction:
                "Repérez la section des guides utilisateurs et ouvrez le guide Directeur de CAFOP.",
              tip: "Gardez-le en favori : c'est votre référence de pilotage.",
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
      question: "Quelle différence entre Directeur de CAFOP et Admin CAFOP ?",
      answer:
        "Les deux disposent de l'accès complet au module CAFOP. Le directeur l'aborde sous l'angle de la décision et de la validation (supervision des évaluations, arbitrage des appuis, validation des rapports), là où l'admin se concentre souvent sur la saisie et la maintenance des données.",
    },
    {
      question: "À quelle fréquence consulter les statistiques ?",
      answer:
        "En continu pendant le semestre, et systématiquement avant chaque décision d'appui ou publication de résultats. Comparez toujours à période égale.",
    },
    {
      question: "Pourquoi documenter les décisions dans les rapports ?",
      answer:
        "Parce qu'un rapport daté qui consigne une décision permet d'en mesurer l'effet au bilan suivant : c'est ce qui transforme le pilotage en amélioration continue.",
    },
  ],
  glossary: [
    {
      term: "CAFOP",
      definition:
        "Centre d'Animation et de Formation Pédagogique : formation initiale des instituteurs. Module autonome dans EduWeb Planner.",
    },
    {
      term: "Promotion",
      definition:
        "Cohorte d'élèves-maîtres suivie sur la durée de la formation, rattachée à un centre.",
    },
    {
      term: "Avancement",
      definition:
        "Position d'une promotion dans son parcours (semestre), à actualiser pour garder des statistiques cohérentes.",
    },
    {
      term: "Mention",
      definition:
        "Distinction associée à une moyenne (Passable à Très bien), exploitée dans les classements et les statistiques.",
    },
    {
      term: "Appui pédagogique",
      definition:
        "Renfort décidé à partir d'un écart constaté dans les statistiques, consigné dans le rapport pour évaluation ultérieure.",
    },
    {
      term: "Rapport de direction",
      definition:
        "Synthèse datée des résultats et décisions du CAFOP, archivée pour le suivi dans le temps.",
    },
  ],
};
