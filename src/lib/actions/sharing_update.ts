"use server";

import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateShareLinkAction(linkId: string, data: {
  allowDownload?: boolean;
  expiresAt?: Date | null;
  maxViews?: number | null;
  status?: "ACTIVE" | "REVOKED";
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

  if (typeof data.allowDownload === "boolean") updateData.allowDownload = data.allowDownload;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
  if (data.maxViews !== undefined) updateData.maxViews = data.maxViews;
  if (data.status) updateData.isRevoked = data.status === "REVOKED";

  await db.collection("shareLinks").doc(linkId).update(updateData);

  revalidatePath("/dashboard/sharing");
}

