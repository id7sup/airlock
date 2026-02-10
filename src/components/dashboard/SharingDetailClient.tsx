"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FolderOpen,
  Eye,
  Download,
  Trash2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X as CloseIcon,
  Copy,
  CheckCircle2,
  Lock,
  Plus,
  Minus,
  X,
  Calendar,
  File,
  FileSpreadsheet,
  LayoutDashboard,
  FileText,
  Shield,
  AlertTriangle,
  RotateCcw,
  MoreVertical,
  Share2,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Settings,
  Globe,
  Activity,
  Users,
  RotateCw,
  TrendingUp,
  Sliders,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { revokeShareLinkAction, reactivateShareLinkAction, deleteShareLinkAction, getSharedFolderFilesAction } from "@/lib/actions/sharing";
import { updateShareLinkAction } from "@/lib/actions/sharing_update";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ErrorModal } from "@/components/shared/ErrorModal";
import { AnalyticsDashboard, PREFS_KEY, defaultPrefs } from "./AnalyticsDashboard";
import type { DashboardPrefs } from "./AnalyticsDashboard";
import { LogsPageClient } from "@/components/dashboard/LogsPageClient";
import { getNotificationsAction, getLinkLogsAction } from "@/lib/actions/notifications";
import type { NotificationType } from "@/services/notifications";

