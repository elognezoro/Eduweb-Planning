/* ============================================================================
   Formation « L'intelligence artificielle au service de la communication
   éducative et pastorale » — SENEC, 2 h 30.

   Suite logique du séminaire « Le numérique au service de la communication
   éducative et pastorale ». Cet espace réutilise le modèle CommSeminaire
   (livre numérique paginé, diapositives ePub, ateliers interactifs, livret
   imprimable et export Word) et l'enrichit de champs propres à l'IA :
   méthode de prompt P.A.S.T.O.R.A.L., règle des 5 V, carte des usages et
   protocole d'usage responsable.
   ========================================================================== */

import type {
  CommSeminaire,
  CommSlide,
  CommSeminaireActivity,
} from "@/lib/seminaires/communication-pastorale";

/* -------------------------------------------------------------------------- */
/*  DIAPOSITIVES — Séquence 1 : présentation contextuelle (20 min)            */
/* -------------------------------------------------------------------------- */
const SLIDES: CommSlide[] = [
  {
    num: 1,
    title: "L'intelligence artificielle au service de la communication éducative et pastorale",
    subtitle: "Produire, adapter, vérifier et sécuriser ses messages avec discernement",
    layout: "cover",
    facilitatorNote:
      "Ouverture (20 min). Rappeler que cette session prolonge le séminaire sur le numérique : de la présence cohérente à l'efficacité assistée par l'IA, sans perdre le discernement.",
    blocks: [
      {
        kind: "paragraph",
        tone: "lead",
        text: "Une suite naturelle : après avoir construit une présence numérique cohérente, apprenons à utiliser l'IA pour mieux produire, adapter, structurer, traduire, corriger et sécuriser nos messages.",
      },
    ],
    footer: "SENEC — Secrétariat National de l'Enseignement Catholique",
  },
  {
    num: 2,
    title: "Pourquoi maintenant ?",
    layout: "standard",
    facilitatorNote:
      "Poser l'enjeu : l'IA est déjà présente dans les pratiques. La question n'est pas « si » mais « comment ».",
    blocks: [
      {
        kind: "paragraph",
        text: "L'intelligence artificielle s'impose aujourd'hui dans la rédaction, la recherche, la traduction, la synthèse, la planification et la création de contenus. Élèves, parents, enseignants, partenaires et institutions y sont déjà exposés.",
      },
      {
        kind: "highlight",
        tone: "pastoral",
        text: "L'enjeu pour l'Éducation Catholique n'est pas de savoir si l'IA existe, mais comment l'utiliser avec compétence, prudence et fidélité à sa mission.",
      },
    ],
  },
  {
    num: 3,
    title: "Ce que l'IA peut faire",
    subtitle: "Un assistant de préparation, pas une autorité de décision",
    layout: "standard",
    blocks: [
      {
        kind: "bulletList",
        intro: "L'IA peut aider à :",
        items: [
          "écrire plus vite et reformuler plus clairement",
          "adapter un message à différents publics et canaux",
          "traduire et résumer un document",
          "préparer une foire aux questions ou un calendrier éditorial",
          "produire des idées de publications et de capsules",
        ],
      },
    ],
  },
  {
    num: 4,
    title: "Ce que l'IA peut rater",
    layout: "standard",
    facilitatorNote: "Équilibrer : montrer les limites sans diaboliser l'outil.",
    blocks: [
      {
        kind: "bulletList",
        intro: "Mais elle peut aussi :",
        items: [
          "produire des erreurs et inventer des informations",
          "adopter un ton inadapté à l'institution",
          "exposer des données sensibles",
          "banaliser la parole institutionnelle",
        ],
      },
      {
        kind: "highlight",
        tone: "warning",
        text: "Elle peut être convaincante sans être exacte, élégante sans être juste, rapide sans être prudente.",
      },
    ],
  },
  {
    num: 5,
    title: "Garder la maîtrise",
    subtitle: "La bonne articulation entre la machine et l'humain",
    layout: "standard",
    blocks: [
      {
        kind: "flow",
        items: [
          "L'IA propose",
          "l'humain discerne",
          "l'IA génère",
          "l'institution valide",
          "l'IA accélère",
          "la mission oriente",
        ],
      },
    ],
  },
  {
    num: 6,
    title: "Message clé",
    layout: "standard",
    blocks: [
      {
        kind: "highlight",
        tone: "success",
        text: "L'intelligence artificielle est un outil puissant ; elle devient utile lorsqu'elle sert la vérité, la clarté, la dignité humaine et la mission éducative. Elle devient dangereuse lorsqu'elle remplace le discernement, la prudence et la responsabilité.",
      },
    ],
  },
  {
    num: 7,
    title: "La bonne posture face à l'IA",
    layout: "standard",
    blocks: [
      {
        kind: "pillars",
        align: "horizontal",
        items: [
          {
            label: "Ni rejet",
            title: "Ne pas refuser par principe",
            description: "Le rejet systématique prive l'institution d'un levier d'efficacité réel.",
          },
          {
            label: "Ni naïveté",
            title: "Ne pas adopter sans recul",
            description: "L'enthousiasme naïf expose à l'erreur, à la manipulation et à la perte d'identité.",
          },
          {
            label: "Compétence",
            title: "Compétence + discernement",
            description: "La bonne posture associe la maîtrise technique au jugement humain et pastoral.",
          },
        ],
      },
    ],
  },
  {
    num: 8,
    title: "De la présence à l'efficacité",
    subtitle: "Le prolongement du séminaire précédent",
    layout: "standard",
    blocks: [
      {
        kind: "paragraph",
        text: "Une fois que les acteurs savent pourquoi communiquer, à qui, où et selon quelle ligne éditoriale, ils peuvent utiliser l'IA pour mieux produire, adapter, structurer, traduire, corriger, planifier et sécuriser leurs messages.",
      },
      {
        kind: "highlight",
        tone: "info",
        text: "L'IA est un assistant intelligent — non un décideur, encore moins une autorité morale.",
      },
    ],
  },
  {
    num: 9,
    title: "Deux boussoles pour la session",
    subtitle: "P.A.S.T.O.R.A.L. pour produire · les 5 V pour valider",
    layout: "standard",
    blocks: [
      {
        kind: "pillars",
        items: [
          {
            label: "Produire",
            title: "Méthode P.A.S.T.O.R.A.L.",
            description: "Public, Action attendue, Situation, Ton, Objectif, Règles, Adaptation, Lecture humaine — pour rédiger un bon prompt.",
          },
          {
            label: "Valider",
            title: "Règle des 5 V",
            description: "Vérité, Valeurs, Voix, Vie privée, Validation — avant toute publication assistée par IA.",
          },
        ],
      },
    ],
  },
  {
    num: 10,
    title: "Au service de la mission",
    layout: "closing",
    blocks: [
      {
        kind: "highlight",
        tone: "pastoral",
        text: "L'IA peut aider à écrire plus vite, organiser plus clairement et rejoindre plus largement. Mais seule l'intelligence humaine — éclairée par la responsabilité, la foi, la prudence et la charité — fait de cette communication un véritable service éducatif et pastoral.",
      },
    ],
    footer: "Place à la pratique : diagnostic, modules, ateliers et engagement.",
  },
];

