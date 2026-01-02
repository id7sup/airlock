import { NextResponse } from "next/server";

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  console.log("[MANIFEST] Serving manifest.json");
  const manifest = {
    name: "Airlock - Partage de Fichiers Sécurisé",
    short_name: "Airlock",
    description: "Partagez vos fichiers en toute sécurité avec une expérience premium. Liens expirables, lecture seule, mot de passe, quota de vues.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#96A982",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/assets/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/assets/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    categories: ["business", "productivity", "security"],
    lang: "fr-FR"
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

