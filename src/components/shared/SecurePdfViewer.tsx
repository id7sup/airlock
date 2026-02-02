"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface SecurePdfViewerProps {
  fileId: string;
  fileName: string;
  token: string;
  watermarkRequired?: boolean;
}

export default function SecurePdfViewer({
  fileId,
  fileName,
  token,
  watermarkRequired = false,
}: SecurePdfViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import to avoid issues with PDF.js on server
        const pdfjs = await import("pdfjs-dist");

        // Set up worker
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        // Load the PDF
        const pdfUrl = watermarkRequired
          ? `/api/public/view/watermarked?fileId=${fileId}&token=${token}`
          : `/api/public/view?fileId=${fileId}&token=${token}`;

        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        const pages: string[] = [];

        // Render first 5 pages initially (pagination for performance)
        for (let pageNum = 1; pageNum <= Math.min(5, pdf.numPages); pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport } as any).promise;

          // Add watermark overlay if server watermark wasn't applied
          if (!watermarkRequired) {
            context.save();
            context.font = "bold 48px Arial";
            context.fillStyle = "rgba(0, 0, 0, 0.15)";
            context.rotate((-45 * Math.PI) / 180);
            context.fillText("AIRLOCK", canvas.width / 2, canvas.height / 2);
            context.restore();
          }

          pages.push(canvas.toDataURL());
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
  }, [fileId, token, watermarkRequired]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-white">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-white/60">Chargement du PDF...</p>;
  }

  return (
    <div
      className="w-full max-w-4xl mx-auto overflow-y-auto"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      } as React.CSSProperties}
    >
      {pdfPages.map((pageData, index) => (
        <div key={index} className="mb-4 flex justify-center">
          <img
            src={pageData}
            alt={`Page ${index + 1}`}
            className="max-w-full border border-white/10 rounded-lg"
            style={{
              pointerEvents: "none",
            } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}