/* -------------------------------------------------------------------------- */
/*  ATELIERS INTERACTIFS                                                       */
/* -------------------------------------------------------------------------- */
const ACTIVITIES: CommSeminaireActivity[] = [
  {
    id: "diag-ia",
    num: "1",
    title: "Diagnostic interactif de maturité IA",
    kind: "diagnostic",
    recommendation: "Questionnaire — 15 minutes.",
    instructions: [
      "Cochez chaque affirmation vraie pour vous. Chaque réponse positive vaut 1 point ; votre score situe votre niveau de maturité dans l'usage de l'IA.",
    ],
    items: [
      { label: "J'ai déjà utilisé un outil d'IA (ChatGPT, Copilot, Gemini ou autre)." },
      { label: "Je sais formuler une demande claire à une IA." },
      { label: "J'ai déjà utilisé l'IA pour reformuler un texte." },
      { label: "J'ai déjà utilisé l'IA pour préparer une publication." },
      { label: "Je relis toujours un texte généré par IA avant utilisation." },
      { label: "Je sais que l'IA peut inventer des informations." },
      { label: "Je ne partage jamais de données sensibles dans un outil IA sans précaution." },
      { label: "Ma structure a déjà discuté des règles d'usage de l'IA." },
      { label: "Je sais adapter un message généré par IA au ton institutionnel catholique." },
      { label: "Je sais distinguer un usage utile, risqué ou interdit de l'IA." },
    ],
    deliverable:
      "Votre profil de maturité IA (débutant, occasionnel, prudent ou stratégique) et vos premières priorités.",
  },
  {
    id: "reformuler-ia",
    num: "2",
    title: "Reformuler un message brut",
    kind: "ai-correction",
    recommendation: "Module 1 — application guidée.",
    instructions: [
      "Voici un message brut, télégraphique. Identifiez ce qui ne va pas, proposez votre reformulation institutionnelle, puis comparez avec la version modèle.",
    ],
    aiChallenge: {
      sourceLabel: "Message brut à reformuler",
      rawMessage:
        "Réunion parents vendredi venez nombreux c'est important pour vos enfants.",
      problems: [
        "Style télégraphique, sans ponctuation ni structure.",
        "Aucune formule d'adresse ni de signature.",
        "Ton non institutionnel.",
        "Informations pratiques manquantes (date précise, heure, lieu).",
        "Absence de dimension éducative et pastorale.",
      ],
      correctedMessage:
        "Chers parents,\n\nVous êtes cordialement invités à une réunion d'échange prévue le vendredi [date] à [heure]. Cette rencontre portera sur l'accompagnement éducatif des élèves et la collaboration entre les familles et l'établissement. Votre présence est vivement souhaitée.",
      whyBetter: [
        "Une formule d'adresse claire et respectueuse.",
        "Un objet précis : l'accompagnement éducatif.",
        "Un ton institutionnel et chaleureux.",
        "Une invitation qui valorise la collaboration familles-école.",
        "Des crochets pour les informations à compléter, sans rien inventer.",
      ],
    },
    deliverable: "Une reformulation claire, sobre et institutionnelle, prête à compléter.",
  },
  {
    id: "corriger-promo-ia",
    num: "3",
    title: "Atelier pratique — corriger un message généré par IA",
    kind: "ai-correction",
    recommendation: "Modules 3 & atelier — 20 minutes.",
    instructions: [
      "Un établissement veut annoncer l'ouverture des inscriptions. Voici un message généré par IA. Repérez ses problèmes, proposez une version sobre et vraie, puis comparez avec la correction modèle.",
    ],
    aiChallenge: {
      rawMessage:
        "Notre école catholique est la meilleure solution pour garantir l'avenir de vos enfants. Avec nous, la réussite est certaine. Aucun autre établissement n'offre un encadrement aussi sérieux. Inscrivez vite vos enfants avant qu'il ne soit trop tard.",
      problems: [
        "Promesse excessive et irréaliste (« la réussite est certaine »).",
        "Comparaison dévalorisante avec les autres établissements.",
        "Ton commercial, contraire à la sobriété institutionnelle.",
        "Pression inutile sur les parents.",
        "Absence de données concrètes (niveaux, pièces, modalités).",
        "Risque de perte de crédibilité.",
      ],
      correctedMessage:
        "Les inscriptions sont ouvertes à [nom de l'établissement] pour l'année scolaire [année].\n\nNotre établissement catholique accueille les élèves dans un cadre éducatif qui associe exigence académique, accompagnement humain, discipline, vie communautaire et ouverture spirituelle.\n\nLes familles intéressées peuvent se rapprocher de l'administration pour obtenir les informations relatives aux niveaux disponibles, aux pièces à fournir et aux modalités d'inscription.\n\nContact : [contact] · Lieu : [adresse] · Horaires : [horaires]",
      whyBetter: [
        "Elle est professionnelle et sobre.",
        "Elle ne dénigre aucun autre établissement.",
        "Elle ne promet pas l'impossible.",
        "Elle valorise l'identité catholique.",
        "Elle respecte les familles et les invite sans manipuler.",
        "Elle reste crédible et vérifiable.",
      ],
    },
    deliverable:
      "Un message d'inscription publiable, décliné ensuite en versions WhatsApp et Facebook.",
  },
  {
    id: "qcm-ia",
    num: "4",
    title: "Quiz d'autoévaluation — 8 questions",
    kind: "qcm",
    recommendation: "QCM auto-corrigé.",
    instructions: [
      "Répondez à chaque question, puis cliquez sur Vérifier pour obtenir votre score et les justifications.",
    ],
    qcm: [
      {
        question: "L'intelligence artificielle générative sert principalement à :",
        options: [
          "Remplacer totalement le communicateur",
          "Produire ou aider à produire du contenu à partir d'une consigne",
          "Garantir automatiquement la vérité d'un texte",
          "Décider seule de la stratégie institutionnelle",
        ],
        correctIdx: 1,
        rationale:
          "L'IA générative produit ou améliore des contenus à partir d'un prompt ; elle ne décide pas et ne garantit pas la vérité.",
      },
      {
        question: "Le prompt est :",
        options: [
          "Le mot de passe d'un compte IA",
          "La consigne donnée à l'IA",
          "Le résultat produit par l'IA",
          "Le nom d'un logiciel de montage",
        ],
        correctIdx: 1,
        rationale: "Le prompt est la consigne formulée à l'IA pour orienter sa production.",
      },
      {
        question: "Quel élément rend un prompt plus efficace ?",
        options: [
          "Être très vague",
          "Préciser le public, le contexte, le ton et l'objectif",
          "Demander simplement « fais-moi un texte »",
          "Ne jamais donner de contraintes",
        ],
        correctIdx: 1,
        rationale: "Une demande précise et contextualisée produit un contenu nettement plus utile.",
      },
      {
        question: "Quelle est la meilleure attitude face à un texte généré par IA ?",
        options: [
          "Le publier immédiatement",
          "Le relire, vérifier les faits et l'adapter au contexte",
          "Le considérer comme automatiquement officiel",
          "Le publier seulement s'il est long",
        ],
        correctIdx: 1,
        rationale: "Relecture, vérification des faits et adaptation au contexte sont indispensables avant tout usage.",
      },
      {
        question: "Quel usage de l'IA est risqué ?",
        options: [
          "Corriger les fautes d'un communiqué",
          "Résumer un texte long",
          "Inventer des témoignages pour valoriser une école",
          "Adapter un message à WhatsApp",
        ],
        correctIdx: 2,
        rationale: "Inventer de faux témoignages est une atteinte à la vérité et à la crédibilité de l'institution.",
      },
      {
        question: "Dans une communication pastorale, l'IA doit être utilisée :",
        options: [
          "Comme autorité spirituelle",
          "Comme outil d'aide, sous discernement humain",
          "Comme remplaçante de l'aumônier",
          "Comme source automatique de doctrine",
        ],
        correctIdx: 1,
        rationale: "L'IA est un outil d'aide ; le discernement humain et l'autorité pastorale demeurent.",
      },
      {
        question: "Pourquoi ne faut-il pas saisir des données sensibles dans un outil IA ?",
        options: [
          "Parce que l'IA ne comprend jamais rien",
          "Parce que cela peut exposer des informations personnelles ou confidentielles",
          "Parce que les données n'ont aucune importance",
          "Parce que les textes seraient trop courts",
        ],
        correctIdx: 1,
        rationale: "Saisir des données sensibles peut exposer des informations personnelles ou confidentielles.",
      },
      {
        question: "Avant de publier un contenu aidé par IA, il faut vérifier :",
        options: [
          "Seulement la beauté du texte",
          "Les faits, le ton, la confidentialité et la validation institutionnelle",
          "Le nombre d'emojis",
          "La vitesse de génération",
        ],
        correctIdx: 1,
        rationale: "La règle des 5 V : Vérité, Valeurs, Voix, Vie privée, Validation.",
      },
    ],
    deliverable: "Un score commenté et la liste des notions à consolider.",
  },
  {
    id: "engagement-ia",
    num: "5",
    title: "Engagement personnel",
    kind: "reflection",
    recommendation: "Séquence 7 — engagement.",
    instructions: [
      "Avant de quitter la session, formulez votre engagement à utiliser l'IA de manière responsable.",
    ],
    items: [
      { label: "Une action de communication que je vais améliorer avec l'IA dans les 15 prochains jours" },
      { label: "Un usage de l'IA que je veux m'interdire ou encadrer" },
      { label: "Une règle de vérification que je vais adopter systématiquement" },
      { label: "Une personne ou une instance qui validera mes contenus sensibles" },
      { label: "Une personne avec qui je vais partager cette formation" },
    ],
    deliverable: "Un engagement concret à mettre en œuvre dans les 15 jours.",
  },
];

