import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { getDownloadUrl } from "@/services/storage";
import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";
import { trackLinkActivity } from "@/services/analytics";
import { createNotification } from "@/services/notifications";
import { getClientIP, getGeolocationFromIP } from "@/lib/geolocation";

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
    console.error("Download validation failed for token:", token, link?.error);
    return NextResponse.json({ error: "Lien invalide, expiré ou quota atteint" }, { status: 403 });
  }

  // 2. Vérifier que le fichier appartient au dossier
  const fileDoc = await db.collection("files").doc(fileId).get();
  if (!fileDoc.exists || fileDoc.data()?.folderId !== link.folderId) {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
  }

  const file = fileDoc.data()!;

  // 3. Utiliser downloadDefault du lien (pas de règles par fichier)
  const downloadAllowed = link.downloadDefault ?? (link.allowDownload ?? true);

  // 4. Vérifier si le téléchargement est autorisé
  if (!downloadAllowed) {
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

  // 7. Capturer la géolocalisation et incrémenter le compteur via analytics
  const clientIP = getClientIP(req);
  const geolocation = clientIP !== 'unknown' ? await getGeolocationFromIP(clientIP) : undefined;
  await trackLinkActivity(link.id, "DOWNLOAD", geolocation);

  // 8. Servir l'original (pas de watermark pour les téléchargements autorisés)
  const downloadUrl = await getDownloadUrl(file.s3Key, file.name);
  return NextResponse.redirect(downloadUrl);
}
