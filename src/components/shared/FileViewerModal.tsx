"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Eye,
  FileText,
  Image as ImageIcon,
  FileType,
  Video,
  Music,
  File,
  Shield,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import SecureCanvas from "./SecureCanvas";
import SecurePdfViewer from "./SecurePdfViewer";
import SecureTextViewer from "./SecureTextViewer";
import SecureVideoViewer from "./SecureVideoViewer";
import SecureOfficeViewer from "./SecureOfficeViewer";
import WatermarkOverlay from "./WatermarkOverlay";

interface FileInfo {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  viewerType: "image" | "pdf" | "text" | "video" | "audio" | "office" | "unsupported";
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
  files: Array<{ id: string; name: string; mimeType: string; downloadAllowed?: boolean }>;
  onFileChange?: (fileId: string) => void;
  password?: string;
}

export function FileViewerModal({
  isOpen,
  onClose,
  fileId,
  token,
  files,
  onFileChange,
  password,
}: FileViewerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(fileId);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter files to only include read-only files (downloadAllowed === false)
  const readOnlyFiles = useMemo(
    () => files.filter((f) => f.downloadAllowed === false),
    [files]
  );

  // Find current file index in filtered list
  const currentFileIndex = useMemo(
    () => readOnlyFiles.findIndex((f) => f.id === currentFileId),
    [readOnlyFiles, currentFileId]
  );

  // Initialize mounted to avoid SSR errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync currentFileId with fileId prop when it changes
  useEffect(() => {
    if (fileId) {
      setCurrentFileId(fileId);
    }
  }, [fileId]);

  // Load file info
  useEffect(() => {
    if (!isOpen || !currentFileId || !mounted) return;

    const fetchFileInfo = async () => {
      setIsLoading(true);
      setError(null);
      setFileInfo(null);

      try {
        const params = new URLSearchParams({
          fileId: currentFileId,
          token,
          ...(password && { pwd: password }),
        });
        const response = await fetch(
          `/api/public/view/info?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Impossible de charger le fichier");
        }

        const data: FileInfo = await response.json();
        setFileInfo(data);
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
  }, [isOpen, currentFileId, token, password, mounted]);

  // Navigation handlers - only navigate between read-only files
  const handleNext = useCallback(() => {
    if (currentFileIndex < readOnlyFiles.length - 1) {
      const nextFileId = readOnlyFiles[currentFileIndex + 1].id;
      setCurrentFileId(nextFileId);
      onFileChange?.(nextFileId);
    }
  }, [currentFileIndex, readOnlyFiles, onFileChange]);

  const handlePrevious = useCallback(() => {
    if (currentFileIndex > 0) {
      const prevFileId = readOnlyFiles[currentFileIndex - 1].id;
      setCurrentFileId(prevFileId);
      onFileChange?.(prevFileId);
    }
  }, [currentFileIndex, readOnlyFiles, onFileChange]);

  const handleClose = useCallback(() => {
    setCurrentFileId(fileId);
    onClose();
  }, [fileId, onClose]);

  // Security: Block dangerous actions
  useEffect(() => {
    if (!isOpen || !mounted) return;

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventRightClick = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (
        (modKey && (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P")) ||
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    document.addEventListener("contextmenu", preventContextMenu, true);
    document.addEventListener("mousedown", preventRightClick, true);
    document.addEventListener("keydown", preventKeyboardShortcuts);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu, true);
      document.removeEventListener("mousedown", preventRightClick, true);
      document.removeEventListener("keydown", preventKeyboardShortcuts);
    };
  }, [isOpen, mounted, handleClose, handleNext, handlePrevious]);

  if (!mounted || !isOpen) return null;

  // Get file type icon (Lucide icons instead of emojis)
  const getFileTypeIcon = () => {
    if (!fileInfo) return <File className="w-5 h-5" />;
    switch (fileInfo.viewerType) {
      case "image":
        return <ImageIcon className="w-5 h-5" />;
      case "pdf":
        return <FileType className="w-5 h-5" />;
      case "text":
        return <FileText className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      case "office":
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  // Get viewer type label
  const getViewerTypeLabel = () => {
    if (!fileInfo) return "Fichier";
    switch (fileInfo.viewerType) {
      case "image": return "Image";
      case "pdf": return "PDF";
      case "text": return "Texte";
      case "video": return "Vidéo";
      case "audio": return "Audio";
      case "office": return "Document";
      default: return "Fichier";
    }
  };

  const getReadableFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "Ko", "Mo", "Go"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex flex-col h-screen">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40"
          >
            {/* Left: File info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {fileInfo && (
                <>
                  {/* File type icon */}
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-white/70">{getFileTypeIcon()}</span>
                  </div>

                  {/* File details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate text-sm">
                      {fileInfo.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>{getViewerTypeLabel()}</span>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span>{getReadableFileSize(fileInfo.size)}</span>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-amber-300 font-medium">
                        Lecture seule
                      </span>
                    </div>
                    {fileInfo.requiresWatermark && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                        <Eye className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-300 font-medium">
                          Filigrane
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right: Navigation and Close */}
            <div className="flex items-center gap-1 ml-4 flex-shrink-0">
              {readOnlyFiles.length > 1 && currentFileIndex >= 0 && (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={currentFileIndex <= 0}
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Précédent"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <span className="text-xs text-white/50 min-w-[40px] text-center tabular-nums">
                    {currentFileIndex + 1}/{readOnlyFiles.length}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentFileIndex >= readOnlyFiles.length - 1}
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Suivant"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1" />
                </>
              )}

              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Fermer (Échap)"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.header>

          {/* Content Area */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            } as React.CSSProperties}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {isLoading && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-white/80 font-medium text-sm">
                    Chargement...
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Préparation du fichier sécurisé
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-4 p-6 max-w-sm">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-medium mb-1">
                    Erreur de chargement
                  </h3>
                  <p className="text-white/50 text-sm">{error}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white transition-colors text-sm"
                >
                  Fermer
                </button>
              </div>
            )}

            {fileInfo && !isLoading && !error && (
              <>
                {!fileInfo.supportedForViewing ? (
                  <div className="flex flex-col items-center gap-5 max-w-sm p-6 text-center bg-white/5 rounded-xl border border-white/10">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                      {getFileTypeIcon()}
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-2">
                        Format non supporté
                      </h3>
                      <p className="text-white/50 text-sm">
                        Ce type de fichier ne peut pas être visualisé dans le lecteur sécurisé.
                      </p>
                    </div>
                    {fileInfo.downloadAllowed ? (
                      <a
                        href={`/api/public/download?fileId=${fileInfo.id}&token=${token}`}
                        className="px-5 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors text-sm"
                      >
                        Télécharger
                      </a>
                    ) : (
                      <div className="px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-amber-200 text-xs font-medium">
                          Téléchargement désactivé pour ce fichier
                        </p>
                      </div>
                    )}
                  </div>
                ) : fileInfo.viewerType === "image" ? (
                  <SecureCanvas
                    fileId={fileInfo.id}
                    fileName={fileInfo.name}
                    token={token}
                    password={password}
                    watermarkRequired={fileInfo.requiresWatermark}
                  />
                ) : fileInfo.viewerType === "pdf" ? (
                  <SecurePdfViewer
                    fileId={fileInfo.id}
                    fileName={fileInfo.name}
                    token={token}
                    password={password}
                    watermarkRequired={fileInfo.requiresWatermark}
                  />
                ) : fileInfo.viewerType === "text" ? (
                  <SecureTextViewer
                    fileId={fileInfo.id}
                    fileName={fileInfo.name}
                    token={token}
                    password={password}
                  />
                ) : fileInfo.viewerType === "video" ? (
                  <SecureVideoViewer
                    fileId={fileInfo.id}
                    fileName={fileInfo.name}
                    token={token}
                    password={password}
                  />
                ) : fileInfo.viewerType === "audio" ? (
                  <div className="w-full max-w-lg">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                      <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                        <Music className="w-5 h-5 text-pink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 font-medium text-sm truncate">{fileInfo.name}</p>
                        <p className="text-white/40 text-xs">Fichier audio</p>
                      </div>
                    </div>

                    {/* Audio player container */}
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-8">
                      {/* Visualizer placeholder */}
                      <div className="flex items-center justify-center gap-1 mb-6">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-pink-400/40 rounded-full animate-pulse"
                            style={{
                              height: `${20 + Math.random() * 30}px`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>

                      {/* Audio element */}
                      <audio
                        controls
                        controlsList="nodownload"
                        className="w-full"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <source
                          src={`/api/public/view?${new URLSearchParams({
                            fileId: fileInfo.id,
                            token,
                            ...(password && { pwd: password }),
                          }).toString()}`}
                          type={fileInfo.mimeType}
                        />
                      </audio>

                      {/* Watermark */}
                      <WatermarkOverlay
                        text="CONFIDENTIEL"
                        opacity={0.12}
                        size="sm"
                        className="rounded-xl"
                      />
                    </div>

                    {/* Footer notice */}
                    <div className="mt-4 flex items-center justify-center gap-3 text-white/30 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Audio protégé</span>
                      </div>
                      <span className="opacity-50">•</span>
                      <span>Téléchargement désactivé</span>
                    </div>
                  </div>
                ) : fileInfo.viewerType === "office" ? (
                  <SecureOfficeViewer
                    fileId={fileInfo.id}
                    fileName={fileInfo.name}
                    token={token}
                    mimeType={fileInfo.mimeType}
                    password={password}
                  />
                ) : null}
              </>
            )}
          </motion.main>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-white/10 px-4 py-2.5 bg-black/40"
          >
            <div className="flex items-center justify-center gap-4 text-xs text-white/30">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Document protégé</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span>Clic droit bloqué</span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span>Raccourcis désactivés</span>
            </div>
          </motion.footer>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