/* -------------------------------------------------------------------------- */
/*  EXPORT DU SÉMINAIRE                                                        */
/* -------------------------------------------------------------------------- */
export const IA_COMMUNICATION: CommSeminaire = {
  meta: {
    slug: "ia-communication",
    title: "L'intelligence artificielle au service de la communication éducative et pastorale",
    subtitle: "Produire, adapter, vérifier et sécuriser ses messages avec discernement",
    reference:
      "Séminaire des communicateurs de l'Éducation Catholique de Côte d'Ivoire (SENEC)",
    referenceDate: "24 juin 2026",
    audience:
      "Communicateurs diocésains, responsables de la communication des établissements catholiques, chefs d'établissement, cadres pastoraux, équipes web et réseaux sociaux des écoles catholiques.",
    organiser: "SENEC — Secrétariat National de l'Enseignement Catholique",
    format:
      "Présentation contextuelle + diagnostic + 3 modules + atelier pratique + auto-évaluation",
    duration: "2 heures 30 minutes",
    presentationDuration: "20 minutes",
    level: "Initiation professionnelle approfondie",
    completion:
      "Présentation + diagnostic + modules + atelier pratique + QCM + auto-évaluation + engagement",
    presentation: [
      "Cette session vient naturellement après celle sur le numérique : la précédente apprend à construire une présence cohérente ; celle-ci montre comment l'IA peut aider à produire, organiser, adapter, vérifier et renforcer cette présence, sans remplacer le discernement humain ni l'éthique pastorale.",
      "La thématique de l'intelligence artificielle exige un temps plus long que la simple sensibilisation : les participants ne doivent pas seulement comprendre ce qu'est l'IA, mais apprendre à l'utiliser concrètement — produire de bons prompts, corriger les contenus générés, détecter les risques éthiques et élaborer des règles d'usage responsables pour leurs institutions.",
      "La durée de 2 h 30 permet de passer d'une approche informative à une approche réellement formative, fondée sur la pratique, le discernement et la production d'outils directement exploitables.",
    ],
  },
  heroImage: "/seminaires/ia-communication/header.png",
  pptxAsset: "",
  slides: SLIDES,
  objectives: [
    "Utiliser l'IA de manière efficace, responsable et éthique pour concevoir, améliorer, adapter, vérifier et diffuser des contenus de communication éducative et pastorale.",
    "Comprendre les apports concrets et les limites de l'IA générative en communication.",
    "Maîtriser la rédaction de prompts précis, contextualisés et exploitables.",
    "Reconnaître les risques éthiques et mettre en place une validation institutionnelle.",
    "Élaborer un protocole simple d'usage responsable de l'IA pour sa cellule de communication.",
  ],
  competences: [
    "Expliquer simplement ce qu'est l'intelligence artificielle générative.",
    "Identifier les usages pertinents de l'IA dans la communication éducative et pastorale.",
    "Rédiger un prompt précis, contextualisé et exploitable.",
    "Adapter un même message à plusieurs publics et canaux.",
    "Corriger un contenu généré par IA avant publication.",
    "Repérer les risques d'erreur, d'exagération, de manipulation ou d'atteinte à la confidentialité.",
    "Appliquer les principes de vérité, de prudence, de dignité humaine et de responsabilité pastorale.",
    "Élaborer une charte ou un protocole simple d'usage responsable de l'IA.",
  ],
  activities: ACTIVITIES,
  // -------- Méthode P.A.S.T.O.R.A.L. (Module 2) --------
  promptMethod: [
    { letter: "P", label: "Public", detail: "À qui s'adresse le message ? Ex. : parents d'élèves du secondaire." },
    { letter: "A", label: "Action attendue", detail: "Que doivent faire les destinataires ? Ex. : participer à une réunion." },
    { letter: "S", label: "Situation", detail: "Quel est le contexte ? Ex. : rencontre sur la discipline et le suivi scolaire." },
    { letter: "T", label: "Ton", detail: "Quel style adopter ? Ex. : institutionnel, chaleureux, respectueux et pastoral." },
    { letter: "O", label: "Objectif", detail: "Quel est le but ? Ex. : mobiliser les parents sans les culpabiliser." },
    { letter: "R", label: "Règles", detail: "Quelles limites respecter ? Ex. : ne pas inventer de date, ne rien promettre, ne dénigrer personne." },
    { letter: "A", label: "Adaptation", detail: "Quels formats produire ? Ex. : une version WhatsApp et une version Facebook." },
    { letter: "L", label: "Lecture humaine", detail: "Prévoir la relecture et la validation : le message reste modifiable et soumis à validation avant publication." },
  ],
  promptExamples: {
    bad: "Fais-moi un message pour les parents.",
    good: "Agis comme un assistant de communication pour un établissement catholique. Rédige un message destiné aux parents d'élèves pour les inviter à une réunion sur la discipline et le suivi scolaire. Le ton doit être institutionnel, respectueux, chaleureux et pastoral. Le message doit être court, adapté à WhatsApp, sans culpabiliser les parents. N'invente aucune date ni aucun lieu. Utilise des crochets pour les informations manquantes.",
  },
  // -------- Règle des 5 V (Module 3) --------
  fiveV: [
    { letter: "V", label: "Vérité", detail: "Les faits sont-ils exacts ? Ne pas publier de fausses informations." },
    { letter: "V", label: "Valeurs", detail: "Le message respecte-t-il l'identité catholique ?" },
    { letter: "V", label: "Voix", detail: "Le ton correspond-il à notre institution ?" },
    { letter: "V", label: "Vie privée", detail: "Aucune donnée sensible n'est exposée ?" },
    { letter: "V", label: "Validation", detail: "Une autorité compétente a-t-elle relu et validé ?" },
  ],
  // -------- Carte des usages utiles (Module 1) --------
  usageCategories: [
    { title: "Reformuler un message", items: ["Rendre un texte plus clair", "Corriger un ton trop administratif", "Simplifier un communiqué"] },
    { title: "Résumer un document", items: ["Extraire les points clés d'un rapport", "Préparer une synthèse pour les parents", "Transformer un long texte en message court"] },
    { title: "Adapter un message", items: ["Version WhatsApp", "Version Facebook", "Version site web", "Version communiqué officiel", "Version affiche"] },
    { title: "Traduire", items: ["Français vers anglais", "Français vers langues locales (si l'outil le permet)", "Traduction simplifiée pour partenaires"] },
    { title: "Produire des idées", items: ["Idées de publications", "Thèmes de capsules vidéo", "Titres d'articles", "Messages pastoraux hebdomadaires"] },
    { title: "Préparer un calendrier éditorial", items: ["Publications de rentrée", "Temps liturgiques", "Événements scolaires", "Campagnes d'inscription", "Journées portes ouvertes"] },
    { title: "Créer une FAQ", items: ["Inscriptions", "Discipline", "Rentrée", "Activités pastorales", "Fonctionnement de l'établissement"] },
    { title: "Améliorer la qualité rédactionnelle", items: ["Orthographe", "Grammaire", "Ponctuation", "Cohérence", "Clarté"] },
  ],
  // -------- Protocole d'usage responsable (livrable, 7 points) --------
  protocol: [
    {
      num: 1,
      title: "Usage prévu",
      items: ["Reformuler", "Corriger", "Résumer", "Traduire", "Préparer des publications", "Créer des calendriers", "Adapter des messages"],
    },
    {
      num: 2,
      title: "Usages interdits ou sensibles",
      items: [
        "Inventer des faits",
        "Traiter des données confidentielles",
        "Publier sans validation",
        "Répondre seuls aux crises",
        "Produire de faux témoignages",
        "Créer de fausses images institutionnelles",
        "Remplacer la parole pastorale authentique",
      ],
    },
    {
      num: 3,
      title: "Règle de prompt",
      items: ["Préciser le public", "le contexte", "l'objectif", "le ton", "le canal", "les limites", "les informations à ne pas inventer"],
    },
    {
      num: 4,
      title: "Règle de vérification",
      items: ["Noms", "Dates", "Lieux", "Chiffres", "Citations", "Ton", "Conformité institutionnelle"],
    },
    {
      num: 5,
      title: "Règle de confidentialité",
      items: [
        "Pas de dossiers d'élèves",
        "Pas de cas disciplinaires",
        "Pas de données médicales",
        "Pas de conflits internes",
        "Pas d'informations familiales",
        "Pas de documents confidentiels non autorisés",
      ],
    },
    {
      num: 6,
      title: "Règle de validation",
      items: [
        "La direction",
        "Le responsable communication",
        "L'aumônier ou l'autorité pastorale si nécessaire",
        "Le SEDEC ou le SENEC selon le niveau concerné",
      ],
    },
    {
      num: 7,
      title: "Règle d'humanisation",
      items: ["Chaleur humaine", "Précision locale", "Ton pastoral", "Respect des personnes", "Cohérence avec l'identité catholique"],
    },
  ],
  glossary: [
    { term: "Intelligence artificielle générative", definition: "Outil capable de produire ou d'améliorer des contenus (texte, plan, résumé, traduction…) à partir d'une consigne appelée prompt." },
    { term: "Prompt", definition: "Consigne donnée à l'IA. Sa qualité (public, contexte, ton, objectif, limites) détermine largement la qualité de la réponse." },
    { term: "Hallucination", definition: "Production par l'IA d'une information fausse mais présentée de façon convaincante (date, nom, chiffre, citation inventés)." },
    { term: "Modèle statistique", definition: "L'IA répond à partir de régularités apprises, sans comprendre le monde comme un être humain : elle peut être élégante sans être juste." },
    { term: "Donnée sensible", definition: "Information personnelle ou confidentielle (dossier d'élève, cas disciplinaire, donnée médicale, situation familiale) à ne jamais saisir sans précaution." },
    { term: "Validation institutionnelle", definition: "Relecture et approbation par une autorité compétente avant publication de tout contenu sensible." },
    { term: "Méthode P.A.S.T.O.R.A.L.", definition: "Cadre de rédaction d'un prompt : Public, Action, Situation, Ton, Objectif, Règles, Adaptation, Lecture humaine." },
    { term: "Règle des 5 V", definition: "Grille de validation avant publication : Vérité, Valeurs, Voix, Vie privée, Validation." },
  ],
  references10: [
    { num: 1, text: "L'IA propose ; l'humain discerne." },
    { num: 2, text: "L'IA génère ; l'institution valide." },
    { num: 3, text: "L'IA accélère ; la mission éducative et pastorale oriente." },
    { num: 4, text: "Un bon prompt est une consigne complète : rôle, contexte, cible, objectif, ton, limites, format." },
    { num: 5, text: "Une demande vague produit un résultat vague ; une demande précise produit un contenu utile." },
    { num: 6, text: "L'IA peut être convaincante sans être exacte : toujours vérifier les faits." },
    { num: 7, text: "On ne saisit jamais de données sensibles dans un outil IA sans précaution." },
    { num: 8, text: "Aucun contenu sensible n'est publié sans validation humaine." },
    { num: 9, text: "Tout texte généré par IA est relu pour y ajouter chaleur, précision locale et ton pastoral." },
    { num: 10, text: "L'IA est un assistant intelligent, non un décideur ni une autorité morale." },
  ],
  schedule: [
    { hours: "00 min — 20 min", activity: "Présentation contextuelle (diapositives)" },
    { hours: "20 min — 35 min", activity: "Diagnostic interactif de maturité IA" },
    { hours: "35 min — 65 min", activity: "Module 1 : comprendre l'IA et ses usages" },
    { hours: "65 min — 95 min", activity: "Module 2 : bien prompter et produire (P.A.S.T.O.R.A.L.)" },
    { hours: "95 min — 120 min", activity: "Module 3 : éthique, risques, image et validation (5 V)" },
    { hours: "120 min — 140 min", activity: "Atelier pratique : produire, corriger et adapter un message" },
    { hours: "140 min — 150 min", activity: "Auto-évaluation finale et engagement" },
  ],
  finalSelfEvaluation: {
    durationMin: 10,
    objective:
      "Vérifier les acquis et engager les participants dans une mise en œuvre concrète.",
    levels: ["Pas encore", "En progrès", "Acquis"],
    competences: [
      "Je sais expliquer ce qu'est l'IA générative.",
      "Je sais identifier les usages utiles de l'IA en communication.",
      "Je sais formuler un prompt clair.",
      "Je sais corriger un texte généré par IA.",
      "Je sais adapter un message à plusieurs canaux.",
      "Je sais repérer les risques éthiques.",
      "Je sais protéger les données sensibles.",
      "Je sais faire valider un contenu avant publication.",
    ],
  },
  closingMessage:
    "L'intelligence artificielle peut aider à écrire plus vite, à organiser plus clairement et à rejoindre plus largement.\n\nMais seule l'intelligence humaine, éclairée par la responsabilité, la foi, la prudence et la charité, peut faire de cette communication un véritable service éducatif et pastoral.",
};
