"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronUp, ChevronDown, ChevronRight } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  createdAt: number;
  lastSignInAt: number | null;
  storageUsed: number;
  linksCount: number;
  workspaceId: string | null;
}

type SortKey = "name" | "email" | "storageUsed" | "linksCount" | "lastSignInAt" | "createdAt";
type SortDir = "asc" | "desc";

function formatStorage(bytes: number): string {
  if (bytes === 0) return "0 Mo";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return "Jamais";
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days}j`;
  const months = Math.floor(days / 30);
  return `Il y a ${months} mois`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PAGE_SIZE = 20;

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

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
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    );
  }, [users, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "storageUsed":
          cmp = a.storageUsed - b.storageUsed;
          break;
        case "linksCount":
          cmp = a.linksCount - b.linksCount;
          break;
        case "lastSignInAt":
          cmp = (a.lastSignInAt || 0) - (b.lastSignInAt || 0);
          break;
        case "createdAt":
          cmp = a.createdAt - b.createdAt;
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

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-black/[0.03] border border-black/[0.02] overflow-hidden">
      {/* Search bar */}
      <div className="p-5 border-b border-black/[0.04]">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f7] rounded-xl border border-black/[0.06] text-[14px] text-black placeholder:text-black/25 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
          />
        </div>
        <p className="text-[12px] text-black/30 mt-2 font-medium">
          {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.04]">
              <th className={thClass} onClick={() => handleSort("name")}>
                Utilisateur
                <SortIcon col="name" />
              </th>
              <th className={thClass} onClick={() => handleSort("email")}>
                Email
                <SortIcon col="email" />
              </th>
              <th className={thClass} onClick={() => handleSort("storageUsed")}>
                Stockage
                <SortIcon col="storageUsed" />
              </th>
              <th className={thClass} onClick={() => handleSort("linksCount")}>
                Liens
                <SortIcon col="linksCount" />
              </th>
              <th className={thClass} onClick={() => handleSort("lastSignInAt")}>
                Derniere connexion
                <SortIcon col="lastSignInAt" />
              </th>
              <th className={thClass} onClick={() => handleSort("createdAt")}>
                Inscription
                <SortIcon col="createdAt" />
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {paged.map((user) => (
              <tr
                key={user.id}
                onClick={() => router.push(`/admin/users/${user.id}`)}
                className="border-b border-black/[0.03] hover:bg-black/[0.02] cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt=""
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-[11px] font-bold text-black/30">
                        {(user.firstName?.[0] || user.email[0] || "?").toUpperCase()}
                      </div>
                    )}
                    <span className="text-[14px] font-medium text-black">
                      {user.firstName || user.lastName
                        ? `${user.firstName} ${user.lastName}`.trim()
                        : "Sans nom"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-black/50">
                  {user.email}
                </td>
                <td className="px-4 py-3.5 text-[13px] text-black/50 font-medium">
                  {formatStorage(user.storageUsed)}
                </td>
                <td className="px-4 py-3.5 text-[13px] text-black/50 font-medium">
                  {user.linksCount}
                </td>
                <td className="px-4 py-3.5 text-[13px] text-black/50">
                  {formatRelativeTime(user.lastSignInAt)}
                </td>
                <td className="px-4 py-3.5 text-[13px] text-black/50">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-3 py-3.5">
                  <ChevronRight className="w-4 h-4 text-black/15 group-hover:text-black/40 transition-colors" />
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[14px] text-black/30">
                  Aucun utilisateur trouv&eacute;
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
