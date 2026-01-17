import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllLinksAnalyticsWithGeolocation } from "@/services/analytics";
import { db } from "@/lib/firebase";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");
    const linkId = searchParams.get("linkId");

    let analytics;
    if (linkId && linkId !== "all") {
      // Vérifier que le lien existe (on garde les liens révoqués)
      const linkDoc = await db.collection("shareLinks").doc(linkId).get();
      if (!linkDoc.exists) {
        // Lien supprimé, retourner un tableau vide
        return NextResponse.json({ analytics: [] });
      }
      
      // Vérifier que le dossier associé n'est pas supprimé (mais on garde les révoqués)
      const linkData = linkDoc.data();
      if (linkData?.folderId) {
        const folderDoc = await db.collection("folders").doc(linkData.folderId).get();
        if (!folderDoc.exists || folderDoc.data()?.isDeleted === true) {
          // Dossier supprimé, retourner un tableau vide
          return NextResponse.json({ analytics: [] });
        }
      }
      
      // Récupérer les analytics pour un seul lien (même s'il est révoqué)
      const { getLinkAnalyticsWithGeolocation } = await import("@/services/analytics");
      analytics = await getLinkAnalyticsWithGeolocation(linkId, days);
    } else {
      // Récupérer les analytics pour tous les liens (y compris révoqués, sauf dossiers supprimés)
      analytics = await getAllLinksAnalyticsWithGeolocation(userId, days);
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Erreur lors de la récupération des analytics:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des analytics" },
      { status: 500 }
    );
  }
}

