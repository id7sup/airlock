import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";
import { hashIP, generateVisitorId, categorizeReferer } from "@/lib/visitor";

export type EventType = 
  | "OPEN_SHARE" 
  | "OPEN_FOLDER" 
  | "VIEW_FILE" 
  | "DOWNLOAD_FILE" 
  | "ACCESS_DENIED";

interface GeolocationData {
  ip?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
}

interface TrackingData {
  linkId: string;
  eventType: EventType;
  geolocation?: GeolocationData;
  visitorId?: string;
  referer?: string;
  userAgent?: string;
  fileId?: string;
  folderId?: string;
}

export async function trackEvent(data: TrackingData) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const hourStr = now.getHours().toString().padStart(2, '0');
  const minuteStr = now.getMinutes().toString().padStart(2, '0');

  // Générer visitorId si pas fourni
  const ip = data.geolocation?.ip || "unknown";
  const visitorId = data.visitorId || generateVisitorId(ip, data.userAgent);
  const ipHash = hashIP(ip);
  
  // Catégoriser le referer
  const refererCategory = categorizeReferer(data.referer);

  // Récupérer le propriétaire du lien
  const linkDoc = await db.collection("shareLinks").doc(data.linkId).get();
  const ownerId = linkDoc.data()?.creatorId || null;

  // Construire l'objet de données en filtrant les valeurs undefined
  const analyticsData: any = {
    linkId: data.linkId,
    ownerId: ownerId,
    eventType: data.eventType,
    visitorId: visitorId,
    ipHash: ipHash,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    date: dateStr,
    hour: hourStr,
    minute: minuteStr,
  };

  // Ajouter les données de géolocalisation seulement si elles existent et ne sont pas undefined
  if (data.geolocation) {
    if (data.geolocation.ip !== undefined) analyticsData.ip = data.geolocation.ip;
    if (data.geolocation.country !== undefined) analyticsData.country = data.geolocation.country;
    if (data.geolocation.city !== undefined) analyticsData.city = data.geolocation.city;
    if (data.geolocation.region !== undefined) analyticsData.region = data.geolocation.region;
    if (data.geolocation.latitude !== undefined) analyticsData.latitude = data.geolocation.latitude;
    if (data.geolocation.longitude !== undefined) analyticsData.longitude = data.geolocation.longitude;
  }

  // Ajouter les autres champs seulement s'ils ne sont pas undefined
  if (data.referer !== undefined) analyticsData.referer = data.referer;
  if (refererCategory !== undefined) analyticsData.refererCategory = refererCategory;
  if (data.userAgent !== undefined) analyticsData.userAgent = data.userAgent;
  if (data.fileId !== undefined) analyticsData.fileId = data.fileId;
  if (data.folderId !== undefined) analyticsData.folderId = data.folderId;

  // Enregistrer l'événement complet
  await db.collection("shareAnalytics").add(analyticsData);

  // Mettre à jour les compteurs sur le lien (pour compatibilité)
  const linkRef = db.collection("shareLinks").doc(data.linkId);
  const updateData: any = { updatedAt: new Date() };
  
  if (data.eventType === "OPEN_SHARE") {
    updateData.viewCount = admin.firestore.FieldValue.increment(1);
  } else if (data.eventType === "DOWNLOAD_FILE") {
    updateData.downloadCount = admin.firestore.FieldValue.increment(1);
  }
  
  await linkRef.update(updateData);
}

// Fonction de compatibilité pour l'ancien système
export async function trackLinkActivity(
  linkId: string, 
  type: "VIEW" | "DOWNLOAD",
  geolocation?: GeolocationData,
  visitorId?: string,
  referer?: string,
  userAgent?: string,
  fileId?: string
) {
  const eventType: EventType = type === "VIEW" ? "OPEN_SHARE" : "DOWNLOAD_FILE";
  
  await trackEvent({
    linkId,
    eventType,
    geolocation,
    visitorId,
    referer,
    userAgent,
    fileId,
  });
}

