"use client";

import { X, Eye, Download, Lock, MapPin, Clock, Monitor, FileText, AlertCircle, ChevronLeft, ChevronRight, Folder, Globe, Smartphone, Laptop, Tablet } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface AnalyticsDetail {
  id: string;
  type: string;
  eventType: string;
  country: string;
  city: string;
  region?: string;
  accuracy_radius_km?: number;
  location_quality?: "residential_or_mobile" | "hosting_or_datacenter" | "vpn_or_anonymous_proxy" | "unknown";
  timestamp: string;
  visitorId: string;
  userAgent: string;
  ip?: string;
  isDatacenter?: boolean;
  isVPN?: boolean;
  isp?: string;
  asn?: string;
  folderName?: string | null;
  visitorIdStable?: string | null;
}

interface ClusterDetail {
  pointCount: number;
  center: [number, number];
  points: AnalyticsDetail[];
}

interface AnalyticsDetailCardProps {
  detail: ClusterDetail | AnalyticsDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

function parseUserAgent(userAgent: string): { browser: string; device: string; os: string } {
  if (!userAgent) return { browser: "Inconnu", device: "Inconnu", os: "Inconnu" };

  const ua = userAgent.toLowerCase();
  let browser = "Inconnu";
  let device = "Inconnu";
  let os = "Inconnu";

  if (ua.includes("edg/") || ua.includes("edgios")) {
    browser = "Edge";
  } else if (ua.includes("opr/") || ua.includes("opera")) {
    browser = "Opera";
  } else if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "Chrome";
  } else if (ua.includes("firefox") || ua.includes("fxios")) {
    browser = "Firefox";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  }

  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone") || ua.includes("ipod")) {
    device = "Mobile";
  } else if (ua.includes("ipad") || ua.includes("tablet")) {
    device = "Tablette";
  } else if (ua.includes("windows") || ua.includes("mac") || ua.includes("linux") || ua.includes("x11")) {
    device = "Desktop";
  }

  if (ua.includes("windows phone")) {
    os = "Windows Phone";
  } else if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("android")) {
    os = "Android";
    if (device === "Inconnu") device = "Mobile";
  } else if (ua.includes("iphone") || ua.includes("ipod")) {
    os = "iOS";
    if (device === "Inconnu") device = "Mobile";
  } else if (ua.includes("ipad")) {
    os = "iOS";
    if (device === "Inconnu") device = "Tablette";
  } else if (ua.includes("mac os x") || ua.includes("macintosh")) {
    os = "macOS";
    if (device === "Inconnu") device = "Desktop";
  } else if (ua.includes("linux")) {
    os = "Linux";
    if (device === "Inconnu") device = "Desktop";
  }

  return { browser, device, os };
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone className="w-4 h-4" />;
  if (device === "Tablette") return <Tablet className="w-4 h-4" />;
  return <Laptop className="w-4 h-4" />;
}

function isLocationBiased(event: AnalyticsDetail): boolean {
  return !!(event.isDatacenter || event.isVPN ||
    event.location_quality === "hosting_or_datacenter" ||
    event.location_quality === "vpn_or_anonymous_proxy");
}

function getLocationWarningLabel(event: AnalyticsDetail): string {
  if (event.isDatacenter || event.location_quality === "hosting_or_datacenter") return "Datacenter";
  if (event.isVPN || event.location_quality === "vpn_or_anonymous_proxy") return "VPN/Proxy";
  return "Position biaisée";
}

