"use client";

import { useState } from "react";
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

type ShareMode = "select" | "internal" | "external" | "success";
type ExternalStep = "rules" | "result";
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
  const [mode, setMode] = useState<ShareMode>("select");
  const [externalStep, setExternalStep] = useState<ExternalStep>("rules");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLinkId, setShareLinkId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  // External share settings
  const [allowDownload, setAllowDownload] = useState(true);
  const [maxViews, setMaxViews] = useState<string>("");
  const [expiryDays, setExpiryDays] = useState<string>("7");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMode("select");
        setExternalStep("rules");
        setShareLink(null);
        setShareLinkId(null);
        setEmail("");
        setInternalRole("VIEWER");
        setInternalCanDownload(true);
        setAllowDownload(true);
        setMaxViews("");
        setExpiryDays("7");
        setIsPasswordProtected(false);
        setPassword("");
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

  const handleCreatePublicLink = async () => {
    setIsCreatingLink(true);
    try {
      const expiresAt = expiryDays ? new Date() : null;
      if (expiresAt) {
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
      }

      // Validation : empêcher les valeurs négatives
      const maxViewsValue = maxViews ? parseInt(maxViews) : null;
      if (maxViewsValue !== null && maxViewsValue < 0) {
        setErrorModal({
          isOpen: true,
          title: "Erreur de validation",
          message: "Le quota de vues ne peut pas être négatif"
        });
        setIsCreatingLink(false);
        return;
      }

      const result = await createShareLinkAction({
        folderId,
        expiresAt,
        maxViews: maxViewsValue,
        allowDownload,
        password: isPasswordProtected ? password : undefined,
      });
      
      const fullUrl = `${window.location.origin}/share/${result.token}`;
      setShareLink(fullUrl);
      setShareLinkId(result.id);
      setExternalStep("result");
    } catch (error) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la création du lien"
      });
    } finally {
      setIsCreatingLink(false);
    }
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
                      onClick={() => setMode("external")}
                      className="group p-6 bg-black/5 hover:bg-black/10 rounded-2xl border border-black/10 hover:border-black/20 transition-all text-left"
                    >
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

              {/* Mode: External - Rules Step - Grid Layout */}
              {mode === "external" && externalStep === "rules" && (
                <motion.div
                  key="external-rules"
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
                    <h3 className="text-lg font-medium text-black mb-1">Contrôle du partage</h3>
                    <p className="text-xs text-black/30 font-medium">Règles globales pour tous les fichiers</p>
                  </div>

                  {/* Grid Layout for Rules */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Download */}
                    <div 
                      onClick={() => setAllowDownload(!allowDownload)}
                      className="p-5 bg-white rounded-2xl border border-black/[0.03] hover:border-black/10 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          allowDownload ? "bg-black text-white" : "bg-black/[0.03] text-black/20"
                        }`}>
                          <Download className="w-5 h-5" />
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${
                          allowDownload ? "bg-black" : "bg-black/10"
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                            allowDownload ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-black mb-0.5">Téléchargement</p>
                      <p className="text-[11px] text-black/35 font-medium">Par défaut</p>
                    </div>

                    {/* Max Views */}
                    <div className="p-5 bg-white rounded-2xl border border-black/[0.03] hover:border-black/10 hover:shadow-sm transition-all">
                      <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center text-black/25 mb-4">
                        <Eye className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium text-black mb-3">Limite de vues</p>
                      <div className="relative h-10">
                        {!maxViews && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                            <span className="text-3xl text-black/15 font-extralight tracking-tight">∞</span>
                          </div>
                        )}
                        <input 
                          type="number" 
                          placeholder="" 
                          value={maxViews}
                          min="0"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || (parseInt(val) >= 0)) {
                              setMaxViews(val);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                              e.preventDefault();
                            }
                          }}
                          className="w-full h-full px-3 bg-transparent border-none rounded-lg text-sm text-center font-medium outline-none focus:ring-1 focus:ring-black/5 transition-all relative z-10" 
                        />
                      </div>
                    </div>

                    {/* Expiration */}
                    <div className="p-5 bg-white rounded-2xl border border-black/[0.03] hover:border-black/10 hover:shadow-sm transition-all">
                      <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center text-black/25 mb-4">
                        <Clock className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium text-black mb-3">Expiration</p>
                      <div className="flex items-center gap-2 bg-black/[0.02] rounded-xl px-3 py-2.5 border border-transparent focus-within:bg-white focus-within:border-black/5 transition-all">
                        <input 
                          type="number" 
                          value={expiryDays}
                          onChange={(e) => setExpiryDays(e.target.value)}
                          className="w-14 bg-transparent border-none text-sm text-center font-medium outline-none" 
                        />
                        <span className="text-[11px] font-medium text-black/30">jours</span>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="p-5 bg-white rounded-2xl border border-black/[0.03] hover:border-black/10 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isPasswordProtected ? "bg-brand-primary/10 text-brand-primary" : "bg-black/[0.03] text-black/20"
                        }`}>
                          <Lock className="w-5 h-5" />
                        </div>
                        <div 
                          onClick={() => setIsPasswordProtected(!isPasswordProtected)}
                          className={`w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${
                            isPasswordProtected ? "bg-brand-primary" : "bg-black/10"
                          }`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                            isPasswordProtected ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-black mb-0.5">Mot de passe</p>
                      <p className="text-[11px] text-black/35 font-medium">Protection</p>
                    </div>
                  </div>

                  {/* Password Input - Full Width */}
                  {isPasswordProtected && (
                    <motion.input 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      type="password" 
                      placeholder="Mot de passe secret..." 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black/[0.02] border border-black/[0.03] rounded-xl text-sm outline-none focus:bg-white focus:border-black/10 focus:ring-1 focus:ring-black/5 transition-all" 
                    />
                  )}

                  <button 
                    onClick={handleCreatePublicLink}
                    disabled={isCreatingLink}
                    className="w-full h-12 bg-black text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-xl shadow-black/10 hover:bg-black/90 active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
                  >
                    {isCreatingLink ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Générer le lien de partage
                      </>
                    )}
                  </button>
                </motion.div>
              )}


              {/* Mode: External - Result Step */}
              {mode === "external" && externalStep === "result" && shareLink && (
                <motion.div
                  key="external-result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl"
                    >
                      <ShieldCheck className="w-8 h-8" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-medium text-black mb-1">Lien créé</h3>
                      <p className="text-xs text-black/40 font-medium">
                        Prêt à être partagé
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] block">
                      Lien sécurisé
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-black/5 rounded-xl border border-black/10">
                      <input 
                        readOnly 
                        value={shareLink} 
                        className="flex-1 bg-transparent border-none text-xs font-medium text-black outline-none select-all"
                      />
                      <button 
                        onClick={copyToClipboard}
                        className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-black/5 active:scale-90 transition-all border border-black/[0.05] shadow-sm"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-black/40" />
                        )}
                      </button>
                    </div>
                  </div>

                    <button 
                      onClick={onClose}
                    className="w-full py-2.5 bg-black text-white rounded-xl font-medium text-xs hover:bg-black/90 transition-all"
                    >
                      Terminé
                    </button>
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
