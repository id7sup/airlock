import { PSEOPageData } from "./types";

export const secteurs: PSEOPageData[] = [
  {
    slug: "notaires",
    metaTitle: "Partage de Fichiers pour Notaires | Airlock",
    metaDescription:
      "Transmettez actes notariaux, compromis de vente et documents successoraux en toute sécurité. Liens expirables, traçabilité et conformité RGPD.",
    title: "Le partage de documents sécurisé conçu pour les notaires",
    subtitle:
      "Transmettez vos actes authentiques, compromis de vente et dossiers de succession à vos clients et confrères avec une traçabilité complète et un chiffrement en transit et au repos.",
    problemTitle: "Les enjeux du partage documentaire pour les études notariales",
    problemContent:
      "Les notaires manipulent quotidiennement des actes authentiques, des compromis de vente, des attestations immobilières et des dossiers de succession contenant des données personnelles sensibles. L'envoi par e-mail classique ne garantit ni la confidentialité ni la preuve de réception. Les plateformes grand public comme WeTransfer ne répondent pas aux exigences de traçabilité imposées par la profession réglementée.",
    solutionTitle: "Airlock : la data room sécurisée de votre étude notariale",
    solutionContent:
      "Avec Airlock, chaque document partagé est protégé par un lien unique, expirable et traçable. Vous savez exactement qui a consulté un acte, quand et combien de fois. La protection par mot de passe et les quotas de vues garantissent que vos documents ne circulent pas au-delà des destinataires prévus, en conformité avec vos obligations déontologiques.",
    features: [
      {
        title: "Liens expirables pour les compromis de vente",
        description:
          "Définissez une date d'expiration alignée sur vos délais de rétractation ou de signature. Le lien devient automatiquement inaccessible passé ce délai.",
      },
      {
        title: "Traçabilité complète des consultations",
        description:
          "Visualisez en temps réel qui a ouvert vos actes notariaux, depuis quel appareil et quelle localisation. Un journal d'accès exportable pour vos archives.",
      },
      {
        title: "Protection par mot de passe des dossiers de succession",
        description:
          "Ajoutez un mot de passe à chaque lien de partage pour garantir que seuls les héritiers ou mandataires concernés accèdent aux pièces du dossier.",
      },
      {
        title: "Stockage sécurisé sur Cloudflare R2",
        description:
          "Vos documents sont hébergés sur Cloudflare R2 avec chiffrement au repos. Cloudflare est une entreprise américaine soumise au Cloud Act, mais les données peuvent être configurées pour rester en Europe.",
      },
    ],
    useCases: [
      {
        title: "Envoi d'un compromis de vente aux acquéreurs",
        description:
          "Partagez le compromis signé avec un lien protégé par mot de passe, expirant à la fin du délai de rétractation de 10 jours.",
      },
      {
        title: "Transmission d'un dossier de succession aux héritiers",
        description:
          "Créez un dossier partagé contenant inventaire, acte de notoriété et déclaration de succession, accessible uniquement aux héritiers identifiés.",
      },
      {
        title: "Échange de pièces avec un confrère pour un acte complexe",
        description:
          "Partagez les pièces d'un dossier inter-études avec un lien à usage limité, garantissant que les documents ne sont pas redistribués.",
      },
      {
        title: "Mise à disposition des diagnostics immobiliers",
        description:
          "Transmettez les diagnostics techniques (DPE, amiante, plomb) aux parties prenantes d'une transaction avec un suivi de consultation.",
      },
    ],
    faqs: [
      {
        question: "Airlock est-il conforme aux exigences du Conseil supérieur du notariat en matière de confidentialité ?",
        answer:
          "Oui. Airlock utilise un chiffrement en transit (TLS 1.3) et au repos (Cloudflare R2), des liens expirables et une traçabilité complète qui répondent aux exigences de confidentialité de la profession notariale. Le stockage est sur Cloudflare R2 avec des garanties de protection des données.",
      },
      {
        question: "Puis-je envoyer des actes authentiques volumineux via Airlock ?",
        answer:
          "Absolument. Airlock gère les fichiers volumineux grâce à un upload direct vers Cloudflare R2 via des URL pré-signées, sans limite de taille bloquante. Idéal pour les actes numérisés de plusieurs centaines de pages.",
      },
      {
        question: "Comment prouver qu'un client a bien consulté un document partagé ?",
        answer:
          "Le tableau de bord Airlock affiche l'historique complet des accès : date, heure, adresse IP et géolocalisation. Vous pouvez exporter ce journal comme preuve de mise à disposition.",
      },
      {
        question: "Puis-je révoquer l'accès à un document déjà partagé ?",
        answer:
          "Oui, vous pouvez révoquer instantanément n'importe quel lien de partage depuis votre tableau de bord. Le destinataire ne pourra plus accéder au document, même si le lien n'a pas encore expiré.",
      },
    ],
    relatedPages: [
      { href: "/alternative/sharepoint", label: "Alternative à SharePoint pour les notaires" },
      { href: "/cas-usage/envoyer-contrat-signature", label: "Envoyer un contrat à la signature" },
      { href: "/glossaire/tracabilite-acces", label: "Qu'est-ce que la traçabilité des accès ?" },
    ],
  },
  {
    slug: "experts-comptables",
    metaTitle: "Partage de Fichiers pour Experts-Comptables | Airlock",
    metaDescription:
      "Échangez bilans, liasses fiscales et bulletins de paie avec vos clients en toute sécurité. Traçabilité, liens protégés et conformité RGPD.",
    title: "L'échange de documents comptables sécurisé et traçable",
    subtitle:
      "Transmettez bilans annuels, liasses fiscales, bulletins de paie et documents sociaux à vos clients sans risque de fuite, avec une preuve de consultation intégrée.",
    problemTitle: "Les défis du partage documentaire pour les cabinets comptables",
    problemContent:
      "Les experts-comptables échangent chaque mois des dizaines de documents confidentiels : bilans, comptes de résultat, liasses fiscales, bulletins de paie et déclarations sociales. Ces fichiers contiennent des données financières et personnelles protégées par le secret professionnel. Les envois par e-mail avec pièces jointes non chiffrées exposent le cabinet à des risques de fuite et de non-conformité RGPD.",
    solutionTitle: "Airlock : le coffre-fort numérique de votre cabinet comptable",
    solutionContent:
      "Airlock remplace les envois d'e-mails non sécurisés par des liens de partage chiffrés, protégés par mot de passe et limités dans le temps. Chaque client dispose d'un espace dédié où retrouver ses documents. Vous gardez le contrôle total : révocation d'accès, quota de vues et journal d'activité détaillé pour chaque fichier partagé.",
    features: [
      {
        title: "Dossiers clients organisés par exercice",
        description:
          "Structurez vos partages par client et par exercice comptable. Chaque dossier possède ses propres liens d'accès, indépendants et révocables.",
      },
      {
        title: "Quotas de vues sur les bulletins de paie",
        description:
          "Limitez le nombre de consultations d'un bulletin de paie pour éviter qu'il ne soit redistribué au-delà du salarié concerné.",
      },
      {
        title: "Expiration automatique après la période fiscale",
        description:
          "Programmez l'expiration des liens de partage à la fin de la période de déclaration fiscale pour limiter l'exposition des données.",
      },
      {
        title: "Journal d'accès pour l'Ordre des experts-comptables",
        description:
          "En cas de contrôle, produisez un historique complet des échanges documentaires avec vos clients, horodaté et géolocalisé.",
      },
    ],
    useCases: [
      {
        title: "Transmission de la liasse fiscale au client",
        description:
          "Partagez la liasse fiscale complète avec un lien protégé par mot de passe, expirant après la date limite de dépôt.",
      },
      {
        title: "Envoi mensuel des bulletins de paie",
        description:
          "Déposez les bulletins de paie dans un dossier sécurisé accessible uniquement au dirigeant, avec notification automatique.",
      },
      {
        title: "Partage du bilan annuel avec le banquier du client",
        description:
          "Créez un lien temporaire permettant au banquier de consulter le bilan sans pouvoir le télécharger, préservant la confidentialité.",
      },
    ],
    faqs: [
      {
        question: "Comment Airlock garantit-il le secret professionnel de l'expert-comptable ?",
        answer:
          "Chaque document est accessible uniquement via un lien unique, chiffré et protégeable par mot de passe. Le secret professionnel est renforcé par la traçabilité des accès et la possibilité de révoquer un lien à tout moment.",
      },
      {
        question: "Puis-je partager un dossier complet de clôture annuelle ?",
        answer:
          "Oui. Airlock permet de partager des dossiers entiers contenant bilan, compte de résultat, annexes et liasse fiscale. Votre client accède à l'ensemble depuis un seul lien sécurisé.",
      },
      {
        question: "Est-il possible d'empêcher le téléchargement des documents partagés ?",
        answer:
          "Oui. Vous pouvez configurer chaque lien pour autoriser uniquement la consultation en ligne, sans téléchargement. Idéal pour les documents provisoires ou les situations où vous souhaitez garder le contrôle sur la diffusion.",
      },
    ],
    relatedPages: [
      { href: "/alternative/dropbox", label: "Alternative à Dropbox pour les experts-comptables" },
      { href: "/cas-usage/partager-bulletins-paie", label: "Partager des bulletins de paie en toute sécurité" },
      { href: "/glossaire/chiffrement-bout-en-bout", label: "Comprendre le chiffrement de bout en bout" },
    ],
  },
  {
    slug: "architectes",
    metaTitle: "Partage de Fichiers pour Architectes | Airlock",
    metaDescription:
      "Partagez plans, maquettes 3D et documents de chantier avec vos clients et artisans. Fichiers volumineux, liens sécurisés et suivi de consultation.",
    title: "Le partage de plans et maquettes pensé pour les architectes",
    subtitle:
      "Transmettez vos plans AutoCAD, rendus 3D, CCTP et documents de chantier à vos clients, bureaux d'études et artisans avec des liens sécurisés et un suivi précis.",
    problemTitle: "Les contraintes du partage de fichiers dans les agences d'architecture",
    problemContent:
      "Les architectes travaillent avec des fichiers volumineux (plans DWG, maquettes BIM, rendus haute résolution) qui dépassent les limites des e-mails. Ils collaborent avec de nombreux intervenants : maîtres d'ouvrage, bureaux d'études, entreprises de construction. Chaque version de plan doit être tracée pour éviter qu'un artisan ne travaille sur une version obsolète. Les solutions grand public ne gèrent ni les gros fichiers ni la propriété intellectuelle des plans.",
    solutionTitle: "Airlock : transmettez vos livrables architecturaux en toute maîtrise",
    solutionContent:
      "Airlock gère nativement les fichiers volumineux grâce à l'upload direct vers Cloudflare R2. Partagez un dossier de plans avec un lien unique par intervenant, et suivez qui a consulté quelle version. Vous pouvez interdire le téléchargement pour protéger votre propriété intellectuelle et révoquer l'accès d'un prestataire en fin de mission.",
    features: [
      {
        title: "Upload de fichiers volumineux sans limite bloquante",
        description:
          "Envoyez vos fichiers DWG, IFC et rendus 3D de plusieurs gigaoctets grâce à l'upload direct vers le stockage cloud, sans passer par le serveur.",
      },
      {
        title: "Consultation en ligne sans téléchargement",
        description:
          "Permettez à vos clients de visualiser les plans et rendus directement dans le navigateur sans autoriser le téléchargement, protégeant ainsi votre travail créatif.",
      },
      {
        title: "Un lien par intervenant de chantier",
        description:
          "Créez des liens distincts pour le maître d'ouvrage, le bureau d'études structure et chaque entreprise. Révoquez l'accès individuellement en fin de prestation.",
      },
      {
        title: "Géolocalisation des consultations",
        description:
          "Vérifiez que vos plans ne sont consultés que depuis les zones géographiques attendues. Détectez toute consultation suspecte depuis l'étranger.",
      },
    ],
    useCases: [
      {
        title: "Envoi des plans d'exécution aux entreprises de construction",
        description:
          "Partagez le dossier DCE complet avec chaque entreprise via un lien dédié, expirant à la fin de l'appel d'offres.",
      },
      {
        title: "Présentation de maquettes 3D au maître d'ouvrage",
        description:
          "Transmettez les rendus photoréalistes avec un lien en consultation seule, permettant au client de visualiser le projet sans récupérer les fichiers sources.",
      },
      {
        title: "Partage du CCTP avec les bureaux d'études techniques",
        description:
          "Mettez le cahier des clauses techniques à disposition de chaque BET avec un lien traçable et un quota de vues adapté.",
      },
      {
        title: "Transmission du permis de construire au client",
        description:
          "Partagez l'ensemble des pièces du dossier de permis de construire dans un dossier sécurisé accessible par le maître d'ouvrage.",
      },
    ],
    faqs: [
      {
        question: "Airlock peut-il gérer des fichiers AutoCAD et BIM de plusieurs gigaoctets ?",
        answer:
          "Oui. L'architecture d'Airlock repose sur un upload direct vers le stockage cloud via des URL pré-signées. Il n'y a pas de limite de taille imposée par le serveur, ce qui convient parfaitement aux fichiers DWG, RVT et IFC volumineux.",
      },
      {
        question: "Comment protéger la propriété intellectuelle de mes plans ?",
        answer:
          "Vous pouvez configurer chaque lien pour interdire le téléchargement et n'autoriser que la consultation en ligne. Combiné aux quotas de vues et à l'expiration automatique, vos plans restent sous votre contrôle.",
      },
      {
        question: "Puis-je savoir si un artisan a bien consulté les derniers plans mis à jour ?",
        answer:
          "Oui. Le journal d'accès d'Airlock indique précisément quand chaque destinataire a ouvert le lien, combien de fois et depuis quel appareil. Vous pouvez ainsi confirmer que chacun travaille sur la bonne version.",
      },
    ],
    relatedPages: [
      { href: "/alternative/wetransfer", label: "Alternative à WeTransfer pour les architectes" },
      { href: "/cas-usage/partager-plans-architecturaux", label: "Partager des plans architecturaux en toute sécurité" },
      { href: "/glossaire/url-presignee", label: "Qu'est-ce qu'une URL pré-signée ?" },
    ],
  },
  {
    slug: "startups",
    metaTitle: "Partage de Fichiers pour Startups | Airlock",
    metaDescription:
      "Partagez pitch decks, data rooms et documents investisseurs en toute confidentialité. Liens traçables, expirables et conformes RGPD pour vos levées de fonds.",
    title: "Le partage de documents confidentiel pour les startups ambitieuses",
    subtitle:
      "Partagez vos pitch decks, business plans et data rooms avec vos investisseurs potentiels tout en gardant le contrôle total sur qui consulte vos documents et pendant combien de temps.",
    problemTitle: "Les risques du partage documentaire pour les startups en croissance",
    problemContent:
      "Les startups partagent des documents hautement stratégiques : pitch decks avec projections financières, cap tables, contrats clients et propriété intellectuelle. Pendant les levées de fonds, ces documents circulent entre dizaines d'investisseurs potentiels. Un pitch deck qui fuite chez un concurrent peut compromettre l'avantage compétitif. Les solutions classiques ne permettent pas de savoir quel VC a réellement lu le deck, ni de couper l'accès après un refus.",
    solutionTitle: "Airlock : la data room qui donne un avantage aux fondateurs",
    solutionContent:
      "Avec Airlock, chaque investisseur reçoit un lien unique et traçable vers votre data room. Vous voyez en temps réel qui ouvre votre pitch deck, combien de temps il le consulte et depuis quelle localisation. Après un refus, révoquez l'accès en un clic. Les quotas de vues empêchent la redistribution non autorisée de vos documents stratégiques.",
    features: [
      {
        title: "Data room pour levée de fonds",
        description:
          "Organisez vos documents par catégorie (financier, juridique, technique) et attribuez un accès granulaire à chaque investisseur selon l'avancement de la due diligence.",
      },
      {
        title: "Tracking d'engagement des investisseurs",
        description:
          "Mesurez l'intérêt réel de chaque VC : nombre de consultations, temps passé, documents les plus vus. Priorisez vos relances en fonction des données d'engagement.",
      },
      {
        title: "Révocation instantanée après un pass",
        description:
          "Quand un investisseur décline, révoquez son accès immédiatement. Vos projections financières et votre cap table ne restent pas accessibles indéfiniment.",
      },
      {
        title: "Liens individuels par investisseur",
        description:
          "Chaque VC reçoit un lien unique. En cas de fuite, vous identifiez immédiatement la source grâce à la traçabilité par lien.",
      },
    ],
    useCases: [
      {
        title: "Partage du pitch deck en seed round",
        description:
          "Envoyez votre pitch deck à chaque business angel avec un lien individuel, expirant 7 jours après l'envoi, pour créer un sentiment d'urgence.",
      },
      {
        title: "Data room de due diligence en Série A",
        description:
          "Créez une data room structurée avec statuts, pacte d'associés, comptes certifiés et contrats clés. Ouvrez l'accès par paliers selon l'avancement des discussions.",
      },
      {
        title: "Envoi de Term Sheet confidentielle",
        description:
          "Partagez la term sheet avec les co-investisseurs via un lien protégé par mot de passe, limité à 3 consultations maximum.",
      },
      {
        title: "Partage de métriques mensuelles avec le board",
        description:
          "Transmettez votre reporting mensuel aux membres du board avec un lien dédié par administrateur, traçant les consultations.",
      },
    ],
    faqs: [
      {
        question: "Airlock remplace-t-il une data room traditionnelle pour une levée de fonds ?",
        answer:
          "Oui. Airlock offre toutes les fonctionnalités essentielles d'une data room : organisation par dossiers, contrôle d'accès granulaire, traçabilité des consultations et révocation d'accès. Le tout à une fraction du coût des solutions spécialisées.",
      },
      {
        question: "Comment savoir si un investisseur a réellement consulté mon pitch deck ?",
        answer:
          "Le tableau de bord Airlock affiche en temps réel les statistiques de consultation pour chaque lien : nombre d'ouvertures, date et heure, et géolocalisation. Vous pouvez ainsi identifier les investisseurs les plus engagés.",
      },
      {
        question: "Puis-je empêcher un investisseur de télécharger mes projections financières ?",
        answer:
          "Oui. Configurez le lien en mode consultation seule (sans téléchargement). L'investisseur peut visualiser vos documents dans le navigateur mais ne peut pas les enregistrer localement.",
      },
    ],
    relatedPages: [
      { href: "/alternative/tresorit", label: "Alternative à Tresorit pour les startups" },
      { href: "/cas-usage/data-room-levee-de-fonds", label: "Créer une data room pour levée de fonds" },
      { href: "/glossaire/data-room", label: "Qu'est-ce qu'une data room ?" },
    ],
  },
  {
    slug: "cabinets-conseil",
    metaTitle: "Partage de Fichiers pour Cabinets de Conseil | Airlock",
    metaDescription:
      "Transmettez rapports d'audit, livrables de mission et analyses stratégiques à vos clients de manière sécurisée. Traçabilité et contrôle d'accès granulaire.",
    title: "Le partage de livrables sécurisé pour les cabinets de conseil",
    subtitle:
      "Transmettez vos rapports de mission, analyses stratégiques et recommandations à vos clients avec un contrôle total sur la diffusion et une traçabilité de chaque consultation.",
    problemTitle: "Les enjeux de confidentialité pour les cabinets de conseil",
    problemContent:
      "Les consultants produisent des livrables à forte valeur stratégique : rapports d'audit, analyses de marché, plans de transformation, benchmarks concurrentiels. Ces documents contiennent souvent des données confidentielles de plusieurs clients simultanément. La fuite d'un rapport d'audit ou d'un benchmark concurrentiel peut engager la responsabilité du cabinet et détruire la relation de confiance avec le client.",
    solutionTitle: "Airlock : maîtrisez la diffusion de vos livrables de conseil",
    solutionContent:
      "Airlock permet aux consultants de partager chaque livrable avec un lien dédié par client, protégé et traçable. Vous contrôlez précisément qui accède à quoi, pendant combien de temps et combien de fois. En fin de mission, révoquez tous les accès d'un client en quelques clics. La séparation stricte par lien garantit qu'aucun client n'accède aux données d'un autre.",
    features: [
      {
        title: "Cloisonnement strict entre missions",
        description:
          "Chaque mission dispose de son propre espace avec des liens d'accès indépendants. Aucun risque de fuite croisée entre les données de deux clients différents.",
      },
      {
        title: "Restriction de domaine e-mail",
        description:
          "Limitez l'accès aux seules adresses e-mail du domaine de votre client. Empêchez la redistribution des livrables à des tiers non autorisés.",
      },
      {
        title: "Expiration en fin de mission",
        description:
          "Programmez l'expiration automatique de tous les liens à la date de fin de mission. Plus besoin de penser à révoquer les accès manuellement.",
      },
      {
        title: "Export du journal d'accès pour facturation",
        description:
          "Utilisez les logs de consultation comme preuve de livraison effective. Le journal horodaté peut appuyer votre facturation ou lever un litige sur la réception d'un livrable.",
      },
    ],
    useCases: [
      {
        title: "Transmission d'un rapport d'audit au comité de direction",
        description:
          "Partagez le rapport final avec les membres du CODIR via des liens individuels, permettant de savoir exactement qui l'a consulté avant la réunion de restitution.",
      },
      {
        title: "Partage d'un benchmark concurrentiel confidentiel",
        description:
          "Envoyez l'analyse concurrentielle avec un lien en consultation seule, expirant 48h après la présentation, pour éviter toute diffusion ultérieure.",
      },
      {
        title: "Mise à disposition des livrables intermédiaires",
        description:
          "Créez un dossier partagé où déposer progressivement les livrables de chaque phase de mission, avec notification automatique au client.",
      },
      {
        title: "Envoi de propositions commerciales personnalisées",
        description:
          "Partagez chaque proposition avec un lien traçable pour mesurer l'intérêt du prospect et adapter votre relance commerciale.",
      },
    ],
    faqs: [
      {
        question: "Comment garantir qu'un client ne redistribue pas mes livrables à ses concurrents ?",
        answer:
          "Airlock offre plusieurs mécanismes : consultation en ligne sans téléchargement, quota de vues limité, restriction par domaine e-mail et traçabilité complète. En cas de redistribution, vous identifiez immédiatement la source grâce au lien unique attribué à chaque destinataire.",
      },
      {
        question: "Puis-je utiliser Airlock pour gérer plusieurs missions clients simultanément ?",
        answer:
          "Oui. L'organisation par dossiers vous permet de structurer vos partages par client et par mission. Chaque dossier possède ses propres paramètres de sécurité et ses liens d'accès indépendants.",
      },
      {
        question: "Le journal d'accès peut-il servir de preuve de livraison ?",
        answer:
          "Oui. Le journal d'Airlock enregistre chaque consultation avec horodatage, adresse IP et géolocalisation. Ces données constituent une preuve solide de mise à disposition et de consultation effective par votre client.",
      },
    ],
    relatedPages: [
      { href: "/alternative/box", label: "Alternative à Box pour les cabinets de conseil" },
      { href: "/cas-usage/partager-rapports-audit", label: "Partager des rapports d'audit en toute sécurité" },
      { href: "/glossaire/revocation-acces", label: "Comprendre la révocation d'accès" },
    ],
  },
  {
    slug: "agences-immobilieres",
    metaTitle: "Partage de Fichiers pour Agences Immobilières | Airlock",
    metaDescription:
      "Transmettez mandats, diagnostics et dossiers de location à vos clients et propriétaires en toute sécurité. Liens expirables et traçabilité complète.",
    title: "Le partage de documents immobiliers sécurisé et professionnel",
    subtitle:
      "Transmettez mandats de vente, diagnostics techniques, baux et dossiers de candidature locative à vos clients avec des liens protégés et un suivi de consultation en temps réel.",
    problemTitle: "Les problématiques de partage documentaire dans l'immobilier",
    problemContent:
      "Les agents immobiliers jonglent entre mandats de vente, diagnostics DPE, dossiers de candidature locative contenant pièces d'identité et avis d'imposition, et baux commerciaux. Ces documents transitent entre propriétaires, acquéreurs, locataires et notaires. L'envoi par e-mail de pièces d'identité et de justificatifs de revenus pose des problèmes majeurs de conformité RGPD et de protection des données personnelles des candidats locataires.",
    solutionTitle: "Airlock : sécurisez les échanges documentaires de votre agence",
    solutionContent:
      "Avec Airlock, chaque dossier de candidature locative est partagé via un lien unique destiné au propriétaire, avec expiration automatique après la décision. Les diagnostics techniques sont accessibles par les acquéreurs potentiels sans risque de diffusion incontrôlée. Vous respectez le RGPD en limitant la durée de mise à disposition des données personnelles de vos candidats.",
    features: [
      {
        title: "Dossiers de candidature RGPD-conformes",
        description:
          "Partagez les dossiers de candidature locative avec le propriétaire via un lien expirant automatiquement après la prise de décision. Les données personnelles des candidats non retenus ne restent pas accessibles indéfiniment.",
      },
      {
        title: "Partage de diagnostics techniques tracé",
        description:
          "Transmettez le DPE, le diagnostic amiante et le mesurage Carrez à chaque acquéreur potentiel avec un lien individuel et un suivi de consultation.",
      },
      {
        title: "Protection des mandats par mot de passe",
        description:
          "Sécurisez le partage de vos mandats exclusifs avec un mot de passe dédié, garantissant que seul le propriétaire mandant accède au document signé.",
      },
      {
        title: "Liens distincts par acquéreur potentiel",
        description:
          "Créez un lien unique pour chaque visiteur intéressé. Mesurez l'engagement réel de chaque acquéreur et identifiez les profils les plus sérieux.",
      },
    ],
    useCases: [
      {
        title: "Transmission du dossier de diagnostics à un acquéreur",
        description:
          "Partagez l'ensemble des diagnostics obligatoires (DPE, amiante, plomb, électricité, gaz) avec un lien sécurisé expirant après la signature du compromis.",
      },
      {
        title: "Envoi des dossiers de candidature au propriétaire bailleur",
        description:
          "Regroupez les dossiers des candidats locataires dans un dossier sécurisé accessible au propriétaire, avec suppression automatique après validation du locataire.",
      },
      {
        title: "Partage d'un bail commercial avec les parties",
        description:
          "Transmettez le projet de bail commercial au locataire et à son avocat avec un lien protégé, en consultation seule pendant la phase de négociation.",
      },
    ],
    faqs: [
      {
        question: "Comment respecter le RGPD lors du partage de dossiers de candidature locative ?",
        answer:
          "Airlock vous permet de définir une date d'expiration sur chaque lien, assurant la suppression automatique de l'accès aux données personnelles des candidats. Conformément au RGPD, les données ne sont accessibles que le temps nécessaire à la prise de décision.",
      },
      {
        question: "Puis-je partager un dossier complet de diagnostics techniques ?",
        answer:
          "Oui. Créez un dossier contenant tous les diagnostics obligatoires et partagez-le avec un seul lien. Chaque acquéreur potentiel peut recevoir son propre lien avec des paramètres de sécurité adaptés.",
      },
      {
        question: "Comment savoir si un acquéreur a bien consulté les documents avant la visite ?",
        answer:
          "Le tableau de bord Airlock indique en temps réel les statistiques de consultation : date d'ouverture, nombre de vues et documents consultés. Vous pouvez ainsi vérifier que l'acquéreur est bien informé avant la visite.",
      },
    ],
    relatedPages: [
      { href: "/alternative/onedrive", label: "Alternative à OneDrive pour les agences immobilières" },
      { href: "/cas-usage/envoyer-contrat-signature", label: "Envoyer un contrat à la signature" },
      { href: "/glossaire/rgpd", label: "Comprendre le RGPD et la protection des données" },
    ],
  },
  {
    slug: "ressources-humaines",
    metaTitle: "Partage de Fichiers pour les RH | Airlock",
    metaDescription:
      "Transmettez bulletins de paie, contrats de travail et documents sociaux en toute conformité RGPD. Liens sécurisés, quotas de vues et traçabilité.",
    title: "Le partage de documents RH confidentiel et conforme au RGPD",
    subtitle:
      "Distribuez bulletins de paie, contrats de travail, avenants et documents sociaux à chaque collaborateur avec des liens individuels, sécurisés et conformes aux exigences de la CNIL.",
    problemTitle: "Les enjeux de confidentialité pour les services RH",
    problemContent:
      "Les équipes RH manipulent les données les plus sensibles de l'entreprise : bulletins de paie avec rémunérations individuelles, contrats de travail, avertissements disciplinaires, résultats d'entretiens annuels et dossiers médicaux. La diffusion accidentelle d'un tableau de rémunérations ou d'un courrier disciplinaire peut provoquer des crises internes majeures. Le RGPD impose des durées de conservation strictes et un accès limité aux seules personnes habilitées.",
    solutionTitle: "Airlock : la transmission documentaire RH sécurisée et traçable",
    solutionContent:
      "Airlock permet aux DRH de transmettre chaque document au seul collaborateur concerné, via un lien unique protégé par mot de passe. Les quotas de vues empêchent la redistribution. L'expiration automatique garantit que les documents ne restent pas accessibles au-delà de la durée nécessaire, en conformité avec les recommandations de la CNIL.",
    features: [
      {
        title: "Distribution individuelle de bulletins de paie",
        description:
          "Chaque collaborateur reçoit un lien unique vers son bulletin de paie, protégé par mot de passe. Aucun risque qu'un salarié accède au bulletin d'un collègue.",
      },
      {
        title: "Quotas de vues sur les documents disciplinaires",
        description:
          "Limitez la consultation d'un avertissement ou d'une convocation à un nombre défini de vues, empêchant la capture d'écran répétée ou la redistribution.",
      },
      {
        title: "Expiration conforme aux durées CNIL",
        description:
          "Programmez l'expiration des liens selon les durées de conservation recommandées par la CNIL pour chaque type de document RH.",
      },
      {
        title: "Journal d'accès pour le registre des traitements",
        description:
          "Documentez chaque accès aux données personnelles des collaborateurs. Le journal d'Airlock alimente votre registre des traitements RGPD.",
      },
    ],
    useCases: [
      {
        title: "Envoi des bulletins de paie mensuels",
        description:
          "Déposez chaque bulletin dans un lien individuel protégé par le matricule du salarié. Le collaborateur reçoit une notification et peut consulter son bulletin en ligne.",
      },
      {
        title: "Transmission d'un contrat de travail à signer",
        description:
          "Partagez le contrat de travail avec le futur collaborateur via un lien sécurisé, expirant 48h après l'envoi pour inciter à une signature rapide.",
      },
      {
        title: "Partage du bilan social avec les représentants du personnel",
        description:
          "Mettez le bilan social à disposition des élus du CSE via un lien en consultation seule, sans téléchargement, pendant la durée de la consultation.",
      },
      {
        title: "Envoi des attestations employeur",
        description:
          "Transmettez attestations Pôle Emploi et certificats de travail aux collaborateurs sortants avec un lien sécurisé et une durée d'accès limitée.",
      },
    ],
    faqs: [
      {
        question: "Airlock est-il conforme aux recommandations de la CNIL pour les données RH ?",
        answer:
          "Oui. Airlock permet de définir des durées d'accès limitées, de protéger chaque document par mot de passe et de tracer tous les accès. Ces fonctionnalités répondent aux exigences de la CNIL en matière de limitation de la conservation et de traçabilité des accès aux données personnelles.",
      },
      {
        question: "Comment empêcher qu'un bulletin de paie soit redistribué en interne ?",
        answer:
          "Chaque bulletin est accessible via un lien unique avec quota de vues. Vous pouvez limiter à 2-3 consultations et désactiver le téléchargement. Le lien est nominatif : si le document fuite, vous identifiez immédiatement la source.",
      },
      {
        question: "Puis-je automatiser l'envoi mensuel des bulletins de paie ?",
        answer:
          "Airlock propose une API permettant d'intégrer la génération de liens sécurisés dans votre processus de paie. Vous pouvez ainsi automatiser la création de liens individuels pour chaque collaborateur chaque mois.",
      },
    ],
    relatedPages: [
      { href: "/alternative/sharepoint", label: "Alternative à SharePoint pour les RH" },
      { href: "/cas-usage/partager-bulletins-paie", label: "Partager des bulletins de paie en toute sécurité" },
      { href: "/glossaire/quota-de-vues", label: "Qu'est-ce qu'un quota de vues ?" },
    ],
  },
  {
    slug: "medecins",
    metaTitle: "Partage de Fichiers pour Médecins | Airlock",
    metaDescription:
      "Transmettez comptes rendus médicaux, imageries et dossiers patients en toute sécurité. Chiffrement, traçabilité et conformité RGPD santé.",
    title: "Le partage de documents médicaux sécurisé et conforme",
    subtitle:
      "Transmettez comptes rendus opératoires, imageries médicales, ordonnances et dossiers patients à vos correspondants et patients avec un chiffrement en transit et au repos, et une traçabilité intégrale.",
    problemTitle: "Les contraintes réglementaires du partage de données de santé",
    problemContent:
      "Les médecins échangent quotidiennement des données de santé protégées par le secret médical : comptes rendus de consultation, résultats d'analyse, imageries IRM/scanner et courriers de correspondance entre confrères. Le RGPD classe ces données comme sensibles, imposant des mesures de protection renforcées. L'envoi par messagerie non sécurisée expose le praticien à des sanctions ordinales et à des poursuites pour violation du secret médical.",
    solutionTitle: "Airlock : la transmission de données de santé maîtrisée",
    solutionContent:
      "Airlock offre un canal de transmission chiffré (TLS 1.3) pour les documents médicaux. Chaque envoi est protégé par un lien unique, expirable et protégeable par mot de passe. La traçabilité des accès permet au médecin de documenter chaque échange dans le cadre de ses obligations déontologiques. Note : Airlock n'est pas certifié HDS (Hébergeur de Données de Santé). Pour les établissements soumis à cette obligation, vérifiez la compatibilité avec vos exigences réglementaires.",
    features: [
      {
        title: "Chiffrement adapté aux données de santé",
        description:
          "Chaque fichier médical transite via TLS 1.3 et est stocké avec un chiffrement au repos sur Cloudflare R2. Airlock n'est pas certifié HDS : pour les données de santé soumises à cette obligation, vérifiez vos exigences réglementaires.",
      },
      {
        title: "Liens éphémères pour les résultats d'analyse",
        description:
          "Créez des liens à durée de vie courte (24-48h) pour transmettre des résultats d'analyse au patient, limitant l'exposition des données dans le temps.",
      },
      {
        title: "Traçabilité pour le dossier médical partagé",
        description:
          "Documentez chaque transmission de document médical avec un journal d'accès horodaté, contribuant à la traçabilité exigée par l'Ordre des médecins.",
      },
      {
        title: "Protection par mot de passe nominative",
        description:
          "Protégez chaque lien avec un mot de passe communiqué au patient par un canal séparé (SMS, téléphone), garantissant que seul le destinataire accède au document.",
      },
    ],
    useCases: [
      {
        title: "Transmission d'un compte rendu opératoire au médecin traitant",
        description:
          "Partagez le compte rendu post-opératoire avec le médecin traitant du patient via un lien sécurisé et traçable, documentant l'échange dans le parcours de soins.",
      },
      {
        title: "Envoi d'imageries médicales au patient",
        description:
          "Transmettez les clichés IRM ou scanner au patient via un lien protégé par mot de passe, expirant après 7 jours pour limiter l'exposition des données.",
      },
      {
        title: "Partage d'un dossier médical pour un second avis",
        description:
          "Constituez un dossier complet (antécédents, imageries, analyses) et partagez-le avec le spécialiste consulté pour un second avis médical.",
      },
      {
        title: "Envoi d'ordonnances au pharmacien",
        description:
          "Transmettez une ordonnance complexe (préparations magistrales, stupéfiants) au pharmacien avec un lien à usage unique pour éviter les réutilisations frauduleuses.",
      },
    ],
    faqs: [
      {
        question: "Airlock est-il un hébergeur de données de santé certifié HDS ?",
        answer:
          "Airlock utilise un stockage sur infrastructure Cloudflare conforme au RGPD européen. Pour les établissements nécessitant la certification HDS, nous recommandons de vérifier la compatibilité avec les exigences spécifiques de votre organisme de tutelle. Airlock assure dans tous les cas le chiffrement, la traçabilité et le contrôle d'accès requis.",
      },
      {
        question: "Comment transmettre une imagerie médicale volumineuse de manière sécurisée ?",
        answer:
          "Airlock gère les fichiers volumineux grâce à l'upload direct vers le stockage cloud. Les séries d'imagerie DICOM de plusieurs centaines de méga-octets sont transmises sans difficulté, avec le même niveau de sécurité que tout autre document.",
      },
      {
        question: "Le secret médical est-il garanti avec Airlock ?",
        answer:
          "Airlock chiffre les données en transit et au repos, et chaque accès est tracé et documenté. La combinaison du chiffrement, des liens expirables, de la protection par mot de passe et de la révocation instantanée constitue un ensemble de garanties solides pour le respect du secret médical.",
      },
    ],
    relatedPages: [
      { href: "/alternative/swisstransfer", label: "Alternative à SwissTransfer pour les médecins" },
      { href: "/cas-usage/transmettre-dossier-medical", label: "Transmettre un dossier médical en toute sécurité" },
      { href: "/glossaire/zero-knowledge", label: "Qu'est-ce que le zero-knowledge ?" },
    ],
  },
  {
    slug: "associations",
    metaTitle: "Partage de Fichiers pour Associations | Airlock",
    metaDescription:
      "Partagez PV d'assemblée, comptes annuels et documents de subvention avec vos membres et financeurs. Liens sécurisés, simples et conformes RGPD.",
    title: "Le partage de documents associatif simple, sécurisé et transparent",
    subtitle:
      "Transmettez procès-verbaux, rapports d'activité, comptes annuels et dossiers de subvention à vos adhérents, bénévoles et financeurs avec des liens sécurisés et une parfaite traçabilité.",
    problemTitle: "Les défis documentaires des associations et ONG",
    problemContent:
      "Les associations gèrent une grande variété de documents sensibles : PV d'assemblée générale, comptes certifiés, dossiers de demande de subvention, listes de bénéficiaires et données personnelles des adhérents. Ces documents doivent être partagés avec de nombreuses parties prenantes (bureau, CA, adhérents, financeurs publics) tout en respectant le RGPD. Les budgets limités des associations ne permettent pas toujours d'investir dans des solutions de partage professionnelles coûteuses.",
    solutionTitle: "Airlock : la transparence documentaire à portée de toutes les associations",
    solutionContent:
      "Airlock offre aux associations une solution de partage sécurisée, intuitive et abordable. Partagez le PV d'AG avec les adhérents via un lien protégé, transmettez les comptes certifiés au financeur avec un lien traçable, et mettez les documents statutaires à disposition du bureau avec un accès contrôlé. La simplicité d'utilisation permet aux bénévoles non techniques de gérer les partages sans formation.",
    features: [
      {
        title: "Partage de PV d'AG avec les adhérents",
        description:
          "Diffusez le procès-verbal d'assemblée générale à tous les adhérents avec un lien protégé par mot de passe, garantissant que seuls les membres y accèdent.",
      },
      {
        title: "Dossiers de subvention traçables",
        description:
          "Transmettez vos dossiers de demande de subvention aux financeurs avec un lien traçable. Prouvez la date de dépôt et vérifiez que le dossier a été consulté.",
      },
      {
        title: "Interface simple pour les bénévoles",
        description:
          "L'interface intuitive d'Airlock ne nécessite aucune compétence technique. Tout bénévole peut créer un lien de partage sécurisé en quelques clics.",
      },
      {
        title: "Conformité RGPD pour les listes d'adhérents",
        description:
          "Partagez les listes de membres avec le bureau en respectant le RGPD : accès limité dans le temps, traçabilité des consultations et révocation possible.",
      },
    ],
    useCases: [
      {
        title: "Diffusion du rapport d'activité annuel",
        description:
          "Partagez le rapport d'activité avec les adhérents et les partenaires institutionnels via des liens distincts, chacun avec ses propres paramètres de sécurité.",
      },
      {
        title: "Transmission du dossier de subvention à la préfecture",
        description:
          "Envoyez le dossier complet (statuts, budget prévisionnel, rapport d'activité, comptes certifiés) via un lien unique avec accusé de consultation.",
      },
      {
        title: "Partage des comptes annuels avec le commissaire aux comptes",
        description:
          "Mettez les pièces comptables à disposition du CAC via un dossier sécurisé, avec un accès limité à la durée de la mission de certification.",
      },
    ],
    faqs: [
      {
        question: "Airlock est-il adapté aux petites associations avec un budget limité ?",
        answer:
          "Oui. Airlock propose une tarification accessible qui convient aux budgets associatifs. L'interface simple ne nécessite aucune compétence technique, permettant à n'importe quel bénévole de gérer les partages documentaires de l'association.",
      },
      {
        question: "Comment prouver à un financeur que le dossier de subvention a été déposé à temps ?",
        answer:
          "Le journal d'accès d'Airlock enregistre la date et l'heure de création du lien ainsi que la première consultation par le destinataire. Ces données constituent une preuve horodatée du dépôt et de la réception du dossier.",
      },
      {
        question: "Puis-je partager des documents avec des centaines d'adhérents simultanément ?",
        answer:
          "Oui. Créez un lien de partage unique protégé par un mot de passe commun aux adhérents. Airlock supporte un nombre illimité de consultations simultanées grâce à son infrastructure cloud.",
      },
    ],
    relatedPages: [
      { href: "/alternative/smash", label: "Alternative à Smash pour les associations" },
      { href: "/cas-usage/envoyer-devis-clients", label: "Envoyer des documents officiels aux partenaires" },
      { href: "/glossaire/lien-securise", label: "Qu'est-ce qu'un lien sécurisé ?" },
    ],
  },
  {
    slug: "freelances",
    metaTitle: "Partage de Fichiers pour Freelances | Airlock",
    metaDescription:
      "Envoyez devis, maquettes et livrables à vos clients de manière professionnelle et sécurisée. Liens traçables, expirables et image de marque soignée.",
    title: "Le partage de livrables professionnel et sécurisé pour les freelances",
    subtitle:
      "Envoyez devis, propositions commerciales, maquettes et livrables finaux à vos clients avec des liens professionnels, traçables et sécurisés qui renforcent votre crédibilité.",
    problemTitle: "Les défis du freelance dans le partage de fichiers clients",
    problemContent:
      "Les freelances (designers, développeurs, rédacteurs, consultants) envoient quotidiennement des livrables à leurs clients : maquettes Figma exportées, code source, articles, propositions commerciales et factures. L'utilisation de solutions grand public (WeTransfer, Google Drive) donne une image peu professionnelle et ne protège pas la propriété intellectuelle avant le paiement. Sans traçabilité, impossible de prouver qu'un client a bien reçu et consulté un livrable en cas de litige sur le paiement.",
    solutionTitle: "Airlock : l'outil de livraison professionnel du freelance",
    solutionContent:
      "Airlock transforme chaque envoi de livrable en une expérience professionnelle. Vos clients accèdent à leurs fichiers via un lien sécurisé et élégant. Vous gardez le contrôle : consultation seule avant paiement, téléchargement autorisé après validation. La traçabilité intégrée prouve la livraison effective et protège votre travail intellectuel.",
    features: [
      {
        title: "Consultation seule avant paiement",
        description:
          "Partagez vos maquettes et livrables en mode consultation uniquement. N'activez le téléchargement qu'après réception du paiement, protégeant votre travail.",
      },
      {
        title: "Preuve de livraison horodatée",
        description:
          "Le journal d'accès d'Airlock constitue une preuve irréfutable que votre client a consulté le livrable. Essentiel en cas de retard de paiement ou de litige.",
      },
      {
        title: "Liens professionnels pour vos devis",
        description:
          "Remplacez les pièces jointes par des liens Airlock propres et professionnels. Suivez l'ouverture de vos devis et relancez au bon moment.",
      },
      {
        title: "Expiration automatique des propositions commerciales",
        description:
          "Fixez une date de validité sur vos devis partagés. Le lien expire automatiquement, créant un sentiment d'urgence naturel chez le prospect.",
      },
    ],
    useCases: [
      {
        title: "Envoi d'un devis avec suivi d'ouverture",
        description:
          "Partagez votre proposition commerciale via un lien traçable. Recevez une notification dès que le client l'ouvre et adaptez votre timing de relance.",
      },
      {
        title: "Livraison de maquettes en attente de validation",
        description:
          "Transmettez vos maquettes en consultation seule. Le client peut visualiser le travail et donner son retour, mais ne peut pas télécharger les fichiers sources avant validation.",
      },
      {
        title: "Partage de fichiers sources après paiement",
        description:
          "Une fois le paiement reçu, activez le téléchargement sur le lien existant ou créez un nouveau lien avec droits complets. Votre propriété intellectuelle est protégée.",
      },
      {
        title: "Envoi de factures avec accusé de réception",
        description:
          "Transmettez vos factures via un lien Airlock. Le journal d'accès prouve que le client a bien reçu et consulté la facture, utile en cas de relance ou de procédure.",
      },
    ],
    faqs: [
      {
        question: "Comment protéger mes livrables avant le paiement du client ?",
        answer:
          "Configurez le lien de partage en mode consultation seule (sans téléchargement). Le client peut visualiser votre travail dans le navigateur mais ne peut pas récupérer les fichiers. Activez le téléchargement uniquement après réception du paiement.",
      },
      {
        question: "Le journal d'accès peut-il servir de preuve en cas de litige avec un client ?",
        answer:
          "Oui. Le journal enregistre chaque consultation avec horodatage précis, adresse IP et géolocalisation. En cas de contestation sur la livraison ou la réception d'un devis ou d'une facture, ces données constituent une preuve solide.",
      },
      {
        question: "Airlock est-il adapté à un freelance qui débute avec un petit budget ?",
        answer:
          "Oui. Airlock propose une offre accessible adaptée aux indépendants. L'investissement est rapidement rentabilisé par l'image professionnelle qu'il projette et la protection qu'il offre sur vos livrables et votre propriété intellectuelle.",
      },
      {
        question: "Puis-je utiliser Airlock pour envoyer des fichiers volumineux comme des vidéos ou des PSD ?",
        answer:
          "Absolument. Airlock utilise un upload direct vers le stockage cloud, ce qui permet de transmettre des fichiers de plusieurs gigaoctets sans difficulté. Idéal pour les vidéastes, photographes et designers qui manipulent des fichiers lourds.",
      },
    ],
    relatedPages: [
      { href: "/alternative/wetransfer", label: "Alternative à WeTransfer pour les freelances" },
      { href: "/cas-usage/envoyer-maquettes-clients", label: "Envoyer des maquettes à vos clients" },
      { href: "/glossaire/token-acces", label: "Qu'est-ce qu'un token d'accès ?" },
    ],
  },
];
