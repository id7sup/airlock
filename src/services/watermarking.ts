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
 * Applique un watermark à un buffer selon le type de fichier
 */
async function applyWatermarkToBuffer(
  buffer: Buffer,
  mimeType: string,
  watermarkText: string
): Promise<Buffer> {
  // Handle images with sharp
  if (mimeType.startsWith("image/")) {
    return await applyImageWatermark(buffer, watermarkText);
  }

  // Handle PDFs with pdf-lib
  if (mimeType === "application/pdf") {
    return await applyPdfWatermark(buffer, watermarkText);
  }

  // For other formats, return original (client-side watermark will be applied)
  return buffer;
}

/**
 * Apply watermark to image using sharp
 */
async function applyImageWatermark(
  buffer: Buffer,
  watermarkText: string
): Promise<Buffer> {
  try {
    const sharp = require("sharp");
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return buffer;
    }

    // Create SVG watermark with diagonal text pattern
    const watermarkSvg = `
      <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="watermark" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
            <text x="200" y="200"
                  transform="rotate(-45 200 200)"
                  font-size="24"
                  font-family="Arial, sans-serif"
                  fill="rgba(0,0,0,0.15)"
                  font-weight="bold"
                  text-anchor="middle">
              ${watermarkText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#watermark)" />
      </svg>
    `;

    // Composite the watermark SVG onto the image
    const composited = await image
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          gravity: "center",
        },
      ])
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    return composited;
  } catch (error) {
    console.error("Error applying image watermark:", error);
    // Fallback to original if watermarking fails
    return buffer;
  }
}

/**
 * Apply watermark to PDF using pdf-lib
 */
async function applyPdfWatermark(
  buffer: Buffer,
  watermarkText: string
): Promise<Buffer> {
  try {
    const { PDFDocument, rgb, degrees } = require("pdf-lib");

    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();

    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();

      // Calculate diagonal text positions for repeating pattern
      const textSize = 48;
      const spacing = 200;

      for (let y = -height; y < height * 2; y += spacing) {
        for (let x = -width; x < width * 2; x += spacing) {
          page.drawText(watermarkText, {
            x: x + width / 2,
            y: y + height / 2,
            size: textSize,
            color: rgb(0, 0, 0),
            opacity: 0.15,
            rotate: degrees(-45),
          });
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("Error applying PDF watermark:", error);
    // Fallback to original if watermarking fails
    return buffer;
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

