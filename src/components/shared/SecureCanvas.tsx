"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";

interface SecureCanvasProps {
  fileId: string;
  fileName: string;
  token: string;
  watermarkRequired?: boolean;
}

export default function SecureCanvas({
  fileId,
  fileName,
  token,
  watermarkRequired = false,
}: SecureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId || !token) return;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Construct the image URL using the watermarked API if needed
        const imageUrl = watermarkRequired
          ? `/api/public/view/watermarked?fileId=${fileId}&token=${token}`
          : `/api/public/view?fileId=${fileId}&token=${token}`;

        console.log("Loading image from:", imageUrl);

        const response = await fetch(imageUrl);
        if (!response.ok) {
          console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          throw new Error(
            `Impossible de charger l'image (erreur ${response.status})`
          );
        }

        const blob = await response.blob();
        console.log("Image blob loaded:", blob.type, blob.size);

        const blobUrl = URL.createObjectURL(blob);

        const img = new Image();

        img.onload = () => {
          console.log("Image loaded successfully:", img.width, "x", img.height);
          const canvas = canvasRef.current;
          if (!canvas) {
            console.error("Canvas ref not available");
            return;
          }

          // Set canvas size to match image
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.error("Canvas context not available");
            return;
          }

          // Draw the watermarked image
          ctx.drawImage(img, 0, 0);

          // Add client-side watermark overlay if not server-watermarked
          if (!watermarkRequired) {
            ctx.save();
            ctx.font = "bold 48px Arial";
            ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
            ctx.rotate((-45 * Math.PI) / 180);

            // Repeat watermark across canvas
            for (
              let y = -canvas.height;
              y < canvas.height * 2;
              y += 200
            ) {
              for (let x = -canvas.width; x < canvas.width * 2; x += 400) {
                ctx.fillText("AIRLOCK", x, y);
              }
            }
            ctx.restore();
          }

          setIsLoading(false);
          console.log("Canvas rendered successfully");

          // Cleanup blob URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        };

        img.onerror = (error) => {
          console.error("Image loading failed:", error);
          setError("Impossible de charger l'image");
          setIsLoading(false);
          URL.revokeObjectURL(blobUrl);
        };

        img.onabort = () => {
          console.warn("Image loading was aborted");
          setError("Chargement de l'image annulé");
          setIsLoading(false);
          URL.revokeObjectURL(blobUrl);
        };

        // Load image from blob URL
        img.src = blobUrl;
      } catch (err) {
        console.error("Error in loadImage:", err);
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        setIsLoading(false);
      }
    };

    loadImage();
  }, [fileId, fileName, token, watermarkRequired]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <p className="text-white font-semibold mb-2">Erreur de chargement</p>
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white"></div>
        <p className="text-white/60">Chargement de l'image...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{
          pointerEvents: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        } as React.CSSProperties}
      />
    </div>
  );
}
