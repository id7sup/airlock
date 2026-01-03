"use client";

import { useEffect } from "react";
import { Info } from "lucide-react";

/**
 * Composant d'erreur spécifique pour les pages de partage
 * 
 * Affiche les erreurs avec détails pour faciliter le debugging.
 * Utilisé par Next.js Error Boundary pour les pages /share/*
 * 
 * @param error - L'erreur capturée
 * @param reset - Fonction pour réessayer
 */
export default function ShareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logger l'erreur pour le debugging
    console.error("[SHARE_ERROR]", error?.message, error?.digest);
  }, [error]);

  const errorMessage = error?.message || "Erreur inconnue";
  const errorDigest = error?.digest || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
      <div className="apple-card p-12 text-center max-w-md shadow-2xl">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Info className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2 tracking-tight">Erreur</h1>
        <p className="text-apple-secondary font-medium mb-4">
          Une erreur est survenue lors du chargement du partage.
        </p>
        
        {/* Afficher les détails de l'erreur pour le debugging */}
        <div className="mt-4 p-4 bg-red-50 rounded-xl text-left mb-4">
          <p className="text-xs font-mono text-red-700 break-all">
            <strong>Message:</strong> {errorMessage}<br/>
            {errorDigest && (
              <>
                <strong>Code:</strong> {errorDigest}<br/>
              </>
            )}
            {process.env.NODE_ENV === "development" && error?.stack && (
              <>
                <strong>Stack:</strong><br/>
                <pre className="text-[10px] mt-1 whitespace-pre-wrap">{error.stack}</pre>
              </>
            )}
          </p>
        </div>
        
        <button
          onClick={reset}
          className="apple-button px-6 py-3 shadow-lg shadow-apple-primary/20"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
