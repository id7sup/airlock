"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, RefreshCw, ImageIcon } from "lucide-react";
import { applyCanvasWatermark } from "./WatermarkOverlay";

interface SecureCanvasProps {
  fileId: string;
  fileName: string;
  token: string;
  watermarkRequired?: boolean;
  password?: string;
}

export default function SecureCanvas({
  fileId,
  fileName,
  token,
  watermarkRequired = false,
  password,
}: SecureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    if (!fileId || !token) {
      setError("Paramètres manquants");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let blobUrl: string | null = null;

    const loadImage = async () => {
      try {
        if (isMounted) {
          setIsLoading(true);
          setError(null);
          setDebugInfo("Fetching image...");
        }

        // Build URL
        const params = new URLSearchParams({
          fileId,
          token,
          ...(password && { pwd: password }),
        });
        const imageUrl = `/api/public/view?${params.toString()}`;

        console.log("[SecureCanvas] Fetching:", imageUrl);

        const response = await fetch(imageUrl);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          console.error("[SecureCanvas] Fetch failed:", response.status, errorText);
          throw new Error(`Erreur serveur (${response.status})`);
        }

        const contentType = response.headers.get("content-type") || "";
        console.log("[SecureCanvas] Content-Type:", contentType);

        const blob = await response.blob();
        console.log("[SecureCanvas] Blob:", blob.type, blob.size, "bytes");

        if (!isMounted) return;

        if (blob.size === 0) {
          throw new Error("Fichier vide reçu");
        }

        setDebugInfo(`Blob received: ${blob.size} bytes`);

        // Create blob URL
        blobUrl = URL.createObjectURL(blob);

        // Load image
        const img = new Image();

        // Don't set crossOrigin for blob URLs - it causes issues
        // img.crossOrigin = "anonymous";

        const loadPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Timeout: l'image met trop de temps à charger"));
          }, 30000);

          img.onload = () => {
            clearTimeout(timeout);
            console.log("[SecureCanvas] Image decoded:", img.width, "x", img.height);

            if (!isMounted) {
              resolve();
              return;
            }

            const canvas = canvasRef.current;
            if (!canvas) {
              reject(new Error("Canvas non disponible"));
              return;
            }

            try {
              // Set canvas dimensions
              canvas.width = img.width;
              canvas.height = img.height;

              const ctx = canvas.getContext("2d");
              if (!ctx) {
                reject(new Error("Contexte 2D non disponible"));
                return;
              }

              // Draw image
              ctx.drawImage(img, 0, 0);

              // Apply watermark if needed
              if (watermarkRequired) {
                applyCanvasWatermark(ctx, canvas.width, canvas.height);
              }

              console.log("[SecureCanvas] Render complete");
              setIsLoading(false);
              resolve();
            } catch (drawError) {
              reject(new Error("Erreur lors du rendu"));
            }
          };

          img.onerror = () => {
            clearTimeout(timeout);
            console.error("[SecureCanvas] Image decode failed");
            reject(new Error("Impossible de décoder l'image"));
          };
        });

        img.src = blobUrl;
        await loadPromise;

      } catch (err) {
        console.error("[SecureCanvas] Error:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erreur inconnue");
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [fileId, token, watermarkRequired, password, retryCount]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-white font-medium mb-1">Erreur de chargement</p>
          <p className="text-white/50 text-sm mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center w-full h-full relative"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onDragStart={(e) => {
        e.preventDefault();
        return false;
      }}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTouchCallout: "none",
      } as React.CSSProperties}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50 z-10">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white/60 animate-pulse" />
          </div>
          <p className="text-white/60 text-sm">Chargement de l'image...</p>
        </div>
      )}

      {/* Canvas always rendered but may be empty during loading */}
      <canvas
        ref={canvasRef}
        className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        style={{
          pointerEvents: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          WebkitTouchCallout: "none",
        } as React.CSSProperties}
      />
    </div>
  );
}

