"use client";

import { useEffect, useState } from "react";
import { 
  Eye, 
  Download, 
  FolderOpen, 
  FileText, 
  ShieldAlert,
  Users,
  TrendingUp,
  Globe,
  Clock,
  AlertTriangle,
  BarChart3,
  Activity
} from "lucide-react";
import { Loader2 } from "lucide-react";

interface AnalyticsStats {
  totals: {
    openShare: number;
    openFolder: number;
    viewFile: number;
    downloadFile: number;
    accessDenied: number;
  };
  uniques: {
    last24h: number;
    last7d: number;
    total: number;
    viewsPerVisitor: number;
    newVsReturning: {
      new: number;
      returning: number;
    };
  };
  topCountries: Array<{ country: string; count: number; percentage: number }>;
  topCities: Array<{ city: string; country: string; count: number; percentage: number }>;
  referrers: Array<{ category: string; count: number; percentage: number }>;
  funnel: {
    viewToDownload: number;
    viewToViewFile: number;
    viewToOpenFolder: number;
  };
  hotMoments: {
    activityByHour: Array<{ hour: number; count: number }>;
    peakActivity: { time: string; count: number };
    lastActivity: string | null;
  };
  security: {
    totalDenials: number;
    denials24h: number;
    topDenialCountries: Array<{ country: string; count: number }>;
    unusualCountries: string[];
  };
  topFiles: {
    viewed: Array<{ fileId: string; fileName: string; count: number }>;
    downloaded: Array<{ fileId: string; fileName: string; count: number }>;
    conversionRate: Array<{ fileId: string; fileName: string; rate: number }>;
  };
}

interface AnalyticsDashboardProps {
  linkId?: string | null;
}

export function AnalyticsDashboard({ linkId }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const url = linkId 
          ? `/api/analytics/stats?days=30&linkId=${linkId}`
          : `/api/analytics/stats?days=30`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [linkId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  const formatTimeAgo = (isoString: string | null) => {
    if (!isoString) return "Jamais";
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `Il y a ${seconds} sec`;
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return date.toLocaleDateString("fr-FR");
  };

  const totalEvents = stats.totals.openShare + stats.totals.openFolder + stats.totals.viewFile + stats.totals.downloadFile;

  return (
    <div className="space-y-6">
      {/* Header avec métriques principales - Style moderne */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Visiteurs uniques"
          value={stats.uniques.total}
          subtitle={`${stats.uniques.last24h} aujourd'hui`}
          color="blue"
          trend={stats.uniques.last24h > 0 ? "up" : "neutral"}
        />
        <MetricCard
          icon={Eye}
          label="Vues totales"
          value={stats.totals.openShare}
          subtitle={`${stats.uniques.viewsPerVisitor.toFixed(1)} par visiteur`}
          color="purple"
        />
        <MetricCard
          icon={Download}
          label="Téléchargements"
          value={stats.totals.downloadFile}
          subtitle={`${stats.funnel.viewToDownload.toFixed(1)}% conversion`}
          color="green"
        />
        <MetricCard
          icon={Activity}
          label="Événements"
          value={totalEvents}
          subtitle={formatTimeAgo(stats.hotMoments.lastActivity)}
          color="orange"
        />
      </div>

      {/* Graphique d'activité par heure - Style moderne */}
      <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold tracking-tight mb-1">Activité en temps réel</h3>
            <p className="text-sm text-gray-500">Pic d'activité à {stats.hotMoments.peakActivity.time}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-600">En direct</span>
          </div>
        </div>
        <ActivityChart data={stats.hotMoments.activityByHour} />
      </div>

      {/* Grid avec métriques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Countries avec graphique */}
        <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Top Pays</h3>
              <p className="text-xs text-gray-500">{stats.topCountries.length} pays</p>
            </div>
          </div>
          <div className="space-y-4">
            {stats.topCountries.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{item.country}</span>
                    <span className="text-sm font-bold text-gray-600">{item.count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel d'engagement */}
        <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-xl">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Funnel d'engagement</h3>
              <p className="text-xs text-gray-500">Taux de conversion</p>
            </div>
          </div>
          <div className="space-y-5">
            <FunnelItem
              label="Vue → Téléchargement"
              value={stats.funnel.viewToDownload}
              color="blue"
            />
            <FunnelItem
              label="Vue → Fichier consulté"
              value={stats.funnel.viewToViewFile}
              color="green"
            />
            <FunnelItem
              label="Vue → Dossier ouvert"
              value={stats.funnel.viewToOpenFolder}
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Sources de trafic */}
      {stats.referrers.length > 0 && (
        <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Sources de trafic</h3>
              <p className="text-xs text-gray-500">D'où viennent vos visiteurs</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.referrers.slice(0, 8).map((item, idx) => (
              <div key={idx} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
                <p className="text-2xl font-bold tracking-tight mb-1">{item.count}</p>
                <p className="text-xs font-medium text-gray-600 mb-1">{item.category}</p>
                <p className="text-xs text-gray-400">{item.percentage.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sécurité & Anomalies */}
      {stats.security.totalDenials > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl border border-red-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-red-900">Sécurité & Anomalies</h3>
              <p className="text-xs text-red-700">{stats.security.totalDenials} refus total • {stats.security.denials24h} (24h)</p>
            </div>
          </div>
          {stats.security.unusualCountries.length > 0 && (
            <div className="mt-4 p-4 bg-white/60 rounded-2xl border border-red-200">
              <p className="text-sm font-medium text-red-800 mb-2">⚠️ Pays inhabituels détectés:</p>
              <div className="flex flex-wrap gap-2">
                {stats.security.unusualCountries.map((country, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-xl text-xs font-medium">
                    {country}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  subtitle,
  color,
  trend
}: { 
  icon: any; 
  label: string; 
  value: number; 
  subtitle?: string;
  color: string;
  trend?: "up" | "down" | "neutral";
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-white rounded-2xl border border-black/[0.05] p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 ${colorClasses[color as keyof typeof colorClasses]} rounded-xl`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend === "up" && (
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight mb-1">{value.toLocaleString()}</p>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}

function ActivityChart({ data }: { data: Array<{ hour: number; count: number }> }) {
  const maxCount = Math.max(...data.map(h => h.count), 1);
  
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((item, idx) => {
        const height = (item.count / maxCount) * 100;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center group">
            <div 
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
              style={{ height: `${height}%` }}
            />
            <span className="text-xs text-gray-400 mt-2 group-hover:text-gray-600 transition-colors">{item.hour}h</span>
            {item.count > 0 && (
              <span className="text-xs font-medium text-gray-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FunnelItem({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-full transition-all`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
