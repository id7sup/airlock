"use client";

import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  Check,
  RefreshCw,
  Clock,
  Ban,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export type UploadFileStatus = "pending" | "uploading" | "success" | "error" | "stalled";

interface UploadFile {
  id?: string;
  name: string;
  size: number;
  progress: number;
  status: UploadFileStatus;
  error?: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: UploadFile[];
  onRetry?: (fileId: string) => void;
  onRetryAll?: () => void;
  onCancel?: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  files,
  onRetry,
  onRetryAll,
  onCancel,
}: UploadModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === "success").length;
  const failedFiles = files.filter(f => f.status === "error").length;
  const stalledFiles = files.filter(f => f.status === "stalled").length;
  const uploadingFiles = files.filter(f => f.status === "uploading").length;
  const pendingFiles = files.filter(f => f.status === "pending").length;
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const uploadedSize = files.reduce((acc, f) => acc + (f.size * f.progress / 100), 0);
  const overallProgress = totalSize > 0 ? (uploadedSize / totalSize) * 100 : 0;
  const isComplete = completedFiles === totalFiles && totalFiles > 0;
  const hasErrors = failedFiles > 0 || stalledFiles > 0;
  const isActive = uploadingFiles > 0 || pendingFiles > 0;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "Ko", "Mo", "Go"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const widgetContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-5 right-5 z-[10000] w-[360px] bg-white rounded-2xl shadow-2xl border border-black/[0.06] overflow-hidden"
      >
        {/* Compact Header */}
        <div
          className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-[#f9f9fb] transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isComplete ? "bg-brand-primary/10 text-brand-primary" :
            hasErrors && !isActive ? "bg-red-50 text-red-500" :
            "bg-black/5 text-black"
          }`}>
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : hasErrors && !isActive ? (
              <AlertCircle className="w-4 h-4" />
            ) : isActive ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-black truncate">
              {isComplete ? "Téléversement terminé" :
               hasErrors && !isActive ? "Erreurs de téléversement" :
               `Téléversement ${completedFiles}/${totalFiles}`}
            </p>
            {!isComplete && (
              <div className="mt-1 w-full h-1.5 bg-[#f0f0f2] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`h-full rounded-full ${hasErrors && !isActive ? "bg-red-500" : "bg-brand-primary"}`}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isActive && onCancel && (
              <button
                onClick={(e) => { e.stopPropagation(); onCancel(); }}
                className="w-7 h-7 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-black/30"
                title="Annuler"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="w-7 h-7 flex items-center justify-center hover:bg-black/5 rounded-lg transition-colors text-black/30"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            {(isComplete || (hasErrors && !isActive) || !isActive) && (
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-7 h-7 flex items-center justify-center hover:bg-black/5 rounded-lg transition-colors text-black/30"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded File List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-black/[0.04]" />
              <div className="max-h-[280px] overflow-y-auto px-3 py-2 space-y-1">
                {files.map((file, index) => (
                  <div
                    key={file.id || index}
                    className={`px-3 py-2 rounded-xl flex items-center gap-3 ${
                      file.status === "success" ? "bg-brand-primary/5" :
                      file.status === "error" ? "bg-red-50" :
                      file.status === "stalled" ? "bg-amber-50" :
                      ""
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      file.status === "success" ? "text-brand-primary" :
                      file.status === "error" ? "text-red-500" :
                      file.status === "stalled" ? "text-amber-500" :
                      file.status === "uploading" ? "text-black/60" :
                      "text-black/30"
                    }`}>
                      {file.status === "success" ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : file.status === "error" ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : file.status === "stalled" ? (
                        <Clock className="w-3.5 h-3.5" />
                      ) : file.status === "uploading" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-black truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-black/40">
                          {formatSize(file.size)}
                        </span>
                        {(file.status === "uploading" || file.status === "stalled") && (
                          <>
                            <span className="text-[10px] text-black/20">•</span>
                            <span className="text-[10px] text-black/40">
                              {Math.round(file.progress)}%
                            </span>
                          </>
                        )}
                        {file.status === "stalled" && (
                          <>
                            <span className="text-[10px] text-black/20">•</span>
                            <span className="text-[10px] text-amber-600">Lent</span>
                          </>
                        )}
                        {file.status === "error" && file.error && (
                          <>
                            <span className="text-[10px] text-black/20">•</span>
                            <span className="text-[10px] text-red-500 truncate max-w-[120px]">
                              {file.error}
                            </span>
                          </>
                        )}
                      </div>
                      {(file.status === "uploading" || file.status === "stalled") && (
                        <div className="mt-1 w-full h-1 bg-black/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`h-full rounded-full ${file.status === "stalled" ? "bg-amber-500" : "bg-brand-primary"}`}
                          />
                        </div>
                      )}
                    </div>

                    {file.status === "error" && file.id && onRetry && (
                      <button
                        onClick={() => onRetry(file.id!)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors shrink-0"
                        title="Réessayer"
                      >
                        <RefreshCw className="w-3 h-3 text-black/40" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Error footer with retry all */}
              {hasErrors && !isActive && onRetryAll && (
                <div className="px-3 py-2 border-t border-red-100 bg-red-50/50">
                  <button
                    onClick={onRetryAll}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-red-600 text-white text-[11px] font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Tout réessayer ({failedFiles + stalledFiles})
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(widgetContent, document.body);
}
