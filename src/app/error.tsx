"use client";

import { useEffect } from "react";
import { Info } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
      <div className="apple-card p-12 text-center max-w-md shadow-2xl">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Info className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2 tracking-tight">Erreur</h1>
        <p className="text-apple-secondary font-medium mb-6">
          Une erreur inattendue est survenue. Veuillez réessayer.
        </p>
        {error.digest && (
          <p className="text-xs text-apple-secondary/50 mb-4">
            Code d'erreur: {error.digest}
          </p>
        )}
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

