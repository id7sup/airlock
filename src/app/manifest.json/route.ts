import { NextResponse } from "next/server";

/**
 * Route API pour le manifest.json (PWA)
 * 
 * Retourne le manifest de l'application pour l'installation PWA.
 * Inclut les métadonnées, icônes et configuration de l'application.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
