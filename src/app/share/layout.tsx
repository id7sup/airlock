import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

// Layout spécifique pour les pages de partage - SANS ClerkProvider
// Cela évite les redirections d'authentification en production
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

