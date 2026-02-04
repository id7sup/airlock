"use server";

import { db } from "@/lib/firebase";
import { createShareLink } from "@/services/sharing";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import * as admin from "firebase-admin";

/**
 * Server Actions pour la gestion des partages
 * 
 * Toutes les fonctions sont des Server Actions Next.js qui s'exécutent
 * côté serveur avec authentification automatique.
 */

/**
 * Crée un lien de partage public (externe) avec contrôle granulaire
 * 
 * Seul le propriétaire (OWNER) du dossier peut créer un lien de partage.
 * 
 * @param data - Configuration du lien de partage
 * @param data.folderId - ID du dossier à partager
 * @param data.expiresAt - Date d'expiration (optionnel)
 * @param data.password - Mot de passe de protection (optionnel)
 * @param data.isReadOnly - Mode lecture seule (défaut: true)
 * @param data.maxViews - Nombre maximum de vues (optionnel)
 * @param data.allowDownload - Autoriser le téléchargement (défaut: true)
 * @returns Lien de partage créé avec token
 * @throws Error si l'utilisateur n'est pas propriétaire
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
 * Récupère récursivement tous les sous-dossiers d'un dossier parent
 * 
 * Utilise la récursion pour parcourir toute la hiérarchie des dossiers.
 * Protégé contre les boucles infinies avec un Set de dossiers visités.
 * 
 * @param parentId - ID du dossier parent
 * @param visited - Set des IDs déjà visités (pour éviter les boucles)
 * @returns Tableau de tous les IDs de sous-dossiers (incluant le parent)
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
 * 
 * Crée des permissions récursives sur tous les sous-dossiers.
 * Seuls OWNER et EDITOR peuvent inviter d'autres utilisateurs.
 * 
 * @param folderId - ID du dossier à partager
 * @param email - Email de l'utilisateur à inviter
 * @param role - Rôle à attribuer (VIEWER ou EDITOR)
 * @param canDownload - Autoriser le téléchargement (défaut: true)
 * @throws Error si l'utilisateur n'a pas les permissions ou si l'email est invalide
 */
export async function inviteUserAction(folderId: string, email: string, role: "VIEWER" | "EDITOR", canDownload: boolean = true) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  // Valider l'email
  if (!email || !email.trim()) {
    throw new Error("L'email est requis");
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Format d'email invalide");
  }

  // Vérifier que l'utilisateur est OWNER ou EDITOR
  const { currentUser } = await import("@clerk/nextjs/server");
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  const [permsByUserId, permsByEmail] = await Promise.all([
    db.collection("permissions")
      .where("folderId", "==", folderId)
      .where("userId", "==", userId)
      .get(),
    userEmail ? db.collection("permissions")
      .where("folderId", "==", folderId)
      .where("userEmail", "==", userEmail)
      .get() : Promise.resolve({ docs: [] } as any)
  ]);

  // Vérifier si l'utilisateur a une permission active (non masquée) avec rôle OWNER ou EDITOR
  const allPerms = [...permsByUserId.docs, ...permsByEmail.docs];
  const activePerm = allPerms.find(doc => {
    const perm = doc.data();
    return (perm.userId === userId || (userEmail && perm.userEmail === userEmail)) 
      && perm.isHidden !== true
      && (perm.role === "OWNER" || perm.role === "EDITOR");
  });

  if (!activePerm) {
    throw new Error("Seuls les propriétaires et éditeurs peuvent inviter des utilisateurs");
  }

  // Vérifier que le dossier existe
  const folderDoc = await db.collection("folders").doc(folderId).get();
  if (!folderDoc.exists) {
    throw new Error("Le dossier n'existe pas");
  }

  // Récupérer récursivement tous les sous-dossiers (y compris le dossier parent)
  let allFolderIds: string[];
  try {
    allFolderIds = await getAllSubfoldersRecursive(folderId);
  } catch (error: any) {
    console.error("Erreur lors de la récupération récursive des dossiers:", error);
    throw new Error("Erreur lors de la récupération des dossiers: " + (error?.message || "Erreur inconnue"));
  }

  if (!allFolderIds || allFolderIds.length === 0) {
    throw new Error("Aucun dossier trouvé");
  }

  const normalizedEmail = email.toLowerCase();

  // Récupérer toutes les permissions existantes en une seule requête groupée
  // (limite Firestore: 30 éléments dans "in", donc on doit grouper)
  const existingPermsMap = new Map<string, admin.firestore.QueryDocumentSnapshot>();
  
  // Grouper les folderIds par lots de 30 (limite Firestore pour "in")
  const BATCH_SIZE = 30;
  try {
    for (let i = 0; i < allFolderIds.length; i += BATCH_SIZE) {
      const folderBatch = allFolderIds.slice(i, i + BATCH_SIZE);
      if (folderBatch.length === 0) continue;
      
      const permsSnapshot = await db.collection("permissions")
        .where("folderId", "in", folderBatch)
        .where("userEmail", "==", normalizedEmail)
        .get();
      
      permsSnapshot.docs.forEach(doc => {
        const perm = doc.data();
        existingPermsMap.set(perm.folderId, doc);
      });
    }
  } catch (error: any) {
    console.error("Erreur lors de la récupération des permissions existantes:", error);
    throw new Error("Erreur lors de la vérification des permissions: " + (error?.message || "Erreur inconnue"));
  }

  // Créer les permissions par batches (limite Firestore: 500 opérations par batch)
  const MAX_BATCH_SIZE = 500;
  let currentBatch = db.batch();
  let batchCount = 0;

  try {
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
  } catch (error: any) {
    console.error("[SHARING] Error creating permissions:", error?.message);
    throw new Error("Erreur lors de la création des permissions: " + (error?.message || "Erreur inconnue"));
  }

  revalidatePath(`/dashboard/folder/${folderId}`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard?filter=shared`);
}

/**
 * Révoque un lien de partage public
 * 
 * Seul le propriétaire (OWNER) du dossier peut révoquer un lien.
 * 
 * @param linkId - ID du lien de partage à révoquer
 * @throws Error si l'utilisateur n'est pas propriétaire ou si le lien n'existe pas
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

  // Marquer comme révoqué au lieu de supprimer pour garder l'historique
  await db.collection("shareLinks").doc(linkId).update({
    isRevoked: true,
    revokedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/sharing`);
  revalidatePath(`/dashboard/sharing/${linkId}`);
}

