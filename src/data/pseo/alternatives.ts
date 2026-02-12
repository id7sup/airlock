import { PSEOPageData } from "./types";

export const alternatives: PSEOPageData[] = [
  {
    slug: "wetransfer",
    metaTitle: "Alternative a WeTransfer | Airlock",
    metaDescription:
      "Decouvrez Airlock, l'alternative securisee a WeTransfer avec liens expirables, protection par mot de passe, quotas de vues et tracabilite complete.",
    title: "Le controle que WeTransfer ne vous offre pas",
    subtitle:
      "WeTransfer est pratique pour envoyer des fichiers rapidement, mais une fois le lien partage, vous perdez tout controle. De plus en plus de professionnels cherchent une alternative qui allie simplicite et securite.",
    problemTitle: "Les limites de WeTransfer",
    problemContent:
      "WeTransfer propose des liens de telechargement valables 7 jours en version gratuite, sans possibilite de revoquer l'acces une fois le fichier envoye. Il n'existe aucun suivi des telechargements : vous ne savez pas qui a telecharge vos fichiers, ni combien de fois. La version gratuite est limitee a 2 Go par transfert et ne propose ni protection par mot de passe, ni chiffrement en transit et au repos.",
    solutionTitle: "Airlock : la simplicite de WeTransfer, la securite en plus",
    solutionContent:
      "Airlock vous permet d'envoyer des fichiers volumineux avec la meme simplicite que WeTransfer, tout en gardant le controle total. Chaque lien peut etre protege par mot de passe, limite en nombre de vues et revoque a tout moment. Vous suivez chaque acces en temps reel avec la geolocalisation et l'horodatage.",
    features: [
      {
        title: "Revocation instantanee des liens",
        description:
          "Contrairement a WeTransfer ou le lien reste actif jusqu'a expiration, Airlock permet de revoquer un lien de partage en un clic, meme apres envoi.",
      },
      {
        title: "Quota de vues configurable",
        description:
          "Limitez le nombre de consultations d'un fichier partage. WeTransfer ne propose aucun controle sur le nombre de telechargements.",
      },
      {
        title: "Tracabilite complete des acces",
        description:
          "Visualisez qui a consulte ou telecharge vos fichiers, avec l'adresse IP, la geolocalisation et l'heure exacte. WeTransfer ne fournit qu'une notification de telechargement basique.",
      },
      {
        title: "Stockage sur Cloudflare R2 en Europe",
        description:
          "Vos fichiers sont heberges sur Cloudflare R2 avec chiffrement au repos. Cloudflare propose des options de stockage en Europe, contrairement a WeTransfer dont les serveurs sont aux Etats-Unis sans option de localisation.",
      },
    ],
    useCases: [
      {
        title: "Envoi de contrats a signer",
        description:
          "Un cabinet d'avocats envoie un contrat confidentiel via WeTransfer et ne peut pas verifier si le destinataire l'a bien recu. Avec Airlock, il suit l'ouverture en temps reel et revoque le lien apres signature.",
      },
      {
        title: "Partage de maquettes avec un client",
        description:
          "Une agence de design partage des maquettes haute resolution. Sur WeTransfer, le client peut transmettre le lien a n'importe qui. Avec Airlock, le quota de vues empeche toute diffusion non autorisee.",
      },
      {
        title: "Transfert de fichiers volumineux avec suivi",
        description:
          "Un photographe envoie des galleries de plusieurs Go. WeTransfer ne permet pas de savoir si le client a telecharge les fichiers. Airlock fournit un tableau de bord analytique complet.",
      },
    ],
    faqs: [
      {
        question: "Airlock est-il aussi simple a utiliser que WeTransfer ?",
        answer:
          "Oui, Airlock est concu pour etre aussi intuitif que WeTransfer. Vous deposez vos fichiers, generez un lien et le partagez. La difference est que vous gardez le controle apres l'envoi : revocation, suivi des acces, protection par mot de passe.",
      },
      {
        question: "Puis-je envoyer des fichiers volumineux comme sur WeTransfer ?",
        answer:
          "Absolument. Airlock utilise le stockage Cloudflare R2 avec des URLs pre-signees pour un upload direct, sans limite de bande passante cote serveur. Les fichiers sont stockes de maniere securisee et conforme au RGPD.",
      },
      {
        question: "WeTransfer est gratuit, pourquoi passer a Airlock ?",
        answer:
          "La version gratuite de WeTransfer est limitee a 2 Go, sans mot de passe ni suivi. Airlock offre des fonctionnalites de securite professionnelles : liens expirables, quotas de vues, tracabilite, chiffrement. Pour un usage professionnel, la securite de vos fichiers justifie l'investissement.",
      },
      {
        question: "Mes fichiers sont-ils mieux proteges sur Airlock ?",
        answer:
          "Oui. Airlock stocke vos fichiers sur Cloudflare R2 avec des URLs pre-signees temporaires, protege chaque lien par mot de passe et quota de vues, et vous permet de revoquer l'acces a tout moment. WeTransfer ne propose aucun de ces mecanismes en version gratuite.",
      },
    ],
    relatedPages: [
      { href: "/cas-usage/transferer-fichiers-volumineux", label: "Transferer des fichiers volumineux en toute securite" },
      { href: "/cas-usage/envoyer-maquettes-clients", label: "Envoyer des maquettes a vos clients" },
      { href: "/glossaire/lien-securise", label: "Qu'est-ce qu'un lien securise ?" },
    ],
  },
  {
    slug: "dropbox",
    metaTitle: "Alternative a Dropbox | Airlock",
    metaDescription:
      "Airlock, l'alternative a Dropbox pour le partage securise de fichiers : liens expirables, tracabilite des acces, conformite RGPD et stockage securise sur Cloudflare R2.",
    title: "Partagez vos fichiers sans les risques de Dropbox",
    subtitle:
      "Dropbox est un outil de stockage cloud populaire, mais son modele de synchronisation permanente et ses partages difficiles a controler poussent de nombreux professionnels a chercher une solution plus securisee pour le partage externe.",
    problemTitle: "Les limites de Dropbox pour le partage externe",
    problemContent:
      "Dropbox est avant tout un outil de synchronisation de fichiers, pas un outil de partage securise. Les liens partages sont permanents par defaut et difficiles a revoquer individuellement. L'historique des acces est limite : vous savez qu'un fichier a ete consulte, mais pas par qui exactement ni depuis ou. De plus, Dropbox stocke les donnees sur des serveurs aux Etats-Unis, ce qui pose des questions de conformite RGPD pour les entreprises europeennes.",
    solutionTitle: "Airlock : le partage externe que Dropbox ne sait pas faire",
    solutionContent:
      "Airlock est concu specifiquement pour le partage securise de fichiers avec des tiers. Chaque lien de partage est independant, avec sa propre date d'expiration, son mot de passe et son quota de vues. Vous savez exactement qui accede a vos fichiers, quand et depuis ou, grace a une tracabilite complete conforme au RGPD.",
    features: [
      {
        title: "Liens de partage independants et controlables",
        description:
          "Chaque lien Airlock possede ses propres parametres de securite. Sur Dropbox, un dossier partage donne un acces permanent difficile a gerer fichier par fichier.",
      },
      {
        title: "Tracabilite avec geolocalisation",
        description:
          "Airlock enregistre chaque consultation avec l'IP, la localisation geographique et l'horodatage. Dropbox ne fournit qu'un historique d'activite basique sans geolocalisation.",
      },
      {
        title: "Conformite RGPD native",
        description:
          "Les fichiers sont stockes sur Cloudflare R2 avec chiffrement au repos. Cloudflare permet un stockage en region europeenne. Dropbox heberge les donnees aux Etats-Unis, necessitant des clauses contractuelles supplementaires pour la conformite RGPD.",
      },
      {
        title: "Expiration et quotas de vues",
        description:
          "Definissez une date d'expiration et un nombre maximum de consultations par lien. Dropbox ne propose pas de limite de vues et l'expiration de liens n'est disponible qu'en version Business.",
      },
    ],
    useCases: [
      {
        title: "Data room pour levee de fonds",
        description:
          "Un startup partage des documents financiers avec des investisseurs via Dropbox, mais ne peut pas savoir qui a consulte quoi. Avec Airlock, chaque investisseur recoit un lien unique et trace individuellement.",
      },
      {
        title: "Partage de rapports d'audit",
        description:
          "Un cabinet d'expertise comptable envoie des rapports confidentiels. Sur Dropbox, le lien reste actif indefiniment. Airlock permet de fixer une expiration automatique apres validation du rapport.",
      },
      {
        title: "Collaboration externe ponctuelle",
        description:
          "Une entreprise partage des documents avec un prestataire pour une mission. Sur Dropbox, il faut penser a retirer les acces apres la mission. Airlock expire les liens automatiquement.",
      },
    ],
    faqs: [
      {
        question: "Airlock remplace-t-il Dropbox pour le stockage ?",
        answer:
          "Non, Airlock n'est pas un outil de synchronisation de fichiers. Il est complementaire : utilisez Dropbox pour votre stockage interne et Airlock pour tout partage externe securise ou vous avez besoin de controle et de tracabilite.",
      },
      {
        question: "Comment migrer mes partages Dropbox vers Airlock ?",
        answer:
          "Telechargez les fichiers que vous souhaitez partager de maniere securisee depuis Dropbox, puis importez-les dans Airlock. Creez des liens de partage avec les parametres de securite souhaites. L'operation prend quelques minutes par dossier.",
      },
      {
        question: "Dropbox Business offre-t-il les memes fonctionnalites ?",
        answer:
          "Dropbox Business ajoute des controles d'administration et l'expiration de liens, mais ne propose toujours pas de quotas de vues, de geolocalisation des acces, ni de stockage europeen sur Cloudflare R2. Airlock est concu des le depart pour le partage securise.",
      },
    ],
    relatedPages: [
      { href: "/cas-usage/data-room-levee-de-fonds", label: "Data room pour levee de fonds" },
      { href: "/glossaire/rgpd", label: "Comprendre le RGPD" },
      { href: "/pour/startups", label: "Airlock pour les startups" },
    ],
  },
  {
    slug: "onedrive",
    metaTitle: "Alternative a OneDrive | Airlock",
    metaDescription:
      "Airlock, l'alternative a OneDrive pour le partage externe securise : tracabilite des acces, liens expirables, quotas de vues et conformite RGPD.",
    title: "Le partage securise que OneDrive ne maitrise pas",
    subtitle:
      "OneDrive est profondement integre a l'ecosysteme Microsoft 365, ce qui en fait un bon outil de stockage interne. Mais pour le partage externe de documents sensibles, ses limites deviennent vite apparentes.",
    problemTitle: "Les limites de OneDrive pour le partage externe securise",
    problemContent:
      "OneDrive est concu pour la collaboration interne dans l'ecosysteme Microsoft. Le partage externe repose sur des liens generiques dont la gestion granulaire est complexe et enfouie dans les parametres d'administration. La tracabilite des acces externes est limitee au journal d'audit Microsoft 365, peu accessible aux utilisateurs non-administrateurs. Les parametres d'expiration et de mot de passe ne sont disponibles que dans certains plans premium.",
    solutionTitle: "Airlock : un partage externe precis, sans la complexite Microsoft",
    solutionContent:
      "Airlock offre une interface dediee au partage securise, sans la complexite de l'administration Microsoft 365. Chaque lien de partage est autonome avec ses propres regles de securite. La tracabilite est accessible a chaque utilisateur, pas uniquement aux administrateurs. Pas besoin de licence Microsoft pour vos destinataires.",
    features: [
      {
        title: "Interface dediee au partage",
        description:
          "Airlock est concu uniquement pour le partage securise, avec une interface claire et intuitive. OneDrive melange stockage, synchronisation et partage dans une interface complexe.",
      },
      {
        title: "Tracabilite accessible a tous les utilisateurs",
        description:
          "Chaque utilisateur Airlock voit qui a accede a ses fichiers. Sur OneDrive, les journaux d'audit sont reserves aux administrateurs Microsoft 365.",
      },
      {
        title: "Aucune licence requise pour les destinataires",
        description:
          "Les destinataires accedent aux fichiers via un simple lien securise. OneDrive demande parfois un compte Microsoft pour l'acces externe, creant des frictions.",
      },
      {
        title: "Quotas de vues par lien",
        description:
          "Limitez precisement le nombre de consultations d'un document. OneDrive ne propose aucun mecanisme de quota de vues sur les liens partages.",
      },
    ],
    useCases: [
      {
        title: "Cabinet de conseil partageant des livrables",
        description:
          "Un consultant envoie un rapport strategique a son client. Sur OneDrive, le client doit parfois se connecter avec un compte Microsoft. Avec Airlock, un simple lien securise par mot de passe suffit.",
      },
      {
        title: "Notaire transmettant des actes",
        description:
          "Un notaire doit envoyer des actes signes a plusieurs parties. OneDrive ne permet pas de tracer individuellement les acces. Airlock attribue un lien unique a chaque destinataire avec tracabilite complete.",
      },
      {
        title: "Partage de bulletins de paie",
        description:
          "Un service RH distribue des bulletins de paie. OneDrive necessite une gestion complexe des permissions. Airlock genere un lien individuel securise par salarie, avec expiration automatique.",
      },
    ],
    faqs: [
      {
        question: "Airlock peut-il s'integrer a mon environnement Microsoft 365 ?",
        answer:
          "Airlock fonctionne de maniere independante. Vous pouvez telecharger des fichiers depuis OneDrive et les importer dans Airlock pour les partager de maniere securisee. Les deux outils sont complementaires : OneDrive pour le stockage interne, Airlock pour le partage externe.",
      },
      {
        question: "OneDrive for Business ne suffit-il pas pour la securite ?",
        answer:
          "OneDrive for Business offre des fonctionnalites de securite solides pour la collaboration interne, mais le partage externe reste limite. Il manque les quotas de vues, la geolocalisation des acces et la revocation granulaire par lien qu'Airlock propose.",
      },
      {
        question: "Mes destinataires ont-ils besoin d'un compte pour acceder aux fichiers ?",
        answer:
          "Non. Avec Airlock, vos destinataires accedent aux fichiers via un lien securise dans leur navigateur. Aucun compte, aucune application, aucune installation n'est necessaire.",
      },
    ],
    relatedPages: [
      { href: "/pour/cabinets-conseil", label: "Airlock pour les cabinets de conseil" },
      { href: "/cas-usage/partager-bulletins-paie", label: "Partager des bulletins de paie en securite" },
      { href: "/glossaire/tracabilite-acces", label: "Qu'est-ce que la tracabilite des acces ?" },
    ],
  },
  {
    slug: "sharepoint",
    metaTitle: "Alternative a SharePoint | Airlock",
    metaDescription:
      "Airlock, l'alternative simple a SharePoint pour le partage externe de documents : sans infrastructure complexe, avec tracabilite et conformite RGPD.",
    title: "Partagez en toute securite, sans la complexite de SharePoint",
    subtitle:
      "SharePoint est un outil puissant pour la gestion documentaire interne, mais sa complexite d'administration et ses limitations pour le partage externe poussent de nombreuses equipes a chercher des solutions plus agiles.",
    problemTitle: "SharePoint : une usine a gaz pour le partage externe",
    problemContent:
      "SharePoint est concu pour la gestion documentaire interne des grandes organisations. Configurer le partage externe necessite des competences d'administration avancees et implique des politiques de securite globales qui s'appliquent a l'ensemble du tenant. La creation d'un simple lien de partage securise requiert souvent l'intervention de l'equipe IT. L'interface est complexe pour les utilisateurs non techniques et encore plus confuse pour les destinataires externes.",
    solutionTitle: "Airlock : la securite de SharePoint en 10 fois plus simple",
    solutionContent:
      "Airlock offre un niveau de securite comparable a SharePoint pour le partage externe, mais avec une interface intuitive accessible a tous. Aucune configuration d'infrastructure n'est necessaire : creez un compte, deposez vos fichiers, generez un lien securise. Le tout en quelques clics, sans equipe IT.",
    features: [
      {
        title: "Mise en place en quelques minutes",
        description:
          "Airlock est operationnel immediatement, sans deploiement d'infrastructure. SharePoint necessite des semaines de configuration, une licence Microsoft 365 et souvent un integrateur.",
      },
      {
        title: "Partage externe sans administration IT",
        description:
          "Chaque utilisateur Airlock gere ses propres partages en autonomie. Sur SharePoint, le partage externe depend des politiques globales definies par l'administrateur du tenant.",
      },
      {
        title: "Analytique des acces en temps reel",
        description:
          "Airlock affiche un tableau de bord visuel avec carte de geolocalisation des acces. SharePoint propose des rapports d'audit techniques reserves aux administrateurs.",
      },
      {
        title: "Experience destinataire fluide",
        description:
          "Les destinataires Airlock accedent aux fichiers via un lien propre dans le navigateur. SharePoint impose souvent une interface confuse avec des demandes d'authentification Microsoft.",
      },
    ],
    useCases: [
      {
        title: "PME sans equipe IT dediee",
        description:
          "Une PME de 20 personnes a besoin de partager des documents avec ses clients. SharePoint est surdimensionne et necessite une administration constante. Airlock offre le meme niveau de securite sans la complexite.",
      },
      {
        title: "Partage de documents de due diligence",
        description:
          "Lors d'une acquisition, l'equipe juridique doit partager des centaines de documents. SharePoint impose des permissions complexes par site. Airlock cree une data room securisee avec tracabilite individuelle en quelques minutes.",
      },
      {
        title: "Agence envoyant des livrables a de multiples clients",
        description:
          "Une agence de communication gere des dizaines de clients. Creer un site SharePoint par client est impraticable. Airlock permet de generer un lien securise par projet en quelques secondes.",
      },
    ],
    faqs: [
      {
        question: "Airlock peut-il remplacer SharePoint pour la gestion documentaire interne ?",
        answer:
          "Non, Airlock n'est pas un outil de gestion documentaire interne. Il est specialise dans le partage externe securise. Vous pouvez continuer a utiliser SharePoint en interne et utiliser Airlock pour tout envoi externe de documents sensibles.",
      },
      {
        question: "SharePoint Online n'est-il pas plus securise ?",
        answer:
          "SharePoint Online offre une securite robuste pour l'ecosysteme Microsoft, mais ses controles de partage externe sont generiques. Airlock permet un controle plus fin par lien : quota de vues, expiration, mot de passe, revocation, le tout sans politique globale de tenant.",
      },
      {
        question: "Faut-il des competences techniques pour utiliser Airlock ?",
        answer:
          "Non. Airlock est concu pour etre utilise par n'importe quel professionnel sans competence technique. L'interface est intuitive : deposez un fichier, configurez la securite, partagez le lien. C'est tout.",
      },
      {
        question: "Comment Airlock gere-t-il les permissions ?",
        answer:
          "Chaque lien de partage Airlock est independant avec ses propres permissions : telechargement, consultation en ligne, acces au dossier complet. Pas de hierarchie complexe de sites et sous-sites comme sur SharePoint.",
      },
    ],
    relatedPages: [
      { href: "/cas-usage/partager-documents-due-diligence", label: "Partager des documents de due diligence" },
      { href: "/glossaire/data-room", label: "Qu'est-ce qu'une data room ?" },
      { href: "/pour/agences-immobilieres", label: "Airlock pour les agences immobilieres" },
    ],
  },
  {
    slug: "tresorit",
    metaTitle: "Alternative a Tresorit | Airlock",
    metaDescription:
      "Airlock, l'alternative a Tresorit avec tracabilite geographique, quotas de vues, interface intuitive et tarification accessible pour les professionnels.",
    title: "La securite de Tresorit, la simplicite en plus",
    subtitle:
      "Tresorit est reconnu pour son chiffrement de bout en bout, mais son interface austere, sa tarification elevee et certaines fonctionnalites manquantes incitent les professionnels a explorer des alternatives tout aussi securisees.",
    problemTitle: "Les limites de Tresorit au quotidien",
    problemContent:
      "Tresorit offre un chiffrement zero-knowledge reconnu, mais son interface utilisateur est datee et peu intuitive. La tarification est parmi les plus elevees du marche, ce qui le rend difficilement accessible aux TPE et freelances. Les fonctionnalites de tracabilite sont basiques : pas de geolocalisation des acces, pas de visualisation cartographique, et les quotas de vues ne sont pas disponibles sur les liens partages.",
    solutionTitle: "Airlock : securite avancee, experience moderne",
    solutionContent:
      "Airlock combine une securite robuste avec une interface moderne et intuitive. Le stockage Cloudflare R2 conforme au RGPD, les liens proteges par mot de passe et les quotas de vues offrent un niveau de controle equivalent. La tracabilite avec geolocalisation sur carte interactive va au-dela de ce que Tresorit propose, le tout a un tarif plus accessible.",
    features: [
      {
        title: "Tracabilite avec geolocalisation cartographique",
        description:
          "Airlock affiche les acces a vos fichiers sur une carte interactive avec Mapbox. Tresorit ne propose pas de visualisation geographique des acces.",
      },
      {
        title: "Quotas de vues par lien de partage",
        description:
          "Limitez le nombre de consultations de chaque lien partage. Tresorit permet de revoquer un lien mais ne propose pas de quotas de vues.",
      },
      {
        title: "Tarification accessible",
        description:
          "Airlock propose une tarification adaptee aux independants et petites structures. Tresorit demarre a des tarifs significativement plus eleves, destines principalement aux grandes entreprises.",
      },
      {
        title: "Interface moderne et reactive",
        description:
          "L'interface Airlock est construite avec React 19 et Next.js pour une experience fluide. Tresorit utilise une interface desktop qui n'a pas ete significativement modernisee.",
      },
    ],
    useCases: [
      {
        title: "Freelance partageant des livrables confidentiels",
        description:
          "Un freelance en design envoie des maquettes a ses clients. Tresorit est trop couteux pour un independant. Airlock offre la meme securite de partage a un tarif adapte aux freelances.",
      },
      {
        title: "Cabinet medical transmettant des dossiers",
        description:
          "Un medecin partage des resultats d'examens avec un patient. Il a besoin de savoir si le patient a bien consulte le document. Airlock fournit la tracabilite precise que Tresorit ne propose pas avec la meme granularite.",
      },
      {
        title: "Startup en phase de levee de fonds",
        description:
          "Une startup doit partager des documents financiers avec des investisseurs et suivre leur consultation. Les quotas de vues et la tracabilite geographique d'Airlock permettent un suivi impossible a obtenir sur Tresorit.",
      },
    ],
    faqs: [
      {
        question: "Airlock offre-t-il le meme niveau de chiffrement que Tresorit ?",
        answer:
          "Airlock utilise le chiffrement TLS pour le transfert et le stockage securise sur Cloudflare R2. Tresorit propose un chiffrement zero-knowledge cote client. Les deux approches protegent vos donnees, avec des philosophies differentes. Airlock compense par des fonctionnalites de controle d'acces plus avancees.",
      },
      {
        question: "Tresorit est suisse, est-ce un avantage pour la conformite ?",
        answer:
          "La localisation suisse de Tresorit offre un cadre juridique favorable. Airlock stocke les donnees sur Cloudflare R2 en Europe et respecte le RGPD. Pour les entreprises europeennes, les deux solutions offrent un niveau de conformite adequat.",
      },
      {
        question: "Puis-je migrer mes fichiers de Tresorit vers Airlock ?",
        answer:
          "Oui. Exportez vos fichiers depuis Tresorit et importez-les dans Airlock. La structure en dossiers d'Airlock vous permet de reorganiser vos documents facilement. Les nouveaux liens de partage seront crees avec les parametres de securite d'Airlock.",
      },
    ],
    relatedPages: [
      { href: "/glossaire/zero-knowledge", label: "Qu'est-ce que le zero-knowledge ?" },
      { href: "/pour/medecins", label: "Airlock pour les medecins" },
      { href: "/cas-usage/data-room-levee-de-fonds", label: "Data room pour levee de fonds" },
    ],
  },
  {
    slug: "box",
    metaTitle: "Alternative a Box | Airlock",
    metaDescription:
      "Airlock, l'alternative a Box pour le partage securise : liens individuels, tracabilite geographique, quotas de vues et tarification simple sans contrat annuel.",
    title: "Le partage securise que Box rend trop complique",
    subtitle:
      "Box est une plateforme de gestion de contenu enterprise robuste, mais sa complexite, ses contrats rigides et son orientation grandes entreprises laissent de nombreuses structures sans solution adaptee pour le partage externe securise.",
    problemTitle: "Les limites de Box pour les equipes agiles",
    problemContent:
      "Box est concu pour les grandes entreprises avec des besoins de gouvernance documentaire avancee. La tarification impose des engagements annuels et des minimums de licences qui le rendent inaccessible aux petites structures. Le partage externe, bien que possible, est encadre par des politiques d'administration globales qui limitent la flexibilite individuelle. L'interface est fonctionnelle mais dense, avec une courbe d'apprentissage significative.",
    solutionTitle: "Airlock : la securite enterprise a l'echelle humaine",
    solutionContent:
      "Airlock offre les fonctionnalites de partage securise dont vous avez besoin sans la complexite enterprise de Box. Chaque utilisateur est autonome dans la gestion de ses liens de partage. La tarification est simple et flexible, sans engagement annuel ni minimum de licences. L'interface est intuitive des la premiere utilisation.",
    features: [
      {
        title: "Pas de minimum de licences ni d'engagement",
        description:
          "Airlock propose une tarification a l'utilisateur sans contrat annuel. Box exige generalement un minimum de 3 a 5 licences avec engagement de 12 mois.",
      },
      {
        title: "Autonomie complete des utilisateurs",
        description:
          "Sur Airlock, chaque utilisateur configure librement ses liens de partage. Sur Box, les politiques de partage externe sont definies globalement par l'administrateur.",
      },
      {
        title: "Geolocalisation des acces sur carte",
        description:
          "Airlock affiche les acces a vos fichiers sur une carte interactive. Box propose des journaux d'audit textuels sans representation geographique visuelle.",
      },
      {
        title: "Liens de partage avec quotas de vues",
        description:
          "Definissez un nombre maximum de consultations par lien. Box propose l'expiration et le mot de passe mais pas de limitation du nombre de vues.",
      },
    ],
    useCases: [
      {
        title: "Expert-comptable partageant des bilans",
        description:
          "Un expert-comptable envoie des bilans annuels a ses clients. Box est surdimensionne et couteux pour ce besoin. Airlock permet de creer un lien securise par client avec expiration automatique apres validation.",
      },
      {
        title: "Partage de devis et propositions commerciales",
        description:
          "Une equipe commerciale envoie des propositions chiffrees a des prospects. Sur Box, il faut creer un dossier partage par prospect. Airlock genere un lien securise en quelques secondes avec suivi de consultation.",
      },
      {
        title: "Association partageant des documents avec ses membres",
        description:
          "Une association doit diffuser des documents a ses adherents de maniere securisee. Box est trop couteux et complexe. Airlock offre une solution simple et abordable avec controle des acces.",
      },
    ],
    faqs: [
      {
        question: "Box est-il plus securise qu'Airlock ?",
        answer:
          "Box et Airlock offrent tous deux un niveau de securite eleve pour le partage de fichiers. Box propose des certifications enterprise avancees (SOC 2, HIPAA). Airlock se concentre sur le controle granulaire des acces : quotas de vues, geolocalisation, revocation instantanee, des fonctionnalites que Box n'offre pas toutes.",
      },
      {
        question: "Airlock convient-il aux grandes entreprises ?",
        answer:
          "Airlock est actuellement optimise pour les TPE, PME, freelances et professions liberales. Si vous avez besoin d'une gouvernance documentaire enterprise avec workflows d'approbation complexes, Box reste pertinent. Pour le partage externe securise avec tracabilite, Airlock est plus adapte.",
      },
      {
        question: "Puis-je utiliser Airlock en complement de Box ?",
        answer:
          "Absolument. De nombreux utilisateurs conservent Box pour la gestion documentaire interne et utilisent Airlock specifiquement pour le partage externe securise, profitant ainsi de la tracabilite avancee et des quotas de vues.",
      },
    ],
    relatedPages: [
      { href: "/pour/experts-comptables", label: "Airlock pour les experts-comptables" },
      { href: "/cas-usage/envoyer-devis-clients", label: "Envoyer des devis a vos clients" },
      { href: "/pour/associations", label: "Airlock pour les associations" },
    ],
  },
  {
    slug: "smash",
    metaTitle: "Alternative a Smash | Airlock",
    metaDescription:
      "Airlock, l'alternative a Smash pour le transfert de fichiers : liens revocables, quotas de vues, tracabilite complete et stockage RGPD conforme.",
    title: "Allez plus loin que le simple transfert avec Smash",
    subtitle:
      "Smash a seduit par son design elegant et l'absence de limite de taille en version gratuite. Mais le service ayant evolue et ses limitations en matiere de securite et de tracabilite devenant evidentes, les professionnels se tournent vers des solutions plus completes.",
    problemTitle: "Les limites de Smash pour un usage professionnel",
    problemContent:
      "Smash est un service de transfert de fichiers francais au design soigne, mais il reste un outil de transfert ponctuel. Les liens expirent automatiquement apres un delai fixe sans possibilite de les revoquer avant l'echeance. Il n'y a pas de suivi detaille des telechargements au-dela d'une notification basique. La gestion des fichiers est ephemere : pas de dossiers, pas d'organisation, pas d'historique de partages.",
    solutionTitle: "Airlock : le design francais, la securite professionnelle",
    solutionContent:
      "Airlock offre la meme attention au design que Smash, avec des fonctionnalites de securite professionnelles. Vos fichiers sont organises en dossiers, vos liens de partage sont configurables individuellement et votre historique est conserve. Vous passez du transfert ephemere a une veritable plateforme de partage securise.",
    features: [
      {
        title: "Organisation permanente des fichiers",
        description:
          "Airlock propose une arborescence de dossiers pour organiser vos fichiers de facon permanente. Smash supprime les fichiers apres le delai de telechargement.",
      },
      {
        title: "Revocation des liens a tout moment",
        description:
          "Revoquez un lien de partage instantanement sur Airlock. Sur Smash, une fois le lien envoye, vous ne pouvez pas empecher le telechargement avant l'expiration.",
      },
      {
        title: "Tracabilite detaillee des acces",
        description:
          "Airlock enregistre chaque consultation avec IP, geolocalisation et horodatage. Smash se limite a une notification par email lors du telechargement.",
      },
      {
        title: "Liens multiples par fichier",
        description:
          "Creez plusieurs liens de partage pour un meme dossier, chacun avec ses propres parametres. Smash genere un seul lien par transfert.",
      },
    ],
    useCases: [
      {
        title: "Architecte partageant des plans",
        description:
          "Un architecte envoie des plans a differents intervenants d'un chantier. Avec Smash, il doit recreer un transfert a chaque modification. Airlock conserve les fichiers et permet de generer de nouveaux liens pour les versions mises a jour.",
      },
      {
        title: "Envoi de contrats avec suivi de lecture",
        description:
          "Un commercial envoie un contrat et a besoin de savoir si le prospect l'a consulte. Smash n'indique que le telechargement. Airlock montre exactement quand et d'ou le document a ete ouvert.",
      },
      {
        title: "Transfert de fichiers confidentiels avec revocation",
        description:
          "Un DRH envoie des documents de licenciement par erreur au mauvais destinataire. Sur Smash, impossible de revoquer le lien. Sur Airlock, un clic suffit pour couper immediatement l'acces.",
      },
    ],
    faqs: [
      {
        question: "Smash est francais, Airlock aussi ?",
        answer:
          "Oui, Airlock est une solution francaise qui stocke les donnees sur Cloudflare R2 en Europe, en pleine conformite avec le RGPD. Comme Smash, Airlock accorde une grande importance au design et a l'experience utilisateur.",
      },
      {
        question: "Smash est gratuit, pourquoi choisir Airlock ?",
        answer:
          "La version gratuite de Smash est limitee en fonctionnalites de securite et de tracabilite. Pour un usage professionnel ou vous manipulez des documents sensibles, Airlock offre le controle, la tracabilite et la conformite necessaires.",
      },
      {
        question: "Airlock permet-il aussi le transfert ponctuel de gros fichiers ?",
        answer:
          "Oui. Airlock utilise des URLs pre-signees pour l'upload direct sur Cloudflare R2, sans limite de bande passante serveur. Vous pouvez utiliser Airlock pour des transferts ponctuels tout en beneficiant de la securite avancee.",
      },
      {
        question: "Mes fichiers sont-ils conserves sur Airlock ?",
        answer:
          "Oui, contrairement a Smash qui supprime les fichiers apres expiration, Airlock conserve vos fichiers dans votre espace de stockage. Vous pouvez creer de nouveaux liens de partage a tout moment sans re-uploader les fichiers.",
      },
    ],
    relatedPages: [
      { href: "/pour/architectes", label: "Airlock pour les architectes" },
      { href: "/cas-usage/partager-plans-architecturaux", label: "Partager des plans architecturaux" },
      { href: "/glossaire/url-presignee", label: "Qu'est-ce qu'une URL pre-signee ?" },
    ],
  },
  {
    slug: "swisstransfer",
    metaTitle: "Alternative a SwissTransfer | Airlock",
    metaDescription:
      "Airlock, l'alternative a SwissTransfer avec tracabilite des acces, quotas de vues, revocation de liens et organisation permanente des fichiers.",
    title: "Au-dela du transfert suisse : le partage securise complet",
    subtitle:
      "SwissTransfer, developpe par Infomaniak, seduit par sa localisation suisse et sa generosite en version gratuite. Mais pour les professionnels qui ont besoin de plus qu'un simple transfert, ses limites se font sentir.",
    problemTitle: "Les limites de SwissTransfer pour un usage professionnel",
    problemContent:
      "SwissTransfer est un excellent service de transfert de fichiers gratuit, avec une limite genereuse de 50 Go. Cependant, il reste un outil de transfert ephemere : les fichiers sont supprimes apres 30 jours maximum, il n'y a pas de gestion de dossiers, pas de revocation de liens et la tracabilite se limite a une notification de telechargement. La protection par mot de passe est disponible, mais sans quota de vues ni analytique detaillee.",
    solutionTitle: "Airlock : la confiance suisse, les fonctionnalites pro",
    solutionContent:
      "Airlock offre la meme philosophie de respect de la vie privee que SwissTransfer, avec des fonctionnalites professionnelles completes. Vos fichiers sont stockes de maniere permanente sur Cloudflare R2 en Europe, organises en dossiers. Chaque lien de partage est entierement configurable avec tracabilite avancee, quotas de vues et revocation instantanee.",
    features: [
      {
        title: "Stockage permanent et organise",
        description:
          "Airlock conserve vos fichiers dans une arborescence de dossiers. SwissTransfer supprime automatiquement les fichiers apres 30 jours maximum.",
      },
      {
        title: "Revocation instantanee des liens",
        description:
          "Coupez l'acces a un fichier partage en un clic sur Airlock. SwissTransfer ne permet pas de revoquer un lien avant son expiration.",
      },
      {
        title: "Analytique et tracabilite avancee",
        description:
          "Visualisez chaque acces avec IP, geolocalisation et horodatage sur une carte interactive. SwissTransfer ne fournit qu'une notification de telechargement.",
      },
      {
        title: "Quotas de vues par lien",
        description:
          "Limitez le nombre de consultations d'un document partage. SwissTransfer propose un nombre de telechargements limite mais pas de quota de vues en consultation.",
      },
    ],
    useCases: [
      {
        title: "Agence immobiliere partageant des dossiers de vente",
        description:
          "Une agence immobiliere envoie des dossiers de diagnostics a des acheteurs potentiels. Sur SwissTransfer, les fichiers expirent et doivent etre re-uploades. Airlock conserve les dossiers et permet de creer de nouveaux liens de partage a la demande.",
      },
      {
        title: "Service RH transmettant des documents sensibles",
        description:
          "Un DRH envoie des contrats de travail a de nouveaux employes. SwissTransfer ne permet pas de verifier que le destinataire a bien consulte le document. Airlock fournit un suivi precis de chaque acces.",
      },
      {
        title: "Cabinet d'avocats avec besoin de revocation",
        description:
          "Un avocat partage un projet d'acte avec un client qui finalement ne signe pas. Sur SwissTransfer, le lien reste actif jusqu'a expiration. Sur Airlock, l'avocat revoque immediatement l'acces au document.",
      },
    ],
    faqs: [
      {
        question: "SwissTransfer est gratuit et suisse, pourquoi choisir Airlock ?",
        answer:
          "SwissTransfer est excellent pour les transferts ponctuels personnels. Pour un usage professionnel, Airlock apporte la tracabilite, les quotas de vues, la revocation et le stockage permanent qui manquent a SwissTransfer. La conformite RGPD d'Airlock avec stockage europeen offre un cadre juridique adapte aux entreprises de l'UE.",
      },
      {
        question: "Mes donnees sont-elles aussi bien protegees que chez Infomaniak ?",
        answer:
          "Airlock stocke les fichiers sur Cloudflare R2 en Europe avec des URLs pre-signees temporaires et un chiffrement TLS. Infomaniak beneficie de la legislation suisse sur la protection des donnees. Les deux approches offrent un haut niveau de protection, avec des cadres juridiques differents.",
      },
      {
        question: "Puis-je envoyer des fichiers de 50 Go comme sur SwissTransfer ?",
        answer:
          "Airlock utilise l'upload direct vers Cloudflare R2 via des URLs pre-signees, ce qui permet le transfert de fichiers volumineux. Les limites dependent de votre plan. Pour les fichiers tres volumineux, Airlock offre l'avantage de conserver les fichiers et de pouvoir les repartager sans re-upload.",
      },
      {
        question: "SwissTransfer a une limite de telechargements, Airlock aussi ?",
        answer:
          "Airlock propose des quotas de vues configurables par lien : vous decidez exactement combien de fois un document peut etre consulte. C'est plus flexible que la limite fixe de SwissTransfer, et vous pouvez modifier ou revoquer le lien a tout moment.",
      },
    ],
    relatedPages: [
      { href: "/pour/notaires", label: "Airlock pour les notaires" },
      { href: "/glossaire/stockage-souverain", label: "Qu'est-ce que le stockage souverain ?" },
      { href: "/cas-usage/transmettre-dossier-medical", label: "Transmettre un dossier medical" },
    ],
  },
];
