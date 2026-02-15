import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { getDownloadUrl } from "@/services/storage";
import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";
import { createNotification } from "@/services/notifications";
import { getClientIP, getGeolocationFromIP, isVPNOrDatacenter } from "@/lib/geolocation";
import { checkIfFolderIsChild } from "@/services/folders";
import { trackEvent } from "@/services/analytics";
import { generateVisitorId, generateStableVisitorId } from "@/lib/visitor";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");
  const token = searchParams.get("token");

  if (!fileId || !token) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // 1. Valider le lien
  const link: any = await validateShareLink(token);
  if (!link || link.error) {
    if (link?.linkId) {
      try {
        const clientIP = getClientIP(req);
        const userAgent = req.headers.get("user-agent") || undefined;
        const visitorId = generateVisitorId(clientIP, userAgent);
        const visitorIdStable = generateStableVisitorId(clientIP, userAgent);
        // Déterminer la raison du refus depuis link.error
        let denialReason: "EXPIRED" | "REVOKED" | "QUOTA_EXCEEDED" | "OTHER" = "OTHER";
        if (link.error === "EXPIRED") denialReason = "EXPIRED";
        else if (link.error === "REVOKED") denialReason = "REVOKED";
        else if (link.error === "QUOTA_EXCEEDED") denialReason = "QUOTA_EXCEEDED";
        
        await trackEvent({
          linkId: link.linkId,
          eventType: "ACCESS_DENIED",
          invalidAttempt: true,
          denialReason,
          visitorId,
          visitorIdStable,
          clientIP,
          userAgent,
        });
      } catch (e) {
        // ignorer erreur de tracking
      }
    }
    console.error("Download validation failed for token:", token, link?.error);
    return NextResponse.json({ error: "Lien invalide, expiré ou quota atteint" }, { status: 403 });
  }

  // 2. Vérifier que le fichier appartient au dossier (récursif pour les sous-dossiers)
  const fileDoc = await db.collection("files").doc(fileId).get();
  if (!fileDoc.exists) {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
  }

  const fileFolderId = fileDoc.data()?.folderId;
  if (!fileFolderId) {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
  }

  // Vérifier si le dossier du fichier est le dossier partagé ou un de ses sous-dossiers
  const isInSharedFolder = fileFolderId === link.folderId || await checkIfFolderIsChild(fileFolderId, link.folderId);
  if (!isInSharedFolder) {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
  }

  const file = fileDoc.data()!;

  // 2.5. Vérifier le blocage VPN/Datacenter si activé
  if (link.blockVpn === true) {
    try {
      const clientIP = getClientIP(req);
      if (clientIP !== 'unknown') {
        const { isBlocked, geolocation } = await isVPNOrDatacenter(clientIP);
        if (isBlocked) {
          try {
            const userAgent = req.headers.get("user-agent") || undefined;
            const referer = req.headers.get("referer") || undefined;
            const visitorId = generateVisitorId(clientIP, userAgent);
            const visitorIdStable = generateStableVisitorId(clientIP, userAgent);

            await trackEvent({
              linkId: link.id || link.linkId,
              eventType: "ACCESS_DENIED",
              invalidAttempt: true,
              denialReason: "VPN_BLOCKED",
              geolocation,
              visitorId,
              visitorIdStable,
              clientIP,
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
    }
  }

  // 3. Vérifier si le téléchargement est autorisé
  // D'abord vérifier le paramètre global, puis les exceptions par fichier
  const globalDownloadAllowed = link.allowDownload ?? link.downloadDefault ?? true;
  const fileExceptions = link.fileDownloadExceptions || [];
  const isFileException = fileExceptions.includes(fileId);
  
  // Téléchargement autorisé si :
  // - Le téléchargement global est activé, OU
  // - Le fichier est dans la liste des exceptions (téléchargement autorisé même si global désactivé)
  const downloadAllowed = globalDownloadAllowed || isFileException;

  // 4. Vérifier si le téléchargement est autorisé
  if (!downloadAllowed) {
    try {
      const clientIP = getClientIP(req);
      const userAgent = req.headers.get("user-agent") || undefined;
      const visitorId = generateVisitorId(clientIP, userAgent);
      const visitorIdStable = generateStableVisitorId(clientIP, userAgent);
      await trackEvent({
        linkId: link.id || link.linkId,
        eventType: "ACCESS_DENIED",
        invalidAttempt: true,
        denialReason: "ACCESS_DISABLED",
        visitorId,
        visitorIdStable,
        clientIP,
        userAgent,
      });
    } catch (e) {
      // ignorer
    }
    return NextResponse.json(
      { error: "Le téléchargement est désactivé pour ce lien (Consultation seule)" },
      { status: 403 }
    );
  }

  // 6. Récupérer le propriétaire pour la notification
  const ownerPerm = await db.collection("permissions")
    .where("folderId", "==", link.folderId)
    .where("role", "==", "OWNER")
    .limit(1)
    .get();
  
  const ownerId = !ownerPerm.empty ? ownerPerm.docs[0].data().userId : null;

  if (ownerId) {
    await createNotification(ownerId, "DOWNLOAD", {
      fileName: file.name,
      folderName: link.folder.name,
      fileId: fileId
    });
  }

  // 7. Tracker le téléchargement côté serveur (important pour mobile)
  try {
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || undefined;
    const referer = req.headers.get("referer") || undefined;
    
    // Générer visitorId (avec sel rotatif pour privacy)
    const visitorId = generateVisitorId(clientIP, userAgent);
    
    // Générer visitorIdStable (avec sel fixe pour regrouper les logs sur plusieurs jours)
    const visitorIdStable = generateStableVisitorId(clientIP, userAgent);
    
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
      visitorIdStable,
      clientIP,
      referer,
      userAgent,
      fileId: fileId,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Error tracking download:", error);
    // Ne pas bloquer le téléchargement si le tracking échoue
  }

  // 8. Servir l'original (pas de watermark pour les téléchargements autorisés)
  const downloadUrl = await getDownloadUrl(file.s3Key, file.name);
  return NextResponse.redirect(downloadUrl);
}
