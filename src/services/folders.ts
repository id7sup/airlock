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
