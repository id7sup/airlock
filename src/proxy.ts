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
  "/faq",                // Page FAQ
  "/mentions",           // Page mentions légales
  "/confidentialite",    // Page confidentialité
  "/sign-in(.*)",        // Connexion
  "/sign-up(.*)",        // Inscription
  "/login",              // Page de connexion personnalisée
  "/register",           // Page d'inscription personnalisée
  "/api/public(.*)",     // API publiques (partage)
  "/share(.*)",          // Pages de partage publiques
  "/manifest.json",      // Manifest PWA
  "/sitemap.xml",        // Sitemap XML (SEO)
  "/robots.txt",         // Robots.txt (SEO)
  "/favicon.ico",        // Favicon ICO
  "/favicon-32x32.png",  // Favicon 32x32
  "/favicon-192x192.png", // Favicon 192x192
  "/apple-touch-icon.png", // Apple Touch Icon
]);

/**
 * Proxy principal (exécuté avant chaque requête)
 * 
 * Vérifie si la route est publique. Si non, exige une authentification.
 * Les routes SEO (sitemap.xml, robots.txt) sont toujours publiques.
 */
export default clerkMiddleware(
  async (auth, request) => {
    const pathname = request.nextUrl.pathname;
    
    // Toujours permettre l'accès aux routes SEO publiques (priorité absolue)
    if (pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname === '/manifest.json') {
      return;
    }
    
    // Vérifier si la route est publique
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  {
    // Redirige les utilisateurs non authentifiés vers la page de connexion personnalisée
    signInUrl: "/login",
  }
);

export const config = {
  matcher: [
    // Exclure les fichiers statiques, Next.js internals, et les routes SEO publiques
    // Exclure explicitement: _next, fichiers statiques, sitemap.xml, robots.txt, manifest.json
    '/((?!_next|sitemap\\.xml|robots\\.txt|manifest\\.json|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
    // Toujours exécuter pour les routes API (sauf les routes SEO publiques)
    '/(api|trpc)((?!.*sitemap\\.xml|.*robots\\.txt|.*manifest\\.json).*)',
  ],
};
