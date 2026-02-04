"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FileText, Loader2, RefreshCw } from "lucide-react";
import WatermarkOverlay from "./WatermarkOverlay";

interface SecureTextViewerProps {
  fileId: string;
  fileName: string;
  token: string;
  password?: string;
}

export default function SecureTextViewer({
  fileId,
  fileName,
  token,
  password,
}: SecureTextViewerProps) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadText = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          fileId,
          token,
          ...(password && { pwd: password }),
        });
        const response = await fetch(
          `/api/public/view?${params.toString()}`
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
  }, [fileId, token, password, retryCount]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  // Count lines and characters
  const lineCount = content.split("\n").length;
  const charCount = content.length;

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
      className="w-full max-w-5xl mx-auto"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/80 font-medium text-sm truncate">{fileName}</p>
          <p className="text-white/40 text-xs">Fichier texte</p>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span>{lineCount} lignes</span>
            <span className="opacity-50">•</span>
            <span>{charCount.toLocaleString()} caractères</span>
          </div>
        )}
      </div>

      {/* Content container */}
      <div className="relative rounded-xl overflow-hidden border border-white/10">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 z-20 min-h-[300px]">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
            <p className="text-white/60 text-sm">Chargement du fichier...</p>
          </div>
        )}

        {/* Text content */}
        <div className="relative bg-[#1e1e1e]">
          {/* Line numbers gutter */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#252526] border-r border-white/5" />

          <pre className="pl-14 pr-6 py-4 overflow-auto max-h-[65vh] text-[13px] leading-6 font-mono text-white/80 whitespace-pre-wrap break-words">
            {/* Line numbers */}
            <div
              className="absolute left-0 top-4 w-12 text-right pr-3 text-white/20 text-[13px] leading-6 font-mono select-none"
              aria-hidden="true"
            >
              {content.split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {content}
          </pre>

          {/* Watermark overlay */}
          <WatermarkOverlay
            text="CONFIDENTIEL"
            opacity={0.1}
            size="sm"
          />
        </div>
      </div>

      {/* Footer notice */}
      <div className="mt-4 flex items-center justify-center gap-3 text-white/30 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Document protégé</span>
        </div>
        <span className="opacity-50">•</span>
        <span>Copie désactivée</span>
        <span className="opacity-50">•</span>
        <span>Sélection bloquée</span>
      </div>
    </div>
  );
}
