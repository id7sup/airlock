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
  const logs = analytics
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
          type = "VIEW";
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
        },
        createdAt: event.timestamp,
        isRead: false,
      };
    });
  
  return logs;
}

export async function markAsReadAction(notificationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  
  await markAsReadService(notificationId);
  revalidatePath("/dashboard");
}

