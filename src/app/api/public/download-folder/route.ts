import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { db } from "@/lib/firebase";
import { getAllFoldersAndFiles } from "@/services/folderTree";
import { createFolderZip } from "@/services/zip";
import { getClientIP, getGeolocationFromIP, isVPNOrDatacenter } from "@/lib/geolocation";
import { checkIfFolderIsChild } from "@/services/folders";
import { trackEvent } from "@/services/analytics";
import { generateVisitorId, generateStableVisitorId } from "@/lib/visitor";

/**
 * API route pour télécharger un dossier partagé en tant qu'archive ZIP.
 *
 * Endpoint: GET /api/public/download-folder?token=XXX&folderId=YYY
 *
 * Query params:
 * - token (required): Share link token
 * - folderId (optional): Si allowFolderAccess, télécharger un sous-dossier spécifique
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  let folderId = searchParams.get("folderId");

  if (!token) {
    return NextResponse.json(
      { error: "Token manquant" },
      { status: 400 }
    );
  }

  // 1. Valider le lien de partage
  const link: any = await validateShareLink(token);
  if (!link || link.error) {
    if (link?.linkId) {
      try {
        const clientIP = getClientIP(req);
        const userAgent = req.headers.get("user-agent") || undefined;
        const visitorId = generateVisitorId(clientIP, userAgent);
        const visitorIdStable = generateStableVisitorId(clientIP, userAgent);

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
    console.error("Share link validation failed for token:", token, link?.error);
    return NextResponse.json(
      { error: "Lien invalide, expiré ou quota atteint" },
      { status: 403 }
    );
  }

  // 2. Déterminer le dossier à télécharger
  let downloadFolderId = link.folderId;
  if (folderId && link.allowFolderAccess) {
    // Vérifier que le folderId demandé est bien un enfant du folderId du lien
    const isChild = await checkIfFolderIsChild(folderId, link.folderId);
    if (isChild) {
      downloadFolderId = folderId;
    } else {
      return NextResponse.json(
        { error: "Accès non autorisé à ce dossier" },
        { status: 403 }
      );
    }
  }

  // 3. Vérifier les permissions de téléchargement
  const downloadAllowed = link.allowDownload ?? link.downloadDefault ?? true;
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
      { error: "Le téléchargement est désactivé pour ce lien" },
      { status: 403 }
    );
  }

  // 4. Vérifier le blocage VPN/Datacenter si activé
  if (link.blockVpn === true) {
    try {
      const clientIP = getClientIP(req);
      if (clientIP !== "unknown") {
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

          return NextResponse.json(
            { error: "L'accès via VPN ou datacenter est bloqué" },
            { status: 403 }
          );
        }
      }
    } catch (error) {
      console.error("Error checking VPN/Datacenter:", error);
    }
  }

  try {
    // 5. Récupérer le dossier
    const folderDoc = await db.collection("folders").doc(downloadFolderId).get();
    if (!folderDoc.exists) {
      return NextResponse.json(
        { error: "Dossier non trouvé" },
        { status: 404 }
      );
    }

    const folderData = folderDoc.data()!;
    const workspaceId = folderData.workspaceId;
    const folderName = folderData.name;

    // 6. Récupérer tous les fichiers et dossiers
    const treeResult = await getAllFoldersAndFiles(downloadFolderId, workspaceId);

    if (!treeResult.success) {
      return NextResponse.json(
        { error: treeResult.error || "Erreur lors de la récupération des données" },
        { status: 400 }
      );
    }

    // 7. Créer l'archive ZIP
    const archive = await createFolderZip(
      treeResult.folders,
      treeResult.files,
      downloadFolderId,
      folderName
    );

    // 8. Tracker le téléchargement
    try {
      const clientIP = getClientIP(req);
      const userAgent = req.headers.get("user-agent") || undefined;
      const referer = req.headers.get("referer") || undefined;

      const visitorId = generateVisitorId(clientIP, userAgent);
      const visitorIdStable = generateStableVisitorId(clientIP, userAgent);

      let geolocation;
      try {
        if (clientIP !== "unknown") {
          geolocation = await getGeolocationFromIP(clientIP);
          if (geolocation) {
            geolocation = Object.fromEntries(
              Object.entries(geolocation).filter(([_, v]) => v !== undefined)
            ) as any;
          }
        }
      } catch (error) {
        console.error("Error getting geolocation:", error);
      }

      await trackEvent({
        linkId: link.id || link.linkId,
        eventType: "DOWNLOAD_FOLDER",
        geolocation,
        visitorId,
        visitorIdStable,
        clientIP,
        referer,
        userAgent,
        folderId: downloadFolderId,
      });
    } catch (error) {
      console.error("Error tracking download:", error);
      // Ne pas bloquer le téléchargement si le tracking échoue
    }

    // 9. Configurer la response
    const response = new NextResponse(archive as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(folderName)}.zip"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

    return response;
  } catch (error: any) {
    console.error("[API] Erreur lors du téléchargement du dossier partagé:", error?.message);
    return NextResponse.json(
      {
        error: "Erreur lors de la création du ZIP",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}
