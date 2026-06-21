import type { GuideContent } from "@/components/guides/guide-layout";

/**
 * Guide de l'Admin CAFOP (Centre d'Animation et de Formation Pédagogique).
 *
 * Style « détaillé » : chaque section combine un cadrage théorique (le « pourquoi »),
 * un encadré « Exemple concret » et une procédure pas-à-pas. Le module CAFOP est
 * une structure AUTONOME ; ce guide ne renvoie pas aux autres structures
 * (Établissements, APFC).
 */
export const guideCafopAdmin: Omit<GuideContent, "icon"> = {
  roleKey: "cafop_admin",
  roleLabel: "Admin CAFOP",
  meta: {
    level: "Intermédiaire",
    duration: "55 min",
    targetAudience:
      "Administrateur ou directeur des études d'un Centre d'Animation et de Formation Pédagogique (CAFOP), chargé du pilotage des centres, des promotions d'élèves-maîtres, du suivi des enseignements et de la production des rapports.",
    context:
      "À utiliser dès la prise en main du module CAFOP, puis comme référence à chaque temps fort de l'année de formation (rentrée, évaluations semestrielles, bilans).",
  },
  objectives: [
    "Comprendre la place du CAFOP dans le dispositif de formation initiale des enseignants et le périmètre de votre rôle.",
    "Gérer les centres CAFOP et les promotions d'élèves-maîtres.",
    "Suivre les enseignements et les évaluations des modules de formation.",
    "Exploiter les statistiques (indicateurs, genre, classements, répartition) pour piloter la qualité.",
    "Produire et diffuser les rapports d'activité du centre.",
    "Retrouver à tout moment la documentation et les formations dans le Centre de formation.",
  ],
  prerequisites: [
    "Disposer d'un compte au rôle « Admin CAFOP » activé.",
    "Connaître l'organisation de votre CAFOP (centres, promotions, modules).",
    "Maîtriser la navigation web de base (recherche, filtres, export).",
    "Respecter la confidentialité des données personnelles des élèves-maîtres.",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Prise en main du module CAFOP",
      intro:
        "Le CAFOP forme les futurs instituteurs : sa mission est la qualité de la formation initiale. Le module reflète cette mission en réunissant, dans un espace autonome, la gestion des centres, le suivi pédagogique et le pilotage par les données.",
      sections: [
        {
          title: "Comprendre votre rôle et le périmètre du module",
          body:
            "En tant qu'Admin CAFOP, vous administrez un dispositif distinct de la vie scolaire ordinaire : il ne s'agit pas d'élèves mais d'élèves-maîtres en formation. Le module est organisé en quatre volets — Gestion, Enseignements & Évaluation, Statistiques et Rapports — qui suivent le cycle de vie d'une promotion, de l'inscription au bilan.",
          example:
            "M. Konan, directeur des études du CAFOP de Bouaké, ouvre le module en début d'année : il y retrouve ses deux centres, la promotion entrante, les modules d'enseignement à suivre et les rapports de l'an passé — le tout sans quitter l'espace CAFOP.",
          steps: [
            {
              instruction: "Ouvrez le module CAFOP.",
              navigation: "Système → CAFOP",
            },
            {
              instruction:
                "Repérez les quatre onglets : Gestion, Enseignements & Évaluation, Statistiques, Rapports.",
              tip: "Chaque onglet correspond à une phase de votre activité ; vous y reviendrez selon le calendrier de formation.",
            },
          ],
        },
      ],
    },
    {
      id: "gestion-centres-promotions",
      title: "2. Centres et promotions",
      intro:
        "La gestion est le socle : sans centres et promotions correctement déclarés, ni le suivi pédagogique ni les statistiques ne sont fiables. C'est donc la première chose à mettre à jour à chaque rentrée.",
      sections: [
        {
          title: "Gérer les centres CAFOP",
          body:
            "Un CAFOP peut regrouper plusieurs centres. Chaque centre porte les promotions et leurs groupes-classes. Tenir cette liste à jour conditionne la justesse des répartitions et des classements.",
          example:
            "Le CAFOP de Bouaké déclare deux centres : « Bouaké I » et « Bouaké II ». La promotion 2026 sera ensuite rattachée à l'un ou l'autre, ce qui permettra plus tard de comparer leurs taux de réussite.",
          steps: [
            {
              instruction: "Ouvrez l'onglet Gestion, section Centres CAFOP.",
              navigation: "CAFOP → Gestion → Centres CAFOP",
            },
            {
              instruction: "Vérifiez ou ajoutez chaque centre du CAFOP.",
            },
          ],
        },
        {
          title: "Suivre l'avancement des promotions",
          body:
            "Une promotion est une cohorte d'élèves-maîtres suivie sur la durée de la formation (généralement deux ans / quatre semestres). Le suivi de l'avancement permet de situer chaque promotion dans son parcours.",
          example:
            "La promotion 2025 passe du semestre 2 au semestre 3 : vous actualisez son avancement, et les indicateurs (effectifs, genre) se recalculent pour le nouveau semestre.",
          steps: [
            {
              instruction: "Ouvrez la section Promotions.",
              navigation: "CAFOP → Gestion → Promotions",
            },
            {
              instruction:
                "Mettez à jour l'avancement de chaque promotion par centre.",
              tip: "Faites-le à chaque changement de semestre pour garder des statistiques cohérentes.",
            },
          ],
        },
      ],
    },
    {
      id: "enseignements-evaluation",
      title: "3. Enseignements et évaluation",
      intro:
        "La valeur d'un CAFOP tient à la qualité des enseignements dispensés et à la rigueur de leur évaluation. Ce volet relie les modules de formation aux résultats des élèves-maîtres.",
      sections: [
        {
          title: "Suivre les modules et saisir les évaluations",
          body:
            "Les modules actifs structurent la formation ; leurs évaluations alimentent les moyennes, les mentions et les classements. Une saisie régulière évite l'engorgement en fin de semestre et fiabilise les bilans.",
          example:
            "Pour le module « Didactique du français », les notes du semestre sont saisies par groupe-classe ; le système calcule les moyennes et fait apparaître les mentions, exploitables ensuite dans les statistiques.",
          steps: [
            {
              instruction:
                "Ouvrez l'onglet Enseignements & Évaluation.",
              navigation: "CAFOP → Enseignements & Évaluation",
            },
            {
              instruction:
                "Sélectionnez le module, le groupe-classe et le semestre, puis saisissez les évaluations.",
            },
          ],
          bestPractices: [
            "Saisissez les évaluations au fil de l'eau, module par module.",
            "Vérifiez la cohérence des moyennes avant de communiquer les résultats.",
          ],
        },
      ],
    },
    {
      id: "statistiques",
      title: "4. Statistiques et pilotage",
      intro:
        "Piloter, c'est décider à partir de faits. Les statistiques transforment les saisies de base en indicateurs lisibles : c'est l'outil qui révèle les écarts (entre centres, entre genres) et oriente les actions correctives.",
      sections: [
        {
          title: "Lire les indicateurs et les répartitions",
          body:
            "Le volet Statistiques agrège les données en indicateurs clés, analyses par genre, classements, mentions et répartition par CAFOP. Bien lus, ils signalent où concentrer l'effort de formation.",
          example:
            "Le classement fait apparaître que le centre « Bouaké II » a un taux de mention « Bien » inférieur de 10 points à « Bouaké I ». Vous décidez d'un appui pédagogique ciblé sur ce centre pour le semestre suivant.",
          steps: [
            {
              instruction: "Ouvrez l'onglet Statistiques.",
              navigation: "CAFOP → Statistiques",
            },
            {
              instruction:
                "Parcourez les indicateurs clés, l'analyse par genre, les classements et la répartition par CAFOP.",
              tip: "Comparez toujours à la même période (semestre) pour des conclusions valides.",
            },
          ],
        },
      ],
    },
    {
      id: "rapports",
      title: "5. Rapports d'activité",
      intro:
        "Le rapport est la trace officielle du pilotage : il rend compte, à votre hiérarchie comme à vous-même, de l'activité et des résultats du centre. Sa régularité fait la qualité du suivi dans le temps.",
      sections: [
        {
          title: "Générer et suivre les rapports",
          body:
            "Vous générez des rapports d'activité à partir des données du centre, vous les filtrez et vous les retrouvez dans la liste des rapports disponibles. Un rapport daté et archivé constitue une référence pour les bilans annuels.",
          example:
            "En fin de semestre, vous générez le rapport d'activité de la promotion 2026, le datez et l'archivez ; il sera comparé au rapport du semestre suivant pour mesurer la progression.",
          steps: [
            {
              instruction: "Ouvrez l'onglet Rapports.",
              navigation: "CAFOP → Rapports",
            },
            {
              instruction:
                "Utilisez « Générer un rapport », appliquez les filtres utiles, puis retrouvez-le dans les rapports disponibles.",
            },
          ],
          bestPractices: [
            "Générez un rapport à chaque fin de semestre pour disposer d'une série comparable.",
            "Archivez systématiquement : un rapport non conservé n'a pas de valeur de suivi.",
          ],
        },
      ],
    },
    {
      id: "centre-formation",
      title: "6. Centre de formation",
      intro:
        "Le Centre de formation est la bibliothèque d'accompagnement d'EduWeb Planner : il réunit les séminaires interactifs, le manuel académique et les guides par rôle — dont le présent guide.",
      sections: [
        {
          title: "Accéder au Centre de formation et à votre guide",
          body:
            "Depuis l'Aide, vous accédez aux ressources qui vous concernent : le guide Admin CAFOP (celui-ci), le manuel académique et, selon vos inscriptions, les séminaires de formation. Le guide et le manuel sont ouverts automatiquement selon votre rôle.",
          steps: [
            {
              instruction: "Ouvrez le Centre de formation.",
              navigation: "Accueil → Aide",
            },
            {
              instruction:
                "Repérez la section des guides utilisateurs et ouvrez le guide Admin CAFOP.",
              tip: "Gardez-le en favori : c'est votre référence pour chaque manipulation courante.",
            },
          ],
          caveat:
            "L'accès à une formation (séminaire) requiert une inscription, attribuée par un administrateur ou un gestionnaire. Le guide et le manuel restent, eux, accessibles directement selon votre rôle.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Le module CAFOP est-il lié à la gestion des établissements scolaires ordinaires ?",
      answer:
        "Non. Le CAFOP est une structure autonome : il gère des élèves-maîtres en formation, pas des élèves d'établissements. Ses données, ses statistiques et ses rapports lui sont propres.",
    },
    {
      question: "À quelle fréquence dois-je mettre à jour l'avancement des promotions ?",
      answer:
        "À chaque changement de semestre. C'est ce qui garantit la cohérence des indicateurs et des classements affichés dans le volet Statistiques.",
    },
    {
      question: "Comment comparer la performance de deux centres du même CAFOP ?",
      answer:
        "Dans l'onglet Statistiques, utilisez les classements et la répartition par CAFOP sur la même période. Un écart de mentions ou de moyennes signale où porter l'effort pédagogique.",
    },
    {
      question: "Que faire d'un rapport généré ?",
      answer:
        "Datez-le et conservez-le dans les rapports disponibles. Un rapport archivé sert de point de comparaison pour les bilans semestriels et annuels.",
    },
  ],
  glossary: [
    {
      term: "CAFOP",
      definition:
        "Centre d'Animation et de Formation Pédagogique : structure de formation initiale des instituteurs. Module autonome dans EduWeb Planner.",
    },
    {
      term: "Élève-maître",
      definition:
        "Personne en formation au CAFOP pour devenir instituteur ; l'équivalent, pour le CAFOP, de l'élève d'un établissement scolaire.",
    },
    {
      term: "Promotion",
      definition:
        "Cohorte d'élèves-maîtres suivie sur la durée de la formation (généralement quatre semestres), rattachée à un centre.",
    },
    {
      term: "Centre CAFOP",
      definition:
        "Unité de formation au sein d'un CAFOP ; un CAFOP peut en regrouper plusieurs. Les promotions et groupes-classes y sont rattachés.",
    },
    {
      term: "Groupe-classe",
      definition:
        "Sous-ensemble d'une promotion regroupant les élèves-maîtres pour les enseignements et les évaluations.",
    },
    {
      term: "Mention",
      definition:
        "Distinction associée à une moyenne (Passable, Assez bien, Bien, Très bien) ; exploitée dans les classements et les statistiques.",
    },
    {
      term: "Rapport d'activité",
      definition:
        "Document de synthèse du pilotage du centre, généré à partir des données et archivé pour le suivi dans le temps.",
    },
  ],
};
