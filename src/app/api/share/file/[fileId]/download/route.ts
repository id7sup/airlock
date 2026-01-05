import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { getDownloadUrl } from "@/services/storage";
import { db } from "@/lib/firebase";
import { checkIfFolderIsChild } from "@/services/folders";

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

    // 3. Utiliser downloadDefault du lien (pas de règles par fichier)
    const downloadAllowed = link.downloadDefault ?? (link.allowDownload ?? true);

    // 4. Vérifier si le téléchargement est autorisé
    if (!downloadAllowed) {
      return NextResponse.json(
        { error: "Le téléchargement est désactivé pour ce lien (Consultation seule)" },
        { status: 403 }
      );
    }

    // 5. Générer une URL présignée vers l'original
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

