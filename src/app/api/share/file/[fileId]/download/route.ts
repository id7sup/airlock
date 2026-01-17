import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { getDownloadUrl } from "@/services/storage";
import { db } from "@/lib/firebase";
import { checkIfFolderIsChild } from "@/services/folders";
import { trackEvent } from "@/services/analytics";
import { getClientIP, getGeolocationFromIP } from "@/lib/geolocation";
import { generateVisitorId } from "@/lib/visitor";

/**
 * Endpoint pour télécharger le fichier original
 * POST /api/share/file/[fileId]/download
 * 
 * Body: { token: string }
 * 
 * Retourne une URL présignée vers l'original SEULEMENT si downloadAllowed=true
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  
  try {
    const body = await req.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    // 1. Valider le lien de partage
    const linkResult: any = await validateShareLink(token);
    if (linkResult.error) {
      if (linkResult.linkId) {
        try {
          // Déterminer la raison du refus depuis linkResult.error
          let denialReason: "EXPIRED" | "REVOKED" | "QUOTA_EXCEEDED" | "OTHER" = "OTHER";
          if (linkResult.error === "EXPIRED") denialReason = "EXPIRED";
          else if (linkResult.error === "REVOKED") denialReason = "REVOKED";
          else if (linkResult.error === "QUOTA_EXCEEDED") denialReason = "QUOTA_EXCEEDED";
          
          await trackEvent({
            linkId: linkResult.linkId,
            eventType: "ACCESS_DENIED",
            invalidAttempt: true,
            denialReason,
          });
        } catch (e) {
          // ignore
        }
      }
      return NextResponse.json(
        { error: "Lien invalide, expiré ou quota atteint" },
        { status: 403 }
      );
    }

    const link = linkResult;

    // 2. Vérifier que le fichier appartient au dossier partagé (récursif pour les sous-dossiers)
    const fileDoc = await db.collection("files").doc(fileId).get();
    if (!fileDoc.exists) {
      return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
    }

    const file = fileDoc.data()!;
    const fileFolderId = file.folderId;
    if (!fileFolderId) {
      return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
    }

    // Vérifier si le dossier du fichier est le dossier partagé ou un de ses sous-dossiers
    const isInSharedFolder = fileFolderId === link.folderId || await checkIfFolderIsChild(fileFolderId, link.folderId);
    if (!isInSharedFolder) {
      return NextResponse.json({ error: "Fichier non autorisé" }, { status: 403 });
    }

    // 3. Vérifier le blocage VPN/Datacenter si activé
    if (link.blockVpn === true) {
      try {
        const clientIP = getClientIP(req);
        if (clientIP !== 'unknown') {
          const geolocation = await getGeolocationFromIP(clientIP);
          if (geolocation && (geolocation.isVPN === true || geolocation.isDatacenter === true)) {
            // Tracker l'accès refusé
            try {
              const userAgent = req.headers.get("user-agent") || undefined;
              const referer = req.headers.get("referer") || undefined;
              const visitorId = generateVisitorId(clientIP, userAgent);
              
              await trackEvent({
                linkId: link.id || link.linkId,
                eventType: "ACCESS_DENIED",
                geolocation,
                visitorId,
                referer,
                userAgent,
              });
            } catch (e) {
              console.error("Error tracking ACCESS_DENIED:", e);
            }
            
            return NextResponse.json({ error: "L'accès via VPN ou datacenter est bloqué" }, { status: 403 });
          }
        }
      } catch (error) {
        console.error("Error checking VPN/Datacenter:", error);
        // En cas d'erreur, on autorise l'accès pour ne pas bloquer les utilisateurs légitimes
      }
    }

    // 4. Utiliser downloadDefault du lien (pas de règles par fichier)
    const downloadAllowed = link.allowDownload ?? link.downloadDefault ?? true;

    // 5. Vérifier si le téléchargement est autorisé
    if (!downloadAllowed) {
      try {
        await trackEvent({
          linkId: link.id || link.linkId,
          eventType: "ACCESS_DENIED",
          invalidAttempt: true,
          denialReason: "ACCESS_DISABLED",
        });
      } catch (e) {
        // ignore
      }
      return NextResponse.json(
        { error: "Le téléchargement est désactivé pour ce lien (Consultation seule)" },
        { status: 403 }
      );
    }

    // 6. Tracker le téléchargement côté serveur (important pour mobile)
    try {
      const clientIP = getClientIP(req);
      const userAgent = req.headers.get("user-agent") || undefined;
      const referer = req.headers.get("referer") || undefined;
      
      // Générer visitorId
      const visitorId = generateVisitorId(clientIP, userAgent);
      
      // Capturer la géolocalisation précise
      let geolocation;
      try {
        if (clientIP !== 'unknown') {
          geolocation = await getGeolocationFromIP(clientIP);
          if (geolocation) {
            geolocation = Object.fromEntries(
              Object.entries(geolocation).filter(([_, v]) => v !== undefined)
            ) as any;
          }
        }
      } catch (error) {
        console.error("Error getting geolocation for download:", error);
      }

      await trackEvent({
        linkId: link.id || link.linkId,
        eventType: "DOWNLOAD_FILE",
        geolocation,
        visitorId,
        referer,
        userAgent,
        fileId: fileId,
        fileName: file.name,
      });
    } catch (error) {
      console.error("Error tracking download:", error);
      // Ne pas bloquer le téléchargement si le tracking échoue
    }

    // 7. Générer une URL présignée vers l'original
    const downloadUrl = await getDownloadUrl(file.s3Key, file.name);

    return NextResponse.json({
      downloadUrl,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("Erreur download:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

