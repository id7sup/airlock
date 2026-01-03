"use client";

import { useState } from "react";
import { X, Eye, Download, Lock, MapPin, Clock, Monitor, Smartphone, Tablet, Globe as GlobeIcon } from "lucide-react";

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

  // Grouper par localisation pour l'onglet location
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

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 pb-6 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
              <GlobeIcon className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">
                {isCluster ? `${detail.pointCount} Activités` : "Détail de l'activité"}
              </h3>
              <p className="text-sm text-black/40 font-medium">
                {isCluster ? "Cluster d'événements" : "Événement individuel"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-black/60" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-colors relative ${
              activeTab === "overview"
                ? "text-black"
                : "text-black/40 hover:text-black/60"
            }`}
          >
            Vue d'ensemble
            {activeTab === "overview" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-colors relative ${
              activeTab === "events"
                ? "text-black"
                : "text-black/40 hover:text-black/60"
            }`}
          >
            Événements ({events.length})
            {activeTab === "events" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-colors relative ${
              activeTab === "location"
                ? "text-black"
                : "text-black/40 hover:text-black/60"
            }`}
          >
            Localisations ({Object.keys(locations).length})
            {activeTab === "location" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-brand-primary" />
                    <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Vues</p>
                  </div>
                  <p className="text-3xl font-light text-black tabular-nums">{stats.views}</p>
                </div>
                <div className="bg-black/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Download className="w-5 h-5 text-brand-primary" />
                    <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Téléchargements</p>
                  </div>
                  <p className="text-3xl font-light text-black tabular-nums">{stats.downloads}</p>
                </div>
                <div className="bg-black/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Accès refusés</p>
                  </div>
                  <p className="text-3xl font-light text-black tabular-nums">{stats.denied}</p>
                </div>
                <div className="bg-black/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <GlobeIcon className="w-5 h-5 text-brand-primary" />
                    <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Dossiers</p>
                  </div>
                  <p className="text-3xl font-light text-black tabular-nums">{stats.folders}</p>
                </div>
              </div>

              {/* Dernière activité */}
              {events.length > 0 && (
                <div className="bg-black/5 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-black/60" />
                    <p className="text-sm font-bold text-black/60 uppercase tracking-wider">Dernière activité</p>
                  </div>
                  {(() => {
                    const lastEvent = events.sort((a, b) => 
                      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    )[0];
                    const userInfo = parseUserAgent(lastEvent.userAgent || "");
                    const timestamp = new Date(lastEvent.timestamp);
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-black">{getTimeAgo(timestamp)}</p>
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
                        <div className="flex items-center gap-2 text-sm text-black/60">
                          <MapPin className="w-4 h-4" />
                          <span>{lastEvent.city || "Inconnu"}, {lastEvent.country || "Inconnu"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-black/60">
                          <Monitor className="w-4 h-4" />
                          <span>{userInfo.device} • {userInfo.browser} • {userInfo.os}</span>
                        </div>
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
                let eventColor = "text-brand-primary";
                
                if (eventType === "DOWNLOAD_FILE" || eventType === "DOWNLOAD") {
                  eventLabel = "Téléchargement";
                  eventIcon = Download;
                } else if (eventType === "ACCESS_DENIED" || eventType === "DENIED") {
                  eventLabel = "Accès refusé";
                  eventIcon = Lock;
                  eventColor = "text-red-500";
                } else if (eventType === "OPEN_FOLDER" || eventType === "FOLDER") {
                  eventLabel = "Dossier ouvert";
                  eventIcon = GlobeIcon;
                }

                return (
                  <div key={event.id || idx} className="bg-black/5 rounded-2xl p-4 hover:bg-black/10 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center flex-shrink-0 ${eventColor}`}>
                        {eventIcon === Eye && <Eye className="w-5 h-5" />}
                        {eventIcon === Download && <Download className="w-5 h-5" />}
                        {eventIcon === Lock && <Lock className="w-5 h-5" />}
                        {eventIcon === GlobeIcon && <GlobeIcon className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-sm text-black">{eventLabel}</p>
                          <p className="text-xs text-black/40 font-medium">{getTimeAgo(timestamp)}</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-black/60">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{event.city || "Inconnu"}, {event.country || "Inconnu"}</span>
                            {event.region && <span className="text-black/40">• {event.region}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-black/60">
                            <Monitor className="w-3.5 h-3.5" />
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
                <div key={idx} className="bg-black/5 rounded-2xl p-4 hover:bg-black/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-sm text-black">
                          {location.city}, {location.country}
                        </p>
                        <p className="text-xs font-bold text-black/40 bg-black/5 px-2 py-1 rounded-lg">
                          {location.count}
                        </p>
                      </div>
                      {location.region && (
                        <p className="text-xs text-black/60 mb-2">{location.region}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {location.events.slice(0, 5).map((event, eventIdx) => {
                          const eventType = event.eventType || event.type;
                          const isView = eventType === "OPEN_SHARE" || eventType === "VIEW_FILE" || eventType === "VIEW";
                          const isDownload = eventType === "DOWNLOAD_FILE" || eventType === "DOWNLOAD";
                          const isDenied = eventType === "ACCESS_DENIED" || eventType === "DENIED";
                          
                          return (
                            <span
                              key={eventIdx}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                isView
                                  ? "bg-brand-primary/10 text-brand-primary"
                                  : isDownload
                                  ? "bg-blue-500/10 text-blue-500"
                                  : isDenied
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-black/5 text-black/60"
                              }`}
                            >
                              {isView ? "Vue" : isDownload ? "Téléchargement" : isDenied ? "Refusé" : "Autre"}
                            </span>
                          );
                        })}
                        {location.events.length > 5 && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-black/5 text-black/60">
                            +{location.events.length - 5}
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

