import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";

interface AnalyticsStats {
  // 1. Compteurs totaux
  totals: {
    openShare: number;
    openFolder: number;
    viewFile: number;
    downloadFile: number;
    accessDenied: number;
  };
  
  // 2. Visiteurs uniques
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
  
  // 3. Top Countries/Cities
  topCountries: Array<{ country: string; count: number; percentage: number }>;
  topCities: Array<{ city: string; country: string; count: number; percentage: number }>;
  
  // 4. Referrers
  referrers: Array<{ category: string; count: number; percentage: number }>;
  
  // 5. Funnel
  funnel: {
    viewToDownload: number; // %
    viewToViewFile: number; // %
    viewToOpenFolder: number; // %
  };
  
  // 6. Hot moments
  hotMoments: {
    activityByHour: Array<{ hour: number; count: number }>;
    peakActivity: { time: string; count: number };
    lastActivity: string | null;
  };
  
  // 7. Sécurité/Anomalies
  security: {
    totalDenials: number;
    denials24h: number;
    topDenialCountries: Array<{ country: string; count: number }>;
    unusualCountries: string[];
  };
  
  // 8. Top fichiers
  topFiles: {
    viewed: Array<{ fileId: string; fileName: string; count: number }>;
    downloaded: Array<{ fileId: string; fileName: string; count: number }>;
    conversionRate: Array<{ fileId: string; fileName: string; rate: number }>;
  };
}

export async function getLinkAnalyticsStats(
  linkId: string | null,
  userId: string,
  days: number = 30
): Promise<AnalyticsStats> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const allTimeStartDate = new Date(0); // Tous les temps

  try {
    // Récupérer tous les événements
    let query = db.collection("shareAnalytics")
      .where("timestamp", ">=", startDate);
    
    if (linkId) {
      query = query.where("linkId", "==", linkId) as any;
    } else {
      // Pour tous les liens de l'utilisateur
      const linksSnapshot = await db.collection("shareLinks")
        .where("creatorId", "==", userId)
        .get();
      const linkIds = linksSnapshot.docs.map(doc => doc.id);
      
      if (linkIds.length === 0) {
        return getEmptyStats();
      }
      
      // Firestore limite à 10 éléments dans "in", donc on doit faire plusieurs requêtes
      const chunks = [];
      for (let i = 0; i < linkIds.length; i += 10) {
        chunks.push(linkIds.slice(i, i + 10));
      }
      
      const allEvents: any[] = [];
      for (const chunk of chunks) {
        const snapshot = await db.collection("shareAnalytics")
          .where("linkId", "in", chunk)
          .where("timestamp", ">=", startDate)
          .get();
        allEvents.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      
      return calculateStats(allEvents, userId, days);
    }

    const snapshot = await query.get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return calculateStats(events, userId, days);
  } catch (error) {
    console.error("Erreur lors du calcul des stats:", error);
    return getEmptyStats();
  }
}

