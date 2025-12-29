"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Lock, Calendar, Eye, ShieldCheck, FolderOpen, ChevronRight, FileText, LockKeyhole, FolderLock, ShieldEllipsis } from "lucide-react";

export function InteractiveDemo() {
  const [allowDownload, setAllowDownload] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [expiry, setExpiry] = useState(7);

  return (
    <section className="py-32 bg-apple-gray/30 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        
        {/* Texte */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Un lien qui <br /> se plie à vos règles.
          </h2>
          <p className="text-apple-secondary text-xl font-medium max-w-lg opacity-70 font-medium">
            Ajustez les accès même après l'envoi. Le lien s'adapte instantanément côté destinataire.
          </p>
          
          {/* Toggles Interactifs */}
          <div className="space-y-4 max-w-sm mx-auto lg:mx-0">
            <div className="flex items-center justify-between p-5 bg-white rounded-3xl border border-black/[0.03] shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => setAllowDownload(!allowDownload)}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-colors ${allowDownload ? 'bg-apple-primary text-white' : 'bg-apple-gray text-apple-secondary opacity-40'}`}>
                  <Download className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest opacity-70">Download</span>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${allowDownload ? 'bg-apple-primary' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${allowDownload ? 'left-7' : 'left-1'}`} />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-5 bg-white rounded-3xl border border-black/[0.03] shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => setIsLocked(!isLocked)}>
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-colors ${isLocked ? 'bg-apple-primary text-white' : 'bg-apple-gray text-apple-secondary opacity-40'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest opacity-70">Mot de passe</span>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${isLocked ? 'bg-apple-primary' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isLocked ? 'left-7' : 'left-1'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Mockup Interactif (Le lien) */}
        <div className="relative flex-1 w-full max-w-lg perspective-1000">
          <motion.div 
            animate={{ 
              rotateY: isLocked ? 8 : 0,
              scale: isLocked ? 0.98 : 1
            }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white p-10 rounded-[56px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-black/[0.02] relative z-10 overflow-hidden"
          >
            {/* Folder Header */}
            <div className="flex items-center gap-5 mb-12">
              <div className="w-16 h-16 bg-apple-primary rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-apple-primary/30">
                <FolderOpen className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-xl tracking-tight">📁 Dossier_Souverain</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-apple-secondary uppercase tracking-widest mt-1 opacity-40">
                  {allowDownload ? 'Accès complet autorisé' : 'Consultation seule'} • {expiry}j restants
                </div>
              </div>
            </div>

            <div className="relative min-h-[300px]">
              <AnimatePresence mode="wait">
                {isLocked ? (
                  <motion.div 
                    key="locked"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-8"
                  >
                    <div className="w-24 h-24 bg-apple-primary/[0.03] rounded-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-apple-primary opacity-[0.05] blur-xl rounded-full animate-pulse" />
                      <LockKeyhole className="w-12 h-12 text-apple-primary" />
                    </div>
                    <div className="text-center space-y-3">
                      <h5 className="text-xl font-bold tracking-tight">Accès Verrouillé</h5>
                      <p className="text-[11px] text-apple-secondary uppercase tracking-[0.2em] font-bold opacity-40 px-10 leading-relaxed">
                        Ce dossier nécessite un code d'accès sécurisé pour être consulté.
                      </p>
                    </div>
                    <div className="w-full space-y-4 px-4">
                      <div className="h-14 bg-apple-gray rounded-2xl w-full border border-black/[0.03] shadow-inner flex items-center justify-center">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-black/10 shadow-sm" />)}
                        </div>
                      </div>
                      <div className="h-14 bg-apple-primary rounded-2xl w-full shadow-xl shadow-apple-primary/20 flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                        Déverrouiller
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="unlocked"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="space-y-4"
                  >
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-apple-gray/30 rounded-[28px] border border-black/[0.01] hover:bg-white hover:shadow-xl transition-all duration-500 group/file">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white rounded-2xl border border-black/5 shadow-sm flex items-center justify-center group-hover/file:scale-110 transition-transform duration-500 text-apple-primary/40 group-hover/file:text-apple-primary transition-colors">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="w-32 h-2.5 bg-black/10 rounded-full" />
                            <div className="w-20 h-1.5 bg-black/5 rounded-full" />
                          </div>
                        </div>
                        {allowDownload ? (
                          <div className="p-3 bg-apple-primary text-white rounded-2xl shadow-lg shadow-apple-primary/20 scale-100 group-hover/file:scale-110 transition-transform duration-500">
                            <Download className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="p-3 bg-apple-gray text-apple-secondary opacity-20 rounded-2xl transition-all duration-500">
                            <Eye className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-16 pt-8 border-t border-black/[0.03] flex items-center justify-center gap-3 opacity-30">
              <ShieldCheck className="w-5 h-5 text-apple-primary" />
              <span className="text-[10px] font-bold text-apple-secondary uppercase tracking-[0.3em]">End-to-End Encrypted</span>
            </div>
          </motion.div>
          
          {/* Effets de fond stylisés */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-apple-primary opacity-[0.03] blur-[120px] rounded-full -z-10" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-apple-primary opacity-[0.03] blur-[120px] rounded-full -z-10" />
        </div>

      </div>
    </section>
  );
}
