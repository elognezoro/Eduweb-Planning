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
      intro: "La gestion des comptes est la mission centrale de l'administrateur système. Vous apprendrez à créer, approuver et faire évoluer les comptes pour les seize rôles, depuis l'enseignant jusqu'à l'inspecteur régional, en respectant les règles d'approbation.",
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
        {
          title: "4.4 Multi-pays : régions académiques et référentiels d'établissements",
          body: "La plateforme est multi-pays : chaque pays possède ses régions académiques et son propre référentiel d'établissements. Sélectionnez le pays à administrer via le sélecteur en haut de l'écran, puis gérez ses régions et ses établissements.",
          steps: [
            {
              instruction: "Choisissez le pays depuis le sélecteur de pays (barre du haut). Tapez le nom ou le code dans le champ de recherche pour le retrouver rapidement.",
            },
            {
              instruction: "Ouvrez la gestion des établissements.",
              navigation: "Système → Établissements",
            },
            {
              instruction: "À la création ou à l'édition d'un établissement, choisissez sa région dans la liste déroulante (DRENA, wilaya, DRE, département… selon le pays) ; vous pouvez aussi réaffecter la région d'un établissement existant.",
            },
            {
              instruction: "Cliquez sur « Gérer les régions » pour ajouter, renommer ou supprimer les régions académiques du pays actif.",
            },
            {
              instruction: "Pour charger une liste, utilisez « Importer CSV » (le modèle est pré-rempli avec les régions du pays). Les établissements officiels des pays couverts se chargent déjà automatiquement dans le sélecteur d'attribution.",
            },
          ],
          bestPractices: [
            "Le panneau « Établissements installés » n'affiche que les établissements du pays sélectionné, regroupés et repliés par région académique — dépliez une région pour voir ses établissements.",
            "Pour rattacher un compte à un établissement (Comptes utilisateurs), seuls les établissements du pays de l'utilisateur sont proposés : vérifiez d'abord le pays du compte.",
          ],
          caveat: "Un établissement appartient à un pays. Si la liste paraît vide, vérifiez le pays sélectionné en haut de l'écran.",
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
        {
          title: "5.3 Convertisseur CSV : Excel → CSV avec identifiants automatiques",
          body: "Le Convertisseur CSV transforme un fichier Excel (ou CSV) d'élèves en un CSV prêt pour Moodle. Il génère automatiquement le nom d'utilisateur de connexion et l'adresse e-mail, et nomme le fichier d'après la cohorte.",
          steps: [
            {
              instruction: "Déposez le fichier Excel (.xlsx) ou CSV source.",
              navigation: "Système → Convertisseur CSV",
            },
            {
              instruction: "Indiquez si les NOM et Prénoms sont dans une seule colonne ou dans deux, puis réglez les indicateurs Pays / Établissement / Groupe (valeur fixe ou colonne du fichier).",
            },
            {
              instruction: "Configurez les colonnes de sortie : renommez-les, réordonnez-les, choisissez leur source (nom d'utilisateur auto, NOM, Prénoms, groupe, colonne du fichier, valeur fixe). Le modèle Moodle est proposé par défaut.",
            },
            {
              instruction: "Vérifiez l'aperçu, puis cliquez sur « Exporter le CSV ».",
            },
          ],
          bestPractices: [
            "Le nom d'utilisateur est généré en 10 caractères maximum et intègre un indicatif de pays, d'établissement et de groupe-classe ; en cas de doublon, un chiffre est ajouté (…1, …2).",
            "L'adresse e-mail est dérivée automatiquement du nom d'utilisateur : identifiant@eduweb.ci.",
            "Le fichier exporté porte le nom de la cohorte en majuscules (ex. CILM6A.csv).",
          ],
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
    {
      id: "centre-formation",
      title: "9. Centre de formation",
      intro: "Le Centre de formation est la bibliothèque de formation d'EduWeb Planner : séminaires interactifs, manuel académique et guides utilisateurs par rôle. En tant qu'administrateur, vous en assurez l'accès : vous inscrivez les participants, attribuez les rôles de formation, fixez les conditions d'accès aux modules et les critères de réussite, et garantissez une identité visuelle conforme pour les certificats délivrés.",
      sections: [
        {
          title: "9.1 Découvrir le Centre de formation",
          body: "Le Centre de formation se consulte depuis le menu Accueil, rubrique Aide. Il rassemble trois familles de ressources : les séminaires interactifs présentés sous forme de livre numérique paginé, le manuel académique, et les guides utilisateurs par rôle.\n\nTrois séminaires interactifs sont disponibles : « Magnifica Humanitas », « Le numérique au service de la communication éducative et pastorale » (SENEC) et « L'intelligence artificielle au service de la communication éducative et pastorale » (SENEC, 2 h 30). Chaque séminaire propose des diapositives (visionneuse ePub, support PowerPoint téléchargeable, lecture audio des pages et des consignes), des ateliers interactifs auto-corrigés (diagnostic de maturité, QCM, matrice ou check-list, scénario, correction d'un message généré par IA, auto-évaluation finale avec bilan), un livret académique imprimable, un export Word, et la délivrance d'un certificat de fin.",
          steps: [
            {
              instruction: "Ouvrez le Centre de formation depuis le menu d'accueil.",
              navigation: "Accueil → Aide",
            },
            {
              instruction: "Repérez les trois familles de ressources : séminaires interactifs, manuel académique et guides utilisateurs.",
            },
            {
              instruction: "Ouvrez un séminaire pour le parcourir en mode livre numérique : naviguez au clavier avec les flèches gauche et droite, la touche F pour le plein écran, et le sommaire pour accéder directement à une partie.",
              tip: "La lecture audio des pages et des consignes facilite l'accessibilité et le suivi à distance.",
            },
            {
              instruction: "Depuis un séminaire, imprimez le livret académique en PDF avec Ctrl+P ou téléchargez l'export Word (.docx) pour un usage hors ligne.",
            },
          ],
          bestPractices: [
            "Parcourez vous-même chaque séminaire avant d'y inscrire des participants, afin de pouvoir les accompagner.",
            "Signalez aux apprenants la navigation au clavier (flèches, F, sommaire) pour fluidifier leur progression.",
          ],
        },
        {
          title: "9.2 Comprendre les rôles de formation",
          body: "Les rôles de formation sont propres aux espaces de formation : ils sont distincts des rôles métier de la plateforme et s'attribuent PAR INSCRIPTION. Un même utilisateur peut donc être étudiant sur une formation et enseignant sur une autre.\n\nLa hiérarchie, du plus large au plus restreint, est la suivante : l'Admin dispose du contrôle total (contenu, participants, rôles, validation, certificats) ; le Gestionnaire gère les participants et les cohortes, attribue les rôles jusqu'au niveau enseignant ou tuteur et valide la réussite ; l'Enseignant anime la formation, consulte et critique les productions des apprenants, publie ses appréciations, valide la réussite et délivre les certificats ; le Tuteur accompagne, consulte et critique les productions et publie ses retours, mais ne valide pas la réussite ; l'Étudiant (apprenant) accède à la formation, réalise les activités et soumet ses productions.",
          caveat: "Ne confondez pas un rôle de formation avec un rôle métier : un enseignant de la plateforme peut être simple étudiant sur un séminaire, et un agent administratif peut être enseignant de formation. Les habilitations se raisonnent toujours au niveau de l'inscription.",
        },
        {
          title: "9.3 Inscrire des participants à une formation",
          body: "L'accès à une formation requiert une inscription. Vous la réalisez depuis Système → Inscriptions aux formations, page réservée aux profils habilités. Vous pouvez inscrire un participant nominativement, inscrire une cohorte entière, ou importer une liste d'adresses e-mail au format CSV. Certaines ressources, comme le manuel académique et les guides, sont accessibles automatiquement selon le rôle, sans inscription manuelle.\n\nLa liste affiche les vrais comptes inscrits, et la recherche d'un utilisateur fonctionne par nom, par e-mail ou par rôle, ce qui permet de retrouver rapidement un participant ou un collaborateur.",
          steps: [
            {
              instruction: "Ouvrez la gestion des inscriptions.",
              navigation: "Système → Inscriptions aux formations",
            },
            {
              instruction: "Sélectionnez la formation concernée, puis ajoutez un participant par inscription rapide nominative.",
              tip: "Recherchez le compte par nom, e-mail ou rôle pour éviter les doublons.",
            },
            {
              instruction: "Pour un groupe, inscrivez une cohorte entière, ou importez un fichier CSV d'adresses e-mail.",
            },
            {
              instruction: "Vérifiez que la liste des inscrits affiche bien les comptes réels attendus.",
            },
          ],
          bestPractices: [
            "Inscrivez les stagiaires comme étudiants et les collaborateurs encadrants comme enseignants ou tuteurs, selon leur mission.",
            "Préparez le fichier CSV d'e-mails en UTF-8 et vérifiez les adresses avant l'import pour éviter les inscriptions orphelines.",
          ],
        },
        {
          title: "9.4 Attribuer les rôles de formation et fixer les conditions d'accès",
          body: "Depuis la même page Inscriptions aux formations, vous attribuez à chaque participant son rôle de formation (étudiant, tuteur, enseignant, gestionnaire, admin). Vous définissez également les conditions d'accès par module — l'ordre dans lequel diapositives et ateliers se débloquent — ainsi que les critères de réussite du cours qui conditionnent la validation et la délivrance du certificat.",
          steps: [
            {
              instruction: "Ouvrez la fiche d'un participant inscrit.",
              navigation: "Système → Inscriptions aux formations",
            },
            {
              instruction: "Attribuez le rôle de formation adapté : étudiant, tuteur, enseignant, gestionnaire ou admin.",
            },
            {
              instruction: "Définissez les conditions d'accès par module (ordre de déblocage des diapositives et des ateliers).",
            },
            {
              instruction: "Fixez les critères de réussite du cours qui déclenchent la validation et le certificat de fin.",
              warning: "Un gestionnaire ne peut attribuer que jusqu'au niveau enseignant ou tuteur ; l'attribution du rôle admin reste de votre ressort.",
            },
          ],
          caveat: "Seuls l'enseignant, le gestionnaire et l'admin valident la réussite ; le tuteur publie des retours mais ne valide jamais. Vérifiez ce point avant de confier l'animation d'une cohorte.",
        },
        {
          title: "9.5 Garantir l'identité visuelle des certificats",
          body: "Les certificats de fin délivrés à l'issue d'un séminaire portent l'identité visuelle de l'institution. Comme pour les bulletins et le livret scolaire, le cachet et la signature doivent être correctement configurés pour produire un document officiel crédible.",
          steps: [
            {
              instruction: "Vérifiez que le logo, le cachet et la signature de la structure sont bien renseignés.",
              navigation: "Pilotage → Établissements",
            },
            {
              instruction: "Contrôlez le rendu en générant un certificat de test depuis un séminaire achevé.",
            },
            {
              instruction: "Corrigez le format ou la résolution des fichiers si le cachet ou la signature s'affichent mal.",
            },
          ],
          bestPractices: [
            "Préparez le cachet et la signature au bon format avant la première session pour éviter de régénérer des certificats.",
          ],
          caveat: "Un certificat sans cachet ni signature conformes perd sa valeur de reconnaissance. Validez le rendu avant la fin de la première cohorte.",
        },
      ],
    },
    {
      id: "transport-eleves",
      title: "Transport d'élèves",
      intro:
        "Le module Transport répond à un double besoin : sécuriser le trajet des élèves en permettant aux familles de localiser le car en temps réel, et donner à chaque établissement la maîtrise de son propre service. Trois principes le structurent. Premièrement, la position est émise par le terminal du conducteur (un simple téléphone), sans boîtier matériel ni abonnement opérateur. Deuxièmement, l'accès des familles au suivi est un service payant, dont la validité est vérifiée côté serveur — l'interface ne fait qu'afficher ce que le serveur autorise. Troisièmement, les données sont cloisonnées par établissement : c'est le principe d'isolation, qui rend la délégation à un chef d'établissement sûre. Le super-admin supervise l'ensemble et configure n'importe quel établissement ; le chef ne gère que le sien.",
      sections: [
        {
          title: "Vue d'ensemble et accès",
          body:
            "Le suivi s'appuie sur OpenStreetMap (gratuit, sans clé). Le fond de carte est toujours affiché ; les cars apparaissent sous forme de marqueurs (étiquetés par matricule) dès qu'un conducteur émet sa position pendant un créneau. Une alerte sonore « bip-bip-bip » signale l'entrée en créneau.\n\nLa notion de créneau est centrale : un car n'émet et n'apparaît que pendant les fenêtres horaires que vous définissez (aller le matin, retour le soir). En dehors, la carte reste affichée mais sans marqueur — ce qui évite toute géolocalisation hors service.",
          example:
            "Un parent du « Lycée Moderne de Cocody », abonné et connecté, ouvre Transport à 6 h 35 : le créneau « Aller · Lun-Ven · 06:30–07:30 » est actif, le car « 1234 AB 01 » apparaît et se déplace sur la carte ; un « bip-bip-bip » l'avait prévenu à 6 h 30. À 7 h 31, hors créneau, le marqueur disparaît automatiquement.",
          steps: [
            {
              instruction: "Ouvrez le module de transport.",
              navigation: "Vie scolaire → Transport d'élèves",
            },
            {
              instruction:
                "En tant que super-admin, choisissez l'établissement à gérer dans le sélecteur « Établissement géré » (référentiel CI).",
              tip: "L'établissement choisi est enregistré dans la base au moment de la sélection ; laissez vide pour le périmètre « Général ».",
            },
          ],
          bestPractices: [
            "Installez d'abord l'établissement depuis le référentiel (Système → Établissements) : il devient sélectionnable ici.",
            "Renseignez le centre de la carte sur la ville desservie pour un cadrage immédiat, même sans car en ligne.",
          ],
        },
        {
          title: "Configurer le service d'un établissement",
          body:
            "Dans le bloc « Configuration (administrateur) », vous réglez successivement la tarification, le centre de carte, les véhicules puis les créneaux du périmètre sélectionné. L'ordre ci-dessous garantit qu'aucun élément ne manque à la mise en service.",
          steps: [
            {
              instruction:
                "Renseignez le tarif mensuel et le tarif annuel (en FCFA) ainsi que la pénalité d'upgrade (en %).",
              navigation: "Transport → Configuration (administrateur) → Tarifs",
              tip: "Le tarif annuel doit être inférieur à douze mensualités pour rester attractif ; la pénalité d'upgrade (déf. 20 %) protège ceux qui s'engagent à l'année.",
            },
            {
              instruction:
                "Définissez la périodicité du bip (en minutes) et le centre de la carte (latitude / longitude), puis enregistrez les réglages.",
              tip: "Pour Abidjan-Cocody, un centre proche de 5.35 / -3.99 cadre bien la carte dès l'ouverture.",
            },
            {
              instruction:
                "Ajoutez chaque car par son matricule (un terminal émetteur = un car), avec un libellé facultatif.",
              navigation: "Configuration → Cars / terminaux",
            },
            {
              instruction:
                "Créez les créneaux d'émission : sens (aller / retour), jours de la semaine, heure de début et de fin.",
              navigation: "Configuration → Créneaux d'émission",
              warning:
                "Sans créneau actif à l'heure réelle, aucun car n'émet et la carte reste vide : créez au moins un créneau couvrant la tournée.",
            },
          ],
          bestPractices: [
            "Préparez véhicules, créneaux et conducteurs avant la rentrée.",
            "Un créneau couvrant l'heure réelle est nécessaire pour que l'émission GPS démarre.",
          ],
        },
        {
          title: "Conducteurs et émission de la position",
          body:
            "Seuls les conducteurs désignés (ou l'admin) peuvent émettre une position — protection anti-usurpation. Un conducteur n'émet que pour un car de son établissement.",
          steps: [
            {
              instruction:
                "Désignez un conducteur par son e-mail dans « Conducteurs désignés » (le compte doit exister).",
            },
            {
              instruction:
                "Sur le téléphone du conducteur : Transport → « Mode conducteur » → autoriser la géolocalisation → choisir son car. La position s'émet pendant les créneaux.",
              warning:
                "La page doit rester ouverte, écran allumé ; un téléphone verrouillé interrompt l'émission.",
            },
          ],
          bestPractices: [
            "Désignez un compte conducteur dédié par car, distinct des comptes personnels du personnel.",
            "Prévoyez un support (chargeur, fixation) pour garder le téléphone du conducteur allumé pendant toute la tournée.",
          ],
        },
        {
          title: "Abonnements et paiements (Mobile Money)",
          body:
            "Le parent choisit une formule (mensuelle ou annuelle), règle par Mobile Money et saisit une référence ; vous validez le paiement, ce qui ouvre l'accès jusqu'à l'échéance.\n\nLe passage mensuel → annuel obéit à un principe d'équité : un parent qui bascule tardivement ne doit pas payer, au total, moins qu'un parent ayant souscrit l'annuel dès le départ. Le montant est donc le reste à payer vers l'annuel (les jours déjà couverts sont crédités au tarif annuel), majoré d'une pénalité paramétrable. Tout le calcul est fait côté serveur : le client ne fixe jamais le montant.",
          example:
            "Tarifs de l'établissement : 5 000 FCFA/mois, 50 000 FCFA/an, pénalité d'upgrade 20 %. Un parent abonné au mois (il lui reste 20 jours) demande l'annuel. Le serveur calcule : crédit ≈ 50 000 × 20/365 ≈ 2 740 FCFA → reste à payer = 47 260 → pénalité 20 % = 9 452 → total ≈ 56 712 FCFA. Le parent voit ce détail avant de payer ; après votre validation, son accès devient annuel (1 an).",
          steps: [
            {
              instruction:
                "Dans « Paiements en attente », confirmez ou rejetez chaque demande (le badge indique Mensuel / Annuel et les upgrades).",
              tip: "À la confirmation, l'abonnement est prolongé automatiquement (1 mois / 1 an) ; au-delà de l'échéance, l'accès se referme seul.",
            },
          ],
          caveat:
            "Le paiement Mobile Money est validé manuellement (confiance assumée) : vérifiez la référence avant de confirmer.",
        },
        {
          title: "Isolation par établissement et délégation",
          body:
            "Cars, créneaux, tarifs, conducteurs, paiements et abonnements sont strictement cloisonnés par établissement (en lecture comme en écriture). Le chef d'établissement gère uniquement le sien ; vous, super-admin, configurez n'importe lequel via le sélecteur. Pour activer un chef, rattachez son compte à son établissement (voir le chapitre suivant).\n\nLe cloisonnement est appliqué côté serveur (politiques RLS) : il ne dépend pas de l'interface et résiste donc à toute tentative de contournement par requête directe. Un parent ne voit que les cars de son établissement, et seulement s'il dispose d'un abonnement actif (le suivi en temps réel est un service payant, vérifié au niveau du serveur).",
          bestPractices: [
            "Confiez à chaque chef d'établissement la gestion de son périmètre ; n'intervenez en super-admin qu'en supervision ou en cas de besoin.",
            "Vérifiez le rattachement du chef à son établissement après chaque changement de rôle : c'est la condition de la délégation.",
          ],
          caveat:
            "Un chef d'établissement sans établissement rattaché ne voit pas le bloc de configuration : pensez à compléter le rattachement dans Comptes utilisateurs.",
        },
      ],
    },
    {
      id: "securite-etablissements",
      title: "Sécurité de session & rattachement aux établissements",
      intro:
        "Réglages transverses récents : déconnexion automatique globale, référentiel officiel des établissements de Côte d'Ivoire, et rattachement des comptes à leur établissement (qui active la délégation aux chefs d'établissement).",
      sections: [
        {
          title: "Déconnexion automatique par inactivité",
          body:
            "Vous définissez une durée d'inactivité au-delà de laquelle tout utilisateur est déconnecté automatiquement. Le réglage est global (tous les comptes, tous les appareils) et précédé d'un avertissement avec compte à rebours.",
          steps: [
            {
              instruction:
                "Activez la déconnexion auto et choisissez la durée (1 à 240 min) et le délai d'avertissement.",
              navigation: "Système → Sécurité de session",
              tip: "15 à 30 minutes conviennent pour des postes partagés en établissement.",
            },
          ],
        },
        {
          title: "Référentiel des établissements (Côte d'Ivoire)",
          body:
            "Un référentiel officiel de 2921 établissements secondaires est intégré. Installez ceux que vous exploitez : ils deviennent disponibles pour les fonctionnalités par établissement (transport, délégation…). Chaque établissement porte deux identifiants : le Code DSPS (officiel) et le Code EduWeb (CI-#####).",
          steps: [
            {
              instruction:
                "Dans le panneau « Établissements installés », recherchez un établissement (nom, code DSPS, commune, DRENA) puis cliquez « Installer ». Une saisie manuelle est possible si l'établissement n'est pas listé.",
              navigation: "Système → Établissements",
            },
          ],
        },
        {
          title: "Rattacher un compte à un établissement (délégation chef)",
          body:
            "Rattacher un compte à un établissement conditionne la gestion déléguée. Un compte au rôle « Chef d'établissement » rattaché à un établissement pourra configurer le transport de cet établissement — et de lui seul.",
          steps: [
            {
              instruction:
                "Ouvrez « Changer le rôle » sur le compte, choisissez le rôle « Chef d'établissement », sélectionnez son établissement dans la liste, puis enregistrez.",
              navigation: "Système → Comptes utilisateurs",
              tip: "Validez d'abord le compte s'il est « en attente ».",
            },
          ],
        },
        {
          title: "Inscription avec choix d'établissement",
          body:
            "À la création de compte (page d'inscription), l'utilisateur de Côte d'Ivoire peut sélectionner son établissement dans le référentiel ; il y est rattaché automatiquement dès la création, sans intervention de votre part.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Un parent paie son transport au mois puis veut passer à l'année. Est-ce possible ?",
      answer: "Oui. Depuis sa carte de transport, il choisit « Passer à la formule annuelle ». Le montant est le reste à payer vers l'annuel, majoré d'une pénalité d'équité (réglable, défaut 20 %) calculée par le serveur ; après votre validation, son accès passe à un an.",
    },
    {
      question: "Comment activer un chef d'établissement pour qu'il gère son propre transport ?",
      answer: "Dans Comptes utilisateurs, attribuez-lui le rôle « Chef d'établissement » ET rattachez-le à son établissement (préalablement installé depuis le référentiel). L'isolation garantit qu'il ne voit ni ne modifie les autres établissements.",
    },
    {
      question: "La déconnexion automatique s'applique-t-elle à tout le monde ?",
      answer: "Oui : une fois activée dans Système → Sécurité de session, elle vaut pour tous les comptes et tous les appareils. Le réglage est enregistré côté serveur.",
    },
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
    {
      question: "Comment inscrire un groupe entier de stagiaires à un séminaire de formation ?",
      answer: "Depuis Système → Inscriptions aux formations, sélectionnez la formation, puis inscrivez une cohorte entière ou importez un fichier CSV d'adresses e-mail. La liste affiche ensuite les vrais comptes inscrits ; vous pouvez retrouver un participant par nom, e-mail ou rôle.",
    },
    {
      question: "Un même utilisateur peut-il être étudiant sur une formation et enseignant sur une autre ?",
      answer: "Oui. Les rôles de formation sont attribués par inscription et sont indépendants du rôle métier de la plateforme. Un même compte peut donc être apprenant sur un séminaire et enseignant ou tuteur sur un autre.",
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
    {
      term: "Séminaire interactif",
      definition: "Ressource du Centre de formation présentée en mode livre numérique paginé, combinant diapositives (ePub, PowerPoint, audio), ateliers auto-corrigés, livret imprimable, export Word et certificat de fin.",
    },
    {
      term: "Rôle de formation",
      definition: "Habilitation propre aux espaces de formation (admin, gestionnaire, enseignant, tuteur, étudiant), attribuée par inscription et indépendante du rôle métier de la plateforme.",
    },
    {
      term: "Inscriptions aux formations",
      definition: "Page du menu Système, réservée aux profils habilités, où l'on inscrit les participants (nominativement, par cohorte ou par import CSV) et où l'on attribue les rôles de formation.",
    },
    {
      term: "Isolation par établissement (transport)",
      definition: "Cloisonnement strict, appliqué côté serveur (RLS), des données de transport — cars, créneaux, tarifs, conducteurs, paiements et abonnements — par établissement : chaque établissement ne voit et ne modifie que les siennes.",
    },
    {
      term: "Délégation chef d'établissement",
      definition: "Mécanisme par lequel un compte au rôle « Chef d'établissement », rattaché à un établissement, gère le transport de cet établissement et de lui seul. S'active en rattachant le compte à son établissement dans Comptes utilisateurs.",
    },
    {
      term: "Déconnexion automatique par inactivité",
      definition: "Réglage global (Système → Sécurité de session) déconnectant tout utilisateur après une durée d'inactivité définie, sur tous les comptes et appareils, après un avertissement avec compte à rebours.",
    },
    {
      term: "Référentiel des établissements (Côte d'Ivoire)",
      definition: "Liste officielle de 2 921 établissements secondaires intégrée à la plateforme. Chaque établissement porte un Code DSPS (officiel) et un Code EduWeb (CI-#####). On installe ceux que l'on exploite pour les rendre disponibles aux fonctionnalités par établissement.",
    },
    {
      term: "Upgrade mensuel → annuel (transport)",
      definition: "Passage d'un abonnement transport mensuel à annuel, facturé comme le reste à payer vers l'annuel (crédit des jours restants déduit) majoré d'une pénalité d'équité calculée côté serveur.",
    },
  ],
};
