"use server";

import { db } from "@/lib/firebase";
import { createShareLink } from "@/services/sharing";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import * as admin from "firebase-admin";

/**
 * Crée un lien de partage public (externe) avec contrôle granulaire
 */
export async function createShareLinkAction(data: {
  folderId: string;
  expiresAt?: Date | null;
  password?: string;
  isReadOnly?: boolean;
  maxViews?: number | null;
  allowDownload?: boolean;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  // Vérifier que l'utilisateur est OWNER du dossier
  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", data.folderId)
    .where("userId", "==", userId)
    .where("role", "==", "OWNER")
    .limit(1)
    .get();

  if (permSnapshot.empty) throw new Error("Seul le propriétaire peut créer un lien de partage");

  // Vérifier que le dossier n'est pas déjà partagé avec d'autres utilisateurs (non-propriétaire)
  const allPerms = await db.collection("permissions")
    .where("folderId", "==", data.folderId)
    .get();
  
  const hasSharedUsers = allPerms.docs.some(doc => {
    const perm = doc.data();
    return perm.role !== "OWNER" && (perm.userId !== userId || perm.userEmail);
  });

  if (hasSharedUsers) {
    throw new Error("Un dossier partagé en interne ne peut pas être partagé en lien public");
  }

  console.log("Creating link with data:", data);

  const result = await createShareLink({
    ...data,
    userId: userId,
    allowDownload: data.allowDownload ?? true, // Utilisé pour downloadDefault
  });
  
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/sharing`);
  return result;
}

/**
 * Récupère récursivement tous les fichiers et sous-dossiers d'un dossier
 */

/**
 * Récupère récursivement tous les sous-dossiers d'un dossier parent
 */
async function getAllSubfoldersRecursive(parentId: string, visited: Set<string> = new Set()): Promise<string[]> {
  // Protection contre les boucles infinies
  if (visited.has(parentId)) {
    return [];
  }
  visited.add(parentId);

  const subfolders: string[] = [parentId];

  // Récupérer les sous-dossiers directs
  // On utilise seulement where("parentId") pour éviter les problèmes d'index composite
  const childrenSnapshot = await db.collection("folders")
    .where("parentId", "==", parentId)
    .get();

  // Filtrer les dossiers supprimés côté code
  const activeChildren = childrenSnapshot.docs.filter(doc => {
    const data = doc.data();
    return data.isDeleted !== true;
  });

  // Récursivement récupérer les sous-dossiers de chaque enfant
  for (const childDoc of activeChildren) {
    const childId = childDoc.id;
    const childSubfolders = await getAllSubfoldersRecursive(childId, visited);
    subfolders.push(...childSubfolders);
  }

  return subfolders;
}

/**
 * Invite un utilisateur par son email (partage interne)
 * Crée des permissions récursives sur tous les sous-dossiers
 */
export async function inviteUserAction(folderId: string, email: string, role: "VIEWER" | "EDITOR", canDownload: boolean = true) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", folderId)
    .where("userId", "==", userId)
    .where("role", "==", "OWNER")
    .get();

  if (permSnapshot.empty) throw new Error("Seul le propriétaire peut inviter");

  // Récupérer récursivement tous les sous-dossiers (y compris le dossier parent)
  const allFolderIds = await getAllSubfoldersRecursive(folderId);

  if (allFolderIds.length === 0) {
    throw new Error("Aucun dossier trouvé");
  }

  const normalizedEmail = email.toLowerCase();

  // Récupérer toutes les permissions existantes en une seule requête groupée
  // (limite Firestore: 30 éléments dans "in", donc on doit grouper)
  const existingPermsMap = new Map<string, admin.firestore.QueryDocumentSnapshot>();
  
  // Grouper les folderIds par lots de 30 (limite Firestore pour "in")
  const BATCH_SIZE = 30;
  for (let i = 0; i < allFolderIds.length; i += BATCH_SIZE) {
    const folderBatch = allFolderIds.slice(i, i + BATCH_SIZE);
    const permsSnapshot = await db.collection("permissions")
      .where("folderId", "in", folderBatch)
      .where("userEmail", "==", normalizedEmail)
      .get();
    
    permsSnapshot.docs.forEach(doc => {
      const perm = doc.data();
      existingPermsMap.set(perm.folderId, doc);
    });
  }

  // Créer les permissions par batches (limite Firestore: 500 opérations par batch)
  const MAX_BATCH_SIZE = 500;
  let currentBatch = db.batch();
  let batchCount = 0;

  for (const folderIdToShare of allFolderIds) {
    const existingPerm = existingPermsMap.get(folderIdToShare);

    if (existingPerm) {
      // Mettre à jour la permission existante
      currentBatch.update(existingPerm.ref, {
        role,
        canDownload: role === "VIEWER" ? canDownload : true,
        isHidden: false, // Réactiver si elle était masquée
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Créer une nouvelle permission
      const permRef = db.collection("permissions").doc();
      currentBatch.set(permRef, {
        folderId: folderIdToShare,
        userEmail: normalizedEmail,
        role,
        canDownload: role === "VIEWER" ? canDownload : true, // EDITOR a toujours le download
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    batchCount++;

    // Si on atteint la limite, commit et créer un nouveau batch
    if (batchCount >= MAX_BATCH_SIZE) {
      await currentBatch.commit();
      currentBatch = db.batch();
      batchCount = 0;
    }
  }

  // Commit le dernier batch s'il contient des opérations
  if (batchCount > 0) {
    await currentBatch.commit();
  }

  revalidatePath(`/dashboard/folder/${folderId}`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard?filter=shared`);
}

