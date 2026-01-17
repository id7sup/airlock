"use server";

import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateShareLinkAction(linkId: string, data: {
  allowDownload?: boolean;
  downloadDefault?: boolean;
  allowViewOnline?: boolean;
  allowFolderAccess?: boolean;
  restrictDomain?: boolean;
  blockVpn?: boolean;
  allowedDomains?: string[];
  expiresAt?: Date | null;
  maxViews?: number | null;
  status?: "ACTIVE" | "REVOKED";
  notifications?: string[];
  password?: string | null;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const linkDoc = await db.collection("shareLinks").doc(linkId).get();
  if (!linkDoc.exists) throw new Error("Lien non trouvé");
  
  const linkData = linkDoc.data()!;
  
  // Vérifier que l'utilisateur est bien OWNER du dossier lié au lien
  const permSnapshot = await db.collection("permissions")
    .where("folderId", "==", linkData.folderId)
    .where("userId", "==", userId)
    .where("role", "==", "OWNER")
    .limit(1)
    .get();

  if (permSnapshot.empty) throw new Error("Non autorisé à modifier ce lien");

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (typeof data.allowDownload === "boolean") {
    updateData.allowDownload = data.allowDownload;
    updateData.downloadDefault = data.allowDownload;
  }
  if (typeof data.downloadDefault === "boolean") updateData.downloadDefault = data.downloadDefault;
  if (typeof data.allowViewOnline === "boolean") updateData.allowViewOnline = data.allowViewOnline;
  if (typeof data.allowFolderAccess === "boolean") updateData.allowFolderAccess = data.allowFolderAccess;
  if (typeof data.restrictDomain === "boolean") updateData.restrictDomain = data.restrictDomain;
  if (typeof data.blockVpn === "boolean") updateData.blockVpn = data.blockVpn;
  if (Array.isArray(data.allowedDomains)) updateData.allowedDomains = data.allowedDomains;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
  if (data.maxViews !== undefined) updateData.maxViews = data.maxViews;
  if (data.status) updateData.isRevoked = data.status === "REVOKED";
  if (Array.isArray(data.notifications)) updateData.notifications = data.notifications;
  
  // Gérer le mot de passe
  if (data.password !== undefined) {
    if (data.password === null || data.password === "") {
      // Supprimer le mot de passe
      updateData.passwordHash = null;
    } else {
      // Hasher le nouveau mot de passe
      const crypto = await import("crypto");
      updateData.passwordHash = crypto.createHash("sha256").update(data.password).digest("hex");
    }
  }

  await db.collection("shareLinks").doc(linkId).update(updateData);

  revalidatePath("/dashboard/sharing");
}

