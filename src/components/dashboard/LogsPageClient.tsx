"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  Download,
  Lock,
  Bell,
  Clock,
  FolderOpen,
  ShieldAlert,
} from "lucide-react";
import type { NotificationType } from "@/services/notifications";
import Link from "next/link";

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
};

const typeConfig: Record<NotificationType, { label: string; icon: JSX.Element; tone: string }> = {
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

  switch (log.type) {
    case "VIEW":
      return `${folder} consulté`;
    case "DOWNLOAD":
      return file ? `${file} téléchargé` : "Téléchargement effectué";
    case "PASSWORD_ACCESS":
      return `Accès accordé via mot de passe (${folder})`;
    case "PASSWORD_DENIED":
      return `Mot de passe incorrect pour ${folder}`;
    case "EXPIRATION":
      return `Lien expiré pour ${folder}`;
    default:
      return "Événement";
  }
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

export function LogsPageClient({ initialLogs, linkContext }: LogsPageClientProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "ALL">("ALL");
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const filtered = useMemo(() => {
    const now = new Date();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const from = new Date(now);
    from.setDate(now.getDate() - days);

    const term = search.trim().toLowerCase();

    return initialLogs.filter((log) => {
      const createdAt = new Date(log.createdAt);
      if (Number.isNaN(createdAt.getTime()) || createdAt < from) return false;
      if (typeFilter !== "ALL" && log.type !== typeFilter) return false;

      if (linkContext) {
        const folderId = log.metadata?.folderId || log.metadata?.folderID;
        if (folderId && folderId !== linkContext.folderId) return false;
      }

      if (!term) return true;
      const haystack = [
        formatMessage(log),
        log.metadata?.folderName,
        log.metadata?.fileName,
        log.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [initialLogs, linkContext, period, search, typeFilter]);

  const stats = useMemo(() => {
    const base = { total: filtered.length, views: 0, downloads: 0, passwords: 0, expirations: 0, denied: 0 };
    filtered.forEach((log) => {
      if (log.type === "VIEW") base.views++;
      if (log.type === "DOWNLOAD") base.downloads++;
      if (log.type === "PASSWORD_ACCESS") base.passwords++;
      if (log.type === "EXPIRATION") base.expirations++;
      if (log.type === "PASSWORD_DENIED") base.denied++;
    });
    return base;
  }, [filtered]);

  const grouped = useMemo(() => {
    const groups: Record<string, LogEntry[]> = {};
    filtered.forEach((log) => {
      const key = formatDateLabel(log.createdAt);
      groups[key] = groups[key] || [];
      groups[key].push(log);
    });
    return Object.entries(groups).sort(
      (a, b) => new Date(b[1][0].createdAt).getTime() - new Date(a[1][0].createdAt).getTime()
    );
  }, [filtered]);

  return (
    <div
      className="max-w-6xl mx-auto px-6 py-8 space-y-6"
      style={{ ["--primary" as string]: PRIMARY, ["--secondary" as string]: SECONDARY }}
    >
      <div className="bg-white rounded-3xl border border-[--primary]/30 shadow-sm p-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-[--primary] bg-[--primary]/10 border border-[--primary]/20 uppercase tracking-[0.25em]">
            Journal de sécurité
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-black">Logs d&apos;activité</h1>
            {linkContext && (
              <span className="px-3 py-1 rounded-full bg-[--secondary]/40 text-black text-xs font-semibold border border-[--secondary]/60">
                Lien actuel · {linkContext.folderName}
              </span>
            )}
          </div>
          <p className="text-sm text-black/60">Tous les événements de ce partage.</p>
        </div>
        <Link
          href="/dashboard/sharing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white shadow-sm hover:shadow-md transition text-sm font-medium text-black"
        >
          <FolderOpen className="w-4 h-4 text-[--primary]" />
          Mes partages
        </Link>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<Bell className="w-5 h-5 text-white" />}
          accent="bg-[--primary] text-white border-[--primary]"
        />
        <StatCard
          title="Consultations"
          value={stats.views}
          icon={<Eye className="w-5 h-5 text-[--primary]" />}
          accent="bg-[--primary]/10 border-[--primary]/30"
        />
        <StatCard
          title="Téléchargements"
          value={stats.downloads}
          icon={<Download className="w-5 h-5 text-[--primary]" />}
          accent="bg-[--primary]/10 border-[--primary]/30"
        />
        <StatCard
          title="Accès protégés"
          value={stats.passwords}
          icon={<Lock className="w-5 h-5 text-[--primary]" />}
          accent="bg-[--primary]/10 border-[--primary]/30"
        />
        <StatCard
          title="Mots de passe refusés"
          value={stats.denied}
          icon={<ShieldAlert className="w-5 h-5 text-[--primary]" />}
          accent="bg-[--primary]/10 border-[--primary]/30"
        />
      </div>

      <div className="bg-white border border-[--secondary]/60 rounded-3xl shadow-sm">
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[--primary]/15 text-[--primary] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black">Timeline d&apos;activité</p>
                <p className="text-xs text-black/50">Événements regroupés par jour, du plus récent au plus ancien.</p>
              </div>
            </div>
            <div className="text-xs font-semibold text-black/40 uppercase tracking-[0.2em]">{filtered.length} entrées</div>
          </div>

          {filtered.length === 0 && (
            <div className="border border-dashed border-[--primary]/40 rounded-2xl p-10 text-center text-sm text-black/50 bg-[--primary]/5">
              Aucun log pour ces filtres. Essayez d&apos;élargir la période ou de réinitialiser les filtres.
            </div>
          )}

          {grouped.map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-black/[0.06]">
                <span className="w-2 h-2 rounded-full bg-[--primary]" />
                <span className="text-xs font-semibold uppercase text-black/60 tracking-[0.18em]">{dateLabel}</span>
              </div>
              <div className="relative pl-6 space-y-3">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-black/[0.08]" />
                {items
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((log, index) => (
                    <div key={log.id} className="relative">
                      <div className="absolute left-[-22px] top-5 w-3 h-3 rounded-full bg-white border-2 border-[--primary] z-10" />
                      <div className="bg-black/[0.02] border border-black/[0.06] rounded-2xl p-4 shadow-sm hover:shadow-md transition hover:border-[--primary]/30">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${typeConfig[log.type].tone}`}
                            >
                              {typeConfig[log.type].icon}
                            </div>
                            <div className="space-y-2 min-w-0 flex-1">
                              <p className="text-sm font-semibold text-black">{formatMessage(log)}</p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {log.metadata?.folderName && (
                                  <span className="px-2 py-1 rounded-lg bg-[--secondary]/30 border border-[--secondary]/60 text-black font-medium">
                                    {log.metadata.folderName}
                                  </span>
                                )}
                                {log.metadata?.fileName && (
                                  <span className="px-2 py-1 rounded-lg bg-[--secondary]/30 border border-[--secondary]/60 text-black font-medium">
                                    {log.metadata.fileName}
                                  </span>
                                )}
                                <span className="px-2 py-1 rounded-lg bg-[--primary]/10 border border-[--primary]/30 text-black font-medium">
                                  {typeConfig[log.type].label}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-black/50 uppercase tracking-tight shrink-0">
                            {formatTime(log.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function StatCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: number;
  icon: JSX.Element;
  accent: string;
}) {
  return (
    <div className="p-4 rounded-2xl border border-black/[0.06] bg-white shadow-sm flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>{icon}</div>
      <div>
        <div className="text-xs font-semibold text-black/50 uppercase tracking-[0.2em]">{title}</div>
        <div className="text-xl font-semibold text-black">{value}</div>
      </div>
    </div>
  );
}