export function AnalyticsDetailCard({ detail, onClose, isOpen }: AnalyticsDetailCardProps) {
  const [mounted, setMounted] = useState(false);
  const [currentVisitorIndex, setCurrentVisitorIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const isCluster = detail ? "pointCount" in detail : false;
  const events = detail
    ? (isCluster ? (detail as ClusterDetail).points : [detail as AnalyticsDetail])
    : [];

  const isExactLocationCluster = isCluster && events.length > 1;

  useEffect(() => {
    if (isExactLocationCluster) {
      setCurrentVisitorIndex(0);
    }
  }, [isExactLocationCluster, events.length]);

  const goToPrevious = () => {
    setCurrentVisitorIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentVisitorIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (index: number) => {
    setCurrentVisitorIndex(index);
  };

  const currentVisitorEvent = isExactLocationCluster ? events[currentVisitorIndex] : events[0];
  const userInfo = currentVisitorEvent ? parseUserAgent(currentVisitorEvent.userAgent || "") : null;
  const timestamp = currentVisitorEvent ? new Date(currentVisitorEvent.timestamp) : null;

  const navigateToLogs = (event: AnalyticsDetail) => {
    const visitorIdToUse = event.visitorIdStable || event.visitorId;
    sessionStorage.setItem('returnToGlobe', 'true');
    sessionStorage.setItem('globeSelectedDetail', JSON.stringify({
      visitorId: visitorIdToUse,
      id: event.id,
    }));
    router.push(`/dashboard/sharing/logs?visitorId=${encodeURIComponent(visitorIdToUse)}`);
    onClose();
  };

  if (!mounted) return null;

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: 0.2,
              ease: [0.32, 0.72, 0, 1]
            }}
            className="fixed top-0 bottom-0 right-0 z-[110] w-full md:w-[400px] lg:w-[420px] max-w-[460px] h-screen"
          >
            <div className="h-full bg-white flex flex-col shadow-2xl">
              {/* Header compact avec indicateur live */}
              <div className="px-6 pt-5 pb-4 border-b border-black/[0.05]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Pulse live */}
                    <div className="relative flex items-center justify-center w-8 h-8">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/30 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black tracking-tight">
                        {isExactLocationCluster ? `${events.length} visiteurs` : "Visiteur en direct"}
                      </p>
                      {timestamp && (
                        <p className="text-[11px] text-black/40 mt-0.5">{getTimeAgo(timestamp)}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg hover:bg-black/5 active:scale-95 flex items-center justify-center transition-all"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4 text-black/40" />
                  </button>
                </div>

                {/* Dossier consulté */}
                {currentVisitorEvent?.folderName && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: "rgba(150, 169, 130, 0.08)" }}>
                    <Folder className="w-3.5 h-3.5 text-[#96A982]" />
                    <span className="text-xs font-medium text-[#96A982]">{currentVisitorEvent.folderName}</span>
                  </div>
                )}
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto">
                {currentVisitorEvent ? (
                  <div className="p-6 space-y-5">
                    {/* Localisation */}
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-black/30" />
                        <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">Localisation</h3>
                      </div>
                      <div className="ml-[22px]">
                        <p className="text-[15px] font-semibold text-black leading-tight">
                          {currentVisitorEvent.city || currentVisitorEvent.country || "Inconnue"}
                        </p>
                        {currentVisitorEvent.city && (
                          <p className="text-xs text-black/40 mt-0.5">
                            {[currentVisitorEvent.region, currentVisitorEvent.country].filter(Boolean).join(", ")}
                          </p>
                        )}
                        {isLocationBiased(currentVisitorEvent) && (
                          <div className="mt-2 flex items-start gap-2 p-2.5 bg-amber-50/80 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] font-medium text-amber-700">
                                {getLocationWarningLabel(currentVisitorEvent)}
                              </p>
                              <p className="text-[10px] text-amber-600/70 mt-0.5 leading-relaxed">
                                Position approximative du serveur, pas de l'utilisateur.
                              </p>
                              {currentVisitorEvent.isp && (
                                <p className="text-[10px] text-amber-600/50 mt-1 font-mono">
                                  {currentVisitorEvent.isp}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {currentVisitorEvent.accuracy_radius_km && !isLocationBiased(currentVisitorEvent) && (
                          <p className="text-[10px] text-black/30 mt-1.5">
                            Precis. ± {currentVisitorEvent.accuracy_radius_km} km
                          </p>
                        )}
                      </div>
                    </section>

                    {/* Appareil */}
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <Monitor className="w-3.5 h-3.5 text-black/30" />
                        <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">Appareil</h3>
                      </div>
                      {userInfo && (
                        <div className="flex flex-wrap gap-1.5 ml-[22px]">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/[0.03] rounded-lg text-[11px] font-medium text-black/70">
                            <DeviceIcon device={userInfo.device} />
                            {userInfo.device}
                          </span>
                          <span className="px-2.5 py-1 bg-black/[0.03] rounded-lg text-[11px] font-medium text-black/70">
                            {userInfo.browser}
                          </span>
                          <span className="px-2.5 py-1 bg-black/[0.03] rounded-lg text-[11px] font-medium text-black/70">
                            {userInfo.os}
                          </span>
                        </div>
                      )}
                    </section>

                    {/* Identité - mode cluster avec carrousel */}
                    {isExactLocationCluster ? (
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-black/30" />
                            <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">Visiteurs</h3>
                          </div>
                          <span className="text-[10px] font-medium text-black/30 tabular-nums">
                            {currentVisitorIndex + 1}/{events.length}
                          </span>
                        </div>

                        <div className="relative ml-[22px]">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentVisitorIndex}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.15 }}
                              className="p-4 bg-black/[0.02] rounded-xl border border-black/[0.05]"
                            >
                              {(() => {
                                const event = events[currentVisitorIndex];
                                const eventUserInfo = parseUserAgent(event.userAgent || "");
                                const eventTimestamp = new Date(event.timestamp);
                                return (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center">
                                          <span className="text-[10px] font-bold text-black/50">{currentVisitorIndex + 1}</span>
                                        </div>
                                        <span className="text-xs font-medium text-black">{getTimeAgo(eventTimestamp)}</span>
                                      </div>
                                      <div className="flex gap-1">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-black/5 rounded text-black/60">{eventUserInfo.device}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-black/5 rounded text-black/60">{eventUserInfo.browser}</span>
                                      </div>
                                    </div>

                                    {event.folderName && (
                                      <div className="flex items-center gap-1.5">
                                        <Folder className="w-3 h-3 text-[#96A982]" />
                                        <span className="text-[11px] text-black/50">{event.folderName}</span>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                      {event.ip && (
                                        <div>
                                          <p className="text-black/30 mb-0.5">IP</p>
                                          <p className="font-mono text-black/60 break-all">{event.ip}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-black/30 mb-0.5">ID</p>
                                        <p className="font-mono text-black/60 break-all">{event.visitorId?.slice(0, 12) || "—"}...</p>
                                      </div>
                                    </div>

                                    {(event.visitorId || event.visitorIdStable) && (
                                      <button
                                        onClick={() => navigateToLogs(event)}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-black/40 hover:text-black/70 hover:bg-black/[0.03] rounded-lg transition-colors"
                                      >
                                        <FileText className="w-3 h-3" />
                                        Voir les logs
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}
                            </motion.div>
                          </AnimatePresence>

                          {/* Navigation */}
                          {events.length > 1 && (
                            <div className="flex items-center justify-between mt-3">
                              <button
                                onClick={goToPrevious}
                                className="w-7 h-7 rounded-lg bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors"
                                aria-label="Précédent"
                              >
                                <ChevronLeft className="w-3.5 h-3.5 text-black/40" />
                              </button>
                              <div className="flex gap-1">
                                {events.map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => goToIndex(idx)}
                                    className={`h-1 rounded-full transition-all duration-200 ${
                                      idx === currentVisitorIndex
                                        ? "w-4 bg-[#96A982]"
                                        : "w-1 bg-black/10 hover:bg-black/20"
                                    }`}
                                    aria-label={`Visiteur ${idx + 1}`}
                                  />
                                ))}
                              </div>
                              <button
                                onClick={goToNext}
                                className="w-7 h-7 rounded-lg bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors"
                                aria-label="Suivant"
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-black/40" />
                              </button>
                            </div>
                          )}
                        </div>
                      </section>
                    ) : (
                      /* Identité - mode single */
                      <section>
                        <div className="flex items-center gap-2 mb-3">
                          <Globe className="w-3.5 h-3.5 text-black/30" />
                          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">Identite</h3>
                        </div>
                        <div className="ml-[22px] grid grid-cols-2 gap-3">
                          <div className="p-3 bg-black/[0.02] rounded-xl border border-black/[0.04]">
                            <p className="text-[10px] text-black/30 mb-1">IP</p>
                            <p className="text-xs font-mono text-black/70 break-all">
                              {currentVisitorEvent.ip || "—"}
                            </p>
                          </div>
                          <div className="p-3 bg-black/[0.02] rounded-xl border border-black/[0.04]">
                            <p className="text-[10px] text-black/30 mb-1">Visiteur</p>
                            <p className="text-xs font-mono text-black/70 break-all">
                              {currentVisitorEvent.visitorId?.slice(0, 12) || "—"}...
                            </p>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Heure exacte */}
                    {timestamp && (
                      <section className="pt-4 border-t border-black/[0.04]">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-3.5 h-3.5 text-black/30" />
                          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">Horodatage</h3>
                        </div>
                        <p className="text-xs text-black/50 ml-[22px] font-mono">
                          {timestamp.toLocaleString("fr-FR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </section>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-black/40 text-center px-6">
                    <div className="space-y-3">
                      <div className="relative flex items-center justify-center w-16 h-16 mx-auto">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#96A982]/10 animate-ping" />
                        <Eye className="w-8 h-8 text-[#96A982]/60 relative" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm text-black/50">Selectionnez un point</p>
                        <p className="text-xs text-black/25">sur le globe pour voir les details</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Bouton voir les logs (mode single) */}
              {currentVisitorEvent && !isExactLocationCluster && (currentVisitorEvent.visitorId || currentVisitorEvent.visitorIdStable) && (
                <div className="p-4 border-t border-black/[0.05]">
                  <button
                    onClick={() => navigateToLogs(currentVisitorEvent)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-black/50 hover:text-black bg-black/[0.02] hover:bg-black/[0.05] rounded-xl transition-all duration-200"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Voir tous les logs de ce visiteur
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
}
