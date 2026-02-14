"use client";

import { X, MapPin, Clock, FileText, ChevronLeft, ChevronRight, Folder, Smartphone, Laptop, Tablet, Info } from "lucide-react";
import Image from "next/image";
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

const BROWSER_LOGOS: Record<string, string> = {
  Chrome: "/livetracking/chromelogo.png",
  Safari: "/livetracking/safarilogo.png",
  Firefox: "/livetracking/firefoxlogo.png",
  Edge: "/livetracking/edgelogo.png",
  Opera: "/livetracking/operalogo.svg",
};

function BrowserLogo({ browser, size = 24 }: { browser: string; size?: number }) {
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
  return (
    <div
      className="rounded-full bg-black/5 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="text-[8px] font-bold text-black/30">{browser.charAt(0)}</span>
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
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
          biased
            ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
            : "bg-black/[0.06] text-black/25 hover:bg-black/10"
        }`}
      >
        <Info className="w-2 h-2" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-52 p-2.5 bg-white rounded-xl border border-black/[0.08] shadow-xl"
          >
            <p className={`text-[10px] leading-relaxed ${biased ? "text-amber-700" : "text-black/50"}`}>
              {tooltipText}
            </p>
            {biased && event.isp && (
              <p className="text-[9px] text-amber-500 mt-1 font-mono">{event.isp}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AnalyticsDetailCard({ detail, onClose, isOpen }: AnalyticsDetailCardProps) {
  const [currentVisitorIndex, setCurrentVisitorIndex] = useState(0);
  const router = useRouter();

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

  if (!currentEvent) return null;

  const info = parseUserAgent(currentEvent.userAgent || "");
  const ts = new Date(currentEvent.timestamp);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-[480px]"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-black/[0.06] shadow-2xl shadow-black/10 overflow-hidden">
            {/* Top row: live badge + close */}
            <div className="flex items-center justify-between px-4 pt-3.5 pb-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-black/30">
                  {isExactLocationCluster ? `${events.length} visiteurs` : "En direct"}
                </span>
                {isExactLocationCluster && (
                  <span className="text-[10px] text-black/20 tabular-nums">
                    {currentVisitorIndex + 1}/{events.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-black/30" />
              </button>
            </div>

            {/* Main content */}
            <div className="px-4 pt-3 pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isExactLocationCluster ? currentVisitorIndex : currentEvent.id}
                  initial={isExactLocationCluster ? { opacity: 0, x: 10 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={isExactLocationCluster ? { opacity: 0, x: -10 } : undefined}
                  transition={{ duration: 0.12 }}
                >
                  {/* Row 1: Timestamp + Folder */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-black/15" />
                      <span className="text-[13px] font-semibold text-black">{getTimeAgo(ts)}</span>
                      <span className="text-[10px] text-black/25 tabular-nums">
                        {ts.toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {currentEvent.folderName && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(150,169,130,0.08)] rounded-lg max-w-[45%]">
                        <Folder className="w-3 h-3 text-[#96A982] shrink-0" />
                        <span className="text-[11px] font-medium text-[#96A982] truncate">{currentEvent.folderName}</span>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Location + Device */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-black/15 shrink-0" />
                      <span className="text-[13px] font-medium text-black">
                        {currentEvent.city || currentEvent.country || "Inconnue"}
                      </span>
                      {currentEvent.city && currentEvent.country && currentEvent.city !== currentEvent.country && (
                        <span className="text-[11px] text-black/25">{currentEvent.country}</span>
                      )}
                      <LocationTooltip event={currentEvent} />
                    </div>

                    <div className="flex items-center gap-2">
                      <BrowserLogo browser={info.browser} size={20} />
                      <div className="flex items-center gap-1">
                        <DeviceIcon device={info.device} className="w-3 h-3 text-black/25" />
                        <span className="text-[10px] text-black/35">{info.device}</span>
                        <span className="text-black/10">·</span>
                        <span className="text-[10px] text-black/35">{info.os}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.04]">
                    {(currentEvent.visitorId || currentEvent.visitorIdStable) ? (
                      <button
                        onClick={() => navigateToLogs(currentEvent)}
                        className="flex items-center gap-1.5 text-[10px] font-medium text-black/30 hover:text-black/60 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        Voir les logs
                      </button>
                    ) : (
                      <div />
                    )}

                    {/* Cluster navigation */}
                    {isExactLocationCluster && events.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={goToPrevious}
                          className="w-6 h-6 rounded-md bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors"
                        >
                          <ChevronLeft className="w-3 h-3 text-black/40" />
                        </button>
                        <div className="flex gap-0.5">
                          {events.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => goToIndex(idx)}
                              className={`h-1 rounded-full transition-all duration-200 ${
                                idx === currentVisitorIndex
                                  ? "w-3 bg-[#96A982]"
                                  : "w-1 bg-black/10 hover:bg-black/20"
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={goToNext}
                          className="w-6 h-6 rounded-md bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors"
                        >
                          <ChevronRight className="w-3 h-3 text-black/40" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
