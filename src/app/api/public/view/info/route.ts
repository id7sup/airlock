import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { db } from "@/lib/firebase";

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

  // 2. Vérifier que le fichier appartient au dossier
  const fileDoc = await db.collection("files").doc(fileId).get();
  if (!fileDoc.exists || fileDoc.data()?.folderId !== link.folderId) {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
  }

  const file = fileDoc.data()!;

  // 3. Utiliser downloadDefault du lien (pas de règles par fichier)
  const downloadAllowed = link.downloadDefault ?? (link.allowDownload ?? true);

  return NextResponse.json({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType || "application/octet-stream",
    size: file.size,
    downloadAllowed,
  });
}

