import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Proxy d'authentification Clerk (anciennement middleware.ts)
 * 
 * Next.js 16+ utilise maintenant "proxy.ts" au lieu de "middleware.ts".
 * Ce fichier protège toutes les routes sauf celles définies comme publiques.
 * Les routes publiques sont accessibles sans authentification.
 */

// Routes publiques (pas d'authentification requise)
const isPublicRoute = createRouteMatcher([
  "/",                    // Page d'accueil
  "/pricing",            // Page tarifs
  "/security",           // Page sécurité
  "/sign-in(.*)",        // Connexion
  "/sign-up(.*)",        // Inscription
  "/api/public(.*)",     // API publiques (partage)
  "/share(.*)",          // Pages de partage publiques
  "/manifest.json",      // Manifest PWA
]);

/**
 * Proxy principal (exécuté avant chaque requête)
 * 
 * Vérifie si la route est publique. Si non, exige une authentification.
 */
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Exclure les fichiers statiques et Next.js internals
    // Exclure explicitement manifest.json
    '/((?!_next|manifest\\.json|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
    // Toujours exécuter pour les routes API (sauf manifest.json)
    '/(api|trpc)((?!.*manifest\\.json).*)',
  ],
};
