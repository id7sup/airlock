import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { db } from "@/lib/firebase";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { checkIfFolderIsChild } from "@/services/folders";
import { trackEvent } from "@/services/analytics";
import { getClientIP, getGeolocationFromIP } from "@/lib/geolocation";

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

  if (link.allowViewOnline === false) {
    try {
      await trackEvent({
        linkId: link.id || link.linkId,
        eventType: "ACCESS_DENIED",
        invalidAttempt: true,
      });
    } catch (e) {
      // ignore
    }
    return NextResponse.json({ error: "Consultation en ligne désactivée" }, { status: 403 });
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
        const geolocation = await getGeolocationFromIP(clientIP);
        if (geolocation && (geolocation.isVPN === true || geolocation.isDatacenter === true)) {
          // Tracker l'accès refusé
          try {
            const userAgent = req.headers.get("user-agent") || undefined;
            const referer = req.headers.get("referer") || undefined;
            const { generateVisitorId } = await import("@/lib/visitor");
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

  // 3. Tracker la visualisation du fichier côté serveur (important pour mobile et tous devices)
  try {
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || undefined;
    const referer = req.headers.get("referer") || undefined;
    
    const { generateVisitorId } = await import("@/lib/visitor");
    const visitorId = generateVisitorId(clientIP, userAgent);
    
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
      console.error("Error getting geolocation for VIEW_FILE:", error);
    }

    await trackEvent({
      linkId: link.id || link.linkId,
      eventType: "VIEW_FILE",
      geolocation,
      visitorId,
      referer,
      userAgent,
      fileId: fileId,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Error tracking VIEW_FILE:", error);
    // Ne pas bloquer l'affichage si le tracking échoue
  }

  // 4. Servir le fichier original via proxy (pour que l'iframe puisse l'afficher)
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

