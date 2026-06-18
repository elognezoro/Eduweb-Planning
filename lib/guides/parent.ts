import type { GuideContent } from "@/components/guides/guide-layout";

export const guideParent: Omit<GuideContent, "icon"> = {
  roleKey: "parent",
  roleLabel: "Parent d'élève",
  meta: {
    level: "Débutant",
    duration: "45 min",
    targetAudience: "Parents et tuteurs légaux d'élèves scolarisés dans un établissement utilisant EduWeb Planner, souhaitant suivre la scolarité de leur enfant au quotidien.",
    context: "À utiliser dès la réception des identifiants familiaux, puis comme support de référence tout au long de l'année scolaire pour suivre la vie scolaire et communiquer avec l'établissement.",
  },
  objectives: [
    "Savoir se connecter à l'espace parent et naviguer entre les modules autorisés",
    "Être capable de consulter l'emploi du temps hebdomadaire de son enfant",
    "Suivre en temps réel les présences, absences et retards depuis le registre d'appel",
    "Comprendre comment lire le cahier de texte pour accompagner les devoirs",
    "Savoir consulter les notes, bulletins trimestriels et le livret scolaire annuel",
    "Être capable d'échanger des messages avec l'établissement et de planifier un rendez-vous",
    "Identifier les services premium accessibles via la souscription Académie Premium",
  ],
  prerequisites: [
    "Disposer d'identifiants parent fournis par l'établissement (e-mail et mot de passe)",
    "Avoir un enfant inscrit dans l'établissement et rattaché à votre compte famille",
    "Disposer d'une connexion internet et d'un navigateur récent (ordinateur, tablette ou smartphone)",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Prise en main de l'espace Parent d'élève",
      intro: "Avant toute consultation, il convient de comprendre la structure de votre espace et la nature des informations accessibles. L'espace parent d'EduWeb Planner est strictement réservé à la consultation : vous suivez la scolarité de votre enfant sans pouvoir modifier les données pédagogiques.",
      sections: [
        {
          title: "Se connecter et accéder à l'accueil",
          body: "La connexion s'effectue sur la page d'accueil publique d'EduWeb Planner. Une fois authentifié, vous êtes automatiquement redirigé vers le tableau de bord adapté à votre rôle de parent. Ce tableau regroupe les alertes récentes (absences, messages, notes publiées) et les raccourcis vers les modules autorisés.",
          steps: [
            {
              instruction: "Ouvrez le navigateur et saisissez l'adresse fournie par l'établissement.",
              navigation: "Page de connexion",
            },
            {
              instruction: "Cliquez sur le bouton Connexion en haut à droite et saisissez votre e-mail et votre mot de passe.",
              tip: "Cochez la case Rester connecté uniquement sur un appareil personnel.",
            },
            {
              instruction: "À la première connexion, vérifiez la langue et le pays affichés ; modifiez-les si nécessaire dans le sélecteur situé en pied de page.",
            },
          ],
          bestPractices: [
            "Changez votre mot de passe initial dès la première connexion.",
            "Ne communiquez jamais vos identifiants, même à un autre membre de la famille : demandez un compte distinct.",
          ],
        },
        {
          title: "Comprendre la navigation",
          body: "Le menu latéral présente deux groupes accessibles : Accueil et Vie scolaire. Le groupe Accueil regroupe la communication et les rendez-vous ; le groupe Vie scolaire concentre le suivi pédagogique (emploi du temps, registre d'appel, cahier de texte, notes, livret). Une zone Académie Premium peut apparaître si votre famille a souscrit.",
          bestPractices: [
            "Repérez le sélecteur d'enfant en haut de page si vous avez plusieurs enfants scolarisés : chaque module s'applique à l'enfant sélectionné.",
          ],
          caveat: "Les rubriques non visibles ne vous sont pas accessibles : ne tentez pas de forcer une URL, l'accès reste contrôlé par le RBAC de la plateforme.",
        },
      ],
    },
    {
      id: "emploi-du-temps",
      title: "2. Consulter l'emploi du temps",
      intro: "L'emploi du temps est la première ressource d'organisation familiale. Il vous permet d'anticiper les journées de votre enfant, les éventuels déplacements et la charge hebdomadaire.",
      sections: [
        {
          title: "Lire l'emploi du temps hebdomadaire",
          body: "L'affichage par défaut présente la semaine en cours, avec les créneaux horaires, les matières, les salles et les enseignants. Les couleurs permettent de distinguer les disciplines. Un clic sur une séance affiche le détail (matière, enseignant, salle).",
          steps: [
            {
              instruction: "Ouvrez le module Emplois du temps depuis le menu latéral.",
              navigation: "Vie scolaire → Emplois du temps",
            },
            {
              instruction: "Utilisez les flèches Précédent / Suivant pour naviguer entre les semaines.",
            },
            {
              instruction: "Cliquez sur une séance pour afficher le détail (enseignant, salle, intitulé).",
            },
          ],
        },
        {
          title: "Anticiper les changements",
          body: "Les modifications ponctuelles (cours annulé, salle modifiée) sont signalées visuellement dans l'emploi du temps. Vérifiez l'affichage la veille au soir pour la journée du lendemain.",
          bestPractices: [
            "Prenez l'habitude de consulter l'emploi du temps chaque dimanche pour préparer la semaine.",
            "Croisez l'emploi du temps avec le cahier de texte pour identifier les devoirs à venir.",
          ],
        },
      ],
    },
    {
      id: "vie-scolaire",
      title: "3. Suivre la vie scolaire au quotidien",
      intro: "Le suivi quotidien repose sur deux modules complémentaires : le registre d'appel pour la présence physique, et le cahier de texte pour le contenu pédagogique et les devoirs.",
      sections: [
        {
          title: "Consulter le registre d'appel",
          body: "Le registre d'appel récapitule les présences, absences et retards saisis par les enseignants à chaque séance. En tant que parent, vous accédez en consultation uniquement aux données de votre enfant. Les motifs renseignés par l'établissement apparaissent en regard de chaque absence.",
          steps: [
            {
              instruction: "Ouvrez le module Registre d'appel.",
              navigation: "Vie scolaire → Registre d'appel",
            },
            {
              instruction: "Sélectionnez la période (jour, semaine, mois) à consulter.",
            },
            {
              instruction: "Examinez la légende : présent, absent, en retard, excusé.",
            },
            {
              instruction: "Pour justifier une absence, contactez l'établissement via le module Communication.",
              warning: "La justification ne se fait pas directement dans le registre : elle passe par la vie scolaire de l'établissement.",
            },
          ],
        },
        {
          title: "Lire le cahier de texte",
          body: "Le cahier de texte regroupe, pour chaque séance, le contenu abordé, les ressources mises à disposition et les devoirs à effectuer pour les séances suivantes. Il est le complément indispensable de l'emploi du temps pour accompagner votre enfant.",
          steps: [
            {
              instruction: "Ouvrez le module Cahier de texte.",
              navigation: "Vie scolaire → Cahier de texte",
            },
            {
              instruction: "Filtrez par matière ou par enseignant pour cibler une séance.",
            },
            {
              instruction: "Consultez les pièces jointes (énoncés, supports) et notez les échéances des devoirs.",
            },
          ],
          bestPractices: [
            "Vérifiez le cahier de texte le soir même : c'est le moment où les devoirs viennent d'être saisis.",
            "Encouragez votre enfant à le consulter en autonomie : votre rôle est d'accompagner, pas de se substituer.",
          ],
        },
      ],
    },
    {
      id: "notes-bulletins-livret",
      title: "4. Notes, bulletins et livret scolaire",
      intro: "L'évaluation des apprentissages s'apprécie à trois niveaux : les notes au fil de l'eau, le bulletin trimestriel qui les synthétise, et le livret scolaire qui retrace l'année complète.",
      sections: [
        {
          title: "Consulter les notes et bulletins",
          body: "Le module Notes et bulletins affiche chronologiquement les évaluations corrigées par les enseignants. À la fin de chaque période, le conseil de classe valide un bulletin officiel téléchargeable au format PDF, avec moyennes pondérées et appréciations.",
          steps: [
            {
              instruction: "Ouvrez le module Notes et bulletins.",
              navigation: "Vie scolaire → Notes et bulletins",
            },
            {
              instruction: "Sélectionnez le trimestre ou la période à consulter.",
            },
            {
              instruction: "Visualisez les notes par discipline ; cliquez sur une évaluation pour voir le détail (coefficient, type d'épreuve).",
            },
            {
              instruction: "Lorsque le bulletin est publié, cliquez sur Télécharger pour en obtenir une copie PDF officielle.",
            },
          ],
          caveat: "Tant que le conseil de classe n'a pas validé la période, le bulletin reste indisponible : seules les notes individuelles sont visibles.",
        },
        {
          title: "Lire le livret scolaire",
          body: "Le livret scolaire est le dossier annuel complet : identité de l'élève, résultats trimestriels, compétences développées, observations pédagogiques et éléments de discipline. Il est généralement publié en fin d'année et constitue une pièce importante pour les orientations futures.",
          steps: [
            {
              instruction: "Ouvrez le module Livret scolaire.",
              navigation: "Vie scolaire → Livret scolaire",
            },
            {
              instruction: "Sélectionnez l'année scolaire concernée.",
            },
            {
              instruction: "Parcourez les sections (résultats, compétences, observations) et téléchargez la version PDF si proposée.",
            },
          ],
          bestPractices: [
            "Conservez chaque livret scolaire annuel : il pourra être demandé lors de changements d'établissement ou de procédures d'orientation.",
          ],
        },
      ],
    },
    {
      id: "communication",
      title: "5. Communiquer avec l'établissement",
      intro: "La messagerie d'EduWeb Planner remplace les échanges informels par un canal traçable, qui garantit la bonne réception des messages côté établissement.",
      sections: [
        {
          title: "Recevoir et envoyer des messages",
          body: "Le module Communication présente votre boîte de réception et permet d'écrire à un enseignant, au secrétariat ou à la vie scolaire, dans le respect des destinataires autorisés par l'établissement.",
          steps: [
            {
              instruction: "Ouvrez le module Communication.",
              navigation: "Accueil → Communication",
            },
            {
              instruction: "Pour répondre à un message, ouvrez-le et utilisez le bouton Répondre.",
            },
            {
              instruction: "Pour rédiger un nouveau message, cliquez sur Nouveau message, choisissez un destinataire dans la liste proposée, saisissez l'objet et le contenu, puis envoyez.",
            },
          ],
          bestPractices: [
            "Soyez concis et factuel : un objet clair facilite la prise en charge par l'établissement.",
            "Respectez les horaires de travail des enseignants : un message envoyé tard sera traité le lendemain.",
          ],
          caveat: "Tous les échanges sont enregistrés et peuvent être consultés par la direction. Adoptez un ton respectueux et conforme au règlement intérieur.",
        },
        {
          title: "Gérer les notifications",
          body: "Les notifications par e-mail vous alertent en cas de nouveau message, d'absence saisie ou de publication d'un bulletin. Si vous ne recevez plus de notifications, vérifiez vos paramètres de compte et le dossier indésirables de votre messagerie.",
          bestPractices: [
            "Ajoutez l'adresse d'envoi d'EduWeb Planner à vos contacts de confiance.",
          ],
        },
      ],
    },
    {
      id: "rendez-vous",
      title: "6. Demander et planifier un rendez-vous",
      intro: "Le module Rendez-vous structure la prise de contact en face à face avec les enseignants ou la vie scolaire, en respectant les créneaux ouverts par chaque interlocuteur.",
      sections: [
        {
          title: "Solliciter un créneau",
          body: "Vous pouvez consulter les disponibilités proposées par les enseignants de votre enfant et formuler une demande motivée. L'établissement confirme, propose un autre créneau ou refuse en justifiant.",
          steps: [
            {
              instruction: "Ouvrez le module Rendez-vous.",
              navigation: "Accueil → Rendez-vous",
            },
            {
              instruction: "Sélectionnez le destinataire (enseignant, professeur principal, vie scolaire).",
            },
            {
              instruction: "Choisissez un créneau disponible dans le calendrier proposé.",
            },
            {
              instruction: "Renseignez brièvement l'objet de la rencontre, puis envoyez la demande.",
            },
            {
              instruction: "Attendez la confirmation : vous recevrez une notification et un récapitulatif dans votre messagerie.",
              tip: "Annulez ou reportez le plus tôt possible pour libérer le créneau.",
            },
          ],
          bestPractices: [
            "Précisez l'objet (orientation, comportement, difficulté en mathématiques…) : l'enseignant prépare mieux l'entretien.",
            "Si plusieurs enseignants sont concernés, demandez une réunion coordonnée plutôt que des rendez-vous séparés.",
          ],
        },
      ],
    },
    {
      id: "academie-premium",
      title: "7. Accéder à l'Académie Premium",
      intro: "L'Académie Premium est un service complémentaire optionnel. Son accès dépend d'une souscription explicite ; le suivi scolaire ordinaire reste pleinement gratuit.",
      sections: [
        {
          title: "Consulter et activer les ressources premium",
          body: "Si votre famille a souscrit à l'offre, une entrée Académie Premium apparaît dans le menu. Elle donne accès à des ressources pédagogiques complémentaires définies par l'établissement et le partenaire académique.",
          steps: [
            {
              instruction: "Ouvrez la section Académie Premium depuis le menu.",
              navigation: "Académie Premium",
            },
            {
              instruction: "Si l'accès n'est pas actif, consultez les conditions de souscription affichées.",
            },
            {
              instruction: "Une fois la souscription validée, parcourez les ressources mises à disposition.",
            },
          ],
          caveat: "Les ressources premium ne se substituent pas au suivi pédagogique de l'établissement : elles le complètent.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Je ne vois pas mon enfant dans mon espace : que faire ?",
      answer: "Contactez le secrétariat de l'établissement pour vérifier le rattachement parent-enfant dans la base administrative. Sans ce rattachement, les modules restent vides.",
    },
    {
      question: "Puis-je modifier une note ou justifier une absence directement ?",
      answer: "Non. Votre profil est strictement en consultation. Toute justification d'absence ou contestation de note passe par le module Communication ou par un rendez-vous avec la vie scolaire.",
    },
    {
      question: "Pourquoi le bulletin n'est-il pas encore disponible ?",
      answer: "Le bulletin n'est publié qu'après validation par le conseil de classe. Avant cette validation, seules les notes individuelles sont visibles.",
    },
    {
      question: "L'emploi du temps a changé du jour au lendemain : est-ce normal ?",
      answer: "Oui, les changements ponctuels (absence d'un enseignant, salle modifiée) sont saisis par la vie scolaire et se reflètent immédiatement. Vérifiez l'affichage la veille au soir.",
    },
    {
      question: "Je ne reçois plus les notifications par e-mail. Comment réactiver ?",
      answer: "Vérifiez votre dossier indésirables, ajoutez l'expéditeur EduWeb Planner à vos contacts, et confirmez vos préférences dans votre profil. Si le problème persiste, signalez-le à l'établissement.",
    },
    {
      question: "Mon enfant a deux parents séparés : peut-on avoir deux comptes ?",
      answer: "Oui. Demandez à l'établissement la création d'un second compte parent rattaché au même enfant. Chaque parent dispose ainsi de ses propres identifiants.",
    },
    {
      question: "Puis-je écrire directement à un enseignant à toute heure ?",
      answer: "Vous pouvez envoyer un message à tout moment, mais le traitement se fait sur les horaires de travail. Adoptez un ton courtois et précis pour faciliter la réponse.",
    },
    {
      question: "Comment annuler une demande de rendez-vous ?",
      answer: "Ouvrez le module Rendez-vous, sélectionnez la demande concernée et utilisez l'option d'annulation. Faites-le dès que possible pour libérer le créneau.",
    },
    {
      question: "L'Académie Premium est-elle obligatoire ?",
      answer: "Non. Il s'agit d'un service optionnel. L'ensemble du suivi scolaire officiel (notes, bulletins, livret, absences) reste accessible sans souscription.",
    },
    {
      question: "Puis-je consulter EduWeb Planner depuis mon téléphone ?",
      answer: "Oui. L'interface s'adapte automatiquement aux écrans mobiles. Utilisez votre navigateur habituel avec la même adresse que sur ordinateur.",
    },
  ],
  glossary: [
    {
      term: "Espace parent",
      definition: "Interface personnelle, en consultation seule, regroupant les modules autorisés pour suivre la scolarité d'un ou plusieurs enfants rattachés au compte.",
    },
    {
      term: "Rattachement parent-enfant",
      definition: "Lien administratif établi par l'établissement entre un compte parent et la fiche élève d'un enfant. Sans ce lien, aucune donnée n'apparaît.",
    },
    {
      term: "Sélecteur d'enfant",
      definition: "Menu déroulant permettant, lorsqu'une famille a plusieurs enfants scolarisés, de basculer entre les dossiers individuels.",
    },
    {
      term: "Justification d'absence",
      definition: "Démarche par laquelle le parent motive l'absence de son enfant auprès de l'établissement, réalisée via la communication ou en présentiel, jamais directement dans le registre.",
    },
    {
      term: "Conseil de classe",
      definition: "Réunion périodique des enseignants qui valide les résultats trimestriels et émet une appréciation globale figurant sur le bulletin.",
    },
    {
      term: "Période d'évaluation",
      definition: "Découpage de l'année scolaire (trimestre, semestre) servant de référence pour les bulletins et les moyennes.",
    },
    {
      term: "Créneau de rendez-vous",
      definition: "Plage horaire ouverte par un enseignant ou la vie scolaire, réservable par les familles selon les règles définies par l'établissement.",
    },
    {
      term: "Notification",
      definition: "Message d'alerte automatique (e-mail ou bandeau interne) signalant un événement : nouveau message, absence saisie, bulletin publié.",
    },
    {
      term: "Compte famille",
      definition: "Regroupement logique des comptes parentaux et de leurs enfants au sein d'EduWeb Planner, permettant l'application cohérente des droits.",
    },
    {
      term: "Académie Premium",
      definition: "Offre optionnelle de ressources pédagogiques complémentaires, accessible après souscription distincte du suivi scolaire standard.",
    },
  ],
};
