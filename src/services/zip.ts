import archiver from "archiver";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import type { Folder, File } from "./folderTree";
import { buildRelativeFilePath } from "./folderTree";

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Client S3-compatible configuré avec les credentials Cloudflare R2
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Crée une archive ZIP à partir d'une liste de dossiers et fichiers.
 *
 * Streams les fichiers depuis S3 directement dans l'archive pour éviter
 * de charger tout en mémoire.
 *
 * @param folders - Liste des dossiers à inclure dans le ZIP
 * @param files - Liste des fichiers à inclure dans le ZIP
 * @param rootFolderId - ID du dossier racine
 * @param rootFolderName - Nom du dossier racine (pour créer un dossier wrapper dans le ZIP)
 * @returns Archiver instance (à pipervers la response)
 */
export async function createFolderZip(
  folders: Folder[],
  files: File[],
  rootFolderId: string,
  rootFolderName: string
): Promise<archiver.Archiver> {
  // Créer l'archiver
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Compression maximale
  });

  // Créer une set des folders pour accès rapide
  const folderMap = new Map(folders.map((f) => [f.id, f]));

  // Ajouter les fichiers à l'archive avec streaming depuis S3
  let fileCount = 0;
  for (const file of files) {
    try {
      // Construire le chemin relatif dans le ZIP
      const relativePath = buildRelativeFilePath(file, folders, rootFolderId);
      const zipPath = `${rootFolderName}/${relativePath}`;

      // Récupérer le fichier depuis S3
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.s3Key,
      });

      const s3Response = await s3Client.send(command);

      // Stream directement vers l'archive
      archive.append(s3Response.Body as any, {
        name: zipPath,
      });

      fileCount++;

      // Log tous les 100 fichiers pour debug
      if (fileCount % 100 === 0) {
        console.log(`[ZIP] Ajouté ${fileCount} fichiers à l'archive`);
      }
    } catch (error: any) {
      console.error(
        `[ZIP] Erreur lors du téléchargement du fichier ${file.id}:`,
        error?.message
      );
      // Continuer avec le prochain fichier au lieu de fail entièrement
      // Optionnel: ajouter un fichier d'erreur pour tracer les problèmes
    }
  }

  console.log(`[ZIP] Archive créée avec ${fileCount} fichiers`);

  // Finaliser l'archive (sans await - elle sera complétée lors du pipe)
  archive.finalize();

  return archive;
}

/**
 * Convertit un stream en buffer (utile pour les petits fichiers)
 */
export function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
