"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur critique pour le debugging
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#f5f5f7",
          color: "#1d1d1f",
          padding: "2rem"
        }}>
          <div style={{
            maxWidth: "500px",
            textAlign: "center",
            backgroundColor: "white",
            padding: "3rem",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)"
          }}>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: "600",
              marginBottom: "1rem"
            }}>
              Erreur
            </h1>
            <p style={{
              color: "#86868b",
              marginBottom: "2rem",
              lineHeight: "1.5"
            }}>
              Une erreur critique est survenue. Veuillez rafraîchir la page.
            </p>
            {error.digest && (
              <p style={{
                fontSize: "0.75rem",
                color: "#86868b",
                marginBottom: "1rem"
              }}>
                Code: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                backgroundColor: "#96A982",
                color: "white",
                border: "none",
                padding: "0.75rem 2rem",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

