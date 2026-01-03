import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Service de gestion du stockage S3
 * 
 * Gère les URLs présignées pour upload, download et affichage de fichiers.
 * Compatible avec S3 et services compatibles (Cloudflare R2, DigitalOcean Spaces, etc.)
 */

// Client S3 configuré avec les credentials depuis les variables d'environnement
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT, // Pour Cloudflare R2 ou autres services compatibles
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Génère une URL présignée pour l'upload d'un fichier
 * 
 * @param key - Clé S3 du fichier (chemin dans le bucket)
 * @param contentType - Type MIME du fichier
 * @returns URL présignée valable 5 minutes
 */
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 300 });
}

/**
 * Génère une URL présignée pour le téléchargement d'un fichier
 * 
 * @param key - Clé S3 du fichier
 * @param fileName - Nom du fichier pour le header Content-Disposition
 * @returns URL présignée valable 1 heure
 */
export async function getDownloadUrl(key: string, fileName: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Génère une URL présignée pour l'affichage inline d'un fichier
 * 
 * Utilisé pour la prévisualisation de fichiers (PDF, images) sans téléchargement.
 * 
 * @param key - Clé S3 du fichier
 * @param fileName - Nom du fichier pour le header Content-Disposition
 * @returns URL présignée valable 2 minutes
 */
export async function getViewUrl(key: string, fileName: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `inline; filename="${fileName}"`,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 120 });
}
