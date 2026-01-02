import { faqSchema } from "./seo";

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

