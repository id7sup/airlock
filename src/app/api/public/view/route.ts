import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { db } from "@/lib/firebase";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { checkIfFolderIsChild } from "@/services/folders";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

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

  // 3. Servir le fichier original via proxy (pour que l'iframe puisse l'afficher)
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.s3Key,
    });

    const response = await s3Client.send(command);
    const fileBuffer = await streamToBuffer(response.Body as any);

    // Déterminer le Content-Type avec détection améliorée
    let contentType = file.mimeType || response.ContentType;
    
    // Si pas de Content-Type, essayer de le deviner depuis l'extension
    if (!contentType) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const extensionMap: Record<string, string> = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'txt': 'text/plain',
        'html': 'text/html',
        'xml': 'text/xml',
        'json': 'application/json',
      };
      contentType = ext && extensionMap[ext] ? extensionMap[ext] : 'application/octet-stream';
    }

    // Encoder le nom de fichier pour éviter les erreurs avec les caractères non-ASCII
    // Utiliser seulement des caractères ASCII pour le filename basique
    const safeFileName = file.name.replace(/[^\x20-\x7E]/g, '_');
    // Encoder en UTF-8 pour filename* (RFC 5987) - remplacer les apostrophes simples
    const encodedFileName = encodeURIComponent(file.name).replace(/'/g, '%27');

    // Retourner le fichier avec les bons headers pour l'affichage inline
    // Convertir le Buffer en Uint8Array pour compatibilité avec NextResponse
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        // Utiliser la syntaxe RFC 5987 pour les noms de fichiers avec caractères spéciaux
        "Content-Disposition": `inline; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "private, max-age=120",
        "X-Content-Type-Options": "nosniff",
        // Permettre l'affichage dans iframe (même origine)
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du fichier. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

/**
 * Convertit un stream en buffer
 */
function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

