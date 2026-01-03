import { Inter } from "next/font/google";
import "../globals.css";

/**
 * Layout spécifique pour les pages de partage publiques
 * 
 * IMPORTANT: Ce layout ne contient PAS ClerkProvider pour éviter
 * les redirections d'authentification en production. Les pages de
 * partage doivent être accessibles sans authentification.
 */

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable} data-scroll-behavior="smooth">
      <body>
        {children}
      </body>
    </html>
  );
}
