import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";

/** Retourne l'heure (0-23) dans le fuseau Europe/Paris */
function getParisHour(date: Date): number {
  return parseInt(
    date.toLocaleString('en-US', { timeZone: 'Europe/Paris', hour: 'numeric', hour12: false })
  ) % 24;
}

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
    activityByPeriod: Array<{ label: string; count: number; views: number; downloads: number; timestamp?: number }>;
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
  days: number = 30,
  period: '1J' | '1S' | 'Max' = 'Max'
): Promise<AnalyticsStats> {
  // Pour MAX, récupérer tous les événements depuis le début
  const startDate = days >= 9999 ? new Date(0) : new Date();
  if (days < 9999) {
    startDate.setDate(startDate.getDate() - days);
  }
  
  const allTimeStartDate = new Date(0); // Tous les temps

  try {
    // Récupérer les événements pour la période spécifiée (pour les stats de période)
    let query = db.collection("shareAnalytics")
      .where("timestamp", ">=", startDate);
    
    // Récupérer TOUS les événements (sans filtre de date) pour calculer le total de visiteurs uniques
    let allTimeQuery = db.collection("shareAnalytics");
    
    if (linkId) {
      query = query.where("linkId", "==", linkId) as any;
      allTimeQuery = allTimeQuery.where("linkId", "==", linkId) as any;
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
      const allTimeEvents: any[] = [];
      
      for (const chunk of chunks) {
        // Événements pour la période
        const snapshot = await db.collection("shareAnalytics")
          .where("linkId", "in", chunk)
          .where("timestamp", ">=", startDate)
          .get();
        allEvents.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // TOUS les événements (pour le total de visiteurs)
        const allTimeSnapshot = await db.collection("shareAnalytics")
          .where("linkId", "in", chunk)
          .get();
        allTimeEvents.push(...allTimeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      
      return calculateStats(allEvents, userId, days, period, allTimeEvents);
    }

    const snapshot = await query.get();
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });
    
    // Récupérer TOUS les événements pour le total de visiteurs (sans filtre de date)
    // Important : récupérer tous les événements pour ce lien, pas seulement ceux de la période
    let allTimeSnapshot;
    try {
      allTimeSnapshot = await allTimeQuery.get();
    } catch (error: any) {
      // Si la requête échoue (par exemple, index manquant), utiliser les événements de la période
      console.warn("[ANALYTICS] Erreur lors de la récupération de allTimeEvents, utilisation des événements de la période:", error?.message);
      allTimeSnapshot = snapshot;
    }
    
    const allTimeEvents = allTimeSnapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });
    
    return calculateStats(events, userId, days, period, allTimeEvents);
  } catch (error) {
    console.error("Erreur lors du calcul des stats:", error);
    return getEmptyStats();
  }
}

