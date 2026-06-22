import type { GuideContent } from "@/components/guides/guide-layout";

/**
 * Guide pratique du Chauffeur de car.
 *
 * Guide opérationnel et concret : comment se connecter, être désigné conducteur,
 * activer le mode conducteur et émettre la position du car en temps réel, en sécurité.
 * Style « détaillé » : théorie courte + exemple concret + pas-à-pas.
 */
export const guideTransportChauffeur: Omit<GuideContent, "icon"> = {
  roleKey: "transport_chauffeur",
  roleLabel: "Chauffeur de car",
  meta: {
    level: "Débutant",
    duration: "25 min",
    targetAudience:
      "Chauffeur du car de transport scolaire chargé d'émettre la position du car en temps réel pour que les parents et l'établissement suivent le trajet.",
    context:
      "À lire avant la première utilisation, puis à garder à portée de main pour la routine quotidienne (départ matin, départ soir).",
  },
  objectives: [
    "Comprendre votre mission : rendre le trajet du car visible en temps réel, en toute sécurité.",
    "Accéder à votre espace Transport après connexion.",
    "Être désigné « conducteur » par l'établissement et savoir pourquoi c'est nécessaire.",
    "Activer le mode conducteur, choisir votre car et émettre la position pendant les créneaux.",
    "Adopter les bons réflexes de sécurité au volant.",
  ],
  prerequisites: [
    "Disposer d'un compte au rôle « Chauffeur de car » activé.",
    "Avoir été désigné « conducteur » par le chef d'établissement ou l'administrateur.",
    "Utiliser un téléphone avec GPS et une connexion mobile.",
    "Installer un support téléphone fixe dans la cabine.",
  ],
  chapters: [
    {
      id: "mission",
      title: "1. Votre mission",
      intro:
        "Votre rôle dépasse la conduite : en partageant la position du car, vous rassurez les familles et permettez à chacun d'être prêt à l'arrêt au bon moment. Cette visibilité est un service de sécurité.",
      sections: [
        {
          title: "Ce que vous apportez et ce dont vous avez besoin",
          body:
            "Pendant les créneaux (matin, soir), votre téléphone partage la position GPS du car. Les parents abonnés voient le car avancer sur une carte et savent quand sortir. Pour cela, il vous faut un compte chauffeur, une désignation comme « conducteur », et le GPS autorisé sur votre téléphone.",
          example:
            "M. Yao conduit le car 01. Chaque matin, avant de démarrer, il active le partage : la maman d'Awa voit le car approcher de l'arrêt et fait sortir sa fille pile à l'heure, sans attendre dehors inutilement.",
          steps: [
            {
              instruction: "Connectez-vous à EduWeb Planner avec votre compte chauffeur.",
            },
            {
              instruction: "Ouvrez votre espace Transport.",
              navigation: "Vie scolaire → Transport d'élèves",
            },
          ],
        },
      ],
    },
    {
      id: "designation",
      title: "2. Être désigné conducteur",
      intro:
        "Avoir un compte chauffeur ne suffit pas à émettre une position : l'établissement doit d'abord vous désigner. Cette étape de sécurité garantit que seuls les conducteurs autorisés diffusent la position d'un car.",
      sections: [
        {
          title: "Comment se fait la désignation",
          body:
            "Le chef d'établissement (ou l'administrateur) ajoute votre adresse e-mail à la liste des « conducteurs désignés » de l'établissement. Une fois désigné, le bouton « Mode conducteur » apparaît dans votre espace Transport. Sans désignation, ce bouton n'apparaît pas — c'est normal.",
          example:
            "M. Yao vient d'être recruté. Tant que l'établissement n'a pas ajouté son e-mail aux conducteurs désignés, il ne voit pas le bouton « Mode conducteur ». Dès que c'est fait, le bouton apparaît à sa prochaine ouverture de page.",
          steps: [
            {
              instruction:
                "Communiquez à l'établissement l'e-mail exact de votre compte chauffeur.",
            },
            {
              instruction:
                "Demandez au chef d'établissement de vous « Désigner conducteur » dans le panneau des conducteurs.",
              tip: "Si le bouton « Mode conducteur » n'apparaît pas, c'est que la désignation n'est pas encore faite : recontactez l'établissement.",
            },
          ],
          caveat:
            "Seuls les conducteurs désignés peuvent émettre une position. C'est une protection : elle empêche n'importe qui de diffuser la position d'un car.",
        },
      ],
    },
    {
      id: "emettre",
      title: "3. Émettre la position du car",
      intro:
        "C'est le geste quotidien. Bien fait, il est simple et automatique : vous l'activez avant de partir, et le système s'occupe du reste pendant le créneau.",
      sections: [
        {
          title: "Activer le mode conducteur et choisir son car",
          body:
            "Dans votre espace Transport, le bouton « Mode conducteur » lance le partage. Vous choisissez votre car, vous autorisez la localisation, et le statut passe à « Émission en cours » pendant les créneaux d'émission. Hors créneau, rien n'est diffusé : inutile de couper manuellement.",
          example:
            "À 6 h 30, M. Yao ouvre la page, appuie sur « Mode conducteur », choisit « Car 01 », autorise le GPS. Le bandeau affiche « Émission en cours ». Il pose le téléphone sur son support et démarre. À l'arrivée à l'école, le créneau se termine et l'émission s'arrête seule.",
          steps: [
            {
              instruction:
                "Avant de démarrer, appuyez sur « Mode conducteur ».",
              navigation: "Vie scolaire → Transport d'élèves",
            },
            {
              instruction: "Choisissez votre car dans « Votre car ».",
            },
            {
              instruction:
                "Autorisez la localisation (GPS) si le téléphone le demande.",
              tip: "Vérifiez le bandeau : « Émission en cours » (vert) = tout va bien ; « Hors créneau » = vous êtes en dehors des heures d'émission.",
            },
            {
              instruction:
                "Activez les alertes (cloche) si vous voulez le bip de rappel au début du créneau.",
            },
          ],
          bestPractices: [
            "Activez le mode conducteur AVANT de démarrer, jamais en roulant.",
            "Gardez le téléphone branché ou bien chargé : le GPS consomme de la batterie.",
            "Placez le téléphone sur son support, écran visible, pour vérifier d'un coup d'œil.",
          ],
          caveat:
            "Si « Position GPS indisponible » s'affiche, autorisez la localisation dans les réglages du téléphone, puis réactivez le mode conducteur.",
        },
      ],
    },
    {
      id: "securite",
      title: "4. Sécurité au volant",
      intro:
        "Aucune fonctionnalité ne passe avant la sécurité. Le partage de position est conçu pour être « activer puis oublier » : une fois lancé, il n'exige aucune manipulation en roulant.",
      sections: [
        {
          title: "Les réflexes indispensables",
          body:
            "Toute manipulation du téléphone se fait à l'arrêt. Une fois le mode conducteur activé avant le départ, vous n'avez plus rien à toucher : concentrez-vous sur la route et les élèves.",
          example:
            "Un parent appelle pour demander où est le car : M. Yao ne répond pas en roulant. Le parent voit de toute façon la position en direct sur sa carte — c'est justement à cela que sert l'émission.",
          steps: [
            {
              instruction:
                "Réglez tout (mode conducteur, car, GPS) à l'arrêt, avant de partir.",
            },
            {
              instruction:
                "En cas de problème technique, arrêtez-vous en sécurité avant de manipuler le téléphone.",
              tip: "Ne consultez jamais l'écran en conduisant : la position s'émet seule, vous n'avez rien à faire.",
            },
          ],
        },
      ],
    },
    {
      id: "centre-formation",
      title: "5. Centre de formation",
      intro:
        "Le Centre de formation réunit le présent guide pratique et, selon vos inscriptions, des ressources de formation.",
      sections: [
        {
          title: "Accéder au Centre de formation et à votre guide",
          body:
            "Depuis l'Aide, vous retrouvez le guide Chauffeur de car (celui-ci) à tout moment. Le guide s'ouvre automatiquement selon votre rôle : gardez-le en favori pour la routine quotidienne.",
          steps: [
            {
              instruction: "Ouvrez le Centre de formation.",
              navigation: "Accueil → Aide",
            },
            {
              instruction:
                "Repérez la section des guides utilisateurs et ouvrez le guide Chauffeur de car.",
            },
          ],
        },
      ],
    },
  ],
  faq: [
    {
      question: "Je ne vois pas le bouton « Mode conducteur ». Pourquoi ?",
      answer:
        "Parce que vous n'avez pas encore été désigné « conducteur » par l'établissement. Communiquez l'e-mail de votre compte au chef d'établissement et demandez-lui de vous désigner ; le bouton apparaîtra ensuite.",
    },
    {
      question: "Dois-je couper l'émission à l'arrivée ?",
      answer:
        "Non. L'émission ne fonctionne que pendant les créneaux définis : hors créneau, rien n'est diffusé. Vous pouvez toutefois désactiver le mode conducteur si vous le souhaitez.",
    },
    {
      question: "Le message « Position GPS indisponible » s'affiche.",
      answer:
        "Autorisez la localisation pour EduWeb Planner dans les réglages de votre téléphone (et activez le GPS), puis réappuyez sur « Mode conducteur ».",
    },
    {
      question: "Est-ce que je peux manipuler tout ça en roulant ?",
      answer:
        "Jamais. Activez tout à l'arrêt, avant de partir. Une fois lancé, le partage est automatique : vous n'avez plus rien à toucher.",
    },
  ],
  glossary: [
    {
      term: "Conducteur désigné",
      definition:
        "Chauffeur autorisé par l'établissement (via son e-mail) à émettre la position d'un car. Seuls les conducteurs désignés peuvent diffuser une position.",
    },
    {
      term: "Mode conducteur",
      definition:
        "Bouton de votre espace Transport qui lance le partage de la position GPS de votre car pendant les créneaux.",
    },
    {
      term: "Créneau d'émission",
      definition:
        "Plage horaire (matin, soir) pendant laquelle la position du car est diffusée. Hors créneau, rien n'est émis.",
    },
    {
      term: "Émission en cours",
      definition:
        "Statut vert indiquant que la position de votre car est bien partagée en temps réel.",
    },
    {
      term: "Bip de rappel",
      definition:
        "Alerte sonore optionnelle au début d'un créneau, pour vous signaler le moment d'émettre.",
    },
  ],
};
