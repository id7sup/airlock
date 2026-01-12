"use client";

import { useEffect, useMemo, useState } from "react";
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
  Copy,
  CheckCircle2
} from "lucide-react";
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
  restrictCountry?: boolean;
  blockVpn?: boolean;
  allowedCountries?: string[];
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
}

const tabs = ["Vue globale", "Logs", "Sécurité"];

export default function SharingDetailClient({ link }: { link: SharedLink }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("Vue globale");
  const [linkData, setLinkData] = useState(link);
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingField, setEditingField] = useState<"views" | "expiry" | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [restrictDomain, setRestrictDomain] = useState(link.restrictDomain === true);
  const [restrictCountry, setRestrictCountry] = useState(link.restrictCountry === true);
  const [blockVpn, setBlockVpn] = useState(link.blockVpn === true);
  const [allowedCountries, setAllowedCountries] = useState<string[]>(link.allowedCountries || []);
  const [countryInput, setCountryInput] = useState<string>((link.allowedCountries || []).join(", "));
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
    setRestrictCountry(linkData.restrictCountry === true);
    setBlockVpn(linkData.blockVpn === true);
    setAllowedCountries(linkData.allowedCountries || []);
    setCountryInput((linkData.allowedCountries || []).join(", "));
  }, [linkData.maxViews, linkData.expiresAt]);

  useEffect(() => {
    const fetchExtendedStats = async () => {
      setLoadingStats(true);
      try {
        const response = await fetch(`/api/analytics/stats?days=30&linkId=${link.id}`);
        if (!response.ok) throw new Error("stats");
        const data = await response.json();

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
        message: "Erreur lors de la mise à jour de l'expiration",
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
          message: "Le quota de vues ne peut pas être négatif",
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

  const handleExport = async (format: "CSV" | "PDF" | "WEBHOOK") => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/analytics/geolocation?days=30&linkId=${linkData.id}`);
      if (!res.ok) throw new Error("analytics");
      const payload = await res.json();
      const analytics = payload.analytics || [];

      if (format === "WEBHOOK") {
        alert("Webhook à configurer (placeholder).");
      } else if (format === "CSV" || format === "PDF") {
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
      }
    } catch (e) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Export impossible pour le moment",
      });
    } finally {
      setUpdating(false);
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
                  <div key={item.title} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.05]">
                    <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black">{item.title}</p>
                      <p className="text-xs text-black/50">{item.desc}</p>
                    </div>
                    <button
                      onClick={item.onToggle}
                      className={`w-11 h-5 rounded-full transition-all relative shrink-0 ${item.toggle ? "bg-brand-primary" : "bg-black/15"}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${item.toggle ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                ))}

                {/* Quota */}
                <div className="flex items-center gap-3 p-3 bg-black/[0.02] rounded-xl border border-black/[0.05]">
                  <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-black/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black">Quota de vues</p>
                    <p className="text-xs text-black/50">{linkData.maxViews ? `${linkData.viewCount} / ${linkData.maxViews}` : "Illimité"}</p>
                  </div>
                  {editingField === "views" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        autoFocus
                        type="number"
                        min="0"
                        placeholder="∞"
                        defaultValue={linkData.maxViews || ""}
                        onBlur={(e) => handleUpdateMaxViews(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateMaxViews((e.target as HTMLInputElement).value);
                          if (e.key === "Escape") setEditingField(null);
                        }}
                        className="w-16 text-center text-xs font-medium bg-white border border-brand-primary rounded-lg py-2 outline-none"
                      />
                      <button onClick={() => setEditingField(null)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                        <CloseIcon className="w-4 h-4 text-black/40" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingField("views")}
                      className="px-3 py-2 bg-white border border-black/10 rounded-lg hover:bg-black hover:text-white hover:border-black transition-all text-xs font-medium shrink-0"
                    >
                      Modifier
                    </button>
                  )}
                </div>

                {/* Expiration */}
                <div className="flex items-center gap-3 p-3 bg-black/[0.02] rounded-xl border border-black/[0.05]">
                  <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-black/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black">Expiration</p>
                    <p className="text-xs text-black/50" suppressHydrationWarning>
                      {linkData.expiresAt
                        ? new Date(linkData.expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                        : "Aucune limite"}
                    </p>
                  </div>
                  {editingField === "expiry" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        autoFocus
                        type="date"
                        onChange={(e) => handleUpdateExpiry(e.target.value)}
                        onBlur={(e) => !e.target.value && setEditingField(null)}
                        className="text-xs font-medium bg-white border border-brand-primary rounded-lg px-3 py-2 outline-none"
                      />
                      <button onClick={() => setEditingField(null)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                        <CloseIcon className="w-4 h-4 text-black/40" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingField("expiry")}
                      className="px-3 py-2 bg-white border border-black/10 rounded-lg hover:bg-black hover:text-white hover:border-black transition-all text-xs font-medium shrink-0"
                      suppressHydrationWarning
                    >
                      Modifier
                    </button>
                  )}
                </div>

                {/* Restrictions */}
                <div className="space-y-3 pt-2 border-t border-black/[0.04]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black">Restrictions</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Pays autorisés */}
                    <div className="p-3 bg-black/[0.02] border border-black/[0.05] rounded-2xl space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-black">Pays autorisés</p>
                          <p className="text-xs text-black/50">
                            Laissez vide pour autoriser tous les pays. Codes ISO2 (FR, BE, CA...).
                          </p>
                        </div>
                      </div>
                      {allowedCountries.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {allowedCountries.map((c) => (
                            <span
                              key={c}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.08] bg-white text-xs font-semibold"
                            >
                              {c}
                              <button
                                onClick={async () => {
                                  const nextList = allowedCountries.filter((x) => x !== c);
                                  const shouldRestrict = nextList.length > 0;
                                  setUpdating(true);
                                  try {
                                    await updateShareLinkAction(linkData.id, {
                                      allowedCountries: nextList,
                                      restrictCountry: shouldRestrict,
                                    });
                                    setAllowedCountries(nextList);
                                    setRestrictCountry(shouldRestrict);
                                    setLinkData((prev) => ({ ...prev, allowedCountries: nextList }));
                                  } catch {
                                    setErrorModal({
                                      isOpen: true,
                                      title: "Erreur",
                                      message: "Impossible d'enregistrer les pays",
                                    });
                                  } finally {
                                    setUpdating(false);
                                  }
                                }}
                                className="text-black/50 hover:text-black"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ajouter un pays (ex: FR)"
                            value={countryInput}
                            onChange={(e) => setCountryInput(e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-2 rounded-lg border border-black/[0.08] text-sm"
                          />
                          <button
                            onClick={async () => {
                              const raw = countryInput.trim().toUpperCase();
                              if (!raw) return;
                              if (allowedCountries.includes(raw)) {
                                setCountryInput("");
                                return;
                              }
                              const nextList = [...allowedCountries, raw];
                              const shouldRestrict = nextList.length > 0;
                              setUpdating(true);
                              try {
                                await updateShareLinkAction(linkData.id, {
                                  allowedCountries: nextList,
                                  restrictCountry: shouldRestrict,
                                });
                                setAllowedCountries(nextList);
                                setRestrictCountry(shouldRestrict);
                                setLinkData((prev) => ({ ...prev, allowedCountries: nextList }));
                              } catch {
                                setErrorModal({
                                  isOpen: true,
                                  title: "Erreur",
                                  message: "Impossible d'enregistrer les pays",
                                });
                              } finally {
                                setUpdating(false);
                                setCountryInput("");
                              }
                            }}
                            className="px-3 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-black/90"
                          >
                            Ajouter
                          </button>
                        </div>
                        <p className="text-[11px] text-black/40">Laisser vide = tous les pays.</p>
                      </div>
                    </div>

                    {/* Blocage VPN / datacenter */}
                    <div className="p-3 bg-black/[0.02] border border-black/[0.05] rounded-2xl space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-black">Bloquer datacenters/VPN</p>
                          <p className="text-xs text-black/50">Détection automatique</p>
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
                          className={`w-11 h-5 rounded-full transition-all relative ${blockVpn ? "bg-brand-primary" : "bg-black/15"}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${blockVpn ? "translate-x-6" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-black/[0.06] bg-white shadow-sm space-y-3">
                <h3 className="text-base font-semibold text-black">Export</h3>
                <p className="text-xs text-black/50">Télécharger les événements de ce partage</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {(["CSV", "PDF"] as const).map((x) => (
                    <button
                      key={x}
                      onClick={() => handleExport(x)}
                      className="px-3 py-2 rounded-lg border border-black/[0.08] hover:bg-black/5 bg-white"
                    >
                      {x}
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

