import { db } from "@/lib/firebase";

export async function getWorkspaceFolders(workspaceId: string, parentId: string | null = null) {
  const foldersRef = db.collection("folders");
  const snapshot = await foldersRef
    .where("workspaceId", "==", workspaceId)
    .where("parentId", "==", parentId)
    .orderBy("name", "asc")
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createFolder(data: {
  name: string;
  workspaceId: string;
  parentId?: string | null;
  ownerId: string;
}) {
  const folderRef = db.collection("folders").doc();
  const folderData = {
    name: data.name,
    workspaceId: data.workspaceId,
    parentId: data.parentId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await folderRef.set(folderData);

  // Créer la permission Owner
  await db.collection("permissions").add({
    folderId: folderRef.id,
    userId: data.ownerId,
    role: "OWNER",
    createdAt: new Date(),
  });

  return { id: folderRef.id, ...folderData };
}

export async function getFolderContent(folderId: string) {
  const folderDoc = await db.collection("folders").doc(folderId).get();
  if (!folderDoc.exists) return null;

  const childrenSnapshot = await db.collection("folders")
    .where("parentId", "==", folderId)
    .get();

  const filesSnapshot = await db.collection("files")
    .where("folderId", "==", folderId)
    .get();

  return {
    id: folderDoc.id,
    ...folderDoc.data(),
    children: childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    files: filesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
  };
}

/**
 * Vérifie récursivement si un dossier est un enfant (direct ou indirect) d'un dossier parent
 * 
 * Utilise la récursion pour remonter la hiérarchie des dossiers jusqu'à trouver
 * le parent ou atteindre la racine.
 * 
 * @param childId - ID du dossier enfant à vérifier
 * @param parentId - ID du dossier parent cible
 * @returns true si le dossier est un enfant du parent, false sinon
 */
export async function checkIfFolderIsChild(childId: string, parentId: string): Promise<boolean> {
  try {
    // Si c'est le même dossier, c'est un enfant
    if (childId === parentId) {
      return true;
    }

    // Récupérer le dossier enfant
    const childDoc = await db.collection("folders").doc(childId).get();
    if (!childDoc.exists) {
      return false;
    }

    const childData = childDoc.data();
    if (!childData || !childData.parentId) {
      return false;
    }

    // Si le parent direct est le parent cible, c'est un enfant
    if (childData.parentId === parentId) {
      return true;
    }

    // Récursion : vérifier si le parent du dossier est un enfant du parent cible
    return checkIfFolderIsChild(childData.parentId, parentId);
  } catch (error: any) {
    console.error("[FOLDERS] Error in checkIfFolderIsChild:", error?.message);
    return false;
  }
}
