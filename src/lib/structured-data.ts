import { faqSchema } from "./seo";

// FAQ limitées aux 6 questions visibles sur la page d'accueil
export const homeFaqStructuredData = faqSchema([
  {
    question: "Quelle est la différence avec Google Drive / Dropbox ?",
    answer: "Airlock est pensé pour le partage sensible : liens expirables, lecture seule, mot de passe, quota de vues, révocation immédiate, et suivi des accès — sans complexité.",
  },
  {
    question: "Est-ce que je peux partager un dossier sans créer de compte pour l'autre personne ?",
    answer: "Oui. Avec un lien public sécurisé, l'autre personne accède sans compte (selon vos règles).",
  },
  {
    question: "Comment je limite ce que le lien permet de faire ?",
    answer: "Vous choisissez : consultation seule (téléchargement désactivé), mot de passe, date d'expiration, et quota de vues.",
  },
  {
    question: "Que se passe-t-il quand un lien expire ou atteint son quota ?",
    answer: "Il devient automatiquement inactif. Vous pouvez le réactiver en prolongeant la date ou en augmentant le quota.",
  },
  {
    question: "Est-ce que je vois qui a consulté ou téléchargé ?",
    answer: "Airlock enregistre les interactions (vues / téléchargements) et les affiche dans Mes partages et le centre de notifications.",
  },
  {
    question: "Est-ce que les fichiers passent par vos serveurs pendant l'upload ?",
    answer: "Non : l'upload se fait directement depuis le navigateur vers le stockage via des URLs signées, pour la performance et la sécurité.",
  },
]);

