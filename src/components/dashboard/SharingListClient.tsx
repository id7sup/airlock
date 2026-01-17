"use client";

import { useState, useEffect, useRef } from "react";
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
  CircleDot,
  Globe,
  ChevronDown,
  RotateCcw,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SharingAnalyticsChart } from "./SharingAnalyticsChart";
import { MapboxGlobe } from "./MapboxGlobe";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { revokeShareLinkAction, reactivateShareLinkAction, deleteShareLinkAction } from "@/lib/actions/sharing";
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
  isRevoked?: boolean;
}

export default function SharingListClient({ initialLinks }: { initialLinks: SharedLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [activeTab, setActiveTab] = useState<"list" | "live">("list");
  const [selectedLinkId, setSelectedLinkId] = useState<string | "all">("all");
  const [geolocationAnalytics, setGeolocationAnalytics] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
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
      message: `Le lien de partage "${link?.folderName}" sera immédiatement désactivé et ne pourra plus être utilisé. Vous pourrez le réactiver plus tard.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          await revokeShareLinkAction(id);
          setLinks(links.map(l => l.id === id ? { ...l, isRevoked: true } : l));
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

  const handleReactivate = async (id: string) => {
    const link = links.find(l => l.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Réactiver ce lien ?",
      message: `Le lien de partage "${link?.folderName}" sera réactivé et pourra à nouveau être utilisé.`,
      isDestructive: false,
      onConfirm: async () => {
        try {
          await reactivateShareLinkAction(id);
          setLinks(links.map(l => l.id === id ? { ...l, isRevoked: false } : l));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          setErrorModal({
            isOpen: true,
            title: "Erreur",
            message: "Erreur lors de la réactivation"
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    const link = links.find(l => l.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Supprimer définitivement ce lien ?",
      message: `Le lien de partage "${link?.folderName}" sera définitivement supprimé ainsi que toutes ses données d'analytics. Cette action est irréversible.`,
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteShareLinkAction(id);
          // Mettre à jour la liste localement
          setLinks(links.filter(l => l.id !== id));
        } catch (error: any) {
          setErrorModal({
            isOpen: true,
            title: "Erreur",
            message: error?.message || "Erreur lors de la suppression du lien. Veuillez réessayer."
          });
        }
      }
    });
  };

  // Charger les analytics de géolocalisation quand l'onglet "live" est actif
  useEffect(() => {
    if (activeTab === "live") {
      const fetchGeolocationAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
          const url = selectedLinkId === "all" 
            ? "/api/analytics/geolocation?days=30"
            : `/api/analytics/geolocation?days=30&linkId=${selectedLinkId}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            setGeolocationAnalytics(data.analytics || []);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des analytics:", error);
        } finally {
          setLoadingAnalytics(false);
        }
      };

      fetchGeolocationAnalytics();
      
      // Rafraîchir toutes les 2 minutes (réduire les chargements)
      const interval = setInterval(fetchGeolocationAnalytics, 120000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedLinkId]);

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

      {/* Onglets */}
      <div className="mb-8 flex gap-2 border-b border-black/[0.05]">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all relative ${
            activeTab === "list"
              ? "text-black"
              : "text-black/40 hover:text-black/60"
          }`}
        >
          <div className="flex items-center gap-2">
            <LayoutList className="w-4 h-4" />
            <span>Liste</span>
          </div>
          {activeTab === "list" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all relative ${
            activeTab === "live"
              ? "text-black"
              : "text-black/40 hover:text-black/60"
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Suivi en direct</span>
          </div>
          {activeTab === "live" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "list" ? (
        /* Liste Simple - Cliquable vers page dédiée */
        <div className="space-y-4">
          {links.length === 0 ? (
            <div className="py-32 text-center bg-[#f5f5f7] rounded-2xl border border-black/5">
              <FolderOpen className="w-16 h-16 text-black/10 mx-auto mb-4" />
              <p className="text-lg font-medium text-black/30">Aucun partage actif</p>
            </div>
          ) : (
            links.map((link) => (
              <LinkItem
                key={link.id}
                link={link}
                onRevoke={handleRevoke}
                onReactivate={handleReactivate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      ) : (
        /* Vue en direct - Uniquement le globe */
        <div className="space-y-8 -mt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-medium tracking-tight text-black">Statistiques en direct</h2>
              <p className="text-sm text-black/40 font-medium">
                Visualisation géographique en temps réel
              </p>
            </div>
            <div className="flex items-center gap-3">
              {loadingAnalytics && (
                <Loader2 className="w-5 h-5 text-black/40 animate-spin" />
              )}
              
              {/* Dropdown personnalisé - Menu séparé en position absolue */}
              <div className="relative" ref={dropdownRef}>
                {/* Bouton principal */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-5 py-3 bg-white border border-black/[0.08] text-black rounded-2xl text-sm font-medium hover:bg-black/5 hover:border-black/15 transition-all duration-200 shadow-sm hover:shadow-md min-w-[220px] justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderOpen className="w-4 h-4 text-brand-primary" />
                    <span className="truncate font-medium">
                      {selectedLinkId === "all" 
                        ? "Tous les partages" 
                        : links.find(l => l.id === selectedLinkId)?.folderName || "Sélectionner"}
                    </span>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-black/40 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Menu qui se déroule en position absolue */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      {/* Overlay pour fermer au clic extérieur */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsDropdownOpen(false)}
                        className="fixed inset-0 z-10"
                      />
                      
                      {/* Menu dropdown séparé avec effet de déroulement */}
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 z-20 bg-white rounded-2xl border border-black/[0.08] shadow-2xl shadow-black/10 overflow-hidden w-full min-w-[220px]"
                      >
                        <div className="py-1.5">
                          {/* Option "Tous les partages" */}
                          <button
                            onClick={() => {
                              setSelectedLinkId("all");
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-black/5 transition-colors group ${
                              selectedLinkId === "all" ? "bg-black/5" : ""
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              selectedLinkId === "all" 
                                ? "border-black bg-black" 
                                : "border-black/20 group-hover:border-black/40"
                            }`}>
                              {selectedLinkId === "all" && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-black">
                                Tous les partages
                              </div>
                            </div>
                          </button>

                          {/* Séparateur */}
                          {links.length > 0 && (
                            <div className="h-px bg-black/[0.05] my-1 mx-5" />
                          )}

                          {/* Options pour chaque partage */}
                          {links.map((link) => (
                            <button
                              key={link.id}
                              onClick={() => {
                                setSelectedLinkId(link.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-black/5 transition-colors group ${
                                selectedLinkId === link.id ? "bg-black/5" : ""
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                selectedLinkId === link.id 
                                  ? "border-black bg-black" 
                                  : "border-black/20 group-hover:border-black/40"
                              }`}>
                                {selectedLinkId === link.id && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <FolderOpen className="w-4 h-4 text-brand-primary flex-shrink-0" />
                                <span className="text-sm font-medium text-black truncate">
                                  {link.folderName}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Globe terrestre uniquement */}
          <div className="h-[600px] w-full -mx-10">
            {loadingAnalytics ? (
              <div className="h-full flex items-center justify-center bg-transparent">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chargement des données...</p>
                </div>
              </div>
            ) : (
              <MapboxGlobe analytics={geolocationAnalytics} />
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
      />
    </div>
  );
}

function LinkItem({ 
  link, 
  onRevoke, 
  onReactivate, 
  onDelete 
}: { 
  link: SharedLink; 
  onRevoke: (id: string) => void;
  onReactivate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const isRevoked = link.isRevoked === true;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  return (
    <div
      className="bg-white rounded-2xl border border-black/[0.05] p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/sharing/${link.id}`}
          className="flex items-center gap-4 flex-1 min-w-0"
        >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary/20">
            <FolderOpen className="w-6 h-6 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium tracking-tight truncate text-black group-hover:text-brand-primary transition-colors">
                {link.folderName}
              </h3>
              {isRevoked && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100">
                  Révoqué
                </span>
              )}
            </div>
            <p className="text-xs text-black/40 mt-1" suppressHydrationWarning>
              Créé le {new Date(link.createdAt).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-6 ml-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1">Vues</p>
            <p className="text-2xl font-medium tabular-nums text-black">{link.viewCount || 0}</p>
          </div>
          <div className="text-right border-l border-black/[0.05] pl-6">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1">Downloads</p>
            <p className="text-2xl font-medium tabular-nums text-brand-primary">{link.downloadCount || 0}</p>
          </div>
          <div className="relative" ref={actionsRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 rounded-xl hover:bg-black/5 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-black/40" />
            </button>
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-black/[0.08] shadow-xl z-50 min-w-[200px]"
                >
                  <Link
                    href={`/dashboard/sharing/${link.id}`}
                    className="block px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black"
                    onClick={() => setShowActions(false)}
                  >
                    Voir les détails
                  </Link>
                  {isRevoked ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowActions(false);
                        onReactivate(link.id);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Réactiver
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowActions(false);
                        onRevoke(link.id);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Révoquer
                    </button>
                  )}
                  <div className="h-px bg-black/[0.05] my-1" />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowActions(false);
                      onDelete(link.id);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors text-sm font-medium text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
