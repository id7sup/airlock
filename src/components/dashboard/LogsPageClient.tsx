"use client";

import { useMemo, useState, useEffect, type ReactElement } from "react";
import {
  Eye,
  Download,
  Lock,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { NotificationType } from "@/services/notifications";

const PRIMARY = "#96A982";
const SECONDARY = "#B7C5A9";

type LogEntry = {
  id: string;
  type: NotificationType;
  metadata?: Record<string, any>;
  createdAt: string;
  isRead?: boolean;
};

type LogsPageClientProps = {
  initialLogs: LogEntry[];
  linkContext?: {
    folderId: string;
    folderName: string;
  } | null;
  visitorId?: string | null;
};

const typeConfig: Record<NotificationType, { label: string; icon: ReactElement; tone: string }> = {
  VIEW: {
    label: "Consultations",
    icon: <Eye className="w-4 h-4 text-[--primary]" />,
    tone: "bg-[--primary]/10 text-black/80 border-[--primary]/30",
  },
  DOWNLOAD: {
    label: "Téléchargements",
    icon: <Download className="w-4 h-4 text-[--primary]" />,
    tone: "bg-[--primary]/10 text-black/80 border-[--primary]/30",
  },
  EXPIRATION: {
    label: "Expiration",
    icon: <Clock className="w-4 h-4 text-[--primary]" />,
    tone: "bg-[--primary]/10 text-black/80 border-[--primary]/30",
  },
  PASSWORD_ACCESS: {
    label: "Mot de passe",
    icon: <Lock className="w-4 h-4 text-[--primary]" />,
    tone: "bg-[--primary]/10 text-black/80 border-[--primary]/30",
  },
  PASSWORD_DENIED: {
    label: "Accès refusé",
    icon: <ShieldAlert className="w-4 h-4 text-[--primary]" />,
    tone: "bg-[--primary]/10 text-black/80 border-[--primary]/30",
  },
};

function formatMessage(log: LogEntry) {
  const folder = log.metadata?.folderName || "Dossier partagé";
  const file = log.metadata?.fileName;
  const denialReason = log.metadata?.denialReason;

  switch (log.type) {
    case "VIEW":
      return `${folder} consulté`;
    case "DOWNLOAD":
      return file ? `${file} téléchargé` : "Téléchargement effectué";
    case "PASSWORD_ACCESS":
      return `Accès accordé via mot de passe (${folder})`;
    case "PASSWORD_DENIED":
      // Afficher la vraie raison du refus
      if (denialReason) {
        switch (denialReason) {
          case "PASSWORD_INCORRECT":
            return `Mot de passe incorrect pour ${folder}`;
          case "EXPIRED":
            return `Lien expiré pour ${folder}`;
          case "REVOKED":
            return `Lien révoqué pour ${folder}`;
          case "QUOTA_EXCEEDED":
            return `Quota de vues dépassé pour ${folder}`;
          case "VPN_BLOCKED":
            return `Accès refusé (VPN/Datacenter bloqué) pour ${folder}`;
          case "ACCESS_DISABLED":
            return `Accès désactivé pour ${folder}`;
          case "NOT_FOUND":
            return `Lien ou dossier introuvable pour ${folder}`;
          default:
            return `Accès refusé pour ${folder}`;
        }
      }
      // Fallback si pas de raison spécifiée
      return `Accès refusé pour ${folder}`;
    case "EXPIRATION":
      return `Lien expiré pour ${folder}`;
    default:
      return "Événement";
  }
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

type SortField = "date" | "type" | "details";
type SortDirection = "asc" | "desc";

export function LogsPageClient({ initialLogs, linkContext, visitorId }: LogsPageClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "ALL">("ALL");
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Utiliser le visitorId passé en prop ou depuis les query params
  const [visitorIdFilter, setVisitorIdFilter] = useState<string | null>(visitorId || null);
  
  useEffect(() => {
    if (visitorId) {
      setVisitorIdFilter(visitorId);
      // Pré-remplir la recherche avec le visitorId pour faciliter le filtrage
      setSearch(visitorId);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlVisitorId = params.get('visitorId');
      if (urlVisitorId) {
        setVisitorIdFilter(urlVisitorId);
        setSearch(urlVisitorId);
      }
    }
  }, [visitorId]);

  const filtered = useMemo(() => {
    const now = new Date();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const from = new Date(now);
    from.setDate(now.getDate() - days);

    const term = search.trim().toLowerCase();

    let result = initialLogs.filter((log) => {
      const createdAt = new Date(log.createdAt);
      if (Number.isNaN(createdAt.getTime()) || createdAt < from) return false;
      if (typeFilter !== "ALL" && log.type !== typeFilter) return false;

      // Filtrer par visitorId si spécifié (via metadata.visitorId)
      if (visitorIdFilter) {
        // Chercher dans les métadonnées
        const logVisitorId = log.metadata?.visitorId || '';
        // Si le log n'a pas de visitorId dans les métadonnées, l'exclure
        if (!logVisitorId || logVisitorId !== visitorIdFilter) {
          return false;
        }
      }

      if (!term) return true;
      const haystack = [
        formatMessage(log),
        log.metadata?.folderName,
        log.metadata?.fileName,
        log.metadata?.visitorId, // Inclure visitorId dans la recherche
        log.metadata?.ip, // Inclure IP dans la recherche
        log.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });

    // Tri
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "details":
          const aDetails = formatMessage(a);
          const bDetails = formatMessage(b);
          comparison = aDetails.localeCompare(bDetails);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [initialLogs, linkContext, period, search, typeFilter, sortField, sortDirection, visitorIdFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div
      className="w-full p-8 max-w-7xl mx-auto"
      style={{ ["--primary" as string]: PRIMARY, ["--secondary" as string]: SECONDARY }}
    >
      {/* En-tête avec bouton retour */}
      <div className="mb-6">
        <button
          onClick={() => {
            // Vérifier si on doit retourner au globe avec le tiroir ouvert
            const returnToGlobe = sessionStorage.getItem('returnToGlobe');
            if (returnToGlobe === 'true') {
              sessionStorage.removeItem('returnToGlobe');
              const savedDetail = sessionStorage.getItem('globeSelectedDetail');
              if (savedDetail) {
                // Sauvegarder pour restaurer le tiroir
                sessionStorage.setItem('restoreGlobeDetail', savedDetail);
              }
              // Retourner à la page de partage avec l'onglet live actif
              router.push('/dashboard/sharing?tab=live');
            } else {
              router.back();
            }
          }}
          className="flex items-center gap-2 text-sm font-medium text-black/60 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        
        {visitorId && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[--primary]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[--primary]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-black">Activité du visiteur</h1>
              <p className="text-sm text-black/50 font-mono mt-1">{visitorId}</p>
              <p className="text-sm text-black/40 mt-1">
                {filtered.length} {filtered.length === 1 ? "événement" : "événements"} trouvé{filtered.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
        
        {!visitorId && (
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-black">Logs d'activité</h1>
            <p className="text-sm text-black/50 mt-1">
              Historique complet des événements de partage
            </p>
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white border border-[--secondary]/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/[0.02] border-b border-black/[0.06]">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("date")}
                    className="flex items-center gap-2 text-xs font-semibold text-black/60 uppercase tracking-wider hover:text-black transition"
                  >
                    Date and time
                    {sortField === "date" && (
                      sortDirection === "desc" ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("type")}
                    className="flex items-center gap-2 text-xs font-semibold text-black/60 uppercase tracking-wider hover:text-black transition"
                  >
                    Change
                    {sortField === "type" && (
                      sortDirection === "desc" ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("details")}
                    className="flex items-center gap-2 text-xs font-semibold text-black/60 uppercase tracking-wider hover:text-black transition"
                  >
                    Details
                    {sortField === "details" && (
                      sortDirection === "desc" ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-black/60 uppercase tracking-wider">
                  Resource
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="text-sm text-black/50">
                      Aucun log pour ces filtres. Essayez d&apos;élargir la période ou de réinitialiser les filtres.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/[0.02] transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-black">{formatDateTime(log.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${typeConfig[log.type].tone}`}>
                          {typeConfig[log.type].icon}
                        </div>
                        <span className="text-sm font-semibold text-black">{typeConfig[log.type].label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-black">{formatMessage(log)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {log.metadata?.fileName && (
                          <span className="text-sm text-[--primary] font-medium underline cursor-pointer hover:text-[--primary]/80">
                            {log.metadata.fileName}
                          </span>
                        )}
                        {log.metadata?.folderName && (
                          <span className="text-sm text-black/60">{log.metadata.folderName}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-black/60">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-black/60">
              {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
              {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-black/10 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 transition"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border border-black/10 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 transition"
              >
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