// FAQ complètes (16 questions) pour la page /faq
export const fullFaqStructuredData = faqSchema([
  {
    question: "Quelle est la différence avec Google Drive / Dropbox ?",
    answer: "Airlock est pensé pour le partage sensible : liens expirables, lecture seule, mot de passe, quota de vues, révocation immédiate, et suivi des accès — sans complexité. Contrairement à Google Drive ou Dropbox, Airlock offre un contrôle granulaire sur vos fichiers avec un chiffrement en transit (TLS 1.3) et au repos, et un stockage sur Cloudflare R2.",
  },
  {
    question: "Est-ce que je peux partager un dossier sans créer de compte pour l'autre personne ?",
    answer: "Oui. Avec un lien public sécurisé, l'autre personne accède sans compte (selon vos règles). Vous pouvez partager vos fichiers avec n'importe qui, même sans qu'ils aient besoin de créer un compte Airlock.",
  },
  {
    question: "Comment je limite ce que le lien permet de faire ?",
    answer: "Vous choisissez : consultation seule (téléchargement désactivé), mot de passe, date d'expiration, et quota de vues. Chaque lien de partage peut être configuré individuellement avec des règles de sécurité personnalisées.",
  },
  {
    question: "Que se passe-t-il quand un lien expire ou atteint son quota ?",
    answer: "Il devient automatiquement inactif. Vous pouvez le réactiver en prolongeant la date ou en augmentant le quota. Les liens expirés peuvent être réactivés à tout moment depuis votre dashboard.",
  },
  {
    question: "Est-ce que je vois qui a consulté ou téléchargé ?",
    answer: "Airlock enregistre les interactions (vues / téléchargements) et les affiche dans Mes partages et le centre de notifications. Vous avez une traçabilité complète de tous les accès à vos fichiers partagés.",
  },
  {
    question: "Est-ce que les fichiers passent par vos serveurs pendant l'upload ?",
    answer: "L'upload se fait directement depuis le navigateur vers le stockage via des URLs signées. En revanche, la prévisualisation en ligne, le watermarking et la conversion de documents sont traités côté serveur pour appliquer les protections.",
  },
  {
    question: "Comment fonctionne le chiffrement des fichiers sur Airlock ?",
    answer: "Airlock chiffre vos fichiers en transit (TLS 1.3) et au repos sur Cloudflare R2. L'accès se fait via des URLs présignées éphémères et des tokens temporaires hashés SHA-256. Ce n'est pas du chiffrement de bout en bout au sens cryptographique : Airlock et Cloudflare peuvent techniquement accéder aux fichiers.",
  },
  {
    question: "Qu'est-ce qu'une data room et comment Airlock s'en rapproche ?",
    answer: "Une data room est un espace sécurisé pour partager des documents sensibles. Airlock reproduit cette fonctionnalité avec des liens expirables, un contrôle d'accès granulaire, et un suivi complet des interactions, le tout dans une interface simple et intuitive.",
  },
  {
    question: "Airlock est-il conforme au RGPD ?",
    answer: "Airlock respecte les principes du RGPD : minimisation des données, droit à la suppression, contrôle d'accès granulaire et traçabilité. Vos fichiers sont stockés sur Cloudflare R2 et les métadonnées sur Firebase (Google), des entreprises américaines avec des garanties contractuelles de protection des données.",
  },
  {
    question: "Combien de stockage est inclus dans le plan gratuit ?",
    answer: "Le plan gratuit d'Airlock inclut 5 Go de stockage. C'est suffisant pour commencer à partager vos fichiers de manière sécurisée. Pour plus de stockage, le plan Professionnel offre 100 Go à 9€/mois.",
  },
  {
    question: "Comment créer un lien de partage sécurisé sur Airlock ?",
    answer: "Pour créer un lien de partage, sélectionnez un dossier dans votre workspace, cliquez sur 'Partager', puis configurez les règles de sécurité (mot de passe, expiration, quota de vues). Le lien est généré instantanément et prêt à être partagé.",
  },
  {
    question: "Puis-je révoquer un lien de partage après l'avoir créé ?",
    answer: "Oui, vous pouvez révoquer un lien de partage à tout moment depuis votre dashboard. La révocation est immédiate et empêche tout accès futur au fichier, même si le lien était précédemment actif.",
  },
  {
    question: "Airlock fonctionne-t-il sur mobile ?",
    answer: "Oui, Airlock est entièrement responsive et fonctionne parfaitement sur mobile, tablette et desktop. L'interface s'adapte automatiquement à la taille de votre écran pour une expérience optimale.",
  },
  {
    question: "Quels types de fichiers puis-je partager avec Airlock ?",
    answer: "Airlock accepte tous types de fichiers : documents, images, vidéos, archives, etc. Il n'y a pas de limitation sur les types de fichiers, seulement sur la taille totale de stockage selon votre plan.",
  },
  {
    question: "Comment Airlock garantit-il la souveraineté des données ?",
    answer: "Vos fichiers sont stockés sur Cloudflare R2 (API compatible S3) et les métadonnées sur Firebase (Google). Cloudflare et Google sont des entreprises américaines soumises au Cloud Act, bien que les données puissent être hébergées dans des régions européennes.",
  },
  {
    question: "Comment fonctionne exactement la sécurité chez Airlock ?",
    answer: "Airlock utilise une architecture de sécurité multicouche : (1) Chiffrement en transit via TLS 1.3, (2) Chiffrement au repos sur Cloudflare R2, (3) URLs présignées temporaires (expiration 5 min à 1h), (4) Tokens uniques hashés SHA-256, (5) Permissions granulaires et révocation instantanée. Vos fichiers ne passent jamais par nos serveurs lors de l'upload. Airlock n'analyse ni n'exploite le contenu de vos fichiers.",
  },
  {
    question: "Airlock est-il une solution 'zero-knowledge' ou 'end-to-end encrypted' ?",
    answer: "Non, Airlock n'est pas une solution zero-knowledge au sens cryptographique strict (où seul l'utilisateur détient les clés de chiffrement). Airlock est une solution sécurisée avec chiffrement au repos et en transit, contrôle d'accès granulaire, et tokens temporaires. L'approche de Cloudflare R2 signifie que Cloudflare (comme opérateur de stockage) peut techniquement accéder aux données. Cependant, Airlock implémente plusieurs couches de sécurité et nous n'analysons ni n'exploitons vos fichiers. Pour les cas de confidentialité maximale, un chiffrement côté client (avant upload) reste la meilleure pratique.",
  },
]);
