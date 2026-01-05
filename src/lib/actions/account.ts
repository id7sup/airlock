"use server";

import { db } from "@/lib/firebase";
import { auth, currentUser } from "@clerk/nextjs/server";
import * as admin from "firebase-admin";

/**
 * Supprime complètement le compte utilisateur et toutes ses données
 * Cette action est irréversible et supprime :
 * - Tous les workspaces de l'utilisateur
 * - Tous les dossiers et fichiers
 * - Toutes les permissions
 * - Tous les liens de partage
 * - Toutes les notifications
 * - Les membres des workspaces
 * - Le compte Clerk
 */
export async function deleteAccountAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  // 1. Récupérer tous les workspaces de l'utilisateur
  const workspacesSnap = await db.collection("workspaces")
    .where("memberIds", "array-contains", userId)
    .get();

  const workspaceIds = workspacesSnap.docs.map(doc => doc.id);

  if (workspaceIds.length === 0) {
    // Pas de workspace, on peut directement supprimer les permissions et le compte
    await cleanupUserData(userId, userEmail, []);
    await deleteClerkUser(userId);
    return;
  }

  // 2. Pour chaque workspace, supprimer tous les dossiers et fichiers
  for (const workspaceId of workspaceIds) {
    // Récupérer tous les dossiers et fichiers du workspace
    const [foldersSnap, filesSnap] = await Promise.all([
      db.collection("folders").where("workspaceId", "==", workspaceId).get(),
      db.collection("files").where("workspaceId", "==", workspaceId).get()
    ]);

    const folderIds = foldersSnap.docs.map(doc => doc.id);
    const fileIds = filesSnap.docs.map(doc => doc.id);

    // Supprimer par batches (limite Firestore de 500 opérations par batch)
    const allItems = [
      ...folderIds.map(id => ({ type: 'folder', id })),
      ...fileIds.map(id => ({ type: 'file', id }))
    ];

    // Traiter par batches de 500
    for (let i = 0; i < allItems.length; i += 500) {
      const batch = db.batch();
      const batchItems = allItems.slice(i, i + 500);
      
      batchItems.forEach(item => {
        if (item.type === 'folder') {
          batch.delete(db.collection("folders").doc(item.id));
        } else {
          batch.delete(db.collection("files").doc(item.id));
        }
      });
      
      await batch.commit();
    }

    // Révocquer tous les liens de partage liés aux dossiers de ce workspace
    // Firestore limite "in" à 30 éléments, donc on fait par batches
    const shareLinksToRevoke: string[] = [];
    for (let i = 0; i < folderIds.length; i += 30) {
      const batchIds = folderIds.slice(i, i + 30);
      const shareLinksSnap = await db.collection("shareLinks")
        .where("folderId", "in", batchIds)
        .get();
      shareLinksSnap.docs.forEach(doc => {
        shareLinksToRevoke.push(doc.id);
      });
    }

    // Marquer les liens comme révoqués (par batches de 500)
    if (shareLinksToRevoke.length > 0) {
      for (let i = 0; i < shareLinksToRevoke.length; i += 500) {
        const shareBatch = db.batch();
        const batchLinks = shareLinksToRevoke.slice(i, i + 500);
        batchLinks.forEach(linkId => {
          shareBatch.update(db.collection("shareLinks").doc(linkId), {
            isRevoked: true,
            revokedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        await shareBatch.commit();
      }
    }

    // Supprimer les permissions liées aux dossiers de ce workspace
    for (let i = 0; i < folderIds.length; i += 30) {
      const batchIds = folderIds.slice(i, i + 30);
      const permsSnap = await db.collection("permissions")
        .where("folderId", "in", batchIds)
        .get();
      
      if (permsSnap.docs.length > 0) {
        const permBatch = db.batch();
        permsSnap.docs.forEach(doc => permBatch.delete(doc.ref));
        await permBatch.commit();
      }
    }

    // Supprimer les membres du workspace
    const membersSnap = await db.collection("members")
      .where("workspaceId", "==", workspaceId)
      .where("userId", "==", userId)
      .get();
    
    if (membersSnap.docs.length > 0) {
      const memberBatch = db.batch();
      membersSnap.docs.forEach(doc => memberBatch.delete(doc.ref));
      await memberBatch.commit();
    }

    // Supprimer le workspace
    await db.collection("workspaces").doc(workspaceId).delete();
  }

  // 3. Nettoyer toutes les données restantes liées à l'utilisateur
  await cleanupUserData(userId, userEmail, workspaceIds);

  // 4. Supprimer le compte Clerk
  await deleteClerkUser(userId);
}

/**
 * Nettoie toutes les données restantes liées à l'utilisateur
 */
async function cleanupUserData(userId: string, userEmail: string | undefined, workspaceIds: string[]) {
  // Supprimer toutes les permissions restantes (par userId ou email)
  const permsQueries = [
    db.collection("permissions").where("userId", "==", userId).get()
  ];
  
  if (userEmail) {
    permsQueries.push(
      db.collection("permissions").where("userEmail", "==", userEmail).get()
    );
  }

  const permsResults = await Promise.all(permsQueries);
  const allPerms = permsResults.flatMap(snap => snap.docs);

  if (allPerms.length > 0) {
    // Supprimer par batches
    for (let i = 0; i < allPerms.length; i += 500) {
      const batch = db.batch();
      const batchPerms = allPerms.slice(i, i + 500);
      batchPerms.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  // Supprimer toutes les notifications
  const notificationsSnap = await db.collection("notifications")
    .where("userId", "==", userId)
    .get();

  if (notificationsSnap.docs.length > 0) {
    for (let i = 0; i < notificationsSnap.docs.length; i += 500) {
      const batch = db.batch();
      const batchNotifications = notificationsSnap.docs.slice(i, i + 500);
      batchNotifications.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  // Supprimer tous les membres restants
  const allMembersSnap = await db.collection("members")
    .where("userId", "==", userId)
    .get();

  if (allMembersSnap.docs.length > 0) {
    for (let i = 0; i < allMembersSnap.docs.length; i += 500) {
      const batch = db.batch();
      const batchMembers = allMembersSnap.docs.slice(i, i + 500);
      batchMembers.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }
}

/**
 * Supprime le compte utilisateur dans Clerk
 */
async function deleteClerkUser(userId: string) {
  try {
    // Utiliser l'API Clerk pour supprimer l'utilisateur
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
    if (!CLERK_SECRET_KEY) {
      throw new Error("CLERK_SECRET_KEY n'est pas configuré");
    }

    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la suppression du compte Clerk: ${response.status} - ${errorText}`);
    }
  } catch (error: any) {
    console.error("[DELETE_ACCOUNT] Erreur lors de la suppression du compte Clerk:", error);
    // On continue même si la suppression Clerk échoue, car les données Firestore sont déjà supprimées
    throw new Error(`Impossible de supprimer le compte: ${error.message}`);
  }
}

