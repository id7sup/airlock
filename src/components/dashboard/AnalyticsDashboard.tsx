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
  Sparkles,
  Info,
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
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

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

export const PREFS_KEY = "airlock-dashboard-prefs";

export interface DashboardPrefs {
  visibleCards: Record<string, boolean>;
  visibleSections: Record<string, boolean>;
}

export const defaultPrefs: DashboardPrefs = {
  visibleCards: {
    "Visiteurs": true,
    "Vues": true,
    "Téléchargements": true,
    "Événements": true,
  },
  visibleSections: {
    activity: true,
    traffic: true,
    controls: true,
    restrictions: true,
    export: true,
    security: true,
    funnel: true,
  },
};

interface AnalyticsDashboardProps {
  linkId?: string | null;
  prefs?: DashboardPrefs;
}

const widgetTransition = { duration: 0.35, ease: [0.23, 1, 0.32, 1] };

export function AnalyticsDashboard({ linkId, prefs: externalPrefs }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1J' | '1S' | 'Max'>('1J');

  const prefs = externalPrefs ?? defaultPrefs;

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Toujours utiliser MAX pour les données globales, mais la période pour le graphique
        const url = linkId
          ? `/api/analytics/stats?days=9999&linkId=${linkId}&period=${period}`
          : `/api/analytics/stats?days=9999&period=${period}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.stats) {
            setStats(data.stats);
          } else {
            console.error("[STATS] Pas de stats dans la réponse:", data);
          }
        } else {
          console.error("[STATS] Erreur HTTP:", response.status, response.statusText);
          const errorData = await response.json().catch(() => ({}));
          console.error("[STATS] Détails de l'erreur:", errorData);
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
      description: "Personnes uniques ayant consulté vos liens",
      tooltip: "Nombre total de personnes uniques ayant ouvert au moins un de vos liens de partage. Un même visiteur n'est compté qu'une fois.",
      icon: <Users className="w-5 h-5 text-black/50" />,
    },
    {
      label: "Vues",
      value: formatNumber(stats.totals.openShare),
      detail: `${stats.uniques.viewsPerVisitor.toFixed(1)} par visiteur`,
      description: "Nombre total d'ouvertures de liens",
      tooltip: "Chaque ouverture d'un lien de partage est comptée comme une vue, y compris les visites répétées d'un même visiteur.",
      icon: <Eye className="w-5 h-5 text-black/50" />,
    },
    {
      label: "Téléchargements",
      value: formatNumber(stats.totals.downloadFile),
      detail: `${stats.funnel.viewToDownload.toFixed(1)}% conversion`,
      description: "Fichiers téléchargés via vos liens",
      tooltip: "Nombre total de fichiers téléchargés par les visiteurs. Le taux de conversion indique le pourcentage de vues ayant mené à un téléchargement.",
      icon: <Download className="w-5 h-5 text-black/50" />,
    },
    {
      label: "Événements",
      value: formatNumber(totalEvents),
      detail: formatTimeAgo(stats.hotMoments.lastActivity),
      description: "Toutes les interactions enregistrées",
      tooltip: "Somme de toutes les interactions : ouvertures de liens, consultations de dossiers, visualisations et téléchargements de fichiers.",
      icon: <Activity className="w-5 h-5 text-black/50" />,
    },
  ];

  const visibleCards = summaryCards.filter(card => prefs.visibleCards[card.label]);
  const hasCards = visibleCards.length > 0;
  const hasActivity = prefs.visibleSections.activity;
  const hasTraffic = prefs.visibleSections.traffic;
  const hasAnything = hasCards || hasActivity || hasTraffic;

  if (!hasAnything) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-black/[0.03] flex items-center justify-center mb-4">
          <Activity className="w-5 h-5 text-black/20" />
        </div>
        <p className="text-sm text-black/30 font-medium">Aucun widget affiché</p>
        <p className="text-xs text-black/20 mt-1">Activez des widgets depuis le menu Actions</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête Aperçu — masqué si aucune carte */}
      <AnimatePresence>
        {hasCards && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={widgetTransition}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-black/40 uppercase tracking-widest">Aperçu</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Métriques principales — masqué si aucune carte */}
      <AnimatePresence>
        {hasCards && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={widgetTransition}
            className="overflow-hidden"
          >
            <LayoutGroup>
              <div className={`grid gap-4 pb-2 ${
                visibleCards.length === 1 ? "grid-cols-1" :
                visibleCards.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
                visibleCards.length === 3 ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" :
                "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
              }`}>
                <AnimatePresence mode="popLayout">
                  {visibleCards.map((card) => (
                    <motion.div
                      key={card.label}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={widgetTransition}
                      className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-5 h-full flex flex-col items-center justify-center gap-3 text-center relative"
                    >
                      {/* Info icon avec tooltip */}
                      <div className="absolute top-3 right-3 group">
                        <Info className="w-3.5 h-3.5 text-black/20 hover:text-black/40 cursor-help transition-colors" />
                        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-full mt-1 w-56 p-3 bg-black text-white text-xs rounded-xl shadow-xl z-10 font-medium leading-relaxed">
                          {card.tooltip}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-black/[0.03] flex items-center justify-center">{card.icon}</div>
                      <p className="text-[11px] font-semibold text-black/50 tracking-[0.16em] uppercase">{card.label}</p>
                      <p className="text-xs text-black/35 font-medium">{card.description}</p>
                      <p className="text-4xl font-semibold text-black leading-none tabular-nums">{card.value}</p>
                      <p className="text-xs text-black/45">{card.detail}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </LayoutGroup>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activité en temps réel */}
      <AnimatePresence mode="popLayout">
        {hasActivity && (
          <motion.div
            key="activity-section"
            layout
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={widgetTransition}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-light tracking-tight text-black opacity-90">Activité en temps réel</h2>
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
                      : []}
                    margin={{ top: 10, right: 30, left: 0, bottom: period === 'Max' ? 60 : 0 }}
                  >
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#96A982" stopOpacity={0.3}/>
                        <stop offset="50%" stopColor="#96A982" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#96A982" stopOpacity={0.02}/>
                      </linearGradient>
                      <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FEE68A" stopOpacity={0.3}/>
                        <stop offset="50%" stopColor="#FEE68A" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#FEE68A" stopOpacity={0.02}/>
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
                          const views = payload.find(p => p.dataKey === 'views')?.value || 0;
                          const downloads = payload.find(p => p.dataKey === 'downloads')?.value || 0;
                          return (
                            <div className="bg-white/95 backdrop-blur-xl border border-black/[0.08] p-4 rounded-2xl shadow-xl">
                              <p className="text-xs font-bold text-black/30 uppercase tracking-wider mb-3">
                                {label}
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-brand-primary" />
                                  <p className="text-sm font-semibold text-black">
                                    {views} {views === 1 ? 'vue' : 'vues'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FEE68A' }} />
                                  <p className="text-sm font-semibold text-black">
                                    {downloads} {downloads === 1 ? 'téléchargement' : 'téléchargements'}
                                  </p>
                                </div>
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
                      dataKey="views"
                      name="Vues"
                      stroke="#96A982"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#96A982' }}
                      dot={{ r: 4, fill: '#96A982', strokeWidth: 2, stroke: '#fff' }}
                      isAnimationActive={true}
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey="downloads"
                      name="Téléchargements"
                      stroke="#FEE68A"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorDownloads)"
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#FEE68A' }}
                      dot={{ r: 4, fill: '#FEE68A', strokeWidth: 2, stroke: '#fff' }}
                      isAnimationActive={true}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sources de trafic - Pleine largeur */}
      <AnimatePresence mode="popLayout">
        {prefs.visibleSections.traffic && (
          <motion.div
            key="traffic-section"
            layout
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={widgetTransition}
            className="bg-white border border-black/[0.05] rounded-2xl shadow-sm p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Sources de trafic</h2>
              <span className="text-[11px] text-black/40 uppercase tracking-[0.18em]">Top</span>
            </div>
            {stats.referrers.length === 0 ? (
              <p className="text-sm text-black/40">Aucune source pour l'instant.</p>
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
          </motion.div>
        )}
      </AnimatePresence>
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
