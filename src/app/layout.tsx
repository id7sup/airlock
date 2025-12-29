import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Airlock | Dossiers Sécurisés",
  description: "Partagez vos fichiers en toute sécurité avec une expérience premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr" className={inter.variable}>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

