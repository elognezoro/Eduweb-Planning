import type {
  Seminaire,
  SeminaireModule,
  SeminaireQuiz,
  SeminaireH5P,
} from "./types";

/* ============================================================================
   Séminaire « Magnifica Humanitas : rester humains à l'ère de l'intelligence
   artificielle » — lecture éthique, sociale et éducative de l'encyclique du
   Saint-Père Léon XIV, conçu pour les écoles catholiques, leurs cadres,
   formateurs et partenaires éducatifs.

   Contenu fidèle au support source (atelier_magnifica_humanitas_ia_interactif).
   Toute modification doit être ré-alignée avec ce support pour rester
   académiquement cohérente.
   ========================================================================== */

const M0: SeminaireModule = {
  id: "m0",
  num: 0,
  title: "Module 0 — Accueil et diagnostic initial",
  displayTitle: "Entrer dans le chantier de notre époque",
  duration: "45 minutes",
  objective:
    "Permettre aux participants d'entrer dans la formation, d'exprimer leurs représentations de l'IA et de comprendre l'esprit de l'atelier.",
  welcomeMessage:
    "Bienvenue dans cette formation interactive consacrée à Magnifica Humanitas. Vous allez explorer les promesses, les risques et les responsabilités liés à l'intelligence artificielle. Cette formation vous invitera à ne pas choisir entre peur et fascination, mais à exercer un discernement humain, chrétien et social.\n\nL'IA n'est pas seulement une question technique. Elle touche notre manière de penser, d'apprendre, de travailler, de communiquer, de gouverner et de vivre ensemble. L'enjeu central est donc le suivant : comment rester profondément humains dans un monde de plus en plus artificiellement intelligent ?",
  content: [
    {
      kind: "paragraph",
      text: "L'IA suscite à la fois enthousiasme et inquiétude. Magnifica Humanitas propose de dépasser cette opposition pour entrer dans un discernement responsable.",
    },
  ],
  activities: [
    {
      id: "m0-a1",
      num: "0.1",
      title: "Sondage d'entrée",
      kind: "survey",
      recommendation: "Sondage / questionnaire instantané / Wooclap / Mentimeter / activité Moodle « Feedback ».",
      instructions: [
        "Quand vous pensez à l'intelligence artificielle, quel mot vous vient d'abord à l'esprit ?",
      ],
      question: "Quand vous pensez à l'intelligence artificielle, quel mot vous vient d'abord à l'esprit ?",
      options: [
        "Espérance",
        "Peur",
        "Progrès",
        "Danger",
        "Opportunité",
        "Manipulation",
        "Éducation",
        "Emploi",
        "Dépendance",
        "Autre",
      ],
      exploitation:
        "Le formateur affiche le nuage de mots et introduit l'idée suivante : l'IA suscite à la fois enthousiasme et inquiétude. Magnifica Humanitas propose de dépasser cette opposition pour entrer dans un discernement responsable.",
    },
    {
      id: "m0-a2",
      num: "0.2",
      title: "Forum d'ouverture",
      kind: "forum",
      instructions: [
        "Dans votre domaine d'activité, l'IA est-elle déjà présente ? Donnez un exemple concret d'usage actuel ou possible. Dites ensuite si cet usage vous semble plutôt bénéfique, risqué ou ambigu.",
      ],
    },
  ],
  achievement: ["Avoir répondu au sondage.", "Avoir publié au moins une contribution dans le forum."],
};

const M1: SeminaireModule = {
  id: "m1",
  num: 1,
  title: "Module 1 — Comprendre l'encyclique Magnifica Humanitas",
  displayTitle: "Babel ou Jérusalem : le grand choix de l'humanité numérique",
  duration: "1 h 30",
  objective: "Comprendre le message central, la structure et les grandes intuitions de l'encyclique.",
  resume:
    "Magnifica Humanitas part d'un constat : l'humanité vit une mutation profonde avec la numérisation, l'IA et la robotique. Ces technologies ne sont pas mauvaises en elles-mêmes ; elles peuvent soigner, relier, éduquer et protéger la Maison commune. Mais elles ne sont pas neutres dans leurs effets concrets, car elles reflètent les intentions, les intérêts, les modèles économiques et les visions de ceux qui les conçoivent, les financent, les régulent et les utilisent.\n\nLe texte propose deux images bibliques pour orienter le discernement : Babel et Jérusalem. Babel représente la tentation d'un pouvoir technique autosuffisant, uniforme, dominateur, qui sacrifie la personne à l'efficacité. Jérusalem, à travers la figure de Néhémie, représente la reconstruction patiente, communautaire et responsable d'une société fondée sur Dieu, la communion, l'écoute, la diversité et le bien commun.\n\nL'encyclique affirme que l'IA ne doit pas être comprise comme une intelligence humaine. Elle peut imiter certaines fonctions humaines et dépasser l'homme en vitesse de calcul, mais elle n'a ni corps, ni expérience intérieure, ni conscience morale, ni responsabilité, ni capacité véritable d'aimer, de souffrir, de pardonner ou de juger le bien et le mal.\n\nLe texte ne rejette pas la technique. Il reconnaît qu'elle peut soigner, relier, éduquer et protéger. Mais il rappelle qu'elle peut aussi diviser, manipuler, exclure, surveiller et déshumaniser. L'IA doit donc être évaluée à partir de la dignité humaine, du bien commun, de la justice sociale, de la vérité, de la liberté et de la paix.",
  centralMessage:
    "L'IA doit rester un outil au service de la personne humaine, jamais un pouvoir qui décide à la place de l'homme ou qui redéfinit la valeur de l'homme. La technique doit être gouvernée par la conscience, la justice, la vérité, la solidarité et la paix.",
  retain: [
    "L'IA est une transformation profonde de la société.",
    "La technique n'est pas mauvaise en elle-même.",
    "La technique n'est pas neutre dans ses usages concrets.",
    "Le vrai choix n'est pas « pour ou contre l'IA », mais « quelle humanité voulons-nous construire avec l'IA ? »",
    "La personne humaine reste supérieure à toute machine.",
    "Le progrès technique doit être accompagné d'un progrès moral et social.",
  ],
  content: [],
  activities: [
    {
      id: "m1-a1",
      num: "1.1",
      title: "Carte mentale collaborative",
      kind: "mindmap",
      recommendation: "Tableau collaboratif, Padlet, Miro, Moodle Database, glossaire collaboratif.",
      instructions: [
        "Construisez une carte mentale autour de deux pôles : 1) Babel numérique ; 2) Jérusalem numérique.",
        "Pour chaque pôle, ajoutez au moins trois mots-clés, trois exemples et trois risques ou opportunités.",
      ],
      example: [
        {
          label: "Babel numérique",
          content: "domination, surveillance, manipulation, uniformisation, exclusion, profit sans limite.",
        },
        {
          label: "Jérusalem numérique",
          content: "coopération, service, inclusion, vérité, responsabilité, protection des plus fragiles.",
        },
      ],
    },
    {
      id: "m1-a2",
      num: "1.2",
      title: "Quiz rapide",
      kind: "qcm",
      recommendation: "QCM auto-correctif.",
      instructions: ["Trois questions auto-corrigées pour valider la lecture du résumé doctrinal."],
      qcm: [
        {
          question:
            "Selon l'esprit de l'encyclique, la question principale n'est pas simplement de savoir si l'IA est bonne ou mauvaise, mais de savoir :",
          options: [
            "Si elle permet de gagner plus d'argent",
            "Quel type d'humanité elle contribue à construire",
            "Si elle peut remplacer tous les métiers",
            "Si elle fonctionne plus vite que l'homme",
          ],
          correctIdx: 1,
        },
        {
          question: "Babel symbolise principalement :",
          options: [
            "La coopération fraternelle",
            "L'humilité devant Dieu",
            "La domination, l'autosuffisance et l'uniformisation",
            "La reconstruction communautaire",
          ],
          correctIdx: 2,
        },
        {
          question: "La voie de Néhémie met en valeur :",
          options: [
            "L'isolement du génie individuel",
            "Le travail partagé, l'écoute et la reconstruction commune",
            "La destruction des technologies",
            "La soumission totale à la machine",
          ],
          correctIdx: 1,
        },
      ],
    },
  ],
  achievement: ["Carte mentale complétée.", "Score minimum au quiz : 70 %."],
};

