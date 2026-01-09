import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { getDownloadUrl } from "@/services/storage";
import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";
import { createNotification } from "@/services/notifications";
import { getClientIP, getGeolocationFromIP } from "@/lib/geolocation";
import { checkIfFolderIsChild } from "@/services/folders";
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
    if (link?.linkId) {
      try {
        await trackEvent({
          linkId: link.linkId,
          eventType: "ACCESS_DENIED",
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

  // 3. Utiliser downloadDefault du lien (pas de règles par fichier)
  const downloadAllowed = link.allowDownload ?? link.downloadDefault ?? true;

  // 4. Vérifier si le téléchargement est autorisé
  if (!downloadAllowed) {
    try {
      await trackEvent({
        linkId: link.id || link.linkId,
        eventType: "ACCESS_DENIED",
        invalidAttempt: true,
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

  // 7. Le tracking est géré côté client via /api/analytics/track-event
  // Pas besoin de tracker ici pour éviter le double comptage

  // 8. Servir l'original (pas de watermark pour les téléchargements autorisés)
  const downloadUrl = await getDownloadUrl(file.s3Key, file.name);
  return NextResponse.redirect(downloadUrl);
}
