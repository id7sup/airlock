import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getLinkAnalyticsStats } from "@/services/analytics-stats";

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

    const stats = await getLinkAnalyticsStats(
      linkId || null,
      userId,
      days,
      period
    );

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des stats" },
      { status: 500 }
    );
  }
}