const M2: SeminaireModule = {
  id: "m2",
  num: 2,
  title: "Module 2 — La position du Saint-Siège sur l'IA",
  displayTitle: "Ni peur stérile, ni enthousiasme naïf : discerner lucidement",
  duration: "1 h 30",
  objective: "Comprendre la position équilibrée du Saint-Siège sur l'intelligence artificielle.",
  content: [
    {
      kind: "paragraph",
      text: "La position du Saint-Siège peut être formulée en cinq affirmations :",
    },
    {
      kind: "numberedList",
      items: [
        "L'IA peut être utile. Elle peut soutenir l'éducation, la santé, la recherche, la communication, l'administration, l'inclusion et la protection de la Maison commune.",
        "L'IA n'est pas neutre dans ses effets. Elle reflète les intentions, les intérêts, les modèles économiques et les choix de ceux qui la conçoivent, la financent, la régulent et l'utilisent.",
        "L'IA ne remplace pas l'intelligence humaine. Elle calcule, classe, prédit, génère et imite, mais elle ne possède ni conscience morale, ni expérience intérieure, ni responsabilité personnelle.",
        "L'IA doit rester sous responsabilité humaine. Les décisions graves ne doivent jamais être abandonnées à un système opaque ou incontrôlable.",
        "L'IA doit être gouvernée pour le bien commun. Elle exige transparence, régulation, participation citoyenne, protection des plus fragiles et contrôle démocratique.",
      ],
    },
    { kind: "subheading", level: 3, text: "Position synthétique : le Saint-Siège appelle à une IA :" },
    {
      kind: "bulletList",
      items: [
        "centrée sur la personne ;",
        "ordonnée au bien commun ;",
        "transparente et contrôlable ;",
        "respectueuse de la vérité ;",
        "protectrice de la liberté ;",
        "juste dans ses effets économiques ;",
        "prudente dans ses usages éducatifs ;",
        "strictement encadrée dans les domaines militaires ;",
        "attentive aux pauvres, aux enfants, aux travailleurs, aux migrants, aux personnes malades et aux personnes vulnérables.",
      ],
    },
  ],
  activities: [
    {
      id: "m2-a1",
      num: "2.1",
      title: "Débat guidé",
      kind: "debate",
      recommendation: "Forum débat / classe virtuelle / activité « choix ».",
      instructions: [
        "Déclaration à discuter : « Une technologie efficace est forcément un progrès pour l'humanité. »",
        "Prenez position : d'accord, pas d'accord ou position nuancée. Justifiez votre réponse avec au moins deux arguments.",
      ],
      example: [
        { label: "Grille d'analyse", content: "L'efficacité suffit-elle à définir le progrès ?" },
        { label: "Grille d'analyse", content: "Un outil utile peut-il produire des injustices ?" },
        { label: "Grille d'analyse", content: "Que devient la dignité humaine si tout est mesuré par la performance ?" },
        { label: "Grille d'analyse", content: "Qui décide des finalités de la technologie ?" },
      ],
    },
    {
      id: "m2-a2",
      num: "2.2",
      title: "Vrai ou faux",
      kind: "truefalse",
      instructions: ["Validez votre compréhension de la position de l'Église par quatre affirmations."],
      truefalse: [
        {
          statement: "L'encyclique rejette totalement la technique et l'IA.",
          answer: "Faux",
          explanation: "Elle appelle à un usage responsable et orienté vers le bien.",
        },
        { statement: "L'IA doit rester un outil au service de la personne humaine.", answer: "Vrai" },
        {
          statement: "Une décision algorithmique est toujours juste parce qu'elle est mathématique.",
          answer: "Faux",
          explanation: "Les données, les modèles et les finalités peuvent être biaisés ou injustes.",
        },
        { statement: "La responsabilité humaine doit rester identifiable dans les usages de l'IA.", answer: "Vrai" },
      ],
    },
  ],
  achievement: ["Participation au débat.", "Validation du test vrai/faux."],
};

const M3: SeminaireModule = {
  id: "m3",
  num: 3,
  title: "Module 3 — IA, dignité humaine et Doctrine sociale de l'Église",
  displayTitle: "La personne avant la performance",
  duration: "2 h",
  objective: "Appliquer les grands principes de la Doctrine sociale de l'Église aux usages de l'IA.",
  resume:
    "La Doctrine sociale de l'Église offre des critères pour évaluer l'IA. Elle ne fournit pas seulement des règles abstraites ; elle aide à discerner ce qui sert réellement l'être humain.",
  content: [
    { kind: "subheading", level: 2, text: "Les grands principes à appliquer" },
    {
      kind: "principle",
      num: 1,
      title: "Dignité inaliénable de la personne",
      description:
        "Chaque personne a une valeur qui ne dépend ni de son utilité, ni de ses performances, ni de ses données, ni de sa productivité.",
      application:
        "Aucun système ne doit réduire une personne à un score, un profil, une prédiction ou une catégorie.",
    },
    {
      kind: "principle",
      num: 2,
      title: "Bien commun",
      description: "L'innovation doit servir le bien de tous, pas seulement les intérêts d'une minorité.",
      application:
        "Les bénéfices de l'IA doivent améliorer les conditions de vie, l'accès aux services, l'éducation, la santé et la justice.",
    },
    {
      kind: "principle",
      num: 3,
      title: "Destination universelle des biens",
      description:
        "Les biens de la création et les ressources essentielles doivent être orientés vers l'usage de tous.",
      application:
        "Les données, les infrastructures et les bénéfices de l'innovation ne doivent pas devenir des instruments d'exclusion ou de domination.",
    },
    {
      kind: "principle",
      num: 4,
      title: "Subsidiarité",
      description:
        "Ce qui peut être décidé au niveau local ou humain ne doit pas être absorbé par un pouvoir supérieur, centralisé ou opaque.",
      application: "Les communautés concernées doivent participer aux choix technologiques qui les affectent.",
    },
    {
      kind: "principle",
      num: 5,
      title: "Solidarité",
      description: "La société doit porter une attention particulière aux plus vulnérables.",
      application:
        "Il faut protéger les enfants, les pauvres, les travailleurs fragilisés, les personnes handicapées, les personnes âgées, les migrants et les exclus du numérique.",
    },
    {
      kind: "principle",
      num: 6,
      title: "Justice sociale",
      description: "Le progrès doit réduire les inégalités, non les aggraver.",
      application:
        "Il faut éviter les biais, les discriminations, les monopoles, l'exploitation des travailleurs invisibles et l'exclusion numérique.",
    },
    {
      kind: "principle",
      num: 7,
      title: "Développement humain intégral",
      description: "Le développement concerne toute la personne et toutes les personnes.",
      application:
        "L'IA doit soutenir l'intelligence, la liberté, la relation, la spiritualité, la créativité, le travail digne et la paix.",
    },
  ],
  activities: [
    {
      id: "m3-a1",
      num: "3.1",
      title: "Glisser-déposer des principes",
      kind: "dragdrop",
      recommendation: "H5P Drag and Drop / Moodle Quiz matching.",
      instructions: ["Associez chaque situation au principe de Doctrine sociale correspondant."],
      matchings: [
        {
          situation: "Un algorithme refuse automatiquement un crédit sans explication",
          principle: "Dignité humaine / transparence / droit au recours",
        },
        {
          situation: "Une plateforme éducative collecte les données d'enfants sans consentement clair",
          principle: "Protection des vulnérables / justice sociale",
        },
        {
          situation: "Une entreprise remplace massivement des travailleurs sans accompagnement",
          principle: "Dignité du travail / solidarité",
        },
        {
          situation: "Une IA médicale améliore l'accès au diagnostic dans une zone rurale",
          principle: "Bien commun / destination universelle des biens",
        },
        {
          situation: "Un système de surveillance note les comportements des citoyens",
          principle: "Liberté / subsidiarité / dignité",
        },
      ],
    },
    {
      id: "m3-a2",
      num: "3.2",
      title: "Étude de cas — IA dans l'orientation scolaire",
      kind: "case",
      instructions: [
        "Une école veut intégrer une IA qui corrige automatiquement les devoirs, attribue une note, classe les élèves et recommande leur orientation future.",
      ],
      caseStudy: {
        description:
          "Une école veut intégrer une IA qui corrige automatiquement les devoirs, attribue une note, classe les élèves et recommande leur orientation future.",
        questions: [
          "Quels sont les avantages possibles ?",
          "Quels sont les risques pour la dignité des élèves ?",
          "Quels biais peuvent apparaître ?",
          "Quelle place doit rester à l'enseignant ?",
          "Quelles garanties faut-il imposer avant l'adoption ?",
        ],
        production: "Un court avis éthique de 300 à 500 mots.",
      },
      deliverable: "Un court avis éthique de 300 à 500 mots.",
    },
  ],
  achievement: ["Réussir l'activité d'association.", "Déposer l'avis éthique."],
};

