/* ============================================================================
   Séminaire « Le numérique au service de la communication éducative et
   pastorale » — Présentation contextuelle des communicateurs de l'Éducation
   Catholique de Côte d'Ivoire (SENEC), 24 juin 2026.

   Cet espace est conçu comme un livre numérique (ePub) : 14 slides à
   feuilleter une par une, complétées d'activités interactives, d'un
   plan d'action, d'un quiz d'autoévaluation et d'un livret imprimable A4.
   ========================================================================== */

/** Bloc de contenu d'une slide — utilisé par le SlideViewer + livret + DOCX. */
export type CommSlideBlock =
  | { kind: "paragraph"; text: string; tone?: "default" | "lead" | "muted" }
  | { kind: "highlight"; text: string; tone?: "info" | "pastoral" | "warning" | "success" }
  | { kind: "bulletList"; items: string[]; intro?: string }
  | { kind: "numberedList"; items: string[]; intro?: string }
  | {
      kind: "pillars";
      items: { label: string; title: string; description: string }[];
      align?: "horizontal" | "grid";
    }
  | {
      kind: "principles";
      title?: string;
      items: { letter: string; label: string; points: string[] }[];
    }
  | { kind: "flow"; items: string[] }
  | {
      kind: "channels";
      items: { name: string; purpose: string }[];
    }
  | {
      kind: "publics";
      headers: string[];
      rows: { public: string; verbs: string[]; columns: string[] }[];
    }
  | {
      kind: "steps";
      items: { num: number; label: string; detail: string }[];
    };

export type CommSlideLayout = "cover" | "standard" | "closing";

export interface CommSlide {
  num: number;
  /** Titre principal affiché en grand. */
  title: string;
  /** Sous-titre ou phrase d'amorce. */
  subtitle?: string;
  /** Note pour le formateur (non affichée par défaut, montrée en mode notes). */
  facilitatorNote?: string;
  layout: CommSlideLayout;
  blocks: CommSlideBlock[];
  /** Phrase de pied (citation, repère). */
  footer?: string;
}

export interface CommSeminaireMeta {
  slug: string;
  title: string;
  subtitle: string;
  reference: string;
  referenceDate: string;
  audience: string;
  organiser: string;
  format: string;
  duration: string;
  presentationDuration: string;
  level: string;
  completion: string;
  presentation: string[];
}

export interface CommSeminaireActivity {
  id: string;
  num: string;
  title: string;
  kind:
    | "diagnostic"
    | "qcm"
    | "matrix"
    | "checklist"
    | "plan"
    | "scenario"
    | "reflection"
    | "ai-correction";
  /** Outil ou modalité recommandée. */
  recommendation?: string;
  instructions: string[];
  /** QCM auto-corrigé. */
  qcm?: { question: string; options: string[]; correctIdx: number; rationale?: string }[];
  /** Cases d'autoévaluation cochables (diagnostic, plan d'action). */
  items?: { label: string; helper?: string }[];
  /** Matrice à remplir (tableaux saisissables). */
  tableHeaders?: string[];
  tableRows?: string[];
  /** Défi IA : message brut à corriger + correction modèle révélable. */
  aiChallenge?: {
    rawMessage: string;
    problems: string[];
    correctedMessage: string;
    whyBetter: string[];
  };
  deliverable?: string;
}

export interface CommSeminaire {
  meta: CommSeminaireMeta;
  /** Identité visuelle de l'entête : chemin image relatif à /public. */
  heroImage: string;
  /** Source PowerPoint téléchargeable (chemin relatif à /public). */
  pptxAsset: string;
  slides: CommSlide[];
  objectives: string[];
  competences: string[];
  activities: CommSeminaireActivity[];
  /** Plan d'action structuré « 1 message – 1 public – 1 objectif – 1 canal – 1 indicateur ». */
  actionPlanTemplate: {
    intro: string;
    columns: string[];
    examples: { values: string[] }[];
  };
  /** Méthode RAPIDE. */
  rapide: { letter: string; label: string }[];
  /** Règle des 4V (IA). */
  fourV: { letter: string; label: string; detail: string }[];
  glossary: { term: string; definition: string }[];
  references10: { num: number; text: string }[];
  schedule: { hours: string; activity: string }[];
  /**
   * Auto-évaluation finale (Séquence 7) — chaque participant coche son
   * niveau pour chaque compétence visée, et signale celles à renforcer
   * collectivement (chez les autres / dans l'équipe).
   */
  finalSelfEvaluation: {
    durationMin: number;
    objective: string;
    /** Échelle de progression personnelle (radio par ligne). */
    levels: string[];
    /** Libellé de la colonne « flag collectif » (case à cocher). */
    reinforceLabel: string;
    competences: string[];
  };
  closingMessage: string;
}

