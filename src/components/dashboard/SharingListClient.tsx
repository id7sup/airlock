"use client";

import { useState, useEffect } from "react";
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
  Globe
} from "lucide-react";
import { SharingAnalyticsChart } from "./SharingAnalyticsChart";
import { MapboxGlobe } from "./MapboxGlobe";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
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
  const [activeTab, setActiveTab] = useState<"list" | "live">("list");
  const [selectedLinkId, setSelectedLinkId] = useState<string | "all">("all");
  const [geolocationAnalytics, setGeolocationAnalytics] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  
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
              <Link
                key={link.id}
                href={`/dashboard/sharing/${link.id}`}
                className="block bg-white rounded-2xl border border-black/[0.05] p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary/20">
                      <FolderOpen className="w-6 h-6 fill-current" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-medium tracking-tight truncate text-black group-hover:text-brand-primary transition-colors">
                        {link.folderName}
                      </h3>
                      <p className="text-xs text-black/40 mt-1" suppressHydrationWarning>
                        Créé le {new Date(link.createdAt).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 ml-6">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1">Vues</p>
                      <p className="text-2xl font-medium tabular-nums text-black">{link.viewCount || 0}</p>
                    </div>
                    <div className="text-right border-l border-black/[0.05] pl-8">
                      <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1">Downloads</p>
                      <p className="text-2xl font-medium tabular-nums text-brand-primary">{link.downloadCount || 0}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-black/20 group-hover:text-black group-hover:translate-x-1 transition-all ml-4" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        /* Vue en direct - Uniquement le globe */
        <div className="space-y-8 -mt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div>
              <h2 className="text-2xl font-medium tracking-tight mb-1">Suivi en direct</h2>
              <p className="text-sm text-black/40 font-medium">
                Visualisation géographique en temps réel
              </p>
            </div>
            <div className="flex items-center gap-3">
              {loadingAnalytics && (
                <Loader2 className="w-5 h-5 text-black/40 animate-spin" />
              )}
              <select
                value={selectedLinkId}
                onChange={(e) => setSelectedLinkId(e.target.value)}
                className="px-4 py-2.5 bg-white border border-black/[0.08] rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/10 transition-all hover:border-black/15 shadow-sm"
              >
                <option value="all">Tous les partages</option>
                {links.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.folderName}
                  </option>
                ))}
              </select>
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
