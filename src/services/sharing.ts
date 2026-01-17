import { db } from "@/lib/firebase";
import * as admin from "firebase-admin";
import crypto from "crypto";
import { trackEvent } from "@/services/analytics";

/**
 * Convertit les timestamps Firestore en objets sérialisables (ISO strings)
 * Nécessaire pour passer les données aux Client Components dans Next.js
 * 
 * @param data - Données à convertir (peut contenir des Timestamps Firestore)
 * @returns Données converties avec timestamps en ISO strings
 */
function convertFirestoreData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const converted: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object') {
      const val = value as any;
      // Convertir les timestamps Firestore en ISO strings
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

/**
 * Crée un nouveau lien de partage pour un dossier
 * 
 * IMPORTANT : Chaque lien créé est complètement indépendant.
 * Un même dossier peut avoir plusieurs liens, chacun avec :
 * - Son propre token unique
 * - Ses propres paramètres (expiration, quota, mot de passe, etc.)
 * - Ses propres compteurs (viewCount, downloadCount)
 * - Ses propres analytics
 * 
 * Les modifications d'un lien n'affectent jamais les autres liens du même dossier.
 * 
 * @param data - Données du lien de partage
 * @param data.folderId - ID du dossier à partager
 * @param data.userId - ID de l'utilisateur créateur
 * @param data.expiresAt - Date d'expiration (optionnel)
 * @param data.password - Mot de passe de protection (optionnel)
 * @param data.isReadOnly - Mode lecture seule (défaut: true)
 * @param data.maxViews - Nombre maximum de vues (optionnel)
 * @param data.allowDownload - Autoriser le téléchargement (défaut: true)
 * @returns Lien de partage créé avec token unique
 */