const M4: SeminaireModule = {
  id: "m4",
  num: 4,
  title: "Module 4 — Les usages positifs de l'IA",
  displayTitle: "Faire fructifier le talent technologique",
  duration: "1 h 30",
  objective:
    "Identifier les usages constructifs de l'IA et les conditions nécessaires pour qu'ils produisent un impact positif.",
  resume:
    "L'IA peut devenir une aide précieuse lorsqu'elle est orientée vers le service de l'homme. Elle peut augmenter les capacités humaines sans remplacer la conscience humaine.",
  content: [
    { kind: "subheading", level: 2, text: "Domaines d'usage positif" },
    {
      kind: "domain",
      num: 1,
      title: "Éducation",
      items: [
        "Personnalisation des apprentissages.",
        "Aide à la remédiation.",
        "Accessibilité pour les élèves à besoins spécifiques.",
        "Traduction et simplification des contenus.",
        "Création d'exercices différenciés.",
        "Accompagnement des enseignants dans la préparation pédagogique.",
      ],
    },
    {
      kind: "domain",
      num: 2,
      title: "Santé",
      items: [
        "Aide au diagnostic.",
        "Analyse d'images médicales.",
        "Prévention.",
        "Organisation des soins.",
        "Information des patients.",
      ],
    },
    {
      kind: "domain",
      num: 3,
      title: "Administration et gouvernance",
      items: [
        "Simplification des démarches.",
        "Classement et recherche documentaire.",
        "Appui à la décision.",
        "Détection de besoins sociaux.",
      ],
    },
    {
      kind: "domain",
      num: 4,
      title: "Recherche et innovation",
      items: ["Analyse de données.", "Modélisation.", "Synthèse documentaire.", "Simulation."],
    },
    {
      kind: "domain",
      num: 5,
      title: "Inclusion",
      items: [
        "Sous-titrage automatique.",
        "Transcription vocale.",
        "Assistance aux personnes handicapées.",
        "Traduction multilingue.",
        "Accès facilité aux savoirs.",
      ],
    },
    {
      kind: "domain",
      num: 6,
      title: "Environnement",
      items: [
        "Analyse climatique.",
        "Surveillance des ressources.",
        "Optimisation énergétique.",
        "Prévention des catastrophes.",
      ],
    },
    {
      kind: "domain",
      num: 7,
      title: "Communication",
      items: ["Aide à la rédaction.", "Synthèse d'informations.", "Traduction.", "Médiation culturelle."],
    },
    { kind: "subheading", level: 3, text: "Condition fondamentale" },
    {
      kind: "numberedList",
      intro: "L'usage positif de l'IA suppose quatre exigences :",
      items: [
        "finalité humaine claire ;",
        "responsabilité humaine identifiable ;",
        "transparence des procédés ;",
        "attention aux plus vulnérables.",
      ],
    },
  ],
  activities: [
    {
      id: "m4-a1",
      num: "4.1",
      title: "Mur des usages constructifs",
      kind: "collab",
      recommendation: "Padlet / base de données Moodle / forum structuré.",
      instructions: [
        "Chaque participant propose un usage positif de l'IA dans son domaine.",
        "Il doit préciser : le problème à résoudre ; l'usage de l'IA envisagé ; les bénéficiaires ; les risques à surveiller ; les conditions éthiques ; l'impact attendu.",
      ],
    },
    {
      id: "m4-a2",
      num: "4.2",
      title: "Vote collaboratif",
      kind: "vote",
      instructions: [
        "Les participants votent pour les trois usages qui semblent les plus utiles, les plus réalistes et les plus conformes à la dignité humaine.",
      ],
    },
  ],
  achievement: [
    "Avoir publié un usage positif.",
    "Avoir commenté au moins deux propositions d'autres participants.",
  ],
};

