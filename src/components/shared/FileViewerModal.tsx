"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import SecureCanvas from "./SecureCanvas";
import SecurePdfViewer from "./SecurePdfViewer";
import SecureTextViewer from "./SecureTextViewer";
import SecureVideoViewer from "./SecureVideoViewer";

interface FileInfo {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  viewerType: "image" | "pdf" | "text" | "video" | "audio" | "unsupported";
  supportedForViewing: boolean;
  requiresWatermark: boolean;
  downloadAllowed: boolean;
  fileUrl?: string;
}

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId?: string;
  token: string;
  files: Array<{ id: string; name: string; mimeType: string }>;
  onFileChange?: (fileId: string) => void;
}

export function FileViewerModal({
  isOpen,
  onClose,
  fileId,
  token,
  files,
  onFileChange,
}: FileViewerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(fileId);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewSessionId, setViewSessionId] = useState<string | null>(null);

  // Trouver le fichier courant dans la liste
  const currentFileIndex = useMemo(
    () => files.findIndex((f) => f.id === currentFileId),
    [files, currentFileId]
  );

  // Initialiser mounted pour éviter les erreurs SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Charger les infos du fichier
  useEffect(() => {
    if (!isOpen || !currentFileId || !mounted) return;

    const fetchFileInfo = async () => {
      setIsLoading(true);
      setError(null);
      setFileInfo(null);

      try {
        const response = await fetch(
          `/api/public/view/info?fileId=${currentFileId}&token=${token}`
        );

        if (!response.ok) {
          throw new Error("Impossible de charger le fichier");
        }

        const data: FileInfo = await response.json();
        setFileInfo(data);

        // Générer session ID unique pour ce fichier
        const sessionId = `${currentFileId}-${Date.now()}`;
        setViewSessionId(sessionId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        setFileInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileInfo();
  }, [isOpen, currentFileId, token, mounted]);

  // Gestionnaires de navigation
  const handleNext = useCallback(() => {
    if (currentFileIndex < files.length - 1) {
      const nextFileId = files[currentFileIndex + 1].id;
      setCurrentFileId(nextFileId);
      onFileChange?.(nextFileId);
    }
  }, [currentFileIndex, files, onFileChange]);

  const handlePrevious = useCallback(() => {
    if (currentFileIndex > 0) {
      const prevFileId = files[currentFileIndex - 1].id;
      setCurrentFileId(prevFileId);
      onFileChange?.(prevFileId);
    }
  }, [currentFileIndex, files, onFileChange]);

  const handleClose = useCallback(() => {
    setCurrentFileId(fileId);
    onClose();
  }, [fileId, onClose]);

  // Sécurité: Gestionnaires d'événements pour bloquer les actions dangereuses
  useEffect(() => {
    if (!isOpen || !mounted) return;

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Bloquer: Ctrl+S, Ctrl+P, F12, Ctrl+Shift+I, PrintScreen
      if (
        (e.ctrlKey && (e.key === "s" || e.key === "p")) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Navigation clavier pour la modal
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventKeyboardShortcuts);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventKeyboardShortcuts);
    };
  }, [isOpen, mounted, handleClose, handleNext, handlePrevious]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex flex-col bg-black"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex-1">
            {fileInfo && (
              <div>
                <h3 className="text-white font-semibold truncate">
                  {fileInfo.name}
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  Lecture seule
                  {fileInfo.requiresWatermark && " • Filigrane"}
                </p>
              </div>
            )}
          </div>

          {/* Navigation buttons (show if more than 1 file) */}
          {files.length > 1 && currentFileIndex >= 0 && (
            <div className="flex items-center gap-2 mx-4">
              <button
                onClick={handlePrevious}
                disabled={currentFileIndex <= 0}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <span className="text-xs text-white/50 min-w-[60px] text-center">
                {currentFileIndex >= 0 ? currentFileIndex + 1 : 1} / {files.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentFileIndex >= files.length - 1}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-auto flex items-center justify-center p-4 select-none"
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          } as React.CSSProperties}
        >
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <p className="text-white/60">Chargement du fichier...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 max-w-md">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-white text-center">{error}</p>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          )}

          {fileInfo && !isLoading && !error && (
            <>
              {!fileInfo.supportedForViewing ? (
                <div className="flex flex-col items-center gap-4 max-w-md text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-white/60" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">
                      Aperçu non disponible
                    </h3>
                    <p className="text-white/60 text-sm">
                      Ce type de fichier ne peut pas être visualisé dans le
                      navigateur.
                    </p>
                  </div>
                  {fileInfo.downloadAllowed && (
                    <a
                      href={`/api/public/download?fileId=${fileInfo.id}&token=${token}`}
                      className="mt-4 px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
                    >
                      Télécharger le fichier
                    </a>
                  )}
                </div>
              ) : fileInfo.viewerType === "image" ? (
                <SecureCanvas
                  fileId={fileInfo.id}
                  fileName={fileInfo.name}
                  token={token}
                  watermarkRequired={fileInfo.requiresWatermark}
                />
              ) : fileInfo.viewerType === "pdf" ? (
                <SecurePdfViewer
                  fileId={fileInfo.id}
                  fileName={fileInfo.name}
                  token={token}
                  watermarkRequired={fileInfo.requiresWatermark}
                />
              ) : fileInfo.viewerType === "text" ? (
                <SecureTextViewer
                  fileId={fileInfo.id}
                  fileName={fileInfo.name}
                  token={token}
                />
              ) : fileInfo.viewerType === "video" ? (
                <SecureVideoViewer
                  fileId={fileInfo.id}
                  fileName={fileInfo.name}
                  token={token}
                />
              ) : fileInfo.viewerType === "audio" ? (
                <div className="flex flex-col items-center gap-4">
                  <audio
                    controls
                    controlsList="nodownload"
                    className="w-full max-w-md"
                  >
                    <source
                      src={`/api/public/view?fileId=${fileInfo.id}&token=${token}`}
                      type={fileInfo.mimeType}
                    />
                  </audio>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-3 bg-black/50">
          <p className="text-xs text-white/40 text-center">
            Ce fichier est en lecture seule. Le téléchargement est désactivé.
          </p>
        </div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
