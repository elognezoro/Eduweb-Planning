import type { GuideContent } from "@/components/guides/guide-layout";

export const guideAdmin: Omit<GuideContent, "icon"> = {
  roleKey: "admin",
  roleLabel: "Administrateur Système",
  meta: {
    level: "Intermédiaire",
    duration: "60 min",
    targetAudience: "Administrateur système ou référent informatique d'une institution scolaire, en charge du paramétrage, des comptes et de la conformité d'EduWeb Planner.",
    context: "À utiliser dès la mise en service de la plateforme, lors de la prise de fonction d'un nouvel administrateur, ou en complément à chaque évolution majeure de la configuration.",
  },
  objectives: [
    "Comprendre la portée du rôle d'administrateur système et ses responsabilités",
    "Être capable de créer, approuver, désactiver et auditer les comptes utilisateurs",
    "Savoir lire la matrice des permissions et gérer les surcharges d'habilitation",
    "Configurer un établissement scolaire, un centre CAFOP et une antenne APFC",
    "Préparer et exécuter un import CSV en garantissant la qualité des données",
    "Personnaliser la charte graphique et la configuration générale de la plateforme",
    "Suivre la facturation et administrer les abonnements Académie Premium",
    "Exploiter le journal d'activité pour assurer la conformité et la sécurité",
  ],
  prerequisites: [
    "Disposer d'un compte administrateur système actif sur EduWeb Planner",
    "Connaître l'organisation de votre institution (établissements, DRENA, CAFOP, APFC concernés)",
    "Maîtriser la navigation web courante et les principes de base de la confidentialité des données",
    "Avoir accès à votre messagerie professionnelle pour réceptionner les notifications",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Prise en main de l'espace Administrateur Système",
      intro: "Ce chapitre vous prépare à utiliser EduWeb Planner avec un compte d'administrateur système. Vous découvrirez l'organisation générale de la console, la connexion sécurisée et les premiers réflexes à acquérir pour piloter la plateforme sans risque.",
      sections: [
        {
          title: "1.1 Comprendre votre rôle et ses responsabilités",
          body: "L'administrateur système dispose d'un accès complet à toutes les fonctionnalités d'EduWeb Planner. Il est responsable de la création des comptes, de la configuration des établissements, de la définition des habilitations, du suivi de la facturation et du respect de la confidentialité des données scolaires. À ce titre, chacune de vos actions est tracée dans le journal d'activité et engage l'institution.\n\nVotre périmètre couvre les sept groupes de navigation : Accueil, Pilotage, Système, Paramétrage, Vie scolaire, Inspection & supervision et Statistiques. Avant toute opération sensible, demandez-vous si elle relève bien de votre périmètre ou si elle doit être déléguée à un chef d'établissement ou à un inspecteur.",
          bestPractices: [
            "Utilisez un mot de passe long et un second facteur d'authentification si disponible.",
            "Ne partagez jamais votre compte administrateur, même temporairement.",
          ],
          caveat: "Tout compte administrateur compromis met en danger l'ensemble des données des élèves, parents et enseignants. La vigilance est une obligation, pas une option.",
        },
        {
          title: "1.2 Se connecter et identifier l'environnement",
          body: "La connexion s'effectue depuis la page d'identification. Vérifiez systématiquement le contexte pays (Côte d'Ivoire active par défaut) affiché dans l'en-tête, car il conditionne la devise de facturation et les libellés des structures (DRENA, CAFOP, APFC).",
          steps: [
            {
              instruction: "Ouvrez la plateforme et cliquez sur Connexion en haut à droite.",
              navigation: "Accueil → Connexion",
            },
            {
              instruction: "Saisissez votre identifiant professionnel et votre mot de passe.",
              tip: "Évitez d'enregistrer le mot de passe sur un poste partagé.",
            },
            {
              instruction: "Validez l'authentification puis vérifiez votre nom et votre rôle en haut à droite.",
            },
            {
              instruction: "Consultez le tableau de bord pour identifier les alertes du jour.",
              navigation: "Accueil → Tableau de bord",
            },
          ],
        },
        {
          title: "1.3 Personnaliser votre profil",
          body: "Avant d'agir sur les comptes d'autres utilisateurs, prenez le temps de compléter votre propre fiche : informations professionnelles, langue d'interface et préférences. Ces données apparaissent dans les notifications et les exports.",
          steps: [
            {
              instruction: "Ouvrez Mon identification pour vérifier vos données personnelles.",
              navigation: "Système → Mon identification",
            },
            {
              instruction: "Complétez Mon profil avec votre fonction, votre photo et votre signature numérique si nécessaire.",
              navigation: "Système → Mon profil",
            },
            {
              instruction: "Enregistrez et déconnectez-vous une fois pour vérifier la prise en compte.",
            },
          ],
        },
      ],
    },
    {
      id: "comptes-utilisateurs",
      title: "2. Gestion des comptes utilisateurs",
      intro: "La gestion des comptes est la mission centrale de l'administrateur système. Vous apprendrez à créer, approuver et faire évoluer les comptes pour les treize rôles, depuis l'enseignant jusqu'à l'inspecteur régional, en respectant les règles d'approbation.",
      sections: [
        {
          title: "2.1 Créer un compte utilisateur",
          body: "Chaque compte doit être rattaché à un rôle et, le cas échéant, à un établissement, un CAFOP ou une antenne APFC. Cette affectation détermine ses habilitations par défaut.",
          steps: [
            {
              instruction: "Ouvrez la liste des comptes.",
              navigation: "Système → Comptes utilisateurs",
            },
            {
              instruction: "Cliquez sur Nouvel utilisateur en haut à droite.",
            },
            {
              instruction: "Renseignez les nom, prénoms, courriel et numéro de téléphone.",
              tip: "Le courriel servira d'identifiant unique : préférez une adresse professionnelle.",
            },
            {
              instruction: "Sélectionnez le rôle métier dans la liste déroulante.",
            },
            {
              instruction: "Affectez l'utilisateur à son établissement, son CAFOP ou son antenne APFC selon le rôle.",
            },
            {
              instruction: "Validez : un courriel d'activation est envoyé à l'utilisateur.",
            },
          ],
          bestPractices: [
            "Saisissez les noms tels qu'ils apparaissent à l'état civil pour faciliter les rapprochements avec les listes du ministère.",
            "Évitez les doublons en recherchant l'utilisateur par courriel avant toute création.",
          ],
        },
        {
          title: "2.2 Approuver les demandes de promotion",
          body: "Lorsqu'un utilisateur sollicite un changement de rôle (par exemple un enseignant devenant chef d'établissement), une demande arrive dans la file d'attente Approbations promotions. Vous devez la valider ou la refuser après vérification documentaire.",
          steps: [
            {
              instruction: "Ouvrez la file des demandes.",
              navigation: "Système → Approbations promotions",
            },
            {
              instruction: "Cliquez sur une demande pour consulter le rôle actuel, le rôle demandé et le motif.",
            },
            {
              instruction: "Vérifiez le contexte (établissement d'affectation, ancienneté, pièces justificatives le cas échéant).",
            },
            {
              instruction: "Approuvez ou refusez en indiquant un commentaire qui sera notifié au demandeur.",
            },
          ],
          caveat: "Un refus mal motivé peut bloquer un agent dans ses missions. Indiquez toujours une raison claire et la voie de recours.",
        },
        {
          title: "2.3 Désactiver, réactiver ou supprimer un compte",
          body: "À la fin d'une affectation ou en cas de départ, désactivez le compte plutôt que de le supprimer immédiatement. La désactivation préserve la traçabilité des actions passées, indispensable au journal d'activité.",
          steps: [
            {
              instruction: "Repérez le compte dans Comptes utilisateurs.",
              navigation: "Système → Comptes utilisateurs",
            },
            {
              instruction: "Ouvrez la fiche puis cliquez sur Désactiver pour suspendre l'accès.",
            },
            {
              instruction: "Pour une suppression définitive, choisissez Supprimer après accord hiérarchique.",
              warning: "La suppression est irréversible : les contributions de l'utilisateur restent visibles mais ne peuvent plus lui être réassignées.",
            },
          ],
        },
      ],
    },
    {
      id: "roles-habilitations",
      title: "3. Niveaux d'accès, rôles et habilitations",
      intro: "EduWeb Planner s'appuie sur un modèle RBAC : chaque rôle dispose d'habilitations par défaut, complétées éventuellement par des surcharges au niveau d'un utilisateur. Vous apprendrez à lire la matrice et à intervenir sans déstabiliser le système.",
      sections: [
        {
          title: "3.1 Lire la matrice des permissions",
          body: "La matrice associe chaque rôle (lignes) à un ensemble de permissions (colonnes). Une coche signifie que la permission est accordée par défaut. C'est la référence unique pour comprendre qui peut faire quoi sur la plateforme.",
          steps: [
            {
              instruction: "Ouvrez la matrice des niveaux d'accès.",
              navigation: "Système → Niveaux d'accès",
            },
            {
              instruction: "Filtrez par module (notes, présences, inspection, etc.) pour cibler la lecture.",
            },
            {
              instruction: "Survolez une cellule pour afficher la description détaillée de la permission.",
            },
          ],
          bestPractices: [
            "Avant de modifier la matrice, exportez une copie de l'état courant pour pouvoir revenir en arrière.",
            "Documentez toute modification dans un registre interne de gouvernance.",
          ],
        },
        {
          title: "3.2 Gérer les surcharges individuelles",
          body: "Les habilitations permettent d'octroyer ou de révoquer ponctuellement une permission à un utilisateur sans modifier son rôle. Cette mécanique est utile pour une mission temporaire, par exemple confier la supervision d'un module à un enseignant référent.",
          steps: [
            {
              instruction: "Ouvrez la page Habilitations.",
              navigation: "Système → Habilitations",
            },
            {
              instruction: "Recherchez l'utilisateur concerné.",
            },
            {
              instruction: "Ajoutez la permission à accorder ou cochez Révoquer pour une permission héritée.",
            },
            {
              instruction: "Définissez une échéance et un motif, puis enregistrez.",
            },
          ],
          caveat: "Les surcharges sont des dérogations : limitez-les dans le temps et auditez-les périodiquement via le journal d'activité.",
        },
        {
          title: "3.3 Prévisualiser l'interface d'un autre rôle",
          body: "Pour vérifier qu'une configuration produit le résultat attendu, vous pouvez consulter l'application telle qu'elle apparaît à un autre rôle, sans avoir à demander un compte de test.",
          steps: [
            {
              instruction: "Ouvrez le sélecteur de rôle disponible dans la console d'administration.",
            },
            {
              instruction: "Choisissez le rôle à prévisualiser (par exemple enseignant ou parent).",
            },
            {
              instruction: "Parcourez les menus pour vérifier les accès accordés ou refusés.",
            },
            {
              instruction: "Revenez à votre rôle administrateur en quittant la prévisualisation.",
              warning: "La prévisualisation n'autorise pas d'actions destructives au nom de l'utilisateur prévisualisé.",
            },
          ],
        },
      ],
    },
    {
      id: "structures",
      title: "4. Établissements, CAFOP et antennes APFC",
      intro: "Les structures sont la colonne vertébrale de la plateforme : tous les comptes, classes, inspections et rapports y sont rattachés. Vous apprendrez à les configurer en respectant l'autonomie de chaque famille de structure.",
      sections: [
        {
          title: "4.1 Configurer un établissement scolaire",
          body: "Un établissement regroupe les classes, les enseignants, les élèves et le personnel administratif. Son rattachement à une DRENA détermine la chaîne de supervision.",
          steps: [
            {
              instruction: "Ouvrez la liste des établissements.",
              navigation: "Pilotage → Établissements",
            },
            {
              instruction: "Cliquez sur Nouvel établissement.",
            },
            {
              instruction: "Renseignez le nom officiel, le code, le type (primaire ou secondaire) et la DRENA de rattachement.",
            },
            {
              instruction: "Ajoutez le logo, le cachet et la signature pour personnaliser les bulletins et le livret scolaire.",
            },
            {
              instruction: "Enregistrez et désignez un chef d'établissement parmi les comptes existants.",
            },
          ],
          bestPractices: [
            "Préparez à l'avance les fichiers de logo, cachet et signature au bon format pour un rendu professionnel des documents officiels.",
          ],
        },
        {
          title: "4.2 Gérer les centres CAFOP",
          body: "Les centres CAFOP forment les futurs instituteurs. Ils possèdent leur propre menu autonome et ne doivent jamais être confondus avec un établissement scolaire ordinaire.",
          steps: [
            {
              instruction: "Ouvrez le module CAFOP.",
              navigation: "Pilotage → CAFOP",
            },
            {
              instruction: "Créez ou modifiez un centre avec ses promotions et son directeur.",
            },
            {
              instruction: "Affectez les comptes formateurs et élèves-maîtres aux promotions correspondantes.",
            },
          ],
        },
        {
          title: "4.3 Configurer les antennes APFC",
          body: "Les antennes APFC organisent la formation continue. Chacune est animée par un chef d'antenne et des conseillers pédagogiques rattachés à une zone géographique.",
          steps: [
            {
              instruction: "Ouvrez le module APFC.",
              navigation: "Inspection & supervision → APFC",
            },
            {
              instruction: "Créez l'antenne, sa zone de compétence et son chef d'antenne.",
            },
            {
              instruction: "Affectez les conseillers pédagogiques et associez les établissements suivis.",
            },
          ],
          caveat: "Établissements, CAFOP et APFC sont des structures autonomes : ne tentez pas d'importer un CAFOP comme s'il s'agissait d'un établissement scolaire ordinaire.",
        },
      ],
    },
    {
      id: "donnees-imports",
      title: "5. Imports en masse et qualité des données",
      intro: "L'arrivée d'une nouvelle année scolaire ou le déploiement d'une DRENA passe par des imports en masse. Vous apprendrez à préparer, contrôler et tracer ces opérations sensibles.",
      sections: [
        {
          title: "5.1 Préparer un fichier CSV",
          body: "Le convertisseur CSV permet d'importer des comptes, des élèves ou des classes. Un fichier mal préparé entraîne des doublons et des affectations erronées : la rigueur de préparation conditionne la qualité de l'import.",
          bestPractices: [
            "Utilisez le modèle proposé par la plateforme et conservez l'ordre exact des colonnes.",
            "Vérifiez l'encodage UTF-8 et l'absence de cellules fusionnées avant l'export.",
          ],
          steps: [
            {
              instruction: "Téléchargez le modèle CSV proposé.",
              navigation: "Système → Convertisseur CSV",
            },
            {
              instruction: "Remplissez le fichier dans un tableur en respectant les en-têtes.",
            },
            {
              instruction: "Enregistrez au format CSV avec séparateur point-virgule.",
            },
          ],
        },
        {
          title: "5.2 Exécuter et auditer un import",
          body: "L'import s'effectue en deux temps : une simulation, puis une exécution réelle. La simulation détecte les lignes en erreur sans modifier les données.",
          steps: [
            {
              instruction: "Déposez le fichier dans le convertisseur CSV.",
              navigation: "Système → Convertisseur CSV",
            },
            {
              instruction: "Lancez une simulation et corrigez les lignes signalées en erreur.",
            },
            {
              instruction: "Confirmez l'import définitif une fois la simulation sans erreur.",
            },
            {
              instruction: "Vérifiez les créations dans Comptes utilisateurs et dans Journal d'activité.",
            },
          ],
          caveat: "Un import en masse modifie de nombreuses données en une opération. Conservez le fichier source : il est votre seule preuve en cas de litige.",
        },
      ],
    },
    {
      id: "configuration-plateforme",
      title: "6. Configuration de la plateforme et identité visuelle",
      intro: "Avant la mise en service, ou lors d'une évolution majeure, vous fixez l'identité visuelle, les paramètres généraux et les options d'installation. Ce chapitre vous guide pour livrer une plateforme conforme à la charte de l'institution.",
      sections: [
        {
          title: "6.1 Personnaliser le thème graphique",
          body: "Le module Design & thème permet de définir les couleurs, polices et libellés conformes à votre charte. Cette personnalisation est visible par tous les utilisateurs et conditionne l'image de marque.",
          steps: [
            {
              instruction: "Ouvrez la personnalisation graphique.",
              navigation: "Paramétrage → Design & thème",
            },
            {
              instruction: "Choisissez les couleurs principales et la typographie.",
            },
            {
              instruction: "Téléversez le logo institutionnel et prévisualisez le résultat en haut à droite.",
            },
            {
              instruction: "Enregistrez pour appliquer à l'ensemble des utilisateurs.",
            },
          ],
          bestPractices: [
            "Respectez les contrastes suffisants pour les utilisateurs malvoyants.",
            "Conservez une version exportée du thème avant chaque modification importante.",
          ],
        },
        {
          title: "6.2 Configurer l'installation et les paramètres globaux",
          body: "Les pages Installation et Configuration regroupent les paramètres techniques : pays actif, devise, périodes scolaires, services intégrés (SMS, paiement). Une modification y a des conséquences sur tous les modules.",
          steps: [
            {
              instruction: "Ouvrez la page Installation pour vérifier les options techniques.",
              navigation: "Paramétrage → Installation",
            },
            {
              instruction: "Ajustez les paramètres généraux dans Configuration.",
              navigation: "Paramétrage → Configuration",
            },
            {
              instruction: "Documentez chaque changement dans un registre interne avant de valider.",
            },
          ],
          caveat: "Modifier la devise, le pays actif ou les périodes en cours d'année scolaire peut perturber la facturation et les bulletins. Planifiez ces actions hors période de production.",
        },
      ],
    },
    {
      id: "facturation-abonnements",
      title: "7. Facturation, Académie Premium et abonnements",
      intro: "EduWeb Planner s'opère en mode SaaS. L'administrateur supervise la facturation, les abonnements premium et les fonctions soumises à un palier payant.",
      sections: [
        {
          title: "7.1 Suivre la facturation",
          body: "La page Facturation centralise les factures émises, les paiements reçus et l'état des abonnements pour chaque établissement client.",
          steps: [
            {
              instruction: "Ouvrez le tableau de facturation.",
              navigation: "Système → Facturation",
            },
            {
              instruction: "Filtrez par établissement, période ou statut de paiement.",
            },
            {
              instruction: "Téléchargez les reçus PDF pour archivage comptable.",
            },
          ],
          bestPractices: [
            "Vérifiez mensuellement les paiements en attente et relancez avant la prochaine échéance.",
          ],
        },
        {
          title: "7.2 Gérer les souscriptions Académie Premium",
          body: "Le module Académie Premium contrôle l'accès à des fonctions avancées de pilotage et de formation. Vous accompagnez les souscriptions et la délivrance des reçus.",
          steps: [
            {
              instruction: "Ouvrez la page Académie Premium.",
              navigation: "Pilotage → Académie Premium",
            },
            {
              instruction: "Consultez les souscriptions actives et leur date d'échéance.",
            },
            {
              instruction: "Renouvelez ou révoquez un abonnement selon les instructions reçues.",
            },
            {
              instruction: "Téléchargez le reçu PDF associé après chaque transaction.",
            },
          ],
          caveat: "Toute révocation d'abonnement masque immédiatement les fonctionnalités premium aux utilisateurs. Informez les chefs d'établissement avant de procéder.",
        },
      ],
    },
    {
      id: "audit-supervision",
      title: "8. Audit, supervision et accompagnement transversal",
      intro: "Garant de la conformité, vous surveillez l'usage de la plateforme, accompagnez les rôles métier et vous assurez que les modules pédagogiques fonctionnent correctement.",
      sections: [
        {
          title: "8.1 Consulter le journal d'activité",
          body: "Le journal trace les actions sensibles : connexions, créations de comptes, modifications de permissions, exports, suppressions. Il constitue votre principal outil d'audit interne.",
          steps: [
            {
              instruction: "Ouvrez le journal.",
              navigation: "Système → Journal d'activité",
            },
            {
              instruction: "Filtrez par utilisateur, période ou type d'action.",
            },
            {
              instruction: "Exportez les résultats pour archivage si une enquête est demandée.",
            },
          ],
          bestPractices: [
            "Programmez une revue hebdomadaire du journal pour détecter les comportements inhabituels.",
            "Conservez les exports d'audit dans un emplacement sécurisé et à accès restreint.",
          ],
        },
        {
          title: "8.2 Superviser les modules pédagogiques",
          body: "Bien que les opérations quotidiennes soient assurées par les enseignants et les chefs d'établissement, vous gardez la main pour résoudre les incidents sur le registre d'appel, le cahier de texte, les notes et bulletins, le livret scolaire, les rendez-vous, les alertes SMS et la communication.",
          steps: [
            {
              instruction: "Accédez ponctuellement à chaque module pour valider qu'il fonctionne.",
              navigation: "Vie scolaire → Registre d'appel / Cahier de texte / Notes & bulletins / Livret scolaire",
            },
            {
              instruction: "Vérifiez l'envoi des alertes SMS et la file des messages.",
              navigation: "Vie scolaire → Alertes SMS / Communication",
            },
            {
              instruction: "Contrôlez la prise des rendez-vous et l'absence d'erreurs.",
              navigation: "Vie scolaire → Rendez-vous",
            },
          ],
        },
        {
          title: "8.3 Piloter les rapports et statistiques",
          body: "Les rapports d'établissement, d'inspection, d'antennes APFC et les modules Statistiques offrent une vision consolidée. Vous vérifiez leur cohérence et accompagnez les rôles concernés dans leur lecture.",
          steps: [
            {
              instruction: "Ouvrez les rapports clés selon les sollicitations.",
              navigation: "Pilotage → Rapport d'établissement / Rapports d'activité",
            },
            {
              instruction: "Consultez les statistiques transverses.",
              navigation: "Statistiques → Analytics / Performance enseignants / Efficacité pédagogique / Suivi recommandations",
            },
            {
              instruction: "Recoupez avec les modules Inspection : grille d'évaluation, rapports d'inspection, par classe, statistiques d'établissement, régionales, antennes pédagogiques.",
            },
          ],
          caveat: "Les statistiques exposent des données personnelles agrégées. Veillez à ne jamais diffuser ces tableaux à des tiers non habilités.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Puis-je créer un compte administrateur supplémentaire ?",
      answer: "Oui, mais avec parcimonie. Un nombre restreint d'administrateurs facilite l'audit. Justifiez chaque création et documentez-la dans le registre de gouvernance interne.",
    },
    {
      question: "Comment savoir si un utilisateur dispose réellement d'une permission donnée ?",
      answer: "Croisez la matrice des niveaux d'accès (rôle par défaut) avec la page Habilitations (surcharges individuelles). En cas de doute, utilisez la prévisualisation de rôle pour observer l'interface qu'il voit réellement.",
    },
    {
      question: "Un chef d'établissement me demande d'accéder à un module qu'il ne voit pas. Que faire ?",
      answer: "Vérifiez d'abord son rôle dans Comptes utilisateurs. Si le module relève bien de ses responsabilités, intervenez via la matrice ; sinon, accordez une habilitation temporaire avec échéance et motif.",
    },
    {
      question: "Puis-je supprimer un enseignant qui part à la retraite ?",
      answer: "Préférez la désactivation. Elle préserve l'historique des bulletins et des cahiers de texte qu'il a saisis, ce qui reste nécessaire pour les rapports d'établissement et les inspections antérieures.",
    },
    {
      question: "Comment réagir si je détecte une connexion suspecte dans le journal ?",
      answer: "Désactivez immédiatement le compte concerné, exportez les entrées du journal correspondantes, alertez votre hiérarchie et déclenchez une procédure de changement de mot de passe.",
    },
    {
      question: "Le module Académie Premium est-il obligatoire ?",
      answer: "Non. C'est un service complémentaire à souscrire. Les fonctions de base de pilotage restent accessibles sans abonnement premium.",
    },
    {
      question: "Puis-je modifier le pays actif après le démarrage de l'année scolaire ?",
      answer: "C'est techniquement possible mais déconseillé : la devise et certains libellés changent. Cette opération doit être planifiée à la fin d'un exercice et validée par la direction.",
    },
    {
      question: "Mon import CSV a généré des doublons. Comment réparer ?",
      answer: "Filtrez les comptes nouvellement créés depuis Comptes utilisateurs, désactivez les doublons puis ajustez le fichier source avant tout nouvel import. Le journal d'activité vous aide à identifier rapidement les lignes concernées.",
    },
    {
      question: "Puis-je déléguer la création de comptes à un autre rôle ?",
      answer: "Certains rôles, comme le chef d'établissement, peuvent gérer les comptes de leur périmètre via leurs habilitations propres. Vérifiez la matrice avant de retirer cette responsabilité de votre charge quotidienne.",
    },
  ],
  glossary: [
    {
      term: "Approbation de promotion",
      definition: "Procédure par laquelle l'administrateur valide ou refuse une demande de changement de rôle émise par un utilisateur.",
    },
    {
      term: "Surcharge d'habilitation",
      definition: "Permission accordée ou révoquée individuellement à un utilisateur, en dérogation de son rôle par défaut, généralement avec une échéance.",
    },
    {
      term: "Matrice des permissions",
      definition: "Tableau de référence qui associe chaque rôle à ses permissions par défaut sur l'ensemble des modules de la plateforme.",
    },
    {
      term: "Prévisualisation de rôle",
      definition: "Fonction permettant à l'administrateur d'afficher l'application telle qu'elle apparaît à un autre rôle, sans s'authentifier avec un compte de test.",
    },
    {
      term: "Convertisseur CSV",
      definition: "Outil d'import en masse acceptant un fichier CSV pour créer ou mettre à jour des comptes et structures, après une étape de simulation.",
    },
    {
      term: "Journal d'activité",
      definition: "Trace chronologique de toutes les actions sensibles effectuées sur la plateforme, utilisée à des fins d'audit et de contrôle.",
    },
    {
      term: "Académie Premium",
      definition: "Module d'abonnement payant donnant accès à des fonctionnalités avancées de pilotage et de formation, géré via le module dédié.",
    },
    {
      term: "Rattachement régional",
      definition: "Lien administratif entre un établissement et sa DRENA de tutelle, qui détermine la chaîne de supervision et la consolidation des statistiques.",
    },
    {
      term: "Installation",
      definition: "Page de paramétrage technique fixant le pays actif, les services intégrés et les options de déploiement de la plateforme.",
    },
    {
      term: "Configuration globale",
      definition: "Ensemble des paramètres généraux (périodes scolaires, libellés, options) communs à tous les modules d'EduWeb Planner.",
    },
    {
      term: "Reçu PDF",
      definition: "Document généré automatiquement par la plateforme à la suite d'une souscription Académie Premium ou d'un règlement de facture, à archiver pour la comptabilité.",
    },
    {
      term: "Désactivation de compte",
      definition: "Action réversible suspendant les accès d'un utilisateur tout en conservant l'historique de ses contributions sur la plateforme.",
    },
  ],
};
