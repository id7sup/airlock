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
      { url: "/assets/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logo.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/assets/logo.png",
    apple: [
      { url: "/assets/logo.png", sizes: "180x180", type: "image/png" },
      { url: "/assets/logo.png", sizes: "152x152", type: "image/png" },
      { url: "/assets/logo.png", sizes: "120x120", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
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
  return (
    <ClerkProvider>
      <html lang="fr" className={inter.variable} data-scroll-behavior="smooth">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
