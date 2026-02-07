import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export const metadata: Metadata = {
  title: "Connexion | Accédez à votre espace sécurisé",
  description: "Connectez-vous à Airlock pour gérer vos fichiers, partager des dossiers sécurisés et suivre vos accès en temps réel.",
  openGraph: {
    title: "Connexion | Airlock",
    description: "Connectez-vous à Airlock pour gérer vos fichiers et partager des dossiers sécurisés.",
    url: `${siteUrl}/login`,
  },
  alternates: {
    canonical: `${siteUrl}/login`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