function calculateStats(events: any[], userId: string, days: number): AnalyticsStats {
  if (events.length === 0) {
    return getEmptyStats();
  }

  // 1. Compteurs totaux
  const totals = {
    openShare: events.filter(e => e.eventType === "OPEN_SHARE").length,
    openFolder: events.filter(e => e.eventType === "OPEN_FOLDER").length,
    viewFile: events.filter(e => e.eventType === "VIEW_FILE").length,
    downloadFile: events.filter(e => e.eventType === "DOWNLOAD_FILE").length,
    accessDenied: events.filter(e => e.eventType === "ACCESS_DENIED").length,
  };

  // 2. Visiteurs uniques
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const allVisitorIds = new Set(events.map(e => e.visitorId).filter(Boolean));
  const visitorIds24h = new Set(
    events
      .filter(e => e.timestamp?.toDate?.() >= last24h)
      .map(e => e.visitorId)
      .filter(Boolean)
  );
  const visitorIds7d = new Set(
    events
      .filter(e => e.timestamp?.toDate?.() >= last7d)
      .map(e => e.visitorId)
      .filter(Boolean)
  );

  // Nouveaux vs retours (simplifié : si visitorId vu avant les 7 derniers jours = returning)
  const returningVisitorIds = new Set<string>();
  const newVisitorIds = new Set<string>();
  
  events.forEach(event => {
    const vid = event.visitorId;
    if (!vid) return;
    
    const eventDate = event.timestamp?.toDate?.() || new Date();
    const earlierEvents = events.filter(e => 
      e.visitorId === vid && 
      e.timestamp?.toDate?.() < eventDate &&
      e.timestamp?.toDate?.() < last7d
    );
    
    if (earlierEvents.length > 0) {
      returningVisitorIds.add(vid);
    } else {
      newVisitorIds.add(vid);
    }
  });

  const uniques = {
    last24h: visitorIds24h.size,
    last7d: visitorIds7d.size,
    total: allVisitorIds.size,
    viewsPerVisitor: allVisitorIds.size > 0 ? totals.openShare / allVisitorIds.size : 0,
    newVsReturning: {
      new: newVisitorIds.size,
      returning: returningVisitorIds.size,
    },
  };

  // 3. Top Countries/Cities
  const countryCounts: Record<string, number> = {};
  const cityCounts: Record<string, { count: number; country: string }> = {};
  
  events.forEach(event => {
    if (event.country) {
      countryCounts[event.country] = (countryCounts[event.country] || 0) + 1;
    }
    if (event.city && event.country) {
      const key = `${event.city}, ${event.country}`;
      if (!cityCounts[key]) {
        cityCounts[key] = { count: 0, country: event.country };
      }
      cityCounts[key].count++;
    }
  });

  const totalWithGeo = Object.values(countryCounts).reduce((a, b) => a + b, 0);
  const topCountries = Object.entries(countryCounts)
    .map(([country, count]) => ({
      country,
      count,
      percentage: totalWithGeo > 0 ? (count / totalWithGeo) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topCities = Object.entries(cityCounts)
    .map(([city, data]) => ({
      city: city.split(", ")[0],
      country: data.country,
      count: data.count,
      percentage: totalWithGeo > 0 ? (data.count / totalWithGeo) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 4. Referrers
  const refererCounts: Record<string, number> = {};
  events.forEach(event => {
    const category = event.refererCategory || "Direct";
    refererCounts[category] = (refererCounts[category] || 0) + 1;
  });

  const totalReferers = Object.values(refererCounts).reduce((a, b) => a + b, 0);
  const referrers = Object.entries(refererCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalReferers > 0 ? (count / totalReferers) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 5. Funnel
  const uniqueViewers = new Set(
    events.filter(e => e.eventType === "OPEN_SHARE").map(e => e.visitorId).filter(Boolean)
  );
  const uniqueDownloaders = new Set(
    events.filter(e => e.eventType === "DOWNLOAD_FILE").map(e => e.visitorId).filter(Boolean)
  );
  const uniqueFileViewers = new Set(
    events.filter(e => e.eventType === "VIEW_FILE").map(e => e.visitorId).filter(Boolean)
  );
  const uniqueFolderOpeners = new Set(
    events.filter(e => e.eventType === "OPEN_FOLDER").map(e => e.visitorId).filter(Boolean)
  );

  const funnel = {
    viewToDownload: uniqueViewers.size > 0 
      ? (uniqueDownloaders.size / uniqueViewers.size) * 100 
      : 0,
    viewToViewFile: uniqueViewers.size > 0 
      ? (uniqueFileViewers.size / uniqueViewers.size) * 100 
      : 0,
    viewToOpenFolder: uniqueViewers.size > 0 
      ? (uniqueFolderOpeners.size / uniqueViewers.size) * 100 
      : 0,
  };

  // 6. Hot moments
  const hourCounts: Record<number, number> = {};
  let maxCount = 0;
  let peakTime = "";
  let lastActivityDate: Date | null = null;

  events.forEach((event: any) => {
    const timestamp = event.timestamp;
    let date: Date;
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate() as Date;
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    const hour = date.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    
    if (hourCounts[hour] > maxCount) {
      maxCount = hourCounts[hour];
      peakTime = `${hour.toString().padStart(2, '0')}:00`;
    }
    
    if (lastActivityDate === null || date > lastActivityDate) {
      lastActivityDate = date as Date;
    }
  });

  const activityByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourCounts[i] || 0,
  }));

  // Convertir lastActivityDate en string ISO ou null
  const getLastActivityString = (date: Date | null): string | null => {
    if (date === null) return null;
    return date.toISOString();
  };

  const hotMoments = {
    activityByHour,
    peakActivity: { time: peakTime, count: maxCount },
    lastActivity: getLastActivityString(lastActivityDate),
  };

  // 7. Sécurité
  const denialEvents = events.filter(e => e.eventType === "ACCESS_DENIED");
  const denials24h = denialEvents.filter(e => 
    e.timestamp?.toDate?.() >= last24h
  ).length;

  const denialCountryCounts: Record<string, number> = {};
  denialEvents.forEach(event => {
    if (event.country) {
      denialCountryCounts[event.country] = (denialCountryCounts[event.country] || 0) + 1;
    }
  });

  const topDenialCountries = Object.entries(denialCountryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Pays inhabituels : pays vus dans les refus mais jamais dans les accès valides
  const validCountries = new Set(
    events
      .filter(e => e.eventType !== "ACCESS_DENIED" && e.country)
      .map(e => e.country)
  );
  const unusualCountries = Object.keys(denialCountryCounts).filter(
    country => !validCountries.has(country)
  );

  const security = {
    totalDenials: denialEvents.length,
    denials24h,
    topDenialCountries,
    unusualCountries,
  };

  // 8. Top fichiers
  const fileViewCounts: Record<string, { count: number; name: string }> = {};
  const fileDownloadCounts: Record<string, { count: number; name: string }> = {};

  events.forEach(event => {
    if (event.fileId) {
      const fileId = event.fileId;
      if (event.eventType === "VIEW_FILE") {
        if (!fileViewCounts[fileId]) {
          fileViewCounts[fileId] = { count: 0, name: event.fileName || fileId };
        }
        fileViewCounts[fileId].count++;
      } else if (event.eventType === "DOWNLOAD_FILE") {
        if (!fileDownloadCounts[fileId]) {
          fileDownloadCounts[fileId] = { count: 0, name: event.fileName || fileId };
        }
        fileDownloadCounts[fileId].count++;
      }
    }
  });

  const topFiles = {
    viewed: Object.entries(fileViewCounts)
      .map(([fileId, data]) => ({ fileId, fileName: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    downloaded: Object.entries(fileDownloadCounts)
      .map(([fileId, data]) => ({ fileId, fileName: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    conversionRate: Object.keys({ ...fileViewCounts, ...fileDownloadCounts })
      .map(fileId => {
        const views = fileViewCounts[fileId]?.count || 0;
        const downloads = fileDownloadCounts[fileId]?.count || 0;
        return {
          fileId,
          fileName: fileViewCounts[fileId]?.name || fileDownloadCounts[fileId]?.name || fileId,
          rate: views > 0 ? (downloads / views) * 100 : 0,
        };
      })
      .filter(f => f.rate > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 10),
  };

  return {
    totals,
    uniques,
    topCountries,
    topCities,
    referrers,
    funnel,
    hotMoments,
    security,
    topFiles,
  };
}

function getEmptyStats(): AnalyticsStats {
  return {
    totals: {
      openShare: 0,
      openFolder: 0,
      viewFile: 0,
      downloadFile: 0,
      accessDenied: 0,
    },
    uniques: {
      last24h: 0,
      last7d: 0,
      total: 0,
      viewsPerVisitor: 0,
      newVsReturning: { new: 0, returning: 0 },
    },
    topCountries: [],
    topCities: [],
    referrers: [],
    funnel: {
      viewToDownload: 0,
      viewToViewFile: 0,
      viewToOpenFolder: 0,
    },
    hotMoments: {
      activityByHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
      peakActivity: { time: "00:00", count: 0 },
      lastActivity: null,
    },
    security: {
      totalDenials: 0,
      denials24h: 0,
      topDenialCountries: [],
      unusualCountries: [],
    },
    topFiles: {
      viewed: [],
      downloaded: [],
      conversionRate: [],
    },
  };
}

