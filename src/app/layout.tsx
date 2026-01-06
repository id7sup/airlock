import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  // Ne pas utiliser le manifest du layout pour éviter les conflits
  other: {
    "geo.region": "FR",
    "geo.placename": "France",
    "language": "French",
    "revisit-after": "7 days",
    "distribution": "global",
    "rating": "general",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#96A982",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    return (
      <ClerkProvider>
        <html lang="fr" className={inter.variable} data-scroll-behavior="smooth">
          <body>
            {children}
          </body>
        </html>
      </ClerkProvider>
    );
  } catch (error) {
    console.error("Critical error in RootLayout:", error);
    // Fallback minimal en cas d'erreur
    return (
      <html lang="fr">
        <body>
          <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
            <h1>Erreur de chargement</h1>
            <p>Une erreur est survenue. Veuillez réessayer plus tard.</p>
          </div>
        </body>
      </html>
    );
  }
}
