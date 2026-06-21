import type { GuideContent } from "@/components/guides/guide-layout";

export const guideChefEtablissement: Omit<GuideContent, "icon"> = {
  roleKey: "chef_etablissement",
  roleLabel: "Chef d'établissement",
  meta: {
    context: "Guide destiné aux chefs d'établissement utilisant EduWeb Planner pour piloter leur école au quotidien : configuration, vie scolaire, évaluation, communication, statistiques et inspection.",
    duration: "60 min",
    level: "Intermédiaire",
    targetAudience: "Chefs d'établissement, directeurs et directrices d'écoles primaires et secondaires, ainsi que leurs adjoints en charge du pilotage opérationnel.",
  },
  objectives: [
    "Être capable de configurer les paramètres généraux et l'identité documentaire de l'établissement.",
    "Savoir créer, modifier et désactiver les comptes du personnel selon le principe du moindre privilège.",
    "Comprendre comment générer, publier et superviser les emplois du temps.",
    "Être capable de superviser le registre d'appel et de valider le cahier de texte.",
    "Savoir piloter la saisie des notes, générer les bulletins et tenir le livret scolaire.",
    "Être capable de rédiger un rapport d'établissement et des rapports d'activité conformes.",
    "Comprendre l'exploitation des statistiques pour analyser la performance pédagogique.",
    "Savoir souscrire aux services Premium et gérer les alertes SMS dans le respect des familles.",
  ],
  prerequisites: [
    "Disposer d'un compte Chef d'établissement actif fourni par votre DRENA ou administrateur.",
    "Avoir un poste connecté à Internet avec un navigateur récent.",
    "Disposer des données administratives de l'établissement (effectifs, calendrier, logo, cachet).",
    "Avoir reçu la liste nominative du personnel à intégrer dans la plateforme.",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Prise en main de l'espace Chef d'établissement",
      intro: "Avant toute action de pilotage, vous devez maîtriser votre environnement de travail et vérifier que votre profil est correctement renseigné. Ce chapitre vous accompagne dans vos premières connexions et la prise en main de l'interface.",
      sections: [
        {
          title: "Se connecter et sécuriser son accès",
          body: "Votre compte de Chef d'établissement vous donne accès à des données sensibles : élèves, enseignants, notes, présences. La sécurité de votre identification est donc une responsabilité de direction. Vous devez utiliser un mot de passe robuste, ne jamais le partager et vous déconnecter à chaque fin de session sur un poste partagé.",
          steps: [
            {
              instruction: "Ouvrir le navigateur et accéder à l'adresse fournie par votre DRENA.",
              navigation: "Page d'accueil publique",
            },
            {
              instruction: "Cliquer sur le bouton Connexion situé en haut à droite de l'écran.",
            },
            {
              instruction: "Saisir votre identifiant et votre mot de passe, puis valider.",
              tip: "En cas d'oubli, utilisez le lien Mot de passe oublié sous le formulaire.",
            },
            {
              instruction: "Une fois connecté, vérifier votre identité affichée dans le bandeau supérieur.",
              navigation: "Menu Système → Mon identification",
            },
          ],
          bestPractices: [
            "Changez votre mot de passe initial dès la première connexion.",
            "Verrouillez systématiquement votre poste lorsque vous quittez le bureau.",
          ],
        },
        {
          title: "Comprendre la vue d'ensemble",
          body: "La vue d'ensemble est votre tableau de bord de pilotage. Elle agrège les indicateurs essentiels de l'établissement : effectifs, taux de présence, notes saisies, alertes en cours. Elle constitue votre premier outil de prise de décision quotidienne.",
          steps: [
            {
              instruction: "Depuis la page d'accueil, cliquer sur Vue d'ensemble.",
              navigation: "Menu Accueil → Vue d'ensemble",
            },
            {
              instruction: "Identifier les blocs d'indicateurs principaux : effectifs, présences, activité pédagogique.",
            },
            {
              instruction: "Cliquer sur un indicateur pour accéder au module correspondant en détail.",
            },
          ],
        },
        {
          title: "Compléter son profil",
          body: "Un profil complet facilite la communication interne et l'identification auprès des autorités de tutelle. Renseignez vos coordonnées, votre fonction officielle et vos préférences de notification.",
          steps: [
            {
              instruction: "Ouvrir le menu Système puis Mon profil.",
              navigation: "Menu Système → Mon profil",
            },
            {
              instruction: "Mettre à jour les coordonnées professionnelles (téléphone, email).",
            },
            {
              instruction: "Enregistrer les modifications avec le bouton Enregistrer en bas de page.",
            },
          ],
        },
      ],
    },
    {
      id: "configuration-etablissement",
      title: "2. Configurer l'établissement",
      intro: "La configuration initiale conditionne la fiabilité de toutes les opérations ultérieures : emplois du temps, bulletins, statistiques. Elle doit être réalisée en début d'année scolaire et révisée à chaque rentrée.",
      sections: [
        {
          title: "Renseigner les paramètres généraux",
          body: "Les paramètres généraux décrivent l'identité administrative et pédagogique de l'établissement : effectifs cibles, régimes proposés (externat, demi-pension, internat), calendrier scolaire, périodes d'évaluation. Ces données alimentent les rapports officiels et les documents exportés.",
          steps: [
            {
              instruction: "Ouvrir Configuration depuis le menu Paramétrage.",
              navigation: "Menu Paramétrage → Configuration",
            },
            {
              instruction: "Compléter les blocs Identité, Effectifs, Régimes et Calendrier.",
            },
            {
              instruction: "Vérifier les périodes d'évaluation (trimestres ou semestres) selon le pays.",
            },
            {
              instruction: "Enregistrer chaque section avant de passer à la suivante.",
              warning: "Une modification du calendrier en cours d'année peut affecter les bulletins déjà générés.",
            },
          ],
          bestPractices: [
            "Validez la configuration avec votre fondateur ou conseil d'administration avant publication.",
            "Conservez une trace papier des paramètres officiels (effectifs déclarés à la DRENA).",
          ],
        },
        {
          title: "Définir l'identité de marque des documents",
          body: "Les bulletins, livrets et rapports exportent automatiquement le logo, le cachet et la signature numérisée de l'établissement. Cette identité visuelle est essentielle pour la valeur officielle des documents transmis aux familles et aux autorités.",
          steps: [
            {
              instruction: "Dans Configuration, ouvrir la section Identité et branding.",
            },
            {
              instruction: "Téléverser le logo, le cachet et la signature du chef d'établissement (format image).",
            },
            {
              instruction: "Vérifier le rendu sur un bulletin test depuis Notes & bulletins.",
            },
          ],
          caveat: "Tout document exporté avec un cachet erroné engage la responsabilité de la direction.",
        },
      ],
    },
    {
      id: "comptes-utilisateurs",
      title: "3. Gérer les comptes de l'établissement",
      intro: "Vous êtes responsable de la création, de la mise à jour et de la désactivation des comptes du personnel : enseignants, éducateurs, secrétariat. La rigueur dans cette gestion garantit la confidentialité des données et la traçabilité des actions.",
      sections: [
        {
          title: "Créer un compte utilisateur",
          body: "Chaque membre du personnel doit disposer d'un compte nominatif, avec un rôle adapté à sa fonction. L'usage d'un compte partagé est strictement à proscrire car il rend la traçabilité impossible.",
          steps: [
            {
              instruction: "Ouvrir le menu Système puis Comptes utilisateurs.",
              navigation: "Menu Système → Comptes utilisateurs",
            },
            {
              instruction: "Cliquer sur Nouveau compte en haut à droite de la liste.",
            },
            {
              instruction: "Renseigner identité, email professionnel, fonction et rôle attribué.",
            },
            {
              instruction: "Valider la création : un email d'activation est envoyé à l'utilisateur.",
              tip: "Communiquez à l'utilisateur la procédure de première connexion.",
            },
          ],
          bestPractices: [
            "N'attribuez que le rôle strictement nécessaire à la fonction (principe du moindre privilège).",
            "Tenez à jour un registre interne des comptes actifs.",
          ],
        },
        {
          title: "Modifier ou désactiver un compte",
          body: "À chaque départ d'un agent ou changement de fonction, vous devez intervenir immédiatement sur son compte pour préserver la sécurité de l'établissement. Une désactivation conserve l'historique des actions sans empêcher l'accès.",
          steps: [
            {
              instruction: "Rechercher le compte concerné dans la liste.",
            },
            {
              instruction: "Cliquer sur l'icône d'édition en bout de ligne.",
            },
            {
              instruction: "Modifier le rôle ou cliquer sur Désactiver le compte.",
              warning: "Ne supprimez jamais un compte ayant produit des notes ou des bulletins : utilisez la désactivation.",
            },
          ],
          caveat: "Conformément aux principes RGPD, conservez les comptes désactivés le temps légal puis archivez.",
        },
      ],
    },
    {
      id: "vie-scolaire",
      title: "4. Piloter la vie scolaire",
      intro: "La vie scolaire couvre l'organisation pédagogique quotidienne : emplois du temps, présences, cahier de texte. Votre rôle consiste à superviser, valider et garantir la régularité du suivi par les enseignants.",
      sections: [
        {
          title: "Générer et publier les emplois du temps",
          body: "Les emplois du temps structurent toute la vie de l'établissement. Vous les construisez par classe et par enseignant, puis vous les publiez pour les rendre visibles aux élèves, parents et personnel. Une bonne planification réduit les conflits de salle et les surcharges horaires.",
          steps: [
            {
              instruction: "Ouvrir Emplois du temps depuis le menu Vie scolaire.",
              navigation: "Menu Vie scolaire → Emplois du temps",
            },
            {
              instruction: "Sélectionner la classe ou l'enseignant à planifier.",
            },
            {
              instruction: "Glisser les créneaux disciplinaires sur la grille horaire.",
            },
            {
              instruction: "Vérifier l'absence de conflits, puis cliquer sur Publier.",
              tip: "Pré-visualisez l'emploi du temps côté enseignant avant publication.",
            },
          ],
          bestPractices: [
            "Construisez d'abord l'emploi du temps des matières à fort coefficient.",
            "Réservez un créneau hebdomadaire pour les conseils et réunions pédagogiques.",
          ],
        },
        {
          title: "Superviser le registre d'appel",
          body: "Le registre d'appel doit être renseigné quotidiennement par les enseignants. Votre supervision consiste à vérifier l'exhaustivité de la saisie, à repérer les anomalies (classes non pointées, absences répétées) et à déclencher les actions correctives.",
          steps: [
            {
              instruction: "Ouvrir Registre d'appel depuis le menu Vie scolaire.",
              navigation: "Menu Vie scolaire → Registre d'appel",
            },
            {
              instruction: "Sélectionner la date et passer en revue les classes non saisies.",
            },
            {
              instruction: "Rappeler les enseignants concernés via le module Communication.",
            },
          ],
        },
        {
          title: "Valider le cahier de texte",
          body: "Le cahier de texte est un document pédagogique opposable. Vous devez vérifier régulièrement sa tenue : régularité, qualité des objectifs renseignés, conformité au programme officiel. Cette validation prépare également les visites d'inspection.",
          steps: [
            {
              instruction: "Ouvrir Cahier de texte depuis le menu Vie scolaire.",
              navigation: "Menu Vie scolaire → Cahier de texte",
            },
            {
              instruction: "Filtrer par classe ou par enseignant.",
            },
            {
              instruction: "Consulter les séances et valider le suivi via le bouton Valider.",
            },
          ],
        },
      ],
    },
    {
      id: "evaluation",
      title: "5. Notes, bulletins et livret scolaire",
      intro: "L'évaluation est l'un des points les plus sensibles du pilotage. Vous garantissez la conformité des saisies, la cohérence des moyennes et l'édition officielle des documents remis aux familles et aux autorités.",
      sections: [
        {
          title: "Suivre la saisie des notes",
          body: "Les enseignants saisissent les notes par devoir et composition. Votre rôle est de suivre l'avancement, de relancer en cas de retard et de verrouiller les saisies à la clôture de la période. Un suivi rigoureux conditionne la publication dans les délais.",
          steps: [
            {
              instruction: "Ouvrir Notes & bulletins depuis le menu Vie scolaire.",
              navigation: "Menu Vie scolaire → Notes & bulletins",
            },
            {
              instruction: "Consulter l'état d'avancement par classe et par matière.",
            },
            {
              instruction: "Relancer les enseignants en retard via Communication.",
            },
            {
              instruction: "Verrouiller la période à la date prévue par le calendrier.",
            },
          ],
          bestPractices: [
            "Communiquez en amont les dates butoirs aux enseignants.",
            "Vérifiez les coefficients et barèmes avant verrouillage.",
          ],
        },
        {
          title: "Générer et diffuser les bulletins",
          body: "Les bulletins sont des documents officiels portant l'identité de l'établissement (logo, cachet, signature). Vous les générez après le conseil de classe, puis vous les diffusez aux familles. Une vérification visuelle est indispensable avant impression ou envoi.",
          steps: [
            {
              instruction: "Dans Notes & bulletins, sélectionner la période close.",
            },
            {
              instruction: "Cliquer sur Générer les bulletins pour la classe choisie.",
            },
            {
              instruction: "Prévisualiser un bulletin échantillon avant l'export en masse.",
              warning: "Toute correction après diffusion exige une réédition et une notification aux familles.",
            },
            {
              instruction: "Exporter au format PDF ou imprimer.",
            },
          ],
        },
        {
          title: "Tenir le livret scolaire",
          body: "Le livret scolaire constitue le parcours annuel et pluriannuel de chaque élève. Il intègre résultats, compétences et observations. Vous en supervisez la complétude et l'archivage en fin d'année.",
          steps: [
            {
              instruction: "Ouvrir Livret scolaire depuis le menu Vie scolaire.",
              navigation: "Menu Vie scolaire → Livret scolaire",
            },
            {
              instruction: "Sélectionner un élève pour consulter ou compléter son livret.",
            },
            {
              instruction: "Exporter le livret en fin d'année pour archivage.",
            },
          ],
        },
      ],
    },
    {
      id: "communication-rapports",
      title: "6. Communication, rendez-vous et rapports",
      intro: "Au-delà du pilotage interne, vous représentez l'établissement auprès des familles et des autorités. Les modules de communication et de reporting structurent cette relation et la formalisent.",
      sections: [
        {
          title: "Communiquer avec le personnel et les familles",
          body: "Le module Communication centralise les messages internes et externes. Privilégiez ce canal officiel : il conserve l'historique des échanges et permet de cibler les destinataires par classe, fonction ou rôle.",
          steps: [
            {
              instruction: "Ouvrir Communication depuis le menu d'accueil.",
              navigation: "Menu Accueil → Communication",
            },
            {
              instruction: "Composer un message en sélectionnant les destinataires.",
            },
            {
              instruction: "Joindre les pièces utiles et envoyer.",
            },
          ],
        },
        {
          title: "Planifier des rendez-vous",
          body: "Le module Rendez-vous facilite la gestion des entretiens avec les familles, enseignants ou inspecteurs. Il évite les doubles réservations et envoie des rappels.",
          steps: [
            {
              instruction: "Ouvrir Rendez-vous depuis le menu d'accueil.",
              navigation: "Menu Accueil → Rendez-vous",
            },
            {
              instruction: "Créer un créneau ou accepter une demande entrante.",
            },
            {
              instruction: "Confirmer pour notifier les participants.",
            },
          ],
        },
        {
          title: "Rédiger le rapport d'établissement et les rapports d'activité",
          body: "Le rapport d'établissement est un document de synthèse remis périodiquement à votre DRENA. Il agrège les indicateurs clés. Les rapports d'activité documentent les événements spécifiques (sorties, formations internes, projets).",
          steps: [
            {
              instruction: "Ouvrir Rapport d'établissement depuis le menu Statistiques.",
              navigation: "Menu Statistiques → Rapport d'établissement",
            },
            {
              instruction: "Configurer la période et les indicateurs à inclure.",
            },
            {
              instruction: "Générer, vérifier puis exporter au format PDF.",
            },
            {
              instruction: "Pour les activités ponctuelles, ouvrir Rapports d'activité et créer une fiche.",
            },
          ],
          bestPractices: [
            "Validez le rapport en conseil de direction avant transmission.",
            "Conservez une copie locale archivée par année scolaire.",
          ],
        },
      ],
    },
    {
      id: "statistiques-inspection",
      title: "7. Statistiques, performance et inspection",
      intro: "Le pilotage par la donnée renforce la qualité pédagogique. Vous disposez de tableaux de bord et de modules d'inspection pour analyser, expliquer et améliorer les résultats.",
      sections: [
        {
          title: "Exploiter les tableaux de bord",
          body: "Les modules Statistiques, Analytics et Performance enseignants offrent une lecture croisée des résultats. Utilisez-les pour préparer les conseils de classe, les entretiens annuels et le rapport d'établissement.",
          steps: [
            {
              instruction: "Ouvrir Statistiques établissement depuis le menu Statistiques.",
              navigation: "Menu Statistiques → Établissement",
            },
            {
              instruction: "Consulter Par classe pour identifier les écarts de réussite.",
            },
            {
              instruction: "Ouvrir Performance enseignants puis Efficacité pédagogique pour une analyse approfondie.",
            },
          ],
          bestPractices: [
            "Comparez les indicateurs d'une période à l'autre, jamais hors contexte.",
            "Présentez ces analyses lors des conseils pédagogiques.",
          ],
        },
        {
          title: "Préparer et suivre les inspections",
          body: "Le module Inspection vous donne accès aux visites planifiées et passées. Vous pouvez consulter les rapports d'inspection adressés à l'établissement et suivre la mise en œuvre des recommandations.",
          steps: [
            {
              instruction: "Ouvrir Inspection depuis le menu Inspection & supervision.",
              navigation: "Menu Inspection & supervision → Inspection",
            },
            {
              instruction: "Consulter les rapports remis aux enseignants.",
            },
            {
              instruction: "Ouvrir Suivi des recommandations pour piloter les actions correctives.",
              navigation: "Menu Inspection & supervision → Suivi des recommandations",
            },
            {
              instruction: "Mettre à jour le statut de chaque recommandation (en cours, réalisée).",
            },
          ],
          caveat: "Une recommandation non suivie peut être signalée lors de la prochaine visite : assurez-vous d'un pilotage régulier.",
        },
      ],
    },
    {
      id: "premium-sms",
      title: "8. Académie Premium et alertes SMS",
      intro: "Les services Premium étendent les capacités de communication de l'établissement, notamment vers les familles. Vous en êtes l'ordonnateur et le responsable financier.",
      sections: [
        {
          title: "Souscrire à Académie Premium",
          body: "L'abonnement Premium ouvre l'accès à des fonctionnalités complémentaires telles que la diffusion enrichie des bulletins et l'envoi de SMS. La souscription est facturée à l'établissement et donne lieu à un reçu officiel.",
          steps: [
            {
              instruction: "Ouvrir Académie Premium depuis le menu d'accueil.",
              navigation: "Menu Accueil → Académie Premium",
            },
            {
              instruction: "Sélectionner l'offre adaptée à votre établissement.",
            },
            {
              instruction: "Valider le paiement selon le moyen proposé.",
            },
            {
              instruction: "Télécharger le reçu PDF pour votre comptabilité.",
            },
          ],
          bestPractices: [
            "Anticipez la souscription avant les périodes critiques (rentrée, fin de trimestre).",
            "Conservez les reçus dans le dossier de facturation de l'établissement.",
          ],
        },
        {
          title: "Gérer les alertes SMS aux parents",
          body: "Les alertes SMS permettent d'informer rapidement les familles : absences, retards, convocations, événements. Leur usage doit rester proportionné et respectueux de la vie privée.",
          steps: [
            {
              instruction: "Ouvrir Alertes SMS depuis le menu d'accueil.",
              navigation: "Menu Accueil → Alertes SMS",
            },
            {
              instruction: "Sélectionner le type d'alerte et la cible (classe, élève, parents).",
            },
            {
              instruction: "Rédiger un message bref et factuel.",
            },
            {
              instruction: "Vérifier le crédit SMS disponible puis envoyer.",
              warning: "Chaque envoi consomme du crédit Premium : évitez les doublons.",
            },
          ],
          caveat: "Respectez l'horaire raisonnable d'envoi (jamais en pleine nuit) et la confidentialité des informations transmises.",
        },
      ],
    },
    {
      id: "centre-formation",
      title: "9. Centre de formation",
      intro: "Le Centre de formation est la bibliothèque pédagogique d'EduWeb Planner : séminaires interactifs, manuel académique et guides utilisateurs par rôle. En tant que chef d'établissement, vous y avez une double posture : apprenant qui suit lui-même les séminaires et obtient un certificat, et responsable de formation de votre équipe, à qui vous pouvez inscrire vos collaborateurs, animer un séminaire et valider leur réussite.",
      sections: [
        {
          title: "Accéder au Centre de formation et explorer les ressources",
          body: "Le Centre de formation s'ouvre depuis le menu Accueil, rubrique Aide. Vous y trouvez trois familles de ressources : les séminaires interactifs (formations animées, présentées en mode « livre numérique » paginé), le manuel académique et les guides utilisateurs par rôle. Les séminaires disponibles couvrent « Magnifica Humanitas », « Le numérique au service de la communication éducative et pastorale » (SENEC) et « L'intelligence artificielle au service de la communication éducative et pastorale » (SENEC, d'une durée de 2 h 30).",
          steps: [
            {
              instruction: "Ouvrir le Centre de formation depuis le menu d'accueil.",
              navigation: "Menu Accueil → Aide",
            },
            {
              instruction: "Parcourir la bibliothèque : séminaires interactifs, manuel académique et guides par rôle.",
            },
            {
              instruction: "Ouvrir un séminaire pour le feuilleter en mode livre numérique paginé.",
              tip: "Naviguez au clavier avec les flèches ← et →, la touche F pour le plein écran, et le sommaire pour atteindre directement une page ou un atelier.",
            },
          ],
          caveat: "L'accès à une formation requiert une inscription préalable. Le manuel et les guides peuvent être ouverts automatiquement selon votre rôle ; les séminaires supposent une inscription nominative.",
        },
        {
          title: "Suivre un séminaire et obtenir votre certificat",
          body: "Chaque séminaire combine des diapositives (visionneuse ePub, support PowerPoint téléchargeable, lecture audio des pages et des consignes) et des ateliers interactifs auto-corrigés : diagnostic de maturité, QCM, matrice ou check-list, scénario, correction d'un message généré par IA, et auto-évaluation finale avec bilan. À l'issue du parcours, un livret académique imprimable, un export Word et un certificat de fin attestent votre formation. Suivre vous-même un séminaire vous met en position de mieux l'animer ensuite auprès de votre équipe.",
          steps: [
            {
              instruction: "Depuis le Centre de formation, ouvrir un séminaire auquel vous êtes inscrit.",
              navigation: "Menu Accueil → Aide → Séminaires interactifs",
            },
            {
              instruction: "Lire les diapositives et écouter, au besoin, la lecture audio des pages et des consignes.",
            },
            {
              instruction: "Réaliser les ateliers interactifs : diagnostic, QCM, matrice, scénario, correction de message IA, puis l'auto-évaluation finale.",
              tip: "Le bilan de l'auto-évaluation vous indique les points à consolider avant de vous présenter comme animateur.",
            },
            {
              instruction: "Imprimer le livret académique avec Ctrl+P ou télécharger l'export Word (.docx).",
            },
            {
              instruction: "Récupérer le certificat de fin une fois le parcours achevé.",
            },
          ],
          bestPractices: [
            "Suivez intégralement un séminaire avant de l'animer pour votre équipe : vous en maîtriserez les ateliers et les pièges.",
            "Conservez votre certificat dans votre dossier professionnel et dans les archives de l'établissement.",
          ],
        },
        {
          title: "Inscrire et suivre vos collaborateurs (rôle Gestionnaire)",
          body: "L'accès à une formation passe par une inscription, réalisée par un administrateur ou un gestionnaire. En tant que chef d'établissement, vous pouvez être désigné gestionnaire d'une formation destinée à votre équipe : vous inscrivez alors vos collaborateurs, organisez les cohortes et attribuez les rôles de formation. L'inscription se fait de façon nominative, par cohorte, ou par import CSV d'adresses e-mail. Tout se pilote dans Système → Inscriptions aux formations, réservé aux profils habilités.",
          steps: [
            {
              instruction: "Ouvrir Inscriptions aux formations depuis le menu Système.",
              navigation: "Menu Système → Inscriptions aux formations",
            },
            {
              instruction: "Sélectionner la formation concernée, puis rechercher l'utilisateur par nom, e-mail ou rôle.",
            },
            {
              instruction: "Inscrire vos stagiaires comme étudiants, et vos collaborateurs comme enseignants ou tuteurs selon leur mission.",
              tip: "Pour une promotion entière, utilisez l'inscription par cohorte ou l'import CSV d'adresses e-mail.",
            },
            {
              instruction: "Suivre la progression des inscrits et ajuster les rôles si nécessaire.",
              warning: "Les rôles de formation sont propres à chaque formation : un même collaborateur peut être étudiant sur l'une et enseignant sur une autre.",
            },
          ],
          bestPractices: [
            "Constituez des cohortes cohérentes (par cycle, par discipline) pour simplifier le suivi et la validation.",
            "Vérifiez l'orthographe des adresses e-mail avant un import CSV pour éviter les inscriptions perdues.",
          ],
        },
        {
          title: "Animer un séminaire et valider la réussite (rôle Enseignant ou Tuteur)",
          body: "Sur une formation où vous êtes inscrit comme enseignant, vous animez : vous consultez et critiquez les productions des apprenants, publiez vos appréciations, validez la réussite et délivrez les certificats. Comme tuteur, vous accompagnez de la même façon — consultation et critique des productions, publication de vos retours — mais sans valider la réussite ni délivrer de certificat. La hiérarchie des rôles de formation est, par ordre décroissant : Admin, Gestionnaire, Enseignant, Tuteur, Étudiant.",
          steps: [
            {
              instruction: "Ouvrir la formation que vous animez depuis le Centre de formation.",
              navigation: "Menu Accueil → Aide → Séminaires interactifs",
            },
            {
              instruction: "Consulter les productions soumises par les apprenants et formuler vos critiques.",
            },
            {
              instruction: "Publier vos appréciations afin que chaque apprenant en prenne connaissance.",
            },
            {
              instruction: "En tant qu'enseignant, valider la réussite et délivrer les certificats de fin aux apprenants ayant atteint les objectifs.",
              warning: "Le rôle Tuteur publie des retours mais ne valide pas la réussite : seuls l'enseignant, le gestionnaire ou l'admin peuvent valider et certifier.",
            },
          ],
          bestPractices: [
            "Critiquez les productions de façon constructive et datée pour garder une trace pédagogique exploitable.",
            "Ne validez la réussite qu'après vérification de l'auto-évaluation finale et des ateliers attendus.",
          ],
          caveat: "Les rôles de formation s'attribuent par inscription et restent indépendants de votre rôle applicatif dans EduWeb Planner : être chef d'établissement ne vous donne pas automatiquement le rôle Enseignant sur une formation.",
        },
      ],
    },
    {
      id: "transport-eleves",
      title: "Transport d'élèves de mon établissement",
      intro:
        "Si votre compte est rattaché à votre établissement, vous gérez son service de transport — et lui seul. Le suivi se fait en temps réel sur une carte (OpenStreetMap) ; les parents abonnés voient les cars se déplacer.",
      sections: [
        {
          title: "Accéder au service et comprendre le périmètre",
          body:
            "Vous n'avez pas de sélecteur d'établissement : vous gérez automatiquement le vôtre. L'isolation garantit que vous ne voyez ni ne modifiez les données d'un autre établissement (cars, créneaux, tarifs, conducteurs, paiements).",
          steps: [
            {
              instruction: "Ouvrez le module de transport.",
              navigation: "Vie scolaire → Transport d'élèves",
              tip: "Si vous ne voyez pas le bloc « Configuration », c'est que votre compte n'est pas encore rattaché à votre établissement — demandez-le à l'administrateur.",
            },
          ],
        },
        {
          title: "Configurer véhicules, créneaux et tarifs",
          body:
            "Dans « Configuration (administrateur) », réglez la tarification (mensuel, annuel, pénalité d'upgrade), la périodicité du bip et le centre de la carte, puis ajoutez vos cars (par matricule) et vos créneaux (aller / retour, jours, heures).",
          bestPractices: [
            "Préparez cars, créneaux et conducteurs avant la rentrée.",
            "Vérifiez qu'un créneau couvre bien les heures réelles de ramassage.",
          ],
        },
        {
          title: "Conducteurs et validation des paiements",
          body:
            "Désignez vos conducteurs par e-mail (compte existant) ; eux seuls peuvent émettre la position depuis leur téléphone (« Mode conducteur »). Validez ensuite les paiements Mobile Money de vos parents dans « Paiements en attente » : la confirmation ouvre l'abonnement jusqu'à l'échéance.",
          caveat:
            "Vous ne validez que les paiements de votre établissement ; ceux des autres établissements ne vous sont pas présentés.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Puis-je modifier un bulletin déjà publié aux familles ?",
      answer: "Techniquement oui, mais cette opération doit rester exceptionnelle. Toute modification implique une réédition, une nouvelle signature et une information aux familles. Conservez la trace de la justification administrative.",
    },
    {
      question: "Un enseignant me signale ne pas voir son emploi du temps : que faire ?",
      answer: "Vérifiez dans le module Emplois du temps que la grille a bien été publiée et non simplement enregistrée. Vérifiez ensuite que le compte de l'enseignant est actif dans Comptes utilisateurs.",
    },
    {
      question: "Dois-je supprimer le compte d'un enseignant qui quitte l'établissement ?",
      answer: "Non. Désactivez le compte depuis Comptes utilisateurs. La suppression compromettrait la traçabilité des notes et cahiers de texte qu'il a produits.",
    },
    {
      question: "Comment relancer plusieurs enseignants n'ayant pas saisi leurs notes ?",
      answer: "Depuis Notes & bulletins, identifiez les saisies manquantes, puis utilisez le module Communication pour envoyer un message groupé avec rappel de l'échéance.",
    },
    {
      question: "Le rapport d'établissement est-il transmis automatiquement à la DRENA ?",
      answer: "Non. Vous le générez, vous le validez, puis vous le transmettez selon le canal officiel demandé par votre autorité de tutelle. EduWeb Planner ne se substitue pas à cette démarche.",
    },
    {
      question: "Que faire si une recommandation d'inspection est inapplicable ?",
      answer: "Mettez à jour son statut dans Suivi des recommandations en y consignant la justification. Échangez avec l'inspecteur lors de la visite suivante pour formaliser la décision.",
    },
    {
      question: "Puis-je envoyer un SMS à toutes les familles de l'établissement en une fois ?",
      answer: "Oui, depuis Alertes SMS en sélectionnant l'ensemble des classes. Vérifiez impérativement votre crédit Premium et la pertinence du message avant envoi.",
    },
    {
      question: "Comment savoir quelles classes ont un faible taux de présence ?",
      answer: "Ouvrez Statistiques établissement puis Par classe. Le tableau croise les effectifs et les présences cumulées sur la période sélectionnée.",
    },
    {
      question: "Le cahier de texte est-il consulté par les inspecteurs ?",
      answer: "Oui. Le cahier de texte est un document pédagogique opposable, consultable lors des visites d'inspection. Sa validation régulière par la direction est attendue.",
    },
    {
      question: "Que faire si la configuration du calendrier est erronée après le démarrage de l'année ?",
      answer: "Corrigez-la avec prudence depuis Configuration et vérifiez l'impact sur les bulletins déjà générés. En cas de doute, contactez le support avant toute modification.",
    },
    {
      question: "Comment inscrire mon équipe à un séminaire du Centre de formation ?",
      answer: "Si vous êtes gestionnaire de la formation, ouvrez Système → Inscriptions aux formations, sélectionnez le séminaire, puis inscrivez vos collaborateurs nominativement, par cohorte ou par import CSV d'adresses e-mail. Vous pouvez les inscrire comme étudiants, ou comme enseignants et tuteurs s'ils doivent animer.",
    },
    {
      question: "Suis-je automatiquement enseignant d'un séminaire parce que je suis chef d'établissement ?",
      answer: "Non. Les rôles de formation (admin, gestionnaire, enseignant, tuteur, étudiant) s'attribuent par inscription et sont propres à chaque formation. Vous pouvez être étudiant sur l'une et enseignant sur une autre ; seul l'enseignant, le gestionnaire ou l'admin valide la réussite et délivre les certificats.",
    },
  ],
  glossary: [
    {
      term: "Chef d'établissement",
      definition: "Responsable de la direction pédagogique et administrative d'un établissement scolaire, garant du bon fonctionnement et de la qualité de l'enseignement.",
    },
    {
      term: "Vue d'ensemble",
      definition: "Tableau de bord agrégeant les indicateurs clés de pilotage : effectifs, présences, activité pédagogique et alertes.",
    },
    {
      term: "Régime scolaire",
      definition: "Modalité d'accueil de l'élève dans l'établissement : externat, demi-pension ou internat.",
    },
    {
      term: "Verrouillage de période",
      definition: "Action de clôturer la saisie des notes d'une période donnée, empêchant toute modification ultérieure et autorisant la génération des bulletins.",
    },
    {
      term: "Conseil de classe",
      definition: "Réunion périodique réunissant la direction, les enseignants et parfois les délégués, dédiée à l'examen des résultats et à la formulation des appréciations officielles.",
    },
    {
      term: "Publication de l'emploi du temps",
      definition: "Acte par lequel le chef d'établissement rend visibles les grilles horaires aux enseignants, élèves et parents.",
    },
    {
      term: "Crédit SMS",
      definition: "Solde de messages disponibles dans le cadre de l'abonnement Premium, consommé à chaque alerte envoyée aux familles.",
    },
    {
      term: "Rapport d'établissement",
      definition: "Document synthétique configurable agrégeant les indicateurs de l'établissement, exporté pour la DRENA ou le conseil d'administration.",
    },
    {
      term: "Suivi des recommandations",
      definition: "Module dédié au pilotage des actions correctives issues des rapports d'inspection, avec statuts et responsables désignés.",
    },
    {
      term: "Académie Premium",
      definition: "Offre d'abonnement payante de l'établissement, donnant accès aux services étendus tels que les SMS et les bulletins enrichis.",
    },
    {
      term: "Compte nominatif",
      definition: "Compte utilisateur attribué à une personne identifiée, par opposition à un compte partagé, condition indispensable de la traçabilité.",
    },
    {
      term: "Branding documentaire",
      definition: "Ensemble des éléments d'identité visuelle (logo, cachet, signature) appliqués automatiquement aux documents officiels exportés.",
    },
    {
      term: "Séminaire interactif",
      definition: "Formation du Centre de formation présentée en mode livre numérique paginé, associant diapositives (ePub, support PowerPoint, lecture audio), ateliers auto-corrigés, livret imprimable, export Word et certificat de fin.",
    },
    {
      term: "Rôle de formation",
      definition: "Rôle attribué par inscription au sein d'une formation, indépendant du rôle applicatif. Par ordre décroissant : admin, gestionnaire, enseignant, tuteur, étudiant. Un même utilisateur peut être étudiant sur une formation et enseignant sur une autre.",
    },
  ],
};
