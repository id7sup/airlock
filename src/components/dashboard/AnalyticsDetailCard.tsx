"use client";

import { X, Eye, Download, Lock, MapPin, Clock, Monitor } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnalyticsDetail {
  id: string;
  type: string;
  eventType: string;
  country: string;
  city: string;
  region?: string;
  timestamp: string;
  visitorId: string;
  userAgent: string;
  ip?: string;
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
  
  let browser = "Inconnu";
  let device = "Desktop";
  let os = "Inconnu";
  
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browser = "Chrome";
  } else if (userAgent.includes("Firefox")) {
    browser = "Firefox";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browser = "Safari";
  } else if (userAgent.includes("Edg")) {
    browser = "Edge";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    browser = "Opera";
  }
  
  if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Mac OS X") || userAgent.includes("macOS")) {
    os = "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  } else if (userAgent.includes("Android")) {
    os = "Android";
    device = "Mobile";
  } else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
    device = userAgent.includes("iPad") ? "Tablette" : "Mobile";
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

  const eventType = currentEvent?.eventType || currentEvent?.type;
  const userInfo = currentEvent ? parseUserAgent(currentEvent.userAgent || "") : null;
  const timestamp = currentEvent ? new Date(currentEvent.timestamp) : null;

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
                {currentEvent && (
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
                    {currentEvent ? eventLabel : "Aucun point"}
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
            {currentEvent ? (
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
                      <p className="text-sm font-semibold text-black leading-tight">
                        {currentEvent.city || "Ville inconnue"}
                      </p>
                      <p className="text-xs text-black/50">
                        {[currentEvent.region, currentEvent.country].filter(Boolean).join(", ") || "Localisation inconnue"}
                      </p>
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
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Adresse IP</h3>
                    <div className="p-3.5 bg-black/[0.02] rounded-xl border border-black/[0.06]">
                      <p className="text-sm font-semibold text-black font-mono break-all">
                        {currentEvent.ip || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Visiteur</h3>
                    <div className="p-3.5 bg-black/[0.02] rounded-xl border border-black/[0.06]">
                      <p className="text-sm font-semibold text-black font-mono break-all">
                        {currentEvent.visitorId || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Référence */}
                <div className="pt-4 border-t border-black/[0.06]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">Événement</p>
                      <p className="text-xs font-mono text-black/60">#{currentEvent.id}</p>
                    </div>
                    {currentEvent.userAgent && (
                      <div className="flex-1 ml-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">User Agent</p>
                        <p className="text-[10px] text-black/40 font-mono leading-relaxed break-all line-clamp-1">
                          {currentEvent.userAgent}
                        </p>
                      </div>
                    )}
                  </div>
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
