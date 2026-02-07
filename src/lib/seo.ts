import { Metadata } from "next";

// Utiliser une fonction pour éviter les erreurs si la variable d'environnement n'est pas définie
function getSiteUrl(): string {
  try {
    return process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";
  } catch {
    return "https://airlck.com";
  }
}

const siteUrl = getSiteUrl();
const siteName = "Airlock";
const siteDescription = "Partagez vos fichiers en toute sécurité avec une expérience premium. Liens expirables, lecture seule, mot de passe, quota de vues. Une data room simple, sécurisée et souveraine.";
const defaultImage = `${siteUrl}/assets/logo.png`;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Dossiers Sécurisés - Partage de Fichiers Premium`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "partage de fichiers",
    "fichiers sécurisés",
    "data room",
    "partage sécurisé",
    "liens expirables",
    "chiffrement fichiers",
    "stockage cloud sécurisé",
    "partage documents",
    "RGPD",
    "souveraineté données",
    "cloudflare R2",
    "chiffrement sécurisé",
    "partage privé",
    "contrôle accès fichiers",
  ],
  authors: [{ name: "Airlock Technologies" }],
  creator: "Airlock Technologies",
  publisher: "Airlock Technologies",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} | Dossiers Sécurisés - Partage de Fichiers Premium`,
    description: siteDescription,
    images: [
      {
        url: defaultImage,
        width: 1200,
        height: 630,
        alt: `${siteName} - Partage de fichiers sécurisé`,
      },
      {
        url: `${siteUrl}/assets/logo.png`,
        width: 512,
        height: 512,
        alt: `${siteName} Logo`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Dossiers Sécurisés`,
    description: siteDescription,
    images: [defaultImage],
    creator: "@airlck",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Ajoutez vos codes de vérification ici
    // google: "votre-code-google",
    // yandex: "votre-code-yandex",
    // bing: "votre-code-bing",
  },
  category: "technology",
};

export const homeMetadata: Metadata = {
  title: `${siteName} | Partage de Fichiers Sécurisé - Data Room Souveraine`,
  description: "Partagez des dossiers en toute sécurité. Gardez le contrôle. Liens expirables, lecture seule, mot de passe, quota de vues. Une data room simple, sécurisée et souveraine pour vos fichiers sensibles.",
  openGraph: {
    title: `${siteName} | Partage de Fichiers Sécurisé - Data Room Souveraine`,
    description: "Partagez des dossiers en toute sécurité. Gardez le contrôle. Liens expirables, lecture seule, mot de passe, quota de vues. Une data room simple, sécurisée et souveraine.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/assets/dashboard.png`,
        width: 1200,
        height: 630,
        alt: "Airlock Dashboard - Interface de partage de fichiers sécurisé",
      },
    ],
  },
  twitter: {
    title: `${siteName} | Partage de Fichiers Sécurisé`,
    description: "Partagez des dossiers en toute sécurité. Gardez le contrôle. Liens expirables, lecture seule, mot de passe, quota de vues.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const pricingMetadata: Metadata = {
  title: "Tarifs et Facturation | Plans Individuel et Professionnel",
  description: "Découvrez nos tarifs transparents. Plan Individuel gratuit avec 5 Go de stockage, ou Plan Professionnel à 9€/mois avec 100 Go. Partage sécurisé de fichiers pour tous vos besoins.",
  openGraph: {
    title: "Tarifs et Facturation | Plans Individuel et Professionnel",
    description: "Découvrez nos tarifs transparents. Plan Individuel gratuit avec 5 Go de stockage, ou Plan Professionnel à 9€/mois avec 100 Go.",
    url: `${siteUrl}/pricing`,
  },
  twitter: {
    title: "Tarifs Airlock | Plans Individuel et Professionnel",
    description: "Découvrez nos tarifs transparents. Plan gratuit ou Professionnel à 9€/mois.",
  },
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
};

export const securityMetadata: Metadata = {
  title: "Sécurité et Chiffrement | Protection en Couches",
  description: "Découvrez notre architecture de sécurité. Chiffrement au repos et en transit, URLs présignées éphémères, tokens hashés, stockage souverain, conformité RGPD. Vos fichiers sont protégés à chaque niveau avec Airlock.",
  openGraph: {
    title: "Sécurité et Chiffrement | Protection en Couches",
    description: "Découvrez notre architecture de sécurité. Chiffrement, URLs présignées éphémères, stockage souverain, conformité RGPD.",
    url: `${siteUrl}/security`,
  },
  twitter: {
    title: "Sécurité Airlock | Protection Multicouche",
    description: "Chiffrement au repos et en transit, URLs présignées éphémères, stockage souverain, conformité RGPD.",
  },
  alternates: {
    canonical: `${siteUrl}/security`,
  },
};

export const privacyMetadata: Metadata = {
  title: "Politique de Confidentialité | Protection des Données RGPD",
  description: "Politique de confidentialité d'Airlock. Découvrez comment nous protégeons vos données personnelles conformément au RGPD. Transparence totale sur le traitement de vos informations.",
  openGraph: {
    title: "Politique de Confidentialité | Protection des Données RGPD",
    description: "Politique de confidentialité d'Airlock. Découvrez comment nous protégeons vos données personnelles conformément au RGPD.",
    url: `${siteUrl}/confidentialite`,
  },
  alternates: {
    canonical: `${siteUrl}/confidentialite`,
  },
};

