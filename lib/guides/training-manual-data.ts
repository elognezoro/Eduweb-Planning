import type {
  ManuelSyllabus,
  ManuelAssessment,
  ManuelProgression,
} from "@/components/guides/training-manual";

/** Syllabus académique de la formation EduWeb Planner. */
export const TRAINING_SYLLABUS: ManuelSyllabus = {
  identification: {
    code: "EDUWEB-FORM-2026-01",
    intitule: "EduWeb Planner — Maîtrise des outils numériques de pilotage et de vie scolaire",
    intituleAbrege: "EduWeb Planner — Pilotage et vie scolaire",
    version: "1.0",
    dateValidite: "Du 01 septembre 2026 au 31 août 2027",
    langue: "Français (vouvoyé) — supports disponibles en 8 langues (fr, en, ar, de, sw, ru, zh, ko)",
    publicVise:
      "Cadres et personnels de l'éducation : chefs d'établissement, directeurs d'études, éducateurs, enseignants, inspecteurs pédagogiques et administratifs, conseillers pédagogiques, secrétaires de scolarité, personnels DRENA, formateurs CAFOP et APFC.",
  },
  preambule:
    "\"La transformation numérique de l'école constitue, dans la plupart des États d'Afrique francophone et au-delà, un levier reconnu de modernisation du service public éducatif. En Côte d'Ivoire, les orientations stratégiques portées par le Ministère de l'Éducation Nationale et de l'Alphabétisation (MENA) reconnaissent explicitement l'apport des systèmes d'information de gestion de l'éducation (SIGE) à la qualité du pilotage, à l'équité territoriale et à la transparence des parcours d'élèves. Les Directions Régionales de l'Éducation Nationale et de l'Alphabétisation (DRENA), les Centres d'Animation et de Formation Pédagogique (CAFOP) et les Antennes de Perfectionnement et de Formation Continue (APFC) sont appelés à diffuser des pratiques professionnelles outillées, mesurables et reproductibles dans l'ensemble du système éducatif. Au plan international, les recommandations de l'UNESCO et de l'Institut International de Planification de l'Éducation soulignent que la diffusion d'outils numériques de pilotage demeure inopérante sans accompagnement professionnel structuré des acteurs.\n\nEduWeb Planner, plateforme SaaS de pilotage scolaire déployée à l'adresse planning.eduweb.ci, s'inscrit dans cette dynamique. Conçue de manière multi-pays par configuration, elle agrège 41 modules fonctionnels couvrant la vie scolaire, l'inspection et la supervision, les statistiques, le paramétrage et l'administration système, et organise les usages selon un modèle à 13 rôles utilisateurs. Sa vocation est de donner à chaque acteur — du surveillant général au directeur régional, du secrétariat de scolarité à l'inspecteur pédagogique — un environnement de travail adapté à ses missions, sécurisé par un contrôle d'accès rigoureux, et interopérable à l'échelle nationale.\n\nLa diffusion d'un tel outil ne se réduit jamais à un déploiement technique. Elle suppose un accompagnement pédagogique structuré, conçu non comme une formation à un logiciel, mais comme une montée en compétence sur les pratiques de pilotage qu'il rend possibles. C'est l'ambition du présent syllabus : doter les acteurs de l'éducation d'une maîtrise raisonnée de la plateforme, ancrée dans la déontologie de la fonction publique, attentive à la protection des données personnelles, et résolument orientée vers l'amélioration continue de la qualité du service rendu aux élèves et à leurs familles.\n\nLa formation vise tous les acteurs concernés, dans une logique inclusive : nul n'est tenu de connaître l'intégralité de la plateforme, mais chacun doit maîtriser le périmètre fonctionnel attaché à son rôle et comprendre la place qu'il occupe dans la chaîne de valeur du pilotage scolaire. Ce parti-pris répond à un constat : la qualité d'un système d'information éducative est conditionnée par la qualité des saisies à la base, autant que par la pertinence des décisions prises à son sommet.\"",
  presentationGenerale:
    "\"La présente formation a pour finalité la professionnalisation des acteurs de l'éducation à l'usage d'EduWeb Planner, dans l'ensemble de ses dimensions fonctionnelles et déontologiques. Elle ne se limite pas à un apprentissage instrumental : elle vise à inscrire l'outil dans les pratiques professionnelles ordinaires des établissements scolaires, des structures de supervision et des autorités déconcentrées.\n\nLa philosophie pédagogique retenue est celle de l'approche par compétences, articulant savoirs, savoir-faire, savoir-être et savoir-agir. Elle privilégie une pédagogie active, ancrée dans des situations professionnelles réalistes, et organisée autour de mises en situation reproduisant fidèlement les usages cibles. Chaque séquence combine apport théorique, démonstration guidée, manipulation accompagnée et analyse réflexive.\n\nLa formation est conçue comme un parcours modulaire : 8 modules, chacun centré sur un rôle prioritaire de l'écosystème EduWeb. Les apprenants suivent un tronc commun consacré à l'architecture générale, au modèle de rôles et à la déontologie des données, puis approfondissent les modules correspondant à leurs fonctions. Cette modularité permet d'adapter le parcours aux profils des cohortes — typiquement de 15 à 30 apprenants — tout en garantissant une culture partagée des fondamentaux.\n\nL'articulation avec les pratiques professionnelles est assurée par un dispositif d'évaluation à trois niveaux — diagnostique, formatif, certificatif — et par une charte de l'apprenant explicitant les engagements déontologiques attendus. La formation prépare ainsi non seulement à l'usage technique de la plateforme, mais à son inscription durable dans la pratique quotidienne du pilotage scolaire.\"",
  objectifsGeneraux: [
    "Comprendre l'architecture fonctionnelle et organisationnelle d'EduWeb Planner ainsi que son inscription dans la politique nationale de numérisation de l'école (compétence transversale).",
    "Maîtriser les fonctionnalités essentielles de la plateforme correspondant au rôle exercé, dans le respect du périmètre d'habilitation défini par le RBAC (compétence spécifique).",
    "Mobiliser les outils statistiques et les tableaux de bord pour appuyer la prise de décision pédagogique et administrative à l'échelle de l'établissement et de la circonscription (compétence spécifique).",
    "Concevoir et produire les documents officiels de la vie scolaire (bulletins, livret scolaire, rapports d'inspection, états statistiques) conformément aux normes nationales (compétence spécifique).",
    "Évaluer la qualité, la fiabilité et la confidentialité des données traitées au sein de la plateforme (compétence transversale).",
    "Communiquer de manière professionnelle, sécurisée et conforme à la déontologie de la fonction publique, à travers les canaux offerts par la plateforme (compétence transversale).",
    "Coopérer avec les autres rôles de l'écosystème éducatif en s'appuyant sur les complémentarités fonctionnelles offertes par la plateforme (compétence transversale).",
  ],
  competencesVisees: {
    savoirs: [
      "Connaître l'architecture fonctionnelle d'EduWeb Planner (41 modules, 13 rôles, organisation multi-pays).",
      "Identifier les principes du contrôle d'accès basé sur les rôles (RBAC) et leurs implications déontologiques.",
      "Maîtriser le vocabulaire métier de la vie scolaire ivoirienne (DRENA, CAFOP, APFC, IGE, MENA) et ses équivalents internationaux.",
      "Comprendre le cadre réglementaire national régissant la gestion des données scolaires et la protection des données personnelles.",
      "Connaître les processus pédagogiques et administratifs supports : inscription, scolarité, évaluation, conseils de classe, bulletins, livret scolaire.",
      "Identifier les indicateurs clés de pilotage de la qualité scolaire (taux de réussite, taux de présence, indicateurs d'équité).",
    ],
    savoirFaire: [
      "Se connecter à la plateforme, naviguer dans son espace de travail et basculer entre les langues d'interface.",
      "Saisir, consulter, mettre à jour et exporter les données relevant de son périmètre fonctionnel.",
      "Générer les documents officiels (bulletins, livret scolaire, attestations, rapports d'inspection) avec la charte graphique du pays.",
      "Produire et interpréter des tableaux de bord statistiques au niveau classe, établissement, circonscription, direction régionale.",
      "Paramétrer un cycle scolaire, une période d'évaluation, une grille de coefficients selon le contexte de son établissement.",
      "Utiliser les fonctionnalités de communication interne (notifications, messagerie, diffusion d'avis) dans le respect du protocole.",
    ],
    savoirEtre: [
      "Faire preuve de rigueur, de discrétion et de loyauté institutionnelle dans l'exercice quotidien de la plateforme.",
      "Adopter une communication respectueuse et professionnelle vis-à-vis des familles, des élèves, des pairs et de la hiérarchie.",
      "Manifester une attitude de service public, d'équité de traitement et de neutralité dans l'usage des outils numériques.",
      "Démontrer une capacité d'autonomie, de curiosité et d'apprentissage continu face à l'évolution des fonctionnalités.",
      "Faire preuve de coopération inter-rôles, en respectant les complémentarités entre administration, supervision et vie d'établissement.",
    ],
    savoirAgir: [
      "Arbitrer entre plusieurs priorités opérationnelles en mobilisant les indicateurs fournis par la plateforme.",
      "Décider du niveau d'escalade approprié face à une anomalie pédagogique, administrative ou technique.",
      "Mettre en oeuvre les procédures de signalement, de remédiation et de traçabilité prévues par le cadre institutionnel.",
      "Conduire un conseil de classe, une revue de performance ou une mission d'inspection à partir des données issues de la plateforme.",
      "Adapter son usage de la plateforme aux contextes pluriels (zones rurales, établissements à faibles ressources, contextes multilingues).",
    ],
  },
  publicEtPrerequis:
    "\"Public visé : la formation s'adresse aux cadres et personnels de l'éducation appelés à utiliser EduWeb Planner dans le cadre de leurs missions. Sont notamment concernés les chefs d'établissement (proviseurs, principaux, directeurs d'école), les directeurs des études, les éducateurs et conseillers principaux d'éducation, les enseignants titulaires de fonctions de coordination, les inspecteurs pédagogiques et administratifs, les conseillers pédagogiques de circonscription, les personnels des secrétariats de scolarité, les agents des DRENA en charge des statistiques et du pilotage, ainsi que les formateurs des CAFOP et des APFC. La taille typique des cohortes est de 15 à 30 apprenants. Prérequis transverses : maîtrise fonctionnelle d'un ordinateur ou d'une tablette (clavier, souris, navigation web, gestion des fichiers) ; capacité à lire et rédiger en français de niveau professionnel ; familiarité avec les processus de base de la vie scolaire (inscription, évaluation, conseil de classe, bulletin) ; posture professionnelle compatible avec la manipulation de données à caractère personnel ; engagement à respecter la charte de l'apprenant. Aucun prérequis en développement informatique n'est exigé.\"",
  methodologiePedagogique: [
    {
      methode: "Cours magistral interactif",
      description:
        "Exposés cadrés sur les fondamentaux : architecture de la plateforme, modèle de rôles (RBAC), cadre réglementaire, vocabulaire métier. Appuyés sur supports visuels et schémas conceptuels.",
      proportion: "15%",
    },
    {
      methode: "Démonstration guidée",
      description:
        "Présentation pas-à-pas des parcours utilisateurs par le formateur, vidéo-projection de l'environnement réel de planning.eduweb.ci, en double affichage (formateur + apprenant).",
      proportion: "20%",
    },
    {
      methode: "Atelier pratique sur environnement de démonstration",
      description:
        "Manipulation individuelle ou en binôme sur un environnement de bac-à-sable, avec jeux de données pré-injectés représentatifs d'un établissement type.",
      proportion: "35%",
    },
    {
      methode: "Étude de cas contextualisée",
      description:
        "Analyse de situations réelles issues de DRENA, CAFOP ou APFC : conseil de classe, mission d'inspection, gestion d'incident, pilotage statistique de fin de trimestre.",
      proportion: "15%",
    },
    {
      methode: "Jeu de rôle inter-fonctions",
      description:
        "Mise en situation simulant les interactions entre rôles (chef d'établissement, inspecteur, secrétariat, vie scolaire) autour d'un scénario commun.",
      proportion: "10%",
    },
    {
      methode: "Autoformation accompagnée",
      description:
        "Travail individuel sur la base de tutoriels, fiches mémo et capsules vidéo, avec tutorat asynchrone.",
      proportion: "5%",
    },
  ],
  volumeHoraire: {
    repartitionParModule: [
      {
        moduleCode: "M01",
        titre: "Tronc commun — Architecture, rôles et déontologie des données",
        duree: "2h00",
      },
      {
        moduleCode: "M02",
        titre: "Chef d'établissement — Pilotage et tableaux de bord d'établissement",
        duree: "2h30",
      },
      {
        moduleCode: "M03",
        titre:
          "Directeur des études et conseil pédagogique — Évaluations, conseils de classe et bulletins",
        duree: "3h00",
      },
      {
        moduleCode: "M04",
        titre: "Vie scolaire et éducateur — Présences, sanctions, communication aux familles",
        duree: "2h00",
      },
      {
        moduleCode: "M05",
        titre: "Secrétariat de scolarité — Inscriptions, dossiers élèves, livret scolaire",
        duree: "2h30",
      },
      {
        moduleCode: "M06",
        titre: "Inspecteur et superviseur — Missions d'inspection et rapports",
        duree: "2h30",
      },
      {
        moduleCode: "M07",
        titre: "DRENA et pilotage territorial — Statistiques agrégées et indicateurs régionaux",
        duree: "2h30",
      },
      {
        moduleCode: "M08",
        titre: "Synthèse, mise en situation certificative et remédiation",
        duree: "3h00",
      },
    ],
    dureeTotal:
      "20h00 de formation, organisées en 8 modules, complétées par un pré-test de 30 minutes et une mise en situation certificative de 2 heures incluse dans le module M08.",
    sequencementRecommande:
      "Le module M01 est obligatoire pour tous les apprenants et constitue un préalable à tout autre module. Les modules M02 à M07 sont suivis selon le rôle exercé, avec un minimum de 3 modules de spécialité par apprenant. Le module M08 clôture le parcours et conditionne la délivrance de l'attestation. Séquencement recommandé sur 4 jours consécutifs ou sur 2 demi-journées par semaine pendant 5 semaines, afin de permettre la consolidation des acquis entre les séances.",
  },
  modalitesEvaluation: {
    diagnostique:
      "Pré-test d'entrée de 30 minutes administré en début de formation, sous la forme d'un questionnaire à choix multiples et de questions ouvertes courtes, visant à mesurer le niveau initial de maîtrise des outils numériques, du vocabulaire métier et des procédures de vie scolaire. Le pré-test n'est pas noté mais permet d'adapter la progression et de constituer des groupes de niveau homogènes.",
    formative:
      "À l'issue de chaque module, une auto-évaluation guidée d'environ 15 minutes (quiz, exercices d'application sur l'environnement de démonstration, grille d'auto-positionnement). Restitution immédiate avec feedback du formateur. Ces évaluations contribuent à hauteur indicative à la régulation pédagogique sans entrer dans la note certificative.",
    certificative:
      "Mise en situation finale individuelle de 2 heures sur l'environnement de démonstration : l'apprenant traite un scénario professionnel complet correspondant à son rôle cible (par exemple, préparation d'un conseil de classe, production d'un rapport d'inspection, paramétrage d'un cycle scolaire). Évaluation conduite à l'aide d'une grille critériée à 4 dimensions (savoirs, savoir-faire, savoir-être, savoir-agir).",
    ponderation:
      "Évaluation formative : 30 % (moyenne des 8 auto-évaluations modulaires). Mise en situation certificative : 60 %. Participation et assiduité documentée : 10 %. Note minimale exigée pour la validation : 60/100 avec note plancher de 50/100 à la mise en situation.",
  },
  criteresValidation: [
    "Seuil minimal de réussite à l'évaluation certificative : 60/100, avec une note plancher de 50/100 à la mise en situation pratique.",
    "Présence effective requise : au minimum 80 % du volume horaire total de la formation.",
    "En cas d'échec à l'évaluation certificative, organisation d'une session de remédiation individualisée de 2 heures suivie d'une nouvelle mise en situation.",
    "Délivrance d'une attestation de suivi pour les apprenants ayant satisfait à la condition d'assiduité sans valider l'évaluation certificative.",
    "Délivrance d'une attestation de réussite nominative et numérotée pour les apprenants ayant validé l'évaluation certificative.",
    "Inscription des résultats au registre de formation de l'institution organisatrice (DRENA, CAFOP ou APFC selon le cas).",
    "Possibilité de re-certification après un délai minimal de 30 jours pour les apprenants n'ayant pas atteint le seuil à l'issue de la remédiation.",
  ],
  ressourcesBibliographie: [
    {
      titre: "Plan Sectoriel Éducation/Formation 2016-2025",
      auteur: "Ministère de l'Éducation Nationale et de l'Alphabétisation (Côte d'Ivoire)",
      type: "Texte officiel",
      annee: "2017",
      editeur: "MENA — République de Côte d'Ivoire",
    },
    {
      titre:
        "Arrêté portant organisation des Directions Régionales de l'Éducation Nationale et de l'Alphabétisation",
      auteur: "Ministère de l'Éducation Nationale et de l'Alphabétisation",
      type: "Texte officiel",
      annee: "2021",
      editeur: "MENA — République de Côte d'Ivoire",
    },
    {
      titre: "Le pilotage des systèmes éducatifs : enjeux, méthodes et outils",
      auteur: "Bernard, J.-M.",
      type: "Ouvrage",
      annee: "2018",
      editeur: "Institut International de Planification de l'Éducation (UNESCO-IIPE), Paris",
    },
    {
      titre: "Mesurer pour piloter : indicateurs de qualité dans l'éducation",
      auteur: "Sall, H. N. et De Ketele, J.-M.",
      type: "Ouvrage",
      annee: "2019",
      editeur: "De Boeck Supérieur, Bruxelles",
    },
    {
      titre: "TIC et transformation de l'école en Afrique francophone",
      auteur: "Karsenti, T. et Collin, S.",
      type: "Ouvrage",
      annee: "2020",
      editeur: "Presses de l'Université Laval, Québec",
    },
    {
      titre:
        "Lignes directrices de l'UNESCO sur les politiques d'apprentissage mobile et la transformation numérique de l'école",
      auteur: "UNESCO",
      type: "Texte officiel",
      annee: "2022",
      editeur:
        "Organisation des Nations Unies pour l'Éducation, la Science et la Culture, Paris",
    },
    {
      titre:
        "Loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel",
      auteur: "République de Côte d'Ivoire",
      type: "Texte officiel",
      annee: "2013",
      editeur: "Journal officiel de la République de Côte d'Ivoire",
    },
    {
      titre: "Manuel de l'apprenant EduWeb Planner — Tronc commun",
      auteur: "Équipe pédagogique EduWeb",
      type: "Ressource interne",
      annee: "2026",
      editeur: "EduWeb, Abidjan",
    },
    {
      titre: "Guide du formateur EduWeb Planner — Parcours par rôle",
      auteur: "Équipe pédagogique EduWeb",
      type: "Ressource interne",
      annee: "2026",
      editeur: "EduWeb, Abidjan",
    },
    {
      titre:
        "Portail institutionnel du Ministère de l'Éducation Nationale et de l'Alphabétisation",
      auteur: "MENA — République de Côte d'Ivoire",
      type: "Sitographie",
      annee: "Consulté en 2026",
      editeur: "education-ci.org",
      url: "https://www.education-ci.org",
    },
    {
      titre: "Institut International de Planification de l'Éducation — Ressources sur les SIGE",
      auteur: "UNESCO-IIPE",
      type: "Sitographie",
      annee: "Consulté en 2026",
      editeur: "iiep.unesco.org",
      url: "https://www.iiep.unesco.org",
    },
    {
      titre: "Plateforme EduWeb Planner — Environnement de démonstration",
      auteur: "EduWeb",
      type: "Sitographie",
      annee: "Consulté en 2026",
      editeur: "planning.eduweb.ci",
      url: "https://planning.eduweb.ci",
    },
  ],
  charteApprenant: [
    "S'engager à respecter la confidentialité absolue des données personnelles des élèves, des familles et des personnels manipulées au cours de la formation et dans l'exercice professionnel.",
    "S'interdire toute extraction, duplication ou diffusion non autorisée de données issues de la plateforme, conformément aux dispositions nationales et internationales de protection des données.",
    "Faire preuve d'assiduité, de ponctualité et de participation active à l'ensemble des séquences présentielles et distancielles.",
    "Adopter une posture professionnelle de réserve dans les communications produites depuis la plateforme (bulletins, notifications, courriers, livret scolaire).",
    "Signaler sans délai toute anomalie technique, tout incident de sécurité ou tout usage détourné de la plateforme à la hiérarchie et à la cellule support.",
    "Respecter strictement le périmètre fonctionnel attaché à son rôle (RBAC) et s'interdire toute tentative de contournement des habilitations.",
    "Contribuer à la qualité des données saisies en vérifiant systématiquement leur exactitude, leur exhaustivité et leur cohérence avant validation.",
    "Reconnaître et respecter la propriété intellectuelle des supports de formation, des ressources pédagogiques et des contenus produits par les pairs.",
  ],
};

