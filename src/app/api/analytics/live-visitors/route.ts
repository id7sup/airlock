import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getLiveVisitors } from "@/services/analytics";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get("linkId");
    const minutes = parseInt(searchParams.get("minutes") || "5");

    let analytics = await getLiveVisitors(userId, minutes);

    // Filtrer par lien si spécifié (en mémoire, car le résultat est petit)
    if (linkId && linkId !== "all") {
      analytics = analytics.filter(a => a.linkId === linkId);
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Erreur lors de la récupération des visiteurs en direct:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des visiteurs en direct" },
      { status: 500 }
    );
  }
}
