"use client";

import { useState } from "react";
import { 
  FolderOpen, 
  Eye, 
  Download, 
  Trash2, 
  Clock, 
  LayoutList, 
  ExternalLink, 
  Calendar,
  Lock,
  ChevronRight,
  Loader2,
  CalendarClock,
  Check,
  X as CloseIcon,
  CircleDot
} from "lucide-react";
import { SharingAnalyticsChart } from "./SharingAnalyticsChart";
import { revokeShareLinkAction } from "@/lib/actions/sharing";
import { updateShareLinkAction } from "@/lib/actions/sharing_update";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ErrorModal } from "@/components/shared/ErrorModal";
import Link from "next/link";

interface SharedLink {
  id: string;
  token: string;
  folderId: string;
  folderName: string;
  viewCount: number;
  downloadCount: number;
  allowDownload: boolean;
  maxViews: number | null;
  expiresAt: string | null;
  createdAt: string;
  analytics: any[];
}

export default function SharingListClient({ initialLinks }: { initialLinks: SharedLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ id: string, type: 'views' | 'expiry' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDestructive: true
  });
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: ""
  });

  const handleToggleDownload = async (link: SharedLink) => {
    setUpdatingId(link.id);
    try {
      await updateShareLinkAction(link.id, { allowDownload: !link.allowDownload });
      setLinks(links.map(l => l.id === link.id ? { ...l, allowDownload: !link.allowDownload } : l));
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la mise à jour"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateExpiry = async (id: string, dateStr: string) => {
    if (!dateStr) {
      setEditingField(null);
      return;
    }
    setUpdatingId(id);
    setEditingField(null);
    try {
      const newDate = new Date(dateStr);
      await updateShareLinkAction(id, { expiresAt: newDate });
      setLinks(links.map(l => l.id === id ? { ...l, expiresAt: newDate.toISOString() } : l));
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la mise à jour de l'expiration"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateMaxViews = async (id: string, valStr: string) => {
    setUpdatingId(id);
    setEditingField(null);
    try {
      const trimmed = valStr.trim();
      if (trimmed === "") {
        await updateShareLinkAction(id, { maxViews: null });
        setLinks(links.map(l => l.id === id ? { ...l, maxViews: null } : l));
        return;
      }
      
      const val = parseInt(trimmed);
      // Validation : empêcher les valeurs négatives
      if (isNaN(val) || val < 0) {
        setErrorModal({
          isOpen: true,
          title: "Erreur de validation",
          message: "Le quota de vues ne peut pas être négatif"
        });
        setUpdatingId(null);
        return;
      }
      
      await updateShareLinkAction(id, { maxViews: val });
      setLinks(links.map(l => l.id === id ? { ...l, maxViews: val } : l));
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la mise à jour du quota"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRevoke = async (id: string) => {
    const link = links.find(l => l.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Révoquer ce lien ?",
      message: `Le lien de partage "${link?.folderName}" sera immédiatement désactivé et ne pourra plus être utilisé.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          await revokeShareLinkAction(id);
          setLinks(links.filter(l => l.id !== id));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          setErrorModal({
            isOpen: true,
            title: "Erreur",
            message: "Erreur lors de la révocation"
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="p-10 max-w-6xl mx-auto animate-in fade-in duration-1000 text-black">
      {/* Page Header Simplifié */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-medium tracking-tight">Flux de Partage</h1>
          <p className="text-black/40 text-base font-medium">Gestion granulaire et analytics en direct.</p>
        </div>
        
        <div className="flex gap-4 p-2 bg-[#f5f5f7] rounded-[24px] border border-black/[0.03]">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-black/[0.01] flex flex-col items-center min-w-[100px]">
            <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest mb-1">Actifs</p>
            <p className="text-2xl font-medium tabular-nums">{links.length}</p>
          </div>
          <div className="bg-black px-6 py-3 rounded-2xl shadow-lg shadow-black/20 flex flex-col items-center min-w-[100px]">
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Total Vues</p>
            <p className="text-2xl font-medium text-white tabular-nums">{links.reduce((acc, curr) => acc + (curr.viewCount || 0), 0)}</p>
          </div>
        </div>
      </div>

      {/* Liste Compacte */}
      <div className="grid grid-cols-1 gap-10">
        {links.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-[#f5f5f7] rounded-2xl border border-black/5">
            <FolderOpen className="w-16 h-16 text-black/10 mx-auto mb-4" />
            <p className="text-lg font-medium text-black/30">Aucun partage actif</p>
          </div>
        ) : (
          links.map((link) => (
            <div key={link.id} className="relative group">
              <div className="bg-white rounded-2xl border border-black/[0.05] overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-black/5">
                  {updatingId === link.id && (
                    <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                      <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-black/[0.03]">
                    {/* Left Side: Identity & Controls */}
                    <div className="md:w-[420px] p-10 flex flex-col justify-between bg-gradient-to-br from-white to-[#fbfbfd]">
                      <div className="space-y-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-black rounded-[22px] flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-500">
                            <FolderOpen className="w-7 h-7 text-white fill-current" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-medium tracking-tight truncate text-black">{link.folderName}</h3>
                            <p className="text-[11px] font-bold text-black/20 uppercase tracking-widest mt-1" suppressHydrationWarning>
                              Généré le {new Date(link.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Control: Download */}
                          <div className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-3xl group/item transition-colors hover:bg-white border border-transparent hover:border-black/5">
                            <div className="flex items-center gap-4">
                              <Download className={`w-5 h-5 ${link.allowDownload ? "text-brand-primary" : "text-black/20"}`} />
                              <span className="text-[12px] font-bold text-black/40 uppercase tracking-widest">Téléchargement</span>
                            </div>
                            <button 
                              onClick={() => handleToggleDownload(link)}
                              className={`text-[11px] font-bold px-4 py-1.5 rounded-full transition-all ${link.allowDownload ? "bg-black text-white shadow-md shadow-black/20" : "bg-white text-black/40 border border-black/5"}`}
                            >
                              {link.allowDownload ? "ACTIF" : "BLOQUÉ"}
                            </button>
                          </div>

                          {/* Control: Max Views */}
                          <div className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-3xl group/item transition-colors hover:bg-white border border-transparent hover:border-black/5">
                            <div className="flex items-center gap-4">
                              <Eye className="w-5 h-5 text-black/40" />
                              <span className="text-[12px] font-bold text-black/40 uppercase tracking-widest">Quota de Vues</span>
                            </div>
                            {editingField?.id === link.id && editingField?.type === 'views' ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  autoFocus
                                  type="number"
                                  min="0"
                                  placeholder="∞"
                                  defaultValue={link.maxViews || ""}
                                  onBlur={(e) => handleUpdateMaxViews(link.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateMaxViews(link.id, (e.target as HTMLInputElement).value);
                                    }
                                    // Empêcher la saisie de signe moins
                                    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e) => {
                                    // Empêcher les valeurs négatives en temps réel
                                    const val = e.target.value;
                                    if (val !== "" && parseInt(val) < 0) {
                                      e.target.value = "0";
                                    }
                                  }}
                                  className="w-20 text-center text-[12px] font-bold bg-white border-2 border-brand-primary rounded-full py-1.5 outline-none"
                                />
                                <button onClick={() => setEditingField(null)} className="p-1 hover:text-red-500 transition-colors">
                                  <CloseIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setEditingField({ id: link.id, type: 'views' })}
                                className="text-[12px] font-bold tabular-nums bg-white px-5 py-2 rounded-full border border-black/5 hover:bg-black hover:text-white transition-all shadow-sm"
                              >
                                {link.maxViews ? `${link.viewCount}/${link.maxViews}` : "Illimité"}
                              </button>
                            )}
                          </div>

                          {/* Control: Expiry */}
                          <div className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-3xl group/item transition-colors hover:bg-white border border-transparent hover:border-black/5">
                            <div className="flex items-center gap-4">
                              <Clock className="w-5 h-5 text-black/40" />
                              <span className="text-[12px] font-bold text-black/40 uppercase tracking-widest">Expiration</span>
                            </div>
                            {editingField?.id === link.id && editingField?.type === 'expiry' ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  autoFocus
                                  type="date"
                                  onChange={(e) => handleUpdateExpiry(link.id, e.target.value)}
                                  onBlur={(e) => !e.target.value && setEditingField(null)}
                                  className="text-[12px] font-bold bg-white border-2 border-brand-primary rounded-2xl px-3 py-1.5 outline-none cursor-pointer"
                                />
                                <button onClick={() => setEditingField(null)} className="p-1 hover:text-red-500 transition-colors">
                                  <CloseIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setEditingField({ id: link.id, type: 'expiry' })}
                                className="text-[12px] font-bold bg-white px-5 py-2 rounded-full border border-black/5 hover:bg-black hover:text-white transition-all shadow-sm"
                                suppressHydrationWarning
                              >
                                {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : "Illimitée"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-10 pt-8 border-t border-black/[0.03]">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#B7C5A9]/10 rounded-full border border-[#B7C5A9]/20 shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                          <span className="text-[10px] font-bold text-[#96A982] uppercase tracking-[0.2em]">Sécurisé</span>
                        </div>
                        <div className="flex gap-3">
                          <Link 
                            href={`/share/${link.token}`} 
                            target="_blank" 
                            className="w-11 h-11 bg-[#f5f5f7] hover:bg-black hover:text-white flex items-center justify-center rounded-2xl transition-all active:scale-90"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleRevoke(link.id)} 
                            className="w-11 h-11 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center rounded-2xl transition-all active:scale-90"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Analytics */}
                    <div className="flex-1 p-10 bg-white/40">
                      <div className="flex items-center justify-between mb-10 px-2">
                        <div className="flex items-center gap-3">
                          <LayoutList className="w-5 h-5 text-black/20" />
                          <span className="text-[11px] font-bold text-black/20 uppercase tracking-[0.2em]">Statistiques</span>
                        </div>
                        <div className="flex gap-12">
                          <div className="text-right space-y-1">
                            <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest block">Vues</span>
                            <span className="text-4xl font-medium tabular-nums leading-none tracking-tighter text-black">{link.viewCount || 0}</span>
                          </div>
                          <div className="text-right space-y-1 border-l border-black/[0.05] pl-12">
                            <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest block">Downloads</span>
                            <span className="text-4xl font-medium tabular-nums text-brand-primary leading-none tracking-tighter">{link.downloadCount || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-56 -mx-2">
                        <SharingAnalyticsChart data={link.analytics} />
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
      />
    </div>
  );
}
