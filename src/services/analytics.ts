import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";
import { hashIP, generateVisitorId, generateStableVisitorId, categorizeReferer } from "@/lib/visitor";

/**
 * Service d'analytics pour le suivi des partages
 * 
 * Enregistre les événements (vues, téléchargements, etc.) avec géolocalisation
 * et métadonnées pour l'analyse des performances.
 */

/**
 * Types d'événements trackés
 */
export type EventType =
  | "LINK_PREVIEW"           // Prévisualisation par un bot (WhatsApp, iMessage, Slack, etc.)
  | "OPEN_SHARE"             // Ouverture d'un partage (après interaction utilisateur)
  | "OPEN_FOLDER"            // Ouverture d'un sous-dossier (après interaction utilisateur)
  | "VIEW_FILE"              // Prévisualisation d'un fichier (original)
  | "VIEW_FILE_WATERMARKED"  // Prévisualisation d'un fichier avec watermark (lecture seule)
  | "DOWNLOAD_FILE"          // Téléchargement d'un fichier
  | "DOWNLOAD_FOLDER"        // Téléchargement d'un dossier entier (ZIP)
  | "ACCESS_DENIED";         // Accès refusé

/**
 * Données de géolocalisation
 * 
 * IMPORTANT: L'IP n'est PAS stockée dans cette interface (sauf cas exceptionnels).
 * L'IP est utilisée uniquement pour le lookup de géolocalisation, puis jetée.
 */
interface GeolocationData {
  // IP n'est PAS stockée (sauf cas exceptionnels de rate-limiting/sécurité)
  country?: string;
  city?: string;
  region?: string;
  geonameId?: number; // GeoNames ID pour la ville (utilisé pour dériver les coordonnées)
  latitude?: number; // Coordonnées dérivées depuis geonameId (centre de la ville)
  longitude?: number; // Coordonnées dérivées depuis geonameId (centre de la ville)
  accuracy_radius_km?: number;
  isp?: string;
  asn?: string;
  isDatacenter?: boolean;
  isVPN?: boolean;
  location_quality?: "residential_or_mobile" | "hosting_or_datacenter" | "vpn_or_anonymous_proxy" | "unknown";
}

/**
 * Données complètes pour le tracking
 */
interface TrackingData {
  linkId: string;
  eventType: EventType;
  geolocation?: GeolocationData;
  visitorId?: string;
  visitorIdStable?: string; // VisitorId stable (sel fixe) pour regrouper les logs sur plusieurs jours
  clientIP?: string; // IP du client (utilisée uniquement pour générer visitorId, pas stockée)
  referer?: string;
  userAgent?: string;
  fileId?: string;
  folderId?: string;
  fileName?: string;
  // Nouvelles données de tracking
  invalidAttempt?: boolean; // Tentative invalide (mauvais mot de passe/token expiré)
  denialReason?: "EXPIRED" | "REVOKED" | "QUOTA_EXCEEDED" | "PASSWORD_INCORRECT" | "VPN_BLOCKED" | "ACCESS_DISABLED" | "NOT_FOUND" | "OTHER"; // Raison du refus d'accès
  ipChanged?: boolean; // Changement d'IP brutal dans la même session
  deviceChanged?: boolean; // Changement de device brutal dans la même session
  recipientCount?: number; // Nombre de destinataires (si partage par email)
  isReshare?: boolean; // Quelqu'un a re-partagé le lien
  previousIP?: string; // IP précédente pour détecter les changements
  previousDevice?: string; // Device précédent pour détecter les changements
  visitor_confidence?: number; // Score de confiance que c'est un humain (0-100)
  js_seen?: boolean; // JavaScript exécuté (beacon envoyé)
}

/**
 * Enregistre un événement d'analytics
 * 
 * Stocke l'événement dans Firestore avec toutes les métadonnées
 * et met à jour les compteurs sur le lien de partage.
 * 
 * @param data - Données de l'événement à tracker
 */
