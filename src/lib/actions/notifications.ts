"use server";

import { 
  getNotifications as getNotificationsService, 
  markAsRead as markAsReadService 
} from "@/services/notifications";
import { getLinkAnalyticsWithGeolocation } from "@/services/analytics";
import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction(limit = 20) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  return await getNotificationsService(userId, limit);
}

export async function getLinkLogsAction(linkId: string, folderName: string, limit = 200) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  
  // Récupérer les analytics du lien spécifique
  const analytics = await getLinkAnalyticsWithGeolocation(linkId, 365); // 1 an de données
  
  // Convertir les analytics en format de logs compatible avec LogsPageClient
  // Exclure LINK_PREVIEW car c'est juste pour les bots de prévisualisation, pas pour les vrais utilisateurs
  const logs = analytics
    .filter((event) => event.eventType !== "LINK_PREVIEW") // Exclure les prévisualisations de bots
    .slice(0, limit)
    .map((event) => {
      // Mapper les eventType vers NotificationType
      let type: "VIEW" | "DOWNLOAD" | "EXPIRATION" | "PASSWORD_ACCESS" | "PASSWORD_DENIED";
      
      switch (event.eventType) {
        case "OPEN_SHARE":
        case "VIEW_FILE":
        case "OPEN_FOLDER":
          type = "VIEW";
          break;
        case "DOWNLOAD_FILE":
          type = "DOWNLOAD";
          break;
        case "ACCESS_DENIED":
          type = "PASSWORD_DENIED";
          break;
        default:
          // Ne pas mapper les autres types vers VIEW pour éviter les doublons
          // Si un nouveau type apparaît, il sera ignoré plutôt que d'être compté comme VIEW
          return null;
      }
      
      return {
        id: event.id,
        type,
        metadata: {
          folderId: event.folderId,
          folderName: folderName,
          fileId: event.fileId,
          fileName: event.fileName,
          linkId: event.linkId,
          // Données de géolocalisation
          country: event.country,
          city: event.city,
          region: event.region,
          // Données réseau
          ip: event.ip,
          isp: event.isp,
          asn: event.asn,
          // Sécurité
          isVPN: event.isVPN,
          isDatacenter: event.isDatacenter,
          visitor_confidence: event.visitor_confidence,
          js_seen: event.js_seen,
          // User Agent
          userAgent: event.userAgent,
          // Visitor ID pour le filtrage
          visitorId: event.visitorId,
          // Event type original
          eventType: event.eventType,
        },
        createdAt: event.timestamp,
        isRead: false,
      };
    })
    .filter((log): log is NonNullable<typeof log> => log !== null); // Filtrer les null
  
  return logs;
}

/**
 * Récupère tous les logs d'un visiteur spécifique depuis shareAnalytics
 * 
 * @param visitorId - ID du visiteur
 * @param userId - ID de l'utilisateur (pour vérifier les permissions)
 * @param limit - Nombre maximum de logs à récupérer (défaut: 500)
 * @returns Logs formatés pour LogsPageClient
 */
export async function getVisitorLogsAction(visitorId: string, userId: string, limit = 500) {
  const { getLinkAnalyticsWithGeolocation } = await import("@/services/analytics");
  
  // Récupérer tous les liens de l'utilisateur
  const linksSnapshot = await db.collection("shareLinks")
    .where("creatorId", "==", userId)
    .where("isRevoked", "!=", true) // Seulement les liens actifs
    .get();
  
  const linkIds = linksSnapshot.docs.map(doc => doc.id);
  
  if (linkIds.length === 0) {
    return [];
  }
  
  // Récupérer tous les analytics pour ce visiteur sur tous les liens de l'utilisateur
  const allAnalytics: any[] = [];
  
  for (const linkId of linkIds) {
    try {
      const analytics = await getLinkAnalyticsWithGeolocation(linkId, 365); // 1 an de données
      // Filtrer par visitorId
      const visitorAnalytics = analytics.filter(a => a.visitorId === visitorId);
      allAnalytics.push(...visitorAnalytics);
    } catch (error) {
      console.error(`[VISITOR_LOGS] Erreur pour le lien ${linkId}:`, error);
    }
  }
  
  // Trier par timestamp décroissant
  allAnalytics.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Limiter et convertir en format de logs
  const logs = allAnalytics
    .slice(0, limit)
    .filter((event) => event.eventType !== "LINK_PREVIEW") // Exclure les prévisualisations de bots
    .map((event) => {
      // Récupérer le nom du dossier depuis le lien
      const linkDoc = linksSnapshot.docs.find(doc => doc.id === event.linkId);
      const folderName = linkDoc?.data()?.folderName || linkDoc?.data()?.folder?.name || "Partage";
      
      // Mapper les eventType vers NotificationType
      let type: "VIEW" | "DOWNLOAD" | "EXPIRATION" | "PASSWORD_ACCESS" | "PASSWORD_DENIED";
      
      switch (event.eventType) {
        case "OPEN_SHARE":
        case "VIEW_FILE":
        case "OPEN_FOLDER":
          type = "VIEW";
          break;
        case "DOWNLOAD_FILE":
          type = "DOWNLOAD";
          break;
        case "ACCESS_DENIED":
          type = "PASSWORD_DENIED";
          break;
        default:
          return null;
      }
      
      return {
        id: event.id,
        type,
        metadata: {
          folderId: event.folderId,
          folderName: folderName,
          fileId: event.fileId,
          fileName: event.fileName,
          linkId: event.linkId,
          country: event.country,
          city: event.city,
          region: event.region,
          ip: event.ip,
          isp: event.isp,
          asn: event.asn,
          isVPN: event.isVPN,
          isDatacenter: event.isDatacenter,
          visitor_confidence: event.visitor_confidence,
          js_seen: event.js_seen,
          userAgent: event.userAgent,
          visitorId: event.visitorId,
          eventType: event.eventType,
        },
        createdAt: event.timestamp,
        isRead: false,
      };
    })
    .filter((log): log is NonNullable<typeof log> => log !== null);
  
  return logs;
}

export async function markAsReadAction(notificationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  
  await markAsReadService(notificationId);
  revalidatePath("/dashboard");
}