/** Format a local Date as YYYY-MM-DD without UTC conversion */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parse a YYYY-MM-DD string as a local-timezone Date at midnight */
function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Composant pour gérer le mot de passe
function PasswordManagerCard({ linkId, currentPasswordHash, onUpdate }: { 
  linkId: string; 
  currentPasswordHash?: string | null;
  onUpdate: (hasPassword: boolean) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password && password.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères");
      return;
    }

    setIsUpdating(true);
    setError("");

    try {
      await updateShareLinkAction(linkId, {
        password: password || null,
      });
      onUpdate(!!password);
      setIsEditing(false);
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour du mot de passe");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    setError("");

    try {
      await updateShareLinkAction(linkId, {
        password: null,
      });
      onUpdate(false);
      setIsEditing(false);
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression du mot de passe");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-white border border-black/[0.05]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-black/[0.03] flex items-center justify-center">
          <Lock className="w-6 h-6 text-black/50" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-black">Protection par mot de passe</p>
          <p className="text-xs text-black/40">
            {currentPasswordHash ? "Mot de passe actif" : "Aucun mot de passe défini"}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-xs font-medium text-black/60 hover:text-black bg-black/[0.03] hover:bg-black/[0.05] rounded-lg transition-colors"
          >
            {currentPasswordHash ? "Modifier" : "Définir"}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="space-y-3 mt-4 pt-4 border-t border-black/[0.06]">
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1.5">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Laissez vide pour supprimer"
              className="w-full px-3 py-2 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              disabled={isUpdating}
            />
          </div>
          {password && (
            <div>
              <label className="block text-xs font-medium text-black/60 mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le mot de passe"
                className="w-full px-3 py-2 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                disabled={isUpdating}
              />
            </div>
          )}
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black hover:bg-black/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setPassword("");
                setConfirmPassword("");
                setError("");
              }}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black bg-black/[0.03] hover:bg-black/[0.05] rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            {currentPasswordHash && (
              <button
                onClick={handleRemove}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Utilitaire pour obtenir l'icône selon le type de fichier
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return FileSpreadsheet;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar") || mimeType.includes("archive")) return FileArchive;
  if (mimeType.includes("code") || mimeType.includes("javascript") || mimeType.includes("json") || mimeType.includes("html") || mimeType.includes("css")) return FileCode;
  return File;
}

// Composant Modal pour gérer les exceptions de téléchargement par fichier
function FileDownloadExceptionsModal({ 
  isOpen, 
  onClose, 
  linkId,
  initialExceptions,
  onSave
}: { 
  isOpen: boolean; 
  onClose: () => void;
  linkId: string;
  initialExceptions: string[];
  onSave: (exceptions: string[]) => void;
}) {
  const [files, setFiles] = useState<Array<{ id: string; name: string; mimeType: string; folderId: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exceptions, setExceptions] = useState<Set<string>>(new Set(initialExceptions));
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setExceptions(new Set(initialExceptions));
      loadFiles();
    }
  }, [isOpen, initialExceptions]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const filesData = await getSharedFolderFilesAction(linkId);
      setFiles(filesData);
    } catch (error) {
      console.error("Erreur lors du chargement des fichiers:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFile = (fileId: string) => {
    setExceptions(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      onSave(Array.from(exceptions));
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const selectAll = () => {
    setExceptions(new Set(files.map(f => f.id)));
  };

  const deselectAll = () => {
    setExceptions(new Set());
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - rendu via portal pour passer au-dessus de tout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />
          
          {/* Container flex pour centrer le modal */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              pointerEvents: 'none',
            }}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ 
                width: '100%',
                maxWidth: '32rem',
                maxHeight: 'calc(100vh - 2rem)',
                pointerEvents: 'auto',
              }}
              className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
            {/* Header */}
            <div className="p-6 border-b border-black/[0.05]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-black">Exceptions de téléchargement</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.1] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-black/60" />
                </button>
              </div>
              <p className="text-sm text-black/50">
                Le téléchargement global est désactivé. Activez les fichiers que vous souhaitez rendre téléchargeables individuellement.
              </p>
            </div>

            {/* Search & Actions */}
            <div className="px-6 py-3 border-b border-black/[0.05] space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un fichier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/30"
                />
                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-black/50">
                  {exceptions.size} fichier{exceptions.size > 1 ? "s" : ""} autorisé{exceptions.size > 1 ? "s" : ""} au téléchargement
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1.5 text-xs font-medium text-black/50 hover:text-black hover:bg-black/[0.05] rounded-lg transition-colors"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>
            </div>

            {/* Files List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <File className="w-12 h-12 text-black/20 mx-auto mb-3" />
                  <p className="text-sm text-black/50">
                    {searchQuery ? "Aucun fichier trouvé" : "Aucun fichier dans ce dossier"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file) => {
                    const isEnabled = exceptions.has(file.id);
                    const FileIcon = getFileIcon(file.mimeType);
                    
                    return (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isEnabled 
                            ? "bg-brand-primary/5 border-brand-primary/20" 
                            : "bg-white border-black/[0.05] hover:border-black/[0.1]"
                        }`}
                        onClick={() => toggleFile(file.id)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isEnabled ? "bg-brand-primary/10" : "bg-black/[0.03]"
                        }`}>
                          <FileIcon className={`w-5 h-5 ${isEnabled ? "text-brand-primary" : "text-black/40"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isEnabled ? "text-black" : "text-black/70"}`}>
                            {file.name}
                          </p>
                          <p className="text-xs text-black/40">
                            {isEnabled ? "Téléchargement autorisé" : "Téléchargement bloqué"}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFile(file.id);
                          }}
                          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary/30 ${
                            isEnabled 
                              ? "bg-brand-primary" 
                              : "bg-black/15"
                          }`}
                        >
                          <motion.span
                            animate={{
                              x: isEnabled ? 22 : 2,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30
                            }}
                            className="inline-block h-5 w-5 bg-white rounded-full shadow-sm transform"
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-black/[0.05] bg-black/[0.02]">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-4 py-3 text-sm font-medium text-black/60 hover:text-black bg-white border border-black/[0.1] hover:border-black/[0.2] rounded-xl transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-black hover:bg-black/90 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Utiliser un portail pour rendre le modal directement dans le body
  // Cela permet de passer au-dessus de tous les éléments (sidebar, topbar, etc.)
  return createPortal(modalContent, document.body);
}

interface SharedLink {
  id: string;
  token: string;
  folderId: string;
  folderName: string;
  viewCount: number;
  downloadCount: number;
  allowDownload: boolean;
  restrictDomain?: boolean;
  blockVpn?: boolean;
  maxViews: number | null;
  expiresAt: string | null;
  createdAt: string;
  isRevoked: boolean;
  analytics: any[];
  notifications?: string[];
  blockedIps?: string[];
  blockedDevices?: string[];
  passwordHash?: string | null;
  fileDownloadExceptions?: string[]; // IDs des fichiers avec téléchargement autorisé même si allowDownload=false
}

interface ExtendedStats {
  invalidAttempts: number;
  recipientCount: number;
  reshares: number;
  topFiles: Array<{ fileId: string; fileName: string; count: number }>;
  funnel?: {
    viewToDownload: number;
    viewToViewFile: number;
    viewToOpenFolder: number;
  };
}

const tabs = ["Vue globale", "Logs"];

export default function SharingDetailClient({ link }: { link: SharedLink }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("Vue globale");
  const [linkData, setLinkData] = useState(link);
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<"CSV" | "PDF" | null>(null);
  const [localMaxViews, setLocalMaxViews] = useState<string>(link.maxViews?.toString() || "");
  const [localExpiry, setLocalExpiry] = useState<string>(() => {
    if (!link.expiresAt) return "";
    return formatDateLocal(new Date(link.expiresAt));
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (link.expiresAt) {
      const date = new Date(link.expiresAt);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  const calendarRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const [restrictDomain, setRestrictDomain] = useState(link.restrictDomain === true);
  const [blockVpn, setBlockVpn] = useState(link.blockVpn === true);
  const [notifications, setNotifications] = useState<string[]>(link.notifications || []);
  const [fileNameMap, setFileNameMap] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<Array<{ id: string; type: NotificationType; metadata?: any; createdAt: string }>>(
    []
  );
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showFileExceptionsModal, setShowFileExceptionsModal] = useState(false);

  // Dashboard widget preferences — always init with defaults to avoid hydration mismatch
  const [showWidgetPanel, setShowWidgetPanel] = useState(false);
  const [dashboardPrefs, setDashboardPrefs] = useState<DashboardPrefs>(defaultPrefs);
  const [prefsHydrated, setPrefsHydrated] = useState(false);

  // Load prefs from localStorage after mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDashboardPrefs({
          visibleCards: { ...defaultPrefs.visibleCards, ...parsed.visibleCards },
          visibleSections: { ...defaultPrefs.visibleSections, ...parsed.visibleSections },
        });
      }
    } catch {}
    setPrefsHydrated(true);
  }, []);

  // Persist prefs changes to localStorage (skip first render)
  useEffect(() => {
    if (!prefsHydrated) return;
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(dashboardPrefs));
    } catch {}
  }, [dashboardPrefs]);

  const toggleWidgetCard = (label: string) => {
    setDashboardPrefs(prev => ({
      ...prev,
      visibleCards: { ...prev.visibleCards, [label]: !prev.visibleCards[label] },
    }));
  };

  const toggleWidgetSection = (key: string) => {
    setDashboardPrefs(prev => ({
      ...prev,
      visibleSections: { ...prev.visibleSections, [key]: !prev.visibleSections[key] },
    }));
  };

  const resetWidgetPrefs = () => setDashboardPrefs(defaultPrefs);

  const widgetItems = [
    { key: "Visiteurs", type: "card" as const, icon: <Users className="w-5 h-5" />, label: "Visiteurs", desc: "Visiteurs uniques" },
    { key: "Vues", type: "card" as const, icon: <Eye className="w-5 h-5" />, label: "Vues", desc: "Ouvertures de liens" },
    { key: "Téléchargements", type: "card" as const, icon: <Download className="w-5 h-5" />, label: "Téléchargements", desc: "Fichiers téléchargés" },
    { key: "Événements", type: "card" as const, icon: <Activity className="w-5 h-5" />, label: "Événements", desc: "Toutes les interactions" },
    { key: "activity", type: "section" as const, icon: <Clock className="w-5 h-5" />, label: "Activité temps réel", desc: "Graphique d'activité live" },
    { key: "traffic", type: "section" as const, icon: <Globe className="w-5 h-5" />, label: "Sources de trafic", desc: "Origine des visiteurs" },
    { key: "controls", type: "section" as const, icon: <Sliders className="w-5 h-5" />, label: "Contrôles", desc: "Téléchargement, quota, expiration" },
    { key: "restrictions", type: "section" as const, icon: <Lock className="w-5 h-5" />, label: "Restrictions", desc: "Blocage VPN / datacenter" },
    { key: "export", type: "section" as const, icon: <FileSpreadsheet className="w-5 h-5" />, label: "Export", desc: "CSV et PDF" },
    { key: "security", type: "section" as const, icon: <Shield className="w-5 h-5" />, label: "Sécurité & anomalies", desc: "Surveillance des accès" },
    { key: "funnel", type: "section" as const, icon: <TrendingUp className="w-5 h-5" />, label: "Funnel d'engagement", desc: "Taux de conversion" },
  ];

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
    isDestructive: true,
  });
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    setShareUrl(`${window.location.origin}/share/${linkData.token}`);
  }, [linkData.token]);

  // Synchroniser les états locaux avec linkData
  useEffect(() => {
    setLocalMaxViews(linkData.maxViews?.toString() || "");
    setLocalExpiry(linkData.expiresAt ? formatDateLocal(new Date(linkData.expiresAt)) : "");
    if (linkData.expiresAt) {
      const date = new Date(linkData.expiresAt);
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [linkData.maxViews, linkData.expiresAt]);

  // Fermer le calendrier au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Fermer le menu au clic extérieur et recalculer la position au scroll/resize
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        closeActionsMenu();
      }
    };

    if (showActionsMenu) {
      // Recalculer la position au scroll et resize
      const calculatePosition = () => {
        const button = actionsMenuRef.current?.querySelector('button');
        if (button) {
          const rect = button.getBoundingClientRect();
          setMenuPosition({
            top: rect.bottom,
            right: window.innerWidth - rect.right,
          });
        }
      };
      
      const handleScroll = () => calculatePosition();
      const handleResize = () => calculatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      document.addEventListener("mousedown", handleClickOutside);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showActionsMenu]);

  useEffect(() => {
    const loadLogs = async () => {
      setLoadingLogs(true);
      try {
        // Récupérer les logs spécifiques à ce lien via les analytics
        const data = await getLinkLogsAction(linkData.id, linkData.folderName, 200);
        setLogs(data as any[]);
      } catch (error) {
        console.error("Erreur lors du chargement des logs:", error);
      } finally {
        setLoadingLogs(false);
      }
    };
    loadLogs();
  }, [linkData.id, linkData.folderName]);

  useEffect(() => {
    setNotifications(linkData.notifications || []);
    setRestrictDomain(linkData.restrictDomain === true);
    setBlockVpn(linkData.blockVpn === true);
  }, [linkData.maxViews, linkData.expiresAt]);

  useEffect(() => {
    const fetchExtendedStats = async () => {
      setLoadingStats(true);
      try {
        const response = await fetch(`/api/analytics/stats?days=9999&linkId=${link.id}&period=Max`);
        if (!response.ok) {
          console.error("[STATS] Erreur HTTP:", response.status, response.statusText);
          throw new Error(`Stats failed: ${response.status}`);
        }
        const data = await response.json();
        if (!data.stats) {
          console.error("[STATS] Pas de stats dans la réponse:", data);
          throw new Error("Stats data missing");
        }
        const analyticsStats = data.stats;
        
        // Mettre à jour le viewCount depuis les stats
        if (analyticsStats?.totalViews !== undefined) {
          setLinkData(prev => ({ ...prev, viewCount: analyticsStats.totalViews }));
        }

        const geoResponse = await fetch(`/api/analytics/geolocation?days=30&linkId=${link.id}`);
        const geoData = geoResponse.ok ? await geoResponse.json() : { analytics: [] };
        const analytics = geoData.analytics || [];

        // Compter TOUS les ACCESS_DENIED (toutes les tentatives invalides)
        const invalidAttempts = analytics.filter((a: any) => a.eventType === "ACCESS_DENIED").length;

        const fileCounts: Record<string, { count: number; fileName: string }> = {};
        analytics.forEach((a: any) => {
          if (a.fileId) {
            if (!fileCounts[a.fileId]) {
              fileCounts[a.fileId] = { count: 0, fileName: a.fileName || "" };
            }
            fileCounts[a.fileId].count++;
          }
        });

        setStats({
          invalidAttempts,
          recipientCount: analytics.reduce((sum: number, a: any) => sum + (a.recipientCount || 0), 0),
          reshares: analytics.filter((a: any) => a.isReshare === true).length,
          topFiles: Object.entries(fileCounts)
            .map(([fileId, data]) => ({ fileId, fileName: data.fileName, count: data.count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
          funnel: analyticsStats?.funnel,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchExtendedStats();
    
    // Rafraîchir les stats toutes les 10 secondes pour mettre à jour le compteur de vues
    const interval = setInterval(fetchExtendedStats, 10000);
    
    return () => clearInterval(interval);
  }, [link.id]);

  useEffect(() => {
    const hydrateFileNames = async () => {
      if (!stats || !stats.topFiles || !linkData.token) return;
      const missing = stats.topFiles
        .filter((f) => !f.fileName || f.fileName.trim().length === 0)
        .map((f) => f.fileId)
        .filter((id) => id && !fileNameMap[id]);
      if (missing.length === 0) return;

      const entries = await Promise.all(
        missing.map(async (fileId) => {
          try {
            const res = await fetch(`/api/public/view/info?fileId=${fileId}&token=${linkData.token}`);
            if (!res.ok) return null;
            const data = await res.json();
            const name = data?.name;
            return name ? [fileId, name] : null;
          } catch {
            return null;
          }
        })
      );

      const next: Record<string, string> = {};
      entries.forEach((entry) => {
        if (entry) {
          const [id, name] = entry;
          next[id] = name;
        }
      });
      if (Object.keys(next).length > 0) {
        setFileNameMap((prev) => ({ ...prev, ...next }));
      }
    };

    hydrateFileNames();
  }, [stats?.topFiles, linkData.token, fileNameMap]);

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleDownload = async () => {
    // Si on va désactiver le téléchargement, afficher la popup pour les exceptions
    if (linkData.allowDownload) {
      setShowFileExceptionsModal(true);
      return;
    }
    
    // Si on réactive le téléchargement, on met à jour directement et on efface les exceptions
    setUpdating(true);
    try {
      await updateShareLinkAction(linkData.id, { 
        allowDownload: true, 
        downloadDefault: true,
        fileDownloadExceptions: [] // Effacer les exceptions car le téléchargement est autorisé pour tous
      });
      setLinkData({ ...linkData, allowDownload: true, fileDownloadExceptions: [] });
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la mise à jour",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveFileExceptions = async (exceptions: string[]) => {
    setUpdating(true);
    try {
      await updateShareLinkAction(linkData.id, { 
        allowDownload: false, 
        downloadDefault: false,
        fileDownloadExceptions: exceptions
      });
      setLinkData({ 
        ...linkData, 
        allowDownload: false, 
        fileDownloadExceptions: exceptions 
      });
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la mise à jour",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateExpiry = async (dateStr: string) => {
    if (!dateStr) {
      return;
    }
    setUpdating(true);
    try {
      const newDate = parseDateLocal(dateStr);
      await updateShareLinkAction(linkData.id, { expiresAt: newDate });
      setLinkData({ ...linkData, expiresAt: newDate.toISOString() });
      setLocalExpiry(dateStr);
      setIsCalendarOpen(false);
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la mise à jour de l'expiration",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const dateStr = formatDateLocal(selectedDate);
    setLocalExpiry(dateStr);
    handleUpdateExpiry(dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayStr = formatDateLocal(today);
    setLocalExpiry(todayStr);
    handleUpdateExpiry(todayStr);
  };

  const clearDate = async () => {
    setUpdating(true);
    try {
      await updateShareLinkAction(linkData.id, { expiresAt: null });
      setLinkData({ ...linkData, expiresAt: null });
      setLocalExpiry("");
      setIsCalendarOpen(false);
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la suppression de l'expiration",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Générer les jours du calendrier (lundi = 0)
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Convertir dimanche (0) en 6 pour que lundi soit 0
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    const days: (number | null)[] = [];

    // Jours du mois précédent (cases vides avant le 1er jour)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    // Compléter jusqu'à 42 cases (6 semaines)
    while (days.length < 42) {
      days.push(null);
    }

    return days;
  };

  const handleUpdateMaxViews = async (valStr: string) => {
    setUpdating(true);
    try {
      const trimmed = valStr.trim();
      if (trimmed === "") {
        await updateShareLinkAction(linkData.id, { maxViews: null });
        setLinkData({ ...linkData, maxViews: null });
        setLocalMaxViews("");
        setUpdating(false);
        return;
      }

      const val = parseInt(trimmed);
      if (isNaN(val) || val < 0) {
        setErrorModal({
          isOpen: true,
          title: "Erreur de validation",
          message: "Le quota de vues ne peut pas être négatif",
        });
        setLocalMaxViews(linkData.maxViews?.toString() || "");
        setUpdating(false);
        return;
      }

      await updateShareLinkAction(linkData.id, { maxViews: val });
      setLinkData({ ...linkData, maxViews: val });
      setLocalMaxViews(val.toString());
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la mise à jour du quota",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRevoke = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Révoquer ce lien ?",
      message: `Le lien de partage "${linkData.folderName}" sera immédiatement désactivé. Vous pourrez le réactiver plus tard.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          await revokeShareLinkAction(linkData.id);
          setLinkData({ ...linkData, isRevoked: true });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          setErrorModal({
            isOpen: true,
            title: "Erreur",
            message: "Erreur lors de la révocation",
          });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleReactivate = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Réactiver ce lien ?",
      message: `Le lien de partage "${linkData.folderName}" sera réactivé et pourra à nouveau être utilisé.`,
      isDestructive: false,
      onConfirm: async () => {
        try {
          await reactivateShareLinkAction(linkData.id);
          setLinkData({ ...linkData, isRevoked: false });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          setErrorModal({
            isOpen: true,
            title: "Erreur",
            message: "Erreur lors de la réactivation",
          });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDelete = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Supprimer définitivement ce lien ?",
      message: `Le lien de partage "${linkData.folderName}" sera définitivement supprimé ainsi que toutes ses données d'analytics. Cette action est irréversible.`,
      isDestructive: true,
      onConfirm: async () => {
        setUpdating(true);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await deleteShareLinkAction(linkData.id);
          // Attendre un peu pour que la suppression soit bien propagée
          await new Promise(resolve => setTimeout(resolve, 500));
          // Utiliser window.location pour forcer une navigation complète
          window.location.href = "/dashboard/sharing";
        } catch (error: any) {
          setUpdating(false);
          setErrorModal({
            isOpen: true,
            title: "Erreur",
            message: error?.message || "Erreur lors de la suppression du lien. Veuillez réessayer.",
          });
        }
      },
    });
  };

  const closeActionsMenu = () => {
    setShowActionsMenu(false);
    setMenuPosition(null);
  };

  const openActionsMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const button = event.currentTarget;
    
    // Calculer la position immédiatement au clic pour plus de précision
    const rect = button.getBoundingClientRect();
    
    // Positionner le menu exactement sous le bouton, sans espacement
    setMenuPosition({
      top: rect.bottom, // Position exacte du bas du bouton
      right: window.innerWidth - rect.right,
    });
    
    setShowActionsMenu(true);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closeActionsMenu();
    
    const shareData = {
      title: `Partage: ${linkData.folderName}`,
      text: `Partage du dossier "${linkData.folderName}"`,
      url: shareUrl,
    };

    try {
      // Vérifier si l'API Web Share est disponible
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copier le lien dans le presse-papiers
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error: any) {
      // L'utilisateur a annulé le partage ou erreur
      if (error.name !== 'AbortError') {
        // Si ce n'est pas une annulation, essayer de copier dans le presse-papiers
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (clipboardError) {
          console.error('Erreur lors de la copie:', clipboardError);
        }
      }
    }
  };

  const toggleNotification = async (notif: string) => {
    const next = notifications.includes(notif)
      ? notifications.filter((n) => n !== notif)
      : [...notifications, notif];
    setUpdating(true);
    try {
      await updateShareLinkAction(linkData.id, { notifications: next });
      setNotifications(next);
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Impossible de mettre à jour les notifications",
      });
    } finally {
      setUpdating(false);
    }
  };


  const handleExport = async (format: "CSV" | "PDF") => {
    setExportingFormat(format);
    setUpdating(true);
    try {
      const res = await fetch(`/api/analytics/geolocation?days=30&linkId=${linkData.id}`);
      if (!res.ok) throw new Error("analytics");
      const payload = await res.json();
      const analytics = payload.analytics || [];

      if (format === "CSV") {
        // CSV simple à partir des événements
        const headers = ["timestamp", "eventType", "country", "city", "ip", "isVPN", "isDatacenter", "fileName"].join(",");
        const rows = analytics
          .map((a: any) =>
            [
              a.timestamp,
              a.eventType || a.type,
              a.country || "",
              a.city || "",
              a.ip || "",
              a.isVPN ? "1" : "0",
              a.isDatacenter ? "1" : "0",
              a.fileName || "",
            ]
              .map((v) => `"${String(v).replace(/"/g, '""')}"`)
              .join(",")
          )
          .join("\n");
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const linkEl = document.createElement("a");
        linkEl.href = url;
        linkEl.download = `analytics-${linkData.id}.csv`;
        linkEl.click();
        URL.revokeObjectURL(url);
      } else if (format === "PDF") {
        // Pour le PDF, on génère aussi un CSV pour l'instant (à améliorer plus tard)
        const headers = ["timestamp", "eventType", "country", "city", "ip", "isVPN", "isDatacenter", "fileName"].join(",");
        const rows = analytics
          .map((a: any) =>
            [
              a.timestamp,
              a.eventType || a.type,
              a.country || "",
              a.city || "",
              a.ip || "",
              a.isVPN ? "1" : "0",
              a.isDatacenter ? "1" : "0",
              a.fileName || "",
            ]
              .map((v) => `"${String(v).replace(/"/g, '""')}"`)
              .join(",")
          )
          .join("\n");
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const linkEl = document.createElement("a");
        linkEl.href = url;
        linkEl.download = `analytics-${linkData.id}.csv`;
        linkEl.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Export impossible pour le moment",
      });
    } finally {
      setUpdating(false);
      setExportingFormat(null);
    }
  };

  const statusBadge = useMemo(() => {
    if (linkData.isRevoked) return { label: "Révoqué", tone: "bg-red-100 text-red-700" };
    const expired = linkData.expiresAt ? new Date(linkData.expiresAt).getTime() < Date.now() : false;
    if (expired) return { label: "Expiré", tone: "bg-orange-100 text-orange-700" };
    return { label: "Actif", tone: "bg-green-100 text-green-700" };
  }, [linkData.isRevoked, linkData.expiresAt]);

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Retour */}
        <Link 
          href="/dashboard/sharing" 
          className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Mes partages</span>
        </Link>

        {/* Carte principale avec identité et actions */}
        <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm overflow-hidden">
          {/* En-tête de la carte */}
          <div className="p-4 md:p-6">
            {/* Version mobile : empilée */}
            <div className="flex flex-col gap-4 md:hidden">
              {/* Identité mobile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 text-brand-primary flex items-center justify-center shadow-md shadow-brand-primary/10 shrink-0">
                  <FolderOpen className="w-5 h-5 fill-current" />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h1 className="text-lg font-bold tracking-tight text-black truncate">{linkData.folderName}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${statusBadge.tone}`}>
                    {statusBadge.label}
                  </span>
                </div>
              </div>
              
              {/* Toggle mobile */}
              <div className="flex items-center justify-center py-2">
                <div className="relative inline-flex items-center py-1.5 px-2.5 bg-black/[0.04] rounded-full">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    const tabIndex = tabs.indexOf(tab);
                    const tabWidth = 100 / tabs.length;
                    
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative z-10 px-5 py-2 text-xs font-medium transition-colors duration-200 ${
                          isActive ? "text-black" : "text-black/45"
                        }`}
                        style={{ width: `${tabWidth}%` }}
                      >
                        <span className="block text-center leading-none">{tab}</span>
                      </button>
                    );
                  })}
                  <motion.div
                    layoutId="activeTabBackgroundMobile"
                    className="absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-sm"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                    style={{
                      width: `calc(${100 / tabs.length}% - 6px)`,
                      left: `calc(${(tabs.findIndex(t => t === activeTab) / tabs.length) * 100}% + 3px)`,
                    }}
                  />
                </div>
              </div>

              {/* Actions mobile */}
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="h-9 px-3 rounded-xl bg-black text-white text-xs font-medium hover:bg-black/90 transition-all flex items-center gap-1.5 active:scale-95 flex-1 justify-center"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copié" : "Copier"}</span>
                </button>
                <Link
                  href={`/share/${linkData.token}`}
                  target="_blank"
                  className="h-9 px-3 rounded-xl bg-white border border-black/[0.08] text-xs font-medium hover:bg-black/[0.02] transition-all flex items-center gap-1.5 active:scale-95 flex-1 justify-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir</span>
                </Link>
                
                {/* Menu Actions mobile */}
                <div className="relative" ref={actionsMenuRef}>
                  <button
                    onClick={openActionsMenu}
                    className="h-9 w-9 rounded-xl bg-white border border-black/[0.08] text-xs font-medium hover:bg-black/[0.02] transition-all flex items-center justify-center active:scale-95"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showActionsMenu && menuPosition && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={closeActionsMenu}
                          className="fixed inset-0 z-[9998]"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="fixed z-[9999] bg-white rounded-2xl border border-black/[0.08] shadow-xl min-w-[200px] overflow-hidden"
                          style={{
                            top: `${menuPosition.top}px`,
                            right: `${menuPosition.right}px`,
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              closeActionsMenu();
                              setShowWidgetPanel(prev => !prev);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Personnaliser
                          </button>
                          <div className="h-px bg-black/[0.05]" />
                          <button
                            onClick={handleShare}
                            className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black flex items-center gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Partager
                          </button>
                          <div className="h-px bg-black/[0.05]" />
                          {linkData.isRevoked ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  closeActionsMenu();
                                  handleReactivate();
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black flex items-center gap-2"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Réactiver
                              </button>
                              <div className="h-px bg-black/[0.05]" />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  closeActionsMenu();
                                  handleDelete();
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors text-sm font-medium text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  closeActionsMenu();
                                  handleRevoke();
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black flex items-center gap-2"
                              >
                                <Lock className="w-4 h-4" />
                                Révoquer
                              </button>
                              <div className="h-px bg-black/[0.05]" />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  closeActionsMenu();
                                  handleDelete();
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors text-sm font-medium text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Version desktop : en ligne */}
            <div className="hidden md:relative md:flex md:items-center md:gap-4">
              {/* Identité */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 text-brand-primary flex items-center justify-center shadow-md shadow-brand-primary/10 shrink-0">
                  <FolderOpen className="w-6 h-6 fill-current" />
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-black truncate">{linkData.folderName}</h1>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusBadge.tone}`}>
                    {statusBadge.label}
                  </span>
                  <p className="text-xs text-black/40 font-medium shrink-0 hidden lg:block">
                    Créé le{" "}
                    <span className="text-black/60">
                      {new Date(linkData.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>

              {/* Navigation par onglets - Centré absolument avec plus d'espace */}
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center px-8 py-3">
                <div className="relative inline-flex items-center py-1.5 px-2.5 bg-black/[0.04] rounded-full">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    const tabIndex = tabs.indexOf(tab);
                    const tabWidth = 100 / tabs.length;
                    
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative z-10 px-6 py-2 text-sm font-medium transition-colors duration-200 ${
                          isActive ? "text-black" : "text-black/45"
                        }`}
                        style={{ width: `${tabWidth}%` }}
                      >
                        <span className="block text-center leading-none">{tab}</span>
                      </button>
                    );
                  })}
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-sm"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                    style={{
                      width: `calc(${100 / tabs.length}% - 6px)`,
                      left: `calc(${(tabs.findIndex(t => t === activeTab) / tabs.length) * 100}% + 3px)`,
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <button
                  onClick={copyToClipboard}
                  className="h-10 px-4 lg:px-5 rounded-xl bg-black text-white text-xs lg:text-sm font-medium hover:bg-black/90 transition-all flex items-center gap-2 active:scale-95"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden lg:inline">{copied ? "Copié" : "Copier"}</span>
                </button>
                <Link
                  href={`/share/${linkData.token}`}
                  target="_blank"
                  className="h-10 px-4 lg:px-5 rounded-xl bg-white border border-black/[0.08] text-xs lg:text-sm font-medium hover:bg-black/[0.02] transition-all flex items-center gap-2 active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden lg:inline">Ouvrir</span>
                </Link>
                
                {/* Menu Actions */}
                <div className="relative" ref={actionsMenuRef}>
                  <button
                    onClick={openActionsMenu}
                    className="h-10 px-4 lg:px-5 rounded-xl bg-white border border-black/[0.08] text-xs lg:text-sm font-medium hover:bg-black/[0.02] transition-all flex items-center gap-2 active:scale-95"
                  >
                    <MoreVertical className="w-4 h-4" />
                    <span className="hidden lg:inline">Actions</span>
                  </button>

                  <AnimatePresence>
                    {showActionsMenu && menuPosition && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={closeActionsMenu}
                          className="fixed inset-0 z-[9998]"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="fixed z-[9999] bg-white rounded-2xl border border-black/[0.08] shadow-xl min-w-[200px] overflow-hidden"
                          style={{
                            top: `${menuPosition.top}px`,
                            right: `${menuPosition.right}px`,
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              closeActionsMenu();
                              setShowWidgetPanel(prev => !prev);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Personnaliser le tableau de bord
                          </button>
                          <div className="h-px bg-black/[0.05]" />
                          <button
                            onClick={handleShare}
                            className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black flex items-center gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Partager
                          </button>
                          <div className="h-px bg-black/[0.05]" />
                          {linkData.isRevoked ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  closeActionsMenu();
                                  handleReactivate();
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black flex items-center gap-2"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Réactiver
                              </button>
                              <div className="h-px bg-black/[0.05]" />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  closeActionsMenu();
                                  handleDelete();
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors text-sm font-medium text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  closeActionsMenu();
                                  handleRevoke();
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors text-sm font-medium text-black flex items-center gap-2"
                              >
                                <Lock className="w-4 h-4" />
                                Révoquer
                              </button>
                              <div className="h-px bg-black/[0.05]" />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  closeActionsMenu();
                                  handleDelete();
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors text-sm font-medium text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div>

        {activeTab === "Vue globale" && (() => {
          const widgetAnim = { duration: 0.3, ease: [0.23, 1, 0.32, 1] as const };
          const activeWidgetCount = widgetItems.filter(w => w.type === "card" ? dashboardPrefs.visibleCards[w.key] : dashboardPrefs.visibleSections[w.key]).length;
          const hasLeftColumn = dashboardPrefs.visibleSections.controls || dashboardPrefs.visibleSections.restrictions || dashboardPrefs.visibleSections.export || dashboardPrefs.visibleSections.security || dashboardPrefs.visibleSections.funnel;
          return (
          <div className={`grid gap-4 sm:gap-5 items-start ${hasLeftColumn ? "grid-cols-1 xl:grid-cols-3" : "grid-cols-1"}`}>
            {/* Colonne gauche : paramètres du lien */}
            {hasLeftColumn && (
            <div className="space-y-3 sm:space-y-4">
              <AnimatePresence>
              {dashboardPrefs.visibleSections.controls && (
              <motion.div
                key="controls-widget"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={widgetAnim}
                className="overflow-hidden"
              >
              <div className="p-3 sm:p-4 rounded-2xl border border-black/[0.06] bg-white shadow-sm space-y-3">
                <h2 className="text-base font-semibold text-black">Contrôles</h2>
                {[ 
                  { title: "Téléchargement", desc: linkData.allowDownload ? "Autorisé" : "Bloqué", icon: <Download className={`w-5 h-5 ${linkData.allowDownload ? "text-brand-primary" : "text-black/30"}`} />, toggle: linkData.allowDownload, onToggle: handleToggleDownload },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-black/[0.05] bg-white hover:border-black/10 transition-all">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      item.toggle ? "bg-brand-primary/10" : "bg-black/5"
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black mb-0.5">{item.title}</p>
                      <p className={`text-xs font-medium ${item.toggle ? "text-brand-primary" : "text-black/50"}`}>
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={item.onToggle}
                      disabled={updating}
                      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary/30 ${
                        item.toggle 
                          ? "bg-brand-primary" 
                          : "bg-black/15"
                      } ${updating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <motion.span
                        animate={{
                          x: item.toggle ? 22 : 2,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                        className="inline-block h-5 w-5 bg-white rounded-full shadow-sm transform"
                      />
                    </button>
                  </div>
                ))}

                {/* Quota */}
                <div className="p-3 sm:p-4 rounded-2xl border border-black/[0.05] bg-white hover:border-black/10 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      linkData.maxViews ? "bg-brand-primary/10" : "bg-black/5"
                    }`}>
                      <Eye className={`w-5 h-5 ${linkData.maxViews ? "text-brand-primary" : "text-black/30"}`} />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-semibold text-black mb-0.5 truncate">Quota de vues</p>
                      <p className={`text-xs font-medium truncate ${linkData.maxViews ? "text-brand-primary" : "text-black/50"}`}>
                        {linkData.maxViews ? `${linkData.viewCount} / ${linkData.maxViews}` : "Illimité"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-black/5 rounded-xl p-1 flex-1 min-w-0">
                      <button
                        onClick={() => {
                          const current = parseInt(localMaxViews) || 0;
                          if (current > 0) {
                            const newVal = (current - 1).toString();
                            setLocalMaxViews(newVal);
                            handleUpdateMaxViews(newVal);
                          }
                        }}
                        disabled={updating || !localMaxViews || parseInt(localMaxViews) <= 0}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                      >
                        <Minus className="w-4 h-4 text-black/60" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={localMaxViews}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || (parseInt(val) >= 0)) {
                            setLocalMaxViews(val);
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value.trim() === "") {
                            handleUpdateMaxViews("");
                          } else {
                            handleUpdateMaxViews(e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                          if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                            e.preventDefault();
                          }
                        }}
                        placeholder="∞"
                        disabled={updating}
                        className="flex-1 min-w-0 text-center text-sm font-semibold bg-transparent border-none outline-none focus:ring-0 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(localMaxViews) || 0;
                          const newVal = (current + 1).toString();
                          setLocalMaxViews(newVal);
                          handleUpdateMaxViews(newVal);
                        }}
                        disabled={updating}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                      >
                        <Plus className="w-4 h-4 text-black/60" />
                      </button>
                    </div>
                    {linkData.maxViews && (
                      <button
                        onClick={() => {
                          setLocalMaxViews("");
                          handleUpdateMaxViews("");
                        }}
                        disabled={updating}
                        className="h-9 px-3 text-xs font-medium text-black/60 hover:text-black hover:bg-black/5 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 border border-black/10 hover:border-black/20"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Illimité</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expiration */}
                <div className="p-3 sm:p-4 rounded-2xl border border-black/[0.05] bg-white hover:border-black/10 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      linkData.expiresAt ? "bg-orange-50" : "bg-black/5"
                    }`}>
                      <Clock className={`w-5 h-5 ${linkData.expiresAt ? "text-orange-600" : "text-black/30"}`} />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-semibold text-black mb-0.5 truncate">Expiration</p>
                      <p className={`text-xs font-medium truncate ${linkData.expiresAt ? "text-orange-600" : "text-black/50"}`} suppressHydrationWarning>
                        {linkData.expiresAt
                          ? new Date(linkData.expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                          : "Aucune limite"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative" ref={calendarRef}>
                      <button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        disabled={updating}
                        className="w-full h-9 px-3 text-left text-sm font-medium bg-black/5 border border-black/10 rounded-xl hover:border-black/20 transition-all disabled:opacity-50 flex items-center justify-between group"
                      >
                        <span className={localExpiry ? "text-black" : "text-black/40"}>
                          {localExpiry
                            ? parseDateLocal(localExpiry).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                            : "Sélectionner une date"}
                        </span>
                        <Calendar className="w-4 h-4 text-black/40 group-hover:text-black/60 transition-colors shrink-0" />
                      </button>

                      {/* Calendrier personnalisé */}
                      <AnimatePresence>
                        {isCalendarOpen && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setIsCalendarOpen(false)}
                              className="fixed inset-0 z-10"
                            />
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.98 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="absolute top-full left-0 mt-2 z-20 bg-white rounded-2xl border border-black/[0.08] shadow-2xl shadow-black/10 p-4 w-full min-w-[320px]"
                            >
                            {/* En-tête du calendrier */}
                            <div className="flex items-center justify-between mb-4">
                              <button
                                onClick={() => navigateMonth('prev')}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 text-black/60" />
                              </button>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-black capitalize">
                                  {calendarMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                                </span>
                              </div>
                              <button
                                onClick={() => navigateMonth('next')}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                              >
                                <ChevronRight className="w-4 h-4 text-black/60" />
                              </button>
                            </div>

                            {/* Jours de la semaine */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {["L", "M", "M", "J", "V", "S", "D"].map((day, idx) => (
                                <div key={idx} className="text-center text-xs font-medium text-black/40 py-1">
                                  {day}
                                </div>
                              ))}
                            </div>

                            {/* Grille du calendrier */}
                            <div className="grid grid-cols-7 gap-1">
                              {getCalendarDays().map((day, idx) => {
                                if (day === null) {
                                  return <div key={idx} className="h-9" />;
                                }

                                const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isToday = date.getTime() === today.getTime();
                                const isPast = date < today;
                                const isSelected = localExpiry && formatDateLocal(date) === localExpiry;

                                return (
                                  <button
                                    key={idx}
                                    onClick={() => !isPast && handleDateSelect(day)}
                                    disabled={isPast || updating}
                                    className={`h-9 rounded-lg text-sm font-medium transition-all ${
                                      isSelected
                                        ? "bg-brand-primary text-white"
                                        : isPast
                                        ? "text-black/20 cursor-not-allowed"
                                        : isToday
                                        ? "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20"
                                        : "text-black/60 hover:bg-black/5 hover:text-black"
                                    } disabled:cursor-not-allowed`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-black/[0.05]">
                              <button
                                onClick={clearDate}
                                className="flex-1 px-3 py-2 text-xs font-medium text-black/60 hover:text-black hover:bg-black/5 rounded-xl transition-colors"
                              >
                                Effacer
                              </button>
                              <button
                                onClick={goToToday}
                                className="flex-1 px-3 py-2 text-xs font-medium text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors"
                              >
                                Aujourd'hui
                              </button>
                            </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    {linkData.expiresAt && (
                      <button
                        onClick={clearDate}
                        disabled={updating}
                        className="h-9 px-3 text-xs font-medium text-black/60 hover:text-black hover:bg-black/5 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 border border-black/10 hover:border-black/20"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Restrictions — inside controls card but only if restrictions enabled */}
                {dashboardPrefs.visibleSections.restrictions && (
                <div className="space-y-3 pt-2 border-t border-black/[0.04]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black">Restrictions</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Blocage VPN / datacenter */}
                    <div className="p-4 bg-white border border-black/[0.05] rounded-2xl hover:border-black/10 transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            blockVpn ? "bg-red-50" : "bg-black/5"
                          }`}>
                            <Lock className={`w-5 h-5 ${blockVpn ? "text-red-600" : "text-black/30"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-black mb-0.5">Bloquer datacenters/VPN</p>
                            <p className={`text-xs font-medium ${blockVpn ? "text-red-600" : "text-black/50"}`}>
                              {blockVpn ? "Activé" : "Détection automatique"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            const next = !blockVpn;
                            setUpdating(true);
                            try {
                              await updateShareLinkAction(linkData.id, { blockVpn: next });
                              setBlockVpn(next);
                            } catch (e) {
                              setErrorModal({ isOpen: true, title: "Erreur", message: "Impossible de mettre à jour le blocage VPN" });
                            } finally {
                              setUpdating(false);
                            }
                          }}
                          disabled={updating}
                          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/30 ${
                            blockVpn 
                              ? "bg-red-500" 
                              : "bg-black/15"
                          } ${updating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <motion.span
                            animate={{
                              x: blockVpn ? 22 : 2,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30
                            }}
                            className="inline-block h-5 w-5 bg-white rounded-full shadow-sm transform"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>
              </motion.div>
              )}
              </AnimatePresence>

              <AnimatePresence>
              {dashboardPrefs.visibleSections.export && (
              <motion.div
                key="export-widget"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={widgetAnim}
                className="overflow-hidden"
              >
              <div className="p-3 sm:p-4 rounded-2xl border border-black/[0.05] bg-white hover:border-black/10 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-black mb-0.5">Export</h3>
                    <p className="text-xs font-medium text-black/50">Télécharger les événements de ce partage</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { format: "CSV" as const, icon: File, label: "CSV", desc: "Tableur Excel" },
                    { format: "PDF" as const, icon: File, label: "PDF", desc: "Document PDF" },
                  ] as const).map(({ format, icon: Icon, label, desc }) => (
                    <button
                      key={format}
                      onClick={() => handleExport(format)}
                      disabled={updating}
                      className="relative p-3 rounded-xl border border-black/[0.08] bg-white hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {exportingFormat === format && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                          <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                        </div>
                      )}
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-black/5 group-hover:bg-brand-primary/10 flex items-center justify-center transition-colors">
                          <Icon className={`w-4 h-4 ${exportingFormat === format ? "text-brand-primary" : "text-black/60 group-hover:text-brand-primary"} transition-colors`} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-semibold text-black group-hover:text-brand-primary transition-colors">
                            {label}
                          </div>
                          <div className="text-xs text-black/50 truncate">{desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              </motion.div>
              )}
              </AnimatePresence>

              {loadingStats && (
                <div className="text-xs text-black/50 px-1">Chargement des statistiques...</div>
              )}

              {stats && stats.topFiles.length > 0 && (
                <div className="p-3 sm:p-4 rounded-2xl border border-black/[0.06] bg-white shadow-sm space-y-3">
                  <h3 className="text-base font-semibold text-black">Fichiers les plus consultés</h3>
                  <p className="text-xs text-black/50">Top 10 des fichiers de ce partage</p>
                  <div className="space-y-2">
                    {stats.topFiles.slice(0, 10).map((file, idx) => {
                      const fromStats = file.fileName && file.fileName.trim().length > 0 ? file.fileName : "";
                      const displayName = fromStats || fileNameMap[file.fileId] || "Nom de fichier indisponible";
                      return (
                        <div
                          key={`${file.fileId}-${idx}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/[0.05] shadow-xs"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-xl border border-black/[0.08] bg-black/[0.02] flex items-center justify-center text-xs font-semibold text-black/60">
                            {idx + 1}
                          </div>
                            <span className="text-sm font-medium text-black truncate">{displayName}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold text-brand-primary">{file.count}</span>
                          <span className="text-xs text-black/50">vues</span>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <AnimatePresence>
              {dashboardPrefs.visibleSections.security && stats && (
              <motion.div
                key="security-widget"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={widgetAnim}
                className="overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center">
                      <Shield className="w-5 h-5 text-black/60" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-black">Sécurité & anomalies</h3>
                      <p className="text-xs text-black/40">Surveillance des accès</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white border border-black/[0.05] hover:border-black/[0.1] transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black/[0.03] flex items-center justify-center group-hover:bg-black/[0.05] transition-colors">
                          <AlertTriangle className="w-6 h-6 text-black/50" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">Tentatives invalides</p>
                          <p className="text-xs text-black/40">Accès refusés</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-black tabular-nums">{stats.invalidAttempts}</p>
                      </div>
                    </div>

                    {/* Carte pour définir/modifier le mot de passe */}
                    <PasswordManagerCard linkId={linkData.id} currentPasswordHash={linkData.passwordHash} onUpdate={(hasPassword) => {
                      setLinkData(prev => ({ ...prev, passwordHash: hasPassword ? "***" : null }));
                    }} />
                  </div>
                </div>
              </motion.div>
              )}
              </AnimatePresence>

              <AnimatePresence>
              {dashboardPrefs.visibleSections.funnel && stats && stats.funnel && (
              <motion.div
                key="funnel-widget"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={widgetAnim}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 rounded-2xl border border-black/[0.06] bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-black">Funnel d&apos;engagement</h3>
                    <span className="text-[11px] text-black/40 uppercase tracking-[0.18em]">Conversion</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Vue → Téléchargement", value: stats.funnel.viewToDownload },
                      { label: "Vue → Fichier consulté", value: stats.funnel.viewToViewFile },
                      { label: "Vue → Dossier ouvert", value: stats.funnel.viewToOpenFolder },
                    ].map((item) => (
                      <div key={item.label} className="bg-black/[0.02] border border-black/[0.04] rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-black">{item.label}</p>
                          <span className="text-sm font-semibold text-black tabular-nums">{item.value.toFixed(1)}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-black/[0.04] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all"
                            style={{ width: `${Math.min(item.value, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
              )}
              </AnimatePresence>
            </div>
            )}

            {/* Colonne droite : analytics */}
            <div className={`space-y-5 ${hasLeftColumn ? "xl:col-span-2" : ""}`}>
              {/* Panel de gestion des widgets */}
              <AnimatePresence>
                {showWidgetPanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 bg-white border border-black/[0.08] rounded-2xl shadow-sm space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center">
                            <Settings className="w-5 h-5 text-black/50" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-black">Personnalisation</h3>
                            <p className="text-xs text-black/40 mt-0.5">{activeWidgetCount} widget{activeWidgetCount > 1 ? "s" : ""} actif{activeWidgetCount > 1 ? "s" : ""} sur {widgetItems.length}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowWidgetPanel(false)}
                          className="w-8 h-8 rounded-xl hover:bg-black/5 flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4 text-black/40" />
                        </button>
                      </div>

                      {/* Aperçu */}
                      <div className="space-y-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/30">Aperçu</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {widgetItems.filter(w => w.type === "card").map((widget) => {
                            const isActive = dashboardPrefs.visibleCards[widget.key];
                            return (
                              <button
                                key={widget.key}
                                onClick={() => toggleWidgetCard(widget.key)}
                                className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 text-center group ${
                                  isActive
                                    ? "bg-white text-black border-black/15 shadow-sm"
                                    : "bg-black/[0.02] text-black/30 border-transparent hover:border-black/[0.08] hover:text-black/50"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                  isActive ? "bg-brand-primary/10 text-brand-primary" : "bg-black/[0.04] text-black/20"
                                }`}>
                                  {widget.icon}
                                </div>
                                <p className="text-xs font-semibold">{widget.label}</p>
                                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full transition-colors ${isActive ? "bg-brand-primary" : "bg-black/10"}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sections */}
                      <div className="space-y-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/30">Sections</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                          {widgetItems.filter(w => w.type === "section").map((widget) => {
                            const isActive = dashboardPrefs.visibleSections[widget.key];
                            return (
                              <button
                                key={widget.key}
                                onClick={() => toggleWidgetSection(widget.key)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                                  isActive
                                    ? "bg-white text-black border-black/15 shadow-sm"
                                    : "bg-black/[0.02] text-black/30 border-transparent hover:border-black/[0.08] hover:text-black/50"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isActive ? "bg-brand-primary/10 text-brand-primary" : "bg-black/[0.04] text-black/20"
                                }`}>
                                  {widget.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold truncate">{widget.label}</p>
                                  <p className={`text-[11px] truncate ${isActive ? "text-black/40" : ""}`}>{widget.desc}</p>
                                </div>
                                <div className={`w-2 h-2 rounded-full shrink-0 transition-colors ${isActive ? "bg-brand-primary" : "bg-black/10"}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-black/[0.04]">
                        <button
                          onClick={resetWidgetPrefs}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-black/40 hover:text-black hover:bg-black/5 rounded-lg transition-all"
                        >
                          <RotateCw className="w-3 h-3" />
                          Réinitialiser
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnalyticsDashboard linkId={linkData.id} prefs={dashboardPrefs} />
            </div>
          </div>
          );
        })()}

        {activeTab === "Logs" && (
          <div>
            {loadingLogs && (
              <div className="mb-4 text-xs text-black/50 flex items-center gap-2 justify-end">
                <Loader2 className="w-4 h-4 animate-spin" />
                Chargement...
              </div>
            )}
            <LogsPageClient
              initialLogs={logs}
              linkContext={{ folderId: linkData.folderId, folderName: linkData.folderName }}
            />
          </div>
        )}
        </div>
      </div>

      {updating && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-black/[0.05]">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
      />
      <FileDownloadExceptionsModal
        isOpen={showFileExceptionsModal}
        onClose={() => setShowFileExceptionsModal(false)}
        linkId={linkData.id}
        initialExceptions={linkData.fileDownloadExceptions || []}
        onSave={handleSaveFileExceptions}
      />
    </div>
  );
}