const M5: SeminaireModule = {
  id: "m5",
  num: 5,
  title: "Module 5 — Les déviations possibles de l'IA",
  displayTitle: "Quand la technologie cesse de servir l'humain",
  duration: "2 h",
  objective: "Identifier les déviations possibles de l'IA et apprendre à les prévenir.",
  resume:
    "L'IA peut produire de grandes avancées, mais elle peut aussi générer des formes nouvelles de déshumanisation. Le risque n'est pas seulement technique ; il est anthropologique, éducatif, économique, politique, relationnel et spirituel.",
  content: [
    {
      kind: "deviation",
      num: 1,
      title: "Déviation anthropologique",
      description:
        "La personne est réduite à des données, des comportements, des performances ou des prédictions.",
      risks: [
        "Réduction de l'homme à ce qui est mesurable.",
        "Perte du sens de la fragilité.",
        "Culte de la performance.",
        "Mépris des personnes jugées improductives.",
      ],
      solution: "Maintenir la dignité humaine comme critère premier de toute évaluation technologique.",
    },
    {
      kind: "deviation",
      num: 2,
      title: "Déviation éducative",
      description:
        "L'IA donne des réponses immédiates et peut affaiblir l'effort intellectuel si elle est utilisée sans méthode.",
      risks: [
        "Copier-coller automatique.",
        "Paresse intellectuelle.",
        "Perte de la lecture et de l'argumentation.",
        "Dépendance aux outils.",
        "Difficulté à distinguer savoir, information et opinion.",
      ],
      solution: "Former les apprenants à utiliser l'IA comme assistant, non comme substitut à la pensée.",
    },
    {
      kind: "deviation",
      num: 3,
      title: "Déviation informationnelle",
      description:
        "L'IA peut produire ou amplifier de fausses informations, des images truquées, des deepfakes et des manipulations émotionnelles.",
      risks: [
        "Confusion entre vrai et faux.",
        "Manipulation électorale.",
        "Atteinte à la réputation.",
        "Propagation rapide de rumeurs.",
        "Polarisation sociale.",
      ],
      solution: "Éduquer à la vérification, à la responsabilité de publication et à l'esprit critique.",
    },
    {
      kind: "deviation",
      num: 4,
      title: "Déviation économique",
      description: "L'IA peut concentrer le pouvoir entre quelques acteurs et fragiliser les travailleurs.",
      risks: [
        "Chômage technologique.",
        "Déqualification.",
        "Surveillance au travail.",
        "Exploitation de travailleurs invisibles.",
        "Monopoles numériques.",
      ],
      solution:
        "Accompagner la transition par la formation, la protection sociale, le dialogue social et le partage équitable des gains.",
    },
    {
      kind: "deviation",
      num: 5,
      title: "Déviation politique",
      description:
        "L'IA peut permettre un contrôle social massif, un profilage des citoyens et une décision publique opaque.",
      risks: [
        "Surveillance généralisée.",
        "Autocensure.",
        "Discrimination algorithmique.",
        "Absence de recours.",
        "Gouvernance opaque.",
      ],
      solution:
        "Garantir la transparence, le droit à l'explication, le droit au recours et le contrôle démocratique.",
    },
    {
      kind: "deviation",
      num: 6,
      title: "Déviation relationnelle",
      description: "L'IA peut simuler une présence, une écoute ou une amitié sans relation humaine véritable.",
      risks: [
        "Isolement.",
        "Confusion affective.",
        "Dépendance émotionnelle.",
        "Remplacement du lien humain par une simulation.",
      ],
      solution: "Utiliser l'IA comme assistance limitée et préserver les relations humaines essentielles.",
    },
    {
      kind: "deviation",
      num: 7,
      title: "Déviation militaire",
      description:
        "L'IA peut être utilisée dans des armes autonomes, la surveillance militaire, les cyberattaques et la désinformation stratégique.",
      risks: [
        "Décisions létales automatisées.",
        "Guerre plus rapide et impersonnelle.",
        "Responsabilité diluée.",
        "Atteintes massives aux civils.",
      ],
      solution:
        "Refuser que des machines prennent des décisions mortelles et renforcer le multilatéralisme, la diplomatie et le contrôle humain significatif.",
    },
  ],
  activities: [
    {
      id: "m5-a1",
      num: "5.1",
      title: "Scénario à embranchements",
      kind: "scenario",
      recommendation: "H5P Branching Scenario.",
      instructions: [
        "Vous êtes membre du comité éthique d'une institution qui veut adopter une solution d'IA. À chaque étape, vous devez choisir l'action la plus responsable.",
      ],
      steps: [
        {
          num: 1,
          description: "L'entreprise fournisseur refuse d'expliquer comment l'algorithme prend ses décisions.",
          choices: [
            "Accepter quand même parce que le système est rapide.",
            "Demander un audit indépendant et suspendre l'adoption.",
            "Demander uniquement une démonstration commerciale.",
          ],
          bestIdx: 1,
        },
        {
          num: 2,
          description: "Le système collecte des données personnelles sensibles sans consentement clair.",
          choices: [
            "Continuer car les données améliorent la performance.",
            "Exiger une politique de consentement, de minimisation et de protection des données.",
            "Supprimer toutes les données et abandonner toute technologie.",
          ],
          bestIdx: 1,
        },
        {
          num: 3,
          description: "Le système produit des résultats discriminatoires contre certains groupes.",
          choices: [
            "Ignorer les écarts car l'algorithme est objectif.",
            "Arrêter, auditer les biais, corriger et prévoir un recours humain.",
            "Réserver l'outil à certains publics seulement.",
          ],
          bestIdx: 1,
        },
      ],
    },
    {
      id: "m5-a2",
      num: "5.2",
      title: "Cartographie des risques",
      kind: "cartography",
      instructions: [
        "Dans votre groupe, choisissez un contexte : école, paroisse, entreprise, administration, association, média, famille.",
        "Remplissez le tableau ci-dessous pour chaque usage envisagé.",
      ],
      tableHeaders: [
        "Usage possible de l'IA",
        "Bénéfice attendu",
        "Risque humain",
        "Personnes vulnérables concernées",
        "Mesure de prévention",
      ],
    },
  ],
  achievement: ["Avoir terminé le scénario.", "Avoir contribué à la cartographie des risques."],
};

const M6: SeminaireModule = {
  id: "m6",
  num: 6,
  title: "Module 6 — Gouvernance responsable et pistes de solution",
  displayTitle: "Humaniser, encadrer, responsabiliser",
  duration: "1 h 30",
  objective: "Proposer des pistes concrètes pour un usage responsable de l'IA.",
  resume:
    "Une IA responsable suppose une gouvernance qui associe la technique, l'éthique, le droit, l'éducation et la participation des communautés concernées.",
  content: [
    { kind: "subheading", level: 2, text: "Principes de gouvernance" },
    {
      kind: "numberedList",
      items: [
        "Responsabilité humaine — Toute décision importante doit pouvoir être rattachée à une personne ou une institution responsable.",
        "Transparence — Les personnes concernées doivent savoir quand une IA est utilisée et dans quel but.",
        "Explicabilité — Les décisions algorithmiques importantes doivent pouvoir être expliquées dans un langage compréhensible.",
        "Droit au recours — Toute personne affectée par une décision automatisée doit pouvoir contester cette décision.",
        "Protection des données — Les données doivent être collectées de manière minimale, légitime, sécurisée et consentie.",
        "Évaluation d'impact — Avant l'adoption d'un système d'IA, il faut évaluer ses effets humains, sociaux, éducatifs, économiques et environnementaux.",
        "Inclusion des plus vulnérables — L'IA doit être évaluée en regardant d'abord ses effets sur les plus fragiles.",
        "Formation permanente — Les utilisateurs doivent apprendre à comprendre, vérifier et limiter les outils d'IA.",
        "Sobriété numérique — Il faut éviter l'usage de l'IA lorsqu'une solution humaine, simple, locale et moins intrusive suffit.",
        "Paix et justice — L'IA doit être orientée vers la coopération, la prévention, la diplomatie et la justice, non vers la domination ou la violence.",
      ],
    },
  ],
  activities: [
    {
      id: "m6-a1",
      num: "6.1",
      title: "Audit éthique d'un outil d'IA",
      kind: "audit",
      instructions: [
        "Choisissez un outil d'IA réel ou fictif. Évaluez-le à partir de la grille suivante.",
      ],
      tableHeaders: ["Critère", "Oui", "Non", "Incertain", "Commentaire"],
      example: [
        { label: "Critère", content: "La finalité est clairement humaine et utile" },
        { label: "Critère", content: "Les utilisateurs savent qu'une IA est utilisée" },
        { label: "Critère", content: "Les données collectées sont minimales" },
        { label: "Critère", content: "Le système est explicable" },
        { label: "Critère", content: "Un recours humain est possible" },
        { label: "Critère", content: "Les personnes vulnérables sont protégées" },
        { label: "Critère", content: "Les biais sont évalués" },
        { label: "Critère", content: "Les impacts sur le travail sont anticipés" },
        { label: "Critère", content: "L'usage favorise le bien commun" },
        { label: "Critère", content: "L'usage respecte la liberté humaine" },
      ],
      deliverable: "Un rapport d'audit de 600 à 900 mots.",
    },
    {
      id: "m6-a2",
      num: "6.2",
      title: "Atelier de solutions",
      kind: "workshop",
      instructions: [
        "À partir des risques identifiés au module précédent, proposez des mesures de prévention.",
      ],
      tableHeaders: [
        "Risque",
        "Cause possible",
        "Mesure technique",
        "Mesure éducative",
        "Mesure institutionnelle",
        "Mesure spirituelle / éthique",
      ],
    },
  ],
  achievement: ["Dépôt du rapport d'audit.", "Participation à l'atelier de solutions."],
};

