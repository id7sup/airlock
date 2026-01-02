"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function ErrorModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "Fermer"
}: ErrorModalProps) {
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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-red-50 text-red-500">
              <AlertCircle className="w-8 h-8" />
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
                className="flex-1 px-6 py-3 bg-black text-white hover:bg-black/90 rounded-xl text-[14px] font-medium transition-all"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

