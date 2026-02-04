"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FileType, Loader2, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import WatermarkOverlay from "./WatermarkOverlay";
import { applyCanvasWatermark } from "./WatermarkOverlay";

interface SecurePdfViewerProps {
  fileId: string;
  fileName: string;
  token: string;
  watermarkRequired?: boolean;
  password?: string;
}

export default function SecurePdfViewer({
  fileId,
  fileName,
  token,
  watermarkRequired = false,
  password,
}: SecurePdfViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [loadedPages, setLoadedPages] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setPdfPages([]);
        setLoadedPages(0);

        // Dynamic import to avoid issues with PDF.js on server
        const pdfjs = await import("pdfjs-dist");

        // Set up worker
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        // Load the PDF
        const params = new URLSearchParams({
          fileId,
          token,
          ...(password && { pwd: password }),
        });
        const pdfUrl = watermarkRequired
          ? `/api/public/view/watermarked?${params.toString()}`
          : `/api/public/view?${params.toString()}`;

        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        setTotalPages(pdf.numPages);
        const pages: string[] = [];

        // Render all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport } as any).promise;

          // Apply watermark to each page
          applyCanvasWatermark(context, canvas.width, canvas.height, {
            text: "CONFIDENTIEL",
            opacity: 0.1,
            darkText: true,
          });

          pages.push(canvas.toDataURL());
          setLoadedPages(pageNum);
        }

        setPdfPages(pages);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(
          err instanceof Error ? err.message : "Impossible de charger le PDF"
        );
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [fileId, token, watermarkRequired, password, retryCount]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  const scrollToTop = () => {
    document.querySelector(".pdf-scroll-container")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    const container = document.querySelector(".pdf-scroll-container");
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
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
        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
          <FileType className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/80 font-medium text-sm truncate">{fileName}</p>
          <p className="text-white/40 text-xs">Document PDF</p>
        </div>
        {totalPages > 0 && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>{isLoading ? `${loadedPages}/${totalPages}` : totalPages} pages</span>
          </div>
        )}
      </div>

      {/* PDF container */}
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#525659]">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 z-20 min-h-[400px]">
            <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
            <div className="text-center">
              <p className="text-white/80 text-sm font-medium">
                Chargement du document...
              </p>
              {totalPages > 0 && (
                <p className="text-white/40 text-xs mt-1">
                  Page {loadedPages} sur {totalPages}
                </p>
              )}
            </div>
            {/* Progress bar */}
            {totalPages > 0 && (
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${(loadedPages / totalPages) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* PDF pages */}
        <div
          className="pdf-scroll-container overflow-y-auto max-h-[70vh] p-4 space-y-4"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {pdfPages.map((pageData, index) => (
            <div
              key={index}
              className="flex justify-center relative"
            >
              {/* Page number badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 rounded text-white/60 text-xs font-medium backdrop-blur-sm">
                {index + 1}
              </div>
              <img
                src={pageData}
                alt={`Page ${index + 1}`}
                className="max-w-full shadow-2xl rounded"
                style={{
                  pointerEvents: "none",
                }}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Scroll buttons */}
        {pdfPages.length > 1 && !isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button
              onClick={scrollToTop}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-lg backdrop-blur-sm transition-colors"
              title="Première page"
            >
              <ChevronUp className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={scrollToBottom}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-lg backdrop-blur-sm transition-colors"
              title="Dernière page"
            >
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Global watermark overlay */}
        <WatermarkOverlay
          text="CONFIDENTIEL"
          opacity={0.08}
          size="lg"
          className="rounded-xl"
        />
      </div>

      {/* Footer notice */}
      <div className="mt-4 flex items-center justify-center gap-3 text-white/30 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Document protégé</span>
        </div>
        <span className="opacity-50">•</span>
        <span>Téléchargement désactivé</span>
        <span className="opacity-50">•</span>
        <span>Filigrane appliqué</span>
      </div>
    </div>
  );
}
