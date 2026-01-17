import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getLinkAnalyticsStats, getEmptyStats } from "@/services/analytics-stats";

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
    const period = (searchParams.get("period") || "1J") as '1J' | '1S' | 'Max';

    try {
      const stats = await getLinkAnalyticsStats(
        linkId || null,
        userId,
        days,
        period
      );

      return NextResponse.json({ stats });
    } catch (statsError: any) {
      console.error("Erreur lors du calcul des stats:", statsError);
      // Retourner des stats vides plutôt qu'une erreur pour éviter de casser l'UI
      const emptyStats = getEmptyStats();
      return NextResponse.json({ stats: emptyStats });
    }
  } catch (error: any) {
    console.error("Erreur lors de la récupération des stats:", error);
    // Toujours retourner une réponse valide, même en cas d'erreur
    return NextResponse.json(
      { 
        error: "Erreur lors de la récupération des stats",
        stats: null 
      },
      { status: 500 }
    );
  }
}

