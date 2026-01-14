import { db } from "@/lib/firebase";
import { auth, currentUser } from "@clerk/nextjs/server";
import DashboardClient from "@/components/dashboard/DashboardClient";
import * as admin from "firebase-admin";

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;
  const { filter } = await searchParams;
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  // Nettoyer automatiquement les dossiers de plus de 30 jours dans la corbeille (en arrière-plan)
  if (filter === "trash") {
    // Ne pas bloquer le chargement de la page
    (async () => {
      try {
        const { cleanupOldTrashAction } = await import("@/lib/actions/folders");
        await cleanupOldTrashAction();
      } catch (error) {
        // Ignorer les erreurs de nettoyage pour ne pas bloquer l'affichage
        console.error("Erreur lors du nettoyage automatique:", error);
      }
    })().catch(() => {});
  }

  // 1. Récupérer le(s) workspace(s) - optimisé avec select()
  let workspaceSnapshot;
  try {
    workspaceSnapshot = await db.collection("workspaces")
      .where("memberIds", "array-contains", userId)
      .select("memberIds")
      .get();
  } catch (e) {
    return <div className="p-10 text-center text-apple-secondary">Vérification de votre espace de travail...</div>;
  }

  // Création automatique si nécessaire
  if (workspaceSnapshot.empty) {
    const admin = await import("firebase-admin");
    const newWSRef = await db.collection("workspaces").add({
      name: "Mon Espace",
      memberIds: [userId],
      totalStorageUsed: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return <DashboardClient initialFolders={[]} currentFilter={filter || "all"} />;
  }

  const workspaceIds = workspaceSnapshot.docs.map(doc => doc.id);

  // 2. Récupération Groupée Ultra-Optimisée (Massive reduction of queries)
  let allFolders: any[] = [];
  let allFiles: any[] = [];

  try {
    // On parallélise les deux grosses récupérations
    const [foldersSnap, filesSnap] = await Promise.all([
      db.collection("folders")
        .where("workspaceId", "in", workspaceIds)
        .select("name", "workspaceId", "parentId", "isFavorite", "isDeleted", "order", "updatedAt", "createdAt")
        .get(),
      db.collection("files")
        .where("workspaceId", "in", workspaceIds)
        .select("folderId")
        .get()
    ]);

    allFolders = foldersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    allFiles = filesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // OPTIMISATION : Ne récupérer les permissions que si nécessaire (shared ou trash)
    // Pour "all", "recent" et "favorites", on n'a pas besoin des permissions
    if (filter === "shared" || filter === "trash") {
      const includeHidden = filter === "trash";
      
      const [permsByUserId, permsByEmail] = await Promise.all([
        db.collection("permissions")
          .where("userId", "==", userId)
          .select("folderId", "role", "canDownload", "isHidden", "userEmail")
          .get(),
        userEmail ? db.collection("permissions")
          .where("userEmail", "==", userEmail)
          .select("folderId", "role", "canDownload", "isHidden", "userEmail")
          .get() : Promise.resolve({ docs: [] } as any)
      ]);
      
      // Combiner les permissions et dédupliquer
      const allPerms = [
        ...permsByUserId.docs.map((d: admin.firestore.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() })),
        ...permsByEmail.docs.map((d: admin.firestore.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }))
      ];
      
      const filteredPerms = includeHidden 
        ? allPerms
        : allPerms.filter(p => !p.isHidden);
      
      const uniquePerms = Array.from(new Map(filteredPerms.map(p => [p.folderId, p])).values());
      
      if (uniquePerms.length > 0) {
        const extraFolderIds = uniquePerms
          .map(p => p.folderId)
          .filter(id => !allFolders.some(f => f.id === id));
        
        if (extraFolderIds.length > 0) {
          // Fetch remaining folders in batches of 30 (Firestore limit)
          for (let i = 0; i < extraFolderIds.length; i += 30) {
            const batch = extraFolderIds.slice(i, i + 30);
            const [extraSnap, ownerPerms] = await Promise.all([
              db.collection("folders")
                .where(admin.firestore.FieldPath.documentId(), "in", batch)
                .select("name", "workspaceId", "parentId", "isFavorite", "isDeleted", "order", "updatedAt", "createdAt")
                .get(),
              Promise.all(
                batch.map(folderId => 
                  db.collection("permissions")
                    .where("folderId", "==", folderId)
                    .where("role", "==", "OWNER")
                    .select("userId", "userEmail")
                    .limit(1)
                    .get()
                )
              )
            ]);
            
            const extraFolders = extraSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            // Enrichir avec les infos de permission et le propriétaire
            extraFolders.forEach((folder, idx) => {
              const perm = uniquePerms.find(p => p.folderId === folder.id);
              if (perm) {
                (folder as any).shareRole = perm.role;
                (folder as any).shareCanDownload = perm.canDownload;
                (folder as any).isShared = true;
                (folder as any).isPermissionHidden = perm.isHidden === true;
                
                const ownerPerm = ownerPerms[idx];
                if (!ownerPerm.empty) {
                  const ownerData = ownerPerm.docs[0].data();
                  (folder as any).ownerId = ownerData.userId;
                  (folder as any).sharedBy = ownerData.userEmail || "Utilisateur";
                }
              }
            });
            allFolders = [...allFolders, ...extraFolders];
          }
        }
      }
    }
  } catch (error: any) {
    console.error("Firestore Optimization Error:", error.message);
  }

  // Nettoyage et tri par défaut
  allFolders = Array.from(new Map(allFolders.map(f => [f.id, f])).values());
  allFolders.sort((a, b) => (a.order || 0) - (b.order || 0));

  // 3. Filtrage Intelligent
  // IMPORTANT : Ne montrer que les dossiers racine (parentId === null) dans le dashboard principal
  // Les sous-dossiers n'apparaissent que dans leur dossier parent
  let filteredFolders = [];
  if (filter === "trash") {
    // Pour la corbeille : dossiers supprimés OU permissions masquées (dossiers partagés retirés)
    // Uniquement les dossiers racine
    filteredFolders = allFolders.filter(f => 
      (f.isDeleted === true || (f as any).isPermissionHidden === true) && 
      (f.parentId === null || f.parentId === undefined)
    );
  } else if (filter === "favorites") {
    // Favoris : uniquement les dossiers racine favoris
    filteredFolders = allFolders.filter(f => 
      f.isFavorite === true && 
      f.isDeleted !== true && 
      (f.parentId === null || f.parentId === undefined)
    );
  } else if (filter === "recent") {
    // Récent : uniquement les dossiers racine, triés par date de mise à jour
    filteredFolders = allFolders.filter(f => 
      f.isDeleted !== true && 
      (f.parentId === null || f.parentId === undefined)
    )
      .sort((a, b) => {
        const getT = (o: any) => {
          const t = o.updatedAt || o.createdAt;
          if (t?.toMillis) return t.toMillis();
          return new Date(t || 0).getTime();
        };
        return getT(b) - getT(a);
      });
  } else if (filter === "shared") {
    // "Partagés avec moi" : uniquement les dossiers racine partagés (pas les miens)
    filteredFolders = allFolders.filter(f => 
      f.isDeleted !== true && 
      (f as any).isShared === true && 
      (f.parentId === null || f.parentId === undefined)
    );
  } else {
    // "Tous les dossiers" : afficher uniquement les dossiers racine non supprimés
    filteredFolders = allFolders.filter(f => 
      f.isDeleted !== true && 
      (f.parentId === null || f.parentId === undefined)
    );
  }

  // 4. Calcul Récursif EN MÉMOIRE (Totalement CPU-only, 0 impact Quota)
  const folders = filteredFolders.map(folder => {
    const getCount = (fId: string, visited = new Set<string>()): number => {
      if (visited.has(fId)) return 0; // Sécurité anti-boucle infinie
      visited.add(fId);

      let count = allFiles.filter(file => file.folderId === fId).length;
      allFolders.filter(f => f.parentId === fId).forEach(child => {
        count += getCount(child.id, visited);
      });
      return count;
    };

    const getISO = (obj: any) => {
      if (!obj) return new Date().toISOString();
      if (obj.toDate) return obj.toDate().toISOString();
      if (obj._seconds) return new Date(obj._seconds * 1000).toISOString();
      return new Date(obj).toISOString();
    };

    return {
      id: folder.id,
      name: folder.name || "Sans nom",
      isFavorite: folder.isFavorite === true,
      updatedAt: getISO(folder.updatedAt || folder.createdAt),
      _count: { files: getCount(folder.id) },
      shareRole: (folder as any).shareRole,
      shareCanDownload: (folder as any).shareCanDownload,
      isShared: (folder as any).isShared,
      isPermissionHidden: (folder as any).isPermissionHidden,
      // Pour l'affichage, traiter isPermissionHidden comme isDeleted dans la corbeille
      isDeleted: folder.isDeleted || ((folder as any).isPermissionHidden && filter === "trash")
    };
  });

  return <DashboardClient initialFolders={folders as any} currentFilter={filter || "all"} />;
}
