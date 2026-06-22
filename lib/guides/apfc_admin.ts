import type { GuideContent } from "@/components/guides/guide-layout";

/**
 * Guide de l'Admin APFC (Antenne de la Pédagogie et de la Formation Continue).
 *
 * Style « détaillé » : cadrage théorique + encadré « Exemple concret » + procédure pas-à-pas.
 * L'APFC est une structure AUTONOME : aucun couplage avec les CAFOP ni la Vie scolaire.
 */
export const guideApfcAdmin: Omit<GuideContent, "icon"> = {
  roleKey: "apfc_admin",
  roleLabel: "Admin APFC",
  meta: {
    level: "Intermédiaire",
    duration: "50 min",
    targetAudience:
      "Administrateur d'une APFC (Antenne de la Pédagogie et de la Formation Continue) chargé du réseau d'antennes, des activités de formation continue, des indicateurs et de l'import des données.",
    context:
      "À utiliser dès la prise en main du module APFC, puis à chaque campagne de formation continue (planification, suivi, bilan annuel).",
  },
  objectives: [
    "Comprendre la mission de l'APFC dans la formation continue des enseignants et le périmètre de votre rôle.",
    "Gérer le réseau des antennes APFC (création, mise à jour, import en masse).",
    "Enregistrer et suivre les activités de formation continue par antenne et par année scolaire.",
    "Exploiter les indicateurs pour piloter la couverture et la qualité de la formation.",
    "Importer un grand nombre d'antennes via un fichier CSV conforme.",
    "Retrouver la documentation et les formations dans le Centre de formation.",
  ],
  prerequisites: [
    "Disposer d'un compte au rôle « Admin APFC » activé.",
    "Connaître la carte des antennes de votre périmètre (pays, régions, localités).",
    "Savoir préparer un fichier CSV (séparateur point-virgule).",
    "Respecter la confidentialité des données des responsables d'antenne.",
  ],
  chapters: [
    {
      id: "prise-en-main",
      title: "1. Prise en main du module APFC",
      intro:
        "L'APFC organise la formation continue des enseignants déjà en poste. Sa mission n'est pas d'enseigner aux élèves mais d'entretenir et d'élever les compétences des enseignants, au plus près du terrain, via un réseau d'antennes.",
      sections: [
        {
          title: "Comprendre votre rôle et le périmètre du module",
          body:
            "En tant qu'Admin APFC, vous administrez un réseau d'antennes réparties par pays, région et localité. Chaque antenne porte des activités de formation continue (ateliers, séminaires, journées). Le module réunit deux volets : les indicateurs (vue d'ensemble chiffrée) et les antennes APFC (le réseau et ses activités).",
          example:
            "Mme Coulibaly administre l'APFC : son réseau compte trois antennes (Abidjan, Bouaké, Korhogo). En ouvrant le module, elle voit d'abord les indicateurs — nombre d'antennes, total d'activités — avant d'entrer dans le détail d'une antenne.",
          steps: [
            {
              instruction: "Ouvrez le module APFC.",
              navigation: "Inspection & supervision → APFC",
            },
            {
              instruction:
                "Repérez les deux sections : Indicateurs (synthèse) et Antennes APFC (réseau et activités).",
              tip: "Commencez toujours par les indicateurs : ils situent l'effort de formation avant d'agir.",
            },
          ],
        },
      ],
    },
    {
      id: "antennes",
      title: "2. Le réseau des antennes",
      intro:
        "L'antenne est l'unité de base de la formation continue : c'est là que les enseignants se forment. Un réseau correctement déclaré conditionne la fiabilité de tous les indicateurs.",
      sections: [
        {
          title: "Créer et mettre à jour une antenne",
          body:
            "Chaque antenne se décrit par quatre blocs : informations générales (nom, code), localisation (pays, région, localité, adresse), contact (téléphone, email) et responsable d'antenne. Des informations complètes permettent un pilotage et une communication fiables.",
          example:
            "Pour l'« Antenne APFC d'Abidjan », vous renseignez le code, la région (Abidjan), la localité (Cocody), le téléphone, l'email et le nom du responsable. L'antenne devient alors exploitable dans les indicateurs et les activités.",
          steps: [
            {
              instruction: "Ouvrez la section Antennes APFC.",
              navigation: "APFC → Antennes APFC",
            },
            {
              instruction:
                "Cliquez sur « Nouvelle APFC », renseignez les quatre blocs (général, localisation, contact, responsable) puis enregistrez.",
            },
            {
              instruction:
                "Pour corriger une antenne, ouvrez-la en consultation puis passez en édition.",
              tip: "Tenez le responsable et le contact à jour : ce sont vos points d'entrée en cas de campagne de formation.",
            },
          ],
          bestPractices: [
            "Utilisez un code d'antenne stable et unique.",
            "Vérifiez la cohérence pays / région / localité avant d'enregistrer.",
          ],
        },
        {
          title: "Importer plusieurs antennes via CSV",
          body:
            "Pour initialiser ou actualiser un grand réseau, l'import CSV évite la saisie manuelle. Le modèle fournit l'en-tête exact attendu : respecter l'ordre des colonnes garantit un import sans erreur.",
          example:
            "Vous recevez la liste de 12 antennes d'une région. Vous téléchargez le modèle CSV, le remplissez (nom;code;pays;region;localite;adresse;telephone;email;responsable;contact_responsable), puis l'importez : les 12 antennes sont créées en une fois.",
          steps: [
            {
              instruction: "Téléchargez le modèle CSV depuis la barre d'actions.",
              navigation: "APFC → Antennes APFC → Modèle CSV",
            },
            {
              instruction:
                "Remplissez une ligne par antenne en respectant l'en-tête, puis utilisez « Importer CSV ».",
              tip: "Le séparateur est le point-virgule ; vérifiez l'aperçu avant de valider l'import.",
            },
          ],
          caveat:
            "Une colonne manquante ou décalée fausse l'import : conservez l'ordre exact des colonnes du modèle.",
        },
      ],
    },
    {
      id: "activites",
      title: "3. Activités de formation continue",
      intro:
        "Les activités sont la matière même de l'APFC : elles attestent que la formation continue a bien lieu. Les enregistrer, datées et typées, transforme l'action de terrain en données pilotables.",
      sections: [
        {
          title: "Enregistrer une activité par antenne",
          body:
            "Chaque activité est rattachée à une antenne, datée (donc rattachée à une année scolaire) et qualifiée par un type : atelier pédagogique, séminaire, journée de formation, regroupement disciplinaire ou formation continue. Le compteur d'activités d'une antenne en découle, filtrable par année scolaire.",
          example:
            "Pour l'antenne de Bouaké, vous enregistrez le 14 novembre 2025 un « Atelier pédagogique » intitulé « Évaluation par compétences ». Il s'ajoute au compteur de l'antenne pour l'année 2025-2026.",
          steps: [
            {
              instruction:
                "Ouvrez l'antenne concernée et ajoutez une activité (date, type, intitulé).",
              navigation: "APFC → Antennes APFC → (antenne) → Activités",
            },
            {
              instruction:
                "Filtrez par année scolaire pour comparer une période à l'autre.",
              tip: "Enregistrez l'activité au fil de l'eau : un suivi régulier vaut mieux qu'un rattrapage en fin d'année.",
            },
          ],
        },
      ],
    },
    {
      id: "indicateurs",
      title: "4. Indicateurs et pilotage",
      intro:
        "Piloter, c'est décider sur des faits. Les indicateurs agrègent les antennes et leurs activités pour révéler la couverture du territoire et l'intensité de la formation.",
      sections: [
        {
          title: "Lire les indicateurs du réseau",
          body:
            "La section Indicateurs synthétise le nombre d'antennes, le volume d'activités et leur répartition. Filtrée par pays et par période, elle met en évidence les zones sous-dotées en formation continue.",
          example:
            "Les indicateurs montrent que l'antenne de Korhogo n'a que 4 activités sur l'année, contre 18 à Abidjan. Vous planifiez deux séminaires supplémentaires à Korhogo pour rééquilibrer la couverture.",
          steps: [
            {
              instruction: "Ouvrez la section Indicateurs.",
              navigation: "APFC → Indicateurs",
            },
            {
              instruction:
                "Filtrez par pays et par année scolaire, puis comparez les antennes.",
              tip: "Comparez toujours à période égale pour des conclusions valides.",
            },
          ],
        },
      ],
    },
    {
      id: "supervision-connectee",
      title: "5. Délégation à un Chef d'Antenne (espace connecté)",
      intro:
        "Au-delà de la gestion d'ensemble, vous pouvez déléguer le suivi de proximité : confier une antenne à un Chef d'Antenne qui en gérera les activités, dans un espace isolé. Cette délégation se fait dans la page « Supervision APFC (connecté) ».",
      sections: [
        {
          title: "Affecter un Chef d'Antenne à une antenne",
          body:
            "Dans l'espace connecté, chaque antenne peut recevoir un Chef d'Antenne, désigné par son adresse e-mail. Une fois affecté, ce chef ne voit et ne gère QUE son antenne et ses activités : l'isolation est garantie côté serveur, pas seulement à l'écran. Le registre des antennes, lui, reste sous votre seule responsabilité.",
          example:
            "Vous créez l'« Antenne APFC de Korhogo », puis saisissez l'e-mail du compte de M. Silué et cliquez « Affecter ». Dès sa prochaine connexion, M. Silué voit uniquement l'antenne de Korhogo et peut y enregistrer ses activités — sans accès aux autres antennes.",
          steps: [
            {
              instruction: "Ouvrez la supervision connectée.",
              navigation: "Inspection & supervision → Supervision APFC (connecté)",
            },
            {
              instruction:
                "Créez ou ouvrez une antenne, saisissez l'e-mail du Chef d'Antenne puis cliquez « Affecter ».",
              tip: "Le compte du chef doit déjà exister (rôle « Chef d'Antenne APFC »). Pour retirer un chef, utilisez l'action de retrait.",
            },
          ],
          caveat:
            "La création/modification des antennes et l'affectation des chefs restent réservées à l'Admin APFC (et au super-admin). Le Chef d'Antenne ne peut pas modifier le registre ni s'auto-affecter.",
        },
      ],
    },
    {
      id: "centre-formation",
      title: "6. Centre de formation",
      intro:
        "Le Centre de formation est la bibliothèque d'accompagnement d'EduWeb Planner : séminaires interactifs, manuel académique et guides par rôle — dont le présent guide.",
      sections: [
        {
          title: "Accéder au Centre de formation et à votre guide",
          body:
            "Depuis l'Aide, vous accédez aux ressources qui vous concernent : le guide Admin APFC (celui-ci), le manuel académique et, selon vos inscriptions, les séminaires de formation. Le guide et le manuel s'ouvrent automatiquement selon votre rôle.",
          steps: [
            {
              instruction: "Ouvrez le Centre de formation.",
              navigation: "Accueil → Aide",
            },
            {
              instruction:
                "Repérez la section des guides utilisateurs et ouvrez le guide Admin APFC.",
              tip: "Gardez-le en favori : c'est votre référence pour chaque manipulation courante.",
            },
          ],
          caveat:
            "L'accès à un séminaire requiert une inscription, attribuée par un administrateur ou un gestionnaire. Le guide et le manuel restent accessibles directement selon votre rôle.",
        },
      ],
    },
  ],
  faq: [
    {
      question: "L'APFC est-elle liée aux CAFOP ou à la vie scolaire ?",
      answer:
        "Non. L'APFC est une structure autonome dédiée à la formation continue des enseignants en poste. Elle ne partage ni données ni écrans avec les CAFOP (formation initiale) ni avec la vie scolaire.",
    },
    {
      question: "Quelle est la différence entre une antenne et une activité ?",
      answer:
        "L'antenne est le lieu/structure de formation continue (avec son responsable et son contact) ; l'activité est un événement de formation daté et typé (atelier, séminaire, journée…) rattaché à une antenne.",
    },
    {
      question: "Mon import CSV échoue. Que vérifier ?",
      answer:
        "Repartez du modèle téléchargé : le séparateur doit être le point-virgule et l'ordre des colonnes (nom;code;pays;region;localite;adresse;telephone;email;responsable;contact_responsable) doit être strictement respecté.",
    },
    {
      question: "Comment repérer une zone sous-formée ?",
      answer:
        "Dans Indicateurs, filtrez par période et comparez le volume d'activités entre antennes : un écart marqué signale une zone où renforcer la formation continue.",
    },
  ],
  glossary: [
    {
      term: "APFC",
      definition:
        "Antenne de la Pédagogie et de la Formation Continue : structure de formation continue des enseignants en poste. Module autonome dans EduWeb Planner.",
    },
    {
      term: "Antenne",
      definition:
        "Unité de terrain rattachée à l'APFC, décrite par sa localisation, son contact et son responsable ; elle porte les activités de formation continue.",
    },
    {
      term: "Activité de formation continue",
      definition:
        "Événement de formation daté et typé (atelier pédagogique, séminaire, journée de formation, regroupement disciplinaire, formation continue) rattaché à une antenne.",
    },
    {
      term: "Responsable d'antenne",
      definition:
        "Personne en charge d'une antenne APFC ; point de contact pour l'organisation des activités.",
    },
    {
      term: "Année scolaire",
      definition:
        "Période de rattachement d'une activité (ex. 2025-2026), servant de base aux comparaisons dans les indicateurs.",
    },
    {
      term: "Indicateur",
      definition:
        "Mesure agrégée (nombre d'antennes, volume d'activités, répartition) servant au pilotage de la couverture et de la qualité de la formation continue.",
    },
  ],
};
