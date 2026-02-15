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
  "/data-room-virtuelle",          // Page SEO
  "/partage-dossier-securise",     // Page SEO
  "/partage-documents-confidentiels", // Page SEO
  "/alternative-google-drive-pro", // Page SEO
  "/pour-avocats",                 // Page SEO
  "/pour/(.*)",                    // Pages pSEO par métier
  "/alternative/(.*)",             // Pages pSEO alternatives
  "/cas-usage",                    // Hub cas d'usage
  "/cas-usage/(.*)",               // Pages pSEO cas d'usage
  "/glossaire/(.*)",               // Pages pSEO glossaire
  "/mentions",           // Page mentions légales
  "/confidentialite",    // Page confidentialité
  "/documentation",      // Page documentation technique
  "/login",              // Page de connexion personnalisée
  "/login/sso-callback", // Callback SSO Google pour login
  "/register",           // Page d'inscription personnalisée
  "/register/sso-callback", // Callback SSO Google pour register
  "/api/public(.*)",     // API publiques (partage)
  "/share(.*)",          // Pages de partage publiques
  "/manifest.json",      // Manifest PWA
  "/sitemap.xml",        // Sitemap XML (SEO)
  "/robots.txt",         // Robots.txt (SEO)
  "/favicon.ico",        // Favicon ICO
  "/favicon-32x32.png",  // Favicon 32x32
  "/favicon-192x192.png", // Favicon 192x192
  "/apple-touch-icon.png", // Apple Touch Icon
  "/admin(.*)",            // Admin dashboard (auth custom, pas Clerk)
  "/api/admin(.*)",        // API admin (auth custom)
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
