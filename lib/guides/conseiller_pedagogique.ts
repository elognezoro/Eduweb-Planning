import type { GuideContent } from "@/components/guides/guide-layout";

export const guideConseillerPedagogique: Omit<GuideContent, "icon"> = {
  roleKey: "conseiller_pedagogique",
  roleLabel: "Conseiller pédagogique",
  meta: {
    level: "Intermédiaire",
    duration: "60 min",
    targetAudience: "Conseillers pédagogiques rattachés aux APFC (formation continue) intervenant auprès des enseignants des écoles et établissements de leur périmètre.",
    context: "À utiliser à la prise de fonction d'un conseiller pédagogique sur EduWeb Planner, lors d'une montée en compétences sur les outils numériques de l'APFC, ou comme guide de référence pour préparer une campagne d'accompagnement trimestrielle.",
  },
  objectives: [
    "Savoir se connecter, mettre à jour son profil et identifier son périmètre d'intervention.",
    "Être capable de consulter le cahier de texte et de communiquer efficacement avec les enseignants accompagnés.",
    "Comprendre la structure d'une grille d'évaluation et d'un rapport d'inspection pour en tirer une stratégie d'accompagnement.",
    "Être capable d'assurer le suivi des recommandations et d'actualiser leur statut.",
    "Savoir planifier un rendez-vous de coaching et l'articuler avec le suivi des recommandations.",
    "Être capable de mobiliser les indicateurs de performance et d'efficacité pédagogique pour piloter son action.",
    "Savoir exporter et partager des données dans le respect de la confidentialité professionnelle.",
    "Comprendre les règles déontologiques propres au traitement des données d'observation des enseignants.",
  ],
  prerequisites: [
    "Disposer d'un compte EduWeb Planner actif avec le rôle Conseiller pédagogique.",
    "Être rattaché à une antenne (APFC) et à un périmètre d'établissements défini par l'administrateur.",
    "Connaître les principes généraux de l'accompagnement pédagogique et de l'inspection.",
    "Savoir utiliser un navigateur web récent et gérer ses identifiants professionnels.",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Prise en main de l'espace Conseiller pédagogique",
      intro: "Ce chapitre pose les fondations : se connecter, comprendre l'écran d'accueil et identifier les modules qui structurent votre activité quotidienne d'accompagnement.",
      sections: [
        {
          title: "1.1 Connexion et identification",
          body: "Le conseiller pédagogique accède à EduWeb Planner via une authentification nominative. Cette identification garantit la traçabilité de chaque action d'accompagnement et conditionne l'affichage des seuls enseignants et antennes relevant de votre périmètre. Avant toute première session, vérifiez que votre adresse de messagerie professionnelle est bien renseignée par l'administrateur APFC ou DRENA.",
          steps: [
            {
              instruction: "Ouvrez le navigateur et saisissez l'URL d'EduWeb Planner communiquée par votre antenne.",
              navigation: "Page de connexion",
            },
            {
              instruction: "Renseignez votre identifiant professionnel et votre mot de passe, puis validez.",
            },
            {
              instruction: "À la première connexion, modifiez immédiatement le mot de passe provisoire.",
              tip: "Choisissez une formule longue et mémorisable plutôt qu'une suite courte et complexe.",
            },
            {
              instruction: "Consultez la page Mon identification pour confirmer votre rôle, votre antenne de rattachement et votre périmètre d'intervention.",
              navigation: "Menu utilisateur → Mon identification",
            },
          ],
          bestPractices: [
            "Verrouillez votre session dès que vous quittez votre poste : vous manipulez des données nominatives d'enseignants.",
            "Ne partagez jamais vos identifiants, même avec un collègue de votre antenne.",
          ],
        },
        {
          title: "1.2 Lire l'écran d'accueil et la vue d'ensemble",
          body: "L'accueil offre un raccourci vers vos activités en cours : recommandations à suivre, rendez-vous planifiés, notifications. La page Vue d'ensemble agrège, elle, les indicateurs de pilotage pédagogique de votre périmètre. Comprendre la complémentarité de ces deux pages évite la dispersion : l'accueil pour agir, la vue d'ensemble pour analyser.",
          steps: [
            {
              instruction: "Depuis l'accueil, repérez les blocs de notifications et de tâches à traiter.",
              navigation: "Menu Accueil",
            },
            {
              instruction: "Ouvrez la Vue d'ensemble pour visualiser les indicateurs agrégés (inspections récentes, recommandations ouvertes, performance enseignants).",
              navigation: "Menu Accueil → Vue d'ensemble",
            },
            {
              instruction: "Identifiez les filtres disponibles (période, antenne, établissement) et appliquez celui qui correspond à votre semaine de travail.",
            },
          ],
        },
        {
          title: "1.3 Compléter et tenir à jour son profil",
          body: "Votre profil porte les informations transmises aux enseignants accompagnés : nom, photo, contact professionnel, spécialité disciplinaire. Un profil tenu à jour facilite la prise de rendez-vous et la reconnaissance lors des visites de classe.",
          steps: [
            {
              instruction: "Ouvrez la page Mon profil.",
              navigation: "Menu utilisateur → Mon profil",
            },
            {
              instruction: "Mettez à jour votre discipline d'intervention et votre établissement de rattachement.",
            },
            {
              instruction: "Renseignez un numéro de téléphone professionnel pour les rendez-vous urgents.",
            },
            {
              instruction: "Enregistrez les modifications.",
              warning: "Ne diffusez pas de coordonnées personnelles dans le profil public — utilisez exclusivement les contacts professionnels.",
            },
          ],
        },
      ],
    },
    {
      id: "accompagnement-pedagogique",
      title: "2. Accompagner les enseignants au quotidien",
      intro: "Le cœur du métier de conseiller pédagogique est l'accompagnement individualisé. EduWeb Planner centralise les outils nécessaires : consultation du cahier de texte, communication ciblée et planification des rendez-vous de coaching.",
      sections: [
        {
          title: "2.1 Consulter le cahier de texte de l'enseignant",
          body: "Le cahier de texte est une source précieuse pour préparer une visite ou un entretien de mentorat : il révèle la progression réelle, la qualité des objectifs annoncés et la cohérence des ressources utilisées. Une lecture régulière permet d'engager le dialogue sur des éléments concrets plutôt que sur des impressions.",
          steps: [
            {
              instruction: "Ouvrez le module Cahier de texte.",
              navigation: "Menu Vie scolaire → Cahier de texte",
            },
            {
              instruction: "Filtrez par établissement, classe et enseignant accompagné.",
            },
            {
              instruction: "Examinez la séquence en cours : objectifs, contenus, ressources, devoirs.",
            },
            {
              instruction: "Notez vos observations dans votre propre support de suivi avant l'entretien.",
              tip: "Préparez 2 à 3 questions ouvertes appuyées sur des séances précises plutôt qu'une longue liste de remarques.",
            },
          ],
        },
        {
          title: "2.2 Communiquer avec les enseignants accompagnés",
          body: "La messagerie interne sécurise les échanges et garde une trace écrite des conseils donnés. Privilégiez ce canal aux SMS ou messageries personnelles : il s'inscrit dans le périmètre professionnel et reste accessible à votre antenne.",
          steps: [
            {
              instruction: "Ouvrez le module Communication.",
              navigation: "Menu Vie scolaire → Communication",
            },
            {
              instruction: "Sélectionnez un ou plusieurs destinataires dans la liste des enseignants de votre périmètre.",
            },
            {
              instruction: "Rédigez un message bref et factuel ; joignez si nécessaire un document ressource.",
            },
            {
              instruction: "Envoyez et vérifiez l'accusé de lecture dans la conversation.",
              warning: "Tout message envoyé via la plateforme constitue une trace consultable : adoptez une formulation professionnelle, même en cas de désaccord.",
            },
          ],
          bestPractices: [
            "Annoncez systématiquement le motif de l'échange en première ligne (suivi de séance, préparation de visite, restitution).",
            "Préférez la messagerie pour les contenus pédagogiques, le rendez-vous pour les sujets sensibles.",
          ],
        },
        {
          title: "2.3 Planifier un rendez-vous de coaching",
          body: "Le module Rendez-vous permet d'organiser visites de classe, entretiens de restitution et séances de mentorat. Une planification visible côté enseignant améliore l'adhésion et limite les annulations.",
          steps: [
            {
              instruction: "Ouvrez la page Rendez-vous.",
              navigation: "Menu Vie scolaire → Rendez-vous",
            },
            {
              instruction: "Cliquez sur le bouton de création (en haut à droite).",
            },
            {
              instruction: "Choisissez le type (visite, restitution, coaching), la date, le créneau et le lieu.",
            },
            {
              instruction: "Sélectionnez l'enseignant et, si nécessaire, le chef d'établissement en copie.",
            },
            {
              instruction: "Enregistrez : l'invitation est notifiée à toutes les parties.",
              tip: "Prévoyez 15 minutes de marge entre deux rendez-vous pour rédiger vos notes à chaud.",
            },
          ],
        },
      ],
    },
    {
      id: "inspection-grilles",
      title: "3. Inspection et grilles d'évaluation",
      intro: "Le conseiller pédagogique exploite les observations d'inspection pour cibler son accompagnement. Ce chapitre détaille la consultation des grilles d'évaluation et la lecture critique des rapports d'inspection.",
      sections: [
        {
          title: "3.1 Consulter les grilles d'évaluation de classe",
          body: "La grille d'évaluation structure l'observation autour de critères stables : maîtrise des contenus, organisation, posture, gestion de classe. Sa relecture après visite éclaire votre stratégie d'accompagnement et fonde des objectifs mesurables.",
          steps: [
            {
              instruction: "Ouvrez le module Grille d'évaluation.",
              navigation: "Menu Inspection-Supervision → Grille d'évaluation",
            },
            {
              instruction: "Filtrez par enseignant, période ou inspecteur ayant conduit l'observation.",
            },
            {
              instruction: "Lisez critère par critère et identifiez 2 forces et 2 axes de progrès.",
            },
            {
              instruction: "Préparez une fiche de restitution qui s'appuie sur les critères les plus fragiles.",
            },
          ],
          caveat: "Ces grilles contiennent des évaluations nominatives : ne les diffusez jamais en dehors du circuit professionnel autorisé.",
        },
        {
          title: "3.2 Lire un rapport d'inspection",
          body: "Le rapport d'inspection synthétise observations, points forts, axes de progrès et recommandations. Le conseiller pédagogique en est un lecteur opérationnel : il en tire la matière de son plan d'accompagnement.",
          steps: [
            {
              instruction: "Ouvrez la page Rapports d'inspection.",
              navigation: "Menu Inspection-Supervision → Rapports d'inspection",
            },
            {
              instruction: "Sélectionnez le rapport concerné dans la liste.",
            },
            {
              instruction: "Concentrez votre lecture sur la section recommandations et leurs priorités.",
            },
            {
              instruction: "Exportez la fiche si vous devez préparer un entretien hors-ligne.",
              tip: "Notez la date du rapport : un rapport ancien ne reflète plus nécessairement la pratique actuelle.",
            },
          ],
        },
        {
          title: "3.3 Module Inspection : naviguer dans les visites planifiées",
          body: "Le module Inspection donne la vision agrégée des visites à venir et passées sur votre périmètre. Il vous permet d'anticiper vos propres interventions en aval d'une visite d'inspection.",
          steps: [
            {
              instruction: "Ouvrez le module Inspection.",
              navigation: "Menu Inspection-Supervision → Inspection",
            },
            {
              instruction: "Identifiez les enseignants récemment inspectés sur votre périmètre.",
            },
            {
              instruction: "Programmez un rendez-vous de suivi pour chacun, dans un délai raisonnable après la visite.",
            },
          ],
        },
      ],
    },
    {
      id: "suivi-recommandations",
      title: "4. Suivi des recommandations",
      intro: "Le suivi des recommandations est la trace concrète de l'accompagnement. Il transforme un rapport d'inspection en plan d'action partagé entre conseiller pédagogique, enseignant et établissement.",
      sections: [
        {
          title: "4.1 Identifier les recommandations à suivre",
          body: "Chaque recommandation est tracée avec une priorité, un responsable et une échéance. Le conseiller pédagogique se concentre sur celles qui relèvent de la pratique pédagogique et qui lui sont assignées ou pour lesquelles il intervient en appui.",
          steps: [
            {
              instruction: "Ouvrez le module Suivi des recommandations.",
              navigation: "Menu Inspection-Supervision → Suivi des recommandations",
            },
            {
              instruction: "Filtrez par statut (ouverte, en cours, clôturée) et par priorité.",
            },
            {
              instruction: "Triez par échéance pour repérer les recommandations urgentes.",
            },
            {
              instruction: "Ouvrez chaque fiche et lisez le libellé complet ainsi que le contexte.",
            },
          ],
        },
        {
          title: "4.2 Mettre à jour l'avancement",
          body: "L'actualisation régulière du statut permet à votre chef d'antenne et au chef d'établissement de mesurer l'efficacité réelle de l'accompagnement. Une recommandation qui reste ouverte sans commentaire devient illisible.",
          steps: [
            {
              instruction: "Sur une recommandation ouverte, ajoutez un commentaire daté décrivant l'action menée.",
            },
            {
              instruction: "Modifiez le statut (en cours, en attente, clôturée) en cohérence avec l'avancement réel.",
            },
            {
              instruction: "Joignez un livrable si pertinent (fiche de séance, plan de progrès).",
            },
            {
              instruction: "Enregistrez.",
              warning: "Ne clôturez une recommandation que si l'amélioration a été constatée lors d'une visite ou d'une production vérifiable.",
            },
          ],
          bestPractices: [
            "Documentez en quelques lignes la nature de l'accompagnement réalisé (entretien, séance co-animée, ressources fournies).",
            "Reprenez la formulation initiale de la recommandation pour éviter les dérives d'interprétation.",
          ],
        },
        {
          title: "4.3 Articuler suivi et rendez-vous",
          body: "Un suivi efficace alterne actions tracées dans EduWeb et rencontres réelles. Pensez à programmer un rendez-vous de bilan à mi-parcours d'une recommandation longue.",
          steps: [
            {
              instruction: "Depuis la fiche de recommandation, retournez au module Rendez-vous.",
            },
            {
              instruction: "Créez un rendez-vous de bilan en mentionnant la référence de la recommandation dans l'objet.",
            },
            {
              instruction: "Après le bilan, complétez la fiche de suivi avec les conclusions.",
            },
          ],
        },
      ],
    },
    {
      id: "rapports-antennes",
      title: "5. Rapports d'antennes pédagogiques",
      intro: "Le conseiller pédagogique contribue à la vie de son APFC. Les rapports d'antennes consolident l'activité collective et alimentent le dialogue avec la DRENA.",
      sections: [
        {
          title: "5.1 Consulter les rapports d'antennes",
          body: "Le module Rapports d'antennes regroupe les bilans périodiques d'activité de votre APFC : visites menées, formations animées, recommandations clôturées. Cette consultation est utile pour situer votre action individuelle dans la dynamique collective.",
          steps: [
            {
              instruction: "Ouvrez la page Rapports d'antennes.",
              navigation: "Menu Statistiques → Rapports d'antennes",
            },
            {
              instruction: "Sélectionnez la période souhaitée (mensuel, trimestriel).",
            },
            {
              instruction: "Lisez le rapport et repérez les indicateurs qui vous concernent directement.",
            },
          ],
        },
        {
          title: "5.2 Consulter le rapport antennes pédagogiques détaillé",
          body: "La page Rapport antennes pédagogiques propose une vue plus fine, orientée pratiques pédagogiques : nombre d'enseignants accompagnés, recommandations par discipline, progression des indicateurs.",
          steps: [
            {
              instruction: "Ouvrez la page Rapport antennes pédagogiques.",
              navigation: "Menu Statistiques → Rapport antennes pédagogiques",
            },
            {
              instruction: "Filtrez par discipline, par cycle ou par établissement.",
            },
            {
              instruction: "Identifiez les écarts marquants (positifs ou négatifs) pour préparer la prochaine réunion d'antenne.",
            },
          ],
          caveat: "Les chiffres doivent être interprétés à la lumière du contexte : un volume faible peut traduire un effort de fond, pas un manque d'activité.",
        },
      ],
    },
    {
      id: "analyse-performance",
      title: "6. Analyse de la performance et de l'efficacité",
      intro: "Au-delà du suivi individuel, le conseiller pédagogique mobilise les indicateurs agrégés pour piloter sa stratégie d'accompagnement et la défendre devant les autorités.",
      sections: [
        {
          title: "6.1 Lire la performance des enseignants",
          body: "Le module Performance enseignants synthétise les indicateurs disponibles par enseignant : visites reçues, recommandations en cours, évolutions observées. Il aide à prioriser l'accompagnement vers ceux qui en ont le plus besoin.",
          steps: [
            {
              instruction: "Ouvrez la page Performance enseignants.",
              navigation: "Menu Statistiques → Performance enseignants",
            },
            {
              instruction: "Triez la liste par indicateur (recommandations ouvertes, ancienneté de la dernière visite).",
            },
            {
              instruction: "Identifiez les profils à accompagner en priorité pour le trimestre à venir.",
            },
          ],
          bestPractices: [
            "Croisez systématiquement plusieurs indicateurs avant de qualifier une situation : un seul chiffre n'est jamais suffisant.",
            "Associez le chef d'établissement à toute interprétation transmise à un tiers.",
          ],
        },
        {
          title: "6.2 Évaluer l'efficacité pédagogique de vos actions",
          body: "La page Efficacité pédagogique met en regard les actions d'accompagnement et leurs effets observables. Elle vous aide à mesurer si vos interventions ont réellement amélioré les pratiques ciblées.",
          steps: [
            {
              instruction: "Ouvrez la page Efficacité pédagogique.",
              navigation: "Menu Statistiques → Efficacité pédagogique",
            },
            {
              instruction: "Choisissez la période d'analyse (semestre, année).",
            },
            {
              instruction: "Examinez les écarts entre situation initiale et situation finale par enseignant ou par discipline.",
            },
            {
              instruction: "Tirez 2 ou 3 enseignements concrets à intégrer à votre prochain plan d'action.",
            },
          ],
        },
        {
          title: "6.3 Exporter les données pour vos rapports d'accompagnement",
          body: "Les exports permettent de réutiliser les données dans un rapport présentiel ou un compte rendu d'antenne. Respectez la confidentialité : un export contenant des noms d'enseignants ne se diffuse qu'au sein du circuit professionnel autorisé.",
          steps: [
            {
              instruction: "Sur la page concernée (Performance enseignants, Efficacité pédagogique, Rapports d'antennes), appliquez les filtres souhaités.",
            },
            {
              instruction: "Utilisez le bouton d'export (en haut à droite de la liste) pour générer le fichier.",
            },
            {
              instruction: "Vérifiez le contenu avant tout partage : retirez les colonnes nominatives si elles ne sont pas indispensables.",
              warning: "Tout fichier exporté sort du périmètre tracé d'EduWeb : conservez-le dans un espace professionnel sécurisé et supprimez-le une fois exploité.",
            },
          ],
        },
      ],
    },
    {
      id: "deontologie-securite",
      title: "7. Déontologie, confidentialité et bonnes habitudes",
      intro: "Le conseiller pédagogique manipule des données sensibles : évaluations, observations nominatives, recommandations. Ce chapitre rappelle les règles d'usage qui protègent enseignants et accompagnateurs.",
      sections: [
        {
          title: "7.1 Confidentialité des observations et grilles",
          body: "Les grilles d'évaluation et rapports d'inspection sont des documents professionnels confidentiels. Leur diffusion est strictement limitée au circuit hiérarchique et à l'enseignant concerné. Toute fuite expose votre responsabilité personnelle et celle de l'antenne.",
          bestPractices: [
            "Ne projetez jamais une grille nominative en réunion plénière.",
            "Anonymisez les exemples utilisés en formation de pairs.",
          ],
          caveat: "L'usage des données à des fins autres que l'accompagnement (notation administrative, mesures disciplinaires) doit être validé par la hiérarchie.",
        },
        {
          title: "7.2 Hygiène numérique du compte",
          body: "Une session active sur un poste partagé est une porte ouverte sur des données nominatives. Quelques gestes simples permettent de réduire considérablement le risque.",
          steps: [
            {
              instruction: "Déconnectez-vous systématiquement en fin de séance, surtout sur un poste mutualisé.",
              navigation: "Menu utilisateur → Déconnexion",
            },
            {
              instruction: "Changez de mot de passe au moindre doute (perte d'appareil, suspicion d'accès).",
            },
            {
              instruction: "Signalez à votre administrateur APFC tout dysfonctionnement ou accès anormal.",
            },
          ],
        },
        {
          title: "7.3 Posture professionnelle dans les échanges écrits",
          body: "Les messages envoyés via EduWeb constituent une trace pérenne. Une formulation maîtrisée renforce la qualité du dialogue et protège chacun en cas de relecture ultérieure.",
          bestPractices: [
            "Relisez chaque message avant envoi, en vous demandant comment il serait perçu hors contexte.",
            "Préférez l'écoute en rendez-vous à un long échange écrit dès qu'un désaccord apparaît.",
          ],
        },
      ],
    },
    {
      id: "centre-formation",
      title: "8. Centre de formation",
      intro: "Le Centre de formation est la bibliothèque de formation d'EduWeb Planner : séminaires interactifs, manuel académique et guides utilisateurs par rôle. Pour le conseiller pédagogique, c'est un double levier : vous y montez vous-même en compétences comme apprenant, et vous pouvez accompagner les enseignants dans leur propre parcours, voire animer une formation comme enseignant ou tuteur.",
      sections: [
        {
          title: "8.1 Accéder au Centre de formation",
          body: "Le Centre de formation se rejoint depuis l'accueil, via la rubrique Aide. Vous y trouvez les séminaires interactifs, le manuel académique et les guides utilisateurs par rôle. L'accès à une formation donnée suppose une inscription : certaines ressources (manuel, guides) vous sont ouvertes automatiquement selon votre rôle, tandis que les séminaires requièrent une inscription nominative réalisée par un administrateur ou un gestionnaire.",
          steps: [
            {
              instruction: "Ouvrez le Centre de formation depuis le menu Accueil.",
              navigation: "Menu Accueil → Aide",
            },
            {
              instruction: "Repérez les trois familles de ressources : séminaires interactifs, manuel académique et guides utilisateurs.",
            },
            {
              instruction: "Vérifiez les formations auxquelles vous êtes inscrit ; si un séminaire visé n'apparaît pas, sollicitez une inscription auprès de votre administrateur ou gestionnaire.",
              tip: "Le manuel académique et les guides par rôle sont en général accessibles sans démarche : commencez par eux pour situer votre périmètre avant d'aborder les séminaires.",
            },
          ],
          bestPractices: [
            "Planifiez vos sessions de formation comme un rendez-vous : réservez un créneau dédié plutôt que de fractionner un séminaire entre deux tâches.",
            "Repérez les formations utiles à vos enseignants accompagnés pour pouvoir les orienter vers la bonne ressource.",
          ],
        },
        {
          title: "8.2 Suivre un séminaire interactif comme apprenant",
          body: "Trois séminaires interactifs sont disponibles : « Magnifica Humanitas », « Le numérique au service de la communication éducative et pastorale » (SENEC) et « L'intelligence artificielle au service de la communication éducative et pastorale » (SENEC, 2 h 30). Chaque séminaire se présente en mode « livre numérique » paginé, avec un sommaire et une navigation au clavier (flèches ← et → pour tourner les pages, touche F pour le plein écran). Il combine des diapositives, des ateliers auto-corrigés, un livret imprimable et un export Word, et débouche sur un certificat de fin.",
          steps: [
            {
              instruction: "Depuis le Centre de formation, ouvrez le séminaire qui vous a été attribué.",
              navigation: "Menu Accueil → Aide → Séminaires interactifs",
            },
            {
              instruction: "Parcourez les diapositives dans la visionneuse ePub ; au besoin, téléchargez le support PowerPoint ou activez la lecture audio des pages et des consignes.",
              tip: "Naviguez au clavier : ← et → pour changer de page, F pour passer en plein écran, et utilisez le sommaire pour revenir directement à une partie.",
            },
            {
              instruction: "Réalisez les ateliers interactifs auto-corrigés au fil des pages : diagnostic de maturité, QCM, matrice ou check-list, scénario, correction d'un message généré par IA, puis auto-évaluation finale avec bilan.",
            },
            {
              instruction: "Téléchargez le livret académique imprimable (PDF via Ctrl+P) et, si besoin, l'export Word (.docx) pour conserver une trace hors-ligne.",
            },
            {
              instruction: "Terminez le parcours pour obtenir votre certificat de fin de formation.",
              warning: "Le certificat n'est délivré qu'au terme complet du séminaire : ne quittez pas avant l'auto-évaluation finale et son bilan.",
            },
          ],
          bestPractices: [
            "Conservez le livret PDF et le certificat dans votre espace professionnel : ils documentent votre formation continue.",
            "Réutilisez les ateliers (diagnostic, check-list) comme supports concrets lors de vos entretiens d'accompagnement avec les enseignants.",
          ],
        },
        {
          title: "8.3 Accompagner et animer : les rôles de formation",
          body: "Les espaces de formation possèdent leurs propres rôles, attribués PAR INSCRIPTION et indépendants de votre rôle dans l'application : un même utilisateur peut être étudiant sur une formation et enseignant sur une autre. Par ordre décroissant : l'Admin a le contrôle total (contenu, participants, rôles, validation, certificats) ; le Gestionnaire gère participants et cohortes, attribue les rôles jusqu'à enseignant/tuteur et valide la réussite ; l'Enseignant anime, consulte et critique les productions des apprenants, publie ses appréciations, valide la réussite et délivre les certificats ; le Tuteur accompagne, consulte et critique les productions et publie ses retours mais ne valide pas la réussite ; l'Étudiant (apprenant) accède à la formation, réalise les activités et soumet ses productions. En tant que conseiller pédagogique, vous êtes le plus souvent apprenant, mais vous pouvez être inscrit comme enseignant ou tuteur pour animer une formation auprès des enseignants que vous accompagnez.",
          steps: [
            {
              instruction: "Identifiez votre rôle sur chaque formation : il dépend de votre inscription, pas de votre profil applicatif.",
            },
            {
              instruction: "Comme tuteur, consultez et critiquez les productions des apprenants, puis publiez vos retours pour nourrir leur progression.",
              tip: "La posture de tuteur prolonge naturellement votre rôle d'accompagnement : retours réguliers et critique constructive, sans enjeu de validation.",
            },
            {
              instruction: "Comme enseignant, en plus de critiquer les productions et de publier vos appréciations, validez la réussite des apprenants et délivrez les certificats.",
              warning: "Seuls l'enseignant, le gestionnaire et l'admin valident la réussite : un tuteur accompagne et commente mais ne clôt pas le parcours.",
            },
          ],
          bestPractices: [
            "Articulez votre rôle de formation avec votre suivi de terrain : un atelier animé en séminaire peut prolonger une recommandation d'inspection.",
            "Lorsque vous animez, restituez aux apprenants des retours appuyés sur leurs productions réelles plutôt que sur des principes généraux.",
          ],
        },
        {
          title: "8.4 Gérer les inscriptions aux formations",
          body: "L'accès à une formation passe par une inscription. Elle est réalisée par un administrateur ou un gestionnaire, de façon nominative, par cohorte ou par import CSV d'adresses e-mail ; certaines ressources (manuel, guides) sont ouvertes automatiquement selon le rôle. Si vous disposez d'un profil habilité, la gestion des inscriptions et des rôles se fait dans Système → Inscriptions aux formations.",
          steps: [
            {
              instruction: "Ouvrez la page de gestion des inscriptions (profils habilités uniquement).",
              navigation: "Menu Système → Inscriptions aux formations",
            },
            {
              instruction: "Recherchez un utilisateur par nom, e-mail ou rôle.",
            },
            {
              instruction: "Inscrivez les stagiaires comme étudiants et, le cas échéant, les collaborateurs comme enseignants ou tuteurs ; pour un groupe, utilisez l'inscription par cohorte ou l'import CSV d'adresses e-mail.",
              tip: "L'import CSV accélère l'ouverture d'un séminaire à toute une promotion : préparez un fichier d'adresses e-mail propre avant de lancer l'opération.",
            },
          ],
          caveat: "Si vous n'avez pas de profil habilité, vous ne gérez pas les inscriptions : adressez vos demandes (inscrire un enseignant, ouvrir un séminaire) à votre administrateur ou gestionnaire de formation.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Je ne vois pas certains enseignants attendus dans le module Cahier de texte : que faire ?",
      answer: "Votre périmètre est défini par l'administrateur de l'antenne : seuls les enseignants rattachés à votre zone et à vos disciplines apparaissent. Vérifiez d'abord les filtres appliqués (établissement, classe, discipline). Si l'absence persiste, contactez votre chef d'antenne pour ajuster votre périmètre.",
    },
    {
      question: "Puis-je modifier une grille d'évaluation déjà saisie par un inspecteur ?",
      answer: "Non. La grille relève de l'inspecteur qui l'a rédigée. Le conseiller pédagogique en est lecteur. Si vous identifiez une erreur factuelle, signalez-la par message à l'inspecteur ou à votre chef d'antenne.",
    },
    {
      question: "Comment savoir si un enseignant a bien lu mon message ?",
      answer: "Le module Communication affiche un accusé de lecture une fois le message ouvert par le destinataire. Patientez ; un message non lu sous 48 h peut justifier un rappel ou un changement de canal.",
    },
    {
      question: "Que faire si une recommandation reste ouverte au-delà de son échéance ?",
      answer: "Documentez la cause du retard dans un commentaire daté, puis ajustez l'échéance après échange avec l'enseignant et, si nécessaire, le chef d'établissement. Évitez de clôturer artificiellement : la traçabilité prime sur l'apparence.",
    },
    {
      question: "Puis-je exporter une liste nominative d'enseignants pour ma réunion d'antenne ?",
      answer: "Techniquement oui, mais déontologiquement avec prudence. Privilégiez les exports agrégés (par discipline, par cycle). Si une liste nominative est indispensable, conservez-la dans un espace professionnel sécurisé et supprimez-la après usage.",
    },
    {
      question: "Comment articuler ma vue d'ensemble et celle du chef d'établissement ?",
      answer: "La vue d'ensemble du conseiller est orientée accompagnement (recommandations, visites, efficacité pédagogique). Celle du chef d'établissement intègre la vie scolaire au sens large. Lors d'un entretien commun, partez des indicateurs partagés pour éviter les redondances.",
    },
    {
      question: "Le rapport antennes pédagogiques contredit ma perception du terrain : que faire ?",
      answer: "Les indicateurs reflètent ce qui a été saisi. Si l'écart vous semble important, vérifiez d'abord la complétude des saisies (rendez-vous, suivis, recommandations) avant de questionner la méthode de calcul auprès de votre chef d'antenne.",
    },
    {
      question: "Puis-je prendre un rendez-vous avec un enseignant qui ne relève pas de mon périmètre ?",
      answer: "Non, en règle générale. Le module Rendez-vous est calé sur votre périmètre d'intervention. Toute extension exceptionnelle doit être validée par votre chef d'antenne pour rester traçable.",
    },
    {
      question: "Que faire si je constate une donnée incorrecte sur la fiche d'un enseignant ?",
      answer: "Vous ne modifiez pas la fiche identifiante de l'enseignant. Signalez l'erreur par message au chef d'établissement ou à votre administrateur, en précisant la donnée concernée et la correction attendue.",
    },
    {
      question: "Comment préparer efficacement un entretien de restitution après une inspection ?",
      answer: "Relisez le rapport d'inspection et la grille d'évaluation, isolez 2 forces et 2 axes de progrès, puis consultez le cahier de texte pour ancrer vos propos sur des séances réelles. Programmez le rendez-vous dans le module dédié pour que la trace existe.",
    },
    {
      question: "Je veux suivre un séminaire interactif mais il n'apparaît pas dans le Centre de formation : pourquoi ?",
      answer: "L'accès à un séminaire requiert une inscription. Le manuel académique et les guides par rôle vous sont ouverts automatiquement, mais les séminaires interactifs (« Magnifica Humanitas », les deux séminaires SENEC sur le numérique et l'IA) doivent vous être attribués nominativement, par cohorte ou par import CSV par un administrateur ou un gestionnaire. Sollicitez votre administrateur ou gestionnaire de formation pour être inscrit. Accès : Menu Accueil → Aide.",
    },
    {
      question: "Mon rôle d'apprenant sur un séminaire m'empêche-t-il d'en animer un autre comme enseignant ?",
      answer: "Non. Les rôles de formation sont attribués par inscription et propres à chaque formation : vous pouvez être étudiant sur l'un et enseignant ou tuteur sur un autre. Comme tuteur, vous consultez, critiquez les productions et publiez vos retours sans valider la réussite ; comme enseignant, vous validez en plus la réussite et délivrez les certificats. La gestion de ces rôles se fait dans Système → Inscriptions aux formations, pour les profils habilités.",
    },
  ],
  glossary: [
    {
      term: "Conseiller pédagogique",
      definition: "Professionnel rattaché à une APFC, chargé d'accompagner les enseignants dans l'amélioration continue de leurs pratiques par la visite, le mentorat et la formation continue.",
    },
    {
      term: "Plan d'accompagnement",
      definition: "Ensemble structuré d'actions (visites, entretiens, ressources, formations) construit à partir des recommandations d'inspection et des constats du conseiller pédagogique.",
    },
    {
      term: "Visite de classe",
      definition: "Observation directe d'une séance d'enseignement, formalisée par une grille et débouchant sur un entretien de restitution avec l'enseignant concerné.",
    },
    {
      term: "Entretien de restitution",
      definition: "Rencontre individuelle entre conseiller pédagogique et enseignant, faisant suite à une visite ou à un rapport, pour partager les constats et définir les axes de progrès.",
    },
    {
      term: "Mentorat",
      definition: "Posture d'accompagnement de moyen terme, fondée sur la confiance et la régularité des échanges, qui dépasse la simple inspection ponctuelle.",
    },
    {
      term: "Axe de progrès",
      definition: "Dimension de la pratique enseignante identifiée comme prioritaire pour l'amélioration, exprimée en termes opérationnels et mesurables.",
    },
    {
      term: "Périmètre d'intervention",
      definition: "Ensemble des établissements, classes et enseignants pour lesquels le conseiller pédagogique a accès aux données et est habilité à intervenir.",
    },
    {
      term: "Bilan de mi-parcours",
      definition: "Point d'étape programmé à mi-chemin d'une recommandation longue, permettant de vérifier l'avancement et d'ajuster le plan d'accompagnement.",
    },
    {
      term: "Indicateur d'efficacité",
      definition: "Donnée chiffrée traduisant l'effet observable d'une action d'accompagnement, mobilisée dans la page Efficacité pédagogique.",
    },
    {
      term: "Trace pédagogique",
      definition: "Élément documentaire (commentaire, livrable, rapport) qui matérialise une action d'accompagnement dans EduWeb et la rend opposable.",
    },
    {
      term: "Chef d'antenne",
      definition: "Responsable hiérarchique direct du conseiller pédagogique au sein de l'APFC, qui coordonne l'activité de l'antenne et son périmètre d'intervention.",
    },
    {
      term: "Conseil de progrès",
      definition: "Recommandation formalisée par le conseiller pédagogique à l'issue d'un entretien, qui peut être tracée comme suivi parallèlement aux recommandations d'inspection.",
    },
    {
      term: "Séminaire interactif",
      definition: "Formation du Centre de formation présentée en mode « livre numérique » paginé (sommaire, navigation au clavier), combinant diapositives, ateliers auto-corrigés, livret imprimable et export Word, et débouchant sur un certificat de fin.",
    },
    {
      term: "Rôle de formation",
      definition: "Rôle propre aux espaces de formation (Admin, Gestionnaire, Enseignant, Tuteur, Étudiant), attribué par inscription et indépendant du rôle applicatif : un même utilisateur peut être étudiant sur une formation et enseignant ou tuteur sur une autre.",
    },
  ],
};
