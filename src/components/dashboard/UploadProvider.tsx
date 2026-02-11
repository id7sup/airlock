"use client";

import { createContext, useContext, useState } from "react";
import { useUpload } from "@/hooks/useUpload";
import { UploadModal } from "@/components/dashboard/UploadModal";
import type { UploadFileEntry } from "@/hooks/useUpload";
import { AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type UploadContextType = ReturnType<typeof useUpload> & {
  openModal: () => void;
  isModalOpen: boolean;
};

const UploadContext = createContext<UploadContextType | null>(null);

export function useUploadContext() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUploadContext must be used within UploadProvider");
  return ctx;
}

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const upload = useUpload();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);

  // Auto-open modal when upload starts
  const wrappedUploadFiles = async (fileList: File[], targetFolderId: string) => {
    setIsModalOpen(true);
    return upload.uploadFiles(fileList, targetFolderId);
  };

  const wrappedAddFiles = async (fileList: File[], targetFolderId: string) => {
    setIsModalOpen(true);
    return upload.addFiles(fileList, targetFolderId);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    if (!upload.isUploading) {
      upload.reset();
    }
  };

  const contextValue: UploadContextType = {
    ...upload,
    uploadFiles: wrappedUploadFiles,
    addFiles: wrappedAddFiles,
    openModal,
    isModalOpen,
  };

  // Map files for the modal (exclude the File object)
  const modalFiles = upload.files.map((f) => ({
    id: f.id,
    name: f.name,
    size: f.size,
    progress: f.progress,
    status: f.status,
    error: f.error,
  }));

  return (
    <UploadContext.Provider value={contextValue}>
      {children}

      {/* Interrupted upload banner */}
      <AnimatePresence>
        {upload.interruptedUpload && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-lg"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              Un téléversement a été interrompu. Les fichiers non envoyés n&apos;ont pas été sauvegardés.
            </p>
            <button
              onClick={upload.dismissInterrupted}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Upload Modal */}
      <UploadModal
        isOpen={isModalOpen && upload.files.length > 0}
        onClose={handleClose}
        files={modalFiles}
        onRetry={upload.retryFile}
        onRetryAll={upload.retryFailed}
        onCancel={upload.cancelAll}
      />
    </UploadContext.Provider>
  );
}
