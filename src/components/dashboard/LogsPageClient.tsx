"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  Download,
  Lock,
  Bell,
  Search,
  Filter,
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
          <p className="text-sm text-black/60">
            Tous les événements de ce partage (mêmes données que les notifications), avec filtres, recherche et timeline.
          </p>
        </div>
        <Link
          href="/dashboard/sharing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white shadow-sm hover:shadow-md transition text-sm font-medium text-black"
        >
          <FolderOpen className="w-4 h-4 text-black/60" />
          Mes partages
        </Link>
      </div>

      <div className="bg-white border border-[--secondary]/60 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-[--primary]/10 text-xs font-semibold text-black border border-[--primary]/20">
              {filtered.length} logs
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <div className="flex bg-black/[0.03] rounded-xl p-1 border border-black/[0.06]">
              {(["7d", "30d", "90d"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    period === value
                      ? "bg-[--primary] text-white shadow-sm"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  {value === "7d" ? "7 jours" : value === "30d" ? "30 jours" : "90 jours"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-black/30 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un dossier, fichier ou événement..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/[0.02] border border-black/[0.05] focus:bg-white focus:border-[--primary]/40 outline-none transition text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-3 py-2 rounded-xl text-sm border transition ${
                typeFilter === "ALL"
                  ? "bg-[--primary] text-white border-[--primary]"
                  : "bg-white border-black/[0.08] text-black/70 hover:border-black/20"
              }`}
            >
              Tous les types
            </button>
            {(Object.keys(typeConfig) as NotificationType[]).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-xl text-sm border transition inline-flex items-center gap-2 ${
                  typeFilter === type
                    ? "bg-[--primary] text-white border-[--primary]"
                    : "bg-white border-black/[0.08] text-black/70 hover:border-black/20"
                }`}
              >
                {typeConfig[type].icon}
                {typeConfig[type].label}
              </button>
            ))}
          </div>
        </div>
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[--primary] text-white flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Timeline complète</p>
              <p className="text-xs text-black/50">Logs triés par date, identiques aux notifications.</p>
            </div>
          </div>
          <div className="text-xs font-semibold text-black/40 uppercase tracking-[0.2em]">
            {filtered.length} entrées
          </div>
        </div>

        <div className="p-5 space-y-4">
          {filtered.length === 0 && (
            <div className="border border-dashed border-[--primary]/40 rounded-2xl p-10 text-center text-sm text-black/50 bg-[--primary]/5">
              Aucun log pour ces filtres. Essayez d&apos;élargir la période ou de réinitialiser les filtres.
            </div>
          )}

          {grouped.map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-3">
              <div className="text-xs font-semibold uppercase text-black/40 tracking-[0.2em]">{dateLabel}</div>
              <div className="space-y-2">
                {items
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-2xl border border-black/[0.04] bg-white flex gap-3 items-start shadow-[0_12px_40px_-24px_rgba(0,0,0,0.25)]"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${typeConfig[log.type].tone}`}
                      >
                        {typeConfig[log.type].icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 justify-between">
                          <div className="space-y-1 min-w-0">
                            <p className="text-sm font-semibold text-black line-clamp-2">{formatMessage(log)}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-black/60">
                              {log.metadata?.folderName && (
                                <span className="px-2 py-1 rounded-lg bg-[--secondary]/30 border border-[--secondary]/60 text-black">
                                  {log.metadata.folderName}
                                </span>
                              )}
                              {log.metadata?.fileName && (
                                <span className="px-2 py-1 rounded-lg bg-[--secondary]/30 border border-[--secondary]/60 text-black">
                                  {log.metadata.fileName}
                                </span>
                              )}
                              <span className="px-2 py-1 rounded-lg bg-[--primary]/10 border border-[--primary]/30 text-black">
                                {typeConfig[log.type].label}
                              </span>
                            </div>
                          </div>
                          <div className="text-[11px] font-semibold text-black/40 uppercase tracking-tight">
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