/** Auto-évaluations par rôle (QCM + exercices + synthèse). */
export const TRAINING_ASSESSMENTS: Record<string, ManuelAssessment> = {
  admin: {
    roleKey: "admin",
    roleLabel: "Administrateur Système",
    moduleCode: "M01",
    preTest: [
      {
        question:
          "Décrivez en une phrase votre expérience actuelle dans l'administration d'une plateforme scolaire en ligne.",
      },
      {
        question:
          "Comment définissez-vous le principe de moindre privilège dans la gestion des comptes utilisateurs ?",
      },
      {
        question:
          "Quelles informations doivent figurer dans les métadonnées d'export d'un bulletin scolaire selon vous ?",
      },
      {
        question:
          "Citez deux risques techniques majeurs lors du déploiement d'alertes SMS à grande échelle.",
      },
      {
        question:
          "Quelle procédure adoptez-vous habituellement avant une mise à jour majeure d'une plateforme en production ?",
      },
    ],
    qcm: [
      {
        question:
          "Dans EduWeb Planner, quel principe fondamental régit l'attribution des droits d'accès lors du basculement vers le mode réel ?",
        choix: [
          "Tout utilisateur non identifié bénéficie temporairement des droits administrateur démo.",
          "Le RBAC est fail-closed : aucun retour à un compte démo administrateur n'est autorisé.",
          "Les droits sont attribués automatiquement selon l'adresse IP de connexion.",
          "L'administrateur conserve un accès anonyme illimité pendant la migration.",
        ],
        bonneReponseIndex: 1,
        explication:
          "La règle RBAC fail-closed impose qu'en cas d'échec d'authentification, aucun fallback vers un utilisateur démo administrateur ne soit possible, garantissant la sécurité du système.",
      },
      {
        question:
          "Lors de la configuration d'un nouvel établissement, quelles informations sont indispensables aux métadonnées d'export des bulletins et du livret scolaire ?",
        choix: [
          "Uniquement le nom de l'établissement.",
          "Le logo, le cachet, la signature, ainsi que la devise et les armoiries du pays.",
          "Le numéro de téléphone du directeur uniquement.",
          "La liste complète des élèves de l'établissement.",
        ],
        bonneReponseIndex: 1,
        explication:
          "La fonction etabExportMeta() centralise l'identité visuelle des documents officiels : logo, cachet, signature de l'établissement et symboles nationaux (devise, armoiries).",
      },
      {
        question:
          "Un enseignant signale ne plus pouvoir accéder au cahier de texte après une mise à jour. Quelle est la première action de l'Administrateur Système ?",
        choix: [
          "Réinitialiser tous les mots de passe de l'établissement.",
          "Vérifier les journaux applicatifs et l'état du cache Turbopack (.next).",
          "Supprimer le compte de l'enseignant et le recréer.",
          "Désactiver l'Académie Premium pour l'ensemble de l'établissement.",
        ],
        bonneReponseIndex: 1,
        explication:
          "La consultation des journaux et la vérification du cache .next (problème connu sur Windows/OneDrive) constituent les premières étapes de diagnostic, conformément aux bonnes pratiques d'exploitation.",
      },
      {
        question:
          "Quelle fonctionnalité d'EduWeb Planner permet de déclencher des notifications automatiques aux parents en cas d'absence consignée dans le registre d'appel ?",
        choix: [
          "Le module de cahier de texte.",
          "Les alertes SMS configurées dans l'Académie Premium.",
          "La grille d'évaluation des compétences.",
          "Le module de prise de rendez-vous.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Les alertes SMS, fonctionnalité de l'Académie Premium, permettent d'avertir automatiquement les parents lors d'une absence saisie dans le registre d'appel.",
      },
      {
        question:
          "Concernant l'autonomie des structures (Établissements, CAFOP, APFC), quelle règle l'Administrateur Système doit-il respecter impérativement ?",
        choix: [
          "Mutualiser systématiquement les types, seeds et slices de store entre structures.",
          "Maintenir chaque structure totalement autonome : type, seed, slice de store et page dédiés, sans import croisé.",
          "Centraliser toutes les données dans le module Établissements.",
          "Désactiver le module Vie scolaire pour les CAFOP.",
        ],
        bonneReponseIndex: 1,
        explication:
          "La règle d'autonomie structurelle interdit tout import croisé : Établissements/Vie scolaire, CAFOP et APFC disposent chacun de leur propre type, seed, slice et page.",
      },
      {
        question:
          "Quel composant gère le verrouillage des fonctionnalités payantes derrière l'abonnement Académie Premium ?",
        choix: [
          "Le composant PremiumGate associé au hook usePremium.",
          "Le composant LoginForm.",
          "Le hook useTranslation.",
          "Le module de facturation uniquement.",
        ],
        bonneReponseIndex: 0,
        explication:
          "PremiumGate et le hook usePremium contrôlent l'accès aux fonctionnalités payantes en s'appuyant sur le slice subscription du store.",
      },
      {
        question:
          "Quel est l'objectif principal de la phase de pré-test diagnostique avant un déploiement d'EduWeb Planner ?",
        choix: [
          "Vendre l'abonnement Académie Premium aux familles.",
          "Mesurer le niveau initial des utilisateurs pour adapter l'accompagnement.",
          "Décider de la couleur de la charte graphique.",
          "Choisir le fournisseur de SMS.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le pré-test diagnostique sert à évaluer les compétences d'entrée afin d'ajuster la formation et l'accompagnement technique.",
      },
      {
        question:
          "Lors de l'activation du mode Supabase via isSupabaseConfigured(), quelle précaution l'Administrateur Système doit-il prendre ?",
        choix: [
          "Conserver un compte démo administrateur en secours permanent.",
          "Vérifier que le contexte applicatif ne retombe jamais sur DEMO_USER en cas d'échec d'authentification.",
          "Désactiver tous les comptes enseignants avant la migration.",
          "Forcer tous les utilisateurs à recréer leur mot de passe via SMS.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le commit d9f00bf impose que l'app-context ne retombe jamais sur DEMO_USER admin : c'est la règle RBAC fail-closed, garante de la sécurité en mode réel.",
      },
      {
        question: "Quel élément du store gère l'état d'abonnement à l'Académie Premium ?",
        choix: [
          "Le slice 'subscription'.",
          "Le slice 'theme'.",
          "Le slice 'i18n'.",
          "Le slice 'logout'.",
        ],
        bonneReponseIndex: 0,
        explication:
          "Le slice subscription centralise l'état d'abonnement et alimente PremiumGate / usePremium pour le contrôle d'accès.",
      },
      {
        question:
          "Une enseignante demande de pouvoir saisir des appréciations sur le livret scolaire mais ne dispose pas du droit. Quelle est la démarche correcte ?",
        choix: [
          "Lui transmettre le compte administrateur principal.",
          "Vérifier son rôle attribué, ajuster ses permissions selon la matrice RBAC et tracer la modification.",
          "Désactiver le module livret scolaire pour tout l'établissement.",
          "Demander à la direction de saisir à sa place.",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'attribution de droits passe par une vérification du rôle, un ajustement conforme à la matrice RBAC et une journalisation, sans jamais partager de compte administrateur.",
      },
    ],
    exercice: {
      titre: "Mise en situation : pilotage technique d'EduWeb Planner",
      introduction:
        "Vous endossez le rôle d'Administrateur Système d'un établissement utilisant EduWeb Planner. Vous devez assurer la disponibilité, la sécurité et la cohérence de la plateforme pour l'ensemble des utilisateurs (direction, enseignants, surveillants, parents, élèves). Les deux scénarios suivants vous placent face à des situations courantes de votre activité.",
      scenarios: [
        {
          niveau: "de base",
          contexte:
            "La rentrée scolaire débute dans deux semaines. La direction vous demande de préparer l'environnement technique d'EduWeb Planner pour la nouvelle année. L'établissement compte 42 enseignants, 1 250 élèves et déploie pour la première fois les alertes SMS aux parents. Vous disposez du compte administrateur principal et de l'accès au panneau de configuration de l'établissement.",
          consignes: [
            "Créer ou archiver les comptes utilisateurs (enseignants, surveillants, parents, élèves) en respectant le principe de moindre privilège.",
            "Configurer les paramètres de l'établissement : année scolaire active, périodes, logo, cachet et signature pour les bulletins et le livret scolaire.",
            "Vérifier la configuration de l'Académie Premium et activer les modules concernés (registre d'appel, cahier de texte, alertes SMS).",
            "Tester l'envoi des alertes SMS sur un échantillon restreint de parents avant déploiement global.",
            "Mettre en place une routine de sauvegarde et documenter la procédure de restauration.",
          ],
          criteresEvaluation: [
            "Conformité de la matrice des rôles et permissions attribuées (RBAC fail-closed respecté).",
            "Complétude des métadonnées d'export de l'établissement (logo, cachet, signature, devise, armoiries).",
            "Validation effective d'un test SMS documenté (capture ou journal).",
            "Existence d'une procédure de sauvegarde/restauration écrite et testée.",
            "Absence de comptes orphelins ou de droits excédentaires après audit.",
          ],
        },
        {
          niveau: "approfondi",
          contexte:
            "En période de conseils de classe, plusieurs enseignants signalent des lenteurs lors de la saisie des grilles d'évaluation et des bulletins. Un parent signale ne plus recevoir les alertes SMS. Parallèlement, la direction souhaite que vous prépariez la migration d'une partie des données vers le mode réel (Supabase) tout en maintenant la continuité de service pour les utilisateurs en mode démo.",
          consignes: [
            "Diagnostiquer la lenteur de saisie (logs, charge serveur, cache .next, état de la session) et proposer un correctif documenté.",
            "Analyser le canal d'alertes SMS du parent concerné (statut du compte, opt-in, journal d'envoi) et corriger la cause racine.",
            "Préparer le basculement progressif vers le mode Supabase en respectant la règle fail-closed (jamais de retour à un admin démo).",
            "Planifier une fenêtre de maintenance, communiquer aux utilisateurs via la fonctionnalité de rendez-vous/notifications interne.",
            "Effectuer un audit post-incident et produire un rapport de conformité pour la direction.",
            "Vérifier l'intégrité des bulletins et du livret scolaire après bascule (cohérence des cachets, signatures, grilles d'évaluation).",
          ],
          criteresEvaluation: [
            "Pertinence du diagnostic technique (hypothèses, méthode, preuves de logs).",
            "Restauration du canal SMS pour le parent et traçabilité de l'action corrective.",
            "Respect strict du RBAC fail-closed lors du basculement Supabase (aucun fallback DEMO_USER).",
            "Qualité de la communication utilisateur (préavis, contenu, canal).",
            "Production d'un rapport d'audit clair, daté et signé.",
          ],
        },
      ],
    },
    syntheseFormative: [
      {
        question:
          "À l'issue de ce module, quels sont les trois axes prioritaires que vous identifiez pour sécuriser votre déploiement d'EduWeb Planner ?",
      },
      {
        question:
          "Comment expliqueriez-vous le principe RBAC fail-closed à un nouveau membre de l'équipe technique ?",
      },
      {
        question:
          "Quelles routines de maintenance et de sauvegarde envisagez-vous d'institutionnaliser dans votre établissement ?",
      },
      {
        question:
          "Quels indicateurs allez-vous suivre pour mesurer la satisfaction et l'adoption de la plateforme par les enseignants et les familles ?",
      },
      {
        question:
          "Quels points du module nécessitent à votre avis un approfondissement personnel ou une formation complémentaire ?",
      },
    ],
  },

  chef_etablissement: {
    roleKey: "chef_etablissement",
    roleLabel: "Chef d'établissement",
    moduleCode: "M02",
    preTest: [
      {
        question:
          "Décrivez en quelques lignes le rôle pédagogique et administratif d'un chef d'établissement au quotidien.",
      },
      {
        question:
          "Quels outils numériques utilisez-vous actuellement pour piloter votre établissement (registre, bulletins, communication) ?",
      },
      {
        question:
          "Comment validez-vous actuellement les bulletins et le livret scolaire des élèves en fin de période ?",
      },
      {
        question:
          "Quelle est votre pratique actuelle pour communiquer rapidement avec les parents en cas d'absence ou d'événement urgent ?",
      },
      {
        question:
          "Selon vous, qu'apporterait une plateforme comme EduWeb Planner et son offre Académie Premium au pilotage de votre établissement ?",
      },
    ],
    qcm: [
      {
        question:
          "Dans EduWeb Planner, à quoi sert principalement le registre d'appel pour le chef d'établissement ?",
        choix: [
          "Saisir les notes des évaluations trimestrielles",
          "Suivre et valider les présences et absences quotidiennes des élèves",
          "Rédiger les appréciations du livret scolaire",
          "Gérer les rendez-vous individuels avec les enseignants",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le registre d'appel centralise le suivi quotidien des présences et absences ; il constitue la source de vérité que le chef d'établissement consulte et valide pour le pilotage de la vie scolaire.",
      },
      {
        question:
          "Avant la diffusion officielle d'un bulletin aux familles, quelle action incombe au chef d'établissement ?",
        choix: [
          "Saisir lui-même les notes manquantes à la place des enseignants",
          "Verrouiller la grille d'évaluation pour empêcher toute modification ultérieure par l'enseignant",
          "Vérifier et valider le bulletin avant publication aux parents",
          "Transmettre directement le bulletin à l'inspection sans relecture",
        ],
        bonneReponseIndex: 2,
        explication:
          "Le chef d'établissement assume la validation finale du bulletin : il vérifie la cohérence des notes, des moyennes et des appréciations avant la publication aux familles.",
      },
      {
        question: "Que permet l'option Académie Premium dans EduWeb Planner ?",
        choix: [
          "Accéder gratuitement à tous les modules sans souscription",
          "Débloquer des fonctionnalités avancées de pilotage, de reporting et de communication",
          "Remplacer automatiquement les enseignants absents",
          "Supprimer définitivement les frais de scolarité des élèves",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'Académie Premium est l'abonnement payant qui donne accès aux fonctionnalités avancées (pilotage, reporting, communication enrichie) destinées notamment au chef d'établissement.",
      },
      {
        question: "Le cahier de texte numérique permet au chef d'établissement de :",
        choix: [
          "Suivre la progression pédagogique réelle des classes et la conformité aux programmes",
          "Modifier librement le contenu des cours saisis par les enseignants",
          "Émettre directement les bulletins de fin de trimestre",
          "Gérer la facturation des frais de scolarité",
        ],
        bonneReponseIndex: 0,
        explication:
          "Le cahier de texte donne au chef d'établissement une vision claire de la progression pédagogique et du respect des programmes, sans se substituer à la responsabilité éditoriale des enseignants.",
      },
      {
        question: "Dans quelle situation l'envoi d'alertes SMS aux parents est-il le plus pertinent ?",
        choix: [
          "Pour transmettre les appréciations détaillées du livret scolaire",
          "Pour signaler une absence imprévue ou un événement urgent concernant l'élève",
          "Pour communiquer la liste complète des notes du trimestre",
          "Pour publier le règlement intérieur en intégralité",
        ],
        bonneReponseIndex: 1,
        explication:
          "Les alertes SMS sont conçues pour la communication brève et urgente : absences, incidents, événements ponctuels. Les contenus longs (livret, règlement) passent par d'autres canaux.",
      },
      {
        question:
          "Le livret scolaire dans EduWeb Planner se distingue du bulletin par le fait qu'il :",
        choix: [
          "Présente uniquement les notes d'une seule période",
          "Synthétise le parcours et les compétences de l'élève sur l'ensemble de l'année ou du cycle",
          "Sert exclusivement au suivi des absences",
          "Remplace la grille d'évaluation des enseignants",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le livret scolaire offre une vision longitudinale (année ou cycle) du parcours de l'élève, alors que le bulletin se concentre sur une période donnée.",
      },
      {
        question:
          "Pour préparer un conseil de classe, le chef d'établissement utilisera prioritairement :",
        choix: [
          "La grille d'évaluation, les bulletins consolidés et le registre d'appel de la classe",
          "Uniquement le module de facturation",
          "Les alertes SMS envoyées aux parents",
          "La page d'inscription des nouveaux élèves",
        ],
        bonneReponseIndex: 0,
        explication:
          "Le conseil de classe exige une vision pédagogique consolidée : grille d'évaluation, bulletins agrégés et registre d'appel constituent le socle d'analyse.",
      },
      {
        question:
          "Quel intérêt présente la fonction rendez-vous dans EduWeb Planner pour le chef d'établissement ?",
        choix: [
          "Programmer et tracer les entretiens avec les parents, les enseignants ou les élèves",
          "Diffuser automatiquement les bulletins aux familles",
          "Calculer les moyennes trimestrielles",
          "Modifier les emplois du temps des classes",
        ],
        bonneReponseIndex: 0,
        explication:
          "La fonction rendez-vous permet d'organiser et de garder une trace des entretiens institutionnels, essentielle pour la gouvernance et la relation aux familles.",
      },
      {
        question: "La grille d'évaluation paramétrée dans EduWeb Planner sert principalement à :",
        choix: [
          "Définir les coefficients, barèmes et compétences évalués pour produire des bulletins cohérents",
          "Envoyer des SMS aux parents en cas d'absence",
          "Gérer les abonnements Académie Premium",
          "Imprimer le règlement intérieur de l'établissement",
        ],
        bonneReponseIndex: 0,
        explication:
          "La grille d'évaluation structure la notation (coefficients, barèmes, compétences) ; le chef d'établissement la valide pour garantir l'homogénéité des bulletins.",
      },
      {
        question:
          "En cas d'anomalie repérée dans un bulletin avant publication, la bonne pratique du chef d'établissement est de :",
        choix: [
          "Publier le bulletin et corriger plus tard",
          "Bloquer la publication, demander la correction à l'enseignant concerné, puis valider à nouveau",
          "Supprimer le bulletin et tous les bulletins de la classe",
          "Transmettre l'anomalie directement aux parents par SMS",
        ],
        bonneReponseIndex: 1,
        explication:
          "La procédure attendue est de suspendre la publication, faire corriger par l'enseignant responsable, puis re-valider : cela préserve la fiabilité du document et la chaîne de responsabilité.",
      },
    ],
    exercice: {
      titre: "Mises en situation — Pilotage d'établissement avec EduWeb Planner",
      introduction:
        "Vous incarnez le chef d'établissement d'un collège utilisant EduWeb Planner. Deux situations vous sont proposées : une situation de base portant sur le suivi quotidien, puis une situation approfondie autour de la clôture de période et de la communication aux familles. Pour chaque scénario, mobilisez les modules adaptés (registre d'appel, cahier de texte, bulletins, livret scolaire, rendez-vous, alertes SMS, Académie Premium).",
      scenarios: [
        {
          niveau: "de base",
          contexte:
            "Nous sommes lundi matin, début de semaine. Plusieurs enseignants vous signalent un nombre inhabituel d'absences en classe de 5e. Vous devez réagir rapidement, garantir la fiabilité du registre d'appel et informer les familles concernées, tout en gardant une trace administrative exploitable lors du prochain conseil de classe.",
          consignes: [
            "Consulter le registre d'appel des classes de 5e et identifier les élèves absents non justifiés du jour.",
            "Vérifier la cohérence des saisies avec les enseignants concernés via le cahier de texte (cours effectivement assurés).",
            "Programmer et envoyer une alerte SMS aux parents des élèves absents non justifiés.",
            "Planifier un rendez-vous avec le professeur principal pour faire un point de synthèse.",
            "Documenter l'incident dans un commentaire administratif pour le futur conseil de classe.",
          ],
          criteresEvaluation: [
            "Le registre d'appel a été consulté et les absences correctement identifiées.",
            "Les alertes SMS ont été envoyées de manière ciblée et factuelle.",
            "Un rendez-vous a été programmé et tracé dans l'outil.",
            "La traçabilité administrative est assurée (commentaire ou note de synthèse).",
            "Les actions respectent la chaîne de responsabilité (enseignants, vie scolaire, direction).",
          ],
        },
        {
          niveau: "approfondi",
          contexte:
            "La fin du deuxième trimestre approche. Vous devez piloter la production des bulletins de toutes les classes, contrôler la cohérence du livret scolaire des classes de 3e en vue de l'orientation, et préparer la communication aux familles. Votre établissement vient de souscrire à l'Académie Premium, ce qui débloque des fonctionnalités avancées de reporting et de communication.",
          consignes: [
            "Vérifier que toutes les grilles d'évaluation sont complètes et conformes aux coefficients validés.",
            "Procéder au contrôle qualité des bulletins (notes manquantes, appréciations, moyennes) avant validation.",
            "Auditer le livret scolaire des classes de 3e et signaler les anomalies aux enseignants responsables.",
            "Utiliser les fonctions avancées de l'Académie Premium pour générer un tableau de bord de pilotage trimestriel.",
            "Planifier les conseils de classe via la fonction rendez-vous et programmer une campagne d'alertes SMS aux parents annonçant la disponibilité des bulletins.",
            "Valider et publier officiellement les bulletins une fois les corrections appliquées.",
          ],
          criteresEvaluation: [
            "Les grilles d'évaluation et bulletins ont été contrôlés méthodiquement avant publication.",
            "Les anomalies du livret scolaire ont été identifiées et tracées.",
            "Les fonctionnalités de l'Académie Premium ont été mobilisées pour le pilotage.",
            "Les conseils de classe sont planifiés et la communication aux familles est organisée.",
            "La publication des bulletins respecte la procédure (correction puis validation) et la chronologie attendue.",
          ],
        },
      ],
    },
    syntheseFormative: [
      {
        question:
          "Quels modules d'EduWeb Planner vous semblent les plus stratégiques pour votre pilotage quotidien, et pourquoi ?",
      },
      {
        question:
          "Comment articulerez-vous, dans votre pratique, le registre d'appel, le cahier de texte et les bulletins pour préparer un conseil de classe ?",
      },
      {
        question:
          "Quelles règles internes mettrez-vous en place pour l'usage des alertes SMS afin d'éviter la sur-sollicitation des familles ?",
      },
      {
        question:
          "Quels apports concrets attendez-vous de l'Académie Premium pour la gouvernance de votre établissement ?",
      },
      {
        question:
          "Quels points de vigilance identifiez-vous concernant la validation des bulletins et la fiabilité du livret scolaire ?",
      },
    ],
  },

  enseignant: {
    roleKey: "enseignant",
    roleLabel: "Enseignant",
    moduleCode: "M05",
    preTest: [
      {
        question:
          "Comment effectuez-vous actuellement l'appel et la gestion des absences dans votre classe ?",
      },
      {
        question:
          "Quels outils utilisez-vous pour tenir votre cahier de texte et le partager avec les élèves et leurs parents ?",
      },
      {
        question:
          "Décrivez votre démarche habituelle pour construire une grille d'évaluation par compétences.",
      },
      {
        question:
          "Comment organisez-vous la saisie des notes et la rédaction des appréciations sur les bulletins trimestriels ?",
      },
      {
        question:
          "Quelles sont vos pratiques actuelles de communication avec les familles, notamment pour la prise de rendez-vous ?",
      },
    ],
    qcm: [
      {
        question:
          "Dans EduWeb Planner, quelle action permet de tracer officiellement la présence des élèves à une séance ?",
        choix: [
          "Renseigner le cahier de texte de la séance.",
          "Saisir et valider le registre d'appel de la séance.",
          "Envoyer une alerte SMS aux parents.",
          "Compléter le livret scolaire de l'élève.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le registre d'appel est l'outil officiel de constatation des présences et absences ; sa validation déclenche les traitements liés (alertes, justificatifs, statistiques).",
      },
      {
        question: "À quoi sert principalement le cahier de texte dans EduWeb Planner ?",
        choix: [
          "À enregistrer les notes des évaluations sommatives.",
          "À consigner les objectifs, contenus et travaux donnés lors de chaque séance.",
          "À gérer les rendez-vous avec les parents d'élèves.",
          "À calculer les moyennes trimestrielles.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le cahier de texte documente la progression pédagogique : objectifs, contenus traités et travail demandé. Il sert de référence à l'élève absent et à l'institution.",
      },
      {
        question:
          "Quel module d'EduWeb Planner permet de structurer une évaluation par critères observables et pondérés ?",
        choix: [
          "La grille d'évaluation.",
          "Le registre d'appel.",
          "Les alertes SMS.",
          "Le tableau des rendez-vous.",
        ],
        bonneReponseIndex: 0,
        explication:
          "La grille d'évaluation permet de définir des critères, des niveaux de maîtrise et des pondérations, garantissant une évaluation transparente et reproductible.",
      },
      {
        question: "Que désigne l'Académie Premium dans EduWeb Planner ?",
        choix: [
          "Un dispositif de tutorat entre enseignants.",
          "Une offre payante donnant accès à des fonctionnalités pédagogiques avancées de l'établissement.",
          "Une fonctionnalité gratuite réservée aux administrateurs.",
          "Un module destiné uniquement aux parents d'élèves.",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'Académie Premium est l'abonnement de l'établissement qui débloque des fonctionnalités avancées, notamment côté livret scolaire et bilans enrichis.",
      },
      {
        question:
          "Quel document, généré dans EduWeb Planner, synthétise les notes et appréciations d'un trimestre ?",
        choix: [
          "Le livret scolaire.",
          "Le cahier de texte.",
          "Le bulletin.",
          "Le registre d'appel.",
        ],
        bonneReponseIndex: 2,
        explication:
          "Le bulletin trimestriel agrège les notes, moyennes et appréciations sur une période donnée. Il est destiné aux familles et à l'archivage.",
      },
      {
        question: "Quelle est la différence essentielle entre le bulletin et le livret scolaire ?",
        choix: [
          "Le bulletin est annuel, le livret est trimestriel.",
          "Le bulletin présente une période courte ; le livret suit l'élève sur l'ensemble de son parcours.",
          "Le bulletin est réservé aux enseignants, le livret aux parents.",
          "Il n'existe aucune différence fonctionnelle entre les deux.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le bulletin couvre une période (trimestre, semestre) tandis que le livret scolaire constitue le suivi pluriannuel des acquis et compétences de l'élève.",
      },
      {
        question:
          "Quel canal EduWeb Planner privilégie-t-il pour informer rapidement un parent de l'absence de son enfant ?",
        choix: [
          "Une notification dans le cahier de texte.",
          "Une mention dans le bulletin trimestriel.",
          "Les alertes SMS configurées par l'établissement.",
          "Une convocation papier remise à l'élève.",
        ],
        bonneReponseIndex: 2,
        explication:
          "Les alertes SMS sont le canal de notification immédiat pour les événements urgents tels que les absences non justifiées.",
      },
      {
        question:
          "Pour planifier un échange individuel avec un parent, quelle fonctionnalité utilisez-vous dans EduWeb Planner ?",
        choix: [
          "La grille d'évaluation.",
          "Le module rendez-vous.",
          "Le registre d'appel.",
          "Le bulletin.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le module rendez-vous permet de proposer des créneaux, recevoir des demandes, confirmer et notifier les participants au sein de l'agenda enseignant.",
      },
      {
        question: "Quelle pratique garantit la fiabilité des moyennes calculées sur le bulletin ?",
        choix: [
          "Saisir les notes en fin de trimestre uniquement.",
          "Associer chaque évaluation à une grille d'évaluation correctement pondérée.",
          "Modifier manuellement les moyennes après calcul.",
          "Supprimer les évaluations divergentes du calcul.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le rattachement à une grille d'évaluation pondérée assure un calcul automatique, traçable et conforme aux barèmes définis.",
      },
      {
        question:
          "Avant la diffusion d'un bulletin aux familles, quelle étape l'enseignant doit-il généralement respecter ?",
        choix: [
          "Envoyer directement le bulletin par SMS aux parents.",
          "Verrouiller ses saisies et soumettre le bulletin pour validation hiérarchique.",
          "Publier le bulletin dans le cahier de texte.",
          "Archiver le bulletin dans le registre d'appel.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le circuit institutionnel impose un verrouillage des saisies et une validation par le chef d'établissement avant diffusion officielle aux familles.",
      },
    ],
    exercice: {
      titre:
        "Mise en situation : Préparer, animer et évaluer une séquence pédagogique avec EduWeb Planner",
      introduction:
        "Vous êtes enseignant titulaire dans un établissement utilisant EduWeb Planner. Vous allez mobiliser le registre d'appel, le cahier de texte, les grilles d'évaluation et le module de bulletins pour assurer le suivi pédagogique d'une classe. Les deux scénarios qui suivent vous placent dans des situations professionnelles courantes, de complexité progressive.",
      scenarios: [
        {
          niveau: "de base",
          contexte:
            "Vous démarrez une nouvelle semaine de cours avec votre classe de Quatrième. Vous disposez de deux séances d'Histoire-Géographie programmées dans votre emploi du temps EduWeb Planner. Vous devez assurer la traçabilité de ces séances et préparer un travail à la maison pour vos élèves. Trois absences sont attendues car signalées la veille par les parents via la messagerie EduWeb.",
          consignes: [
            "Connectez-vous à votre espace enseignant et localisez votre emploi du temps de la semaine.",
            "Ouvrez le registre d'appel de la première séance et saisissez les présences, retards et absences en cohérence avec les justifications déjà transmises.",
            "Renseignez le cahier de texte de la séance : objectifs pédagogiques, contenus abordés et supports utilisés.",
            "Programmez un devoir à la maison à rendre pour la séance suivante, avec date d'échéance et consignes claires.",
            "Validez la séance afin que les parents et élèves puissent la consulter depuis leur espace.",
            "Vérifiez que les alertes SMS d'absence ont bien été déclenchées pour les élèves concernés.",
          ],
          criteresEvaluation: [
            "Le registre d'appel est correctement saisi et cohérent avec les justifications reçues.",
            "Le cahier de texte mentionne objectifs, contenus et supports de manière exploitable par l'élève absent.",
            "Le devoir à la maison comporte une consigne claire, une échéance et un mode de restitution.",
            "La séance est validée et visible côté parent/élève.",
            "Les alertes SMS d'absence sont effectivement parties pour les élèves absents.",
          ],
        },
        {
          niveau: "approfondi",
          contexte:
            "La fin du trimestre approche. Vous devez préparer les évaluations sommatives de votre classe de Troisième, saisir les notes selon une grille d'évaluation par compétences, rédiger les appréciations du bulletin et répondre à une demande de rendez-vous d'un parent inquiet du niveau de son enfant. Votre établissement a souscrit à l'Académie Premium pour les fonctionnalités avancées de bilan.",
          consignes: [
            "Créez une évaluation sommative en associant une grille d'évaluation par compétences adaptée au programme.",
            "Saisissez les notes des élèves et vérifiez le calcul automatique des moyennes pondérées.",
            "Rédigez les appréciations individuelles dans le bulletin trimestriel en respectant la charte de l'établissement.",
            "Activez et complétez la section enrichie du livret scolaire (compétences transversales) via l'Académie Premium.",
            "Acceptez la demande de rendez-vous du parent et proposez un créneau dans votre agenda EduWeb.",
            "Verrouillez vos saisies et soumettez le bulletin au chef d'établissement pour validation.",
          ],
          criteresEvaluation: [
            "La grille d'évaluation est cohérente avec les compétences visées et correctement pondérée.",
            "Les notes et moyennes sont exactes, sans incohérence avec la grille appliquée.",
            "Les appréciations du bulletin sont individualisées, bienveillantes et conformes à la charte.",
            "Le livret scolaire Premium est complété de manière exploitable pour le suivi pluriannuel.",
            "Le rendez-vous est confirmé, planifié et notifié au parent dans EduWeb Planner.",
          ],
        },
      ],
    },
    syntheseFormative: [
      {
        question:
          "Quels apports concrets EduWeb Planner offre-t-il à votre pratique quotidienne d'enseignant par rapport à vos outils antérieurs ?",
      },
      {
        question:
          "Comment articulerez-vous désormais le registre d'appel, le cahier de texte et la communication aux familles dans votre routine de classe ?",
      },
      {
        question:
          "Quelle démarche adopterez-vous pour concevoir une grille d'évaluation pertinente et cohérente avec vos objectifs pédagogiques ?",
      },
      {
        question:
          "Quelles vigilances déontologiques et professionnelles retenez-vous concernant la rédaction des appréciations sur le bulletin et le livret scolaire ?",
      },
      {
        question:
          "Quels axes de progression personnels identifiez-vous à l'issue de ce module, et de quel accompagnement complémentaire auriez-vous besoin ?",
      },
    ],
  },

  educateur: {
    roleKey: "educateur",
    roleLabel: "Éducateur",
    moduleCode: "M06",
    preTest: [
      {
        question:
          "Selon vous, quelles sont les principales missions d'un Éducateur dans le suivi quotidien d'une classe ?",
      },
      {
        question:
          "Comment effectuez-vous habituellement la prise du registre d'appel et le suivi des absences dans votre établissement ?",
      },
      {
        question:
          "Quels outils numériques utilisez-vous actuellement pour communiquer avec les familles et planifier des rendez-vous ?",
      },
      {
        question:
          "Quelle est, selon vous, la différence entre un bulletin scolaire et un livret scolaire ?",
      },
      {
        question:
          "Quelles attentes avez-vous vis-à-vis d'une plateforme comme EduWeb Planner pour faciliter votre travail d'Éducateur ?",
      },
    ],
    qcm: [
      {
        question:
          "Dans EduWeb Planner, où l'Éducateur saisit-il les présences et absences quotidiennes des élèves d'une classe ?",
        choix: [
          "Dans le cahier de texte de la classe.",
          "Dans le registre d'appel de la classe.",
          "Dans le livret scolaire de chaque élève.",
          "Dans le module de facturation Académie Premium.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le registre d'appel est l'outil dédié au suivi quotidien des présences, absences et retards ; le cahier de texte sert au suivi pédagogique des séances.",
      },
      {
        question:
          "Quel canal EduWeb Planner permet d'informer rapidement les responsables légaux d'une absence non justifiée ?",
        choix: [
          "Une mise à jour du livret scolaire.",
          "Une modification de la grille d'évaluation.",
          "L'envoi d'alertes SMS.",
          "La publication d'un bulletin trimestriel.",
        ],
        bonneReponseIndex: 2,
        explication:
          "Les alertes SMS sont conçues pour la communication rapide avec les familles, notamment en cas d'absence non justifiée.",
      },
      {
        question:
          "Quel document consolide, en fin de période, les notes et appréciations des enseignants d'une classe ?",
        choix: [
          "Le registre d'appel.",
          "Le cahier de texte.",
          "Le bulletin scolaire.",
          "L'agenda partagé.",
        ],
        bonneReponseIndex: 2,
        explication:
          "Le bulletin scolaire est le document de synthèse trimestriel ou semestriel reprenant les évaluations et appréciations.",
      },
      {
        question: "Quelle est la fonction principale du cahier de texte dans EduWeb Planner ?",
        choix: [
          "Suivre les présences quotidiennes des élèves.",
          "Consigner les contenus de séance, devoirs et activités prévues.",
          "Éditer les bulletins de fin de trimestre.",
          "Gérer les abonnements Académie Premium.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le cahier de texte permet à l'enseignant et à l'éducateur de garder trace des contenus pédagogiques, devoirs et activités.",
      },
      {
        question: "Que désigne le livret scolaire dans EduWeb Planner ?",
        choix: [
          "Le calendrier des rendez-vous parents.",
          "Le document de suivi longitudinal du parcours et des acquis de l'élève.",
          "La liste des paiements de scolarité.",
          "Le journal interne de l'établissement.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le livret scolaire retrace, dans la durée, le parcours et les acquis de l'élève, au-delà d'un seul bulletin.",
      },
      {
        question:
          "Pour planifier un entretien avec un parent, quel outil l'Éducateur utilise-t-il dans EduWeb Planner ?",
        choix: [
          "La grille d'évaluation.",
          "Le module des rendez-vous dans l'agenda partagé.",
          "Le registre d'appel.",
          "Le bulletin scolaire.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Les rendez-vous se planifient dans l'agenda partagé d'EduWeb Planner, ce qui permet d'éviter les conflits de créneaux.",
      },
      {
        question:
          "Quel apport principal une offre Académie Premium peut-elle représenter pour le travail de l'Éducateur ?",
        choix: [
          "Le remplacement automatique des enseignants absents.",
          "L'accès à des fonctionnalités enrichies (édition avancée des bulletins, exports, etc.).",
          "La suppression de la nécessité de tenir un registre d'appel.",
          "La dispense des conseils de classe.",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'offre Académie Premium débloque des fonctionnalités avancées (édition, exports, options enrichies) sans modifier les obligations pédagogiques de base.",
      },
      {
        question: "Lorsqu'un enseignant n'a pas saisi ses notes, l'Éducateur doit prioritairement :",
        choix: [
          "Saisir les notes à sa place dans la grille d'évaluation.",
          "Le relancer via la plateforme et tracer la relance.",
          "Bloquer l'édition des bulletins de la classe.",
          "Supprimer la matière concernée du bulletin.",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'Éducateur n'a pas vocation à se substituer à l'enseignant : il relance et trace la relance dans EduWeb Planner.",
      },
      {
        question:
          "Quelle bonne pratique s'applique à la rédaction des remarques de vie scolaire dans EduWeb Planner ?",
        choix: [
          "Utiliser un ton humoristique pour dédramatiser.",
          "Rester factuel, daté et sobre.",
          "Mentionner des éléments de vie privée des familles.",
          "Évaluer la personnalité globale de l'élève.",
        ],
        bonneReponseIndex: 1,
        explication:
          "Les remarques de vie scolaire doivent rester factuelles, datées et sobres, conformément au cadre déontologique.",
      },
      {
        question:
          "Avant un conseil de classe, quelle vérification l'Éducateur effectue-t-il prioritairement dans EduWeb Planner ?",
        choix: [
          "La mise à jour du logo de l'établissement.",
          "La cohérence des bulletins (moyennes, appréciations, absences) et la complétude des grilles d'évaluation.",
          "Le changement de mot de passe des enseignants.",
          "La résiliation des abonnements Académie Premium.",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'Éducateur fiabilise les données pédagogiques (grilles, moyennes, appréciations, absences) en amont du conseil de classe.",
      },
    ],
    exercice: {
      titre: "Mise en situation pratique — Suivi pédagogique et vie de classe par l'Éducateur",
      introduction:
        "Vous êtes Éducateur dans un établissement utilisant EduWeb Planner. Vous accompagnez plusieurs classes au quotidien et travaillez en lien étroit avec les enseignants, l'administration et les familles. Les deux scénarios suivants vous mettent en situation réelle d'utilisation de la plateforme. Veuillez décrire précisément les actions que vous menez dans EduWeb Planner pour répondre à chaque situation.",
      scenarios: [
        {
          niveau: "de base",
          contexte:
            "Lundi matin, 7h45. Vous êtes Éducateur de niveau référent de la classe de 5e B. Plusieurs élèves arrivent en retard et deux sont absents sans justification. Vous devez assurer la prise en charge administrative de la classe avant le démarrage des cours et informer rapidement les familles concernées via EduWeb Planner.",
          consignes: [
            "Connectez-vous à EduWeb Planner avec votre profil Éducateur et sélectionnez la classe de 5e B.",
            "Ouvrez le registre d'appel du jour et saisissez les présences, retards et absences pour chaque élève concerné.",
            "Pour les deux absences non justifiées, déclenchez l'envoi des alertes SMS aux responsables légaux depuis la fiche élève.",
            "Consignez une remarque de vie scolaire pour chaque retard répété afin d'assurer la traçabilité.",
            "Vérifiez que les informations saisies sont bien synchronisées avec le cahier de texte et accessibles aux enseignants de la journée.",
            "Planifiez, si nécessaire, un rendez-vous avec un parent dans l'agenda partagé pour évoquer les absences.",
          ],
          criteresEvaluation: [
            "Le registre d'appel est complété intégralement et sans erreur pour la classe concernée.",
            "Les alertes SMS sont déclenchées en respectant la procédure et adressées aux bons responsables.",
            "Les remarques de vie scolaire sont rédigées de manière factuelle, datée et sobre.",
            "La synchronisation avec le cahier de texte et la fiche élève est vérifiée.",
            "Le rendez-vous éventuel est correctement planifié avec objet, date et participants.",
          ],
        },
        {
          niveau: "approfondi",
          contexte:
            "Fin du deuxième trimestre. L'établissement a souscrit à l'offre Académie Premium. Vous devez préparer le conseil de classe de la 3e A : consolider les bulletins, finaliser le livret scolaire des élèves en difficulté, et organiser une série de rendez-vous individualisés avec les familles. Le professeur principal vous sollicite pour fiabiliser les données avant édition.",
          consignes: [
            "Vérifiez dans EduWeb Planner que toutes les grilles d'évaluation du trimestre ont été saisies par les enseignants concernés et relancez ceux qui n'ont pas finalisé leur saisie.",
            "Contrôlez la cohérence des bulletins (moyennes, appréciations, absences) avant validation par la direction.",
            "Mettez à jour le livret scolaire des élèves identifiés comme fragiles en y intégrant les observations de vie scolaire pertinentes.",
            "Vérifiez que les fonctionnalités Académie Premium activées (édition enrichie du bulletin, exports) sont opérationnelles pour la classe.",
            "Organisez dans l'agenda partagé les rendez-vous parents-éducateur sur deux demi-journées et envoyez les convocations.",
            "Déclenchez les alertes SMS de rappel aux familles 48 heures avant chaque rendez-vous et préparez une note de synthèse à l'attention du professeur principal.",
          ],
          criteresEvaluation: [
            "L'ensemble des grilles d'évaluation est vérifié et les relances éventuelles sont tracées dans la plateforme.",
            "Les bulletins présentent des données cohérentes, complètes et prêtes à validation.",
            "Le livret scolaire est enrichi d'observations factuelles, utiles et conformes au cadre déontologique.",
            "Les rendez-vous sont planifiés sans conflit d'agenda et les alertes SMS de rappel sont programmées.",
            "Les apports de l'offre Académie Premium sont mobilisés de façon pertinente dans la préparation du conseil de classe.",
          ],
        },
      ],
    },
    syntheseFormative: [
      {
        question:
          "Quels gestes professionnels d'Éducateur EduWeb Planner vous permet-il désormais de fluidifier au quotidien ?",
      },
      {
        question:
          "Sur quels usages (registre d'appel, cahier de texte, bulletins, livret scolaire, rendez-vous, alertes SMS) souhaitez-vous encore progresser, et pourquoi ?",
      },
      {
        question:
          "Comment articulez-vous votre travail avec celui des enseignants et de la direction grâce à la plateforme ?",
      },
      {
        question:
          "Quelles règles déontologiques retenez-vous concernant la rédaction des remarques de vie scolaire et la communication avec les familles ?",
      },
      {
        question:
          "Quel apport concret de l'offre Académie Premium identifiez-vous pour soutenir votre rôle d'Éducateur dans votre établissement ?",
      },
    ],
  },

  eleve: {
    roleKey: "eleve",
    roleLabel: "Élève",
    moduleCode: "M08",
    preTest: [
      {
        question:
          "Que représente pour vous le cahier de texte numérique dans votre quotidien d'élève ?",
      },
      {
        question: "Comment consultez-vous habituellement vos notes et votre bulletin scolaire ?",
      },
      {
        question:
          "Avez-vous déjà utilisé une plateforme en ligne pour suivre votre travail scolaire ? Si oui, laquelle et pour quel usage ?",
      },
      {
        question:
          "Quels documents officiels de votre scolarité connaissez-vous (bulletin, livret scolaire, certificat, etc.) et à quoi servent-ils ?",
      },
      {
        question:
          "Selon vous, quelles informations un élève devrait-il pouvoir consulter en autonomie depuis son espace numérique ?",
      },
    ],
    qcm: [
      {
        question:
          "Dans EduWeb Planner, où l'élève consulte-t-il les devoirs et leçons donnés par ses enseignants pour préparer son travail à la maison ?",
        choix: [
          "Dans le registre d'appel",
          "Dans le cahier de texte",
          "Dans la grille d'évaluation",
          "Dans l'agenda des rendez-vous",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le cahier de texte numérique centralise les contenus de cours, devoirs et leçons à préparer ; c'est l'outil dédié au suivi du travail scolaire de l'élève.",
      },
      {
        question:
          "Quel document permet à l'élève de visualiser de manière périodique l'ensemble de ses notes, moyennes et appréciations par matière ?",
        choix: [
          "Le registre d'appel",
          "Le livret scolaire",
          "Le bulletin",
          "La grille d'évaluation",
        ],
        bonneReponseIndex: 2,
        explication:
          "Le bulletin est le document périodique (trimestre/semestre) qui synthétise les notes, moyennes et appréciations de l'élève par matière.",
      },
      {
        question: "Que retrouve l'élève dans son livret scolaire sur EduWeb Planner ?",
        choix: [
          "Uniquement les absences de la semaine",
          "Le suivi cumulé de son parcours et de ses acquis sur l'année",
          "La liste des rendez-vous avec ses enseignants",
          "Le calendrier des évaluations à venir",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le livret scolaire retrace le parcours pédagogique de l'élève sur l'année (compétences, résultats, observations) ; il complète les bulletins périodiques.",
      },
      {
        question:
          "Comment l'élève peut-il être informé rapidement d'un changement d'emploi du temps ou d'une absence enseignant ?",
        choix: [
          "En consultant le livret scolaire",
          "Via les alertes SMS et notifications de l'application",
          "En attendant le prochain bulletin",
          "En relisant le registre d'appel",
        ],
        bonneReponseIndex: 1,
        explication:
          "Les alertes SMS et notifications poussent en temps réel les informations urgentes (changements d'emploi du temps, absences enseignants, communications).",
      },
      {
        question: "Que représente le registre d'appel consulté par l'élève sur son espace ?",
        choix: [
          "La liste de ses devoirs à rendre",
          "Le relevé de ses présences, absences et retards",
          "Le récapitulatif de ses notes trimestrielles",
          "Le carnet de correspondance numérique",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le registre d'appel recense les présences, absences et retards de l'élève ; il lui permet de suivre son assiduité et de signaler une éventuelle erreur.",
      },
      {
        question: "Comment l'élève prend-il un rendez-vous avec un enseignant via EduWeb Planner ?",
        choix: [
          "En envoyant un SMS direct depuis son téléphone personnel",
          "En passant par la rubrique Rendez-vous de son espace",
          "En attendant la prochaine réunion parents-professeurs",
          "En modifiant son cahier de texte",
        ],
        bonneReponseIndex: 1,
        explication:
          "La rubrique Rendez-vous permet à l'élève de demander un créneau auprès d'un enseignant, qui valide ou propose un autre horaire.",
      },
      {
        question:
          "Sur une grille d'évaluation par compétences, que signifie pour l'élève la mention d'un niveau de maîtrise ?",
        choix: [
          "Une sanction disciplinaire",
          "Le degré d'acquisition d'une compétence évaluée",
          "Le rang dans la classe",
          "Un calcul automatique de moyenne",
        ],
        bonneReponseIndex: 1,
        explication:
          "La grille d'évaluation par compétences indique le niveau de maîtrise atteint (non acquis, en cours, acquis, expert), distinct d'une note chiffrée.",
      },
      {
        question: "Quel avantage offre l'Académie Premium à l'élève dans EduWeb Planner ?",
        choix: [
          "L'accès à des ressources pédagogiques enrichies et des fonctionnalités avancées de révision",
          "La possibilité de modifier ses propres notes",
          "La suppression du registre d'appel",
          "L'accès aux notes des autres élèves",
        ],
        bonneReponseIndex: 0,
        explication:
          "L'Académie Premium propose des ressources pédagogiques enrichies, des exercices et des fonctionnalités avancées d'accompagnement et de révision.",
      },
      {
        question:
          "Quelle bonne pratique l'élève doit-il adopter pour sécuriser son espace personnel EduWeb Planner ?",
        choix: [
          "Partager son mot de passe avec un camarade de confiance",
          "Se déconnecter après chaque session sur un appareil partagé",
          "Désactiver les alertes SMS",
          "Communiquer ses identifiants sur les réseaux sociaux",
        ],
        bonneReponseIndex: 1,
        explication:
          "Sur un appareil partagé, la déconnexion systématique protège les données scolaires personnelles ; les identifiants ne se partagent jamais.",
      },
      {
        question:
          "En cas d'erreur constatée sur une note du bulletin, quelle est la démarche recommandée pour l'élève ?",
        choix: [
          "Modifier la note directement dans son espace",
          "Contacter l'enseignant ou la vie scolaire via la messagerie d'EduWeb Planner",
          "Demander à ses parents de saisir une réclamation papier uniquement",
          "Ignorer l'erreur jusqu'au bulletin suivant",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'élève ne peut pas modifier ses notes ; il doit signaler l'anomalie à l'enseignant ou à la vie scolaire via la messagerie pour vérification et correction.",
      },
    ],
    exercice: {
      titre: "Mise en situation : prendre en main son espace élève sur EduWeb Planner",
      introduction:
        "Vous découvrez votre espace personnel EduWeb Planner et vous devez apprendre à l'utiliser au quotidien pour organiser votre travail, suivre vos résultats et communiquer avec votre établissement.",
      scenarios: [
        {
          niveau: "de base",
          contexte:
            "C'est votre première semaine d'utilisation d'EduWeb Planner. Votre établissement vient de vous remettre vos identifiants. Vous souhaitez préparer la semaine de cours qui débute lundi et vous assurer de ne rien oublier concernant vos devoirs et votre emploi du temps.",
          consignes: [
            "Connectez-vous à votre espace élève et personnalisez vos préférences de notification (alertes SMS et notifications).",
            "Consultez votre emploi du temps de la semaine et repérez les éventuels changements.",
            "Ouvrez le cahier de texte de chaque matière pour lister vos devoirs à rendre dans la semaine.",
            "Vérifiez votre registre d'appel pour contrôler vos présences et absences récentes.",
            "Notez dans votre agenda personnel les échéances importantes identifiées.",
          ],
          criteresEvaluation: [
            "Connexion réussie et préférences de notification correctement réglées",
            "Lecture exacte de l'emploi du temps et identification des changements",
            "Inventaire complet et organisé des devoirs issus du cahier de texte",
            "Contrôle attentif du registre d'appel et signalement d'une éventuelle anomalie",
          ],
        },
        {
          niveau: "approfondi",
          contexte:
            "Le premier trimestre se termine. Votre bulletin vient d'être publié sur EduWeb Planner. Vous remarquez une note qui ne correspond pas à votre souvenir et vous souhaitez préparer un entretien avec votre professeur principal. Vous avez par ailleurs accès à l'Académie Premium souscrite par votre famille.",
          consignes: [
            "Téléchargez et analysez votre bulletin du trimestre ainsi que la rubrique correspondante de votre livret scolaire.",
            "Comparez la note contestée avec les évaluations détaillées de la grille d'évaluation de la matière concernée.",
            "Rédigez un message courtois à l'enseignant via la messagerie d'EduWeb Planner pour demander une vérification.",
            "Prenez un rendez-vous avec votre professeur principal via la rubrique Rendez-vous.",
            "Explorez les ressources de l'Académie Premium et planifiez deux séances de révision sur les compétences les moins maîtrisées.",
            "Mettez à jour votre cahier de texte personnel pour intégrer ces séances de révision.",
          ],
          criteresEvaluation: [
            "Analyse rigoureuse du bulletin et du livret scolaire avec repérage précis des éléments contestés",
            "Utilisation correcte de la grille d'évaluation pour étayer la demande",
            "Message à l'enseignant respectueux, clair et argumenté",
            "Prise de rendez-vous effective et confirmée dans EduWeb Planner",
            "Plan de révision réaliste mobilisant les ressources de l'Académie Premium",
          ],
        },
      ],
    },
    syntheseFormative: [
      {
        question:
          "En quoi l'utilisation régulière du cahier de texte et de l'emploi du temps numériques a-t-elle modifié votre organisation personnelle ?",
      },
      {
        question:
          "Quelles fonctionnalités d'EduWeb Planner vous semblent les plus utiles pour progresser dans vos apprentissages, et pourquoi ?",
      },
      {
        question:
          "Comment articulez-vous la lecture du bulletin et celle du livret scolaire pour suivre votre progression sur l'année ?",
      },
      {
        question:
          "Quelles bonnes pratiques de communication (messagerie, rendez-vous) souhaitez-vous mettre en place avec vos enseignants ?",
      },
      {
        question:
          "Quels usages comptez-vous faire des ressources de l'Académie Premium pour préparer vos prochaines évaluations ?",
      },
    ],
  },

  parent: {
    roleKey: "parent",
    roleLabel: "Parent d'élève",
    moduleCode: "M07",
    preTest: [
      {
        question:
          "Que savez-vous de l'application EduWeb Planner et de l'espace réservé aux parents d'élèves ?",
      },
      {
        question:
          "Comment suivez-vous actuellement la scolarité de votre enfant (notes, absences, devoirs) ?",
      },
      {
        question:
          "Avez-vous déjà utilisé un service en ligne pour prendre rendez-vous avec un enseignant ? Décrivez votre expérience.",
      },
      {
        question:
          "Quelles informations vous semblent prioritaires pour bien accompagner votre enfant au quotidien ?",
      },
      {
        question: "Quelles difficultés rencontrez-vous habituellement avec les outils numériques scolaires ?",
      },
    ],
    qcm: [
      {
        question:
          "Dans EduWeb Planner, où le parent peut-il consulter les devoirs à faire et les leçons données par les enseignants ?",
        choix: [
          "Dans le registre d'appel",
          "Dans le cahier de texte",
          "Dans le bulletin trimestriel",
          "Dans le livret scolaire",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le cahier de texte centralise les devoirs, leçons et activités prévues par les enseignants ; le parent y accède en lecture depuis son espace.",
      },
      {
        question: "Le registre d'appel consulté par le parent permet principalement de :",
        choix: [
          "Télécharger les manuels scolaires",
          "Modifier les notes saisies par les enseignants",
          "Suivre l'assiduité de l'enfant (présences, absences, retards)",
          "Payer les frais de scolarité",
        ],
        bonneReponseIndex: 2,
        explication:
          "Le registre d'appel est l'outil de suivi de l'assiduité. Le parent peut le consulter pour vérifier les présences, absences et retards de son enfant.",
      },
      {
        question: "Pour solliciter un échange avec un enseignant via EduWeb Planner, le parent utilise :",
        choix: [
          "Le module de rendez-vous en ligne",
          "Le bulletin trimestriel",
          "Le livret scolaire",
          "La grille d'évaluation",
        ],
        bonneReponseIndex: 0,
        explication:
          "Le module de rendez-vous permet au parent de solliciter une rencontre avec un enseignant ou le professeur principal et de confirmer un créneau.",
      },
      {
        question: "Quelle est la différence entre le bulletin et le livret scolaire ?",
        choix: [
          "Le bulletin est annuel, le livret est trimestriel",
          "Le bulletin est un document interne, le livret n'est jamais remis aux parents",
          "Le bulletin présente les résultats d'une période (trimestre), le livret synthétise le parcours scolaire de l'élève",
          "Ce sont deux noms désignant exactement le même document",
        ],
        bonneReponseIndex: 2,
        explication:
          "Le bulletin rend compte des résultats d'une période donnée (trimestre), tandis que le livret scolaire offre une vue cumulative et synthétique du parcours de l'élève.",
      },
      {
        question: "Les alertes SMS proposées par EduWeb Planner permettent au parent :",
        choix: [
          "De recevoir des notifications en cas d'absence, retard ou nouvelle note",
          "De télécharger automatiquement les manuels numériques",
          "D'envoyer des SMS directement aux enseignants",
          "De désinscrire son enfant en ligne",
        ],
        bonneReponseIndex: 0,
        explication:
          "Les alertes SMS notifient le parent des événements importants liés à la scolarité de son enfant : absences, retards, nouvelles notes ou messages.",
      },
      {
        question: "La grille d'évaluation visible par le parent affiche :",
        choix: [
          "Les frais de cantine restant à payer",
          "Les notes et appréciations par matière pour son enfant",
          "L'emploi du temps de la classe",
          "Les coordonnées des autres parents",
        ],
        bonneReponseIndex: 1,
        explication:
          "La grille d'évaluation présente, matière par matière, les notes et appréciations des enseignants, permettant au parent de suivre les performances de son enfant.",
      },
      {
        question: "L'option Académie Premium proposée à certains parents correspond principalement à :",
        choix: [
          "Un mode hors-ligne d'EduWeb Planner",
          "Un abonnement à des services pédagogiques renforcés (suivi, contenus, accompagnement)",
          "Une réduction sur les frais de scolarité",
          "Une formation obligatoire pour les enseignants",
        ],
        bonneReponseIndex: 1,
        explication:
          "Académie Premium est une offre d'abonnement qui ouvre l'accès à des services pédagogiques additionnels et à un suivi renforcé de la scolarité.",
      },
      {
        question:
          "En cas d'absence justifiée de son enfant, la démarche la plus appropriée pour le parent est de :",
        choix: [
          "Modifier lui-même le registre d'appel",
          "Adresser un message via la messagerie d'EduWeb Planner et joindre un justificatif",
          "Supprimer l'absence depuis le bulletin",
          "Ne rien faire, le système se corrige automatiquement",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le parent ne peut pas modifier le registre d'appel. La voie correcte est d'envoyer un message justificatif via la messagerie de l'application.",
      },
      {
        question:
          "Avant le premier conseil de classe, quelle source consulter en priorité pour préparer un échange avec le professeur principal ?",
        choix: [
          "Le bulletin trimestriel et le registre d'appel",
          "Uniquement le cahier de texte",
          "L'emploi du temps de la semaine en cours",
          "La liste des manuels scolaires",
        ],
        bonneReponseIndex: 0,
        explication:
          "Le bulletin trimestriel offre la synthèse des résultats et le registre d'appel renseigne sur l'assiduité : ces deux documents constituent la meilleure base de discussion.",
      },
      {
        question: "Pour protéger l'espace parent EduWeb Planner, la bonne pratique est de :",
        choix: [
          "Partager son mot de passe avec l'enfant pour faciliter l'accès",
          "Conserver le mot de passe initial sans le modifier",
          "Personnaliser le mot de passe et activer les alertes de connexion",
          "Désactiver toutes les notifications du compte",
        ],
        bonneReponseIndex: 2,
        explication:
          "Personnaliser son mot de passe dès la première connexion et activer les alertes de connexion permet de sécuriser l'accès aux données scolaires de l'enfant.",
      },
    ],
    exercice: {
      titre: "Mise en situation : Suivi de la scolarité de votre enfant sur EduWeb Planner",
      introduction:
        "Vous êtes parent d'un élève inscrit dans un établissement utilisant EduWeb Planner. Vous disposez de votre identifiant parent et accédez à l'espace dédié pour suivre la scolarité de votre enfant et communiquer avec l'équipe pédagogique. Les deux scénarios suivants vous placent dans des situations concrètes du quotidien d'un parent connecté.",
      scenarios: [
        {
          niveau: "de base",
          contexte:
            "Vous venez de recevoir vos identifiants de connexion à EduWeb Planner remis par le secrétariat de l'établissement. Votre enfant est en classe de 5e. Vous souhaitez vérifier son emploi du temps de la semaine, consulter ses dernières notes et prendre connaissance du cahier de texte pour anticiper ses devoirs à la maison.",
          consignes: [
            "Vous connecter à votre espace parent avec les identifiants reçus et changer votre mot de passe initial.",
            "Ouvrir le profil de votre enfant et consulter son emploi du temps hebdomadaire.",
            "Accéder au cahier de texte pour relever les devoirs à effectuer et les leçons à apprendre.",
            "Consulter les dernières notes saisies par les enseignants dans la grille d'évaluation.",
            "Activer les alertes SMS pour recevoir une notification en cas d'absence ou de nouvelle note.",
          ],
          criteresEvaluation: [
            "Connexion réussie et mot de passe personnalisé enregistré.",
            "Emploi du temps et cahier de texte correctement consultés et exploités.",
            "Compréhension des notes affichées dans la grille d'évaluation.",
            "Paramétrage effectif des alertes SMS sur le profil parent.",
            "Autonomie démontrée dans la navigation au sein de l'espace parent.",
          ],
        },
        {
          niveau: "approfondi",
          contexte:
            "Le premier trimestre vient de s'achever. Vous avez constaté une baisse de résultats dans deux matières et plusieurs retards signalés dans le registre d'appel. Le bulletin trimestriel a été publié et un rendez-vous avec le professeur principal est nécessaire. Votre établissement propose par ailleurs un abonnement Académie Premium offrant un suivi pédagogique renforcé.",
          consignes: [
            "Télécharger le bulletin trimestriel et le livret scolaire de votre enfant depuis votre espace.",
            "Analyser le registre d'appel pour identifier les retards et absences signalés sur le trimestre.",
            "Solliciter un rendez-vous en ligne avec le professeur principal via le module dédié.",
            "Rédiger un message à l'enseignant concerné pour justifier une absence et demander un point pédagogique.",
            "Consulter l'offre Académie Premium et identifier les services additionnels pertinents pour votre enfant.",
            "Préparer 3 questions concrètes à poser lors du rendez-vous, appuyées sur les données du bulletin.",
          ],
          criteresEvaluation: [
            "Exploitation rigoureuse du bulletin et du livret scolaire pour identifier les points faibles.",
            "Lecture correcte du registre d'appel et des informations d'assiduité.",
            "Demande de rendez-vous correctement formulée et confirmée dans l'agenda.",
            "Qualité, courtoisie et clarté du message adressé à l'enseignant.",
            "Pertinence des questions préparées et compréhension de l'offre Académie Premium.",
          ],
        },
      ],
    },
    syntheseFormative: [
      {
        question:
          "Quelles fonctionnalités d'EduWeb Planner allez-vous mobiliser en priorité pour suivre la scolarité de votre enfant au quotidien ?",
      },
      {
        question:
          "Comment articulerez-vous la consultation du cahier de texte, du registre d'appel et de la grille d'évaluation dans votre routine hebdomadaire ?",
      },
      {
        question: "Quels critères vous aideront à décider d'un éventuel abonnement à l'Académie Premium ?",
      },
      {
        question:
          "Comment comptez-vous utiliser les alertes SMS et la prise de rendez-vous pour renforcer le dialogue avec l'équipe pédagogique ?",
      },
      {
        question:
          "Quelles bonnes pratiques retiendrez-vous pour protéger la confidentialité de votre espace parent et des données de votre enfant ?",
      },
    ],
  },

  inspecteur: {
    roleKey: "inspecteur",
    roleLabel: "Inspecteur",
    moduleCode: "M03",
    preTest: [
      {
        question:
          "Décrivez en quelques lignes les missions principales d'un Inspecteur dans un dispositif numérique de suivi scolaire tel qu'EduWeb Planner.",
      },
      {
        question:
          "Quels documents pédagogiques numériques consulteriez-vous en priorité pour préparer une visite d'inspection et pourquoi ?",
      },
      {
        question:
          "Comment distingueriez-vous un registre d'appel et un cahier de texte du point de vue de leur valeur d'indicateur pédagogique ?",
      },
      {
        question:
          "Selon vous, quel intérêt présente une Académie Premium pour la conduite d'inspections thématiques sur plusieurs établissements ?",
      },
      {
        question:
          "Citez deux usages possibles des alertes SMS dans le cadre d'un accompagnement post-inspection d'enseignants.",
      },
    ],
    qcm: [
      {
        question:
          "Dans EduWeb Planner, quel outil permet à l'Inspecteur de vérifier la régularité de la présence des élèves d'une classe sur une période donnée ?",
        choix: [
          "Le cahier de texte",
          "Le registre d'appel",
          "Le livret scolaire",
          "La grille d'évaluation",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le registre d'appel consigne les présences et absences quotidiennes ; il constitue la source officielle pour mesurer l'assiduité d'une classe.",
      },
      {
        question:
          "Quelle ressource consulteriez-vous en priorité pour vérifier la progression pédagogique réellement menée par l'enseignant ?",
        choix: ["Le bulletin", "Le registre d'appel", "Le cahier de texte", "Les alertes SMS"],
        bonneReponseIndex: 2,
        explication:
          "Le cahier de texte trace les contenus enseignés séance par séance et permet d'apprécier la progression effective au regard de la programmation prévue.",
      },
      {
        question:
          "Dans le cadre d'une inspection thématique multi-établissements, quelle fonctionnalité d'EduWeb Planner est la plus adaptée ?",
        choix: [
          "Le compte parent unique",
          "L'Académie Premium",
          "Le bulletin individuel",
          "Le rendez-vous parent-professeur",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'Académie Premium agrège plusieurs établissements et fournit aux Inspecteurs des tableaux de bord transversaux indispensables aux inspections thématiques.",
      },
      {
        question: "Que vérifie en priorité un Inspecteur sur le livret scolaire d'un élève ?",
        choix: [
          "La taille de la photo de l'élève",
          "La conformité des appréciations et des compétences renseignées",
          "Le nombre de connexions des parents",
          "Le coût d'impression du livret",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le livret scolaire est un document officiel ; l'Inspecteur en contrôle la conformité, la complétude et la qualité des appréciations et compétences renseignées.",
      },
      {
        question:
          "Quel élément constitue un indicateur fiable de la cohérence d'évaluation au sein d'un établissement ?",
        choix: [
          "L'uniformité des grilles d'évaluation utilisées par les enseignants",
          "Le nombre d'alertes SMS envoyées aux parents",
          "La date d'édition des bulletins",
          "La couleur du livret scolaire",
        ],
        bonneReponseIndex: 0,
        explication:
          "L'harmonisation des grilles d'évaluation entre enseignants assure la comparabilité et l'équité des notations, élément clé contrôlé lors des inspections.",
      },
      {
        question:
          "Lorsqu'un Inspecteur souhaite échanger formellement avec un enseignant après une visite, quel outil de la plateforme privilégier ?",
        choix: [
          "La grille d'évaluation",
          "Le bulletin",
          "Le rendez-vous",
          "Le registre d'appel",
        ],
        bonneReponseIndex: 2,
        explication:
          "Le module de rendez-vous permet une prise de contact tracée et planifiée, adaptée à la restitution post-inspection.",
      },
      {
        question:
          "Quel usage des alertes SMS est le plus pertinent pour un Inspecteur encadrant plusieurs établissements ?",
        choix: [
          "Rappeler aux enseignants les échéances de saisie des bulletins",
          "Communiquer son numéro de téléphone personnel",
          "Diffuser des publicités commerciales",
          "Notifier les élèves de leurs résultats",
        ],
        bonneReponseIndex: 0,
        explication:
          "Les alertes SMS pilotées par l'Inspecteur visent à fluidifier la chaîne de production des bulletins en rappelant les échéances administratives aux équipes.",
      },
      {
        question:
          "Lors de la lecture d'un bulletin trimestriel, sur quoi porte d'abord le regard de l'Inspecteur ?",
        choix: [
          "La police de caractère utilisée",
          "La cohérence entre les moyennes, les appréciations et la grille d'évaluation",
          "Le format papier du bulletin",
          "Le mode de paiement de la scolarité",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'Inspecteur s'assure de l'alignement entre la note chiffrée, l'appréciation littérale et la grille d'évaluation utilisée, garant de la fiabilité du bulletin.",
      },
      {
        question:
          "Quel est l'intérêt principal de la centralisation des données dans une Académie Premium pour un Inspecteur ?",
        choix: [
          "Réduire le coût des fournitures scolaires",
          "Comparer les pratiques entre établissements via des indicateurs harmonisés",
          "Imprimer plus rapidement les manuels",
          "Remplacer les visites de terrain",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'Académie Premium offre une vision consolidée et comparée des indicateurs pédagogiques, sans toutefois se substituer aux visites de terrain.",
      },
      {
        question:
          "Quel principe déontologique l'Inspecteur doit-il respecter en consultant à distance les registres et cahiers de texte ?",
        choix: [
          "Diffuser publiquement les constats sur les réseaux sociaux",
          "Respecter la confidentialité des données et la protection de la vie privée",
          "Modifier directement les notes erronées",
          "Supprimer les saisies jugées inutiles",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'accès privilégié aux données pédagogiques engage l'Inspecteur à une stricte confidentialité et au respect de la protection des données personnelles.",
      },
    ],
    exercice: {
      titre: "Mission d'inspection pédagogique et de contrôle qualité via EduWeb Planner",
      introduction:
        "Ces deux mises en situation vous placent dans des situations d'inspection courantes. Vous y mobiliserez les outils d'EduWeb Planner pour observer, contrôler et accompagner les pratiques pédagogiques de votre circonscription.",
      scenarios: [
        {
          niveau: "de base",
          contexte:
            "Vous êtes Inspecteur de l'enseignement primaire. Vous préparez une visite-conseil dans une école de votre circonscription. Vous souhaitez consulter à distance, via EduWeb Planner, l'état du registre d'appel et du cahier de texte de la classe de CE2 sur les quatre dernières semaines, afin d'orienter votre entretien avec l'enseignant.",
          consignes: [
            "Connectez-vous à EduWeb Planner avec votre profil Inspecteur et sélectionnez l'établissement concerné dans votre périmètre",
            "Ouvrez le registre d'appel de la classe ciblée et identifiez le taux d'absentéisme sur les quatre dernières semaines",
            "Consultez le cahier de texte de la classe et vérifiez la régularité des saisies ainsi que la cohérence avec la progression officielle",
            "Repérez au moins deux points forts et deux points d'amélioration observables dans les données consultées",
            "Rédigez une courte note de visite préparatoire (10 lignes maximum) reprenant vos constats",
            "Planifiez un rendez-vous avec l'enseignant via le module dédié pour restituer vos observations",
          ],
          criteresEvaluation: [
            "Le périmètre d'inspection et la classe sont correctement sélectionnés",
            "Le registre d'appel et le cahier de texte sont analysés avec des indicateurs précis (taux, fréquence, dates)",
            "Les constats distinguent des éléments objectifs et observables, sans jugement de valeur",
            "Le rendez-vous est correctement planifié avec l'enseignant via la fonctionnalité dédiée",
            "La note préparatoire est structurée et exploitable lors de la visite",
          ],
        },
        {
          niveau: "approfondi",
          contexte:
            "À la suite d'une vague de signalements de parents concernant la qualité des bulletins et l'irrégularité des notes saisies, votre Académie Premium vous mandate pour mener une inspection thématique sur trois établissements. Vous devez croiser les grilles d'évaluation utilisées, vérifier la conformité des livrets scolaires et accompagner les équipes via des alertes SMS ciblées.",
          consignes: [
            "Constituez un échantillon représentatif de trois classes par établissement à partir de votre tableau de bord Inspecteur",
            "Analysez les grilles d'évaluation employées et leur conformité avec le référentiel officiel chargé dans l'Académie Premium",
            "Contrôlez la cohérence entre les notes saisies, les bulletins générés et les livrets scolaires édités sur le trimestre",
            "Identifiez les enseignants en difficulté et programmez des rendez-vous individualisés via la messagerie de la plateforme",
            "Configurez des alertes SMS pour rappeler aux équipes les échéances de saisie et de validation des bulletins",
            "Produisez un rapport de synthèse intégrant constats, recommandations et plan d'accompagnement à court terme",
          ],
          criteresEvaluation: [
            "L'échantillonnage est justifié et représentatif des établissements inspectés",
            "La conformité des grilles d'évaluation et des livrets scolaires est documentée avec précision",
            "Les écarts entre notes, bulletins et livrets sont relevés et hiérarchisés",
            "Les alertes SMS sont paramétrées de manière pertinente (cible, échéance, message)",
            "Le rapport propose un plan d'accompagnement concret, mesurable et assorti d'un calendrier",
          ],
        },
      ],
    },
    syntheseFormative: [
      {
        question:
          "En quoi l'usage régulier d'EduWeb Planner modifie-t-il votre posture d'Inspecteur par rapport à une inspection traditionnelle sur site ?",
      },
      {
        question:
          "Quels indicateurs issus du registre d'appel, du cahier de texte et des bulletins jugez-vous les plus pertinents pour caractériser la qualité pédagogique d'une classe ?",
      },
      {
        question:
          "Comment articulez-vous l'usage des alertes SMS et du module de rendez-vous pour construire un accompagnement individualisé des enseignants ?",
      },
      {
        question:
          "Quelles précautions éthiques et déontologiques retenez-vous concernant la consultation à distance des données scolaires des élèves ?",
      },
      {
        question:
          "Quel plan d'action personnel vous fixez-vous pour intégrer EduWeb Planner dans vos pratiques d'inspection au cours des trois prochains mois ?",
      },
    ],
  },

  conseiller_pedagogique: {
    roleKey: "conseiller_pedagogique",
    roleLabel: "Conseiller pédagogique",
    moduleCode: "M04",
    preTest: [
      {
        question:
          "Selon vous, quelles sont les trois principales missions d'un Conseiller pédagogique dans un établissement scolaire ?",
      },
      {
        question:
          "Quelle différence faites-vous entre un cahier de texte et un registre d'appel dans la pratique quotidienne d'une classe ?",
      },
      {
        question:
          "Comment vérifiez-vous habituellement la cohérence d'un bulletin scolaire avant sa diffusion aux familles ?",
      },
      {
        question:
          "Quels outils numériques utilisez-vous actuellement pour accompagner les enseignants dans leurs pratiques d'évaluation ?",
      },
      {
        question:
          "Quels indicateurs jugez-vous pertinents pour mesurer la qualité du suivi pédagogique d'une classe sur un trimestre ?",
      },
    ],
    qcm: [
      {
        question:
          "Dans EduWeb Planner, quel outil le Conseiller pédagogique consulte-t-il en priorité pour vérifier la traçabilité des contenus enseignés par un professeur ?",
        choix: [
          "Le registre d'appel",
          "Le cahier de texte",
          "Le bulletin scolaire",
          "La grille d'évaluation",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le cahier de texte consigne séance par séance les contenus enseignés, les devoirs donnés et les supports utilisés. C'est l'outil de référence pour vérifier la traçabilité pédagogique.",
      },
      {
        question:
          "Quel module d'EduWeb Planner permet d'enregistrer la présence des élèves et de déclencher automatiquement des alertes SMS aux familles ?",
        choix: [
          "Le cahier de texte",
          "Le livret scolaire",
          "Le registre d'appel",
          "La grille d'évaluation",
        ],
        bonneReponseIndex: 2,
        explication:
          "Le registre d'appel centralise les présences et absences ; couplé aux alertes SMS, il permet d'informer immédiatement les familles en cas d'absence non justifiée.",
      },
      {
        question:
          "Quelle fonctionnalité avancée est associée à l'abonnement Académie Premium et utile au Conseiller pédagogique ?",
        choix: [
          "La saisie manuelle des notes au format papier",
          "La consolidation et la comparaison inter-classes des résultats",
          "L'envoi de SMS publicitaires aux familles",
          "L'impression couleur gratuite des bulletins",
        ],
        bonneReponseIndex: 1,
        explication:
          "L'Académie Premium offre des tableaux de bord consolidés permettant de comparer les classes et d'identifier les écarts pédagogiques, fonction essentielle au pilotage par le Conseiller pédagogique.",
      },
      {
        question:
          "Pour planifier un entretien individuel avec un enseignant, le Conseiller pédagogique utilise dans EduWeb Planner :",
        choix: [
          "Le module de rendez-vous intégré",
          "Le cahier de texte de la classe",
          "Le registre d'appel des élèves",
          "Le bulletin de l'enseignant",
        ],
        bonneReponseIndex: 0,
        explication:
          "Le module de rendez-vous permet de proposer des créneaux, d'envoyer des invitations et d'assurer la traçabilité des entretiens pédagogiques.",
      },
      {
        question: "Le livret scolaire se distingue du bulletin par le fait qu'il :",
        choix: [
          "Ne contient que les absences de l'élève",
          "Est un document annuel qui retrace l'ensemble du parcours et des compétences acquises",
          "Remplace le registre d'appel en fin d'année",
          "Est exclusivement destiné à l'enseignant principal",
        ],
        bonneReponseIndex: 1,
        explication:
          "Le livret scolaire est un document de synthèse annuel ou pluriannuel attestant des compétences acquises, alors que le bulletin est ponctuel (trimestriel ou semestriel).",
      },
      {
        question:
          "Lors d'un audit des pratiques d'évaluation, quel outil le Conseiller pédagogique examine-t-il pour vérifier la pondération des compétences ?",
        choix: [
          "Les alertes SMS",
          "Le registre d'appel",
          "La grille d'évaluation",
          "Le module de rendez-vous",
        ],
        bonneReponseIndex: 2,
        explication:
          "La grille d'évaluation définit les critères et la pondération des compétences évaluées. Son examen est central pour harmoniser les pratiques.",
      },
      {
        question:
          "Avant un conseil de classe, le Conseiller pédagogique souhaite vérifier la cohérence des bulletins. Quelle démarche est la plus appropriée ?",
        choix: [
          "Comparer manuellement chaque copie d'élève",
          "Consulter les bulletins consolidés dans EduWeb Planner et vérifier la cohérence avec les grilles d'évaluation",
          "Demander aux parents leur avis par alertes SMS",
          "Modifier directement les notes dans le registre d'appel",
        ],
        bonneReponseIndex: 1,
        explication:
          "La démarche professionnelle consiste à exploiter les bulletins consolidés et à les confronter aux grilles d'évaluation pour garantir cohérence et équité.",
      },
      {
        question: "Les alertes SMS dans EduWeb Planner servent principalement à :",
        choix: [
          "Communiquer en temps réel avec les familles sur les absences ou situations préoccupantes",
          "Remplacer les bulletins scolaires",
          "Effectuer la saisie du cahier de texte",
          "Archiver les livrets scolaires",
        ],
        bonneReponseIndex: 0,
        explication:
          "Les alertes SMS assurent une communication rapide avec les familles, notamment sur les absences, retards ou situations nécessitant une attention immédiate.",
      },
      {
        question:
          "Quel est le bon ordre d'intervention du Conseiller pédagogique face à un dysfonctionnement repéré dans la tenue du cahier de texte ?",
        choix: [
          "Sanctionner l'enseignant immédiatement",
          "Constater via EduWeb Planner, puis planifier un rendez-vous d'accompagnement et formuler des recommandations",
          "Informer directement les parents par alertes SMS",
          "Modifier soi-même le cahier de texte à la place de l'enseignant",
        ],
        bonneReponseIndex: 1,
        explication:
          "La posture professionnelle du Conseiller pédagogique repose sur le constat objectif, le dialogue par rendez-vous et l'accompagnement par des recommandations, et non sur la sanction ou la substitution.",
      },
      {
        question:
          "Pour harmoniser les pratiques d'évaluation entre plusieurs classes de même niveau, le Conseiller pédagogique s'appuie en priorité sur :",
        choix: [
          "Le registre d'appel de chaque classe",
          "Les alertes SMS envoyées aux familles",
          "Un modèle commun de grille d'évaluation et les tableaux de bord Académie Premium",
          "Le livret scolaire individuel de chaque élève",
        ],
        bonneReponseIndex: 2,
        explication:
          "L'harmonisation passe par la définition d'une grille d'évaluation commune et l'analyse comparative offerte par les tableaux de bord de l'Académie Premium.",
      },
    ],
    exercice: {
      titre: "Mise en situation : Le conseiller pédagogique en action",
      introduction:
        "Vous êtes Conseiller pédagogique au sein d'un établissement utilisateur d'EduWeb Planner. Votre mission est d'accompagner les enseignants dans la qualité de leurs pratiques, de superviser les outils pédagogiques numériques (cahier de texte, registre d'appel, grille d'évaluation) et de veiller à la cohérence des bulletins et livrets scolaires. Les deux scénarios suivants vous placent dans des situations professionnelles concrètes que vous pouvez rencontrer en cours d'année scolaire.",
      scenarios: [
        {
          niveau: "de base",
          contexte:
            "En début de second trimestre, le chef d'établissement vous demande de vérifier la régularité de la tenue du cahier de texte et du registre d'appel pour la classe de 6e B. Plusieurs parents ont signalé, via les alertes SMS, des absences non justifiées. Vous disposez d'un accès Conseiller pédagogique sur EduWeb Planner et devez produire un constat objectif avant un entretien avec l'enseignant titulaire.",
          consignes: [
            "Vous connectez à EduWeb Planner avec votre profil Conseiller pédagogique et accédez au tableau de bord de la classe de 6e B.",
            "Vous consultez le cahier de texte de la classe sur les quatre dernières semaines et vous repérez les séances non renseignées.",
            "Vous ouvrez le registre d'appel pour identifier les absences signalées et croisez-les avec les alertes SMS envoyées aux familles.",
            "Vous générez un rapport synthétique (taux de remplissage du cahier de texte, taux d'absentéisme, alertes SMS déclenchées).",
            "Vous planifiez un rendez-vous avec l'enseignant titulaire via le module de prise de rendez-vous d'EduWeb Planner.",
            "Vous formalisez par écrit trois recommandations concrètes pour améliorer la tenue des outils.",
          ],
          criteresEvaluation: [
            "Exactitude des données extraites du cahier de texte et du registre d'appel.",
            "Pertinence du croisement entre absences enregistrées et alertes SMS effectivement envoyées.",
            "Clarté et lisibilité du rapport synthétique produit.",
            "Recommandations formulées de manière bienveillante et opérationnelle.",
            "Utilisation correcte du module de rendez-vous pour planifier l'entretien.",
          ],
        },
        {
          niveau: "approfondi",
          contexte:
            "Fin du second trimestre. Le conseil de classe approche et vous avez constaté que plusieurs enseignants de 3e utilisent des grilles d'évaluation hétérogènes, ce qui produit des bulletins peu cohérents et complique la rédaction des livrets scolaires. L'établissement dispose d'un abonnement Académie Premium activé, permettant un suivi pédagogique avancé et la consolidation inter-classes.",
          consignes: [
            "Vous auditez, dans EduWeb Planner, les grilles d'évaluation utilisées par les enseignants de 3e et identifiez les écarts de structure et de pondération.",
            "Vous mobilisez les fonctionnalités Académie Premium pour comparer les distributions de notes inter-classes et repérer les anomalies statistiques.",
            "Vous proposez un modèle harmonisé de grille d'évaluation, conforme aux exigences du livret scolaire et du bulletin trimestriel.",
            "Vous planifiez une série de rendez-vous individuels avec chaque enseignant concerné via le module dédié, accompagnés d'un message d'accompagnement.",
            "Vous préparez une note pédagogique de cadrage à diffuser aux enseignants avant le conseil de classe.",
            "Vous vérifiez la cohérence des bulletins et livrets scolaires générés après l'harmonisation, en activant les alertes SMS pour les familles dont l'élève présente une situation préoccupante.",
          ],
          criteresEvaluation: [
            "Qualité de l'audit : exhaustivité et finesse de l'analyse des écarts entre grilles d'évaluation.",
            "Exploitation pertinente des fonctionnalités Académie Premium pour étayer le diagnostic.",
            "Conformité du modèle harmonisé proposé avec les exigences du livret scolaire et du bulletin.",
            "Posture professionnelle dans la communication avec les enseignants (rendez-vous, note de cadrage).",
            "Cohérence finale des bulletins et usage maîtrisé des alertes SMS auprès des familles.",
          ],
        },
      ],
    },
    syntheseFormative: [
      {
        question:
          "Au terme de ce module, quelles fonctionnalités d'EduWeb Planner vous semblent désormais incontournables dans votre pratique de Conseiller pédagogique, et pourquoi ?",
      },
      {
        question:
          "Comment comptez-vous articuler l'usage du cahier de texte, du registre d'appel et de la grille d'évaluation pour produire un diagnostic pédagogique fiable ?",
      },
      {
        question:
          "En quoi l'abonnement Académie Premium modifie-t-il votre capacité à piloter la qualité pédagogique de l'établissement ?",
      },
      {
        question:
          "Quelle posture professionnelle adopterez-vous lors d'un rendez-vous d'accompagnement consécutif au constat d'un dysfonctionnement, et comment EduWeb Planner peut-il soutenir cette démarche ?",
      },
      {
        question:
          "Quelles précautions éthiques et déontologiques jugez-vous nécessaires dans l'usage des alertes SMS et de la consultation des bulletins et livrets scolaires des élèves ?",
      },
    ],
  },
};

/** Index général + grille de progression à 6 paliers. */
export const TRAINING_PROGRESSION: ManuelProgression = {
  indexGeneral: [
    {
      terme: "Académie Premium",
      definition:
        "Offre d'abonnement payante donnant accès aux fonctionnalités avancées (export PDF, statistiques étendues, branding personnalisé).",
      references: ["Syllabus", "M01", "M02"],
    },
    {
      terme: "Administrateur Système",
      definition:
        "Rôle responsable du paramétrage technique, de la gestion des comptes et des droits sur la plateforme.",
      references: ["M01"],
    },
    {
      terme: "Année scolaire",
      definition:
        "Période académique de référence structurant le calendrier des évaluations et des inscriptions.",
      references: ["Syllabus", "M01", "M02"],
    },
    {
      terme: "Appréciation",
      definition:
        "Commentaire qualitatif porté par l'enseignant ou le conseil de classe sur le travail de l'élève.",
      references: ["M05", "M02"],
    },
    {
      terme: "Armoiries",
      definition: "Emblème officiel du pays apposé sur les documents institutionnels exportés.",
      references: ["Syllabus", "M01"],
    },
    {
      terme: "Attestation",
      definition:
        "Document officiel certifiant un statut, une scolarité ou une réussite, généré depuis la plateforme.",
      references: ["Syllabus", "M02", "M03"],
    },
    {
      terme: "Avis (diffusion d')",
      definition: "Communication officielle adressée à un public ciblé via la messagerie interne.",
      references: ["Syllabus", "M02", "M06"],
    },
    {
      terme: "Branding (charte)",
      definition: "Identité graphique pays/établissement appliquée automatiquement aux exports PDF.",
      references: ["M01", "M02"],
    },
    {
      terme: "Bulletin scolaire",
      definition: "Document périodique restituant les notes, moyennes et appréciations d'un élève.",
      references: ["Syllabus", "M02", "M05", "M07"],
    },
    {
      terme: "Cachet",
      definition: "Sceau officiel de l'établissement apposé sur les documents exportés.",
      references: ["M01", "M02"],
    },
    {
      terme: "CAFOP",
      definition:
        "Centre d'Animation et de Formation Pédagogique, structure autonome de formation initiale des enseignants.",
      references: ["M01", "M03", "M04"],
    },
    {
      terme: "Cahier de texte",
      definition:
        "Registre numérique consignant les contenus enseignés et les devoirs donnés par l'enseignant.",
      references: ["M05", "M06"],
    },
    {
      terme: "Circonscription",
      definition:
        "Échelon territorial de pilotage pédagogique placé sous la responsabilité d'un inspecteur.",
      references: ["M03"],
    },
    {
      terme: "Classe",
      definition: "Unité pédagogique regroupant les élèves d'un même niveau dans un établissement.",
      references: ["M02", "M05", "M06"],
    },
    {
      terme: "Coefficient",
      definition: "Valeur pondérant le poids d'une matière dans le calcul de la moyenne.",
      references: ["Syllabus", "M02", "M05"],
    },
    {
      terme: "Conseil de classe",
      definition: "Instance périodique délibérant sur les résultats et le comportement des élèves.",
      references: ["M02", "M05", "M06"],
    },
    {
      terme: "Conseiller pédagogique",
      definition: "Cadre chargé de l'accompagnement et de la formation continue des enseignants.",
      references: ["M04"],
    },
    {
      terme: "Cycle scolaire",
      definition:
        "Ensemble de niveaux regroupés selon une cohérence pédagogique (préscolaire, primaire, secondaire).",
      references: ["Syllabus", "M01", "M02"],
    },
    {
      terme: "Devise nationale",
      definition: "Formule officielle du pays imprimée sur l'en-tête des documents exportés.",
      references: ["M01"],
    },
    {
      terme: "Direction régionale",
      definition: "Échelon administratif déconcentré pilotant un ensemble de circonscriptions.",
      references: ["Syllabus", "M03"],
    },
    {
      terme: "Éducateur",
      definition:
        "Personnel de vie scolaire chargé du suivi de la discipline, des absences et de l'encadrement des élèves.",
      references: ["M06"],
    },
    {
      terme: "Élève",
      definition:
        "Apprenant inscrit dans un établissement et disposant d'un espace personnel sur la plateforme.",
      references: ["M08"],
    },
    {
      terme: "Emploi du temps",
      definition: "Planification hebdomadaire des séances de cours par classe et par enseignant.",
      references: ["M02", "M05", "M08"],
    },
    {
      terme: "Enseignant",
      definition:
        "Personnel pédagogique responsable de la saisie des notes, du cahier de texte et des appréciations.",
      references: ["M05"],
    },
    {
      terme: "Espace de travail",
      definition:
        "Interface personnalisée selon le rôle, regroupant les fonctionnalités accessibles à l'utilisateur.",
      references: ["Syllabus", "M01"],
    },
    {
      terme: "Établissement",
      definition:
        "Unité organisationnelle (école, collège, lycée) gérée de manière autonome dans la plateforme.",
      references: ["M01", "M02"],
    },
    {
      terme: "Évaluation (période d')",
      definition: "Intervalle de temps borné pendant lequel les notes sont saisies et arrêtées.",
      references: ["Syllabus", "M02", "M05"],
    },
    {
      terme: "Export PDF",
      definition: "Génération d'un document imprimable avec mise en page officielle.",
      references: ["M01", "M02", "M05"],
    },
    {
      terme: "Facturation",
      definition:
        "Module de gestion des abonnements, reçus et règlements liés à l'Académie Premium.",
      references: ["M01", "M02"],
    },
    {
      terme: "i18n (internationalisation)",
      definition:
        "Mécanisme permettant le basculement entre les langues d'interface (français, anglais).",
      references: ["Syllabus", "M01"],
    },
    {
      terme: "Inspecteur",
      definition:
        "Cadre chargé du contrôle pédagogique et de la rédaction des rapports d'inspection.",
      references: ["M03"],
    },
    {
      terme: "Inspection (rapport d')",
      definition: "Document officiel produit à l'issue d'une visite de classe.",
      references: ["Syllabus", "M03", "M04"],
    },
    {
      terme: "Livret scolaire",
      definition: "Document de suivi pluriannuel consolidant le parcours de l'élève.",
      references: ["Syllabus", "M02", "M05", "M07"],
    },
    {
      terme: "Logo établissement",
      definition: "Visuel identitaire propre à l'établissement, intégré aux en-têtes des documents.",
      references: ["M01", "M02"],
    },
    {
      terme: "Matière",
      definition: "Discipline enseignée, associée à un coefficient et à un enseignant titulaire.",
      references: ["M02", "M05"],
    },
    {
      terme: "Messagerie interne",
      definition: "Outil de communication sécurisée entre acteurs de la plateforme.",
      references: ["Syllabus", "M02", "M06", "M07"],
    },
    {
      terme: "Moyenne",
      definition:
        "Résultat agrégé d'un élève pour une matière ou une période, pondéré par les coefficients.",
      references: ["M02", "M05"],
    },
    {
      terme: "Niveau",
      definition: "Échelon d'un cycle scolaire (CP1, 6e, Terminale, etc.).",
      references: ["M01", "M02"],
    },
    {
      terme: "Notification",
      definition: "Alerte envoyée à l'utilisateur pour signaler un événement ou une action attendue.",
      references: ["Syllabus", "M06", "M07"],
    },
    {
      terme: "Parent d'élève",
      definition: "Représentant légal disposant d'un espace de consultation du suivi de son enfant.",
      references: ["M07"],
    },
    {
      terme: "Périmètre fonctionnel",
      definition: "Étendue des données et fonctionnalités accessibles selon le rôle de l'utilisateur.",
      references: ["Syllabus", "M01"],
    },
    {
      terme: "Périscolaire",
      definition: "Activités encadrées hors temps d'enseignement, suivies par la vie scolaire.",
      references: ["M06"],
    },
    {
      terme: "Protocole de communication",
      definition: "Règles formelles encadrant la diffusion d'avis et les échanges institutionnels.",
      references: ["Syllabus", "M02", "M06"],
    },
    {
      terme: "RBAC",
      definition:
        "Contrôle d'accès basé sur les rôles, garantissant que chacun n'accède qu'à son périmètre.",
      references: ["M01"],
    },
    {
      terme: "Registre d'appel",
      definition: "Document numérique consignant la présence et les absences des élèves par séance.",
      references: ["M05", "M06"],
    },
    {
      terme: "Sanction",
      definition: "Mesure disciplinaire enregistrée par l'éducateur dans le dossier de l'élève.",
      references: ["M06"],
    },
    {
      terme: "Signature numérique",
      definition: "Empreinte du chef d'établissement apposée sur les documents officiels exportés.",
      references: ["M01", "M02"],
    },
    {
      terme: "Statistiques (tableau de bord)",
      definition: "Synthèse chiffrée des résultats et indicateurs à différents niveaux d'agrégation.",
      references: ["Syllabus", "M02", "M03"],
    },
    {
      terme: "Suivi pédagogique",
      definition: "Accompagnement individualisé de la progression d'un élève ou d'une classe.",
      references: ["M04", "M05", "M07"],
    },
    {
      terme: "Tableau de bord",
      definition: "Interface d'accueil présentant les indicateurs clés du rôle connecté.",
      references: ["Syllabus", "M02", "M03"],
    },
    {
      terme: "Trimestre",
      definition: "Période d'évaluation de référence dans les cycles francophones.",
      references: ["M02", "M05"],
    },
    {
      terme: "Utilisateur",
      definition:
        "Toute personne disposant d'un compte d'accès à la plateforme, quel que soit son rôle.",
      references: ["M01"],
    },
    {
      terme: "Vie scolaire",
      definition:
        "Service de l'établissement chargé de l'encadrement, de la discipline et du suivi des absences.",
      references: ["M06"],
    },
    {
      terme: "Visite de classe",
      definition: "Observation pédagogique conduite par l'inspecteur ou le conseiller pédagogique.",
      references: ["M03", "M04"],
    },
  ],
  grilleProgression: [
    {
      palier: 1,
      niveau: "Découverte",
      descripteur:
        "L'apprenant identifie la plateforme EduWeb Planner, reconnaît son rôle attribué et localise son espace de travail ainsi que le sélecteur de langue.",
    },
    {
      palier: 2,
      niveau: "Initiation",
      descripteur:
        "L'apprenant se connecte de manière autonome, navigue dans les menus de son périmètre et consulte les données qui le concernent (notes, emploi du temps, bulletins) sans assistance.",
    },
    {
      palier: 3,
      niveau: "Application guidée",
      descripteur:
        "Avec un support écrit ou un formateur, l'apprenant réalise les opérations courantes de son rôle (saisie de notes, génération d'un bulletin, diffusion d'un avis) en respectant le protocole.",
    },
    {
      palier: 4,
      niveau: "Application autonome",
      descripteur:
        "L'apprenant exécute seul l'ensemble des tâches relevant de son périmètre, paramètre une période d'évaluation ou une grille de coefficients, et produit les documents officiels avec la charte graphique attendue.",
    },
    {
      palier: 5,
      niveau: "Optimisation",
      descripteur:
        "L'apprenant exploite les tableaux de bord statistiques pour analyser les résultats, anticiper les difficultés et ajuster les paramètres (cycles, coefficients, communications) afin d'améliorer la qualité du suivi pédagogique.",
    },
    {
      palier: 6,
      niveau: "Transmission/Mentorat",
      descripteur:
        "L'apprenant forme et accompagne ses pairs, conçoit des procédures internes pour son établissement ou sa circonscription et garantit la conformité des usages au protocole institutionnel.",
    },
  ],
};

/** Liste d'abréviations utilisée par la page de manuel. */
export const TRAINING_ABBREVIATIONS: { code: string; meaning: string }[] = [
  { code: "APFC", meaning: "Antenne Pédagogique de Formation Continue" },
  { code: "CAFOP", meaning: "Centre d'Animation et de Formation Pédagogique" },
  {
    code: "DRENA",
    meaning: "Direction Régionale de l'Éducation Nationale et de l'Alphabétisation",
  },
  { code: "IGE", meaning: "Inspection Générale de l'Éducation" },
  { code: "MENA", meaning: "Ministère de l'Éducation Nationale et de l'Alphabétisation" },
  { code: "RBAC", meaning: "Role-Based Access Control — contrôle d'accès basé sur les rôles" },
  { code: "QCM", meaning: "Questionnaire à Choix Multiples" },
  { code: "SaaS", meaning: "Software as a Service — logiciel proposé en mode service" },
  { code: "PDF", meaning: "Portable Document Format — format de document portable" },
  { code: "CSV", meaning: "Comma-Separated Values — fichier de données tabulaires" },
  { code: "SMS", meaning: "Short Message Service — message texte court" },
  { code: "i18n", meaning: "Internationalisation (basculement multilingue)" },
];
