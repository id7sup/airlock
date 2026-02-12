"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ShareLink {
  id: string;
  folderId: string;
  viewCount: number;
  downloadCount: number;
  isRevoked: boolean;
  allowDownload: boolean;
  allowViewOnline: boolean;
  maxViews: number | null;
  createdAt: string;
  expiresAt: string | null;
}

type SortKey = "viewCount" | "downloadCount" | "createdAt";
type SortDir = "asc" | "desc";

function getStatus(link: ShareLink): { label: string; color: string } {
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminUserShareLinks({ links }: { links: ShareLink[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    return [...links].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
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
  }, [links, sortKey, sortDir]);

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

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl shadow-black/[0.03] border border-black/[0.02] p-10 text-center">
        <p className="text-[14px] text-black/30">Aucun lien de partage</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-black/[0.03] border border-black/[0.02] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.04]">
              <th className={thClass}>ID Lien</th>
              <th className={thClass}>Dossier</th>
              <th className={thClass} onClick={() => handleSort("viewCount")}>
                Vues
                <SortIcon col="viewCount" />
              </th>
              <th className={thClass} onClick={() => handleSort("downloadCount")}>
                Downloads
                <SortIcon col="downloadCount" />
              </th>
              <th className={thClass}>Statut</th>
              <th className={thClass}>Permissions</th>
              <th className={thClass} onClick={() => handleSort("createdAt")}>
                Date creation
                <SortIcon col="createdAt" />
              </th>
              <th className={thClass}>Expiration</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((link) => {
              const status = getStatus(link);
              return (
                <tr
                  key={link.id}
                  className="border-b border-black/[0.03] hover:bg-black/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-[12px] text-black/40 font-mono">
                    {link.id.slice(0, 12)}...
                  </td>
                  <td className="px-4 py-3 text-[12px] text-black/40 font-mono">
                    {link.folderId.slice(0, 12)}...
                  </td>
                  <td className="px-4 py-3 text-[13px] text-black/60 font-medium">
                    {link.viewCount}
                    {link.maxViews ? (
                      <span className="text-black/25"> / {link.maxViews}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-black/60 font-medium">
                    {link.downloadCount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {link.allowViewOnline && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-500 text-[10px] font-bold">
                          Vue
                        </span>
                      )}
                      {link.allowDownload && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-500 text-[10px] font-bold">
                          DL
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-black/40">
                    {formatDate(link.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-black/40">
                    {link.expiresAt ? formatDate(link.expiresAt) : "Illimite"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