const SLIDES: CommSlide[] = [
  {
    num: 1,
    title: "Le numérique au service de la communication éducative et pastorale",
    subtitle: "Construire une présence cohérente, moderne et engageante",
    facilitatorNote:
      "Slide d'ouverture : poser le cadre (SENEC, 20 minutes), instaurer l'écoute, annoncer la trame « visibilité → communion ».",
    layout: "cover",
    blocks: [
      {
        kind: "paragraph",
        text: "Présentation contextuelle • 20 minutes • Séminaire des communicateurs de l'Éducation Catholique de Côte d'Ivoire",
        tone: "muted",
      },
      {
        kind: "pillars",
        align: "horizontal",
        items: [
          { label: "1", title: "De la visibilité à la communion", description: "Sortir de la simple présence." },
          { label: "2", title: "Du message à la présence", description: "Habiter durablement les canaux." },
          { label: "3", title: "Du numérique à la mission", description: "Servir le projet éducatif et pastoral." },
        ],
      },
    ],
    footer: "SENEC • 24 juin 2026",
  },
  {
    num: 2,
    title: "Point de départ : les TDR fixent une ambition claire",
    subtitle: "Renforcer l'image de marque, le positionnement et le rayonnement de l'Éducation Catholique.",
    facilitatorNote:
      "Rappel des Termes de Référence : c'est la commande institutionnelle qui légitime la formation.",
    layout: "standard",
    blocks: [
      { kind: "highlight", tone: "info", text: "Lecture opérationnelle des TDR" },
      {
        kind: "numberedList",
        items: [
          "Professionnaliser la communication institutionnelle.",
          "Maîtriser les outils numériques et l'IA.",
          "Promouvoir une pratique éthique et responsable.",
          "Mutualiser les bonnes pratiques.",
          "Préparer un plan d'action de communication.",
        ],
      },
    ],
    footer:
      "Objectif de cette session : passer du bon usage des outils à une stratégie de présence.",
  },
  {
    num: 3,
    title: "Pourquoi le numérique change la communication éducative et pastorale ?",
    subtitle:
      "Le numérique ne crée pas seulement de nouveaux canaux ; il transforme la relation, l'attention et la confiance.",
    facilitatorNote:
      "Insister sur la mutation du paradigme : on passe d'une logique de canal à une logique de relation.",
    layout: "standard",
    blocks: [
      {
        kind: "pillars",
        align: "grid",
        items: [
          {
            label: "1",
            title: "Une audience dispersée",
            description:
              "Parents, élèves, enseignants, partenaires et anciens élèves ne s'informent plus aux mêmes endroits ni au même rythme.",
          },
          {
            label: "2",
            title: "Une attention fragile",
            description:
              "Un message utile peut devenir invisible s'il n'est pas clair, bien ciblé, court, régulier et crédible.",
          },
          {
            label: "3",
            title: "Une confiance à construire",
            description:
              "Dans l'espace numérique, la réputation dépend de la cohérence entre paroles, images, délais de réponse et actes.",
          },
        ],
      },
      {
        kind: "flow",
        items: ["Informer", "Rassurer", "Former", "Mobiliser", "Témoigner", "Rayonner"],
      },
    ],
    footer:
      "La question centrale n'est plus : « Que publions-nous ? » mais : « Quelle présence voulons-nous construire dans la durée ? »",
  },
  {
    num: 4,
    title: "Présence numérique : la cohérence avant la performance",
    subtitle:
      "Une présence forte est lisible, régulière, incarnée et alignée sur la mission éducative et pastorale.",
    facilitatorNote:
      "Insister sur la primauté de la cohérence sur le volume : mieux vaut moins publier mais juste.",
    layout: "standard",
    blocks: [
      { kind: "highlight", tone: "pastoral", text: "Présence cohérente — quatre piliers indissociables" },
      {
        kind: "pillars",
        align: "grid",
        items: [
          { label: "Identité", title: "Qui sommes-nous ?", description: "Mission, valeurs, ton, identité visuelle." },
          { label: "Message", title: "Que devons-nous dire ?", description: "Information, témoignage, appel, formation." },
          { label: "Canaux", title: "Où et comment ?", description: "Le bon média, au bon rythme, pour le bon public." },
          { label: "Éthique", title: "Avec quelles limites ?", description: "Vérité, respect, vie privée, discernement." },
        ],
      },
    ],
    footer:
      "La cohérence rend l'institution identifiable ; la régularité la rend fiable ; l'engagement la rend vivante.",
  },
  {
    num: 5,
    title: "Passer d'une communication réactive à une communication stratégique",
    subtitle: "Quatre niveaux d'organisation pour éviter l'improvisation permanente.",
    facilitatorNote:
      "Présenter les 4 niveaux comme une pyramide stable : sans socle, pas de pilotage durable.",
    layout: "standard",
    blocks: [
      {
        kind: "steps",
        items: [
          { num: 1, label: "Socle", detail: "Charte éditoriale, identité visuelle, principes éthiques." },
          {
            num: 2,
            label: "Calendrier",
            detail: "Rythme de publication, temps forts liturgiques et scolaires.",
          },
          {
            num: 3,
            label: "Production",
            detail: "Photos, témoignages, capsules, messages courts, dossiers.",
          },
          {
            num: 4,
            label: "Pilotage",
            detail: "Indicateurs, veille, réponses, gestion de crise, archivage.",
          },
        ],
      },
    ],
    footer: "Repère pratique : « un message – un public – un objectif – un canal – un indicateur ».",
  },
  {
    num: 6,
    title: "Construire l'écosystème numérique d'un diocèse ou d'un établissement",
    subtitle: "Ne pas multiplier les canaux : les organiser selon leur fonction.",
    facilitatorNote:
      "Inviter les participants à dessiner leur propre écosystème — éviter d'ouvrir un canal sans mission claire.",
    layout: "standard",
    blocks: [
      {
        kind: "channels",
        items: [
          { name: "Site web", purpose: "Référence officielle." },
          { name: "Facebook", purpose: "Communauté & événements." },
          { name: "WhatsApp", purpose: "Coordination & proximité." },
          { name: "YouTube / vidéo", purpose: "Témoignages & formation." },
          { name: "Newsletter", purpose: "Relation durable." },
          { name: "Archives médias", purpose: "Mémoire institutionnelle." },
          { name: "Veille & IA", purpose: "Aide à la rédaction et au discernement." },
        ],
      },
    ],
    footer:
      "Principe d'or : chaque canal doit avoir une mission claire. Le même message peut être adapté, mais jamais copié-collé mécaniquement.",
  },
  {
    num: 7,
    title: "La communication éducative : informer, former, faire grandir",
    subtitle:
      "Dans l'éducation catholique, la communication ne sert pas seulement la promotion ; elle sert la mission.",
    facilitatorNote:
      "Insister sur la triple finalité : informer (transparence), former (esprit critique), faire grandir (relation).",
    layout: "standard",
    blocks: [
      { kind: "highlight", tone: "pastoral", text: "Une école visible parce qu'elle sert." },
      {
        kind: "pillars",
        align: "grid",
        items: [
          {
            label: "Informer",
            title: "Rendre lisible",
            description: "Les décisions, les calendriers, les résultats et les opportunités.",
          },
          {
            label: "Former",
            title: "Éduquer aux usages",
            description:
              "Vérité, prudence, respect et discernement face au numérique.",
          },
          {
            label: "Faire grandir",
            title: "Tisser la confiance",
            description:
              "Renforcer l'appartenance à une communauté éducative vivante.",
          },
        ],
      },
    ],
    footer:
      "Critère final : ce que nous publions aide-t-il une personne, une famille ou une communauté à mieux comprendre, mieux choisir et mieux agir ?",
  },
  {
    num: 8,
    title: "Une présence pastorale : vérité, proximité, espérance",
    subtitle:
      "Communiquer pastoralement, c'est joindre la justesse du message à la qualité de la relation.",
    facilitatorNote:
      "Faire émerger l'acronyme V-P-E comme boussole quotidienne d'un communicateur catholique.",
    layout: "standard",
    blocks: [
      {
        kind: "principles",
        items: [
          {
            letter: "V",
            label: "Vérité",
            points: ["Vérifier avant de publier.", "Nommer sans déformer."],
          },
          {
            letter: "P",
            label: "Proximité",
            points: ["Répondre avec respect.", "Rendre la parole accessible."],
          },
          {
            letter: "E",
            label: "Espérance",
            points: ["Valoriser les efforts.", "Ouvrir un chemin positif."],
          },
        ],
      },
    ],
    footer:
      "Une communication pastorale ne se contente pas d'être belle : elle doit être vraie, utile, respectueuse et porteuse d'espérance.",
  },
  {
    num: 9,
    title: "Composer avec les publics : parler juste à chacun",
    subtitle:
      "Un message est efficace lorsqu'il rencontre un besoin réel et un public clairement identifié.",
    facilitatorNote:
      "Faire travailler les participants sur leurs propres publics, puis projeter cette matrice.",
    layout: "standard",
    blocks: [
      {
        kind: "publics",
        headers: ["Public", "Verbes clés", "Canal", "Message", "Preuve"],
        rows: [
          {
            public: "Parents",
            verbs: ["Rassurer", "Orienter", "Associer"],
            columns: ["Newsletter, WhatsApp officiel", "Décisions, calendrier, réussites", "Photo, calendrier, témoignage"],
          },
          {
            public: "Élèves",
            verbs: ["Inspirer", "Responsabiliser", "Impliquer"],
            columns: ["Affiches, vidéo courte, classe", "Engagement, défi, fierté", "Portrait, capsule, projet"],
          },
          {
            public: "Personnel",
            verbs: ["Informer", "Coordonner", "Valoriser"],
            columns: ["Intranet, réunion, WhatsApp", "Décisions, rappels, ressources", "Note de service, compte-rendu"],
          },
          {
            public: "Partenaires",
            verbs: ["Prouver", "Convaincre", "Mobiliser"],
            columns: ["Site, rapport, courriel", "Impact, chiffres, projet", "Rapport, photo légendée, étude"],
          },
          {
            public: "Communauté",
            verbs: ["Témoigner", "Fédérer", "Rayonner"],
            columns: ["Facebook, presse, paroisse", "Mission, action, espérance", "Témoignage, vidéo, prière"],
          },
        ],
      },
    ],
    footer:
      "Avant de publier, répondre à 3 questions : pour qui ? pour produire quel effet ? avec quelle preuve ?",
  },
  {
    num: 10,
    title: "Les formats qui engagent : raconter, prouver, inviter",
    subtitle:
      "Une communication engageante transforme une information en expérience compréhensible et partageable.",
    facilitatorNote:
      "Lier les trois finalités à la méthode RAPIDE comme grille de relecture systématique.",
    layout: "standard",
    blocks: [
      {
        kind: "pillars",
        align: "grid",
        items: [
          {
            label: "Raconter",
            title: "Émotion utile",
            description:
              "Témoignage, portrait, avant/après, histoire d'élève ou d'enseignant.",
          },
          {
            label: "Prouver",
            title: "Crédibilité",
            description:
              "Résultat, photo légendée, chiffre clé, citation, initiative documentée.",
          },
          {
            label: "Inviter",
            title: "Action",
            description: "Appel clair, inscription, partage, rencontre, prière, contribution.",
          },
        ],
      },
      {
        kind: "highlight",
        tone: "success",
        text: "Méthode RAPIDE : Réel • Accessible • Positif • Identifiable • Documenté • Éthique.",
      },
    ],
    footer: "Trois finalités, une méthode : RAPIDE.",
  },
  {
    num: 11,
    title: "Risques numériques : prévenir plutôt que réparer",
    subtitle: "Le sérieux d'une institution se voit aussi dans sa capacité à anticiper les dérives.",
    facilitatorNote:
      "Présenter les 4 risques, demander aux participants si l'un d'eux a déjà été vécu, puis le réflexe professionnel.",
    layout: "standard",
    blocks: [
      {
        kind: "pillars",
        align: "grid",
        items: [
          {
            label: "!",
            title: "Données personnelles",
            description: "Photos d'enfants, autorisations, confidentialité.",
          },
          {
            label: "!",
            title: "Rumeurs & crise",
            description: "Urgence, émotion, commentaires, désinformation.",
          },
          {
            label: "!",
            title: "Image institutionnelle",
            description: "Logo, ton, fautes, contradictions, improvisation.",
          },
          {
            label: "!",
            title: "IA mal utilisée",
            description: "Hallucinations, plagiat, biais, fausses citations.",
          },
        ],
      },
      {
        kind: "highlight",
        tone: "warning",
        text: "Réflexe professionnel : vérifier • autoriser • valider • archiver • répondre calmement.",
      },
    ],
  },
  {
    num: 12,
    title: "L'IA : un assistant, jamais une autorité pastorale ou institutionnelle",
    subtitle:
      "L'IA peut accélérer la production ; elle ne remplace ni le discernement, ni la responsabilité.",
    facilitatorNote:
      "Insister sur les 4 V comme garde-fous : ils s'appliquent à toute publication assistée par IA.",
    layout: "standard",
    blocks: [
      {
        kind: "pillars",
        align: "grid",
        items: [
          {
            label: "Préparer",
            title: "L'amont du travail",
            description: "Idées de sujets, angles, calendrier, brouillons.",
          },
          {
            label: "Clarifier",
            title: "L'écriture",
            description: "Résumer, simplifier, traduire, adapter au public.",
          },
          {
            label: "Contrôler",
            title: "La relecture",
            description: "Orthographe, cohérence, ton, check-list de risques.",
          },
        ],
      },
      {
        kind: "principles",
        title: "Règle des 4 V avant publication assistée par IA",
        items: [
          { letter: "V", label: "Véracité", points: ["Les faits sont-ils vérifiés ?"] },
          { letter: "V", label: "Valeurs", points: ["Le message reflète-t-il notre mission ?"] },
          { letter: "V", label: "Vie privée", points: ["Les personnes sont-elles protégées ?"] },
          { letter: "V", label: "Validation", points: ["Un responsable a-t-il signé la publication ?"] },
        ],
      },
    ],
    footer: "L'IA propose. L'institution discerne. Le responsable valide.",
  },
  {
    num: 13,
    title: "Transition vers le cours interactif : apprendre en produisant",
    subtitle: "La suite de la session transforme ces repères en compétences opérationnelles.",
    facilitatorNote:
      "Annoncer le déroulé de l'atelier qui suit la présentation (diagnostic, cadre, production, autoévaluation).",
    layout: "standard",
    blocks: [
      {
        kind: "steps",
        items: [
          { num: 1, label: "Diagnostic flash", detail: "Mesurer sa maturité numérique." },
          { num: 2, label: "Cadre stratégique", detail: "Publics, objectifs, messages." },
          { num: 3, label: "Atelier de production", detail: "Posts, visuels, vidéo courte, IA." },
          { num: 4, label: "Auto-évaluation", detail: "Quiz, cas pratiques, plan d'action." },
        ],
      },
    ],
    footer: "Livrable final : une mini-stratégie de présence numérique et pastorale prête à adapter.",
  },
  {
    num: 14,
    title: "Merci",
    subtitle: "Vers une présence numérique missionnaire",
    facilitatorNote:
      "Conclusion : reprendre l'objectif commun, prononcer les quatre C, ouvrir la discussion.",
    layout: "closing",
    blocks: [
      { kind: "highlight", tone: "pastoral", text: "Objectif commun" },
      {
        kind: "paragraph",
        tone: "lead",
        text: "Des communicateurs capables de rendre l'Éducation Catholique plus visible, plus crédible, plus proche et plus rayonnante.",
      },
      {
        kind: "paragraph",
        text: "La présence numérique devient missionnaire lorsqu'elle unit compétence professionnelle, responsabilité éthique et sens du service.",
      },
      {
        kind: "flow",
        items: ["Clarté", "Cohérence", "Crédibilité", "Communion"],
      },
    ],
  },
];