export async function createShareLink(data: {
  folderId: string;
  userId: string;
  expiresAt?: Date | null;
  password?: string;
  isReadOnly?: boolean;
  maxViews?: number | null;
  allowDownload?: boolean;
  allowViewOnline?: boolean;
  allowFolderAccess?: boolean;
  restrictDomain?: boolean;
  blockVpn?: boolean;
  allowedDomains?: string[];
}) {
  // Générer un token unique (64 caractères hex) pour ce lien spécifique
  // Chaque lien a son propre token, même pour le même dossier
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Hasher le mot de passe si fourni
  let passwordHash = null;
  if (data.password) {
    passwordHash = crypto.createHash("sha256").update(data.password).digest("hex");
  }

  const shareLinkData = {
    folderId: data.folderId,
    creatorId: data.userId,
    token, // Stocké en clair pour récupération dans le dashboard
    tokenHash, // Hash pour validation sécurisée
    expiresAt: data.expiresAt || null,
    passwordHash,
    isReadOnly: data.isReadOnly ?? true,
    maxViews: data.maxViews || null,
    allowDownload: data.allowDownload ?? true,
    downloadDefault: data.allowDownload ?? true,
    allowViewOnline: data.allowViewOnline ?? true,
    allowFolderAccess: data.allowFolderAccess ?? true,
    restrictDomain: data.restrictDomain ?? false,
    blockVpn: data.blockVpn ?? false,
    allowedDomains: data.allowedDomains ?? [],
    // Compteurs indépendants pour ce lien spécifique
    viewCount: 0,
    downloadCount: 0,
    isRevoked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Créer un nouveau document pour ce lien (même si le dossier a déjà d'autres liens)
  const docRef = await db.collection("shareLinks").add(shareLinkData);

  return { id: docRef.id, ...shareLinkData, token };
}

/**
 * Valide un lien de partage et retourne les données du dossier
 * 
 * Vérifie :
 * - L'existence du lien
 * - L'expiration
 * - Le quota de vues
 * - La révocation
 * - L'existence du dossier
 * 
 * @param token - Token du lien de partage
 * @returns Données du lien et du dossier, ou objet avec erreur
 */
export async function validateShareLink(token: string) {
  try {
    // Hasher le token pour la recherche
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Rechercher le lien dans Firestore
    const snapshot = await db.collection("shareLinks")
      .where("tokenHash", "==", tokenHash)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { error: "NOT_FOUND" };
    }

    const linkDoc = snapshot.docs[0];
    const linkData = linkDoc.data();

    if (!linkData) {
      return { error: "NOT_FOUND" };
    }

    // Vérifier expiration
    if (linkData.expiresAt) {
      const expiresAt = linkData.expiresAt?.toDate ? linkData.expiresAt.toDate() : new Date(linkData.expiresAt);
      if (expiresAt < new Date()) {
        // tracer l'accès refusé avec la raison
        await trackEvent({ linkId: linkDoc.id, eventType: "ACCESS_DENIED", invalidAttempt: true, denialReason: "EXPIRED" }).catch(() => {});
        return { error: "EXPIRED", linkId: linkDoc.id, folderId: linkData.folderId };
      }
    }

    // Vérifier quota de vues
    if (linkData.maxViews && (linkData.viewCount || 0) >= linkData.maxViews) {
      await trackEvent({ linkId: linkDoc.id, eventType: "ACCESS_DENIED", invalidAttempt: true, denialReason: "QUOTA_EXCEEDED" }).catch(() => {});
      return { error: "QUOTA_EXCEEDED", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    // Vérifier révocation
    if (linkData.isRevoked === true) {
      await trackEvent({ linkId: linkDoc.id, eventType: "ACCESS_DENIED", invalidAttempt: true, denialReason: "REVOKED" }).catch(() => {});
      return { error: "REVOKED", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    // Vérifier accès au dossier
    if (linkData.allowFolderAccess === false) {
      await trackEvent({ linkId: linkDoc.id, eventType: "ACCESS_DENIED", invalidAttempt: true, denialReason: "ACCESS_DISABLED" }).catch(() => {});
      return { error: "ACCESS_DISABLED", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    // Récupérer le dossier
    const folderDoc = await db.collection("folders").doc(linkData.folderId).get();
    
    if (!folderDoc.exists) {
      // Révoquer automatiquement si le dossier n'existe plus
      try {
        await db.collection("shareLinks").doc(linkDoc.id).update({
          isRevoked: true,
          revokedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (e) {
        // Ignorer les erreurs de révocation
      }
      await trackEvent({ linkId: linkDoc.id, eventType: "ACCESS_DENIED", invalidAttempt: true, denialReason: "NOT_FOUND" }).catch(() => {});
      return { error: "NOT_FOUND", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    const folderData = folderDoc.data();
    
    // Vérifier si le dossier est supprimé
    if (folderData?.isDeleted === true) {
      // Révoquer automatiquement si le dossier est dans la corbeille
      try {
        await db.collection("shareLinks").doc(linkDoc.id).update({
          isRevoked: true,
          revokedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (e) {
        // Ignorer les erreurs de révocation
      }
      await trackEvent({ linkId: linkDoc.id, eventType: "ACCESS_DENIED", invalidAttempt: true, denialReason: "REVOKED" }).catch(() => {});
      return { error: "REVOKED", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    // Récupérer les fichiers et sous-dossiers
    let filesSnapshot: any = { docs: [] };
    let childrenSnapshot: any = { docs: [] };
    
    try {
      [filesSnapshot, childrenSnapshot] = await Promise.all([
        db.collection("files").where("folderId", "==", linkData.folderId).get(),
        db.collection("folders").where("parentId", "==", linkData.folderId).get(),
      ]);
    } catch (error: any) {
      // Continuer avec des tableaux vides en cas d'erreur
      console.error("[SHARING] Error fetching files/children:", error?.message);
    }

    if (!folderData) {
      return { error: "NOT_FOUND", linkId: linkDoc.id, folderId: linkData.folderId };
    }

    // Convertir les données pour sérialisation (timestamps → ISO strings)
    const convertedLinkData = convertFirestoreData(linkData);
    const convertedFolderData = convertFirestoreData(folderData);
    
    // Construire le résultat avec données converties
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

    return result;
  } catch (error: any) {
    // Erreur critique - logger pour debugging
    console.error("[SHARING] Critical error in validateShareLink:", error?.message);
    return { error: "NOT_FOUND" };
  }
}
