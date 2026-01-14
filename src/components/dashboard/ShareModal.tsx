"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Copy, 
  Network, 
  Lock, 
  UserPlus, 
  X, 
  Check, 
  Loader2, 
  Download, 
  Eye, 
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AtSign,
  Plus,
  Clock,
  EyeOff
} from "lucide-react";
import { createShareLinkAction, inviteUserAction } from "@/lib/actions/sharing";
import { Logo } from "@/components/shared/Logo";
import { ErrorModal } from "@/components/shared/ErrorModal";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { FileIcon, Settings, Info, FolderOpen } from "lucide-react";

type ShareMode = "select" | "internal" | "success";
type ShareRole = "VIEWER" | "EDITOR";

export function ShareModal({ 
  isOpen, 
  onClose, 
  folderId, 
  folderName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  folderId: string;
  folderName: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<ShareMode>("select");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: ""
  });

  // Internal share settings
  const [internalRole, setInternalRole] = useState<ShareRole>("VIEWER");
  const [internalCanDownload, setInternalCanDownload] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMode("select");
        setEmail("");
        setInternalRole("VIEWER");
        setInternalCanDownload(true);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleInvite = async () => {
    if (!email) return;
    setIsInviting(true);
    setInviteSuccess(false);
    try {
      await inviteUserAction(folderId, email, internalRole, internalCanDownload);
      // Réinitialiser l'email mais rester en mode internal pour permettre d'ajouter d'autres personnes
      setEmail("");
      // Afficher un message de succès temporaire
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (error: any) {
      const errorMessage = error?.message || "Erreur lors de l'invitation";
      setErrorModal({
        isOpen: true,
        title: "Erreur d'invitation",
        message: errorMessage
      });
      console.error("Erreur invitation:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreatePublicLinkDirect = async () => {
    setIsCreatingLink(true);
    try {
      // Créer le lien avec des valeurs par défaut (initialisé à 0)
      const result = await createShareLinkAction({
        folderId,
        expiresAt: null, // Pas d'expiration par défaut
        maxViews: null, // Pas de limite de vues par défaut
        allowDownload: true, // Téléchargement autorisé par défaut
        password: undefined, // Pas de mot de passe par défaut
      });
      
      // Fermer le modal et rediriger vers la page de détails
      onClose();
      router.push(`/dashboard/sharing/${result.id}`);
    } catch (error) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la création du lien"
      });
      setIsCreatingLink(false);
    }
  };


  const modalContent = (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-black/[0.05]"
        >
          {/* Compact Header */}
          <div className="px-6 py-5 border-b border-black/[0.03] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center">
                <Logo className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-medium tracking-tight text-black">Partager</h2>
                <p className="text-xs text-black/30 font-medium">{folderName}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center hover:bg-black/5 rounded-xl transition-colors"
            >
              <X className="w-4 h-4 text-black/40" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* Mode: Selection - Compact Cards */}
              {mode === "select" && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <p className="text-sm text-black/40 font-medium">Choisissez votre méthode</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode("internal")}
                      className="group p-6 bg-black/5 hover:bg-black/10 rounded-2xl border border-black/10 hover:border-black/20 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-medium text-black mb-1">Interne</h3>
                      <p className="text-xs text-black/40 font-medium leading-relaxed">
                        Par compte
                      </p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreatePublicLinkDirect}
                      disabled={isCreatingLink}
                      className="group p-6 bg-black/5 hover:bg-black/10 rounded-2xl border border-black/10 hover:border-black/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed relative"
                    >
                      {isCreatingLink && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                          <Loader2 className="w-6 h-6 text-black animate-spin" />
                        </div>
                      )}
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <Network className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-medium text-black mb-1">Public</h3>
                      <p className="text-xs text-black/40 font-medium leading-relaxed">
                        Lien sécurisé
                      </p>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Mode: Internal - Enhanced with Role & Download */}
              {mode === "internal" && (
                <motion.div
                  key="internal"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <button
                    onClick={() => setMode("select")}
                    className="flex items-center gap-1.5 text-xs font-medium text-black/40 hover:text-black transition-colors -mb-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Retour
                  </button>

                  <div>
                    <h3 className="text-lg font-medium text-black mb-1">Inviter par email</h3>
                    <p className="text-xs text-black/30 font-medium">Accès par compte identifié</p>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                      <input 
                        type="email" 
                        placeholder="nom@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                        className="w-full pl-10 pr-3 py-2.5 bg-black/5 border-none rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-black/10 transition-all outline-none"
                      />
                    </div>
                    <button 
                      onClick={handleInvite}
                      disabled={isInviting || !email}
                      className="bg-black text-white px-6 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 shadow-lg shadow-black/10 hover:bg-black/90 transition-all flex items-center justify-center"
                    >
                      {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : inviteSuccess ? "✓ Invité" : "Inviter"}
                    </button>
                  </div>
                  
                  {inviteSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Invitation envoyée avec succès ! Vous pouvez inviter une autre personne.
                    </motion.div>
                  )}

                  {/* Role Selection */}
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] block">
                      Rôle
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setInternalRole("VIEWER")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          internalRole === "VIEWER"
                            ? "bg-black text-white border-black shadow-lg"
                            : "bg-black/5 border-transparent hover:border-black/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className={`w-4 h-4 ${internalRole === "VIEWER" ? "text-white" : "text-black/40"}`} />
                          <span className={`text-xs font-medium ${internalRole === "VIEWER" ? "text-white" : "text-black"}`}>
                            Viewer
                          </span>
                        </div>
                        <p className={`text-[10px] ${internalRole === "VIEWER" ? "text-white/70" : "text-black/30"} font-medium`}>
                          Consultation
                        </p>
                      </button>
                      <button
                        onClick={() => setInternalRole("EDITOR")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          internalRole === "EDITOR"
                            ? "bg-black text-white border-black shadow-lg"
                            : "bg-black/5 border-transparent hover:border-black/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className={`w-4 h-4 ${internalRole === "EDITOR" ? "text-white" : "text-black/40"}`} />
                          <span className={`text-xs font-medium ${internalRole === "EDITOR" ? "text-white" : "text-black"}`}>
                            Editor
                          </span>
                        </div>
                        <p className={`text-[10px] ${internalRole === "EDITOR" ? "text-white/70" : "text-black/30"} font-medium`}>
                          Modification
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Download Toggle for Internal */}
                  {internalRole === "VIEWER" && (
                    <div 
                      onClick={() => setInternalCanDownload(!internalCanDownload)}
                      className="p-4 bg-black/5 hover:bg-white rounded-xl border-2 border-transparent hover:border-black/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            internalCanDownload ? "bg-black text-white shadow-lg" : "bg-black/5 text-black/30"
                          }`}>
                            {internalCanDownload ? <Download className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-black">Téléchargement</p>
                            <p className="text-[10px] text-black/40 font-medium">Autoriser l'enregistrement</p>
                          </div>
                        </div>
                        <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
                          internalCanDownload ? "bg-black shadow-lg" : "bg-black/20"
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                            internalCanDownload ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-black/[0.05]">
                    <h4 className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-3">Membres</h4>
                    <div className="bg-black/5 rounded-xl overflow-hidden">
                      <div className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-xs font-bold shadow-md">
                            ME
                          </div>
                          <div>
                            <p className="text-sm font-medium text-black">Propriétaire (Vous)</p>
                            <p className="text-[10px] text-black/30 font-medium uppercase tracking-widest">
                              Accès complet
                            </p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mode: Success (Internal) */}
              {mode === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-center space-y-5 py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-medium text-black mb-1">Invitation envoyée</h3>
                    <p className="text-xs text-black/40 font-medium">
                      L'invitation a été envoyée avec succès
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="px-8 py-2.5 bg-black text-white rounded-xl font-medium text-sm hover:bg-black/90 transition-all"
                  >
                    Fermer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: "", message: "" })}
        title={errorModal.title}
        message={errorModal.message}
      />
    </>
  );
}
