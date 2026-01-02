import { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { StructuredData } from "@/components/shared/StructuredData";
import { homeFaqStructuredData } from "@/lib/structured-data";
import { breadcrumbSchema } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export const metadata: Metadata = {
  title: "Questions Fréquentes (FAQ) | Airlock - Partage de Fichiers Sécurisé",
  description: "Trouvez les réponses à toutes vos questions sur Airlock : partage de fichiers sécurisé, liens expirables, chiffrement, RGPD, tarifs, et bien plus. FAQ complète pour comprendre comment utiliser Airlock.",
  openGraph: {
    title: "Questions Fréquentes (FAQ) | Airlock",
    description: "Trouvez les réponses à toutes vos questions sur Airlock : partage de fichiers sécurisé, liens expirables, chiffrement, RGPD, tarifs.",
    url: `${siteUrl}/faq`,
  },
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
};

const breadcrumbData = breadcrumbSchema([
  { name: "Accueil", url: siteUrl },
  { name: "FAQ", url: `${siteUrl}/faq` },
]);

const faqs = [
  {
    question: "Quelle est la différence avec Google Drive / Dropbox ?",
    answer: "Airlock est pensé pour le partage sensible : liens expirables, lecture seule, mot de passe, quota de vues, révocation immédiate, et suivi des accès — sans complexité. Contrairement à Google Drive ou Dropbox, Airlock offre un contrôle total sur vos fichiers avec une architecture zero-knowledge et un stockage souverain.",
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
    answer: "Non : l'upload se fait directement depuis le navigateur vers le stockage via des URLs signées, pour la performance et la sécurité. Vos fichiers ne transitent jamais par nos serveurs, garantissant une sécurité maximale.",
  },
  {
    question: "Comment fonctionne le chiffrement des fichiers sur Airlock ?",
    answer: "Airlock utilise un chiffrement de bout en bout avec des URLs présignées éphémères. Vos fichiers sont stockés de manière sécurisée dans votre propre bucket Cloudflare R2 ou AWS S3, avec un accès contrôlé via des tokens temporaires.",
  },
  {
    question: "Qu'est-ce qu'une data room et comment Airlock s'en rapproche ?",
    answer: "Une data room est un espace sécurisé pour partager des documents sensibles. Airlock reproduit cette fonctionnalité avec des liens expirables, un contrôle d'accès granulaire, et un suivi complet des interactions, le tout dans une interface simple et intuitive.",
  },
  {
    question: "Airlock est-il conforme au RGPD ?",
    answer: "Oui, Airlock est entièrement conforme au RGPD. Vos données restent dans vos propres buckets de stockage, vous gardez le contrôle total, et nous respectons tous les principes de protection des données personnelles européens.",
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
    answer: "Airlock garantit la souveraineté des données en vous permettant de stocker vos fichiers dans vos propres buckets Cloudflare R2 ou AWS S3. Vous choisissez la localisation géographique et gardez le contrôle total sur vos données.",
  },
];

export default function FAQPage() {
  return (
    <>
      <StructuredData />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeFaqStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      <div className="min-h-screen bg-white">
        <header className="px-6 py-8 border-b border-black/[0.03]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo className="w-10 h-10" />
              <span className="text-2xl font-semibold tracking-tighter">Airlock</span>
            </Link>
            <Link href="/" className="flex items-center gap-2 text-black/40 hover:text-black transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Link>
          </div>
        </header>

        <main className="px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <HelpCircle className="w-8 h-8 text-[#96A982]" />
                <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-black">Questions Fréquentes</h1>
              </div>
              <p className="text-lg text-black/40 font-medium">Trouvez rapidement les réponses à vos questions sur Airlock</p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white border border-black/[0.04] rounded-[32px] p-8 hover:border-black/[0.08] transition-all duration-300"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h2 className="text-xl md:text-2xl font-medium text-black tracking-tight pr-8 group-open:text-[#96A982] transition-colors">
                      {faq.question}
                    </h2>
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#f5f5f7] rounded-full group-open:bg-[#96A982] group-open:text-white transition-all">
                      <svg
                        className="w-4 h-4 transform group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <div className="mt-6 pt-6 border-t border-black/[0.03]">
                    <p className="text-lg text-black/60 leading-relaxed font-medium">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-16 p-8 bg-[#f5f5f7] rounded-[32px] border border-black/[0.03] text-center">
              <h3 className="text-2xl font-medium text-black mb-4">Vous avez d'autres questions ?</h3>
              <p className="text-black/40 font-medium mb-6">Notre équipe est là pour vous aider</p>
              <Link
                href="mailto:contact@airlck.com"
                className="inline-block bg-[#96A982] text-white px-8 py-4 rounded-[22px] font-medium hover:opacity-90 transition-all"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