const ACTIVITIES: CommSeminaireActivity[] = [
  {
    id: "diag",
    num: "1",
    title: "Diagnostic flash de maturité numérique",
    kind: "diagnostic",
    instructions: [
      "Cochez les pratiques qui sont déjà solidement en place dans votre institution. Plus le score est élevé, plus votre socle est mature.",
    ],
    items: [
      { label: "Une charte éditoriale écrite", helper: "ton, sujets autorisés, règles d'usage" },
      { label: "Une identité visuelle stable et appliquée", helper: "logo, couleurs, typographie" },
      { label: "Un calendrier éditorial mensuel ou trimestriel" },
      { label: "Une procédure de validation avant publication" },
      { label: "Une procédure d'autorisation pour les photos d'enfants" },
      { label: "Un référent gestion de crise et rumeurs" },
      { label: "Une revue de presse / veille hebdomadaire" },
      { label: "Une procédure de réponse aux commentaires" },
      { label: "Un archivage des contenus (textes, photos, vidéos)" },
      { label: "Des indicateurs simples suivis dans la durée" },
    ],
    deliverable: "Une note de synthèse en 5 lignes sur votre score et vos 3 priorités.",
  },
  {
    id: "qcm-comm",
    num: "2",
    title: "Quiz d'autoévaluation — 8 questions clés",
    kind: "qcm",
    recommendation: "QCM auto-corrigé.",
    instructions: [
      "Répondez à chaque question, puis cliquez sur Vérifier pour obtenir votre score et la justification.",
    ],
    qcm: [
      {
        question: "La question centrale d'une présence numérique professionnelle est :",
        options: [
          "Que publions-nous aujourd'hui ?",
          "Quelle présence voulons-nous construire dans la durée ?",
          "Combien de likes pouvons-nous obtenir ?",
          "Comment être présent sur tous les réseaux ?",
        ],
        correctIdx: 1,
        rationale: "La présence cohérente prime sur la performance ponctuelle.",
      },
      {
        question: "Les quatre piliers d'une présence cohérente sont :",
        options: [
          "Volume, vitesse, virilité, viralité",
          "Identité, message, canaux, éthique",
          "Logo, slogan, hashtag, story",
          "Site, Facebook, WhatsApp, YouTube",
        ],
        correctIdx: 1,
        rationale: "Identité, message, canaux et éthique — sans ces quatre piliers, la présence se fragilise.",
      },
      {
        question: "Avant de publier, il faut toujours se demander :",
        options: [
          "Combien de personnes vont liker ?",
          "Pour qui ? Pour produire quel effet ? Avec quelle preuve ?",
          "Quel filtre utiliser ?",
          "À quelle heure publier ?",
        ],
        correctIdx: 1,
        rationale: "Public + objectif + preuve : la triple question structurante.",
      },
      {
        question: "La méthode RAPIDE signifie :",
        options: [
          "Rythmer, Adapter, Publier, Indexer, Diffuser, Évaluer",
          "Réel, Accessible, Positif, Identifiable, Documenté, Éthique",
          "Récolter, Analyser, Préparer, Imprimer, Distribuer, Échanger",
          "Réfléchir, Activer, Préparer, Imager, Diffuser, Encadrer",
        ],
        correctIdx: 1,
        rationale: "RAPIDE est une grille de relecture en 6 critères.",
      },
      {
        question: "Une communication pastorale doit avant tout être :",
        options: [
          "Belle et virale",
          "Vraie, utile, respectueuse et porteuse d'espérance",
          "Souvent renouvelée",
          "Centrée sur les chiffres",
        ],
        correctIdx: 1,
        rationale: "La beauté est un fruit, pas un objectif premier.",
      },
      {
        question: "Le « réflexe professionnel » face aux risques numériques est :",
        options: [
          "Effacer puis publier de nouveau",
          "Vérifier • autoriser • valider • archiver • répondre calmement",
          "Demander à l'IA de répondre à notre place",
          "Suspendre tous les canaux",
        ],
        correctIdx: 1,
        rationale:
          "Cinq verbes simples qui couvrent prévention, autorité, traçabilité et tempérance.",
      },
      {
        question: "La règle des 4V appliquée à toute publication assistée par IA est :",
        options: [
          "Vitesse, Viralité, Verbe, Volume",
          "Véracité, Valeurs, Vie privée, Validation",
          "Voix, Vue, Vidéo, Vibration",
          "Vérité, Voile, Voie, Vénération",
        ],
        correctIdx: 1,
        rationale:
          "Quatre garde-fous indissociables avant de publier un contenu produit avec l'IA.",
      },
      {
        question: "Les quatre C de la conclusion sont :",
        options: [
          "Communication, Concept, Calendrier, Captation",
          "Clarté, Cohérence, Crédibilité, Communion",
          "Charisme, Conviction, Compétence, Charité",
          "Confiance, Calme, Conscience, Cœur",
        ],
        correctIdx: 1,
        rationale:
          "Les quatre C résument la promesse de présence missionnaire numérique.",
      },
    ],
  },
  {
    id: "matrix-public",
    num: "3",
    title: "Matrice des publics — atelier pratique",
    kind: "matrix",
    instructions: [
      "Pour chacun des cinq publics, précisez votre canal préférentiel, le message attendu, et la preuve à fournir. Vous pouvez ajouter une ligne pour un public spécifique à votre établissement.",
    ],
    tableHeaders: ["Public", "Canal", "Message clé", "Preuve à fournir"],
    tableRows: ["Parents", "Élèves", "Personnel", "Partenaires", "Communauté"],
    deliverable: "Une matrice complétée à utiliser dans votre plan d'action.",
  },
  {
    id: "checklist-rapide",
    num: "4",
    title: "Check-list RAPIDE — relecture d'une publication",
    kind: "checklist",
    instructions: [
      "Avant chaque publication, vérifiez les six critères RAPIDE. Tant que l'un d'eux n'est pas validé, suspendez la publication et corrigez.",
    ],
    items: [
      { label: "R — Réel", helper: "Le fait est-il avéré et vérifié ?" },
      { label: "A — Accessible", helper: "Le message est-il clair pour le public ciblé ?" },
      { label: "P — Positif", helper: "Le ton porte-t-il une espérance ou une valeur ?" },
      { label: "I — Identifiable", helper: "L'institution est-elle clairement reconnaissable ?" },
      { label: "D — Documenté", helper: "Y a-t-il preuve, source ou pièce jointe ?" },
      { label: "E — Éthique", helper: "Les personnes et la mission sont-elles respectées ?" },
    ],
  },
  {
    id: "plan-action",
    num: "5",
    title: "Plan d'action — un message, un public, un canal",
    kind: "plan",
    instructions: [
      "Définissez 3 actions concrètes à mener dans les 30 prochains jours dans votre institution. Une ligne par action.",
    ],
    tableHeaders: ["Message", "Public", "Objectif", "Canal", "Indicateur"],
    tableRows: ["Action 1", "Action 2", "Action 3"],
    deliverable:
      "Un plan d'action à présenter en équipe et à intégrer dans le calendrier éditorial.",
  },
  {
    id: "scenario-crise",
    num: "6",
    title: "Mini-scénario — gestion d'une rumeur",
    kind: "scenario",
    instructions: [
      "Une rumeur circule sur les réseaux : un parent affirme qu'une décision a été prise sans concertation. Plusieurs commentaires s'enflamment. Choisissez à chaque étape la conduite la plus professionnelle.",
    ],
    qcm: [
      {
        question:
          "Étape 1 — Vous découvrez la rumeur le matin. Que faites-vous en premier ?",
        options: [
          "Répondre immédiatement sur le fil pour démentir.",
          "Capturer les écrans, identifier la source et vérifier les faits.",
          "Supprimer tous les commentaires litigieux.",
          "Publier un démenti automatique généré par IA.",
        ],
        correctIdx: 1,
        rationale:
          "Documenter et vérifier avant toute réponse publique : c'est la base de la maîtrise de crise.",
      },
      {
        question: "Étape 2 — Vous confirmez que la rumeur est en partie fondée.",
        options: [
          "Nier en bloc pour protéger l'image.",
          "Reconnaître les faits exacts, rectifier les déformations, expliquer la décision.",
          "Bloquer les comptes des parents concernés.",
          "Demander à l'IA de rédiger une réponse virale.",
        ],
        correctIdx: 1,
        rationale:
          "La transparence factuelle nourrit la confiance ; la dissimulation alimente la rumeur.",
      },
      {
        question: "Étape 3 — Vous publiez la réponse.",
        options: [
          "Texte non relu, sans signature, sur tous les canaux.",
          "Texte validé par la direction, signé, publié sur le canal d'origine et relayé sur le site officiel.",
          "Réponse en privé uniquement, dans un seul groupe WhatsApp.",
          "Vidéo improvisée par téléphone sans préparation.",
        ],
        correctIdx: 1,
        rationale:
          "Validation hiérarchique + signature institutionnelle + canal pertinent + trace officielle.",
      },
    ],
    deliverable: "Compte-rendu de gestion de crise à archiver dans la mémoire institutionnelle.",
  },
  {
    id: "reflection",
    num: "7",
    title: "Engagement personnel",
    kind: "reflection",
    instructions: [
      "Avant de quitter la session, écrivez votre engagement personnel.",
    ],
    items: [
      { label: "Une conviction que je retiens" },
      { label: "Un risque que je veux surveiller" },
      { label: "Une pratique que je veux changer dans les 7 prochains jours" },
      { label: "Un canal que je vais professionnaliser dans les 30 prochains jours" },
      { label: "Une personne avec qui je vais partager cette formation" },
    ],
    deliverable: "Un engagement à partager au sein de votre équipe de communication.",
  },
  {
    id: "cas-canal",
    num: "8",
    title: "Cas pratique — Choisir le bon canal",
    kind: "qcm",
    recommendation: "5 situations concrètes, auto-corrigées.",
    instructions: [
      "Pour chaque situation, choisissez le canal (ou la combinaison de canaux) le plus adapté, puis cliquez sur Vérifier pour obtenir votre score et les justifications.",
    ],
    qcm: [
      {
        question:
          "Situation 1 — Une réunion urgente avec les parents est prévue demain matin.",
        options: [
          "Site web uniquement",
          "WhatsApp + note officielle",
          "Vidéo YouTube",
          "Article long",
        ],
        correctIdx: 1,
        rationale:
          "L'urgence nécessite un canal direct. La note officielle garantit la traçabilité.",
      },
      {
        question:
          "Situation 2 — Un établissement veut valoriser ses excellents résultats aux examens.",
        options: [
          "Facebook + site web + affiche numérique",
          "Message vocal informel uniquement",
          "Groupe privé des enseignants uniquement",
          "Ne rien publier",
        ],
        correctIdx: 0,
        rationale:
          "Les résultats relèvent de l'image institutionnelle. Ils doivent être visibles, bien présentés et archivés.",
      },
      {
        question:
          "Situation 3 — Le diocèse veut diffuser une méditation pour le temps de l'Avent.",
        options: [
          "WhatsApp, Facebook, courte vidéo ou visuel méditatif",
          "Communiqué administratif seulement",
          "Tableau Excel",
          "Message anonyme",
        ],
        correctIdx: 0,
        rationale:
          "Un message pastoral doit être accessible, chaleureux, partageable et visuellement soigné.",
      },
      {
        question:
          "Situation 4 — Une fausse information circule sur un établissement.",
        options: [
          "Réponse émotionnelle immédiate sur Facebook",
          "Silence total quelle que soit la gravité",
          "Vérification, concertation, message officiel si nécessaire",
          "Publication d'accusations contre les auteurs",
        ],
        correctIdx: 2,
        rationale:
          "En période de crise, la parole doit être officielle, mesurée et validée.",
      },
      {
        question:
          "Situation 5 — Une école veut présenter son projet éducatif aux nouveaux parents.",
        options: [
          "Site web + brochure PDF + vidéo courte de présentation",
          "Simple message WhatsApp de trois lignes",
          "TikTok humoristique seulement",
          "Affiche sans explication",
        ],
        correctIdx: 0,
        rationale:
          "Le projet éducatif est un contenu de fond. Il demande un support stable, structuré et valorisant.",
      },
    ],
    deliverable:
      "Une règle personnelle : à chaque message, se demander « quel public, quel canal, quelle preuve ? ».",
  },
  {
    id: "defi-ia-correction",
    num: "9",
    title: "Défi IA — Corriger un message avant publication",
    kind: "ai-correction",
    recommendation: "Analyse critique d'un texte généré par IA.",
    instructions: [
      "Voici un message généré par une IA. Identifiez d'abord ses problèmes, puis proposez votre propre version corrigée. Comparez ensuite avec la correction modèle.",
    ],
    aiChallenge: {
      rawMessage:
        "Notre école est la meilleure de toute la région. Aucun autre établissement n'offre une formation aussi excellente. Tous les parents sérieux doivent inscrire leurs enfants chez nous. Nous garantissons la réussite totale de tous les élèves. Les inscriptions sont ouvertes. Venez vite avant qu'il ne soit trop tard.",
      problems: [
        "Ton trop commercial et excessif.",
        "Affirmations non vérifiées : « la meilleure de toute la région ».",
        "Comparaison dévalorisante avec les autres établissements.",
        "Promesse irréaliste : « réussite totale de tous les élèves ».",
        "Pression maladroite sur les parents.",
        "Absence de dimension éducative et pastorale.",
        "Manque de sobriété institutionnelle.",
      ],
      correctedMessage:
        "Les inscriptions sont ouvertes dans notre établissement catholique.\n\nNous accueillons les familles désireuses d'offrir à leurs enfants un cadre éducatif fondé sur l'exigence, l'accompagnement, la discipline, les valeurs humaines et l'ouverture spirituelle.\n\nNotre équipe éducative reste disponible pour présenter le projet d'établissement, les conditions d'inscription et les dispositifs d'accompagnement des élèves.\n\nParents, élèves et partenaires sont cordialement invités à nous contacter ou à visiter l'établissement aux horaires indiqués.",
      whyBetter: [
        "Elle est professionnelle.",
        "Elle ne dénigre personne.",
        "Elle ne promet pas l'impossible.",
        "Elle valorise l'identité catholique.",
        "Elle respecte les familles.",
        "Elle invite sans manipuler.",
        "Elle reste crédible.",
      ],
    },
    deliverable:
      "Un réflexe : relire tout texte généré par IA avec la grille RAPIDE avant publication.",
  },
];

