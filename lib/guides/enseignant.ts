import type { GuideContent } from "@/components/guides/guide-layout";

export const guideEnseignant: Omit<GuideContent, "icon"> = {
  roleKey: "enseignant",
  roleLabel: "Enseignant",
  meta: {
    level: "Débutant à Intermédiaire",
    duration: "60 min",
    targetAudience: "Enseignants du primaire et du secondaire utilisant EduWeb Planner pour la gestion pédagogique quotidienne : appels, notes, cahier de texte et communication avec les familles.",
    context: "Ce guide accompagne l'enseignant dans la prise en main des modules pédagogiques d'EduWeb Planner, depuis la consultation de son emploi du temps jusqu'à la génération des bulletins trimestriels.",
  },
  objectives: [
    "Comprendre l'organisation de l'espace enseignant et naviguer entre les modules autorisés",
    "Être capable de consulter et tenir à jour son profil et ses informations professionnelles",
    "Savoir effectuer l'appel quotidien et tracer les absences et retards des élèves",
    "Être capable de renseigner le cahier de texte (objectifs, contenu, devoirs)",
    "Savoir saisir les notes par classe et période, puis générer les bulletins associés",
    "Être capable de communiquer avec les élèves, les parents et de planifier des rendez-vous",
    "Comprendre comment lire les statistiques de sa classe pour ajuster sa pratique",
  ],
  prerequisites: [
    "Disposer d'un compte enseignant actif créé par l'administrateur de l'établissement",
    "Avoir reçu ses identifiants de connexion (e-mail professionnel et mot de passe initial)",
    "Connaître les classes et matières qui lui ont été affectées par la direction",
    "Disposer d'un navigateur récent (Chrome, Edge ou Firefox) et d'une connexion internet stable",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Prise en main de l'espace Enseignant",
      intro: "Avant d'utiliser les modules pédagogiques, l'enseignant doit identifier son espace de travail, comprendre la logique de navigation et maîtriser la connexion sécurisée à EduWeb Planner.",
      sections: [
        {
          title: "Se connecter à la plateforme",
          body: "L'accès à EduWeb Planner est nominatif. Chaque enseignant dispose d'un identifiant unique relié à son rôle, qui détermine les pages et les actions autorisées. La connexion s'effectue depuis la page Mon identification, accessible dès l'ouverture du site.",
          steps: [
            {
              instruction: "Saisir l'adresse de la plateforme communiquée par l'établissement dans la barre du navigateur.",
            },
            {
              instruction: "Cliquer sur le bouton Connexion situé en haut à droite de l'écran d'accueil.",
              navigation: "Accueil → Mon identification",
            },
            {
              instruction: "Renseigner l'adresse e-mail professionnelle et le mot de passe transmis par l'administrateur.",
            },
            {
              instruction: "Valider l'authentification ; vous êtes redirigé vers le tableau de bord enseignant.",
              tip: "Cochez \"Se souvenir de moi\" uniquement sur un poste personnel.",
            },
          ],
          bestPractices: [
            "Modifier le mot de passe initial dès la première connexion depuis Mon profil.",
            "Se déconnecter systématiquement en fin de journée, surtout sur un poste partagé en salle des professeurs.",
          ],
          caveat: "Trois tentatives infructueuses peuvent verrouiller temporairement le compte. En cas de blocage, contacter l'administrateur de l'établissement.",
        },
        {
          title: "Découvrir la navigation",
          body: "Le menu latéral regroupe vos modules en cinq grandes familles : Accueil, Système, Paramétrage, Vie scolaire et Statistiques. Seules les rubriques autorisées par votre rôle d'enseignant sont visibles ; les autres restent masquées par sécurité.",
          steps: [
            {
              instruction: "Ouvrir le menu principal depuis l'icône située à gauche de l'écran.",
            },
            {
              instruction: "Repérer le groupe Vie scolaire qui contient le registre d'appel, le cahier de texte, les notes et le livret.",
            },
            {
              instruction: "Identifier le groupe Statistiques pour consulter les indicateurs de vos classes.",
            },
          ],
        },
      ],
    },
    {
      id: "profil-identite",
      title: "2. Gérer son profil et ses informations",
      intro: "Un profil à jour facilite la communication avec la direction, les familles et les collègues. Cette section explique comment consulter et maintenir ses données personnelles.",
      sections: [
        {
          title: "Consulter son profil",
          body: "La page Mon profil regroupe vos informations administratives (état civil, matricule, matières enseignées), vos coordonnées et la liste des classes qui vous sont rattachées. Ces données sont saisies par l'administrateur mais certains champs restent modifiables par l'enseignant.",
          steps: [
            {
              instruction: "Cliquer sur votre nom en haut à droite de l'écran.",
              navigation: "Bandeau utilisateur → Mon profil",
            },
            {
              instruction: "Vérifier les informations affichées : identité, e-mail, téléphone, classes affectées.",
            },
            {
              instruction: "Utiliser le bouton Modifier pour ajuster les champs autorisés (photo, téléphone, mot de passe).",
            },
          ],
          bestPractices: [
            "Tenir à jour votre numéro de téléphone : il est utilisé pour les alertes urgentes de l'établissement.",
          ],
          caveat: "Les champs grisés (matricule, matières, statut) ne peuvent être modifiés que par l'administration. Toute correction doit faire l'objet d'une demande écrite.",
        },
        {
          title: "Sécuriser son compte",
          body: "La sécurité du compte protège les notes, les bulletins et les données personnelles des élèves. Un mot de passe robuste et renouvelé régulièrement est indispensable.",
          steps: [
            {
              instruction: "Ouvrir Mon profil puis l'onglet Sécurité.",
              navigation: "Mon profil → Sécurité",
            },
            {
              instruction: "Saisir le mot de passe actuel, puis le nouveau mot de passe (12 caractères minimum recommandés).",
            },
            {
              instruction: "Confirmer et valider.",
              warning: "Ne partagez jamais votre mot de passe avec un collègue ou un élève.",
            },
          ],
        },
      ],
    },
    {
      id: "emploi-du-temps",
      title: "3. Consulter l'emploi du temps",
      intro: "L'emploi du temps est la boussole de l'enseignant. Il indique vos créneaux, vos classes et les salles affectées, et permet aussi de visualiser le emploi du temps d'une classe entière.",
      sections: [
        {
          title: "Mon emploi du temps",
          body: "La page Emplois du temps affiche votre semaine type, avec les cours, les remplacements éventuels et les jours non travaillés. Les modifications décidées par la direction (déplacements de cours, annulations) y apparaissent en temps réel.",
          steps: [
            {
              instruction: "Ouvrir Vie scolaire puis Emplois du temps.",
              navigation: "Menu Vie scolaire → Emplois du temps",
            },
            {
              instruction: "Sélectionner la vue Semaine ou Jour selon le besoin.",
            },
            {
              instruction: "Cliquer sur un créneau pour afficher le détail : classe, matière, salle.",
            },
            {
              instruction: "Utiliser les flèches pour naviguer d'une semaine à l'autre.",
              tip: "Le bouton Aujourd'hui ramène toujours à la semaine en cours.",
            },
          ],
        },
        {
          title: "Visualiser l'emploi du temps d'une classe",
          body: "Pour préparer une intervention ou coordonner un devoir surveillé, il est utile de consulter l'emploi du temps complet d'une classe que vous enseignez.",
          steps: [
            {
              instruction: "Depuis Emplois du temps, basculer sur l'onglet Par classe.",
            },
            {
              instruction: "Sélectionner la classe concernée dans la liste déroulante.",
            },
            {
              instruction: "Examiner les créneaux libres et les créneaux occupés pour planifier une activité.",
            },
          ],
          bestPractices: [
            "Avant de proposer un devoir surveillé ou une sortie, vérifier que la classe n'a pas un autre engagement sur le créneau visé.",
          ],
        },
      ],
    },
    {
      id: "registre-appel",
      title: "4. Tenir le registre d'appel",
      intro: "L'appel quotidien est une obligation pédagogique et réglementaire. Le module Registre d'appel d'EduWeb Planner permet d'enregistrer présences, absences et retards et d'informer automatiquement les responsables légaux.",
      sections: [
        {
          title: "Effectuer l'appel d'un cours",
          body: "Au démarrage de chaque séance, l'enseignant ouvre le registre d'appel correspondant à son cours. La liste des élèves de la classe s'affiche selon l'ordre alphabétique ou l'ordre du plan de classe.",
          steps: [
            {
              instruction: "Ouvrir Vie scolaire puis Registre d'appel.",
              navigation: "Menu Vie scolaire → Registre d'appel",
            },
            {
              instruction: "Sélectionner la séance du jour dans la liste proposée.",
            },
            {
              instruction: "Pour chaque élève, cocher Présent, Absent ou Retard.",
            },
            {
              instruction: "Préciser, le cas échéant, la durée du retard ou un motif d'absence connu.",
            },
            {
              instruction: "Cliquer sur Enregistrer pour valider l'appel.",
              tip: "Un message de confirmation apparaît en bas de l'écran.",
            },
          ],
          caveat: "Une fois validé, l'appel est horodaté. Toute correction ultérieure laisse une trace dans le journal d'audit.",
        },
        {
          title: "Suivre et corriger les absences",
          body: "Le registre conserve l'historique des absences. L'enseignant peut consulter le cumul par élève, signaler un retour ou rectifier une saisie erronée.",
          steps: [
            {
              instruction: "Depuis Registre d'appel, ouvrir l'onglet Historique.",
            },
            {
              instruction: "Filtrer par classe, période ou élève.",
            },
            {
              instruction: "Cliquer sur une absence pour la consulter ou la modifier (motif, justificatif).",
            },
          ],
          bestPractices: [
            "Faire l'appel dans les dix premières minutes du cours pour garantir la fiabilité des alertes envoyées aux parents.",
          ],
        },
      ],
    },
    {
      id: "cahier-texte-notes",
      title: "5. Cahier de texte et évaluations",
      intro: "Le cahier de texte et le module de notes forment le socle pédagogique du travail de l'enseignant. Ils servent de mémoire des séances, de support pour les élèves absents et de base aux bulletins trimestriels.",
      sections: [
        {
          title: "Publier une séance dans le cahier de texte",
          body: "Chaque séance doit comporter au minimum un objectif pédagogique, le contenu abordé et, le cas échéant, les devoirs à effectuer pour la séance suivante. Le cahier de texte est consultable par les élèves, les parents et les inspecteurs.",
          example:
            "Après son cours du mardi en 4ᵉ C, Mme Brou publie la séance — Objectif : « Identifier les figures de style » ; Contenu : « La métaphore et la comparaison » ; Travail à faire : « Exercices p. 42, pour vendredi ». Les élèves absents et les parents y accèdent immédiatement.",
          steps: [
            {
              instruction: "Ouvrir Vie scolaire puis Cahier de texte.",
              navigation: "Menu Vie scolaire → Cahier de texte",
            },
            {
              instruction: "Sélectionner la classe et la séance concernée.",
            },
            {
              instruction: "Renseigner les champs Objectifs, Contenu et Ressources.",
            },
            {
              instruction: "Ajouter, si nécessaire, un travail à faire avec une date d'échéance.",
            },
            {
              instruction: "Cliquer sur Publier pour rendre la séance visible aux élèves et aux familles.",
            },
          ],
          bestPractices: [
            "Publier la séance au plus tard le jour même : c'est une preuve essentielle pour les élèves absents et les inspections.",
            "Joindre les supports (PDF, lien) lorsque cela aide à la révision.",
          ],
        },
        {
          title: "Saisir les notes par classe et période",
          body: "La saisie des notes s'effectue par évaluation, classe et période (trimestre, semestre). Le module calcule automatiquement les moyennes pondérées en fonction des coefficients définis par l'établissement.",
          example:
            "En 3ᵉ A, M. Kouassi saisit le devoir de mathématiques (coefficient 2) : Awa 15/20, Koffi 12/20, Mariam 17/20. Le module applique le coefficient et recalcule aussitôt la moyenne trimestrielle de chaque élève — sans aucun calcul manuel.",
          steps: [
            {
              instruction: "Ouvrir Vie scolaire puis Notes et bulletins.",
              navigation: "Menu Vie scolaire → Notes et bulletins",
            },
            {
              instruction: "Sélectionner la classe, la matière et la période.",
            },
            {
              instruction: "Créer une nouvelle évaluation : titre, type (devoir, interrogation, composition), coefficient, barème.",
            },
            {
              instruction: "Saisir les notes élève par élève ou par import si l'option est activée.",
            },
            {
              instruction: "Enregistrer en brouillon, puis Valider lorsque la saisie est complète.",
            },
          ],
          caveat: "Une note validée est verrouillée. Toute modification ultérieure nécessite une justification consignée dans le journal.",
        },
        {
          title: "Générer les bulletins",
          body: "Une fois les notes d'une période validées, l'enseignant peut produire les bulletins individuels. Ceux-ci reprennent les moyennes, le rang, les appréciations et l'identité de l'établissement.",
          steps: [
            {
              instruction: "Depuis Notes et bulletins, ouvrir l'onglet Bulletins.",
            },
            {
              instruction: "Sélectionner la classe et la période concernée.",
            },
            {
              instruction: "Renseigner les appréciations par matière pour chaque élève.",
            },
            {
              instruction: "Cliquer sur Générer pour produire le PDF du bulletin.",
            },
            {
              instruction: "Vérifier le résultat avant validation finale par la direction.",
            },
          ],
          bestPractices: [
            "Rédiger des appréciations factuelles et bienveillantes, centrées sur les progrès et axes de travail.",
          ],
        },
      ],
    },
    {
      id: "livret-scolaire",
      title: "6. Consulter le livret scolaire",
      intro: "Le livret scolaire est le dossier annuel de l'élève. Il consolide les résultats trimestriels, les compétences développées et les observations pédagogiques.",
      sections: [
        {
          title: "Accéder au livret d'un élève",
          body: "L'enseignant peut consulter le livret des élèves des classes qu'il enseigne pour préparer un conseil de classe, un entretien avec les parents ou une remédiation individualisée.",
          steps: [
            {
              instruction: "Ouvrir Vie scolaire puis Livret scolaire.",
              navigation: "Menu Vie scolaire → Livret scolaire",
            },
            {
              instruction: "Sélectionner la classe puis l'élève concerné.",
            },
            {
              instruction: "Parcourir les onglets : Identité, Résultats, Compétences, Observations, Discipline.",
            },
          ],
          caveat: "Les données du livret sont strictement confidentielles. Elles ne doivent jamais être partagées en dehors du cadre scolaire.",
        },
        {
          title: "Préparer un conseil de classe",
          body: "Le livret croisé avec les statistiques de classe permet de préparer une intervention argumentée en conseil.",
          steps: [
            {
              instruction: "Imprimer ou exporter le livret en PDF depuis le bouton dédié.",
            },
            {
              instruction: "Rapprocher les résultats des observations du cahier de texte et du registre d'appel.",
            },
          ],
        },
      ],
    },
    {
      id: "communication-rdv",
      title: "7. Communication et rendez-vous",
      intro: "Le dialogue avec les élèves et les familles est un levier majeur de la réussite scolaire. EduWeb Planner met à disposition une messagerie interne et un module de prise de rendez-vous.",
      sections: [
        {
          title: "Envoyer un message",
          body: "La messagerie permet d'écrire à un élève, à un parent, à toute une classe ou à un collègue. Les échanges sont tracés et archivés.",
          steps: [
            {
              instruction: "Ouvrir le module Communication depuis le menu principal.",
              navigation: "Menu → Communication",
            },
            {
              instruction: "Cliquer sur Nouveau message.",
            },
            {
              instruction: "Choisir le ou les destinataires (élève, parent, classe entière).",
            },
            {
              instruction: "Rédiger l'objet et le corps du message, joindre un fichier si besoin.",
            },
            {
              instruction: "Cliquer sur Envoyer.",
              tip: "Privilégier un ton professionnel ; la messagerie peut être consultée par l'administration.",
            },
          ],
          bestPractices: [
            "Définir un délai raisonnable de réponse (24 à 48 h ouvrées) et le communiquer aux familles.",
          ],
        },
        {
          title: "Planifier un rendez-vous",
          body: "Le module Rendez-vous facilite l'organisation des entretiens individuels avec les parents ou les élèves, en proposant les créneaux disponibles dans votre emploi du temps.",
          steps: [
            {
              instruction: "Ouvrir le module Rendez-vous.",
              navigation: "Menu → Rendez-vous",
            },
            {
              instruction: "Cliquer sur Proposer un créneau.",
            },
            {
              instruction: "Définir la date, l'heure, la durée et l'objet du rendez-vous.",
            },
            {
              instruction: "Inviter le ou les participants concernés.",
            },
            {
              instruction: "Confirmer ; les participants reçoivent une notification.",
            },
          ],
          caveat: "En cas d'empêchement, annuler ou reporter le rendez-vous au plus tôt afin de respecter la disponibilité des familles.",
        },
      ],
    },
    {
      id: "statistiques",
      title: "8. Lire les statistiques de classe",
      intro: "Les statistiques aident l'enseignant à objectiver sa pratique : niveau global, assiduité, écarts de réussite. Elles préparent aussi les bilans présentés en conseil de classe.",
      sections: [
        {
          title: "Analyser les indicateurs de sa classe",
          body: "Le module statistique présente, pour chaque classe enseignée, la moyenne générale, la répartition des notes et le taux d'assiduité. Ces données sont actualisées dès qu'une note ou une absence est enregistrée.",
          steps: [
            {
              instruction: "Ouvrir Statistiques puis Par classe.",
              navigation: "Menu Statistiques → Par classe",
            },
            {
              instruction: "Sélectionner la classe et la période d'analyse.",
            },
            {
              instruction: "Consulter la moyenne, la médiane et la répartition des notes.",
            },
            {
              instruction: "Examiner le taux d'assiduité (présence, retards, absences justifiées).",
            },
          ],
          bestPractices: [
            "Utiliser les statistiques pour identifier les élèves en difficulté et proposer une remédiation ciblée plutôt que collective.",
          ],
          caveat: "Les indicateurs sont des aides à la décision, non des verdicts : croiser toujours les chiffres avec l'observation pédagogique.",
        },
      ],
    },
    {
      id: "centre-formation",
      title: "9. Centre de formation",
      intro: "Au-delà de ses classes, l'enseignant est aussi un apprenant et, parfois, un animateur. Le Centre de formation est la bibliothèque de formations d'EduWeb Planner : il réunit des séminaires interactifs, un manuel académique et les guides utilisateurs par rôle. Ce chapitre explique comment suivre un séminaire de bout en bout, puis comment intervenir lorsque le rôle d'Enseignant ou de Tuteur d'une formation vous est attribué.",
      sections: [
        {
          title: "Accéder au Centre de formation",
          body: "Le Centre de formation se trouve dans le menu Accueil, à la rubrique Aide. Il rassemble trois familles de ressources : les séminaires interactifs (présentés comme des livres numériques paginés), le manuel académique et les guides utilisateurs adaptés à chaque rôle. L'accès à une formation suppose une inscription préalable : certaines ressources comme le manuel ou les guides vous sont ouvertes automatiquement selon votre rôle, tandis que les séminaires requièrent une inscription faite par un administrateur ou un gestionnaire.",
          steps: [
            {
              instruction: "Ouvrir le menu Accueil puis cliquer sur Aide.",
              navigation: "Accueil → Aide",
            },
            {
              instruction: "Parcourir la bibliothèque : séminaires interactifs, manuel académique, guides par rôle.",
            },
            {
              instruction: "Ouvrir une ressource pour laquelle vous êtes inscrit ou habilité.",
              tip: "Si un séminaire reste verrouillé, c'est qu'aucune inscription n'a encore été enregistrée à votre nom : demandez-la à un administrateur ou à un gestionnaire.",
            },
          ],
          caveat: "L'accès à un séminaire est conditionné par une inscription nominative. Sans inscription, le contenu n'apparaît pas dans votre bibliothèque.",
        },
        {
          title: "Suivre un séminaire interactif (apprenant)",
          body: "Trois séminaires sont disponibles : « Magnifica Humanitas », « Le numérique au service de la communication éducative et pastorale » (SENEC) et « L'intelligence artificielle au service de la communication éducative et pastorale » (SENEC, 2 h 30). Chaque séminaire s'ouvre comme un livre numérique paginé que l'on parcourt au clavier : flèches ← et → pour tourner les pages, touche F pour le plein écran, et un sommaire pour naviguer directement vers une partie. Un séminaire combine des diapositives (visionneuse ePub, support PowerPoint téléchargeable, lecture audio des pages et des consignes) et des ateliers interactifs auto-corrigés.",
          steps: [
            {
              instruction: "Depuis Aide, ouvrir le séminaire dans lequel vous êtes inscrit.",
              navigation: "Accueil → Aide → Séminaires interactifs",
            },
            {
              instruction: "Commencer par le diagnostic de maturité : il situe votre niveau de départ et oriente votre parcours.",
            },
            {
              instruction: "Parcourir les diapositives page à page (flèches ← →, touche F pour le plein écran), en vous appuyant au besoin sur la lecture audio des pages et des consignes.",
              tip: "Le support PowerPoint et la visionneuse ePub permettent de réviser les diapositives hors connexion.",
            },
            {
              instruction: "Réaliser les ateliers auto-corrigés au fil des modules : QCM, matrice ou check-list, scénario, correction d'un message généré par IA.",
            },
            {
              instruction: "Terminer par l'auto-évaluation finale, qui produit un bilan de votre progression.",
            },
            {
              instruction: "Récupérer le livret académique imprimable (PDF via Ctrl+P) et, si besoin, l'export Word (.docx) du contenu.",
            },
            {
              instruction: "Une fois le parcours validé, obtenir le certificat de fin de séminaire.",
            },
          ],
          bestPractices: [
            "Faire le diagnostic de maturité avant les modules : il évite de survoler des notions à consolider et personnalise le parcours.",
            "Conserver le livret académique (PDF) et le certificat : ils attestent de votre formation continue.",
          ],
          caveat: "Le certificat n'est délivré qu'après réalisation des ateliers et de l'auto-évaluation finale. Un parcours interrompu reste enregistré et peut être repris plus tard.",
        },
        {
          title: "Animer une formation (rôle Enseignant ou Tuteur)",
          body: "Les rôles de formation sont propres aux espaces de formation et s'attribuent par inscription : un même utilisateur peut être étudiant sur un séminaire et enseignant sur un autre. Si l'on vous inscrit comme Enseignant d'une formation, vous l'animez : vous consultez et critiquez les productions des apprenants, publiez vos appréciations, validez la réussite et délivrez les certificats. Comme Tuteur, vous accompagnez : vous consultez et critiquez les productions et publiez vos retours, mais vous ne validez pas la réussite. La hiérarchie complète, par ordre décroissant, est : Admin, Gestionnaire, Enseignant, Tuteur, Étudiant.",
          steps: [
            {
              instruction: "Ouvrir la formation pour laquelle vous disposez du rôle Enseignant ou Tuteur depuis votre bibliothèque.",
              navigation: "Accueil → Aide → Séminaires interactifs",
            },
            {
              instruction: "Consulter les productions soumises par les apprenants (ateliers, scénarios, auto-évaluations).",
            },
            {
              instruction: "Rédiger vos critiques et publier vos appréciations sur chaque production.",
            },
            {
              instruction: "En tant qu'Enseignant, valider la réussite des apprenants ayant satisfait aux exigences, puis délivrer les certificats.",
              warning: "Le rôle Tuteur permet de critiquer et de conseiller, mais ne donne pas le droit de valider la réussite ni de délivrer les certificats.",
            },
          ],
          bestPractices: [
            "Formuler des appréciations précises et constructives, centrées sur ce qui est réussi et sur le prochain pas à franchir.",
            "Valider la réussite uniquement après avoir parcouru l'ensemble des productions de l'apprenant, et non sur la seule auto-évaluation.",
          ],
          caveat: "Vos rôles de formation sont indépendants de votre rôle d'enseignant dans l'établissement : ils s'attribuent formation par formation, à l'inscription, et n'élargissent pas vos droits sur les autres modules d'EduWeb Planner.",
        },
        {
          title: "Demander ou gérer une inscription",
          body: "L'accès à une formation passe par une inscription. Pour les apprenants, elle est posée par un administrateur ou un gestionnaire — de façon nominative, par cohorte, ou par import CSV d'adresses e-mail. Si vous êtes vous-même habilité, la gestion des inscriptions et des rôles de formation s'effectue dans Système → Inscriptions aux formations : on peut y inscrire des stagiaires comme étudiants et des collaborateurs comme enseignants ou tuteurs, la recherche d'un utilisateur fonctionnant par nom, e-mail ou rôle.",
          steps: [
            {
              instruction: "Si vous attendez un accès, signaler à un administrateur ou à un gestionnaire la formation visée afin qu'il vous inscrive.",
            },
            {
              instruction: "Si vous êtes habilité, ouvrir Système puis Inscriptions aux formations.",
              navigation: "Système → Inscriptions aux formations",
            },
            {
              instruction: "Rechercher l'utilisateur par nom, e-mail ou rôle, puis l'inscrire à la formation avec le rôle adéquat (étudiant, enseignant, tuteur).",
              tip: "Pour une promotion entière, privilégier l'inscription par cohorte ou l'import CSV d'adresses e-mail.",
            },
          ],
          bestPractices: [
            "Vérifier le rôle attribué avant de valider l'inscription : un apprenant inscrit par erreur comme enseignant pourrait valider des réussites.",
          ],
          caveat: "Système → Inscriptions aux formations est réservé aux profils habilités (administrateur, gestionnaire). En tant qu'enseignant non habilité, vous y accédez en consultation ou pas du tout, selon la configuration de l'établissement.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Que faire si j'ai oublié mon mot de passe ?",
      answer: "Cliquez sur \"Mot de passe oublié\" depuis la page Mon identification. Un lien de réinitialisation est envoyé sur votre adresse professionnelle. En cas d'absence d'e-mail, contactez l'administrateur de l'établissement.",
    },
    {
      question: "Puis-je modifier une note après validation ?",
      answer: "Oui, mais l'opération est tracée. Vous devez justifier la correction ; selon la configuration de l'établissement, une autorisation de la direction peut être requise.",
    },
    {
      question: "Comment corriger un appel saisi par erreur ?",
      answer: "Ouvrez l'historique du registre d'appel, sélectionnez la séance concernée, modifiez le statut de l'élève et enregistrez. La modification reste consignée dans le journal d'audit.",
    },
    {
      question: "Les parents voient-ils tout le cahier de texte ?",
      answer: "Oui, dès la publication d'une séance, les parents et les élèves de la classe y ont accès. C'est pourquoi il convient de soigner la formulation des objectifs et des devoirs.",
    },
    {
      question: "Comment savoir si un parent a bien reçu mon message ?",
      answer: "Le module Communication indique l'état de chaque envoi (envoyé, lu). Une absence de lecture n'empêche pas la réception, mais peut justifier une relance après quelques jours.",
    },
    {
      question: "Puis-je consulter le livret d'un élève qui n'est pas dans mes classes ?",
      answer: "Non. Votre rôle d'enseignant limite l'accès aux élèves des classes qui vous sont affectées. Cette restriction protège la confidentialité des données.",
    },
    {
      question: "Comment générer les bulletins d'une seule classe en une fois ?",
      answer: "Depuis l'onglet Bulletins, sélectionnez la classe et la période, vérifiez que toutes les notes sont validées, puis lancez la génération groupée. Un PDF par élève est produit.",
    },
    {
      question: "Que faire si un élève apparaît sur ma liste alors qu'il a quitté la classe ?",
      answer: "Signalez-le à l'administration de l'établissement, qui mettra à jour l'affectation. Ne supprimez jamais un élève vous-même.",
    },
    {
      question: "Le rendez-vous proposé à un parent est-il automatiquement confirmé ?",
      answer: "Non. Le parent doit confirmer son acceptation. Tant qu'il ne l'a pas fait, le créneau reste en attente dans votre emploi du temps.",
    },
    {
      question: "Puis-je accéder à EduWeb Planner depuis mon téléphone ?",
      answer: "Oui, la plateforme est responsive et s'adapte aux écrans mobiles. Pour la saisie de notes ou de bulletins, un poste fixe reste recommandé pour le confort.",
    },
    {
      question: "Comment m'inscrire à un séminaire interactif du Centre de formation ?",
      answer: "Vous ne vous inscrivez pas vous-même : l'inscription à un séminaire est faite par un administrateur ou un gestionnaire, de façon nominative, par cohorte ou par import CSV. Certaines ressources comme le manuel académique ou les guides vous sont toutefois ouvertes automatiquement selon votre rôle. Si un séminaire reste verrouillé dans Accueil → Aide, demandez votre inscription à un profil habilité.",
    },
    {
      question: "Je suis enseignant dans l'établissement : suis-je automatiquement enseignant des formations ?",
      answer: "Non. Les rôles de formation sont indépendants de votre rôle dans l'établissement et s'attribuent formation par formation, à l'inscription. Vous pouvez être étudiant sur un séminaire et enseignant sur un autre. Seul le rôle Enseignant d'une formation permet de valider la réussite et de délivrer les certificats ; le rôle Tuteur permet de critiquer et de conseiller sans valider.",
    },
  ],
  glossary: [
    {
      term: "Séance",
      definition: "Unité d'enseignement correspondant à un créneau de cours dans l'emploi du temps. Chaque séance peut être documentée dans le cahier de texte.",
    },
    {
      term: "Évaluation",
      definition: "Activité notée (devoir, interrogation, composition) caractérisée par un type, un coefficient et un barème, et rattachée à une période.",
    },
    {
      term: "Coefficient",
      definition: "Poids attribué à une évaluation ou à une matière dans le calcul de la moyenne de l'élève sur la période.",
    },
    {
      term: "Période",
      definition: "Découpage temporel de l'année scolaire (trimestre, semestre) servant de cadre à l'évaluation et à la production des bulletins.",
    },
    {
      term: "Appréciation",
      definition: "Commentaire qualitatif rédigé par l'enseignant sur le bulletin pour situer le travail et l'attitude de l'élève sur la période.",
    },
    {
      term: "Plan de classe",
      definition: "Ordre de présentation des élèves choisi par l'enseignant pour faciliter l'appel et la gestion de la séance.",
    },
    {
      term: "Justificatif d'absence",
      definition: "Pièce ou information attestant le motif d'une absence ou d'un retard, à enregistrer dans le registre d'appel.",
    },
    {
      term: "Brouillon",
      definition: "État intermédiaire d'une saisie (note, séance, bulletin) non encore validée ; modifiable librement avant publication.",
    },
    {
      term: "Validation",
      definition: "Action de figer une saisie. Une fois validée, la donnée devient officielle et toute modification est tracée.",
    },
    {
      term: "Conseil de classe",
      definition: "Réunion périodique des enseignants d'une classe, examinant les résultats et le comportement de chaque élève pour produire un avis collégial.",
    },
    {
      term: "Remédiation",
      definition: "Dispositif pédagogique ciblé proposé à un élève ou à un petit groupe afin de combler des lacunes identifiées.",
    },
    {
      term: "Taux d'assiduité",
      definition: "Indicateur statistique mesurant la régularité de présence des élèves sur une période donnée, exprimé en pourcentage.",
    },
    {
      term: "Séminaire interactif",
      definition: "Formation du Centre de formation présentée comme un livre numérique paginé (navigation au clavier ← → F, sommaire). Il combine diapositives (visionneuse ePub, support PowerPoint, lecture audio), ateliers auto-corrigés, livret académique imprimable, export Word et délivrance d'un certificat de fin.",
    },
    {
      term: "Rôle de formation",
      definition: "Rôle propre aux espaces de formation, attribué par inscription et indépendant du rôle dans l'établissement. Par ordre décroissant : Admin, Gestionnaire, Enseignant (anime et valide la réussite), Tuteur (accompagne sans valider) et Étudiant (apprenant qui réalise les activités).",
    },
  ],
};
