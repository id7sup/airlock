import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";
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
    "AWS S3",
    "zero-knowledge",
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
  title: "Sécurité et Chiffrement | Architecture Zero-Knowledge",
  description: "Découvrez notre architecture de sécurité. Chiffrement, URLs présignées éphémères, stockage souverain, conformité RGPD. Vos fichiers sont protégés à chaque niveau avec Airlock.",
  openGraph: {
    title: "Sécurité et Chiffrement | Architecture Zero-Knowledge",
    description: "Découvrez notre architecture de sécurité. Chiffrement, URLs présignées éphémères, stockage souverain, conformité RGPD.",
    url: `${siteUrl}/security`,
  },
  twitter: {
    title: "Sécurité Airlock | Architecture Zero-Knowledge",
    description: "Chiffrement, URLs présignées éphémères, stockage souverain, conformité RGPD.",
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

// Données structurées JSON-LD
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/assets/logo.png`,
  description: siteDescription,
  sameAs: [
    "https://twitter.com/airlck",
    "https://linkedin.com/company/airlck",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Support client",
    email: "contact@airlck.com",
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
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
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "1",
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

