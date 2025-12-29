"use server";

import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { getUploadUrl, getDownloadUrl } from "@/services/storage";
import { revalidatePath } from "next/cache";
import * as admin from "firebase-admin";

export async function getPresignedUploadUrlAction(data: {
  name: string;
  size: number;
  mimeType: string;
  folderId: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  // 1. Vérifier la limite de stockage (5 GB)
  const MAX_STORAGE = 5 * 1024 * 1024 * 1024;
  
  const folderDoc = await db.collection("folders").doc(data.folderId).get();
  if (!folderDoc.exists) throw new Error("Dossier non trouvé");
  const workspaceId = folderDoc.data()?.workspaceId;

  const workspaceDoc = await db.collection("workspaces").doc(workspaceId).get();
  const currentUsage = workspaceDoc.data()?.totalStorageUsed || 0;

  if (currentUsage + data.size > MAX_STORAGE) {
    throw new Error("Limite de stockage de 5 Go atteinte. Veuillez passer à l'offre Premium.");
  }

  // 2. Vérifier accès (EDITOR ou OWNER)
  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", data.folderId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  const perm = permSnapshot.empty ? null : permSnapshot.docs[0].data();
  if (!perm || !["OWNER", "EDITOR"].includes(perm.role)) {
    throw new Error("Pas de permission d'écriture");
  }

  const s3Key = `uploads/${userId}/${Date.now()}-${data.name}`;
  const uploadUrl = await getUploadUrl(s3Key, data.mimeType);

  return { uploadUrl, s3Key };
}

export async function confirmFileUploadAction(data: {
  name: string;
  size: number;
  mimeType: string;
  s3Key: string;
  folderId: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const folderDoc = await db.collection("folders").doc(data.folderId).get();
  if (!folderDoc.exists) throw new Error("Dossier non trouvé");
  const workspaceId = folderDoc.data()?.workspaceId;

  const batch = db.batch();
  
  // 1. Créer le fichier
  const fileRef = db.collection("files").doc();
  batch.set(fileRef, {
    name: data.name,
    size: data.size,
    mimeType: data.mimeType,
    s3Key: data.s3Key,
    folderId: data.folderId,
    workspaceId: workspaceId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Mettre à jour le workspace
  const workspaceRef = db.collection("workspaces").doc(workspaceId);
  batch.update(workspaceRef, {
    totalStorageUsed: admin.firestore.FieldValue.increment(data.size),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 3. Mettre à jour le dossier parent
  batch.update(db.collection("folders").doc(data.folderId), {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  revalidatePath(`/dashboard/folder/${data.folderId}`);
  revalidatePath("/dashboard");
  return { id: fileRef.id };
}

export async function getFileDownloadUrlAction(fileId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Authentification requise");
  
  const fileDoc = await db.collection("files").doc(fileId).get();
  if (!fileDoc.exists) throw new Error("Fichier non trouvé");
  const file = fileDoc.data()!;

  // Vérifier accès
  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", file.folderId)
    .where("userId", "==", userId)
    .limit(1)
    .get();
    
  if (permSnapshot.empty) throw new Error("Non autorisé");

  return await getDownloadUrl(file.s3Key, file.name);
}

export async function deleteFileAction(fileId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const fileDoc = await db.collection("files").doc(fileId).get();
  if (!fileDoc.exists) throw new Error("Fichier non trouvé");
  const fileData = fileDoc.data()!;

  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", fileData.folderId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  const perm = permSnapshot.empty ? null : permSnapshot.docs[0].data();
  if (!perm || !["OWNER", "EDITOR"].includes(perm.role)) {
    throw new Error("Non autorisé");
  }

  const batch = db.batch();
  
  // 1. Supprimer de Firestore
  batch.delete(db.collection("files").doc(fileId));

  // 2. Mettre à jour le stockage du workspace
  const folderDoc = await db.collection("folders").doc(fileData.folderId).get();
  const workspaceId = folderDoc.data()?.workspaceId;
  if (workspaceId) {
    batch.update(db.collection("workspaces").doc(workspaceId), {
      totalStorageUsed: admin.firestore.FieldValue.increment(-fileData.size),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  revalidatePath(`/dashboard/folder/${fileData.folderId}`);
  revalidatePath("/dashboard");
}