/**
 * Révoque un lien de partage
 */
export async function revokeShareLinkAction(linkId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const linkDoc = await db.collection("shareLinks").doc(linkId).get();
  if (!linkDoc.exists) throw new Error("Lien non trouvé");
  const link = linkDoc.data()!;

  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", link.folderId)
    .where("userId", "==", userId)
    .where("role", "==", "OWNER")
    .limit(1)
    .get();

  if (permSnapshot.empty) throw new Error("Non autorisé");

  await db.collection("shareLinks").doc(linkId).delete();

  revalidatePath(`/dashboard`);
}

/**
 * Vérifie si un dossier est partagé avec d'autres utilisateurs
 */
export async function isFolderSharedAction(folderId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const allPerms = await db.collection("permissions")
    .where("folderId", "==", folderId)
    .get();
  
  // Vérifier s'il y a des permissions avec role VIEWER ou EDITOR (non-OWNER)
  const hasSharedUsers = allPerms.docs.some(doc => {
    const perm = doc.data();
    return perm.role === "VIEWER" || perm.role === "EDITOR";
  });

  return hasSharedUsers;
}

/**
 * Retire l'accès à un dossier partagé (pour les non-propriétaires)
 */
export async function revokeSharedFolderAccessAction(folderId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  // Récupérer toutes les permissions pour ce dossier
  const userPerms = await db.collection("permissions")
    .where("folderId", "==", folderId)
    .get();

  // Trouver la permission de l'utilisateur (par userId ou email)
  const user = await import("@clerk/nextjs/server").then(m => m.currentUser());
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  let permToDelete = null;
  let userPerm = null;
  
  // D'abord, trouver la permission de l'utilisateur actuel
  for (const permDoc of userPerms.docs) {
    const perm = permDoc.data();
    if (perm.userId === userId || (userEmail && perm.userEmail === userEmail)) {
      userPerm = perm;
      permToDelete = permDoc.id;
      break;
    }
  }

  if (!permToDelete || !userPerm) throw new Error("Permission non trouvée");

  // Vérifier que l'utilisateur n'est pas propriétaire
  if (userPerm.role === "OWNER") {
    throw new Error("Le propriétaire ne peut pas retirer son propre accès");
  }

  // Au lieu de supprimer, marquer comme masquée pour permettre la restauration
  await db.collection("permissions").doc(permToDelete).update({
    isHidden: true,
    hiddenAt: new Date()
  });

  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard?filter=shared`);
}

/**
 * Restaure l'accès à un dossier partagé (pour les non-propriétaires)
 */
export async function restoreSharedFolderAccessAction(folderId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  // Récupérer toutes les permissions pour ce dossier
  const userPerms = await db.collection("permissions")
    .where("folderId", "==", folderId)
    .get();

  // Trouver la permission masquée de l'utilisateur (par userId ou email)
  const user = await import("@clerk/nextjs/server").then(m => m.currentUser());
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  let permToRestore = null;
  let permData = null;
  
  // Trouver la permission masquée de l'utilisateur
  for (const permDoc of userPerms.docs) {
    const perm = permDoc.data();
    // Vérifier si c'est la permission de l'utilisateur (par userId ou email)
    const isUserPerm = perm.userId === userId || (userEmail && perm.userEmail === userEmail);
    
    if (isUserPerm) {
      // Si la permission est masquée, on peut la restaurer
      if (perm.isHidden === true) {
        permToRestore = permDoc.id;
        permData = perm;
        break;
      }
      // Si la permission existe déjà et n'est pas masquée, elle est déjà active
      // Dans ce cas, on ne fait rien (pas d'erreur)
      if (perm.isHidden !== true) {
        return; // Permission déjà active, rien à faire
      }
    }
  }

  // Si aucune permission masquée trouvée
  if (!permToRestore) {
    // Vérifier si l'utilisateur a une permission active (non masquée)
    const hasActivePerm = userPerms.docs.some(doc => {
      const perm = doc.data();
      const isUserPerm = perm.userId === userId || (userEmail && perm.userEmail === userEmail);
      return isUserPerm && perm.isHidden !== true;
    });
    
    if (hasActivePerm) {
      // Permission déjà active, rien à faire
      return;
    }
    
    // Aucune permission trouvée (ni masquée ni active)
    // Cela peut arriver si la permission a été complètement supprimée
    // Dans ce cas, on ne peut pas restaurer
    throw new Error("Aucune permission trouvée pour ce dossier. Contactez le propriétaire pour un nouvel accès.");
  }

  // Restaurer la permission
  await db.collection("permissions").doc(permToRestore).update({
    isHidden: false,
    hiddenAt: admin.firestore.FieldValue.delete()
  });

  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard?filter=shared`);
  revalidatePath(`/dashboard?filter=trash`);
}