const M7: SeminaireModule = {
  id: "m7",
  num: 7,
  title: "Module 7 — Produire une charte d'usage responsable de l'IA",
  displayTitle: "Devenir bâtisseurs de communion numérique",
  duration: "2 h",
  objective: "Produire une charte opérationnelle d'usage responsable de l'IA, applicable à un contexte réel.",
  content: [
    { kind: "subheading", level: 2, text: "Structure recommandée de la charte" },
    {
      kind: "paragraph",
      text: "La charte comporte trois parties : un préambule fondateur, dix engagements opérationnels et un dispositif de mise en œuvre. Le séminaire fournit un modèle prêt à adapter (voir page « Charte »).",
    },
  ],
  activities: [
    {
      id: "m7-a1",
      num: "7.1",
      title: "Adaptation de la charte",
      kind: "charte",
      instructions: [
        "Adaptez la charte modèle à votre institution.",
        "Précisez : le public concerné ; les usages autorisés ; les usages interdits ; les règles de vérification ; les règles de protection des données ; les personnes responsables ; le mécanisme de recours ; les sanctions ou mesures correctives ; le calendrier de révision.",
      ],
      deliverable: "Une charte contextualisée prête à publication interne.",
    },
    {
      id: "m7-a2",
      num: "7.2",
      title: "Présentation orale",
      kind: "workshop",
      instructions: ["Chaque groupe présente sa charte en 5 minutes."],
      presentationCriteria: [
        "Clarté.",
        "Fidélité aux principes de l'encyclique.",
        "Applicabilité.",
        "Protection des personnes vulnérables.",
        "Réalisme des mesures.",
      ],
    },
  ],
  achievement: ["Dépôt de la charte.", "Présentation ou commentaire croisé."],
};

const M8: SeminaireModule = {
  id: "m8",
  num: 8,
  title: "Module 8 — Synthèse, engagement et évaluation finale",
  displayTitle: "Rester humains : de la formation à l'engagement",
  duration: "1 h",
  objective: "Consolider les acquis et inviter chaque participant à prendre un engagement concret.",
  content: [
    { kind: "subheading", level: 2, text: "Synthèse finale — cinq verbes" },
    {
      kind: "numberedList",
      items: [
        "Discerner : ne pas céder à la peur ni à la fascination.",
        "Protéger : placer la dignité humaine au centre.",
        "Responsabiliser : ne pas déléguer la conscience morale à la machine.",
        "Éduquer : former à l'esprit critique, à la vérité et à la liberté.",
        "Humaniser : faire de la technologie un service de communion, de justice et de paix.",
      ],
    },
  ],
  activities: [
    {
      id: "m8-a1",
      num: "8.1",
      title: "Autoévaluation finale",
      kind: "autoeval",
      instructions: ["Cochez votre niveau de maîtrise pour chacune des compétences ciblées."],
      tableHeaders: ["Compétence", "Débutant", "En progrès", "Maîtrisé", "À approfondir"],
      example: [
        { label: "Compétence", content: "Je peux résumer l'encyclique" },
        { label: "Compétence", content: "Je peux expliquer la position du Saint-Siège sur l'IA" },
        { label: "Compétence", content: "Je peux identifier les risques de l'IA" },
        { label: "Compétence", content: "Je peux proposer des solutions éthiques" },
        { label: "Compétence", content: "Je peux rédiger une charte d'usage responsable" },
        { label: "Compétence", content: "Je peux former d'autres personnes à ces enjeux" },
      ],
    },
    {
      id: "m8-a2",
      num: "8.2",
      title: "Engagement personnel",
      kind: "engagement",
      instructions: [
        "Rédigez un engagement personnel en complétant les phrases suivantes :",
        "1. Une conviction que je retiens : ...",
        "2. Un risque que je veux surveiller : ...",
        "3. Une pratique que je veux changer : ...",
        "4. Une action que je vais mettre en œuvre dans les 30 prochains jours : ...",
        "5. Une personne ou une équipe avec qui je vais partager cette formation : ...",
      ],
    },
  ],
  achievement: ["Autoévaluation complétée.", "Engagement personnel déposé."],
};

const MODULES: SeminaireModule[] = [M0, M1, M2, M3, M4, M5, M6, M7, M8];

const QUIZZES: SeminaireQuiz[] = [
  {
    id: "q1",
    num: 1,
    title: "Quiz 1 — Compréhension générale",
    questions: [
      {
        num: 1,
        question: "Quel est le thème principal de Magnifica Humanitas ?",
        options: [
          "La liturgie chrétienne",
          "La protection de la personne humaine à l'ère de l'IA",
          "L'économie agricole",
          "La musique sacrée",
        ],
        correctIdx: 1,
      },
      {
        num: 2,
        question: "Dans l'encyclique, Babel représente :",
        options: [
          "La responsabilité partagée",
          "La domination technique et l'autosuffisance",
          "La paix entre les peuples",
          "L'éducation intégrale",
        ],
        correctIdx: 1,
      },
      {
        num: 3,
        question: "La technologie est-elle mauvaise en elle-même ?",
        options: [
          "Oui, toujours",
          "Non, mais elle doit être orientée vers le bien",
          "Oui, sauf pour l'éducation",
          "Non, elle n'a aucun risque",
        ],
        correctIdx: 1,
      },
      {
        num: 4,
        question: "Que doit préserver prioritairement l'usage de l'IA ?",
        options: ["Le profit", "La vitesse", "La dignité humaine", "La concurrence"],
        correctIdx: 2,
      },
      {
        num: 5,
        question: "Quelle attitude est recommandée face à l'IA ?",
        options: ["Rejet total", "Enthousiasme sans limite", "Discernement responsable", "Indifférence"],
        correctIdx: 2,
      },
    ],
  },
  {
    id: "q2",
    num: 2,
    title: "Quiz 2 — Doctrine sociale et IA",
    questions: [
      {
        num: 1,
        question: "Le principe de subsidiarité signifie que :",
        options: [
          "Tout doit être décidé par une machine centrale",
          "Ce qui peut être fait localement ne doit pas être absorbé par un pouvoir supérieur",
          "Les pauvres doivent être exclus des décisions",
          "L'État ne doit jamais intervenir",
        ],
        correctIdx: 1,
      },
      {
        num: 2,
        question: "Le bien commun exige que l'IA :",
        options: [
          "Serve seulement les entreprises puissantes",
          "Améliore la vie de tous, surtout des plus vulnérables",
          "Remplace l'école",
          "Soit réservée aux experts",
        ],
        correctIdx: 1,
      },
      {
        num: 3,
        question: "La solidarité demande de regarder d'abord :",
        options: [
          "Les bénéfices financiers",
          "Les effets sur les plus fragiles",
          "La rapidité du logiciel",
          "La qualité du design",
        ],
        correctIdx: 1,
      },
      {
        num: 4,
        question: "Une IA qui classe des personnes sans recours humain pose un problème de :",
        options: [
          "Dignité et justice",
          "Couleur d'interface",
          "Rapidité de calcul",
          "Stockage uniquement",
        ],
        correctIdx: 0,
      },
    ],
  },
  {
    id: "q3",
    num: 3,
    title: "Quiz 3 — Risques et solutions",
    questions: [
      {
        num: 1,
        question: "Un deepfake est dangereux parce qu'il peut :",
        options: [
          "Améliorer la météo",
          "Manipuler la perception du vrai",
          "Augmenter la mémoire humaine",
          "Supprimer tous les biais",
        ],
        correctIdx: 1,
      },
      {
        num: 2,
        question: "Une décision importante prise par IA doit toujours prévoir :",
        options: [
          "Un recours humain",
          "Une absence d'explication",
          "Une suppression des données personnelles",
          "Une interdiction de questionner",
        ],
        correctIdx: 0,
      },
      {
        num: 3,
        question: "L'usage éducatif responsable de l'IA suppose :",
        options: [
          "Que l'élève ne pense plus par lui-même",
          "Que l'IA remplace totalement l'enseignant",
          "Que l'IA soutienne l'apprentissage sans supprimer l'effort",
          "Que les devoirs soient entièrement automatisés",
        ],
        correctIdx: 2,
      },
      {
        num: 4,
        question: "Dans le domaine militaire, l'un des risques majeurs est :",
        options: [
          "L'amélioration de la grammaire",
          "La décision létale automatisée",
          "La traduction automatique",
          "L'aide à la lecture",
        ],
        correctIdx: 1,
      },
    ],
  },
];

