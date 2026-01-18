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
          // Raison du refus (pour ACCESS_DENIED)
          denialReason: event.denialReason || null,
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
  
  // Récupérer tous les liens de l'utilisateur (actifs ET révoqués pour avoir l'historique complet)
  // IMPORTANT: On inclut les liens révoqués car les logs doivent montrer toute l'activité du visiteur
  const linksSnapshot = await db.collection("shareLinks")
    .where("creatorId", "==", userId)
    .get();
  
  // Ne PAS filtrer les liens révoqués - on veut tous les logs historiques
  // Mais on exclut les liens dont le dossier associé est supprimé
  // Résoudre toutes les promesses de vérification des dossiers
  const filteredLinks = await Promise.all(
    linksSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      if (data.folderId) {
        try {
          const folderDoc = await db.collection("folders").doc(data.folderId).get();
          if (!folderDoc.exists || folderDoc.data()?.isDeleted === true) {
            return null; // Exclure si le dossier est supprimé
          }
        } catch (error) {
          console.error(`[VISITOR_LOGS] Erreur lors de la vérification du dossier ${data.folderId}:`, error);
          // En cas d'erreur, inclure le lien pour ne pas perdre de données
        }
      }
      return doc; // Inclure tous les autres liens (actifs et révoqués)
    })
  );
  
  // Filtrer les valeurs null avec un type guard explicite
  const allLinks = filteredLinks.filter((doc): doc is NonNullable<typeof doc> => doc !== null);
  
  const linkIds = allLinks.map(doc => doc.id);
  
  if (linkIds.length === 0) {
    return [];
  }
  
  // Récupérer tous les analytics pour ce visiteur sur tous les liens de l'utilisateur
  const allAnalytics: any[] = [];
  
  // Collecter tous les analytics de tous les liens
  const tempAnalytics: any[] = [];
  
  for (const linkId of linkIds) {
    try {
      const analytics = await getLinkAnalyticsWithGeolocation(linkId, 365); // 1 an de données
      tempAnalytics.push(...analytics);
    } catch (error) {
      console.error(`[VISITOR_LOGS] Erreur pour le lien ${linkId}:`, error);
    }
  }
  
  // Trouver le visitorIdStable correspondant au visitorId passé
  // Le visitorId passé peut être soit un visitorId rotatif, soit un visitorIdStable
  let targetVisitorIdStable: string | null = null;
  
  // D'abord, vérifier si le visitorId passé est déjà un visitorIdStable
  const directMatch = tempAnalytics.find(a => 
    a.visitorIdStable && String(a.visitorIdStable) === String(visitorId)
  );
  if (directMatch?.visitorIdStable) {
    targetVisitorIdStable = String(directMatch.visitorIdStable);
  } else {
    // Sinon, chercher si le visitorId passé est un visitorId rotatif
    // et trouver le visitorIdStable associé
    const matchingRotating = tempAnalytics.find(a => 
      a.visitorId && String(a.visitorId) === String(visitorId)
    );
    if (matchingRotating?.visitorIdStable) {
      targetVisitorIdStable = String(matchingRotating.visitorIdStable);
    }
  }
  
  // Filtrer les analytics : chercher par visitorIdStable si trouvé, sinon par visitorId
  const searchId = targetVisitorIdStable || visitorId;
  
  allAnalytics.push(...tempAnalytics.filter(a => {
    // Si on a un visitorIdStable cible, chercher par visitorIdStable
    if (targetVisitorIdStable) {
      return a.visitorIdStable && String(a.visitorIdStable) === String(targetVisitorIdStable);
    }
    // Sinon, chercher par visitorId (anciens logs sans visitorIdStable)
    return a.visitorId && String(a.visitorId) === String(visitorId);
  }));
  
  // Filtrer d'abord les LINK_PREVIEW (avant de limiter)
  const filteredAnalytics = allAnalytics.filter((event) => event.eventType !== "LINK_PREVIEW");
  
  // Trier par timestamp décroissant
  filteredAnalytics.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Limiter APRÈS le filtrage et le tri
  const limitedAnalytics = filteredAnalytics.slice(0, limit);
  
  // Convertir en format de logs
  const logs = limitedAnalytics
    .map((event) => {
      // Récupérer le nom du dossier depuis le lien
      const linkDoc = allLinks.find(doc => doc.id === event.linkId);
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
          denialReason: event.denialReason || null,
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

