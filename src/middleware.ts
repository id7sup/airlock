import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/security",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/public(.*)",
  "/share(.*)", // Pour les liens de partage publics
  "/manifest.json", // Exclure manifest.json du middleware Clerk
]);

export default clerkMiddleware(async (auth, request) => {
  // Ne pas protéger les routes publiques
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    // Exclure explicitement manifest.json
    '/((?!_next|manifest\\.json|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
    // Always run for API routes (mais pas manifest.json)
    '/(api|trpc)((?!.*manifest\\.json).*)',
  ],
};