const H5P: SeminaireH5P[] = [
  {
    id: "h5p1",
    num: 1,
    toolKind: "course-presentation",
    title: "Course Presentation",
    displayTitle: "Babel ou Jérusalem ? Comprendre Magnifica Humanitas",
    slides: [
      "Pourquoi cette formation ?",
      "L'IA transforme notre monde.",
      "La technique : opportunité et ambivalence.",
      "Babel : puissance sans communion.",
      "Jérusalem : reconstruction partagée.",
      "La dignité humaine comme boussole.",
      "L'IA n'est pas une conscience.",
      "Usages positifs.",
      "Déviations possibles.",
      "Responsabilité et gouvernance.",
      "Engagement final.",
    ],
  },
  {
    id: "h5p2",
    num: 2,
    toolKind: "branching-scenario",
    title: "Branching Scenario",
    displayTitle: "Adopter ou refuser un outil d'IA ?",
    description: "Placer l'apprenant dans un comité de décision éthique.",
    outcomes: [
      "Demander une finalité claire.",
      "Exiger une transparence minimale.",
      "Imposer une protection des données.",
      "Garantir un recours humain.",
      "Vérifier l'évaluation des biais.",
      "Protéger les personnes vulnérables.",
    ],
  },
  {
    id: "h5p3",
    num: 3,
    toolKind: "drag-words",
    title: "Drag the Words",
    displayTitle: "Compléter les principes de l'IA responsable",
    fillInText:
      "L'IA doit rester un [outil] au service de la [personne humaine]. Elle doit être guidée par la [responsabilité], la [transparence], le [bien commun] et la [justice]. Elle ne doit pas remplacer la [conscience morale] ni affaiblir la [liberté].",
  },
  {
    id: "h5p4",
    num: 4,
    toolKind: "dialog-cards",
    title: "Dialog Cards",
    displayTitle: "Vocabulaire essentiel",
    cards: [
      "Dignité humaine",
      "Bien commun",
      "Subsidiarité",
      "Solidarité",
      "Justice sociale",
      "Développement humain intégral",
      "Transparence algorithmique",
      "Biais algorithmique",
      "Deepfake",
      "Sobriété numérique",
      "Contrôle humain significatif",
    ],
  },
];

