import type { GuideContent } from "@/components/guides/guide-layout";

export const guideInspecteur: Omit<GuideContent, "icon"> = {
  roleKey: "inspecteur",
  roleLabel: "Inspecteur",
  meta: {
    level: "Intermédiaire",
    duration: "60 min",
    targetAudience: "Inspecteurs pédagogiques et inspecteurs d'enseignement intervenant dans les établissements primaires et secondaires, dans le cadre du dispositif DRENA / DRENAET.",
    context: "À utiliser lors d'une formation initiale à EduWeb Planner pour les inspecteurs, ou en auto-formation avant la première mission d'inspection saisie sur la plateforme.",
  },
  objectives: [
    "Comprendre le rôle de l'inspecteur sur EduWeb Planner et son périmètre d'action.",
    "Être capable de planifier une mission d'inspection et de prendre rendez-vous avec les acteurs concernés.",
    "Savoir consulter le cahier de texte d'un enseignant en vue d'une inspection.",
    "Être capable de renseigner la grille d'évaluation en classe de manière factuelle.",
    "Savoir rédiger un rapport d'inspection structuré, identifiant points forts et axes de progrès.",
    "Être capable de formuler et de suivre des recommandations adressées à l'enseignant et à l'établissement.",
    "Comprendre les indicateurs statistiques disponibles pour piloter la supervision.",
    "Savoir communiquer les constats aux acteurs dans le respect des règles institutionnelles.",
  ],
  prerequisites: [
    "Disposer d'un compte EduWeb Planner avec le rôle Inspecteur activé par votre DRENA.",
    "Connaître le périmètre d'établissements rattaché à votre mission.",
    "Avoir pris connaissance du référentiel d'inspection en vigueur dans votre pays.",
    "Maîtriser les bases de la navigation sur un navigateur web moderne.",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Prise en main de l'espace Inspecteur",
      intro: "Avant toute mission d'inspection, l'inspecteur doit maîtriser son environnement de travail sur EduWeb Planner : connexion sécurisée, repérage des modules de supervision et personnalisation de son profil. Ce premier chapitre pose les bases indispensables à toute activité ultérieure.",
      sections: [
        {
          title: "1.1 Se connecter et accéder à son tableau de bord",
          body: "La connexion à EduWeb Planner se fait depuis la page d'accueil publique de la plateforme. L'inspecteur utilise les identifiants qui lui ont été délivrés par sa DRENA ou son administrateur national. Une fois authentifié, il arrive sur le module « Accueil », point d'entrée personnalisé qui rappelle ses prochaines visites et les notifications en attente.",
          steps: [
            {
              instruction: "Ouvrez la page d'accueil d'EduWeb Planner dans votre navigateur.",
              navigation: "Bouton Connexion en haut à droite",
            },
            {
              instruction: "Saisissez votre adresse professionnelle et votre mot de passe, puis validez.",
            },
            {
              instruction: "À la première connexion, modifiez immédiatement votre mot de passe.",
              tip: "Choisissez une phrase de passe longue plutôt qu'un mot court.",
            },
            {
              instruction: "Vérifiez la page « Accueil » qui affiche votre tableau de bord d'inspecteur.",
              navigation: "Menu Accueil",
            },
          ],
          bestPractices: [
            "Ne partagez jamais vos identifiants, même avec un collègue inspecteur.",
            "Verrouillez votre session lorsque vous quittez votre poste sur le terrain.",
          ],
        },
        {
          title: "1.2 Comprendre la vue d'ensemble du périmètre supervisé",
          body: "Le module « Vue d'ensemble » synthétise votre périmètre d'inspection : nombre d'établissements rattachés, enseignants concernés, indicateurs clés du moment. Cette vue panoramique permet de repérer rapidement les zones nécessitant une attention prioritaire avant même d'ouvrir un dossier.",
          steps: [
            {
              instruction: "Ouvrez la vue d'ensemble depuis le menu principal.",
              navigation: "Menu Accueil → Vue d'ensemble",
            },
            {
              instruction: "Identifiez les indicateurs en alerte (effectifs, performances en baisse).",
              tip: "Les indicateurs critiques sont mis en évidence par un visuel distinctif.",
            },
            {
              instruction: "Notez les établissements ou disciplines à inspecter en priorité.",
            },
          ],
        },
        {
          title: "1.3 Renseigner son identification et son profil",
          body: "Les modules « Mon identification » et « Mon profil » permettent de tenir à jour vos coordonnées administratives (matricule, DRENA de rattachement, discipline d'inspection) et vos préférences (langue, notifications). Une fiche à jour facilite la coordination avec les chefs d'établissement et les enseignants inspectés.",
          steps: [
            {
              instruction: "Ouvrez votre fiche d'identification.",
              navigation: "Menu Système → Mon identification",
            },
            {
              instruction: "Vérifiez et complétez vos informations administratives.",
            },
            {
              instruction: "Passez ensuite à « Mon profil » pour ajuster vos préférences.",
              navigation: "Menu Système → Mon profil",
            },
            {
              instruction: "Enregistrez vos modifications avant de quitter la page.",
              warning: "Toute modification non enregistrée est perdue à la fermeture.",
            },
          ],
        },
      ],
    },
    {
      id: "preparation-inspection",
      title: "2. Préparer une mission d'inspection",
      intro: "La qualité d'une inspection repose largement sur sa préparation. EduWeb Planner regroupe les outils de planification, de consultation du cahier de texte et de prise de rendez-vous nécessaires à cette phase amont.",
      sections: [
        {
          title: "2.1 Planifier les visites d'inspection",
          body: "Le module « Inspection » centralise la planification des missions. L'inspecteur y déclare ses visites prévues, les établissements et enseignants concernés, ainsi que la période ciblée. Cette planification rend votre activité visible aux chefs d'établissement et permet le suivi institutionnel par la DRENA.",
          steps: [
            {
              instruction: "Ouvrez le module Inspection.",
              navigation: "Menu Inspection & Supervision → Inspection",
            },
            {
              instruction: "Créez une nouvelle mission d'inspection.",
            },
            {
              instruction: "Sélectionnez l'établissement, l'enseignant et la classe concernés.",
            },
            {
              instruction: "Précisez la date, l'heure et l'objet de la visite (inspection ordinaire, suivi, validation de stage…).",
            },
            {
              instruction: "Enregistrez la mission ; elle apparaît dans votre calendrier d'inspection.",
            },
          ],
          caveat: "Vérifiez la cohérence du calendrier scolaire local : une inspection programmée pendant des congés ou un examen est inopérante.",
        },
        {
          title: "2.2 Consulter le cahier de texte avant la visite",
          body: "Le cahier de texte numérique est un outil essentiel de préparation : il permet d'apprécier la progression pédagogique de l'enseignant, le respect du programme officiel et la régularité de l'inscription des séances. L'inspecteur le consulte impérativement avant la visite en classe.",
          steps: [
            {
              instruction: "Ouvrez le cahier de texte.",
              navigation: "Menu Vie scolaire → Cahier de texte",
            },
            {
              instruction: "Filtrez par enseignant, classe et discipline.",
            },
            {
              instruction: "Examinez les séances des dernières semaines : objectifs, contenus, ressources, devoirs.",
              tip: "Repérez les ruptures de continuité ou les séances peu détaillées.",
            },
            {
              instruction: "Notez les éléments à approfondir lors de l'entretien post-visite.",
            },
          ],
        },
        {
          title: "2.3 Prendre rendez-vous avec l'enseignant et le chef d'établissement",
          body: "Pour formaliser la visite, le module « Rendez-vous » permet de poser un créneau partagé avec l'enseignant inspecté et le chef d'établissement. Le rendez-vous matérialise un engagement professionnel et déclenche les notifications aux parties prenantes.",
          steps: [
            {
              instruction: "Ouvrez le module Rendez-vous.",
              navigation: "Menu Vie scolaire → Rendez-vous",
            },
            {
              instruction: "Créez un nouveau rendez-vous lié à la mission d'inspection.",
            },
            {
              instruction: "Invitez l'enseignant et le chef d'établissement comme participants.",
            },
            {
              instruction: "Précisez l'objet, le lieu et la durée prévisionnelle.",
            },
            {
              instruction: "Validez : les destinataires reçoivent une notification dans leur espace.",
            },
          ],
          bestPractices: [
            "Annoncez clairement le type d'inspection (annoncée, semi-annoncée) dès la prise de rendez-vous.",
            "Laissez un délai raisonnable pour permettre à l'enseignant de préparer sa séance.",
          ],
        },
      ],
    },
    {
      id: "evaluation-classe",
      title: "3. Conduire l'évaluation en classe",
      intro: "Le cœur du métier d'inspecteur réside dans l'observation en classe. EduWeb Planner met à disposition une grille d'évaluation structurée qui guide l'observation et garantit l'équité de traitement entre enseignants.",
      sections: [
        {
          title: "3.1 Préparer la grille d'évaluation",
          body: "La grille d'évaluation est une matrice de critères couvrant les dimensions pédagogique, didactique, relationnelle et organisationnelle. Elle est consultable et renseignable depuis le module dédié. L'inspecteur la prépare en amont en sélectionnant le modèle adapté au niveau (primaire, secondaire) et à la discipline.",
          steps: [
            {
              instruction: "Ouvrez la grille d'évaluation.",
              navigation: "Menu Inspection & Supervision → Grille d'évaluation",
            },
            {
              instruction: "Choisissez le modèle correspondant à la mission planifiée.",
            },
            {
              instruction: "Vérifiez la complétude des critères et indicateurs proposés.",
            },
            {
              instruction: "Initialisez la grille à blanc pour la séance à observer.",
            },
          ],
        },
        {
          title: "3.2 Renseigner la grille pendant l'observation",
          body: "Pendant la séance, la grille se renseigne progressivement. Chaque critère reçoit une appréciation et, le cas échéant, un commentaire qualitatif. L'inspecteur veille à appuyer chaque évaluation par une observation factuelle pour préserver la qualité du rapport final.",
          steps: [
            {
              instruction: "Ouvrez la grille préparée pour la séance en cours.",
            },
            {
              instruction: "Notez chaque critère selon le barème proposé.",
            },
            {
              instruction: "Ajoutez un commentaire bref mais factuel à chaque critère sensible.",
              tip: "Décrivez ce qui est observé, pas ce qui est ressenti.",
            },
            {
              instruction: "Enregistrez régulièrement pour éviter toute perte de données.",
              warning: "Sur le terrain, la connexion peut être instable : enregistrez fréquemment.",
            },
          ],
          bestPractices: [
            "Restez discret durant l'observation : votre présence ne doit pas perturber la séance.",
            "Croisez vos notes manuscrites avec la grille numérique pour fiabiliser l'analyse.",
          ],
        },
      ],
    },
    {
      id: "rapport-inspection",
      title: "4. Rédiger le rapport d'inspection",
      intro: "Le rapport d'inspection est le livrable officiel de la mission. Il engage l'inspecteur et structure le dialogue institutionnel avec l'enseignant, l'établissement et la DRENA. Sa rédaction obéit à des règles précises.",
      sections: [
        {
          title: "4.1 Créer et structurer le rapport",
          body: "Le module « Rapports d'inspection » génère un rapport prérempli à partir de la grille d'évaluation renseignée. L'inspecteur le complète par une synthèse qualitative : contexte de la visite, points forts, axes de progrès, conclusions.",
          steps: [
            {
              instruction: "Ouvrez les rapports d'inspection.",
              navigation: "Menu Inspection & Supervision → Rapports d'inspection",
            },
            {
              instruction: "Créez un nouveau rapport lié à la mission concernée.",
            },
            {
              instruction: "Vérifiez l'import automatique des données de la grille d'évaluation.",
            },
            {
              instruction: "Rédigez la synthèse : contexte, observations, points forts, axes de progrès.",
            },
            {
              instruction: "Enregistrez en brouillon avant validation définitive.",
            },
          ],
        },
        {
          title: "4.2 Formuler les recommandations",
          body: "Chaque rapport d'inspection se conclut par des recommandations concrètes adressées à l'enseignant et, le cas échéant, à l'établissement. Une recommandation efficace est mesurable, datée et associée à un responsable identifié. Elle alimente le module de suivi.",
          steps: [
            {
              instruction: "Dans le rapport, accédez à la section Recommandations.",
            },
            {
              instruction: "Pour chaque axe de progrès, créez une recommandation distincte.",
            },
            {
              instruction: "Précisez : priorité, responsable assigné, échéance, modalité de vérification.",
              tip: "Privilégiez 3 à 5 recommandations actionnables plutôt qu'une longue liste.",
            },
            {
              instruction: "Validez l'ensemble du rapport pour transmission officielle.",
              warning: "Une fois validé, le rapport devient consultable par l'enseignant et l'établissement : relisez-le attentivement.",
            },
          ],
          caveat: "Le rapport d'inspection est un document à caractère officiel. Toute mention nominative d'un tiers (élève, parent) doit respecter les obligations de confidentialité applicables.",
        },
      ],
    },
    {
      id: "suivi-recommandations",
      title: "5. Suivre les recommandations dans la durée",
      intro: "L'inspection ne s'arrête pas à la remise du rapport. Le suivi des recommandations dans le temps mesure l'effet réel de l'inspection sur la pratique enseignante et sur la qualité de l'établissement.",
      sections: [
        {
          title: "5.1 Suivre l'avancement des recommandations",
          body: "Le module « Suivi des recommandations » affiche l'état d'avancement de chaque recommandation émise : à faire, en cours, réalisée, abandonnée. L'inspecteur consulte régulièrement ce tableau de bord pour relancer les enseignants ou établissements en retard.",
          steps: [
            {
              instruction: "Ouvrez le suivi des recommandations.",
              navigation: "Menu Inspection & Supervision → Suivi des recommandations",
            },
            {
              instruction: "Filtrez par établissement, enseignant ou statut.",
            },
            {
              instruction: "Identifiez les recommandations en retard ou bloquées.",
            },
            {
              instruction: "Annotez la fiche de suivi avec vos observations complémentaires.",
            },
          ],
        },
        {
          title: "5.2 Planifier une visite de suivi",
          body: "Lorsque les recommandations le justifient, l'inspecteur programme une visite de suivi. Celle-ci se planifie exactement comme une inspection ordinaire, mais en référence à la mission initiale, pour garantir la traçabilité du parcours.",
          steps: [
            {
              instruction: "Depuis le suivi, sélectionnez la mission initiale concernée.",
            },
            {
              instruction: "Utilisez l'option de création d'une mission de suivi.",
              navigation: "Menu Inspection & Supervision → Inspection",
            },
            {
              instruction: "Précisez l'objet de la visite : vérification de la mise en œuvre des recommandations.",
            },
            {
              instruction: "Renseignez une nouvelle grille d'évaluation focalisée sur les axes de progrès.",
            },
          ],
          bestPractices: [
            "Limitez le délai entre rapport initial et visite de suivi à quelques mois pour préserver la dynamique.",
            "Valorisez explicitement les progrès constatés lors du suivi.",
          ],
        },
      ],
    },
    {
      id: "analyse-statistique",
      title: "6. Analyser la performance pédagogique",
      intro: "Au-delà de l'inspection individuelle, l'inspecteur exploite les modules statistiques pour produire un diagnostic global de son périmètre et orienter sa stratégie de supervision.",
      sections: [
        {
          title: "6.1 Lire les statistiques par classe et par établissement",
          body: "Les modules « Par classe » et « Statistiques d'établissement » permettent de comparer les résultats au niveau d'une classe ou d'un établissement entier. Ces analyses aident à identifier les classes en difficulté, les progressions remarquables et les disparités à corriger.",
          steps: [
            {
              instruction: "Ouvrez le module Par classe.",
              navigation: "Menu Statistiques → Par classe",
            },
            {
              instruction: "Sélectionnez l'établissement et la classe à analyser.",
            },
            {
              instruction: "Consultez ensuite les statistiques d'établissement pour la vue agrégée.",
              navigation: "Menu Statistiques → Statistiques d'établissement",
            },
            {
              instruction: "Exportez les données utiles à votre rapport annuel d'activité.",
            },
          ],
        },
        {
          title: "6.2 Apprécier la performance des enseignants",
          body: "Le module « Performance des enseignants » offre une lecture comparée des résultats obtenus par les enseignants d'un même établissement, d'une même discipline ou d'un même niveau. Il complète, sans s'y substituer, l'évaluation qualitative menée lors de l'inspection en classe.",
          steps: [
            {
              instruction: "Ouvrez le module Performance des enseignants.",
              navigation: "Menu Statistiques → Performance des enseignants",
            },
            {
              instruction: "Choisissez le périmètre d'analyse (établissement, discipline, période).",
            },
            {
              instruction: "Identifiez les écarts de performance et les pratiques exemplaires.",
            },
          ],
          caveat: "Les indicateurs chiffrés ne traduisent pas à eux seuls la qualité pédagogique : croisez-les toujours avec vos observations directes.",
        },
        {
          title: "6.3 Mesurer l'efficacité pédagogique globale",
          body: "Le module « Efficacité pédagogique » consolide les indicateurs d'efficacité : progression des élèves, taux de réussite, impact des actions correctives. Cette vue stratégique alimente vos rapports d'activité auprès de la DRENA.",
          steps: [
            {
              instruction: "Ouvrez le module Efficacité pédagogique.",
              navigation: "Menu Statistiques → Efficacité pédagogique",
            },
            {
              instruction: "Définissez la période d'observation (trimestre, année scolaire).",
            },
            {
              instruction: "Analysez les tendances et formulez des hypothèses explicatives.",
            },
          ],
        },
      ],
    },
    {
      id: "communication",
      title: "7. Communiquer avec les enseignants et l'établissement",
      intro: "Le dialogue professionnel est constitutif de la mission d'inspection. EduWeb Planner intègre un module de communication qui garantit la traçabilité des échanges institutionnels.",
      sections: [
        {
          title: "7.1 Envoyer un message officiel",
          body: "Le module « Communication » permet d'adresser des messages aux enseignants inspectés, aux chefs d'établissement ou à d'autres inspecteurs. À la différence d'un courriel personnel, ces messages sont archivés dans le dossier institutionnel.",
          steps: [
            {
              instruction: "Ouvrez le module Communication.",
              navigation: "Menu Vie scolaire → Communication",
            },
            {
              instruction: "Sélectionnez le ou les destinataires concernés.",
            },
            {
              instruction: "Rédigez votre message en restant factuel et professionnel.",
              tip: "Faites référence au rapport ou à la recommandation concernée lorsque c'est pertinent.",
            },
            {
              instruction: "Joignez les pièces utiles (extraits de rapport, ressources).",
            },
            {
              instruction: "Envoyez : la trace est conservée dans l'historique.",
            },
          ],
        },
        {
          title: "7.2 Restituer les constats aux acteurs",
          body: "La restitution orale et écrite des constats est un moment clé. Elle s'appuie sur le rapport validé, mais peut être accompagnée d'un message de synthèse, d'une invitation à un rendez-vous de restitution ou d'une note adressée au chef d'établissement.",
          steps: [
            {
              instruction: "Programmez un rendez-vous de restitution avec l'enseignant.",
              navigation: "Menu Vie scolaire → Rendez-vous",
            },
            {
              instruction: "Préparez une note de synthèse via le module Communication.",
            },
            {
              instruction: "Veillez à un ton bienveillant et constructif, centré sur la progression.",
            },
          ],
          bestPractices: [
            "Évitez les jugements de personne : appuyez-vous sur des faits observés.",
            "Conservez la traçabilité écrite de tous les échanges institutionnels.",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      question: "Puis-je modifier un rapport d'inspection après l'avoir validé ?",
      answer: "Non. Une fois validé, le rapport est consultable par l'enseignant et l'établissement et devient un document de référence. Si une correction est indispensable, contactez votre administrateur de DRENA pour ouvrir un avenant. Il est donc essentiel de relire attentivement le rapport en brouillon avant validation.",
    },
    {
      question: "Comment savoir si l'enseignant a bien pris connaissance de mon rapport ?",
      answer: "Le module Rapports d'inspection indique l'état de consultation de chaque rapport diffusé. Vous pouvez également utiliser le module Communication pour adresser un message de confirmation ou organiser un rendez-vous de restitution.",
    },
    {
      question: "Que faire si la connexion internet est instable lors de l'inspection ?",
      answer: "Renseignez la grille d'évaluation par tronçons en enregistrant fréquemment. Si la connexion est perdue, conservez vos notes manuscrites et reportez les éléments dès que possible. Évitez de fermer l'onglet du navigateur tant que vous n'avez pas confirmé l'enregistrement.",
    },
    {
      question: "Puis-je inspecter un enseignant qui ne figure pas dans mon périmètre ?",
      answer: "Non. Votre périmètre est défini par votre DRENA de rattachement et la matrice de permissions. Toute demande d'inspection hors périmètre doit être validée par votre hiérarchie pour ajustement temporaire de vos habilitations.",
    },
    {
      question: "Comment articuler les indicateurs statistiques avec l'observation en classe ?",
      answer: "Les statistiques (par classe, performance, efficacité) servent à cibler les inspections et à contextualiser les constats. Elles ne remplacent jamais l'observation directe : un enseignant aux résultats moyens peut conduire une pédagogie remarquable, et inversement.",
    },
    {
      question: "Une recommandation peut-elle être adressée à l'établissement et non à l'enseignant ?",
      answer: "Oui. Dans le rapport, vous précisez le responsable assigné : il peut s'agir du chef d'établissement, d'un conseiller pédagogique ou de l'enseignant lui-même. Le suivi des recommandations distingue ces niveaux de responsabilité.",
    },
    {
      question: "Comment programmer une inspection inopinée ?",
      answer: "Créez la mission dans le module Inspection au moment de la visite, sans rendez-vous préalable. Renseignez l'objet « inspection inopinée » pour assurer la traçabilité. Pensez ensuite à compléter la grille d'évaluation et le rapport selon la procédure habituelle.",
    },
    {
      question: "Mes données et celles des enseignants sont-elles confidentielles ?",
      answer: "Oui. L'accès aux rapports, grilles et statistiques est régi par la matrice RBAC. Seuls les acteurs habilités (enseignant concerné, chef d'établissement, DRENA, autres inspecteurs autorisés) accèdent à votre travail. Respectez en retour la confidentialité des élèves et des personnels.",
    },
    {
      question: "Puis-je consulter les anciens rapports d'inspection d'un enseignant ?",
      answer: "Oui, depuis le module Rapports d'inspection, en filtrant par enseignant. L'historique vous permet d'apprécier la trajectoire professionnelle et l'évolution des recommandations dans le temps.",
    },
  ],
  glossary: [
    {
      term: "Mission d'inspection",
      definition: "Visite pédagogique programmée par l'inspecteur dans un établissement, ciblant un enseignant et une séance de classe, et donnant lieu à un rapport officiel.",
    },
    {
      term: "Inspection ordinaire",
      definition: "Visite régulière d'évaluation pédagogique, annoncée à l'enseignant et au chef d'établissement, dans le cadre du plan annuel d'inspection.",
    },
    {
      term: "Inspection inopinée",
      definition: "Visite non annoncée à l'enseignant, destinée à observer la pratique en conditions ordinaires.",
    },
    {
      term: "Visite de suivi",
      definition: "Mission programmée à la suite d'un rapport d'inspection, visant à vérifier la mise en œuvre effective des recommandations.",
    },
    {
      term: "Critère d'observation",
      definition: "Élément précis de la grille d'évaluation, portant sur une dimension de la pratique enseignante (maîtrise disciplinaire, gestion de classe, didactique…).",
    },
    {
      term: "Axe de progrès",
      definition: "Domaine de la pratique enseignante identifié comme prioritaire pour l'amélioration, formalisé dans le rapport et traduit en recommandations.",
    },
    {
      term: "Point fort",
      definition: "Aspect de la pratique enseignante reconnu comme exemplaire ou solide, mis en valeur dans le rapport pour conforter l'enseignant.",
    },
    {
      term: "Note de synthèse",
      definition: "Document court adressé à l'établissement ou à la DRENA, résumant les principaux constats issus d'une inspection ou d'une série d'inspections.",
    },
    {
      term: "Responsable assigné",
      definition: "Acteur (enseignant, chef d'établissement, conseiller pédagogique) désigné comme porteur d'une recommandation et redevable de sa mise en œuvre.",
    },
    {
      term: "Restitution",
      definition: "Moment institutionnel oral ou écrit au cours duquel l'inspecteur présente ses constats à l'enseignant et, le cas échéant, au chef d'établissement.",
    },
    {
      term: "Périmètre d'inspection",
      definition: "Ensemble des établissements, disciplines et enseignants relevant de la compétence d'un inspecteur, défini par la DRENA et la matrice de permissions.",
    },
    {
      term: "Plan annuel d'inspection",
      definition: "Programmation prévisionnelle des missions sur une année scolaire, articulant inspections ordinaires, visites de suivi et missions thématiques.",
    },
  ],
};
