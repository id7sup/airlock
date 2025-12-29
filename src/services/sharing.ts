import { db } from "@/lib/firebase";
import crypto from "crypto";

export async function createShareLink(data: {
  folderId: string;
  userId: string; // Ajouté
  expiresAt?: Date | null;
  password?: string;
  isReadOnly?: boolean;
  maxViews?: number | null;
  allowDownload?: boolean;
}) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  let passwordHash = null;
  if (data.password) {
    passwordHash = crypto.createHash("sha256").update(data.password).digest("hex");
  }

  const shareLinkData = {
    folderId: data.folderId,
    creatorId: data.userId, // Stocker le créateur pour le suivi
    token, // On stocke le token en clair pour que le propriétaire puisse le récupérer dans son dashboard
    tokenHash,
    expiresAt: data.expiresAt || null,
    passwordHash: data.password ? crypto.createHash("sha256").update(data.password).digest("hex") : null,
    isReadOnly: data.isReadOnly ?? true,
    maxViews: data.maxViews || null,
    allowDownload: data.allowDownload ?? true,
    downloadDefault: data.allowDownload ?? true, // Règle par défaut pour les fichiers
    viewCount: 0,
    downloadCount: 0,
    isRevoked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await db.collection("shareLinks").add(shareLinkData);

  return { id: docRef.id, ...shareLinkData, token };
}

export async function validateShareLink(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const snapshot = await db.collection("shareLinks")
    .where("tokenHash", "==", tokenHash)
    .limit(1)
    .get();

  if (snapshot.empty) return { error: "NOT_FOUND" };

  const linkDoc = snapshot.docs[0];
  const linkData = linkDoc.data();

  // Vérifier expiration
  if (linkData.expiresAt && linkData.expiresAt.toDate() < new Date()) {
    return { error: "EXPIRED", linkId: linkDoc.id, folderId: linkData.folderId };
  }

  // Vérifier limites de vues
  if (linkData.maxViews && linkData.viewCount > linkData.maxViews) {
    return { error: "QUOTA_EXCEEDED", linkId: linkDoc.id, folderId: linkData.folderId };
  }

  // Vérifier si révoqué manuellement
  if (linkData.isRevoked === true) {
    return { error: "REVOKED", linkId: linkDoc.id, folderId: linkData.folderId };
  }

  // Récupérer le dossier, les fichiers et les sous-dossiers
  const folderDoc = await db.collection("folders").doc(linkData.folderId).get();
  const [filesSnapshot, childrenSnapshot] = await Promise.all([
    db.collection("files").where("folderId", "==", linkData.folderId).get(),
    db.collection("folders").where("parentId", "==", linkData.folderId).get(),
  ]);

  return {
    id: linkDoc.id,
    ...linkData,
    folder: {
      id: folderDoc.id,
      name: folderDoc.data()?.name || "Dossier inconnu",
      files: filesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      children: childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    },
  };
}