export async function trackEvent(data: TrackingData) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const hourStr = now.getHours().toString().padStart(2, '0');
  const minuteStr = now.getMinutes().toString().padStart(2, '0');

  // Récupérer l'IP du client (utilisée uniquement pour générer visitorId, pas stockée)
  const clientIP = data.clientIP || "unknown";
  
  // Générer visitorId si pas fourni (avec sel rotatif pour privacy)
  const visitorId = data.visitorId || generateVisitorId(clientIP, data.userAgent);
  
  // Générer visitorIdStable si pas fourni (avec sel fixe pour regrouper les logs)
  const visitorIdStable = data.visitorIdStable || generateStableVisitorId(clientIP, data.userAgent);
  
  const ipHash = hashIP(clientIP);
  
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
    visitorIdStable: visitorIdStable, // VisitorId stable pour regrouper les logs sur plusieurs jours
    ipHash: ipHash,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    date: dateStr,
    hour: hourStr,
    minute: minuteStr,
  };

  // Ajouter les données de géolocalisation seulement si elles existent et ne sont pas undefined
  // IMPORTANT: L'IP n'est PAS stockée (sauf cas exceptionnels de rate-limiting/sécurité)
  if (data.geolocation) {
    // Ne PAS stocker l'IP dans les analytics (privacy)
    // L'IP est utilisée uniquement pour le lookup de géolocalisation, puis jetée
    if (data.geolocation.country !== undefined) analyticsData.country = data.geolocation.country;
    if (data.geolocation.city !== undefined) analyticsData.city = data.geolocation.city;
    if (data.geolocation.region !== undefined) analyticsData.region = data.geolocation.region;
    if (data.geolocation.geonameId !== undefined) analyticsData.geonameId = data.geolocation.geonameId;
    if (data.geolocation.latitude !== undefined) analyticsData.latitude = data.geolocation.latitude;
    if (data.geolocation.longitude !== undefined) analyticsData.longitude = data.geolocation.longitude;
    if (data.geolocation.accuracy_radius_km !== undefined) analyticsData.accuracy_radius_km = data.geolocation.accuracy_radius_km;
    if (data.geolocation.isp !== undefined) analyticsData.isp = data.geolocation.isp;
    if (data.geolocation.asn !== undefined) analyticsData.asn = data.geolocation.asn;
    if (data.geolocation.isDatacenter !== undefined) analyticsData.isDatacenter = data.geolocation.isDatacenter;
    if (data.geolocation.isVPN !== undefined) analyticsData.isVPN = data.geolocation.isVPN;
    if (data.geolocation.location_quality !== undefined) analyticsData.location_quality = data.geolocation.location_quality;
  }

  // Ajouter les autres champs seulement s'ils ne sont pas undefined
  if (data.referer !== undefined) analyticsData.referer = data.referer;
  if (refererCategory !== undefined) analyticsData.refererCategory = refererCategory;
  if (data.userAgent !== undefined) analyticsData.userAgent = data.userAgent;
  if (data.fileId !== undefined) analyticsData.fileId = data.fileId;
  if (data.folderId !== undefined) analyticsData.folderId = data.folderId;
  if (data.fileName !== undefined) analyticsData.fileName = data.fileName;
  
  // Nouvelles données de tracking
  if (data.invalidAttempt !== undefined) analyticsData.invalidAttempt = data.invalidAttempt;
  if (data.denialReason !== undefined) analyticsData.denialReason = data.denialReason;
  if (data.ipChanged !== undefined) analyticsData.ipChanged = data.ipChanged;
  if (data.deviceChanged !== undefined) analyticsData.deviceChanged = data.deviceChanged;
  if (data.recipientCount !== undefined) analyticsData.recipientCount = data.recipientCount;
  if (data.isReshare !== undefined) analyticsData.isReshare = data.isReshare;
  if (data.previousIP !== undefined) analyticsData.previousIP = data.previousIP;
  if (data.previousDevice !== undefined) analyticsData.previousDevice = data.previousDevice;
  if (data.visitor_confidence !== undefined) analyticsData.visitor_confidence = data.visitor_confidence;
  if (data.js_seen !== undefined) analyticsData.js_seen = data.js_seen;

  // Enregistrer l'événement complet
  await db.collection("shareAnalytics").add(analyticsData);

  // Mettre à jour les compteurs sur le lien spécifique (indépendant des autres liens)
  // Chaque lien a ses propres compteurs, même s'ils pointent vers le même dossier
  const linkRef = db.collection("shareLinks").doc(data.linkId);
  const updateData: any = { updatedAt: new Date() };
  
  if (data.eventType === "OPEN_SHARE") {
    updateData.viewCount = admin.firestore.FieldValue.increment(1);
  } else if (data.eventType === "DOWNLOAD_FILE") {
    updateData.downloadCount = admin.firestore.FieldValue.increment(1);
  }
  
  // Mise à jour atomique sur ce lien spécifique uniquement
  await linkRef.update(updateData);
}

