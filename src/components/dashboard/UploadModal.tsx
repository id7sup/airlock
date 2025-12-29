"use client";


import { useState, useEffect } from "react";
import { 
  X, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  FolderOpen,
  Check
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface UploadFile {
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function UploadModal({ 
  isOpen, 
  onClose, 
  files 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  files: UploadFile[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === "success").length;
  const failedFiles = files.filter(f => f.status === "error").length;
  const uploadingFiles = files.filter(f => f.status === "uploading").length;
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const uploadedSize = files.reduce((acc, f) => acc + (f.size * f.progress / 100), 0);
  const overallProgress = totalSize > 0 ? (uploadedSize / totalSize) * 100 : 0;
  const isComplete = completedFiles === totalFiles && totalFiles > 0;
  const hasErrors = failedFiles > 0;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "Ko", "Mo", "Go"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[-10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (isComplete || hasErrors) {
            onClose();
          }
        }
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden border border-black/[0.02]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-black/[0.03] flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isComplete ? "bg-brand-primary/10 text-brand-primary" : 
              hasErrors ? "bg-red-50 text-red-500" :
              "bg-black/5 text-black"
            }`}>
              {isComplete ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : hasErrors ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-medium tracking-tight text-black">
                {isComplete ? "Téléversement terminé" : 
                 hasErrors ? "Téléversement terminé avec erreurs" :
                 "Téléversement en cours"}
              </h2>
              <p className="text-[12px] text-black/40 font-medium mt-0.5">
                {completedFiles} / {totalFiles} fichiers • {formatSize(uploadedSize)} / {formatSize(totalSize)}
              </p>
            </div>
          </div>
          {(isComplete || hasErrors) && (
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center hover:bg-[#f5f5f7] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-black/40" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {!isComplete && (
          <div className="px-8 pt-6 pb-4">
            <div className="w-full h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full bg-brand-primary rounded-full"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] font-bold text-black/30 uppercase tracking-widest">
                {Math.round(overallProgress)}% complété
              </span>
              {uploadingFiles > 0 && (
                <div className="flex items-center gap-2 text-[11px] font-medium text-black/40">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{uploadingFiles} en cours...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Files List */}
        <div className="px-8 py-6 max-h-[400px] overflow-y-auto">
          <div className="space-y-3">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-2xl border transition-all ${
                  file.status === "success" ? "bg-brand-primary/5 border-brand-primary/20" :
                  file.status === "error" ? "bg-red-50 border-red-200" :
                  file.status === "uploading" ? "bg-black/5 border-black/10" :
                  "bg-[#f5f5f7] border-black/[0.03]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    file.status === "success" ? "bg-brand-primary text-white" :
                    file.status === "error" ? "bg-red-500 text-white" :
                    file.status === "uploading" ? "bg-black text-white" :
                    "bg-black/10 text-black/40"
                  }`}>
                    {file.status === "success" ? (
                      <Check className="w-5 h-5" />
                    ) : file.status === "error" ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : file.status === "uploading" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-black truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] font-medium text-black/40">
                        {formatSize(file.size)}
                      </span>
                      {file.status === "uploading" && (
                        <>
                          <span className="text-[11px] text-black/30">•</span>
                          <span className="text-[11px] font-medium text-black/40">
                            {Math.round(file.progress)}%
                          </span>
                        </>
                      )}
                      {file.status === "error" && file.error && (
                        <>
                          <span className="text-[11px] text-black/30">•</span>
                          <span className="text-[11px] font-medium text-red-500">
                            {file.error}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {file.status === "uploading" && (
                      <div className="mt-2 w-full h-1 bg-black/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="h-full bg-brand-primary rounded-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {isComplete && !hasErrors && (
          <div className="px-8 py-6 bg-brand-primary/5 border-t border-black/[0.03]">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-primary" />
              <p className="text-[13px] font-medium text-black">
                Tous les fichiers ont été téléversés avec succès.
              </p>
            </div>
          </div>
        )}

        {hasErrors && (
          <div className="px-8 py-6 bg-red-50 border-t border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-[13px] font-medium text-red-700">
                {failedFiles} fichier{failedFiles > 1 ? "s" : ""} n'a{failedFiles > 1 ? "ont" : ""} pas pu être téléversé{failedFiles > 1 ? "s" : ""}.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

