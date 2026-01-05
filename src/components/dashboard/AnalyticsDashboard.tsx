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

  const totalEvents = stats.totals.openShare + stats.totals.openFolder + stats.totals.viewFile + stats.totals.downloadFile;

  return (
    <div className="space-y-24">
      {/* Métriques principales - Ultra minimaliste */}
      <div className="grid grid-cols-4 gap-12 border-b border-black/[0.03] pb-12">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-black/25 uppercase tracking-[0.25em]">Visiteurs</p>
          <p className="text-6xl font-light tracking-[-0.02em] text-black tabular-nums leading-none">{stats.uniques.total}</p>
          <p className="text-xs text-black/35 font-medium mt-3">{stats.uniques.last24h} aujourd'hui</p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-black/25 uppercase tracking-[0.25em]">Vues</p>
          <p className="text-6xl font-light tracking-[-0.02em] text-black tabular-nums leading-none">{stats.totals.openShare}</p>
          <p className="text-xs text-black/35 font-medium mt-3">{stats.uniques.viewsPerVisitor.toFixed(1)} par visiteur</p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-black/25 uppercase tracking-[0.25em]">Téléchargements</p>
          <p className="text-6xl font-light tracking-[-0.02em] text-black tabular-nums leading-none">{stats.totals.downloadFile}</p>
          <p className="text-xs text-black/35 font-medium mt-3">{stats.funnel.viewToDownload.toFixed(1)}% conversion</p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-black/25 uppercase tracking-[0.25em]">Événements</p>
          <p className="text-6xl font-light tracking-[-0.02em] text-black tabular-nums leading-none">{totalEvents}</p>
          <p className="text-xs text-black/35 font-medium mt-3">{formatTimeAgo(stats.hotMoments.lastActivity)}</p>
        </div>
      </div>

      {/* Activité en temps réel - Design complètement repensé avec graphiques explicites */}
      <div className="space-y-12">
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
        
        {/* Graphique principal - Courbe d'activité par heure */}
        <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-black mb-2">Distribution horaire (24h)</h3>
            <p className="text-sm text-black/40">Activité répartie sur les 24 heures de la journée</p>
          </div>
          <div className="h-[400px] w-full" style={{ minHeight: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.hotMoments.activityByHour} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#96A982" stopOpacity={0.3}/>
                    <stop offset="50%" stopColor="#96A982" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#96A982" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.4)', fontWeight: 500 }}
                  tickFormatter={(value) => `${value.toString().padStart(2, '0')}h`}
                  axisLine={false}
                  tickLine={false}
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
                            {String(label).padStart(2, '0')}h
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

        {/* Graphique en barres pour une vue alternative */}
        <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-black mb-2">Activité par heure (vue détaillée)</h3>
            <p className="text-sm text-black/40">Nombre d'événements pour chaque heure</p>
          </div>
          <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hotMoments.activityByHour} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)', fontWeight: 500 }}
                  tickFormatter={(value) => `${value.toString().padStart(2, '0')}h`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length && label !== undefined) {
                      return (
                        <div className="bg-white/95 backdrop-blur-xl border border-black/[0.08] p-3 rounded-xl shadow-xl">
                          <p className="text-xs font-bold text-black/30 uppercase tracking-wider mb-1">
                            {String(label).padStart(2, '0')}h
                          </p>
                          <p className="text-sm font-semibold text-black">
                            {payload[0].value} événements
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: 'rgba(150, 169, 130, 0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#96A982"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </BarChart>
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

        {/* Visualisation waveform originale (conservée pour référence) */}
        <div className="relative pt-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-black/50 mb-1">Vue waveform</h3>
            <p className="text-xs text-black/30">Visualisation alternative de l'activité</p>
          </div>
          <ActivityWaveform data={stats.hotMoments.activityByHour} />
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

      {/* Funnel d'engagement - Ultra minimaliste */}
      <div className="space-y-8">
        <h2 className="text-3xl font-light tracking-tight text-black border-b border-black/[0.02] pb-6">Funnel d'engagement</h2>
        <div className="space-y-0.5">
          <FunnelRow label="Vue → Téléchargement" value={stats.funnel.viewToDownload} />
          <FunnelRow label="Vue → Fichier consulté" value={stats.funnel.viewToViewFile} />
          <FunnelRow label="Vue → Dossier ouvert" value={stats.funnel.viewToOpenFolder} />
        </div>
      </div>

      {/* Sources de trafic - Grid minimaliste */}
      {stats.referrers.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-3xl font-light tracking-tight text-black border-b border-black/[0.02] pb-6">Sources de trafic</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.referrers.slice(0, 8).map((item, idx) => (
              <div key={idx} className="text-center space-y-2">
                <p className="text-4xl font-light text-black tabular-nums tracking-tight">{item.count}</p>
                <p className="text-sm font-light text-black/50">{item.category}</p>
                <p className="text-xs text-black/30">{item.percentage.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sécurité - Minimaliste */}
      {stats.security.totalDenials > 0 && (
        <div className="space-y-4 pt-8 border-t border-red-200/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h2 className="text-3xl font-light tracking-tight text-red-900">Sécurité & Anomalies</h2>
          </div>
          <p className="text-sm text-red-700/80 font-light">{stats.security.totalDenials} refus • {stats.security.denials24h} (24h)</p>
          {stats.security.unusualCountries.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3">
                {stats.security.unusualCountries.map((country, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-red-50/50 text-red-700 rounded-lg text-xs font-light border border-red-200/50">
                    {country}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Nouvelle visualisation - Waveform style (comme un oscilloscope)
function ActivityWaveform({ data }: { data: Array<{ hour: number; count: number }> }) {
  const maxCount = Math.max(...data.map(h => h.count), 1);
  const currentHour = new Date().getHours();
  const total = data.reduce((acc, h) => acc + h.count, 0);
  const average = Math.round(total / 24);
  
  return (
    <div className="relative">
      {/* Ligne de base centrale */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-black/[0.04] transform -translate-y-1/2" />
      
      {/* Waveform */}
      <div className="relative flex items-center justify-between px-1 py-16">
      {data.map((item, idx) => {
          const isCurrentHour = currentHour === item.hour;
          const isPast = item.hour < currentHour;
          const isFuture = item.hour > currentHour;
          const normalizedCount = maxCount > 0 ? item.count / maxCount : 0;
          const amplitude = normalizedCount * 80; // Amplitude max 80px
          const direction = idx % 2 === 0 ? 1 : -1; // Alternance haut/bas
          
        return (
            <div key={idx} className="relative flex flex-col items-center group flex-1">
              {/* Point de connexion */}
            <div 
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 cursor-pointer ${
                  isCurrentHour 
                    ? 'bg-brand-primary shadow-lg shadow-brand-primary/40' 
                    : isPast 
                    ? 'bg-brand-primary/50' 
                    : 'bg-black/10'
                }`}
                style={{
                  width: isCurrentHour ? '12px' : normalizedCount > 0 ? `${Math.max(6, normalizedCount * 10)}px` : '4px',
                  height: isCurrentHour ? '12px' : normalizedCount > 0 ? `${Math.max(6, normalizedCount * 10)}px` : '4px',
                  transform: `translate(-50%, -50%) translateY(${direction * amplitude}px)`,
                }}
              >
                {/* Effet pulse pour l'heure actuelle */}
                {isCurrentHour && (
                  <div className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-30" />
                )}
                
                {/* Tooltip */}
            {item.count > 0 && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-black text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap">
                      {item.count} • {item.hour}h
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-black" />
                  </div>
                )}
              </div>
              
              {/* Ligne de connexion (optionnelle, pour créer un effet de waveform) */}
              {idx > 0 && item.count > 0 && (
                <div 
                  className="absolute top-1/2 left-0 w-full h-px bg-brand-primary/20"
                  style={{
                    transform: `translateY(${direction * amplitude}px)`,
                    opacity: normalizedCount * 0.5
                  }}
                />
              )}
              
              {/* Label heure */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <span className={`text-[9px] font-medium transition-colors ${
                  isCurrentHour 
                    ? 'text-brand-primary font-bold' 
                    : isPast 
                    ? 'text-black/30' 
                    : 'text-black/15'
                }`}>
                  {item.hour.toString().padStart(2, '0')}
              </span>
              </div>
          </div>
        );
      })}
      </div>

      {/* Métriques en bas - Ultra minimaliste */}
      <div className="flex items-center justify-between pt-12 border-t border-black/[0.02] mt-8">
        <div className="text-center">
          <p className="text-[9px] font-bold text-black/20 uppercase tracking-[0.3em] mb-2">Total</p>
          <p className="text-3xl font-light text-black tabular-nums tracking-tight">{total}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-bold text-black/20 uppercase tracking-[0.3em] mb-2">Moyenne</p>
          <p className="text-3xl font-light text-black tabular-nums tracking-tight">{average}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-bold text-black/20 uppercase tracking-[0.3em] mb-2">Dernière</p>
          <p className="text-xl font-light text-black">{data.find(h => h.count > 0)?.hour.toString().padStart(2, '0') || '00'}h</p>
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
