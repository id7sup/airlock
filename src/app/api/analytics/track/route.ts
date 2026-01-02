import { NextRequest, NextResponse } from "next/server";
import { trackLinkActivity } from "@/services/analytics";
import { getClientIP, getGeolocationFromIP } from "@/lib/geolocation";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { linkId, type } = body;

    if (!linkId || !type || (type !== "VIEW" && type !== "DOWNLOAD")) {
      return NextResponse.json(
        { error: "Paramètres invalides" },
        { status: 400 }
      );
    }

    // Capturer la géolocalisation
    const clientIP = getClientIP(req);
    const geolocation = clientIP !== 'unknown' ? await getGeolocationFromIP(clientIP) : undefined;

    // Tracker l'activité
    await trackLinkActivity(linkId, type, geolocation);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors du tracking:", error);
    return NextResponse.json(
      { error: "Erreur lors du tracking" },
      { status: 500 }
    );
  }
}

