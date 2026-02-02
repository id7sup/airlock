import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";

const MAX_FILES_PER_ZIP = 1000;
const MAX_SIZE_PER_ZIP = 5 * 1024 * 1024 * 1024; // 5GB

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  workspaceId: string;
  isFavorite: boolean;
  isDeleted?: boolean;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

export interface File {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  folderId: string;
  workspaceId: string;
  s3Key: string;
  isDeleted?: boolean;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

export interface FolderTreeResult {
  success: boolean;
  folders: Folder[];
  files: File[];
  totalFiles: number;
  totalSize: number;
  error?: string;
}

/**
 * Récupère récursivement tous les dossiers et fichiers dans un dossier racine.
 *
 * Pattern: Récupère TOUT le contenu du workspace en une seule requête,
 * puis filtre en mémoire par parentId pour construire l'arbre.
 * Cela évite les requêtes N+1 et est beaucoup plus efficace.
 *
 * Référence: /src/lib/actions/folders.ts (deleteFolderAction)
 */
export async function getAllFoldersAndFiles(
  rootFolderId: string,
  workspaceId: string,
  options?: { maxFiles?: number; maxSize?: number }
): Promise<FolderTreeResult> {
  try {
    const maxFiles = options?.maxFiles ?? MAX_FILES_PER_ZIP;
    const maxSize = options?.maxSize ?? MAX_SIZE_PER_ZIP;

    // 1. Récupérer le dossier racine pour vérifier qu'il existe
    const rootFolderSnap = await db.collection("folders").doc(rootFolderId).get();
    if (!rootFolderSnap.exists) {
      return {
        success: false,
        folders: [],
        files: [],
        totalFiles: 0,
        totalSize: 0,
        error: "Dossier non trouvé",
      };
    }

    // 2. Récupérer TOUT le contenu du workspace (optimisation massive)
    const [allFoldersSnap, allFilesSnap] = await Promise.all([
      db.collection("folders").where("workspaceId", "==", workspaceId).get(),
      db.collection("files").where("workspaceId", "==", workspaceId).get(),
    ]);

    const allFolders = allFoldersSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Folder[];

    const allFiles = allFilesSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as File[];

    // 3. Construire l'arbre du dossier racine
    const folderIdsToInclude = new Set<string>();
    const visitedFolders = new Set<string>();

    const findRecursive = (id: string) => {
      if (visitedFolders.has(id)) {
        return;
      }
      visitedFolders.add(id);
      folderIdsToInclude.add(id);

      // Sous-dossiers (éviter les cycles)
      allFolders
        .filter((f) => f.parentId === id && f.id !== id && f.isDeleted !== true)
        .forEach((f) => {
          if (!visitedFolders.has(f.id)) {
            findRecursive(f.id);
          }
        });
    };

    findRecursive(rootFolderId);

    // 4. Filtrer les fichiers et dossiers à inclure
    const includedFolders = allFolders.filter((f) => folderIdsToInclude.has(f.id));
    const includedFiles = allFiles.filter(
      (f) =>
        folderIdsToInclude.has(f.folderId!) &&
        !f.isDeleted // Exclure les fichiers supprimés (si applicable)
    );

    // 5. Calculer les totaux
    const totalFiles = includedFiles.length;
    const totalSize = includedFiles.reduce((sum, f) => sum + (f.size || 0), 0);

    // 6. Vérifier les limites
    if (totalFiles === 0) {
      return {
        success: false,
        folders: [],
        files: [],
        totalFiles: 0,
        totalSize: 0,
        error: "Ce dossier ne contient aucun fichier",
      };
    }

    if (totalFiles > maxFiles) {
      return {
        success: false,
        folders: [],
        files: [],
        totalFiles,
        totalSize,
        error: `Ce dossier contient ${totalFiles} fichiers. Maximum autorisé : ${maxFiles}.`,
      };
    }

    if (totalSize > maxSize) {
      return {
        success: false,
        folders: [],
        files: [],
        totalFiles,
        totalSize,
        error: `Taille totale : ${formatBytes(totalSize)}. Maximum autorisé : ${formatBytes(maxSize)}.`,
      };
    }

    return {
      success: true,
      folders: includedFolders,
      files: includedFiles,
      totalFiles,
      totalSize,
    };
  } catch (error: any) {
    console.error("[FolderTree] Error in getAllFoldersAndFiles:", error?.message);
    return {
      success: false,
      folders: [],
      files: [],
      totalFiles: 0,
      totalSize: 0,
      error: "Erreur lors de la récupération des données",
    };
  }
}

/**
 * Construit le chemin relatif d'un fichier dans la hiérarchie de dossiers.
 *
 * Exemple: Si file.folderId = "subfolder2" et la hiérarchie est:
 *   root > subfolder1 > subfolder2
 * Alors le chemin sera: "subfolder1/subfolder2/filename.txt"
 */
export function buildRelativeFilePath(
  file: File,
  folders: Folder[],
  rootFolderId: string
): string {
  const pathParts: string[] = [];
  let currentFolderId: string | null | undefined = file.folderId;

  // Construire le chemin de bas en haut
  while (currentFolderId && currentFolderId !== rootFolderId) {
    const folder = folders.find((f) => f.id === currentFolderId);
    if (!folder) break;

    pathParts.unshift(sanitizeFolderName(folder.name));
    currentFolderId = folder.parentId;
  }

  // Ajouter le nom du fichier
  pathParts.push(sanitizeFileName(file.name));

  return pathParts.join("/");
}

/**
 * Sanitize folder name pour éviter les injections de chemin
 */
function sanitizeFolderName(name: string): string {
  return name
    .replace(/\.\./g, "") // Éviter ..
    .replace(/[\/\\:*?"<>|]/g, "_") // Remplacer les caractères non autorisés
    .slice(0, 100); // Limiter la longueur
}

/**
 * Sanitize file name pour éviter les injections de chemin
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/\.\./g, "") // Éviter ..
    .replace(/[\/\\]/g, "_") // Remplacer les slashes
    .slice(0, 200); // Limiter la longueur
}

/**
 * Formate les bytes en une chaîne lisible (KB, MB, GB)
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