export const legalMetadata: Metadata = {
  title: "Mentions Légales | Conditions d'Utilisation",
  description: "Mentions légales d'Airlock. Informations sur l'éditeur, conditions d'utilisation, propriété intellectuelle et responsabilité. Tout ce que vous devez savoir sur nos conditions légales.",
  openGraph: {
    title: "Mentions Légales | Conditions d'Utilisation",
    description: "Mentions légales d'Airlock. Informations sur l'éditeur, conditions d'utilisation et responsabilité.",
    url: `${siteUrl}/mentions`,
  },
  alternates: {
    canonical: `${siteUrl}/mentions`,
  },
};

// Pages SEO "money keywords"
export const dataRoomMetadata: Metadata = {
  title: "Data Room Virtuelle | Partage Sécurisé de Documents",
  description: "Créez votre data room virtuelle avec Airlock. Partagez des documents confidentiels avec contrôle d'accès, traçabilité complète et liens expirables. Alternative simple aux data rooms traditionnelles.",
  openGraph: {
    title: "Data Room Virtuelle | Airlock",
    description: "Créez votre data room virtuelle avec Airlock. Contrôle d'accès, traçabilité et liens expirables.",
    url: `${siteUrl}/data-room-virtuelle`,
  },
  twitter: {
    title: "Data Room Virtuelle | Airlock",
    description: "Créez votre data room virtuelle avec contrôle d'accès et traçabilité complète.",
  },
  alternates: {
    canonical: `${siteUrl}/data-room-virtuelle`,
  },
};

export const partageDossierMetadata: Metadata = {
  title: "Partage de Dossier Sécurisé | Liens Protégés et Traçables",
  description: "Partagez vos dossiers en toute sécurité avec Airlock. Liens expirables, mot de passe, quota de vues, révocation instantanée. Gardez le contrôle total sur vos fichiers partagés.",
  openGraph: {
    title: "Partage de Dossier Sécurisé | Airlock",
    description: "Partagez vos dossiers en toute sécurité. Liens expirables, mot de passe et traçabilité.",
    url: `${siteUrl}/partage-dossier-securise`,
  },
  twitter: {
    title: "Partage de Dossier Sécurisé | Airlock",
    description: "Partagez vos dossiers avec liens protégés, mot de passe et traçabilité complète.",
  },
  alternates: {
    canonical: `${siteUrl}/partage-dossier-securise`,
  },
};

export const partageConfidentielsMetadata: Metadata = {
  title: "Partage de Documents Confidentiels | Chiffrement et Contrôle",
  description: "Envoyez et partagez des documents confidentiels en toute sécurité. Chiffrement en transit et au repos, accès restreint, suivi des consultations. Conforme RGPD.",
  openGraph: {
    title: "Partage de Documents Confidentiels | Airlock",
    description: "Partagez des documents confidentiels avec chiffrement, accès restreint et suivi des consultations.",
    url: `${siteUrl}/partage-documents-confidentiels`,
  },
  twitter: {
    title: "Partage de Documents Confidentiels | Airlock",
    description: "Envoyez des documents confidentiels avec chiffrement et contrôle d'accès.",
  },
  alternates: {
    canonical: `${siteUrl}/partage-documents-confidentiels`,
  },
};

export const alternativeGoogleDriveMetadata: Metadata = {
  title: "Alternative à Google Drive pour Professionnels",
  description: "Découvrez Airlock, l'alternative à Google Drive pensée pour les professionnels. Contrôle d'accès granulaire, liens expirables, traçabilité et stockage souverain. Gratuit jusqu'à 5 Go.",
  openGraph: {
    title: "Alternative à Google Drive Pro | Airlock",
    description: "L'alternative à Google Drive pensée pour les professionnels. Contrôle d'accès et stockage souverain.",
    url: `${siteUrl}/alternative-google-drive-pro`,
  },
  twitter: {
    title: "Alternative à Google Drive Pro | Airlock",
    description: "L'alternative pro à Google Drive avec contrôle d'accès et stockage souverain.",
  },
  alternates: {
    canonical: `${siteUrl}/alternative-google-drive-pro`,
  },
};

export const pourAvocatsMetadata: Metadata = {
  title: "Partage de Fichiers pour Avocats | Data Room Juridique",
  description: "Airlock pour les avocats et cabinets juridiques. Partagez des pièces, dossiers clients et documents confidentiels avec traçabilité, mot de passe et conformité RGPD.",
  openGraph: {
    title: "Airlock pour Avocats | Data Room Juridique",
    description: "Partagez des dossiers clients et documents confidentiels avec traçabilité et conformité RGPD.",
    url: `${siteUrl}/pour-avocats`,
  },
  twitter: {
    title: "Airlock pour Avocats | Data Room Juridique",
    description: "La solution de partage sécurisé pour avocats et cabinets juridiques.",
  },
  alternates: {
    canonical: `${siteUrl}/pour-avocats`,
  },
};

// Données structurées JSON-LD
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/assets/logo.png`,
    width: 512,
    height: 512,
  },
  image: `${siteUrl}/assets/logo.png`,
  description: siteDescription,
  sameAs: [
    "https://twitter.com/airlck",
    "https://linkedin.com/company/airlck",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Support client",
    email: "contact@airlck.com",
    availableLanguage: ["French", "English"],
  },
  foundingDate: "2024",
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    value: "1-10",
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description: siteDescription,
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteName,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  description: siteDescription,
  url: siteUrl,
  screenshot: `${siteUrl}/assets/dashboard.png`,
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