function calculateStats(events: any[], userId: string, days: number, period: '1J' | '1S' | 'Max' = '1J', allTimeEvents?: any[]): AnalyticsStats {
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
  // IMPORTANT : Compter TOUS les visiteurs uniques basés sur visitorId
  // Un visiteur unique = un visitorId unique, indépendamment de ownerId
  // On exclut uniquement les événements où ownerId === userId (propriétaire) pour les stats externes
  // Mais pour le TOTAL de visiteurs uniques, on compte TOUS les visitorId uniques
  
  // Filtrer les événements externes (exclure seulement le propriétaire) pour les stats de période
  const externalEvents = events.filter(e => {
    // Inclure si ownerId est null/undefined (anciens événements ou cas spéciaux)
    if (e.ownerId === null || e.ownerId === undefined) return true;
    // Inclure si ownerId est différent du userId (visiteurs externes)
    return e.ownerId !== userId;
  });
  
  // Pour le TOTAL de visiteurs uniques, on compte TOUS les visitorId uniques
  // Même si c'est le propriétaire qui teste, chaque visitorId unique compte comme un visiteur
  // Cela permet de tester en local et de voir les visiteurs même si on teste seul
  const allTimeExternalEvents = (allTimeEvents && allTimeEvents.length > 0)
    ? allTimeEvents // Utiliser TOUS les événements pour le total de visiteurs uniques
    : events; // Si pas de allTimeEvents, utiliser tous les événements de la période
  
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // TOTAL de visiteurs uniques : utiliser TOUS les événements depuis le début
  // Filtrer uniquement les événements qui ont un visitorId valide
  // IMPORTANT : Exclure LINK_PREVIEW car c'est juste pour les bots de prévisualisation
  // Important : compter les visiteurs uniques basés sur visitorId, pas sur les événements
  const visitorIdsFromAllTime = allTimeExternalEvents
    .filter(e => {
      // Exclure LINK_PREVIEW qui est juste pour les bots
      const eventType = e.eventType || e.type;
      return eventType !== "LINK_PREVIEW";
    })
    .map(e => {
      // Extraire visitorId de différentes façons possibles
      const vid = e.visitorId || e.visitor_id || null;
      return vid;
    })
    .filter((id): id is string => {
      // Filtrer les valeurs null, undefined, et les chaînes vides
      return typeof id === 'string' && id.length > 0;
    });
  
  const allVisitorIds = new Set(visitorIdsFromAllTime);
  
  // Pour les périodes 24h et 7d, on compte aussi TOUS les visiteurs uniques
  // Exclure LINK_PREVIEW pour ne compter que les vrais visiteurs
  const visitorIds24h = new Set(
    events
      .filter(e => {
        const eventDate = e.timestamp?.toDate?.() || new Date(e.timestamp);
        const eventType = e.eventType || e.type;
        return eventDate >= last24h && eventType !== "LINK_PREVIEW";
      })
      .map(e => {
        // Extraire visitorId de différentes façons possibles
        return e.visitorId || e.visitor_id || null;
      })
      .filter((id): id is string => {
        // Filtrer les valeurs null, undefined, et les chaînes vides
        return typeof id === 'string' && id.length > 0;
      })
  );
  
  const visitorIds7d = new Set(
    events
      .filter(e => {
        const eventDate = e.timestamp?.toDate?.() || new Date(e.timestamp);
        const eventType = e.eventType || e.type;
        return eventDate >= last7d && eventType !== "LINK_PREVIEW";
      })
      .map(e => {
        // Extraire visitorId de différentes façons possibles
        return e.visitorId || e.visitor_id || null;
      })
      .filter((id): id is string => {
        // Filtrer les valeurs null, undefined, et les chaînes vides
        return typeof id === 'string' && id.length > 0;
      })
  );

  // Nouveaux vs retours (simplifié : si visitorId vu avant les 7 derniers jours = returning)
  const returningVisitorIds = new Set<string>();
  const newVisitorIds = new Set<string>();
  
  externalEvents.forEach(event => {
    // Extraire visitorId de différentes façons possibles
    const vid = event.visitorId || event.visitor_id || null;
    if (!vid || typeof vid !== 'string' || vid.length === 0) return;
    
    const eventDate = event.timestamp?.toDate?.() || new Date(event.timestamp);
    const earlierEvents = externalEvents.filter(e => 
      e.visitorId === vid && 
      (e.timestamp?.toDate?.() || new Date(e.timestamp)) < eventDate &&
      (e.timestamp?.toDate?.() || new Date(e.timestamp)) < last7d
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
    events
      .filter(e => e.eventType === "OPEN_SHARE")
      .map(e => e.visitorId || e.visitor_id || null)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
  );
  const uniqueDownloaders = new Set(
    events
      .filter(e => e.eventType === "DOWNLOAD_FILE")
      .map(e => e.visitorId || e.visitor_id || null)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
  );
  const uniqueFileViewers = new Set(
    events
      .filter(e => e.eventType === "VIEW_FILE")
      .map(e => e.visitorId || e.visitor_id || null)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
  );
  const uniqueFolderOpeners = new Set(
    events
      .filter(e => e.eventType === "OPEN_FOLDER")
      .map(e => e.visitorId || e.visitor_id || null)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
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
  // Réutiliser la variable 'now' définie plus haut (ligne 139)
  let periodStart: Date;
  let periodDuration: number; // en millisecondes
  
  switch (period) {
    case '1J':
      periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      periodDuration = 24 * 60 * 60 * 1000;
      break;
    case '1S':
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      periodDuration = 7 * 24 * 60 * 60 * 1000;
      break;
    case 'Max':
      periodStart = new Date(0);
      periodDuration = now.getTime();
      break;
  }

  // Filtrer les événements de la période sélectionnée
  const periodEvents = events.filter((event: any) => {
    const timestamp = event.timestamp;
    let date: Date;
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate() as Date;
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return false;
    }
    return date >= periodStart && date <= now;
  });

  // Pour MAX : calculer la durée réelle des données pour adapter l'unité
  let maxPeriodUnit: 'day' | 'week' | 'month' = 'month';
  if (period === 'Max' && periodEvents.length > 0) {
    const dates = periodEvents.map((event: any) => {
      const timestamp = event.timestamp;
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate() as Date;
      } else if (timestamp instanceof Date) {
        return timestamp;
      } else if (typeof timestamp === 'string') {
        return new Date(timestamp);
      }
      return null;
    }).filter((d): d is Date => d !== null).sort((a, b) => a.getTime() - b.getTime());
    
    if (dates.length > 0) {
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      const durationDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Adapter l'unité selon la durée
      if (durationDays <= 7) {
        // 1 semaine ou moins → par jour
        maxPeriodUnit = 'day';
      } else if (durationDays <= 90) {
        // ~3 mois ou moins → par semaine
        maxPeriodUnit = 'week';
      } else {
        // Plus de 3 mois → par mois
        maxPeriodUnit = 'month';
      }
    }
  }
  
  // Variable constante pour éviter les problèmes de narrowing TypeScript
  const maxUnit: 'day' | 'week' | 'month' = maxPeriodUnit;

  const hourCounts: Record<number, number> = {};
  const periodData: Record<string, number> = {};
  const periodViewsData: Record<string, number> = {};
  const periodDownloadsData: Record<string, number> = {};
  let maxCount = 0;
  let peakTime = "";
  let lastActivityDate: Date | null = null;

  periodEvents.forEach((event: any) => {
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
    
    // Pour activityByHour (toujours 24 heures pour compatibilité)
    const hour = getParisHour(date);
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    
    // Pour activityByPeriod (selon la période sélectionnée)
    let periodKey: string;
    let periodTimestamp: number;
    
    switch (period) {
      case '1J':
        // Utiliser l'heure complète de l'événement (sans les minutes)
        // Cela regroupe tous les événements qui se sont produits dans la même heure
        const eventHour = getParisHour(date);
        periodKey = `${eventHour.toString().padStart(2, '0')}h`;
        // Calculer l'index de la tranche (0 = il y a 23h, 23 = maintenant)
        const hoursSinceEvent = Math.floor((now.getTime() - date.getTime()) / (60 * 60 * 1000));
        periodTimestamp = Math.max(0, 23 - hoursSinceEvent);
        break;
      case '1S':
        // Jours de la semaine (7 derniers jours)
        const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        periodKey = dayOfWeek;
        periodTimestamp = date.getTime();
        break;
      case 'Max':
        // Adapter selon la durée des données
        switch (maxUnit) {
          case 'week':
            // Par semaine : calculer le début de semaine (lundi)
            const weekStart = new Date(date);
            const dayOfWeek = date.getDay(); // 0 = dimanche, 1 = lundi, etc.
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convertir dimanche (0) en 6
            weekStart.setDate(date.getDate() - daysToMonday);
            weekStart.setHours(0, 0, 0, 0);
            
            // Créer une clé unique pour cette semaine (format: YYYY-MM-DD pour le lundi de la semaine)
            const year = weekStart.getFullYear();
            const month = String(weekStart.getMonth() + 1).padStart(2, '0');
            const day = String(weekStart.getDate()).padStart(2, '0');
            periodKey = `${year}-${month}-${day}`; // Clé unique par semaine (lundi de la semaine)
            periodTimestamp = weekStart.getTime();
            break;
          case 'day':
            // Par jour
            periodKey = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
            periodTimestamp = date.getTime();
            break;
          default:
            // Par mois (par défaut)
            const monthMax = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            periodKey = monthMax;
            periodTimestamp = date.getTime();
            break;
        }
        break;
    }
    
    if (!periodData[periodKey]) {
      periodData[periodKey] = 0;
      periodViewsData[periodKey] = 0;
      periodDownloadsData[periodKey] = 0;
    }
    periodData[periodKey]++;
    
    // Séparer les vues et les téléchargements
    const isView = event.eventType === "OPEN_SHARE" || event.eventType === "VIEW_FILE" || event.eventType === "OPEN_FOLDER";
    const isDownload = event.eventType === "DOWNLOAD_FILE";
    
    if (isView) {
      periodViewsData[periodKey]++;
    }
    if (isDownload) {
      periodDownloadsData[periodKey]++;
    }
    
    if (periodData[periodKey] > maxCount) {
      maxCount = periodData[periodKey];
      peakTime = periodKey;
    }
    
    if (lastActivityDate === null || date > lastActivityDate) {
      lastActivityDate = date as Date;
    }
  });

  // Générer activityByHour (24 heures pour compatibilité, mais basé sur les 24 dernières heures)
  const activityByHour = Array.from({ length: 24 }, (_, i) => {
    // Pour 1J, on utilise les heures des 24 dernières heures
    if (period === '1J') {
      const hoursAgo = (24 - i) % 24;
      const targetHour = (getParisHour(now) - hoursAgo + 24) % 24;
      return {
        hour: targetHour,
        count: hourCounts[targetHour] || 0,
      };
    }
    // Pour les autres périodes, on garde l'ancien format (0-23h)
    return {
      hour: i,
      count: hourCounts[i] || 0,
    };
  });

  // Générer activityByPeriod selon la période
  let activityByPeriod: Array<{ label: string; count: number; views: number; downloads: number; timestamp?: number }> = [];
  
  switch (period) {
    case '1J':
      // 24 dernières heures : créer 24 tranches d'une heure chacune
      // Afficher les heures des 24 dernières heures dans l'ordre chronologique
      activityByPeriod = Array.from({ length: 24 }, (_, i) => {
        // i=0 = il y a 23h, i=23 = maintenant (heure actuelle)
        const hoursAgo = 23 - i;
        const targetDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        const hour = getParisHour(targetDate);
        const label = `${hour.toString().padStart(2, '0')}h`;
        return {
          label,
          count: periodData[label] || 0,
          views: periodViewsData[label] || 0,
          downloads: periodDownloadsData[label] || 0,
          timestamp: i, // Index de la tranche (0-23)
        };
      });
      break;
    case '1S':
      // 7 derniers jours
      activityByPeriod = Array.from({ length: 7 }, (_, i) => {
        const daysAgo = 6 - i;
        const targetDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const dayLabel = targetDate.toLocaleDateString('fr-FR', { weekday: 'short' });
        return {
          label: dayLabel,
          count: periodData[dayLabel] || 0,
          views: periodViewsData[dayLabel] || 0,
          downloads: periodDownloadsData[dayLabel] || 0,
          timestamp: targetDate.getTime(),
        };
      });
      break;
    case 'Max':
      // Adapter selon la durée des données
      if (maxUnit === 'week') {
        // Par semaine : utiliser les clés générées dans le forEach (format YYYY-MM-DD)
        const weekKeys = Object.keys(periodData).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key));
        
        const weeks: Array<{ label: string; count: number; views: number; downloads: number; timestamp: number }> = [];
        
        weekKeys.forEach(key => {
          // Parser la clé YYYY-MM-DD (lundi de la semaine)
          const [year, month, day] = key.split('-').map(Number);
          const weekStart = new Date(year, month - 1, day);
          
          weeks.push({
            label: `Sem. ${weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`,
            count: periodData[key] || 0,
            views: periodViewsData[key] || 0,
            downloads: periodDownloadsData[key] || 0,
            timestamp: weekStart.getTime(),
          });
        });
        
        // Trier par timestamp
        activityByPeriod = weeks.sort((a, b) => a.timestamp - b.timestamp);
      } else if (maxUnit === 'day') {
        // Par jour : utiliser les clés générées dans le forEach
        const dates = periodEvents.map((event: any) => {
          const timestamp = event.timestamp;
          if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate() as Date;
          } else if (timestamp instanceof Date) {
            return timestamp;
          } else if (typeof timestamp === 'string') {
            return new Date(timestamp);
          }
          return null;
        }).filter((d): d is Date => d !== null).sort((a, b) => a.getTime() - b.getTime());
        
        if (dates.length > 0) {
          const firstDate = new Date(dates[0]);
          firstDate.setHours(0, 0, 0, 0);
          const lastDate = new Date(dates[dates.length - 1]);
          lastDate.setHours(23, 59, 59, 999);
          
          const days: Array<{ label: string; count: number; views: number; downloads: number; timestamp: number }> = [];
          let currentDay = new Date(firstDate);
          
          while (currentDay <= lastDate) {
            const dayKey = currentDay.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
            const count = periodData[dayKey] || 0;
            
            days.push({
              label: dayKey,
              count: count,
              views: periodViewsData[dayKey] || 0,
              downloads: periodDownloadsData[dayKey] || 0,
              timestamp: currentDay.getTime(),
            });
            
            currentDay.setDate(currentDay.getDate() + 1);
          }
          
          activityByPeriod = days;
        } else {
          activityByPeriod = [];
        }
      } else {
        // Par mois (par défaut) : utiliser les clés générées dans le forEach
        const allMonths = Object.entries(periodData)
          .map(([key, count]) => {
            // Vérifier si c'est un format de mois (ex: "janv. 2026")
            const parts = key.split(' ');
            if (parts.length === 2) {
              const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
              const monthIndex = monthNames.indexOf(parts[0]);
              const year = parseInt(parts[1]);
              if (monthIndex !== -1 && !isNaN(year)) {
                return {
                  label: key,
                  count: count,
                  views: periodViewsData[key] || 0,
                  downloads: periodDownloadsData[key] || 0,
                  timestamp: new Date(year, monthIndex, 1).getTime(),
                };
              }
            }
            return null;
          })
          .filter((item): item is { label: string; count: number; views: number; downloads: number; timestamp: number } => item !== null)
          .sort((a, b) => a.timestamp - b.timestamp);
        activityByPeriod = allMonths;
      }
      break;
  }

  // Convertir lastActivityDate en string ISO ou null
  const getLastActivityString = (date: Date | null): string | null => {
    if (date === null) return null;
    return date.toISOString();
  };

  const hotMoments = {
    activityByHour,
    activityByPeriod,
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

export function getEmptyStats(): AnalyticsStats {
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
      activityByPeriod: [],
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

