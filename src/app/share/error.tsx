"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

/**
 * Boundary d'erreur pour les pages de partage (/share/*).
 * En production Next.js n'expose pas le message d'erreur technique.
 * On affiche donc un message clair et explicite pour l'utilisateur.
 */
export default function ShareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SHARE_ERROR]", error?.digest, error?.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <header className="h-16 lg:h-20 border-b border-black/[0.05] bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="text-xl font-semibold tracking-tight text-black">Airlock</span>
        </Link>
        <Link
          href="/register"
          className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 transition-all shadow-md shadow-black/10"
        >
          Créer un compte
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="p-8 md:p-12 text-center text-black max-w-lg">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-3 tracking-tight">
            Ce partage n&apos;est pas accessible
          </h1>
          <p className="text-black/60 font-medium mb-2">
            Nous n&apos;avons pas pu afficher ce dossier. Voici les causes possibles :
          </p>
          <ul className="text-left text-black/50 font-medium text-sm mb-6 space-y-2 list-disc list-inside">
            <li>Le lien a <strong>expiré</strong></li>
            <li>Le <strong>nombre de vues autorisées</strong> a été atteint</li>
            <li>Le lien a été <strong>révoqué</strong> par la personne qui l&apos;a partagé</li>
            <li>Le <strong>dossier a été supprimé</strong> ou déplacé</li>
            <li>L&apos;accès aux sous-dossiers n&apos;est pas autorisé pour ce lien</li>
            <li>Un problème technique temporaire (réessayez dans quelques instants)</li>
          </ul>
          <p className="text-black/50 text-sm mb-8">
            Vérifiez le lien avec la personne qui vous l&apos;a envoyé ou réessayez plus tard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-2xl font-semibold bg-black text-white hover:bg-black/90 transition-all shadow-lg shadow-black/10 inline-flex items-center justify-center gap-2 text-sm"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl font-semibold bg-white border border-black/10 text-black hover:bg-black/5 transition-all inline-flex items-center justify-center gap-2 text-sm"
            >
              Retour à l&apos;accueil <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-black/[0.05] bg-white/50 py-3 text-center text-xs text-black/30">
        © {new Date().getFullYear()} Airlock
      </footer>
    </div>
  );
}
