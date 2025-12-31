"use server";

import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import * as admin from "firebase-admin";

async function getOrCreatePersonalWorkspace(userId: string) {
  const workspacesRef = db.collection("workspaces");
  const snapshot = await workspacesRef.where("memberIds", "array-contains", userId).limit(1).get();

  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  const newWorkspaceRef = workspacesRef.doc();
  const workspaceData = {
    name: "Mon Espace",
    slug: `personal-${userId.slice(-6)}`,
    memberIds: [userId],
    totalStorageUsed: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await newWorkspaceRef.set(workspaceData);

  // Ajouter le membre
  await db.collection("members").add({
    userId,
    workspaceId: newWorkspaceRef.id,
    role: "ADMIN",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: newWorkspaceRef.id, ...workspaceData };
}

export async function createFolderAction(name: string, parentId?: string | null) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const workspace = await getOrCreatePersonalWorkspace(userId);

  // Récupérer le max order actuel pour placer le nouveau dossier à la fin
  let lastOrder = 0;
  try {
    const foldersSnapshot = await db.collection("folders")
      .where("workspaceId", "==", workspace.id)
      .where("parentId", "==", parentId || null)
      .orderBy("order", "desc")
      .limit(1)
      .get();
    
    lastOrder = foldersSnapshot.empty ? 0 : (foldersSnapshot.docs[0].data().order || 0);
  } catch (error) {
    const foldersSnapshot = await db.collection("folders")
      .where("workspaceId", "==", workspace.id)
      .where("parentId", "==", parentId || null)
      .get();
    
    foldersSnapshot.docs.forEach(doc => {
      const order = doc.data().order || 0;
      if (order > lastOrder) lastOrder = order;
    });
  }

  const batch = db.batch();
  const folderRef = db.collection("folders").doc();
  
  batch.set(folderRef, {
    name,
    workspaceId: workspace.id,
    parentId: parentId || null,
    isFavorite: false,
    isDeleted: false,
    order: lastOrder + 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const permRef = db.collection("permissions").doc();
  batch.set(permRef, {
    folderId: folderRef.id,
    userId,
    role: "OWNER",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  if (parentId) {
    revalidatePath(`/dashboard/folder/${parentId}`);
  }
  revalidatePath("/dashboard");
  return folderRef.id;
}

export async function updateFoldersOrderAction(folderOrders: { id: string, order: number }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const batch = db.batch();
  folderOrders.forEach(({ id, order }) => {
    const ref = db.collection("folders").doc(id);
    batch.update(ref, { 
      order, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    });
  });

  await batch.commit();
  revalidatePath("/dashboard");
}

export async function deleteFolderAction(folderId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const folderDoc = await db.collection("folders").doc(folderId).get();
  // Si le dossier n'existe plus, on retourne silencieusement (déjà supprimé)
  if (!folderDoc.exists) {
    return;
  }
  const folderData = folderDoc.data()!;
  const workspaceId = folderData.workspaceId;

  // 1. Vérifier accès OWNER
  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", folderId)
    .where("userId", "==", userId)
    .where("role", "==", "OWNER")
    .limit(1)
    .get();

  if (permSnapshot.empty) throw new Error("Non autorisé à supprimer ce dossier");

  // 2. Récupérer TOUT le contenu du workspace pour calcul en mémoire (Optimisation massive)
  const [allFoldersSnap, allFilesSnap] = await Promise.all([
    db.collection("folders").where("workspaceId", "==", workspaceId).get(),
    db.collection("files").where("workspaceId", "==", workspaceId).get()
  ]);

  const allFolders = allFoldersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{ id: string; parentId?: string | null; [key: string]: any }>;
  const allFiles = allFilesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{ id: string; folderId?: string; size?: number; [key: string]: any }>;

  const folderIdsToDelete = new Set<string>();
  const fileIdsToDelete = new Set<string>();
  const visitedFolders = new Set<string>(); // Protection contre les boucles infinies
  let totalSizeRemoved = 0;

  const findRecursive = (id: string) => {
    // Protection contre les boucles infinies
    if (visitedFolders.has(id)) {
      return;
    }
    visitedFolders.add(id);
    folderIdsToDelete.add(id);
    
    // Fichiers dans ce dossier
    allFiles.filter(f => f.folderId === id).forEach(f => {
      fileIdsToDelete.add(f.id);
      totalSizeRemoved += (f.size || 0);
    });

    // Sous-dossiers (éviter les cycles)
    allFolders.filter(f => f.parentId === id && f.id !== id).forEach(f => {
      if (!visitedFolders.has(f.id)) {
        findRecursive(f.id);
      }
    });
  };

  findRecursive(folderId);

  // 3. Suppression par batches (limite Firestore de 500 opérations par batch)
  const batch = db.batch();
  let count = 0;

  // Supprimer dossiers
  folderIdsToDelete.forEach(id => {
    batch.delete(db.collection("folders").doc(id));
    count++;
  });

  // Supprimer fichiers
  fileIdsToDelete.forEach(id => {
    batch.delete(db.collection("files").doc(id));
    count++;
  });

  // Supprimer permissions liées aux dossiers supprimés
  // Note: On pourrait aussi les supprimer via une requête where in si folderIdsToDelete < 30
  // Pour faire simple et efficace, on ne supprime que celles du dossier racine ici 
  // car une suppression complète de permissions nécessiterait une autre boucle massive.
  // OPTIMISATION : Supprimer les permissions via une requête batchée
  const permsSnap = await db.collection("permissions").where("folderId", "in", Array.from(folderIdsToDelete).slice(0, 30)).get();
  permsSnap.docs.forEach(d => batch.delete(d.ref));

  // Mettre à jour le stockage du workspace
  if (totalSizeRemoved > 0) {
    batch.update(db.collection("workspaces").doc(workspaceId), {
      totalStorageUsed: admin.firestore.FieldValue.increment(-totalSizeRemoved),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  if (folderData.parentId) {
    revalidatePath(`/dashboard/folder/${folderData.parentId}`);
  }
  revalidatePath("/dashboard");
}

export async function renameFolderAction(folderId: string, newName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const folderDoc = await db.collection("folders").doc(folderId).get();
  if (!folderDoc.exists) throw new Error("Dossier non trouvé");
  const folderData = folderDoc.data()!;

  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", folderId)
    .where("userId", "==", userId)
    .get();

  const hasAccess = permSnapshot.docs.some(doc => ["OWNER", "EDITOR"].includes(doc.data().role));
  if (!hasAccess) throw new Error("Non autorisé à modifier ce dossier");

  await db.collection("folders").doc(folderId).update({
    name: newName,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (folderData.parentId) {
    revalidatePath(`/dashboard/folder/${folderData.parentId}`);
  }
  revalidatePath("/dashboard");
}

export async function toggleFavoriteAction(folderId: string, isFavorite: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const folderDoc = await db.collection("folders").doc(folderId).get();
  if (!folderDoc.exists) throw new Error("Dossier non trouvé");
  const folderData = folderDoc.data()!;

  await db.collection("folders").doc(folderId).update({
    isFavorite,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (folderData.parentId) {
    revalidatePath(`/dashboard/folder/${folderData.parentId}`);
  }
  revalidatePath("/dashboard");
}

export async function moveToTrashAction(folderId: string, isDeleted: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const folderDoc = await db.collection("folders").doc(folderId).get();
  if (!folderDoc.exists) throw new Error("Dossier non trouvé");
  const folderData = folderDoc.data()!;

  // Vérifier si l'utilisateur est propriétaire
  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", folderId)
    .where("userId", "==", userId)
    .where("role", "==", "OWNER")
    .limit(1)
    .get();

  const isOwner = !permSnapshot.empty;

  if (isOwner) {
    // Propriétaire : mettre à la corbeille normalement
    const updateData: any = {
      isDeleted,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    // Si on met à la corbeille, enregistrer la date
    if (isDeleted) {
      updateData.deletedAt = admin.firestore.FieldValue.serverTimestamp();
    } else {
      // Si on restaure, supprimer la date de suppression
      updateData.deletedAt = admin.firestore.FieldValue.delete();
    }
    
    await db.collection("folders").doc(folderId).update(updateData);
  } else {
    // Non-propriétaire : vérifier si c'est vraiment un dossier partagé
    const user = await import("@clerk/nextjs/server").then(m => m.currentUser());
    const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    
    // Vérifier si l'utilisateur a une permission (active ou masquée) sur ce dossier
    const allPerms = await db.collection("permissions")
      .where("folderId", "==", folderId)
      .get();
    
    const hasPermission = allPerms.docs.some(doc => {
      const perm = doc.data();
      return (perm.userId === userId || (userEmail && perm.userEmail === userEmail)) && perm.role !== "OWNER";
    });
    
    if (!hasPermission) {
      throw new Error("Vous n'avez pas la permission d'effectuer cette action sur ce dossier");
    }
    
    // C'est un dossier partagé : retirer/restaurer l'accès selon isDeleted
    if (isDeleted) {
      // Mettre à la corbeille = masquer la permission
      const { revokeSharedFolderAccessAction } = await import("@/lib/actions/sharing");
      await revokeSharedFolderAccessAction(folderId);
    } else {
      // Restaurer = restaurer la permission masquée
      const { restoreSharedFolderAccessAction } = await import("@/lib/actions/sharing");
      await restoreSharedFolderAccessAction(folderId);
    }
    return; // Pas besoin de revalidatePath car déjà fait dans les actions de sharing
  }

  if (folderData.parentId) {
    revalidatePath(`/dashboard/folder/${folderData.parentId}`);
  }
  revalidatePath("/dashboard");
}

/**
 * Nettoie automatiquement les dossiers dans la corbeille depuis plus de 30 jours
 */
export async function cleanupOldTrashAction() {
  const { userId } = await auth();
  if (!userId) return { deleted: 0 };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Récupérer les dossiers supprimés depuis plus de 30 jours appartenant à l'utilisateur
  const workspacesSnapshot = await db.collection("workspaces")
    .where("memberIds", "array-contains", userId)
    .get();

  const workspaceIds = workspacesSnapshot.docs.map(doc => doc.id);
  
  if (workspaceIds.length === 0) return { deleted: 0 };

  // Récupérer tous les dossiers supprimés dans ces workspaces
  const deletedFoldersSnapshot = await db.collection("folders")
    .where("workspaceId", "in", workspaceIds)
    .where("isDeleted", "==", true)
    .get();

  const foldersToDelete: string[] = [];
  
  for (const folderDoc of deletedFoldersSnapshot.docs) {
    const folderData = folderDoc.data();
    const deletedAt = folderData.deletedAt;
    
    if (deletedAt) {
      const deletedDate = deletedAt instanceof admin.firestore.Timestamp 
        ? deletedAt.toDate() 
        : deletedAt.toDate 
        ? deletedAt.toDate()
        : new Date(deletedAt);
      
      if (deletedDate < thirtyDaysAgo) {
        // Vérifier que l'utilisateur est propriétaire
        const permSnapshot = await db.collection("permissions")
          .where("folderId", "==", folderDoc.id)
          .where("userId", "==", userId)
          .where("role", "==", "OWNER")
          .limit(1)
          .get();
        
        if (!permSnapshot.empty) {
          foldersToDelete.push(folderDoc.id);
        }
      }
    }
  }

  // Supprimer les dossiers de plus de 30 jours (utiliser deleteFolderAction pour chaque)
  if (foldersToDelete.length > 0) {
    for (const folderId of foldersToDelete) {
      try {
        await deleteFolderAction(folderId);
      } catch (error) {
        // Ignorer les erreurs individuelles pour continuer le nettoyage
        console.error(`Erreur lors de la suppression du dossier ${folderId}:`, error);
      }
    }
  }

  return { deleted: foldersToDelete.length };
}

export async function moveFoldersAction(folderIds: string[], targetParentId: string | null) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const batch = db.batch();
  folderIds.forEach(id => {
    const ref = db.collection("folders").doc(id);
    batch.update(ref, { 
      parentId: targetParentId, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    });
  });

  await batch.commit();
  revalidatePath("/dashboard");
}

export async function groupFoldersAction(folderIds: string[], newFolderName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  // 1. Créer le nouveau dossier parent (à la racine, comme un dossier classique)
  const newFolderId = await createFolderAction(newFolderName);

  // 2. Déplacer les dossiers sélectionnés dedans
  if (folderIds.length > 0) {
    await moveFoldersAction(folderIds, newFolderId);
  }

  // 3. Revalider le dashboard pour que les changements soient visibles
  revalidatePath("/dashboard");

  return newFolderId;
}
