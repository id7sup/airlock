import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";

export async function trackLinkActivity(linkId: string, type: "VIEW" | "DOWNLOAD") {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const hourStr = now.getHours().toString().padStart(2, '0');

  // 1. Incrémenter le compteur global sur le lien
  const linkRef = db.collection("shareLinks").doc(linkId);
  await linkRef.update({
    [`${type.toLowerCase()}Count`]: admin.firestore.FieldValue.increment(1),
    updatedAt: new Date()
  });

  // 2. Enregistrer l'événement pour les courbes (Time-series)
  await db.collection("shareAnalytics").add({
    linkId,
    type,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    date: dateStr,
    hour: hourStr,
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
