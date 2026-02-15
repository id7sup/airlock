import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { db } from "@/lib/firebase";
import { checkIfFolderIsChild } from "@/services/folders";
import { getClientIP, getGeolocationFromIP, isVPNOrDatacenter } from "@/lib/geolocation";
import { trackEvent } from "@/services/analytics";

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
    return NextResponse.json({ error: "Lien invalide, expiré ou quota atteint" }, { status: 403 });
  }

  // 2. Vérifier le blocage VPN/Datacenter si activé
  if (link.blockVpn === true) {
    try {
      const clientIP = getClientIP(req);
      if (clientIP !== 'unknown') {
        const { isBlocked, geolocation } = await isVPNOrDatacenter(clientIP);
        if (isBlocked) {
          try {
            const userAgent = req.headers.get("user-agent") || undefined;
            const referer = req.headers.get("referer") || undefined;
            const { generateVisitorId } = await import("@/lib/visitor");
            const visitorId = generateVisitorId(clientIP, userAgent);

            await trackEvent({
              linkId: link.id || link.linkId,
              eventType: "ACCESS_DENIED",
              invalidAttempt: true,
              denialReason: "VPN_BLOCKED",
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
    }
  }

  // 3. Vérifier que le fichier appartient au dossier (récursif pour les sous-dossiers)
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

  // 4. Utiliser downloadDefault du lien (pas de règles par fichier)
  const downloadAllowed = link.downloadDefault ?? (link.allowDownload ?? true);

  // Determine viewer type and support status based on MIME type
  const mimeType = file.mimeType || "application/octet-stream";
  const viewerInfo = getViewerInfo(mimeType);

  return NextResponse.json({
    id: fileId, // Use the fileId from request params, not file.id which may be undefined
    name: file.name,
    mimeType,
    size: file.size,
    downloadAllowed,
    linkId: link.id,
    requiresWatermark: !downloadAllowed,
    supportedForViewing: viewerInfo.supportedForViewing,
    viewerType: viewerInfo.viewerType,
  });
}

/**
 * Determine viewer type and support status based on MIME type
 */
function getViewerInfo(mimeType: string): {
  supportedForViewing: boolean;
  viewerType: "image" | "pdf" | "text" | "video" | "audio" | "office" | "unsupported";
} {
  // Images
  if (mimeType.startsWith("image/")) {
    const supportedImages = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    return {
      supportedForViewing: supportedImages.includes(mimeType),
      viewerType: "image",
    };
  }

  // PDFs
  if (mimeType === "application/pdf") {
    return { supportedForViewing: true, viewerType: "pdf" };
  }

  // Text files
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/xml"
  ) {
    return { supportedForViewing: true, viewerType: "text" };
  }

  // Videos
  if (mimeType.startsWith("video/")) {
    return { supportedForViewing: true, viewerType: "video" };
  }

  // Audio
  if (mimeType.startsWith("audio/")) {
    return { supportedForViewing: true, viewerType: "audio" };
  }

  // Office files (Word, Excel, PowerPoint)
  const officeFormats = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
    "application/msword", // DOC
    "application/vnd.ms-excel", // XLS
    "application/vnd.ms-powerpoint", // PPT
  ];
  if (officeFormats.includes(mimeType)) {
    return { supportedForViewing: true, viewerType: "office" };
  }

  // Others unsupported
  return { supportedForViewing: false, viewerType: "unsupported" };
}

