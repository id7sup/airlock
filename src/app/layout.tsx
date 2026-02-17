import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import Script from "next/script";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo";

const openRunde = localFont({
  src: [
    { path: "../../public/fonts/OpenRunde-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/OpenRunde-Medium.woff2", weight: "500" },
    { path: "../../public/fonts/OpenRunde-Semibold.woff2", weight: "600" },
    { path: "../../public/fonts/OpenRunde-Bold.woff2", weight: "700" },
  ],
  variable: "--font-openrunde",
  display: "swap",
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
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    return (
      <ClerkProvider localization={frFR}>
        <html lang="fr" className={openRunde.variable} data-scroll-behavior="smooth">
          <head>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-PSVD18V822"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-PSVD18V822');
              `}
            </Script>
          </head>
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
