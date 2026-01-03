import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";
import crypto from "crypto";

// Fonction utilitaire pour convertir les timestamps Firestore en objets sérialisables
function convertFirestoreData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const converted: any = {};
  for (const [key, value] of Object.entries(data)) {
    // Convertir les timestamps Firestore
    if (value && typeof value === 'object') {
      const val = value as any;
      if (val instanceof admin.firestore.Timestamp) {
        converted[key] = val.toDate().toISOString();
      } else if (val._seconds !== undefined && val._nanoseconds !== undefined) {
        // Format {_seconds, _nanoseconds}
        converted[key] = new Date(val._seconds * 1000 + val._nanoseconds / 1000000).toISOString();
      } else if (val.toDate && typeof val.toDate === 'function') {
        converted[key] = val.toDate().toISOString();
      } else if (Array.isArray(value)) {
        converted[key] = value.map(item => convertFirestoreData(item));
      } else if (value.constructor === Object) {
        converted[key] = convertFirestoreData(value);
      } else {
        converted[key] = value;
      }
    } else {
      converted[key] = value;
    }
  }
  return converted;
}

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
  console.error("[VALIDATE_SHARE] Starting validation for token:", token.substring(0, 10) + "...");
  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    console.error("[VALIDATE_SHARE] Token hash calculated");

    console.error("[VALIDATE_SHARE] Querying shareLinks collection");
    const snapshot = await db.collection("shareLinks")
      .where("tokenHash", "==", tokenHash)
      .limit(1)
      .get();

    console.error("[VALIDATE_SHARE] Query result:", snapshot.empty ? "EMPTY" : "FOUND");

    if (snapshot.empty) {
      console.error("[VALIDATE_SHARE] No link found for token hash");
      return { error: "NOT_FOUND" };
    }

    const linkDoc = snapshot.docs[0];
    const linkData = linkDoc.data();
    console.error("[VALIDATE_SHARE] Link data retrieved:", {
      linkId: linkDoc.id,
      folderId: linkData?.folderId,
      isRevoked: linkData?.isRevoked,
      hasExpiresAt: !!linkData?.expiresAt
    });

    if (!linkData) {
      console.error("[VALIDATE_SHARE] Link data is null/undefined");
      return { error: "NOT_FOUND" };
    }

    // Vérifier expiration
    console.error("[VALIDATE_SHARE] Checking expiration");
    if (linkData.expiresAt) {
      const expiresAt = linkData.expiresAt?.toDate ? linkData.expiresAt.toDate() : new Date(linkData.expiresAt);
      if (expiresAt < new Date()) {
        console.error("[VALIDATE_SHARE] Link expired");
        return { error: "EXPIRED", linkId: linkDoc.id, folderId: linkData.folderId };
      }
    }

    // Vérifier limites de vues
    console.error("[VALIDATE_SHARE] Checking view quota");
    if (linkData.maxViews && (linkData.viewCount || 0) > linkData.maxViews) {
      console.error("[VALIDATE_SHARE] View quota exceeded");
      return { error: "QUOTA_EXCEEDED", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    // Vérifier si révoqué manuellement
    console.error("[VALIDATE_SHARE] Checking if revoked");
    if (linkData.isRevoked === true) {
      console.error("[VALIDATE_SHARE] Link is revoked");
      return { error: "REVOKED", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    // Récupérer le dossier, les fichiers et les sous-dossiers
    console.error("[VALIDATE_SHARE] Fetching folder:", linkData.folderId);
    const folderDoc = await db.collection("folders").doc(linkData.folderId).get();
    console.error("[VALIDATE_SHARE] Folder exists:", folderDoc.exists);
    
    if (!folderDoc.exists) {
      console.error("[VALIDATE_SHARE] Folder does not exist, revoking link");
      // Si le dossier n'existe plus, révoquer automatiquement le lien
      try {
        await db.collection("shareLinks").doc(linkDoc.id).update({
          isRevoked: true,
          revokedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.error("[VALIDATE_SHARE] Link revoked successfully");
      } catch (e) {
        console.error("[VALIDATE_SHARE] Error revoking link:", e);
      }
      return { error: "NOT_FOUND", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    const folderData = folderDoc.data();
    console.error("[VALIDATE_SHARE] Folder data:", {
      name: folderData?.name,
      isDeleted: folderData?.isDeleted,
      workspaceId: folderData?.workspaceId
    });
    
    // Vérifier si le dossier est supprimé (isDeleted = true)
    if (folderData?.isDeleted === true) {
      console.error("[VALIDATE_SHARE] Folder is deleted, revoking link");
      // Si le dossier est dans la corbeille, révoquer automatiquement le lien
      try {
        await db.collection("shareLinks").doc(linkDoc.id).update({
          isRevoked: true,
          revokedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.error("[VALIDATE_SHARE] Link revoked successfully");
      } catch (e) {
        console.error("[VALIDATE_SHARE] Error revoking link:", e);
      }
      return { error: "REVOKED", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    // Récupérer les fichiers et sous-dossiers avec gestion d'erreur
    console.error("[VALIDATE_SHARE] Fetching files and children");
    let filesSnapshot: any = { docs: [] };
    let childrenSnapshot: any = { docs: [] };
    
    try {
      [filesSnapshot, childrenSnapshot] = await Promise.all([
        db.collection("files").where("folderId", "==", linkData.folderId).get(),
        db.collection("folders").where("parentId", "==", linkData.folderId).get(),
      ]);
      console.error("[VALIDATE_SHARE] Files and children fetched:", {
        filesCount: filesSnapshot.docs?.length || 0,
        childrenCount: childrenSnapshot.docs?.length || 0
      });
    } catch (error: any) {
      console.error("[VALIDATE_SHARE] ERROR fetching files/children:", error);
      console.error("[VALIDATE_SHARE] Error message:", error?.message);
      console.error("[VALIDATE_SHARE] Error stack:", error?.stack);
      // Continuer avec des tableaux vides plutôt que de crasher
    }

    // Vérifier que folderData existe avant de construire le résultat
    if (!folderData) {
      console.error("[VALIDATE_SHARE] Folder data is null/undefined after fetch");
      return { error: "NOT_FOUND", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    // Convertir les données pour qu'elles soient sérialisables
    const convertedLinkData = convertFirestoreData(linkData);
    const convertedFolderData = convertFirestoreData(folderData);
    
    const result = {
      id: linkDoc.id,
      ...convertedLinkData,
      folder: {
        id: folderDoc.id,
        name: convertedFolderData.name || "Dossier inconnu",
        files: (filesSnapshot.docs || []).map((doc: any) => {
          const data = convertFirestoreData(doc.data());
          return {
            id: doc.id,
            ...data,
            // S'assurer que les champs critiques existent
            name: data?.name || "Fichier sans nom",
            size: data?.size || 0,
            mimeType: data?.mimeType || "application/octet-stream",
          };
        }),
        children: (childrenSnapshot.docs || []).map((doc: any) => {
          const data = convertFirestoreData(doc.data());
          return {
            id: doc.id,
            ...data,
            name: data?.name || "Dossier sans nom",
          };
        }),
      },
    };

    console.error("[VALIDATE_SHARE] Validation successful, returning result");
    return result;
  } catch (error: any) {
    console.error("[VALIDATE_SHARE] CRITICAL ERROR in validateShareLink:", error);
    console.error("[VALIDATE_SHARE] Error type:", typeof error);
    console.error("[VALIDATE_SHARE] Error message:", error?.message);
    console.error("[VALIDATE_SHARE] Error stack:", error?.stack);
    console.error("[VALIDATE_SHARE] Error name:", error?.name);
    console.error("[VALIDATE_SHARE] Error code:", error?.code);
    try {
      console.error("[VALIDATE_SHARE] Error JSON:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch (e) {
      console.error("[VALIDATE_SHARE] Could not stringify error:", e);
    }
    return { error: "NOT_FOUND" };
  }
}
