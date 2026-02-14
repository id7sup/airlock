"use client";

import { X, MapPin, Clock, FileText, ChevronLeft, ChevronRight, Folder, Smartphone, Laptop, Tablet, Info } from "lucide-react";
import Image from "next/image";
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

// Map browser name to logo path
const BROWSER_LOGOS: Record<string, string> = {
  Chrome: "/livetracking/chromelogo.png",
  Safari: "/livetracking/safarilogo.png",
  Firefox: "/livetracking/firefoxlogo.png",
  Edge: "/livetracking/edgelogo.png",
  Opera: "/livetracking/operalogo.svg",
};

function BrowserLogo({ browser, size = 28 }: { browser: string; size?: number }) {
  const logoPath = BROWSER_LOGOS[browser];
  if (logoPath) {
    return (
      <Image
        src={logoPath}
        alt={browser}
        width={size}
        height={size}
        className="object-contain"
      />
    );
  }
  // Fallback for unknown browsers
  return (
    <div
      className="rounded-full bg-black/5 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="text-[9px] font-bold text-black/30">{browser.charAt(0)}</span>
    </div>
  );
}

function DeviceIcon({ device, className }: { device: string; className?: string }) {
  if (device === "Mobile") return <Smartphone className={className} />;
  if (device === "Tablette") return <Tablet className={className} />;
  return <Laptop className={className} />;
}

function isLocationBiased(event: AnalyticsDetail): boolean {
  return !!(event.isDatacenter || event.isVPN ||
    event.location_quality === "hosting_or_datacenter" ||
    event.location_quality === "vpn_or_anonymous_proxy");
}

function getLocationWarningText(event: AnalyticsDetail): string {
  if (event.isDatacenter || event.location_quality === "hosting_or_datacenter") {
    return "Position du datacenter, pas de l'utilisateur.";
  }
  if (event.isVPN || event.location_quality === "vpn_or_anonymous_proxy") {
    return "Position du serveur VPN, pas de l'utilisateur.";
  }
  return "Localisation approximative.";
}

function LocationTooltip({ event }: { event: AnalyticsDetail }) {
  const [open, setOpen] = useState(false);

  const biased = isLocationBiased(event);
  const tooltipText = biased
    ? getLocationWarningText(event)
    : "La localisation est basée sur l'adresse IP et peut varier de quelques kilomètres.";

  return (
    <div className="relative inline-flex">
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
          biased
            ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
            : "bg-black/5 text-black/30 hover:bg-black/10"
        }`}
      >
        <Info className="w-2.5 h-2.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-56 p-3 bg-white rounded-xl border border-black/[0.08] shadow-xl"
          >
            <p className={`text-[11px] leading-relaxed ${biased ? "text-amber-700" : "text-black/50"}`}>
              {tooltipText}
            </p>
            {biased && event.isp && (
              <p className="text-[10px] text-amber-500 mt-1.5 font-mono">{event.isp}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Visitor card used in both single and cluster mode
function VisitorCard({ event, navigateToLogs, compact }: {
  event: AnalyticsDetail;
  navigateToLogs: (e: AnalyticsDetail) => void;
  compact?: boolean;
}) {
  const info = parseUserAgent(event.userAgent || "");
  const ts = new Date(event.timestamp);

  return (
    <div className={`${compact ? "p-4" : "p-5"} bg-[#fafafa] rounded-2xl border border-black/[0.04]`}>
      {/* Timestamp hero */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-black/20" />
          <span className="text-sm font-semibold text-black">{getTimeAgo(ts)}</span>
        </div>
        <span className="text-[10px] text-black/30 tabular-nums">
          {ts.toLocaleString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Folder */}
      {event.folderName && (
        <div className="flex items-center gap-2.5 mb-4 px-3 py-2.5 bg-white rounded-xl border border-black/[0.04]">
          <Folder className="w-4 h-4 text-[#96A982] shrink-0" />
          <span className="text-[13px] font-medium text-black truncate">{event.folderName}</span>
        </div>
      )}

      {/* Location */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-3.5 h-3.5 text-black/20 shrink-0" />
        <span className="text-[13px] font-medium text-black">
          {event.city || event.country || "Inconnue"}
        </span>
        {event.city && event.country && event.city !== event.country && (
          <span className="text-[11px] text-black/30">
            {event.country}
          </span>
        )}
        <LocationTooltip event={event} />
      </div>

      {/* Device row with browser logo */}
      <div className="flex items-center gap-3">
        <BrowserLogo browser={info.browser} size={compact ? 24 : 28} />
        <div className="flex items-center gap-1.5 flex-wrap">
          <DeviceIcon device={info.device} className="w-3.5 h-3.5 text-black/30" />
          <span className="text-[11px] text-black/50">{info.device}</span>
          <span className="text-black/10">·</span>
          <span className="text-[11px] text-black/50">{info.os}</span>
          <span className="text-black/10">·</span>
          <span className="text-[11px] text-black/50">{info.browser}</span>
        </div>
      </div>

      {/* Logs button */}
      {(event.visitorId || event.visitorIdStable) && (
        <button
          onClick={() => navigateToLogs(event)}
          className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-black/35 hover:text-black/60 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-black/[0.04]"
        >
          <FileText className="w-3 h-3" />
          Voir les logs
        </button>
      )}
    </div>
  );
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

  const currentEvent = isExactLocationCluster ? events[currentVisitorIndex] : events[0];

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
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: 0.25,
              ease: [0.32, 0.72, 0, 1]
            }}
            className="fixed top-0 bottom-0 right-0 z-[110] w-full md:w-[380px] lg:w-[400px] max-w-[440px] h-screen"
          >
            <div className="h-full bg-white flex flex-col shadow-2xl">
              {/* Header minimal */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/40">
                    {isExactLocationCluster ? `${events.length} visiteurs` : "En direct"}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg hover:bg-black/5 active:scale-95 flex items-center justify-center transition-all"
                  aria-label="Fermer"
                >
                  <X className="w-3.5 h-3.5 text-black/30" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                {currentEvent ? (
                  isExactLocationCluster ? (
                    // Cluster mode - carousel of visitors
                    <div className="space-y-3">
                      {/* Navigation header */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={goToPrevious}
                          className="w-7 h-7 rounded-lg bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors"
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
                                  ? "w-5 bg-[#96A982]"
                                  : "w-1 bg-black/10 hover:bg-black/20"
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={goToNext}
                          className="w-7 h-7 rounded-lg bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-black/40" />
                        </button>
                      </div>

                      {/* Visitor card with animation */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentVisitorIndex}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.15 }}
                        >
                          <VisitorCard
                            event={events[currentVisitorIndex]}
                            navigateToLogs={navigateToLogs}
                            compact
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ) : (
                    // Single visitor mode
                    <VisitorCard
                      event={currentEvent}
                      navigateToLogs={navigateToLogs}
                    />
                  )
                ) : (
                  // Empty state
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="relative flex items-center justify-center w-14 h-14 mx-auto">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#96A982]/10 animate-[ping_2s_ease-in-out_infinite]" />
                        <MapPin className="w-6 h-6 text-[#96A982]/50 relative" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black/40">Cliquez sur un point</p>
                        <p className="text-[11px] text-black/20 mt-1">du globe pour voir les details</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
}
