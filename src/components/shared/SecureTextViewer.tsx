"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface SecureTextViewerProps {
  fileId: string;
  fileName: string;
  token: string;
}

export default function SecureTextViewer({
  fileId,
  fileName,
  token,
}: SecureTextViewerProps) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadText = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/public/view?fileId=${fileId}&token=${token}`
        );

        if (!response.ok) {
          throw new Error("Impossible de charger le fichier");
        }

        const text = await response.text();
        setContent(text);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        setIsLoading(false);
      }
    };

    loadText();
  }, [fileId, token]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-white">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-white/60">Chargement du fichier...</p>;
  }

  return (
    <div
      className="w-full max-w-4xl mx-auto"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      } as React.CSSProperties}
    >
      <pre className="bg-white/5 rounded-lg p-6 overflow-auto max-h-[80vh] text-white/80 text-sm font-mono">
        {content}
      </pre>

      {/* Watermark overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 200px, rgba(255,255,255,0.02) 200px, rgba(255,255,255,0.02) 400px)",
          zIndex: 10,
        }}
      />
    </div>
  );
}