export const COMMUNICATION_PASTORALE: CommSeminaire = {
  meta: {
    slug: "communication-pastorale",
    title: "Le numérique au service de la communication éducative et pastorale",
    subtitle: "Construire une présence cohérente, moderne et engageante",
    reference:
      "Séminaire des communicateurs de l'Éducation Catholique de Côte d'Ivoire (SENEC)",
    referenceDate: "24 juin 2026",
    audience:
      "Communicateurs diocésains, responsables de la communication des établissements catholiques, chefs d'établissement, cadres pastoraux, équipes web et réseaux sociaux des écoles catholiques.",
    organiser: "SENEC — Secrétariat National de l'Enseignement Catholique",
    format: "Présentation contextuelle + atelier interactif + autoévaluation + plan d'action",
    duration: "2 heures (présentation 20 minutes + ateliers 100 minutes)",
    presentationDuration: "20 minutes",
    level: "Initiation professionnelle approfondie",
    completion:
      "Participation aux activités + diagnostic + plan d'action + auto-évaluation + engagement personnel",
    presentation: [
      "Cette formation propose aux communicateurs de l'Éducation Catholique un cadre clair pour passer d'une communication réactive à une communication stratégique, professionnelle, éthique et pastorale.",
      "Elle traite trois passages essentiels : de la visibilité à la communion, du message à la présence, du numérique à la mission. Elle articule repères doctrinaux, méthodes opérationnelles, outils numériques et règles d'usage responsable de l'intelligence artificielle.",
      "L'espace de formation, conçu comme un livre numérique à feuilleter (style ePub), combine : la présentation contextuelle (14 diapositives), des activités interactives (diagnostic, quiz, matrice, check-list, scénario de crise, engagement personnel), un plan d'action prêt à adapter, et un livret académique imprimable.",
    ],
  },
  heroImage: "/seminaires/communication-pastorale/header.png",
  pptxAsset: "/seminaires/communication-pastorale/support.pptx",
  slides: SLIDES,
  objectives: [
    "Identifier les enjeux du numérique pour la communication éducative et pastorale.",
    "Distinguer présence, message et performance dans la durée.",
    "Construire un écosystème numérique cohérent autour d'un diocèse ou d'un établissement.",
    "Adopter une posture éthique et pastorale dans les choix de communication.",
    "Adapter les formats aux publics selon la triple question : qui ? quel effet ? quelle preuve ?",
    "Anticiper et gérer les risques numériques (données, rumeurs, image, IA).",
    "Utiliser l'IA comme assistant responsable, jamais comme autorité.",
    "Rédiger un plan d'action concret à mener dans les 30 prochains jours.",
  ],
  competences: [
    "Diagnostiquer la maturité numérique de son institution.",
    "Concevoir une charte éditoriale et un calendrier de publication.",
    "Identifier le bon canal pour chaque message et chaque public.",
    "Appliquer la méthode RAPIDE à toute publication.",
    "Mobiliser la règle des 4V avant toute publication assistée par IA.",
    "Gérer une rumeur ou une crise numérique avec sang-froid et professionnalisme.",
    "Animer une équipe de communication catholique en cohérence avec la mission éducative et pastorale.",
  ],
  activities: ACTIVITIES,
  actionPlanTemplate: {
    intro:
      "Le plan d'action suit la formule structurante : un message, un public, un objectif, un canal, un indicateur.",
    columns: ["Message", "Public", "Objectif", "Canal", "Indicateur"],
    examples: [
      {
        values: [
          "Lancement de la rentrée 2026-2027",
          "Parents",
          "Rassurer + Informer",
          "WhatsApp officiel + Newsletter",
          "Taux d'ouverture > 60 %",
        ],
      },
      {
        values: [
          "Portrait d'une réussite d'élève",
          "Communauté",
          "Témoigner + Rayonner",
          "Facebook + Site web",
          "Partages > 50",
        ],
      },
      {
        values: [
          "Rappel des règles de vie scolaire",
          "Élèves + Personnel",
          "Coordonner + Responsabiliser",
          "Affichage + WhatsApp interne",
          "Diminution des écarts constatés",
        ],
      },
    ],
  },
  rapide: [
    { letter: "R", label: "Réel — le fait est-il vrai et vérifié ?" },
    { letter: "A", label: "Accessible — le message est-il clair pour le public visé ?" },
    { letter: "P", label: "Positif — le ton porte-t-il une espérance ?" },
    { letter: "I", label: "Identifiable — l'institution est-elle reconnaissable ?" },
    { letter: "D", label: "Documenté — preuve, source ou pièce jointe sont-elles fournies ?" },
    { letter: "E", label: "Éthique — la mission, les personnes et la vie privée sont-elles respectées ?" },
  ],
  fourV: [
    {
      letter: "V",
      label: "Véracité",
      detail: "Les faits cités sont-ils vérifiés et sourcés ?",
    },
    {
      letter: "V",
      label: "Valeurs",
      detail: "Le contenu reflète-t-il la mission éducative et pastorale ?",
    },
    {
      letter: "V",
      label: "Vie privée",
      detail: "Les personnes sont-elles protégées (autorisations, anonymisation) ?",
    },
    {
      letter: "V",
      label: "Validation",
      detail: "Un responsable institutionnel a-t-il signé la publication ?",
    },
  ],
  glossary: [
    {
      term: "Présence numérique",
      definition:
        "Manière durable d'habiter les canaux numériques en cohérence avec la mission institutionnelle.",
    },
    {
      term: "Charte éditoriale",
      definition:
        "Document interne qui fixe le ton, les sujets autorisés, les règles d'écriture, et les principes éthiques de publication.",
    },
    {
      term: "Calendrier éditorial",
      definition:
        "Plan de publication aligné sur les temps forts scolaires et liturgiques.",
    },
    {
      term: "Méthode RAPIDE",
      definition:
        "Grille de relecture en 6 critères : Réel, Accessible, Positif, Identifiable, Documenté, Éthique.",
    },
    {
      term: "Règle des 4V",
      definition:
        "Quatre garde-fous avant toute publication assistée par IA : Véracité, Valeurs, Vie privée, Validation.",
    },
    {
      term: "Communication pastorale",
      definition:
        "Communication qui joint la justesse du message à la qualité de la relation, dans l'esprit de l'éducation catholique.",
    },
    {
      term: "Gestion de crise",
      definition:
        "Ensemble des procédures de prévention, réponse et archivage face à une rumeur, désinformation ou attaque numérique.",
    },
    {
      term: "Veille",
      definition:
        "Activité régulière de surveillance des mentions, commentaires et tendances numériques liées à l'institution.",
    },
    {
      term: "Écosystème numérique",
      definition:
        "Ensemble organisé des canaux d'une institution, chacun ayant une mission claire et complémentaire des autres.",
    },
    {
      term: "Témoignage",
      definition:
        "Récit incarné qui transforme une information en expérience compréhensible et partageable.",
    },
  ],
  references10: [
    { num: 1, text: "La cohérence prime sur la performance." },
    { num: 2, text: "Chaque canal a une mission claire." },
    { num: 3, text: "Avant de publier : pour qui, pour quel effet, avec quelle preuve ?" },
    { num: 4, text: "RAPIDE est notre grille systématique de relecture." },
    { num: 5, text: "L'IA propose ; l'institution discerne ; le responsable valide." },
    { num: 6, text: "Une publication non documentée est une rumeur en puissance." },
    { num: 7, text: "Les photos d'enfants exigent autorisation, et l'archivage est obligatoire." },
    { num: 8, text: "Un message juste et bien diffusé vaut mieux que dix messages improvisés." },
    { num: 9, text: "Une crise se prépare avant qu'elle n'éclate." },
    { num: 10, text: "Présence numérique missionnaire : clarté, cohérence, crédibilité, communion." },
  ],
  schedule: [
    { hours: "00 min — 20 min", activity: "Présentation contextuelle (14 diapositives)" },
    { hours: "20 min — 40 min", activity: "Diagnostic flash de maturité numérique" },
    { hours: "40 min — 70 min", activity: "Atelier : matrice des publics + écosystème numérique" },
    { hours: "70 min — 90 min", activity: "Atelier : check-list RAPIDE + scénario de gestion de crise" },
    { hours: "90 min — 110 min", activity: "Quiz d'autoévaluation + plan d'action" },
    { hours: "110 min — 120 min", activity: "Auto-évaluation finale, engagement personnel et clôture" },
  ],
  finalSelfEvaluation: {
    durationMin: 10,
    objective:
      "Vérifier les acquis et engager chaque participant à une action concrète.",
    levels: ["Pas encore", "En progrès", "Acquis"],
    reinforceLabel: "À renforcer chez les autres",
    competences: [
      "Je sais diagnostiquer la présence numérique de ma structure.",
      "Je sais définir une ligne éditoriale cohérente.",
      "Je sais choisir un canal selon le public et le message.",
      "Je sais rédiger un message numérique clair et responsable.",
      "Je sais protéger l'image des personnes et de l'institution.",
      "Je sais utiliser l'IA avec prudence et discernement.",
      "Je sais concevoir un plan d'action numérique pastoral.",
    ],
  },
  closingMessage:
    "La présence numérique de l'Éducation Catholique devient missionnaire lorsqu'elle unit compétence professionnelle, responsabilité éthique et sens du service.\n\nQue chaque communicateur reparte avec une boussole simple : clarté, cohérence, crédibilité, communion — et un plan d'action concret prêt à être engagé dès les 30 prochains jours.",
};
