"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { revokeShareLinkAction } from "@/lib/actions/sharing";
import { updateShareLinkAction } from "@/lib/actions/sharing_update";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ErrorModal } from "@/components/shared/ErrorModal";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { LogsPageClient } from "@/components/dashboard/LogsPageClient";
import { getNotificationsAction } from "@/lib/actions/notifications";
import type { NotificationType } from "@/services/notifications";

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
}

interface ExtendedStats {
  invalidAttempts: number;
  totalVPN: number;
  totalDatacenter: number;
  ipChanges: number;
  deviceChanges: number;
  recipientCount: number;
  reshares: number;
  topFiles: Array<{ fileId: string; fileName: string; count: number }>;
  funnel?: {
    viewToDownload: number;
    viewToViewFile: number;
    viewToOpenFolder: number;
  };
}

const tabs = ["Vue globale", "Logs", "Sécurité"];

export default function SharingDetailClient({ link }: { link: SharedLink }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("Vue globale");
  const [linkData, setLinkData] = useState(link);
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<"CSV" | "PDF" | null>(null);
  const [localMaxViews, setLocalMaxViews] = useState<string>(link.maxViews?.toString() || "");
  const [localExpiry, setLocalExpiry] = useState<string>(link.expiresAt ? new Date(link.expiresAt).toISOString().split('T')[0] : "");
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
  const [restrictDomain, setRestrictDomain] = useState(link.restrictDomain === true);
  const [blockVpn, setBlockVpn] = useState(link.blockVpn === true);
  const [notifications, setNotifications] = useState<string[]>(link.notifications || []);
  const [fileNameMap, setFileNameMap] = useState<Record<string, string>>({});
  const [blockedIps, setBlockedIps] = useState<string[]>(link.blockedIps || []);
  const [blockedDevices, setBlockedDevices] = useState<string[]>(link.blockedDevices || []);
  const [logs, setLogs] = useState<Array<{ id: string; type: NotificationType; metadata?: any; createdAt: string }>>(
    []
  );
  const [loadingLogs, setLoadingLogs] = useState(false);

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
    setLocalExpiry(linkData.expiresAt ? new Date(linkData.expiresAt).toISOString().split('T')[0] : "");
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

  useEffect(() => {
    const loadLogs = async () => {
      setLoadingLogs(true);
      try {
        const data = await getNotificationsAction(200);
        setLogs(data as any[]);
      } catch (error) {
        console.error("Erreur lors du chargement des logs:", error);
      } finally {
        setLoadingLogs(false);
      }
    };
    loadLogs();
  }, []);

  useEffect(() => {
    setNotifications(linkData.notifications || []);
    setBlockedIps(linkData.blockedIps || []);
    setBlockedDevices(linkData.blockedDevices || []);
    setRestrictDomain(linkData.restrictDomain === true);
    setBlockVpn(linkData.blockVpn === true);
  }, [linkData.maxViews, linkData.expiresAt]);

  useEffect(() => {
    const fetchExtendedStats = async () => {
      setLoadingStats(true);
      try {
        const response = await fetch(`/api/analytics/stats?days=9999&linkId=${link.id}&period=Max`);
        if (!response.ok) throw new Error("stats");
        const data = await response.json();
        const analyticsStats = data.stats;

        const geoResponse = await fetch(`/api/analytics/geolocation?days=30&linkId=${link.id}`);
        const geoData = geoResponse.ok ? await geoResponse.json() : { analytics: [] };
        const analytics = geoData.analytics || [];

        const invalidAttempts = analytics.filter((a: any) => a.invalidAttempt === true).length;
        const totalVPN = analytics.filter((a: any) => a.isVPN === true).length;
        const totalDatacenter = analytics.filter((a: any) => a.isDatacenter === true).length;
        const ipChanges = analytics.filter((a: any) => a.ipChanged === true).length;
        const deviceChanges = analytics.filter((a: any) => a.deviceChanged === true).length;

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
          totalVPN,
          totalDatacenter,
          ipChanges,
          deviceChanges,
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
    setUpdating(true);
    try {
      await updateShareLinkAction(linkData.id, { allowDownload: !linkData.allowDownload, downloadDefault: !linkData.allowDownload });
      setLinkData({ ...linkData, allowDownload: !linkData.allowDownload });
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
      const newDate = new Date(dateStr);
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
    const dateStr = selectedDate.toISOString().split('T')[0];
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
    const todayStr = today.toISOString().split('T')[0];
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
      message: `Le lien de partage "${linkData.folderName}" sera immédiatement désactivé.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          await revokeShareLinkAction(linkData.id);
          router.push("/dashboard/sharing");
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

  const handleBlockIp = async () => {
    const ip = prompt("IP à bannir ?");
    if (!ip) return;
    const next = Array.from(new Set([...blockedIps, ip]));
    setUpdating(true);
    try {
      await updateShareLinkAction(linkData.id, { blockedIps: next });
      setBlockedIps(next);
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Impossible de bannir cette IP",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleBlockDevice = async () => {
    const device = prompt("Identifiant appareil à bloquer ?");
    if (!device) return;
    const next = Array.from(new Set([...blockedDevices, device]));
    setUpdating(true);
    try {
      await updateShareLinkAction(linkData.id, { blockedDevices: next });
      setBlockedDevices(next);
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Impossible de bloquer cet appareil",
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
      <div className="max-w-[1700px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/sharing" className="text-sm text-black/60 hover:text-black flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Retour
            </Link>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.tone}`}>{statusBadge.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="h-10 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors flex items-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copié" : "Copier"}
            </button>
            <Link
              href={`/share/${linkData.token}`}
              target="_blank"
              className="h-10 px-4 rounded-xl bg-white border border-black/[0.08] text-sm font-medium hover:bg-black hover:text-white transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir
            </Link>
            <button
              onClick={handleRevoke}
              className="h-10 px-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Révoquer
            </button>
          </div>
        </div>

        {/* Identity row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shadow-sm">
            <FolderOpen className="w-6 h-6 fill-current" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-black">{linkData.folderName}</h1>
            <p className="text-sm text-black/50">
              Créé le{" "}
              {new Date(linkData.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-black/[0.05] pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                activeTab === tab ? "bg-black text-white" : "bg-white text-black/70 border border-black/[0.08] hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Vue globale" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
            {/* Colonne gauche : paramètres du lien */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-black/[0.06] bg-white shadow-sm space-y-3">
                <h2 className="text-base font-semibold text-black">Contrôles</h2>
                {[ 
                  { title: "Téléchargement", desc: linkData.allowDownload ? "Autorisé" : "Bloqué", icon: <Download className={`w-5 h-5 ${linkData.allowDownload ? "text-brand-primary" : "text-black/30"}`} />, toggle: linkData.allowDownload, onToggle: handleToggleDownload },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-4 p-4 rounded-2xl border border-black/[0.05] bg-white hover:border-black/10 transition-all">
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
                <div className="p-4 rounded-2xl border border-black/[0.05] bg-white hover:border-black/10 transition-all">
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
                <div className="p-4 rounded-2xl border border-black/[0.05] bg-white hover:border-black/10 transition-all">
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
                            ? new Date(localExpiry).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
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
                                const isSelected = localExpiry && date.toISOString().split('T')[0] === localExpiry;

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

                {/* Restrictions */}
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
              </div>

              <div className="p-4 rounded-2xl border border-black/[0.05] bg-white hover:border-black/10 transition-all">
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

              {loadingStats && (
                <div className="text-xs text-black/50 px-1">Chargement des statistiques...</div>
              )}

              {stats && stats.topFiles.length > 0 && (
                <div className="p-4 rounded-2xl border border-black/[0.06] bg-white shadow-sm space-y-3">
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

              {stats && (
                <div className="p-4 rounded-2xl border border-black/[0.06] bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-black">Sécurité & anomalies</h3>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-red-600">Surveillance</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                      <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wide">Tentatives invalides</p>
                      <p className="text-2xl font-semibold text-red-800 tabular-nums mt-1">{stats.invalidAttempts}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                      <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wide">VPN / DC</p>
                      <p className="text-2xl font-semibold text-red-800 tabular-nums mt-1">{stats.totalVPN + stats.totalDatacenter}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.05]">
                      <p className="text-[11px] font-semibold text-black/60 uppercase tracking-wide">Changements IP/Appareil</p>
                      <p className="text-2xl font-semibold text-black tabular-nums mt-1">{stats.ipChanges + stats.deviceChanges}</p>
                    </div>
                  </div>
                </div>
              )}

              {stats && stats.funnel && (
                <div className="p-4 rounded-2xl border border-black/[0.06] bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-black">Funnel d'engagement</h3>
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
              )}
            </div>

            {/* Analytics : span deux colonnes à droite */}
            <div className="space-y-5 xl:col-span-2">
              <AnalyticsDashboard linkId={linkData.id} />
            </div>
          </div>
        )}

        {activeTab === "Logs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Logs</h2>
              {loadingLogs && (
                <div className="text-xs text-black/50 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement...
                </div>
              )}
            </div>
            <LogsPageClient
              initialLogs={logs}
              linkContext={{ folderId: linkData.folderId, folderName: linkData.folderName }}
            />
          </div>
        )}

        {activeTab === "Sécurité" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black">Sécurité</h2>
            {stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: "Tentatives invalides", value: stats.invalidAttempts },
                  { label: "Datacenter / VPN", value: stats.totalVPN + stats.totalDatacenter },
                  { label: "Changements (IP/Device)", value: stats.ipChanges + stats.deviceChanges },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-black/[0.06] rounded-2xl p-3 shadow-sm">
                    <p className="text-xs font-semibold text-black/60 uppercase">{s.label}</p>
                    <p className="text-2xl font-semibold text-black mt-1">{s.value}</p>
                  </div>
                ))}
                <div className="bg-white border border-black/[0.06] rounded-2xl p-3 shadow-sm">
                  <p className="text-xs font-semibold text-black/60 uppercase">Actions rapides</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <Link
                      href={`/dashboard/sharing/logs?linkId=${linkData.id}`}
                      className="px-3 py-2 rounded-lg border border-black/[0.08] hover:bg-black/5"
                    >
                      Voir le détail
                    </Link>
                    <button onClick={handleBlockDevice} className="px-3 py-2 rounded-lg border border-black/[0.08] hover:bg-black/5">
                      Bloquer un appareil
                    </button>
                    <button onClick={handleBlockIp} className="px-3 py-2 rounded-lg border border-black/[0.08] hover:bg-black/5">
                      Bannir une IP
                    </button>
                  </div>
                  {(blockedIps.length > 0 || blockedDevices.length > 0) && (
                    <div className="mt-3 text-xs text-black/60 space-y-1">
                      {blockedIps.length > 0 && <p>IPs bannies : {blockedIps.join(", ")}</p>}
                      {blockedDevices.length > 0 && <p>Appareils bloqués : {blockedDevices.join(", ")}</p>}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-black/50">Chargement des données...</p>
            )}
          </div>
        )}

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
    </div>
  );
}

