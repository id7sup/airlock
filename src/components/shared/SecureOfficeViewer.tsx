"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  AlertCircle,
  RefreshCw,
  FileText,
  Table,
  Presentation,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import WatermarkOverlay from "./WatermarkOverlay";

interface SecureOfficeViewerProps {
  fileId: string;
  fileName: string;
  token: string;
  mimeType: string;
  password?: string;
}

export default function SecureOfficeViewer({
  fileId,
  fileName,
  token,
  mimeType,
  password,
}: SecureOfficeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // For XLSX: track sheets
  const [sheets, setSheets] = useState<{ name: string; html: string }[]>([]);
  const [currentSheet, setCurrentSheet] = useState(0);

  // Determine document type
  const getDocumentType = () => {
    if (
      mimeType.includes("wordprocessingml") ||
      mimeType === "application/msword"
    ) {
      return { type: "docx", icon: FileText, label: "Document Word", color: "#2b579a" };
    }
    if (
      mimeType.includes("spreadsheetml") ||
      mimeType === "application/vnd.ms-excel"
    ) {
      return { type: "xlsx", icon: Table, label: "Feuille Excel", color: "#217346" };
    }
    if (
      mimeType.includes("presentationml") ||
      mimeType === "application/vnd.ms-powerpoint"
    ) {
      return { type: "pptx", icon: Presentation, label: "Présentation", color: "#d24726" };
    }
    return { type: "unknown", icon: FileText, label: "Document", color: "#666" };
  };

  const docType = getDocumentType();
  const IconComponent = docType.icon;

  // Fetch and render the document
  const loadDocument = useCallback(async () => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setError(null);
    setSheets([]);
    setCurrentSheet(0);

    try {
      // Fetch the file as blob
      const params = new URLSearchParams({
        fileId,
        token,
        ...(password && { pwd: password }),
      });

      const response = await fetch(`/api/public/view?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Impossible de charger le fichier");
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      if (docType.type === "docx") {
        // Render DOCX with docx-preview
        await renderDocx(arrayBuffer);
      } else if (docType.type === "xlsx") {
        // Render XLSX with exceljs (via xlsx-to-html)
        await renderXlsx(arrayBuffer);
      } else if (docType.type === "pptx") {
        // PPTX - limited support
        await renderPptx(arrayBuffer);
      } else {
        throw new Error("Format non supporté");
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Office viewer error:", err);
      setError(err instanceof Error ? err.message : "Erreur de chargement");
      setIsLoading(false);
    }
  }, [fileId, token, password, docType.type]);

  // Render DOCX using docx-preview
  const renderDocx = async (arrayBuffer: ArrayBuffer) => {
    try {
      // Dynamic import to avoid SSR issues
      const docxPreview = await import("docx-preview");

      if (!containerRef.current) return;

      // Create a wrapper div for the document
      const wrapper = document.createElement("div");
      wrapper.className = "docx-wrapper";
      containerRef.current.appendChild(wrapper);

      await docxPreview.renderAsync(arrayBuffer, wrapper, undefined, {
        className: "docx-content",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        ignoreLastRenderedPageBreak: true,
        experimental: false,
        trimXmlDeclaration: true,
        useBase64URL: true,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true,
      });

      // Add custom styles for better display
      const style = document.createElement("style");
      style.textContent = `
        .docx-wrapper {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 100%;
          overflow: auto;
          min-height: 400px;
        }
        .docx-wrapper .docx {
          max-width: 100%;
        }
        .docx-wrapper section.docx {
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          padding: 40px 50px;
        }
        .docx-wrapper p {
          margin: 0 0 10px 0;
          line-height: 1.5;
        }
        .docx-wrapper table {
          border-collapse: collapse;
          width: 100%;
        }
        .docx-wrapper td, .docx-wrapper th {
          border: 1px solid #ddd;
          padding: 8px;
        }
      `;
      containerRef.current.appendChild(style);
    } catch (err) {
      console.error("DOCX render error:", err);
      throw new Error("Erreur lors du rendu du document Word");
    }
  };

  // Render XLSX using exceljs (via xlsx-to-html)
  const renderXlsx = async (arrayBuffer: ArrayBuffer) => {
    try {
      const { xlsxToHtmlSheets } = await import("@/lib/xlsx-to-html");
      const sheetData = await xlsxToHtmlSheets(arrayBuffer);

      setSheets(sheetData);

      // Render first sheet
      if (sheetData.length > 0 && containerRef.current) {
        renderSheetHtml(sheetData[0].html);
      }
    } catch (err) {
      console.error("XLSX render error:", err);
      throw new Error("Erreur lors du rendu du fichier Excel");
    }
  };

  // Render sheet HTML into container
  const renderSheetHtml = (html: string) => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "xlsx-wrapper";
    wrapper.innerHTML = html;
    containerRef.current.appendChild(wrapper);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .xlsx-wrapper {
        background: white;
        padding: 16px;
        border-radius: 8px;
        overflow: auto;
        max-width: 100%;
        min-height: 300px;
      }
      .xlsx-wrapper table {
        border-collapse: collapse;
        width: 100%;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .xlsx-wrapper td, .xlsx-wrapper th {
        border: 1px solid #e0e0e0;
        padding: 8px 12px;
        text-align: left;
        white-space: nowrap;
      }
      .xlsx-wrapper th {
        background: #f5f5f5;
        font-weight: 600;
      }
      .xlsx-wrapper tr:hover td {
        background: #f9f9f9;
      }
      .xlsx-wrapper tr:first-child td,
      .xlsx-wrapper tr:first-child th {
        background: #217346;
        color: white;
        font-weight: 600;
      }
    `;
    containerRef.current.appendChild(style);
  };

  // Handle sheet change for XLSX
  const handleSheetChange = (index: number) => {
    setCurrentSheet(index);
    if (sheets[index]) {
      renderSheetHtml(sheets[index].html);
    }
  };

  // Render PPTX - basic support (extract text/images)
  const renderPptx = async (arrayBuffer: ArrayBuffer) => {
    try {
      // PPTX is essentially a ZIP file with XML and media
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(arrayBuffer);

      if (!containerRef.current) return;

      const wrapper = document.createElement("div");
      wrapper.className = "pptx-wrapper";

      // Try to extract slide content
      const slideFiles = Object.keys(zip.files)
        .filter((name) => name.match(/ppt\/slides\/slide\d+\.xml$/))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
          const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
          return numA - numB;
        });

      if (slideFiles.length === 0) {
        throw new Error("Aucune slide trouvée dans la présentation");
      }

      // Extract text from each slide
      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        const slideXml = await zip.file(slideFile)?.async("string");

        if (slideXml) {
          const slideDiv = document.createElement("div");
          slideDiv.className = "pptx-slide";

          // Extract text content from XML
          const textContent = extractTextFromPptxXml(slideXml);

          slideDiv.innerHTML = `
            <div class="slide-header">Slide ${i + 1}</div>
            <div class="slide-content">${textContent || "<em>Contenu visuel (aperçu limité)</em>"}</div>
          `;
          wrapper.appendChild(slideDiv);
        }
      }

      // Add notice about limited preview
      const notice = document.createElement("div");
      notice.className = "pptx-notice";
      notice.innerHTML = `
        <p>Aperçu textuel de la présentation (${slideFiles.length} slides)</p>
        <p class="notice-sub">Les éléments visuels ne sont pas affichés dans cet aperçu sécurisé</p>
      `;
      wrapper.insertBefore(notice, wrapper.firstChild);

      containerRef.current.appendChild(wrapper);

      // Add styles
      const style = document.createElement("style");
      style.textContent = `
        .pptx-wrapper {
          background: #2d2d2d;
          padding: 20px;
          border-radius: 8px;
          overflow: auto;
          max-width: 100%;
        }
        .pptx-notice {
          background: #d24726;
          color: white;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          text-align: center;
        }
        .pptx-notice p {
          margin: 0;
          font-weight: 500;
        }
        .pptx-notice .notice-sub {
          font-size: 12px;
          opacity: 0.8;
          margin-top: 4px;
          font-weight: normal;
        }
        .pptx-slide {
          background: white;
          border-radius: 8px;
          margin-bottom: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .slide-header {
          background: #d24726;
          color: white;
          padding: 8px 16px;
          font-weight: 600;
          font-size: 13px;
        }
        .slide-content {
          padding: 20px;
          min-height: 100px;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
        }
        .slide-content em {
          color: #999;
        }
      `;
      containerRef.current.appendChild(style);
    } catch (err) {
      console.error("PPTX render error:", err);
      throw new Error("Erreur lors du rendu de la présentation");
    }
  };

  // Extract text from PPTX XML
  const extractTextFromPptxXml = (xml: string): string => {
    const texts: string[] = [];
    // Match text content in <a:t> tags
    const matches = xml.matchAll(/<a:t>([^<]*)<\/a:t>/g);
    for (const match of matches) {
      if (match[1].trim()) {
        texts.push(match[1].trim());
      }
    }
    return texts.join("<br/>");
  };

  // Load document on mount and when retryCount changes
  useEffect(() => {
    loadDocument();
  }, [loadDocument, retryCount]);

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
    <div className="w-full max-w-4xl flex flex-col">
      {/* Document type header */}
      <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${docType.color}20` }}
        >
          <IconComponent
            className="w-5 h-5"
            style={{ color: docType.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/80 font-medium text-sm truncate">{fileName}</p>
          <p className="text-white/40 text-xs">{docType.label}</p>
        </div>

        {/* Sheet navigation for Excel */}
        {docType.type === "xlsx" && sheets.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSheetChange(Math.max(0, currentSheet - 1))}
              disabled={currentSheet === 0}
              className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <span className="text-xs text-white/60 min-w-[80px] text-center">
              {sheets[currentSheet]?.name || `Feuille ${currentSheet + 1}`}
            </span>
            <button
              onClick={() => handleSheetChange(Math.min(sheets.length - 1, currentSheet + 1))}
              disabled={currentSheet === sheets.length - 1}
              className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 min-h-[450px] max-h-[70vh]">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 z-20">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
            <p className="text-white/60 text-sm">Chargement du document...</p>
          </div>
        )}

        {/* Document container */}
        <div
          ref={containerRef}
          className="w-full h-full overflow-auto"
          style={{
            minHeight: "450px",
            maxHeight: "70vh",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />

        {/* Watermark overlay - dark text for light backgrounds */}
        <WatermarkOverlay
          text="CONFIDENTIEL"
          opacity={0.12}
          size="md"
          darkText={docType.type !== "pptx"}
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
        <span>Lecture seule</span>
        <span className="opacity-50">•</span>
        <span>Copie désactivée</span>
      </div>
    </div>
  );
}
