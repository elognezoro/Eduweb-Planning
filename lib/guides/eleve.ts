import type { GuideContent } from "@/components/guides/guide-layout";

export const guideEleve: Omit<GuideContent, "icon"> = {
  roleKey: "eleve",
  roleLabel: "Élève",
  meta: {
    level: "Débutant",
    duration: "45 min",
    targetAudience: "Élèves du primaire (cycle supérieur) et du secondaire utilisant EduWeb Planner pour suivre leur scolarité au quotidien.",
    context: "À utiliser dès la remise des identifiants par l'établissement, en début d'année scolaire ou lors de l'intégration d'un nouvel élève. Il sert aussi de référence tout au long de l'année pour retrouver les bons réflexes (consultation des notes, demande de rendez-vous, lecture du cahier de texte).",
  },
  objectives: [
    "Comprendre le rôle de l'élève dans EduWeb Planner et le périmètre de consultation associé.",
    "Savoir se connecter à son espace personnel et naviguer entre les groupes Accueil et Vie scolaire.",
    "Être capable de consulter son emploi du temps personnel et d'anticiper les changements de séance.",
    "Savoir suivre ses présences, absences et retards et identifier les justificatifs attendus.",
    "Être capable de lire le cahier de texte pour préparer ses cours et réaliser ses devoirs à temps.",
    "Comprendre la lecture d'un bulletin de notes et d'un livret scolaire.",
    "Savoir communiquer avec l'établissement et solliciter un rendez-vous (enseignant, conseiller d'orientation).",
    "Identifier les ressources accessibles via l'Académie Premium en cas de souscription familiale.",
  ],
  prerequisites: [
    "Disposer d'identifiants EduWeb Planner remis par l'établissement (compte élève actif).",
    "Avoir un appareil connecté à Internet (ordinateur, tablette ou smartphone) avec un navigateur récent.",
    "Connaître sa classe et l'année scolaire en cours.",
    "Avoir l'accord d'un responsable légal pour les actions liées à l'Académie Premium.",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Prise en main de l'espace Élève",
      intro: "Avant toute consultation, il est essentiel de comprendre la nature de votre compte et la manière dont l'application vous présente l'information. Ce chapitre pose les bases de votre autonomie sur la plateforme.",
      sections: [
        {
          title: "1.1 Comprendre votre rôle et vos droits",
          body: "Le rôle Élève est un rôle de consultation. Vous ne créez ni notes, ni absences, ni contenus pédagogiques : vous accédez en lecture aux informations produites par vos enseignants et par l'administration de votre établissement. Cette distinction est importante car elle conditionne ce que vous pouvez modifier (essentiellement vos demandes de rendez-vous et vos réponses aux messages) et ce qui reste figé (notes, présences, cahier de texte).\n\nVotre périmètre couvre uniquement votre propre parcours scolaire : vos cours, vos notes, vos absences, vos bulletins. Vous ne voyez pas les données des autres élèves, y compris ceux de votre classe.",
        },
        {
          title: "1.2 Se connecter et reconnaître l'interface",
          body: "L'accès se fait depuis l'adresse fournie par votre établissement. La page d'accueil publique affiche un bouton Connexion en haut à droite. Après authentification, votre tableau de bord élève s'ouvre sur l'Accueil, et un menu latéral organise les pages auxquelles vous avez droit.",
          steps: [
            {
              instruction: "Ouvrez l'adresse EduWeb Planner communiquée par votre établissement dans votre navigateur.",
            },
            {
              instruction: "Cliquez sur le bouton Connexion en haut à droite de la page.",
            },
            {
              instruction: "Saisissez votre identifiant et votre mot de passe, puis validez.",
              tip: "Si c'est votre première connexion, l'application peut vous demander de personnaliser votre mot de passe : choisissez-en un long et facile à retenir.",
            },
            {
              instruction: "Vérifiez en haut de l'écran que votre nom, votre classe et votre établissement s'affichent correctement.",
              warning: "Si la classe ou l'établissement est incorrect, signalez-le immédiatement au secrétariat : un mauvais rattachement vous empêcherait de voir vos vraies données.",
            },
          ],
          bestPractices: [
            "Conservez vos identifiants dans un endroit sûr et ne les partagez avec personne, pas même un camarade.",
            "Déconnectez-vous systématiquement après chaque session sur un appareil partagé.",
          ],
        },
      ],
    },
    {
      id: "accueil-navigation",
      title: "2. Accueil et navigation quotidienne",
      intro: "L'Accueil est conçu comme un point d'entrée synthétique : il regroupe en un coup d'œil les informations utiles de la journée. Comprendre comment il s'articule avec le groupe Vie scolaire vous fera gagner du temps chaque jour.",
      sections: [
        {
          title: "2.1 Lire votre tableau de bord d'Accueil",
          body: "Le tableau de bord élève met en avant les éléments du jour : prochaines séances, devoirs récents inscrits au cahier de texte, derniers messages reçus et alertes éventuelles (rendez-vous confirmé, nouvelle note publiée). Cette synthèse n'est pas exhaustive : elle vous oriente vers les pages dédiées pour le détail.",
        },
        {
          title: "2.2 Utiliser le menu latéral",
          body: "Les pages auxquelles vous avez droit sont regroupées en deux familles : Accueil et Vie scolaire. Le groupe Vie scolaire concentre l'essentiel de vos consultations : emploi du temps, registre d'appel, cahier de texte, communication, notes et bulletins, livret scolaire, rendez-vous.",
          steps: [
            {
              instruction: "Repérez le menu latéral à gauche de l'écran après connexion.",
            },
            {
              instruction: "Cliquez sur un groupe (par exemple Vie scolaire) pour le déplier.",
              navigation: "Menu latéral → Vie scolaire",
            },
            {
              instruction: "Sélectionnez la page souhaitée (Emploi du temps, Cahier de texte, etc.).",
            },
            {
              instruction: "Revenez à l'Accueil à tout moment en cliquant sur le logo ou l'item Accueil en haut du menu.",
            },
          ],
          bestPractices: [
            "Prenez l'habitude de commencer la journée par l'Accueil puis l'Emploi du temps : vous aurez les changements éventuels avant d'arriver en classe.",
          ],
        },
      ],
    },
    {
      id: "emploi-du-temps",
      title: "3. Consulter votre emploi du temps personnel",
      intro: "L'emploi du temps est l'outil que vous consulterez le plus souvent. Il est personnalisé : il reflète vos cours, vos options éventuelles et les modifications ponctuelles (absence d'enseignant, salle changée, séance reportée).",
      sections: [
        {
          title: "3.1 Lire la vue hebdomadaire",
          body: "L'emploi du temps s'affiche par défaut sur la semaine courante. Chaque créneau présente l'horaire, la matière, le nom de l'enseignant et la salle. Une couleur ou un libellé distinct peut signaler les modifications par rapport à la trame habituelle.",
          steps: [
            {
              instruction: "Ouvrez la page Emploi du temps.",
              navigation: "Vie scolaire → Emplois du temps",
            },
            {
              instruction: "Vérifiez la semaine affichée en haut du emploi du temps.",
            },
            {
              instruction: "Utilisez les flèches pour naviguer vers la semaine précédente ou suivante.",
            },
            {
              instruction: "Cliquez sur un créneau pour afficher le détail (intitulé complet, ressources éventuelles).",
              tip: "Si une salle a été modifiée, l'information apparaît directement sur le créneau concerné.",
            },
          ],
        },
        {
          title: "3.2 Anticiper les changements",
          body: "Un cours annulé ou déplacé est mis à jour automatiquement dès que l'établissement le valide. Prenez l'habitude de consulter votre emploi du temps la veille au soir et le matin avant de partir.",
          caveat: "L'application n'envoie pas systématiquement de notification pour chaque changement : la consultation reste de votre responsabilité.",
        },
      ],
    },
    {
      id: "vie-scolaire",
      title: "4. Suivre votre vie scolaire au quotidien",
      intro: "Présences, absences, retards et contenus de cours constituent le cœur de votre suivi. Ce chapitre vous explique comment lire ces informations et anticiper les justificatifs ou révisions attendus.",
      sections: [
        {
          title: "4.1 Consulter le registre d'appel vous concernant",
          body: "Le registre d'appel répertorie, séance par séance, votre statut : présent, absent, en retard. Vous y voyez aussi si une absence est marquée comme justifiée ou en attente de justificatif.",
          steps: [
            {
              instruction: "Ouvrez la page Registre d'appel.",
              navigation: "Vie scolaire → Registre d'appel",
            },
            {
              instruction: "Sélectionnez la période (semaine, mois) que vous souhaitez vérifier.",
            },
            {
              instruction: "Repérez les absences ou retards et vérifiez la mention « justifié » ou « non justifié ».",
            },
            {
              instruction: "Si une absence non justifiée vous semble incorrecte, signalez-la à la vie scolaire via la messagerie de l'application.",
              warning: "Vous ne pouvez pas modifier vous-même un statut d'absence : seul le personnel habilité peut le faire.",
            },
          ],
          bestPractices: [
            "Vérifiez votre registre une fois par semaine : un justificatif fourni à temps évite les relances.",
          ],
        },
        {
          title: "4.2 Lire le cahier de texte et préparer vos devoirs",
          body: "Le cahier de texte regroupe, pour chaque séance, les objectifs pédagogiques, le contenu abordé en classe, les ressources mises à disposition et les devoirs à faire. C'est votre référence pour rattraper un cours manqué ou préparer la séance suivante.",
          steps: [
            {
              instruction: "Ouvrez la page Cahier de texte.",
              navigation: "Vie scolaire → Cahier de texte",
            },
            {
              instruction: "Choisissez la matière ou la date que vous souhaitez consulter.",
            },
            {
              instruction: "Lisez le contenu de la séance, puis ouvrez les ressources jointes éventuelles (documents, liens).",
            },
            {
              instruction: "Notez les devoirs et leur échéance dans votre agenda personnel.",
            },
          ],
          caveat: "Le cahier de texte est officiel : un devoir y figurant doit être réalisé, même si l'enseignant ne l'a pas répété oralement.",
        },
      ],
    },
    {
      id: "notes-bulletins-livret",
      title: "5. Notes, bulletins et livret scolaire",
      intro: "Ces pages donnent la mesure de votre progression. Apprenez à les lire dans le bon ordre : d'abord les notes au fil de l'eau, puis le bulletin à la fin de chaque période, et enfin le livret scolaire qui synthétise votre année.",
      sections: [
        {
          title: "5.1 Consulter vos notes en cours de période",
          body: "Au fil du trimestre ou du semestre, vos notes apparaissent au fur et à mesure que les enseignants les publient. Chaque note est rattachée à une évaluation (devoir, interrogation, composition) et à un coefficient.",
          steps: [
            {
              instruction: "Ouvrez la page Notes et bulletins.",
              navigation: "Vie scolaire → Notes et bulletins",
            },
            {
              instruction: "Sélectionnez la période en cours.",
            },
            {
              instruction: "Parcourez vos notes par matière et identifiez les évaluations à venir.",
            },
            {
              instruction: "Si une note vous semble manquante ou erronée, attendez la fin de période avant toute réclamation : les enseignants finalisent les saisies jusqu'au conseil de classe.",
            },
          ],
        },
        {
          title: "5.2 Lire un bulletin de fin de période",
          body: "Le bulletin de notes est généré à la clôture de chaque période. Il présente vos moyennes pondérées, votre rang éventuel, les appréciations des enseignants et la décision du conseil de classe. C'est un document officiel : il peut être téléchargé au format PDF pour vos archives personnelles ou les démarches administratives.",
          steps: [
            {
              instruction: "Dans Notes et bulletins, sélectionnez la période clôturée.",
            },
            {
              instruction: "Cliquez sur le bouton de téléchargement du bulletin pour obtenir le PDF officiel.",
              tip: "Le bulletin reprend l'identité visuelle de votre établissement (logo, cachet) : utilisez ce PDF pour toute démarche externe.",
            },
          ],
        },
        {
          title: "5.3 Consulter le livret scolaire",
          body: "Le livret scolaire est le dossier annuel complet : identité, résultats trimestriels consolidés, compétences développées, observations pédagogiques et éléments de discipline. Il est précieux pour préparer une orientation ou justifier d'un parcours.",
          steps: [
            {
              instruction: "Ouvrez la page Livret scolaire.",
              navigation: "Vie scolaire → Livret scolaire",
            },
            {
              instruction: "Vérifiez que les informations d'identité et de classe sont correctes.",
            },
            {
              instruction: "Parcourez les sections trimestrielles et les observations.",
              warning: "Le livret est un document officiel. Toute erreur de fond (matière manquante, identité erronée) doit être signalée à l'administration de l'établissement.",
            },
          ],
        },
      ],
    },
    {
      id: "communication-rdv",
      title: "6. Communication et rendez-vous",
      intro: "EduWeb Planner remplace progressivement les carnets de correspondance papier. Vous y recevez les informations officielles et pouvez solliciter un échange avec un enseignant ou un conseiller d'orientation.",
      sections: [
        {
          title: "6.1 Recevoir et lire les messages de l'établissement",
          body: "La messagerie centralise les annonces de l'établissement, les messages d'enseignants et les notifications administratives. Les messages importants peuvent demander un accusé de lecture.",
          steps: [
            {
              instruction: "Ouvrez la page Communication.",
              navigation: "Vie scolaire → Communication",
            },
            {
              instruction: "Triez les messages par date ou par expéditeur.",
            },
            {
              instruction: "Ouvrez chaque message non lu et, si demandé, validez l'accusé de lecture.",
            },
            {
              instruction: "Répondez de manière courtoise si la conversation l'autorise.",
            },
          ],
          bestPractices: [
            "Consultez votre messagerie au moins une fois par jour en période scolaire.",
            "Utilisez un ton respectueux : vos messages sont conservés et peuvent être consultés par l'administration.",
          ],
        },
        {
          title: "6.2 Demander un rendez-vous",
          body: "La page Rendez-vous vous permet de solliciter un créneau avec un enseignant, un conseiller principal d'éducation ou un conseiller d'orientation, selon ce que l'établissement autorise. La demande est transmise au destinataire qui valide, propose un autre créneau ou décline.",
          steps: [
            {
              instruction: "Ouvrez la page Rendez-vous.",
              navigation: "Vie scolaire → Rendez-vous",
            },
            {
              instruction: "Cliquez sur l'action permettant de créer une nouvelle demande.",
            },
            {
              instruction: "Choisissez le destinataire (enseignant, conseiller) et le motif.",
            },
            {
              instruction: "Sélectionnez un créneau parmi ceux proposés et confirmez.",
            },
            {
              instruction: "Surveillez la messagerie : vous recevrez la confirmation ou une contre-proposition.",
            },
          ],
          caveat: "Une demande de rendez-vous n'est pas un rendez-vous confirmé tant que le destinataire ne l'a pas validée. Présentez-vous uniquement sur la base d'une confirmation explicite.",
        },
      ],
    },
    {
      id: "academie-premium",
      title: "7. Accéder à l'Académie Premium",
      intro: "L'Académie Premium regroupe des ressources pédagogiques complémentaires (soutien, entraînements, contenus enrichis). Son accès dépend d'une souscription portée par votre famille.",
      sections: [
        {
          title: "7.1 Vérifier votre accès",
          body: "Si votre famille a souscrit à l'offre, l'item Académie Premium apparaît dans votre menu et débloque les ressources associées. Sans souscription active, l'item peut être visible mais signalera l'absence d'abonnement.",
          steps: [
            {
              instruction: "Ouvrez la page Académie Premium.",
              navigation: "Menu latéral → Académie Premium",
            },
            {
              instruction: "Vérifiez le statut affiché en haut de la page (abonnement actif ou non).",
            },
            {
              instruction: "Si l'accès est actif, parcourez les ressources mises à disposition.",
              tip: "Les ressources peuvent inclure des fiches de révision, des entraînements ou des modules de soutien.",
            },
          ],
        },
        {
          title: "7.2 Bonnes pratiques d'utilisation",
          body: "L'Académie Premium est un complément, pas un substitut au cahier de texte ou aux cours. Utilisez-la pour renforcer un point précis ou réviser, en lien avec ce que vos enseignants demandent.",
          bestPractices: [
            "Planifiez 15 à 30 minutes de révision Premium en lien avec un devoir noté à venir.",
            "Signalez à vos parents toute difficulté d'accès : la gestion de l'abonnement passe par eux.",
          ],
          caveat: "La souscription, son renouvellement et le paiement sont gérés par votre responsable légal depuis son propre espace. En tant qu'élève, vous ne pouvez pas souscrire ni résilier seul.",
        },
      ],
    },
    {
      id: "centre-formation",
      title: "8. Centre de formation",
      intro: "Le Centre de formation est une bibliothèque de ressources accessible depuis l'Aide. Vous y trouvez des guides adaptés à votre rôle et, si votre établissement vous y inscrit, des formations à suivre en autonomie.",
      sections: [
        {
          title: "8.1 Accéder aux guides et aux ressources",
          body: "Depuis le menu Accueil, l'item Aide ouvre le Centre de formation. Il rassemble les guides utilisateurs par rôle (dont le vôtre), un manuel académique et des séminaires interactifs présentés sous forme de livre numérique paginé. Les guides et le manuel vous sont ouverts automatiquement selon votre rôle : aucune démarche n'est nécessaire pour les consulter.",
          steps: [
            {
              instruction: "Ouvrez le Centre de formation depuis le menu.",
              navigation: "Accueil → Aide",
            },
            {
              instruction: "Sélectionnez le guide Élève ou la ressource qui vous intéresse.",
            },
            {
              instruction: "Dans un séminaire en mode livre numérique, tournez les pages avec les flèches ← et →, et ouvrez le sommaire pour vous repérer.",
              tip: "La touche F bascule en lecture plein écran ; certaines pages proposent une lecture audio des contenus et des consignes.",
            },
          ],
          bestPractices: [
            "Gardez le guide Élève à portée de main : c'est la réponse la plus rapide à « comment fait-on déjà pour… ? ».",
          ],
        },
        {
          title: "8.2 Suivre une formation où vous êtes inscrit",
          body: "Votre établissement peut vous inscrire comme étudiant à une formation (par exemple un séminaire interactif). L'inscription est nécessaire pour accéder à ces espaces : elle est réalisée par un administrateur ou un gestionnaire, et c'est elle qui vous attribue le rôle de formation « étudiant ». En tant qu'apprenant, vous suivez les diapositives, réalisez les ateliers interactifs auto-corrigés (QCM, scénarios, auto-évaluation) et soumettez vos productions ; un enseignant ou un tuteur peut ensuite les consulter et publier ses retours. À la fin, un certificat peut vous être délivré.",
          steps: [
            {
              instruction: "Ouvrez le Centre de formation et repérez la formation à laquelle vous avez été inscrit.",
              navigation: "Accueil → Aide",
            },
            {
              instruction: "Parcourez les diapositives, puis réalisez chaque atelier interactif à votre rythme.",
            },
            {
              instruction: "Soumettez vos productions lorsque l'atelier le demande et consultez les retours de l'enseignant ou du tuteur.",
              tip: "Un livret académique imprimable (Ctrl+P) et un export Word peuvent accompagner certains séminaires pour réviser hors ligne.",
            },
          ],
          caveat: "Vous ne pouvez pas vous inscrire seul à une formation : si une ressource vous semble manquer, demandez à votre établissement de vous y inscrire.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Je ne vois plus mon emploi du temps depuis ce matin, est-ce normal ?",
      answer: "Vérifiez la semaine sélectionnée en haut du emploi du temps : vous pouvez être positionné sur une semaine vide (vacances, semaine hors année scolaire). Si la semaine est bien la bonne, déconnectez-vous, reconnectez-vous, puis signalez le problème via la messagerie si l'affichage reste vide.",
    },
    {
      question: "Une absence non justifiée apparaît alors que j'étais présent. Que faire ?",
      answer: "Vous ne pouvez pas modifier vous-même un statut. Envoyez un message à la vie scolaire depuis la page Communication en précisant la date, l'heure et la matière concernées. Le personnel habilité corrigera après vérification.",
    },
    {
      question: "Mes notes ne sont pas toutes publiées, est-ce inquiétant ?",
      answer: "Non. Les enseignants saisissent les notes au fil de leurs corrections et peuvent les rendre visibles jusqu'à la clôture de la période. Patientez jusqu'au conseil de classe avant toute réclamation.",
    },
    {
      question: "Puis-je télécharger mon bulletin pour une démarche administrative ?",
      answer: "Oui. Depuis la page Notes et bulletins, sélectionnez la période concernée et utilisez le bouton de téléchargement pour obtenir le PDF officiel, avec l'identité visuelle de l'établissement.",
    },
    {
      question: "Mon enseignant a-t-il accès à mes messages privés avec un autre enseignant ?",
      answer: "Les conversations sont rattachées à des destinataires précis, mais l'administration de l'établissement peut, pour des raisons de sécurité ou de modération, consulter les échanges. Restez toujours dans un cadre respectueux et scolaire.",
    },
    {
      question: "Comment annuler une demande de rendez-vous que je viens d'envoyer ?",
      answer: "Ouvrez la page Rendez-vous, retrouvez votre demande en statut « en attente » et utilisez l'option d'annulation. Si la demande est déjà confirmée, prévenez le destinataire par message avant d'annuler.",
    },
    {
      question: "Je n'arrive pas à accéder à l'Académie Premium alors que mes parents ont payé.",
      answer: "Demandez à votre responsable légal de vérifier le statut de l'abonnement et le reçu de paiement depuis son propre espace. Si l'abonnement est bien actif de son côté, déconnectez-vous puis reconnectez-vous pour rafraîchir vos droits.",
    },
    {
      question: "Puis-je consulter EduWeb Planner depuis mon téléphone ?",
      answer: "Oui, à condition d'utiliser un navigateur récent. L'interface s'adapte aux écrans mobiles. Évitez toutefois de saisir vos identifiants sur un appareil partagé ou public.",
    },
    {
      question: "Que faire si j'ai oublié mon mot de passe ?",
      answer: "Utilisez le lien de récupération sur la page de connexion si l'établissement l'a activé. Sinon, contactez le secrétariat ou le référent numérique de votre établissement pour une réinitialisation.",
    },
    {
      question: "Mes données scolaires sont-elles confidentielles ?",
      answer: "Oui. Seuls vous, vos responsables légaux et les personnels habilités de votre établissement (et de la supervision académique) accèdent à votre dossier, dans le respect du cadre réglementaire applicable.",
    },
    {
      question: "Où trouver les guides et les formations dans l'application ?",
      answer: "Tout est rassemblé dans le Centre de formation, accessible via Accueil → Aide. Vous y consultez librement le guide Élève et le manuel académique ; les séminaires interactifs, eux, nécessitent que votre établissement vous y inscrive.",
    },
    {
      question: "On m'a inscrit à un séminaire mais je ne sais pas comment commencer.",
      answer: "Ouvrez Accueil → Aide, sélectionnez la formation concernée, puis parcourez les diapositives page par page (flèches ← →) et réalisez les ateliers interactifs à votre rythme. Vos productions sont relues par un enseignant ou un tuteur, et un certificat peut clôturer la formation.",
    },
  ],
  glossary: [
    {
      term: "Espace élève",
      definition: "Interface personnelle d'EduWeb Planner regroupant les pages auxquelles l'élève a accès en lecture.",
    },
    {
      term: "Accusé de lecture",
      definition: "Confirmation qu'un message officiel a bien été lu par l'élève ; il sert de preuve auprès de l'établissement.",
    },
    {
      term: "Évaluation",
      definition: "Activité notée (devoir, interrogation, composition) associée à une matière, un coefficient et une date, et générant une note au bulletin.",
    },
    {
      term: "Période",
      definition: "Découpage de l'année scolaire (trimestre ou semestre) au terme duquel un bulletin est généré et un conseil de classe se tient.",
    },
    {
      term: "Conseil de classe",
      definition: "Réunion de fin de période qui statue sur les moyennes, appréciations et décisions individuelles ; ses conclusions apparaissent sur le bulletin.",
    },
    {
      term: "Justificatif",
      definition: "Document fourni par le responsable légal expliquant une absence ou un retard, à transmettre à la vie scolaire pour basculer le statut en « justifié ».",
    },
    {
      term: "Responsable légal",
      definition: "Personne (parent, tuteur) titulaire de l'autorité parentale, seule habilitée à gérer l'abonnement Premium et à fournir les justificatifs officiels.",
    },
    {
      term: "Académie Premium",
      definition: "Offre payante d'EduWeb Planner donnant accès à des ressources pédagogiques complémentaires (révisions, soutien).",
    },
    {
      term: "Rendez-vous scolaire",
      definition: "Créneau planifié avec un enseignant ou un conseiller pour échanger sur la scolarité ; il devient effectif uniquement après confirmation du destinataire.",
    },
    {
      term: "Statut de présence",
      definition: "Indication portée sur chaque séance (présent, absent, retard) et complétée éventuellement d'une mention de justification.",
    },
    {
      term: "Centre de formation",
      definition: "Bibliothèque de ressources accessible via Accueil → Aide, regroupant les guides utilisateurs par rôle, le manuel académique et les séminaires interactifs.",
    },
    {
      term: "Séminaire interactif",
      definition: "Formation présentée en mode livre numérique paginé, combinant diapositives, ateliers auto-corrigés et certificat de fin, à laquelle l'élève accède après inscription par son établissement.",
    },
    {
      term: "Rôle de formation",
      definition: "Rôle attribué par inscription dans un espace de formation (étudiant, tuteur, enseignant, gestionnaire, admin). L'élève y est le plus souvent inscrit comme étudiant, indépendamment de son rôle scolaire.",
    },
  ],
};
