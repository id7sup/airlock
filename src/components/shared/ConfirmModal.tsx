"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  isDestructive = true,
  isLoading = false
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-black/[0.05]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 text-center space-y-6">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto",
              isDestructive ? "bg-red-50 text-red-500" : "bg-black/5 text-black"
            )}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-medium tracking-tight text-black">{title}</h3>
              <p className="text-[15px] text-black/40 font-normal leading-relaxed">
                {message}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[#f5f5f7] hover:bg-black/5 rounded-xl text-[14px] font-medium transition-all text-black/40"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "flex-1 px-6 py-3 rounded-xl text-[14px] font-medium transition-all flex items-center justify-center gap-2",
                  isDestructive 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "bg-black text-white hover:bg-black/90"
                )}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
