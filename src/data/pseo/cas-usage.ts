import { PSEOPageData } from "./types";

export const casUsage: PSEOPageData[] = [
  {
    slug: "envoyer-contrat-signature",
    metaTitle: "Comment envoyer un contrat à signer en sécurité | Airlock",
    metaDescription:
      "Envoyez vos contrats confidentiels pour signature avec un lien sécurisé, protégé par mot de passe et à durée limitée. Gardez le contrôle total sur vos documents juridiques.",
    title: "Envoyez vos contrats en toute sécurité pour signature",
    subtitle:
      "Un contrat contient des informations sensibles : montants, clauses de confidentialité, données personnelles des signataires. L'envoyer par email classique, c'est perdre tout contrôle sur sa diffusion.",
    problemTitle:
      "Les risques d'envoyer un contrat par email ou WeTransfer",
    problemContent:
      "Un contrat envoyé en pièce jointe peut être transféré à des tiers sans votre consentement, stocké indéfiniment sur des serveurs tiers, ou intercepté en transit. Vous n'avez aucune visibilité sur qui a ouvert le document, ni quand. En cas de litige, impossible de prouver que le destinataire a bien reçu et consulté le contrat, ou qu'il n'a pas été altéré entre-temps.",
    solutionTitle:
      "Envoyez vos contrats avec un lien sécurisé et traçable via Airlock",
    solutionContent:
      "Avec Airlock, vous déposez votre contrat dans un dossier dédié et générez un lien sécurisé avec mot de passe et date d'expiration. Le destinataire consulte le document en ligne sans pouvoir le redistribuer librement. Vous recevez une notification à chaque consultation et pouvez révoquer l'accès à tout moment si les négociations évoluent.",
    features: [
      {
        title: "Lien à expiration automatique",
        description:
          "Définissez une date limite d'accès au contrat. Passé ce délai, le lien devient inactif automatiquement, idéal pour les périodes de négociation.",
      },
      {
        title: "Protection par mot de passe",
        description:
          "Ajoutez un mot de passe que vous communiquez séparément au signataire, garantissant que seul le destinataire légitime accède au contrat.",
      },
      {
        title: "Traçabilité des consultations",
        description:
          "Consultez l'historique complet des accès : date, heure, localisation géographique et nombre de vues. Utile en cas de contestation.",
      },
      {
        title: "Révocation instantanée",
        description:
          "Si les termes du contrat changent ou si la négociation est annulée, révoquez l'accès en un clic pour empêcher toute consultation ultérieure.",
      },
    ],
    useCases: [
      {
        title: "1. Préparez votre contrat dans un dossier dédié",
        description:
          "Créez un dossier nommé par exemple « Contrat - Client Dupont » dans votre espace Airlock, puis importez le fichier PDF du contrat. Vous pouvez y ajouter les annexes associées si nécessaire.",
      },
      {
        title: "2. Générez un lien sécurisé avec les bonnes restrictions",
        description:
          "Cliquez sur « Partager » et configurez le lien : activez la protection par mot de passe, fixez une expiration à 7 jours, et limitez le nombre de consultations à 5 pour éviter la diffusion non contrôlée.",
      },
      {
        title: "3. Envoyez le lien et le mot de passe séparément",
        description:
          "Transmettez le lien par email professionnel et le mot de passe par SMS ou messagerie instantanée. Cette séparation des canaux renforce considérablement la sécurité de la transmission.",
      },
      {
        title: "4. Suivez la consultation et relancez si nécessaire",
        description:
          "Depuis votre tableau de bord Airlock, vérifiez si le destinataire a ouvert le contrat. S'il ne l'a pas consulté après 48h, vous pouvez le relancer en toute connaissance de cause.",
      },
    ],
    faqs: [
      {
        question:
          "Le destinataire peut-il télécharger le contrat ou seulement le consulter en ligne ?",
        answer:
          "Vous choisissez : lors de la création du lien, vous pouvez autoriser ou interdire le téléchargement. Pour un contrat en cours de négociation, nous recommandons la consultation en ligne uniquement.",
      },
      {
        question:
          "Comment prouver que le destinataire a bien consulté le contrat ?",
        answer:
          "Airlock enregistre chaque accès avec la date, l'heure et la géolocalisation approximative. Vous pouvez exporter cet historique comme preuve de consultation.",
      },
      {
        question:
          "Que se passe-t-il si j'envoie une mauvaise version du contrat ?",
        answer:
          "Vous pouvez révoquer le lien immédiatement, remplacer le fichier dans le dossier, puis générer un nouveau lien sécurisé. L'ancien lien ne fonctionnera plus.",
      },
      {
        question: "Est-ce conforme au RGPD pour les données personnelles du contrat ?",
        answer:
          "Oui. Les fichiers sont stockés sur Cloudflare R2 avec chiffrement, les accès sont tracés, et vous gardez le contrôle total sur la durée de conservation et la suppression des données.",
      },
    ],
    relatedPages: [
      { href: "/pour/notaires", label: "Airlock pour les notaires" },
      { href: "/alternative/wetransfer", label: "Alternative sécurisée à WeTransfer" },
      { href: "/glossaire/lien-securise", label: "Qu'est-ce qu'un lien sécurisé ?" },
    ],
  },
  {
    slug: "partager-documents-due-diligence",
    metaTitle: "Partager des documents de due diligence en sécurité | Airlock",
    metaDescription:
      "Créez une data room sécurisée pour votre due diligence. Partagez bilans, contrats et documents juridiques avec un contrôle total sur les accès et la traçabilité.",
    title: "Partagez vos documents de due diligence en toute confidentialité",
    subtitle:
      "La due diligence implique le partage de documents hautement sensibles avec des tiers : investisseurs, auditeurs, acquéreurs potentiels. Chaque fuite peut compromettre une opération entière.",
    problemTitle:
      "Les dangers du partage non sécurisé lors d'une due diligence",
    problemContent:
      "Lors d'une due diligence, des dizaines de documents confidentiels circulent entre plusieurs parties : bilans financiers, contrats commerciaux, brevets, litiges en cours. Utiliser un simple drive partagé ou des emails expose ces informations à des fuites incontrôlées. Sans traçabilité, vous ne savez pas qui a consulté quoi, ni si des documents ont été partagés en dehors du cercle autorisé. Une fuite pendant une acquisition peut faire échouer l'opération ou réduire drastiquement la valorisation.",
    solutionTitle:
      "Créez votre data room sécurisée avec Airlock pour la due diligence",
    solutionContent:
      "Airlock vous permet de structurer vos documents par catégories (financier, juridique, RH, propriété intellectuelle) dans des dossiers dédiés. Pour chaque partie prenante, vous générez un lien unique avec des permissions spécifiques : certains auditeurs peuvent télécharger, d'autres uniquement consulter en ligne. Chaque accès est horodaté et géolocalisé, vous offrant une vision complète de l'activité sur votre data room.",
    features: [
      {
        title: "Liens individuels par partie prenante",
        description:
          "Créez un lien distinct pour chaque investisseur ou auditeur avec des permissions adaptées. Révoquez l'accès d'une seule partie sans affecter les autres.",
      },
      {
        title: "Quota de vues",
        description:
          "Limitez le nombre de consultations par lien pour empêcher le partage non autorisé d'un lien de due diligence à des tiers non prévus.",
      },
      {
        title: "Accès dossier complet",
        description:
          "Partagez l'intégralité d'un dossier structuré en une seule opération, permettant au destinataire de naviguer dans l'arborescence documentaire.",
      },
      {
        title: "Tableau de bord analytique",
        description:
          "Visualisez en temps réel qui consulte vos documents, combien de temps, et depuis quelle localisation. Identifiez les parties les plus engagées.",
      },
    ],
    useCases: [
      {
        title: "1. Structurez votre data room par catégories",
        description:
          "Créez des sous-dossiers thématiques : « Financier », « Juridique », « RH », « Propriété intellectuelle ». Importez les documents correspondants dans chaque catégorie pour faciliter la navigation des auditeurs.",
      },
      {
        title: "2. Attribuez un lien unique à chaque partie prenante",
        description:
          "Pour chaque cabinet d'audit ou investisseur, générez un lien avec des paramètres adaptés : expiration en fin de période de due diligence, mot de passe dédié, et permissions de téléchargement selon le niveau de confiance.",
      },
      {
        title: "3. Surveillez l'activité en temps réel",
        description:
          "Depuis le tableau de bord, observez quels documents sont consultés et par qui. Cela vous permet d'identifier les points d'intérêt des investisseurs et d'anticiper leurs questions.",
      },
      {
        title: "4. Clôturez proprement la data room",
        description:
          "Une fois la due diligence terminée, révoquez tous les liens en un clic. Les documents restent dans votre espace mais deviennent inaccessibles aux parties externes, conformément aux bonnes pratiques RGPD.",
      },
    ],
    faqs: [
      {
        question:
          "Combien de documents puis-je partager dans une data room Airlock ?",
        answer:
          "Il n'y a pas de limite sur le nombre de fichiers. Vous pouvez structurer votre data room avec autant de dossiers et sous-dossiers que nécessaire pour couvrir l'ensemble du périmètre de due diligence.",
      },
      {
        question:
          "Puis-je donner des accès différents à chaque investisseur ?",
        answer:
          "Oui, chaque lien est indépendant. Vous pouvez autoriser le téléchargement pour un cabinet d'audit tout en limitant un autre investisseur à la consultation en ligne uniquement.",
      },
      {
        question:
          "Comment savoir si un investisseur a bien consulté tous les documents ?",
        answer:
          "Le tableau de bord analytique d'Airlock affiche le nombre de vues par document et par lien. Vous pouvez ainsi vérifier l'avancement de la revue documentaire de chaque partie.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/data-room", label: "Qu'est-ce qu'une data room ?" },
      { href: "/pour/startups", label: "Airlock pour les startups" },
      { href: "/cas-usage/data-room-levee-de-fonds", label: "Data room pour levée de fonds" },
    ],
  },
  {
    slug: "transferer-fichiers-volumineux",
    metaTitle: "Transférer des fichiers volumineux en sécurité | Airlock",
    metaDescription:
      "Envoyez des fichiers lourds (vidéos, maquettes, archives) de manière sécurisée avec un lien protégé, sans limite de taille et sans passer par un service tiers non contrôlé.",
    title: "Transférez vos fichiers volumineux sans compromettre leur sécurité",
    subtitle:
      "Envoyer un fichier de plusieurs gigaoctets par email est impossible. Les services de transfert gratuits manquent de confidentialité et de contrôle. Il existe une meilleure approche.",
    problemTitle:
      "Les limites et risques des services de transfert classiques",
    problemContent:
      "Les services gratuits comme WeTransfer ou Smash stockent vos fichiers sur des serveurs dont vous ne contrôlez ni la localisation ni la sécurité. Vos données sont accessibles via un lien public sans authentification, parfois indexé par les moteurs de recherche. De plus, vous n'avez aucune traçabilité : impossible de savoir si le bon destinataire a téléchargé le fichier, ou si le lien a été partagé à des tiers non autorisés.",
    solutionTitle:
      "Transférez vos fichiers volumineux avec Airlock : rapide, sécurisé, traçable",
    solutionContent:
      "Airlock utilise le stockage Cloudflare R2 pour permettre l'upload direct de fichiers volumineux sans limite pratique de taille. Le transfert s'effectue via des URL pré-signées, garantissant rapidité et sécurité. Le destinataire accède au fichier via un lien protégé par mot de passe et à expiration automatique, et chaque téléchargement est enregistré dans votre historique.",
    features: [
      {
        title: "Upload direct vers Cloudflare R2",
        description:
          "Les fichiers sont envoyés directement au stockage cloud via des URL pré-signées, sans transiter par le serveur applicatif. Résultat : des transferts rapides même pour des fichiers de plusieurs Go.",
      },
      {
        title: "Lien d'expiration paramétrable",
        description:
          "Définissez la durée de vie du lien de téléchargement : 24h, 7 jours, 30 jours. Passé ce délai, le fichier reste dans votre espace mais le lien externe est désactivé.",
      },
      {
        title: "Notification de téléchargement",
        description:
          "Recevez une notification dès que le destinataire télécharge le fichier. Vous savez exactement quand le transfert est effectif, sans avoir à demander confirmation.",
      },
      {
        title: "Stockage chiffré sur Cloudflare R2",
        description:
          "Vos fichiers sont stockés avec chiffrement au repos sur l'infrastructure Cloudflare, offrant une sécurité de niveau entreprise sans configuration complexe.",
      },
    ],
    useCases: [
      {
        title: "1. Importez votre fichier volumineux dans Airlock",
        description:
          "Glissez-déposez votre fichier (vidéo, archive ZIP, maquette 3D) dans un dossier de votre espace Airlock. L'upload s'effectue directement vers Cloudflare R2 pour une vitesse optimale.",
      },
      {
        title: "2. Configurez les paramètres de partage",
        description:
          "Générez un lien sécurisé avec les options adaptées : autorisation de téléchargement activée, expiration à 48h pour un transfert ponctuel, et mot de passe si le contenu est sensible.",
      },
      {
        title: "3. Transmettez le lien au destinataire",
        description:
          "Envoyez le lien par le canal de votre choix (email, messagerie). Le destinataire clique et accède directement au fichier, sans créer de compte ni installer d'application.",
      },
      {
        title: "4. Vérifiez la réception et nettoyez",
        description:
          "Consultez votre tableau de bord pour confirmer le téléchargement. Une fois le transfert effectué, vous pouvez révoquer le lien ou supprimer le fichier de votre espace pour libérer du stockage.",
      },
    ],
    faqs: [
      {
        question:
          "Quelle est la taille maximale de fichier supportée par Airlock ?",
        answer:
          "Airlock utilise des uploads multi-parts vers Cloudflare R2, permettant le transfert de fichiers de plusieurs gigaoctets. La limite dépend de votre plan, mais les fichiers volumineux sont pris en charge nativement.",
      },
      {
        question:
          "Le transfert est-il plus rapide qu'avec WeTransfer ?",
        answer:
          "L'upload s'effectue directement vers Cloudflare R2 via des URL pré-signées, sans passer par un serveur intermédiaire. Cloudflare dispose d'un réseau mondial de CDN, ce qui garantit des débits optimaux pour l'upload comme le téléchargement.",
      },
      {
        question:
          "Le destinataire doit-il créer un compte pour télécharger ?",
        answer:
          "Non. Le destinataire clique sur le lien, saisit le mot de passe si vous en avez défini un, puis télécharge directement le fichier. Aucun compte n'est requis.",
      },
      {
        question:
          "Mes fichiers sont-ils supprimés automatiquement après le transfert ?",
        answer:
          "Non, vos fichiers restent dans votre espace Airlock tant que vous ne les supprimez pas manuellement. Seul le lien de partage expire, pas le fichier lui-même.",
      },
    ],
    relatedPages: [
      { href: "/alternative/wetransfer", label: "Alternative sécurisée à WeTransfer" },
      { href: "/alternative/smash", label: "Alternative sécurisée à Smash" },
      { href: "/glossaire/url-presignee", label: "Qu'est-ce qu'une URL pré-signée ?" },
    ],
  },
  {
    slug: "data-room-levee-de-fonds",
    metaTitle: "Créer une data room pour levée de fonds | Airlock",
    metaDescription:
      "Organisez votre data room pour une levée de fonds : partagez pitch deck, cap table et prévisionnels avec vos investisseurs dans un espace sécurisé et traçable.",
    title: "Créez votre data room sécurisée pour votre levée de fonds",
    subtitle:
      "Une levée de fonds implique de partager vos données les plus stratégiques avec des investisseurs potentiels. La façon dont vous organisez et sécurisez ces documents dit beaucoup sur votre rigueur.",
    problemTitle:
      "Les erreurs classiques lors du partage de documents pour une levée",
    problemContent:
      "Trop de startups partagent leur pitch deck, cap table et prévisionnels financiers via un simple Google Drive ou Dropbox partagé. Résultat : aucun contrôle sur qui accède aux documents, impossibilité de savoir quel VC a réellement étudié le dossier, et risque de fuite de données stratégiques vers des concurrents. Pire, un lien Dropbox partagé peut être transféré sans votre consentement à d'autres fonds ou analystes non autorisés.",
    solutionTitle:
      "Gérez votre levée de fonds avec une data room Airlock professionnelle",
    solutionContent:
      "Airlock vous permet de créer une data room structurée spécifiquement pour votre levée. Chaque investisseur reçoit un lien unique avec des permissions calibrées : consultation seule du pitch deck en premier tour, puis accès élargi aux financiers détaillés en second tour. Vous suivez en temps réel l'engagement de chaque VC et pouvez révoquer l'accès individuellement si un investisseur se retire du processus.",
    features: [
      {
        title: "Un lien unique par investisseur",
        description:
          "Chaque VC ou business angel reçoit son propre lien avec ses propres permissions. Vous identifiez précisément qui consulte vos documents et pouvez couper l'accès individuellement.",
      },
      {
        title: "Suivi d'engagement en temps réel",
        description:
          "Visualisez le nombre de consultations par investisseur, les documents les plus consultés, et le temps passé. Identifiez les VCs les plus intéressés pour concentrer vos efforts.",
      },
      {
        title: "Accès progressif par étapes",
        description:
          "En premier contact, partagez uniquement le pitch deck. Après un premier échange positif, élargissez l'accès aux prévisionnels et à la cap table avec un nouveau lien sur le même dossier.",
      },
      {
        title: "Révocation sélective",
        description:
          "Si un investisseur décline ou si vous ne souhaitez plus poursuivre avec un fonds, révoquez son lien en un clic sans impacter les autres parties prenantes.",
      },
    ],
    useCases: [
      {
        title: "1. Structurez votre data room par étapes de la levée",
        description:
          "Créez des dossiers thématiques : « Pitch Deck », « Financiers », « Cap Table & Pacte », « Juridique ». Cette structure permet de partager progressivement les documents selon l'avancement des discussions avec chaque investisseur.",
      },
      {
        title: "2. Préparez les liens pour le premier tour de contact",
        description:
          "Pour chaque investisseur ciblé, générez un lien donnant accès uniquement au dossier « Pitch Deck » avec consultation en ligne uniquement (pas de téléchargement), un mot de passe, et une expiration à 14 jours.",
      },
      {
        title: "3. Élargissez l'accès pour les investisseurs qualifiés",
        description:
          "Après un premier échange positif, créez un nouveau lien pour l'investisseur concerné donnant accès au dossier complet (financiers, cap table). Autorisez le téléchargement pour faciliter l'analyse par leur équipe d'investissement.",
      },
      {
        title: "4. Clôturez la data room après le closing",
        description:
          "Une fois la levée bouclée, révoquez l'ensemble des liens de partage. Conservez les documents et l'historique des consultations dans votre espace comme archive de la levée.",
      },
    ],
    faqs: [
      {
        question:
          "Combien d'investisseurs puis-je inviter dans ma data room ?",
        answer:
          "Il n'y a pas de limite. Chaque investisseur reçoit un lien individuel avec ses propres paramètres. Vous pouvez gérer des dizaines de liens simultanément depuis votre tableau de bord.",
      },
      {
        question:
          "Un investisseur peut-il partager le lien avec d'autres fonds ?",
        answer:
          "Vous pouvez limiter cela avec un quota de vues (par exemple 10 consultations maximum) et la protection par mot de passe. Si vous observez un nombre de vues anormal, vous pouvez révoquer le lien immédiatement.",
      },
      {
        question:
          "Comment savoir quel investisseur est le plus intéressé ?",
        answer:
          "Le tableau de bord analytique d'Airlock vous montre le nombre de consultations, les documents vus, et les téléchargements pour chaque lien. Un investisseur qui revient plusieurs fois sur vos prévisionnels est probablement en phase d'analyse approfondie.",
      },
      {
        question:
          "Puis-je mettre à jour un document sans changer le lien ?",
        answer:
          "Vous pouvez remplacer un fichier dans le dossier, et le lien existant donnera accès à la version mise à jour. Pour les documents critiques, nous recommandons toutefois de générer un nouveau lien pour garder une traçabilité claire des versions partagées.",
      },
    ],
    relatedPages: [
      { href: "/pour/startups", label: "Airlock pour les startups" },
      { href: "/glossaire/data-room", label: "Qu'est-ce qu'une data room ?" },
      { href: "/alternative/dropbox", label: "Alternative sécurisée à Dropbox" },
    ],
  },
  {
    slug: "partager-bulletins-paie",
    metaTitle: "Partager des bulletins de paie en sécurité | Airlock",
    metaDescription:
      "Transmettez les bulletins de paie à vos salariés de manière sécurisée et conforme au RGPD. Lien individuel, mot de passe, expiration automatique et traçabilité complète.",
    title: "Transmettez les bulletins de paie de manière sécurisée et conforme",
    subtitle:
      "Les bulletins de paie contiennent des données personnelles sensibles : salaire, numéro de sécurité sociale, situation familiale. Leur transmission exige un niveau de sécurité adapté et une conformité RGPD stricte.",
    problemTitle:
      "Les risques de transmettre les fiches de paie par email ou drive partagé",
    problemContent:
      "Envoyer des bulletins de paie en pièce jointe d'un email, c'est exposer les données salariales de vos collaborateurs à des risques d'interception et de stockage non contrôlé. Un email transféré par erreur peut révéler le salaire d'un employé à ses collègues. Un drive partagé mal configuré peut rendre accessibles les fiches de paie de toute l'entreprise. Ces pratiques constituent une violation du RGPD passible de sanctions par la CNIL.",
    solutionTitle:
      "Distribuez les bulletins de paie via des liens individuels sécurisés Airlock",
    solutionContent:
      "Avec Airlock, créez un dossier par salarié et déposez-y son bulletin de paie chaque mois. Générez un lien individuel protégé par mot de passe avec une expiration de 30 jours. Chaque salarié accède uniquement à ses propres documents, et vous disposez d'une preuve de mise à disposition conforme aux obligations légales de conservation.",
    features: [
      {
        title: "Un lien par salarié",
        description:
          "Chaque collaborateur reçoit un lien unique donnant accès uniquement à son dossier personnel. Aucun risque de consultation croisée entre salariés.",
      },
      {
        title: "Conformité RGPD",
        description:
          "Les données sont stockées avec chiffrement, les accès sont tracés et horodatés, et vous gardez le contrôle total sur la durée de conservation des bulletins.",
      },
      {
        title: "Mot de passe individuel",
        description:
          "Protégez chaque lien par un mot de passe communiqué séparément au salarié. Même en cas de transfert accidentel du lien, le bulletin reste inaccessible.",
      },
      {
        title: "Historique de consultation",
        description:
          "Vérifiez que chaque salarié a bien consulté son bulletin. En cas de contestation, vous disposez d'une preuve horodatée de mise à disposition.",
      },
    ],
    useCases: [
      {
        title: "1. Organisez les dossiers par salarié",
        description:
          "Créez un dossier au nom de chaque salarié dans votre espace Airlock (par exemple « Paie - Martin Sophie »). Chaque mois, déposez le bulletin correspondant dans le bon dossier.",
      },
      {
        title: "2. Générez un lien mensuel sécurisé",
        description:
          "Pour chaque salarié, créez un lien vers son dossier avec une expiration à 30 jours, un mot de passe personnel, et la consultation en ligne uniquement (ou avec téléchargement autorisé selon votre politique interne).",
      },
      {
        title: "3. Distribuez les liens de manière sécurisée",
        description:
          "Envoyez le lien par email professionnel et le mot de passe par un canal séparé (SMS, messagerie interne). Vous pouvez automatiser cette étape en utilisant le même mot de passe convenu avec chaque salarié.",
      },
      {
        title: "4. Archivez et contrôlez la conformité",
        description:
          "Les bulletins restent dans votre espace Airlock pour archivage. Consultez l'historique des accès pour vérifier la mise à disposition effective et répondre à toute demande de la CNIL ou des salariés.",
      },
    ],
    faqs: [
      {
        question:
          "Est-ce que cette méthode est conforme au RGPD pour les bulletins de paie ?",
        answer:
          "Oui. Airlock offre le chiffrement des données au repos, la traçabilité des accès, le contrôle de la durée de conservation, et la possibilité de supprimer les données sur demande, conformément aux exigences du RGPD.",
      },
      {
        question:
          "Un salarié peut-il accéder aux bulletins de ses collègues ?",
        answer:
          "Non. Chaque salarié reçoit un lien donnant accès uniquement à son dossier personnel. Les liens sont indépendants et protégés par des mots de passe distincts.",
      },
      {
        question:
          "Combien de temps puis-je conserver les bulletins sur Airlock ?",
        answer:
          "Vous pouvez les conserver aussi longtemps que nécessaire. L'expiration concerne uniquement le lien de partage, pas le fichier lui-même. L'obligation légale de conservation des bulletins est de 5 ans minimum.",
      },
      {
        question:
          "Puis-je gérer les bulletins de paie pour plusieurs dizaines de salariés ?",
        answer:
          "Oui. Airlock permet de créer autant de dossiers et de liens que nécessaire. Pour les entreprises de plus grande taille, la structuration par dossiers individuels reste simple et efficace.",
      },
    ],
    relatedPages: [
      { href: "/pour/ressources-humaines", label: "Airlock pour les ressources humaines" },
      { href: "/glossaire/rgpd", label: "Qu'est-ce que le RGPD ?" },
      { href: "/glossaire/tracabilite-acces", label: "Qu'est-ce que la traçabilité des accès ?" },
    ],
  },
  {
    slug: "envoyer-devis-clients",
    metaTitle: "Envoyer des devis clients en sécurité | Airlock",
    metaDescription:
      "Envoyez vos devis professionnels via un lien sécurisé avec expiration. Suivez les consultations pour savoir quand relancer et protégez vos conditions commerciales.",
    title: "Envoyez vos devis professionnels de manière sécurisée et traçable",
    subtitle:
      "Un devis contient vos tarifs, vos marges et votre stratégie commerciale. Le partager sans contrôle, c'est offrir ces informations à vos concurrents si le destinataire le fait circuler.",
    problemTitle:
      "Pourquoi un devis envoyé par email peut se retourner contre vous",
    problemContent:
      "Un devis envoyé en pièce jointe PDF par email peut facilement être transféré à un concurrent pour faire jouer la concurrence. Vous ne savez jamais si le prospect a réellement ouvert votre devis ou s'il l'a ignoré, rendant vos relances hasardeuses. De plus, un ancien devis avec des tarifs périmés peut resurgir des mois plus tard, créant des malentendus commerciaux difficiles à gérer.",
    solutionTitle:
      "Maîtrisez la diffusion de vos devis avec Airlock",
    solutionContent:
      "Avec Airlock, chaque devis est partagé via un lien à durée de validité limitée, alignée sur la durée de validité du devis lui-même. Vous suivez en temps réel si le prospect a consulté le document, combien de fois, et quand. Passé la date d'expiration, le lien est automatiquement désactivé, évitant qu'un ancien tarif ne soit utilisé comme référence.",
    features: [
      {
        title: "Expiration alignée sur la validité du devis",
        description:
          "Fixez la date d'expiration du lien à la date de validité de votre devis (30, 60, 90 jours). Fini les devis périmés qui circulent encore.",
      },
      {
        title: "Suivi des consultations en temps réel",
        description:
          "Sachez exactement quand votre prospect ouvre le devis. Un prospect qui consulte le devis trois fois en deux jours est probablement sur le point de signer.",
      },
      {
        title: "Consultation en ligne sans téléchargement",
        description:
          "Empêchez le téléchargement pour limiter la redistribution de vos tarifs. Le prospect peut lire le devis en ligne mais ne peut pas l'enregistrer facilement pour le transférer.",
      },
      {
        title: "Quota de vues limité",
        description:
          "Limitez le nombre de consultations pour détecter si le lien a été partagé à des tiers. Un nombre de vues anormalement élevé signale une diffusion non souhaitée.",
      },
    ],
    useCases: [
      {
        title: "1. Créez un dossier par client ou par affaire",
        description:
          "Organisez vos devis dans des dossiers nommés par client ou par projet (« Devis - Société Martin - Refonte site web »). Importez le PDF du devis finalisé.",
      },
      {
        title: "2. Paramétrez le lien selon votre cycle commercial",
        description:
          "Générez un lien avec une expiration correspondant à la validité du devis (par exemple 30 jours). Activez la consultation en ligne uniquement pour limiter la redistribution de vos tarifs.",
      },
      {
        title: "3. Envoyez et surveillez l'engagement du prospect",
        description:
          "Transmettez le lien à votre prospect. Dans les jours suivants, consultez les analytics Airlock : nombre de consultations, date du dernier accès. Ces indicateurs guident votre timing de relance.",
      },
      {
        title: "4. Mettez à jour ou révoquez si nécessaire",
        description:
          "Si vos tarifs changent ou si le projet évolue, révoquez l'ancien lien et générez-en un nouveau avec le devis mis à jour. L'ancien devis n'est plus accessible, évitant toute confusion.",
      },
    ],
    faqs: [
      {
        question:
          "Comment savoir si mon prospect a lu le devis ?",
        answer:
          "Airlock enregistre chaque consultation avec la date et l'heure. Vous pouvez voir dans votre tableau de bord si le prospect a ouvert le lien, combien de fois, et quand a eu lieu la dernière consultation.",
      },
      {
        question:
          "Puis-je empêcher le prospect de télécharger le devis ?",
        answer:
          "Oui. Lors de la création du lien, désactivez l'option de téléchargement. Le prospect pourra uniquement consulter le devis en ligne dans son navigateur.",
      },
      {
        question:
          "Que se passe-t-il si le prospect essaie d'accéder au devis après expiration ?",
        answer:
          "Il verra un message indiquant que le lien a expiré. Vous pouvez ensuite générer un nouveau lien si vous souhaitez prolonger l'offre, éventuellement avec des tarifs mis à jour.",
      },
    ],
    relatedPages: [
      { href: "/pour/freelances", label: "Airlock pour les freelances" },
      { href: "/pour/cabinets-conseil", label: "Airlock pour les cabinets de conseil" },
      { href: "/glossaire/quota-de-vues", label: "Qu'est-ce qu'un quota de vues ?" },
    ],
  },
  {
    slug: "partager-plans-architecturaux",
    metaTitle: "Partager des plans architecturaux en sécurité | Airlock",
    metaDescription:
      "Partagez vos plans, coupes et rendus avec vos clients et artisans via un lien sécurisé. Contrôlez les accès, limitez les téléchargements et protégez votre propriété intellectuelle.",
    title: "Partagez vos plans architecturaux en protégeant votre propriété intellectuelle",
    subtitle:
      "Les plans d'architecture représentent des centaines d'heures de travail et une propriété intellectuelle précieuse. Les partager sans protection, c'est risquer leur réutilisation non autorisée.",
    problemTitle:
      "Les risques de diffuser vos plans sans contrôle d'accès",
    problemContent:
      "Un plan architectural envoyé par email ou via un drive partagé peut être téléchargé, redistribué à un autre architecte, ou réutilisé sur un autre projet sans votre autorisation. Lors d'un appel d'offres, vos plans peuvent être transmis à un concurrent qui propose un tarif inférieur en s'appuyant sur votre travail de conception. Sans traçabilité, vous ne pouvez pas prouver qui a diffusé vos documents ni quand.",
    solutionTitle:
      "Diffusez vos plans architecturaux avec un contrôle total via Airlock",
    solutionContent:
      "Airlock vous permet de partager vos plans avec chaque intervenant du projet (client, bureau d'études, artisans) via des liens distincts aux permissions adaptées. Le client peut consulter en ligne sans télécharger, le bureau d'études peut télécharger les fichiers techniques, et chaque accès est tracé. En fin de projet, vous révoquez tous les accès externes d'un clic.",
    features: [
      {
        title: "Consultation en ligne sans téléchargement",
        description:
          "Partagez vos rendus et plans avec vos clients en mode consultation seule. Ils visualisent les documents dans leur navigateur sans pouvoir les enregistrer ou les redistribuer facilement.",
      },
      {
        title: "Permissions différenciées par intervenant",
        description:
          "Le maître d'ouvrage consulte en ligne, le bureau d'études télécharge les DWG, les artisans accèdent aux plans d'exécution. Chaque lien a ses propres permissions.",
      },
      {
        title: "Traçabilité de la diffusion",
        description:
          "En cas de litige sur la propriété intellectuelle, consultez l'historique complet des accès : qui a consulté ou téléchargé quoi, quand et depuis quelle localisation.",
      },
      {
        title: "Partage de dossier structuré",
        description:
          "Organisez vos livrables par phases (APS, APD, PRO, EXE) dans des sous-dossiers et partagez l'arborescence complète en une seule opération.",
      },
    ],
    useCases: [
      {
        title: "1. Organisez vos livrables par phase de projet",
        description:
          "Créez un dossier par projet (« Villa Martin - Biarritz ») avec des sous-dossiers par phase : Esquisse, APS, APD, PRO, DCE. Importez les plans, coupes, façades et rendus dans les dossiers correspondants.",
      },
      {
        title: "2. Partagez les rendus au client en consultation seule",
        description:
          "Générez un lien pour votre client avec consultation en ligne uniquement et sans téléchargement. Il peut visualiser les plans et rendus pour validation sans pouvoir les redistribuer à un autre architecte.",
      },
      {
        title: "3. Donnez accès aux fichiers techniques aux bureaux d'études",
        description:
          "Créez un lien distinct pour le bureau d'études structure ou fluides avec autorisation de téléchargement des fichiers DWG/IFC. Fixez une expiration correspondant à la phase du projet.",
      },
      {
        title: "4. Diffusez le DCE aux entreprises pour l'appel d'offres",
        description:
          "Créez un lien par entreprise consultée avec un quota de vues et une expiration en fin de période d'appel d'offres. Identifiez les entreprises qui ont réellement étudié le dossier grâce au suivi des consultations.",
      },
    ],
    faqs: [
      {
        question:
          "Puis-je partager des fichiers DWG ou IFC via Airlock ?",
        answer:
          "Oui. Airlock accepte tous les formats de fichiers. Les fichiers DWG, IFC, PDF, et images haute résolution sont pris en charge sans restriction de format.",
      },
      {
        question:
          "Comment protéger mes plans contre la copie lors d'un appel d'offres ?",
        answer:
          "Activez la consultation en ligne uniquement (sans téléchargement), limitez le nombre de vues, et fixez une date d'expiration correspondant à la fin de l'appel d'offres. Chaque accès est tracé et identifiable.",
      },
      {
        question:
          "Puis-je partager des dossiers complets avec toute l'arborescence ?",
        answer:
          "Oui. L'option « Accès dossier » permet au destinataire de naviguer dans l'intégralité de l'arborescence du dossier partagé, y compris les sous-dossiers et tous les fichiers qu'ils contiennent.",
      },
    ],
    relatedPages: [
      { href: "/pour/architectes", label: "Airlock pour les architectes" },
      { href: "/alternative/wetransfer", label: "Alternative sécurisée à WeTransfer" },
      { href: "/glossaire/chiffrement-bout-en-bout", label: "Qu'est-ce que le chiffrement bout en bout ?" },
    ],
  },
  {
    slug: "transmettre-dossier-medical",
    metaTitle: "Transmettre un dossier médical en sécurité | Airlock",
    metaDescription:
      "Transmettez des dossiers médicaux (imagerie, bilans, comptes rendus) entre professionnels de santé de manière sécurisée, traçable et conforme aux obligations de confidentialité.",
    title: "Transmettez les dossiers médicaux de manière sécurisée et conforme",
    subtitle:
      "Les données médicales sont parmi les plus sensibles qui existent. Leur transmission entre professionnels de santé exige un niveau maximal de confidentialité, de traçabilité et de conformité réglementaire.",
    problemTitle:
      "Les violations courantes lors de la transmission de données médicales",
    problemContent:
      "Trop de professionnels de santé transmettent encore des résultats d'examens, imageries médicales et comptes rendus par email non chiffré ou via des clés USB. Ces pratiques exposent les données de santé à des risques d'interception, de perte physique et d'accès non autorisé. La CNIL a sanctionné des établissements de santé pour transmission non sécurisée de données médicales, avec des amendes pouvant atteindre plusieurs centaines de milliers d'euros.",
    solutionTitle:
      "Échangez les dossiers médicaux via Airlock avec traçabilité complète",
    solutionContent:
      "Airlock permet aux professionnels de santé de partager des dossiers médicaux via des liens sécurisés à durée limitée, protégés par mot de passe. Chaque consultation est horodatée et géolocalisée, créant un journal d'audit complet. Les fichiers sont stockés avec chiffrement sur Cloudflare R2, et les liens expirent automatiquement après la période définie, limitant l'exposition des données sensibles.",
    features: [
      {
        title: "Chiffrement des données au repos",
        description:
          "Les dossiers médicaux sont stockés avec chiffrement sur l'infrastructure Cloudflare R2, protégeant les données même en cas d'accès non autorisé au stockage.",
      },
      {
        title: "Expiration courte paramétrable",
        description:
          "Fixez une expiration à 24h ou 48h pour une transmission ponctuelle d'imagerie médicale. Le confrère consulte le dossier rapidement, puis l'accès est automatiquement coupé.",
      },
      {
        title: "Journal d'audit horodaté",
        description:
          "Chaque accès au dossier médical est enregistré avec date, heure et localisation. Ce journal constitue une preuve de conformité en cas de contrôle de la CNIL.",
      },
      {
        title: "Protection par mot de passe obligatoire",
        description:
          "Pour les données de santé, imposez systématiquement un mot de passe communiqué par un canal séparé au professionnel de santé destinataire.",
      },
    ],
    useCases: [
      {
        title: "1. Préparez le dossier médical à transmettre",
        description:
          "Créez un dossier dédié au patient (anonymisé ou avec identifiant interne) et importez les documents à transmettre : imageries DICOM converties en PDF, bilans biologiques, comptes rendus opératoires.",
      },
      {
        title: "2. Configurez un lien à haute sécurité",
        description:
          "Générez un lien avec mot de passe obligatoire, expiration à 48h maximum, consultation en ligne uniquement (pour éviter le stockage local non sécurisé), et un quota de vues limité à 3.",
      },
      {
        title: "3. Transmettez par des canaux séparés",
        description:
          "Envoyez le lien via la messagerie sécurisée de l'établissement et le mot de passe par téléphone ou SMS au confrère. Ne transmettez jamais le lien et le mot de passe par le même canal.",
      },
      {
        title: "4. Vérifiez la réception et supprimez les données",
        description:
          "Consultez le journal d'audit pour confirmer que le confrère a bien accédé au dossier. Une fois la transmission confirmée, vous pouvez supprimer les fichiers de votre espace Airlock pour minimiser la rétention de données de santé.",
      },
    ],
    faqs: [
      {
        question:
          "Airlock est-il conforme aux exigences de la CNIL pour les données de santé ?",
        answer:
          "Airlock offre le chiffrement, la traçabilité des accès, le contrôle de la durée de rétention et la suppression sur demande. Pour les données de santé, nous recommandons de toujours activer le mot de passe et de limiter la durée d'expiration au strict nécessaire.",
      },
      {
        question:
          "Puis-je transmettre des fichiers DICOM via Airlock ?",
        answer:
          "Airlock accepte tous les formats de fichiers. Vous pouvez transmettre des fichiers DICOM, des PDF d'imagerie, des bilans biologiques ou tout autre format utilisé en milieu médical.",
      },
      {
        question:
          "Le professionnel de santé destinataire doit-il créer un compte ?",
        answer:
          "Non. Le destinataire accède au dossier via le lien sécurisé et le mot de passe, sans créer de compte. Cela facilite les échanges ponctuels entre professionnels de santé.",
      },
      {
        question:
          "Comment prouver que j'ai transmis un dossier de manière sécurisée en cas de contrôle ?",
        answer:
          "Le journal d'audit Airlock enregistre la création du lien, ses paramètres de sécurité (mot de passe, expiration), et chaque accès avec horodatage. Cet historique constitue une preuve documentée de transmission sécurisée.",
      },
    ],
    relatedPages: [
      { href: "/pour/medecins", label: "Airlock pour les médecins" },
      { href: "/glossaire/rgpd", label: "Qu'est-ce que le RGPD ?" },
      { href: "/glossaire/chiffrement-bout-en-bout", label: "Qu'est-ce que le chiffrement bout en bout ?" },
    ],
  },
  {
    slug: "partager-rapports-audit",
    metaTitle: "Partager des rapports d'audit en sécurité | Airlock",
    metaDescription:
      "Diffusez vos rapports d'audit financier, conformité ou qualité à vos clients de manière confidentielle. Lien sécurisé, traçabilité et contrôle d'accès granulaire.",
    title: "Partagez vos rapports d'audit en toute confidentialité",
    subtitle:
      "Un rapport d'audit contient des conclusions sensibles sur la santé financière, la conformité ou les faiblesses d'une organisation. Sa diffusion doit être strictement contrôlée.",
    problemTitle:
      "Les conséquences d'une fuite de rapport d'audit",
    problemContent:
      "Un rapport d'audit divulgué avant sa finalisation peut provoquer une panique injustifiée chez les parties prenantes. Un rapport de conformité accessible à des personnes non autorisées peut révéler des failles exploitables. Un audit financier fuité peut impacter le cours de bourse d'une entreprise cotée. Les conséquences d'une diffusion non contrôlée vont de la perte de confiance du client à des poursuites judiciaires pour manquement au secret professionnel.",
    solutionTitle:
      "Diffusez vos rapports d'audit avec Airlock : confidentialité et preuve de remise",
    solutionContent:
      "Airlock vous permet de remettre vos rapports d'audit à chaque destinataire via un lien individuel sécurisé. Vous contrôlez précisément qui peut consulter le rapport, pendant combien de temps, et si le téléchargement est autorisé. Le journal d'audit Airlock vous fournit une preuve horodatée de remise du rapport, indispensable pour votre responsabilité professionnelle.",
    features: [
      {
        title: "Lien nominatif par destinataire",
        description:
          "Générez un lien distinct pour chaque membre du comité d'audit, chaque direction concernée, et le client final. Chaque lien est indépendant et révocable individuellement.",
      },
      {
        title: "Preuve de remise horodatée",
        description:
          "Le journal des accès Airlock constitue une preuve de mise à disposition du rapport avec date, heure et confirmation de consultation par le destinataire.",
      },
      {
        title: "Interdiction de téléchargement",
        description:
          "Forcez la consultation en ligne pour les rapports préliminaires. Les destinataires peuvent lire le rapport mais ne peuvent pas le télécharger pour le redistribuer.",
      },
      {
        title: "Versions successives maîtrisées",
        description:
          "Partagez le rapport préliminaire avec un lien, puis le rapport définitif avec un nouveau lien. Révoquez l'accès à la version préliminaire pour qu'elle ne circule plus.",
      },
    ],
    useCases: [
      {
        title: "1. Préparez le dossier d'audit dans Airlock",
        description:
          "Créez un dossier par mission d'audit (« Audit financier - Société X - 2024 »). Déposez le rapport principal, les annexes techniques et la lettre de recommandations dans des sous-dossiers appropriés.",
      },
      {
        title: "2. Partagez le rapport préliminaire pour revue",
        description:
          "Générez un lien vers le rapport préliminaire pour le client avec consultation en ligne uniquement (pas de téléchargement). Fixez une expiration à 7 jours correspondant à la période de revue contradictoire.",
      },
      {
        title: "3. Diffusez le rapport définitif aux parties prenantes",
        description:
          "Après intégration des observations du client, créez des liens individuels vers le rapport définitif pour chaque destinataire (direction générale, comité d'audit, commissaire aux comptes). Autorisez le téléchargement pour le rapport final.",
      },
      {
        title: "4. Archivez avec la preuve de remise",
        description:
          "Conservez le dossier dans votre espace Airlock avec l'historique complet des accès. Ce journal constitue votre preuve de remise du rapport dans les délais, une pièce essentielle pour votre responsabilité professionnelle.",
      },
    ],
    faqs: [
      {
        question:
          "Comment gérer les versions préliminaire et définitive d'un rapport d'audit ?",
        answer:
          "Déposez chaque version dans un sous-dossier distinct. Partagez la version préliminaire avec un premier lien, puis le rapport définitif avec un nouveau lien. Révoquez le lien de la version préliminaire pour qu'elle ne circule plus après finalisation.",
      },
      {
        question:
          "Le journal d'audit Airlock est-il recevable comme preuve de remise ?",
        answer:
          "Le journal d'audit fournit un horodatage précis des accès avec géolocalisation. Bien que sa valeur probante dépende de la juridiction, il constitue un élément factuel solide pour documenter la remise du rapport.",
      },
      {
        question:
          "Puis-je limiter l'accès au rapport à certains chapitres uniquement ?",
        answer:
          "Oui. Déposez chaque chapitre ou section dans un sous-dossier distinct, et créez des liens différents donnant accès uniquement aux sections pertinentes pour chaque destinataire.",
      },
    ],
    relatedPages: [
      { href: "/pour/experts-comptables", label: "Airlock pour les experts-comptables" },
      { href: "/pour/cabinets-conseil", label: "Airlock pour les cabinets de conseil" },
      { href: "/glossaire/tracabilite-acces", label: "Qu'est-ce que la traçabilité des accès ?" },
    ],
  },
  {
    slug: "envoyer-maquettes-clients",
    metaTitle: "Envoyer des maquettes à vos clients en sécurité | Airlock",
    metaDescription:
      "Présentez vos maquettes design, prototypes et créations à vos clients via un lien sécurisé. Protégez votre travail créatif et contrôlez la diffusion de vos livrables.",
    title: "Envoyez vos maquettes et créations à vos clients en toute sécurité",
    subtitle:
      "Vos maquettes représentent votre savoir-faire créatif et des heures de travail. Les partager sans protection, c'est risquer de les voir copiées, transmises à un concurrent, ou utilisées sans paiement.",
    problemTitle:
      "Les risques de partager vos maquettes via email ou services cloud classiques",
    problemContent:
      "Un designer qui envoie ses maquettes en pièce jointe perd tout contrôle sur leur diffusion. Le client peut les transmettre à un prestataire moins cher pour exécution, ou s'en inspirer sans valider la commande. Sur un drive partagé, les fichiers restent accessibles indéfiniment même après la fin de la collaboration. En cas de non-paiement, vous n'avez aucun levier pour couper l'accès aux livrables déjà transmis.",
    solutionTitle:
      "Présentez vos maquettes avec Airlock : contrôle total et protection créative",
    solutionContent:
      "Avec Airlock, vous présentez vos maquettes via un lien sécurisé en consultation seule : le client visualise les créations en ligne sans pouvoir les télécharger en haute résolution. Vous gardez le contrôle total et ne libérez le téléchargement qu'après validation et paiement. En cas de litige, l'historique des consultations prouve que le client a bien vu les maquettes à une date précise.",
    features: [
      {
        title: "Consultation en ligne haute qualité",
        description:
          "Le client visualise vos maquettes, prototypes et rendus directement dans son navigateur avec une qualité suffisante pour la validation, sans possibilité de télécharger les fichiers source.",
      },
      {
        title: "Libération conditionnelle du téléchargement",
        description:
          "Partagez d'abord en consultation seule pour validation, puis générez un nouveau lien avec téléchargement autorisé après acceptation et paiement du client.",
      },
      {
        title: "Protection par expiration",
        description:
          "Fixez une expiration à la durée de validité de votre proposition créative. Passé ce délai, les maquettes ne sont plus accessibles, vous pouvez alors les proposer à un autre client.",
      },
      {
        title: "Historique comme preuve d'antériorité",
        description:
          "L'historique des consultations Airlock documente la date de première présentation de vos créations, utile en cas de litige sur la propriété intellectuelle.",
      },
    ],
    useCases: [
      {
        title: "1. Organisez vos livrables créatifs par projet",
        description:
          "Créez un dossier par projet client (« Identité visuelle - Startup GreenTech ») avec des sous-dossiers par type de livrable : Logo, Charte graphique, Supports print, Maquettes web. Importez les fichiers de présentation (PNG, PDF).",
      },
      {
        title: "2. Présentez les premières pistes en consultation seule",
        description:
          "Générez un lien vers le dossier avec consultation en ligne uniquement, sans téléchargement. Le client peut naviguer dans les propositions créatives, les commenter par un autre canal, mais ne peut pas les enregistrer.",
      },
      {
        title: "3. Itérez sur les retours avec des versions mises à jour",
        description:
          "Après les retours du client, remplacez les fichiers par les versions corrigées ou ajoutez les nouvelles itérations dans le dossier. Révoquez l'ancien lien et créez-en un nouveau pour que le client voie toujours la dernière version.",
      },
      {
        title: "4. Libérez les fichiers finaux après validation et paiement",
        description:
          "Une fois le projet validé et le paiement reçu, générez un nouveau lien avec téléchargement autorisé donnant accès aux fichiers source (AI, PSD, Figma exports) avec une expiration à 30 jours pour laisser le temps au client de tout récupérer.",
      },
    ],
    faqs: [
      {
        question:
          "Le client peut-il faire des captures d'écran de mes maquettes ?",
        answer:
          "La consultation en ligne n'empêche pas techniquement les captures d'écran. Cependant, la qualité sera dégradée par rapport aux fichiers source, et l'historique Airlock prouve l'antériorité de votre création en cas de litige.",
      },
      {
        question:
          "Puis-je envoyer des fichiers Figma, Sketch ou Adobe via Airlock ?",
        answer:
          "Oui. Airlock accepte tous les formats de fichiers. Nous recommandons de partager les exports (PNG, PDF) en consultation seule et de ne libérer les fichiers source qu'après paiement.",
      },
      {
        question:
          "Comment gérer un client qui ne paie pas après avoir vu les maquettes ?",
        answer:
          "Si le lien de consultation est encore actif, révoquez-le immédiatement. Le client ne pourra plus accéder aux maquettes. Sans les fichiers source en haute résolution, les maquettes consultées en ligne ont une utilité limitée.",
      },
      {
        question:
          "Puis-je partager un lien de maquettes sur les réseaux sociaux pour mon portfolio ?",
        answer:
          "Oui, vous pouvez créer un lien public sans mot de passe pour votre portfolio. Mais pour les maquettes client en cours de projet, utilisez toujours un lien protégé par mot de passe avec consultation seule.",
      },
    ],
    relatedPages: [
      { href: "/pour/freelances", label: "Airlock pour les freelances" },
      { href: "/alternative/dropbox", label: "Alternative sécurisée à Dropbox" },
      { href: "/glossaire/revocation-acces", label: "Qu'est-ce que la révocation d'accès ?" },
    ],
  },
];
