"use client";

import { useState } from "react";
import { X, Eye, Download, Lock, MapPin, Clock, Monitor, ChevronLeft } from "lucide-react";

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
}

interface ClusterDetail {
  pointCount: number;
  center: [number, number];
  points: AnalyticsDetail[];
}

interface AnalyticsDetailCardProps {
  detail: ClusterDetail | AnalyticsDetail | null;
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

export function AnalyticsDetailCard({ detail, onClose }: AnalyticsDetailCardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "location">("overview");

  if (!detail) return null;

  const isCluster = "pointCount" in detail;
  
  // Calculer les statistiques
  const events = isCluster ? detail.points : [detail as AnalyticsDetail];
  const stats = {
    views: events.filter(e => e.eventType === "OPEN_SHARE" || e.eventType === "VIEW_FILE" || e.type === "VIEW").length,
    downloads: events.filter(e => e.eventType === "DOWNLOAD_FILE" || e.type === "DOWNLOAD").length,
    denied: events.filter(e => e.eventType === "ACCESS_DENIED" || e.type === "DENIED").length,
    folders: events.filter(e => e.eventType === "OPEN_FOLDER" || e.type === "FOLDER").length,
  };

  // Grouper par localisation
  const locations = events.reduce((acc, event) => {
    const key = `${event.city || "Inconnu"}-${event.country || "Inconnu"}`;
    if (!acc[key]) {
      acc[key] = {
        city: event.city || "Inconnu",
        country: event.country || "Inconnu",
        region: event.region || "",
        count: 0,
        events: []
      };
    }
    acc[key].count++;
    acc[key].events.push(event);
    return acc;
  }, {} as Record<string, { city: string; country: string; region: string; count: number; events: AnalyticsDetail[] }>);

  // Dernier événement
  const lastEvent = events.length > 0 
    ? events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  return (
    <div className="fixed top-4 right-4 bottom-4 z-50 w-80">
      <div className="bg-white h-full rounded-3xl shadow-2xl border border-black/5 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/5">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-black/60" />
            </button>
            <div>
              <h3 className="text-sm font-semibold text-black">
                Détail
              </h3>
              <p className="text-xs text-black/40">
                Événement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-black/60" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-4 py-3 text-xs font-semibold transition-colors relative ${
              activeTab === "overview"
                ? "text-black"
                : "text-black/50 hover:text-black/70"
            }`}
          >
            Vue d'ensemble
            {activeTab === "overview" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 px-4 py-3 text-xs font-semibold transition-colors relative ${
              activeTab === "events"
                ? "text-black"
                : "text-black/50 hover:text-black/70"
            }`}
          >
            Événements ({events.length})
            {activeTab === "events" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`flex-1 px-4 py-3 text-xs font-semibold transition-colors relative ${
              activeTab === "location"
                ? "text-black"
                : "text-black/50 hover:text-black/70"
            }`}
          >
            Localisation ({Object.keys(locations).length})
            {activeTab === "location" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Stats en grille 2x2 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/5 rounded-3xl p-4 text-center aspect-square flex flex-col items-center justify-center">
                  <Eye className="w-5 h-5 text-black/60 mb-2" />
                  <p className="text-xl font-semibold text-black tabular-nums mb-1">{stats.views}</p>
                  <p className="text-[10px] text-black/40 font-medium">Vues</p>
                </div>
                <div className="bg-black/5 rounded-3xl p-4 text-center aspect-square flex flex-col items-center justify-center">
                  <Download className="w-5 h-5 text-black/60 mb-2" />
                  <p className="text-xl font-semibold text-black tabular-nums mb-1">{stats.downloads}</p>
                  <p className="text-[10px] text-black/40 font-medium">Téléchargements</p>
                </div>
                <div className="bg-black/5 rounded-3xl p-4 text-center aspect-square flex flex-col items-center justify-center">
                  <Lock className="w-5 h-5 text-red-500 mb-2" />
                  <p className="text-xl font-semibold text-black tabular-nums mb-1">{stats.denied}</p>
                  <p className="text-[10px] text-black/40 font-medium">Refusés</p>
                </div>
                <div className="bg-black/5 rounded-3xl p-4 text-center aspect-square flex flex-col items-center justify-center">
                  <Monitor className="w-5 h-5 text-black/60 mb-2" />
                  <p className="text-xl font-semibold text-black tabular-nums mb-1">{stats.folders}</p>
                  <p className="text-[10px] text-black/40 font-medium">Dossiers</p>
                </div>
              </div>

              {/* Dernière activité - Rectangle en dessous */}
              {lastEvent && (
                <div className="bg-black/5 rounded-3xl p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3.5 h-3.5 text-black/40" />
                    <p className="text-xs font-semibold text-black/60 uppercase tracking-wider">Dernière activité</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-black">{getTimeAgo(new Date(lastEvent.timestamp))}</p>
                    <p className="text-xs text-black/40">
                      {new Date(lastEvent.timestamp).toLocaleString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/50">
                    <MapPin className="w-3 h-3" />
                    <span>{lastEvent.city || "Inconnu"}, {lastEvent.country || "Inconnu"}</span>
                  </div>
                  {(() => {
                    const userInfo = parseUserAgent(lastEvent.userAgent || "");
                    return (
                      <div className="flex items-center gap-2 text-xs text-black/50">
                        <Monitor className="w-3 h-3" />
                        <span>{userInfo.device} • {userInfo.browser} • {userInfo.os}</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-3">
              {events.map((event, idx) => {
                const userInfo = parseUserAgent(event.userAgent || "");
                const timestamp = new Date(event.timestamp);
                const eventType = event.eventType || event.type;
                
                let eventLabel = "Vue";
                let eventIcon = Eye;
                let eventColor = "text-white/60";
                
                if (eventType === "DOWNLOAD_FILE" || eventType === "DOWNLOAD") {
                  eventLabel = "Téléchargement";
                  eventIcon = Download;
                } else if (eventType === "ACCESS_DENIED" || eventType === "DENIED") {
                  eventLabel = "Accès refusé";
                  eventIcon = Lock;
                  eventColor = "text-red-400";
                } else if (eventType === "OPEN_FOLDER" || eventType === "FOLDER") {
                  eventLabel = "Dossier ouvert";
                  eventIcon = Monitor;
                }

                return (
                  <div key={event.id || idx} className="bg-black/5 rounded-2xl p-3 hover:bg-black/10 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center flex-shrink-0 ${eventColor}`}>
                        {eventIcon === Eye && <Eye className="w-4 h-4" />}
                        {eventIcon === Download && <Download className="w-4 h-4" />}
                        {eventIcon === Lock && <Lock className="w-4 h-4" />}
                        {eventIcon === Monitor && <Monitor className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-semibold text-black">{eventLabel}</p>
                          <p className="text-xs text-black/40">{getTimeAgo(timestamp)}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-black/50">
                            <MapPin className="w-3 h-3" />
                            <span>{event.city || "Inconnu"}, {event.country || "Inconnu"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-black/50">
                            <Monitor className="w-3 h-3" />
                            <span>{userInfo.device} • {userInfo.browser} • {userInfo.os}</span>
                          </div>
                          <p className="text-xs text-black/40">
                            {timestamp.toLocaleString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "location" && (
            <div className="space-y-3">
              {Object.values(locations).map((location, idx) => (
                <div key={idx} className="bg-black/5 rounded-2xl p-3 hover:bg-black/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-black/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-black">
                          {location.city}, {location.country}
                        </p>
                        <p className="text-xs font-semibold text-black/40 bg-black/5 px-2 py-0.5 rounded-xl">
                          {location.count}
                        </p>
                      </div>
                      {location.region && (
                        <p className="text-xs text-black/50 mb-2">{location.region}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {location.events.slice(0, 4).map((event, eventIdx) => {
                          const eventType = event.eventType || event.type;
                          const isView = eventType === "OPEN_SHARE" || eventType === "VIEW_FILE" || eventType === "VIEW";
                          const isDownload = eventType === "DOWNLOAD_FILE" || eventType === "DOWNLOAD";
                          const isDenied = eventType === "ACCESS_DENIED" || eventType === "DENIED";
                          
                          return (
                            <span
                              key={eventIdx}
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                isView
                                  ? "bg-brand-primary/10 text-brand-primary"
                                  : isDownload
                                  ? "bg-blue-500/10 text-blue-600"
                                  : isDenied
                                  ? "bg-red-500/10 text-red-600"
                                  : "bg-black/5 text-black/50"
                              }`}
                            >
                              {isView ? "Vue" : isDownload ? "Téléch." : isDenied ? "Refusé" : "Autre"}
                            </span>
                          );
                        })}
                        {location.events.length > 4 && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/5 text-black/50">
                            +{location.events.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
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