/**
 * Réactive un lien de partage révoqué
 * 
 * Seul le propriétaire (OWNER) du dossier peut réactiver un lien.
 * 
 * @param linkId - ID du lien de partage à réactiver
 * @throws Error si l'utilisateur n'est pas propriétaire ou si le lien n'existe pas
 */
export async function reactivateShareLinkAction(linkId: string) {
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

  // Réactiver le lien
  await db.collection("shareLinks").doc(linkId).update({
    isRevoked: false,
    revokedAt: admin.firestore.FieldValue.delete(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/sharing`);
  revalidatePath(`/dashboard/sharing/${linkId}`);
}

/**
 * Supprime définitivement un lien de partage
 * 
 * Seul le propriétaire (OWNER) du dossier peut supprimer un lien.
 * Cette action est irréversible et supprime également les analytics associés.
 * 
 * @param linkId - ID du lien de partage à supprimer
 * @throws Error si l'utilisateur n'est pas propriétaire ou si le lien n'existe pas
 */
export async function deleteShareLinkAction(linkId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const linkDoc = await db.collection("shareLinks").doc(linkId).get();
  if (!linkDoc.exists) {
    // Si le lien n'existe déjà plus, considérer la suppression comme réussie
    revalidatePath(`/dashboard`);
    revalidatePath(`/dashboard/sharing`);
    return;
  }
  
  const link = linkDoc.data()!;

  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", link.folderId)
    .where("userId", "==", userId)
    .where("role", "==", "OWNER")
    .limit(1)
    .get();

  if (permSnapshot.empty) throw new Error("Non autorisé");

  // Supprimer les analytics associés au lien (par lots de 500)
  // On continue même si la suppression des analytics échoue
  try {
    const analyticsSnapshot = await db.collection("shareAnalytics")
      .where("linkId", "==", linkId)
      .limit(10000) // Limiter pour éviter les requêtes trop lourdes
      .get();
    
    // Firestore limite à 500 opérations par batch
    const MAX_BATCH_SIZE = 500;
    const analyticsDocs = analyticsSnapshot.docs;
    
    if (analyticsDocs.length > 0) {
      for (let i = 0; i < analyticsDocs.length; i += MAX_BATCH_SIZE) {
        try {
          const batch = db.batch();
          const chunk = analyticsDocs.slice(i, i + MAX_BATCH_SIZE);
          chunk.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        } catch (batchError) {
          // Logger l'erreur mais continuer la suppression du lien
          console.error(`Erreur lors de la suppression du batch d'analytics ${i}-${i + MAX_BATCH_SIZE}:`, batchError);
          // Continuer avec le batch suivant
        }
      }
    }
  } catch (analyticsError) {
    // Logger l'erreur mais continuer la suppression du lien
    console.error("Erreur lors de la récupération des analytics:", analyticsError);
    // On continue quand même pour supprimer le lien
  }

  // Supprimer le lien (même si la suppression des analytics a échoué)
  try {
    await db.collection("shareLinks").doc(linkId).delete();
  } catch (deleteError) {
    // Si le lien n'existe plus, c'est OK
    const linkCheck = await db.collection("shareLinks").doc(linkId).get();
    if (linkCheck.exists) {
      throw deleteError;
    }
  }

  // Revalider les chemins
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/sharing`);
  // Note: on ne revalide pas `/dashboard/sharing/${linkId}` car le lien est supprimé
}

/**
 * Vérifie si un dossier est partagé avec d'autres utilisateurs (partage interne)
 * 
 * @param folderId - ID du dossier à vérifier
 * @returns true si le dossier a des permissions VIEWER ou EDITOR, false sinon
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
 * Vérifie si un dossier a un lien public actif (non expiré, non révoqué)
 * 
 * @param folderId - ID du dossier à vérifier
 * @returns true si un lien public actif existe, false sinon
 */
export async function hasActivePublicLinkAction(folderId: string): Promise<boolean> {
  const existingLinksSnapshot = await db.collection("shareLinks")
    .where("folderId", "==", folderId)
    .get();

  const hasActivePublicLink = existingLinksSnapshot.docs.some(doc => {
    const link = doc.data();
    // Filtrer les liens révoqués
    if (link.isRevoked === true) {
      return false;
    }
    // Vérifier que le lien n'est pas expiré
    if (link.expiresAt && link.expiresAt.toDate() < new Date()) {
      return false;
    }
    // Vérifier que le quota n'est pas atteint
    if (link.maxViews && link.viewCount >= link.maxViews) {
      return false;
    }
    return true;
  });

  return hasActivePublicLink;
}

/**
 * Récupère tous les fichiers d'un dossier partagé (incluant les sous-dossiers si allowFolderAccess)
 * 
 * @param linkId - ID du lien de partage
 * @returns Liste des fichiers avec id, name, mimeType
 */
export async function getSharedFolderFilesAction(linkId: string): Promise<Array<{ id: string; name: string; mimeType: string; folderId: string }>> {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const linkDoc = await db.collection("shareLinks").doc(linkId).get();
  if (!linkDoc.exists) throw new Error("Lien non trouvé");
  const link = linkDoc.data()!;

  // Vérifier que l'utilisateur est OWNER du dossier
  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", link.folderId)
    .where("userId", "==", userId)
    .where("role", "==", "OWNER")
    .limit(1)
    .get();

  if (permSnapshot.empty) throw new Error("Non autorisé");

  const files: Array<{ id: string; name: string; mimeType: string; folderId: string }> = [];

  // Récupérer les fichiers du dossier principal
  const filesSnapshot = await db.collection("files")
    .where("folderId", "==", link.folderId)
    .get();

  filesSnapshot.docs.forEach(doc => {
    const data = doc.data();
    files.push({
      id: doc.id,
      name: data.name,
      mimeType: data.mimeType || "application/octet-stream",
      folderId: data.folderId,
    });
  });

  // Si allowFolderAccess est activé, récupérer aussi les fichiers des sous-dossiers
  if (link.allowFolderAccess === true) {
    const allSubfolders = await getAllSubfoldersRecursive(link.folderId);
    
    // Récupérer les fichiers de chaque sous-dossier (par lots de 30 pour éviter les limites Firestore)
    const BATCH_SIZE = 30;
    for (let i = 0; i < allSubfolders.length; i += BATCH_SIZE) {
      const folderBatch = allSubfolders.slice(i, i + BATCH_SIZE);
      if (folderBatch.length === 0) continue;
      
      // Ignorer le dossier principal car déjà traité
      const foldersToQuery = folderBatch.filter(fId => fId !== link.folderId);
      if (foldersToQuery.length === 0) continue;

      const subFilesSnapshot = await db.collection("files")
        .where("folderId", "in", foldersToQuery)
        .get();

      subFilesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        files.push({
          id: doc.id,
          name: data.name,
          mimeType: data.mimeType || "application/octet-stream",
          folderId: data.folderId,
        });
      });
    }
  }

  // Trier par nom
  files.sort((a, b) => a.name.localeCompare(b.name));

  return files;
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