export const MAGNIFICA_HUMANITAS: Seminaire = {
  meta: {
    slug: "magnifica-humanitas",
    title: "Magnifica Humanitas : rester humains à l'ère de l'intelligence artificielle",
    subtitle:
      "Séminaire interactif des écoles catholiques sur l'encyclique du Saint-Père Léon XIV",
    reference: "Lettre encyclique Magnifica Humanitas",
    referenceDate: "15 mai 2026",
    courseType: "Formation interactive en ligne / hybride / présentiel",
    language: "fr",
    duration: "12 heures (déclinable en 1 jour ou 2 jours)",
    audience:
      "Responsables éducatifs, enseignants, formateurs, cadres pastoraux, jeunes leaders, acteurs du numérique, parents, étudiants, décideurs",
    level: "Initiation approfondie",
    completion:
      "Participation aux activités + quiz + production finale d'une charte d'usage responsable de l'IA",
    format:
      "Autoformation accompagnée + classes virtuelles + activités collaboratives",
    authoringNote:
      "Contenu conçu pour intégration dans une plateforme numérique de formation : Moodle, EduWeb, Canvas, Chamilo, WordPress LMS ou autre LMS compatible Markdown.",
    family: "ethique",
    presentation: [
      "Cette formation interactive propose une lecture pédagogique, éthique, sociale et spirituelle de l'encyclique Magnifica Humanitas, consacrée à la protection de la personne humaine à l'ère de l'intelligence artificielle.",
      "L'objectif n'est pas seulement de comprendre ce que dit le texte, mais d'apprendre à discerner, évaluer, utiliser et encadrer l'IA afin qu'elle serve la dignité humaine, le bien commun, la justice, la vérité, la liberté, la paix et la fraternité.",
      "L'atelier repose sur une idée structurante : face à l'IA, l'humanité peut construire une nouvelle Babel, fondée sur la puissance, l'orgueil, l'uniformisation et la domination ; ou elle peut reconstruire une Jérusalem, fondée sur la communion, l'écoute, la responsabilité partagée et le service de l'humain.",
    ],
  },
  objectives: [
    "Résumer clairement les grandes idées de l'encyclique Magnifica Humanitas.",
    "Expliquer la position du Saint-Siège sur l'intelligence artificielle.",
    "Distinguer les usages constructifs de l'IA et les déviations possibles.",
    "Appliquer les principes de la Doctrine sociale de l'Église aux technologies numériques.",
    "Identifier les risques liés à l'IA dans l'éducation, le travail, la communication, la démocratie, la famille, la liberté et la paix.",
    "Proposer des solutions concrètes pour une gouvernance responsable de l'IA.",
    "Produire une charte d'usage responsable de l'IA adaptée à une institution, une école, une paroisse, une association ou une entreprise.",
  ],
  competences: [
    {
      category: "Compétences de compréhension",
      items: [
        "Comprendre le lien entre l'IA et la Doctrine sociale de l'Église.",
        "Identifier les notions centrales : dignité humaine, bien commun, solidarité, subsidiarité, justice sociale, vérité, liberté, paix.",
        "Expliquer pourquoi l'IA est une question anthropologique, sociale, économique, politique et spirituelle.",
      ],
    },
    {
      category: "Compétences de discernement",
      items: [
        "Évaluer un usage de l'IA selon des critères éthiques.",
        "Distinguer progrès technique et progrès humain.",
        "Détecter les dérives de déshumanisation, de manipulation, de dépendance et de domination.",
      ],
    },
    {
      category: "Compétences pratiques",
      items: [
        "Utiliser l'IA de manière responsable.",
        "Construire une grille d'analyse éthique.",
        "Rédiger une charte d'usage responsable.",
        "Animer un débat ou une sensibilisation sur l'IA et la dignité humaine.",
      ],
    },
  ],
  architecture: [
    { section: "Accueil", contentType: "Vidéo d'introduction + consignes", activity: "Sondage + forum", evaluation: "Participation" },
    { section: "Module 1", contentType: "Résumé de l'encyclique", activity: "Carte mentale collaborative", evaluation: "Quiz rapide" },
    { section: "Module 2", contentType: "Position du Saint-Siège", activity: "Débat guidé", evaluation: "QCM" },
    { section: "Module 3", contentType: "IA, dignité et Doctrine sociale", activity: "Glisser-déposer des principes", evaluation: "Étude de cas" },
    { section: "Module 4", contentType: "Usages positifs de l'IA", activity: "Mur collaboratif", evaluation: "Mini-projet" },
    { section: "Module 5", contentType: "Déviations possibles", activity: "Scénarios à embranchements", evaluation: "Quiz situationnel" },
    { section: "Module 6", contentType: "Solutions et gouvernance", activity: "Atelier de charte", evaluation: "Production collective" },
    { section: "Module 7", contentType: "Projet final", activity: "Dépôt de document", evaluation: "Évaluation par grille" },
    { section: "Clôture", contentType: "Synthèse et engagement", activity: "Autoévaluation", evaluation: "Badge final" },
  ],
  modules: MODULES,
  quizzes: QUIZZES,
  h5pActivities: H5P,
  evaluation: {
    criteria: [
      { criterion: "Fidélité à l'esprit de Magnifica Humanitas", points: 20 },
      { criterion: "Prise en compte de la dignité humaine", points: 20 },
      { criterion: "Identification claire des risques", points: 15 },
      { criterion: "Pertinence des solutions proposées", points: 15 },
      { criterion: "Applicabilité institutionnelle", points: 15 },
      { criterion: "Clarté de la rédaction", points: 10 },
      { criterion: "Qualité de la présentation", points: 5 },
    ],
    totalPoints: 100,
    levels: [
      { range: "90-100", label: "Excellent — Bâtisseur de communion numérique" },
      { range: "75-89", label: "Très satisfaisant — Gardien de la dignité humaine" },
      { range: "60-74", label: "Satisfaisant — Utilisateur responsable de l'IA" },
      { range: "40-59", label: "À renforcer — Discernement encore partiel" },
      { range: "0-39", label: "À reprendre — Compréhension insuffisante" },
    ],
  },
  badges: [
    { num: 1, title: "Sentinelle de la vérité", condition: "Réussir le module sur la vérité, la désinformation et les deepfakes." },
    { num: 2, title: "Gardien de la dignité humaine", condition: "Réussir l'étude de cas sur l'IA et la Doctrine sociale de l'Église." },
    { num: 3, title: "Artisan de paix numérique", condition: "Valider l'activité sur l'IA, la guerre et la paix." },
    { num: 4, title: "Bâtisseur de Jérusalem numérique", condition: "Déposer une charte d'usage responsable de l'IA validée." },
  ],
  formateur: {
    before: [
      "Mettre en ligne le document de référence.",
      "Créer un forum d'accueil.",
      "Préparer un sondage d'entrée.",
      "Créer les quiz auto-correctifs.",
      "Paramétrer les activités H5P.",
      "Prévoir des groupes de 4 à 6 participants.",
      "Préparer un espace de dépôt pour la charte finale.",
    ],
    during: [
      "Favoriser l'interaction plutôt que le cours magistral.",
      "Partir de cas concrets.",
      "Faire verbaliser les représentations des participants.",
      "Relier chaque débat aux principes de l'encyclique.",
      "Veiller à ne pas réduire l'atelier à une formation technique sur l'IA.",
      "Ramener régulièrement à la question centrale : que devient l'humain ?",
    ],
    after: [
      "Publier les chartes produites.",
      "Proposer une synthèse commune.",
      "Inviter les participants à mettre en œuvre un plan d'action.",
      "Prévoir un suivi à 30 jours.",
    ],
  },
  actionPlan: {
    followUpDays: 30,
    questions: [
      "Quelle action ai-je réellement mise en œuvre ?",
      "Quelle difficulté ai-je rencontrée ?",
      "Quel changement ai-je observé ?",
      "De quelle aide ai-je encore besoin ?",
      "Quelle prochaine étape puis-je prendre ?",
    ],
    forumTitle: "Nos premiers pas vers une IA responsable",
    forumInstruction:
      "Partagez une expérience concrète d'application de la formation dans votre contexte.",
  },
  scheduleShort: {
    label: "Atelier d'une journée (condensé)",
    totalDuration: "6 heures",
    rows: [
      { hours: "08 h 30 - 09 h 00", activity: "Accueil, sondage et attentes" },
      { hours: "09 h 00 - 10 h 00", activity: "Résumé de Magnifica Humanitas" },
      { hours: "10 h 00 - 11 h 00", activity: "Position du Saint-Siège sur l'IA" },
      { hours: "11 h 00 - 11 h 15", activity: "Pause" },
      { hours: "11 h 15 - 12 h 30", activity: "Usages positifs et déviations possibles" },
      { hours: "12 h 30 - 13 h 30", activity: "Pause" },
      { hours: "13 h 30 - 14 h 45", activity: "Études de cas et cartographie des risques" },
      { hours: "14 h 45 - 15 h 45", activity: "Atelier charte d'usage responsable" },
      { hours: "15 h 45 - 16 h 15", activity: "Présentation des chartes" },
      { hours: "16 h 15 - 16 h 30", activity: "Engagement final et évaluation" },
    ],
  },
  scheduleLong: {
    label: "Atelier sur deux jours",
    totalDuration: "12 heures",
    days: [
      {
        num: 1,
        rows: [
          { hours: "08 h 30 - 09 h 00", activity: "Accueil et sondage" },
          { hours: "09 h 00 - 10 h 30", activity: "Module 1 : Comprendre l'encyclique" },
          { hours: "10 h 30 - 10 h 45", activity: "Pause" },
          { hours: "10 h 45 - 12 h 15", activity: "Module 2 : Position du Saint-Siège" },
          { hours: "12 h 15 - 13 h 30", activity: "Pause" },
          { hours: "13 h 30 - 15 h 30", activity: "Module 3 : Doctrine sociale et IA" },
          { hours: "15 h 30 - 15 h 45", activity: "Pause" },
          { hours: "15 h 45 - 16 h 30", activity: "Synthèse interactive du jour 1" },
        ],
      },
      {
        num: 2,
        rows: [
          { hours: "08 h 30 - 09 h 00", activity: "Retour sur le jour 1" },
          { hours: "09 h 00 - 10 h 30", activity: "Module 4 : Usages positifs de l'IA" },
          { hours: "10 h 30 - 10 h 45", activity: "Pause" },
          { hours: "10 h 45 - 12 h 45", activity: "Module 5 : Déviations possibles" },
          { hours: "12 h 45 - 13 h 45", activity: "Pause" },
          { hours: "13 h 45 - 15 h 00", activity: "Module 6 : Gouvernance responsable" },
          { hours: "15 h 00 - 16 h 00", activity: "Module 7 : Production de la charte" },
          { hours: "16 h 00 - 16 h 30", activity: "Engagement et évaluation finale" },
        ],
      },
    ],
  },
  achievement: {
    autoCriteria: [
      "il consulte au moins 80 % des ressources ;",
      "il participe à au moins deux forums ;",
      "il obtient au moins 70 % aux quiz ;",
      "il dépose une production finale ;",
      "il complète l'autoévaluation finale.",
    ],
    weights: [
      { element: "Quiz", weight: "25 %" },
      { element: "Participation aux forums", weight: "20 %" },
      { element: "Étude de cas", weight: "20 %" },
      { element: "Charte finale", weight: "30 %" },
      { element: "Engagement personnel", weight: "5 %" },
    ],
  },
  closingMessage:
    "Vous avez terminé le parcours Magnifica Humanitas : rester humains à l'ère de l'intelligence artificielle.\n\nL'enjeu n'est pas de fuir l'IA ni de s'y abandonner sans discernement. L'enjeu est de construire une société où la technologie demeure au service de la personne, de la vérité, du travail digne, de la liberté, de la justice et de la paix.\n\nVous êtes désormais invité à devenir, dans votre milieu, un bâtisseur de communion numérique : une personne capable d'utiliser l'IA avec lucidité, de protéger les plus vulnérables, d'éclairer les décisions et de rappeler que l'être humain ne peut jamais être remplacé dans sa dignité, sa conscience et sa vocation à aimer.",
  references10: [
    { num: 1, text: "L'IA doit servir la personne humaine." },
    { num: 2, text: "La dignité humaine prime sur la performance." },
    { num: 3, text: "La responsabilité humaine ne doit jamais disparaître." },
    { num: 4, text: "Les données personnelles doivent être protégées." },
    { num: 5, text: "Toute décision importante doit être explicable et contestable." },
    { num: 6, text: "Les contenus générés par IA doivent être vérifiés." },
    { num: 7, text: "Les enfants et les personnes vulnérables doivent être spécialement protégés." },
    { num: 8, text: "Le travail humain doit être respecté et accompagné." },
    { num: 9, text: "L'IA doit réduire les inégalités, non les aggraver." },
    { num: 10, text: "L'IA doit contribuer à la vérité, à la justice, à la liberté et à la paix." },
  ],
  glossary: [
    {
      term: "Intelligence artificielle",
      definition:
        "Ensemble de systèmes capables d'effectuer des tâches associées à l'intelligence humaine : analyser, classer, prédire, générer, traduire, recommander ou dialoguer.",
    },
    {
      term: "Dignité humaine",
      definition:
        "Valeur inaliénable de toute personne, indépendamment de ses performances, de son utilité, de son âge, de son état de santé, de son origine ou de ses capacités.",
    },
    {
      term: "Bien commun",
      definition:
        "Ensemble des conditions sociales qui permettent aux personnes et aux communautés d'atteindre leur accomplissement de façon plus pleine et plus humaine.",
    },
    {
      term: "Biais algorithmique",
      definition:
        "Erreur ou discrimination produite par un système d'IA à cause des données, du modèle, des paramètres ou des finalités de conception.",
    },
    {
      term: "Deepfake",
      definition:
        "Image, vidéo ou audio généré ou modifié par IA pour faire croire qu'une personne a dit ou fait quelque chose qu'elle n'a pas dit ou fait.",
    },
    {
      term: "Transparence algorithmique",
      definition:
        "Capacité à comprendre quand, pourquoi et comment un système d'IA influence une décision ou une recommandation.",
    },
    {
      term: "Sobriété numérique",
      definition:
        "Usage mesuré, proportionné et responsable des technologies numériques, en évitant les usages inutiles, intrusifs ou destructeurs.",
    },
    {
      term: "Contrôle humain significatif",
      definition:
        "Principe selon lequel une personne humaine doit garder la capacité réelle de comprendre, valider, corriger, suspendre ou refuser une décision assistée par IA.",
    },
  ],
  resources: [
    {
      kind: "principale",
      items: ["Lettre encyclique Magnifica Humanitas, 15 mai 2026."],
    },
    {
      kind: "pedagogique",
      items: [
        "Vidéo d'introduction de 5 minutes.",
        "Fiche synthèse en PDF.",
        "Infographie « Babel ou Jérusalem ».",
        "Grille d'audit éthique de l'IA.",
        "Modèle de charte d'usage responsable.",
        "Quiz LMS importables.",
        "Activités H5P.",
        "Forum de suivi à 30 jours.",
      ],
    },
  ],
  integrations: [
    {
      platform: "Moodle",
      steps: [
        "Créer un cours au format thématique.",
        "Créer une section par module.",
        "Ajouter ce fichier Markdown comme ressource « Page » ou « Livre ».",
        "Transformer les quiz en activité « Test ».",
        "Transformer les cas en activité « Devoir ».",
        "Créer les activités H5P dans la banque de contenus.",
        "Activer l'achèvement d'activité.",
        "Créer les badges numériques.",
      ],
    },
    {
      platform: "WordPress LMS",
      steps: [
        "Créer une formation.",
        "Transformer chaque module en leçon.",
        "Ajouter les quiz après chaque leçon.",
        "Utiliser les forums/commentaires pour les débats.",
        "Utiliser un formulaire de dépôt pour la charte finale.",
      ],
    },
    {
      platform: "Chamilo ou Canvas",
      steps: [
        "Créer un parcours d'apprentissage.",
        "Importer les sections comme pages de cours.",
        "Créer des exercices auto-correctifs.",
        "Ajouter les dépôts de production.",
        "Prévoir une rubrique d'évaluation.",
      ],
    },
    {
      platform: "EduWeb Planner",
      steps: [
        "Section dédiée /aide/seminaire/magnifica-humanitas.",
        "Quiz interactifs auto-corrigés intégrés.",
        "Livret académique imprimable.",
        "Export Word complet (.docx).",
        "Charte modèle adaptable et exportable.",
        "Certificat de fin de séminaire via /aide/certificat.",
      ],
    },
  ],
  prompts: [
    {
      kind: "video",
      title: "Vidéo d'introduction de 5 minutes",
      description:
        "Créer une vidéo de 5 minutes en français sur le thème : « Rester humains à l'ère de l'intelligence artificielle ». La vidéo doit présenter l'encyclique Magnifica Humanitas, expliquer l'opposition pédagogique entre Babel et Jérusalem, montrer que l'IA peut être utile mais doit rester au service de la dignité humaine, et inviter les participants à entrer dans un parcours de discernement responsable. Le ton doit être clair, spirituel, accessible, institutionnel et engageant.",
    },
    {
      kind: "infographic",
      title: "Infographie pédagogique",
      description:
        "Créer une infographie pédagogique en français intitulée : « IA : Babel ou Jérusalem ? ». À gauche, représenter Babel : domination, uniformisation, profit, surveillance, manipulation, déshumanisation. À droite, représenter Jérusalem : dignité humaine, écoute, coopération, vérité, justice, paix, protection des plus fragiles. Au centre, placer la question : « Quelle humanité voulons-nous construire avec l'IA ? ». Style moderne, clair, institutionnel, adapté à une plateforme de formation.",
    },
  ],
  charte: {
    preambule:
      "Nous reconnaissons que l'intelligence artificielle peut contribuer au progrès humain lorsqu'elle est mise au service de la dignité de chaque personne, du bien commun, de la vérité, de la liberté, de la justice sociale et de la paix. Nous affirmons que l'IA doit rester un instrument au service de l'être humain et ne doit jamais devenir un substitut à la conscience, à la responsabilité et à la relation humaine.",
    engagements: [
      {
        num: 1,
        title: "Primauté de la personne humaine",
        description:
          "Nous nous engageons à ne jamais réduire une personne à ses données, ses performances, ses résultats ou son profil numérique.",
      },
      {
        num: 2,
        title: "Responsabilité humaine",
        description:
          "Nous garantissons qu'aucune décision importante ne sera abandonnée à une IA sans validation, supervision ou recours humain.",
      },
      {
        num: 3,
        title: "Transparence",
        description:
          "Nous informerons les utilisateurs lorsqu'un outil d'IA est utilisé, dans quel but et avec quelles limites.",
      },
      {
        num: 4,
        title: "Protection des données",
        description:
          "Nous collecterons uniquement les données nécessaires, avec consentement, sécurité et respect de la vie privée.",
      },
      {
        num: 5,
        title: "Vérification des contenus",
        description: "Nous vérifierons les informations produites par l'IA avant toute diffusion ou décision.",
      },
      {
        num: 6,
        title: "Protection des mineurs et des personnes vulnérables",
        description:
          "Nous porterons une attention particulière aux enfants, aux jeunes, aux personnes fragiles, aux personnes en difficulté et aux exclus du numérique.",
      },
      {
        num: 7,
        title: "Justice et non-discrimination",
        description: "Nous évaluerons les biais possibles et refuserons tout usage discriminatoire de l'IA.",
      },
      {
        num: 8,
        title: "Respect du travail humain",
        description:
          "Nous utiliserons l'IA pour soutenir le travail, non pour exploiter, surveiller abusivement ou remplacer sans accompagnement.",
      },
      {
        num: 9,
        title: "Sobriété et discernement",
        description:
          "Nous éviterons d'utiliser l'IA lorsque son usage n'est pas nécessaire, proportionné ou bénéfique.",
      },
      {
        num: 10,
        title: "Paix et bien commun",
        description:
          "Nous refuserons tout usage de l'IA qui favorise la violence, la manipulation, la déshumanisation ou la domination.",
      },
    ],
    implementation: [
      "Un comité de suivi.",
      "Une formation des utilisateurs.",
      "Une procédure de signalement.",
      "Un audit annuel.",
      "Une mise à jour régulière selon l'évolution des usages et des risques.",
    ],
  },
  synthese: [
    { num: 1, verb: "Discerner", description: "Ne pas céder à la peur ni à la fascination." },
    { num: 2, verb: "Protéger", description: "Placer la dignité humaine au centre." },
    { num: 3, verb: "Responsabiliser", description: "Ne pas déléguer la conscience morale à la machine." },
    { num: 4, verb: "Éduquer", description: "Former à l'esprit critique, à la vérité et à la liberté." },
    { num: 5, verb: "Humaniser", description: "Faire de la technologie un service de communion, de justice et de paix." },
  ],
};

export const SEMINAIRES_REGISTRY = {
  "magnifica-humanitas": MAGNIFICA_HUMANITAS,
} as const;

export type SeminaireSlug = keyof typeof SEMINAIRES_REGISTRY;
