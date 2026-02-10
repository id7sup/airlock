import { PSEOPageData } from "./types";

export const glossaire: PSEOPageData[] = [
  {
    slug: "data-room",
    metaTitle: "Qu'est-ce qu'une Data Room ? | Airlock",
    metaDescription:
      "Comprenez ce qu'est une data room virtuelle, son rôle dans les transactions financières et juridiques, et comment sécuriser vos documents confidentiels.",
    title: "Qu'est-ce qu'une data room ?",
    subtitle:
      "Une data room est un espace virtuel sécurisé dédié au partage de documents confidentiels dans le cadre de transactions professionnelles.",
    problemTitle: "Pourquoi la data room est importante",
    problemContent:
      "Lors d'une levée de fonds, d'une acquisition ou d'un audit, des dizaines de documents sensibles doivent être partagés avec des tiers de confiance : bilans financiers, contrats, brevets, statuts juridiques. Envoyer ces fichiers par e-mail ou via un simple lien de téléchargement expose l'entreprise à des fuites d'informations et à un manque total de traçabilité. La data room virtuelle résout ce problème en centralisant tous les documents dans un espace contrôlé, où chaque accès est tracé et chaque permission est granulaire.",
    solutionTitle: "Comment Airlock fonctionne comme data room",
    solutionContent:
      "Airlock permet de créer des dossiers sécurisés avec des liens de partage individuels, chacun doté de sa propre date d'expiration, de son mot de passe et de son quota de vues. Contrairement aux data rooms traditionnelles facturées à prix d'or, Airlock offre une solution accessible avec un contrôle fin des accès : vous savez exactement qui a consulté quel document, quand et depuis où. Les fichiers sont stockés sur une infrastructure Cloudflare R2 souveraine, garantissant performance et conformité.",
    features: [
      {
        title: "Accès granulaire par lien",
        description:
          "Chaque investisseur ou partenaire reçoit un lien unique avec ses propres permissions, sans avoir besoin de créer un compte.",
      },
      {
        title: "Traçabilité complète",
        description:
          "Chaque consultation est enregistrée avec horodatage et géolocalisation, vous permettant de savoir précisément qui a ouvert vos documents.",
      },
      {
        title: "Expiration automatique",
        description:
          "Les liens expirent à la date que vous fixez, garantissant que l'accès aux documents cesse automatiquement après la fin de la transaction.",
      },
      {
        title: "Structure de dossiers",
        description:
          "Organisez vos documents en dossiers et sous-dossiers comme dans une data room classique, avec la possibilité de partager un dossier entier ou un fichier individuel.",
      },
    ],
    useCases: [
      {
        title: "Levée de fonds",
        description:
          "Partagez votre business plan, vos projections financières et vos statuts avec chaque investisseur potentiel via un lien dédié et traçable.",
      },
      {
        title: "Due diligence lors d'une acquisition",
        description:
          "Mettez à disposition les documents juridiques, comptables et RH nécessaires à l'audit de l'acquéreur, avec un contrôle total sur les accès.",
      },
      {
        title: "Audit réglementaire",
        description:
          "Transmettez les documents requis à un auditeur externe dans un espace sécurisé avec historique de consultation complet.",
      },
    ],
    faqs: [
      {
        question: "Quelle est la différence entre une data room et un drive classique ?",
        answer:
          "Un drive classique (Google Drive, Dropbox) est conçu pour le stockage et la collaboration au quotidien. Une data room est spécifiquement pensée pour le partage sécurisé et temporaire de documents sensibles : elle offre un contrôle fin des accès, une traçabilité complète et des mécanismes d'expiration que les drives grand public ne proposent pas.",
      },
      {
        question: "Combien coûte une data room virtuelle ?",
        answer:
          "Les data rooms traditionnelles (Intralinks, Datasite) peuvent coûter plusieurs milliers d'euros par mois. Airlock propose une alternative accessible avec les fonctionnalités essentielles d'une data room : liens sécurisés, traçabilité, expiration et protection par mot de passe, à une fraction du coût.",
      },
      {
        question: "Peut-on utiliser Airlock comme data room pour une levée de fonds ?",
        answer:
          "Oui. Airlock permet de créer un dossier dédié à votre levée, d'y déposer tous les documents nécessaires et de générer un lien unique par investisseur. Vous suivez en temps réel qui consulte vos documents et pouvez révoquer l'accès à tout moment.",
      },
      {
        question: "Les documents dans une data room sont-ils vraiment sécurisés ?",
        answer:
          "Avec Airlock, les fichiers sont chiffrés en transit (TLS) et stockés sur Cloudflare R2. Chaque lien de partage est protégé par un token unique haché en SHA-256, et vous pouvez ajouter un mot de passe, une date d'expiration et un quota de vues pour un contrôle maximal.",
      },
    ],
    relatedPages: [
      { href: "/cas-usage/data-room-levee-de-fonds", label: "Data room pour levée de fonds" },
      { href: "/cas-usage/partager-documents-due-diligence", label: "Partager des documents de due diligence" },
      { href: "/glossaire/tracabilite-acces", label: "Traçabilité des accès" },
    ],
  },
  {
    slug: "chiffrement-bout-en-bout",
    metaTitle: "Qu'est-ce que le chiffrement bout en bout ? | Airlock",
    metaDescription:
      "Découvrez le chiffrement de bout en bout (E2EE), comment il protège vos communications et fichiers, et pourquoi il est essentiel pour le partage sécurisé.",
    title: "Qu'est-ce que le chiffrement de bout en bout ?",
    subtitle:
      "Le chiffrement de bout en bout (E2EE) garantit que seuls l'expéditeur et le destinataire peuvent lire le contenu d'un message ou d'un fichier.",
    problemTitle: "Comprendre le chiffrement de bout en bout",
    problemContent:
      "Lorsque vous envoyez un fichier par e-mail ou via un service de partage classique, le contenu transite en clair sur les serveurs de l'intermédiaire. Cela signifie que le fournisseur du service, un employé malveillant ou un attaquant ayant compromis le serveur peut potentiellement lire vos documents. Le chiffrement de bout en bout élimine ce risque : le fichier est chiffré sur votre appareil avant l'envoi et ne peut être déchiffré que par le destinataire légitime. Même le fournisseur du service ne peut pas accéder au contenu.",
    solutionTitle: "La sécurité du transfert chez Airlock",
    solutionContent:
      "Airlock sécurise chaque transfert de fichier via un chiffrement TLS lors du transit et un stockage sécurisé sur Cloudflare R2. Les URLs présignées garantissent que seuls les destinataires autorisés peuvent télécharger les fichiers, et chaque lien de partage est protégé par un token unique haché en SHA-256. Cette approche combine la sécurité du chiffrement en transit avec un contrôle d'accès granulaire pour une protection maximale de vos documents.",
    features: [
      {
        title: "Chiffrement symétrique vs asymétrique",
        description:
          "Le chiffrement symétrique utilise une seule clé partagée, tandis que l'asymétrique repose sur une paire de clés (publique/privée). L'E2EE combine souvent les deux pour allier performance et sécurité.",
      },
      {
        title: "Protocole TLS",
        description:
          "Le Transport Layer Security chiffre les données pendant leur transit sur Internet, empêchant toute interception lors du transfert entre votre navigateur et le serveur.",
      },
      {
        title: "Hachage SHA-256",
        description:
          "Fonction cryptographique qui transforme une donnée en empreinte unique de 256 bits. Utilisée par Airlock pour sécuriser les tokens de partage sans stocker la valeur originale.",
      },
      {
        title: "Zero-knowledge",
        description:
          "Architecture où le fournisseur de service ne peut pas accéder au contenu des fichiers stockés, même s'il le voulait. C'est le niveau ultime de confidentialité.",
      },
    ],
    useCases: [
      {
        title: "Envoi de documents juridiques",
        description:
          "Transmettez des contrats, actes notariés ou documents de propriété intellectuelle avec la garantie que seul le destinataire pourra les lire.",
      },
      {
        title: "Partage de données médicales",
        description:
          "Envoyez des dossiers patients ou des résultats d'examens entre professionnels de santé en respectant le secret médical et la réglementation RGPD.",
      },
      {
        title: "Transfert de données financières",
        description:
          "Partagez des bilans comptables, relevés bancaires ou déclarations fiscales avec votre expert-comptable sans risque d'interception.",
      },
    ],
    faqs: [
      {
        question: "Le chiffrement de bout en bout ralentit-il le transfert de fichiers ?",
        answer:
          "L'impact sur la performance est généralement négligeable avec les processeurs modernes. Le chiffrement et le déchiffrement se font en quelques millisecondes, même pour des fichiers volumineux. La vitesse de transfert dépend principalement de votre connexion Internet.",
      },
      {
        question: "Quelle est la différence entre chiffrement en transit et chiffrement de bout en bout ?",
        answer:
          "Le chiffrement en transit (TLS) protège les données pendant leur transfert entre deux points, mais le serveur intermédiaire peut théoriquement accéder au contenu. Le chiffrement de bout en bout va plus loin : même le serveur ne peut pas lire les données, seuls l'expéditeur et le destinataire détiennent les clés.",
      },
      {
        question: "Est-ce que WhatsApp et Signal utilisent le même type de chiffrement ?",
        answer:
          "Oui, WhatsApp et Signal utilisent tous deux le chiffrement de bout en bout basé sur le protocole Signal. Cela signifie que même Meta (pour WhatsApp) ne peut pas lire vos messages. Ce même principe de protection s'applique au partage de fichiers sécurisé.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/tls", label: "Qu'est-ce que le TLS ?" },
      { href: "/glossaire/zero-knowledge", label: "Architecture zero-knowledge" },
      { href: "/pour/medecins", label: "Airlock pour les médecins" },
    ],
  },
  {
    slug: "rgpd",
    metaTitle: "Qu'est-ce que le RGPD ? | Airlock",
    metaDescription:
      "Comprenez le Règlement Général sur la Protection des Données (RGPD), vos obligations légales et comment partager des fichiers en conformité.",
    title: "Qu'est-ce que le RGPD ?",
    subtitle:
      "Le RGPD est le règlement européen qui encadre la collecte, le traitement et le stockage des données personnelles depuis mai 2018.",
    problemTitle: "Pourquoi le RGPD est important",
    problemContent:
      "Le Règlement Général sur la Protection des Données concerne toute organisation qui traite des données personnelles de résidents européens, quelle que soit sa taille ou sa localisation. Les sanctions peuvent atteindre 4 % du chiffre d'affaires mondial en cas de non-conformité. Au-delà de l'aspect légal, le RGPD répond à une préoccupation légitime : les individus doivent garder le contrôle sur leurs données personnelles. Pour les entreprises qui partagent des fichiers contenant des données personnelles (bulletins de paie, dossiers médicaux, contrats), la conformité RGPD n'est pas optionnelle.",
    solutionTitle: "Comment Airlock respecte le RGPD",
    solutionContent:
      "Airlock a été conçu avec la conformité RGPD comme principe fondateur. Les fichiers sont stockés sur une infrastructure européenne Cloudflare R2, les liens de partage disposent de dates d'expiration automatiques (droit à l'effacement facilité), et la traçabilité complète des accès permet de répondre aux exigences d'auditabilité. Aucune donnée n'est revendue ou partagée avec des tiers, et chaque utilisateur garde le contrôle total sur ses fichiers et leurs conditions de partage.",
    features: [
      {
        title: "Droit d'accès (article 15)",
        description:
          "Toute personne peut demander à savoir quelles données sont détenues à son sujet. Airlock permet de tracer exactement quels fichiers ont été partagés avec qui.",
      },
      {
        title: "Droit à l'effacement (article 17)",
        description:
          "Les individus peuvent demander la suppression de leurs données. Les liens expirables d'Airlock facilitent la suppression automatique de l'accès aux documents.",
      },
      {
        title: "Minimisation des données (article 5)",
        description:
          "Le RGPD impose de ne collecter que les données strictement nécessaires. Airlock ne demande aucune information personnelle aux destinataires pour accéder aux fichiers partagés.",
      },
      {
        title: "Registre des traitements (article 30)",
        description:
          "Les organisations doivent documenter leurs traitements de données. L'historique d'Airlock constitue un journal détaillé de chaque partage de document.",
      },
    ],
    useCases: [
      {
        title: "Envoi de bulletins de paie",
        description:
          "Les bulletins de paie contiennent des données personnelles sensibles. Un lien sécurisé avec expiration garantit la conformité RGPD lors de leur transmission.",
      },
      {
        title: "Partage de dossiers RH",
        description:
          "Les documents RH (contrats, évaluations, données de santé) nécessitent un traitement conforme au RGPD avec traçabilité et contrôle d'accès strict.",
      },
      {
        title: "Transmission de données clients",
        description:
          "Lorsqu'un prestataire doit accéder à des données clients pour un audit ou une mission, le partage doit être limité dans le temps et traçable.",
      },
    ],
    faqs: [
      {
        question: "Le RGPD s'applique-t-il à ma petite entreprise ?",
        answer:
          "Oui. Le RGPD s'applique à toute organisation, quelle que soit sa taille, dès lors qu'elle traite des données personnelles de résidents européens. Cela inclut les freelances, les TPE et les associations. Les obligations sont toutefois proportionnées à la nature et au volume des traitements.",
      },
      {
        question: "Que risque-t-on en cas de non-conformité RGPD ?",
        answer:
          "Les amendes peuvent atteindre 20 millions d'euros ou 4 % du chiffre d'affaires annuel mondial (le montant le plus élevé). En France, la CNIL a déjà sanctionné des entreprises de toutes tailles. Au-delà des amendes, une fuite de données peut causer un préjudice réputationnel considérable.",
      },
      {
        question: "Comment le partage de fichiers peut-il violer le RGPD ?",
        answer:
          "Envoyer un fichier contenant des données personnelles par e-mail non chiffré, via un lien public sans protection, ou sans limiter la durée d'accès peut constituer une violation du RGPD. Le règlement exige des mesures techniques et organisationnelles appropriées pour protéger les données.",
      },
      {
        question: "Airlock stocke-t-il les données en Europe ?",
        answer:
          "Airlock utilise l'infrastructure Cloudflare R2 qui permet un stockage conforme aux exigences européennes. Les données ne sont pas transférées vers des juridictions non conformes, et aucune donnée personnelle n'est partagée avec des tiers.",
      },
    ],
    relatedPages: [
      { href: "/pour/ressources-humaines", label: "Airlock pour les ressources humaines" },
      { href: "/cas-usage/partager-bulletins-paie", label: "Partager des bulletins de paie" },
      { href: "/glossaire/stockage-souverain", label: "Qu'est-ce que le stockage souverain ?" },
    ],
  },
  {
    slug: "lien-securise",
    metaTitle: "Qu'est-ce qu'un lien sécurisé ? | Airlock",
    metaDescription:
      "Découvrez ce qu'est un lien de partage sécurisé, comment il protège vos fichiers et pourquoi il remplace avantageusement l'envoi par e-mail.",
    title: "Qu'est-ce qu'un lien de partage sécurisé ?",
    subtitle:
      "Un lien sécurisé est une URL protégée par des mécanismes d'authentification et de contrôle d'accès, permettant un partage de fichiers maîtrisé.",
    problemTitle: "Pourquoi les liens classiques ne suffisent pas",
    problemContent:
      "Un lien de partage classique (Google Drive, Dropbox) donne souvent un accès permanent et non traçable au fichier. Une fois partagé, vous perdez tout contrôle : le lien peut être transféré à des tiers, indexé par les moteurs de recherche, ou rester actif indéfiniment. Il est impossible de savoir qui a consulté le document ou de révoquer l'accès a posteriori. Pour des fichiers sensibles (contrats, données financières, documents RH), cette absence de contrôle représente un risque majeur.",
    solutionTitle: "Les liens sécurisés Airlock",
    solutionContent:
      "Chaque lien de partage Airlock est un objet indépendant doté de son propre token unique (64 caractères hexadécimaux, haché en SHA-256), de sa date d'expiration, de son mot de passe optionnel et de son quota de vues. Vous pouvez créer plusieurs liens pour un même dossier avec des permissions différentes, et révoquer n'importe quel lien sans affecter les autres. Chaque accès est tracé avec horodatage et géolocalisation, vous donnant une visibilité totale sur la consultation de vos documents.",
    features: [
      {
        title: "Token unique par lien",
        description:
          "Chaque lien est identifié par un token cryptographique de 64 caractères, rendant impossible la devinette de l'URL ou l'accès non autorisé par force brute.",
      },
      {
        title: "Protection par mot de passe",
        description:
          "Ajoutez une couche de sécurité supplémentaire en exigeant un mot de passe pour accéder au fichier, même avec le lien correct.",
      },
      {
        title: "Quota de vues",
        description:
          "Limitez le nombre de consultations autorisées. Après le quota atteint, le lien devient automatiquement inactif, même s'il n'a pas encore expiré.",
      },
      {
        title: "Révocation instantanée",
        description:
          "Révoquez un lien à tout moment, immédiatement et définitivement. Le destinataire ne pourra plus accéder au fichier, même s'il avait enregistré l'URL.",
      },
    ],
    useCases: [
      {
        title: "Envoi d'un contrat à signer",
        description:
          "Partagez un contrat via un lien sécurisé avec expiration à 7 jours. Le client peut le consulter en ligne, et vous savez exactement quand il l'a ouvert.",
      },
      {
        title: "Partage de maquettes avec un client",
        description:
          "Envoyez des maquettes design via un lien protégé par mot de passe. Le client voit les fichiers sans pouvoir les télécharger si vous désactivez cette option.",
      },
      {
        title: "Transmission de documents confidentiels",
        description:
          "Partagez des documents sensibles avec un quota d'une seule vue. Une fois consulté, le lien s'inactive automatiquement.",
      },
    ],
    faqs: [
      {
        question: "Un lien sécurisé est-il plus sûr qu'une pièce jointe par e-mail ?",
        answer:
          "Oui, nettement. Un e-mail transite en clair et reste stocké indéfiniment dans les boîtes de l'expéditeur et du destinataire. Un lien sécurisé Airlock peut expirer, être protégé par mot de passe, limité en nombre de vues et révoqué à tout moment. De plus, chaque accès est tracé.",
      },
      {
        question: "Que se passe-t-il quand un lien sécurisé expire ?",
        answer:
          "Le destinataire voit un message indiquant que le lien a expiré. Le fichier reste dans votre espace Airlock et vous pouvez créer un nouveau lien si nécessaire. L'expiration n'affecte pas le fichier source, seulement l'accès via ce lien spécifique.",
      },
      {
        question: "Peut-on créer plusieurs liens pour un même fichier ?",
        answer:
          "Oui. C'est même une bonne pratique : créez un lien unique par destinataire avec des permissions adaptées. Cela permet de tracer individuellement qui accède au fichier et de révoquer l'accès d'une seule personne sans impacter les autres.",
      },
      {
        question: "Le destinataire a-t-il besoin d'un compte Airlock ?",
        answer:
          "Non. Le destinataire accède au fichier directement via le lien, sans inscription ni téléchargement d'application. C'est le partage sans friction : un lien, un clic, un accès sécurisé.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/token-acces", label: "Qu'est-ce qu'un token d'accès ?" },
      { href: "/cas-usage/envoyer-contrat-signature", label: "Envoyer un contrat à signer" },
      { href: "/alternative/wetransfer", label: "Alternative à WeTransfer" },
    ],
  },
  {
    slug: "zero-knowledge",
    metaTitle: "Qu'est-ce que le zero-knowledge ? | Airlock",
    metaDescription:
      "Comprenez l'architecture zero-knowledge, un modèle où même le fournisseur de service ne peut accéder à vos données. Principe et applications.",
    title: "Qu'est-ce que le zero-knowledge ?",
    subtitle:
      "Le zero-knowledge (ou connaissance nulle) est un principe de sécurité où le fournisseur d'un service n'a pas la capacité technique d'accéder aux données de ses utilisateurs.",
    problemTitle: "Comprendre le zero-knowledge",
    problemContent:
      "Lorsque vous stockez des fichiers sur un service cloud classique, le fournisseur détient les clés de chiffrement et peut techniquement accéder à vos données. Même si sa politique de confidentialité promet le contraire, une faille de sécurité, une décision judiciaire ou un employé malveillant pourrait compromettre vos fichiers. Le zero-knowledge renverse cette logique : l'architecture est conçue de telle sorte que le fournisseur ne possède tout simplement pas les moyens d'accéder à vos données, même s'il le voulait.",
    solutionTitle: "La philosophie de confidentialité d'Airlock",
    solutionContent:
      "Airlock minimise les données auxquelles la plateforme accède. Les tokens de partage sont hachés en SHA-256 avant stockage, ce qui signifie que même la base de données ne contient pas les tokens en clair. Les fichiers sont transmis via des URLs présignées directement vers le stockage Cloudflare R2, réduisant les points d'interception. Cette approche de minimisation des accès s'inscrit dans une philosophie de confidentialité dès la conception (privacy by design).",
    features: [
      {
        title: "Preuve à divulgation nulle",
        description:
          "En cryptographie, un protocole zero-knowledge permet de prouver la connaissance d'une information (comme un mot de passe) sans révéler cette information elle-même.",
      },
      {
        title: "Chiffrement côté client",
        description:
          "Dans une architecture zero-knowledge pure, les données sont chiffrées sur l'appareil de l'utilisateur avant même d'être envoyées au serveur. Le serveur ne stocke que des données chiffrées.",
      },
      {
        title: "Hachage des secrets",
        description:
          "Les informations sensibles comme les tokens et les mots de passe sont transformées en empreintes irréversibles (hash). Même en accédant à la base de données, il est impossible de retrouver les valeurs originales.",
      },
      {
        title: "Privacy by design",
        description:
          "Le RGPD encourage la protection de la vie privée dès la conception. L'architecture zero-knowledge est l'incarnation technique de ce principe : la confidentialité est intégrée dans l'architecture, pas ajoutée après coup.",
      },
    ],
    useCases: [
      {
        title: "Partage de secrets industriels",
        description:
          "Un cabinet de conseil partage des analyses stratégiques avec ses clients via un service où même le fournisseur ne peut accéder au contenu des documents.",
      },
      {
        title: "Transmission de données de santé",
        description:
          "Un médecin envoie des résultats d'examens à un confrère avec la garantie que le service intermédiaire ne peut pas lire les informations médicales.",
      },
      {
        title: "Stockage de documents notariaux",
        description:
          "Un notaire archive des actes authentiques numériques dans un espace où la confidentialité est garantie par l'architecture, pas seulement par une promesse contractuelle.",
      },
    ],
    faqs: [
      {
        question: "Le zero-knowledge est-il la même chose que le chiffrement de bout en bout ?",
        answer:
          "Les deux concepts sont liés mais distincts. Le chiffrement de bout en bout garantit que les données sont chiffrées pendant le transit. Le zero-knowledge va plus loin en s'assurant que le fournisseur ne peut jamais accéder aux données, y compris au repos. Un service peut offrir du chiffrement E2E sans être totalement zero-knowledge.",
      },
      {
        question: "Quels sont les inconvénients du zero-knowledge ?",
        answer:
          "Le principal inconvénient est que si vous perdez votre clé de chiffrement ou votre mot de passe, personne ne peut récupérer vos données, pas même le fournisseur du service. Cela implique une responsabilité accrue de l'utilisateur pour la gestion de ses clés.",
      },
      {
        question: "Comment vérifier qu'un service est vraiment zero-knowledge ?",
        answer:
          "Recherchez des audits de sécurité indépendants, du code open source que vous pouvez vérifier, et une documentation technique détaillant l'architecture de chiffrement. Méfiez-vous des services qui utilisent le terme comme argument marketing sans preuve technique.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/chiffrement-bout-en-bout", label: "Chiffrement de bout en bout" },
      { href: "/alternative/tresorit", label: "Alternative à Tresorit" },
      { href: "/pour/notaires", label: "Airlock pour les notaires" },
    ],
  },
  {
    slug: "url-presignee",
    metaTitle: "Qu'est-ce qu'une URL présignée ? | Airlock",
    metaDescription:
      "Découvrez les URLs présignées (presigned URLs), leur fonctionnement technique et pourquoi elles sont essentielles pour le partage sécurisé de fichiers.",
    title: "Qu'est-ce qu'une URL présignée ?",
    subtitle:
      "Une URL présignée est un lien temporaire et authentifié qui permet d'accéder à un fichier stocké dans le cloud sans exposer les identifiants du service de stockage.",
    problemTitle: "Comprendre les URLs présignées",
    problemContent:
      "Lorsqu'un fichier est stocké dans un service de stockage cloud comme AWS S3 ou Cloudflare R2, il n'est pas accessible publiquement par défaut. Pour le partager, deux options existent : rendre le fichier public (dangereux) ou passer par un serveur intermédiaire qui télécharge puis retransmet le fichier (lent et coûteux en bande passante). L'URL présignée offre une troisième voie élégante : le serveur génère une URL temporaire contenant une signature cryptographique. Le destinataire peut accéder directement au fichier pendant une durée limitée, sans que le serveur serve de relais.",
    solutionTitle: "Les URLs présignées chez Airlock",
    solutionContent:
      "Airlock utilise des URLs présignées Cloudflare R2 (compatible S3) pour chaque opération de téléchargement et d'upload. Lorsqu'un utilisateur partage un fichier, le serveur génère une URL présignée avec une durée de validité de 3600 secondes (1 heure). Le client accède directement au stockage R2 sans que le fichier ne transite par le serveur Airlock, garantissant des vitesses de transfert optimales et une charge serveur minimale.",
    features: [
      {
        title: "Signature cryptographique",
        description:
          "L'URL contient une signature générée avec la clé secrète du compte de stockage. Cette signature prouve que l'accès a été autorisé sans exposer les identifiants du compte.",
      },
      {
        title: "Expiration temporelle",
        description:
          "Chaque URL présignée a une durée de vie limitée (typiquement de quelques minutes à quelques heures). Passé ce délai, l'URL ne fonctionne plus, même si elle a été interceptée.",
      },
      {
        title: "Transfert direct client-stockage",
        description:
          "Le fichier est transféré directement entre le navigateur de l'utilisateur et le service de stockage, sans passer par le serveur applicatif. Cela réduit la latence et la consommation de bande passante.",
      },
      {
        title: "Compatibilité S3",
        description:
          "Le standard des URLs présignées est défini par l'API Amazon S3, adoptée par de nombreux fournisseurs de stockage cloud comme Cloudflare R2, MinIO ou DigitalOcean Spaces.",
      },
    ],
    useCases: [
      {
        title: "Upload de fichiers volumineux",
        description:
          "L'utilisateur upload un fichier de 2 Go directement vers Cloudflare R2 via une URL présignée, sans surcharger le serveur Airlock qui n'a qu'à générer l'URL.",
      },
      {
        title: "Téléchargement sécurisé par un tiers",
        description:
          "Un destinataire accède à un fichier partagé via une URL présignée à durée limitée, sans avoir besoin de s'authentifier auprès du service de stockage.",
      },
      {
        title: "Prévisualisation en ligne",
        description:
          "Les images et PDF sont affichés directement dans le navigateur via une URL présignée, permettant la consultation sans téléchargement complet.",
      },
    ],
    faqs: [
      {
        question: "Une URL présignée est-elle sécurisée ?",
        answer:
          "Oui, à condition que la durée de validité soit courte. La signature cryptographique empêche toute modification de l'URL, et l'expiration garantit que l'accès est temporaire. Si l'URL est interceptée, l'attaquant n'a accès au fichier que pendant la durée de validité restante.",
      },
      {
        question: "Quelle est la différence entre une URL présignée et un lien de partage ?",
        answer:
          "Un lien de partage Airlock est un concept de haut niveau (token, permissions, expiration). L'URL présignée est le mécanisme technique sous-jacent qui permet l'accès au fichier physique dans le stockage. Le lien de partage peut générer de nouvelles URLs présignées à chaque accès autorisé.",
      },
      {
        question: "Peut-on réutiliser une URL présignée expirée ?",
        answer:
          "Non. Une fois expirée, l'URL présignée retourne une erreur d'accès. Pour accéder à nouveau au fichier, une nouvelle URL présignée doit être générée par le serveur, ce qui nécessite une nouvelle vérification des permissions.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/stockage-souverain", label: "Stockage souverain" },
      { href: "/cas-usage/transferer-fichiers-volumineux", label: "Transférer des fichiers volumineux" },
      { href: "/glossaire/tls", label: "Qu'est-ce que le TLS ?" },
    ],
  },
  {
    slug: "tls",
    metaTitle: "Qu'est-ce que le TLS ? | Airlock",
    metaDescription:
      "Comprenez le protocole TLS (Transport Layer Security), comment il sécurise vos échanges sur Internet et pourquoi le cadenas dans votre navigateur est essentiel.",
    title: "Qu'est-ce que le protocole TLS ?",
    subtitle:
      "Le TLS (Transport Layer Security) est le protocole cryptographique qui sécurise les communications sur Internet, symbolisé par le cadenas et le 'https' dans votre navigateur.",
    problemTitle: "Pourquoi le TLS est essentiel",
    problemContent:
      "Sans TLS, toutes les données échangées entre votre navigateur et un site web circulent en clair sur le réseau. Cela signifie que quiconque se trouve sur le même réseau (Wi-Fi public d'un café, réseau d'entreprise, fournisseur d'accès Internet) peut intercepter et lire vos données : mots de passe, numéros de carte bancaire, documents confidentiels. Le TLS chiffre cette communication, la rendant illisible pour tout observateur extérieur. C'est le fondement de la sécurité sur le web moderne.",
    solutionTitle: "Le TLS chez Airlock",
    solutionContent:
      "Toutes les communications avec Airlock sont protégées par TLS 1.3, la version la plus récente et la plus sécurisée du protocole. Que vous accédiez au tableau de bord, uploadiez un fichier ou consultiez un document partagé, chaque échange est chiffré. Les URLs présignées vers Cloudflare R2 utilisent également le TLS, garantissant que vos fichiers sont protégés de bout en bout pendant le transit.",
    features: [
      {
        title: "Handshake TLS",
        description:
          "Avant d'échanger des données, le navigateur et le serveur négocient un canal sécurisé en échangeant des certificats et en s'accordant sur un algorithme de chiffrement. Ce processus prend quelques millisecondes.",
      },
      {
        title: "Certificats SSL/TLS",
        description:
          "Un certificat numérique prouve l'identité du serveur. Délivré par une autorité de certification, il garantit que vous communiquez bien avec le site légitime et non avec un imposteur.",
      },
      {
        title: "Perfect Forward Secrecy",
        description:
          "Avec le PFS, chaque session utilise une clé de chiffrement unique. Même si la clé privée du serveur est compromise, les sessions passées restent protégées.",
      },
      {
        title: "TLS 1.3 vs versions antérieures",
        description:
          "TLS 1.3 élimine les algorithmes obsolètes, réduit la latence du handshake et renforce la sécurité. Les versions 1.0 et 1.1 sont considérées comme obsolètes et vulnérables.",
      },
    ],
    useCases: [
      {
        title: "Upload de fichiers sensibles",
        description:
          "Lorsque vous uploadez un contrat ou un bilan financier sur Airlock, le TLS garantit que le fichier ne peut pas être intercepté pendant le transfert.",
      },
      {
        title: "Consultation d'un lien partagé",
        description:
          "Quand un destinataire ouvre un lien de partage Airlock, le TLS protège la page d'authentification (mot de passe) et le téléchargement du fichier.",
      },
      {
        title: "Accès au tableau de bord",
        description:
          "Votre session de travail sur Airlock (gestion de fichiers, création de liens, consultation d'analytics) est entièrement protégée par TLS.",
      },
    ],
    faqs: [
      {
        question: "Quelle est la différence entre SSL et TLS ?",
        answer:
          "SSL (Secure Sockets Layer) est l'ancêtre du TLS. Les termes sont souvent utilisés de manière interchangeable, mais techniquement, SSL est obsolète depuis 2015. Ce qu'on appelle couramment 'certificat SSL' est en réalité un certificat TLS. Tous les sites modernes utilisent TLS.",
      },
      {
        question: "Le cadenas dans le navigateur garantit-il que le site est sûr ?",
        answer:
          "Le cadenas indique que la connexion est chiffrée via TLS, mais pas que le site est nécessairement légitime ou digne de confiance. Un site de phishing peut aussi avoir un certificat TLS. Le cadenas garantit la confidentialité de l'échange, pas l'honnêteté du destinataire.",
      },
      {
        question: "Le TLS ralentit-il la navigation ?",
        answer:
          "Avec TLS 1.3, l'impact est quasi imperceptible. Le handshake initial ajoute un aller-retour réseau (quelques millisecondes), puis les données sont chiffrées et déchiffrées en temps réel par le matériel du processeur. Les bénéfices en sécurité sont incomparablement supérieurs au coût en performance.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/chiffrement-bout-en-bout", label: "Chiffrement de bout en bout" },
      { href: "/glossaire/url-presignee", label: "Qu'est-ce qu'une URL présignée ?" },
      { href: "/alternative/smash", label: "Alternative à Smash" },
    ],
  },
  {
    slug: "stockage-souverain",
    metaTitle: "Définition : Stockage souverain | Airlock",
    metaDescription:
      "Comprenez le stockage souverain, la localisation des données et les enjeux de souveraineté numérique pour les entreprises françaises et européennes.",
    title: "Qu'est-ce que le stockage souverain ?",
    subtitle:
      "Le stockage souverain désigne l'hébergement de données sur une infrastructure soumise exclusivement au droit du pays ou de la région de l'utilisateur, sans extraterritorialité juridique.",
    problemTitle: "Pourquoi le stockage souverain est important",
    problemContent:
      "Lorsque vos données sont stockées sur des serveurs américains (AWS, Google Cloud, Azure), elles sont soumises au droit américain, notamment le Cloud Act qui permet aux autorités américaines d'accéder aux données stockées par des entreprises américaines, même si les serveurs sont physiquement en Europe. Pour les entreprises françaises manipulant des données sensibles (santé, juridique, financier), cette extraterritorialité pose un problème fondamental de souveraineté. Le stockage souverain garantit que vos données restent sous la juridiction de votre pays.",
    solutionTitle: "Le stockage Cloudflare R2 chez Airlock",
    solutionContent:
      "Airlock utilise Cloudflare R2 pour le stockage des fichiers. Cloudflare R2 est une solution de stockage objet compatible S3 qui offre des performances élevées avec un réseau mondial de points de présence. Les données sont répliquées de manière sécurisée, et l'infrastructure Cloudflare permet de configurer la localisation des données. En choisissant Airlock, les entreprises bénéficient d'un stockage performant avec la tranquillité d'esprit d'une infrastructure qui respecte les exigences réglementaires européennes.",
    features: [
      {
        title: "Cloud Act et extraterritorialité",
        description:
          "Le Cloud Act (2018) permet aux autorités américaines de contraindre les entreprises américaines à fournir des données, même stockées à l'étranger. Le stockage souverain échappe à cette extraterritorialité.",
      },
      {
        title: "Localisation des données",
        description:
          "La localisation des données (data residency) garantit que les fichiers restent physiquement dans une zone géographique définie, respectant les exigences réglementaires locales.",
      },
      {
        title: "Certification SecNumCloud",
        description:
          "En France, le label SecNumCloud de l'ANSSI certifie les fournisseurs de cloud qui respectent les exigences de sécurité les plus strictes. C'est le standard de référence pour la souveraineté numérique.",
      },
      {
        title: "RGPD et transferts internationaux",
        description:
          "Le RGPD encadre strictement les transferts de données hors de l'UE. Le stockage souverain simplifie la conformité en évitant la question des transferts internationaux.",
      },
    ],
    useCases: [
      {
        title: "Cabinet d'avocats",
        description:
          "Un cabinet d'avocats manipulant des dossiers couverts par le secret professionnel a besoin d'un stockage souverain pour garantir qu'aucune juridiction étrangère ne puisse accéder aux données de ses clients.",
      },
      {
        title: "Établissement de santé",
        description:
          "Les données de santé sont soumises à des réglementations strictes (HDS en France). Le stockage souverain certifié est souvent une obligation légale pour les hébergeurs de données de santé.",
      },
      {
        title: "Administration publique",
        description:
          "Les collectivités et administrations publiques françaises sont encouragées à utiliser des solutions cloud souveraines pour protéger les données des citoyens.",
      },
    ],
    faqs: [
      {
        question: "Le stockage souverain est-il plus cher que le cloud américain ?",
        answer:
          "Historiquement, les offres souveraines étaient plus coûteuses que les géants américains. Aujourd'hui, des solutions comme Cloudflare R2, OVHcloud ou Scaleway proposent des tarifs compétitifs. Cloudflare R2 élimine même les frais de sortie de données (egress), souvent le poste le plus coûteux du stockage cloud.",
      },
      {
        question: "Cloudflare est une entreprise américaine, est-ce vraiment souverain ?",
        answer:
          "C'est un point légitime. Cloudflare est une entreprise américaine soumise au Cloud Act. Cependant, les données stockées sur R2 peuvent être configurées pour rester dans des régions spécifiques. Pour les organisations ayant des exigences de souveraineté strictes, des alternatives européennes certifiées (OVHcloud, Scaleway) existent.",
      },
      {
        question: "Le stockage souverain empêche-t-il les cyberattaques ?",
        answer:
          "Non. Le stockage souverain protège contre les risques juridiques (accès par des juridictions étrangères), pas contre les risques techniques (piratage). La sécurité technique (chiffrement, contrôle d'accès, sauvegarde) reste indispensable, quel que soit le lieu de stockage.",
      },
      {
        question: "Qu'est-ce que le Cloud de Confiance en France ?",
        answer:
          "Le Cloud de Confiance est une doctrine de l'État français qui impose l'utilisation de solutions cloud certifiées SecNumCloud pour les données sensibles des administrations. Des initiatives comme S3NS (Thales/Google) et Bleu (Orange/Capgemini/Microsoft) visent à proposer des clouds hyperscale sous juridiction française.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/rgpd", label: "Qu'est-ce que le RGPD ?" },
      { href: "/pour/notaires", label: "Airlock pour les notaires" },
      { href: "/pour/medecins", label: "Airlock pour les médecins" },
    ],
  },
  {
    slug: "token-acces",
    metaTitle: "Qu'est-ce qu'un token d'accès ? | Airlock",
    metaDescription:
      "Découvrez ce qu'est un token d'accès, comment il fonctionne en sécurité informatique et pourquoi il est préférable aux identifiants classiques pour le partage de fichiers.",
    title: "Qu'est-ce qu'un token d'accès ?",
    subtitle:
      "Un token d'accès est une chaîne de caractères unique et cryptographique qui sert de clé temporaire pour accéder à une ressource protégée sans partager d'identifiants.",
    problemTitle: "Comprendre les tokens d'accès",
    problemContent:
      "Dans un système classique, l'accès à une ressource nécessite un identifiant et un mot de passe. Mais partager ses identifiants avec un tiers pour lui donner accès à un fichier est une pratique dangereuse : le tiers obtient un accès total, permanent et non traçable. Le token d'accès résout ce problème en créant un identifiant temporaire, limité en portée et révocable, qui donne accès à une ressource spécifique sans exposer les identifiants du propriétaire.",
    solutionTitle: "Les tokens de partage Airlock",
    solutionContent:
      "Chaque lien de partage Airlock contient un token unique de 64 caractères hexadécimaux, généré de manière cryptographiquement aléatoire. Ce token est haché en SHA-256 avant stockage dans la base de données, ce qui signifie que même en cas de compromission de la base, les tokens ne peuvent pas être retrouvés. Lors de la validation d'un accès, Airlock hache le token fourni par le visiteur et compare le résultat avec le hash stocké.",
    features: [
      {
        title: "Génération cryptographique",
        description:
          "Les tokens sont générés à partir d'un générateur de nombres aléatoires cryptographiques (CSPRNG), rendant leur prédiction mathématiquement impossible.",
      },
      {
        title: "Hachage avant stockage",
        description:
          "Comme les mots de passe, les tokens sont hachés avant d'être stockés. Même en accédant à la base de données, il est impossible de reconstruire le token original.",
      },
      {
        title: "Portée limitée",
        description:
          "Un token Airlock donne accès à un dossier ou fichier spécifique, avec des permissions définies (consultation, téléchargement). Il ne donne jamais accès au compte de l'utilisateur.",
      },
      {
        title: "Révocabilité",
        description:
          "Un token peut être invalidé instantanément par son créateur. Cette révocation est immédiate et définitive, contrairement à un mot de passe partagé qu'il est impossible de 'reprendre'.",
      },
    ],
    useCases: [
      {
        title: "Partage avec un prestataire externe",
        description:
          "Donnez à un prestataire un accès temporaire à un dossier de projet via un token, sans lui créer de compte ni partager vos identifiants.",
      },
      {
        title: "Lien de téléchargement unique",
        description:
          "Générez un token avec un quota d'une seule vue pour envoyer un document confidentiel qui ne pourra être consulté qu'une seule fois.",
      },
      {
        title: "Accès API temporaire",
        description:
          "Les APIs modernes utilisent des tokens (JWT, OAuth) pour authentifier les requêtes sans transmettre les identifiants à chaque appel.",
      },
    ],
    faqs: [
      {
        question: "Un token est-il plus sûr qu'un mot de passe ?",
        answer:
          "Dans le contexte du partage de fichiers, oui. Un mot de passe partagé peut être réutilisé, mémorisé ou partagé. Un token cryptographique de 64 caractères est impossible à mémoriser ou à deviner, et peut être révoqué individuellement sans affecter d'autres accès.",
      },
      {
        question: "Que se passe-t-il si un token est intercepté ?",
        answer:
          "Un token intercepté peut donner accès au fichier partagé. C'est pourquoi Airlock combine le token avec d'autres mécanismes de sécurité : expiration temporelle, quota de vues, protection par mot de passe, et chiffrement TLS pour empêcher l'interception en transit.",
      },
      {
        question: "Comment Airlock génère-t-il ses tokens ?",
        answer:
          "Airlock utilise un générateur cryptographique pour créer des tokens de 64 caractères hexadécimaux (256 bits d'entropie). L'espace de recherche (16^64 combinaisons possibles) rend toute attaque par force brute totalement irréaliste.",
      },
      {
        question: "Les tokens JWT et les tokens Airlock sont-ils la même chose ?",
        answer:
          "Non. Un token JWT (JSON Web Token) contient des données encodées et signées (payload). Un token Airlock est un identifiant opaque : il ne contient aucune information, il sert uniquement de clé pour retrouver les permissions associées dans la base de données. Les deux approches ont des avantages différents.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/lien-securise", label: "Qu'est-ce qu'un lien sécurisé ?" },
      { href: "/glossaire/revocation-acces", label: "Révocation d'accès" },
      { href: "/cas-usage/envoyer-devis-clients", label: "Envoyer un devis à ses clients" },
    ],
  },
  {
    slug: "revocation-acces",
    metaTitle: "Définition : Révocation d'accès | Airlock",
    metaDescription:
      "Comprenez la révocation d'accès, pourquoi elle est cruciale pour la sécurité des fichiers partagés et comment reprendre le contrôle de vos documents.",
    title: "Qu'est-ce que la révocation d'accès ?",
    subtitle:
      "La révocation d'accès est l'action de supprimer immédiatement et définitivement le droit d'un tiers à consulter ou télécharger une ressource partagée.",
    problemTitle: "Pourquoi la révocation d'accès est cruciale",
    problemContent:
      "Une fois qu'un fichier est envoyé par e-mail ou partagé via un lien permanent, il est impossible de le 'reprendre'. Si la relation avec le destinataire change (fin de collaboration, litige, erreur d'envoi), le document reste accessible sans limite. Ce manque de contrôle post-partage est l'un des risques les plus sous-estimés en sécurité documentaire. La capacité de révoquer un accès instantanément est aussi importante que la capacité de le donner.",
    solutionTitle: "La révocation instantanée chez Airlock",
    solutionContent:
      "Airlock permet de révoquer n'importe quel lien de partage en un clic. La révocation est immédiate : dès l'activation, le lien retourne une page d'erreur pour tout visiteur. Comme chaque lien est indépendant, révoquer l'accès d'un destinataire n'affecte pas les autres liens actifs vers le même dossier. Cette granularité permet une gestion fine des accès sans effet de bord.",
    features: [
      {
        title: "Révocation individuelle",
        description:
          "Chaque lien de partage peut être révoqué indépendamment. Si vous avez partagé un dossier avec 5 personnes, vous pouvez révoquer l'accès d'une seule sans toucher aux 4 autres.",
      },
      {
        title: "Effet immédiat",
        description:
          "La révocation prend effet instantanément. Il n'y a pas de délai de propagation ni de cache : dès que vous cliquez, l'accès est coupé.",
      },
      {
        title: "Irréversibilité contrôlée",
        description:
          "Un lien révoqué ne peut pas être réactivé. Pour redonner l'accès, un nouveau lien doit être créé, ce qui génère un nouveau token et un nouveau historique de traçabilité.",
      },
      {
        title: "Complémentarité avec l'expiration",
        description:
          "La révocation manuelle complète l'expiration automatique. L'expiration protège contre l'oubli, la révocation permet une action immédiate en cas de besoin urgent.",
      },
    ],
    useCases: [
      {
        title: "Fin de collaboration avec un prestataire",
        description:
          "Lorsqu'une mission se termine ou qu'un prestataire change, révoquez immédiatement tous ses accès aux documents partagés sans attendre l'expiration des liens.",
      },
      {
        title: "Envoi à la mauvaise personne",
        description:
          "Vous avez partagé un document confidentiel avec le mauvais destinataire. En quelques secondes, révoquez le lien avant que le fichier ne soit consulté.",
      },
      {
        title: "Fuite de données suspectée",
        description:
          "Si vous suspectez qu'un lien a été partagé au-delà du cercle autorisé, révoquez-le immédiatement et créez de nouveaux liens pour les destinataires légitimes.",
      },
    ],
    faqs: [
      {
        question: "Peut-on révoquer un accès après que le fichier a été téléchargé ?",
        answer:
          "La révocation empêche tout nouvel accès via le lien, mais ne peut pas supprimer un fichier déjà téléchargé sur l'appareil du destinataire. C'est pourquoi Airlock permet de désactiver le téléchargement sur certains liens, limitant les destinataires à la consultation en ligne uniquement.",
      },
      {
        question: "Comment savoir si un lien doit être révoqué ?",
        answer:
          "Consultez les analytics du lien dans votre tableau de bord Airlock. Si vous constatez des accès suspects (géolocalisation inattendue, nombre de vues anormal), c'est le signe qu'une révocation peut être nécessaire.",
      },
      {
        question: "La révocation supprime-t-elle le fichier ?",
        answer:
          "Non. La révocation désactive uniquement le lien de partage. Le fichier reste intact dans votre espace Airlock et vous pouvez créer un nouveau lien de partage à tout moment. La suppression du fichier et la révocation d'un lien sont deux actions distinctes.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/token-acces", label: "Qu'est-ce qu'un token d'accès ?" },
      { href: "/glossaire/tracabilite-acces", label: "Traçabilité des accès" },
      { href: "/pour/cabinets-conseil", label: "Airlock pour les cabinets de conseil" },
    ],
  },
  {
    slug: "tracabilite-acces",
    metaTitle: "Définition : Traçabilité des accès | Airlock",
    metaDescription:
      "Comprenez la traçabilité des accès, comment elle renforce la sécurité de vos fichiers partagés et pourquoi elle est essentielle pour la conformité.",
    title: "Qu'est-ce que la traçabilité des accès ?",
    subtitle:
      "La traçabilité des accès est la capacité d'enregistrer et de restituer l'historique complet de toutes les consultations d'une ressource : qui, quand, où et comment.",
    problemTitle: "Pourquoi la traçabilité est indispensable",
    problemContent:
      "Partager un fichier sans traçabilité, c'est comme envoyer une lettre recommandée sans accusé de réception. Vous ne savez pas si le destinataire l'a reçue, quand il l'a lue, ni s'il l'a transmise à d'autres personnes. Dans un contexte professionnel, cette absence de visibilité pose des problèmes concrets : impossible de prouver qu'un client a bien reçu un contrat, impossible de détecter un accès non autorisé, impossible de répondre aux exigences d'audit. La traçabilité transforme le partage de fichiers en un processus vérifiable et auditable.",
    solutionTitle: "L'analytics de partage Airlock",
    solutionContent:
      "Airlock enregistre chaque accès à un lien partagé avec un horodatage précis et une géolocalisation du visiteur. Le tableau de bord affiche en temps réel le nombre de vues et de téléchargements par lien, avec une visualisation géographique sur une carte interactive (Mapbox). Vous savez instantanément si votre document a été consulté, par combien de personnes distinctes et depuis quelles régions du monde.",
    features: [
      {
        title: "Horodatage de chaque accès",
        description:
          "Chaque consultation est enregistrée avec sa date et son heure précises, permettant de reconstituer la chronologie complète des accès à un document.",
      },
      {
        title: "Géolocalisation des visiteurs",
        description:
          "L'adresse IP du visiteur permet de déterminer sa localisation géographique approximative, affichée sur une carte interactive dans le tableau de bord Airlock.",
      },
      {
        title: "Compteurs de vues et téléchargements",
        description:
          "Chaque lien de partage dispose de compteurs distincts pour les consultations en ligne et les téléchargements, offrant une vue précise de l'utilisation de chaque document.",
      },
      {
        title: "Détection d'accès suspects",
        description:
          "Une consultation depuis un pays inattendu ou un nombre de vues anormalement élevé peut indiquer que le lien a été partagé au-delà du cercle autorisé.",
      },
    ],
    useCases: [
      {
        title: "Suivi de proposition commerciale",
        description:
          "Envoyez un devis via Airlock et sachez exactement quand votre prospect l'a ouvert. Si le devis n'a pas été consulté après 48h, c'est le moment de relancer.",
      },
      {
        title: "Preuve de transmission de documents",
        description:
          "Dans un contexte juridique, l'historique des accès peut servir de preuve que le destinataire a bien reçu et consulté un document à une date donnée.",
      },
      {
        title: "Audit de conformité",
        description:
          "Lors d'un audit RGPD ou ISO 27001, fournissez l'historique complet des accès à vos documents sensibles pour démontrer votre conformité.",
      },
    ],
    faqs: [
      {
        question: "La traçabilité des accès est-elle conforme au RGPD ?",
        answer:
          "Oui. Le RGPD autorise la collecte de données de traçabilité lorsqu'elle répond à un intérêt légitime (sécurité des données) ou à une obligation légale. La traçabilité des accès aux fichiers partagés s'inscrit dans les mesures de sécurité que le RGPD lui-même recommande.",
      },
      {
        question: "Le destinataire sait-il qu'il est tracé ?",
        answer:
          "Airlock peut afficher un avis de confidentialité sur la page de partage, informant le visiteur que son accès est enregistré. La transparence envers les destinataires est une bonne pratique recommandée par le RGPD.",
      },
      {
        question: "Peut-on exporter l'historique des accès ?",
        answer:
          "Le tableau de bord Airlock affiche l'historique détaillé des accès pour chaque lien de partage. Ces données peuvent être utilisées pour des rapports d'audit, des preuves de transmission ou des analyses d'engagement sur vos documents.",
      },
      {
        question: "La géolocalisation est-elle précise ?",
        answer:
          "La géolocalisation par adresse IP est précise au niveau de la ville dans la plupart des cas. Elle ne permet pas de localiser un individu à une adresse exacte, mais suffit pour détecter des accès depuis des pays ou régions inattendus.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/revocation-acces", label: "Révocation d'accès" },
      { href: "/cas-usage/partager-rapports-audit", label: "Partager des rapports d'audit" },
      { href: "/pour/experts-comptables", label: "Airlock pour les experts-comptables" },
    ],
  },
  {
    slug: "quota-de-vues",
    metaTitle: "Qu'est-ce qu'un quota de vues ? | Airlock",
    metaDescription:
      "Découvrez le quota de vues, un mécanisme de sécurité qui limite le nombre de consultations d'un fichier partagé pour un contrôle maximal de vos documents.",
    title: "Qu'est-ce qu'un quota de vues ?",
    subtitle:
      "Un quota de vues est une limite définie sur le nombre de fois qu'un lien de partage peut être utilisé pour consulter un fichier avant de s'inactiver automatiquement.",
    problemTitle: "Pourquoi limiter le nombre de vues",
    problemContent:
      "Un lien de partage classique peut être ouvert un nombre illimité de fois et partagé sans contrôle. Même avec une date d'expiration, le lien reste accessible à quiconque le possède pendant toute sa durée de validité. Pour des documents hautement confidentiels (offres d'acquisition, résultats financiers non publiés, brevets en cours de dépôt), il est crucial de limiter strictement le nombre de consultations. Le quota de vues ajoute une couche de sécurité supplémentaire en garantissant que le document ne peut être consulté qu'un nombre défini de fois.",
    solutionTitle: "Le quota de vues chez Airlock",
    solutionContent:
      "Lors de la création d'un lien de partage Airlock, vous pouvez définir un nombre maximum de vues (maxViews). Chaque consultation incrémente le compteur (viewCount), et lorsque le quota est atteint, le lien s'inactive automatiquement. Ce mécanisme fonctionne en complément de la date d'expiration : un lien peut ainsi expirer soit par le temps, soit par le nombre de vues, selon ce qui survient en premier. C'est une sécurité à double verrou.",
    features: [
      {
        title: "Compteur incrémental",
        description:
          "Chaque accès au lien incrémente un compteur persistant. Ce compteur est atomique : même en cas d'accès simultanés, chaque vue est comptabilisée correctement.",
      },
      {
        title: "Inactivation automatique",
        description:
          "Dès que le compteur de vues atteint le quota défini, le lien retourne automatiquement une page d'accès expiré, sans intervention manuelle nécessaire.",
      },
      {
        title: "Double verrou avec l'expiration",
        description:
          "Le quota de vues et la date d'expiration fonctionnent ensemble. Le lien s'inactive dès que l'une des deux conditions est remplie, offrant une protection redondante.",
      },
      {
        title: "Visibilité en temps réel",
        description:
          "Le tableau de bord Airlock affiche en temps réel le nombre de vues utilisées par rapport au quota défini, permettant de suivre la consommation du quota.",
      },
    ],
    useCases: [
      {
        title: "Document confidentiel à usage unique",
        description:
          "Envoyez un document hautement sensible avec un quota d'une seule vue. Une fois consulté par le destinataire, le lien s'inactive immédiatement, empêchant toute consultation ultérieure.",
      },
      {
        title: "Offre commerciale exclusive",
        description:
          "Partagez une proposition tarifaire avec un quota de 3 vues. Le prospect peut la consulter à plusieurs reprises pour prendre sa décision, mais ne peut pas la partager largement.",
      },
      {
        title: "Épreuve de validation",
        description:
          "Un photographe ou un designer envoie des épreuves de travail avec un quota limité, contrôlant ainsi la diffusion de travaux non finalisés.",
      },
    ],
    faqs: [
      {
        question: "Que se passe-t-il quand le quota de vues est atteint ?",
        answer:
          "Le lien devient inactif et affiche une page informant le visiteur que le quota de consultations a été atteint. Le fichier reste dans votre espace Airlock et vous pouvez créer un nouveau lien avec un nouveau quota si nécessaire.",
      },
      {
        question: "Une vue est-elle comptée si le fichier n'a pas fini de charger ?",
        answer:
          "La vue est comptabilisée dès que le lien est validé et que l'accès au fichier est autorisé. Si le visiteur ferme la page avant la fin du chargement, la vue est tout de même comptée. C'est une mesure de sécurité pour éviter les contournements.",
      },
      {
        question: "Peut-on augmenter le quota après la création du lien ?",
        answer:
          "Une fois un lien créé avec un quota défini, ce quota fait partie intégrante de la configuration du lien. Si le quota est atteint et que vous souhaitez donner un nouvel accès, la meilleure pratique est de créer un nouveau lien avec un nouveau quota.",
      },
      {
        question: "Le quota de vues remplace-t-il la date d'expiration ?",
        answer:
          "Non, les deux mécanismes sont complémentaires. Nous recommandons de toujours combiner un quota de vues avec une date d'expiration. Cela protège à la fois contre la sur-consultation (quota) et contre l'oubli de révocation (expiration automatique).",
      },
    ],
    relatedPages: [
      { href: "/glossaire/lien-securise", label: "Qu'est-ce qu'un lien sécurisé ?" },
      { href: "/cas-usage/envoyer-maquettes-clients", label: "Envoyer des maquettes à ses clients" },
      { href: "/alternative/swisstransfer", label: "Alternative à SwissTransfer" },
    ],
  },
];
