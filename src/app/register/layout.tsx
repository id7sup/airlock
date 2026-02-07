import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export const metadata: Metadata = {
  title: "Inscription | Créez votre espace sécurisé gratuit",
  description: "Créez votre compte Airlock gratuitement. 5 Go de stockage, liens sécurisés, contrôle d'accès granulaire et suivi des consultations.",
  openGraph: {
    title: "Inscription | Airlock",
    description: "Créez votre compte Airlock gratuitement. 5 Go de stockage et partage sécurisé.",
    url: `${siteUrl}/register`,
  },
  alternates: {
    canonical: `${siteUrl}/register`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
