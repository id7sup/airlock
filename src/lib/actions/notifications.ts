"use server";

import { 
  getNotifications as getNotificationsService, 
  markAsRead as markAsReadService 
} from "@/services/notifications";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction(limit = 20) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  return await getNotificationsService(userId, limit);
}

export async function markAsReadAction(notificationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  
  await markAsReadService(notificationId);
  revalidatePath("/dashboard");
}

