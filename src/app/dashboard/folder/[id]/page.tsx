import { db } from "@/lib/firebase";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import FolderView from "@/components/dashboard/FolderView";
import * as admin from "firebase-admin";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function FolderPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }, 
  searchParams: Promise<{ from?: string; parent?: string }> 
}) {
  const { userId } = await auth();
  const { id } = await params;
  const { from, parent } = await searchParams;
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  // Paralléliser la récupération du dossier et les vérifications de permissions
  const [folderDoc, permsByUserId, permsByEmail] = await Promise.all([
    db.collection("folders").doc(id).get(),
    userId ? db.collection("permissions")
      .where("folderId", "==", id)
      .where("userId", "==", userId)
      .get() : Promise.resolve({ docs: [] } as any),
    userEmail ? db.collection("permissions")
      .where("folderId", "==", id)
      .where("userEmail", "==", userEmail)
      .get() : Promise.resolve({ docs: [] } as any)
  ]);

  if (!folderDoc.exists) notFound();
  const folderData = folderDoc.data()!;

  // Empêcher l'accès aux dossiers supprimés
  if (folderData.isDeleted === true) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Dossier dans la corbeille</h1>
          <p className="text-apple-secondary">Ce dossier est dans la corbeille. Restaurez-le pour y accéder.</p>
          <Link href="/dashboard?filter=trash" className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-2xl font-medium hover:bg-black/90 transition-all">
            Aller à la corbeille
          </Link>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a une permission active (non masquée)
  const allPerms = [...permsByUserId.docs, ...permsByEmail.docs];
  let activePermDoc = allPerms.find(doc => {
    const perm = doc.data();
    return (perm.userId === userId || (userEmail && perm.userEmail === userEmail)) && perm.isHidden !== true;
  });

  // Si aucune permission explicite, vérifier si l'utilisateur est membre du workspace
  // Cela permet d'accéder aux dossiers même si les permissions n'ont pas été créées correctement
  if (!activePermDoc && folderData.workspaceId && userId) {
    try {
      const workspaceDoc = await db.collection("workspaces").doc(folderData.workspaceId).get();
      if (workspaceDoc.exists) {
        const workspaceData = workspaceDoc.data();
        const memberIds = workspaceData?.memberIds || [];
        // Si l'utilisateur est membre du workspace, lui donner accès en tant qu'OWNER
        if (memberIds.includes(userId)) {
          // Créer une permission virtuelle pour l'accès
          activePermDoc = {
            data: () => ({ role: "OWNER", userId, isHidden: false })
          } as any;
          
          // Optionnel : créer la permission manquante pour éviter ce problème à l'avenir
          try {
            await db.collection("permissions").add({
              folderId: id,
              userId: userId,
              role: "OWNER",
              createdAt: new Date(),
              isHidden: false,
            });
          } catch (permError) {
            // Ignorer les erreurs de création de permission (peut déjà exister)
            console.error("Erreur lors de la création de la permission:", permError);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du workspace:", error);
    }
  }

  if (!activePermDoc) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
          <p className="text-apple-secondary">Vous n'avez pas la permission de consulter ce dossier.</p>
        </div>
      </div>
    );
  }

  const activePerm = activePermDoc.data();
  const userRole = activePerm.role || "VIEWER";

  // Récupérer fichiers et sous-dossiers de manière concurrente avec select() pour optimiser
  const [filesSnapshot, childrenSnapshot] = await Promise.all([
    (async () => {
      try {
        return await db.collection("files")
          .where("folderId", "==", id)
          .select("name", "size", "mimeType", "s3Key", "updatedAt")
          .orderBy("updatedAt", "desc")
          .get();
      } catch (e) {
        return await db.collection("files")
          .where("folderId", "==", id)
          .select("name", "size", "mimeType", "s3Key", "updatedAt")
          .get();
      }
    })(),
    db.collection("folders")
      .where("parentId", "==", id)
      .select("name", "isFavorite", "isDeleted", "createdAt", "updatedAt")
      .get()
  ]);

  const folder = {
    id: folderDoc.id,
    name: folderData.name || "",
    parentId: folderData.parentId || null,
    isFavorite: folderData.isFavorite === true,
    isDeleted: folderData.isDeleted === true,
    createdAt: folderData.createdAt instanceof admin.firestore.Timestamp ? folderData.createdAt.toDate().toISOString() : new Date().toISOString(),
    updatedAt: folderData.updatedAt instanceof admin.firestore.Timestamp ? folderData.updatedAt.toDate().toISOString() : new Date().toISOString(),
    files: filesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        size: data.size || 0,
        mimeType: data.mimeType || "",
        s3Key: data.s3Key || "",
        updatedAt: data.updatedAt instanceof admin.firestore.Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
      };
    }),
    children: childrenSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        isFavorite: data.isFavorite === true,
        isDeleted: data.isDeleted === true,
        createdAt: data.createdAt instanceof admin.firestore.Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt instanceof admin.firestore.Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
      };
    })
  };

  // Utiliser le parentId du dossier s'il existe, sinon utiliser le paramètre parent de l'URL
  // Le paramètre parent est utilisé pour maintenir la navigation lors de la navigation vers un sous-dossier
  const effectiveParentId = folder.parentId || parent || null;
  
  return <FolderView folder={folder} fromFilter={from} parentId={effectiveParentId} userRole={userRole} />;
}
