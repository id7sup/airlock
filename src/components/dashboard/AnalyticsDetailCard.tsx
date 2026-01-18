"use client";

import { X, Eye, Download, Lock, MapPin, Clock, Monitor, FileText, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
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
  
  // Détection du navigateur (ordre important)
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
  
  // Détection de l'appareil (mobile/tablette en premier)
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone") || ua.includes("ipod")) {
    device = "Mobile";
  } else if (ua.includes("ipad") || ua.includes("tablet")) {
    device = "Tablette";
  } else if (ua.includes("windows") || ua.includes("mac") || ua.includes("linux") || ua.includes("x11")) {
    device = "Desktop";
  }
  
  // Détection de l'OS (ordre important)
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

export function AnalyticsDetailCard({ detail, onClose, isOpen }: AnalyticsDetailCardProps) {
  const [mounted, setMounted] = useState(false);
  const [currentVisitorIndex, setCurrentVisitorIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquer le scroll de la page quand le tiroir est ouvert
  useEffect(() => {
    if (isOpen) {
      // Sauvegarder la position actuelle du scroll
      const scrollY = window.scrollY;
      // Bloquer le scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restaurer le scroll quand le tiroir se ferme
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
  const currentEvent = events[0];
  
  // Vérifier si c'est un cluster de localisation exacte avec plusieurs visiteurs
  const isExactLocationCluster = isCluster && events.length > 1;

  // Réinitialiser l'index du carrousel quand les événements changent
  useEffect(() => {
    if (isExactLocationCluster) {
      setCurrentVisitorIndex(0);
    }
  }, [isExactLocationCluster, events.length]);

  // Navigation du carrousel
  const goToPrevious = () => {
    setCurrentVisitorIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentVisitorIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (index: number) => {
    setCurrentVisitorIndex(index);
  };

  const currentVisitorEvent = isExactLocationCluster ? events[currentVisitorIndex] : currentEvent;
  const userInfo = currentVisitorEvent ? parseUserAgent(currentVisitorEvent.userAgent || "") : null;
  const timestamp = currentVisitorEvent ? new Date(currentVisitorEvent.timestamp) : null;
  const eventType = currentVisitorEvent?.eventType || "";

  let eventLabel = "Vue";
  let eventIcon = Eye;
  let accent = "bg-black/5 text-black";

  if (eventType === "DOWNLOAD_FILE" || eventType === "DOWNLOAD") {
    eventLabel = "Téléchargement";
    eventIcon = Download;
    accent = "bg-blue-50 text-blue-700";
  } else if (eventType === "ACCESS_DENIED" || eventType === "DENIED") {
    eventLabel = "Accès refusé";
    eventIcon = Lock;
    accent = "bg-red-50 text-red-700";
  } else if (eventType === "OPEN_FOLDER" || eventType === "FOLDER") {
    eventLabel = "Dossier ouvert";
    eventIcon = Monitor;
    accent = "bg-amber-50 text-amber-700";
  }

  if (!mounted) return null;

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay qui couvre toute la page (sidebar + top bar + contenu) */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/40"
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Tiroir avec animation d'ouverture/fermeture */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="fixed top-0 bottom-0 right-0 z-[110] w-full md:w-[420px] lg:w-[35vw] max-w-[540px] h-screen"
          >
        <div className="h-full bg-white flex flex-col">
          {/* Header épuré et moderne */}
          <div className="relative border-b border-black/[0.06]">
            <div className="flex items-center justify-between px-8 py-6">
              <div className="flex items-center gap-4">
                {currentVisitorEvent && (
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
                    {eventIcon === Eye && <Eye className="w-7 h-7 text-[#96A982]" />}
                    {eventIcon === Download && <Download className="w-7 h-7 text-[#96A982]" />}
                    {eventIcon === Lock && <Lock className="w-7 h-7 text-[#96A982]" />}
                    {eventIcon === Monitor && <Monitor className="w-7 h-7 text-[#96A982]" />}
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/30 mb-1">
                    Détail en direct
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-black">
                    {currentVisitorEvent ? eventLabel : "Aucun point"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-black/5 hover:bg-black/10 active:scale-95 flex items-center justify-center transition-all duration-150"
                aria-label="Fermer le détail"
              >
                <X className="w-5 h-5 text-black/50" />
              </button>
            </div>
            {timestamp && (
              <div className="px-8 pb-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-black/[0.02] rounded-xl border border-black/[0.06]">
                  <Clock className="w-4 h-4 text-[#96A982]" />
                  <span className="text-xs font-medium text-black/60">{getTimeAgo(timestamp)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {currentVisitorEvent ? (
              <div className="h-full flex flex-col p-8">
                {/* Section 1: Contexte - Quand et Où */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 mb-2">
                      <Clock className="w-5 h-5 text-[#96A982]" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Quand</h3>
                    </div>
                    <p className="text-sm font-medium text-black leading-snug pl-7">
                      {timestamp
                        ? timestamp.toLocaleString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </p>
                    <p className="text-xs text-black/40 pl-7">
                      {timestamp ? timestamp.toLocaleDateString("fr-FR", { year: "numeric" }) : ""}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 mb-2">
                      <MapPin className="w-5 h-5 text-[#96A982]" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Où</h3>
                    </div>
                    <div className="pl-7 space-y-0.5">
                      {currentVisitorEvent.city ? (
                        <>
                          <p className="text-sm font-semibold text-black leading-tight">
                            {currentVisitorEvent.city || currentVisitorEvent.country || "Localisation inconnue"}
                          </p>
                          <p className="text-xs text-black/50">
                            {[currentVisitorEvent.region, currentVisitorEvent.country].filter(Boolean).join(", ") || "Localisation inconnue"}
                            {(currentVisitorEvent.isDatacenter || currentVisitorEvent.isVPN || currentVisitorEvent.location_quality) && (
                              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium uppercase tracking-wider">
                                <AlertCircle className="w-3 h-3" />
                                {currentVisitorEvent.isDatacenter ? "Datacenter" :
                                 currentVisitorEvent.isVPN ? "VPN/Proxy" :
                                 currentVisitorEvent.location_quality === "hosting_or_datacenter" ? "Datacenter" :
                                 currentVisitorEvent.location_quality === "vpn_or_anonymous_proxy" ? "VPN/Proxy" :
                                 "Position biaisée"}
                              </span>
                            )}
                          </p>
                          {/* Explication de la précision */}
                          {(currentVisitorEvent.isDatacenter || currentVisitorEvent.isVPN || currentVisitorEvent.location_quality === "hosting_or_datacenter" || currentVisitorEvent.location_quality === "vpn_or_anonymous_proxy") && (
                            <div className="mt-2 pl-7 space-y-1">
                              <p className="text-[10px] text-amber-700/80 leading-relaxed">
                                {currentVisitorEvent.isDatacenter || currentVisitorEvent.location_quality === "hosting_or_datacenter" 
                                  ? "⚠️ La position indiquée correspond au datacenter du serveur, pas à la position réelle de l'utilisateur. La localisation peut être très éloignée (plusieurs centaines de kilomètres)."
                                  : currentVisitorEvent.isVPN || currentVisitorEvent.location_quality === "vpn_or_anonymous_proxy"
                                  ? "⚠️ La position indiquée correspond au serveur VPN/Proxy utilisé, pas à la position réelle de l'utilisateur. La localisation peut être très éloignée (plusieurs centaines de kilomètres)."
                                  : "⚠️ La position peut être biaisée et ne pas correspondre à la localisation réelle de l'utilisateur."}
                              </p>
                              {currentVisitorEvent.isp && (
                                <p className="text-[10px] text-amber-700/60 mt-1">
                                  ISP: {currentVisitorEvent.isp}
                                </p>
                              )}
                            </div>
                          )}
                          {currentVisitorEvent.accuracy_radius_km && !currentVisitorEvent.isDatacenter && !currentVisitorEvent.isVPN && currentVisitorEvent.location_quality === "residential_or_mobile" && (
                            <p className="text-[10px] text-black/40 mt-1 pl-7">
                              Précision estimée : ± {currentVisitorEvent.accuracy_radius_km} km (localisation résidentielle/mobile)
                            </p>
                          )}
                          {!currentVisitorEvent.accuracy_radius_km && !currentVisitorEvent.isDatacenter && !currentVisitorEvent.isVPN && currentVisitorEvent.location_quality !== "residential_or_mobile" && (
                            <p className="text-[10px] text-black/40 mt-1 pl-7">
                              Précision non disponible pour cette localisation
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-black leading-tight">
                          {currentVisitorEvent.country || "Localisation inconnue"}
                          {(currentVisitorEvent.isDatacenter || currentVisitorEvent.isVPN || currentVisitorEvent.location_quality) && (
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium uppercase tracking-wider">
                              <AlertCircle className="w-3 h-3" />
                              {currentVisitorEvent.isDatacenter ? "Datacenter" :
                               currentVisitorEvent.isVPN ? "VPN/Proxy" :
                               currentVisitorEvent.location_quality === "hosting_or_datacenter" ? "Datacenter" :
                               currentVisitorEvent.location_quality === "vpn_or_anonymous_proxy" ? "VPN/Proxy" :
                               "Position biaisée"}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Appareil - Comment */}
                <div className="mb-8">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Monitor className="w-5 h-5 text-[#96A982]" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Comment</h3>
                  </div>
                  <div className="pl-7">
                    {userInfo ? (
                      <div className="flex flex-wrap gap-2">
                        <div className="px-3 py-1.5 bg-black/5 rounded-lg">
                          <p className="text-xs font-semibold text-black">{userInfo.device}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-black/5 rounded-lg">
                          <p className="text-xs font-semibold text-black">{userInfo.browser}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-black/5 rounded-lg">
                          <p className="text-xs font-semibold text-black">{userInfo.os}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-black/60">Appareil inconnu</p>
                    )}
                  </div>
                </div>

                {/* Section 3: Identité - Qui */}
                {isExactLocationCluster ? (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                        {events.length} visiteurs uniques à cette localisation exacte
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-black/50">
                          {currentVisitorIndex + 1} / {events.length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Carrousel des visiteurs */}
                    <div className="relative">
                      {/* Conteneur du carrousel */}
                      <div className="relative overflow-hidden rounded-xl">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentVisitorIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 bg-black/[0.02] rounded-xl border border-black/[0.06]"
                          >
                            {(() => {
                              const event = events[currentVisitorIndex];
                              const eventUserInfo = parseUserAgent(event.userAgent || "");
                              return (
                                <>
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-black">Visiteur #{currentVisitorIndex + 1}</p>
                                    <p className="text-[10px] text-black/40">
                                      {new Date(event.timestamp).toLocaleString("fr-FR", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-0.5">ID Visiteur</p>
                                      <p className="text-xs font-mono text-black break-all">{event.visitorId || "—"}</p>
                                    </div>
                                    {event.ip && (
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-0.5">IP</p>
                                        <p className="text-xs font-mono text-black break-all">{event.ip}</p>
                                      </div>
                                    )}
                                    {eventUserInfo && (
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-0.5">Appareil</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          <span className="text-[10px] px-2 py-0.5 bg-black/5 rounded text-black">{eventUserInfo.device}</span>
                                          <span className="text-[10px] px-2 py-0.5 bg-black/5 rounded text-black">{eventUserInfo.browser}</span>
                                          <span className="text-[10px] px-2 py-0.5 bg-black/5 rounded text-black">{eventUserInfo.os}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {/* Bouton pour voir les logs de ce visiteur spécifique */}
                                  {(event.visitorId || (event as any).visitorIdStable) && (
                                    <div className="mt-3 pt-3 border-t border-black/[0.06]">
                                      <button
                                        onClick={() => {
                                          // Utiliser visitorIdStable si disponible (pour regrouper tous les logs), sinon visitorId
                                          const visitorIdToUse = (event as any).visitorIdStable || event.visitorId;
                                          sessionStorage.setItem('returnToGlobe', 'true');
                                          sessionStorage.setItem('globeSelectedDetail', JSON.stringify({
                                            visitorId: visitorIdToUse,
                                            id: event.id,
                                          }));
                                          router.push(`/dashboard/sharing/logs?visitorId=${encodeURIComponent(visitorIdToUse)}`);
                                          onClose();
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-black/60 hover:text-black bg-black/[0.02] hover:bg-black/[0.05] rounded-lg transition-colors"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        Voir tous les logs de ce visiteur
                                      </button>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Boutons de navigation */}
                      {events.length > 1 && (
                        <>
                          <button
                            onClick={goToPrevious}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white border border-black/[0.1] shadow-lg flex items-center justify-center hover:bg-black/5 transition-colors z-10"
                            aria-label="Visiteur précédent"
                          >
                            <ChevronLeft className="w-5 h-5 text-black/60" />
                          </button>
                          <button
                            onClick={goToNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white border border-black/[0.1] shadow-lg flex items-center justify-center hover:bg-black/5 transition-colors z-10"
                            aria-label="Visiteur suivant"
                          >
                            <ChevronRight className="w-5 h-5 text-black/60" />
                          </button>
                        </>
                      )}

                      {/* Indicateurs de position (dots) */}
                      {events.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          {events.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => goToIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                idx === currentVisitorIndex
                                  ? "bg-[#96A982] w-6"
                                  : "bg-black/20 hover:bg-black/30"
                              }`}
                              aria-label={`Aller au visiteur ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Adresse IP</h3>
                      <div className="p-3.5 bg-black/[0.02] rounded-xl border border-black/[0.06]">
                        <p className="text-sm font-semibold text-black font-mono break-all">
                          {currentVisitorEvent.ip || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Visiteur</h3>
                      <div className="p-3.5 bg-black/[0.02] rounded-xl border border-black/[0.06]">
                        <p className="text-sm font-semibold text-black font-mono break-all">
                          {currentVisitorEvent.visitorId || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 4: Référence */}
                <div className="pt-4 border-t border-black/[0.06]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">Événement</p>
                      <p className="text-xs font-mono text-black/60">#{currentVisitorEvent.id}</p>
                    </div>
                    {currentVisitorEvent.userAgent && (
                      <div className="flex-1 ml-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">User Agent</p>
                        <p className="text-[10px] text-black/40 font-mono leading-relaxed break-all">
                          {currentVisitorEvent.userAgent}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Bouton pour voir les logs de ce visiteur */}
                  {(currentVisitorEvent.visitorId || (currentVisitorEvent as any).visitorIdStable) && (
                    <div className="mt-4 pt-4 border-t border-black/[0.06]">
                      <button
                        onClick={() => {
                          // Utiliser visitorIdStable si disponible (pour regrouper tous les logs), sinon visitorId
                          const visitorIdToUse = (currentVisitorEvent as any).visitorIdStable || currentVisitorEvent.visitorId;
                          // Sauvegarder l'état du tiroir dans sessionStorage pour pouvoir y revenir
                          sessionStorage.setItem('returnToGlobe', 'true');
                          sessionStorage.setItem('globeSelectedDetail', JSON.stringify({
                            visitorId: visitorIdToUse,
                            id: currentVisitorEvent.id,
                          }));
                          // Rediriger vers les logs avec le visitorIdStable en paramètre (pour regrouper tous les logs)
                          router.push(`/dashboard/sharing/logs?visitorId=${encodeURIComponent(visitorIdToUse)}`);
                          onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-black/5 hover:bg-black/10 rounded-xl transition-all duration-200 group"
                      >
                        <FileText className="w-4 h-4 text-black/60 group-hover:text-black" />
                        <span className="text-sm font-medium text-black/70 group-hover:text-black">
                          Voir tous les logs de ce visiteur
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-black/40 text-center px-6">
                <div className="space-y-3">
                  <Eye className="w-12 h-12 text-[#96A982] mx-auto" />
                  <div className="space-y-1">
                    <p className="font-semibold text-base text-black/60">Sélectionnez un point</p>
                    <p className="text-xs text-black/30">sur le globe pour voir les détails</p>
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
