import { db } from "@/lib/firebase";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as admin from "firebase-admin";

// S3-compatible client pour Cloudflare R2
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT, // Endpoint Cloudflare R2
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Génère un watermark pour un fichier
 * Note: Cette fonction nécessite une bibliothèque de traitement d'images
 * Pour l'instant, on copie le fichier original (le watermark réel sera ajouté plus tard)
 * Dans un vrai système, vous utiliseriez sharp, canvas, ou une autre bibliothèque
 */
export async function generateWatermarkedFile(
  fileId: string,
  shareLinkId: string
): Promise<void> {
  // Récupérer le fichier original
  const fileDoc = await db.collection("files").doc(fileId).get();
  if (!fileDoc.exists) throw new Error("Fichier non trouvé");
  
  const file = fileDoc.data()!;
  const originalKey = file.s3Key;

  // Récupérer les infos du share link pour le watermark
  const linkDoc = await db.collection("shareLinks").doc(shareLinkId).get();
  if (!linkDoc.exists) throw new Error("Lien de partage non trouvé");
  
  const linkData = linkDoc.data()!;
  const watermarkText = `Airlock • Share #${shareLinkId.slice(0, 6)} • ${new Date().toLocaleString('fr-FR')}`;

  // Récupérer le fichier original depuis R2
  const getCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: originalKey,
  });

  try {
    const response = await s3Client.send(getCommand);
    const fileBuffer = await streamToBuffer(response.Body as any);

    // TODO: Appliquer le watermark selon le type de fichier
    // Pour les images: utiliser sharp ou canvas
    // Pour les PDFs: utiliser pdf-lib ou pdfkit
    // Pour les autres: créer une version avec overlay
    
    // Pour l'instant, on copie le fichier original (le watermark réel sera implémenté plus tard)
    // Dans un vrai système, vous appliqueriez le watermark ici
    const watermarkedBuffer = await applyWatermarkToBuffer(fileBuffer, file.mimeType, watermarkText);

    // Uploader le fichier watermarké
    const derivedKey = `derived/${fileId}/watermarked/${file.name}`;
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: derivedKey,
      Body: watermarkedBuffer,
      ContentType: file.mimeType,
    });

    await s3Client.send(putCommand);

    // Mettre à jour le derived asset
    const derivedAsset = await db.collection("derivedAssets")
      .where("fileId", "==", fileId)
      .where("variant", "==", "watermarked")
      .limit(1)
      .get();

    if (!derivedAsset.empty) {
      await db.collection("derivedAssets").doc(derivedAsset.docs[0].id).update({
        objectKeyR2: derivedKey,
        status: "ready",
        size: watermarkedBuffer.length,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Créer l'entrée si elle n'existe pas
      await db.collection("derivedAssets").add({
        fileId,
        variant: "watermarked",
        objectKeyR2: derivedKey,
        status: "ready",
        size: watermarkedBuffer.length,
        shareLinkId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Erreur lors de la génération du watermark:", error);
    
    // Marquer comme failed
    const derivedAsset = await db.collection("derivedAssets")
      .where("fileId", "==", fileId)
      .where("variant", "==", "watermarked")
      .limit(1)
      .get();

    if (!derivedAsset.empty) {
      await db.collection("derivedAssets").doc(derivedAsset.docs[0].id).update({
        status: "failed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Créer l'entrée avec statut failed
      await db.collection("derivedAssets").add({
        fileId,
        variant: "watermarked",
        status: "failed",
        shareLinkId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    throw error;
  }
}

/**
 * Applique un watermark à un buffer (simulation)
 * Dans un vrai système, vous utiliseriez une bibliothèque appropriée
 */
async function applyWatermarkToBuffer(
  buffer: Buffer,
  mimeType: string,
  watermarkText: string
): Promise<Buffer> {
  // TODO: Implémenter le watermarking réel selon le type de fichier
  // Pour l'instant, on retourne le buffer original
  // Dans un vrai système:
  // - Images: utiliser sharp pour ajouter du texte
  // - PDFs: utiliser pdf-lib pour ajouter une couche de texte
  // - Autres: créer une version avec overlay
  
  return buffer;
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

/**
 * Récupère l'URL présignée d'un fichier dérivé watermarké
 */
export async function getWatermarkedFileUrl(
  fileId: string,
  fileName: string
): Promise<string> {
  const derivedAsset = await db.collection("derivedAssets")
    .where("fileId", "==", fileId)
    .where("variant", "==", "watermarked")
    .where("status", "==", "ready")
    .limit(1)
    .get();

  if (derivedAsset.empty) {
    throw new Error("Fichier watermarké non disponible");
  }

  const asset = derivedAsset.docs[0].data();
  const key = asset.objectKeyR2;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `inline; filename="${fileName}"`,
  });

  // URL valable 2 minutes pour la consultation (inline pour affichage)
  return await getSignedUrl(s3Client, command, { expiresIn: 120 });
}

