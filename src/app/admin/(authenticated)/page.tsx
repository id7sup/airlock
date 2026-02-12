import { getAdminOverviewAction, getAdminUsersListAction } from "@/lib/actions/admin";
import { AdminKPICard } from "@/components/admin/AdminKPICard";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import {
  Users,
  FileText,
  FolderOpen,
  HardDrive,
  Link2,
  LinkIcon,
  Eye,
  Download,
} from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

function formatStorage(bytes: number): string {
  if (bytes === 0) return "0 Mo";
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(0)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

export default async function AdminOverviewPage() {
  const [overview, users] = await Promise.all([
    getAdminOverviewAction(),
    getAdminUsersListAction(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-black">
          Dashboard
        </h1>
        <p className="text-black/40 text-sm font-medium mt-1">
          Vue d&apos;ensemble de la plateforme Airlock
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminKPICard
          label="Utilisateurs"
          value={overview.totalUsers}
          icon={Users}
        />
        <AdminKPICard
          label="Fichiers"
          value={overview.totalFiles}
          icon={FileText}
        />
        <AdminKPICard
          label="Dossiers"
          value={overview.totalFolders}
          icon={FolderOpen}
        />
        <AdminKPICard
          label="Stockage total"
          value={formatStorage(overview.totalStorage)}
          icon={HardDrive}
        />
        <AdminKPICard
          label="Liens crees"
          value={overview.totalLinksCreated}
          icon={LinkIcon}
          subtitle="historique total"
        />
        <AdminKPICard
          label="Liens actifs"
          value={overview.activeLinks}
          icon={Link2}
          subtitle="non revoques / non expires"
        />
        <AdminKPICard
          label="Vues totales"
          value={overview.totalViews}
          icon={Eye}
        />
        <AdminKPICard
          label="Telechargements"
          value={overview.totalDownloads}
          icon={Download}
        />
      </div>

      {/* Users Table (preview) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium tracking-tight text-black">
            Utilisateurs recents
          </h2>
          <Link
            href="/admin/users"
            className="flex items-center gap-1 text-[13px] font-medium text-black/40 hover:text-black transition-colors"
          >
            Voir tous
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <AdminUsersTable users={users} />
      </div>
    </div>
  );
}
