import type { GuideContent } from "@/components/guides/guide-layout";

export const guideEducateur: Omit<GuideContent, "icon"> = {
  roleKey: "educateur",
  roleLabel: "Éducateur",
  meta: {
    context: "Formation initiale et continue des éducateurs et surveillants prenant en main EduWeb Planner pour la gestion de la vie scolaire (absences, retards, discipline, communication familles).",
    duration: "60 min",
    level: "Débutant",
    targetAudience: "Éducateurs, surveillants, conseillers principaux d'éducation et personnels de vie scolaire intervenant en primaire ou en secondaire.",
  },
  objectives: [
    "Être capable de se connecter à EduWeb Planner et d'exploiter le tableau de bord Accueil dans son rôle Éducateur.",
    "Savoir consulter l'emploi du temps d'une classe et localiser une séance ou un enseignant.",
    "Être capable de tenir le Registre d'appel : saisir présences, absences, retards et justificatifs.",
    "Comprendre comment consigner une observation de conduite proportionnée et conforme à la réglementation.",
    "Savoir exploiter le livret scolaire et le cahier de texte pour préparer entretiens et conseils.",
    "Être capable de communiquer avec parents et enseignants via la messagerie interne et les alertes SMS.",
    "Savoir planifier un rendez-vous de suivi et en rédiger le compte-rendu.",
    "Comprendre comment lire les statistiques Par classe pour piloter l'assiduité et la conduite.",
  ],
  prerequisites: [
    "Disposer d'un compte EduWeb Planner avec le rôle Éducateur activé par l'administrateur de l'établissement.",
    "Être affecté à au moins une classe ou un niveau dans la base de l'établissement.",
    "Maîtriser la navigation web de base (onglets, menu, filtres) et disposer d'un poste connecté à Internet.",
    "Connaître le règlement intérieur de l'établissement, notamment les règles d'assiduité et de discipline.",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Prise en main de l'espace Éducateur",
      intro: "Avant d'intervenir sur la vie scolaire, l'éducateur doit maîtriser son espace de travail dans EduWeb Planner. Ce chapitre pose les fondations : connexion sécurisée, lecture du tableau de bord et personnalisation du profil.",
      sections: [
        {
          title: "Se connecter à la plateforme",
          body: "L'accès à EduWeb Planner est nominatif et tracé : chaque action (saisie d'absence, observation disciplinaire, envoi de SMS) est rattachée à votre identité. Une connexion personnelle est donc impérative, jamais partagée avec un collègue.",
          steps: [
            {
              instruction: "Ouvrez le navigateur sur l'URL fournie par votre établissement.",
              navigation: "Page d'accueil publique",
            },
            {
              instruction: "Cliquez sur le bouton Connexion situé en haut à droite de l'écran.",
            },
            {
              instruction: "Saisissez votre identifiant professionnel et votre mot de passe.",
              tip: "Conservez ces informations en lieu sûr ; ne les notez pas sur un support visible des élèves.",
            },
            {
              instruction: "Validez ; vous êtes redirigé vers la page Accueil correspondant à votre rôle Éducateur.",
              warning: "Après trois échecs consécutifs, le compte peut être bloqué temporairement. Contactez l'administrateur.",
            },
          ],
          bestPractices: [
            "Déconnectez-vous systématiquement en fin de service, surtout sur un poste partagé en salle des éducateurs.",
            "Changez votre mot de passe à la première connexion et tous les six mois.",
          ],
        },
        {
          title: "Lire le tableau de bord Accueil",
          body: "La page Accueil regroupe les informations utiles à votre journée : classes dont vous avez la charge, alertes en attente, séances du jour et raccourcis vers les modules les plus utilisés. Elle constitue votre point de départ quotidien.",
          steps: [
            {
              instruction: "Repérez la zone Mes classes : elle liste les groupes que vous suivez.",
            },
            {
              instruction: "Consultez les notifications de vie scolaire (absences non justifiées, retards, alertes SMS en attente).",
            },
            {
              instruction: "Utilisez les raccourcis vers le Registre d'appel et le module Communication.",
            },
          ],
        },
        {
          title: "Vérifier son identification et son profil",
          body: "Les pages Mon Identification et Mon Profil permettent de contrôler que vos informations administratives sont exactes : nom, fonction, établissement de rattachement, coordonnées. Une fiche à jour fiabilise les échanges avec les familles et les enseignants.",
          steps: [
            {
              instruction: "Ouvrez le menu utilisateur en haut à droite, puis sélectionnez Mon Profil.",
              navigation: "Menu utilisateur → Mon Profil",
            },
            {
              instruction: "Vérifiez votre photo, votre numéro de téléphone professionnel et votre adresse email.",
            },
            {
              instruction: "Allez ensuite sur Mon Identification pour contrôler vos identifiants administratifs.",
              navigation: "Menu utilisateur → Mon Identification",
            },
            {
              instruction: "Signalez toute erreur à l'administrateur ; vous ne pouvez pas modifier seul les données structurantes (fonction, affectation).",
            },
          ],
          caveat: "Vos coordonnées peuvent être communiquées aux parents pour les rendez-vous. Ne renseignez pas un numéro personnel si vous ne le souhaitez pas.",
        },
      ],
    },
    {
      id: "emplois-du-temps",
      title: "2. Consulter les emplois du temps des classes",
      intro: "L'éducateur doit savoir à tout moment où se trouve une classe : c'est la condition pour aller faire l'appel, intercepter un élève en retard ou organiser un rendez-vous avec un enseignant. Le module Emplois du temps centralise cette information.",
      sections: [
        {
          title: "Naviguer dans l'emploi du temps",
          body: "Le module présente les séances sous forme de grille hebdomadaire. Vous pouvez filtrer par classe, par enseignant ou par salle pour repérer rapidement les situations qui vous intéressent.",
          steps: [
            {
              instruction: "Ouvrez le menu Vie scolaire puis cliquez sur Emplois du temps.",
              navigation: "Vie scolaire → Emplois du temps",
            },
            {
              instruction: "Sélectionnez la classe concernée dans le filtre en haut de page.",
            },
            {
              instruction: "Choisissez la semaine à afficher avec les flèches de navigation.",
            },
            {
              instruction: "Cliquez sur une séance pour voir le détail : matière, enseignant, salle, horaire.",
            },
          ],
          bestPractices: [
            "Consultez l'emploi du temps en début de journée pour anticiper les changements de salle.",
            "Repérez les permanences et les heures sans cours : ce sont des moments à surveiller.",
          ],
        },
        {
          title: "Exploiter l'emploi du temps Par classe",
          body: "La vue Par classe, accessible depuis le menu Statistiques, vous offre une lecture synthétique de l'occupation d'un groupe : volume horaire par matière, enseignants intervenant, plages libres. Elle est utile pour préparer un entretien avec un enseignant principal.",
          steps: [
            {
              instruction: "Allez dans Statistiques → Par classe.",
              navigation: "Statistiques → Par classe",
            },
            {
              instruction: "Sélectionnez la classe à analyser.",
            },
            {
              instruction: "Consultez la répartition hebdomadaire et notez les créneaux à risque (fin de journée, samedi matin).",
            },
          ],
        },
      ],
    },
    {
      id: "registre-appel",
      title: "3. Tenir le registre d'appel",
      intro: "Le registre d'appel est le cœur du métier d'éducateur. Sa tenue rigoureuse conditionne le calcul des absences, le déclenchement des alertes SMS et le suivi disciplinaire. Chaque saisie engage l'établissement.",
      sections: [
        {
          title: "Saisir les présences d'une séance",
          body: "À chaque séance, l'enseignant ou l'éducateur enregistre la présence des élèves. En tant qu'éducateur, vous intervenez surtout pour corriger, compléter ou faire l'appel en cas d'absence du professeur.",
          steps: [
            {
              instruction: "Ouvrez Vie scolaire → Registre d'appel.",
              navigation: "Vie scolaire → Registre d'appel",
            },
            {
              instruction: "Sélectionnez la classe et la séance du jour.",
            },
            {
              instruction: "Pour chaque élève, cochez Présent, Absent ou Retard.",
            },
            {
              instruction: "Ajoutez un motif si vous en avez connaissance (maladie, convocation, raison familiale).",
            },
            {
              instruction: "Cliquez sur Enregistrer en bas de page.",
              warning: "Une saisie validée ne se modifie qu'avec une justification ; ne fermez pas la page avant l'enregistrement.",
            },
          ],
          bestPractices: [
            "Faites l'appel dans les dix premières minutes de la séance pour fiabiliser l'horodatage.",
            "Croisez avec la liste papier remise par l'enseignant en cas de doute.",
          ],
        },
        {
          title: "Gérer les retards et absences non justifiées",
          body: "Les retards et absences non justifiées appellent un traitement spécifique : information des parents, convocation éventuelle, suivi disciplinaire. Le registre permet de tracer chaque étape.",
          steps: [
            {
              instruction: "Filtrez le registre sur Absences non justifiées.",
            },
            {
              instruction: "Pour chaque élève, ouvrez la fiche d'absence.",
            },
            {
              instruction: "Consignez le contact effectué avec la famille (date, interlocuteur, mode).",
            },
            {
              instruction: "Modifiez le statut en Justifiée si un justificatif est apporté, en conservant le document numérisé si disponible.",
            },
          ],
          caveat: "Une absence requalifiée en justifiée doit reposer sur un justificatif vérifiable. Toute manipulation injustifiée engage votre responsabilité.",
        },
        {
          title: "Suivre les cumuls d'absences",
          body: "Le module affiche pour chaque élève un cumul périodique. Ce cumul sert de base aux convocations, aux signalements et au volet conduite du livret scolaire.",
          steps: [
            {
              instruction: "Ouvrez la fiche élève depuis le registre.",
            },
            {
              instruction: "Consultez l'onglet Cumul : nombre d'absences, de retards, demi-journées non justifiées.",
            },
            {
              instruction: "Déclenchez si nécessaire une alerte SMS ou un rendez-vous (voir chapitres dédiés).",
            },
          ],
        },
      ],
    },
    {
      id: "discipline-cahier",
      title: "4. Consigner discipline et observations",
      intro: "L'éducateur participe activement au suivi du climat scolaire. Encouragements, avertissements et observations doivent être saisis sans délai pour garder une trace contradictoire et exploitable.",
      sections: [
        {
          title: "Enregistrer une observation de conduite",
          body: "Les observations sont rattachées à l'élève et consultables par l'enseignant principal, le chef d'établissement et, selon la politique de l'établissement, par les parents. Elles nourrissent le livret scolaire.",
          steps: [
            {
              instruction: "Depuis le Registre d'appel, ouvrez la fiche d'un élève.",
            },
            {
              instruction: "Cliquez sur Ajouter une observation.",
            },
            {
              instruction: "Choisissez le type : encouragement, remarque, avertissement, sanction.",
            },
            {
              instruction: "Rédigez un commentaire factuel, daté, sans appréciation personnelle excessive.",
              tip: "Préférez « A perturbé la séance à trois reprises malgré rappel » à « élève insupportable ».",
            },
            {
              instruction: "Validez ; l'observation est horodatée et signée à votre nom.",
            },
          ],
          caveat: "Toute observation est susceptible d'être communiquée à la famille et conservée. Respectez les principes de proportionnalité et de neutralité (RGPD, droit de l'élève).",
        },
        {
          title: "Consulter le cahier de texte",
          body: "Le cahier de texte numérique recense les séances effectives et les devoirs donnés. L'éducateur le consulte pour vérifier qu'un élève absent rattrape bien ses travaux et pour préparer un entretien avec un enseignant.",
          steps: [
            {
              instruction: "Ouvrez Vie scolaire → Cahier de texte.",
              navigation: "Vie scolaire → Cahier de texte",
            },
            {
              instruction: "Sélectionnez la classe et la matière.",
            },
            {
              instruction: "Identifiez les devoirs et ressources de la séance manquée.",
            },
            {
              instruction: "Transmettez l'information à la famille via Communication si nécessaire.",
            },
          ],
        },
      ],
    },
    {
      id: "livret-scolaire",
      title: "5. Suivre l'élève via le livret scolaire",
      intro: "Le livret scolaire offre une vision longitudinale de l'élève : résultats, compétences, vie scolaire. L'éducateur s'en sert pour préparer les conseils de classe, les rendez-vous parents et les commissions de discipline.",
      sections: [
        {
          title: "Ouvrir un livret",
          body: "L'accès au livret est contrôlé : seuls les professionnels mandatés peuvent consulter le dossier d'un élève. Votre rôle d'éducateur vous y autorise pour les classes dont vous avez la charge.",
          steps: [
            {
              instruction: "Allez dans Vie scolaire → Livret scolaire.",
              navigation: "Vie scolaire → Livret scolaire",
            },
            {
              instruction: "Sélectionnez la classe puis l'élève concerné.",
            },
            {
              instruction: "Parcourez les onglets : identité, résultats, vie scolaire, observations.",
              tip: "Ne diffusez jamais le livret par capture d'écran ou par email externe.",
            },
          ],
        },
        {
          title: "Exploiter le livret pour un entretien",
          body: "Avant un entretien avec un parent ou un élève, préparez l'échange à partir des données du livret : tendance des résultats, fréquence des absences, observations marquantes.",
          steps: [
            {
              instruction: "Ouvrez le livret de l'élève au moins 24 h avant l'entretien.",
            },
            {
              instruction: "Notez les points factuels à aborder (sans imprimer le livret entier).",
            },
            {
              instruction: "Articulez votre échange autour de faits datés et chiffrés.",
            },
          ],
          bestPractices: [
            "Croisez livret, registre d'appel et cahier de texte avant d'avancer un constat.",
            "Restez dans le périmètre de la vie scolaire ; renvoyez aux enseignants pour les questions strictement pédagogiques.",
          ],
        },
      ],
    },
    {
      id: "communication-sms",
      title: "6. Communiquer avec familles et enseignants",
      intro: "L'éducateur est un relais d'information clé. EduWeb Planner met à votre disposition deux canaux complémentaires : la messagerie interne et les alertes SMS aux parents.",
      sections: [
        {
          title: "Utiliser la messagerie Communication",
          body: "Le module Communication permet d'échanger avec les enseignants, l'équipe de direction et les parents. Les conversations sont conservées et tracées, ce qui sécurise les échanges sensibles.",
          steps: [
            {
              instruction: "Ouvrez le module Communication depuis le menu principal.",
              navigation: "Communication",
            },
            {
              instruction: "Cliquez sur Nouveau message.",
            },
            {
              instruction: "Sélectionnez le ou les destinataires (enseignant, parent, équipe).",
            },
            {
              instruction: "Rédigez un objet explicite et un message factuel.",
            },
            {
              instruction: "Envoyez ; vérifiez l'accusé de lecture si disponible.",
            },
          ],
          bestPractices: [
            "Privilégiez la messagerie interne aux échanges privés (WhatsApp, SMS personnel) : tout est tracé et conforme RGPD.",
            "Reformulez avec courtoisie : vos messages peuvent être relus en commission.",
          ],
        },
        {
          title: "Déclencher une alerte SMS",
          body: "Les alertes SMS ciblent les parents en cas d'absence, retard répété ou incident. Elles sont rapides à émettre mais peuvent inquiéter : elles doivent rester sobres et factuelles.",
          steps: [
            {
              instruction: "Ouvrez Vie scolaire → Alertes SMS.",
              navigation: "Vie scolaire → Alertes SMS",
            },
            {
              instruction: "Choisissez le motif (absence, retard, incident, convocation).",
            },
            {
              instruction: "Sélectionnez les élèves concernés (un, plusieurs, classe entière).",
            },
            {
              instruction: "Prévisualisez le texte généré ; ajustez si nécessaire.",
            },
            {
              instruction: "Envoyez ; le journal d'envoi est consultable pour traçabilité.",
              warning: "Un SMS envoyé ne peut pas être rappelé. Relisez impérativement avant validation.",
            },
          ],
          caveat: "Les SMS ont un coût et un impact familial fort. Réservez-les aux situations qui le justifient et respectez la politique d'établissement.",
        },
      ],
    },
    {
      id: "rendez-vous-statistiques",
      title: "7. Rendez-vous et statistiques de classe",
      intro: "Le suivi disciplinaire et pédagogique s'appuie sur des rencontres planifiées et sur une analyse des tendances. EduWeb Planner intègre la prise de rendez-vous et des statistiques par classe pour outiller votre pilotage.",
      sections: [
        {
          title: "Planifier un rendez-vous",
          body: "Les rendez-vous permettent de structurer un entretien avec un parent, un élève ou un enseignant. L'agenda partagé évite les conflits d'horaires et conserve une trace de l'entretien.",
          steps: [
            {
              instruction: "Ouvrez le module Rendez-vous depuis le menu principal.",
              navigation: "Rendez-vous",
            },
            {
              instruction: "Cliquez sur Nouveau rendez-vous.",
            },
            {
              instruction: "Choisissez le type : suivi disciplinaire, pédagogique, familial.",
            },
            {
              instruction: "Sélectionnez le ou les participants et la date.",
            },
            {
              instruction: "Rédigez l'ordre du jour ; il sera visible des participants.",
            },
            {
              instruction: "Validez ; une notification est envoyée aux participants.",
            },
          ],
          bestPractices: [
            "Indiquez systématiquement un ordre du jour, même bref : il cadre l'échange et protège chacun.",
            "Renseignez un compte-rendu après l'entretien pour tracer les décisions.",
          ],
        },
        {
          title: "Analyser les statistiques Par classe",
          body: "Les statistiques agrègent assiduité et conduite par classe. Elles aident à identifier les groupes à risque, à préparer un conseil de classe ou à argumenter un projet de remédiation.",
          steps: [
            {
              instruction: "Allez dans Statistiques → Par classe.",
              navigation: "Statistiques → Par classe",
            },
            {
              instruction: "Sélectionnez la classe et la période d'analyse.",
            },
            {
              instruction: "Consultez les indicateurs : taux d'absentéisme, retards cumulés, observations disciplinaires.",
            },
            {
              instruction: "Exportez ou imprimez si nécessaire pour le conseil de classe.",
            },
          ],
          caveat: "Les statistiques sont à interpréter dans leur contexte : un pic d'absences peut s'expliquer par une épidémie ou un calendrier d'examens, pas nécessairement par un relâchement.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Que faire si je me trompe dans la saisie d'une absence après validation ?",
      answer: "Rouvrez la fiche de la séance dans le Registre d'appel, modifiez le statut de l'élève et précisez le motif de correction dans le commentaire. La modification est horodatée et tracée ; n'effacez jamais sans laisser de justification écrite.",
    },
    {
      question: "Puis-je consulter le livret scolaire d'un élève qui n'est pas dans une de mes classes ?",
      answer: "Non, votre habilitation est limitée aux classes dont vous avez la charge. Si vous avez un besoin justifié (suivi disciplinaire transversal), demandez une extension temporaire à l'administrateur.",
    },
    {
      question: "Une famille me reproche un SMS d'absence qu'elle juge erroné. Comment réagir ?",
      answer: "Ouvrez le journal d'envoi du module Alertes SMS, vérifiez l'absence dans le Registre d'appel et croisez avec le cahier de texte. Si l'erreur est confirmée, corrigez l'absence, informez la famille via la messagerie et conservez la trace de l'échange.",
    },
    {
      question: "Comment savoir si un parent a bien reçu mon message ?",
      answer: "Dans le module Communication, les messages affichent un statut (envoyé, lu) lorsque le destinataire ouvre le message. Les SMS, eux, ne disposent que d'un statut d'envoi ; relancez par téléphone si l'enjeu est urgent.",
    },
    {
      question: "Puis-je modifier une observation de conduite déjà enregistrée ?",
      answer: "Vous pouvez compléter ou nuancer une observation, mais la version initiale reste tracée pour des raisons juridiques. Ne tentez pas de réécrire l'historique : ajoutez un commentaire daté précisant le contexte.",
    },
    {
      question: "Que faire si je n'arrive pas à me connecter ?",
      answer: "Vérifiez d'abord l'adresse de la plateforme et votre connexion Internet. Si l'identifiant et le mot de passe sont corrects, utilisez la fonction de réinitialisation. Après trois échecs, contactez l'administrateur de l'établissement.",
    },
    {
      question: "Quels rendez-vous suis-je habilité à organiser ?",
      answer: "Vous pouvez planifier des rendez-vous de suivi disciplinaire ou pédagogique avec les élèves, les parents et les enseignants concernés. Les rendez-vous strictement académiques (orientation, conseil de discipline formel) relèvent de la direction.",
    },
    {
      question: "Les statistiques Par classe sont-elles mises à jour en temps réel ?",
      answer: "Oui : chaque saisie dans le Registre d'appel ou les observations alimente immédiatement les tableaux. Sur certains réseaux lents, un délai de quelques minutes peut être observé ; rafraîchissez la page si besoin.",
    },
    {
      question: "Puis-je envoyer une alerte SMS à toute une classe en une seule fois ?",
      answer: "Oui, dans le module Alertes SMS sélectionnez la classe entière. Réservez cet envoi groupé aux situations qui le justifient (incident collectif, fermeture imprévue) et évitez d'inquiéter inutilement les familles.",
    },
  ],
  glossary: [
    {
      term: "Éducateur",
      definition: "Personnel de vie scolaire chargé du suivi des présences, retards, conduite et climat de l'établissement, en lien avec les enseignants, la direction et les familles.",
    },
    {
      term: "Absence justifiée",
      definition: "Absence d'élève accompagnée d'un justificatif recevable (certificat médical, convocation, motif familial admis) et requalifiée comme telle dans le Registre d'appel.",
    },
    {
      term: "Absence non justifiée",
      definition: "Absence dont le motif n'a pas été validé. Elle entre dans les cumuls disciplinaires et peut déclencher alertes SMS, convocations et signalements.",
    },
    {
      term: "Retard",
      definition: "Arrivée d'un élève après le début de la séance, consignée séparément des absences ; un cumul de retards peut être assimilé à une absence selon la politique d'établissement.",
    },
    {
      term: "Observation de conduite",
      definition: "Note datée et signée portée au dossier de l'élève (encouragement, remarque, avertissement, sanction) et utilisée pour alimenter le livret et préparer les conseils.",
    },
    {
      term: "Alerte SMS",
      definition: "Message court envoyé automatiquement ou manuellement aux parents pour signaler une absence, un retard, un incident ou une convocation.",
    },
    {
      term: "Cumul d'absences",
      definition: "Compteur périodique du nombre d'absences et de retards d'un élève, servant de seuil de déclenchement pour alertes, convocations et mesures disciplinaires.",
    },
    {
      term: "Vie scolaire",
      definition: "Groupe de navigation regroupant les modules dédiés au suivi quotidien des élèves : Registre d'appel, Cahier de texte, Livret scolaire, Alertes SMS, Emplois du temps.",
    },
    {
      term: "Conseil de classe",
      definition: "Réunion périodique réunissant enseignants, direction et vie scolaire pour examiner les résultats et le comportement des élèves d'une classe.",
    },
    {
      term: "Convocation",
      definition: "Demande formelle de présence adressée à un parent ou un élève pour un entretien lié à un incident, une absence répétée ou un suivi disciplinaire.",
    },
    {
      term: "Journal d'envoi SMS",
      definition: "Historique horodaté des SMS émis depuis la plateforme, indiquant motif, destinataires et statut de livraison ; il sert de preuve en cas de contestation.",
    },
    {
      term: "Compte-rendu de rendez-vous",
      definition: "Synthèse écrite d'un entretien planifié dans le module Rendez-vous, attachée au dossier de l'élève et consultable selon les habilitations.",
    },
  ],
};
