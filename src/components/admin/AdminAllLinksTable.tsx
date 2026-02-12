"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

interface LinkRow {
  id: string;
  folderId: string;
  folderName: string;
  creatorId: string;
  creatorEmail: string;
  creatorName: string;
  viewCount: number;
  downloadCount: number;
  isRevoked: boolean;
  isActive: boolean;
  allowDownload: boolean;
  allowViewOnline: boolean;
  maxViews: number | null;
  createdAt: string;
  expiresAt: string | null;
}

type SortKey = "creatorName" | "folderName" | "viewCount" | "downloadCount" | "createdAt";
type SortDir = "asc" | "desc";

function getStatus(link: LinkRow): { label: string; color: string } {
  if (link.isRevoked) return { label: "Revoque", color: "bg-red-50 text-red-600" };
  if (link.expiresAt && new Date(link.expiresAt) < new Date())
    return { label: "Expire", color: "bg-gray-100 text-gray-500" };
  if (link.maxViews && link.viewCount >= link.maxViews)
    return { label: "Quota atteint", color: "bg-orange-50 text-orange-600" };
  return { label: "Actif", color: "bg-green-50 text-green-600" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PAGE_SIZE = 20;

export function AdminAllLinksTable({ links }: { links: LinkRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked" | "expired">("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    let result = links;

    // Filtre par statut
    if (statusFilter === "active") result = result.filter((l) => l.isActive);
    else if (statusFilter === "revoked") result = result.filter((l) => l.isRevoked);
    else if (statusFilter === "expired") result = result.filter((l) => !l.isActive && !l.isRevoked);

    // Filtre par recherche
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (l) =>
          l.creatorEmail.toLowerCase().includes(q) ||
          l.creatorName.toLowerCase().includes(q) ||
          l.folderName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [links, search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "creatorName":
          cmp = a.creatorName.localeCompare(b.creatorName);
          break;
        case "folderName":
          cmp = a.folderName.localeCompare(b.folderName);
          break;
        case "viewCount":
          cmp = a.viewCount - b.viewCount;
          break;
        case "downloadCount":
          cmp = a.downloadCount - b.downloadCount;
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  };

  const thClass =
    "text-left text-[10px] font-bold text-black/25 uppercase tracking-[0.15em] px-4 py-3 cursor-pointer hover:text-black/40 transition-colors select-none whitespace-nowrap";

  const filterButtons = [
    { key: "all" as const, label: "Tous" },
    { key: "active" as const, label: "Actifs" },
    { key: "revoked" as const, label: "Revoques" },
    { key: "expired" as const, label: "Expires" },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-black/[0.03] border border-black/[0.02] overflow-hidden">
      {/* Search + Filters */}
      <div className="p-5 border-b border-black/[0.04] space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Rechercher par utilisateur ou dossier..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f7] rounded-xl border border-black/[0.06] text-[14px] text-black placeholder:text-black/25 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
            />
          </div>
          <div className="flex gap-1.5">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => {
                  setStatusFilter(btn.key);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  statusFilter === btn.key
                    ? "bg-black text-white"
                    : "bg-black/5 text-black/40 hover:text-black hover:bg-black/10"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[12px] text-black/30 font-medium">
          {filtered.length} lien{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.04]">
              <th className={thClass} onClick={() => handleSort("creatorName")}>
                Createur
                <SortIcon col="creatorName" />
              </th>
              <th className={thClass} onClick={() => handleSort("folderName")}>
                Dossier
                <SortIcon col="folderName" />
              </th>
              <th className={thClass} onClick={() => handleSort("viewCount")}>
                Vues
                <SortIcon col="viewCount" />
              </th>
              <th className={thClass} onClick={() => handleSort("downloadCount")}>
                DL
                <SortIcon col="downloadCount" />
              </th>
              <th className={thClass}>Statut</th>
              <th className={thClass} onClick={() => handleSort("createdAt")}>
                Date
                <SortIcon col="createdAt" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((link) => {
              const status = getStatus(link);
              return (
                <tr
                  key={link.id}
                  onClick={() => router.push(`/admin/users/${link.creatorId}`)}
                  className="border-b border-black/[0.03] hover:bg-black/[0.02] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-black">{link.creatorName}</p>
                      <p className="text-[11px] text-black/30">{link.creatorEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-black/50 font-medium">
                    {link.folderName}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-black/60 font-medium">
                    {link.viewCount}
                    {link.maxViews ? <span className="text-black/25"> / {link.maxViews}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-black/60 font-medium">
                    {link.downloadCount}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-black/40">
                    {formatDate(link.createdAt)}
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[14px] text-black/30">
                  Aucun lien trouve
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-black/[0.04]">
          <p className="text-[12px] text-black/30 font-medium">
            Page {page + 1} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-[12px] font-medium rounded-lg bg-black/5 text-black/50 hover:bg-black/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Precedent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-[12px] font-medium rounded-lg bg-black/5 text-black/50 hover:bg-black/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
