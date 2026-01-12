"use client";

import { X, Eye, Download, Lock, MapPin, Clock, Monitor } from "lucide-react";

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

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[420px] lg:w-[35vw] max-w-[540px] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full bg-white shadow-2xl border-l border-black/5 flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-black/5">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
                Détail en direct
              </p>
              <p className="text-lg font-semibold text-black">
                {currentEvent ? "Point sélectionné" : "Aucun point sélectionné"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
              aria-label="Fermer le détail"
            >
              <X className="w-4 h-4 text-black/60" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {currentEvent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${accent}`}>
                      {eventIcon === Eye && <Eye className="w-5 h-5" />}
                      {eventIcon === Download && <Download className="w-5 h-5" />}
                      {eventIcon === Lock && <Lock className="w-5 h-5" />}
                      {eventIcon === Monitor && <Monitor className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-black/40 font-semibold">
                        Type d'action
                      </p>
                      <p className="text-base font-semibold text-black">{eventLabel}</p>
                    </div>
                  </div>
                  {timestamp && (
                    <div className="text-right">
                      <p className="text-xs text-black/40">Il y a</p>
                      <p className="text-sm font-semibold text-black">{getTimeAgo(timestamp)}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/50">
                    <Clock className="w-4 h-4" />
                    Horodatage
                  </div>
                  <p className="text-sm font-medium text-black">
                    {timestamp
                      ? timestamp.toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/[0.06] bg-white p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/50">
                    <MapPin className="w-4 h-4" />
                    Localisation
                  </div>
                  <p className="text-sm font-semibold text-black">
                    {[currentEvent.city, currentEvent.region].filter(Boolean).join(", ") || "Localisation inconnue"}
                  </p>
                  <p className="text-xs text-black/50">{currentEvent.country || "Pays inconnu"}</p>
                </div>

                <div className="rounded-2xl border border-black/[0.06] bg-white p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/50">
                    <Monitor className="w-4 h-4" />
                    Appareil
                  </div>
                  {userInfo ? (
                    <div className="space-y-1 text-sm text-black">
                      <p className="font-semibold">{userInfo.device}</p>
                      <p className="text-black/60">
                        {userInfo.browser} • {userInfo.os}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-black/60">Appareil inconnu</p>
                  )}
                  <p className="text-[11px] text-black/40 break-words">
                    {currentEvent.userAgent || "User agent non renseigné"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/50 mb-1">
                      Adresse IP
                    </p>
                    <p className="text-sm font-semibold text-black">
                      {currentEvent.ip || "IP non disponible"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/50 mb-1">
                      Identifiant visiteur
                    </p>
                    <p className="text-sm font-semibold text-black truncate">
                      {currentEvent.visitorId || "Non renseigné"}
                    </p>
                    <p className="text-[11px] text-black/40 mt-1">Événement #{currentEvent.id}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-black/40 text-center px-6">
                Sélectionnez un point sur le globe pour voir les informations essentielles.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
