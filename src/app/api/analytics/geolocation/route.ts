import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllLinksAnalyticsWithGeolocation } from "@/services/analytics";

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
      // Récupérer les analytics pour un seul lien
      const { getLinkAnalyticsWithGeolocation } = await import("@/services/analytics");
      analytics = await getLinkAnalyticsWithGeolocation(linkId, days);
    } else {
      // Récupérer les analytics pour tous les liens
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