export async function getLinkAnalytics(linkId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const snapshot = await db.collection("shareAnalytics")
      .where("linkId", "==", linkId)
      .where("timestamp", ">=", startDate)
      .orderBy("timestamp", "asc")
      .get();

    // Grouper par date pour le graphique
    const dataMap: Record<string, { date: string, views: number, downloads: number }> = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.date;
      if (!dataMap[date]) {
        dataMap[date] = { date, views: 0, downloads: 0 };
      }
      if (data.type === "VIEW") dataMap[date].views++;
      if (data.type === "DOWNLOAD") dataMap[date].downloads++;
    });

    return Object.values(dataMap);
  } catch (error) {
    console.error("Firestore Analytics Index not ready yet or failed:", error);
    return []; // Return empty data if index is building or query fails
  }
}

export async function getLinkAnalyticsWithGeolocation(linkId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const snapshot = await db.collection("shareAnalytics")
      .where("linkId", "==", linkId)
      .where("timestamp", ">=", startDate)
      .orderBy("timestamp", "desc")
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Mapper eventType vers type pour compatibilité
      const eventType = data.eventType || data.type;
      const type = eventType === "OPEN_SHARE" ? "VIEW" : 
                   eventType === "DOWNLOAD_FILE" ? "DOWNLOAD" : 
                   eventType;
      return {
        id: doc.id,
        linkId: linkId,
        type: type,
        eventType: eventType,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        country: data.country || null,
        city: data.city || null,
        region: data.region || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        ip: data.ip || null,
      };
    });
  } catch (error: any) {
    // Si l'index n'existe pas, essayer sans orderBy
    if (error?.code === 9 || error?.message?.includes("index")) {
      try {
        const snapshot = await db.collection("shareAnalytics")
          .where("linkId", "==", linkId)
          .where("timestamp", ">=", startDate)
          .get();

        const results = snapshot.docs.map(doc => {
          const data = doc.data();
          const eventType = data.eventType || data.type;
          const type = eventType === "OPEN_SHARE" ? "VIEW" : 
                       eventType === "DOWNLOAD_FILE" ? "DOWNLOAD" : 
                       eventType;
          return {
            id: doc.id,
            linkId: linkId,
            type: type,
            eventType: eventType,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            country: data.country || null,
            city: data.city || null,
            region: data.region || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            ip: data.ip || null,
          };
        });

        // Trier manuellement par timestamp
        return results.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      } catch (fallbackError) {
        console.error("Firestore Analytics Geolocation query failed (fallback):", fallbackError);
        return [];
      }
    }
    console.error("Firestore Analytics Geolocation query failed:", error);
    return [];
  }
}

export async function getAllLinksAnalyticsWithGeolocation(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // Récupérer tous les liens de l'utilisateur
    const linksSnapshot = await db.collection("shareLinks")
      .where("creatorId", "==", userId)
      .get();

    const linkIds = linksSnapshot.docs.map(doc => doc.id);

    if (linkIds.length === 0) {
      return [];
    }

    // Récupérer les analytics pour tous les liens
    // Utiliser Promise.allSettled pour gérer les erreurs individuelles
    const analyticsPromises = linkIds.map(linkId =>
      db.collection("shareAnalytics")
        .where("linkId", "==", linkId)
        .where("timestamp", ">=", startDate)
        .orderBy("timestamp", "desc")
        .get()
        .catch((error: any) => {
          // Si l'index n'existe pas, essayer sans orderBy
          if (error?.code === 9 || error?.message?.includes("index")) {
            return db.collection("shareAnalytics")
              .where("linkId", "==", linkId)
              .where("timestamp", ">=", startDate)
              .get();
          }
          throw error;
        })
    );

    const analyticsResults = await Promise.allSettled(analyticsPromises);

    const allAnalytics: any[] = [];
    analyticsResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const snapshot = result.value;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const eventType = data.eventType || data.type;
          const type = eventType === "OPEN_SHARE" ? "VIEW" : 
                       eventType === "DOWNLOAD_FILE" ? "DOWNLOAD" : 
                       eventType;
          allAnalytics.push({
            id: doc.id,
            linkId: linkIds[index],
            type: type,
            eventType: eventType,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            country: data.country || null,
            city: data.city || null,
            region: data.region || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            ip: data.ip || null,
          });
        });
      }
    });

    // Trier par timestamp (décroissant) - nécessaire si orderBy n'a pas fonctionné
    return allAnalytics.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Firestore Analytics Geolocation query failed:", error);
    return [];
  }
}
