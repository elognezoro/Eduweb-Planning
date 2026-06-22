import type { GuideContent } from "@/components/guides/guide-layout";

/**
 * Guide du Chef d'Antenne APFC.
 *
 * Le chef d'antenne supervise SON antenne : rapports d'antenne, suivi des activités,
 * communication. Il ne gère pas le registre global des antennes (réservé à l'Admin APFC).
 * Style « détaillé » : théorie + exemple concret + pas-à-pas.
 */
export const guideChefAntenne: Omit<GuideContent, "icon"> = {
  roleKey: "chef_antenne",
  roleLabel: "Chef d'Antenne APFC",
  meta: {
    level: "Intermédiaire",
    duration: "40 min",
    targetAudience:
      "Responsable d'une antenne APFC, chargé du suivi des activités de formation continue de son antenne, de la production de ses rapports et de la communication avec ses formateurs.",
    context:
      "À utiliser au quotidien pour le pilotage de votre antenne et à chaque échéance de reporting (trimestre, bilan annuel).",
  },
  objectives: [
    "Situer le rôle du chef d'antenne dans le dispositif APFC et son périmètre (son antenne).",
    "Produire et suivre les rapports d'activité de votre antenne.",
    "Filtrer et organiser les rapports par antenne et par période.",
    "Communiquer avec les formateurs et planifier les rendez-vous.",
    "Retrouver la documentation et les formations dans le Centre de formation.",
  ],
  prerequisites: [
    "Disposer d'un compte au rôle « Chef d'Antenne APFC » activé.",
    "Connaître les activités de formation continue de votre antenne.",
    "Comprendre la différence entre brouillon et rapport validé.",
    "Respecter la confidentialité des données des formateurs.",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Votre rôle et votre périmètre",
      intro:
        "Le chef d'antenne est le relais de proximité de l'APFC : il anime et rend compte de la formation continue sur son territoire. Son périmètre est ciblé — son antenne — ce qui distingue clairement son rôle de l'administration globale du réseau.",
      sections: [
        {
          title: "Comprendre ce que vous pilotez (et ce que vous ne pilotez pas)",
          body:
            "Vous supervisez les activités et les rapports de VOTRE antenne. La création/modification du registre national des antennes (codes, localisations) relève de l'Admin APFC : cette séparation garantit l'intégrité du réseau tout en vous laissant la main sur votre activité de terrain.",
          example:
            "M. Bamba, chef de l'« Antenne APFC Abidjan », produit chaque trimestre le rapport d'activités de son antenne. Il n'a pas à créer de nouvelles antennes : il se concentre sur l'animation et le reporting de la sienne.",
          steps: [
            {
              instruction: "Ouvrez l'espace des rapports d'antennes.",
              navigation: "Inspection & supervision → Rapports d'antennes",
            },
            {
              instruction:
                "Sélectionnez votre antenne dans le filtre « Antenne » pour ne voir que vos rapports.",
              tip: "Travaillez toujours antenne sélectionnée : vous évitez les confusions avec les autres antennes.",
            },
          ],
        },
      ],
    },
    {
      id: "rapports-antenne",
      title: "2. Produire et suivre les rapports d'antenne",
      intro:
        "Le rapport est la preuve et la mémoire de l'activité de votre antenne. Sa régularité fait la qualité du suivi : un rapport par échéance construit, trimestre après trimestre, une série comparable.",
      sections: [
        {
          title: "Générer un rapport et suivre son statut",
          body:
            "Chaque rapport porte un intitulé, une période, une antenne (sa portée), un auteur, une date et un statut : brouillon ou validé. Le brouillon se travaille jusqu'à validation ; le rapport validé devient la référence officielle de la période.",
          example:
            "Pour le 2ᵉ trimestre, vous générez « Activités du trimestre — Antenne Abidjan ». Il reste en brouillon le temps de la relecture, puis vous le validez : il rejoint les rapports validés et alimente le bilan annuel.",
          steps: [
            {
              instruction:
                "Dans Rapports d'antennes, sélectionnez votre antenne et la période.",
              navigation: "Inspection & supervision → Rapports d'antennes",
            },
            {
              instruction:
                "Générez le rapport, complétez-le, puis faites-le passer de brouillon à validé.",
            },
            {
              instruction:
                "Exportez le rapport (PDF / Word) pour le transmettre ou l'archiver.",
              tip: "Datez et conservez chaque rapport : un rapport non archivé n'a pas de valeur de suivi.",
            },
          ],
          bestPractices: [
            "Produisez un rapport à chaque échéance pour disposer d'une série comparable.",
            "Ne validez qu'après relecture : le statut « validé » engage votre antenne.",
          ],
        },
      ],
    },
    {
      id: "communication-rdv",
      title: "3. Communication et rendez-vous",
      intro:
        "Animer une antenne, c'est coordonner des personnes. Les outils de communication et de rendez-vous transforment l'organisation informelle en suivi traçable.",
      sections: [
        {
          title: "Échanger avec les formateurs et planifier",
          body:
            "Vous communiquez avec les formateurs de votre antenne et planifiez les rendez-vous liés aux activités. Une trace écrite des échanges et un agenda partagé évitent les oublis et les malentendus.",
          example:
            "Avant un regroupement disciplinaire, vous envoyez un message aux formateurs concernés et créez un rendez-vous : chacun reçoit l'information et la date au même endroit.",
          steps: [
            {
              instruction: "Ouvrez la messagerie pour informer les formateurs.",
              navigation: "Communication → Messages",
            },
            {
              instruction: "Planifiez les rencontres dans les rendez-vous.",
              navigation: "Vie scolaire → Rendez-vous",
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
            "Depuis l'Aide, vous accédez aux ressources qui vous concernent : le guide Chef d'Antenne APFC (celui-ci), le manuel académique et, selon vos inscriptions, les séminaires. Le guide et le manuel s'ouvrent automatiquement selon votre rôle.",
          steps: [
            {
              instruction: "Ouvrez le Centre de formation.",
              navigation: "Accueil → Aide",
            },
            {
              instruction:
                "Repérez la section des guides utilisateurs et ouvrez le guide Chef d'Antenne APFC.",
              tip: "Gardez-le en favori : c'est votre référence pour le reporting et la communication.",
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
      question: "Puis-je créer ou modifier des antennes ?",
      answer:
        "Non. La gestion du registre des antennes (création, codes, localisations) relève de l'Admin APFC. Vous, chef d'antenne, pilotez les activités et les rapports de votre propre antenne.",
    },
    {
      question: "Quelle différence entre un rapport en brouillon et un rapport validé ?",
      answer:
        "Le brouillon est un rapport en cours, modifiable. Le rapport validé est la version officielle d'une période : ne validez qu'après relecture, car il devient la référence.",
    },
    {
      question: "Comment ne voir que les rapports de mon antenne ?",
      answer:
        "Utilisez le filtre « Antenne » en haut de l'espace Rapports d'antennes et sélectionnez la vôtre : la liste et les indicateurs se limitent alors à votre périmètre.",
    },
  ],
  glossary: [
    {
      term: "Antenne APFC",
      definition:
        "Unité de terrain de la formation continue dont vous êtes responsable ; elle porte vos activités et vos rapports.",
    },
    {
      term: "Rapport d'antenne",
      definition:
        "Document de synthèse de l'activité de votre antenne sur une période, avec un statut brouillon ou validé.",
    },
    {
      term: "Brouillon / Validé",
      definition:
        "Statuts d'un rapport : le brouillon est modifiable ; le rapport validé est la version officielle de référence.",
    },
    {
      term: "Période",
      definition:
        "Intervalle de reporting (trimestre, bilan annuel) servant à comparer l'activité d'une échéance à l'autre.",
    },
    {
      term: "Regroupement disciplinaire",
      definition:
        "Type d'activité de formation continue réunissant les formateurs d'une même discipline.",
    },
  ],
};
