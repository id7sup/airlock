import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT, // Pour Cloudflare R2
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // URL d'upload valable 5 minutes
  return await getSignedUrl(s3Client, command, { expiresIn: 300 });
}

export async function getDownloadUrl(key: string, fileName: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
  });

  // URL de téléchargement valable 1 heure
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Récupère une URL présignée pour l'affichage inline (pas de téléchargement)
 */
export async function getViewUrl(key: string, fileName: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `inline; filename="${fileName}"`,
  });

  // URL d'affichage valable 2 minutes
  return await getSignedUrl(s3Client, command, { expiresIn: 120 });
}

