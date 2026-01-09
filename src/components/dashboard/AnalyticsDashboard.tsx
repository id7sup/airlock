"use client";

import { useEffect, useState } from "react";
import { 
  Eye, 
  Download, 
  Users,
  TrendingUp,
  Globe,
  Clock,
  AlertTriangle,
  Activity,
  Sparkles
} from "lucide-react";
import { Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

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
    activityByPeriod: Array<{ label: string; count: number; timestamp?: number }>;
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
  const [period, setPeriod] = useState<'1J' | '1S' | 'Max'>('1J');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const url = linkId 
          ? `/api/analytics/stats?days=30&linkId=${linkId}&period=${period}`
          : `/api/analytics/stats?days=30&period=${period}`;
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
  }, [linkId, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-black/20 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-32">
        <p className="text-base text-black/30">Aucune donnée disponible</p>
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
    
    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const formatNumber = (value: number) => value.toLocaleString("fr-FR");
  const totalEvents = stats.totals.openShare + stats.totals.openFolder + stats.totals.viewFile + stats.totals.downloadFile;

  const summaryCards = [
    {
      label: "Visiteurs",
      value: formatNumber(stats.uniques.total),
      detail: `${formatNumber(stats.uniques.last24h)} aujourd'hui`,
      icon: <Users className="w-5 h-5 text-black/50" />,
    },
    {
      label: "Vues",
      value: formatNumber(stats.totals.openShare),
      detail: `${stats.uniques.viewsPerVisitor.toFixed(1)} par visiteur`,
      icon: <Eye className="w-5 h-5 text-black/50" />,
    },
    {
      label: "Téléchargements",
      value: formatNumber(stats.totals.downloadFile),
      detail: `${stats.funnel.viewToDownload.toFixed(1)}% conversion`,
      icon: <Download className="w-5 h-5 text-black/50" />,
    },
    {
      label: "Événements",
      value: formatNumber(totalEvents),
      detail: formatTimeAgo(stats.hotMoments.lastActivity),
      icon: <Activity className="w-5 h-5 text-black/50" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Métriques principales repensées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-2">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-5 h-full flex flex-col items-center justify-center gap-3 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-black/[0.03] flex items-center justify-center">{card.icon}</div>
            <p className="text-[11px] font-semibold text-black/50 tracking-[0.16em] uppercase">{card.label}</p>
            <p className="text-4xl font-semibold text-black leading-none tabular-nums">{card.value}</p>
            <p className="text-xs text-black/45">{card.detail}</p>
          </div>
        ))}
      </div>

      {/* Activité en temps réel - Design complètement repensé avec graphiques explicites */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-light tracking-tight text-black">Activité en temps réel</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/8 rounded-full border border-brand-primary/15">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-[8px] font-bold text-brand-primary uppercase tracking-[0.3em]">Live</span>
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-sm text-black/35 font-medium">Pic à {stats.hotMoments.peakActivity.time}</p>
            <p className="text-xs text-black/25">{stats.hotMoments.peakActivity.count} événements</p>
          </div>
        </div>
        
        {/* Graphique principal - Courbe d'activité par période */}
        <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-black mb-2">
                {period === '1J' ? 'Distribution horaire (24h)' : 
                 period === '1S' ? 'Distribution hebdomadaire (7j)' :
                 'Distribution globale'}
              </h3>
              <p className="text-sm text-black/40">
                {period === '1J' ? 'Activité répartie sur les 24 dernières heures' :
                 period === '1S' ? 'Activité répartie sur les 7 derniers jours' :
                 'Activité répartie sur toute la période'}
              </p>
            </div>
            {/* Sélecteur de période */}
            <div className="flex items-center gap-2">
              {(['1J', '1S', 'Max'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    period === p
                      ? 'bg-black text-white'
                      : 'bg-black/5 text-black/60 hover:bg-black/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px] w-full" style={{ minHeight: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={stats.hotMoments.activityByPeriod.length > 0 
                  ? stats.hotMoments.activityByPeriod 
                  : stats.hotMoments.activityByHour.map(h => ({ label: `${h.hour.toString().padStart(2, '0')}h`, count: h.count }))} 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#96A982" stopOpacity={0.3}/>
                    <stop offset="50%" stopColor="#96A982" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#96A982" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.4)', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  angle={period === 'Max' ? -45 : 0}
                  textAnchor={period === 'Max' ? 'end' : 'middle'}
                  height={period === 'Max' ? 60 : 30}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.4)', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length && label !== undefined) {
                      return (
                        <div className="bg-white/95 backdrop-blur-xl border border-black/[0.08] p-4 rounded-2xl shadow-xl">
                          <p className="text-xs font-bold text-black/30 uppercase tracking-wider mb-2">
                            {label}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-brand-primary" />
                            <p className="text-base font-semibold text-black">
                              {payload[0].value} événements
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: '#96A982', strokeWidth: 2, strokeDasharray: '5 5', opacity: 0.3 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#96A982" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorActivity)"
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#96A982' }}
                  dot={{ r: 4, fill: '#96A982', strokeWidth: 2, stroke: '#fff' }}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Métriques résumées */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-[#f9faf9] rounded-2xl border border-black/[0.05] p-6">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-3">Total 24h</p>
            <p className="text-4xl font-light text-black tabular-nums">
              {stats.hotMoments.activityByHour.reduce((acc, h) => acc + h.count, 0)}
            </p>
            <p className="text-xs text-black/40 mt-2">événements</p>
          </div>
          <div className="bg-gradient-to-br from-white to-[#f9faf9] rounded-2xl border border-black/[0.05] p-6">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-3">Moyenne</p>
            <p className="text-4xl font-light text-black tabular-nums">
              {Math.round(stats.hotMoments.activityByHour.reduce((acc, h) => acc + h.count, 0) / 24)}
            </p>
            <p className="text-xs text-black/40 mt-2">par heure</p>
          </div>
          <div className="bg-gradient-to-br from-white to-[#f9faf9] rounded-2xl border border-black/[0.05] p-6">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-3">Heure actuelle</p>
            <p className="text-4xl font-light text-black tabular-nums">
              {stats.hotMoments.activityByHour[new Date().getHours()]?.count || 0}
            </p>
            <p className="text-xs text-black/40 mt-2">événements</p>
          </div>
        </div>

      </div>

      {/* Top Pays - Ultra minimaliste */}
      {stats.topCountries.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-black/[0.02] pb-6">
            <h2 className="text-3xl font-light tracking-tight text-black">Top Pays</h2>
            <p className="text-xs text-black/30 font-medium">{stats.topCountries.length} pays</p>
          </div>
          <div className="space-y-0.5">
            {stats.topCountries.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-4 border-b border-black/[0.02] hover:bg-black/[0.01] transition-colors group">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-black/15 tabular-nums w-4 text-right shrink-0">{idx + 1}</span>
                  <span className="text-lg font-light text-black truncate">{item.country}</span>
                  </div>
                <div className="flex items-center gap-8 shrink-0">
                  <div className="w-40 h-0.5 bg-black/[0.03] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-lg font-light text-black tabular-nums w-16 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funnel + Sources */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Funnel d'engagement */}
        <div className="bg-white border border-black/[0.05] rounded-2xl shadow-sm p-6 space-y-4 xl:col-span-7 xl:col-start-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black">Funnel d'engagement</h2>
            <span className="text-[11px] text-black/40 uppercase tracking-[0.18em]">Conversion</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Vue → Téléchargement", value: stats.funnel.viewToDownload },
              { label: "Vue → Fichier consulté", value: stats.funnel.viewToViewFile },
              { label: "Vue → Dossier ouvert", value: stats.funnel.viewToOpenFolder },
            ].map((item) => (
              <div key={item.label} className="bg-black/[0.02] border border-black/[0.04] rounded-xl px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-black">{item.label}</p>
                  <span className="text-sm font-semibold text-black tabular-nums">{item.value.toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-black/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all"
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sources de trafic */}
        <div className="bg-white border border-black/[0.05] rounded-2xl shadow-sm p-6 space-y-4 xl:col-span-5 xl:col-start-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black">Sources de trafic</h2>
            <span className="text-[11px] text-black/40 uppercase tracking-[0.18em]">Top</span>
          </div>
          {stats.referrers.length === 0 ? (
            <p className="text-sm text-black/40">Aucune source pour l’instant.</p>
          ) : (
            <div className="space-y-3">
              {stats.referrers.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-black/[0.04] flex items-center justify-center text-xs font-semibold text-black/60">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black truncate">{item.category || "Inconnu"}</p>
                      <p className="text-[11px] text-black/45">{item.count} événements</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-black tabular-nums">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function FunnelRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-black/[0.02] hover:bg-black/[0.01] transition-colors group">
      <span className="text-lg font-light text-black flex-1">{label}</span>
      <div className="flex items-center gap-8 shrink-0">
        <div className="w-48 h-0.5 bg-black/[0.03] rounded-full overflow-hidden">
        <div 
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
        </div>
        <span className="text-lg font-light text-black tabular-nums w-16 text-right">{value.toFixed(1)}%</span>
      </div>
    </div>
  );
}
