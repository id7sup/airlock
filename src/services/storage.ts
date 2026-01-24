import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Service de gestion du stockage Cloudflare R2
 *
 * Gère les URLs présignées pour upload, download et affichage de fichiers.
 * Utilise l'API compatible S3 de Cloudflare R2 avec le SDK AWS.
 */

// Client S3-compatible configuré avec les credentials Cloudflare R2
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
 * Génère une URL présignée pour l'upload d'un fichier
 *
 * @param key - Clé R2 du fichier (chemin dans le bucket)
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
 * @param key - Clé R2 du fichier
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
 * @param key - Clé R2 du fichier
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
