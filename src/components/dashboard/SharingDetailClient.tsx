"use client";

import { useState, useEffect } from "react";
import { 
  FolderOpen, 
  Eye, 
  Download, 
  Trash2, 
  Clock, 
  ExternalLink, 
  ChevronLeft,
  Loader2,
  X as CloseIcon,
  Shield,
  AlertTriangle,
  Users,
  Share2,
  Network,
  Server,
  Copy,
  CheckCircle2
} from "lucide-react";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { revokeShareLinkAction } from "@/lib/actions/sharing";
import { updateShareLinkAction } from "@/lib/actions/sharing_update";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ErrorModal } from "@/components/shared/ErrorModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  isRevoked: boolean;
  analytics: any[];
}

interface ExtendedStats {
  invalidAttempts: number;
  totalVPN: number;
  totalDatacenter: number;
  ipChanges: number;
  deviceChanges: number;
  recipientCount: number;
  reshares: number;
  topLinks: Array<{ linkId: string; count: number }>;
  topFolders: Array<{ folderId: string; count: number }>;
  topFiles: Array<{ fileId: string; fileName: string; count: number }>;
}

export default function SharingDetailClient({ link }: { link: SharedLink }) {
  const router = useRouter();
  const [linkData, setLinkData] = useState(link);
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingField, setEditingField] = useState<{ type: 'views' | 'expiry' } | null>(null);
  const [copied, setCopied] = useState(false);
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

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${linkData.token}` : '';

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Charger les statistiques étendues
  useEffect(() => {
    const fetchExtendedStats = async () => {
      setLoadingStats(true);
      try {
        const response = await fetch(`/api/analytics/stats?days=30&linkId=${link.id}`);
        if (response.ok) {
          const data = await response.json();
          const analyticsResponse = await fetch(`/api/analytics/geolocation?days=30&linkId=${link.id}`);
          const analyticsData = analyticsResponse.ok ? await analyticsResponse.json() : { analytics: [] };
          
          const analytics = analyticsData.analytics || [];
          const invalidAttempts = analytics.filter((a: any) => a.invalidAttempt === true).length;
          const totalVPN = analytics.filter((a: any) => a.isVPN === true).length;
          const totalDatacenter = analytics.filter((a: any) => a.isDatacenter === true).length;
          const ipChanges = analytics.filter((a: any) => a.ipChanged === true).length;
          const deviceChanges = analytics.filter((a: any) => a.deviceChanged === true).length;
          
          const linkCounts: Record<string, number> = {};
          const folderCounts: Record<string, number> = {};
          const fileCounts: Record<string, { count: number; fileName: string }> = {};
          
          analytics.forEach((a: any) => {
            if (a.linkId) linkCounts[a.linkId] = (linkCounts[a.linkId] || 0) + 1;
            if (a.folderId) folderCounts[a.folderId] = (folderCounts[a.folderId] || 0) + 1;
            if (a.fileId) {
              if (!fileCounts[a.fileId]) {
                fileCounts[a.fileId] = { count: 0, fileName: a.fileName || a.fileId };
              }
              fileCounts[a.fileId].count++;
            }
          });

          setStats({
            invalidAttempts,
            totalVPN,
            totalDatacenter,
            ipChanges,
            deviceChanges,
            recipientCount: analytics.reduce((sum: number, a: any) => sum + (a.recipientCount || 0), 0),
            reshares: analytics.filter((a: any) => a.isReshare === true).length,
            topLinks: Object.entries(linkCounts)
              .map(([linkId, count]) => ({ linkId, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10),
            topFolders: Object.entries(folderCounts)
              .map(([folderId, count]) => ({ folderId, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10),
            topFiles: Object.entries(fileCounts)
              .map(([fileId, data]) => ({ fileId, fileName: data.fileName, count: data.count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10),
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchExtendedStats();
  }, [link.id]);

  const handleToggleDownload = async () => {
    setUpdating(true);
    try {
      await updateShareLinkAction(linkData.id, { allowDownload: !linkData.allowDownload });
      setLinkData({ ...linkData, allowDownload: !linkData.allowDownload });
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la mise à jour"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateExpiry = async (dateStr: string) => {
    if (!dateStr) {
      setEditingField(null);
      return;
    }
    setUpdating(true);
    setEditingField(null);
    try {
      const newDate = new Date(dateStr);
      await updateShareLinkAction(linkData.id, { expiresAt: newDate });
      setLinkData({ ...linkData, expiresAt: newDate.toISOString() });
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la mise à jour de l'expiration"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateMaxViews = async (valStr: string) => {
    setUpdating(true);
    setEditingField(null);
    try {
      const trimmed = valStr.trim();
      if (trimmed === "") {
        await updateShareLinkAction(linkData.id, { maxViews: null });
        setLinkData({ ...linkData, maxViews: null });
        return;
      }
      
      const val = parseInt(trimmed);
      if (isNaN(val) || val < 0) {
        setErrorModal({
          isOpen: true,
          title: "Erreur de validation",
          message: "Le quota de vues ne peut pas être négatif"
        });
        setUpdating(false);
        return;
      }
      
      await updateShareLinkAction(linkData.id, { maxViews: val });
      setLinkData({ ...linkData, maxViews: val });
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la mise à jour du quota"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRevoke = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Révoquer ce lien ?",
      message: `Le lien de partage "${linkData.folderName}" sera immédiatement désactivé et ne pourra plus être utilisé.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          await revokeShareLinkAction(linkData.id);
          router.push("/dashboard/sharing");
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
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-[1800px] mx-auto px-8 py-12">
        {/* Header élégant */}
        <div className="mb-16">
          <Link
            href="/dashboard/sharing"
            className="inline-flex items-center gap-2 text-black/50 hover:text-black transition-colors mb-10 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          
          <div className="flex items-start justify-between gap-12 mb-12">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-black to-black/80 rounded-3xl flex items-center justify-center shadow-xl">
                  <FolderOpen className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-6xl font-light tracking-tight text-black mb-3">{linkData.folderName}</h1>
                  <p className="text-lg text-black/40 font-medium">
                    Créé le {new Date(linkData.createdAt).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              {/* Lien de partage */}
              <div className="flex items-center gap-4 bg-white rounded-3xl border border-black/[0.05] p-5 max-w-2xl shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-black/30 uppercase tracking-widest mb-2">Lien de partage</p>
                  <p className="text-sm font-mono text-black/60 truncate">{shareUrl}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-black/90 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link 
                href={`/share/${linkData.token}`} 
                target="_blank" 
                className="px-6 py-3 bg-white border border-black/[0.08] rounded-2xl hover:bg-black hover:text-white transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ouvrir</span>
              </Link>
              <button 
                onClick={handleRevoke} 
                className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                <span>Révoquer</span>
              </button>
            </div>
          </div>
        </div>

        {updating && (
          <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-black/[0.05]">
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Sidebar - Contrôles et sécurité */}
          <div className="xl:col-span-3 space-y-8">
            {/* Centre de contrôle */}
            <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm">
              <h2 className="text-xl font-medium mb-8 text-black">Contrôles</h2>
              
              <div className="space-y-4">
                {/* Téléchargement */}
                <div className="group relative">
                  <div className={`flex items-center justify-between p-5 rounded-2xl transition-all ${
                    linkData.allowDownload 
                      ? "bg-brand-primary/5 border-2 border-brand-primary/20" 
                      : "bg-black/[0.02] border-2 border-black/[0.05]"
                  }`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        linkData.allowDownload ? "bg-brand-primary/10" : "bg-black/5"
                      }`}>
                        <Download className={`w-6 h-6 ${linkData.allowDownload ? "text-brand-primary" : "text-black/30"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-black mb-1">Téléchargement</p>
                        <p className="text-sm text-black/50">{linkData.allowDownload ? "Autorisé" : "Bloqué"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleToggleDownload}
                      className={`w-14 h-7 rounded-full transition-all relative shrink-0 ml-4 ${
                        linkData.allowDownload ? "bg-brand-primary" : "bg-black/10"
                      }`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${
                        linkData.allowDownload ? "translate-x-7" : ""
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Quota de vues */}
                <div className="group relative">
                  <div className="flex items-center justify-between p-5 bg-black/[0.02] border-2 border-black/[0.05] rounded-2xl">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center shrink-0">
                        <Eye className="w-6 h-6 text-black/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-black mb-1">Quota de vues</p>
                        <p className="text-sm text-black/50">
                          {linkData.maxViews ? `${linkData.viewCount} / ${linkData.maxViews}` : "Illimité"}
                        </p>
                      </div>
                    </div>
                    {editingField?.type === 'views' ? (
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <input 
                          autoFocus
                          type="number"
                          min="0"
                          placeholder="∞"
                          defaultValue={linkData.maxViews || ""}
                          onBlur={(e) => handleUpdateMaxViews(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateMaxViews((e.target as HTMLInputElement).value);
                            }
                            if (e.key === 'Escape') setEditingField(null);
                          }}
                          className="w-24 text-center text-sm font-medium bg-white border-2 border-brand-primary rounded-xl py-2.5 outline-none"
                        />
                        <button onClick={() => setEditingField(null)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                          <CloseIcon className="w-4 h-4 text-black/40" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setEditingField({ type: 'views' })}
                        className="px-5 py-2.5 bg-white border-2 border-black/10 rounded-xl hover:bg-black hover:text-white hover:border-black transition-all text-sm font-medium shrink-0 ml-4"
                      >
                        Modifier
                      </button>
                    )}
                  </div>
                </div>

                {/* Expiration */}
                <div className="group relative">
                  <div className="flex items-center justify-between p-5 bg-black/[0.02] border-2 border-black/[0.05] rounded-2xl">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-black/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-black mb-1">Expiration</p>
                        <p className="text-sm text-black/50" suppressHydrationWarning>
                          {linkData.expiresAt 
                            ? new Date(linkData.expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                            : "Aucune limite"
                          }
                        </p>
                      </div>
                    </div>
                    {editingField?.type === 'expiry' ? (
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <input 
                          autoFocus
                          type="date"
                          onChange={(e) => handleUpdateExpiry(e.target.value)}
                          onBlur={(e) => !e.target.value && setEditingField(null)}
                          className="text-sm font-medium bg-white border-2 border-brand-primary rounded-xl px-3 py-2.5 outline-none"
                        />
                        <button onClick={() => setEditingField(null)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                          <CloseIcon className="w-4 h-4 text-black/40" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setEditingField({ type: 'expiry' })}
                        className="px-5 py-2.5 bg-white border-2 border-black/10 rounded-xl hover:bg-black hover:text-white hover:border-black transition-all text-sm font-medium shrink-0 ml-4"
                        suppressHydrationWarning
                      >
                        Modifier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sécurité */}
            {stats && (
              <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <Shield className="w-6 h-6 text-black/60" />
                  <h2 className="text-xl font-medium text-black">Sécurité</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-5 bg-red-50/50 border-2 border-red-100 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="text-base font-semibold text-red-900">Tentatives invalides</span>
                      </div>
                      <span className="text-3xl font-bold text-red-700">{stats.invalidAttempts}</span>
                    </div>
                    <p className="text-sm text-red-700/60">Mauvais mot de passe / token expiré</p>
                  </div>
                  
                  <div className="p-5 bg-orange-50/50 border-2 border-orange-100 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-orange-600" />
                        <span className="text-base font-semibold text-orange-900">Datacenter/VPN</span>
                      </div>
                      <span className="text-3xl font-bold text-orange-700">{stats.totalVPN + stats.totalDatacenter}</span>
                    </div>
                    <p className="text-sm text-orange-700/60">Connexions suspectes détectées</p>
                  </div>
                  
                  <div className="p-5 bg-yellow-50/50 border-2 border-yellow-100 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Network className="w-5 h-5 text-yellow-600" />
                        <span className="text-base font-semibold text-yellow-900">Changements</span>
                      </div>
                      <span className="text-3xl font-bold text-yellow-700">{stats.ipChanges + stats.deviceChanges}</span>
                    </div>
                    <p className="text-sm text-yellow-700/60">IP/Device dans la session</p>
                  </div>
                </div>
              </div>
            )}

            {/* Métriques rapides */}
            {stats && (
              <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm">
                <h2 className="text-xl font-medium mb-8 text-black">Métriques</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/[0.02] rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-brand-primary" />
                      <span className="text-base font-medium text-black">Destinataires</span>
                    </div>
                    <span className="text-2xl font-bold text-black">{stats.recipientCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-black/[0.02] rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Share2 className="w-6 h-6 text-brand-primary" />
                      <span className="text-base font-medium text-black">Re-partages</span>
                    </div>
                    <span className="text-2xl font-bold text-black">{stats.reshares}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contenu principal - Analytics */}
          <div className="xl:col-span-9 space-y-12">
            <AnalyticsDashboard linkId={linkData.id} />
            
            {/* Top fichiers - Centré et mieux designé */}
            {stats && stats.topFiles.length > 0 && (
              <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-black/[0.05] p-10 shadow-sm">
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-light tracking-tight text-black mb-2">Fichiers les plus consultés</h3>
                  <p className="text-base text-black/40">Les fichiers les plus populaires de ce partage</p>
                </div>
                <div className="space-y-3">
                  {stats.topFiles.slice(0, 10).map((file, idx) => (
                    <div key={file.fileId} className="flex items-center justify-between p-5 bg-black/[0.02] rounded-2xl hover:bg-black/[0.04] transition-colors group">
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-sm font-bold text-black/50 shrink-0">
                          {idx + 1}
                        </div>
                        <span className="text-base font-medium text-black truncate">{file.fileName}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-lg font-bold text-brand-primary">{file.count}</span>
                        <span className="text-sm text-black/40">vues</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
