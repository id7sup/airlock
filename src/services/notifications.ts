import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";

export type NotificationType = "VIEW" | "DOWNLOAD" | "EXPIRATION" | "PASSWORD_ACCESS";

export async function createNotification(userId: string, type: NotificationType, metadata: any) {
  try {
    await db.collection("notifications").add({
      userId,
      type,
      metadata,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    const snapshot = await db.collection("notifications")
      .where("userId", "==", userId)
      .where("isRead", "==", false)
      .count()
      .get();
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting unread notifications count:", error);
    return 0;
  }
}

export async function getNotifications(userId: string, limit = 20) {
  try {
    const snapshot = await db.collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Notifications index not ready yet or query failed:", error);
    return [];
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await db.collection("notifications").doc(notificationId).update({
      isRead: true,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}