/**
 * Fonction de compatibilité pour tracker une activité de lien
 * 
 * @deprecated Utiliser trackEvent() à la place
 * 
 * @param linkId - ID du lien de partage
 * @param type - Type d'activité (VIEW ou DOWNLOAD)
 * @param geolocation - Données de géolocalisation (optionnel)
 * @param visitorId - ID du visiteur (optionnel)
 * @param referer - Referer HTTP (optionnel)
 * @param userAgent - User agent (optionnel)
 * @param fileId - ID du fichier (optionnel)
 */
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
      // Mapper eventType vers type pour compatibilité
      const eventType = data.eventType || data.type;
      if (eventType === "OPEN_SHARE" || eventType === "VIEW") {
        dataMap[date].views++;
      } else if (eventType === "DOWNLOAD_FILE" || eventType === "DOWNLOAD") {
        dataMap[date].downloads++;
      }
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
          accuracy_radius_km: data.accuracy_radius_km || null,
          ip: data.ip || null,
          visitorId: data.visitorId || null,
          visitorIdStable: data.visitorIdStable || null,
          userAgent: data.userAgent || null,
          isp: data.isp || null,
          asn: data.asn || null,
          isDatacenter: data.isDatacenter || false,
          isVPN: data.isVPN || false,
          location_quality: data.location_quality || null,
          invalidAttempt: data.invalidAttempt || false,
          denialReason: data.denialReason || null,
          ipChanged: data.ipChanged || false,
          deviceChanged: data.deviceChanged || false,
          recipientCount: data.recipientCount || 0,
          isReshare: data.isReshare || false,
          fileId: data.fileId || null,
          fileName: data.fileName || null,
          folderId: data.folderId || null,
          visitor_confidence: data.visitor_confidence || null,
          js_seen: data.js_seen || false,
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
            accuracy_radius_km: data.accuracy_radius_km || null,
            ip: data.ip || null,
            visitorId: data.visitorId || null,
            visitorIdStable: data.visitorIdStable || null,
            userAgent: data.userAgent || null,
            isp: data.isp || null,
            asn: data.asn || null,
            isDatacenter: data.isDatacenter || false,
            isVPN: data.isVPN || false,
            location_quality: data.location_quality || null,
          invalidAttempt: data.invalidAttempt || false,
          denialReason: data.denialReason || null,
          ipChanged: data.ipChanged || false,
          deviceChanged: data.deviceChanged || false,
          recipientCount: data.recipientCount || 0,
          isReshare: data.isReshare || false,
          fileId: data.fileId || null,
          fileName: data.fileName || null,
          folderId: data.folderId || null,
          visitor_confidence: data.visitor_confidence || null,
          js_seen: data.js_seen || false,
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
    // Récupérer tous les liens de l'utilisateur (y compris les révoqués)
    const linksSnapshot = await db.collection("shareLinks")
      .where("creatorId", "==", userId)
      .get();

    // Vérifier que les dossiers associés ne sont pas supprimés (mais on garde les révoqués)
    const folderIds = linksSnapshot.docs.map(doc => doc.data().folderId).filter(Boolean);
    const folderDocs = folderIds.length > 0 
      ? await Promise.all(folderIds.map(id => db.collection("folders").doc(id).get()))
      : [];
    
    const deletedFolderIds = new Set(
      folderDocs
        .filter(doc => doc.exists && doc.data()?.isDeleted === true)
        .map(doc => doc.id)
    );

    // Filtrer uniquement les liens dont les dossiers sont supprimés (garder les révoqués)
    const activeLinkIds = linksSnapshot.docs
      .filter(doc => {
        const folderId = doc.data().folderId;
        return !deletedFolderIds.has(folderId);
      })
      .map(doc => doc.id);

    const linkIds = activeLinkIds;

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
        const currentLinkId = linkIds[index]; // Le linkId correspondant à cette requête
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const eventType = data.eventType || data.type;
          const type = eventType === "OPEN_SHARE" ? "VIEW" : 
                       eventType === "DOWNLOAD_FILE" ? "DOWNLOAD" : 
                       eventType;
          // Utiliser le linkId du document s'il existe, sinon utiliser celui de la requête
          const docLinkId = data.linkId || currentLinkId;
          allAnalytics.push({
            id: doc.id,
            linkId: docLinkId, // Utiliser le linkId du document pour garantir la cohérence
            type: type,
            eventType: eventType,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            country: data.country || null,
            city: data.city || null,
            region: data.region || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            accuracy_radius_km: data.accuracy_radius_km || null,
            ip: data.ip || null,
            visitorId: data.visitorId || null,
            visitorIdStable: data.visitorIdStable || null,
            userAgent: data.userAgent || null,
            isp: data.isp || null,
            asn: data.asn || null,
            isDatacenter: data.isDatacenter || false,
            isVPN: data.isVPN || false,
            location_quality: data.location_quality || null,
            invalidAttempt: data.invalidAttempt || false,
            ipChanged: data.ipChanged || false,
            deviceChanged: data.deviceChanged || false,
            recipientCount: data.recipientCount || 0,
            isReshare: data.isReshare || false,
            fileId: data.fileId || null,
            fileName: data.fileName || null,
            folderId: data.folderId || null,
            visitor_confidence: data.visitor_confidence || null,
            js_seen: data.js_seen || false,
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

/**
 * Récupère les visiteurs en direct (dernières N minutes) pour tous les liens d'un utilisateur.
 * Utilise une seule requête Firestore sur ownerId + eventType + timestamp.
 *
 * Index composite requis sur shareAnalytics :
 *   ownerId ASC, eventType ASC, timestamp DESC
 */
export async function getLiveVisitors(userId: string, minutes: number = 5) {
  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - minutes);

  const mapDoc = (doc: admin.firestore.QueryDocumentSnapshot) => {
    const data = doc.data();
    const eventType = data.eventType || data.type;
    const type = eventType === "OPEN_SHARE" ? "VIEW" :
                 eventType === "DOWNLOAD_FILE" ? "DOWNLOAD" :
                 eventType;
    return {
      id: doc.id,
      linkId: data.linkId || null,
      type,
      eventType: eventType || "OPEN_SHARE",
      timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
      country: data.country || null,
      city: data.city || null,
      region: data.region || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      accuracy_radius_km: data.accuracy_radius_km || null,
      ip: data.ip || null,
      visitorId: data.visitorId || null,
      visitorIdStable: data.visitorIdStable || null,
      userAgent: data.userAgent || null,
      isp: data.isp || null,
      asn: data.asn || null,
      isDatacenter: data.isDatacenter || false,
      isVPN: data.isVPN || false,
      location_quality: data.location_quality || null,
      invalidAttempt: data.invalidAttempt || false,
      denialReason: data.denialReason || null,
      ipChanged: data.ipChanged || false,
      deviceChanged: data.deviceChanged || false,
      recipientCount: data.recipientCount || 0,
      isReshare: data.isReshare || false,
      fileId: data.fileId || null,
      fileName: data.fileName || null,
      folderId: data.folderId || null,
      visitor_confidence: data.visitor_confidence || null,
      js_seen: data.js_seen || false,
    };
  };

  try {
    const snapshot = await db.collection("shareAnalytics")
      .where("ownerId", "==", userId)
      .where("eventType", "==", "OPEN_SHARE")
      .where("timestamp", ">=", cutoff)
      .orderBy("timestamp", "desc")
      .limit(200)
      .get();

    return snapshot.docs.map(mapDoc);
  } catch (error: any) {
    // Si l'index composite n'existe pas encore, fallback avec requête plus simple
    // (ownerId + timestamp seulement, filtrage eventType en mémoire)
    if (error?.code === 9 || error?.message?.includes("index")) {
      console.error(
        "[LIVE VISITORS] Index composite requis. Créez-le via la console Firebase.",
        "Index: shareAnalytics -> ownerId ASC, eventType ASC, timestamp DESC",
        error?.message
      );
      try {
        const snapshot = await db.collection("shareAnalytics")
          .where("ownerId", "==", userId)
          .where("timestamp", ">=", cutoff)
          .limit(500)
          .get();

        return snapshot.docs
          .map(mapDoc)
          .filter(d => d.eventType === "OPEN_SHARE")
          .sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 200);
      } catch (fallbackError) {
        console.error("[LIVE VISITORS] Fallback query failed:", fallbackError);
        return [];
      }
    }
    console.error("[LIVE VISITORS] Query failed:", error);
    return [];
  }
}
