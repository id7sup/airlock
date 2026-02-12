import { getAdminUserDetailAction } from "@/lib/actions/admin";
import { AdminKPICard } from "@/components/admin/AdminKPICard";
import { AdminUserShareLinks } from "@/components/admin/AdminUserShareLinks";
import {
  HardDrive,
  FolderOpen,
  FileText,
  LinkIcon,
  Link2,
  Eye,
  Download,
  ArrowLeft,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatStorage(bytes: number): string {
  if (bytes === 0) return "0 Mo";
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(0)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return "Jamais";
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const data = await getAdminUserDetailAction(userId);
  const { user, stats, shareLinks } = data;

  const fullName =
    user.firstName || user.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : "Sans nom";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Back button */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-black/40 hover:text-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      {/* User header */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-black/[0.03] border border-black/[0.02] p-8">
        <div className="flex items-start gap-6">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-black/5 flex items-center justify-center text-2xl font-bold text-black/20">
              {(user.firstName?.[0] || user.email[0] || "?").toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-medium tracking-tight text-black">
              {fullName}
            </h1>
            <p className="text-[14px] text-black/40 mt-0.5">{user.email}</p>
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex items-center gap-2 text-[12px] text-black/30">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Inscrit le {formatDate(user.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-black/30">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Derniere connexion : {formatDate(user.lastSignInAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminKPICard
          label="Stockage"
          value={formatStorage(stats.storageUsed)}
          icon={HardDrive}
          subtitle="sur 5 Go"
        />
        <AdminKPICard
          label="Dossiers"
          value={stats.foldersCount}
          icon={FolderOpen}
        />
        <AdminKPICard
          label="Fichiers"
          value={stats.filesCount}
          icon={FileText}
        />
        <AdminKPICard
          label="Total liens"
          value={stats.linksCount}
          icon={LinkIcon}
          subtitle="actifs + revoques"
        />
        <AdminKPICard
          label="Liens actifs"
          value={stats.activeLinks}
          icon={Link2}
        />
        <AdminKPICard
          label="Vues totales"
          value={stats.totalViews}
          icon={Eye}
        />
        <AdminKPICard
          label="Telechargements"
          value={stats.totalDownloads}
          icon={Download}
        />
      </div>

      {/* Share Links */}
      <div>
        <h2 className="text-xl font-medium tracking-tight text-black mb-4">
          Liens de partage ({shareLinks.length})
        </h2>
        <AdminUserShareLinks links={shareLinks} />
      </div>
    </div>
  );
}
