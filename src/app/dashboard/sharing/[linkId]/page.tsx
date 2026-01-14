import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SharingDetailClient from "@/components/dashboard/SharingDetailClient";
import { getLinkAnalytics } from "@/services/analytics";
import * as admin from "firebase-admin";

export const dynamic = 'force-dynamic';

export default async function SharingDetailPage({ 
  params 
}: { 
  params: Promise<{ linkId: string }> 
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { linkId } = await params;

  try {
    // Récupérer le lien de partage
    const linkDoc = await db.collection("shareLinks").doc(linkId).get();
    
    if (!linkDoc.exists) {
      redirect("/dashboard/sharing");
    }

    const linkData = linkDoc.data();
    
    // Vérifier que l'utilisateur est le propriétaire
    if (linkData?.creatorId !== userId) {
      redirect("/dashboard/sharing");
    }

    // Récupérer le dossier
    const folderDoc = await db.collection("folders").doc(linkData.folderId).get();
    
    if (!folderDoc.exists || folderDoc.data()?.isDeleted === true) {
      redirect("/dashboard/sharing");
    }

    const folderData = folderDoc.data();

    // Récupérer les analytics
    const analytics = await getLinkAnalytics(linkId).catch(() => null);

    const link = {
      id: linkDoc.id,
      token: linkData.token || "",
      folderId: linkData.folderId,
      folderName: folderData?.name || "Dossier inconnu",
      viewCount: linkData.viewCount || 0,
      downloadCount: linkData.downloadCount || 0,
      allowDownload: linkData.allowDownload !== false,
      allowViewOnline: linkData.allowViewOnline !== false,
      allowFolderAccess: linkData.allowFolderAccess !== false,
      restrictDomain: linkData.restrictDomain === true,
      blockVpn: linkData.blockVpn === true,
      allowedDomains: Array.isArray(linkData.allowedDomains) ? linkData.allowedDomains : [],
      maxViews: linkData.maxViews || null,
      expiresAt: linkData.expiresAt?.toDate ? linkData.expiresAt.toDate().toISOString() : (linkData.expiresAt ? new Date(linkData.expiresAt).toISOString() : null),
      createdAt: linkData.createdAt?.toDate ? linkData.createdAt.toDate().toISOString() : (linkData.createdAt ? new Date(linkData.createdAt).toISOString() : new Date().toISOString()),
      isRevoked: linkData.isRevoked === true,
      analytics: analytics || [],
      notifications: Array.isArray(linkData.notifications) ? linkData.notifications : [],
      blockedIps: Array.isArray(linkData.blockedIps) ? linkData.blockedIps : [],
      blockedDevices: Array.isArray(linkData.blockedDevices) ? linkData.blockedDevices : [],
    };

    return <SharingDetailClient link={link} />;
  } catch (error) {
    console.error("Error loading sharing detail:", error);
    redirect("/dashboard/sharing");
  }
}

