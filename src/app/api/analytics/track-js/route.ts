import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/services/analytics";
import { getClientIP, getGeolocationFromIP, getCloudflareLocationHeaders } from "@/lib/geolocation";
import { generateVisitorId, generateStableVisitorId, calculateVisitorConfidence } from "@/lib/visitor";

export const dynamic = 'force-dynamic';

/**
 * Route pour tracker les événements avec JavaScript exécuté (HIT_CLIENT_JS)
 * 
 * Cette route est appelée par un beacon JS côté client pour confirmer
 * qu'un vrai navigateur a exécuté le JavaScript.
 * 
 * Cela permet de distinguer les bots (qui ne font pas tourner JS) des vrais utilisateurs.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { linkId, eventType, fileId, folderId, fileName, connectionType } = body;

    if (!linkId || !eventType) {
      return NextResponse.json(
        { error: "Paramètres invalides" },
        { status: 400 }
      );
    }

    // Capturer les données de la requête
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || undefined;
    const referer = req.headers.get("referer") || undefined;
    
    // Vérifier les headers "browser-like"
    const secFetchMode = req.headers.get("sec-fetch-mode");
    const secFetchSite = req.headers.get("sec-fetch-site");
    const acceptLanguage = req.headers.get("accept-language");
    const hasBrowserHeaders = !!(secFetchMode || secFetchSite || acceptLanguage);
    
    // Générer visitorId (avec sel rotatif pour privacy)
    const visitorId = generateVisitorId(clientIP, userAgent);
    
    // Générer visitorIdStable (avec sel fixe pour regrouper les logs sur plusieurs jours)
    const visitorIdStable = generateStableVisitorId(clientIP, userAgent);
    
    // Calculer le score de confiance
    const visitor_confidence = calculateVisitorConfidence({
      js_seen: true, // On est dans cette route = JS exécuté
      hasBrowserHeaders,
      userAgent,
      referer,
    });
    
    // Capturer la géolocalisation (avec gestion d'erreur)
    let geolocation;
    try {
      if (clientIP !== 'unknown') {
        // Utiliser les headers Cloudflare si disponibles
        const cfHeaders = getCloudflareLocationHeaders(req);
        geolocation = await getGeolocationFromIP(clientIP, cfHeaders);
        // Nettoyer les valeurs undefined
        if (geolocation) {
          geolocation = Object.fromEntries(
            Object.entries(geolocation).filter(([_, v]) => v !== undefined)
          ) as any;
        }
      }
    } catch (error) {
      console.error("Error getting geolocation:", error);
      // Continuer sans géolocalisation plutôt que de crasher
      geolocation = undefined;
    }

    // Tracker l'événement avec js_seen = true et visitor_confidence
    try {
      await trackEvent({
        linkId,
        eventType,
        geolocation,
        visitorId,
        visitorIdStable,
        clientIP,
        referer,
        userAgent,
        fileId,
        folderId,
        fileName,
        visitor_confidence,
        js_seen: true,
        connectionType,
      });
    } catch (error) {
      console.error("Error tracking event:", error);
      // Ne pas bloquer la requête si le tracking échoue
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors du tracking JS:", error);
    return NextResponse.json(
      { error: "Erreur lors du tracking" },
      { status: 500 }
    );
  }
}
