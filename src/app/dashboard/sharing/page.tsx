import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import SharingListClient from "@/components/dashboard/SharingListClient";
import { getLinkAnalytics } from "@/services/analytics";
import * as admin from "firebase-admin";

export const dynamic = 'force-dynamic';

export default async function SharingDashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  // 1. Récupérer les liens créés DIRECTEMENT par l'utilisateur
  const creatorLinksSnapshot = await db.collection("shareLinks")
    .where("creatorId", "==", userId)
    .get();

  // 2. Récupérer les liens des dossiers dont l'utilisateur est OWNER (fallback pour anciens liens)
  const permsSnapshot = await db.collection("permissions")
    .where("userId", "==", userId)
    .where("role", "==", "OWNER")
    .get();
  
  const ownerFolderIds = permsSnapshot.docs.map(doc => doc.data().folderId);
  
  let ownerLinksSnapshot: any = { docs: [] };
  if (ownerFolderIds.length > 0) {
    ownerLinksSnapshot = await db.collection("shareLinks")
      .where("folderId", "in", ownerFolderIds.slice(0, 30))
      .get();
  }

  // Combiner les résultats et supprimer les doublons
  const allLinkDocs = [
    ...creatorLinksSnapshot.docs,
    ...ownerLinksSnapshot.docs
  ];
  
  // Utiliser une Map pour dédoublonner par ID de document
  const uniqueLinkDocs = Array.from(
    new Map(allLinkDocs.map(doc => [doc.id, doc])).values()
  ).sort((a, b) => {
    const getMillis = (obj: any) => {
      if (!obj) return 0;
      if (obj instanceof admin.firestore.Timestamp) return obj.toMillis();
      if (obj.toDate && typeof obj.toDate === 'function') return obj.toDate().getTime();
      if (obj._seconds) return obj._seconds * 1000;
      if (typeof obj === 'string') return new Date(obj).getTime() || 0;
      return 0;
    };
    const timeA = getMillis(a.data().createdAt);
    const timeB = getMillis(b.data().createdAt);
    return timeB - timeA;
  });

  if (uniqueLinkDocs.length === 0) {
    return <SharingListClient initialLinks={[]} />;
  }

  // 3. Enrichir les liens avec le nom du dossier et les analytics
  // FILTRER les liens dont le dossier est supprimé ou n'existe plus
  const linksWithFolders = await Promise.all(uniqueLinkDocs.map(async (doc) => {
    const data = doc.data();
    
    try {
      const folderDoc = await db.collection("folders").doc(data.folderId).get();
      
      // Si le dossier n'existe plus ou est supprimé, exclure ce lien
      if (!folderDoc.exists) {
        return null;
      }
      
      const folderData = folderDoc.data();
      if (folderData?.isDeleted === true) {
        return null;
      }
      
      const analytics = await getLinkAnalytics(doc.id).catch(() => null);

      return {
        id: doc.id,
        token: data.token || "", 
        folderId: data.folderId,
        folderName: folderData?.name || "Dossier inconnu",
        viewCount: data.viewCount || 0,
        downloadCount: data.downloadCount || 0,
        allowDownload: data.allowDownload !== false,
        maxViews: data.maxViews || null,
        expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate().toISOString() : (data.expiresAt ? new Date(data.expiresAt).toISOString() : null),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString()),
        isRevoked: data.isRevoked === true,
        analytics: analytics
      };
    } catch (error) {
      console.error(`Error processing link ${doc.id}:`, error);
      return null; // Exclure les liens en erreur
    }
  }));

  // Filtrer les null (liens avec dossiers supprimés ou erreurs)
  const validLinks = linksWithFolders.filter(link => link !== null) as any[];

  return <SharingListClient initialLinks={validLinks} />;
}
