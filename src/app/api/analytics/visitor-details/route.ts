import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/firebase";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get("visitorId");

    if (!visitorId) {
      return NextResponse.json({ error: "visitorId requis" }, { status: 400 });
    }

    // Chercher tous les événements de ce visiteur (par visitorId ou visitorIdStable)
    // Limiter à 500 pour éviter les scans massifs
    const [byVisitorId, byStableId] = await Promise.all([
      db.collection("shareAnalytics")
        .where("ownerId", "==", userId)
        .where("visitorId", "==", visitorId)
        .orderBy("timestamp", "desc")
        .limit(500)
        .get()
        .catch(() => ({ docs: [] as any[] })),
      db.collection("shareAnalytics")
        .where("ownerId", "==", userId)
        .where("visitorIdStable", "==", visitorId)
        .orderBy("timestamp", "desc")
        .limit(500)
        .get()
        .catch(() => ({ docs: [] as any[] })),
    ]);

    // Combiner et dédoublonner par doc ID
    const allDocs = new Map<string, any>();
    [...byVisitorId.docs, ...byStableId.docs].forEach(doc => {
      if (!allDocs.has(doc.id)) {
        allDocs.set(doc.id, doc.data());
      }
    });

    const events = Array.from(allDocs.values());

    // Compter les sessions (jours uniques)
    const uniqueDays = new Set(events.map(e => e.date).filter(Boolean));
    const sessionCount = uniqueDays.size || 1;

    // Compter les événements par type
    const eventCount = events.length;
    const eventBreakdown: Record<string, number> = {};
    events.forEach(e => {
      const type = e.eventType || e.type || "unknown";
      eventBreakdown[type] = (eventBreakdown[type] || 0) + 1;
    });

    // Dossiers consultés/téléchargés avec ranking
    const folderStats = new Map<string, { folderId: string; views: number; downloads: number }>();
    events.forEach(e => {
      if (!e.folderId) return;
      const existing = folderStats.get(e.folderId) || { folderId: e.folderId, views: 0, downloads: 0 };
      if (e.eventType === "VIEW_FILE" || e.eventType === "VIEW_FILE_WATERMARKED" || e.eventType === "OPEN_FOLDER") {
        existing.views++;
      } else if (e.eventType === "DOWNLOAD_FILE" || e.eventType === "DOWNLOAD_FOLDER") {
        existing.downloads++;
      } else if (e.eventType === "OPEN_SHARE" || e.eventType === "LINK_PREVIEW") {
        existing.views++;
      }
      folderStats.set(e.folderId, existing);
    });

    // Enrichir avec les noms de dossiers
    const folderIds = Array.from(folderStats.keys());
    const folderNames = new Map<string, string>();
    if (folderIds.length > 0) {
      const folderDocs = await Promise.all(
        folderIds.slice(0, 30).map(id => db.collection("folders").doc(id).get())
      );
      folderDocs.forEach(doc => {
        if (doc.exists) {
          folderNames.set(doc.id, doc.data()?.name || "Dossier inconnu");
        }
      });
    }

    const folders = Array.from(folderStats.values())
      .map(f => ({
        ...f,
        folderName: folderNames.get(f.folderId) || "Dossier inconnu",
        total: f.views + f.downloads,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      sessionCount,
      eventCount,
      eventBreakdown,
      folders,
    });
  } catch (error) {
    console.error("Erreur visitor-details:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
